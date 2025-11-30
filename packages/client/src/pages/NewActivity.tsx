// src/pages/NewActivity.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {ActivityForm, ActivityFormData} from './ActivityForm'; 
import { activityService } from '../services/activityService';

export default function NewActivity() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async (data: ActivityFormData, files: File[]) => {
    try {
      setIsLoading(true);

      await activityService.create({
        ...data,
        insumoQuantidade: data.insumoQuantidade ? parseFloat(data.insumoQuantidade) : undefined,
        files: files,
      });

      navigate('/diary'); 
    } catch (error) {
      console.error('Erro ao criar atividade:', error);
      alert('Ocorreu um erro ao criar a atividade. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ActivityForm 
      onSubmit={handleCreate} 
      isLoading={isLoading} 
    />
  );
}