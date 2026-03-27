import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import GlobalStyle from './styles/global';
import theme from './styles/theme';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { FinanceProvider } from './contexts/FinanceContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Tags from './pages/Tags';
import Accounts from './pages/Accounts';
import PaymentMethods from './pages/PaymentMethods';
import CreditCards from './pages/CreditCards';
import Goals from './pages/Goals';
import Reports from './pages/Reports';

const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? <Navigate to="/" /> : children;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
    <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
      <Route path="/" element={<Dashboard />} />
      <Route path="/transactions" element={<Transactions />} />
      <Route path="/tags" element={<Tags />} />
      <Route path="/accounts" element={<Accounts />} />
      <Route path="/payment-methods" element={<PaymentMethods />} />
      <Route path="/credit-cards" element={<CreditCards />} />
      <Route path="/goals" element={<Goals />} />
      <Route path="/reports" element={<Reports />} />
    </Route>
    <Route path="*" element={<Navigate to="/" />} />
  </Routes>
);

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <FinanceProvider>
          <BrowserRouter>
            <GlobalStyle />
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              closeOnClick
              pauseOnHover
              theme="colored"
            />
            <AppRoutes />
          </BrowserRouter>
        </FinanceProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;