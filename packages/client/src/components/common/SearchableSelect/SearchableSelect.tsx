// src/components/common/SearchableSelect/SearchableSelect.tsx
import { useRef } from 'react'; // 1. Importe useRef
import AsyncSelect from 'react-select/async';
import { apiClient } from '../../../config/api.client';
import styles from './SearchableSelect.module.css';

type Option = { label: string; value: string };

type Props = {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isDisabled?: boolean;
};

export function SearchableSelect({ label, value, onChange, placeholder, isDisabled }: Props) {
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const loadOptions = (inputValue: string) => {
    return new Promise<Option[]>((resolve) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(async () => {

        try {
          const response = await apiClient.get('/embrapa/insumos', {
            params: { q: inputValue }
          });
          resolve(response.data);
          console.log(response.data)
        } catch (error) {
          console.error('Erro na busca:', error);
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
      <AsyncSelect
        cacheOptions
        defaultOptions
        loadOptions={loadOptions}
        onChange={(option: any) => onChange(option?.value || '')}
        value={selectedOption}
        placeholder={placeholder || label}
        styles={customStyles}
        isDisabled={isDisabled}
        noOptionsMessage={() => "Nenhum insumo encontrado"}
        loadingMessage={() => "Aguardando digitação..."} 
      />
    </div>
  );
}