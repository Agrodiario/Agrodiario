import { Button } from "@/components/common/Button/Button";
import styles from "./Header.module.css";
import background from '@/assets/background.jpg';

export function Header() {
  const handleSignup = () => {
    window.location.href = "/register";
  };

  return (
    <header id="inicio" className={styles.header}>
      {/* Imagem de fundo + overlay */}
      <div className={styles.background}>
        <img
          src={background}
          alt="Agrodiário Background"
          className={styles.image}
        />
        <div className={styles.overlay}></div>
      </div>

      {/* Conteúdo */}
      <div className={styles.content}>
        <h1 className={styles.title}>
          🌱 Transforme o esforço da sua propriedade rural em valor real
        </h1>

        <p className={styles.subtitle}>
          Nós somos um diário digital voltado para agricultores familiares
          registrarem ações sustentáveis.
        </p>

        <Button variant='quaternary' onClick={handleSignup}>
          Cadastre-se agora!
        </Button>
      </div>
    </header>
  );
}
