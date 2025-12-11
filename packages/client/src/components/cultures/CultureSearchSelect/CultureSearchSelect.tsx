import { useRef, useState } from 'react';
import AsyncCreatableSelect from 'react-select/async-creatable';
import { cultureService } from '../../../services/culture.service';
import styles from './CultureSearchSelect.module.css';

type Option = { label: string; value: string };

type Props = {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isDisabled?: boolean;
  label?: string;
  required?: boolean;
};

export function CultureSearchSelect({ value, onChange, placeholder, isDisabled, label = 'Cultura', required = false }: Props) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState('');

  // Função para capitalizar primeira letra
  const capitalizeFirstLetter = (text: string): string => {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  const loadOptions = (inputValue: string) => {
    return new Promise<Option[]>((resolve) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Se não houver input, não mostrar nenhuma opção
      if (!inputValue) {
        resolve([]);
        return;
      }

      timeoutRef.current = setTimeout(async () => {
        if (inputValue.length < 2) {
          resolve([]);
          return;
        }

        try {
          const results = await cultureService.searchCultureNames(inputValue);
          
          // Adiciona a opção do texto digitado como primeira sugestão
          const capitalizedInput = capitalizeFirstLetter(inputValue);
          const userOption: Option = { 
            label: capitalizedInput, 
            value: capitalizedInput 
          };
          
          // Remove duplicatas (caso o texto digitado já exista nos resultados)
          const filteredResults = results.filter(
            r => r.label.toLowerCase() !== inputValue.toLowerCase()
          );
          
          // Coloca a opção do usuário sempre em primeiro
          resolve([userOption, ...filteredResults]);
        } catch (error) {
          console.error('Erro na busca de culturas:', error);
          // Mesmo com erro, oferece a opção do usuário
          const capitalizedInput = capitalizeFirstLetter(inputValue);
          resolve([{ label: capitalizedInput, value: capitalizedInput }]);
        }
      }, 500);
    });
  };

  const hasValue = value && value.trim() !== '';

  const customStyles = {
    control: (base: any, state: any) => ({
      ...base,
      border: 'none',
      boxShadow: 'none',
      backgroundColor: 'transparent',
      minHeight: '24px',
      padding: 0,
    }),
    valueContainer: (base: any) => ({
      ...base,
      padding: 0,
    }),
    input: (base: any) => ({
      ...base,
      margin: 0,
      padding: 0,
      color: '#101828',
    }),
    placeholder: (base: any) => ({
      ...base,
      display: 'none',
    }),
    singleValue: (base: any) => ({
      ...base,
      color: '#101828',
      margin: 0,
    }),
    indicatorsContainer: (base: any) => ({
      ...base,
      height: '24px',
    }),
    clearIndicator: (base: any) => ({
      ...base,
      padding: '4px',
    }),
    dropdownIndicator: () => ({
      display: 'none',
    }),
    menu: (base: any) => ({
      ...base,
      zIndex: 9999,
    }),
  };

  const selectedOption = value ? { label: value, value: value } : null;

  return (
    <div className={styles.inputWrapper}>
      <label
        className={`${styles.inputLabel} ${isFocused || hasValue ? styles.floating : ''}`}
      >
        {label}
        {required && <span style={{ color: 'red', marginLeft: '2px' }}>*</span>}
      </label>
      
      <div className={styles.selectContainer}>
        <AsyncCreatableSelect
          cacheOptions
          defaultOptions={false}
          isClearable
          loadOptions={loadOptions}
          onChange={(option: any) => {
            // Sempre capitaliza a primeira letra ao selecionar
            const selectedValue = option?.label || '';
            const capitalizedValue = capitalizeFirstLetter(selectedValue);
            onChange(capitalizedValue);
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onInputChange={(newInputValue, actionMeta) => {
            setInputValue(newInputValue);
            if (actionMeta.action === 'input-change' && !newInputValue) {
              onChange('');
            }
          }}
          value={selectedOption}
          placeholder=""
          styles={customStyles}
          isDisabled={isDisabled}
          noOptionsMessage={({ inputValue }) => 
            !inputValue
              ? "Digite para buscar"
              : inputValue.length < 2 
              ? "Digite pelo menos 2 caracteres" 
              : "Pressione Enter para usar"
          }
          loadingMessage={() => "Buscando..."}
          formatCreateLabel={(inputValue) => `✓ ${capitalizeFirstLetter(inputValue)}`}
        />
      </div>
    </div>
  );
}
