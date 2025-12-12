import React, { useMemo, useState, useRef } from 'react';
import { SetComponent, AnalysisResult } from '../types';
import { getSequencePoints } from '../utils/mathUtils';
import { HelpCircle } from 'lucide-react';

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
  // SVG Config
  const width = 800;
  const height = 240; 
  const padding = 60;
  
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hoverGap, setHoverGap] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  // 1. Calculate Data Spread (Auto-Fit Base Scale)
  const dataSpread = useMemo(() => {
      // Use theoretical bounds for sizing view even if actual sup is null (gap)
      const s = typeof analysis.theoreticalSup === 'number' ? analysis.theoreticalSup : analysis.sup;
      const i = analysis.inf;

      if (analysis.boundedAbove && analysis.boundedBelow && 
          typeof s === 'number' && typeof i === 'number') {
          const range = s - i;
          return Math.max(10, range * 1.5); 
      }
      return 10;
  }, [analysis]);

  // 2. Determine Viewport Center
  const centerOfContext = useMemo(() => {
    if (analysis.isEmpty) return 0;

    const s = typeof analysis.theoreticalSup === 'number' ? analysis.theoreticalSup : analysis.sup;
    const i = analysis.inf;

    const isFinSup = typeof s === 'number';
    const isFinInf = typeof i === 'number';

    if (isFinSup && isFinInf) {
        return ((s as number) + (i as number)) / 2;
    }
    
    if (isFinSup) return (s as number) - (dataSpread * 0.25); 
    if (isFinInf) return (i as number) + (dataSpread * 0.25);

    return 0;
  }, [analysis, dataSpread]);

  // 3. Calculate Final Viewport Bounds
  const halfSpan = (dataSpread / 2) / zoom;
  const domainMin = centerOfContext - halfSpan;
  const domainMax = centerOfContext + halfSpan;
  const range = domainMax - domainMin;

  const toPixels = (val: number) => {
    return padding + ((val - domainMin) / range) * (width - 2 * padding);
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  // 4. Generate Dynamic Ticks
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
        const val = start + i * step;
        const niceVal = Math.round(val * 1e10) / 1e10; 
        if (niceVal >= domainMin && niceVal <= domainMax) {
            t.push(niceVal);
        }
    }
    return t;
  }, [domainMin, domainMax, range]);

  // Renderer for a single component
  const renderComponent = (comp: SetComponent, idx: number, isLens = false) => {
    const isHighlighted = (p: number) => {
        // Use theoreticalSup to highlight near the gap if it exists
        const s = typeof analysis.theoreticalSup === 'number' ? analysis.theoreticalSup : analysis.sup;
        if (!s || typeof s !== 'number') return false;
        return p > (s - epsilon) && p <= s;
    };

    const highlightColor = "#f59e0b"; // Amber-500
    const baseColor = "#10b981"; // Emerald-500

    if (comp.type === 'interval' && comp.interval) {
      const { start, end, leftOpen, rightOpen } = comp.interval;
      
      let x1: number;
      if (start === -Infinity) {
          x1 = -10000;
      } else {
          x1 = Math.max(isLens ? -10000 : -100, Math.min(isLens ? 10000 : width + 100, toPixels(start)));
      }

      let x2: number;
      if (end === Infinity) {
          x2 = width + 10000;
      } else {
          x2 = Math.max(isLens ? -10000 : -100, Math.min(isLens ? 10000 : width + 100, toPixels(end)));
      }

      if (start !== -Infinity && start > domainMax) return null;
      if (end !== Infinity && end < domainMin) return null;

      let highlightLine = null;
      const s = typeof analysis.theoreticalSup === 'number' ? analysis.theoreticalSup : analysis.sup;

      if (typeof s === 'number' && s !== null) {
          const bandStart = s - epsilon;
          const bandEnd = s;
          
          const intervalStartNum = start === -Infinity ? -Number.MAX_VALUE : start;
          const intervalEndNum = end === Infinity ? Number.MAX_VALUE : end;

          const iStart = Math.max(intervalStartNum, bandStart);
          const iEnd = Math.min(intervalEndNum, bandEnd);
          
          if (iStart < iEnd) {
              const drawStart = Math.max(domainMin, iStart);
              const drawEnd = Math.min(domainMax, iEnd);
              
              if (drawStart < drawEnd) {
                  const hx1 = toPixels(drawStart);
                  const hx2 = toPixels(drawEnd);
                  highlightLine = (
                    <line x1={hx1} y1={height/2} x2={hx2} y2={height/2} stroke={highlightColor} strokeWidth="6" strokeLinecap="butt" />
                  );
              }
          }
      }

      return (
        <g key={comp.id + idx} className="interval-group">
          <line x1={Math.max(0, x1)} y1={height / 2} x2={Math.min(width, x2)} y2={height / 2} stroke={baseColor} strokeWidth="6" strokeLinecap="butt" />
          {highlightLine}
          {start !== -Infinity && start >= domainMin && start <= domainMax && (
            <circle cx={toPixels(start)} cy={height / 2} r={6} fill={leftOpen ? "white" : baseColor} stroke={baseColor} strokeWidth="3" />
          )}
           {end !== Infinity && end >= domainMin && end <= domainMax && (
            <circle cx={toPixels(end)} cy={height / 2} r={6} fill={rightOpen ? "white" : baseColor} stroke={baseColor} strokeWidth="3" />
          )}
          {start === -Infinity && (
             <path d={`M 10 ${height/2} l 10 -6 l 0 12 z`} fill={baseColor} />
          )}
          {end === Infinity && (
             <path d={`M ${width-10} ${height/2} l -10 -6 l 0 12 z`} fill={baseColor} />
          )}
        </g>
      );
    } else if (comp.type === 'finite' && comp.finite) {
      return (
        <g key={comp.id + idx}>
          {comp.finite.points.map((p, i) => {
            if (p < domainMin || p > domainMax) return null;
            const highlighted = isHighlighted(p);
            return (
              <circle key={i} cx={toPixels(p)} cy={height / 2} r={highlighted ? 7 : 5} fill={highlighted ? highlightColor : baseColor} />
            );
          })}
        </g>
      );
    } else if (comp.type === 'sequence' && comp.sequence) {
      const points = getSequencePoints(comp.sequence.type, comp.sequence.limit, comp.sequence.customFormula);
      return (
        <g key={comp.id + idx}>
          {points.map((p, i) => {
            if (p < domainMin || p > domainMax) return null;
            const highlighted = isHighlighted(p);
            return (
              <circle key={i} cx={toPixels(p)} cy={height / 2} r={highlighted ? 6 : 4} fill={highlighted ? highlightColor : baseColor} />
            );
          })}
        </g>
      );
    }
    return null;
  };

  // Determine positions for visualization (using theoreticalSup if gap)
  const vizSup = typeof analysis.theoreticalSup === 'number' ? analysis.theoreticalSup : analysis.sup;
  
  const supPixel = typeof vizSup === 'number' ? toPixels(vizSup) : width;
  const infPixel = typeof analysis.inf === 'number' ? toPixels(analysis.inf) : 0;
  const epsilonPixel = typeof vizSup === 'number' ? toPixels(vizSup - epsilon) : supPixel;

  return (
    <div className="w-full h-full overflow-hidden bg-white rounded-xl shadow-sm border border-slate-200 relative">
      <svg 
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`} 
        className="w-full h-full select-none"
        onMouseMove={handleMouseMove}
        preserveAspectRatio="xMidYMid meet"
      >
        
        {/* === Background Grid/Axis === */}
        <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#cbd5e1" strokeWidth="2" />
        <path d={`M ${width - padding + 5} ${height / 2} l -6 -4 l 0 8 z`} fill="#cbd5e1" />
        <path d={`M ${padding - 5} ${height / 2} l 6 -4 l 0 8 z`} fill="#cbd5e1" />
        
        {ticks.map(t => (
          <g key={t} transform={`translate(${toPixels(t)}, 0)`}>
            <line y1={height / 2 - 8} y2={height / 2 + 8} stroke="#94a3b8" strokeWidth="2" />
            <text y={height / 2 + 30} textAnchor="middle" className="text-xs fill-slate-500 font-mono">{t}</text>
          </g>
        ))}

        {/* === Set Rendering (Normal) === */}
        {components.map((c, i) => renderComponent(c, i))}

        {/* === Visual Analysis === */}
        {analysis.boundedAbove && typeof vizSup === 'number' && (
            <g className="epsilon-band">
                {(() => {
                    const startX = Math.max(padding, Math.min(width - padding, epsilonPixel));
                    const endX = Math.max(padding, Math.min(width - padding, supPixel));
                    if (endX <= startX) return null;
                    return (
                        <rect 
                            x={startX} 
                            y={height/2 - 25} 
                            width={endX - startX} 
                            height={50} 
                            fill={analysis.completenessGap ? "#ef4444" : "#f59e0b"} 
                            fillOpacity={0.15} 
                        />
                    );
                })()}
                
                 {supPixel >= padding && supPixel <= width - padding && supPixel - epsilonPixel > 20 && (
                    <text x={(Math.max(padding, epsilonPixel) + Math.min(width-padding, supPixel))/2} y={height/2 - 30} textAnchor="middle" fontSize="10" fill="#d97706" fontWeight="bold">ε</text>
                 )}
            </g>
        )}

        {/* Bounds Lines */}
        {analysis.boundedAbove && typeof vizSup === 'number' && vizSup >= domainMin && vizSup <= domainMax && (
            <g>
                {/* Use Dashed "Ghost" Line for Gap */}
                <line 
                    x1={supPixel} y1={40} x2={supPixel} y2={height - 40} 
                    stroke={analysis.completenessGap ? "#cbd5e1" : "#ef4444"} 
                    strokeWidth="2" 
                    strokeDasharray="5,5" 
                />
                
                {analysis.completenessGap ? (
                    // Gap Visualization
                    <g 
                        onMouseEnter={() => setHoverGap(true)}
                        onMouseLeave={() => setHoverGap(false)}
                        className="cursor-help"
                    >
                         <circle cx={supPixel} cy={height/2} r={12} fill="white" stroke="#ef4444" strokeWidth="2" strokeDasharray="3,3" />
                         <text x={supPixel} y={height/2 + 5} textAnchor="middle" fontSize="14" fill="#ef4444" fontWeight="bold">?</text>
                         <text x={supPixel} y={35} fill="#94a3b8" textAnchor="middle" fontWeight="bold" fontSize="14">DNE</text>
                    </g>
                ) : (
                    // Normal Sup Label
                    <text x={supPixel} y={35} fill="#ef4444" textAnchor="middle" fontWeight="bold" fontSize="14">sup</text>
                )}
            </g>
        )}
         {analysis.boundedBelow && typeof analysis.inf === 'number' && analysis.inf >= domainMin && analysis.inf <= domainMax && (
            <g>
                <line x1={infPixel} y1={40} x2={infPixel} y2={height - 40} stroke="#3b82f6" strokeWidth="2" strokeDasharray="5,5" />
                <text x={infPixel} y={height - 25} fill="#3b82f6" textAnchor="middle" fontWeight="bold" fontSize="14">inf</text>
            </g>
        )}

        {/* === Microscope (Lens) === */}
        {magnifierActive && (
            <g transform={`translate(${mousePos.x}, ${mousePos.y})`} style={{ pointerEvents: 'none' }}>
                <defs>
                    <clipPath id="lens-clip">
                        <circle cx="0" cy="0" r="60" />
                    </clipPath>
                </defs>
                <circle cx="0" cy="0" r="64" fill="white" stroke="#334155" strokeWidth="4" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }} />
                 <g clipPath="url(#lens-clip)">
                    <g transform={`scale(5) translate(${-mousePos.x}, ${-height/2}) translate(0, 0)`}>
                         <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#cbd5e1" strokeWidth="1" />
                         {components.map((c, i) => renderComponent(c, i, true))}
                    </g>
                 </g>
                <line x1="0" y1="-5" x2="0" y2="5" stroke="#ef4444" strokeWidth="1" opacity="0.5"/>
                <line x1="-5" y1="0" x2="5" y2="0" stroke="#ef4444" strokeWidth="1" opacity="0.5"/>
            </g>
        )}

      </svg>
      
      {/* Tooltip for Gap */}
      {hoverGap && analysis.completenessGap && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[80px] bg-slate-800 text-white text-xs p-2 rounded shadow-lg max-w-[200px] text-center pointer-events-none">
              This point (≈1.414) is missing from the Rational Universe (ℚ).
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-800"></div>
          </div>
      )}
    </div>
  );
};

export default NumberLine;