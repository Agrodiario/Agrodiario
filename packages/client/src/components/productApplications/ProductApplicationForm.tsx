import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { propertyService } from '../../services/property.service.ts';
import { cultureService } from '../../services/culture.service.ts';
import styles from './ProductApplicationForm.module.css'
import { Input } from '../common/Input/Input.tsx';
import { Button } from '../common/Button/Button.tsx';
import { FiArrowLeft, FiCheck, FiX } from 'react-icons/fi';
import { ProductApplicationFormData } from '../../types/productApplication.types.ts';
import { ProductCardList } from './ProductCardList.tsx';
import { ProductFormData } from '../../types/product.types.ts';
import { SearchBar } from '../common/SearchableBar/SearchableBar.tsx';
import { IoIosArrowDown } from 'react-icons/io';
import { isValidDate } from '../../utils/validators.ts';
import { dateMask } from '../../utils/masks.ts';
import { productService } from '../../services/product.service.ts';

type Props = {
  initialData?: Partial<ProductApplicationFormData>;
  onSubmit: (data: ProductApplicationFormData) => void;
  isLoading?: boolean;
  initialProduct?: Partial<ProductFormData>;
}

const REQUIRED_FIELDS: (keyof ProductApplicationFormData)[] = [
  "propertyId",
  "cultureId",
  "area",
  "productName",
  // "date",
];

export function ProductApplicationForm({ initialData, onSubmit, isLoading = false, initialProduct }: Props)  {
  const navigate = useNavigate();
  const isEditMode = !!initialData;

  const [formData, setFormData] = useState<ProductApplicationFormData>({
    propertyId: initialData?.propertyId || '',
    cultureId: initialData?.cultureId || '',
    area: initialData?.area || '',
    productId: initialData?.productId || '',
    productName: initialData?.productName || '',
    applicationDate: initialData?.applicationDate || '',
  });

  // ESTADOS PARA PROPRIEDADES
  const [propertiesOptions, setPropertiesOptions] = useState<{ label: string, value: string }[]>([]);
  const [allProperties, setAllProperties] = useState<any[]>([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(false);

  // ESTADOS PARA CULTURAS
  const [culturesOptions, setCulturesOptions] = useState<{ label: string, value: string }[]>([]);
  // const [allCultures, setAllCultures] = useState<any[]>([]);
  const [isLoadingCultures, setIsLoadingCultures] = useState(false);

  // ESTADOS PARA PRODUTO
  const [product, setProduct] = useState<ProductFormData | null>(initialProduct ? {
    registrationNumber: initialProduct?.registrationNumber || '',
    commercialNames: initialProduct?.commercialNames || [],
    registrationHolder: initialProduct?.registrationHolder || '',
    categories: initialProduct?.categories || [],
    activeIngredients: initialProduct?.activeIngredients || [],
    organicFarmingProduct: initialProduct?.organicFarmingProduct || false,
  } : null);

  const [productsOptions, setProductsOptions] = useState<ProductFormData[]>([]);

  // ESTADOS PARA VALIDAÇÃO - MUDE O TIPO PARA PERMITIR NULL
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string | null>>({}); // Permitir null
  const [isValid, setIsValid] = useState(false);

  // Carrega propriedades do usuário
  useEffect(() => {
    async function fetchProperties() {
      setIsLoadingProperties(true);
      try {
        const response = await propertyService.findAll(1, 100);
        setAllProperties(response.data);

        const options = response.data.map(p => ({
          label: p.name,
          value: p.id,
        }));
        setPropertiesOptions(options);

      } catch (error) {
        console.error("[ProductApplicationForm] Erro ao carregar propriedades:", error);
      } finally {
        setIsLoadingProperties(false);
      }
    }

    fetchProperties();
  }, []);

  // Carrega culturas do usuário
  useEffect(() => {
    async function fetchCulturesForProperty() {
      if (!formData.propertyId || allProperties.length === 0) {
        setCulturesOptions([]);
        // Limpa o cultureId e define o erro se a propriedade for removida
        if (formData.cultureId) {
          setFormData(prev => ({ ...prev, cultureId: '' }));
        }
        if (formData.propertyId.trim() === '') {
          setErrors(prev => ({ ...prev, cultureId: 'Selecione uma propriedade primeiro' }));
        } else if (allProperties.length === 0) {
          setErrors(prev => ({ ...prev, cultureId: 'Propriedades não carregadas' }));
        }

        return;
      }

      setIsLoadingCultures(true);

      try {
        const selectedProperty = allProperties.find(p => p.id === formData.propertyId);

        if (selectedProperty) {
          // Limpa o cultureId enquanto carrega novas culturas
          setFormData(prev => ({ ...prev, cultureId: '' }));
          setErrors(prev => ({ ...prev, cultureId: null })); // Use null para limpar

          const cultures = await cultureService.findByProperty(selectedProperty.id);
          const options = cultures.map(c => ({
            label: `${c.cultureName}${c.cultivar ? ` - ${c.cultivar}` : ''}`,
            value: c.id
          }));

          setCulturesOptions(options);

          // Se estiver editando e a cultura atual pertence a esta propriedade, mantém selecionada
          if (isEditMode && initialData?.cultureId) {
            const currentCultureExists = cultures.some(c => c.id === initialData.cultureId);
            if (currentCultureExists) {
              setFormData(prev => ({ ...prev, cultureId: initialData.cultureId! }));
              setErrors(prev => ({ ...prev, cultureId: null })); // Use null para limpar
            }
          }

          // Se não houver culturas, mostra erro
          if (cultures.length === 0) {
            setErrors(prev => ({
              ...prev,
              cultureId: 'Nenhuma cultura encontrada para esta propriedade'
            }));
          }
        } else {
          setCulturesOptions([]);
          setFormData(prev => ({ ...prev, cultureId: '' }));
          setErrors(prev => ({ ...prev, cultureId: 'Propriedade não encontrada' }));
        }
      } catch (error) {
        console.error("[ActivityForm] Erro ao carregar culturas:", error);
        setCulturesOptions([]);
        setFormData(prev => ({ ...prev, cultureId: '' }));
        setErrors(prev => ({ ...prev, cultureId: 'Erro ao carregar culturas' }));
      } finally {
        setIsLoadingCultures(false);
      }
    }

    fetchCulturesForProperty();
  }, [formData.propertyId, allProperties, isEditMode]);

  // VALIDAÇÃO DO CAMPO DE DATA
  const validateDate = (dateValue: string): string | null => {
    if (!dateValue || dateValue.trim() === '') {
      return 'Data da aplicação é obrigatória';
    }

    if (dateValue.length < 10) {
      return 'Data incompleta (DD/MM/AAAA)';
    }

    if (!isValidDate(dateValue)) {
      return 'Data inválida. Verifique o dia e o mês.';
    }

    const [day, month, year] = dateValue.split('/').map(Number);
    const selectedDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate > today) {
      return 'Data não pode ser futura';
    }

    return null; // <-- quando não há erro
  };

  // VALIDAÇÃO DOS OUTROS CAMPOS OBRIGATÓRIOS
  const validateFields = (
    fieldName: keyof ProductApplicationFormData,
    value: string
  ): string | null => {
    if (fieldName === "applicationDate") return validateDate(value);

    switch (fieldName) {
      case 'propertyId':
        if (!value || value.trim() === '') return 'Propriedade é obrigatória';
        return null;
      case 'cultureId':
        if (!value || value.trim() === '') return 'Cultura é obrigatória';
        return null;
      case 'area':
        if (!value || value.trim() === '') return 'Área da aplicação é obrigatório';
        return null;
      case 'productId':
        if (!value || value.trim() === '') return 'Produto é obrigatória';
        return null;
      case 'productName':
        if (!value || value.trim() === '') return 'Produto é obrigatória';
        return null;
      default:
        return null;
    }
  };

  useEffect(() => {
    const hasError = REQUIRED_FIELDS.some(field => {
      const value = (formData[field] || '').toString();
      const error = validateFields(field, value);
      return !!error;
    });

    setIsValid(!hasError);
  }, [formData]);

  const handleBlur = (fieldName: keyof ProductApplicationFormData) => {
    setTouchedFields(prev => ({ ...prev, [fieldName]: true }));

    const value = (formData[fieldName] || "").toString();
    const error = validateFields(fieldName, value);

    setErrors(prev => ({ ...prev, [fieldName]: error }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const fieldName = name as keyof ProductApplicationFormData;

    let processedValue = value;

    if (fieldName === 'applicationDate') {
      processedValue = dateMask(value);
    }

    setFormData((prev) => {
      const updatedFormData = { ...prev, [fieldName]: processedValue };

      // Valida o campo se já foi tocado
      if (touchedFields[fieldName]) {
        const error = validateFields(fieldName, processedValue);
        setErrors(prev => ({ ...prev, [fieldName]: error }));
      }

      return updatedFormData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verifica se há produto selecionado
    if (!product?.registrationNumber) {
      setErrors(prev => ({ ...prev, productName: 'Selecione um produto da lista' }));
      setTouchedFields(prev => ({ ...prev, productName: true }));
      return;
    }

    // 1) Criar produto se necessário (só se for um novo produto)
    let productId = formData.productId;
    if (!productId || productId.trim() === '') {
      const createdProduct = await productService.create(product);
      if (!createdProduct?.id) {
        console.error("Produto criado sem ID");
        setErrors(prev => ({ ...prev, productName: 'Erro ao criar produto' }));
        return;
      }
      productId = createdProduct.id;
    }

    // 2) Criar cópia atualizada
    const updatedForm: ProductApplicationFormData = {
      ...formData,
      productId,
      productName: product.commercialNames[0] || "",
      applicationDate: formData.applicationDate || new Date().toISOString().split("T")[0],
    };

    // 3) Validar updatedForm
    const newErrors: Record<string, string | null> = {};
    const newTouched: Record<string, boolean> = {};

    REQUIRED_FIELDS.forEach(field => {
      const value = (updatedForm[field] || "").toString();
      newTouched[field] = true;

      const error = validateFields(field, value);
      if (error) newErrors[field] = error;
    });

    setTouchedFields(newTouched);
    setErrors(newErrors);

    // 4) Se houver erro, não envia
    const hasErrors = Object.values(newErrors).some(error => error !== null);
    if (hasErrors) return;

    console.log(updatedForm);

    // 5) Atualiza state e envia
    setFormData(updatedForm);
    onSubmit(updatedForm);
  };

  const handleSearchProducts = async (query: string) => {
    const results = await productService.searchProductsByName(query);
    setProductsOptions(results);
  };

  const handleSelectProduct = (prod: ProductFormData) => {
    setProduct(prev => (prev?.registrationNumber === prod.registrationNumber ? null : prod));

    setFormData(prev => ({
      ...prev,
      productName: prod.commercialNames[0] || ""
    }));
  };

  const title = isEditMode ? 'Editar aplicação de produto' : 'Nova aplicação de produto';
  const submitText = isEditMode ? 'Salvar alterações' : 'Salvar aplicação';

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
          <Input
            as="select"
            label="Propriedade associada"
            name="propertyId"
            value={formData.propertyId}
            onChange={handleChange}
            onBlur={() => handleBlur('propertyId')}
            options={propertiesOptions}
            icon={<IoIosArrowDown size={18} />}
            disabled={isLoadingProperties}
            required
            error={errors.propertyId || undefined} // Converter null para undefined
            showError={touchedFields.propertyId && !!errors.propertyId}
          />
          <Input
            as="select"
            label="Cultura associada"
            name="cultureId"
            value={formData.cultureId}
            onChange={handleChange}
            onBlur={() => handleBlur('cultureId')}
            options={culturesOptions}
            icon={<IoIosArrowDown size={18} />}
            disabled={isLoadingCultures}
            required
            error={errors.cultureId || undefined} // Converter null para undefined
            showError={touchedFields.cultureId && !!errors.cultureId}
          />
          <Input
            as="input"
            label="Área/talhão"
            name="area"
            value={formData.area}
            onChange={handleChange}
            onBlur={() => handleBlur('area')}
            required
            error={errors.area || undefined} // Converter null para undefined
            showError={touchedFields.area && !!errors.area}
          />
        </div>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Buscar na base EMBRAPA</h3>
          <div className={styles.section}>
            <SearchBar
              placeholder={"Digite para buscar na Embrapa"}
              onSearch={handleSearchProducts}
            />
            <div className={styles.card}>
              {!product || !product.registrationNumber ? (
                <div className={styles.emptyMessage}>Nenhum produto selecionado</div>
              ) : (
                <>
                  <h3 className={styles.title}>Produto selecionado</h3>
                  <p><strong>Registro:</strong> {product.registrationNumber}</p>
                  <p><strong>Comercial:</strong> {product.commercialNames?.join(", ")}</p>
                  <p><strong>Titular:</strong> {product.registrationHolder}</p>
                  <p><strong>Categorias:</strong> {product.categories?.join(", ")}</p>
                  <div
                    className={
                      product.organicFarmingProduct ? styles.allowed : styles.denied
                    }
                    >
                    {product.organicFarmingProduct ? (
                      <>
                        <FiCheck className={styles.icon} />
                        Permitido em sistemas orgânicos
                      </>
                    ) : (
                      <>
                        <FiX className={styles.icon} />
                        Não permitido em sistemas orgânicos
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
            <ProductCardList
              products={productsOptions}
              value={product?.registrationNumber}
              onSelect={handleSelectProduct}
            />
          </div>
        </div>
        <footer className={styles.footer}>
          <Button variant="tertiary" type="button" onClick={() => navigate(-1)} disabled={isLoading}>Cancelar</Button>
          <Button variant="primary" type="submit" disabled={!isValid || isLoading}>{isLoading ? 'Salvando...' : submitText}</Button>
        </footer>
      </form>
    </div>
  );
}