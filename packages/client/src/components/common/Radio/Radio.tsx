// src/components/common/Radio/Radio.tsx
import { ComponentPropsWithoutRef } from "react";
import styles from "./Radio.module.css";

// Recebe todas as props de um <input type="radio">
type RadioProps = ComponentPropsWithoutRef<"input"> & {
  label: string;
};

export function Radio({ label, id, ...props }: RadioProps) {
  // Garante que o label aponte para o input
  const inputId = id || `radio-${props.name}-${props.value}`;

  return (
    <label htmlFor={inputId} className={styles.radioWrapper}>
      <input id={inputId} type="radio" className={styles.input} {...props} />
      {/* O 'span' é o círculo customizado */}
      <span className={styles.customRadio} />
      <span>{label}</span>
    </label>
  );
}
