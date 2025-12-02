import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CultureForm.module.css';
import { Button } from '../../common/Button/Button';
import { Radio } from '../../common/Radio/Radio';
import { CultureSearchSelect } from '../CultureSearchSelect/CultureSearchSelect';
import { propertyService } from '../../../services/property.service';
// Adicione estas importações
import { isValidDate } from '../../../utils/validators';
import { dateMask } from '../../../utils/masks';

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
      case 'cycle':
        if (!value || value.trim() === '') return 'Ciclo é obrigatório';
        if (isNaN(Number(value)) || Number(value) <= 0) return 'Ciclo deve ser um número positivo';
        return '';
      case 'plantingDate':
        return validateDate(value);
      case 'plantingArea':
        if (!value || value.trim() === '') return 'Área de plantio é obrigatória';
        if (isNaN(Number(value)) || Number(value) <= 0) return 'Área deve ser um número positivo';
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
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Marca todos os campos obrigatórios como tocados
    const requiredFields: (keyof CultureFormData)[] = [
      'propertyId',
      'cultureName',
      'cycle',
      'plantingDate',
      'plantingArea'
    ];

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
      setFormData(prev => ({ ...prev, plotName: '' }));
    } else {
      setFormData(prev => ({ ...prev, plantingArea: '' }));
    }
  };

  const handlePlotChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const plotName = e.target.value;
    const plot = selectedProperty?.plots?.find((p: any) => p.name === plotName);
    setFormData(prev => ({
      ...prev,
      plotName,
      plantingArea: plot ? plot.area.toString() : '',
    }));
  };

  // Efeito para validar o formulário inteiro
  useEffect(() => {
    const requiredFields: (keyof CultureFormData)[] = [
      'propertyId',
      'cultureName',
      'cycle',
      'plantingDate',
      'plantingArea'
    ];

    const hasErrors = requiredFields.some(field => {
      const error = validateField(field, (formData[field] || '').toString());
      return !!error;
    });

    setIsValid(!hasErrors);
  }, [formData]);

  const submitText = isEditMode ? 'Salvar alterações' : 'Salvar cultura';
  const hasPlots = selectedProperty?.plots && selectedProperty.plots.length > 0;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          {isEditMode ? 'Editar cultura' : 'Nova cultura'}
        </h1>
      </header>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Propriedade associada */}
        <div className={styles.section}>
          <label className={styles.label}>
            Propriedade associada <span style={{ color: 'red' }}>*</span>
          </label>
          <select
            name="propertyId"
            value={formData.propertyId}
            onChange={handleChange}
            onBlur={() => handleBlur('propertyId')}
            className={`${styles.select} ${errors.propertyId ? styles.error : ''}`}
            required
          >
            <option value="">Selecione uma propriedade</option>
            {properties.map(prop => (
              <option key={prop.id} value={prop.id}>
                {prop.name}
              </option>
            ))}
          </select>
          {touchedFields.propertyId && errors.propertyId && (
            <span className={styles.errorMessage}>{errors.propertyId}</span>
          )}
        </div>

        {/* Cultura */}
        <div className={styles.section}>
          <label className={styles.label}>Cultura</label>
          <CultureSearchSelect
            value={formData.cultureName}
            onChange={handleCultureChange}
            placeholder="Milho"
          />
        </div>

        {/* Nome do cultivar/variedade */}
        <div className={styles.section}>
          <label className={styles.label}>Nome do cultivar/variedade</label>
          <input
            name="cultivar"
            value={formData.cultivar}
            onChange={handleChange}
            placeholder="AG 1051"
            className={styles.input}
          />
        </div>

        {/* Ciclo */}
        <div className={styles.section}>
          <label className={styles.label}>Ciclo (em dias) <span style={{ color: 'red' }}>*</span></label>
          <input
            name="cycle"
            type="number"
            value={formData.cycle}
            onChange={handleChange}
            onBlur={() => handleBlur('cycle')}
            placeholder="120"
            className={`${styles.input} ${errors.cycle ? styles.error : ''}`}
            required
          />
          {touchedFields.cycle && errors.cycle && (
            <span className={styles.errorMessage}>{errors.cycle}</span>
          )}
        </div>

        {/* Origem */}
        <div className={styles.section}>
          <h3 className={styles.textTitle}>Origem</h3>
          <div className={styles.radioGroup}>
            <Radio
              name="origin"
              value="organic"
              label="Orgânico"
              checked={formData.origin === 'organic'}
              onChange={() => handleOriginChange('organic')}
            />
            <Radio
              name="origin"
              value="conventional"
              label="Convencional"
              checked={formData.origin === 'conventional'}
              onChange={() => handleOriginChange('conventional')}
            />
            <Radio
              name="origin"
              value="transgenic"
              label="Transgênico"
              checked={formData.origin === 'transgenic'}
              onChange={() => handleOriginChange('transgenic')}
            />
          </div>
        </div>

        {/* Fornecedor/empresa sementeira */}
        <div className={styles.section}>
          <label className={styles.label}>Fornecedor/empresa sementeira</label>
          <input
            name="supplier"
            value={formData.supplier}
            onChange={handleChange}
            placeholder="Lorem Ipsum"
            className={styles.input}
          />
        </div>

        {/* Data de plantio prevista ou realizada */}
        <div className={styles.section}>
          <label className={styles.label}>
            Data de plantio prevista ou realizada <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            name="plantingDate"
            type="text"
            value={formData.plantingDate}
            onChange={handleChange}
            onBlur={() => handleBlur('plantingDate')}
            placeholder="DD/MM/AAAA"
            className={`${styles.input} ${errors.plantingDate ? styles.error : ''}`}
            maxLength={10}
            required
          />
          {touchedFields.plantingDate && errors.plantingDate && (
            <span className={styles.errorMessage}>{errors.plantingDate}</span>
          )}
        </div>

        {/* Área de plantio */}
        <div className={styles.section}>
          <label className={styles.label}>Área de plantio <span style={{ color: 'red' }}>*</span></label>

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
            <>
              <input
                name="plantingArea"
                type="number"
                step="0.01"
                value={formData.plantingArea}
                onChange={handleChange}
                onBlur={() => handleBlur('plantingArea')}
                placeholder="Digite a área em hectares"
                className={`${styles.input} ${errors.plantingArea ? styles.error : ''}`}
                required
              />
              {touchedFields.plantingArea && errors.plantingArea && (
                <span className={styles.errorMessage}>{errors.plantingArea}</span>
              )}
            </>
          ) : (
            <>
              {selectedProperty?.plots && selectedProperty.plots.length > 0 ? (
                <select
                  name="plotName"
                  value={formData.plotName}
                  onChange={handlePlotChange}
                  onBlur={() => handleBlur('plantingArea')}
                  className={`${styles.select} ${errors.plantingArea ? styles.error : ''}`}
                  required
                >
                  <option value="">Selecione um talhão</option>
                  {selectedProperty.plots.map((plot: any) => (
                    <option key={plot.name} value={plot.name}>
                      {plot.name} - {plot.area} hectares
                    </option>
                  ))}
                </select>
              ) : (
                <p style={{ fontSize: '0.9rem', color: '#d92d20', padding: '0.75rem', backgroundColor: '#fef3f2', borderRadius: '8px' }}>
                  Não há talhões cadastrados para esta propriedade.
                </p>
              )}
              {touchedFields.plantingArea && errors.plantingArea && (
                <span className={styles.errorMessage}>{errors.plantingArea}</span>
              )}
            </>
          )}
        </div>

        {/* Observações adicionais */}
        <div className={styles.section}>
          <label className={styles.label}>Observações adicionais</label>
          <textarea
            name="observations"
            value={formData.observations}
            onChange={handleChange}
            placeholder="Lorem Ipsum"
            className={styles.textarea}
            rows={4}
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