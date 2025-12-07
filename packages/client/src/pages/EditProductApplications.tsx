import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { productApplicationService } from '../services/productApplication.service.ts';
import { ProductApplicationFormData } from '../types/productApplication.types.ts';
import { ProductApplicationForm } from '../components/productApplications/ProductApplicationForm.tsx';
import { ProductFormData } from '../types/product.types.ts';

export default function EditProductApplications() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [productApplicationToEdit, setProductApplicationToEdit] = useState<Partial<ProductApplicationFormData> | null>(null);
  const [productToEdit, setProductToEdit] = useState<Partial<ProductFormData> | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadProductApplication() {
      if (!id) {
        navigate('/products');
        return;
      }

      try {
        setIsLoadingData(true);
        const data = await productApplicationService.findOne(id);

        setProductApplicationToEdit(data);
        setProductToEdit(data.product);
      } catch (error) {
        console.error('Erro ao carregar aplicação:', error);
        alert('Não foi possível carregar os dados da aplicação.');
        navigate('/product');
      } finally {
        setIsLoadingData(false);
      }
    }

    loadProductApplication();
  }, [id, navigate]);

  const handleEdit = async (data: ProductApplicationFormData) => {
    if (!id) return;

    try {
      setIsSaving(true);
      const updateData: ProductApplicationFormData = {
        propertyId: data.propertyId,
        cultureId: data.cultureId,
        area: data.area,
        productId: data.productId,
        productName: data.productName,
        applicationDate: data.applicationDate,
      }

      await productApplicationService.update(id, updateData);

      navigate('/products');
    } catch (error) {
      console.error('Erro ao atualizar aplicação:', error);
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

  if (!productApplicationToEdit) {
    return <div>Aplicação não encontrada.</div>;
  }

  return (
    <ProductApplicationForm
      initialData={productApplicationToEdit}
      onSubmit={handleEdit}
      isLoading={isSaving}
    />
  );
}