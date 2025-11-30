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
  plotName?: string;
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
    plotName: initialData?.plotName || '',
  });

  const [properties, setProperties] = useState<any[]>([]);
  const [areaInputType, setAreaInputType] = useState<'hectares' | 'plot'>(
    initialData?.plotName ? 'plot' : 'hectares'
  );
  const [selectedProperty, setSelectedProperty] = useState<any>(null);

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
          <label className={styles.label}>Ciclo (em dias)</label>
          <input
            name="cycle"
            type="number"
            value={formData.cycle}
            onChange={handleChange}
            placeholder="120"
            className={styles.input}
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
          <label className={styles.label}>Data de plantio prevista ou realizada</label>
          <input
            name="plantingDate"
            type="date"
            value={formData.plantingDate}
            onChange={handleChange}
            className={styles.input}
            required
          />
        </div>

        {/* Área de plantio */}
        <div className={styles.section}>
          <label className={styles.label}>Área de plantio</label>
          
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
            <input
              name="plantingArea"
              type="number"
              step="0.01"
              value={formData.plantingArea}
              onChange={handleChange}
              placeholder="Digite a área em hectares"
              className={styles.input}
              required
            />
          ) : (
            <>
              {selectedProperty?.plots && selectedProperty.plots.length > 0 ? (
                <select
                  name="plotName"
                  value={formData.plotName}
                  onChange={handlePlotChange}
                  className={styles.select}
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
          <Button variant="primary" type="submit" disabled={isLoading}>
            {isLoading ? 'Salvando...' : submitText}
          </Button>
        </footer>
      </form>
    </div>
  );
}
