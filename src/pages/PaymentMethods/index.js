import React, { useState } from 'react';
import styled from 'styled-components';
import { FaPlus, FaEdit, FaTrash, FaWallet, FaCreditCard, FaMoneyBillWave, FaExchangeAlt, FaQrcode, FaBarcode } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useFinance } from '../../contexts/FinanceContext';
import Modal from '../../components/Modal';
import {
  PageContainer, PageTitle, Card, Button, Input,
  FormGroup, Label, EmptyState
} from '../../components/UI';

const ICON_MAP = {
  'credit-card': FaCreditCard,
  'debit-card': FaCreditCard,
  'pix': FaQrcode,
  'cash': FaMoneyBillWave,
  'transfer': FaExchangeAlt,
  'barcode': FaBarcode,
};

const PaymentMethods = () => {
  const { paymentMethods, addPaymentMethod, updatePaymentMethod, deletePaymentMethod, transactions } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('credit-card');

  const resetForm = () => { setName(''); setIcon('credit-card'); setEditing(null); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Informe o nome');
    if (editing) {
      updatePaymentMethod(editing.id, { name: name.trim(), icon });
      toast.success('Forma de pagamento atualizada!');
    } else {
      addPaymentMethod({ name: name.trim(), icon });
      toast.success('Forma de pagamento criada!');
    }
    resetForm(); setShowForm(false);
  };

  const handleEdit = (pm) => {
    setName(pm.name); setIcon(pm.icon || 'credit-card'); setEditing(pm); setShowForm(true);
  };

  const handleDelete = (id) => {
    const count = transactions.filter(t => t.paymentMethodId === id).length;
    const msg = count > 0 ? `Usada em ${count} lançamento(s). Excluir?` : 'Excluir?';
    if (window.confirm(msg)) { deletePaymentMethod(id); toast.success('Excluída!'); }
  };

  const getUsageCount = (id) => transactions.filter(t => t.paymentMethodId === id).length;

  return (
    <PageContainer>
      <Header>
        <PageTitle>Formas de Pagamento</PageTitle>
        <Button onClick={() => { resetForm(); setShowForm(true); }}>
          <FaPlus /> Nova Forma
        </Button>
      </Header>

      {paymentMethods.length > 0 ? (
        <PMGrid>
          {paymentMethods.map(pm => {
            const Icon = ICON_MAP[pm.icon] || FaWallet;
            const count = getUsageCount(pm.id);
            return (
              <PMCard key={pm.id}>
                <PMIcon><Icon /></PMIcon>
                <PMInfo>
                  <PMName>{pm.name}</PMName>
                  <PMCount>{count} lançamento{count !== 1 ? 's' : ''}</PMCount>
                </PMInfo>
                <PMActions>
                  <ActionBtn onClick={() => handleEdit(pm)}><FaEdit /></ActionBtn>
                  <ActionBtn $danger onClick={() => handleDelete(pm.id)}><FaTrash /></ActionBtn>
                </PMActions>
              </PMCard>
            );
          })}
        </PMGrid>
      ) : (
        <Card>
          <EmptyState>
            <FaWallet />
            <p>Nenhuma forma de pagamento</p>
            <Button $size="sm" onClick={() => setShowForm(true)} style={{ marginTop: 12 }}>
              <FaPlus /> Adicionar
            </Button>
          </EmptyState>
        </Card>
      )}

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); resetForm(); }}
        title={editing ? 'Editar Forma de Pagamento' : 'Nova Forma de Pagamento'}>
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Nome *</Label>
            <Input value={name} onChange={e => setName(e.target.value)}
              placeholder="Ex: Cartão de Crédito, PIX..." />
          </FormGroup>
          <FormGroup>
            <Label>Ícone</Label>
            <IconGrid>
              {Object.entries(ICON_MAP).map(([key, IconComp]) => (
                <IconOption key={key} $active={icon === key} type="button" onClick={() => setIcon(key)}>
                  <IconComp />
                  <span>{key.replace('-', ' ')}</span>
                </IconOption>
              ))}
            </IconGrid>
          </FormGroup>
          <FormActions>
            <Button type="button" $variant="ghost" onClick={() => { setShowForm(false); resetForm(); }}>
              Cancelar
            </Button>
            <Button type="submit">{editing ? 'Atualizar' : 'Criar'}</Button>
          </FormActions>
        </form>
      </Modal>
    </PageContainer>
  );
};

export default PaymentMethods;

const Header = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 20px; flex-wrap: wrap; gap: 12px;
`;
const PMGrid = styled.div`
  display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px;
`;
const PMCard = styled.div`
  display: flex; align-items: center; gap: 14px;
  background: white; padding: 18px; border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  transition: all 0.2s;
  &:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
`;
const PMIcon = styled.div`
  width: 44px; height: 44px; border-radius: 12px;
  background: #6C63FF15; color: #6C63FF;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; flex-shrink: 0;
`;
const PMInfo = styled.div`
  flex: 1;
`;
const PMName = styled.p`
  font-size: 15px; font-weight: 600;
`;
const PMCount = styled.p`
  font-size: 12px; color: ${({ theme }) => theme.colors.textMuted};
`;
const PMActions = styled.div`
  display: flex; gap: 6px;
`;
const ActionBtn = styled.button`
  padding: 8px; border-radius: 8px; border: none;
  background: ${({ $danger }) => $danger ? '#FDECEC' : '#F0F2F8'};
  color: ${({ $danger }) => $danger ? '#E74C3C' : '#636E72'};
  font-size: 13px; display: flex;
  &:hover { opacity: 0.8; }
`;
const IconGrid = styled.div`
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;
`;
const IconOption = styled.button`
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 12px 8px; border-radius: 10px; font-size: 11px;
  border: 2px solid ${({ $active }) => $active ? '#6C63FF' : '#E1E5EE'};
  background: ${({ $active }) => $active ? '#6C63FF15' : 'transparent'};
  color: ${({ $active }) => $active ? '#6C63FF' : '#636E72'};
  cursor: pointer; text-transform: capitalize;
  svg { font-size: 20px; }
  &:hover { border-color: #6C63FF; }
`;
const FormActions = styled.div`
  display: flex; justify-content: flex-end; gap: 10px; margin-top: 16px;
`;
