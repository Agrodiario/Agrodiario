import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
// Mantendo os caminhos de importação originais (resolução de erros do ambiente)
import styles from './CultureForm.module.css';
import { Button } from '../../common/Button/Button';
import { Radio } from '../../common/Radio/Radio';
// Usando o caminho de `Button` como referência para o `Input`
import { Input, SelectOption } from '../../common/Input/Input';
import { CultureSearchSelect } from '../CultureSearchSelect/CultureSearchSelect';
import { propertyService } from '../../../services/property.service';
import { isValidDate } from '../../../utils/validators';
import { dateMask } from '../../../utils/masks';
import { IoIosArrowDown } from 'react-icons/io';
import { FiArrowLeft } from 'react-icons/fi';

export type CultureFormData = {
  propertyId: string;
  cultureName: string;
  cultivar: string;
  cycle: string;
  origin: 'organic' | 'conventional' | 'transgenic';
  supplier: string;
  plantingDate: string; // Agora será DD/MM/AAAA no frontend
  plantingArea: string;
  observations: string;
  plotName?: string;
};

type Props = {
  initialData?: Partial<CultureFormData>;
  onSubmit: (data: CultureFormData) => void;
  isLoading?: boolean;
};

// Função para converter data do formato YYYY-MM-DD para DD/MM/AAAA
const convertDateToDisplayFormat = (dateString: string): string => {
  if (!dateString) return '';

  // Se já estiver no formato DD/MM/AAAA, retorna como está
  if (dateString.includes('/')) return dateString;

  // Converte de YYYY-MM-DD para DD/MM/AAAA
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

// Função para converter data do formato DD/MM/AAAA para YYYY-MM-DD
const convertDateToSubmitFormat = (dateString: string): string => {
  if (!dateString || dateString.length < 10) return '';

  const [day, month, year] = dateString.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

const handleCycleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  // Permite apenas: números, Backspace, Tab, Delete, setas, Home, End
  const allowedKeys = [
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
    'Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
    'Home', 'End'
  ];

  // Permite combinações de teclas de controle (Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X)
  if (e.ctrlKey || e.metaKey) {
    return; // Permite todas as combinações com Ctrl/Cmd
  }

  // Permite Alt+ combinações (para acessibilidade)
  if (e.altKey) {
    return;
  }

  // Bloqueia teclas não permitidas
  if (!allowedKeys.includes(e.key)) {
    e.preventDefault();
  }
};

// Função de validação de data
const validateDate = (dateValue: string): string => {
  if (!dateValue || dateValue.trim() === '') {
    return 'Data de plantio é obrigatória';
  }

  if (dateValue.length < 10) {
    return 'Data incompleta (DD/MM/AAAA)';
  }

  if (!isValidDate(dateValue)) {
    return 'Data inválida. Verifique o dia e o mês.';
  }

  return '';
};

export function CultureForm({ initialData, onSubmit, isLoading = false }: Props) {
  const navigate = useNavigate();
  const isEditMode = !!initialData;

  const [formData, setFormData] = useState<CultureFormData>({
    propertyId: initialData?.propertyId || '',
    cultureName: initialData?.cultureName || '',
    cultivar: initialData?.cultivar || '',
    cycle: initialData?.cycle || '',
    origin: initialData?.origin || 'conventional',
    supplier: initialData?.supplier || '',
    plantingDate: convertDateToDisplayFormat(initialData?.plantingDate || ''),
    plantingArea: initialData?.plantingArea || '',
    observations: initialData?.observations || '',
    plotName: initialData?.plotName || '',
  });

  const [properties, setProperties] = useState<any[]>([]);
  const [areaInputType, setAreaInputType] = useState<'hectares' | 'plot'>(
    initialData?.plotName ? 'plot' : 'hectares'
  );
  const [selectedProperty, setSelectedProperty] = useState<any>(null);

  // Estados para validação
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValid, setIsValid] = useState(false);

  // Carrega propriedades do usuário
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await propertyService.findAll(1, 100);
        setProperties(response.data);
        // Se está editando, encontrar a propriedade selecionada
        if (initialData?.propertyId) {
          const prop = response.data.find((p: any) => p.id === initialData.propertyId);
          setSelectedProperty(prop);
        }
      } catch (error) {
        console.error('Erro ao carregar propriedades:', error);
      }
    };
    fetchProperties();
  }, []);

  // Atualiza propriedade selecionada quando propertyId muda
  useEffect(() => {
    if (formData.propertyId) {
      const prop = properties.find(p => p.id === formData.propertyId);
      setSelectedProperty(prop);
      // Se mudar de propriedade, limpar seleção de talhão
      if (areaInputType === 'plot') {
        setFormData(prev => ({ ...prev, plotName: '' }));
      }
    }
  }, [formData.propertyId, properties]);

  // Função de validação geral
  const validateField = (fieldName: keyof CultureFormData, value: string): string => {
    switch (fieldName) {
      case 'propertyId':
        if (!value || value.trim() === '') return 'Propriedade é obrigatória';
        return '';
      case 'cultureName':
        if (!value || value.trim() === '') return 'Cultura é obrigatória';
        return '';
      case 'cultivar':
        if (!value || value.trim() === '') return 'Cultivar/Variedade é obrigatório';
        return '';
      case 'cycle': {
        if (!value.trim()) return 'Ciclo é obrigatório';

        // Remove tudo que não for número
        const clean = value.replace(/\D/g, '');
        const num = Number(clean);

        if (!Number.isInteger(num)) return 'Ciclo deve ser um número inteiro';
        if (num <= 0) return 'Ciclo deve ser maior que zero';
        return '';
      }
      case 'origin':
        if (!value || value.trim() === '') return 'Origem é obrigatória';
        return '';
      case 'supplier':
        if (!value || value.trim() === '') return 'Fornecedor é obrigatório';
        return '';
      case 'plantingDate':
        return validateDate(value);
      case 'plantingArea':
        // A validação de 'plantingArea' cobre tanto o input de hectares quanto o select de talhão
        if (!value || value.trim() === '') return areaInputType === 'hectares' ? 'Área de plantio é obrigatória' : 'Seleção de talhão é obrigatória';
        if (areaInputType === 'hectares' && (isNaN(Number(value)) || Number(value) <= 0)) {
          return 'Área deve ser um número positivo';
        }
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const fieldName = name as keyof CultureFormData;

    let processedValue = value;

    // Aplica máscara apenas para o campo de data
    if (fieldName === 'plantingDate') {
      processedValue = dateMask(value);
    }

    setFormData(prev => {
      const updatedFormData = { ...prev, [fieldName]: processedValue };

      // Valida o campo se já foi tocado
      if (touchedFields[fieldName]) {
        const error = validateField(fieldName, processedValue);
        setErrors(prevErrors => ({ ...prevErrors, [fieldName]: error }));
      }

      return updatedFormData;
    });
  };

  const handleBlur = (fieldName: keyof CultureFormData) => {
    setTouchedFields(prev => ({ ...prev, [fieldName]: true }));

    const currentValue = (formData[fieldName] || '').toString();
    const error = validateField(fieldName, currentValue);

    setErrors(prev => ({ ...prev, [fieldName]: error }));
  };

  const handleOriginChange = (value: 'organic' | 'conventional' | 'transgenic') => {
    setFormData(prev => ({ ...prev, origin: value }));

    // Dispara a validação após a mudança, se o campo já foi tocado
    if (touchedFields.origin) {
      const error = validateField('origin', value);
      setErrors(prev => ({ ...prev, origin: error }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Lista de campos obrigatórios
    const requiredFields: (keyof CultureFormData)[] = [
      'propertyId',
      'cultureName',
      'cultivar',
      'cycle',
      'origin',
      'supplier',
      'plantingDate',
      'plantingArea'
    ];

    // Marca todos os campos obrigatórios como tocados
    const newTouched: Record<string, boolean> = {};
    const newErrors: Record<string, string> = {};

    requiredFields.forEach(field => {
      newTouched[field] = true;
      const error = validateField(field, (formData[field] || '').toString());
      if (error) {
        newErrors[field] = error;
      }
    });

    setTouchedFields(newTouched);
    setErrors(newErrors);

    // Se houver erros, não envia o formulário
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    // Converte a data para o formato de envio (YYYY-MM-DD)
    const dataToSubmit = {
      ...formData,
      plantingDate: convertDateToSubmitFormat(formData.plantingDate),
    };

    onSubmit(dataToSubmit);
  };

  const handleCultureChange = (cultureName: string) => {
    setFormData(prev => ({ ...prev, cultureName }));

    // Se o campo foi tocado, valida após a mudança
    if (touchedFields.cultureName) {
      const error = validateField('cultureName', cultureName);
      setErrors(prev => ({ ...prev, cultureName: error }));
    }
  };

  const handleAreaTypeChange = (type: 'hectares' | 'plot') => {
    setAreaInputType(type);
    if (type === 'hectares') {
      // Limpa a seleção de talhão
      setFormData(prev => ({ ...prev, plotName: '' }));
      // Se houver valor em plantingArea (vindo do plot), limpa para forçar o usuário a digitar
      if (formData.plantingArea && initialData?.plotName) {
        setFormData(prev => ({ ...prev, plantingArea: '' }));
      }
      // Se o campo de área já foi tocado, valida para hectares
      if (touchedFields.plantingArea) {
        const error = validateField('plantingArea', formData.plantingArea);
        setErrors(prev => ({ ...prev, plantingArea: error }));
      }
    } else {
      // Limpa a área em hectares
      setFormData(prev => ({ ...prev, plantingArea: '' }));
      // Se o campo de área já foi tocado, valida para talhão
      if (touchedFields.plantingArea) {
        const error = validateField('plantingArea', formData.plotName || '');
        setErrors(prev => ({ ...prev, plantingArea: error }));
      }
    }
  };

  const handlePlotChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const plotName = e.target.value;
    const plot = selectedProperty?.plots?.find((p: any) => p.name === plotName);
    const plantingArea = plot ? plot.area.toString() : '';

    setFormData(prev => ({
      ...prev,
      plotName,
      plantingArea, // Atualiza a área com a área do talhão
    }));

    // Valida o campo 'plantingArea' após a seleção do talhão
    if (touchedFields.plantingArea) {
      const error = validateField('plantingArea', plantingArea);
      setErrors(prev => ({ ...prev, plantingArea: error }));
    }
  };

  // Efeito para validar o formulário inteiro
  useEffect(() => {
    const requiredFields: (keyof CultureFormData)[] = [
      'propertyId',
      'cultureName',
      'cultivar',
      'cycle',
      'origin',
      'supplier',
      'plantingDate',
      'plantingArea'
    ];

    const hasErrors = requiredFields.some(field => {
      const value = (field === 'plantingArea' && areaInputType === 'plot') ? (formData.plotName || '') : (formData[field] || '').toString();
      const error = validateField(field, value);
      return !!error;
    });

    setIsValid(!hasErrors);
  }, [formData, areaInputType]);

  const submitText = isEditMode ? 'Salvar alterações' : 'Salvar cultura';
  const hasPlots = selectedProperty?.plots && selectedProperty.plots.length > 0;

  // --- PREPARAÇÃO DAS OPÇÕES PARA O COMPONENTE INPUT AS SELECT ---

  const propertyOptions: SelectOption[] = useMemo(() => {
    return properties.map(prop => ({
      label: prop.name,
      value: prop.id,
    }));
  }, [properties]);

  const plotOptions: SelectOption[] = useMemo(() => {
    return selectedProperty?.plots?.map((plot: any) => ({
      label: `${plot.name} - ${plot.area} hectares`,
      value: plot.name,
    })) || [];
  }, [selectedProperty]);

  const title = isEditMode ? 'Editar cultura' : 'Nova cultura';

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          <FiArrowLeft size={20} />
          <span>{title}</span>
        </button>
      </header>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Propriedade associada (AGORA USANDO INPUT AS SELECT) */}
        <div className={styles.section}>
          <Input
            as="select"
            label="Propriedade associada"
            name="propertyId"
            value={formData.propertyId}
            onChange={handleChange}
            onBlur={() => handleBlur('propertyId')}
            options={propertyOptions}
            required
            icon={<IoIosArrowDown size={18} />}
            error={errors.propertyId}
            showError={touchedFields.propertyId && !!errors.propertyId}
          />
        </div>

        {/* Cultura */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Cultura</h3>
          <CultureSearchSelect
            value={formData.cultureName}
            onChange={handleCultureChange}
            placeholder="Milho"
          />
          {touchedFields.cultureName && errors.cultureName && (
            <span className={styles.errorMessage}>{errors.cultureName}</span>
          )}

          {/* Nome do cultivar/variedade */}
          <Input
            label="Nome do cultivar/variedade"
            name="cultivar"
            value={formData.cultivar}
            onChange={handleChange}
            onBlur={() => handleBlur('cultivar')}
            placeholder="AG 1051"
            required
            error={errors.cultivar}
            showError={touchedFields.cultivar && !!errors.cultivar}
          />

          {/* Ciclo */}
          <Input
            label="Ciclo (em dias)"
            name="cycle"
            type="number"
            value={formData.cycle}
            onChange={handleChange}
            onBlur={() => handleBlur('cycle')}
            placeholder="120"
            onKeyDown={handleCycleKeyDown}
            min="1"
            step="1"
            required
            error={errors.cycle}
            showError={touchedFields.cycle && !!errors.cycle}
          />
        </div>

        {/* Origem */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Origem</h3>
          <div className={styles.radioGroup}>
            <Radio
              name="origin"
              value="organic"
              label="Orgânico"
              checked={formData.origin === 'organic'}
              onChange={() => handleOriginChange('organic')}
              onBlur={() => handleBlur('origin')}
            />
            <Radio
              name="origin"
              value="conventional"
              label="Convencional"
              checked={formData.origin === 'conventional'}
              onChange={() => handleOriginChange('conventional')}
              onBlur={() => handleBlur('origin')}
            />
            <Radio
              name="origin"
              value="transgenic"
              label="Transgênico"
              checked={formData.origin === 'transgenic'}
              onChange={() => handleOriginChange('transgenic')}
              onBlur={() => handleBlur('origin')}
            />
          </div>
          {touchedFields.origin && errors.origin && (
            <span className={styles.errorMessage}>{errors.origin}</span>
          )}

          {/* Fornecedor/empresa sementeira */}
          <Input
            label="Fornecedor/empresa sementeira"
            name="supplier"
            value={formData.supplier}
            onChange={handleChange}
            onBlur={() => handleBlur('supplier')}
            placeholder="Lorem Ipsum"
            required
            error={errors.supplier}
            showError={touchedFields.supplier && !!errors.supplier}
          />
        </div>

        {/* Data de plantio prevista ou realizada */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Plantio</h3>
          <Input
            label="Data de plantio prevista ou realizada"
            name="plantingDate"
            type="text"
            value={formData.plantingDate}
            onChange={handleChange}
            onBlur={() => handleBlur('plantingDate')}
            placeholder="DD/MM/AAAA"
            maxLength={10}
            required
            error={errors.plantingDate}
            showError={touchedFields.plantingDate && !!errors.plantingDate}
          />

          {/* Área de plantio */}
          {formData.propertyId && hasPlots && (
            <div className={styles.radioGroup} style={{ flexDirection: 'row', gap: '1.5rem', marginBottom: '0.75rem' }}>
              <Radio
                name="areaType"
                value="hectares"
                label="Hectares"
                checked={areaInputType === 'hectares'}
                onChange={() => handleAreaTypeChange('hectares')}
              />
              <Radio
                name="areaType"
                value="plot"
                label="Talhão"
                checked={areaInputType === 'plot'}
                onChange={() => handleAreaTypeChange('plot')}
              />
            </div>
          )}

          {formData.propertyId && !hasPlots && (
            <p style={{ fontSize: '0.85rem', color: '#667085', marginBottom: '0.5rem' }}>
              Esta propriedade não possui talhões cadastrados. Digite a área em hectares.
            </p>
          )}

          {areaInputType === 'hectares' ? (
            <Input
              label="Área de plantio em hectares"
              name="plantingArea"
              type="number"
              step="0.01"
              value={formData.plantingArea}
              onChange={handleChange}
              onBlur={() => handleBlur('plantingArea')}
              placeholder="Digite a área em hectares"
              required
              error={errors.plantingArea}
              showError={touchedFields.plantingArea && !!errors.plantingArea}
            />
          ) : (
            <>
              {selectedProperty?.plots && selectedProperty.plots.length > 0 ? (
                // Talhão
                <Input
                  as="select"
                  label="Selecione um Talhão"
                  name="plotName"
                  value={formData.plotName || ''}
                  onChange={handlePlotChange}
                  onBlur={() => handleBlur('plantingArea')} // Validação direcionada para plantingArea
                  options={plotOptions}
                  required
                  icon={<IoIosArrowDown size={18} />}
                  error={errors.plantingArea}
                  showError={touchedFields.plantingArea && !!errors.plantingArea}
                />
              ) : (
                <p style={{ fontSize: '0.9rem', color: '#d92d20', padding: '0.75rem', backgroundColor: '#fef3f2', borderRadius: '8px' }}>
                  Não há talhões cadastrados para esta propriedade.
                </p>
              )}
              {/* Se a opção de talhão foi tocada e há erro (e não foi coberto pelo Input Select acima) */}
              {areaInputType === 'plot' && touchedFields.plantingArea && errors.plantingArea && !selectedProperty?.plots?.length && (
                <span className={styles.errorMessage}>{errors.plantingArea}</span>
              )}
            </>
          )}

          {/* Observações adicionais */}
          <Input
            as="textarea"
            label="Observações adicionais"
            name="observations"
            value={formData.observations}
            onChange={handleChange}
            placeholder="Detalhes adicionais sobre a cultura ou o plantio."
            rows={4}
          // Não é required, então não precisa de error/showError
          />
        </div>

        {/* Footer com botões */}
        <footer className={styles.footer}>
          <Button
            variant="tertiary"
            type="button"
            onClick={() => navigate(-1)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={!isValid || isLoading}
          >
            {isLoading ? 'Salvando...' : submitText}
          </Button>
        </footer>
      </form>
    </div>
  );
}