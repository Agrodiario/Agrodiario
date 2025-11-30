import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CultureForm.module.css';
import { Input } from '../../common/Input/Input';
import { Button } from '../../common/Button/Button';
import { Radio } from '../../common/Radio/Radio';
import { CultureSearchSelect } from '../CultureSearchSelect/CultureSearchSelect';
import { propertyService } from '../../../services/property.service';

export type CultureFormData = {
  propertyId: string;
  cultureName: string;
  cultivar: string;
  cycle: string;
  origin: 'organic' | 'conventional' | 'transgenic';
  supplier: string;
  plantingDate: string;
  plantingArea: string;
  observations: string;
};

type Props = {
  initialData?: Partial<CultureFormData>;
  onSubmit: (data: CultureFormData) => void;
  isLoading?: boolean;
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
    plantingDate: initialData?.plantingDate || '',
    plantingArea: initialData?.plantingArea || '',
    observations: initialData?.observations || '',
  });

  const [properties, setProperties] = useState<any[]>([]);

  // Carrega propriedades do usuário
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await propertyService.findAll(1, 100);
        setProperties(response.data);
      } catch (error) {
        console.error('Erro ao carregar propriedades:', error);
      }
    };
    fetchProperties();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOriginChange = (value: 'organic' | 'conventional' | 'transgenic') => {
    setFormData(prev => ({ ...prev, origin: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleCultureChange = (cultureName: string) => {
    setFormData(prev => ({ ...prev, cultureName }));
  };

  const submitText = isEditMode ? 'Salvar alterações' : 'Salvar cultura';

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
            onChange={(e) => setFormData(prev => ({ ...prev, propertyId: e.target.value }))}
            className={styles.select}
            required
          >
            <option value="">Selecione uma propriedade</option>
            {properties.map(prop => (
              <option key={prop.id} value={prop.id}>
                {prop.name}
              </option>
            ))}
          </select>
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
          <Input
            label="Nome do cultivar/variedade"
            name="cultivar"
            value={formData.cultivar}
            onChange={handleChange}
            placeholder="AG 1051"
          />
        </div>

        {/* Ciclo */}
        <div className={styles.section}>
          <Input
            label="Ciclo (em dias)"
            name="cycle"
            type="number"
            value={formData.cycle}
            onChange={handleChange}
            placeholder="120"
            required
          />
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
          <Input
            label="Fornecedor/empresa sementeira"
            name="supplier"
            value={formData.supplier}
            onChange={handleChange}
            placeholder="Lorem Ipsum"
          />
        </div>

        {/* Data de plantio prevista ou realizada */}
        <div className={styles.section}>
          <Input
            label="Data de plantio prevista ou realizada"
            name="plantingDate"
            type="date"
            value={formData.plantingDate}
            onChange={handleChange}
            required
          />
        </div>

        {/* Área de plantio */}
        <div className={styles.section}>
          <Input
            label="Área de plantio (hectares ou talhão)"
            name="plantingArea"
            type="number"
            step="0.01"
            value={formData.plantingArea}
            onChange={handleChange}
            placeholder="1"
            required
          />
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
          <Button variant="primary" type="submit" disabled={isLoading}>
            {isLoading ? 'Salvando...' : submitText}
          </Button>
        </footer>
      </form>
    </div>
  );
}
