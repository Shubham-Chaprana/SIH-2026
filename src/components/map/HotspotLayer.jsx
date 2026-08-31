import { useEffect, useMemo, useRef } from 'react';
import { Popup } from 'maplibre-gl';
import { useMap } from './MapCore';
import { useStore } from '../../store/useStore';
import { CATEGORY_COLORS } from '../../data/mockData';
import { getCategoryShort, getRiskColor } from '../../utils/formatters';

const SOURCE_ID = 'hotspots';
const CLUSTER_LAYER = 'clusters';
const CLUSTER_COUNT_LAYER = 'cluster-count';
const UNCLUSTERED_LAYER = 'unclustered-point';

/** Match expression: category → color for unclustered points */
const categoryColorMatch = [
  'match', ['get', 'category'],
  'Industrial Persistent Source', CATEGORY_COLORS['Industrial Persistent Source'],
  'Industrial Accidental Fire', CATEGORY_COLORS['Industrial Accidental Fire'],
  'Wildfire', CATEGORY_COLORS['Wildfire'],
  'Agricultural Burning', CATEGORY_COLORS['Agricultural Burning'],
  'Gas Flare', CATEGORY_COLORS['Gas Flare'],
  CATEGORY_COLORS['Unknown'], // fallback
];

export default function HotspotLayer() {
  const ctx = useMap();
  const { map, mapReady } = ctx || { map: null, mapReady: false };
  const getFilteredGeoJSON = useStore((s) => s.getFilteredGeoJSON);
  const selectEvent = useStore((s) => s.selectEvent);
  const selectedEventId = useStore((s) => s.selectedEventId);
  const getSelectedEvent = useStore((s) => s.getSelectedEvent);
  const popupRef = useRef(null);

  const filteredGeoJson = useMemo(() => getFilteredGeoJSON(), [getFilteredGeoJSON]);

  // Smoothly pan to event when selected from lists or search
  useEffect(() => {
    if (!map || !mapReady || !selectedEventId) return;
    const event = getSelectedEvent();
    if (event && event.geometry?.coordinates) {
      map.flyTo({
        center: event.geometry.coordinates,
        zoom: Math.max(map.getZoom(), 10),
        duration: 1200,
      });
    }
  }, [map, mapReady, selectedEventId, getSelectedEvent]);

  useEffect(() => {
    if (!map || !mapReady) return;

    const data = filteredGeoJson;

    // Wait for style to finish loading before adding sources
    const addLayersWhenReady = () => {
      try {
        // Check if style is loaded
        if (!map.isStyleLoaded()) {
          console.log('HotspotLayer: waiting for style to load');
          map.once('styledata', addLayersWhenReady);
          return;
        }

        // Source with native clustering
        if (!map.getSource(SOURCE_ID)) {
          map.addSource(SOURCE_ID, {
            type: 'geojson',
            data,
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: 50,
          });
        } else {
          // Update existing source
          map.getSource(SOURCE_ID).setData(data);
        }

        // Cluster circles
        if (!map.getLayer(CLUSTER_LAYER)) {
          map.addLayer({
            id: CLUSTER_LAYER,
            type: 'circle',
            source: SOURCE_ID,
            filter: ['has', 'point_count'],
            paint: {
              'circle-color': [
                'step', ['get', 'point_count'],
                '#F5C518', 5,
                '#D97706', 15,
                '#DC2626',
              ],
              'circle-radius': [
                'step', ['get', 'point_count'],
                16, 5,
                22, 15,
                28,
              ],
              'circle-stroke-width': 2,
              'circle-stroke-color': '#FFFFFF',
              'circle-opacity': 0.9,
            },
          });
        }

        // Cluster count labels
        if (!map.getLayer(CLUSTER_COUNT_LAYER)) {
          map.addLayer({
            id: CLUSTER_COUNT_LAYER,
            type: 'symbol',
            source: SOURCE_ID,
            filter: ['has', 'point_count'],
            layout: {
              'text-field': '{point_count_abbreviated}',
              'text-font': ['Open Sans Semibold'],
              'text-size': 12,
            },
            paint: {
              'text-color': '#1A1A17',
            },
          });
        }

        // Unclustered points — colored by category
        if (!map.getLayer(UNCLUSTERED_LAYER)) {
          map.addLayer({
            id: UNCLUSTERED_LAYER,
            type: 'circle',
            source: SOURCE_ID,
            filter: ['!', ['has', 'point_count']],
            paint: {
              'circle-color': categoryColorMatch,
              'circle-radius': [
                'interpolate', ['linear'], ['get', 'risk_score'],
                0, 5,
                50, 7,
                100, 10,
              ],
              'circle-stroke-width': 2,
              'circle-stroke-color': '#FFFFFF',
              'circle-opacity': 0.85,
            },
          });
        }

        console.log('HotspotLayer: layers added successfully');
      } catch (error) {
        console.error('HotspotLayer: error adding layers', error);
      }
    };

    addLayersWhenReady();

    // Click handlers
    map.on('click', CLUSTER_LAYER, (e) => {
      const features = map.queryRenderedFeatures(e.point, { layers: [CLUSTER_LAYER] });
      const clusterId = features[0].properties.cluster_id;
      map.getSource(SOURCE_ID).getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return;
        map.flyTo({ center: features[0].geometry.coordinates, zoom, duration: 800 });
      });
    });

    map.on('click', UNCLUSTERED_LAYER, (e) => {
      const feature = e.features[0];
      const p = feature.properties;
      const coords = feature.geometry.coordinates.slice();

      // Parse evidence since GeoJSON stringifies nested objects
      let evidence = p.evidence;
      if (typeof evidence === 'string') {
        try { evidence = JSON.parse(evidence); } catch { evidence = []; }
      }

      // Show sparse popup
      if (popupRef.current) popupRef.current.remove();

      const popup = new Popup({
        closeButton: true,
        closeOnClick: true,
        maxWidth: '240px',
        offset: 12,
      })
        .setLngLat(coords)
        .setHTML(`
          <div style="padding: 12px; font-family: 'Inter', sans-serif;">
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
              <span style="font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 600;">${p.id}</span>
              <span style="padding: 1px 6px; font-size: 10px; font-weight: 600; border-radius: 9999px; color: white; background: ${getCategoryColor(p.category)};">
                ${getCategoryShort(p.category)}
              </span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 11px; margin-bottom: 10px;">
              <div><span style="color: #9C9C91;">Confidence</span><br/><span style="font-family: 'JetBrains Mono', monospace; font-weight: 500;">${p.confidence}%</span></div>
              <div><span style="color: #9C9C91;">Risk</span><br/><span style="font-family: 'JetBrains Mono', monospace; font-weight: 600; color: ${getRiskColor(p.risk_tier)};">${p.risk_score} ${p.risk_tier}</span></div>
            </div>
            <button
              onclick="window.__thermosSelectEvent('${p.id}')"
              style="width: 100%; padding: 5px 0; font-size: 11px; font-weight: 500; background: #F5C518; border: none; border-radius: 4px; cursor: pointer; color: #1A1A17; font-family: 'Inter', sans-serif;"
            >
              Investigate →
            </button>
          </div>
        `)
        .addTo(map);

      popupRef.current = popup;
    });

    // Cursor changes
    map.on('mouseenter', CLUSTER_LAYER, () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', CLUSTER_LAYER, () => { map.getCanvas().style.cursor = ''; });
    map.on('mouseenter', UNCLUSTERED_LAYER, () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', UNCLUSTERED_LAYER, () => { map.getCanvas().style.cursor = ''; });

    return () => {
      if (popupRef.current) popupRef.current.remove();
      if (map.getLayer(CLUSTER_COUNT_LAYER)) map.removeLayer(CLUSTER_COUNT_LAYER);
      if (map.getLayer(CLUSTER_LAYER)) map.removeLayer(CLUSTER_LAYER);
      if (map.getLayer(UNCLUSTERED_LAYER)) map.removeLayer(UNCLUSTERED_LAYER);
      if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
    };
  }, [map, mapReady]);

  // Update data when filters change
  useEffect(() => {
    if (!map || !mapReady) return;
    const source = map.getSource(SOURCE_ID);
    if (source) {
      source.setData(filteredGeoJson);
    }
  }, [map, mapReady, filteredGeoJson]);

  // Global handler for popup "Investigate" button
  useEffect(() => {
    window.__thermosSelectEvent = (id) => {
      selectEvent(id);
      if (popupRef.current) popupRef.current.remove();
    };
    return () => { delete window.__thermosSelectEvent; };
  }, [selectEvent]);

  if (!map || !mapReady) return null;

  return null; // Layer-only component — renders via MapLibre
}
