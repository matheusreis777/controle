import React, { useState } from 'react';
import styled from 'styled-components';
import { FaPlus, FaEdit, FaTrash, FaCreditCard } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useFinance } from '../../contexts/FinanceContext';
import Modal from '../../components/Modal';
import {
  PageContainer, PageTitle, Card, Button, Input, Select,
  FormGroup, Label, FormRow, EmptyState, Badge
} from '../../components/UI';
import { formatCurrency, getMonthName } from '../../utils/formatters';

const CreditCards = () => {
  const {
    creditCards, addCreditCard, updateCreditCard, deleteCreditCard,
    accounts, transactions, getCreditCardUsed
  } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [form, setForm] = useState({
    name: '', limit: '', closingDay: '1', dueDay: '10',
    accountId: '', color: '#6C63FF',
  });

  const resetForm = () => {
    setForm({ name: '', limit: '', closingDay: '1', dueDay: '10', accountId: '', color: '#6C63FF' });
    setEditing(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Informe o nome do cartão');
    if (!form.limit || parseFloat(form.limit) <= 0) return toast.error('Informe um limite válido');

    const data = { ...form, limit: parseFloat(form.limit) };

    if (editing) {
      updateCreditCard(editing.id, data);
      toast.success('Cartão atualizado!');
    } else {
      addCreditCard(data);
      toast.success('Cartão adicionado!');
    }
    resetForm(); setShowForm(false);
  };

  const handleEdit = (card) => {
    setForm({
      name: card.name, limit: card.limit, closingDay: card.closingDay || '1',
      dueDay: card.dueDay || '10', accountId: card.accountId || '', color: card.color || '#6C63FF',
    });
    setEditing(card);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    const count = transactions.filter(t => t.creditCardId === id).length;
    const msg = count > 0 ? `${count} lançamento(s) vinculado(s). Excluir?` : 'Excluir este cartão?';
    if (window.confirm(msg)) { deleteCreditCard(id); toast.success('Cartão excluído!'); }
  };

  const getCardInvoice = (cardId) => {
    const now = new Date();
    const card = creditCards.find(c => c.id === cardId);
    if (!card) return [];
    return transactions
      .filter(t => t.creditCardId === cardId && t.type === 'expense')
      .filter(t => {
        const d = new Date(t.date + 'T00:00:00');
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  const getFutureInstallments = (cardId) => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    return transactions
      .filter(t => t.creditCardId === cardId && t.date > today && t.installmentTotal > 1)
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  return (
    <PageContainer>
      <Header>
        <PageTitle>Cartões de Crédito</PageTitle>
        <Button onClick={() => { resetForm(); setShowForm(true); }}>
          <FaPlus /> Novo Cartão
        </Button>
      </Header>

      {creditCards.length > 0 ? (
        <CardsGrid>
          {creditCards.map(card => {
            const used = getCreditCardUsed(card.id);
            const available = card.limit - used;
            const pct = card.limit > 0 ? (used / card.limit) * 100 : 0;
            const acc = accounts.find(a => a.id === card.accountId);
            const invoice = getCardInvoice(card.id);
            const invoiceTotal = invoice.reduce((a, t) => a + parseFloat(t.amount), 0);

            return (
              <CardItem key={card.id}>
                <CardTop $color={card.color}>
                  <CardTopRow>
                    <FaCreditCard size={24} />
                    <CardActionsTop>
                      <ActBtn onClick={() => handleEdit(card)}><FaEdit /></ActBtn>
                      <ActBtn onClick={() => handleDelete(card.id)}><FaTrash /></ActBtn>
                    </CardActionsTop>
                  </CardTopRow>
                  <CardName>{card.name}</CardName>
                  {acc && <CardBank>{acc.name}</CardBank>}
                </CardTop>

                <CardBody>
                  <LimitRow>
                    <LimitItem>
                      <LimitLabel>Limite Total</LimitLabel>
                      <LimitValue>{formatCurrency(card.limit)}</LimitValue>
                    </LimitItem>
                    <LimitItem>
                      <LimitLabel>Utilizado</LimitLabel>
                      <LimitValue $color="#E74C3C">{formatCurrency(used)}</LimitValue>
                    </LimitItem>
                    <LimitItem>
                      <LimitLabel>Disponível</LimitLabel>
                      <LimitValue $color="#00B894">{formatCurrency(available)}</LimitValue>
                    </LimitItem>
                  </LimitRow>

                  <ProgressBar>
                    <ProgressFill $pct={pct} $color={pct > 80 ? '#E74C3C' : pct > 50 ? '#F39C12' : '#00B894'} />
                  </ProgressBar>
                  <ProgressLabel>{pct.toFixed(0)}% utilizado</ProgressLabel>

                  <InvoiceSection>
                    <InvoiceHeader>
                      <InvoiceTitle>Fatura Atual ({getMonthName(new Date().getMonth())})</InvoiceTitle>
                      <InvoiceTotal>{formatCurrency(invoiceTotal)}</InvoiceTotal>
                    </InvoiceHeader>
                    <InfoRow>
                      <span>Fechamento: dia {card.closingDay}</span>
                      <span>Vencimento: dia {card.dueDay}</span>
                    </InfoRow>
                  </InvoiceSection>

                  <DetailBtn onClick={() => setSelectedCard(selectedCard === card.id ? null : card.id)}>
                    {selectedCard === card.id ? 'Ocultar detalhes' : 'Ver detalhes'}
                  </DetailBtn>

                  {selectedCard === card.id && (
                    <InvoiceDetail>
                      {invoice.length > 0 ? invoice.map(tx => (
                        <InvItem key={tx.id}>
                          <InvDesc>
                            {tx.description}
                            {tx.installmentTotal > 1 && (
                              <Badge $color="#6C63FF" style={{ marginLeft: 6, fontSize: 10 }}>
                                {tx.installmentNumber}/{tx.installmentTotal}
                              </Badge>
                            )}
                          </InvDesc>
                          <InvAmount>{formatCurrency(tx.amount)}</InvAmount>
                        </InvItem>
                      )) : <EmptyMsg>Nenhum lançamento na fatura atual</EmptyMsg>}

                      {getFutureInstallments(card.id).length > 0 && (
                        <>
                          <FutureTitle>Parcelas Futuras</FutureTitle>
                          {getFutureInstallments(card.id).slice(0, 10).map(tx => (
                            <InvItem key={tx.id} $future>
                              <InvDesc>{tx.description}</InvDesc>
                              <InvDateAmount>
                                <span>{new Date(tx.date + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                                <InvAmount>{formatCurrency(tx.amount)}</InvAmount>
                              </InvDateAmount>
                            </InvItem>
                          ))}
                        </>
                      )}
                    </InvoiceDetail>
                  )}
                </CardBody>
              </CardItem>
            );
          })}
        </CardsGrid>
      ) : (
        <Card>
          <EmptyState>
            <FaCreditCard />
            <p>Nenhum cartão cadastrado</p>
            <Button $size="sm" onClick={() => setShowForm(true)} style={{ marginTop: 12 }}>
              <FaPlus /> Adicionar Cartão
            </Button>
          </EmptyState>
        </Card>
      )}

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); resetForm(); }}
        title={editing ? 'Editar Cartão' : 'Novo Cartão'}>
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Nome do Cartão *</Label>
            <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Ex: Nubank, C6 Bank..." />
          </FormGroup>
          <FormRow>
            <FormGroup>
              <Label>Limite Total *</Label>
              <Input type="number" step="0.01" min="0" value={form.limit}
                onChange={e => setForm(p => ({ ...p, limit: e.target.value }))} placeholder="0,00" />
            </FormGroup>
            <FormGroup>
              <Label>Conta Vinculada</Label>
              <Select value={form.accountId} onChange={e => setForm(p => ({ ...p, accountId: e.target.value }))}>
                <option value="">Nenhuma</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </Select>
            </FormGroup>
          </FormRow>
          <FormRow>
            <FormGroup>
              <Label>Dia de Fechamento</Label>
              <Input type="number" min="1" max="31" value={form.closingDay}
                onChange={e => setForm(p => ({ ...p, closingDay: e.target.value }))} />
            </FormGroup>
            <FormGroup>
              <Label>Dia de Vencimento</Label>
              <Input type="number" min="1" max="31" value={form.dueDay}
                onChange={e => setForm(p => ({ ...p, dueDay: e.target.value }))} />
            </FormGroup>
          </FormRow>
          <FormGroup>
            <Label>Cor</Label>
            <input type="color" value={form.color}
              onChange={e => setForm(p => ({ ...p, color: e.target.value }))}
              style={{ width: 50, height: 40, border: 'none', cursor: 'pointer', borderRadius: 8 }} />
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

export default CreditCards;

const Header = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 20px; flex-wrap: wrap; gap: 12px;
`;
const CardsGrid = styled.div`
  display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px;
  @media (max-width: 480px) { grid-template-columns: 1fr; }
`;
const CardItem = styled.div`
  border-radius: 16px; overflow: hidden;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  background: white;
`;
const CardTop = styled.div`
  background: ${({ $color }) => $color || '#6C63FF'};
  color: white; padding: 20px;
`;
const CardTopRow = styled.div`
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;
`;
const CardActionsTop = styled.div`
  display: flex; gap: 6px;
`;
const ActBtn = styled.button`
  padding: 6px; border-radius: 6px; border: none;
  background: rgba(255,255,255,0.2); color: white;
  font-size: 13px; display: flex;
  &:hover { background: rgba(255,255,255,0.3); }
`;
const CardName = styled.h3`
  font-size: 18px; font-weight: 700;
`;
const CardBank = styled.p`
  font-size: 13px; opacity: 0.8;
`;
const CardBody = styled.div`
  padding: 20px;
`;
const LimitRow = styled.div`
  display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 14px;
`;
const LimitItem = styled.div`
  text-align: center;
`;
const LimitLabel = styled.p`
  font-size: 11px; color: ${({ theme }) => theme.colors.textMuted}; margin-bottom: 2px;
`;
const LimitValue = styled.p`
  font-size: 14px; font-weight: 700;
  color: ${({ $color, theme }) => $color || theme.colors.text};
`;
const ProgressBar = styled.div`
  height: 8px; background: #F0F2F8; border-radius: 4px; overflow: hidden;
`;
const ProgressFill = styled.div`
  height: 100%; width: ${({ $pct }) => Math.min($pct, 100)}%;
  background: ${({ $color }) => $color};
  border-radius: 4px; transition: width 0.4s ease;
`;
const ProgressLabel = styled.p`
  font-size: 11px; color: ${({ theme }) => theme.colors.textMuted};
  text-align: right; margin-top: 4px;
`;
const InvoiceSection = styled.div`
  margin-top: 16px; padding: 12px; background: #F5F6FA; border-radius: 10px;
`;
const InvoiceHeader = styled.div`
  display: flex; justify-content: space-between; align-items: center;
`;
const InvoiceTitle = styled.p`
  font-size: 13px; font-weight: 600;
`;
const InvoiceTotal = styled.p`
  font-size: 16px; font-weight: 700; color: ${({ theme }) => theme.colors.danger};
`;
const InfoRow = styled.div`
  display: flex; justify-content: space-between; margin-top: 8px;
  font-size: 11px; color: ${({ theme }) => theme.colors.textMuted};
`;
const DetailBtn = styled.button`
  width: 100%; margin-top: 12px; padding: 8px; border: none;
  background: none; color: ${({ theme }) => theme.colors.primary};
  font-size: 13px; font-weight: 600; cursor: pointer;
  &:hover { text-decoration: underline; }
`;
const InvoiceDetail = styled.div`
  margin-top: 8px; border-top: 1px solid ${({ theme }) => theme.colors.borderLight};
  padding-top: 12px;
`;
const InvItem = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  padding: 8px 0; border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
  opacity: ${({ $future }) => $future ? 0.7 : 1};
  &:last-child { border-bottom: none; }
`;
const InvDesc = styled.span`
  font-size: 13px; display: flex; align-items: center;
`;
const InvAmount = styled.span`
  font-size: 13px; font-weight: 600; color: ${({ theme }) => theme.colors.danger};
`;
const InvDateAmount = styled.div`
  display: flex; gap: 12px; align-items: center;
  span:first-child { font-size: 11px; color: ${({ theme }) => theme.colors.textMuted}; }
`;
const EmptyMsg = styled.p`
  font-size: 13px; color: ${({ theme }) => theme.colors.textMuted}; text-align: center; padding: 12px;
`;
const FutureTitle = styled.p`
  font-size: 12px; font-weight: 600; color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 12px; margin-bottom: 6px;
`;
const FormActions = styled.div`
  display: flex; justify-content: flex-end; gap: 10px; margin-top: 16px;
`;
