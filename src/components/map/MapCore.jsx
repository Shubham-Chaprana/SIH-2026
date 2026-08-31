import { useRef, useEffect, useState, createContext, useContext, useCallback } from 'react';
import { Map as MapLibreMap, NavigationControl, AttributionControl, setWorkerCount, setWorkerUrl } from 'maplibre-gl';
import mapLibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';
import 'maplibre-gl/dist/maplibre-gl.css';

setWorkerUrl(mapLibreWorkerUrl);
setWorkerCount(1);

const MapContext = createContext(null);
export const useMap = () => useContext(MapContext);

const createBaseStyle = () => ({
  version: 8,
  name: 'Thermos Base',
  glyphs: 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf',
  sources: {
    openstreetmap: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap contributors',
    },
  },
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: {
        'background-color': '#F8F4EC',
      },
    },
    {
      id: 'openstreetmap-tiles',
      type: 'raster',
      source: 'openstreetmap',
      paint: {
        'raster-opacity': 0.72,
      },
    },
  ],
});

export default function MapCore({ children }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const readyRef = useRef(false);
  const [mapInstance, setMapInstance] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    let timeoutId = null;

    const markReady = () => {
      if (readyRef.current) return;
      readyRef.current = true;
      setMapInstance(mapRef.current);
      setMapReady(true);
    };

    const handleError = (event) => {
      const message = event?.error?.message || 'Map style or tile source failed to load';
      console.error('MapCore: map error event', { message, event });
      setError('Map failed to load: ' + message);
    };

    const initMap = () => {
      try {
        const node = containerRef.current;
        const style = createBaseStyle();

        const map = new MapLibreMap({
          container: node,
          style,
          center: [78.9629, 22.5937],
          zoom: 4.5,
          maxZoom: 18,
          minZoom: 3,
          attributionControl: false,
          preserveDrawingBuffer: true,
        });

        mapRef.current = map;
        map.once('load', () => {
          markReady();
        });
        map.on('error', handleError);

        map.addControl(new NavigationControl({ showCompass: false }), 'top-right');
        map.addControl(new AttributionControl({ compact: true }), 'bottom-left');

        timeoutId = setTimeout(() => {
          if (!readyRef.current) {
            console.error('MapCore: load timeout reached; style did not finish loading');
            setError('Map failed to load: style did not finish loading in time.');
          }
        }, 15000);
      } catch (err) {
        console.error('MapCore: initialization exception', err);
        setError('Failed to initialize map: ' + (err.message || 'Unknown error'));
      }
    };

    const checkAndInit = () => {
      const node = containerRef.current;
      if (!node) {
        console.log('MapCore: container not ready yet, retrying');
        setTimeout(checkAndInit, 100);
        return;
      }

      if (node.offsetParent === null || (node.offsetHeight === 0 && node.clientHeight === 0)) {
        console.log('MapCore: container has zero height, retrying');
        setTimeout(checkAndInit, 100);
        return;
      }

      initMap();
    };

    checkAndInit();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (e) {
          console.warn('MapCore: error removing map', e);
        }
        mapRef.current = null;
        readyRef.current = false;
        setMapInstance(null);
        setMapReady(false);
      }
    };
  }, []);

  const flyTo = useCallback((coords, zoom = 12) => {
    if (mapRef.current) {
      mapRef.current.flyTo({ center: coords, zoom, duration: 1500 });
    }
  }, []);

  const fitBounds = useCallback((bounds, padding = 60) => {
    if (mapRef.current) {
      mapRef.current.fitBounds(bounds, { padding, duration: 1200 });
    }
  }, []);

  const toggleBasemap = useCallback(() => {
    // No-op for now - can be implemented later if needed
  }, []);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[var(--color-surface)]">
        <div className="text-center px-6">
          <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-red-50 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <p className="text-sm text-[var(--color-text-primary)] font-medium mb-1">Map Error</p>
          <p className="text-[14px] text-[var(--color-text-secondary)]">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <MapContext.Provider value={{ map: mapInstance, mapReady, flyTo, fitBounds, toggleBasemap, basemap: 'light' }}>
      <div className="relative w-full h-full min-h-[420px]">
        <div ref={containerRef} className="absolute inset-0 bg-[#F5F0E6]" style={{ height: '100%', minHeight: '420px' }} />

        {!mapReady && !error && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-[var(--color-surface)]">
            <div className="text-center">
              <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent)]" />
              <p className="text-sm text-[var(--color-text-secondary)]">Loading map…</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-[var(--color-surface)] px-6">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
              <p className="mb-1 text-sm font-medium text-[var(--color-text-primary)]">Map Error</p>
              <p className="text-[14px] text-[var(--color-text-secondary)]">{error}</p>
            </div>
          </div>
        )}

        {mapReady && children}
      </div>
    </MapContext.Provider>
  );
}
