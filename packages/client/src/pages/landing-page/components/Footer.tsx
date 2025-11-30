import { IconMail, IconMapPin } from "@tabler/icons-react";
import styles from "./Footer.module.css";
import logo from "@/assets/logo-grande.png";

export function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.footerContent}>

                {/* Logo */}
                <div className={styles.footerSection}>
                    <div className={styles.footerLogo}>
                        <img src={logo} alt="AgroDiário" />
                    </div>
                </div>

                {/* Menu */}
                <div className={styles.footerSection}>
                    <ul className={styles.footerLinks}>
                        <li><a href="#inicio">Início</a></li>
                        <li><a href="#sobre">Sobre</a></li>
                        <li><a href="#quem-somos">Quem somos</a></li>
                    </ul>
                </div>

                <div className={styles.footerSection}>
                    <p className={styles.footerText}>
                        <IconMail size={20} />
                        <a href="mailto:agrodiario@email.com">agrodiario@email.com</a>
                    </p>

                    <p className={styles.footerText}>
                        <IconMapPin size={30} />
                        Instituto de Matemática e Estatística — Universidade de São Paulo (IME-USP)
                    </p>
                </div>
            </div>

            <div className={styles.footerBottom}>
                <p className={styles.footerCopyright}>
                    © 2025 Agrodiário. Todos os direitos reservados.
                </p>
            </div>
        </footer>
    );
}
