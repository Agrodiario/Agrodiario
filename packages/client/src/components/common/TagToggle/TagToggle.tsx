// src/components/common/TagToggle/TagToggle.tsx
import { ComponentPropsWithoutRef } from "react";
import styles from "./TagToggle.module.css";

// Recebe 'isActive' para saber se deve aplicar o estilo
type TagToggleProps = ComponentPropsWithoutRef<"button"> & {
  isActive: boolean;
  color: "red" | "blue" | "green" | "orange"; // Cores do design
};

export function TagToggle({
  children,
  isActive,
  color,
  ...props
}: TagToggleProps) {
  // Constrói as classes: base + cor + estado (ativo/inativo)
  const className = [
    styles.tag,
    styles[color],
    isActive ? styles.active : styles.inactive,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={className} {...props}>
      {children}
    </button>
  );
}
