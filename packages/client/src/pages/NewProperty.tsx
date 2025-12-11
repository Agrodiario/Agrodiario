// src/pages/NewPropertyPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PropertyForm,
  PropertyFormData,
} from "../components/properties/PropertyForm/PropertyForm";
import { propertyService } from "../services/property.service";
import { CreatePropertyDto, Plot } from "../types/property.types";

export default function NewPropertyPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (data: PropertyFormData) => {
    console.log("data", data);
    setIsLoading(true);
    setError(null);

    try {
      // Transform talhões to plots
      const plots: Plot[] = data.talhoes.map((talhao) => ({
        name: talhao.name,
        area: parseFloat(talhao.area.replace(",", ".")),
        culture: "",
        situacao: talhao.situacao,
        polygon: talhao.polygon,
      }));

      // Transform form data to match backend DTO
      const propertyDto: CreatePropertyDto = {
        name: data.name,
        address: data.address,
        totalArea: parseFloat(data.areaTotal.replace(",", ".")),
        productionArea: parseFloat(data.areaProducao.replace(",", ".")),
        mainCrop: data.cultivo,
        certifications: "", // Optional field - can be empty for now
        plots: plots.length > 0 ? plots : undefined,
      };

      // Validate data
      if (propertyDto.productionArea > propertyDto.totalArea) {
        console.log(
          "error",
          "A área de produção não pode ser maior que a área total",
        );
        setError("A área de produção não pode ser maior que a área total");
        setIsLoading(false);
        return;
      }

      if (!propertyDto.name || !propertyDto.address || !propertyDto.mainCrop) {
        console.log("error", "Preencha todos os campos obrigatórios");
        setError("Preencha todos os campos obrigatórios");
        setIsLoading(false);
        return;
      }

      // Call API
      await propertyService.create(propertyDto);

      // Success - navigate to properties list
      navigate("/properties");
    } catch (err: any) {
      console.error("Erro ao criar propriedade:", err);
      setError(err.message || "Erro ao criar propriedade. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <div
          style={{
            padding: "12px",
            backgroundColor: "#fee",
            color: "#c33",
            borderRadius: "4px",
            marginBottom: "16px",
            fontSize: "14px",
            maxWidth: "800px",
            margin: "0 auto 16px",
          }}
        >
          {error}
        </div>
      )}
      <PropertyForm onSubmit={handleCreate} isLoading={isLoading} />
    </div>
  );
}
