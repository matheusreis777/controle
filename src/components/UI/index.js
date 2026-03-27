import styled, { css } from 'styled-components';

export const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

export const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
`;

export const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: 20px;
  }
`;

export const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radius.lg};
  box-shadow: 0 2px 8px ${({ theme }) => theme.colors.shadow};
  padding: ${({ $padding }) => $padding || '20px'};
  transition: ${({ theme }) => theme.transition};

  ${({ $hover }) =>
    $hover &&
    css`
      &:hover {
        box-shadow: 0 4px 16px ${({ theme }) => theme.colors.shadowDark};
        transform: translateY(-1px);
      }
    `}
`;

export const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
`;

export const CardTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

export const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: ${({ $size }) =>
    $size === 'sm' ? '6px 14px' : $size === 'lg' ? '14px 28px' : '10px 20px'};
  font-size: ${({ $size }) =>
    $size === 'sm' ? '13px' : $size === 'lg' ? '16px' : '14px'};
  font-weight: 600;
  border-radius: ${({ theme }) => theme.radius.md};
  transition: ${({ theme }) => theme.transition};
  border: none;
  white-space: nowrap;

  ${({ $variant, theme }) => {
    switch ($variant) {
      case 'danger':
        return css`
          background: ${theme.colors.danger};
          color: white;
          &:hover { background: #c0392b; }
        `;
      case 'success':
        return css`
          background: ${theme.colors.success};
          color: white;
          &:hover { background: #00a381; }
        `;
      case 'outline':
        return css`
          background: transparent;
          color: ${theme.colors.primary};
          border: 1.5px solid ${theme.colors.primary};
          &:hover { background: ${theme.colors.primary}10; }
        `;
      case 'ghost':
        return css`
          background: transparent;
          color: ${theme.colors.textSecondary};
          &:hover { background: ${theme.colors.borderLight}; color: ${theme.colors.text}; }
        `;
      default:
        return css`
          background: ${theme.colors.primary};
          color: white;
          &:hover { background: ${theme.colors.primaryDark}; }
        `;
    }
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const Input = styled.input`
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: 14px;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  transition: ${({ theme }) => theme.transition};

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: 14px;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  transition: ${({ theme }) => theme.transition};
  cursor: pointer;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
  }
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: 14px;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  resize: vertical;
  min-height: 80px;
  transition: ${({ theme }) => theme.transition};

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
  }
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
`;

export const Label = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const FormRow = styled.div`
  display: grid;
  grid-template-columns: ${({ $cols }) => $cols || '1fr 1fr'};
  gap: 16px;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`;

export const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: ${({ $color }) => $color || '#6C63FF'}20;
  color: ${({ $color }) => $color || '#6C63FF'};
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 48px 24px;
  color: ${({ theme }) => theme.colors.textMuted};

  svg {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }

  p {
    font-size: 15px;
    margin-top: 8px;
  }
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(${({ $min }) => $min || '280px'}, 1fr));
  gap: ${({ $gap }) => $gap || '16px'};
`;

export const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${({ theme }) => theme.colors.borderLight};
  margin: ${({ $margin }) => $margin || '16px 0'};
`;

export const Chip = styled.button`
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  border: 1.5px solid ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.border};
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primary + '15' : 'transparent'};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.textSecondary};
  transition: ${({ theme }) => theme.transition};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
  }
`;
