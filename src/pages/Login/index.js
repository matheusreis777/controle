import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { login, register } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isLogin) {
      const result = login(email, password);
      if (!result.success) toast.error(result.message);
    } else {
      if (!name.trim()) return toast.error('Informe seu nome.');
      if (!email.trim()) return toast.error('Informe seu e-mail.');
      if (password.length < 4) return toast.error('Senha deve ter pelo menos 4 caracteres.');
      if (password !== confirmPassword) return toast.error('As senhas não conferem.');
      const result = register(name, email, password);
      if (!result.success) toast.error(result.message);
      else toast.success('Conta criada com sucesso!');
    }
  };

  return (
    <Container>
      <FormCard>
        <Logo>💰 FinControl</Logo>
        <Subtitle>
          {isLogin ? 'Faça login para continuar' : 'Crie sua conta gratuita'}
        </Subtitle>

        <Form onSubmit={handleSubmit}>
          {!isLogin && (
            <InputGroup>
              <InputLabel>Nome</InputLabel>
              <InputField
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </InputGroup>
          )}

          <InputGroup>
            <InputLabel>E-mail</InputLabel>
            <InputField
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </InputGroup>

          <InputGroup>
            <InputLabel>Senha</InputLabel>
            <InputField
              type="password"
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </InputGroup>

          {!isLogin && (
            <InputGroup>
              <InputLabel>Confirmar Senha</InputLabel>
              <InputField
                type="password"
                placeholder="Confirme sua senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </InputGroup>
          )}

          <SubmitBtn type="submit">
            {isLogin ? 'Entrar' : 'Criar Conta'}
          </SubmitBtn>
        </Form>

        <Toggle>
          {isLogin ? 'Não tem conta? ' : 'Já tem conta? '}
          <ToggleLink onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Criar conta' : 'Fazer login'}
          </ToggleLink>
        </Toggle>
      </FormCard>
    </Container>
  );
};

export default Login;

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #6C63FF 0%, #3F3D56 100%);
  padding: 16px;
`;

const FormCard = styled.div`
  background: white;
  padding: 40px;
  border-radius: 20px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);

  @media (max-width: 480px) {
    padding: 28px 20px;
  }
`;

const Logo = styled.h1`
  text-align: center;
  font-size: 28px;
  margin-bottom: 8px;
  color: #2D3436;
`;

const Subtitle = styled.p`
  text-align: center;
  color: #636E72;
  font-size: 14px;
  margin-bottom: 32px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const InputGroup = styled.div`
  margin-bottom: 16px;
`;

const InputLabel = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #636E72;
  margin-bottom: 6px;
`;

const InputField = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1.5px solid #E1E5EE;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.2s;
  box-sizing: border-box;

  &:focus {
    border-color: #6C63FF;
    box-shadow: 0 0 0 3px rgba(108, 99, 255, 0.15);
    outline: none;
  }
`;

const SubmitBtn = styled.button`
  width: 100%;
  padding: 14px;
  background: #6C63FF;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 8px;

  &:hover {
    background: #5A52D5;
  }
`;

const Toggle = styled.p`
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: #636E72;
`;

const ToggleLink = styled.span`
  color: #6C63FF;
  font-weight: 600;
  cursor: pointer;
  &:hover { text-decoration: underline; }
`;
