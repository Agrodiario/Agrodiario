// src/components/common/Drawer/Drawer.tsx
import { ReactNode, useEffect } from "react";
import styles from "./Drawer.module.css";
import { FiX } from "react-icons/fi";

type DrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

export function Drawer({ isOpen, onClose, title, children }: DrawerProps) {
  // Efeito para fechar o drawer com a tecla 'Esc'
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  // Não renderiza nada se estiver fechado
  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.container} aria-modal="true" role="dialog">
      {/* 1. Backdrop (fundo) */}
      <div className={styles.backdrop} onClick={onClose} />

      {/* 2. Painel Lateral */}
      <aside className={styles.drawerPanel}>
        <header className={styles.header}>
          <h2>{title}</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <FiX size={24} />
          </button>
        </header>
        {/* O 'children' (conteúdo) é renderizado aqui */}
        {children}
      </aside>
    </div>
  );
}
