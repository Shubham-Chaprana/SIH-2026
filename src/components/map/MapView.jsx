import { useStore } from '../../store/useStore';
import MapCore from './MapCore';
import HotspotLayer from './HotspotLayer';
import IndustrialBoundaryLayer from './IndustrialBoundaryLayer';
import HeatmapLayer from './HeatmapLayer';
import MapControls from './MapControls';
import TimeSlider from './TimeSlider';

export default function MapView() {
  const mapMode = useStore((s) => s.mapMode);
  const showIndustrialOverlay = useStore((s) => s.showIndustrialOverlay);

  return (
    <div className="relative w-full h-full min-h-[420px]">
      <MapCore>
        {mapMode === 'heatmap' ? <HeatmapLayer /> : <HotspotLayer />}
        {showIndustrialOverlay && <IndustrialBoundaryLayer />}
      </MapCore>
      <MapControls />
      <TimeSlider />
    </div>
  );
}
