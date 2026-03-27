import React, { useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import {
  FaPlus, FaSearch, FaFilter, FaFileImport, FaTrash, FaEdit,
  FaArrowUp, FaArrowDown, FaTimes
} from 'react-icons/fa';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useFinance } from '../../contexts/FinanceContext';
import Modal from '../../components/Modal';
import {
  PageContainer, PageTitle, Card, Button, Input, Select,
  FormGroup, Label, FormRow, Badge, EmptyState, Chip
} from '../../components/UI';
import { formatCurrency, formatDate, getTodayDate } from '../../utils/formatters';
import { parseCSV, parseOFX } from '../../utils/csvParser';

const Transactions = () => {
  const {
    tags, accounts, paymentMethods, creditCards,
    addTransaction, updateTransaction, deleteTransaction,
    importTransactions, getFilteredTransactions,
  } = useFinance();

  const [searchParams] = useSearchParams();
  const [showForm, setShowForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    startDate: '', endDate: '', type: '', accountId: '',
    paymentMethodId: '', tags: [],
  });

  // Form state
  const [form, setForm] = useState({
    description: '', amount: '', date: getTodayDate(), type: 'expense',
    paymentMethodId: '', accountId: '', creditCardId: '',
    tags: [], installments: 1, notes: '',
  });

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setShowForm(true);
    }
  }, [searchParams]);

  const resetForm = () => {
    setForm({
      description: '', amount: '', date: getTodayDate(), type: 'expense',
      paymentMethodId: '', accountId: '', creditCardId: '',
      tags: [], installments: 1, notes: '',
    });
    setEditingTx(null);
  };

  const filteredTx = useMemo(() => {
    return getFilteredTransactions({ ...filters, search });
  }, [getFilteredTransactions, filters, search]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.description.trim()) return toast.error('Informe a descrição');
    if (!form.amount || parseFloat(form.amount) <= 0) return toast.error('Informe um valor válido');
    if (!form.date) return toast.error('Informe a data');

    const txData = {
      ...form,
      amount: parseFloat(form.amount),
    };

    if (editingTx) {
      updateTransaction(editingTx.id, txData);
      toast.success('Lançamento atualizado!');
    } else {
      addTransaction(txData);
      toast.success('Lançamento adicionado!');
    }
    resetForm();
    setShowForm(false);
  };

  const handleEdit = (tx) => {
    setForm({
      description: tx.description || '',
      amount: tx.amount || '',
      date: tx.date || getTodayDate(),
      type: tx.type || 'expense',
      paymentMethodId: tx.paymentMethodId || '',
      accountId: tx.accountId || '',
      creditCardId: tx.creditCardId || '',
      tags: tx.tags || [],
      installments: tx.installments || 1,
      notes: tx.notes || '',
    });
    setEditingTx(tx);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Excluir este lançamento?')) {
      deleteTransaction(id);
      toast.success('Lançamento excluído!');
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      let txList;
      if (file.name.endsWith('.csv')) {
        txList = await parseCSV(file);
      } else if (file.name.endsWith('.ofx')) {
        const text = await file.text();
        txList = parseOFX(text);
      } else {
        toast.error('Formato não suportado. Use CSV ou OFX.');
        return;
      }
      importTransactions(txList);
      toast.success(`${txList.length} lançamentos importados!`);
    } catch (err) {
      toast.error(err.message);
    }
    e.target.value = '';
  };

  const toggleTagFilter = (tagId) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter(t => t !== tagId)
        : [...prev.tags, tagId],
    }));
  };

  const toggleFormTag = (tagId) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter(t => t !== tagId)
        : [...prev.tags, tagId],
    }));
  };

  const clearFilters = () => {
    setFilters({ startDate: '', endDate: '', type: '', accountId: '', paymentMethodId: '', tags: [] });
    setSearch('');
  };

  const hasActiveFilters = filters.startDate || filters.endDate || filters.type ||
    filters.accountId || filters.paymentMethodId || filters.tags.length > 0;

  const totalIncome = useMemo(() =>
    filteredTx.filter(t => t.type === 'income').reduce((a, t) => a + parseFloat(t.amount), 0),
    [filteredTx]);

  const totalExpense = useMemo(() =>
    filteredTx.filter(t => t.type === 'expense').reduce((a, t) => a + parseFloat(t.amount), 0),
    [filteredTx]);

  return (
    <PageContainer>
      <Header>
        <PageTitle>Lançamentos</PageTitle>
        <Actions>
          <ImportLabel>
            <FaFileImport /> Importar
            <input type="file" accept=".csv,.ofx" onChange={handleImport} hidden />
          </ImportLabel>
          <Button onClick={() => { resetForm(); setShowForm(true); }}>
            <FaPlus /> Novo
          </Button>
        </Actions>
      </Header>

      <QuickSummary>
        <QuickItem $color="#00B894"><FaArrowUp /> {formatCurrency(totalIncome)}</QuickItem>
        <QuickItem $color="#E74C3C"><FaArrowDown /> {formatCurrency(totalExpense)}</QuickItem>
        <QuickItem $color={totalIncome - totalExpense >= 0 ? '#00B894' : '#E74C3C'}>
          Saldo: {formatCurrency(totalIncome - totalExpense)}
        </QuickItem>
      </QuickSummary>

      <SearchBar>
        <SearchWrap>
          <FaSearch />
          <SearchInput
            placeholder="Buscar lançamentos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </SearchWrap>
        <FilterBtn onClick={() => setShowFilters(!showFilters)} $active={hasActiveFilters}>
          <FaFilter />
          {hasActiveFilters && <FilterDot />}
        </FilterBtn>
      </SearchBar>

      {showFilters && (
        <FiltersCard>
          <FormRow $cols="1fr 1fr 1fr 1fr">
            <FormGroup>
              <Label>Data Início</Label>
              <Input type="date" value={filters.startDate}
                onChange={e => setFilters(p => ({ ...p, startDate: e.target.value }))} />
            </FormGroup>
            <FormGroup>
              <Label>Data Fim</Label>
              <Input type="date" value={filters.endDate}
                onChange={e => setFilters(p => ({ ...p, endDate: e.target.value }))} />
            </FormGroup>
            <FormGroup>
              <Label>Tipo</Label>
              <Select value={filters.type}
                onChange={e => setFilters(p => ({ ...p, type: e.target.value }))}>
                <option value="">Todos</option>
                <option value="income">Entradas</option>
                <option value="expense">Saídas</option>
              </Select>
            </FormGroup>
            <FormGroup>
              <Label>Conta</Label>
              <Select value={filters.accountId}
                onChange={e => setFilters(p => ({ ...p, accountId: e.target.value }))}>
                <option value="">Todas</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </Select>
            </FormGroup>
          </FormRow>
          <FormGroup>
            <Label>Tags</Label>
            <TagsWrap>
              {tags.map(tag => (
                <Chip key={tag.id} $active={filters.tags.includes(tag.id)}
                  onClick={() => toggleTagFilter(tag.id)}>
                  {tag.name}
                </Chip>
              ))}
            </TagsWrap>
          </FormGroup>
          {hasActiveFilters && (
            <ClearBtn onClick={clearFilters}><FaTimes /> Limpar filtros</ClearBtn>
          )}
        </FiltersCard>
      )}

      <Card $padding="0">
        {filteredTx.length > 0 ? (
          <TxTable>
            <thead>
              <tr>
                <Th>Descrição</Th>
                <Th $align="center">Data</Th>
                <Th $align="right">Valor</Th>
                <Th $hide>Tags</Th>
                <Th $align="center" $hide>Conta</Th>
                <Th $align="center" style={{ width: 80 }}>Ações</Th>
              </tr>
            </thead>
            <tbody>
              {filteredTx.map(tx => {
                const acc = accounts.find(a => a.id === tx.accountId);
                return (
                  <TxRow key={tx.id}>
                    <Td>
                      <TxDescCell>
                        <TypeIcon $type={tx.type}>
                          {tx.type === 'income' ? <FaArrowUp /> : <FaArrowDown />}
                        </TypeIcon>
                        <div>
                          <TxName>{tx.description}</TxName>
                          {tx.installmentTotal > 1 && (
                            <TxInstallment>
                              Parcela {tx.installmentNumber}/{tx.installmentTotal}
                            </TxInstallment>
                          )}
                        </div>
                      </TxDescCell>
                    </Td>
                    <Td $align="center">
                      <TxDateCell>{formatDate(tx.date)}</TxDateCell>
                    </Td>
                    <Td $align="right">
                      <TxAmountCell $type={tx.type}>
                        {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                      </TxAmountCell>
                    </Td>
                    <Td $hide>
                      <TagsGroup>
                        {tx.tags?.map(tagId => {
                          const tag = tags.find(t => t.id === tagId);
                          return tag ? (
                            <Badge key={tagId} $color={tag.color}>{tag.name}</Badge>
                          ) : null;
                        })}
                      </TagsGroup>
                    </Td>
                    <Td $align="center" $hide>
                      {acc ? acc.name : '-'}
                    </Td>
                    <Td $align="center">
                      <ActionBtns>
                        <ActionBtn onClick={() => handleEdit(tx)}><FaEdit /></ActionBtn>
                        <ActionBtn $danger onClick={() => handleDelete(tx.id)}><FaTrash /></ActionBtn>
                      </ActionBtns>
                    </Td>
                  </TxRow>
                );
              })}
            </tbody>
          </TxTable>
        ) : (
          <EmptyState>
            <FaExchangeIcon />
            <p>Nenhum lançamento encontrado</p>
            <Button $size="sm" onClick={() => { resetForm(); setShowForm(true); }} style={{ marginTop: 12 }}>
              <FaPlus /> Adicionar
            </Button>
          </EmptyState>
        )}
      </Card>

      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); resetForm(); }}
        title={editingTx ? 'Editar Lançamento' : 'Novo Lançamento'}
        width="600px"
      >
        <form onSubmit={handleSubmit}>
          <TypeToggle>
            <TypeBtn $active={form.type === 'income'} $color="#00B894"
              type="button" onClick={() => setForm(p => ({ ...p, type: 'income' }))}>
              <FaArrowUp /> Entrada
            </TypeBtn>
            <TypeBtn $active={form.type === 'expense'} $color="#E74C3C"
              type="button" onClick={() => setForm(p => ({ ...p, type: 'expense' }))}>
              <FaArrowDown /> Saída
            </TypeBtn>
          </TypeToggle>

          <FormRow>
            <FormGroup>
              <Label>Descrição *</Label>
              <Input value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Ex: Salário, Supermercado..." />
            </FormGroup>
            <FormGroup>
              <Label>Valor *</Label>
              <Input type="number" step="0.01" min="0" value={form.amount}
                onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                placeholder="0,00" />
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup>
              <Label>Data *</Label>
              <Input type="date" value={form.date}
                onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
            </FormGroup>
            <FormGroup>
              <Label>Conta</Label>
              <Select value={form.accountId}
                onChange={e => setForm(p => ({ ...p, accountId: e.target.value }))}>
                <option value="">Selecione...</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </Select>
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup>
              <Label>Forma de Pagamento</Label>
              <Select value={form.paymentMethodId}
                onChange={e => setForm(p => ({ ...p, paymentMethodId: e.target.value }))}>
                <option value="">Selecione...</option>
                {paymentMethods.map(pm => <option key={pm.id} value={pm.id}>{pm.name}</option>)}
              </Select>
            </FormGroup>
            <FormGroup>
              <Label>Cartão de Crédito</Label>
              <Select value={form.creditCardId}
                onChange={e => setForm(p => ({ ...p, creditCardId: e.target.value }))}>
                <option value="">Nenhum</option>
                {creditCards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </FormGroup>
          </FormRow>

          {form.creditCardId && (
            <FormGroup>
              <Label>Parcelas</Label>
              <Input type="number" min="1" max="48" value={form.installments}
                onChange={e => setForm(p => ({ ...p, installments: parseInt(e.target.value) || 1 }))} />
            </FormGroup>
          )}

          <FormGroup>
            <Label>Tags</Label>
            <TagsWrap>
              {tags.map(tag => (
                <Chip key={tag.id} $active={form.tags.includes(tag.id)}
                  type="button" onClick={() => toggleFormTag(tag.id)}>
                  <TagDot $color={tag.color} /> {tag.name}
                </Chip>
              ))}
            </TagsWrap>
          </FormGroup>

          <FormGroup>
            <Label>Observações</Label>
            <Input value={form.notes}
              onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              placeholder="Notas adicionais..." />
          </FormGroup>

          <FormActions>
            <Button type="button" $variant="ghost"
              onClick={() => { setShowForm(false); resetForm(); }}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingTx ? 'Atualizar' : 'Adicionar'}
            </Button>
          </FormActions>
        </form>
      </Modal>
    </PageContainer>
  );
};

export default Transactions;

// Styled Components
const Header = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 20px; flex-wrap: wrap; gap: 12px;
`;
const Actions = styled.div`
  display: flex; gap: 10px; align-items: center;
`;
const ImportLabel = styled.label`
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 20px; font-size: 14px; font-weight: 600;
  background: ${({ theme }) => theme.colors.surface};
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  cursor: pointer; color: ${({ theme }) => theme.colors.textSecondary};
  transition: all 0.2s;
  &:hover { border-color: ${({ theme }) => theme.colors.primary}; color: ${({ theme }) => theme.colors.primary}; }
`;
const QuickSummary = styled.div`
  display: flex; gap: 16px; margin-bottom: 16px; flex-wrap: wrap;
`;
const QuickItem = styled.div`
  display: flex; align-items: center; gap: 6px; font-size: 14px;
  font-weight: 600; color: ${({ $color }) => $color};
  background: ${({ $color }) => $color}10; padding: 6px 14px;
  border-radius: 8px;
`;
const SearchBar = styled.div`
  display: flex; gap: 10px; margin-bottom: 16px;
`;
const SearchWrap = styled.div`
  flex: 1; display: flex; align-items: center; gap: 10px;
  background: white; border: 1.5px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md}; padding: 0 14px;
  svg { color: ${({ theme }) => theme.colors.textMuted}; }
`;
const SearchInput = styled.input`
  flex: 1; border: none; padding: 10px 0; font-size: 14px;
  background: transparent; outline: none;
`;
const FilterBtn = styled.button`
  position: relative; width: 44px; height: 44px; border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ $active, theme }) => $active ? theme.colors.primary + '15' : theme.colors.surface};
  border: 1.5px solid ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.border};
  color: ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.textSecondary};
  display: flex; align-items: center; justify-content: center;
`;
const FilterDot = styled.span`
  position: absolute; top: 6px; right: 6px; width: 8px; height: 8px;
  border-radius: 50%; background: ${({ theme }) => theme.colors.danger};
`;
const FiltersCard = styled(Card)`
  margin-bottom: 16px;
`;
const TagsWrap = styled.div`
  display: flex; flex-wrap: wrap; gap: 8px;
`;
const ClearBtn = styled.button`
  display: flex; align-items: center; gap: 6px; font-size: 13px;
  color: ${({ theme }) => theme.colors.danger}; background: none; border: none;
  font-weight: 600; margin-top: 8px;
  &:hover { text-decoration: underline; }
`;
const TxTable = styled.table`
  width: 100%; border-collapse: collapse;
`;
const Th = styled.th`
  padding: 14px 16px; text-align: ${({ $align }) => $align || 'left'};
  font-size: 12px; font-weight: 600; text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textMuted};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  ${({ $hide }) => $hide && `@media (max-width: 768px) { display: none; }`}
`;
const TxRow = styled.tr`
  &:hover { background: ${({ theme }) => theme.colors.surfaceHover}; }
  &:not(:last-child) { border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight}; }
`;
const Td = styled.td`
  padding: 12px 16px; text-align: ${({ $align }) => $align || 'left'};
  font-size: 14px;
  ${({ $hide }) => $hide && `@media (max-width: 768px) { display: none; }`}
`;
const TxDescCell = styled.div`
  display: flex; align-items: center; gap: 12px;
`;
const TypeIcon = styled.div`
  width: 32px; height: 32px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center; font-size: 12px;
  background: ${({ $type }) => $type === 'income' ? '#E6F9F3' : '#FDECEC'};
  color: ${({ $type }) => $type === 'income' ? '#00B894' : '#E74C3C'};
  flex-shrink: 0;
`;
const TxName = styled.p`
  font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  max-width: 200px;
`;
const TxInstallment = styled.span`
  font-size: 11px; color: ${({ theme }) => theme.colors.textMuted};
`;
const TxDateCell = styled.span`
  font-size: 13px; color: ${({ theme }) => theme.colors.textSecondary};
`;
const TxAmountCell = styled.span`
  font-weight: 700;
  color: ${({ $type }) => $type === 'income' ? '#00B894' : '#E74C3C'};
`;
const TagsGroup = styled.div`
  display: flex; gap: 4px; flex-wrap: wrap;
`;
const ActionBtns = styled.div`
  display: flex; gap: 6px; justify-content: center;
`;
const ActionBtn = styled.button`
  padding: 6px; border-radius: 6px; border: none;
  background: ${({ $danger }) => $danger ? '#FDECEC' : '#F0F2F8'};
  color: ${({ $danger }) => $danger ? '#E74C3C' : '#636E72'};
  font-size: 13px; display: flex; align-items: center;
  &:hover { opacity: 0.8; }
`;
const FaExchangeIcon = styled(FaArrowDown)``;
const TypeToggle = styled.div`
  display: flex; gap: 10px; margin-bottom: 20px;
`;
const TypeBtn = styled.button`
  flex: 1; display: flex; align-items: center; justify-content: center;
  gap: 8px; padding: 12px; border-radius: 10px; font-size: 14px; font-weight: 600;
  border: 2px solid ${({ $active, $color }) => $active ? $color : '#E1E5EE'};
  background: ${({ $active, $color }) => $active ? $color + '15' : 'transparent'};
  color: ${({ $active, $color }) => $active ? $color : '#636E72'};
  transition: all 0.2s;
`;
const TagDot = styled.span`
  width: 8px; height: 8px; border-radius: 50%;
  background: ${({ $color }) => $color}; display: inline-block;
`;
const FormActions = styled.div`
  display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px;
`;
