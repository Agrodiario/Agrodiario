// src/components/diary/ActivityForm/ActivityForm.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ActivityForm.module.css';

import { Input } from '../components/common/Input/Input';
import { Button } from '../components/common/Button/Button';
import { TagToggle } from '../components/common/TagToggle/TagToggle';
import { Radio } from '../components/common/Radio/Radio';
import { FileInput } from '../components/common/FileInput/FileInput';
import {
  FiArrowLeft,
  FiCalendar,
  FiUpload,
  FiEye,
  FiTrash2
} from 'react-icons/fi';
import { IoIosArrowDown } from 'react-icons/io';

import { UPLOADS_URL } from '../config/api.client';
import { apiClient } from '../config/api.client';
import { SearchableSelect } from '@/components/common/SearchableSelect/SearchableSelect';

// Tipos
export type ActivityFormData = {
  date: string;
  titulo: string;
  propriedade: string;
  tipo: 'preparo' | 'aplicacao' | 'colheita' | 'manejo';
  descricao: string;
  operacao: string;
  responsavel: string;
  insumoNome?: string;
  insumoQuantidade?: string;
  insumoUnidade?: string;
  anexos?: string[]; 
};

type EmbrapaInput = {
  id: string;
  marcaComercial: string;
};

type Props = {
  initialData?: Partial<ActivityFormData>;
  onSubmit: (data: ActivityFormData, newFiles: File[], removedFiles: string[]) => void;
  isLoading?: boolean;
};

const mockProperties = [
  { label: 'Sítio Oliveira', value: 'Sítio Oliveira' },
  { label: 'Fazenda Santa Fé', value: 'Fazenda Santa Fé' },
  { label: 'Rancho Fundo', value: 'Rancho Fundo' },
  { label: 'Chácara do Sol', value: 'Chácara do Sol' },
];

const mockUnidades = [
    { label: 'Kg', value: 'Kg' },
    { label: 'L', value: 'L' },
    { label: 'Ton', value: 'Ton' },
    { label: 'Sacos', value: 'Sacos' },
];
export function ActivityForm({ initialData, onSubmit, isLoading = false }: Props) {
  const navigate = useNavigate();
  const isEditMode = !!initialData;

  const [formData, setFormData] = useState<ActivityFormData>({
    titulo: initialData?.titulo || '',
    date: initialData?.date || '',
    propriedade: initialData?.propriedade || '',
    tipo: initialData?.tipo || 'preparo',
    descricao: initialData?.descricao || '',
    operacao: initialData?.operacao || '',
    responsavel: initialData?.responsavel || '',
    insumoNome: initialData?.insumoNome || '',
    insumoQuantidade: initialData?.insumoQuantidade || '',
    insumoUnidade: initialData?.insumoUnidade || '',
    anexos: initialData?.anexos || [],
  });

  const [showInsumos, setShowInsumos] = useState(!!initialData?.insumoNome);
  const [insumoOptions, setInsumoOptions] = useState<{label: string, value: string}[]>([]);
  const [isLoadingInsumos, setIsLoadingInsumos] = useState(false);

  const [isValid, setIsValid] = useState(false);

  const [newFiles, setNewFiles] = useState<File[]>([]);
  
  const [existingFiles, setExistingFiles] = useState<string[]>(initialData?.anexos || []);
  
  const [removedFiles, setRemovedFiles] = useState<string[]>([]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleTypeChange = (type: any) => setFormData(prev => ({ ...prev, tipo: type }));
  const handleInsumoOption = (show: boolean) => {
    setShowInsumos(show);
    if(!show) setFormData(prev => ({ ...prev, insumoNome: '', insumoQuantidade: '', insumoUnidade: '' }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setNewFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const handleRemoveFile = (index: number, type: 'new' | 'existing') => {
    if (type === 'new') {
      setNewFiles((prev) => prev.filter((_, i) => i !== index));
    } else {
      const fileToRemove = existingFiles[index];
      setExistingFiles((prev) => prev.filter((_, i) => i !== index));
      setRemovedFiles((prev) => [...prev, fileToRemove]);
    }
  };

  const handleViewFile = (file: File | string) => {
    if (typeof file === 'string') {
      window.open(`${UPLOADS_URL}/${file}`, '_blank');
    } else {
      const url = URL.createObjectURL(file);
      window.open(url, '_blank');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    onSubmit({ ...formData, anexos: existingFiles }, newFiles, removedFiles);
  };

  useEffect(() => {
    const isBasicInfoValid = formData.date.trim() !== '' && formData.propriedade.trim() !== '' && formData.descricao.trim() !== '' && formData.responsavel.trim() !== '';
    let isInsumoValid = true;
    if (showInsumos) {
      isInsumoValid = (formData.insumoNome || "").trim() !== '';
    }
    setIsValid(isBasicInfoValid && isInsumoValid);
  }, [formData, showInsumos]);

  useEffect(() => {
    async function fetchEmbrapaInputs() {
      setIsLoadingInsumos(true);
      try {
        const response = await apiClient.get('/embrapa/insumos');
        setInsumoOptions(response.data);
      } catch (error) {
        console.error("Erro ao carregar insumos Embrapa (usando fallback):", error);
        
        setInsumoOptions([
          { label: 'Fertilizante NPK 10-10-10 (Offline)', value: 'Fertilizante NPK 10-10-10' },
          { label: 'Glifosato (Offline)', value: 'Glifosato' },
          { label: 'Inseticida Cipermetrina (Offline)', value: 'Inseticida Cipermetrina' },
        ]);
      } finally {
        setIsLoadingInsumos(false);
      }
    }

    fetchEmbrapaInputs();
  }, []);

  const title = isEditMode ? 'Editar atividade' : 'Nova atividade';
  const submitText = isEditMode ? 'Salvar alterações' : 'Salvar atividade';

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          <FiArrowLeft size={20} />
          <span>{title}</span>
        </button>
      </header>

      <form className={styles.form} onSubmit={handleSubmit}>
         <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Detalhes da atividade</h3>
          <Input
            label="Título da atividade"
            name="titulo"
            value={formData.titulo}
            onChange={handleChange}
            placeholder="Ex: Adubação do talhão 1"
          />
          <div className={styles.fieldGroup}>
            <Input label="Data da atividade" name="date" type="date" value={formData.date} onChange={handleChange} />
            <Input as="select" label="Propriedade associada" name="propriedade" value={formData.propriedade} onChange={handleChange} options={mockProperties} icon={<IoIosArrowDown size={18} />} />
          </div>
        </div>

         <div className={styles.section}>
           <h3 className={styles.sectionTitle}>Tipo de atividade</h3>
           <div className={styles.tagGroup}>
             <TagToggle color="red" isActive={formData.tipo === 'preparo'} onClick={() => handleTypeChange('preparo')} type="button">Preparo</TagToggle>
             <TagToggle color="blue" isActive={formData.tipo === 'aplicacao'} onClick={() => handleTypeChange('aplicacao')} type="button">Aplicação</TagToggle>
             <TagToggle color="green" isActive={formData.tipo === 'colheita'} onClick={() => handleTypeChange('colheita')} type="button">Colheita</TagToggle>
             <TagToggle color="orange" isActive={formData.tipo === 'manejo'} onClick={() => handleTypeChange('manejo')} type="button">Manejo de solo</TagToggle>
          </div>
          <Input 
             label="Detalhes da operação (Ex: Aragem no solo)" 
             name="operacao" 
             value={formData.operacao} 
             onChange={handleChange} 
           />
           <Input as="textarea" label="Descrição detalhada da atividade" name="descricao" value={formData.descricao} onChange={handleChange} rows={4} />
           <Input label="Responsável pela execução" name="responsavel" value={formData.responsavel} onChange={handleChange} />
         </div>

        <div className={styles.section}>
           <h3 className={styles.sectionTitle}>Produto ou Insumo</h3>
           <div className={styles.radioGroup}>
             <Radio label="Sim" name="insumo_opt" checked={showInsumos} onChange={() => handleInsumoOption(true)} />
             <Radio label="Não" name="insumo_opt" checked={!showInsumos} onChange={() => handleInsumoOption(false)} />
           </div>
           {showInsumos && (
            <div className={styles.insumoFields}>
              <SearchableSelect
                label="Nome do produto/insumo"
                placeholder="Digite para buscar na Embrapa..."
                value={formData.insumoNome}
                onChange={(newValue) => 
                  setFormData(prev => ({ ...prev, insumoNome: newValue }))
                }
              />
              <div className={styles.fieldGroup}>
                <Input label="Quantidade utilizada" name="insumoQuantidade" value={formData.insumoQuantidade} onChange={handleChange} />
                <Input as="select" label="Unidade" name="insumoUnidade" value={formData.insumoUnidade} onChange={handleChange} options={mockUnidades} icon={<IoIosArrowDown size={18} />} />
              </div>
            </div>
          )}
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Anexos</h3>
          <p className={styles.sectionSubtitle}>
            Você pode inserir fotos da plantação, notas fiscais, recibos.
          </p>

          <div className={styles.fileList}>
            {existingFiles.map((fileName, index) => (
              <div key={`existing-${index}`} className={styles.fileItem}>
                <span className={styles.fileName}>{fileName}</span>
                <div className={styles.fileActions}>
                  <button type="button" onClick={() => handleViewFile(fileName)} className={styles.actionBtn} title="Visualizar">
                    <FiEye size={18} />
                  </button>
                  <button type="button" onClick={() => handleRemoveFile(index, 'existing')} className={`${styles.actionBtn} ${styles.deleteBtn}`} title="Remover">
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </div>
            ))}

            {newFiles.map((file, index) => (
              <div key={`new-${index}`} className={styles.fileItem}>
                <span className={styles.fileName}>{file.name} (Novo)</span>
                <div className={styles.fileActions}>
                  <button type="button" onClick={() => handleViewFile(file)} className={styles.actionBtn} title="Visualizar">
                    <FiEye size={18} />
                  </button>
                  <button type="button" onClick={() => handleRemoveFile(index, 'new')} className={`${styles.actionBtn} ${styles.deleteBtn}`} title="Remover">
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <FileInput 
            leftIcon={<FiUpload size={18} />}
            onChange={handleFileChange}
            multiple 
          >
            Fazer upload de foto ou documento
          </FileInput>
        </div>
        
        <footer className={styles.footer}>
          <Button variant="tertiary" type="button" onClick={() => navigate(-1)} disabled={isLoading}>Cancelar</Button>
          <Button variant="primary" type="submit" disabled={!isValid || isLoading}>{isLoading ? 'Salvando...' : submitText}</Button>
        </footer>
      </form>
    </div>
  );
}