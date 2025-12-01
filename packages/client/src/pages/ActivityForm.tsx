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
  FiUpload,
  FiEye,
  FiTrash2
} from 'react-icons/fi';
import { IoIosArrowDown } from 'react-icons/io';

import { UPLOADS_URL } from '../config/api.client';
import { apiClient } from '../config/api.client';
import { SearchableSelect } from '@/components/common/SearchableSelect/SearchableSelect';
import { cultureService } from '../services/culture.service';
import { propertyService } from '../services/property.service';

export type ActivityFormData = {
  date: string;
  titulo: string;
  propriedade: string;
  cultureId: string;
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
    cultureId: initialData?.cultureId || '',
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
  const [insumoOptions, setInsumoOptions] = useState<{ label: string, value: string }[]>([]);
  const [isLoadingInsumos, setIsLoadingInsumos] = useState(false);
  const [culturesOptions, setCulturesOptions] = useState<{ label: string, value: string }[]>([]);
  const [isLoadingCultures, setIsLoadingCultures] = useState(false);

  // ESTADOS PARA PROPRIEDADES
  const [propertiesOptions, setPropertiesOptions] = useState<{ label: string, value: string }[]>([]);
  const [allProperties, setAllProperties] = useState<any[]>([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(false);

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
    if (!show) setFormData(prev => ({ ...prev, insumoNome: '', insumoQuantidade: '', insumoUnidade: '' }));
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
    const isBasicInfoValid = 
      formData.date.trim() !== '' && 
      formData.propriedade.trim() !== '' && 
      formData.cultureId.trim() !== '' && 
      formData.descricao.trim() !== '' && 
      formData.responsavel.trim() !== '';
    
    let isInsumoValid = true;
    if (showInsumos) {
      isInsumoValid = (formData.insumoNome || "").trim() !== '';
    }
    
    setIsValid(isBasicInfoValid && isInsumoValid);
  }, [formData, showInsumos]);

  // EFEITO PARA BUSCAR PROPRIEDADES
  useEffect(() => {
    async function fetchProperties() {
      setIsLoadingProperties(true);
      try {
        console.log('[ActivityForm] Buscando propriedades...');
        const response = await propertyService.findAll(1, 100);
        console.log('[ActivityForm] Propriedades carregadas:', response.data);
        
        setAllProperties(response.data);
        
        const options = response.data.map(p => ({
          label: p.name,
          value: p.name,
        }));
        setPropertiesOptions(options);

      } catch (error) {
        console.error("[ActivityForm] Erro ao carregar propriedades:", error);
      } finally {
        setIsLoadingProperties(false);
      }
    }

    fetchProperties();
  }, []);

  // EFEITO PARA BUSCAR CULTURAS DA PROPRIEDADE SELECIONADA
  useEffect(() => {
    async function fetchCulturesForProperty() {
      console.log('[ActivityForm] fetchCulturesForProperty chamado');
      console.log('[ActivityForm] formData.propriedade:', formData.propriedade);
      console.log('[ActivityForm] allProperties length:', allProperties.length);
      
      if (!formData.propriedade || allProperties.length === 0) {
        console.log('[ActivityForm] Sem propriedade selecionada, limpando culturas');
        setCulturesOptions([]);
        setFormData(prev => ({ ...prev, cultureId: '' }));
        return;
      }

      setIsLoadingCultures(true);
      
      try {
        const selectedProperty = allProperties.find(p => p.name === formData.propriedade);
        console.log('[ActivityForm] Propriedade selecionada:', selectedProperty);

        if (selectedProperty) {
          console.log(`[ActivityForm] Buscando culturas para propertyId: ${selectedProperty.id}`);
          
          // Limpa o cultureId enquanto carrega novas culturas
          setFormData(prev => ({ ...prev, cultureId: '' }));
          
          const cultures = await cultureService.findByProperty(selectedProperty.id);
          console.log('[ActivityForm] Culturas retornadas:', cultures);
          
          const options = cultures.map(c => ({
            label: `${c.cultureName}${c.cultivar ? ` - ${c.cultivar}` : ''}`,
            value: c.id
          }));
          
          console.log('[ActivityForm] Options geradas:', options);
          setCulturesOptions(options);
          
          // Se estiver editando e a cultura atual pertence a esta propriedade, mantém selecionada
          if (isEditMode && initialData?.cultureId) {
            const currentCultureExists = cultures.some(c => c.id === initialData.cultureId);
            if (currentCultureExists) {
              console.log('[ActivityForm] Mantendo cultura atual:', initialData.cultureId);
              setFormData(prev => ({ ...prev, cultureId: initialData.cultureId! }));
            }
          }
        } else {
          console.log('[ActivityForm] Propriedade não encontrada no array');
          setCulturesOptions([]);
          setFormData(prev => ({ ...prev, cultureId: '' }));
        }
      } catch (error) {
        console.error("[ActivityForm] Erro ao carregar culturas:", error);
        setCulturesOptions([]);
        setFormData(prev => ({ ...prev, cultureId: '' }));
      } finally {
        setIsLoadingCultures(false);
      }
    }

    fetchCulturesForProperty();
  }, [formData.propriedade, allProperties, isEditMode]);

  // Reset cultureId quando mudar propriedade (já tratado no useEffect acima)
  useEffect(() => {
    if (formData.propriedade) {
      console.log('[ActivityForm] Propriedade alterada, aguardando carregamento de culturas...');
    }
  }, [formData.propriedade]);

  // EFEITO PARA BUSCAR INSUMOS
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
            <Input 
              label="Data da atividade" 
              name="date" 
              type="date" 
              value={formData.date} 
              onChange={handleChange} 
            />

            <Input
              as="select"
              label="Propriedade associada"
              name="propriedade"
              value={formData.propriedade}
              onChange={handleChange}
              options={propertiesOptions}
              icon={<IoIosArrowDown size={18} />}
              disabled={isLoadingProperties}
            />
          </div>
          
          <Input
            as="select"
            label="Cultura associada"
            name="cultureId"
            value={formData.cultureId}
            onChange={handleChange}
            options={culturesOptions}
            icon={<IoIosArrowDown size={18} />}
            disabled={!formData.propriedade || isLoadingCultures || culturesOptions.length === 0}
          />
          {isLoadingCultures && formData.propriedade && (
            <div className={styles.loadingMessage}>
              Carregando culturas da propriedade...
            </div>
          )}
          {!isLoadingCultures && formData.propriedade && culturesOptions.length === 0 && (
            <div className={styles.warningMessage}>
              Nenhuma cultura encontrada para esta propriedade.
            </div>
          )}
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