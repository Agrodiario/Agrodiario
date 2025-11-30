import { Button } from "@/components/common/Button/Button";
import styles from "./About.module.css";
import macbook from '@/assets/macbook-mockup.png';

export function About() {
    const handleSignup = () => {
        window.location.href = "/register";
    };

    return (
        <section id="sobre" className={styles.about}>
            <div className={styles.aboutContent}>
                <div className={styles.aboutImage}>
                    <img src={macbook} alt="Macbook Mockup" />
                </div>

                <div className={styles.aboutText}>
                    <h2 className={styles.aboutTitle}>Conheça nossa proposta</h2>

                    <p className={styles.aboutDescription}>
                        O Agrodiário é um diário digital criado para agricultores registrarem
                        suas práticas sustentáveis, como manejo do solo, reflorestamento e ações
                        de conservação. Com esses registros, você forma um portfólio ambiental
                        organizado, facilitando o acesso a créditos de carbono e outras certificações.
                    </p>

                    <Button variant='primary' onClick={handleSignup}>Cadastre-se agora</Button>
                </div>
            </div>
        </section>
    );
}
