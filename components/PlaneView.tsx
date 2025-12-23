
import React, { useMemo, useRef, useState } from 'react';
import { SetComponent, AnalysisResult, Metric } from '../types';
import { getSequencePoints, formatNum, getFunctionPoints } from '../utils/mathUtils';
// Fix: Import Search icon from lucide-react which was used but not defined
import { Search } from 'lucide-react';

interface PlaneViewProps {
  components: SetComponent[];
  analysis: AnalysisResult;
  zoom: number;
  epsilon: number;
  activeMetric: Metric;
}

const PlaneView: React.FC<PlaneViewProps> = ({ components, analysis, zoom, epsilon, activeMetric }) => {
  const width = 800;
  const height = 500;
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredPoint, setHoveredPoint] = useState<[number, number] | null>(null);

  const scale = 50 * zoom;
  const cx = width / 2;
  const cy = height / 2;

  const toPx = (x: number, y: number) => ({
    x: cx + x * scale,
    y: cy - y * scale
  });

  const fromPx = (px: number, py: number): [number, number] => [
    (px - cx) / scale,
    (cy - py) / scale
  ];

  const handleMouseMove = (e: React.MouseEvent) => {
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      setHoveredPoint(fromPx(e.clientX - rect.left, e.clientY - rect.top));
    }
  };

  const grid = useMemo(() => {
    const lines = [];
    const step = zoom > 3 ? 0.25 : zoom > 1.5 ? 0.5 : 1;
    const maxBound = 50;
    
    for (let i = -maxBound; i <= maxBound; i += step) {
      const isOrigin = Math.abs(i) < 1e-9;
      const opacity = isOrigin ? 0.4 : (Math.round(i) === i ? 0.08 : 0.03);
      
      lines.push(
        <line 
          key={`v${i}`} 
          x1={cx + i * scale} y1={0} x2={cx + i * scale} y2={height} 
          stroke="#1e293b" strokeWidth={isOrigin ? 2 : 1} 
          opacity={opacity} 
        />
      );
      lines.push(
        <line 
          key={`h${i}`} 
          x1={0} y1={cy - i * scale} x2={width} y2={cy - i * scale} 
          stroke="#1e293b" strokeWidth={isOrigin ? 2 : 1} 
          opacity={opacity} 
        />
      );
      
      if (Math.round(i) === i && !isOrigin && Math.abs(i) < 10/zoom) {
        lines.push(<text key={`tx${i}`} x={cx + i * scale} y={cy + 15} textAnchor="middle" className="text-[8px] fill-slate-300 font-bold">{i}</text>);
        lines.push(<text key={`ty${i}`} x={cx - 15} y={cy - i * scale} textAnchor="end" dominantBaseline="middle" className="text-[8px] fill-slate-300 font-bold">{i}</text>);
      }
    }
    return lines;
  }, [zoom, scale, cx, cy]);

  const renderEpsilonBall = () => {
    if (!hoveredPoint) return null;
    const pos = toPx(hoveredPoint[0], hoveredPoint[1]);
    const r = epsilon * scale;

    switch (activeMetric.id) {
      case 'l1':
        const d = `M ${pos.x} ${pos.y - r} L ${pos.x + r} ${pos.y} L ${pos.x} ${pos.y + r} L ${pos.x - r} ${pos.y} Z`;
        return <path d={d} fill="#6366f1" fillOpacity="0.06" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="6 3" />;
      case 'linf':
        return <rect x={pos.x - r} y={pos.y - r} width={r * 2} height={r * 2} fill="#6366f1" fillOpacity="0.06" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="6 3" />;
      case 'l2':
      default:
        return <circle cx={pos.x} cy={pos.y} r={r} fill="#6366f1" fillOpacity="0.06" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="6 3" />;
    }
  };

  return (
    <div className="w-full h-full bg-slate-50/50 rounded-2xl relative overflow-hidden group border border-slate-100/50">
      <svg 
        ref={svgRef} viewBox={`0 0 ${width} ${height}`} 
        className="w-full h-full cursor-crosshair transition-all"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredPoint(null)}
      >
        {grid}
        
        {components.map((comp) => {
          const baseColor = "#6366f1";
          if (comp.type === 'interval' && comp.interval) {
            const { start, end } = comp.interval;
            const p1 = toPx(start, 0);
            const p2 = toPx(end, 0);
            return <line key={comp.id} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={baseColor} strokeWidth="6" strokeLinecap="round" opacity="0.4" />;
          }
          if (comp.type === 'finite' && comp.finite) {
            return comp.finite.points.map((p, i) => {
              const pos = toPx(p, 0);
              return <circle key={`${comp.id}-${i}`} cx={pos.x} cy={pos.y} r={5} fill={baseColor} />;
            });
          }
          if (comp.type === 'sequence' && comp.sequence) {
            const points = getSequencePoints(comp.sequence.type, comp.sequence.limit, comp.sequence.customFormula);
            return points.map((p, i) => {
              const pos = toPx(p, 0);
              return <circle key={`${comp.id}-${i}`} cx={pos.x} cy={pos.y} r={4} fill={baseColor} opacity={0.6} />;
            });
          }
          if (comp.type === 'function' && comp.function) {
            const fPoints = getFunctionPoints(comp);
            if (fPoints.length === 0) return null;
            
            const pathData = `M ${toPx(fPoints[0][0], fPoints[0][1]).x} ${toPx(fPoints[0][0], fPoints[0][1]).y} ` + 
              fPoints.slice(1).map(p => `L ${toPx(p[0], p[1]).x} ${toPx(p[0], p[1]).y}`).join(' ');
            
            return (
              <path 
                key={comp.id} d={pathData} fill="none" 
                stroke={baseColor} strokeWidth="3" 
                strokeLinecap="round" strokeLinejoin="round" 
                className="opacity-80"
              />
            );
          }
          return null;
        })}

        {renderEpsilonBall()}
      </svg>

      <div className="absolute bottom-6 left-6 pointer-events-none space-y-1">
        <div className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
           Coordinate Plane
        </div>
        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Metric Mapping: {activeMetric.name}</div>
      </div>

      {hoveredPoint && (
        <div className="absolute top-6 left-6 bg-white shadow-2xl border border-slate-200 rounded-2xl p-4 pointer-events-none transition-all animate-in fade-in zoom-in-95 duration-200">
          <div className="text-[9px] font-black text-indigo-600 uppercase mb-2 tracking-[0.2em] flex items-center gap-1.5">
            <Search size={12} /> Probe Active
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-0.5">
              <span className="text-[8px] font-bold text-slate-400 uppercase block">Coord X</span>
              <span className="font-mono text-[11px] font-bold text-slate-700">{formatNum(hoveredPoint[0])}</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[8px] font-bold text-slate-400 uppercase block">Coord Y</span>
              <span className="font-mono text-[11px] font-bold text-slate-700">{formatNum(hoveredPoint[1])}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaneView;
