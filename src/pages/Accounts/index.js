import React, { useState } from 'react';
import styled from 'styled-components';
import { FaPlus, FaEdit, FaTrash, FaUniversity } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useFinance } from '../../contexts/FinanceContext';
import Modal from '../../components/Modal';
import {
  PageContainer, PageTitle, Card, Button, Input, Select,
  FormGroup, Label, FormRow, EmptyState
} from '../../components/UI';
import { formatCurrency } from '../../utils/formatters';
import { BANK_COLORS } from '../../utils/constants';

const BANK_OPTIONS = Object.keys(BANK_COLORS);

const Accounts = () => {
  const { accounts, addAccount, updateAccount, deleteAccount, getAccountBalance, totalBalance, transactions } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [editingAcc, setEditingAcc] = useState(null);
  const [form, setForm] = useState({
    name: '', bank: '', type: 'checking', initialBalance: '', color: '#6C63FF',
  });

  const resetForm = () => {
    setForm({ name: '', bank: '', type: 'checking', initialBalance: '', color: '#6C63FF' });
    setEditingAcc(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Informe o nome da conta');
    const data = { ...form, initialBalance: parseFloat(form.initialBalance) || 0 };

    if (editingAcc) {
      updateAccount(editingAcc.id, data);
      toast.success('Conta atualizada!');
    } else {
      addAccount(data);
      toast.success('Conta criada!');
    }
    resetForm();
    setShowForm(false);
  };

  const handleEdit = (acc) => {
    setForm({
      name: acc.name, bank: acc.bank || '', type: acc.type || 'checking',
      initialBalance: acc.initialBalance || '', color: acc.color || '#6C63FF',
    });
    setEditingAcc(acc);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    const count = transactions.filter(t => t.accountId === id).length;
    const msg = count > 0
      ? `Esta conta tem ${count} lançamento(s) vinculado(s). Excluir mesmo assim?`
      : 'Excluir esta conta?';
    if (window.confirm(msg)) {
      deleteAccount(id);
      toast.success('Conta excluída!');
    }
  };

  const handleBankChange = (bank) => {
    setForm(p => ({
      ...p,
      bank,
      color: BANK_COLORS[bank] || p.color,
    }));
  };

  return (
    <PageContainer>
      <Header>
        <div>
          <PageTitle>Contas Bancárias</PageTitle>
          <TotalBal $pos={totalBalance >= 0}>
            Saldo total: {formatCurrency(totalBalance)}
          </TotalBal>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }}>
          <FaPlus /> Nova Conta
        </Button>
      </Header>

      {accounts.length > 0 ? (
        <AccountGrid>
          {accounts.map(acc => {
            const balance = getAccountBalance(acc.id);
            return (
              <AccountCard key={acc.id} $color={acc.color}>
                <AccountHeader>
                  <AccountIcon $color={acc.color}><FaUniversity /></AccountIcon>
                  <AccountActions>
                    <ActionBtn onClick={() => handleEdit(acc)}><FaEdit /></ActionBtn>
                    <ActionBtn $danger onClick={() => handleDelete(acc.id)}><FaTrash /></ActionBtn>
                  </AccountActions>
                </AccountHeader>
                <AccountName>{acc.name}</AccountName>
                <AccountBank>{acc.bank || 'Sem banco'}</AccountBank>
                <AccountType>{acc.type === 'checking' ? 'Conta Corrente' : 'Poupança'}</AccountType>
                <AccountBalance $pos={balance >= 0}>{formatCurrency(balance)}</AccountBalance>
              </AccountCard>
            );
          })}
        </AccountGrid>
      ) : (
        <Card>
          <EmptyState>
            <FaUniversity />
            <p>Nenhuma conta cadastrada</p>
            <Button $size="sm" onClick={() => setShowForm(true)} style={{ marginTop: 12 }}>
              <FaPlus /> Adicionar Conta
            </Button>
          </EmptyState>
        </Card>
      )}

      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); resetForm(); }}
        title={editingAcc ? 'Editar Conta' : 'Nova Conta'}
      >
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Nome da Conta *</Label>
            <Input value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Ex: Conta Principal, Poupança..." />
          </FormGroup>

          <FormRow>
            <FormGroup>
              <Label>Banco</Label>
              <Select value={form.bank} onChange={e => handleBankChange(e.target.value)}>
                <option value="">Selecione...</option>
                {BANK_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
              </Select>
            </FormGroup>
            <FormGroup>
              <Label>Tipo</Label>
              <Select value={form.type}
                onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                <option value="checking">Conta Corrente</option>
                <option value="savings">Poupança</option>
              </Select>
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup>
              <Label>Saldo Inicial</Label>
              <Input type="number" step="0.01" value={form.initialBalance}
                onChange={e => setForm(p => ({ ...p, initialBalance: e.target.value }))}
                placeholder="0,00" />
            </FormGroup>
            <FormGroup>
              <Label>Cor</Label>
              <input type="color" value={form.color}
                onChange={e => setForm(p => ({ ...p, color: e.target.value }))}
                style={{ width: 50, height: 40, border: 'none', cursor: 'pointer', borderRadius: 8 }} />
            </FormGroup>
          </FormRow>

          <FormActions>
            <Button type="button" $variant="ghost"
              onClick={() => { setShowForm(false); resetForm(); }}>
              Cancelar
            </Button>
            <Button type="submit">{editingAcc ? 'Atualizar' : 'Criar'}</Button>
          </FormActions>
        </form>
      </Modal>
    </PageContainer>
  );
};

export default Accounts;

const Header = styled.div`
  display: flex; justify-content: space-between; align-items: flex-start;
  margin-bottom: 20px; flex-wrap: wrap; gap: 12px;
`;
const TotalBal = styled.p`
  font-size: 14px; font-weight: 600; margin-top: 4px;
  color: ${({ $pos }) => $pos ? '#00B894' : '#E74C3C'};
`;
const AccountGrid = styled.div`
  display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;
`;
const AccountCard = styled(Card)`
  border-top: 4px solid ${({ $color }) => $color || '#6C63FF'};
  padding: 20px;
`;
const AccountHeader = styled.div`
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;
`;
const AccountIcon = styled.div`
  width: 40px; height: 40px; border-radius: 10px;
  background: ${({ $color }) => $color}15; color: ${({ $color }) => $color};
  display: flex; align-items: center; justify-content: center; font-size: 18px;
`;
const AccountActions = styled.div`
  display: flex; gap: 6px;
`;
const ActionBtn = styled.button`
  padding: 8px; border-radius: 8px; border: none;
  background: ${({ $danger }) => $danger ? '#FDECEC' : '#F0F2F8'};
  color: ${({ $danger }) => $danger ? '#E74C3C' : '#636E72'};
  font-size: 13px; display: flex;
  &:hover { opacity: 0.8; }
`;
const AccountName = styled.h3`
  font-size: 16px; font-weight: 600; margin-bottom: 2px;
`;
const AccountBank = styled.p`
  font-size: 13px; color: ${({ theme }) => theme.colors.textSecondary};
`;
const AccountType = styled.p`
  font-size: 12px; color: ${({ theme }) => theme.colors.textMuted}; margin-bottom: 12px;
`;
const AccountBalance = styled.p`
  font-size: 22px; font-weight: 700;
  color: ${({ $pos }) => $pos ? '#00B894' : '#E74C3C'};
`;
const FormActions = styled.div`
  display: flex; justify-content: flex-end; gap: 10px; margin-top: 16px;
`;
