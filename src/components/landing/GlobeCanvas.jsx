import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const GLOBE_POINTS = [
  { lat: 22.4707, lng: 70.0577, name: 'Jamnagar', color: '#D97706', size: 0.05 },
  { lat: 17.6868, lng: 83.2185, name: 'Vizag', color: '#EA580C', size: 0.05 },
  { lat: 23.6693, lng: 86.1511, name: 'Bokaro', color: '#DC2626', size: 0.06 },
  { lat: 20.3164, lng: 86.6085, name: 'Paradip', color: '#D97706', size: 0.05 },
  { lat: 22.0257, lng: 88.0583, name: 'Haldia', color: '#F5C518', size: 0.04 },
  { lat: 27.4924, lng: 77.6737, name: 'Mathura', color: '#D97706', size: 0.04 },
  { lat: 12.9141, lng: 74.8560, name: 'Mangalore', color: '#EA580C', size: 0.04 },
];

export default function GlobeCanvas() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const width = container.clientWidth || 500;
    const height = container.clientHeight || 500;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 2.8;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Globe group for rotation
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // Create subtle texture canvas
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#F5F0E6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid lines / landmass hints
    ctx.strokeStyle = '#E2DCD0';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 64) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let j = 0; j < canvas.height; j += 64) {
      ctx.beginPath();
      ctx.moveTo(0, j);
      ctx.lineTo(canvas.width, j);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);

    // Base Sphere
    const sphereGeo = new THREE.SphereGeometry(1, 64, 64);
    const sphereMat = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.7,
      metalness: 0.1,
      color: '#FFFDF9',
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    globeGroup.add(sphere);

    // Atmosphere halo
    const glowGeo = new THREE.SphereGeometry(1.03, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: '#F5C518',
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide,
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    globeGroup.add(glowMesh);

    // Thermal points on globe
    GLOBE_POINTS.forEach((pt) => {
      const phi = (90 - pt.lat) * (Math.PI / 180);
      const theta = (pt.lng + 180) * (Math.PI / 180);

      const x = -Math.sin(phi) * Math.cos(theta);
      const y = Math.cos(phi);
      const z = Math.sin(phi) * Math.sin(theta);

      const markerGeo = new THREE.SphereGeometry(pt.size, 16, 16);
      const markerMat = new THREE.MeshBasicMaterial({ color: pt.color });
      const marker = new THREE.Mesh(markerGeo, markerMat);
      marker.position.set(x * 1.02, y * 1.02, z * 1.02);
      globeGroup.add(marker);

      // Pulse ring around marker
      const ringGeo = new THREE.RingGeometry(pt.size * 1.2, pt.size * 1.8, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: pt.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(x * 1.025, y * 1.025, z * 1.025);
      ring.lookAt(0, 0, 0);
      globeGroup.add(ring);
    });

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfffaed, 1.2);
    dirLight.position.set(5, 3, 5);
    scene.add(dirLight);

    // Initial tilt to feature India prominently
    globeGroup.rotation.x = 0.35;
    globeGroup.rotation.y = -1.2;

    let animId;
    const animate = () => {
      globeGroup.rotation.y += 0.0015;
      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      sphereGeo.dispose();
      sphereMat.dispose();
      glowGeo.dispose();
      glowMat.dispose();
      texture.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center relative select-none"
    />
  );
}
