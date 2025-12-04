import { ComponentPropsWithoutRef, ReactNode, useState } from 'react';
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
  const [isFocused, setIsFocused] = useState(false);

  // Determina se o campo tem valor preenchido
  const hasValue =
    (props as any).value !== undefined &&
    (props as any).value !== null &&
    String((props as any).value).trim() !== '';

  // Verifica se a prop 'required' está presente (para Input, Textarea e Select)
  const isRequired = (props as any).required;

  const wrapperClass = `${styles.inputWrapper} ${as === 'textarea' ? styles.textareaWrapper : ''
    } ${error && showError ? styles.error : ''} ${className || ''}`;

  const inputClass = `${styles.input} ${as === 'textarea' ? styles.textarea : ''
    } ${as === 'select' ? styles.select : ''}`;

  let InputElement;

  const commonEvents = {
    onFocus: () => setIsFocused(true),
    onBlur: (e: any) => {
      setIsFocused(false);
      props.onBlur?.(e);
    },
  };

  // INPUT
  if (as === 'input') {
    InputElement = (
      <input
        className={inputClass}
        {...(props as ComponentPropsWithoutRef<'input'>)}
        {...commonEvents}
        placeholder={isFocused || hasValue ? '' : label}
      />
    );
  }

  // TEXTAREA
  else if (as === 'textarea') {
    InputElement = (
      <textarea
        className={inputClass}
        {...(props as ComponentPropsWithoutRef<'textarea'>)}
        {...commonEvents}
        placeholder={isFocused || hasValue ? '' : label}
      />
    );
  }

  // SELECT
  else {
    const { options, ...rest } = props as InputAsSelect;

    InputElement = (
      <select
        className={inputClass}
        {...rest}
        {...commonEvents}
        value={(props as any).value || ''}
      >
        {/* Remova o option placeholder e deixe apenas opções vazias se necessário */}
        <option value="" disabled hidden>
          {/* Label vazia ou um espaço para consistência */}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <div className={wrapperClass}>
      {/* Floating Label */}
      <label
        className={`${styles.inputLabel} ${isFocused || hasValue ? styles.floating : ''
          } ${error && showError ? styles.errorLabel : ''}`}
      >
        {label}
        {/* NOVO: Adiciona o asterisco vermelho se o campo for obrigatório */}
        {isRequired && <span style={{ color: 'red', marginLeft: '2px' }}>*</span>}
      </label>

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