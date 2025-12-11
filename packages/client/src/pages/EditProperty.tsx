import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PropertyForm, PropertyFormData, TalhaoData } from '../components/properties/PropertyForm/PropertyForm';
import { propertyService } from '../services/property.service';
import { Property, UpdatePropertyDto, Plot } from '../types/property.types';

export default function EditPropertyPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Estados
  const [propertyToEdit, setPropertyToEdit] = useState<Partial<PropertyFormData> | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Efeito para carregar a propriedade ao montar
  useEffect(() => {
    async function loadProperty() {
      if (!id) {
        setIsLoadingData(false);
        return;
      }

      try {
        setIsLoadingData(true);
        const data: Property = await propertyService.findOne(id);

        // Transform plots to talhões format
        const talhoes: TalhaoData[] = (data.plots || []).map(plot => ({
          name: plot.name,
          area: String(plot.area).replace('.', ','),
          situacao: plot.situacao || 'preparo',
          polygon: plot.polygon || null,
        }));

        const mappedData: Partial<PropertyFormData> = {
          name: data.name,
          address: data.address,
          areaTotal: data.totalArea ? String(data.totalArea).replace('.', ',') : '0',
          areaProducao: data.productionArea ? String(data.productionArea).replace('.', ',') : '0',
          cultivo: data.mainCrop,
          talhoes: talhoes,
        };

        setPropertyToEdit(mappedData);
      } catch (error) {
        console.error('Erro ao carregar propriedade:', error);
        alert('Não foi possível carregar os dados da propriedade.');
        navigate('/properties');
      } finally {
        setIsLoadingData(false);
      }
    }

    loadProperty();
  }, [id, navigate]);

  const handleEdit = async (data: PropertyFormData) => {
    if (!id) return;

    try {
      setIsSaving(true);

      // Transform talhões to plots
      const plots: Plot[] = data.talhoes.map(talhao => ({
        name: talhao.name,
        area: parseFloat(talhao.area.replace(',', '.')),
        culture: '',
        situacao: talhao.situacao,
        polygon: talhao.polygon,
      }));

      const updateData: UpdatePropertyDto = {
        name: data.name,
        address: data.address,
        totalArea: data.areaTotal ? parseFloat(data.areaTotal.replace(',', '.')) : undefined,
        productionArea: data.areaProducao ? parseFloat(data.areaProducao.replace(',', '.')) : undefined,
        mainCrop: data.cultivo,
        plots: plots.length > 0 ? plots : undefined,
      };

      await propertyService.update(id, updateData);

      navigate('/properties');
    } catch (error) {
      console.error('Erro ao atualizar propriedade:', error);
      alert('Erro ao salvar as alterações. Verifique os dados.');
    } finally {
      setIsSaving(false);
    }
  };

  // Renderização de estados
  if (isLoadingData) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
        <p>Carregando dados da propriedade...</p>
      </div>
    );
  }

  if (!propertyToEdit) {
    return <div>Propriedade não encontrada.</div>;
  }

  return (
    <PropertyForm
      initialData={propertyToEdit}
      onSubmit={handleEdit}
      isLoading={isSaving}
    />
  );
}