import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { propertyService } from "../../services/property.service.ts";
import { cultureService } from "../../services/culture.service.ts";
import styles from "./ProductApplicationForm.module.css";
import { Input } from "../common/Input/Input.tsx";
import { Button } from "../common/Button/Button.tsx";
import { FiArrowLeft, FiCheck, FiX } from "react-icons/fi";
import { ProductApplicationFormData } from "../../types/productApplication.types.ts";
import { ProductCardList } from "./ProductCardList.tsx";
import { ProductFormData } from "../../types/product.types.ts";
import { SearchBar } from "../common/SearchableBar/SearchableBar.tsx";
import { IoIosArrowDown } from "react-icons/io";
import { isValidDate } from "../../utils/validators.ts";
import { dateMask } from "../../utils/masks.ts";
import { productService } from "../../services/product.service.ts";

type Props = {
  initialData?: Partial<ProductApplicationFormData>;
  onSubmit: (data: ProductApplicationFormData) => void;
  isLoading?: boolean;
  initialProduct?: Partial<ProductFormData>;
};

const REQUIRED_FIELDS: (keyof ProductApplicationFormData)[] = [
  "propertyId",
  "cultureId",
  "area",
  "productName",
  // "date",
];

export function ProductApplicationForm({
  initialData,
  onSubmit,
  isLoading = false,
  initialProduct,
}: Props) {
  const navigate = useNavigate();
  const isEditMode = !!initialData;

  const [formData, setFormData] = useState<ProductApplicationFormData>({
    propertyId: initialData?.propertyId || "",
    cultureId: initialData?.cultureId || "",
    area: initialData?.area || "",
    productId: initialData?.productId || "",
    productName: initialData?.productName || "",
    applicationDate: initialData?.applicationDate || "",
  });

  const [areaInputType, setAreaInputType] = useState<"hectares" | "plot">(
    "hectares",
  );
  const [plotName, setPlotName] = useState<string>("");
  const [selectedProperty, setSelectedProperty] = useState<any>(null);

  // ESTADOS PARA PROPRIEDADES
  const [propertiesOptions, setPropertiesOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [allProperties, setAllProperties] = useState<any[]>([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(false);

  // ESTADOS PARA CULTURAS
  const [culturesOptions, setCulturesOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [allCultures, setAllCultures] = useState<any[]>([]);
  const [isLoadingCultures, setIsLoadingCultures] = useState(false);

  // ESTADOS PARA PRODUTO
  const [product, setProduct] = useState<ProductFormData | null>(
    initialProduct
      ? {
          registrationNumber: initialProduct?.registrationNumber || "",
          commercialNames: initialProduct?.commercialNames || [],
          registrationHolder: initialProduct?.registrationHolder || "",
          categories: initialProduct?.categories || [],
          activeIngredients: initialProduct?.activeIngredients || [],
          organicFarmingProduct: initialProduct?.organicFarmingProduct || false,
        }
      : null,
  );

  const [productsOptions, setProductsOptions] = useState<ProductFormData[]>([]);

  // ESTADOS PARA VALIDAÇÃO - MUDE O TIPO PARA PERMITIR NULL
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>(
    {},
  );
  const [errors, setErrors] = useState<Record<string, string | null>>({}); // Permitir null
  const [isValid, setIsValid] = useState(false);

  // Carrega propriedades do usuário
  useEffect(() => {
    async function fetchProperties() {
      setIsLoadingProperties(true);
      try {
        const response = await propertyService.findAll(1, 100);
        setAllProperties(response.data);

        const options = response.data.map((p) => ({
          label: p.name,
          value: p.id,
        }));
        setPropertiesOptions(options);
      } catch (error) {
        console.error(
          "[ProductApplicationForm] Erro ao carregar propriedades:",
          error,
        );
      } finally {
        setIsLoadingProperties(false);
      }
    }

    fetchProperties();
  }, []);

  // Atualiza a propriedade selecionada quando propertyId muda
  useEffect(() => {
    if (formData.propertyId && allProperties.length > 0) {
      const property = allProperties.find((p) => p.id === formData.propertyId);
      setSelectedProperty(property || null);

      // Define o tipo de área baseado se há talhões
      const hasPlots = property?.plots && property.plots.length > 0;
      if (!hasPlots) {
        setAreaInputType("hectares");
      }
    } else {
      setSelectedProperty(null);
    }
  }, [formData.propertyId, allProperties]);

  // Carrega culturas do usuário
  useEffect(() => {
    async function fetchCulturesForProperty() {
      if (!formData.propertyId || allProperties.length === 0) {
        setCulturesOptions([]);
        // Limpa o cultureId e define o erro se a propriedade for removida
        if (formData.cultureId) {
          setFormData((prev) => ({ ...prev, cultureId: "" }));
        }
        if (formData.propertyId.trim() === "") {
          setErrors((prev) => ({
            ...prev,
            cultureId: "Selecione uma propriedade primeiro",
          }));
        } else if (allProperties.length === 0) {
          setErrors((prev) => ({
            ...prev,
            cultureId: "Propriedades não carregadas",
          }));
        }

        return;
      }

      setIsLoadingCultures(true);

      try {
        const selectedProperty = allProperties.find(
          (p) => p.id === formData.propertyId,
        );

        if (selectedProperty) {
          // Limpa o cultureId enquanto carrega novas culturas
          setFormData((prev) => ({ ...prev, cultureId: "" }));
          setErrors((prev) => ({ ...prev, cultureId: null })); // Use null para limpar

          const cultures = await cultureService.findByProperty(
            selectedProperty.id,
          );
          setAllCultures(cultures);

          const options = cultures.map((c) => ({
            label: `${c.cultureName}${c.cultivar ? ` - ${c.cultivar}` : ""}`,
            value: c.id,
          }));

          setCulturesOptions(options);

          // Se estiver editando e a cultura atual pertence a esta propriedade, mantém selecionada
          if (isEditMode && initialData?.cultureId) {
            const currentCultureExists = cultures.some(
              (c) => c.id === initialData.cultureId,
            );
            if (currentCultureExists) {
              setFormData((prev) => ({
                ...prev,
                cultureId: initialData.cultureId!,
              }));
              setErrors((prev) => ({ ...prev, cultureId: null })); // Use null para limpar
            }
          }

          // Se não houver culturas, mostra erro
          if (cultures.length === 0) {
            setErrors((prev) => ({
              ...prev,
              cultureId: "Nenhuma cultura encontrada para esta propriedade",
            }));
          }
        } else {
          setCulturesOptions([]);
          setFormData((prev) => ({ ...prev, cultureId: "" }));
          setErrors((prev) => ({
            ...prev,
            cultureId: "Propriedade não encontrada",
          }));
        }
      } catch (error) {
        console.error("[ActivityForm] Erro ao carregar culturas:", error);
        setCulturesOptions([]);
        setFormData((prev) => ({ ...prev, cultureId: "" }));
        setErrors((prev) => ({
          ...prev,
          cultureId: "Erro ao carregar culturas",
        }));
      } finally {
        setIsLoadingCultures(false);
      }
    }

    fetchCulturesForProperty();
  }, [formData.propertyId, allProperties, isEditMode]);

  // VALIDAÇÃO DO CAMPO DE DATA
  const validateDate = (dateValue: string): string | null => {
    if (!dateValue || dateValue.trim() === "") {
      return "Data da aplicação é obrigatória";
    }

    if (dateValue.length < 10) {
      return "Data incompleta (DD/MM/AAAA)";
    }

    if (!isValidDate(dateValue)) {
      return "Data inválida. Verifique o dia e o mês.";
    }

    const [day, month, year] = dateValue.split("/").map(Number);
    const selectedDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate > today) {
      return "Data não pode ser futura";
    }

    return null; // <-- quando não há erro
  };

  // VALIDAÇÃO DOS OUTROS CAMPOS OBRIGATÓRIOS
  const validateFields = (
    fieldName: keyof ProductApplicationFormData,
    value: string,
  ): string | null => {
    if (fieldName === "applicationDate") return validateDate(value);

    switch (fieldName) {
      case "propertyId":
        if (!value || value.trim() === "") return "Propriedade é obrigatória";
        return null;
      case "cultureId":
        if (!value || value.trim() === "") return "Cultura é obrigatória";
        return null;
      case "area":
        if (!value || value.trim() === "")
          return "Área da aplicação é obrigatório";

        // Validar se a área não excede a área da cultura selecionada
        if (formData.cultureId && areaInputType === "hectares") {
          const selectedCulture = allCultures.find(
            (c) => c.id === formData.cultureId,
          );
          if (selectedCulture) {
            const areaValue = parseFloat(value);

            // Se a cultura está associada a um talhão, validar contra a área do talhão
            if (selectedCulture.plotName && selectedProperty?.plots) {
              const plot = selectedProperty.plots.find(
                (p: any) => p.name === selectedCulture.plotName,
              );
              if (plot) {
                const plotArea = parseFloat(plot.area.toString());
                if (areaValue > plotArea) {
                  return `Área não pode exceder a área do talhão ${plot.name} (${plotArea} ha)`;
                }
              }
            } else {
              // Se não tem talhão, validar contra a plantingArea da cultura
              const cultureArea = parseFloat(selectedCulture.plantingArea);
              if (areaValue > cultureArea) {
                return `Área não pode exceder a área da cultura (${cultureArea} ha)`;
              }
            }
          }
        }

        // Validar se a área não excede a área da propriedade
        if (selectedProperty && areaInputType === "hectares") {
          const areaValue = parseFloat(value);
          const maxArea =
            selectedProperty.productionArea || selectedProperty.totalArea;
          if (areaValue > maxArea) {
            return `Área não pode exceder ${maxArea} ha`;
          }
        }

        return null;
      case "productId":
        if (!value || value.trim() === "") return "Produto é obrigatória";
        return null;
      case "productName":
        if (!value || value.trim() === "") return "Produto é obrigatória";
        return null;
      default:
        return null;
    }
  };

  useEffect(() => {
    const hasError = REQUIRED_FIELDS.some((field) => {
      const value = (formData[field] || "").toString();
      const error = validateFields(field, value);
      return !!error;
    });

    setIsValid(!hasError);
  }, [formData]);

  const handleBlur = (fieldName: keyof ProductApplicationFormData) => {
    setTouchedFields((prev) => ({ ...prev, [fieldName]: true }));

    const value = (formData[fieldName] || "").toString();
    const error = validateFields(fieldName, value);

    setErrors((prev) => ({ ...prev, [fieldName]: error }));
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    const fieldName = name as keyof ProductApplicationFormData;

    let processedValue = value;

    if (fieldName === "applicationDate") {
      processedValue = dateMask(value);
    }

    setFormData((prev) => {
      const updatedFormData = { ...prev, [fieldName]: processedValue };

      // Valida o campo se já foi tocado
      if (touchedFields[fieldName]) {
        const error = validateFields(fieldName, processedValue);
        setErrors((prev) => ({ ...prev, [fieldName]: error }));
      }

      return updatedFormData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verifica se há produto selecionado
    if (!product?.registrationNumber) {
      setErrors((prev) => ({
        ...prev,
        productName: "Selecione um produto da lista",
      }));
      setTouchedFields((prev) => ({ ...prev, productName: true }));
      return;
    }

    // 1) Criar produto se necessário (só se for um novo produto)
    let productId = formData.productId;
    if (!productId || productId.trim() === "") {
      const createdProduct = await productService.create(product);
      if (!createdProduct?.id) {
        console.error("Produto criado sem ID");
        setErrors((prev) => ({
          ...prev,
          productName: "Erro ao criar produto",
        }));
        return;
      }
      productId = createdProduct.id;
    }

    // 2) Criar cópia atualizada
    const updatedForm: ProductApplicationFormData = {
      ...formData,
      productId,
      productName: product.commercialNames[0] || "",
      applicationDate:
        formData.applicationDate || new Date().toISOString().split("T")[0],
    };

    // 3) Validar updatedForm
    const newErrors: Record<string, string | null> = {};
    const newTouched: Record<string, boolean> = {};

    REQUIRED_FIELDS.forEach((field) => {
      const value = (updatedForm[field] || "").toString();
      newTouched[field] = true;

      const error = validateFields(field, value);
      if (error) newErrors[field] = error;
    });

    setTouchedFields(newTouched);
    setErrors(newErrors);

    // 4) Se houver erro, não envia
    const hasErrors = Object.values(newErrors).some((error) => error !== null);
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
    setProduct((prev) =>
      prev?.registrationNumber === prod.registrationNumber ? null : prod,
    );

    setFormData((prev) => ({
      ...prev,
      productName: prod.commercialNames[0] || "",
    }));
  };

  const handleAreaTypeChange = (type: "hectares" | "plot") => {
    setAreaInputType(type);
    if (type === "hectares") {
      setPlotName("");
      setFormData((prev) => ({ ...prev, cultureId: "" }));
    } else {
      setFormData((prev) => ({ ...prev, area: "" }));
    }
  };

  const handlePlotChange = async (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const selectedPlotName = e.target.value;
    console.log("[handlePlotChange] Talhão selecionado:", selectedPlotName);
    setPlotName(selectedPlotName);

    if (!selectedPlotName) {
      setFormData((prev) => ({ ...prev, area: "", cultureId: "" }));
      return;
    }

    const plot = selectedProperty?.plots?.find(
      (p: any) => p.name === selectedPlotName,
    );
    console.log("[handlePlotChange] Plot encontrado:", plot);

    if (plot) {
      // Preenche a área automaticamente
      setFormData((prev) => ({ ...prev, area: plot.area.toString() }));

      // Busca a cultura associada a este talhão
      try {
        setIsLoadingCultures(true);
        const cultures = await cultureService.findByProperty(
          formData.propertyId,
        );
        console.log(
          "[handlePlotChange] Todas as culturas da propriedade:",
          cultures,
        );
        console.log(
          "[handlePlotChange] Procurando por plotName:",
          selectedPlotName,
        );

        // Verifica todas as culturas e seus plotNames
        cultures.forEach((c) => {
          console.log(
            `[handlePlotChange] Cultura: ${c.cultureName}, plotName: "${c.plotName}"`,
          );
        });

        const cultureForPlot = cultures.find((c) => {
          console.log(
            `[handlePlotChange] Comparando "${c.plotName}" === "${selectedPlotName}"`,
          );
          return c.plotName && c.plotName.trim() === selectedPlotName.trim();
        });

        console.log(
          "[handlePlotChange] Cultura encontrada para o talhão:",
          cultureForPlot,
        );

        if (cultureForPlot) {
          setFormData((prev) => ({ ...prev, cultureId: cultureForPlot.id }));
          console.log(
            "[handlePlotChange] Cultura setada:",
            cultureForPlot.id,
            cultureForPlot.cultureName,
          );
        } else {
          setFormData((prev) => ({ ...prev, cultureId: "" }));
          console.log(
            "[handlePlotChange] Nenhuma cultura encontrada para este talhão",
          );
        }
      } catch (error) {
        console.error(
          "[handlePlotChange] Erro ao buscar cultura do talhão:",
          error,
        );
      } finally {
        setIsLoadingCultures(false);
      }
    }
  };

  const title = isEditMode
    ? "Editar aplicação de produto"
    : "Nova aplicação de produto";
  const submitText = isEditMode ? "Salvar alterações" : "Salvar aplicação";

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
            onBlur={() => handleBlur("propertyId")}
            options={propertiesOptions}
            icon={<IoIosArrowDown size={18} />}
            disabled={isLoadingProperties}
            required
            error={errors.propertyId || undefined}
          />

          {formData.propertyId && selectedProperty && (
            <>
              <label className={styles.label}>
                Área da aplicação <span style={{ color: "red" }}>*</span>
              </label>

              {selectedProperty.plots && selectedProperty.plots.length > 0 && (
                <div className={styles.radioGroup}>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="areaType"
                      value="hectares"
                      checked={areaInputType === "hectares"}
                      onChange={() => handleAreaTypeChange("hectares")}
                    />
                    <span>Hectares</span>
                  </label>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="areaType"
                      value="plot"
                      checked={areaInputType === "plot"}
                      onChange={() => handleAreaTypeChange("plot")}
                    />
                    <span>Talhão</span>
                  </label>
                </div>
              )}

              {!selectedProperty.plots ||
                (selectedProperty.plots.length === 0 && (
                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: "#667085",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Esta propriedade não possui talhões cadastrados. Digite a
                    área em hectares.
                  </p>
                ))}

              {areaInputType === "hectares" ? (
                <>
                  <Input
                    as="input"
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={(() => {
                      const selectedCulture = allCultures.find(
                        (c) => c.id === formData.cultureId,
                      );
                      if (selectedCulture) {
                        // Se cultura tem talhão, usar área do talhão
                        if (
                          selectedCulture.plotName &&
                          selectedProperty?.plots
                        ) {
                          const plot = selectedProperty.plots.find(
                            (p: any) => p.name === selectedCulture.plotName,
                          );
                          if (plot) return parseFloat(plot.area.toString());
                        }
                        // Caso contrário, usar plantingArea da cultura
                        return parseFloat(selectedCulture.plantingArea);
                      }
                      if (selectedProperty)
                        return (
                          selectedProperty.productionArea ||
                          selectedProperty.totalArea
                        );
                      return undefined;
                    })()}
                    label="Área (em hectares)"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    onBlur={() => handleBlur("area")}
                    placeholder="Digite a área em hectares"
                    required
                    error={errors.area || undefined}
                  />
                  {(() => {
                    const selectedCulture = allCultures.find(
                      (c) => c.id === formData.cultureId,
                    );
                    if (selectedCulture && formData.area) {
                      const areaValue = parseFloat(formData.area);

                      // Se cultura tem talhão, validar contra área do talhão
                      if (selectedCulture.plotName && selectedProperty?.plots) {
                        const plot = selectedProperty.plots.find(
                          (p: any) => p.name === selectedCulture.plotName,
                        );
                        if (plot) {
                          const plotArea = parseFloat(plot.area.toString());
                          if (areaValue > plotArea) {
                            return (
                              <p
                                style={{
                                  fontSize: "0.85rem",
                                  color: "#d92d20",
                                  marginTop: "0.5rem",
                                }}
                              >
                                A área da aplicação não pode ser maior que a
                                área do talhão {plot.name} ({plotArea} ha)
                              </p>
                            );
                          }
                        }
                      } else {
                        // Se não tem talhão, validar contra plantingArea
                        const cultureArea = parseFloat(
                          selectedCulture.plantingArea,
                        );
                        if (areaValue > cultureArea) {
                          return (
                            <p
                              style={{
                                fontSize: "0.85rem",
                                color: "#d92d20",
                                marginTop: "0.5rem",
                              }}
                            >
                              A área da aplicação não pode ser maior que a área
                              da cultura ({cultureArea} ha)
                            </p>
                          );
                        }
                      }
                    }
                    if (
                      selectedProperty &&
                      formData.area &&
                      parseFloat(formData.area) >
                        (selectedProperty.productionArea ||
                          selectedProperty.totalArea)
                    ) {
                      return (
                        <p
                          style={{
                            fontSize: "0.85rem",
                            color: "#d92d20",
                            marginTop: "0.5rem",
                          }}
                        >
                          A área da aplicação não pode ser maior que a área de
                          produção da propriedade (
                          {selectedProperty.productionArea ||
                            selectedProperty.totalArea}{" "}
                          ha)
                        </p>
                      );
                    }
                    return null;
                  })()}
                </>
              ) : (
                <Input
                  as="select"
                  label="Talhão"
                  name="plotName"
                  value={plotName}
                  onChange={handlePlotChange}
                  options={
                    selectedProperty.plots?.map((plot: any) => ({
                      label: `${plot.name} - ${plot.area} hectares`,
                      value: plot.name,
                    })) || []
                  }
                  icon={<IoIosArrowDown size={18} />}
                  required
                />
              )}
            </>
          )}

          <Input
            as="select"
            label="Cultura associada"
            name="cultureId"
            value={formData.cultureId}
            onChange={handleChange}
            onBlur={() => handleBlur("cultureId")}
            options={[
              { label: "Selecione uma cultura", value: "" },
              ...culturesOptions,
            ]}
            icon={<IoIosArrowDown size={18} />}
            disabled={isLoadingCultures}
            required
            error={errors.cultureId || undefined}
          />
          {isLoadingCultures && formData.propertyId && (
            <p style={{ fontSize: "0.85rem", color: "#667085" }}>
              Carregando culturas...
            </p>
          )}
          {areaInputType === "plot" && plotName && !formData.cultureId && (
            <p style={{ fontSize: "0.85rem", color: "#667085" }}>
              Nenhuma cultura associada a este talhão.
            </p>
          )}
          {areaInputType === "plot" && plotName && formData.cultureId && (
            <p style={{ fontSize: "0.85rem", color: "#16a34a" }}>
              ✓ Cultura preenchida automaticamente com base no talhão
            </p>
          )}
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
                <div className={styles.emptyMessage}>
                  Nenhum produto selecionado
                </div>
              ) : (
                <>
                  <h3 className={styles.title}>Produto selecionado</h3>
                  <p>
                    <strong>Registro:</strong> {product.registrationNumber}
                  </p>
                  <p>
                    <strong>Comercial:</strong>{" "}
                    {product.commercialNames?.join(", ")}
                  </p>
                  <p>
                    <strong>Titular:</strong> {product.registrationHolder}
                  </p>
                  <p>
                    <strong>Categorias:</strong>{" "}
                    {product.categories?.join(", ")}
                  </p>
                  <div
                    className={
                      product.organicFarmingProduct
                        ? styles.allowed
                        : styles.denied
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
            {isLoading ? "Salvando..." : submitText}
          </Button>
        </footer>
      </form>
    </div>
  );
}
