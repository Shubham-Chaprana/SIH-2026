import { useEffect, useMemo } from 'react';
import { useMap } from './MapCore';
import { useStore } from '../../store/useStore';

const SOURCE_ID = 'thermal-heatmap';
const LAYER_ID = 'thermal-heat';

const HEATMAP_STYLES = {
  events: {
    colorRamp: ['#F5C518', '#F59E0B', '#DC2626', '#7F1D1D'],
    opacity: 0.48,
  },
  thermal: {
    colorRamp: ['#F5C518', '#F59E0B', '#DC2626', '#7C2D12'],
    opacity: 0.55,
  },
  persistence: {
    colorRamp: ['#A7F3D0', '#6EE7B7', '#10B981', '#065F46'],
    opacity: 0.52,
  },
  risk: {
    colorRamp: ['#FDE68A', '#F59E0B', '#EF4444', '#7F1D1D'],
    opacity: 0.58,
  },
};

export default function HeatmapLayer() {
  const { map, mapReady } = useMap();
  const mapMode = useStore((s) => s.mapMode);
  const getFilteredGeoJSON = useStore((s) => s.getFilteredGeoJSON);

  const heatData = useMemo(() => {
    const geojson = getFilteredGeoJSON();
    return {
      type: 'FeatureCollection',
      features: geojson.features.map((feature) => ({
        ...feature,
        properties: {
          ...feature.properties,
          weight: Math.min(1, feature.properties.risk_score / 100),
        },
      })),
    };
  }, [getFilteredGeoJSON]);

  useEffect(() => {
    if (!map || !mapReady) return;

    if (!map.getSource(SOURCE_ID)) {
      map.addSource(SOURCE_ID, {
        type: 'geojson',
        data: heatData,
      });
    } else {
      map.getSource(SOURCE_ID).setData(heatData);
    }

    const style = HEATMAP_STYLES[mapMode] || HEATMAP_STYLES.events;

    if (map.getLayer(LAYER_ID)) {
      map.removeLayer(LAYER_ID);
    }

    map.addLayer({
      id: LAYER_ID,
      type: 'heatmap',
      source: SOURCE_ID,
      paint: {
        'heatmap-weight': ['interpolate', ['linear'], ['get', 'risk_score'], 0, 0, 100, 1],
        'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 8, 10, 20],
        'heatmap-intensity': 1,
        'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0, 'rgba(0,0,0,0)',
          0.2, style.colorRamp[0],
          0.45, style.colorRamp[1],
          0.7, style.colorRamp[2],
          1, style.colorRamp[3],
        ],
        'heatmap-opacity': style.opacity,
      },
    });

    return () => {
      if (map.getLayer(LAYER_ID)) {
        map.removeLayer(LAYER_ID);
      }
      if (map.getSource(SOURCE_ID)) {
        map.removeSource(SOURCE_ID);
      }
    };
  }, [map, mapReady, heatData, mapMode]);

  return null;
}
