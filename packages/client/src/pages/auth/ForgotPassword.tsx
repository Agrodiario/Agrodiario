// src/pages/auth/ForgotPassword.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '../../components/common/Button/Button';
import { Input } from '../../components/common/Input/Input';
import { authService } from '../../services/auth.service';

import loginImage from '../../assets/login-image.jpg';
import logo from '../../assets/logo.png';

import styles from './Login.module.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError('Por favor, informe seu email');
      return;
    }

    setIsLoading(true);

    try {
      await authService.forgotPassword(email);
      setSuccess(true);
    } catch (err: any) {
      console.error('Erro ao solicitar recuperação:', err);
      setError(err.message || 'Erro ao processar solicitação. Tente novamente.');
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

          <h2 className={styles.title}>Recuperar Senha</h2>

          {!success ? (
            <>
              <p className={styles.subtitle}>
                Informe seu email e enviaremos um link para redefinir sua senha.
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

                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Enviando...' : 'Enviar Link de Recuperação'}
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
                <strong>Email enviado!</strong>
                <p style={{ margin: '8px 0 0 0' }}>
                  Se o email estiver cadastrado, você receberá um link para redefinir sua senha.
                </p>
              </div>

              <p className={styles.subtitle}>
                Não recebeu o email? Verifique sua pasta de spam ou{' '}
                <button
                  type="button"
                  onClick={() => setSuccess(false)}
                  className={styles.link}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  tente novamente
                </button>
              </p>

              <p style={{ marginTop: '24px' }}>
                <Link to="/login" className={styles.link}>
                  Voltar para o login
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
