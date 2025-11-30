import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CultureForm, CultureFormData } from '../components/cultures/CultureForm/CultureForm';
import { cultureService } from '../services/culture.service';
import { CreateCultureDto } from '../types/culture.types';

export default function NewCulture() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (data: CultureFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Transform form data to match backend DTO
      const cultureDto: CreateCultureDto = {
        propertyId: data.propertyId,
        cultureName: data.cultureName,
        cultivar: data.cultivar || undefined,
        cycle: parseInt(data.cycle),
        origin: data.origin,
        supplier: data.supplier || undefined,
        plantingDate: data.plantingDate,
        plantingArea: parseFloat(data.plantingArea),
        plotName: data.plotName || undefined,
        observations: data.observations || undefined,
      };

      // Validate required fields
      if (!cultureDto.propertyId || !cultureDto.cultureName || !cultureDto.cycle || !cultureDto.plantingDate || !cultureDto.plantingArea) {
        setError('Preencha todos os campos obrigatórios');
        setIsLoading(false);
        return;
      }

      // Call API
      await cultureService.create(cultureDto);

      // Success - navigate to cultures list
      navigate('/cultures');
    } catch (err: any) {
      console.error('Erro ao criar cultura:', err);
      setError(err.message || 'Erro ao criar cultura. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <div
          style={{
            padding: '12px',
            backgroundColor: '#fee',
            color: '#c33',
            borderRadius: '4px',
            marginBottom: '16px',
            fontSize: '14px',
            maxWidth: '800px',
            margin: '0 auto 16px',
          }}
        >
          {error}
        </div>
      )}
      <CultureForm onSubmit={handleCreate} isLoading={isLoading} />
    </div>
  );
}
