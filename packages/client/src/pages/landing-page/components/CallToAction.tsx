import { Button } from "@/components/common/Button/Button";
import styles from "./CallToAction.module.css";
import ctaImage from "@/assets/cta.jpg";

export function CallToAction() {
  const handleSignup = () => {
    window.location.href = "/register";
  };
  return (
    <section className={styles.ctaSection}>
      <div className={styles.ctaBackground}>
        <img src={ctaImage} alt="CTA Background" className={styles.ctaImage} />
        <div className={styles.ctaOverlay}></div>
      </div>

      <div className={styles.ctaContent}>
        <h2 className={styles.ctaTitle}>
          Ganhe visibilidade e abra portas para créditos de carbono
        </h2>
        <p className={styles.ctaDescription}>
          Cadastre-se e registre suas ações de forma simples e organizada.
        </p>
        <Button variant='quaternary' onClick={handleSignup}>Criar minha conta</Button>
      </div>
    </section>
  );
}
