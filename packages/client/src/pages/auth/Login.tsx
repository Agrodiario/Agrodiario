// src/pages/auth/Login.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

// Importa os componentes reutilizáveis
import { Button } from '../../components/common/Button/Button';
import { Input } from '../../components/common/Input/Input';
import { useAuth } from '../../contexts/AuthContext';

// Importa os assets
import loginImage from '../../assets/login-image.jpg';
import logo from '../../assets/logo.png';

// Importa o CSS da página
import styles from './Login.module.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Preencha email e senha');
      return;
    }

    try {
      await login({ email, password, rememberMe });
      navigate('/app');
    } catch (err: any) {
      console.error('Erro no login:', err);
      setError(err.message || 'Erro ao fazer login. Verifique suas credenciais.');
    }
  };

  return (
    <div className={styles.loginPage}>
      {/* Coluna da Imagem (Esquerda) */}
      <div
        className={styles.imageColumn}
        style={{ backgroundImage: `url(${loginImage})` }}
      />

      {/* Coluna do Formulário (Direita) */}
      <div className={styles.formColumn}>
        <div className={styles.formCard}>
            <div className={styles.logoContainer}>
                <img src={logo} alt="AgroDiário Logo" className={styles.logo} />
            </div>

          <h2 className={styles.title}>Entre na sua conta</h2>
          
          <p className={styles.subtitle}>
            Não tem uma conta?{' '}
            <Link to="/register" className={styles.link}>
              Cadastre-se agora.
            </Link>
          </p>

          <form onSubmit={handleLogin} className={styles.form}>
            {error && (
              <div style={{
                padding: '12px',
                backgroundColor: '#fee',
                color: '#c33',
                borderRadius: '4px',
                marginBottom: '16px',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}

            <Input
              label="Seu e-mail"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />

            <Input
              label="Sua senha"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              required
              icon={showPassword ? <FaEyeSlash /> : <FaEye />}
              onIconClick={() => setShowPassword(!showPassword)}
            />

            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ marginRight: '8px' }}
              />
              <label htmlFor="rememberMe" style={{ fontSize: '14px', cursor: 'pointer' }}>
                Lembrar de mim (30 dias)
              </label>
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}