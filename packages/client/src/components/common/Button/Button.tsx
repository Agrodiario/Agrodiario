// src/components/common/Button/Button.tsx
import { ComponentPropsWithoutRef, ReactNode } from 'react';
import styles from './Button.module.css';

// Adicionamos 'variant' e 'leftIcon'
type ButtonProps = ComponentPropsWithoutRef<'button'> & {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'quaternary' | 'danger' | 'outlined';
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

export function Button({
  children,
  variant = 'primary', // 'primary' é o padrão
  leftIcon,
  rightIcon,
  className: propClassName, // Renomeia para evitar conflito
  ...props
}: ButtonProps) {
  // Combina a classe base, a variante e classes customizadas (se houver)
  const className = [
    styles.button,
    styles[variant], // Aplica o estilo da variante (ex: styles.secondary)
    propClassName,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={className} {...props}>
      {leftIcon && <span className={styles.icon}>{leftIcon}</span>}
      {children}
      {rightIcon && <span className={styles.icon}>{rightIcon}</span>}
    </button>
  );
}