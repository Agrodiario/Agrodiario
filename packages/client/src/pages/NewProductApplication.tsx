import { ProductApplicationFormData } from '../types/productApplication.types.ts';
import { ProductApplicationForm } from '../components/productApplications/ProductApplicationForm.tsx';
import { productApplicationService } from '../services/productApplication.service.ts';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductFormData } from '../types/product.types.ts';
import { productService } from '../services/product.service.ts';

export default function NewProductApplication() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (product: ProductFormData, data: ProductApplicationFormData)=> {
    setIsLoading(true);
    setError(null);

    try {
      const productDto: ProductFormData = {
        registrationNumber: product.registrationNumber,
        commercialNames: product.commercialNames,
        registrationHolder: product.registrationHolder,
        categories: product.categories,
        activeIngredients: product.activeIngredients,
        organicFarmingProduct: product.organicFarmingProduct,
      };

      const createdProduct = await productService.create(productDto);

      if (!createdProduct?.id) {
        setError("Erro ao salvar o produto");
        setIsLoading(false);
        return;
      }

      const productApplicationDto: ProductApplicationFormData = {
        propertyId: data.propertyId,
        cultureId: data.cultureId,
        area: data.area,
        productId: createdProduct.id,
        productName: data.productName,
        date: data.date,
      };


      if (
        !productApplicationDto.propertyId ||
        !productApplicationDto.cultureId ||
        !productApplicationDto.area ||
        !productApplicationDto.productId ||
        !productApplicationDto.productName ||
        !productApplicationDto.date)
      {
        setError('Preencha todos os campos obrigatórios');
        setIsLoading(false);
        return;
      }

      await productApplicationService.create(productApplicationDto);

      navigate('/product');
    } catch (err: any) {
      console.error('Erro ao criar aplicação de produto', err);
      setError(err.message || 'Erro ao criar aplicação de produto. Tente novamente');
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
}