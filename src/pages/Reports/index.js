import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { FaDownload } from 'react-icons/fa';
import { useFinance } from '../../contexts/FinanceContext';
import {
  PageContainer, PageTitle, Card, Button, Input, Select,
  FormGroup, Label, EmptyState
} from '../../components/UI';
import { formatCurrency, getMonthShort, getFirstDayOfMonth, getLastDayOfMonth } from '../../utils/formatters';
import { CHART_COLORS } from '../../utils/constants';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement);

const Reports = () => {
  const { transactions, tags, accounts, getFilteredTransactions } = useFinance();

  const [startDate, setStartDate] = useState(getFirstDayOfMonth());
  const [endDate, setEndDate] = useState(getLastDayOfMonth());
  const [filterAccount, setFilterAccount] = useState('');
  const [filterType, setFilterType] = useState('');

  const filteredTx = useMemo(() =>
    getFilteredTransactions({ startDate, endDate, accountId: filterAccount, type: filterType }),
    [getFilteredTransactions, startDate, endDate, filterAccount, filterType]);

  const totalIncome = useMemo(() =>
    filteredTx.filter(t => t.type === 'income').reduce((a, t) => a + parseFloat(t.amount), 0), [filteredTx]);
  const totalExpense = useMemo(() =>
    filteredTx.filter(t => t.type === 'expense').reduce((a, t) => a + parseFloat(t.amount), 0), [filteredTx]);

  const expenseByTag = useMemo(() => {
    const map = {};
    filteredTx.filter(t => t.type === 'expense').forEach(t => {
      const tagList = t.tags?.length > 0 ? t.tags : ['no-tag'];
      tagList.forEach(tagId => {
        const tag = tags.find(tg => tg.id === tagId);
        const name = tag ? tag.name : 'Sem categoria';
        map[name] = (map[name] || 0) + parseFloat(t.amount);
      });
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filteredTx, tags]);

  const incomeByTag = useMemo(() => {
    const map = {};
    filteredTx.filter(t => t.type === 'income').forEach(t => {
      const tagList = t.tags?.length > 0 ? t.tags : ['no-tag'];
      tagList.forEach(tagId => {
        const tag = tags.find(tg => tg.id === tagId);
        const name = tag ? tag.name : 'Sem categoria';
        map[name] = (map[name] || 0) + parseFloat(t.amount);
      });
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filteredTx, tags]);

  const monthlyEvolution = useMemo(() => {
    const map = {};
    transactions.forEach(t => {
      const d = new Date(t.date + 'T00:00:00');
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!map[key]) map[key] = { income: 0, expense: 0 };
      if (t.type === 'income') map[key].income += parseFloat(t.amount);
      else map[key].expense += parseFloat(t.amount);
    });
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0])).slice(-12);
  }, [transactions]);

  const expensePieData = {
    labels: expenseByTag.slice(0, 10).map(e => e[0]),
    datasets: [{ data: expenseByTag.slice(0, 10).map(e => e[1]), backgroundColor: CHART_COLORS, borderWidth: 0 }],
  };

  const incomePieData = {
    labels: incomeByTag.slice(0, 10).map(e => e[0]),
    datasets: [{ data: incomeByTag.slice(0, 10).map(e => e[1]), backgroundColor: CHART_COLORS, borderWidth: 0 }],
  };

  const evolutionData = {
    labels: monthlyEvolution.map(([key]) => {
      const [y, m] = key.split('-');
      return `${getMonthShort(parseInt(m) - 1)}/${y.slice(2)}`;
    }),
    datasets: [
      { label: 'Entradas', data: monthlyEvolution.map(([, v]) => v.income), borderColor: '#00B894', backgroundColor: '#00B89430', fill: true, tension: 0.3 },
      { label: 'Saídas', data: monthlyEvolution.map(([, v]) => v.expense), borderColor: '#E74C3C', backgroundColor: '#E74C3C30', fill: true, tension: 0.3 },
      { label: 'Saldo', data: monthlyEvolution.map(([, v]) => v.income - v.expense), borderColor: '#6C63FF', backgroundColor: '#6C63FF30', fill: false, tension: 0.3, borderDash: [5, 5] },
    ],
  };

  const balanceByAccount = useMemo(() => {
    const map = {};
    filteredTx.forEach(t => {
      const acc = accounts.find(a => a.id === t.accountId);
      const name = acc ? acc.name : 'Sem conta';
      if (!map[name]) map[name] = { income: 0, expense: 0 };
      if (t.type === 'income') map[name].income += parseFloat(t.amount);
      else map[name].expense += parseFloat(t.amount);
    });
    return Object.entries(map);
  }, [filteredTx, accounts]);

  const accountBarData = {
    labels: balanceByAccount.map(([name]) => name),
    datasets: [
      { label: 'Entradas', data: balanceByAccount.map(([, v]) => v.income), backgroundColor: '#00B894', borderRadius: 6 },
      { label: 'Saídas', data: balanceByAccount.map(([, v]) => v.expense), backgroundColor: '#E74C3C', borderRadius: 6 },
    ],
  };

  const chartOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { padding: 12, font: { size: 12 } } } },
  };

  const barOpts = {
    ...chartOpts,
    scales: { y: { beginAtZero: true, ticks: { callback: v => `R$ ${v}` } } },
  };

  const handleExportCSV = () => {
    const header = 'Data,Descrição,Tipo,Valor,Conta\n';
    const rows = filteredTx.map(t => {
      const acc = accounts.find(a => a.id === t.accountId);
      return `${t.date},"${t.description}",${t.type === 'income' ? 'Entrada' : 'Saída'},${t.amount},${acc?.name || ''}`;
    }).join('\n');
    const blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio_${startDate}_${endDate}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // Future balance prediction
  const futureBalance = useMemo(() => {
    const now = new Date();
    const avg = monthlyEvolution.length > 0
      ? monthlyEvolution.reduce((acc, [, v]) => acc + (v.income - v.expense), 0) / monthlyEvolution.length
      : 0;

    const currentBalance = totalIncome - totalExpense;
    const predictions = [];
    for (let i = 1; i <= 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      predictions.push({
        month: `${getMonthShort(d.getMonth())}/${d.getFullYear().toString().slice(2)}`,
        balance: currentBalance + avg * i,
      });
    }
    return predictions;
  }, [monthlyEvolution, totalIncome, totalExpense]);

  return (
    <PageContainer>
      <Header>
        <PageTitle>Relatórios</PageTitle>
        <Button onClick={handleExportCSV} $variant="outline">
          <FaDownload /> Exportar CSV
        </Button>
      </Header>

      <FiltersRow>
        <FormGroup>
          <Label>Data Início</Label>
          <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </FormGroup>
        <FormGroup>
          <Label>Data Fim</Label>
          <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </FormGroup>
        <FormGroup>
          <Label>Conta</Label>
          <Select value={filterAccount} onChange={e => setFilterAccount(e.target.value)}>
            <option value="">Todas</option>
            {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </Select>
        </FormGroup>
        <FormGroup>
          <Label>Tipo</Label>
          <Select value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">Todos</option>
            <option value="income">Entradas</option>
            <option value="expense">Saídas</option>
          </Select>
        </FormGroup>
      </FiltersRow>

      <SummaryRow>
        <SumCard $color="#00B894">
          <SumLabel>Total Entradas</SumLabel>
          <SumValue>{formatCurrency(totalIncome)}</SumValue>
        </SumCard>
        <SumCard $color="#E74C3C">
          <SumLabel>Total Saídas</SumLabel>
          <SumValue>{formatCurrency(totalExpense)}</SumValue>
        </SumCard>
        <SumCard $color={totalIncome - totalExpense >= 0 ? '#00B894' : '#E74C3C'}>
          <SumLabel>Resultado</SumLabel>
          <SumValue>{formatCurrency(totalIncome - totalExpense)}</SumValue>
        </SumCard>
        <SumCard $color="#6C63FF">
          <SumLabel>Lançamentos</SumLabel>
          <SumValue>{filteredTx.length}</SumValue>
        </SumCard>
      </SummaryRow>

      <ChartsGrid>
        <Card>
          <ChartTitle>Evolução Financeira</ChartTitle>
          {monthlyEvolution.length > 0 ? (
            <ChartWrap $tall>
              <Line data={evolutionData} options={{ ...chartOpts, scales: { y: { ticks: { callback: v => `R$ ${v}` } } } }} />
            </ChartWrap>
          ) : <EmptyState><p>Sem dados</p></EmptyState>}
        </Card>
      </ChartsGrid>

      <ChartsGrid $cols="1fr 1fr">
        <Card>
          <ChartTitle>Despesas por Categoria</ChartTitle>
          {expenseByTag.length > 0 ? (
            <>
              <ChartWrap><Pie data={expensePieData} options={chartOpts} /></ChartWrap>
              <DetailList>
                {expenseByTag.map(([name, val], i) => (
                  <DetailItem key={name}>
                    <DetailDot $color={CHART_COLORS[i % CHART_COLORS.length]} />
                    <DetailName>{name}</DetailName>
                    <DetailVal>{formatCurrency(val)}</DetailVal>
                    <DetailPct>{totalExpense > 0 ? ((val / totalExpense) * 100).toFixed(1) : 0}%</DetailPct>
                  </DetailItem>
                ))}
              </DetailList>
            </>
          ) : <EmptyState><p>Sem despesas</p></EmptyState>}
        </Card>

        <Card>
          <ChartTitle>Receitas por Categoria</ChartTitle>
          {incomeByTag.length > 0 ? (
            <>
              <ChartWrap><Pie data={incomePieData} options={chartOpts} /></ChartWrap>
              <DetailList>
                {incomeByTag.map(([name, val], i) => (
                  <DetailItem key={name}>
                    <DetailDot $color={CHART_COLORS[i % CHART_COLORS.length]} />
                    <DetailName>{name}</DetailName>
                    <DetailVal $green>{formatCurrency(val)}</DetailVal>
                    <DetailPct>{totalIncome > 0 ? ((val / totalIncome) * 100).toFixed(1) : 0}%</DetailPct>
                  </DetailItem>
                ))}
              </DetailList>
            </>
          ) : <EmptyState><p>Sem receitas</p></EmptyState>}
        </Card>
      </ChartsGrid>

      <ChartsGrid $cols="1fr 1fr">
        <Card>
          <ChartTitle>Movimentação por Conta</ChartTitle>
          {balanceByAccount.length > 0 ? (
            <ChartWrap><Bar data={accountBarData} options={barOpts} /></ChartWrap>
          ) : <EmptyState><p>Sem dados</p></EmptyState>}
        </Card>

        <Card>
          <ChartTitle>Previsão de Saldo (Próximos 6 meses)</ChartTitle>
          {futureBalance.length > 0 ? (
            <ChartWrap>
              <Line data={{
                labels: futureBalance.map(f => f.month),
                datasets: [{
                  label: 'Saldo Previsto',
                  data: futureBalance.map(f => f.balance),
                  borderColor: '#6C63FF',
                  backgroundColor: '#6C63FF20',
                  fill: true,
                  tension: 0.3,
                  borderDash: [5, 5],
                }],
              }} options={{ ...chartOpts, scales: { y: { ticks: { callback: v => `R$ ${v.toFixed(0)}` } } } }} />
            </ChartWrap>
          ) : <EmptyState><p>Sem dados suficientes</p></EmptyState>}
        </Card>
      </ChartsGrid>

      {/* Comparativo mensal */}
      <Card style={{ marginTop: 16 }}>
        <ChartTitle>Comparativo Mensal</ChartTitle>
        {monthlyEvolution.length >= 2 ? (
          <CompareGrid>
            {monthlyEvolution.slice(-6).map(([key, v], i, arr) => {
              const prev = i > 0 ? arr[i - 1][1] : null;
              const expVar = prev ? ((v.expense - prev.expense) / (prev.expense || 1)) * 100 : 0;
              const incVar = prev ? ((v.income - prev.income) / (prev.income || 1)) * 100 : 0;
              const [y, m] = key.split('-');
              return (
                <CompareCard key={key}>
                  <CompareMonth>{getMonthShort(parseInt(m) - 1)}/{y.slice(2)}</CompareMonth>
                  <CompareRow>
                    <span>Entradas</span>
                    <CompareVal $green>{formatCurrency(v.income)}</CompareVal>
                    {prev && <CompareVar $pos={incVar >= 0}>{incVar >= 0 ? '+' : ''}{incVar.toFixed(1)}%</CompareVar>}
                  </CompareRow>
                  <CompareRow>
                    <span>Saídas</span>
                    <CompareVal $red>{formatCurrency(v.expense)}</CompareVal>
                    {prev && <CompareVar $pos={expVar <= 0}>{expVar >= 0 ? '+' : ''}{expVar.toFixed(1)}%</CompareVar>}
                  </CompareRow>
                </CompareCard>
              );
            })}
          </CompareGrid>
        ) : <EmptyState><p>Precisa de pelo menos 2 meses de dados</p></EmptyState>}
      </Card>
    </PageContainer>
  );
};

export default Reports;

const Header = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 20px; flex-wrap: wrap; gap: 12px;
`;
const FiltersRow = styled.div`
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;
  margin-bottom: 20px; background: white; padding: 16px;
  border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  @media (max-width: 768px) { grid-template-columns: 1fr 1fr; }
  @media (max-width: 480px) { grid-template-columns: 1fr; }
`;
const SummaryRow = styled.div`
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px;
  @media (max-width: 768px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 480px) { grid-template-columns: 1fr; }
`;
const SumCard = styled.div`
  background: white; padding: 16px; border-radius: 12px;
  border-left: 4px solid ${({ $color }) => $color};
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
`;
const SumLabel = styled.p`
  font-size: 12px; color: ${({ theme }) => theme.colors.textMuted}; margin-bottom: 4px;
`;
const SumValue = styled.p`
  font-size: 20px; font-weight: 700;
`;
const ChartsGrid = styled.div`
  display: grid; grid-template-columns: ${({ $cols }) => $cols || '1fr'}; gap: 16px; margin-bottom: 16px;
  @media (max-width: 768px) { grid-template-columns: 1fr; }
`;
const ChartTitle = styled.h3`
  font-size: 15px; font-weight: 600; margin-bottom: 16px;
`;
const ChartWrap = styled.div`
  height: ${({ $tall }) => $tall ? '320px' : '260px'}; position: relative;
  @media (max-width: 480px) { height: 220px; }
`;
const DetailList = styled.div`
  margin-top: 16px; border-top: 1px solid ${({ theme }) => theme.colors.borderLight};
  padding-top: 12px;
`;
const DetailItem = styled.div`
  display: flex; align-items: center; gap: 8px; padding: 6px 0;
  font-size: 13px;
`;
const DetailDot = styled.div`
  width: 10px; height: 10px; border-radius: 50%; background: ${({ $color }) => $color};
`;
const DetailName = styled.span`
  flex: 1;
`;
const DetailVal = styled.span`
  font-weight: 600;
  color: ${({ $green }) => $green ? '#00B894' : '#E74C3C'};
`;
const DetailPct = styled.span`
  min-width: 45px; text-align: right; color: ${({ theme }) => theme.colors.textMuted};
`;
const CompareGrid = styled.div`
  display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px;
`;
const CompareCard = styled.div`
  padding: 14px; border-radius: 10px; background: ${({ theme }) => theme.colors.background};
`;
const CompareMonth = styled.p`
  font-size: 14px; font-weight: 700; margin-bottom: 10px;
  color: ${({ theme }) => theme.colors.text};
`;
const CompareRow = styled.div`
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
  font-size: 12px; margin-bottom: 6px;
  span:first-child { color: ${({ theme }) => theme.colors.textSecondary}; }
`;
const CompareVal = styled.span`
  font-weight: 600;
  color: ${({ $green, $red }) => $green ? '#00B894' : $red ? '#E74C3C' : 'inherit'};
`;
const CompareVar = styled.span`
  font-size: 11px; font-weight: 600;
  color: ${({ $pos }) => $pos ? '#00B894' : '#E74C3C'};
`;
