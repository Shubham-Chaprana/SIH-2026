import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Key thermal anomaly hotspot coordinates (FIRMS detection clusters)
const GLOBE_POINTS = [
  { lat: 22.4707, lng: 70.0577, name: 'Jamnagar Refinery Flare', type: 'Flare', temp: '840 K', risk: 'HIGH', color: '#F5C518' },
  { lat: 17.6868, lng: 83.2185, name: 'Vizag Industrial Zone', type: 'Industrial', temp: '720 K', risk: 'CRITICAL', color: '#EF4444' },
  { lat: 23.6693, lng: 86.1511, name: 'Bokaro Steel Complex', type: 'Industrial', temp: '910 K', risk: 'CRITICAL', color: '#EF4444' },
  { lat: 20.3164, lng: 86.6085, name: 'Paradip Port Thermal', type: 'Industrial', temp: '680 K', risk: 'MEDIUM', color: '#F59E0B' },
  { lat: 22.0257, lng: 88.0583, name: 'Haldia Petrochemical', type: 'Flare', temp: '790 K', risk: 'HIGH', color: '#F5C518' },
  { lat: 27.4924, lng: 77.6737, name: 'Mathura Refinery', type: 'Flare', temp: '810 K', risk: 'HIGH', color: '#F5C518' },
  { lat: 24.1200, lng: 82.6700, name: 'Singrauli Super Thermal', type: 'Industrial', temp: '950 K', risk: 'CRITICAL', color: '#EF4444' },
  { lat: 29.0000, lng: 48.0000, name: 'Kuwait Burgan Field', type: 'Flare', temp: '890 K', risk: 'HIGH', color: '#F5C518' },
  { lat: 4.8000, lng: 7.0000, name: 'Niger Delta Oil Terminal', type: 'Flare', temp: '920 K', risk: 'CRITICAL', color: '#EF4444' },
];

export default function GlobeCanvas() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene setup
    const scene = new THREE.Scene();
    const width = container.clientWidth || 520;
    const height = container.clientHeight || 520;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.z = 2.85;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Globe master group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // 1. Procedural High-Detail Cartographic Map Texture
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Ocean base: soft warm beige paper tone
    ctx.fillStyle = '#EAE4D6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle graticule grid (lat/lng lines)
    ctx.strokeStyle = '#DBD3C4';
    ctx.lineWidth = 1;
    for (let x = 0; x <= canvas.width; x += 128) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += 128) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Helper: convert lat/lng to canvas pixel coordinates
    const toPixel = (lat, lng) => ({
      x: ((lng + 180) / 360) * canvas.width,
      y: ((90 - lat) / 180) * canvas.height,
    });

    // Draw realistic continent shapes
    ctx.fillStyle = '#D6CEBC';
    ctx.strokeStyle = '#C7BCA6';
    ctx.lineWidth = 2;

    const drawPolygon = (coords) => {
      if (!coords || coords.length === 0) return;
      ctx.beginPath();
      coords.forEach(([lat, lng], idx) => {
        const pt = toPixel(lat, lng);
        if (idx === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    };

    // Indian Subcontinent & Eurasia
    drawPolygon([
      [35, 68], [37, 75], [30, 80], [28, 88], [22, 90], [16, 82], [10, 78], [8, 77],
      [12, 75], [15, 73], [20, 72], [24, 68], [30, 62], [35, 68]
    ]);
    // Southeast Asia & China
    drawPolygon([
      [42, 130], [38, 120], [30, 122], [22, 114], [10, 105], [1, 104], [10, 98],
      [20, 100], [28, 98], [35, 105], [45, 115], [52, 130]
    ]);
    // Arabia & Middle East
    drawPolygon([
      [30, 34], [30, 48], [24, 57], [12, 44], [12, 43], [18, 40], [28, 34]
    ]);
    // Africa
    drawPolygon([
      [37, 10], [32, 32], [12, 43], [-11, 40], [-34, 20], [-33, 18], [5, 9], [15, -17], [35, -6]
    ]);
    // Europe
    drawPolygon([
      [70, 25], [60, 30], [55, 38], [45, 35], [36, 28], [36, -9], [44, -8], [50, 2], [58, 6], [70, 25]
    ]);
    // North America
    drawPolygon([
      [70, -165], [70, -60], [48, -52], [25, -80], [15, -90], [18, -105], [32, -117], [48, -124], [60, -140]
    ]);
    // South America
    drawPolygon([
      [12, -73], [5, -52], [-10, -35], [-22, -40], [-55, -68], [-45, -75], [-5, -80], [12, -73]
    ]);
    // Australia
    drawPolygon([
      [-12, 130], [-15, 142], [-28, 153], [-38, 145], [-35, 115], [-20, 114], [-12, 130]
    ]);

    // Build 3D sphere texture
    const globeTexture = new THREE.CanvasTexture(canvas);
    globeTexture.anisotropy = 8;

    const globeGeometry = new THREE.SphereGeometry(1, 64, 64);
    const globeMaterial = new THREE.MeshPhongMaterial({
      map: globeTexture,
      shininess: 12,
      specular: new THREE.Color('#FAF7F2'),
      bumpScale: 0.02,
    });

    const globeMesh = new THREE.Mesh(globeGeometry, globeMaterial);
    globeGroup.add(globeMesh);

    // Atmosphere Glow Ring
    const atmosGeometry = new THREE.SphereGeometry(1.03, 48, 48);
    const atmosMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#F5C518'),
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide,
    });
    const atmosMesh = new THREE.Mesh(atmosGeometry, atmosMaterial);
    scene.add(atmosMesh);

    // 2. Add FIRMS Thermal Hotspot Markers & 3D Spikes
    const hotspotsGroup = new THREE.Group();
    const pulseRings = [];

    GLOBE_POINTS.forEach((pt) => {
      const phi = (90 - pt.lat) * (Math.PI / 180);
      const theta = (pt.lng + 180) * (Math.PI / 180);

      const radius = 1.008;
      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);

      // Glowing marker node center
      const pointGeo = new THREE.SphereGeometry(0.022, 16, 16);
      const pointMat = new THREE.MeshBasicMaterial({
        color: pt.color,
      });
      const pointMesh = new THREE.Mesh(pointGeo, pointMat);
      pointMesh.position.set(x, y, z);
      hotspotsGroup.add(pointMesh);

      // White hot core
      const coreGeo = new THREE.SphereGeometry(0.01, 12, 12);
      const coreMat = new THREE.MeshBasicMaterial({ color: '#FFFFFF' });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      coreMesh.position.set(x, y, z);
      hotspotsGroup.add(coreMesh);

      // Thermal Spike Beam pointing outwards
      const normal = new THREE.Vector3(x, y, z).normalize();
      const spikeHeight = pt.risk === 'CRITICAL' ? 0.18 : 0.12;
      const spikeGeo = new THREE.CylinderGeometry(0.003, 0.012, spikeHeight, 8);
      const spikeMat = new THREE.MeshBasicMaterial({
        color: pt.color,
        transparent: true,
        opacity: 0.85,
      });
      const spikeMesh = new THREE.Mesh(spikeGeo, spikeMat);
      spikeMesh.position.set(x + normal.x * (spikeHeight / 2), y + normal.y * (spikeHeight / 2), z + normal.z * (spikeHeight / 2));
      spikeMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
      hotspotsGroup.add(spikeMesh);

      // Pulsing Radar Ring
      const ringGeo = new THREE.RingGeometry(0.025, 0.045, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: pt.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.set(x * 1.002, y * 1.002, z * 1.002);
      ringMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
      hotspotsGroup.add(ringMesh);
      pulseRings.push(ringMesh);
    });

    globeGroup.add(hotspotsGroup);

    // 3. Orbiting Satellite Model
    const satelliteGroup = new THREE.Group();
    const satBodyGeo = new THREE.BoxGeometry(0.04, 0.04, 0.07);
    const satBodyMat = new THREE.MeshStandardMaterial({ color: '#2B2B26', metalness: 0.8, roughness: 0.2 });
    const satBody = new THREE.Mesh(satBodyGeo, satBodyMat);
    satelliteGroup.add(satBody);

    // Solar panels
    const panelGeo = new THREE.BoxGeometry(0.18, 0.005, 0.05);
    const panelMat = new THREE.MeshBasicMaterial({ color: '#3B82F6' });
    const panelLeft = new THREE.Mesh(panelGeo, panelMat);
    satelliteGroup.add(panelLeft);

    scene.add(satelliteGroup);

    // Orbit path ring
    const orbitCurve = new THREE.EllipseCurve(0, 0, 1.45, 1.45, 0, 2 * Math.PI, false, 0);
    const points = orbitCurve.getPoints(100);
    const orbitGeo = new THREE.BufferGeometry().setFromPoints(
      points.map(p => new THREE.Vector3(p.x, p.y * 0.4, p.y * 0.8))
    );
    const orbitMat = new THREE.LineDashedMaterial({
      color: '#F5C518',
      dashSize: 0.04,
      gapSize: 0.03,
      transparent: true,
      opacity: 0.45,
    });
    const orbitLine = new THREE.Line(orbitGeo, orbitMat);
    orbitLine.computeLineDistances();
    scene.add(orbitLine);

    // Lighting
    const ambientLight = new THREE.AmbientLight('#FAF8F5', 1.4);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight('#FFFFFF', 1.8);
    dirLight1.position.set(5, 3, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight('#F5C518', 0.6);
    dirLight2.position.set(-5, -2, -3);
    scene.add(dirLight2);

    // Set initial orientation (focusing on India & South Asia)
    globeGroup.rotation.y = -1.65;
    globeGroup.rotation.x = 0.38;

    // Animation Loop
    let clock = new THREE.Clock();
    let animId;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Gentle globe rotation
      globeGroup.rotation.y += 0.0025;

      // Animate pulsing radar rings
      pulseRings.forEach((ring, idx) => {
        const s = 1 + Math.sin(elapsedTime * 3 + idx) * 0.35;
        ring.scale.set(s, s, s);
        ring.material.opacity = 0.85 - (s - 0.65) * 0.5;
      });

      // Animate satellite orbit
      const satAngle = elapsedTime * 0.45;
      const satRadius = 1.45;
      satelliteGroup.position.x = Math.cos(satAngle) * satRadius;
      satelliteGroup.position.z = Math.sin(satAngle) * satRadius * 0.8;
      satelliteGroup.position.y = Math.sin(satAngle) * satRadius * 0.4;
      satelliteGroup.rotation.y = -satAngle;

      renderer.render(scene, camera);
    };

    animate();

    // Handle Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center relative select-none">
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      {/* Live Globe Indicator Badge */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between px-3.5 py-2 rounded-[var(--radius-lg)] bg-white/80 backdrop-blur-md border border-[var(--color-border)] shadow-xs pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#F5C518] animate-pulse" />
          <span className="text-[12px] font-semibold text-[#1A1A17] font-data">MODIS / VIIRS Sensor Orbit</span>
        </div>
        <span className="text-[11px] font-bold text-[#484841] font-data uppercase tracking-wider bg-amber-100/60 px-2 py-0.5 rounded border border-amber-200">
          9 Hotspots Active
        </span>
      </div>
    </div>
  );
}
