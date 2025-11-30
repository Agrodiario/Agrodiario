// src/pages/auth/ResetPassword.tsx
import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

import { Button } from '../../components/common/Button/Button';
import { Input } from '../../components/common/Input/Input';
import { authService } from '../../services/auth.service';

import loginImage from '../../assets/login-image.jpg';
import logo from '../../assets/logo.png';

import styles from './Login.module.css';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Link de recuperação inválido. Solicite um novo link.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Link de recuperação inválido. Solicite um novo link.');
      return;
    }

    if (!password || !confirmPassword) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    setIsLoading(true);

    try {
      await authService.resetPassword(token, password);
      setSuccess(true);
    } catch (err: any) {
      console.error('Erro ao redefinir senha:', err);
      if (err.message?.includes('expired') || err.message?.includes('invalid')) {
        setError('Link expirado ou inválido. Solicite um novo link de recuperação.');
      } else {
        setError(err.message || 'Erro ao redefinir senha. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <div
        className={styles.imageColumn}
        style={{ backgroundImage: `url(${loginImage})` }}
      />

      <div className={styles.formColumn}>
        <div className={styles.formCard}>
          <div className={styles.logoContainer}>
            <img src={logo} alt="AgroDiário Logo" className={styles.logo} />
          </div>

          <h2 className={styles.title}>Redefinir Senha</h2>

          {!success ? (
            <>
              <p className={styles.subtitle}>
                Digite sua nova senha abaixo.
              </p>

              <form onSubmit={handleSubmit} className={styles.form}>
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
                    {(error.includes('expirado') || error.includes('inválido')) && (
                      <p style={{ margin: '8px 0 0 0' }}>
                        <Link to="/forgot-password" className={styles.link}>
                          Solicitar novo link
                        </Link>
                      </p>
                    )}
                  </div>
                )}

                <Input
                  label="Nova senha"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                  onIconClick={() => setShowPassword(!showPassword)}
                />

                <Input
                  label="Confirmar nova senha"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a senha"
                  required
                  icon={showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  onIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
                />

                <Button type="submit" disabled={isLoading || !token}>
                  {isLoading ? 'Redefinindo...' : 'Redefinir Senha'}
                </Button>

                <p style={{ textAlign: 'center', marginTop: '16px' }}>
                  <Link to="/login" className={styles.link}>
                    Voltar para o login
                  </Link>
                </p>
              </form>
            </>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                padding: '16px',
                backgroundColor: '#e6f7ed',
                color: '#008542',
                borderRadius: '8px',
                marginBottom: '24px',
                fontSize: '14px'
              }}>
                <strong>Senha redefinida com sucesso!</strong>
                <p style={{ margin: '8px 0 0 0' }}>
                  Você já pode fazer login com sua nova senha.
                </p>
              </div>

              <Button onClick={() => navigate('/login')}>
                Ir para o login
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
