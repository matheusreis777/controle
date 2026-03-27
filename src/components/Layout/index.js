import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar';
import styled from 'styled-components';

const Layout = () => {
  return (
    <Container>
      <Sidebar />
      <Main>
        <Outlet />
      </Main>
    </Container>
  );
};

export default Layout;

const Container = styled.div`
  display: flex;
  min-height: 100vh;
`;

const Main = styled.main`
  flex: 1;
  margin-left: 250px;
  padding: 24px;
  min-height: 100vh;
  transition: margin-left 0.3s ease;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    margin-left: 0;
    padding: 16px;
    padding-top: 72px;
  }
`;
