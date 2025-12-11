import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoIosArrowDown } from "react-icons/io";
import styles from "./CultureForm.module.css";
import { Button } from "../../common/Button/Button";
import { Radio } from "../../common/Radio/Radio";
import { Input } from "../../common/Input/Input";
import { CultureSearchSelect } from "../CultureSearchSelect/CultureSearchSelect";
import { propertyService } from "../../../services/property.service";

export type CultureFormData = {
  propertyId: string;
  cultureName: string;
  cultivar: string;
  cycle: string;
  origin: "organic" | "conventional" | "transgenic";
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

export function CultureForm({
  initialData,
  onSubmit,
  isLoading = false,
}: Props) {
  const navigate = useNavigate();
  const isEditMode = !!initialData;

  const [formData, setFormData] = useState<CultureFormData>({
    propertyId: initialData?.propertyId || "",
    cultureName: initialData?.cultureName || "",
    cultivar: initialData?.cultivar || "",
    cycle: initialData?.cycle || "",
    origin: initialData?.origin || "conventional",
    supplier: initialData?.supplier || "",
    plantingDate: initialData?.plantingDate || "",
    plantingArea: initialData?.plantingArea || "",
    observations: initialData?.observations || "",
    plotName: initialData?.plotName || "",
  });

  const [properties, setProperties] = useState<any[]>([]);
  const [areaInputType, setAreaInputType] = useState<"hectares" | "plot">(
    initialData?.plotName ? "plot" : "hectares",
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
          const prop = response.data.find(
            (p: any) => p.id === initialData.propertyId,
          );
          setSelectedProperty(prop);
        }
      } catch (error) {
        console.error("Erro ao carregar propriedades:", error);
      }
    };
    fetchProperties();
  }, []);

  // Atualiza propriedade selecionada quando propertyId muda
  useEffect(() => {
    if (formData.propertyId) {
      const prop = properties.find((p) => p.id === formData.propertyId);
      setSelectedProperty(prop);
      // Se mudar de propriedade E não estiver editando, limpar seleção de talhão
      if (areaInputType === "plot" && !isEditMode) {
        setFormData((prev) => ({ ...prev, plotName: "" }));
      }
    }
  }, [formData.propertyId, properties]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOriginChange = (
    value: "organic" | "conventional" | "transgenic",
  ) => {
    setFormData((prev) => ({ ...prev, origin: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleCultureChange = (cultureName: string) => {
    setFormData((prev) => ({ ...prev, cultureName }));
  };

  const handleAreaTypeChange = (type: "hectares" | "plot") => {
    setAreaInputType(type);
    if (type === "hectares") {
      setFormData((prev) => ({ ...prev, plotName: "" }));
    } else {
      setFormData((prev) => ({ ...prev, plantingArea: "" }));
    }
  };

  const handlePlotChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const plotName = e.target.value;
    const plot = selectedProperty?.plots?.find((p: any) => p.name === plotName);
    setFormData((prev) => ({
      ...prev,
      plotName,
      plantingArea: plot ? plot.area.toString() : "",
    }));
  };

  const submitText = isEditMode ? "Salvar alterações" : "Salvar cultura";
  const hasPlots = selectedProperty?.plots && selectedProperty.plots.length > 0;

  // Validação de campos obrigatórios
  const isFormValid = () => {
    // Campos sempre obrigatórios
    if (!formData.propertyId) return false;
    if (!formData.cultureName || formData.cultureName.trim() === "")
      return false;
    if (!formData.cultivar || formData.cultivar.trim() === "") return false;
    if (!formData.cycle || formData.cycle.trim() === "") return false;
    if (!formData.supplier || formData.supplier.trim() === "") return false;
    if (!formData.plantingDate || formData.plantingDate.trim() === "")
      return false;

    // Validação da área de plantio (hectares ou talhão)
    if (areaInputType === "hectares") {
      if (!formData.plantingArea || formData.plantingArea.trim() === "")
        return false;

      // Verificar se a área não excede a área de produção da propriedade
      if (selectedProperty) {
        const plantingArea = parseFloat(formData.plantingArea);
        const maxArea =
          selectedProperty.productionArea || selectedProperty.totalArea;
        if (plantingArea > maxArea) return false;
      }
    } else {
      if (!formData.plotName || formData.plotName.trim() === "") return false;
    }

    return true;
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          {isEditMode ? "Editar cultura" : "Nova cultura"}
        </h1>
      </header>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Propriedade associada */}
        <Input
          as="select"
          label="Propriedade associada"
          name="propertyId"
          value={formData.propertyId}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, propertyId: e.target.value }))
          }
          options={[
            { label: "Selecione uma propriedade", value: "" },
            ...properties.map((prop) => ({
              label: prop.name,
              value: prop.id,
            })),
          ]}
          icon={<IoIosArrowDown size={18} />}
          required
        />

        {/* Cultura */}
        <CultureSearchSelect
          value={formData.cultureName}
          onChange={handleCultureChange}
          label="Cultura"
          required
        />

        {/* Nome do cultivar/variedade */}
        <Input
          label="Nome do cultivar/variedade"
          name="cultivar"
          value={formData.cultivar}
          onChange={handleChange}
          required
        />

        {/* Ciclo */}
        <Input
          label="Ciclo (em dias)"
          name="cycle"
          type="number"
          value={formData.cycle}
          onChange={handleChange}
          required
        />

        {/* Origem */}
        <div className={styles.section}>
          <h3 className={styles.textTitle}>Origem *</h3>
          <div className={styles.radioGroup}>
            <Radio
              name="origin"
              value="organic"
              label="Orgânico"
              checked={formData.origin === "organic"}
              onChange={() => handleOriginChange("organic")}
            />
            <Radio
              name="origin"
              value="conventional"
              label="Convencional"
              checked={formData.origin === "conventional"}
              onChange={() => handleOriginChange("conventional")}
            />
            <Radio
              name="origin"
              value="transgenic"
              label="Transgênico"
              checked={formData.origin === "transgenic"}
              onChange={() => handleOriginChange("transgenic")}
            />
          </div>
        </div>

        {/* Fornecedor/empresa sementeira */}
        <Input
          label="Fornecedor/empresa sementeira"
          name="supplier"
          value={formData.supplier}
          onChange={handleChange}
          required
        />

        {/* Data de plantio prevista ou realizada */}
        <Input
          label="Data de plantio prevista ou realizada"
          name="plantingDate"
          type="date"
          value={formData.plantingDate}
          onChange={handleChange}
          required
        />

        {/* Área de plantio */}
        <div className={styles.section}>
          <h3 className={styles.textTitle}>Área de plantio</h3>

          {formData.propertyId && hasPlots && (
            <div
              className={styles.radioGroup}
              style={{
                flexDirection: "row",
                gap: "1.5rem",
                marginBottom: "0.75rem",
              }}
            >
              <Radio
                name="areaType"
                value="hectares"
                label="Hectares"
                checked={areaInputType === "hectares"}
                onChange={() => handleAreaTypeChange("hectares")}
              />
              <Radio
                name="areaType"
                value="plot"
                label="Talhão"
                checked={areaInputType === "plot"}
                onChange={() => handleAreaTypeChange("plot")}
              />
            </div>
          )}

          {formData.propertyId && !hasPlots && (
            <p
              style={{
                fontSize: "0.85rem",
                color: "#667085",
                marginBottom: "0.5rem",
              }}
            >
              Esta propriedade não possui talhões cadastrados. Digite a área em
              hectares.
            </p>
          )}

          {areaInputType === "hectares" ? (
            <>
              <Input
                label="Área em hectares"
                name="plantingArea"
                type="number"
                step="0.01"
                min="0.01"
                max={
                  selectedProperty
                    ? selectedProperty.productionArea ||
                      selectedProperty.totalArea
                    : undefined
                }
                value={formData.plantingArea}
                onChange={handleChange}
                required
              />
              {selectedProperty &&
                formData.plantingArea &&
                parseFloat(formData.plantingArea) >
                  (selectedProperty.productionArea ||
                    selectedProperty.totalArea) && (
                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: "#d92d20",
                      marginTop: "0.5rem",
                    }}
                  >
                    A área de plantio não pode ser maior que a área de produção
                    da propriedade (
                    {selectedProperty.productionArea ||
                      selectedProperty.totalArea}{" "}
                    ha)
                  </p>
                )}
            </>
          ) : (
            <>
              {selectedProperty?.plots && selectedProperty.plots.length > 0 ? (
                <Input
                  as="select"
                  label="Selecione o talhão"
                  name="plotName"
                  value={formData.plotName}
                  onChange={handlePlotChange}
                  options={[
                    { label: "Selecione um talhão", value: "" },
                    ...selectedProperty.plots.map((plot: any) => ({
                      label: `${plot.name} - ${plot.area} hectares`,
                      value: plot.name,
                    })),
                  ]}
                  icon={<IoIosArrowDown size={18} />}
                  required
                />
              ) : (
                <p
                  style={{
                    fontSize: "0.9rem",
                    color: "#d92d20",
                    padding: "0.75rem",
                    backgroundColor: "#fef3f2",
                    borderRadius: "8px",
                  }}
                >
                  Não há talhões cadastrados para esta propriedade.
                </p>
              )}
            </>
          )}
        </div>

        {/* Observações adicionais */}
        <Input
          as="textarea"
          label="Observações adicionais"
          name="observations"
          value={formData.observations}
          onChange={handleChange}
          rows={4}
        />

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
            disabled={isLoading || !isFormValid()}
          >
            {isLoading ? "Salvando..." : submitText}
          </Button>
        </footer>
      </form>
    </div>
  );
}
