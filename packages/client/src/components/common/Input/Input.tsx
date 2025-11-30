import { ComponentPropsWithoutRef, ReactNode } from 'react';
import styles from './Input.module.css';

// Definimos o tipo para as opções do select
export type SelectOption = {
  label: string;
  value: string | number;
};

// Props agora aceitam 'select' e 'options'
type InputProps = ComponentPropsWithoutRef<'input'> &
  ComponentPropsWithoutRef<'textarea'> &
  ComponentPropsWithoutRef<'select'> & {
    as?: 'input' | 'textarea' | 'select';
    label: string;
    icon?: ReactNode;
    onIconClick?: () => void;
    options?: SelectOption[]; // Novo array de opções
  };

export function Input({
  as = 'input',
  label,
  icon,
  onIconClick,
  options,
  className,
  ...props
}: InputProps) {
  let InputElement;

  // Classes condicionais
  const wrapperClass = `${styles.inputWrapper} ${
    as === 'textarea' ? styles.textareaWrapper : ''
  } ${className || ''}`;

  const inputClass = `${styles.input} ${
    as === 'textarea' ? styles.textarea : ''
  } ${as === 'select' ? styles.select : ''}`;

  // 1. Renderização condicional para TEXTAREA
  if (as === 'textarea') {
    InputElement = (
      <textarea
        className={inputClass}
        placeholder={label}
        {...(props as ComponentPropsWithoutRef<'textarea'>)}
        rows={props.rows || 4}
      />
    );
  } 
  // 2. Renderização condicional para SELECT (Novo)
  else if (as === 'select') {
    InputElement = (
      <select
        className={inputClass}
        // O value="" serve como placeholder no select
        {...(props as ComponentPropsWithoutRef<'select'>)}
      >
        <option value="" disabled hidden>
          {label} {/* Usa o label como placeholder */}
        </option>
        {options?.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  } 
  // 3. Padrão INPUT
  else {
    InputElement = (
      <input
        className={inputClass}
        placeholder={label} // No type="date", o placeholder pode não aparecer em alguns browsers
        {...(props as ComponentPropsWithoutRef<'input'>)}
      />
    );
  }

  return (
    <div className={wrapperClass}>
      {InputElement}
      {icon && (
        <span onClick={onIconClick} className={styles.icon}>
          {icon}
        </span>
      )}
    </div>
  );
}