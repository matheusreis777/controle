import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  FaChartPie, FaExchangeAlt, FaTags, FaUniversity,
  FaCreditCard, FaWallet, FaBullseye, FaFileAlt,
  FaBars, FaTimes, FaSignOutAlt, FaChevronLeft,
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import styled from 'styled-components';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: <FaChartPie />, label: 'Dashboard' },
    { path: '/transactions', icon: <FaExchangeAlt />, label: 'Lançamentos' },
    { path: '/accounts', icon: <FaUniversity />, label: 'Contas' },
    { path: '/credit-cards', icon: <FaCreditCard />, label: 'Cartões' },
    { path: '/payment-methods', icon: <FaWallet />, label: 'Pagamento' },
    { path: '/tags', icon: <FaTags />, label: 'Tags' },
    { path: '/goals', icon: <FaBullseye />, label: 'Metas' },
    { path: '/reports', icon: <FaFileAlt />, label: 'Relatórios' },
  ];

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <MobileHeader>
        <MobileMenuBtn onClick={() => setMobileOpen(true)}>
          <FaBars />
        </MobileMenuBtn>
        <MobileTitle>Controle Financeiro</MobileTitle>
      </MobileHeader>

      {mobileOpen && <Overlay onClick={closeMobile} />}

      <SidebarContainer $collapsed={collapsed} $mobileOpen={mobileOpen}>
        <LogoArea $collapsed={collapsed}>
          {!collapsed && <LogoText>💰 FinControl</LogoText>}
          {collapsed && <LogoText>💰</LogoText>}
          <CollapseBtn onClick={() => setCollapsed(!collapsed)} className="desktop-only">
            <FaChevronLeft style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
          </CollapseBtn>
          <CloseBtn onClick={closeMobile} className="mobile-only">
            <FaTimes />
          </CloseBtn>
        </LogoArea>

        <Nav>
          {menuItems.map((item) => (
            <NavItem
              key={item.path}
              to={item.path}
              $active={location.pathname === item.path}
              $collapsed={collapsed}
              onClick={closeMobile}
            >
              <IconWrap>{item.icon}</IconWrap>
              {!collapsed && <span>{item.label}</span>}
            </NavItem>
          ))}
        </Nav>

        <UserArea $collapsed={collapsed}>
          {!collapsed && currentUser && (
            <UserInfo>
              <UserAvatar>{currentUser.name?.charAt(0).toUpperCase()}</UserAvatar>
              <UserName>{currentUser.name}</UserName>
            </UserInfo>
          )}
          <LogoutBtn onClick={logout} title="Sair">
            <FaSignOutAlt />
            {!collapsed && <span>Sair</span>}
          </LogoutBtn>
        </UserArea>
      </SidebarContainer>
    </>
  );
};

export default Sidebar;

const SidebarContainer = styled.aside`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: ${({ $collapsed }) => ($collapsed ? '70px' : '250px')};
  background: linear-gradient(180deg, #2D3436 0%, #1a1d1e 100%);
  color: white;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  z-index: 1000;
  overflow-x: hidden;

  .mobile-only { display: none; }
  .desktop-only { display: flex; }

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    width: 260px;
    transform: translateX(${({ $mobileOpen }) => ($mobileOpen ? '0' : '-100%')});
    transition: transform 0.3s ease;
    .mobile-only { display: flex; }
    .desktop-only { display: none; }
  }
`;

const Overlay = styled.div`
  display: none;
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
  }
`;

const MobileHeader = styled.div`
  display: none;
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    background: #2D3436;
    color: white;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 998;
    height: 56px;
  }
`;

const MobileMenuBtn = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  padding: 4px 8px;
  display: flex;
  align-items: center;
`;

const MobileTitle = styled.h1`
  font-size: 16px;
  margin-left: 12px;
  font-weight: 600;
`;

const LogoArea = styled.div`
  display: flex;
  align-items: center;
  justify-content: ${({ $collapsed }) => ($collapsed ? 'center' : 'space-between')};
  padding: 20px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  min-height: 64px;
`;

const LogoText = styled.span`
  font-size: 20px;
  font-weight: 700;
  white-space: nowrap;
`;

const CollapseBtn = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  padding: 4px;
  display: flex;
  align-items: center;
  &:hover { color: white; }
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 18px;
  padding: 4px;
  display: flex;
  align-items: center;
  &:hover { color: white; }
`;

const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  padding: 12px 8px;
  flex: 1;
  gap: 4px;
  overflow-y: auto;
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: ${({ $collapsed }) => ($collapsed ? '12px' : '10px 14px')};
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  justify-content: ${({ $collapsed }) => ($collapsed ? 'center' : 'flex-start')};
  text-decoration: none;

  ${({ $active }) =>
    $active &&
    `
    background: rgba(108, 99, 255, 0.3);
    color: white;
  `}

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
`;

const IconWrap = styled.span`
  display: flex;
  align-items: center;
  font-size: 18px;
  min-width: 18px;
`;

const UserArea = styled.div`
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: ${({ $collapsed }) => ($collapsed ? 'center' : 'stretch')};
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
`;

const UserName = styled.span`
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const LogoutBtn = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  padding: 6px 0;
  &:hover { color: #E74C3C; }
`;
