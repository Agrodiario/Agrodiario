// src/pages/auth/Login.tsx - Versão atualizada
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

interface ValidationErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState({ email: false, password: false });

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'email':
        if (!value) return 'E-mail é obrigatório';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'E-mail inválido';
        return '';
      
      case 'password':
        if (!value) return 'Senha é obrigatória';
        if (value.length < 6) return 'Senha deve ter pelo menos 6 caracteres';
        return '';
      
      default:
        return '';
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {
      email: validateField('email', email),
      password: validateField('password', password),
    };

    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    const error = validateField(field, field === 'email' ? email : password);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Marca todos os campos como tocados para mostrar todos os erros
    setTouched({ email: true, password: true });
    
    if (!validateForm()) {
      return;
    }

    try {
      await login({ email, password, rememberMe });
      navigate('/app');
    } catch (err: any) {
      console.error('Erro no login:', err);
      
      // Tratamento de erros específicos da API
      if (err.response?.status === 401) {
        setErrors({
          general: 'E-mail ou senha incorretos. Verifique suas credenciais.'
        });
      } else if (err.response?.status === 403) {
        setErrors({
          general: 'Conta inativa ou não verificada. Verifique seu e-mail.'
        });
      } else if (err.response?.status >= 500) {
        setErrors({
          general: 'Serviço indisponível. Tente novamente mais tarde.'
        });
      } else {
        setErrors({
          general: err.message || 'Erro ao fazer login. Tente novamente.'
        });
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === 'email') {
      setEmail(value);
    } else {
      setPassword(value);
    }

    // Limpa o erro do campo quando o usuário começa a digitar
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Limpa erro geral quando o usuário interage com o form
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: '' }));
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
            {errors.general && (
              <div style={{
                padding: '12px',
                backgroundColor: '#fed7d7',
                color: '#c53030',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '14px',
                border: '1px solid #feb2b2'
              }}>
                {errors.general}
              </div>
            )}

            <Input
              label="Seu e-mail"
              type="email"
              name="email"
              value={email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              placeholder="seu@email.com"
              required
              error={errors.email}
              showError={!!errors.email}
            />

            <Input
              label="Sua senha"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              onBlur={() => handleBlur('password')}
              placeholder="Digite sua senha"
              required
              icon={showPassword ? <FaEyeSlash /> : <FaEye />}
              onIconClick={() => setShowPassword(!showPassword)}
              error={errors.password}
              showError={!!errors.password}
            />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
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
              <Link to="/forgot-password" className={styles.link} style={{ fontSize: '14px' }}>
                Esqueceu a senha?
              </Link>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading || (touched.email && !!errors.email) || (touched.password && !!errors.password)}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}