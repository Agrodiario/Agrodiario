import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CultureForm, CultureFormData } from '../components/cultures/CultureForm/CultureForm';
import { cultureService } from '../services/culture.service';
import { UpdateCultureDto } from '../types/culture.types';

export default function EditCulture() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<Partial<CultureFormData> | undefined>();

  // Fetch culture data on mount
  useEffect(() => {
    const fetchCulture = async () => {
      if (!id) {
        navigate('/cultures');
        return;
      }

      try {
        setIsFetching(true);
        const culture = await cultureService.findOne(id);
        
        console.log('Culture loaded:', culture);

        // Transform backend data to form data
        const plantingDateStr = typeof culture.plantingDate === 'string' 
          ? culture.plantingDate.split('T')[0] 
          : new Date(culture.plantingDate).toISOString().split('T')[0];

        setInitialData({
          propertyId: culture.propertyId,
          cultureName: culture.cultureName,
          cultivar: culture.cultivar || '',
          cycle: culture.cycle.toString(),
          origin: (culture.origin as 'organic' | 'conventional' | 'transgenic') || 'conventional',
          supplier: culture.supplier || '',
          plantingDate: plantingDateStr,
          plantingArea: culture.plantingArea.toString(),
          observations: culture.observations || '',
        });
      } catch (err: any) {
        console.error('Erro completo ao carregar cultura:', err);
        console.error('Response:', err.response);
        console.error('Message:', err.message);
        setError(err.response?.data?.message || err.message || 'Erro ao carregar cultura. Tente novamente.');
      } finally {
        setIsFetching(false);
      }
    };

    fetchCulture();
  }, [id, navigate]);

  const handleUpdate = async (data: CultureFormData) => {
    if (!id) return;

    setIsLoading(true);
    setError(null);

    try {
      // Transform form data to match backend DTO
      const updateDto: UpdateCultureDto = {
        cultureName: data.cultureName,
        cultivar: data.cultivar || undefined,
        cycle: parseInt(data.cycle),
        origin: data.origin,
        supplier: data.supplier || undefined,
        plantingDate: data.plantingDate,
        plantingArea: parseFloat(data.plantingArea),
        observations: data.observations || undefined,
      };

      // Call API
      await cultureService.update(id, updateDto);

      // Success - navigate to cultures list
      navigate('/cultures');
    } catch (err: any) {
      console.error('Erro ao atualizar cultura:', err);
      setError(err.message || 'Erro ao atualizar cultura. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p>Carregando cultura...</p>
      </div>
    );
  }

  if (error && !initialData) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={() => navigate('/cultures')}>Voltar</button>
      </div>
    );
  }

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
      {initialData && (
        <CultureForm
          initialData={initialData}
          onSubmit={handleUpdate}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
