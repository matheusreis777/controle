import React, { useState } from 'react';
import styled from 'styled-components';
import { FaPlus, FaEdit, FaTrash, FaBullseye, FaCheckCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useFinance } from '../../contexts/FinanceContext';
import Modal from '../../components/Modal';
import {
  PageContainer, PageTitle, Card, Button, Input,
  FormGroup, Label, FormRow, EmptyState
} from '../../components/UI';
import { formatCurrency } from '../../utils/formatters';

const Goals = () => {
  const { goals, addGoal, updateGoal, deleteGoal } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '', targetAmount: '', currentAmount: '', deadline: '', color: '#6C63FF',
  });

  const resetForm = () => {
    setForm({ name: '', targetAmount: '', currentAmount: '', deadline: '', color: '#6C63FF' });
    setEditing(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Informe o nome da meta');
    if (!form.targetAmount || parseFloat(form.targetAmount) <= 0) return toast.error('Informe o valor alvo');

    const data = {
      ...form,
      targetAmount: parseFloat(form.targetAmount),
      currentAmount: parseFloat(form.currentAmount) || 0,
    };

    if (editing) {
      updateGoal(editing.id, data);
      toast.success('Meta atualizada!');
    } else {
      addGoal(data);
      toast.success('Meta criada!');
    }
    resetForm(); setShowForm(false);
  };

  const handleEdit = (goal) => {
    setForm({
      name: goal.name, targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount || '', deadline: goal.deadline || '',
      color: goal.color || '#6C63FF',
    });
    setEditing(goal);
    setShowForm(true);
  };

  const handleAddAmount = (goal) => {
    const val = prompt('Quanto deseja adicionar?');
    if (val && parseFloat(val) > 0) {
      updateGoal(goal.id, { currentAmount: (goal.currentAmount || 0) + parseFloat(val) });
      toast.success('Valor adicionado à meta!');
    }
  };

  return (
    <PageContainer>
      <Header>
        <PageTitle>Metas Financeiras</PageTitle>
        <Button onClick={() => { resetForm(); setShowForm(true); }}>
          <FaPlus /> Nova Meta
        </Button>
      </Header>

      {goals.length > 0 ? (
        <GoalsGrid>
          {goals.map(goal => {
            const pct = goal.targetAmount > 0
              ? Math.min(((goal.currentAmount || 0) / goal.targetAmount) * 100, 100) : 0;
            const completed = pct >= 100;
            const daysLeft = goal.deadline
              ? Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24))
              : null;

            return (
              <GoalCard key={goal.id} $completed={completed}>
                <GoalHeader>
                  <GoalIcon $color={goal.color} $completed={completed}>
                    {completed ? <FaCheckCircle /> : <FaBullseye />}
                  </GoalIcon>
                  <GoalActions>
                    <ActionBtn onClick={() => handleEdit(goal)}><FaEdit /></ActionBtn>
                    <ActionBtn $danger onClick={() => {
                      if (window.confirm('Excluir meta?')) { deleteGoal(goal.id); toast.success('Meta excluída!'); }
                    }}><FaTrash /></ActionBtn>
                  </GoalActions>
                </GoalHeader>

                <GoalName>{goal.name}</GoalName>

                <AmountRow>
                  <AmountCurrent>{formatCurrency(goal.currentAmount || 0)}</AmountCurrent>
                  <AmountTarget>de {formatCurrency(goal.targetAmount)}</AmountTarget>
                </AmountRow>

                <ProgressBar>
                  <ProgressFill $pct={pct} $color={goal.color || '#6C63FF'} />
                </ProgressBar>

                <GoalFooter>
                  <GoalPct>{pct.toFixed(0)}%</GoalPct>
                  {daysLeft !== null && (
                    <GoalDeadline $danger={daysLeft <= 30 && !completed}>
                      {daysLeft > 0 ? `${daysLeft} dias restantes` : completed ? 'Concluída!' : 'Prazo vencido'}
                    </GoalDeadline>
                  )}
                </GoalFooter>

                {!completed && (
                  <AddAmountBtn onClick={() => handleAddAmount(goal)}>
                    <FaPlus /> Adicionar Valor
                  </AddAmountBtn>
                )}
              </GoalCard>
            );
          })}
        </GoalsGrid>
      ) : (
        <Card>
          <EmptyState>
            <FaBullseye />
            <p>Nenhuma meta definida</p>
            <Button $size="sm" onClick={() => setShowForm(true)} style={{ marginTop: 12 }}>
              <FaPlus /> Criar Meta
            </Button>
          </EmptyState>
        </Card>
      )}

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); resetForm(); }}
        title={editing ? 'Editar Meta' : 'Nova Meta'}>
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Nome da Meta *</Label>
            <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Ex: Reserva de emergência, Viagem..." />
          </FormGroup>
          <FormRow>
            <FormGroup>
              <Label>Valor Alvo *</Label>
              <Input type="number" step="0.01" min="0" value={form.targetAmount}
                onChange={e => setForm(p => ({ ...p, targetAmount: e.target.value }))} placeholder="0,00" />
            </FormGroup>
            <FormGroup>
              <Label>Valor Atual</Label>
              <Input type="number" step="0.01" min="0" value={form.currentAmount}
                onChange={e => setForm(p => ({ ...p, currentAmount: e.target.value }))} placeholder="0,00" />
            </FormGroup>
          </FormRow>
          <FormRow>
            <FormGroup>
              <Label>Prazo</Label>
              <Input type="date" value={form.deadline}
                onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} />
            </FormGroup>
            <FormGroup>
              <Label>Cor</Label>
              <input type="color" value={form.color}
                onChange={e => setForm(p => ({ ...p, color: e.target.value }))}
                style={{ width: 50, height: 40, border: 'none', cursor: 'pointer', borderRadius: 8 }} />
            </FormGroup>
          </FormRow>
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

export default Goals;

const Header = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 20px; flex-wrap: wrap; gap: 12px;
`;
const GoalsGrid = styled.div`
  display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px;
`;
const GoalCard = styled(Card)`
  padding: 20px;
  border-left: 4px solid ${({ $completed }) => $completed ? '#00B894' : '#6C63FF'};
  opacity: ${({ $completed }) => $completed ? 0.85 : 1};
`;
const GoalHeader = styled.div`
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;
`;
const GoalIcon = styled.div`
  width: 40px; height: 40px; border-radius: 10px;
  background: ${({ $completed, $color }) => $completed ? '#00B89415' : ($color + '15')};
  color: ${({ $completed, $color }) => $completed ? '#00B894' : $color};
  display: flex; align-items: center; justify-content: center; font-size: 18px;
`;
const GoalActions = styled.div`
  display: flex; gap: 6px;
`;
const ActionBtn = styled.button`
  padding: 8px; border-radius: 8px; border: none;
  background: ${({ $danger }) => $danger ? '#FDECEC' : '#F0F2F8'};
  color: ${({ $danger }) => $danger ? '#E74C3C' : '#636E72'};
  font-size: 13px; display: flex;
  &:hover { opacity: 0.8; }
`;
const GoalName = styled.h3`
  font-size: 16px; font-weight: 600; margin-bottom: 8px;
`;
const AmountRow = styled.div`
  display: flex; align-items: baseline; gap: 8px; margin-bottom: 12px;
`;
const AmountCurrent = styled.span`
  font-size: 20px; font-weight: 700; color: ${({ theme }) => theme.colors.primary};
`;
const AmountTarget = styled.span`
  font-size: 13px; color: ${({ theme }) => theme.colors.textMuted};
`;
const ProgressBar = styled.div`
  height: 10px; background: #F0F2F8; border-radius: 5px; overflow: hidden;
`;
const ProgressFill = styled.div`
  height: 100%; width: ${({ $pct }) => $pct}%;
  background: ${({ $color }) => $color};
  border-radius: 5px; transition: width 0.4s ease;
`;
const GoalFooter = styled.div`
  display: flex; justify-content: space-between; align-items: center; margin-top: 8px;
`;
const GoalPct = styled.span`
  font-size: 13px; font-weight: 600; color: ${({ theme }) => theme.colors.textSecondary};
`;
const GoalDeadline = styled.span`
  font-size: 12px;
  color: ${({ $danger, theme }) => $danger ? theme.colors.danger : theme.colors.textMuted};
`;
const AddAmountBtn = styled.button`
  width: 100%; margin-top: 12px; padding: 10px; border: 1.5px dashed ${({ theme }) => theme.colors.border};
  background: none; border-radius: 8px; color: ${({ theme }) => theme.colors.primary};
  font-size: 13px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 6px;
  &:hover { background: ${({ theme }) => theme.colors.primary}08; border-color: ${({ theme }) => theme.colors.primary}; }
`;
const FormActions = styled.div`
  display: flex; justify-content: flex-end; gap: 10px; margin-top: 16px;
`;
