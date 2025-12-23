
import React, { useMemo, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Line, Sphere, Text } from '@react-three/drei';
import { SetComponent, AnalysisResult } from '../types';
import { getSequencePoints, getFunctionPoints } from '../utils/mathUtils';
import * as THREE from 'three';

interface SpaceViewProps {
  components: SetComponent[];
  analysis: AnalysisResult;
  zoom: number;
}

// Animated point cloud component
const AnimatedPoints: React.FC<{ points: number[][]; color: string }> = ({ points, color }) => {
  const meshRef = useRef<THREE.Points>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  const positions = useMemo(() => {
    const pos = new Float32Array(points.length * 3);
    points.forEach((p, i) => {
      pos[i * 3] = p[0] || 0;
      pos[i * 3 + 1] = p[1] || 0;
      pos[i * 3 + 2] = p[2] || 0;
    });
    return pos;
  }, [points]);

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.08} color={color} sizeAttenuation transparent opacity={0.8} />
    </points>
  );
};

// Function curve/surface component
const FunctionMesh: React.FC<{ points: number[][]; color: string; type: 'curve' | 'surface' }> = ({ 
  points, 
  color, 
  type 
}) => {
  if (points.length === 0) return null;

  if (type === 'curve') {
    const curvePoints = points.map(p => new THREE.Vector3(p[0] || 0, p[1] || 0, p[2] || 0));
    return (
      <Line
        points={curvePoints}
        color={color}
        lineWidth={3}
        transparent
        opacity={0.9}
      />
    );
  }

  // For surfaces, render as point cloud with larger points
  return <AnimatedPoints points={points} color={color} />;
};

// Diameter visualization line
const DiameterLine: React.FC<{ point1?: number[]; point2?: number[] }> = ({ point1, point2 }) => {
  if (!point1 || !point2) return null;

  const p1 = new THREE.Vector3(point1[0] || 0, point1[1] || 0, point1[2] || 0);
  const p2 = new THREE.Vector3(point2[0] || 0, point2[1] || 0, point2[2] || 0);

  return (
    <group>
      <Line
        points={[p1, p2]}
        color="#ff6b6b"
        lineWidth={4}
        dashed
        dashSize={0.3}
        gapSize={0.15}
      />
      <Sphere args={[0.12]} position={p1}>
        <meshStandardMaterial color="#ff6b6b" emissive="#ff0000" emissiveIntensity={0.5} />
      </Sphere>
      <Sphere args={[0.12]} position={p2}>
        <meshStandardMaterial color="#ff6b6b" emissive="#ff0000" emissiveIntensity={0.5} />
      </Sphere>
    </group>
  );
};

// Main 3D scene component
const Scene: React.FC<{ components: SetComponent[]; analysis: AnalysisResult; zoom: number }> = ({ 
  components, 
  analysis,
  zoom 
}) => {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />

      {/* Grid helper */}
      <Grid
        args={[20, 20]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#6b7280"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#4b5563"
        fadeDistance={30}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid
      />

      {/* Axes */}
      <Line points={[[0, 0, 0], [10, 0, 0]]} color="#ef4444" lineWidth={2} />
      <Line points={[[0, 0, 0], [0, 10, 0]]} color="#10b981" lineWidth={2} />
      <Line points={[[0, 0, 0], [0, 0, 10]]} color="#3b82f6" lineWidth={2} />

      {/* Axis labels */}
      <Text position={[10.5, 0, 0]} fontSize={0.5} color="#ef4444" anchorX="center" anchorY="middle">
        X
      </Text>
      <Text position={[0, 10.5, 0]} fontSize={0.5} color="#10b981" anchorX="center" anchorY="middle">
        Y
      </Text>
      <Text position={[0, 0, 10.5]} fontSize={0.5} color="#3b82f6" anchorX="center" anchorY="middle">
        Z
      </Text>

      {/* Render components */}
      {components.map((comp) => {
        const baseColor = comp.color || "#6366f1";

        if (comp.type === 'interval' && comp.interval) {
          const p1 = [comp.interval.start, 0, 0];
          const p2 = [comp.interval.end, 0, 0];
          return (
            <Line
              key={comp.id}
              points={[p1, p2]}
              color={baseColor}
              lineWidth={6}
            />
          );
        }

        if (comp.type === 'finite' && comp.finite) {
          const points = comp.finite.points.map(p => [p, 0, 0]);
          return points.map((point, i) => (
            <Sphere key={`${comp.id}-${i}`} args={[0.15]} position={point as [number, number, number]}>
              <meshStandardMaterial color={baseColor} emissive={baseColor} emissiveIntensity={0.3} />
            </Sphere>
          ));
        }

        if (comp.type === 'sequence' && comp.sequence) {
          const seqPoints = getSequencePoints(comp.sequence.type, comp.sequence.limit, comp.sequence.customFormula);
          const points3D = seqPoints.map(p => [p, 0, 0]);
          return <AnimatedPoints key={comp.id} points={points3D} color={baseColor} />;
        }

        if (comp.type === 'function' && comp.function) {
          const fPoints = getFunctionPoints(comp);
          if (fPoints.length === 0) return null;

          const funcType = comp.function.funcType === 'parametric' || comp.function.funcType === 'explicit' 
            ? 'curve' 
            : 'surface';

          return <FunctionMesh key={comp.id} points={fPoints} color={baseColor} type={funcType} />;
        }

        return null;
      })}

      {/* Diameter visualization */}
      {analysis.diameterInfo?.point1 && analysis.diameterInfo?.point2 && (
        <DiameterLine 
          point1={analysis.diameterInfo.point1} 
          point2={analysis.diameterInfo.point2} 
        />
      )}

      {/* Orbit controls */}
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        rotateSpeed={0.5}
        zoomSpeed={zoom}
        minDistance={5}
        maxDistance={50}
      />
    </>
  );
};

const SpaceView: React.FC<SpaceViewProps> = ({ components, analysis, zoom }) => {
  return (
    <div className="w-full h-full bg-slate-900 rounded-3xl shadow-inner relative overflow-hidden ring-1 ring-slate-800">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1e293b_0%,_#0f172a_100%)] opacity-50" />
      
      <Canvas
        camera={{ position: [15, 10, 15], fov: 50 }}
        className="w-full h-full"
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={['#0f172a']} />
        <fog attach="fog" args={['#0f172a', 20, 60]} />
        
        <Suspense fallback={null}>
          <Scene components={components} analysis={analysis} zoom={zoom} />
        </Suspense>
      </Canvas>

      <div className="absolute bottom-8 right-8 text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] pointer-events-none opacity-40">
        3D Euclidean Space
      </div>

      <div className="absolute top-8 left-8 flex flex-col gap-2 pointer-events-none">
        <div className="h-1 w-12 bg-indigo-500 rounded-full" />
        <div className="h-1 w-8 bg-slate-700 rounded-full" />
      </div>

      {/* Diameter info overlay */}
      {analysis.diameterInfo?.value && typeof analysis.diameterInfo.value === 'number' && (
        <div className="absolute top-8 right-8 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-xl border border-red-500/30">
          <p className="text-xs font-bold text-red-400 uppercase tracking-wider">
            Diameter: {analysis.diameterInfo.value.toFixed(4)}
          </p>
        </div>
      )}
    </div>
  );
};

export default SpaceView;
