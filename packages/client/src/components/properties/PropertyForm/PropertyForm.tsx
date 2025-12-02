// src/components/properties/PropertyForm/PropertyForm.tsx
import { useState } from 'react';
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

// --- Correção de ícones do Leaflet ---
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});
// ------------------------------------

// 1. Definindo o tipo dos dados do formulário
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
  talhaoPolygon: any; // Armazena as coordenadas do polígono
};

// 2. Definindo as props do componente
type Props = {
  initialData?: Partial<PropertyFormData>; // Opcional: usado na edição
  onSubmit: (data: PropertyFormData) => void;
  isLoading?: boolean; // Loading state for submit button
};

// Componente auxiliar para capturar cliques no mapa
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

  // 3. Estado centralizado do formulário
  // Inicializa com valores vazios OU com os dados recebidos (initialData)
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

  // Handler genérico para inputs de texto
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handler para o envio do formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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

  // Textos dinâmicos baseados no modo (Novo ou Editar)
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

        {/* === SEÇÃO 1: DADOS DA PROPRIEDADE === */}
        <div className={styles.section}>
          <h3 className={styles.blueTitle}>Dados da propriedade</h3>

          <Input
            label="Nome da propriedade"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ex: Sítio Oliveira"
          />
          <Input
            label="Endereço (estrada, município, estado)"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Estrada da Lavoura..."
          />

          <div className={styles.row}>
            <Input
              label="Área total (hectares)"
              name="areaTotal"
              value={formData.areaTotal}
              onChange={handleChange}
              placeholder="10"
            />
            <Input
              label="Área de produção (hectares)"
              name="areaProducao"
              value={formData.areaProducao}
              onChange={handleChange}
              placeholder="2"
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

        {/* === SEÇÃO 4: TALHÕES === */}
        <div className={styles.section}>
          <h3 className={styles.blueTitle}>Talhões</h3>
          <Input
            label="Nome do talhão"
            name="talhaoName"
            value={formData.talhaoName}
            onChange={handleChange}
            placeholder="Lorem ipsum"
          />
          <Input
            label="Área"
            name="talhaoArea"
            value={formData.talhaoArea}
            onChange={handleChange}
            placeholder="1"
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
          <Button variant="primary" type="submit" disabled={isLoading}>
            {isLoading ? 'Salvando...' : submitText}
          </Button>
        </footer>

      </form >
    </div >
  );
}