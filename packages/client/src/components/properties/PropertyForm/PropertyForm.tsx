import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, LayersControl, LayerGroup } from 'react-leaflet';
import { EditableMap } from '../../map/EditableMap';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import L from 'leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch'; 
import 'leaflet-geosearch/dist/geosearch.css'; 

import styles from './PropertyForm.module.css';
import { Input } from '../../common/Input/Input';
import { Button } from '../../common/Button/Button';
import { FileInput } from '../../common/FileInput/FileInput';
import { TagToggle } from '../../common/TagToggle/TagToggle';
import { FiArrowLeft, FiCrosshair, FiEye, FiMaximize, FiMinimize, FiTrash2, FiUpload } from 'react-icons/fi';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { CultureSearchSelect } from '@/components/cultures/CultureSearchSelect/CultureSearchSelect';

// IMPORTAÇÕES DOS UTILS
import { validateNumberField } from '@/utils/validators';
import { numberMask } from '@/utils/masks';

import { UPLOADS_URL } from '../../../config/api.client'

// --- Correção de ícones do Leaflet ---
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});
// ------------------------------------

export type PropertyFormData = {
  name: string;
  address: string;
  areaTotal: string;
  areaProducao: string;
  cultivo: string;
  talhaoName: string;
  talhaoArea: string;
  talhaoCultura: string;
  situacao: 'producao' | 'preparo' | 'pousio';
  markerPosition: [number, number] | null;
  talhaoPolygon: any;
  certificates?: string[];
};

type Props = {
  initialData?: Partial<PropertyFormData>;
  onSubmit: (formData: FormData) => void;
  isLoading?: boolean;
};

function MapController({ center }: { center: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

const MapSearchControl = () => {
  const map = useMap();
  useEffect(() => {
    const provider = new OpenStreetMapProvider();

    const searchControl = new (GeoSearchControl as any)({
      provider: provider,
      style: 'bar', 
      showMarker: false,
      keepResult: false,
      searchLabel: 'Buscar cidade ou endereço...',
    });

    map.addControl(searchControl);

    return () => {
      map.removeControl(searchControl);
    };
  }, [map]);

  return null;
};

function LocationMarker({ position, setPosition }: any) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? <Marker position={position} /> : null;
}

function MapResizer({ isFullscreen }: { isFullscreen: boolean }) {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 450);

    return () => clearTimeout(timer);
  }, [isFullscreen, map]);

  return null;
}

export function PropertyForm({ initialData, onSubmit, isLoading = false }: Props) {
  const navigate = useNavigate();
  const isEditMode = !!initialData;

  const [mapCenter, setMapCenter] = useState<[number, number]>([-22.85, -50.65]);

  const [isMap1Fullscreen, setIsMap1Fullscreen] = useState(false);
  const [isMap2Fullscreen, setIsMap2Fullscreen] = useState(false);

  const [formData, setFormData] = useState<PropertyFormData>({
    name: initialData?.name || '',
    address: initialData?.address || '',
    areaTotal: initialData?.areaTotal || '',
    areaProducao: initialData?.areaProducao || '',
    cultivo: initialData?.cultivo || '',
    talhaoName: initialData?.talhaoName || '',
    talhaoArea: initialData?.talhaoArea || '',
    talhaoCultura: initialData?.talhaoCultura || '',
    situacao: initialData?.situacao || 'preparo',
    markerPosition: initialData?.markerPosition || null,
    talhaoPolygon: initialData?.talhaoPolygon || null,
    certificates: initialData?.certificates || [],
  });

  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [existingFiles, setExistingFiles] = useState<string[]>(initialData?.certificates || []);
  const [removedFiles, setRemovedFiles] = useState<string[]>([]);

  // Estados de Validação
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (initialData) {
      setExistingFiles(initialData.certificates || []);
      if (initialData.markerPosition) setMapCenter(initialData.markerPosition);
    }
  }, [initialData]);

  const handleLocateMe = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMapCenter([latitude, longitude]);
          if (!isEditMode && !formData.markerPosition) {
             setFormData(prev => ({ ...prev, markerPosition: [latitude, longitude] }));
          }
        },
        (error) => console.warn("Erro geo:", error)
      );
    }
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
      window.open(`${UPLOADS_URL}${file}`, '_blank');
    } else {
      const url = URL.createObjectURL(file);
      window.open(url, '_blank');
    }
  };

  useEffect(() => {
    // Se já existe initialData (Modo Edição) e tem posição salva, usamos ela como centro
    if (isEditMode && initialData?.markerPosition) {
      setMapCenter(initialData.markerPosition);
      return; 
    }

    // Se for Modo Novo, tentamos pegar a localização do usuário
    if (!isEditMode && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const userCoords: [number, number] = [latitude, longitude];
          
          // Atualiza o centro do mapa
          setMapCenter(userCoords);
          
          // Atualiza o pino para a posição do usuário automaticamente
          setFormData(prev => ({ ...prev, markerPosition: userCoords }));
        },
        (error) => {
          console.warn("Permissão de localização negada ou erro:", error);
          // Mantém o fallback default ou define um padrão se necessário
          const defaultCoords: [number, number] = [-22.85, -50.65]; 
          setMapCenter(defaultCoords);
          setFormData(prev => ({ ...prev, markerPosition: defaultCoords }));
        }
      );
    } else if (!isEditMode) {
      // Fallback se navegador não suportar ou se markerPosition estiver null
       const defaultCoords: [number, number] = [-22.85, -50.65]; 
       setFormData(prev => ({ ...prev, markerPosition: defaultCoords }));
    }
  }, [isEditMode, initialData]);

  const validateField = (fieldName: keyof PropertyFormData, value: string): string => {
    // Campos de texto obrigatórios (Propriedade)
    if (['name', 'address', 'cultivo'].includes(fieldName)) {
      if (!value || value.trim() === '') {
        switch (fieldName) {
          case 'name': return 'Nome da propriedade é obrigatório';
          case 'address': return 'Endereço é obrigatório';
          case 'cultivo': return 'Cultivo principal é obrigatório';
          default: return 'Campo obrigatório';
        }
      }
    }

    // Validação para campos de área (Numéricos)
    if (['areaTotal', 'areaProducao', 'talhaoArea'].includes(fieldName)) {
      
      // Se for campo de Talhão (opcional) e estiver vazio, é válido
      if (['talhaoArea'].includes(fieldName) && (!value || value.trim() === '')) {
        return ''; 
      }
      
      // Campos de Propriedade (Área Total e Produção) são obrigatórios
      if (!value || value.trim() === '') {
        return `${fieldName === 'areaTotal' ? 'Área total' : 'Área de produção'} é obrigatória`;
      }

      let error = validateNumberField(
        value, 
        fieldName === 'areaTotal' ? 'Área total' : (fieldName === 'areaProducao' ? 'Área de produção' : 'Área do talhão')
      );

      // Ajuste específico para área de produção (pode ser 0)
      if (fieldName === 'areaProducao' && error.includes('maior que zero')) {
        const numValue = parseFloat(value.replace(',', '.'));
        if (numValue >= 0) return '';
      }
      
      return error;
    }
    
    if (['talhaoName', 'talhaoCultura'].includes(fieldName)) {
      return ''; 
    }

    return '';
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const fieldName = name as keyof PropertyFormData;
    let processedValue = value;

    // Aplica máscara de número para os campos de área
    if (['areaTotal', 'areaProducao', 'talhaoArea'].includes(fieldName)) {
      processedValue = numberMask(value);
    }

    setFormData((prev) => {
      const updatedFormData = { ...prev, [fieldName]: processedValue };

      // Valida o campo se já foi tocado
      if (touchedFields[fieldName]) {
        const error = validateField(fieldName, processedValue);
        setErrors(prevErrors => ({ ...prevErrors, [fieldName]: error }));
      }

      return updatedFormData;
    });
  };

  const handleBlur = (fieldName: keyof PropertyFormData, customValue?: string) => {
    setTouchedFields(prev => ({ ...prev, [fieldName]: true }));
    
    const value = customValue !== undefined ? customValue : (formData[fieldName] || '').toString();
    
    // O erro será calculado, mas se for campo de talhão vazio, não será exibido imediatamente
    const error = validateField(fieldName, value);
    
    setErrors(prev => ({ ...prev, [fieldName]: error }));
  };

  // Efeito para validar o formulário inteiro em tempo real
  useEffect(() => {
    const requiredPropertyFields: (keyof PropertyFormData)[] = ['name', 'address', 'areaTotal', 'areaProducao', 'cultivo'];
    
    let isBasicPropertyValid = true;

    // Validação dos campos de Propriedade (Sempre obrigatórios)
    requiredPropertyFields.forEach(field => {
      const value = (formData[field] || '').toString();
      const error = validateField(field, value);
      if (error) {
        isBasicPropertyValid = false;
      }
    });

    // Validação condicional dos campos de Talhão
    const isTalhaoStarted = formData.talhaoName.trim() !== '' || 
                            formData.talhaoArea.trim() !== '' || 
                            formData.talhaoCultura.trim() !== '';

    let isTalhaoValid = true;
    
    if (isTalhaoStarted) {
        const talhaoFields: (keyof PropertyFormData)[] = ['talhaoName', 'talhaoArea', 'talhaoCultura'];
        
        talhaoFields.forEach(field => {
            const value = (formData[field] || '').toString();
            
            // Verifica se está vazio
            if (!value || value.trim() === '') {
                isTalhaoValid = false;
            }
            // Verifica a validade numérica (talhaoArea)
            if (field === 'talhaoArea' && validateField(field, value) !== '') {
                isTalhaoValid = false;
            }
        });
    }

    setIsValid(isBasicPropertyValid && isTalhaoValid);
  }, [formData]);


  // Handler para o envio do formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Campos de Propriedade obrigatórios
    const requiredPropertyFields: (keyof PropertyFormData)[] = ['name', 'address', 'areaTotal', 'areaProducao', 'cultivo'];
    
    // Verifica se o usuário preencheu algum campo de Talhão
    const isTalhaoStarted = formData.talhaoName.trim() !== '' || 
                            formData.talhaoArea.trim() !== '' || 
                            formData.talhaoCultura.trim() !== '';

    let fieldsToTouch = [...requiredPropertyFields];
    if (isTalhaoStarted) {
        fieldsToTouch.push('talhaoName', 'talhaoArea', 'talhaoCultura');
    }

    // Marca os campos necessários como tocados
    const newTouched: Record<string, boolean> = {};
    fieldsToTouch.forEach(field => { newTouched[field] = true; });
    setTouchedFields(newTouched);

    // Executa a validação final
    const finalErrors: Record<string, string> = {};
    let hasError = false;
    
    fieldsToTouch.forEach(field => {
        const value = (formData[field] || '').toString();
        let error = validateField(field, value);

        // Ajuste para campos de Talhão (se iniciado, verifica se vazio)
        if (isTalhaoStarted) {
            if (['talhaoName', 'talhaoCultura'].includes(field) && (!value || value.trim() === '')) {
                error = `${field === 'talhaoName' ? 'Nome do talhão' : 'Cultura do talhão'} é obrigatório se for preencher o talhão.`;
            }
        }

        if (error) {
            finalErrors[field] = error;
            hasError = true;
        }
    });
    setErrors(finalErrors);
    
    if (hasError) {
      return;
    }

    const dataToSend = new FormData();

    // 2. Adiciona campos de texto simples
    dataToSend.append('name', formData.name);
    dataToSend.append('address', formData.address);
    dataToSend.append('areaTotal', formData.areaTotal);
    dataToSend.append('areaProducao', formData.areaProducao);
    dataToSend.append('cultivo', formData.cultivo);
    dataToSend.append('situacao', formData.situacao);

    // Campos de Talhão
    if (formData.talhaoName) dataToSend.append('talhaoName', formData.talhaoName);
    if (formData.talhaoArea) dataToSend.append('talhaoArea', formData.talhaoArea);
    if (formData.talhaoCultura) dataToSend.append('talhaoCultura', formData.talhaoCultura);

    // 3. Adiciona Objetos Complexos (JSON.stringify)
    if (formData.markerPosition) {
      dataToSend.append('markerPosition', JSON.stringify(formData.markerPosition));
    }
    if (formData.talhaoPolygon) {
      dataToSend.append('talhaoPolygon', JSON.stringify(formData.talhaoPolygon));
    }

    // 4. Adiciona Arquivos Novos (Upload)
    if (newFiles.length > 0) {
      newFiles.forEach(file => {
        dataToSend.append('files', file); // 'files' deve bater com o backend
      });
    }

    // 5. Adiciona Lista de Remoção
    if (removedFiles.length > 0) {
      dataToSend.append('removedFiles', JSON.stringify(removedFiles));
    }

    onSubmit(dataToSend as any);
  };

  // Handler para atualizar a posição do pino no mapa 1
  const handleMarkerChange = (pos: [number, number]) => {
    setFormData(prev => ({ ...prev, markerPosition: pos }));
  };

  // Handlers para o desenho no mapa 2
  const _onCreated = (e: any) => {
    if (e.layerType === 'polygon') {
      setFormData(prev => ({ ...prev, talhaoPolygon: e.layer.getLatLngs() }));
    }
  };

  const _onDeleted = (_e: any) => {
    setFormData(prev => ({ ...prev, talhaoPolygon: null }));
  };

  const title = isEditMode ? 'Editar propriedade' : 'Nova propriedade/talhão';
  const submitText = isEditMode ? 'Salvar alterações' : 'Salvar propriedade';

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
          <h3 className={styles.blueTitle}>Dados da propriedade</h3>

          <Input
            label="Nome da propriedade"
            name="name"
            value={formData.name}
            onChange={handleChange}
            onBlur={() => handleBlur('name')}
            placeholder="Ex: Sítio Oliveira"
            required
            error={errors.name}
            showError={touchedFields.name && !!errors.name}
          />
          <Input
            label="Endereço (estrada, município, estado)"
            name="address"
            value={formData.address}
            onChange={handleChange}
            onBlur={() => handleBlur('address')}
            placeholder="Estrada da Lavoura..."
            required
            error={errors.address}
            showError={touchedFields.address && !!errors.address}
          />

          <div className={styles.row}>
            <Input
              label="Área total (hectares)"
              name="areaTotal"
              value={formData.areaTotal}
              onChange={handleChange}
              onBlur={() => handleBlur('areaTotal')}
              placeholder="10"
              required
              error={errors.areaTotal}
              showError={touchedFields.areaTotal && !!errors.areaTotal}
            />
            <Input
              label="Área de produção (hectares)"
              name="areaProducao"
              value={formData.areaProducao}
              onChange={handleChange}
              onBlur={() => handleBlur('areaProducao')}
              placeholder="2"
              required
              error={errors.areaProducao}
              showError={touchedFields.areaProducao && !!errors.areaProducao}
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Cultivo principal</label>
            <CultureSearchSelect
              value={formData.cultivo}
              onChange={(selectedCrop) => setFormData(prev => ({ ...prev, cultivo: selectedCrop }))}
              placeholder="Selecione o cultivo principal..."
            />
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.textTitle}>Certificações e Documentos</h3>
          <p className={styles.subtitle}>Insira fotos ou PDFs da propriedade.</p>
          
          {/* LISTA DE ARQUIVOS */}
          <div className={styles.fileList}>
            {/* Arquivos Existentes */}
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

            {/* Arquivos Novos */}
            {newFiles.map((file, index) => (
              <div key={`new-${index}`} className={styles.fileItem}>
                <span className={styles.fileName}>
                  {file.name} <span className={styles.newTag}>(Novo)</span>
                </span>
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

        <div className={styles.section}>
          <h3 className={styles.textTitle}>Localização da Sede</h3>
          <p className={styles.subtitle}>Use o mapa para marcar a entrada da propriedade.</p>

          {/* Wrapper que anima e vira fullscreen */}
          <div className={`${styles.mapWrapper} ${isMap1Fullscreen ? styles.fullscreenMap : ''}`}>
            
            {/* BARRA DE FERRAMENTAS FLUTUANTE (DENTRO DO MAPA) */}
            <div className={styles.mapToolbar}>
              <button 
                type="button" 
                onClick={handleLocateMe} 
                className={styles.mapBtn} 
                title="Minha Localização"
              >
                <FiCrosshair size={22} />
              </button>
              <button 
                type="button" 
                onClick={() => setIsMap1Fullscreen(!isMap1Fullscreen)} 
                className={styles.mapBtn}
                title={isMap1Fullscreen ? "Sair da Tela Cheia" : "Expandir Mapa"}
              >
                {isMap1Fullscreen ? <FiMinimize size={22} /> : <FiMaximize size={22} />}
              </button>
            </div>

            <MapContainer 
              center={mapCenter} 
              zoom={15} 
              scrollWheelZoom={true} // Zoom com mouse ativado
              className={styles.map}
            >
              <MapResizer isFullscreen={isMap1Fullscreen} />
              <MapController center={mapCenter} />
              <MapSearchControl />
              
              <LayersControl position="bottomleft">
                
                {/* 1. Camada Híbrida: Satélite + Fronteiras (A que você pediu) */}
                <LayersControl.BaseLayer checked name="Satélite Híbrido">
                  <LayerGroup>
                    <TileLayer
                      attribution="Tiles &copy; Esri"
                      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    />
                    {/* Camada Transparente de Fronteiras e Nomes */}
                    <TileLayer
                      url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                    />
                  </LayerGroup>
                </LayersControl.BaseLayer>

                {/* 2. Camada Satélite Puro */}
                <LayersControl.BaseLayer name="Satélite Puro">
                  <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  />
                </LayersControl.BaseLayer>

                {/* 3. Camada Ruas */}
                <LayersControl.BaseLayer name="Mapa de Ruas">
                  <TileLayer
                    attribution="&copy; OpenStreetMap"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                </LayersControl.BaseLayer>
              </LayersControl>

              <LocationMarker position={formData.markerPosition} setPosition={handleMarkerChange} />
            </MapContainer>

            {isMap1Fullscreen && <div className={styles.escHint}>Clique no botão para sair</div>}
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.blueTitle}>Talhões</h3>
          <p className={styles.subtitle}>Se você preencher um campo de talhão, todos se tornam obrigatórios.</p>
          <Input
            label="Nome do talhão"
            name="talhaoName"
            value={formData.talhaoName}
            onChange={handleChange}
            onBlur={() => handleBlur('talhaoName')}
            placeholder="Lorem ipsum"
            error={errors.talhaoName}
            showError={touchedFields.talhaoName && !!errors.talhaoName}
          />
          <Input
            label="Área (hectares)"
            name="talhaoArea"
            value={formData.talhaoArea}
            onChange={handleChange}
            onBlur={() => handleBlur('talhaoArea')}
            placeholder="1"
            error={errors.talhaoArea}
            showError={touchedFields.talhaoArea && !!errors.talhaoArea}
          />
           <div className={styles.inputGroup}>
            <label className={styles.label}>Cultura atual do talhão</label>
            <CultureSearchSelect
              value={formData.talhaoCultura}
              onChange={(selectedCrop) => setFormData(prev => ({ ...prev, talhaoCultura: selectedCrop }))}
              placeholder="Selecione a cultura atual..."
            />
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.textTitle}>Situação</h3>
          <div className={styles.tagGroup}>
            <TagToggle
              color="blue"
              isActive={formData.situacao === 'producao'}
              onClick={() => setFormData(prev => ({ ...prev, situacao: 'producao' }))}
              type="button"
            >
              Em produção
            </TagToggle>
            <TagToggle
              color="green"
              isActive={formData.situacao === 'preparo'}
              onClick={() => setFormData(prev => ({ ...prev, situacao: 'preparo' }))}
              type="button"
            >
              Em preparo
            </TagToggle>
            <TagToggle
              color="orange"
              isActive={formData.situacao === 'pousio'}
              onClick={() => setFormData(prev => ({ ...prev, situacao: 'pousio' }))}
              type="button"
            >
              Em pousio
            </TagToggle>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.textTitle}>Área do talhão</h3>
          <p className={styles.subtitle}>Desenhe a área do talhão.</p>

          <div className={`${styles.mapWrapper} ${isMap2Fullscreen ? styles.fullscreenMap : ''}`}>
             
             <div className={styles.mapToolbar}>
              <button 
                type="button" 
                onClick={handleLocateMe} // Pode reutilizar ou criar um específico se quiser centralizar no talhão
                className={styles.mapBtn} 
              >
                <FiCrosshair size={22} />
              </button>
              <button 
                type="button" 
                onClick={() => setIsMap2Fullscreen(!isMap2Fullscreen)} 
                className={styles.mapBtn}
              >
                {isMap2Fullscreen ? <FiMinimize size={22} /> : <FiMaximize size={22} />}
              </button>
            </div>

            <MapContainer center={mapCenter} zoom={16} scrollWheelZoom={true} className={styles.map}>
              <MapResizer isFullscreen={isMap2Fullscreen} />
              <MapController center={mapCenter} />
              
              <LayersControl position="topright">
                 <LayersControl.BaseLayer checked name="Satélite Híbrido">
                  <LayerGroup>
                    <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
                    <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}" />
                  </LayerGroup>
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="Ruas">
                   <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                </LayersControl.BaseLayer>
              </LayersControl>

              <EditableMap
                onCreated={_onCreated}
                onDeleted={_onDeleted}
                existingPolygon={formData.talhaoPolygon}
              />
            </MapContainer>
             {isMap2Fullscreen && <div className={styles.escHint}>Clique no botão para sair</div>}
          </div>
        </div>

        <footer className={styles.footer}>
          <Button variant="tertiary" type="button" onClick={() => navigate(-1)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" disabled={!isValid || isLoading}>
            {isLoading ? 'Salvando...' : submitText}
          </Button>
        </footer>

      </form >
    </div >
  );
}