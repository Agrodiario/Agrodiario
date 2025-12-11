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
import { FiArrowLeft, FiCrosshair, FiEye, FiMaximize, FiMinimize, FiPlus, FiTrash2, FiUpload } from 'react-icons/fi';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { CultureSearchSelect } from '@/components/cultures/CultureSearchSelect/CultureSearchSelect';

// IMPORTAÇÕES DOS UTILS
import { validateNumberField } from "@/utils/validators";
import { numberMask } from "@/utils/masks";

// --- Correção de ícones do Leaflet ---
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});
// ------------------------------------

export type PlotData = {
  name: string;
  area: string;
  situacao: "producao" | "preparo" | "pousio";
  polygon: any;
};

export type PropertyFormData = {
  name: string;
  address: string;
  areaTotal: string;
  areaProducao: string;
  cultivo: string;
  markerPosition: [number, number] | null;
  plots: PlotData[];
};

type Props = {
  initialData?: Partial<PropertyFormData>;
  onSubmit: (data: PropertyFormData) => void;
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
const createEmptyPlot = (): PlotData => ({
  name: '',
  area: '',
  situacao: 'preparo',
  polygon: null,
});

export function PropertyForm({
  initialData,
  onSubmit,
  isLoading = false,
}: Props) {
  const navigate = useNavigate();
  const isEditMode = !!initialData;

  const [mapCenter, setMapCenter] = useState<[number, number]>([-22.85, -50.65]);

  const [isMap1Fullscreen, setIsMap1Fullscreen] = useState(false);
  const [isMap2Fullscreen, setIsMap2Fullscreen] = useState(false);

  const [formData, setFormData] = useState<PropertyFormData>({
    name: initialData?.name || "",
    address: initialData?.address || "",
    areaTotal: initialData?.areaTotal || "",
    areaProducao: initialData?.areaProducao || "",
    cultivo: initialData?.cultivo || "",
    markerPosition: initialData?.markerPosition || [-22.85, -50.65],
    plots: initialData?.plots || [],
  });

  const [activePlotIndex, setActivePlotIndex] = useState<number | null>(null);

  // Estados de Validação
  const [isValid, setIsValid] = useState(false);

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
  // Estados para arquivos de certificação
  const [certificationFiles, setCertificationFiles] = useState<File[]>([]);

  // --- LÓGICA DE VALIDAÇÃO ---

  const validateField = (
    fieldName: keyof PropertyFormData,
    value: string,
  ): string => {
    // Campos de texto obrigatórios (Propriedade)
    if (["name", "address", "cultivo"].includes(fieldName)) {
      if (!value || value.trim() === "") {
        switch (fieldName) {
          case "name":
            return "Nome da propriedade é obrigatório";
          case "address":
            return "Endereço é obrigatório";
          case "cultivo":
            return "Cultivo principal é obrigatório";
          default:
            return "Campo obrigatório";
        }
      }
    }

    // Validação para campos de área (Numéricos)
    if (["areaTotal", "areaProducao"].includes(fieldName)) {
      // Campos de Propriedade (Área Total e Produção) são obrigatórios
      if (!value || value.trim() === "") {
        return `${fieldName === "areaTotal" ? "Área total" : "Área de produção"} é obrigatória`;
      }

      const error = validateNumberField(
        value,
        fieldName === "areaTotal" ? "Área total" : "Área de produção",
      );

      // Ajuste específico para área de produção (pode ser 0)
      if (fieldName === "areaProducao" && error.includes("maior que zero")) {
        const numValue = parseFloat(value.replace(",", "."));
        if (numValue >= 0) return "";
      }

      return error;
    }

    return "";
  };

  const validatePlotField = (fieldName: keyof PlotData, value: string): string => {
    if (fieldName === 'name' && (!value || value.trim() === '')) {
      return 'Nome do talhão é obrigatório';
    }
    if (fieldName === "area") {
      if (!value || value.trim() === "") {
        return "Área do talhão é obrigatória";
      }
      return validateNumberField(value, "Área do talhão");
    }
    return "";
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    const fieldName = name as keyof PropertyFormData;
    let processedValue = value;

    // Aplica máscara de número para os campos de área
    if (["areaTotal", "areaProducao"].includes(fieldName)) {
      processedValue = numberMask(value);
    }

    setFormData((prev) => {
      const updatedFormData = { ...prev, [fieldName]: processedValue };

      return updatedFormData;
    });
  };

  // --- TALHÃO HANDLERS ---

  const addPlot = () => {
    setFormData(prev => ({
      ...prev,
      plots: [...prev.plots, createEmptyPlot()],
    }));
    setActivePlotIndex(formData.plots.length);
  };

  const removePlot = (index: number) => {
    setFormData(prev => ({
      ...prev,
      plots: prev.plots.filter((_, i) => i !== index),
    }));
    if (activePlotIndex === index) {
      setActivePlotIndex(null);
    } else if (activePlotIndex !== null && activePlotIndex > index) {
      setActivePlotIndex(activePlotIndex - 1);
    }
  };

  const updatePlot = (index: number, field: keyof PlotData, value: any) => {
    let processedValue = value;

    if (field === "area") {
      processedValue = numberMask(value);
    }

    setFormData((prev) => ({
      ...prev,
      plots: prev.plots.map((t, i) =>
        i === index ? { ...t, [field]: processedValue } : t
      ),
    }));
  };

  const handlePlotPolygonCreated = (polygon: any) => {
    if (activePlotIndex !== null) {
      updatePlot(activePlotIndex, 'polygon', polygon);
    }
  };

  const handlePlotPolygonDeleted = () => {
    if (activePlotIndex !== null) {
      updatePlot(activePlotIndex, 'polygon', null);
    }
  };

  // Efeito para validar o formulário inteiro em tempo real
  useEffect(() => {
    const requiredPropertyFields: (keyof PropertyFormData)[] = [
      "name",
      "address",
      "areaTotal",
      "areaProducao",
      "cultivo",
    ];

    let isBasicPropertyValid = true;

    // Validação dos campos de Propriedade (Sempre obrigatórios)
    requiredPropertyFields.forEach(field => {
      const value = (formData[field] || '').toString();
      const error = validateField(field, value);
      if (error) {
        isBasicPropertyValid = false;
      }
    });

    // 2. Validação dos Talhões (cada talhão precisa ter todos os campos preenchidos)
    let areplotsValid = true;
    formData.plots.forEach(plot => {
      if (validatePlotField('name', plot.name)) areplotsValid = false;
      if (validatePlotField('area', plot.area)) areplotsValid = false;
    });

    setIsValid(isBasicPropertyValid && areplotsValid);
  }, [formData]);

  // Handler para o envio do formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Campos de Propriedade obrigatórios
    const requiredPropertyFields: (keyof PropertyFormData)[] = ['name', 'address', 'areaTotal', 'areaProducao', 'cultivo'];

    // 2. Marca os campos de propriedade como tocados
    const newTouched: Record<string, boolean> = {};
    requiredPropertyFields.forEach((field) => {
      newTouched[field] = true;
    });

    // 3. Valida campos de propriedade
    const finalErrors: Record<string, string> = {};
    let hasError = false;

    requiredPropertyFields.forEach((field) => {
      const value = (formData[field] || "").toString();
      const error = validateField(field, value);
      if (error) {
        finalErrors[field] = error;
        hasError = true;
      }
    });

    // 4. Valida todos os talhões
    formData.plots.forEach((plot, index) => {
      const nameError = validatePlotField('name', plot.name);
      const areaError = validatePlotField('area', plot.area);

      if (nameError || areaError) {
        hasError = true;
        // Set active plot to the first one with error
        if (activePlotIndex === null) {
          setActivePlotIndex(index);
        }
      }
    });

    if (hasError) {
      return;
    }

    onSubmit(formData);
  };

  // Handler para atualizar a posição do pino no mapa 1
  const handleMarkerChange = (pos: [number, number]) => {
    setFormData((prev) => ({ ...prev, markerPosition: pos }));
  };

  // Handlers para upload de arquivos
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setCertificationFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setCertificationFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleViewFile = (file: File) => {
    const url = URL.createObjectURL(file);
    window.open(url, "_blank");
  };

  // Handlers para o desenho no mapa 2 (talhão)
  const _onCreated = (e: any) => {
    if (e.layerType === 'polygon') {
      handlePlotPolygonCreated(e.layer.getLatLngs());
    }
  };

  const _onDeleted = (_e: any) => {
    handlePlotPolygonDeleted();
  };

  // Get active talhão for display
  const activePlot = activePlotIndex !== null ? formData.plots[activePlotIndex] : null;

  const title = isEditMode ? "Editar propriedade" : "Nova propriedade/talhão";
  const submitText = isEditMode ? "Salvar alterações" : "Salvar propriedade";

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
            placeholder="Ex: Sítio Oliveira"
            required
          />
          <Input
            label="Endereço (estrada, município, estado)"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Estrada da Lavoura..."
            required
          />

          <div className={styles.row}>
            <Input
              label="Área total (hectares)"
              name="areaTotal"
              value={formData.areaTotal}
              onChange={handleChange}
              placeholder="10"
              required
            />
            <Input
              label="Área de produção (hectares)"
              name="areaProducao"
              value={formData.areaProducao}
              onChange={handleChange}
              placeholder="2"
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Cultivo principal</label>
            <CultureSearchSelect
              value={formData.cultivo}
              onChange={(selectedCrop) =>
                setFormData((prev) => ({ ...prev, cultivo: selectedCrop }))
              }
              placeholder="Selecione o cultivo principal..."
            />
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.textTitle}>Certificações</h3>
          <p className={styles.subtitle}>
            Você pode inserir certificações já existentes, se houver.
          </p>
          <FileInput
            leftIcon={<FiUpload />}
            onChange={handleFileChange}
            multiple
          >
            Fazer upload de foto ou documento
          </FileInput>

          {certificationFiles.length > 0 && (
            <div className={styles.fileList}>
              {certificationFiles.map((file, index) => (
                <div key={index} className={styles.fileItem}>
                  <span className={styles.fileName}>{file.name}</span>
                  <div className={styles.fileActions}>
                    <button
                      type="button"
                      onClick={() => handleViewFile(file)}
                      className={styles.actionBtn}
                      title="Visualizar"
                    >
                      <FiEye size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className={`${styles.actionBtn} ${styles.deleteBtn}`}
                      title="Remover"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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

        {/* === SEÇÃO 4: TALHÕES === */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.blueTitle}>Talhões</h3>
            <Button
              variant="secondary"
              type="button"
              onClick={addPlot}
              leftIcon={<FiPlus />}
            >
              Adicionar talhão
            </Button>
          </div>

          {formData.plots.length === 0 ? (
            <p className={styles.subtitle}>Nenhum talhão adicionado. Clique em "Adicionar talhão" para criar um.</p>
          ) : (
            <div className={styles.plotsList}>
              {formData.plots.map((Plot, index) => (
                <div
                  key={index}
                  className={`${styles.PlotCard} ${activePlotIndex === index ? styles.PlotCardActive : ''}`}
                  onClick={() => setActivePlotIndex(index)}
                >
                  <div className={styles.PlotCardHeader}>
                    <span className={styles.PlotCardTitle}>
                      {Plot.name || `Talhão ${index + 1}`}
                    </span>
                    <button
                      type="button"
                      className={styles.PlotRemoveBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        removePlot(index);
                      }}
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                  <div className={styles.PlotCardInfo}>
                    {Plot.area && <span>{Plot.area} ha</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* === SEÇÃO 5: EDIÇÃO DO TALHÃO SELECIONADO === */}
        {activePlot && activePlotIndex !== null && (
          <>
            <div className={styles.section}>
              <h3 className={styles.textTitle}>Editar Talhão: {activePlot.name || `Talhão ${activePlotIndex + 1}`}</h3>
              <Input
                label="Nome do talhão"
                name={`Plot-name-${activePlotIndex}`}
                value={activePlot.name}
                onChange={(e) => updatePlot(activePlotIndex, 'name', e.target.value)}
                placeholder="Ex: Talhão Norte"
                required
              />
              <Input
                label="Área (hectares)"
                name={`Plot-area-${activePlotIndex}`}
                value={activePlot.area}
                onChange={(e) => updatePlot(activePlotIndex, 'area', e.target.value)}
                placeholder="1"
                required
              />

              <h4 className={styles.textTitle} style={{ marginTop: "1rem" }}>
                Situação do talhão
              </h4>
              <div className={styles.tagGroup}>
                <TagToggle
                  color="blue"
                  isActive={activePlot.situacao === 'producao'}
                  onClick={() => updatePlot(activePlotIndex, 'situacao', 'producao')}
                  type="button"
                >
                  Em produção
                </TagToggle>
                <TagToggle
                  color="green"
                  isActive={activePlot.situacao === 'preparo'}
                  onClick={() => updatePlot(activePlotIndex, 'situacao', 'preparo')}
                  type="button"
                >
                  Em preparo
                </TagToggle>
                <TagToggle
                  color="orange"
                  isActive={activePlot.situacao === 'pousio'}
                  onClick={() => updatePlot(activePlotIndex, 'situacao', 'pousio')}
                  type="button"
                >
                  Em pousio
                </TagToggle>
              </div>
            </div>

            {/* === SEÇÃO 6: MAPA DO TALHÃO === */}
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
                    existingPolygon={formData.plots[activePlotIndex].polygon}
                  />
                </MapContainer>
                {isMap2Fullscreen && <div className={styles.escHint}>Clique no botão para sair</div>}
              </div>
            </div>
          </>
        )}

        <footer className={styles.footer}>
          <Button
            variant="tertiary"
            type="button"
            onClick={() => navigate(-1)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={!isValid || isLoading}
          >
            {isLoading ? "Salvando..." : submitText}
          </Button>
        </footer>
      </form>
    </div>
  );
}
