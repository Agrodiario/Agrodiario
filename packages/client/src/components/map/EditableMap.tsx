import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-draw";

interface EditableMapProps {
  onCreated: (e: any) => void;
  onDeleted: (e: any) => void;
  existingPolygon?: any;
}

export function EditableMap({
  onCreated,
  onDeleted,
  existingPolygon,
}: EditableMapProps) {
  const map = useMap();
  const featureGroupRef = useRef<L.FeatureGroup | null>(null);
  const drawControlRef = useRef<any>(null);

  useEffect(() => {
    if (!map) return;

    // Cria o FeatureGroup para armazenar os layers desenhados
    const featureGroup = new L.FeatureGroup();
    map.addLayer(featureGroup);
    featureGroupRef.current = featureGroup;

    // Configura o controle de desenho
    const drawControl = new (L.Control as any).Draw({
      position: "topright",
      draw: {
        rectangle: false,
        circle: false,
        circlemarker: false,
        marker: false,
        polyline: false,
        polygon: {
          allowIntersection: false,
          showArea: true,
          drawError: {
            color: "#e1e100",
            message: "<strong>Erro:</strong> linhas não podem se cruzar!",
          },
          shapeOptions: { color: "yellow", fillOpacity: 0.4 },
        },
      },
      edit: {
        featureGroup: featureGroup,
        remove: true,
      },
    });

    map.addControl(drawControl);
    drawControlRef.current = drawControl;

    // Event listeners
    map.on((L as any).Draw.Event.CREATED, onCreated);
    map.on((L as any).Draw.Event.DELETED, onDeleted);

    // Se houver polígono existente, adiciona ao mapa
    if (existingPolygon) {
      const layer = L.polygon(existingPolygon, {
        color: "yellow",
        fillOpacity: 0.4,
      });
      featureGroup.addLayer(layer);
    }

    // Cleanup
    return () => {
      if (drawControlRef.current) {
        map.removeControl(drawControlRef.current);
      }
      if (featureGroupRef.current) {
        map.removeLayer(featureGroupRef.current);
      }
      map.off((L as any).Draw.Event.CREATED, onCreated);
      map.off((L as any).Draw.Event.DELETED, onDeleted);
    };
  }, [map]);

  // Atualiza polígono existente quando muda
  useEffect(() => {
    if (!featureGroupRef.current) return;

    featureGroupRef.current.clearLayers();
    if (existingPolygon) {
      const layer = L.polygon(existingPolygon, {
        color: "yellow",
        fillOpacity: 0.4,
      });
      featureGroupRef.current.addLayer(layer);
    }
  }, [existingPolygon]);

  return null;
}
