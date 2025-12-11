// src/components/common/FileInput/FileInput.tsx
import { ComponentPropsWithoutRef, ReactNode } from "react";
import styles from "./FileInput.module.css";

type FileInputProps = ComponentPropsWithoutRef<"input"> & {
  leftIcon: ReactNode;
  children: ReactNode;
};

export function FileInput({
  leftIcon,
  children,
  id,
  ...props
}: FileInputProps) {
  const inputId = id || "file-input";

  return (
    // O Label se parece com um botão (variant 'tertiary')
    <label htmlFor={inputId} className={styles.fileLabel}>
      <span className={styles.icon}>{leftIcon}</span>
      {children}
      <input id={inputId} type="file" className={styles.fileInput} {...props} />
    </label>
  );
}
