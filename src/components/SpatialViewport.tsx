import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { 
  RotateCcw, 
  Maximize2, 
  Grid, 
  Tag, 
  Compass, 
  Play, 
  Pause, 
  Plus, 
  Minus,
  Navigation,
  Eye, 
  Activity,
  Volume2, 
  VolumeX,
  Sparkles,
  Layers,
  Zap,
  Sliders
} from 'lucide-react';
import { curriculumStages } from '../data/curriculumData';
import { soundEngine } from '../utils/soundEngine';

interface SpatialViewportProps {
  currentStageIdx: number;
  onSelectStage: (idx: number) => void;
  activeStressMesh: string | null;
  activeStressColor: string | null;
  isWireframe: boolean;
  onToggleWireframe: () => void;
}

type ViewPreset = 'iso' | 'stream' | 'top' | 'profile' | 'focus';

export const SpatialViewport: React.FC<SpatialViewportProps> = ({
  currentStageIdx,
  onSelectStage,
  activeStressMesh,
  activeStressColor,
  isWireframe,
  onToggleWireframe,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageWrapperRef = useRef<HTMLDivElement>(null);

  // States
  const [explosionFactor, setExplosionFactor] = useState<number>(0);
  const [showSpatialPins, setShowSpatialPins] = useState<boolean>(true);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [soundMuted, setSoundMuted] = useState<boolean>(!soundEngine.isEnabled());
  const [activePreset, setActivePreset] = useState<ViewPreset>('focus');
  const [fps, setFps] = useState<number>(60);
  const [azimuthDeg, setAzimuthDeg] = useState<number>(45);
  const [cameraDistance, setCameraDistance] = useState<string>('12.5');
  const [cameraCoords, setCameraCoords] = useState<{ x: string; y: string; z: string }>({ x: '-8.0', y: '3.5', z: '9.0' });
  const [hoveredStage, setHoveredStage] = useState<{ idx: number; x: number; y: number } | null>(null);
  const [spatialTagCoords, setSpatialTagCoords] = useState<Array<{ 
    id: string; 
    name: string; 
    x: number; 
    y: number; 
    visible: boolean; 
    subsystem: string;
    latency: string;
  }>>([]);

  // Track whether selection came from 3D canvas click or external control
  const lastSelectionSource = useRef<'canvas' | 'external'>('external');
  const showSpatialPinsRef = useRef(showSpatialPins);
  const activeStressMeshRef = useRef(activeStressMesh);
  const currentStageIdxRef = useRef(currentStageIdx);
  const onSelectStageRef = useRef(onSelectStage);

  useEffect(() => { showSpatialPinsRef.current = showSpatialPins; }, [showSpatialPins]);
  useEffect(() => { activeStressMeshRef.current = activeStressMesh; }, [activeStressMesh]);
  useEffect(() => { currentStageIdxRef.current = currentStageIdx; }, [currentStageIdx]);
  useEffect(() => { onSelectStageRef.current = onSelectStage; }, [onSelectStage]);

  // Three.js internal state
  const threeState = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    controls: OrbitControls;
    meshMap: Record<string, THREE.Object3D>;
    deGroup: THREE.Group;
    aieGroup: THREE.Group;
    bridgeGroup: THREE.Group;
    assembledGroup: THREE.Group;
    particleSystem: THREE.Points;
    focusReticleGroup: THREE.Group;
    targetCamPos: THREE.Vector3;
    targetLookAt: THREE.Vector3;
    startCamPos: THREE.Vector3;
    startLookAt: THREE.Vector3;
    transitionStartTime: number;
    transitionDuration: number;
    isTransitioning: boolean;
    pulseAnimation: {
      object: THREE.Object3D;
      startTime: number;
      duration: number;
    } | null;
    dynamicElements: {
      turbineRotors: THREE.Mesh[];
      dagGears: THREE.Mesh[];
      agentMoons: Array<{ mesh: THREE.Mesh; orbitRadius: number; speed: number; angle: number; tilt: number }>;
      prismGimbal: THREE.Mesh[];
      radarBeam: THREE.Mesh | null;
      syncRings: THREE.Mesh[];
    };
    animFrameId: number;
  } | null>(null);

  // Smooth camera transition using cubic ease-in-out
  const startCameraTransition = useCallback((
    toCamPos: THREE.Vector3,
    toLookAt: THREE.Vector3,
    duration = 700
  ) => {
    if (!threeState.current) return;
    const state = threeState.current;
    state.startCamPos.copy(state.camera.position);
    state.startLookAt.copy(state.controls.target);
    state.targetCamPos.copy(toCamPos);
    state.targetLookAt.copy(toLookAt);
    state.transitionStartTime = performance.now();
    state.transitionDuration = duration;
    state.isTransitioning = true;
  }, []);

  // Focus on an object while preserving the user's current viewing azimuth and polar angles
  const focusObjectFromCurrentVantage = useCallback((idx: number) => {
    if (!threeState.current) return;
    const state = threeState.current;
    const stage = curriculumStages[idx];
    if (!stage) return;

    const targetLookAt = new THREE.Vector3(stage.targetPos.x, stage.targetPos.y, stage.targetPos.z);
    
    // Calculate current camera offset relative to target
    const offset = new THREE.Vector3().subVectors(state.camera.position, state.controls.target);
    
    // Smoothly normalize to a comfortable framing distance (8.5 - 12 units)
    const currentDist = offset.length();
    const idealDist = Math.min(12.5, Math.max(8.0, currentDist));
    offset.setLength(idealDist);

    const targetCamPos = new THREE.Vector3().addVectors(targetLookAt, offset);

    startCameraTransition(targetCamPos, targetLookAt, 650);
    setActivePreset('focus');
  }, [startCameraTransition]);

  // Update target camera when currentStageIdx changes
  useEffect(() => {
    if (lastSelectionSource.current === 'canvas') {
      // User clicked directly on 3D object; camera transition already triggered smoothly
      lastSelectionSource.current = 'external';
      return;
    }
    const stage = curriculumStages[currentStageIdx];
    if (threeState.current && stage) {
      const toCam = new THREE.Vector3(stage.camPos.x, stage.camPos.y, stage.camPos.z);
      const toLook = new THREE.Vector3(stage.targetPos.x, stage.targetPos.y, stage.targetPos.z);
      startCameraTransition(toCam, toLook, 750);
      setActivePreset('focus');
    }
  }, [currentStageIdx, startCameraTransition]);

  // Smooth Preset View Configuration
  const applyViewPreset = (preset: ViewPreset) => {
    if (!threeState.current) return;
    setActivePreset(preset);
    soundEngine.playTone(520, 'sine', 0.08, 0.03);

    const stage = curriculumStages[currentStageIdx];
    const targetX = stage ? stage.targetPos.x : 0;

    if (preset === 'iso') {
      startCameraTransition(new THREE.Vector3(targetX, 11, 21), new THREE.Vector3(targetX, 0, 0), 800);
    } else if (preset === 'stream') {
      startCameraTransition(new THREE.Vector3(targetX, 2.5, 17), new THREE.Vector3(targetX, 0, 0), 800);
    } else if (preset === 'top') {
      startCameraTransition(new THREE.Vector3(targetX, 25, 0.5), new THREE.Vector3(targetX, 0, 0), 800);
    } else if (preset === 'profile') {
      startCameraTransition(new THREE.Vector3(targetX - 20, 3, 0), new THREE.Vector3(targetX, 0, 0), 800);
    } else if (preset === 'focus') {
      if (stage) {
        startCameraTransition(
          new THREE.Vector3(stage.camPos.x, stage.camPos.y, stage.camPos.z),
          new THREE.Vector3(stage.targetPos.x, stage.targetPos.y, stage.targetPos.z),
          750
        );
      }
    }
  };

  // Zoom In / Zoom Out Controls
  const handleZoomStep = (zoomIn: boolean) => {
    if (!threeState.current) return;
    const { camera, controls } = threeState.current;
    soundEngine.playTone(zoomIn ? 640 : 420, 'sine', 0.06, 0.03);
    
    const factor = zoomIn ? 0.8 : 1.25;
    const offset = new THREE.Vector3().subVectors(camera.position, controls.target);
    const newLen = offset.length() * factor;

    if (newLen > 3 && newLen < 45) {
      offset.multiplyScalar(factor);
      camera.position.copy(controls.target).add(offset);
      controls.update();
    }
  };

  // Rotate to specific cardinal direction (0°, 90°, 180°, 270°)
  const handleRotateToHeading = (targetAzimuthRad: number) => {
    if (!threeState.current) return;
    const { camera, controls } = threeState.current;
    soundEngine.playTone(480, 'sine', 0.08, 0.03);

    const offset = new THREE.Vector3().subVectors(camera.position, controls.target);
    const spherical = new THREE.Spherical().setFromVector3(offset);
    spherical.theta = targetAzimuthRad;
    offset.setFromSpherical(spherical);

    const newTargetCam = new THREE.Vector3().copy(controls.target).add(offset);
    startCameraTransition(newTargetCam, controls.target, 700);
  };

  // Handle active stage and stress state color transitions
  useEffect(() => {
    if (!threeState.current) return;
    const { meshMap } = threeState.current;

    const defaultColorPresets: Record<string, { color: number; emissive: number }> = {
      mesh_ingestion: { color: 0x0284c7, emissive: 0x0369a1 },
      mesh_transformation: { color: 0x0369a1, emissive: 0x0284c7 },
      mesh_lakehouse: { color: 0x0284c7, emissive: 0x0369a1 },
      mesh_orchestration: { color: 0x06b6d4, emissive: 0x0284c7 },
      mesh_featurestore: { color: 0x059669, emissive: 0x047857 },
      mesh_embeddings: { color: 0x7c3aed, emissive: 0x6d28d9 },
      mesh_retrieval: { color: 0xc026d3, emissive: 0xd946ef },
      mesh_finetuning: { color: 0xd946ef, emissive: 0xc026d3 },
      mesh_agents: { color: 0x6d28d9, emissive: 0x7c3aed },
      mesh_serving: { color: 0x7c3aed, emissive: 0xc026d3 },
    };

    const currentMeshName = curriculumStages[currentStageIdx]?.meshName;

    Object.entries(meshMap).forEach(([name, rawObj]) => {
      const object = rawObj as THREE.Object3D;
      if (!object) return;
      const isCurrentActive = name === currentMeshName;
      const isFault = activeStressMesh === name;

      object.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          const mat = (Array.isArray(child.material) ? child.material[0] : child.material) as THREE.MeshStandardMaterial;
          if (mat && mat.isMeshStandardMaterial) {
            if (isFault) {
              const hex = activeStressColor === 'amber' ? 0xf59e0b : 0xef4444;
              mat.color.setHex(hex);
              mat.emissive.setHex(activeStressColor === 'amber' ? 0xb45309 : 0x991b1b);
              mat.emissiveIntensity = 0.85;
            } else if (defaultColorPresets[name]) {
              mat.color.setHex(defaultColorPresets[name].color);
              mat.emissive.setHex(defaultColorPresets[name].emissive);
              // Elevate the active component emissive intensity cleanly
              mat.emissiveIntensity = isCurrentActive ? 0.65 : 0.16;
            }
          }
        }
      });
    });
  }, [currentStageIdx, activeStressMesh, activeStressColor]);

  // Wireframe updates
  useEffect(() => {
    if (!threeState.current) return;
    const { assembledGroup } = threeState.current;
    assembledGroup.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => (m.wireframe = isWireframe));
        } else {
          child.material.wireframe = isWireframe;
        }
      }
    });
  }, [isWireframe]);

  // Auto-Rotate sync with OrbitControls
  useEffect(() => {
    if (threeState.current) {
      threeState.current.controls.autoRotate = autoRotate;
      threeState.current.controls.autoRotateSpeed = 1.8;
    }
  }, [autoRotate]);

  // Initialize Three.js Simulation Engine with OrbitControls
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);
    scene.fog = new THREE.FogExp2(0xf8fafc, 0.018);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    const initialStage = curriculumStages[0];
    camera.position.set(initialStage.camPos.x, initialStage.camPos.y, initialStage.camPos.z);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // True OrbitControls (360 Rotation, Damping, Touch Controls)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = true;
    controls.minDistance = 3.2;
    controls.maxDistance = 46;
    controls.maxPolarAngle = Math.PI / 2 + 0.08;
    controls.target.set(initialStage.targetPos.x, initialStage.targetPos.y, initialStage.targetPos.z);
    controls.update();

    // Dynamic Elements Registry
    const dynamicElements = {
      turbineRotors: [] as THREE.Mesh[],
      dagGears: [] as THREE.Mesh[],
      agentMoons: [] as Array<{ mesh: THREE.Mesh; orbitRadius: number; speed: number; angle: number; tilt: number }>,
      prismGimbal: [] as THREE.Mesh[],
      radarBeam: null as THREE.Mesh | null,
      syncRings: [] as THREE.Mesh[],
    };

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);

    const mainKeyLight = new THREE.DirectionalLight(0xffffff, 1.15);
    mainKeyLight.position.set(16, 28, 22);
    mainKeyLight.castShadow = true;
    mainKeyLight.shadow.mapSize.width = 2048;
    mainKeyLight.shadow.mapSize.height = 2048;
    mainKeyLight.shadow.camera.near = 0.5;
    mainKeyLight.shadow.camera.far = 80;
    mainKeyLight.shadow.bias = -0.0002;
    scene.add(mainKeyLight);

    const rimLight = new THREE.DirectionalLight(0xe0e7ff, 0.75);
    rimLight.position.set(-18, -12, -16);
    scene.add(rimLight);

    // Domain Chromatic Point Lights
    const deLight = new THREE.PointLight(0x0284c7, 2.5, 25);
    deLight.position.set(-4, 3.5, 2.5);
    scene.add(deLight);

    const bridgeLight = new THREE.PointLight(0x10b981, 2.2, 20);
    bridgeLight.position.set(0, 3.5, 2);
    scene.add(bridgeLight);

    const aieLight = new THREE.PointLight(0x8b5cf6, 2.5, 25);
    aieLight.position.set(4.5, 3.5, 2.5);
    scene.add(aieLight);

    // CAD Floor Grid
    const gridHelper = new THREE.GridHelper(52, 52, 0x94a3b8, 0xe2e8f0);
    gridHelper.position.y = -1.8;
    scene.add(gridHelper);

    // Ground shadow plane
    const groundShadowGeo = new THREE.PlaneGeometry(28, 7);
    const groundShadowMat = new THREE.MeshBasicMaterial({
      color: 0x0f172a,
      transparent: true,
      opacity: 0.05,
      depthWrite: false,
    });
    const groundShadow = new THREE.Mesh(groundShadowGeo, groundShadowMat);
    groundShadow.rotation.x = -Math.PI / 2;
    groundShadow.position.y = -1.78;
    scene.add(groundShadow);

    // Holographic Ground Focus Reticle (highlights active subsystem in 3D)
    const focusReticleGroup = new THREE.Group();
    focusReticleGroup.position.set(initialStage.targetPos.x, -1.77, 0);
    focusReticleGroup.rotation.x = -Math.PI / 2;

    // Outer Reticle Ring
    const reticleRingGeo = new THREE.RingGeometry(1.4, 1.52, 48);
    const reticleRingMat = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const reticleRing = new THREE.Mesh(reticleRingGeo, reticleRingMat);
    focusReticleGroup.add(reticleRing);

    // Inner Glowing Disc
    const reticleDiscGeo = new THREE.CircleGeometry(1.38, 36);
    const reticleDiscMat = new THREE.MeshBasicMaterial({
      color: 0x818cf8,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const reticleDisc = new THREE.Mesh(reticleDiscGeo, reticleDiscMat);
    focusReticleGroup.add(reticleDisc);

    // 4 Corner Alignment Ticks
    for (let a = 0; a < 4; a++) {
      const angle = (a * Math.PI) / 2;
      const tickGeo = new THREE.PlaneGeometry(0.16, 0.4);
      const tickMat = new THREE.MeshBasicMaterial({
        color: 0x4f46e5,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide,
      });
      const tick = new THREE.Mesh(tickGeo, tickMat);
      tick.position.set(Math.cos(angle) * 1.65, Math.sin(angle) * 1.65, 0.01);
      tick.rotation.z = angle + Math.PI / 2;
      focusReticleGroup.add(tick);
    }
    scene.add(focusReticleGroup);

    // Architectural Groups
    const assembledGroup = new THREE.Group();
    const deGroup = new THREE.Group();
    const bridgeGroup = new THREE.Group();
    const aieGroup = new THREE.Group();
    const meshMap: Record<string, THREE.Object3D> = {};

    // -------------------------------------------------------------
    // 1. DATA ENGINEERING ASSEMBLY
    // -------------------------------------------------------------
    // 1.1 Ingestion Manifold
    const ingestAssembly = new THREE.Group();
    ingestAssembly.name = 'mesh_ingestion';
    ingestAssembly.position.set(-6, 0, 0);

    const ingestBodyGeo = new THREE.CylinderGeometry(0.48, 0.48, 2.6, 32);
    const ingestBodyMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      metalness: 0.85,
      roughness: 0.18,
      emissive: 0x0369a1,
      emissiveIntensity: 0.2,
    });
    const ingestBody = new THREE.Mesh(ingestBodyGeo, ingestBodyMat);
    ingestBody.rotation.z = Math.PI / 2;
    ingestAssembly.add(ingestBody);

    [-0.6, 0.6].forEach((xOff) => {
      const injectorGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.9, 20);
      const injectorMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.9, roughness: 0.2 });
      const injector = new THREE.Mesh(injectorGeo, injectorMat);
      injector.position.set(xOff, 0.65, 0);
      ingestAssembly.add(injector);

      const ringGeo = new THREE.TorusGeometry(0.29, 0.04, 12, 24);
      const ringMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x38bdf8, emissiveIntensity: 0.8 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(xOff, 0.95, 0);
      ingestAssembly.add(ring);
    });

    meshMap['mesh_ingestion'] = ingestAssembly;
    deGroup.add(ingestAssembly);

    // 1.2 Spark Transformation Turbine
    const turbineAssembly = new THREE.Group();
    turbineAssembly.name = 'mesh_transformation';
    turbineAssembly.position.set(-3.2, 0, 0);

    const cowlGeo = new THREE.CylinderGeometry(1.05, 1.05, 1.4, 32, 1, true);
    const cowlMat = new THREE.MeshStandardMaterial({
      color: 0x0369a1,
      metalness: 0.8,
      roughness: 0.25,
      side: THREE.DoubleSide,
      emissive: 0x0284c7,
      emissiveIntensity: 0.15,
    });
    const cowl = new THREE.Mesh(cowlGeo, cowlMat);
    cowl.rotation.z = Math.PI / 2;
    turbineAssembly.add(cowl);

    const rotorGeo = new THREE.TorusGeometry(0.85, 0.16, 16, 36);
    const rotorMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      metalness: 0.9,
      roughness: 0.15,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.35,
    });
    const rotor1 = new THREE.Mesh(rotorGeo, rotorMat);
    rotor1.rotation.y = Math.PI / 2;
    turbineAssembly.add(rotor1);
    dynamicElements.turbineRotors.push(rotor1);

    meshMap['mesh_transformation'] = turbineAssembly;
    deGroup.add(turbineAssembly);

    // 1.3 Columnar Lakehouse Storage
    const lakehouseAssembly = new THREE.Group();
    lakehouseAssembly.name = 'mesh_lakehouse';
    lakehouseAssembly.position.set(-1.1, 0, 0);

    [-0.5, 0, 0.5].forEach((yOff) => {
      const slabGeo = new THREE.BoxGeometry(1.3, 0.28, 1.3);
      const slabMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        metalness: 0.65,
        roughness: 0.2,
        transparent: true,
        opacity: 0.92,
        emissive: 0x0369a1,
        emissiveIntensity: 0.18,
      });
      const slab = new THREE.Mesh(slabGeo, slabMat);
      slab.position.y = yOff;
      lakehouseAssembly.add(slab);
    });

    const beaconGeo = new THREE.OctahedronGeometry(0.24, 0);
    const beaconMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x38bdf8, emissiveIntensity: 0.9 });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.set(0, 1.05, 0);
    lakehouseAssembly.add(beacon);

    meshMap['mesh_lakehouse'] = lakehouseAssembly;
    deGroup.add(lakehouseAssembly);

    // 1.4 DAG Orchestration Chronometer
    const dagAssembly = new THREE.Group();
    dagAssembly.name = 'mesh_orchestration';
    dagAssembly.position.set(-2.2, 1.5, 0);

    const sunGearGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.14, 18);
    const sunGearMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      metalness: 0.85,
      roughness: 0.2,
      emissive: 0x0284c7,
      emissiveIntensity: 0.25,
    });
    const sunGear = new THREE.Mesh(sunGearGeo, sunGearMat);
    sunGear.rotation.x = Math.PI / 2;
    dagAssembly.add(sunGear);
    dynamicElements.dagGears.push(sunGear);

    meshMap['mesh_orchestration'] = dagAssembly;
    deGroup.add(dagAssembly);

    // -------------------------------------------------------------
    // 2. CONVERGENT BRIDGE ASSEMBLY (Dual-Clutch Feature Store)
    // -------------------------------------------------------------
    const bridgeAssembly = new THREE.Group();
    bridgeAssembly.name = 'mesh_featurestore';
    bridgeAssembly.position.set(0, 0, 0);

    const chamberGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.9, 32);
    const chamberMat = new THREE.MeshStandardMaterial({
      color: 0x059669,
      metalness: 0.75,
      roughness: 0.2,
      emissive: 0x047857,
      emissiveIntensity: 0.25,
    });

    const upperChamber = new THREE.Mesh(chamberGeo, chamberMat);
    upperChamber.position.y = 0.58;
    bridgeAssembly.add(upperChamber);

    const lowerChamber = new THREE.Mesh(chamberGeo, chamberMat);
    lowerChamber.position.y = -0.58;
    bridgeAssembly.add(lowerChamber);

    const centralClutchGeo = new THREE.TorusGeometry(1.08, 0.12, 16, 36);
    const centralClutchMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0x34d399,
      emissiveIntensity: 0.6,
    });
    const centralClutch = new THREE.Mesh(centralClutchGeo, centralClutchMat);
    centralClutch.rotation.x = Math.PI / 2;
    bridgeAssembly.add(centralClutch);
    dynamicElements.syncRings.push(centralClutch);

    meshMap['mesh_featurestore'] = bridgeAssembly;
    bridgeGroup.add(bridgeAssembly);

    // -------------------------------------------------------------
    // 3. AI ENGINEERING ASSEMBLY
    // -------------------------------------------------------------
    // 3.1 Vector Embedding Prism
    const prismAssembly = new THREE.Group();
    prismAssembly.name = 'mesh_embeddings';
    prismAssembly.position.set(1.4, 0, 0);

    const prismGeo = new THREE.ConeGeometry(0.9, 1.8, 6);
    const prismMat = new THREE.MeshStandardMaterial({
      color: 0x7c3aed,
      metalness: 0.65,
      roughness: 0.15,
      transparent: true,
      opacity: 0.88,
      emissive: 0x6d28d9,
      emissiveIntensity: 0.25,
    });
    const prismMesh = new THREE.Mesh(prismGeo, prismMat);
    prismAssembly.add(prismMesh);
    dynamicElements.prismGimbal.push(prismMesh);

    meshMap['mesh_embeddings'] = prismAssembly;
    aieGroup.add(prismAssembly);

    // 3.2 HNSW Vector Retrieval Lattice
    const hnswAssembly = new THREE.Group();
    hnswAssembly.name = 'mesh_retrieval';
    hnswAssembly.position.set(3.0, 0, 0);

    const cageGeo = new THREE.IcosahedronGeometry(1.05, 1);
    const cageMat = new THREE.MeshStandardMaterial({
      color: 0xc026d3,
      wireframe: true,
      emissive: 0xd946ef,
      emissiveIntensity: 0.5,
    });
    const cage = new THREE.Mesh(cageGeo, cageMat);
    hnswAssembly.add(cage);

    const radarGeo = new THREE.RingGeometry(0.2, 0.95, 24, 1, 0, Math.PI / 2);
    const radarMat = new THREE.MeshBasicMaterial({
      color: 0xf472b6,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
    });
    const radarBeam = new THREE.Mesh(radarGeo, radarMat);
    radarBeam.rotation.x = Math.PI / 2;
    hnswAssembly.add(radarBeam);
    dynamicElements.radarBeam = radarBeam;

    meshMap['mesh_retrieval'] = hnswAssembly;
    aieGroup.add(hnswAssembly);

    // 3.3 Modular LoRA Accelerator Rack
    const loraAssembly = new THREE.Group();
    loraAssembly.name = 'mesh_finetuning';
    loraAssembly.position.set(4.5, 0, 0);

    const baseBlockGeo = new THREE.BoxGeometry(0.65, 1.7, 1.2);
    const baseBlockMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      metalness: 0.85,
      roughness: 0.25,
      emissive: 0x1e293b,
      emissiveIntensity: 0.2,
    });
    const baseBlock = new THREE.Mesh(baseBlockGeo, baseBlockMat);
    loraAssembly.add(baseBlock);

    [-0.45, 0.45].forEach((xOff) => {
      const cardGeo = new THREE.BoxGeometry(0.14, 1.55, 1.05);
      const cardMat = new THREE.MeshStandardMaterial({
        color: 0xd946ef,
        metalness: 0.8,
        roughness: 0.2,
        emissive: 0xc026d3,
        emissiveIntensity: 0.4,
      });
      const card = new THREE.Mesh(cardGeo, cardMat);
      card.position.x = xOff;
      loraAssembly.add(card);
    });

    meshMap['mesh_finetuning'] = loraAssembly;
    aieGroup.add(loraAssembly);

    // 3.4 Multi-Agent Autonomous Satellite Swarm
    const agentAssembly = new THREE.Group();
    agentAssembly.name = 'mesh_agents';
    agentAssembly.position.set(5.9, 0, 0);

    const supervisorGeo = new THREE.SphereGeometry(0.68, 28, 28);
    const supervisorMat = new THREE.MeshStandardMaterial({
      color: 0x6d28d9,
      metalness: 0.85,
      roughness: 0.12,
      emissive: 0x7c3aed,
      emissiveIntensity: 0.35,
    });
    const supervisor = new THREE.Mesh(supervisorGeo, supervisorMat);
    agentAssembly.add(supervisor);

    const moonConfigs = [
      { radius: 1.15, speed: 0.024, tilt: 0.25, color: 0x38bdf8 },
      { radius: 1.35, speed: -0.019, tilt: -0.4, color: 0x10b981 },
      { radius: 1.55, speed: 0.016, tilt: 0.6, color: 0xf59e0b },
    ];

    moonConfigs.forEach((cfg) => {
      const moonGeo = new THREE.SphereGeometry(0.18, 16, 16);
      const moonMat = new THREE.MeshStandardMaterial({ color: cfg.color, emissive: cfg.color, emissiveIntensity: 0.7 });
      const moon = new THREE.Mesh(moonGeo, moonMat);
      agentAssembly.add(moon);
      dynamicElements.agentMoons.push({
        mesh: moon,
        orbitRadius: cfg.radius,
        speed: cfg.speed,
        angle: Math.random() * Math.PI * 2,
        tilt: cfg.tilt,
      });
    });

    meshMap['mesh_agents'] = agentAssembly;
    aieGroup.add(agentAssembly);

    // 3.5 PagedAttention KV-Cache Shield & Serving Engine
    const servingAssembly = new THREE.Group();
    servingAssembly.name = 'mesh_serving';
    servingAssembly.position.set(7.3, 0, 0);

    const shieldGeo = new THREE.TorusGeometry(0.85, 0.14, 16, 36);
    const shieldMat = new THREE.MeshStandardMaterial({
      color: 0x7c3aed,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0xc026d3,
      emissiveIntensity: 0.35,
    });
    const shield = new THREE.Mesh(shieldGeo, shieldMat);
    servingAssembly.add(shield);

    meshMap['mesh_serving'] = servingAssembly;
    aieGroup.add(servingAssembly);

    // -------------------------------------------------------------
    // 4. PARTICLE STREAM CONDUIT
    // -------------------------------------------------------------
    const particleCount = 550;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const x = (Math.random() - 0.5) * 20;
      positions[i * 3] = x;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 1.6;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2.2;

      if (x < -0.8) {
        colors[i * 3] = 0.01;
        colors[i * 3 + 1] = 0.52;
        colors[i * 3 + 2] = 0.85;
      } else if (x >= -0.8 && x <= 0.8) {
        colors[i * 3] = 0.05;
        colors[i * 3 + 1] = 0.72;
        colors[i * 3 + 2] = 0.45;
      } else {
        colors[i * 3] = 0.55;
        colors[i * 3 + 1] = 0.22;
        colors[i * 3 + 2] = 0.95;
      }
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.11,
      vertexColors: true,
      transparent: true,
      opacity: 0.88,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    assembledGroup.add(deGroup);
    assembledGroup.add(bridgeGroup);
    assembledGroup.add(aieGroup);
    scene.add(assembledGroup);

    // -------------------------------------------------------------
    // 5. 3D RAYCAST HOVER & INTENTIONAL CLICK SELECTION
    // -------------------------------------------------------------
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    let pointerDownX = 0;
    let pointerDownY = 0;
    let pointerDownTime = 0;
    let isDragging = false;

    // Interrupt camera animation cleanly when user manually rotates or pans
    controls.addEventListener('start', () => {
      if (threeState.current) {
        threeState.current.isTransitioning = false;
      }
    });

    const onPointerDown = (e: PointerEvent) => {
      pointerDownX = e.clientX;
      pointerDownY = e.clientY;
      pointerDownTime = performance.now();
      isDragging = false;
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const dist = Math.hypot(e.clientX - pointerDownX, e.clientY - pointerDownY);
      if (e.buttons > 0 && dist > 5) {
        isDragging = true;
        setHoveredStage(null);
        return;
      }

      // Hover Raycasting for responsive visual feedback
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(assembledGroup.children, true);
      let foundIdx = -1;
      if (intersects.length > 0) {
        let hitObj: THREE.Object3D | null = intersects[0].object;
        while (hitObj && hitObj !== assembledGroup) {
          if (hitObj.name) {
            const matched = curriculumStages.findIndex((s) => s.meshName === hitObj?.name);
            if (matched !== -1) {
              foundIdx = matched;
              break;
            }
          }
          hitObj = hitObj.parent;
        }
      }

      if (foundIdx !== -1) {
        renderer.domElement.style.cursor = 'pointer';
        setHoveredStage({
          idx: foundIdx,
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      } else {
        renderer.domElement.style.cursor = e.buttons > 0 ? 'grabbing' : 'default';
        setHoveredStage(null);
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      const dist = Math.hypot(e.clientX - pointerDownX, e.clientY - pointerDownY);
      const elapsed = performance.now() - pointerDownTime;

      // Filter out drags or long holds so camera orbit never triggers accidental selection jump
      if (dist > 6 || elapsed > 500 || isDragging) {
        isDragging = false;
        return;
      }

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(assembledGroup.children, true);

      if (intersects.length > 0) {
        let hitObj: THREE.Object3D | null = intersects[0].object;
        while (hitObj && hitObj !== assembledGroup) {
          if (hitObj.name) {
            const matchedIdx = curriculumStages.findIndex((s) => s.meshName === hitObj?.name);
            if (matchedIdx !== -1) {
              soundEngine.playTone(560, 'sine', 0.12, 0.04);
              lastSelectionSource.current = 'canvas';

              // Visual pulse bounce on clicked 3D mesh
              const meshGroup = meshMap[hitObj.name];
              if (meshGroup && threeState.current) {
                threeState.current.pulseAnimation = {
                  object: meshGroup,
                  startTime: performance.now(),
                  duration: 380,
                };
              }

              // Smoothly focus on object preserving viewing angle
              focusObjectFromCurrentVantage(matchedIdx);

              onSelectStageRef.current(matchedIdx);
              break;
            }
          }
          hitObj = hitObj.parent;
        }
      }
    };

    const onPointerLeave = () => {
      setHoveredStage(null);
      renderer.domElement.style.cursor = 'default';
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerup', onPointerUp);
    renderer.domElement.addEventListener('pointerleave', onPointerLeave);

    // Save reference in state
    threeState.current = {
      scene,
      camera,
      renderer,
      controls,
      meshMap,
      deGroup,
      aieGroup,
      bridgeGroup,
      assembledGroup,
      particleSystem,
      focusReticleGroup,
      targetCamPos: new THREE.Vector3(initialStage.camPos.x, initialStage.camPos.y, initialStage.camPos.z),
      targetLookAt: new THREE.Vector3(initialStage.targetPos.x, initialStage.targetPos.y, initialStage.targetPos.z),
      startCamPos: new THREE.Vector3(initialStage.camPos.x, initialStage.camPos.y, initialStage.camPos.z),
      startLookAt: new THREE.Vector3(initialStage.targetPos.x, initialStage.targetPos.y, initialStage.targetPos.z),
      transitionStartTime: 0,
      transitionDuration: 700,
      isTransitioning: false,
      pulseAnimation: null,
      dynamicElements,
      animFrameId: 0,
    };

    // Animation Loop
    const tempVec = new THREE.Vector3();
    let frameCounter = 0;
    let lastTime = performance.now();

    const animate = () => {
      if (!threeState.current) return;
      const state = threeState.current;

      // FPS Calculation
      frameCounter++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        setFps(frameCounter);
        frameCounter = 0;
        lastTime = now;
      }

      // Smooth Cubic Ease-in-out Camera Transition
      if (state.isTransitioning) {
        const elapsed = performance.now() - state.transitionStartTime;
        const progress = Math.min(1, elapsed / state.transitionDuration);
        // Cubic Ease-In-Out curve: zero initial/final velocity avoids jarring jerks
        const t = progress < 0.5 
          ? 4 * progress * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        state.camera.position.lerpVectors(state.startCamPos, state.targetCamPos, t);
        state.controls.target.lerpVectors(state.startLookAt, state.targetLookAt, t);
        state.controls.update();

        if (progress >= 1) {
          state.camera.position.copy(state.targetCamPos);
          state.controls.target.copy(state.targetLookAt);
          state.controls.update();
          state.isTransitioning = false;
        }
      } else {
        state.controls.update();
      }

      // Smoothly update Holographic Ground Focus Reticle
      if (state.focusReticleGroup) {
        const activeStage = curriculumStages[currentStageIdxRef.current];
        const targetX = activeStage ? activeStage.targetPos.x : 0;
        state.focusReticleGroup.position.x += (targetX - state.focusReticleGroup.position.x) * 0.1;
        state.focusReticleGroup.rotation.z += 0.01;
        const breath = 1 + 0.035 * Math.sin(now * 0.0035);
        state.focusReticleGroup.scale.set(breath, breath, breath);
      }

      // Elastic Scale Pulse on Clicked 3D Component
      if (state.pulseAnimation) {
        const elapsed = performance.now() - state.pulseAnimation.startTime;
        if (elapsed < state.pulseAnimation.duration) {
          const p = elapsed / state.pulseAnimation.duration;
          const scale = 1 + Math.sin(p * Math.PI) * 0.08;
          state.pulseAnimation.object.scale.set(scale, scale, scale);
        } else {
          state.pulseAnimation.object.scale.set(1, 1, 1);
          state.pulseAnimation = null;
        }
      }

      // Read Azimuth Angle and Distance for 360 Compass HUD
      if (frameCounter % 5 === 0) {
        const offset = new THREE.Vector3().subVectors(state.camera.position, state.controls.target);
        const spherical = new THREE.Spherical().setFromVector3(offset);
        const deg = Math.round(((spherical.theta * 180) / Math.PI + 360) % 360);
        setAzimuthDeg(deg);
        setCameraDistance(offset.length().toFixed(1));
        setCameraCoords({
          x: state.camera.position.x.toFixed(1),
          y: state.camera.position.y.toFixed(1),
          z: state.camera.position.z.toFixed(1),
        });
      }

      // Continuous Mechanical Rotations
      state.dynamicElements.turbineRotors.forEach((rotor) => {
        rotor.rotation.z += 0.028;
      });
      state.dynamicElements.dagGears.forEach((gear) => {
        gear.rotation.z -= 0.015;
      });
      state.dynamicElements.prismGimbal.forEach((p) => {
        p.rotation.y += 0.008;
      });
      if (state.dynamicElements.radarBeam) {
        state.dynamicElements.radarBeam.rotation.z += 0.035;
      }
      state.dynamicElements.syncRings.forEach((ring, idx) => {
        ring.rotation.z += (idx % 2 === 0 ? 1 : -1) * 0.012;
      });
      state.dynamicElements.agentMoons.forEach((moon) => {
        moon.angle += moon.speed;
        moon.mesh.position.set(
          Math.cos(moon.angle) * moon.orbitRadius,
          Math.sin(moon.angle) * moon.orbitRadius * Math.sin(moon.tilt),
          Math.sin(moon.angle) * moon.orbitRadius * Math.cos(moon.tilt)
        );
      });

      // Particle Flow Update
      const posArray = state.particleSystem.geometry.attributes.position.array as Float32Array;
      const speed = activeStressMeshRef.current ? 0.14 : 0.075;
      for (let i = 0; i < posArray.length / 3; i++) {
        posArray[i * 3] += speed;
        if (posArray[i * 3] > 9.8) posArray[i * 3] = -9.8;
      }
      state.particleSystem.geometry.attributes.position.needsUpdate = true;

      // Project 3D Tag Locations to 2D HTML Pins
      if (showSpatialPinsRef.current) {
        const domW = state.renderer.domElement.clientWidth;
        const domH = state.renderer.domElement.clientHeight;

        const updatedCoords = curriculumStages.map((stg) => {
          const mesh = state.meshMap[stg.meshName];
          if (!mesh) {
            return {
              id: stg.id,
              name: stg.title.split('&')[0].trim(),
              x: -1000,
              y: -1000,
              visible: false,
              subsystem: stg.subsystem,
              latency: stg.specs.latency.split('/')[0],
            };
          }

          mesh.getWorldPosition(tempVec);
          tempVec.y += 1.45;
          tempVec.project(state.camera);

          const isVisible = tempVec.z < 1 && tempVec.x >= -1.05 && tempVec.x <= 1.05 && tempVec.y >= -1.05 && tempVec.y <= 1.05;
          const x = (tempVec.x * 0.5 + 0.5) * domW;
          const y = (tempVec.y * -0.5 + 0.5) * domH;

          return {
            id: stg.id,
            name: stg.title.split('&')[0].trim(),
            x,
            y,
            visible: isVisible,
            subsystem: stg.subsystem,
            latency: stg.specs.latency.split('/')[0],
          };
        });

        setSpatialTagCoords(updatedCoords);
      }

      state.renderer.render(state.scene, state.camera);
      state.animFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newW = entry.contentRect.width;
        const newH = entry.contentRect.height;
        if (newW > 0 && newH > 0 && threeState.current) {
          threeState.current.camera.aspect = newW / newH;
          threeState.current.camera.updateProjectionMatrix();
          threeState.current.renderer.setSize(newW, newH);
        }
      }
    });
    resizeObserver.observe(container);

    // Cleanup
    return () => {
      resizeObserver.disconnect();
      if (threeState.current) {
        cancelAnimationFrame(threeState.current.animFrameId);
        renderer.domElement.removeEventListener('pointerdown', onPointerDown);
        renderer.domElement.removeEventListener('pointermove', onPointerMove);
        renderer.domElement.removeEventListener('pointerup', onPointerUp);
        renderer.domElement.removeEventListener('pointerleave', onPointerLeave);
        controls.dispose();
        renderer.dispose();
      }
    };
  }, [focusObjectFromCurrentVantage]);

  // Handle Explosion slider
  const handleExplosionChange = (val: number) => {
    setExplosionFactor(val);
    if (!threeState.current) return;
    const { deGroup, aieGroup } = threeState.current;
    deGroup.position.x = -val * 0.042;
    deGroup.position.z = -val * 0.024;
    aieGroup.position.x = val * 0.042;
    aieGroup.position.z = val * 0.024;
  };

  const handleResetCamera = () => {
    soundEngine.playTone(440, 'triangle', 0.12, 0.05);
    const stage = curriculumStages[currentStageIdx];
    if (stage) {
      startCameraTransition(
        new THREE.Vector3(stage.camPos.x, stage.camPos.y, stage.camPos.z),
        new THREE.Vector3(stage.targetPos.x, stage.targetPos.y, stage.targetPos.z),
        700
      );
    }
    setExplosionFactor(0);
    handleExplosionChange(0);
  };

  const toggleAudio = () => {
    const next = soundEngine.toggle();
    setSoundMuted(!next);
  };

  const toggleFullscreen = () => {
    soundEngine.playTone(500, 'sine', 0.1, 0.05);
    if (!stageWrapperRef.current) return;
    if (!document.fullscreenElement) {
      stageWrapperRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const currentStage = curriculumStages[currentStageIdx];

  return (
    <div
      ref={stageWrapperRef}
      className="relative w-full h-[580px] lg:h-[660px] bg-slate-100 rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm flex flex-col group select-none transition-all"
    >
      {/* 3D WebGL Canvas Container with Full 360 OrbitControls */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* CAD Corner Crosshairs */}
      <div className="absolute top-3 left-3 text-[10px] font-mono text-slate-400 pointer-events-none select-none flex items-center space-x-1">
        <span className="text-slate-500 font-bold">┌ [01]</span>
        <span className="hidden sm:inline">360° SPATIAL ORBIT</span>
      </div>
      <div className="absolute top-3 right-3 text-[10px] font-mono text-slate-400 pointer-events-none select-none flex items-center space-x-1">
        <span className="hidden sm:inline">FPS: {fps}</span>
        <span className="text-slate-500 font-bold">[02] ┐</span>
      </div>
      <div className="absolute bottom-3 left-3 text-[10px] font-mono text-slate-400 pointer-events-none select-none flex items-center space-x-1">
        <span className="text-slate-500 font-bold">└ [03]</span>
        <span className="hidden sm:inline">CAM: [{cameraCoords.x}, {cameraCoords.y}, {cameraCoords.z}]</span>
      </div>
      <div className="absolute bottom-3 right-3 text-[10px] font-mono text-slate-400 pointer-events-none select-none flex items-center space-x-1">
        <span className="hidden sm:inline">DIST: {cameraDistance}m</span>
        <span className="text-slate-500 font-bold">[04] ┘</span>
      </div>

      {/* 3D Dynamic Spatial HTML Tag Overlays */}
      {showSpatialPins && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
          {spatialTagCoords.map((tag, idx) => {
            if (!tag.visible) return null;
            const isSelected = idx === currentStageIdx;
            const colorPill =
              tag.subsystem === 'de'
                ? 'bg-sky-500 text-sky-50 ring-sky-200'
                : tag.subsystem === 'aie'
                ? 'bg-purple-600 text-purple-50 ring-purple-200'
                : 'bg-emerald-600 text-emerald-50 ring-emerald-200';

            return (
              <button
                key={tag.id}
                style={{ left: `${tag.x}px`, top: `${tag.y}px` }}
                onClick={(e) => {
                  e.stopPropagation();
                  soundEngine.playTone(480, 'sine', 0.1, 0.05);
                  onSelectStage(idx);
                }}
                className={`spatial-tag pointer-events-auto flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold shadow-md transition-all border ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 scale-105 ring-2 ring-indigo-300 z-30 shadow-lg'
                    : 'glass-panel text-slate-800 border-slate-200/90 hover:bg-white hover:scale-105'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${colorPill} animate-pulse`} />
                <span>{tag.name}</span>
                <span className="text-[10px] opacity-70 font-normal border-l border-slate-300 pl-1.5">
                  {tag.latency}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Top Left Engineering Status & Subsystem HUD */}
      <div className="absolute top-4 left-4 pointer-events-auto z-30 flex flex-col space-y-1.5 max-w-[280px] sm:max-w-md">
        <div className="glass-panel px-3.5 py-2 rounded-2xl shadow-sm border border-slate-200/90 flex items-center space-x-2.5 text-xs font-mono text-slate-800">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              activeStressMesh ? 'bg-rose-500 animate-ping' : 'bg-emerald-500 animate-pulse'
            }`}
          />
          <div className="flex items-center space-x-1.5 truncate">
            <span className="font-extrabold text-slate-900">
              {activeStressMesh ? 'FAULT INJECTION' : `[0${currentStageIdx + 1}/10]`}
            </span>
            <span className="text-slate-400">|</span>
            <span className="truncate font-semibold text-slate-700">
              {activeStressMesh ? 'Structural Stress Active' : currentStage.title.split('&')[0].trim()}
            </span>
          </div>
        </div>

        {/* Live Subsystem Telemetry Badge */}
        <div className="hidden sm:flex items-center space-x-2 text-[10px] font-mono font-bold text-slate-500 px-1">
          <span className="flex items-center space-x-1 bg-white/80 px-2 py-0.5 rounded-md border border-slate-200">
            <Activity className="w-3 h-3 text-indigo-500" />
            <span>LATENCY: {currentStage.specs.latency}</span>
          </span>
          <span className="bg-white/80 px-2 py-0.5 rounded-md border border-slate-200">
            AVAILABILITY: {currentStage.specs.availability}
          </span>
        </div>
      </div>

      {/* Top Right Quick CAD Tool Actions */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2 pointer-events-auto z-30">
        {/* Preset View Angles Bar */}
        <div className="glass-panel p-1 rounded-2xl shadow-sm border border-slate-200 flex items-center space-x-1 text-[11px] font-bold">
          <button
            onClick={() => applyViewPreset('focus')}
            className={`px-2 py-1 rounded-xl transition-all ${
              activePreset === 'focus' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Focus on Active Node"
          >
            Focus
          </button>
          <button
            onClick={() => applyViewPreset('iso')}
            className={`px-2 py-1 rounded-xl transition-all ${
              activePreset === 'iso' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Isometric Overview (45°)"
          >
            Iso
          </button>
          <button
            onClick={() => applyViewPreset('stream')}
            className={`px-2 py-1 rounded-xl transition-all ${
              activePreset === 'stream' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Front Flow Stream (0°)"
          >
            Stream
          </button>
          <button
            onClick={() => applyViewPreset('top')}
            className={`px-2 py-1 rounded-xl transition-all ${
              activePreset === 'top' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Top-Down Plan View (90°)"
          >
            Top
          </button>
          <button
            onClick={() => applyViewPreset('profile')}
            className={`px-2 py-1 rounded-xl transition-all ${
              activePreset === 'profile' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Profile Cross-Section"
          >
            Profile
          </button>
        </div>

        {/* Quick Tools Bar */}
        <div className="flex items-center space-x-1.5 self-end">
          <button
            onClick={handleResetCamera}
            className="glass-panel hover:bg-white p-2 rounded-xl text-xs font-semibold text-slate-700 shadow-sm transition-all border border-slate-200 active:scale-95"
            title="Reset Camera Target"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
          </button>

          <button
            onClick={() => {
              soundEngine.playWireframe();
              onToggleWireframe();
            }}
            className={`glass-panel p-2 rounded-xl text-xs font-semibold shadow-sm transition-all border active:scale-95 ${
              isWireframe ? 'bg-indigo-50 text-indigo-700 border-indigo-300' : 'hover:bg-white text-slate-700 border-slate-200'
            }`}
            title="Toggle Wireframe CAD Mode"
          >
            <Grid className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              soundEngine.playTone(showSpatialPins ? 380 : 540, 'square', 0.08, 0.03);
              setShowSpatialPins(!showSpatialPins);
            }}
            className={`glass-panel p-2 rounded-xl text-xs font-semibold shadow-sm transition-all border active:scale-95 ${
              showSpatialPins ? 'bg-indigo-50 text-indigo-700 border-indigo-300' : 'hover:bg-white text-slate-700 border-slate-200'
            }`}
            title="Toggle 3D World Pins"
          >
            <Tag className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              soundEngine.playTone(460, 'sine', 0.08, 0.03);
              setAutoRotate(!autoRotate);
            }}
            className={`glass-panel p-2 rounded-xl text-xs font-semibold shadow-sm transition-all border active:scale-95 ${
              autoRotate ? 'bg-indigo-50 text-indigo-700 border-indigo-300' : 'hover:bg-white text-slate-700 border-slate-200'
            }`}
            title="Toggle 360° Turntable Auto-Rotate"
          >
            {autoRotate ? <Pause className="w-3.5 h-3.5 text-indigo-600" /> : <Play className="w-3.5 h-3.5 text-slate-600" />}
          </button>

          <button
            onClick={toggleAudio}
            className="glass-panel hover:bg-white p-2 rounded-xl text-xs font-semibold text-slate-700 shadow-sm transition-all border border-slate-200 active:scale-95"
            title="Toggle Audio Feedback"
          >
            {soundMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-400" /> : <Volume2 className="w-3.5 h-3.5 text-indigo-600" />}
          </button>

          <button
            onClick={toggleFullscreen}
            className="glass-panel hover:bg-white p-2 rounded-xl text-xs font-semibold text-slate-700 shadow-sm transition-all border border-slate-200 active:scale-95"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="w-3.5 h-3.5 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Floating 360° Orbit Compass & Zoom Controls (Left Center) */}
      <div className="absolute top-28 left-4 flex flex-col space-y-2 pointer-events-auto z-30">
        {/* 360° Azimuth Compass Dial */}
        <div className="glass-panel p-2.5 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center space-y-2 text-slate-700">
          <div className="relative w-12 h-12 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center">
            {/* Cardinal Direction Buttons */}
            <button
              onClick={() => handleRotateToHeading(0)}
              className="absolute -top-1.5 text-[8px] font-mono font-extrabold text-slate-500 hover:text-indigo-600"
              title="Rotate North (0°)"
            >
              N
            </button>
            <button
              onClick={() => handleRotateToHeading(Math.PI / 2)}
              className="absolute -right-1.5 text-[8px] font-mono font-extrabold text-slate-500 hover:text-indigo-600"
              title="Rotate East (90°)"
            >
              E
            </button>
            <button
              onClick={() => handleRotateToHeading(Math.PI)}
              className="absolute -bottom-1.5 text-[8px] font-mono font-extrabold text-slate-500 hover:text-indigo-600"
              title="Rotate South (180°)"
            >
              S
            </button>
            <button
              onClick={() => handleRotateToHeading(-Math.PI / 2)}
              className="absolute -left-1.5 text-[8px] font-mono font-extrabold text-slate-500 hover:text-indigo-600"
              title="Rotate West (270°)"
            >
              W
            </button>

            {/* Rotating Arrow Indicator */}
            <div
              className="w-8 h-8 flex items-center justify-center transition-transform duration-100"
              style={{ transform: `rotate(${-azimuthDeg}deg)` }}
            >
              <Navigation className="w-5 h-5 text-indigo-600 fill-indigo-500/30" />
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-600">
            {azimuthDeg}°
          </span>
        </div>

        {/* Step Zoom In / Zoom Out Controls */}
        <div className="glass-panel p-1 rounded-2xl shadow-sm border border-slate-200 flex flex-col space-y-1">
          <button
            onClick={() => handleZoomStep(true)}
            className="p-2 rounded-xl hover:bg-white text-slate-700 transition-all border border-transparent hover:border-slate-200 active:scale-90"
            title="Zoom In (+)"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoomStep(false)}
            className="p-2 rounded-xl hover:bg-white text-slate-700 transition-all border border-transparent hover:border-slate-200 active:scale-90"
            title="Zoom Out (-)"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Dynamic Hover Tooltip Pill */}
      {hoveredStage !== null && (
        <div
          className="pointer-events-none absolute z-40 transition-all duration-75 transform -translate-x-1/2 -translate-y-full mb-3"
          style={{ left: hoveredStage.x, top: hoveredStage.y }}
        >
          <div className="glass-panel px-3 py-1.5 rounded-xl border border-indigo-200/90 shadow-lg text-slate-800 flex items-center space-x-2 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[11px] font-mono font-bold text-slate-900">
              {curriculumStages[hoveredStage.idx].title.split('&')[0].trim()}
            </span>
            <span className="text-[10px] text-indigo-600 font-mono font-semibold bg-indigo-50 px-1.5 py-0.5 rounded-md border border-indigo-100">
              Focus & Inspect
            </span>
          </div>
        </div>
      )}

      {/* Consolidated Minimalist Dock (Bottom Center) */}
      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-11/12 max-w-2xl pointer-events-auto z-30">
        <div className="glass-panel px-3 sm:px-4 py-2 rounded-2xl border border-slate-200/90 shadow-xl flex items-center justify-between gap-3 backdrop-blur-md">
          {/* Quick Stage Milestones */}
          <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar py-0.5">
            {curriculumStages.map((stage, idx) => {
              const isSelected = currentStageIdx === idx;
              const dotColor =
                stage.subsystem === 'de'
                  ? 'bg-sky-500'
                  : stage.subsystem === 'aie'
                  ? 'bg-purple-600'
                  : 'bg-emerald-500';

              return (
                <button
                  key={stage.id}
                  onClick={() => {
                    soundEngine.playStep(idx);
                    onSelectStage(idx);
                  }}
                  className={`px-2 py-1 rounded-xl text-[10px] font-mono font-bold flex items-center space-x-1 transition-all whitespace-nowrap ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-xs scale-105 ring-1 ring-indigo-300'
                      : 'text-slate-600 hover:bg-slate-200/60'
                  }`}
                  title={stage.title}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                  <span>{idx + 1}</span>
                </button>
              );
            })}
          </div>

          <div className="h-5 w-px bg-slate-200 shrink-0 hidden sm:block" />

          {/* Compact CAD Deconstruction Slider */}
          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-[10px] font-mono font-bold text-slate-500 hidden md:inline">
              DECONSTRUCT:
            </span>
            <input
              type="range"
              min="0"
              max="100"
              value={explosionFactor}
              onChange={(e) => handleExplosionChange(Number(e.target.value))}
              className="w-16 sm:w-24 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              title={`CAD Deconstruction: ${explosionFactor}%`}
            />
            <span className="text-[10px] font-mono font-bold text-indigo-700 w-8">
              {explosionFactor}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
