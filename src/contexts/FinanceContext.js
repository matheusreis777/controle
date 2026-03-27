import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { getFromStorage, saveToStorage, storageKeys } from '../utils/storage';
import { generateId } from '../utils/formatters';
import { DEFAULT_TAGS, DEFAULT_PAYMENT_METHODS } from '../utils/constants';

const FinanceContext = createContext();

export const useFinance = () => {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider');
  return ctx;
};

const initState = (key, defaultVal) => getFromStorage(key) || defaultVal;

export const FinanceProvider = ({ children }) => {
  const [transactions, setTransactions] = useState(() =>
    initState(storageKeys.TRANSACTIONS, [])
  );
  const [tags, setTags] = useState(() =>
    initState(storageKeys.TAGS, DEFAULT_TAGS)
  );
  const [accounts, setAccounts] = useState(() =>
    initState(storageKeys.ACCOUNTS, [])
  );
  const [paymentMethods, setPaymentMethods] = useState(() =>
    initState(storageKeys.PAYMENT_METHODS, DEFAULT_PAYMENT_METHODS)
  );
  const [creditCards, setCreditCards] = useState(() =>
    initState(storageKeys.CREDIT_CARDS, [])
  );
  const [goals, setGoals] = useState(() =>
    initState(storageKeys.GOALS, [])
  );

  // === TRANSACTIONS ===
  const persist = (key, data) => saveToStorage(key, data);

  const addTransaction = useCallback((transaction) => {
    const newTx = {
      ...transaction,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };

    // Handle installments for credit card
    if (transaction.creditCardId && transaction.installments > 1) {
      const txList = [];
      const monthlyAmount = +(transaction.amount / transaction.installments).toFixed(2);
      for (let i = 0; i < transaction.installments; i++) {
        const date = new Date(transaction.date);
        date.setMonth(date.getMonth() + i);
        txList.push({
          ...newTx,
          id: generateId(),
          amount: monthlyAmount,
          date: date.toISOString().split('T')[0],
          installmentNumber: i + 1,
          installmentTotal: transaction.installments,
          parentId: newTx.id,
          description: `${transaction.description} (${i + 1}/${transaction.installments})`,
        });
      }
      setTransactions((prev) => {
        const updated = [...prev, ...txList];
        persist(storageKeys.TRANSACTIONS, updated);
        return updated;
      });
      return txList;
    }

    setTransactions((prev) => {
      const updated = [...prev, newTx];
      persist(storageKeys.TRANSACTIONS, updated);
      return updated;
    });
    return newTx;
  }, []);

  const updateTransaction = useCallback((id, data) => {
    setTransactions((prev) => {
      const updated = prev.map((t) => (t.id === id ? { ...t, ...data } : t));
      persist(storageKeys.TRANSACTIONS, updated);
      return updated;
    });
  }, []);

  const deleteTransaction = useCallback((id) => {
    setTransactions((prev) => {
      const tx = prev.find(t => t.id === id);
      let updated;
      if (tx && tx.parentId) {
        updated = prev.filter((t) => t.parentId !== tx.parentId);
      } else {
        updated = prev.filter((t) => t.id !== id && t.parentId !== id);
      }
      persist(storageKeys.TRANSACTIONS, updated);
      return updated;
    });
  }, []);

  const importTransactions = useCallback((txList) => {
    setTransactions((prev) => {
      const updated = [...prev, ...txList];
      persist(storageKeys.TRANSACTIONS, updated);
      return updated;
    });
  }, []);

  // === TAGS ===
  const addTag = useCallback((tag) => {
    const newTag = { ...tag, id: generateId() };
    setTags((prev) => {
      const updated = [...prev, newTag];
      persist(storageKeys.TAGS, updated);
      return updated;
    });
    return newTag;
  }, []);

  const updateTag = useCallback((id, data) => {
    setTags((prev) => {
      const updated = prev.map((t) => (t.id === id ? { ...t, ...data } : t));
      persist(storageKeys.TAGS, updated);
      return updated;
    });
  }, []);

  const deleteTag = useCallback((id) => {
    setTags((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      persist(storageKeys.TAGS, updated);
      return updated;
    });
  }, []);

  // === ACCOUNTS ===
  const addAccount = useCallback((account) => {
    const newAcc = { ...account, id: generateId() };
    setAccounts((prev) => {
      const updated = [...prev, newAcc];
      persist(storageKeys.ACCOUNTS, updated);
      return updated;
    });
    return newAcc;
  }, []);

  const updateAccount = useCallback((id, data) => {
    setAccounts((prev) => {
      const updated = prev.map((a) => (a.id === id ? { ...a, ...data } : a));
      persist(storageKeys.ACCOUNTS, updated);
      return updated;
    });
  }, []);

  const deleteAccount = useCallback((id) => {
    setAccounts((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      persist(storageKeys.ACCOUNTS, updated);
      return updated;
    });
  }, []);

  // === PAYMENT METHODS ===
  const addPaymentMethod = useCallback((pm) => {
    const newPM = { ...pm, id: generateId() };
    setPaymentMethods((prev) => {
      const updated = [...prev, newPM];
      persist(storageKeys.PAYMENT_METHODS, updated);
      return updated;
    });
    return newPM;
  }, []);

  const updatePaymentMethod = useCallback((id, data) => {
    setPaymentMethods((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, ...data } : p));
      persist(storageKeys.PAYMENT_METHODS, updated);
      return updated;
    });
  }, []);

  const deletePaymentMethod = useCallback((id) => {
    setPaymentMethods((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      persist(storageKeys.PAYMENT_METHODS, updated);
      return updated;
    });
  }, []);

  // === CREDIT CARDS ===
  const addCreditCard = useCallback((card) => {
    const newCard = { ...card, id: generateId() };
    setCreditCards((prev) => {
      const updated = [...prev, newCard];
      persist(storageKeys.CREDIT_CARDS, updated);
      return updated;
    });
    return newCard;
  }, []);

  const updateCreditCard = useCallback((id, data) => {
    setCreditCards((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, ...data } : c));
      persist(storageKeys.CREDIT_CARDS, updated);
      return updated;
    });
  }, []);

  const deleteCreditCard = useCallback((id) => {
    setCreditCards((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      persist(storageKeys.CREDIT_CARDS, updated);
      return updated;
    });
  }, []);

  // === GOALS ===
  const addGoal = useCallback((goal) => {
    const newGoal = { ...goal, id: generateId(), createdAt: new Date().toISOString() };
    setGoals((prev) => {
      const updated = [...prev, newGoal];
      persist(storageKeys.GOALS, updated);
      return updated;
    });
    return newGoal;
  }, []);

  const updateGoal = useCallback((id, data) => {
    setGoals((prev) => {
      const updated = prev.map((g) => (g.id === id ? { ...g, ...data } : g));
      persist(storageKeys.GOALS, updated);
      return updated;
    });
  }, []);

  const deleteGoal = useCallback((id) => {
    setGoals((prev) => {
      const updated = prev.filter((g) => g.id !== id);
      persist(storageKeys.GOALS, updated);
      return updated;
    });
  }, []);

  // === COMPUTED VALUES ===
  const getAccountBalance = useCallback((accountId) => {
    const account = accounts.find(a => a.id === accountId);
    const initialBalance = account ? parseFloat(account.initialBalance || 0) : 0;
    const txs = transactions.filter(t => t.accountId === accountId);
    const balance = txs.reduce((acc, t) => {
      return t.type === 'income' ? acc + parseFloat(t.amount) : acc - parseFloat(t.amount);
    }, initialBalance);
    return balance;
  }, [transactions, accounts]);

  const totalBalance = useMemo(() => {
    return accounts.reduce((acc, account) => {
      return acc + getAccountBalance(account.id);
    }, 0);
  }, [accounts, getAccountBalance]);

  const getCreditCardUsed = useCallback((cardId) => {
    const txs = transactions.filter(
      (t) => t.creditCardId === cardId && t.type === 'expense'
    );
    return txs.reduce((acc, t) => acc + parseFloat(t.amount), 0);
  }, [transactions]);

  const getFilteredTransactions = useCallback((filters = {}) => {
    let result = [...transactions];

    if (filters.startDate) {
      result = result.filter((t) => t.date >= filters.startDate);
    }
    if (filters.endDate) {
      result = result.filter((t) => t.date <= filters.endDate);
    }
    if (filters.type) {
      result = result.filter((t) => t.type === filters.type);
    }
    if (filters.accountId) {
      result = result.filter((t) => t.accountId === filters.accountId);
    }
    if (filters.paymentMethodId) {
      result = result.filter((t) => t.paymentMethodId === filters.paymentMethodId);
    }
    if (filters.creditCardId) {
      result = result.filter((t) => t.creditCardId === filters.creditCardId);
    }
    if (filters.tags && filters.tags.length > 0) {
      result = result.filter((t) =>
        t.tags && t.tags.some((tag) => filters.tags.includes(tag))
      );
    }
    if (filters.search) {
      const s = filters.search.toLowerCase();
      result = result.filter((t) =>
        t.description && t.description.toLowerCase().includes(s)
      );
    }

    result.sort((a, b) => {
      if (b.date !== a.date) return b.date.localeCompare(a.date);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return result;
  }, [transactions]);

  const value = {
    transactions,
    tags,
    accounts,
    paymentMethods,
    creditCards,
    goals,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    importTransactions,
    addTag,
    updateTag,
    deleteTag,
    addAccount,
    updateAccount,
    deleteAccount,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    addCreditCard,
    updateCreditCard,
    deleteCreditCard,
    addGoal,
    updateGoal,
    deleteGoal,
    getAccountBalance,
    totalBalance,
    getCreditCardUsed,
    getFilteredTransactions,
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
};
