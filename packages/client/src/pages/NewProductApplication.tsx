import { ProductApplicationFormData } from '../types/productApplication.types.ts';
import { ProductApplicationForm } from '../components/productApplications/ProductApplicationForm.tsx';
import { productApplicationService } from '../services/productApplication.service.ts';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function NewProductApplication() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (data: ProductApplicationFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const productApplicationDto: ProductApplicationFormData = {
        propertyId: data.propertyId,
        cultureId: data.cultureId,
        area: data.area,
        productId: data.productId,
        productName: data.productName,
        applicationDate: data.applicationDate,
      };

      if (
        !productApplicationDto.propertyId ||
        !productApplicationDto.cultureId ||
        !productApplicationDto.area ||
        !productApplicationDto.productId ||
        !productApplicationDto.productName ||
        !productApplicationDto.applicationDate
      ) {
        setError('Preencha todos os campos obrigatórios');
        setIsLoading(false);
        return;
      }

      await productApplicationService.create(productApplicationDto);

      navigate('/product');
    } catch (e) {
      console.error('Erro ao criar aplicação de produto', e);

      // Solução 1: Tipar o erro explicitamente
      if (e instanceof Error) {
        setError(e.message || 'Erro ao criar aplicação de produto. Tente novamente');
      } else {
        setError('Erro ao criar aplicação de produto. Tente novamente');
      }
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
      <ProductApplicationForm onSubmit={handleCreate} isLoading={isLoading} />
    </div>
  );

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
      <ProductApplicationForm onSubmit={handleCreate} isLoading={isLoading} />
    </div>
  );
}