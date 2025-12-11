// src/components/common/ConfirmationModal/ConfirmationModal.tsx
import { ReactNode, useEffect } from "react";
import styles from "./ConfirmationModal.module.css";
import { Button } from "../Button/Button";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: ReactNode;
};

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
}: ModalProps) {
  // Efeito para fechar com 'Esc'
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

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.container} role="alertdialog" aria-modal="true">
      {/* Este é o backdrop (fundo escuro). 
        Seguindo a imagem, ele existe e escurece tudo.
        A sua menção a "fundo transparente" provavelmente
        se referia a "translucidez" (rgba), que é o que
        faremos aqui. 
      */}
      <div className={styles.backdrop} onClick={onClose} />

      {/* O card do modal */}
      <div className={styles.modalCard}>
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.body}>{children}</div>
        <footer className={styles.footer}>
          <Button variant="tertiary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Sim, excluir
          </Button>
        </footer>
      </div>
    </div>
  );
}
