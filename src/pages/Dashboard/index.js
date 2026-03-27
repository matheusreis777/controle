import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { FaArrowUp, FaArrowDown, FaWallet, FaExclamationTriangle, FaPlus } from 'react-icons/fa';
import { useFinance } from '../../contexts/FinanceContext';
import { formatCurrency, getMonthName, getMonthShort, getFirstDayOfMonth, getLastDayOfMonth } from '../../utils/formatters';
import { CHART_COLORS } from '../../utils/constants';
import { PageContainer, PageTitle, Card, Button, Badge, EmptyState } from '../../components/UI';
import { useNavigate } from 'react-router-dom';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement);

const Dashboard = () => {
  const {
    transactions, tags, accounts, creditCards,
    getAccountBalance, totalBalance, getCreditCardUsed, getFilteredTransactions,
    goals,
  } = useFinance();
  const navigate = useNavigate();

  const [period, setPeriod] = useState('month');

  const dateRange = useMemo(() => {
    const now = new Date();
    if (period === 'month') {
      return { startDate: getFirstDayOfMonth(), endDate: getLastDayOfMonth() };
    }
    if (period === 'year') {
      return {
        startDate: `${now.getFullYear()}-01-01`,
        endDate: `${now.getFullYear()}-12-31`,
      };
    }
    return {};
  }, [period]);

  const filteredTx = useMemo(() =>
    getFilteredTransactions(dateRange), [getFilteredTransactions, dateRange]);

  const totalIncome = useMemo(() =>
    filteredTx.filter(t => t.type === 'income').reduce((a, t) => a + parseFloat(t.amount), 0),
    [filteredTx]);

  const totalExpense = useMemo(() =>
    filteredTx.filter(t => t.type === 'expense').reduce((a, t) => a + parseFloat(t.amount), 0),
    [filteredTx]);

  const expenseByTag = useMemo(() => {
    const map = {};
    filteredTx.filter(t => t.type === 'expense').forEach(t => {
      if (t.tags && t.tags.length > 0) {
        t.tags.forEach(tagId => {
          const tag = tags.find(tg => tg.id === tagId);
          const name = tag ? tag.name : 'Sem tag';
          map[name] = (map[name] || 0) + parseFloat(t.amount);
        });
      } else {
        map['Sem tag'] = (map['Sem tag'] || 0) + parseFloat(t.amount);
      }
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filteredTx, tags]);

  const monthlyData = useMemo(() => {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = d.getMonth();
      const year = d.getFullYear();
      const txs = transactions.filter(t => {
        const td = new Date(t.date + 'T00:00:00');
        return td.getMonth() === month && td.getFullYear() === year;
      });
      months.push({
        label: getMonthShort(month),
        income: txs.filter(t => t.type === 'income').reduce((a, t) => a + parseFloat(t.amount), 0),
        expense: txs.filter(t => t.type === 'expense').reduce((a, t) => a + parseFloat(t.amount), 0),
      });
    }
    return months;
  }, [transactions]);

  const pieData = {
    labels: expenseByTag.slice(0, 8).map(e => e[0]),
    datasets: [{
      data: expenseByTag.slice(0, 8).map(e => e[1]),
      backgroundColor: CHART_COLORS.slice(0, 8),
      borderWidth: 0,
    }],
  };

  const barData = {
    labels: monthlyData.map(m => m.label),
    datasets: [
      {
        label: 'Entradas',
        data: monthlyData.map(m => m.income),
        backgroundColor: '#00B894',
        borderRadius: 6,
      },
      {
        label: 'Saídas',
        data: monthlyData.map(m => m.expense),
        backgroundColor: '#E74C3C',
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { padding: 16, font: { size: 12 } } } },
  };

  const barOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (v) => formatCurrency(v).replace('R$\u00a0', 'R$ '),
        },
      },
    },
  };

  const alerts = useMemo(() => {
    const list = [];
    creditCards.forEach(card => {
      const used = getCreditCardUsed(card.id);
      const pct = (used / card.limit) * 100;
      if (pct >= 80) {
        list.push(`Cartão ${card.name}: ${pct.toFixed(0)}% do limite utilizado`);
      }
    });
    goals.forEach(goal => {
      const pct = ((goal.currentAmount || 0) / goal.targetAmount) * 100;
      if (goal.deadline) {
        const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
        if (daysLeft <= 30 && pct < 80) {
          list.push(`Meta "${goal.name}": apenas ${pct.toFixed(0)}% concluída, faltam ${daysLeft} dias`);
        }
      }
    });
    if (totalExpense > totalIncome && totalIncome > 0) {
      list.push('Suas despesas estão maiores que suas receitas neste período!');
    }
    return list;
  }, [creditCards, goals, getCreditCardUsed, totalExpense, totalIncome]);

  const now = new Date();

  return (
    <PageContainer>
      <HeaderRow>
        <div>
          <PageTitle>Dashboard</PageTitle>
          <SubTitle>{getMonthName(now.getMonth())} de {now.getFullYear()}</SubTitle>
        </div>
        <HeaderActions>
          <PeriodSelector>
            <PeriodBtn $active={period === 'month'} onClick={() => setPeriod('month')}>Mês</PeriodBtn>
            <PeriodBtn $active={period === 'year'} onClick={() => setPeriod('year')}>Ano</PeriodBtn>
            <PeriodBtn $active={period === 'all'} onClick={() => setPeriod('all')}>Tudo</PeriodBtn>
          </PeriodSelector>
          <Button onClick={() => navigate('/transactions?new=1')}>
            <FaPlus /> Novo Lançamento
          </Button>
        </HeaderActions>
      </HeaderRow>

      {alerts.length > 0 && (
        <AlertsBar>
          <FaExclamationTriangle />
          <AlertList>
            {alerts.map((a, i) => <AlertItem key={i}>{a}</AlertItem>)}
          </AlertList>
        </AlertsBar>
      )}

      <SummaryGrid>
        <SummaryCard $color="#6C63FF">
          <SummaryIcon $bg="#6C63FF"><FaWallet /></SummaryIcon>
          <SummaryInfo>
            <SummaryLabel>Saldo Total</SummaryLabel>
            <SummaryValue $color={totalBalance >= 0 ? '#00B894' : '#E74C3C'}>
              {formatCurrency(totalBalance)}
            </SummaryValue>
          </SummaryInfo>
        </SummaryCard>

        <SummaryCard $color="#00B894">
          <SummaryIcon $bg="#00B894"><FaArrowUp /></SummaryIcon>
          <SummaryInfo>
            <SummaryLabel>Entradas</SummaryLabel>
            <SummaryValue $color="#00B894">{formatCurrency(totalIncome)}</SummaryValue>
          </SummaryInfo>
        </SummaryCard>

        <SummaryCard $color="#E74C3C">
          <SummaryIcon $bg="#E74C3C"><FaArrowDown /></SummaryIcon>
          <SummaryInfo>
            <SummaryLabel>Saídas</SummaryLabel>
            <SummaryValue $color="#E74C3C">{formatCurrency(totalExpense)}</SummaryValue>
          </SummaryInfo>
        </SummaryCard>

        <SummaryCard $color="#F39C12">
          <SummaryIcon $bg="#F39C12"><FaWallet /></SummaryIcon>
          <SummaryInfo>
            <SummaryLabel>Balanço</SummaryLabel>
            <SummaryValue $color={totalIncome - totalExpense >= 0 ? '#00B894' : '#E74C3C'}>
              {formatCurrency(totalIncome - totalExpense)}
            </SummaryValue>
          </SummaryInfo>
        </SummaryCard>
      </SummaryGrid>

      <ChartsGrid>
        <Card>
          <ChartTitle>Evolução Mensal</ChartTitle>
          <ChartWrap>
            <Bar data={barData} options={barOptions} />
          </ChartWrap>
        </Card>

        <Card>
          <ChartTitle>Despesas por Categoria</ChartTitle>
          {expenseByTag.length > 0 ? (
            <ChartWrap>
              <Pie data={pieData} options={chartOptions} />
            </ChartWrap>
          ) : (
            <EmptyState><p>Sem dados no período</p></EmptyState>
          )}
        </Card>
      </ChartsGrid>

      <BottomGrid>
        <Card>
          <ChartTitle>Contas Bancárias</ChartTitle>
          {accounts.length > 0 ? (
            <AccountList>
              {accounts.map(acc => {
                const bal = getAccountBalance(acc.id);
                return (
                  <AccountItem key={acc.id}>
                    <AccountInfo>
                      <AccountDot $color={acc.color || '#6C63FF'} />
                      <div>
                        <AccountName>{acc.name}</AccountName>
                        <AccountBank>{acc.bank}</AccountBank>
                      </div>
                    </AccountInfo>
                    <AccountBalance $positive={bal >= 0}>
                      {formatCurrency(bal)}
                    </AccountBalance>
                  </AccountItem>
                );
              })}
            </AccountList>
          ) : (
            <EmptyState>
              <p>Nenhuma conta cadastrada</p>
              <Button $size="sm" onClick={() => navigate('/accounts')} style={{ marginTop: 12 }}>
                Adicionar Conta
              </Button>
            </EmptyState>
          )}
        </Card>

        <Card>
          <ChartTitle>Principais Gastos</ChartTitle>
          {expenseByTag.length > 0 ? (
            <TopExpensesList>
              {expenseByTag.slice(0, 6).map(([name, value], i) => (
                <TopExpenseItem key={name}>
                  <TopExpenseRank>#{i + 1}</TopExpenseRank>
                  <TopExpenseName>{name}</TopExpenseName>
                  <TopExpenseValue>{formatCurrency(value)}</TopExpenseValue>
                  <TopExpensePct>
                    <Badge $color={CHART_COLORS[i]}>
                      {totalExpense > 0 ? ((value / totalExpense) * 100).toFixed(0) : 0}%
                    </Badge>
                  </TopExpensePct>
                </TopExpenseItem>
              ))}
            </TopExpensesList>
          ) : (
            <EmptyState><p>Sem despesas no período</p></EmptyState>
          )}
        </Card>

        <Card>
          <ChartTitle>Últimas Movimentações</ChartTitle>
          {filteredTx.length > 0 ? (
            <RecentTxList>
              {filteredTx.slice(0, 8).map(tx => (
                <RecentTxItem key={tx.id}>
                  <TxTypeIcon $type={tx.type}>
                    {tx.type === 'income' ? <FaArrowUp /> : <FaArrowDown />}
                  </TxTypeIcon>
                  <TxInfo>
                    <TxDesc>{tx.description}</TxDesc>
                    <TxDate>{new Date(tx.date + 'T00:00:00').toLocaleDateString('pt-BR')}</TxDate>
                  </TxInfo>
                  <TxAmount $type={tx.type}>
                    {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                  </TxAmount>
                </RecentTxItem>
              ))}
            </RecentTxList>
          ) : (
            <EmptyState><p>Nenhum lançamento no período</p></EmptyState>
          )}
        </Card>
      </BottomGrid>
    </PageContainer>
  );
};

export default Dashboard;

// Styled components
const HeaderRow = styled.div`
  display: flex; justify-content: space-between; align-items: flex-start;
  margin-bottom: 24px; flex-wrap: wrap; gap: 16px;
`;
const SubTitle = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary}; font-size: 14px; margin-top: 4px;
`;
const HeaderActions = styled.div`
  display: flex; gap: 12px; align-items: center; flex-wrap: wrap;
`;
const PeriodSelector = styled.div`
  display: flex; background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radius.md};
  box-shadow: 0 1px 4px ${({ theme }) => theme.colors.shadow};
  overflow: hidden;
`;
const PeriodBtn = styled.button`
  padding: 8px 16px; font-size: 13px; font-weight: 600; border: none;
  background: ${({ $active, theme }) => $active ? theme.colors.primary : 'transparent'};
  color: ${({ $active, theme }) => $active ? 'white' : theme.colors.textSecondary};
  transition: all 0.2s;
  &:hover { background: ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.borderLight}; }
`;
const AlertsBar = styled.div`
  display: flex; align-items: flex-start; gap: 12px;
  background: #FEF5E7; border: 1px solid #F39C12; border-radius: 10px;
  padding: 14px 18px; margin-bottom: 20px; color: #856404;
  svg { margin-top: 2px; min-width: 16px; }
`;
const AlertList = styled.div`
  display: flex; flex-direction: column; gap: 4px;
`;
const AlertItem = styled.span`
  font-size: 13px; font-weight: 500;
`;
const SummaryGrid = styled.div`
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;
  @media (max-width: 1024px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 480px) { grid-template-columns: 1fr; }
`;
const SummaryCard = styled.div`
  background: white; border-radius: 14px; padding: 20px;
  display: flex; align-items: center; gap: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  border-left: 4px solid ${({ $color }) => $color};
`;
const SummaryIcon = styled.div`
  width: 44px; height: 44px; border-radius: 12px;
  background: ${({ $bg }) => $bg}15; color: ${({ $bg }) => $bg};
  display: flex; align-items: center; justify-content: center; font-size: 18px;
`;
const SummaryInfo = styled.div``;
const SummaryLabel = styled.p`
  font-size: 13px; color: ${({ theme }) => theme.colors.textSecondary}; font-weight: 500;
`;
const SummaryValue = styled.p`
  font-size: 22px; font-weight: 700; color: ${({ $color }) => $color};
  @media (max-width: 480px) { font-size: 18px; }
`;
const ChartsGrid = styled.div`
  display: grid; grid-template-columns: 1.3fr 1fr; gap: 16px; margin-bottom: 24px;
  @media (max-width: 768px) { grid-template-columns: 1fr; }
`;
const ChartTitle = styled.h3`
  font-size: 15px; font-weight: 600; margin-bottom: 16px;
  color: ${({ theme }) => theme.colors.text};
`;
const ChartWrap = styled.div`
  height: 280px; position: relative;
  @media (max-width: 480px) { height: 220px; }
`;
const BottomGrid = styled.div`
  display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px;
  @media (max-width: 1024px) { grid-template-columns: 1fr; }
`;
const AccountList = styled.div`
  display: flex; flex-direction: column; gap: 12px;
`;
const AccountItem = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 0; border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
  &:last-child { border-bottom: none; }
`;
const AccountInfo = styled.div`
  display: flex; align-items: center; gap: 10px;
`;
const AccountDot = styled.div`
  width: 10px; height: 10px; border-radius: 50%;
  background: ${({ $color }) => $color};
`;
const AccountName = styled.p`
  font-size: 14px; font-weight: 600;
`;
const AccountBank = styled.p`
  font-size: 12px; color: ${({ theme }) => theme.colors.textMuted};
`;
const AccountBalance = styled.p`
  font-size: 14px; font-weight: 700;
  color: ${({ $positive, theme }) => $positive ? theme.colors.success : theme.colors.danger};
`;
const TopExpensesList = styled.div`
  display: flex; flex-direction: column; gap: 10px;
`;
const TopExpenseItem = styled.div`
  display: flex; align-items: center; gap: 10px; font-size: 14px;
`;
const TopExpenseRank = styled.span`
  font-weight: 700; color: ${({ theme }) => theme.colors.textMuted}; min-width: 24px;
`;
const TopExpenseName = styled.span`
  flex: 1; font-weight: 500;
`;
const TopExpenseValue = styled.span`
  font-weight: 600; color: ${({ theme }) => theme.colors.danger};
`;
const TopExpensePct = styled.span`
  min-width: 48px; text-align: right;
`;
const RecentTxList = styled.div`
  display: flex; flex-direction: column; gap: 8px;
`;
const RecentTxItem = styled.div`
  display: flex; align-items: center; gap: 12px;
  padding: 8px 0; border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
  &:last-child { border-bottom: none; }
`;
const TxTypeIcon = styled.div`
  width: 32px; height: 32px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center; font-size: 12px;
  background: ${({ $type }) => $type === 'income' ? '#E6F9F3' : '#FDECEC'};
  color: ${({ $type }) => $type === 'income' ? '#00B894' : '#E74C3C'};
`;
const TxInfo = styled.div`
  flex: 1; min-width: 0;
`;
const TxDesc = styled.p`
  font-size: 13px; font-weight: 500; white-space: nowrap;
  overflow: hidden; text-overflow: ellipsis;
`;
const TxDate = styled.p`
  font-size: 11px; color: ${({ theme }) => theme.colors.textMuted};
`;
const TxAmount = styled.p`
  font-size: 13px; font-weight: 700; white-space: nowrap;
  color: ${({ $type }) => $type === 'income' ? '#00B894' : '#E74C3C'};
`;
