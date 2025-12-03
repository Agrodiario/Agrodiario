import {useNavigate} from 'react-router-dom';
import {useEffect, useState} from 'react';
import {propertyService} from "@/services/property.service.ts";
import {cultureService} from "@/services/culture.service.ts";
import styles from './ProductApplicationForm.module.css'
import {Input} from '../../components/common/Input/Input.tsx';
import {SearchableSelect} from "@/components/common/SearchableSelect/SearchableSelect.tsx";
import {FiArrowLeft, FiCheck, FiX} from "react-icons/fi";
import {Button} from "@/components/common/Button/Button.tsx";

export type ProductApplicationFormData = {
  propertyId: string;
  cultureId: string;
  area: string;
  productId: string;
  productName: string;
  dataAplication: string;
};

type Props = {
  initialData?: Partial<ProductApplicationFormData>;
  onSubmit: (data: ProductApplicationFormData) => void;
  isLoading?: boolean;
}

export function ProductApplicationForm({ initialData, onSubmit, isLoading = false }: Props)  {
  const navigate = useNavigate();
  const isEditMode = !!initialData;

  const [formData, setFormData] = useState<ProductApplicationFormData>({
    propertyId: initialData?.propertyId || '',
    cultureId: initialData?.cultureId || '',
    area: initialData?.area || '',
    productId: initialData?.productId || '',
    productName: initialData?.productName || '',
    dataAplication: initialData?.dataAplication || '',
  });

  const [isValid, setIsValid] = useState(false);

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

  const [cultures, setCultures] = useState<any[]>([]);

  // Carrega culturas do usuário
  useEffect(() => {
    const fetchCultures = async () => {
      try {
        const response = await cultureService.findAll(1, 100);
        setCultures(response.data);
      } catch (error) {
        console.error('Erro ao carregar culturas:', error);
      }
    };
    fetchCultures();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const title = isEditMode ? 'Editar aplicação de produto' : 'Nova aplicação de produto';
  const submitText = isEditMode ? 'Salvar alterações' : 'Salvar aplicação'

  const searchResults = [{
    registrationNumber: '123',
    commercialNames: ['nome'],
    registrationHolder: 'homi',
    categories: ['A', 'B'],
    activeIngredients: ['X','Y'],
    organicFarmingProduct: true,
  },{
    registrationNumber: '123',
    commercialNames: ['nome'],
    registrationHolder: 'homi',
    categories: ['A', 'B'],
    activeIngredients: ['X','Y'],
    organicFarmingProduct: false,
  },{
    registrationNumber: '123',
    commercialNames: ['nome'],
    registrationHolder: 'homi',
    categories: ['A', 'B'],
    activeIngredients: ['X','Y'],
    organicFarmingProduct: true,
  },{
    registrationNumber: '123',
    commercialNames: ['nome'],
    registrationHolder: 'homi',
    categories: ['A', 'B'],
    activeIngredients: ['X','Y'],
    organicFarmingProduct: true,
  }
  ]

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          <FiArrowLeft size={20} />
          <span>{title}</span>
        </button>
      </header>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Identificação</h3>
          <div className={styles.section}>
            <label className={styles.label}>
              Propriedade <span style={{ color: 'red' }}>*</span>
            </label>
            <select
              name="propertyId"
              value={formData.propertyId}
              onChange={(e) => setFormData(prev => ({ ...prev, productId: e.target.value }))}
              className={styles.select}
              required
              >
              <option value="">Selecione uma propriedade</option>
              {properties.map((prop) => (
                <option key={prop.id} value={prop.id}>
                  {prop.name}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.section}>
            <label className={styles.label}>
              Cultura <span style={{ color: 'red' }}>*</span>
            </label>
            <select
              name="cultureId"
              value={formData.cultureId}
              onChange={(e) => setFormData(prev => ({ ...prev, cultureId: e.target.value }))}
              className={styles.select}
              required
            >
              <option value="">Selecione uma cultura</option>
              {cultures.map((cult) => (
                <option key={cult.id} value={cult.id}>
                  {cult.name}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.section}>
            <label className={styles.label}>
              Área/talhão <span style={{ color: 'red' }}>*</span>
            </label>
            <Input
              label="Área/talhão"
              name="area"
              value={formData.area}
              onChange={handleChange}
              placeholder="Lorem Ipsum"
            />
          </div>
        </div>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Buscar na base EMBRAPA</h3>
          <div className={styles.insumoFields}>
            <label className={styles.label}>
              Busque pelo nome do produto
            </label>
            <SearchableSelect
              label="Nome do produto/insumo"
              placeholder="Digite para buscar na Embrapa..."
              value={formData.productName}
              onChange={(newValue) =>
                setFormData(prev => ({ ...prev, productName: newValue }))
              }
            />
          </div>
          <div className={styles.section}>
            {searchResults.length > 0 && (
              <div className={styles.resultsGrid}>
                {searchResults.map((result) => (
                  <div
                    key={result.registrationNumber}
                    className={styles.resultCard}
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, productName: result.name }))
                    }
                  >
                    <h4>{result.commercialNames[0]}</h4>
                    <p>{result.categories[0]}</p>
                    <p
                      className={`${styles.status} ${
                        result.organicFarmingProduct ? styles.allowed : styles.denied
                    }`}> {result.organicFarmingProduct ? (
                      <>
                        <FiCheck className={styles.icon} />
                        Permitido em sistemas orgânicos
                      </> ) : ( <>
                        <FiX className={styles.icon} />
                        Não permitido em sistemas orgânicos
                      </> )
                    } </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <footer className={styles.footer}>
          <Button variant="tertiary" type="button" onClick={() => navigate(-1)} disabled={isLoading}>Cancelar</Button>
          <Button variant="primary" type="submit" disabled={!isValid || isLoading}>{isLoading ? 'Salvando...' : submitText}</Button>
        </footer>
      </form>
    </div>
  )
}