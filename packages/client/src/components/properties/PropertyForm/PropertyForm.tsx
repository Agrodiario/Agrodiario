import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { EditableMap } from '../../map/EditableMap';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import L from 'leaflet';

import styles from './PropertyForm.module.css';
import { Input } from '../../common/Input/Input';
import { Button } from '../../common/Button/Button';
import { FileInput } from '../../common/FileInput/FileInput';
import { TagToggle } from '../../common/TagToggle/TagToggle';
import { FiArrowLeft, FiUpload } from 'react-icons/fi';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { CultureSearchSelect } from '@/components/cultures/CultureSearchSelect/CultureSearchSelect';

// IMPORTAÇÕES DOS UTILS
import { validateNumberField } from '@/utils/validators';
import { numberMask } from '@/utils/masks';

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
};

type Props = {
  initialData?: Partial<PropertyFormData>;
  onSubmit: (data: PropertyFormData) => void;
  isLoading?: boolean;
};

function LocationMarker({ position, setPosition }: any) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? <Marker position={position} /> : null;
}

export function PropertyForm({ initialData, onSubmit, isLoading = false }: Props) {
  const navigate = useNavigate();
  const isEditMode = !!initialData;

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
    markerPosition: initialData?.markerPosition || [-22.85, -50.65],
    talhaoPolygon: initialData?.talhaoPolygon || null,
  });

  // Estados de Validação
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValid, setIsValid] = useState(false);

  // --- LÓGICA DE VALIDAÇÃO ---

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

    // 1. Validação dos campos de Propriedade (Sempre obrigatórios)
    requiredPropertyFields.forEach(field => {
      const value = (formData[field] || '').toString();
      const error = validateField(field, value);
      if (error) {
        isBasicPropertyValid = false;
      }
    });

    // 2. Validação condicional dos campos de Talhão
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

    // 1. Campos de Propriedade obrigatórios
    const requiredPropertyFields: (keyof PropertyFormData)[] = ['name', 'address', 'areaTotal', 'areaProducao', 'cultivo'];
    
    // 2. Verifica se o usuário preencheu algum campo de Talhão
    const isTalhaoStarted = formData.talhaoName.trim() !== '' || 
                            formData.talhaoArea.trim() !== '' || 
                            formData.talhaoCultura.trim() !== '';

    let fieldsToTouch = [...requiredPropertyFields];
    if (isTalhaoStarted) {
        fieldsToTouch.push('talhaoName', 'talhaoArea', 'talhaoCultura');
    }

    // 3. Marca os campos necessários como tocados
    const newTouched: Record<string, boolean> = {};
    fieldsToTouch.forEach(field => { newTouched[field] = true; });
    setTouchedFields(newTouched);

    // 4. Executa a validação final
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

    onSubmit(formData);
  };

  // Handler para atualizar a posição do pino no mapa 1
  const handleMarkerChange = (pos: [number, number]) => {
    setFormData(prev => ({ ...prev, markerPosition: pos }));
  };

  // Handlers para o desenho no mapa 2
  const _onCreated = (e: any) => {
    if (e.layerType === 'polygon') {
      console.log('Área desenhada:', e.layer.getLatLngs());
      setFormData(prev => ({ ...prev, talhaoPolygon: e.layer.getLatLngs() }));
    }
  };

  const _onDeleted = (_e: any) => {
    console.log('Área apagada');
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

        {/* === SEÇÃO 1: DADOS DA PROPRIEDADE (Obrigatórios) === */}
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

        {/* === SEÇÃO 2: CERTIFICAÇÕES === */}
        <div className={styles.section}>
          <h3 className={styles.textTitle}>Certificações</h3>
          <p className={styles.subtitle}>Você pode inserir certificações já existentes, se houver.</p>
          <FileInput leftIcon={<FiUpload />}>Fazer upload de foto ou documento</FileInput>
        </div>

        {/* === SEÇÃO 3: MAPA DA PROPRIEDADE === */}
        <div className={styles.section}>
          <h3 className={styles.textTitle}>Área da propriedade</h3>
          <p className={styles.subtitle}>Selecione no mapa a localização da propriedade.</p>

          <div className={styles.mapContainer}>
            <MapContainer center={[-22.85, -50.65]} zoom={15} scrollWheelZoom={false} className={styles.map}>
              <TileLayer
                attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
              <LocationMarker position={formData.markerPosition} setPosition={handleMarkerChange} />
            </MapContainer>
          </div>
        </div>

        {/* === SEÇÃO 4: TALHÕES (Opcional, mas condicionalmente obrigatório) === */}
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
            // required Removido
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
            // required Removido
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

        {/* === SEÇÃO 5: SITUAÇÃO === */}
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

        {/* === SEÇÃO 6: MAPA DO TALHÃO === */}
        <div className={styles.section}>
          <h3 className={styles.textTitle}>Área do talhão</h3>
          <p className={styles.subtitle}>Desenhe no mapa a área do talhão.</p>

          <div className={styles.mapContainer}>
            <MapContainer center={[-22.852, -50.651]} zoom={16} scrollWheelZoom={false} className={styles.map}>
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
              <EditableMap
                onCreated={_onCreated}
                onDeleted={_onDeleted}
                existingPolygon={formData.talhaoPolygon}
              />
            </MapContainer>
          </div>
        </div>

        {/* === RODAPÉ === */}
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