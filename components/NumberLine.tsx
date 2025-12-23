
import React, { useMemo, useState, useRef } from 'react';
import { SetComponent, AnalysisResult } from '../types';
import { getSequencePoints } from '../utils/mathUtils';

interface NumberLineProps {
  components: SetComponent[];
  analysis: AnalysisResult;
  zoom: number;
  epsilon: number;
  magnifierActive: boolean;
}

const NumberLine: React.FC<NumberLineProps> = ({ 
  components, 
  analysis, 
  zoom, 
  epsilon, 
  magnifierActive
}) => {
  const width = 800;
  const height = 240; 
  const padding = 60;
  
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  const dataSpread = useMemo(() => {
      if (analysis.boundedAbove && analysis.boundedBelow && 
          typeof analysis.sup === 'number' && typeof analysis.inf === 'number') {
          return Math.max(10, (analysis.sup - analysis.inf) * 1.5); 
      }
      return 10;
  }, [analysis]);

  const centerOfContext = useMemo(() => {
    if (analysis.isEmpty) return 0;
    const isFinSup = typeof analysis.sup === 'number';
    const isFinInf = typeof analysis.inf === 'number';
    if (isFinSup && isFinInf) return ((analysis.sup as number) + (analysis.inf as number)) / 2;
    if (isFinSup) return (analysis.sup as number) - 2; 
    if (isFinInf) return (analysis.inf as number) + 2;
    return 0;
  }, [analysis]);

  const halfSpan = (dataSpread / 2) / zoom;
  const domainMin = centerOfContext - halfSpan;
  const domainMax = centerOfContext + halfSpan;
  const range = domainMax - domainMin;

  const toPixels = (val: number) => padding + ((val - domainMin) / range) * (width - 2 * padding);
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };

  const ticks = useMemo(() => {
    const targetCount = 12;
    const rawStep = range / targetCount;
    const mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const resid = rawStep / mag;
    let step = mag;
    if (resid > 5) step = 10 * mag;
    else if (resid > 2) step = 5 * mag;
    else if (resid > 1) step = 2 * mag;
    const t = [];
    const start = Math.floor(domainMin / step) * step;
    const end = Math.ceil(domainMax / step) * step;
    const count = Math.round((end - start) / step);
    for(let i=0; i<=count; i++) {
        const val = Math.round((start + i * step) * 1e10) / 1e10; 
        if (val >= domainMin && val <= domainMax) t.push(val);
    }
    return t;
  }, [domainMin, domainMax, range]);

  const renderComponent = (comp: SetComponent, idx: number) => {
    const isSupInBand = (p: number) => analysis.sup !== null && typeof analysis.sup === 'number' && p > (analysis.sup - epsilon) && p <= analysis.sup;
    const isInfInBand = (p: number) => analysis.inf !== null && typeof analysis.inf === 'number' && p < (analysis.inf + epsilon) && p >= analysis.inf;

    const baseColor = "#6366f1"; // Indigo
    const supColor = "#ef4444"; // Red
    const infColor = "#3b82f6"; // Blue

    if (comp.type === 'interval' && comp.interval) {
      const { start, end, leftOpen, rightOpen } = comp.interval;
      let x1 = start === -Infinity ? -padding : toPixels(start);
      let x2 = end === Infinity ? width + padding : toPixels(end);

      return (
        <g key={comp.id + idx}>
          <line 
            x1={Math.max(0, x1)} y1={height / 2} 
            x2={Math.min(width, x2)} y2={height / 2} 
            stroke={baseColor} strokeWidth="6" strokeLinecap="round" 
            className="transition-all duration-500 opacity-60"
          />
          {start !== -Infinity && start >= domainMin && start <= domainMax && (
            <circle cx={toPixels(start)} cy={height / 2} r={6} fill={leftOpen ? "white" : baseColor} stroke={baseColor} strokeWidth="2.5" />
          )}
          {end !== Infinity && end >= domainMin && end <= domainMax && (
            <circle cx={toPixels(end)} cy={height / 2} r={6} fill={rightOpen ? "white" : baseColor} stroke={baseColor} strokeWidth="2.5" />
          )}
        </g>
      );
    } else if (comp.type === 'finite' && comp.finite) {
      return (
        <g key={comp.id + idx}>
          {comp.finite.points.map((p, i) => {
            if (p < domainMin || p > domainMax) return null;
            const color = isSupInBand(p) ? supColor : isInfInBand(p) ? infColor : baseColor;
            return <circle key={i} cx={toPixels(p)} cy={height / 2} r={5} fill={color} className="shadow-sm" />;
          })}
        </g>
      );
    } else if (comp.type === 'sequence' && comp.sequence) {
      const points = getSequencePoints(comp.sequence.type, comp.sequence.limit, comp.sequence.customFormula);
      return (
        <g key={comp.id + idx}>
          {points.map((p, i) => {
            if (p < domainMin || p > domainMax) return null;
            const color = isSupInBand(p) ? supColor : isInfInBand(p) ? infColor : baseColor;
            return <circle key={i} cx={toPixels(p)} cy={height / 2} r={4} fill={color} opacity={0.6} />;
          })}
        </g>
      );
    }
    return null;
  };

  const supPixel = typeof analysis.sup === 'number' ? toPixels(analysis.sup) : 0;
  const infPixel = typeof analysis.inf === 'number' ? toPixels(analysis.inf) : 0;

  return (
    <div className="w-full h-full overflow-hidden bg-white rounded-2xl relative">
      <svg 
        ref={svgRef} viewBox={`0 0 ${width} ${height}`} 
        className="w-full h-full select-none transition-all"
        onMouseMove={handleMouseMove}
      >
        <defs>
          <linearGradient id="supGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="infGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Main Axis */}
        <line x1={0} y1={height / 2} x2={width} y2={height / 2} stroke="#f1f5f9" strokeWidth="12" strokeLinecap="round" />
        <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
        
        {/* Ticks & Labels */}
        {ticks.map(t => (
          <g key={t} transform={`translate(${toPixels(t)}, 0)`} className="transition-transform duration-500">
            <line y1={height / 2 - 6} y2={height / 2 + 6} stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
            <text y={height / 2 + 24} textAnchor="middle" className="text-[10px] fill-slate-400 font-mono font-bold">{t}</text>
          </g>
        ))}

        {/* Epsilon Band (Sup) */}
        {analysis.boundedAbove && typeof analysis.sup === 'number' && (
            <rect 
              x={toPixels(analysis.sup - epsilon)} y={height/2 - 30} 
              width={toPixels(analysis.sup) - toPixels(analysis.sup - epsilon)} height={60} 
              fill="url(#supGradient)" rx="4"
            />
        )}
        {/* Epsilon Band (Inf) */}
        {analysis.boundedBelow && typeof analysis.inf === 'number' && (
            <rect 
              x={toPixels(analysis.inf)} y={height/2 - 30} 
              width={toPixels(analysis.inf + epsilon) - toPixels(analysis.inf)} height={60} 
              fill="url(#infGradient)" rx="4"
            />
        )}

        {/* Set Components */}
        {components.map((c, i) => renderComponent(c, i))}

        {/* Supremum Marker */}
        {analysis.boundedAbove && typeof analysis.sup === 'number' && analysis.sup >= domainMin && analysis.sup <= domainMax && (
            <g transform={`translate(${supPixel}, 0)`} className="transition-transform duration-500">
                <line y1={40} y2={height - 40} stroke="#ef4444" strokeWidth="2" strokeDasharray="6,4" />
                <rect x="-15" y="20" width="30" height="15" rx="4" fill="#ef4444" />
                <text y="31" fill="white" textAnchor="middle" className="text-[8px] font-black uppercase tracking-tighter">sup</text>
            </g>
        )}
        
        {/* Infimum Marker */}
        {analysis.boundedBelow && typeof analysis.inf === 'number' && analysis.inf >= domainMin && analysis.inf <= domainMax && (
            <g transform={`translate(${infPixel}, 0)`} className="transition-transform duration-500">
                <line y1={40} y2={height - 40} stroke="#3b82f6" strokeWidth="2" strokeDasharray="6,4" />
                <rect x="-15" y={height - 35} width="30" height="15" rx="4" fill="#3b82f6" />
                <text y={height - 24} fill="white" textAnchor="middle" className="text-[8px] font-black uppercase tracking-tighter">inf</text>
            </g>
        )}
      </svg>
      
      <div className="absolute top-4 right-4 text-[9px] font-bold text-slate-300 uppercase tracking-widest pointer-events-none">
        Projection Range: {domainMin.toFixed(2)} to {domainMax.toFixed(2)}
      </div>
    </div>
  );
};

export default NumberLine;
