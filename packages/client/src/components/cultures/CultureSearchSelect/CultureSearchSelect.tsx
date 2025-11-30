import { useRef } from 'react';
import AsyncCreatableSelect from 'react-select/async-creatable';
import { cultureService } from '../../../services/culture.service';
import styles from './CultureSearchSelect.module.css';

type Option = { label: string; value: string };

type Props = {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isDisabled?: boolean;
};

export function CultureSearchSelect({ value, onChange, placeholder, isDisabled }: Props) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const loadOptions = (inputValue: string) => {
    return new Promise<Option[]>((resolve) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(async () => {
        if (!inputValue || inputValue.length < 2) {
          resolve([]);
          return;
        }

        try {
          const results = await cultureService.searchCultureNames(inputValue);
          resolve(results);
        } catch (error) {
          console.error('Erro na busca de culturas:', error);
          resolve([]);
        }
      }, 500);
    });
  };

  const customStyles = {
    control: (base: any, state: any) => ({
      ...base,
      borderColor: state.isFocused ? '#008542' : '#d0d5dd',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(0, 133, 66, 0.2)' : 'none',
      borderRadius: '8px',
      padding: '2px',
      '&:hover': { borderColor: '#008542' }
    }),
    placeholder: (base: any) => ({ ...base, color: '#667085' }),
    singleValue: (base: any) => ({ ...base, color: '#101828' }),
  };

  const selectedOption = value ? { label: value, value: value } : null;

  return (
    <div className={styles.wrapper}>
      <AsyncCreatableSelect
        cacheOptions
        defaultOptions
        isClearable
        loadOptions={loadOptions}
        onChange={(option: any) => onChange(option?.label || '')}
        onInputChange={(inputValue, actionMeta) => {
          // Limpa o campo quando o usuário clica e começa a digitar
          if (actionMeta.action === 'input-change' && !inputValue) {
            onChange('');
          }
        }}
        value={selectedOption}
        placeholder={placeholder || "Busque ou selecione uma cultura"}
        styles={customStyles}
        isDisabled={isDisabled}
        noOptionsMessage={({ inputValue }) => 
          inputValue.length < 2 
            ? "Digite pelo menos 2 caracteres" 
            : "Pressione Enter para usar"
        }
        loadingMessage={() => "Buscando..."}
        formatCreateLabel={(inputValue) => `Usar: ${inputValue}`}
      />
    </div>
  );
}
