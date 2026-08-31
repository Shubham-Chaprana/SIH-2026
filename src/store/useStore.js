import { create } from 'zustand';
import { mockGeoJSON } from '../data/mockData';

const PRESET_TIME_WINDOWS = {
  '24H': [0.96, 1],
  '7D': [0.75, 1],
  '30D': [0, 1],
};

const DATE_RANGE_DAYS = {
  '24H': 1,
  '7D': 7,
  '30D': 30,
};

/**
 * Central store — single source of truth for selected event,
 * active filters, map display state, and time window. Read/written by Map,
 * Priority Queue, and Incident Drawer.
 */
export const useStore = create((set, get) => ({
  // All events (GeoJSON)
  events: mockGeoJSON,

  // Selected event (clicked from map/list/anywhere)
  selectedEventId: null,
  selectEvent: (id) => set({ selectedEventId: id, drawerOpen: id !== null }),
  clearSelection: () => set({ selectedEventId: null, drawerOpen: false }),

  // Drawer state
  drawerOpen: false,
  setDrawerOpen: (open) => set({ drawerOpen: open, selectedEventId: open ? get().selectedEventId : null }),

  // Derived: get selected event feature
  getSelectedEvent: () => {
    const { events, selectedEventId } = get();
    if (!selectedEventId) return null;
    return events.features.find((f) => f.properties.id === selectedEventId) || null;
  },

  // Filters
  filters: {
    confidenceMin: 0,
    dateRange: '30D',
    categories: [],
    riskTiers: [],
    searchQuery: '',
    bbox: null,
  },
  setFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value } })),
  resetFilters: () =>
    set({
      filters: {
        confidenceMin: 0,
        dateRange: '30D',
        categories: [],
        riskTiers: [],
        searchQuery: '',
        bbox: null,
      },
    }),

  // Time range for bottom strip and map window
  timeRange: '24H',
  setTimeRange: (range) => {
    set((state) => ({
      timeRange: range,
      timeSliderValue: PRESET_TIME_WINDOWS[range] || [0, 1],
      filters: {
        ...state.filters,
        dateRange: range,
      },
    }));
  },

  // Time slider value (0–1 normalized range)
  timeSliderValue: PRESET_TIME_WINDOWS['24H'],
  setTimeSliderValue: (val) => set({ timeSliderValue: val }),

  mapMode: 'events',
  setMapMode: (mode) => set({ mapMode: mode }),

  showIndustrialOverlay: true,
  toggleIndustrialOverlay: () => set((state) => ({ showIndustrialOverlay: !state.showIndustrialOverlay })),

  // Computed: filtered events
  getFilteredEvents: () => {
    const { events, filters, timeSliderValue } = get();
    const [startNorm, endNorm] = timeSliderValue || [0, 1];
    const totalDays = DATE_RANGE_DAYS[filters.dateRange] || 30;
    const minAgeDays = Math.max(0, (1 - endNorm) * totalDays);
    const maxAgeDays = Math.max(0, (1 - startNorm) * totalDays);
    const now = Date.now();

    return events.features.filter((f) => {
      const p = f.properties;
      const ageDays = (now - new Date(p.first_detected).getTime()) / 86400000;

      if (ageDays < minAgeDays || ageDays > maxAgeDays) return false;
      if (p.confidence < filters.confidenceMin) return false;
      if (filters.categories.length > 0 && !filters.categories.includes(p.category)) return false;
      if (filters.riskTiers.length > 0 && !filters.riskTiers.includes(p.risk_tier)) return false;
      if (filters.bbox) {
        const { minLng, maxLng, minLat, maxLat } = filters.bbox;
        if (p.lng < minLng || p.lng > maxLng || p.lat < minLat || p.lat > maxLat) return false;
      }
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        const searchable = `${p.id} ${p.region} ${p.category} ${p.land_cover}`.toLowerCase();
        if (!searchable.includes(q)) return false;
      }
      return true;
    });
  },

  // Filtered GeoJSON (for map source)
  getFilteredGeoJSON: () => ({
    type: 'FeatureCollection',
    features: get().getFilteredEvents(),
  }),
}));
