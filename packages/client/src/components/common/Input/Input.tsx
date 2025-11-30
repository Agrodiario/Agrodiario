// Input.tsx - Versão atualizada
import { ComponentPropsWithoutRef, ReactNode } from 'react';
import styles from './Input.module.css';

export type SelectOption = {
  label: string;
  value: string | number;
};

type InputBaseProps = {
  label: string;
  icon?: ReactNode;
  onIconClick?: () => void;
  className?: string;
  error?: string;
  showError?: boolean;
};

type InputAsInput = InputBaseProps &
  ComponentPropsWithoutRef<'input'> & {
    as?: 'input';
  };

type InputAsTextarea = InputBaseProps &
  ComponentPropsWithoutRef<'textarea'> & {
    as: 'textarea';
  };

type InputAsSelect = InputBaseProps &
  ComponentPropsWithoutRef<'select'> & {
    as: 'select';
    options: SelectOption[];
  };

type InputProps = InputAsInput | InputAsTextarea | InputAsSelect;

export function Input({ 
  as = 'input', 
  label, 
  icon, 
  onIconClick, 
  className, 
  error,
  showError,
  ...props 
}: InputProps) {
  const wrapperClass = `${styles.inputWrapper} ${
    as === 'textarea' ? styles.textareaWrapper : ''
  } ${error && showError ? styles.error : ''} ${className || ''}`;

  const inputClass = `${styles.input} ${
    as === 'textarea' ? styles.textarea : ''
  } ${as === 'select' ? styles.select : ''}`;

  let InputElement;

  if (as === 'textarea') {
    InputElement = (
      <textarea
        className={inputClass}
        placeholder={label}
        {...(props as ComponentPropsWithoutRef<'textarea'>)}
      />
    );
  } else if (as === 'select') {
    const { options, ...rest } = props as InputAsSelect;

    InputElement = (
      <select className={inputClass} {...rest}>
        <option value="" disabled hidden>
          {label}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  } else {
    InputElement = (
      <input
        className={inputClass}
        placeholder={label}
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
      {error && showError && (
        <div className={styles.tooltip}>
          {error}
          <div className={styles.tooltipArrow}></div>
        </div>
      )}
    </div>
  );
}