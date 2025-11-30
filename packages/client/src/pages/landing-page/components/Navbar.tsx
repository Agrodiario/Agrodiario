import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import styles from './Navbar.module.css';
import logo from '@/assets/logo-grande.png';
import { Button } from '@/components/common/Button/Button';

// DEFINIÇÃO DAS PROPS
interface NavbarProps {
    activeSection: 'inicio' | 'sobre' | 'quem-somos' | 'parceiros';
    onNavigate: (section: string) => void;
}

// APLICAÇÃO DAS PROPS
export function Navbar({ activeSection, onNavigate }: NavbarProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navItems = [
        { id: 'inicio', label: 'Início' },
        { id: 'sobre', label: 'Sobre' },
        { id: 'quem-somos', label: 'Quem somos' },
        { id: 'parceiros', label: 'Parceiros' },
    ];

    const handleNavClick = (section: string) => {
        onNavigate(section);
        setMobileMenuOpen(false);
    };

    const handleSignup = () => {
        window.location.href = '/register';
    };

    const handleLogin = () => {
        window.location.href = '/login';
    };

    return (
        <>
            <nav className={styles.navbar}>
                <div className={styles.container}>
                    {/* Logo */}
                    <a href="/" className={styles.logo}>
                        <div className={styles.logoIcon}>
                            <img src={logo} alt="AgroDiário Logo" className={styles.logoImg} />
                        </div>
                    </a>

                    {/* Desktop Navigation */}
                    <div className={styles.navigation}>
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                className={`${styles.navLink} ${activeSection === item.id ? styles.active : ''
                                    }`}
                                onClick={() => handleNavClick(item.id)}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>

                    {/* Desktop Action Buttons */}
                    <div className={styles.actions}>
                        <Button variant='outlined' onClick={handleSignup}>
                            Criar uma conta
                        </Button>
                        <Button variant='primary' onClick={handleLogin}>
                            Entrar
                        </Button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className={styles.mobileMenuButton}
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className={styles.mobileMenu}>
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            className={`${styles.mobileNavLink} ${activeSection === item.id ? styles.active : ''
                                }`}
                            onClick={() => handleNavClick(item.id)}
                        >
                            {item.label}
                        </button>
                    ))}

                    <div className={styles.mobileActions}>
                        <Button variant='outlined' onClick={handleSignup}>
                            Criar uma conta
                        </Button>
                        <Button variant='primary' onClick={handleLogin}>
                            Entrar
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
}