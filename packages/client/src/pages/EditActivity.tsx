// src/pages/EditActivity.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ActivityForm, ActivityFormData } from './ActivityForm'; 
import { activityService } from '../services/activityService';

export default function EditActivity() {
  const navigate = useNavigate();
  const { id } = useParams(); 

  const [activityToEdit, setActivityToEdit] = useState<Partial<ActivityFormData> | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true); 
  const [isSaving, setIsSaving] = useState(false);          

  useEffect(() => {
    async function loadActivity() {
      if (!id) return;

      try {
        setIsLoadingData(true);
        const data = await activityService.getById(id);
        
        setActivityToEdit(data); 
      } catch (error) {
        console.error('Erro ao carregar atividade:', error);
        alert('Não foi possível carregar os dados da atividade.');
        navigate('/diary'); 
      } finally {
        setIsLoadingData(false);
      }
    }

    loadActivity();
  }, [id, navigate]);

  const handleEdit = async (data: ActivityFormData, files: File[], removedFiles: string[]) => {
    if (!id) return;

    try {
      setIsSaving(true);


      await activityService.update(id, {
        ...data,
        insumoQuantidade: data.insumoQuantidade ? parseFloat(data.insumoQuantidade) : undefined,
        files: files,          
        removedFiles: removedFiles, 
      });

      navigate('/diary');
    } catch (error) {
      console.error('Erro ao atualizar atividade:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingData) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
        <p>Carregando dados da atividade...</p>
      </div>
    );
  }

  if (!activityToEdit) {
    return <div>Atividade não encontrada.</div>;
  }

  return (
    <ActivityForm 
      initialData={activityToEdit} 
      onSubmit={handleEdit} 
      isLoading={isSaving} 
    />
  );
}