
import React from 'react';
import { motion } from 'framer-motion';
import { AnalysisResult, Metric } from '../types';
import { 
  AlertTriangle, 
  Ruler, 
  Calculator, 
  ArrowUp, 
  ArrowDown, 
  BookOpen, 
  Info,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Shapes
} from 'lucide-react';
import { formatNum } from '../utils/mathUtils';

interface AnalysisPanelProps {
  result: AnalysisResult;
  epsilon: number;
  setEpsilon: (val: number) => void;
  activeMetric: Metric;
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ result, epsilon, setEpsilon, activeMetric }) => {
  const isCompact = result.isBounded && result.isCompleteInSpace;

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200 overflow-hidden flex flex-col shrink-0">
        <div className="bg-slate-50/80 px-6 py-5 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-800 flex items-center gap-2 uppercase tracking-widest">
            <Calculator className="w-4 h-4 text-indigo-600"/> Analysis Matrix
          </h2>
          <span className="text-[9px] font-bold bg-indigo-600 text-white px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-indigo-100">{activeMetric.id}</span>
        </div>

        <div className="p-6 space-y-6">
          {result.isEmpty ? (
            <div className="bg-amber-50/50 border border-amber-200 rounded-[2rem] p-6 flex flex-col items-center text-center gap-3">
              <AlertTriangle className="w-10 h-10 text-amber-500 opacity-50" />
              <p className="text-[11px] text-amber-800 leading-relaxed font-bold uppercase tracking-widest">Define components to initialize engine</p>
            </div>
          ) : (
            <>
              {/* Topological Property Grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Bounded', value: result.isBounded, color: 'emerald' },
                  { label: 'Complete', value: result.isCompleteInSpace, color: 'blue' }
                ].map(prop => (
                  <div key={prop.label} className={`p-4 border rounded-2xl flex flex-col items-center justify-center gap-2 transition-all ${prop.value ? `bg-${prop.color}-50 border-${prop.color}-100 text-${prop.color}-700` : 'bg-red-50 border-red-100 text-red-700'}`}>
                    <span className="text-[9px] uppercase font-bold opacity-60 tracking-widest">{prop.label}?</span>
                    <div className="flex items-center gap-1.5">
                      {prop.value ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                      <span className="text-xs font-black uppercase tracking-widest">{prop.value ? 'True' : 'False'}</span>
                    </div>
                  </div>
                ))}
                
                <div className={`col-span-2 p-4 border rounded-2xl flex items-center justify-between px-6 transition-all ${isCompact ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-100' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                   <div className="flex flex-col">
                     <span className={`text-[9px] uppercase font-bold tracking-[0.2em] ${isCompact ? 'text-indigo-200' : 'text-slate-400'}`}>Compact Set</span>
                     <span className="text-[10px] font-medium opacity-70">Heine-Borel Criteria</span>
                   </div>
                   <span className="text-xs font-black uppercase tracking-widest">{isCompact ? 'Satisfied' : 'Pending'}</span>
                </div>
              </div>

              {/* Precision Controller */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm ring-1 ring-slate-200/50 space-y-3">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <div className="flex items-center gap-2"><Ruler size={14} className="text-indigo-400" /> Precision (ε)</div>
                  <div className="font-mono bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg border border-indigo-100">ε = {epsilon.toFixed(2)}</div>
                </div>
                <input 
                  type="range" min="0.01" max="1.5" step="0.01" value={epsilon}
                  onChange={(e) => setEpsilon(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-indigo-600 transition-all hover:bg-slate-200"
                />
                <div className="flex justify-between text-[8px] font-bold text-slate-300 px-1">
                  <span>SENSITIVE</span>
                  <span>COARSE</span>
                </div>
              </div>

              {/* Bounds Breakdown */}
              <div className="space-y-3">
                <div className="flex justify-between items-center p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-math-sup transition-colors group">
                   <div className="flex items-center gap-3 text-red-500 font-extrabold text-[11px] uppercase tracking-widest">
                     <div className="p-1.5 bg-red-50 rounded-lg group-hover:bg-red-500 group-hover:text-white transition-colors">
                       <ArrowUp size={14}/>
                     </div>
                     Supremum
                   </div>
                   <div className="font-mono text-xs font-black text-slate-800">{typeof result.sup === 'number' ? formatNum(result.sup) : (result.sup || 'N/A')}</div>
                </div>
                <div className="flex justify-between items-center p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-math-inf transition-colors group">
                   <div className="flex items-center gap-3 text-blue-500 font-extrabold text-[11px] uppercase tracking-widest">
                     <div className="p-1.5 bg-blue-50 rounded-lg group-hover:bg-blue-500 group-hover:text-white transition-colors">
                       <ArrowDown size={14}/>
                     </div>
                     Infimum
                   </div>
                   <div className="font-mono text-xs font-black text-slate-800">{typeof result.inf === 'number' ? formatNum(result.inf) : (result.inf || 'N/A')}</div>
                </div>

                {/* Diameter Display */}
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl shadow-md hover:shadow-lg transition-all group">
                   <div className="flex items-center gap-3 text-purple-600 font-extrabold text-[11px] uppercase tracking-widest">
                     <div className="p-1.5 bg-purple-100 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
                       <Ruler size={14}/>
                     </div>
                     Diameter (diam)
                   </div>
                   <div className="font-mono text-xs font-black text-slate-800">
                     {typeof result.diameter === 'number' ? formatNum(result.diameter) : (result.diameter || 'N/A')}
                   </div>
                </div>
                
                {/* Diameter info tooltip */}
                {result.diameterInfo?.point1 && result.diameterInfo?.point2 && result.dimension >= 2 && (
                  <div className="text-[10px] text-purple-700 bg-purple-50 p-3 rounded-xl border border-purple-200">
                    <p className="font-semibold mb-1">Extremal Points:</p>
                    <p className="font-mono">
                      p₁ = ({result.diameterInfo.point1.map(v => v.toFixed(2)).join(', ')})
                    </p>
                    <p className="font-mono">
                      p₂ = ({result.diameterInfo.point2.map(v => v.toFixed(2)).join(', ')})
                    </p>
                  </div>
                )}
                
                <div className="mt-6 p-5 bg-indigo-50/40 rounded-2xl border border-indigo-100/50 flex gap-4">
                  <div className="bg-indigo-100 p-2 h-fit rounded-xl text-indigo-500">
                    <Shapes size={18} />
                  </div>
                  <p className="text-[11px] text-indigo-900/70 leading-relaxed font-medium">
                    {result.boundedAbove && typeof result.sup === 'number' ? (
                      <span>According to the <b>ε-definition</b>, for the current ε, there exists an element <i>s</i> in your set such that <b>{formatNum(result.sup - epsilon)} &lt; s ≤ {formatNum(result.sup)}</b>.</span>
                    ) : "The set projection is unbounded above, implying no finite supremum exists."}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Educational Section */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-200 p-8 flex-1 overflow-y-auto">
        <h3 className="text-xs font-bold text-slate-900 flex items-center gap-3 uppercase tracking-[0.2em] mb-6">
          <BookOpen className="w-5 h-5 text-indigo-600"/> Theory Lab
        </h3>
        <div className="space-y-8">
           <section className="relative pl-6 border-l-2 border-indigo-500">
             <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-indigo-500 shadow-lg shadow-indigo-200" />
             <h4 className="font-bold text-slate-900 text-[11px] uppercase tracking-widest mb-2 flex items-center justify-between">
               Completeness Axiom
               <HelpCircle size={14} className="text-slate-300" />
             </h4>
             <p className="text-[11px] text-slate-500 leading-relaxed">
               A metric space is <b>complete</b> if every Cauchy sequence converges to a point <i>within</i> the space. The visualizer checks if your defined set contains its limit points.
             </p>
           </section>
           
           <section className="relative pl-6 border-l-2 border-slate-200">
             <h4 className="font-bold text-slate-900 text-[11px] uppercase tracking-widest mb-2">Supremum (L.U.B.)</h4>
             <p className="text-[11px] text-slate-500 leading-relaxed">
               The "Least Upper Bound." It is the smallest real number that is greater than or equal to every number in the set. Unlike a <i>Maximum</i>, the Supremum doesn't need to belong to the set.
             </p>
           </section>

           <section className="relative pl-6 border-l-2 border-purple-500">
             <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-purple-500 shadow-lg shadow-purple-200" />
             <h4 className="font-bold text-slate-900 text-[11px] uppercase tracking-widest mb-2">Diameter of a Set</h4>
             <p className="text-[11px] text-slate-500 leading-relaxed">
               The diameter is defined as <b>diam(S) = sup{'{'}d(x, y) | x, y ∈ S{'}'}</b>, the supremum of all distances between pairs of points in the set. 
               In the Euclidean metric, this represents the maximum "width" of the set.
             </p>
           </section>

           <section className="relative pl-6 border-l-2 border-slate-200">
             <h4 className="font-bold text-slate-900 text-[11px] uppercase tracking-widest mb-2">Convergence & ε</h4>
             <p className="text-[11px] text-slate-500 leading-relaxed">
               As ε decreases, the "precision band" narrows. Convergence is reached when for any ε, we can always find elements arbitrarily close to the limit value.
             </p>
           </section>
        </div>
        
        <div className="mt-12 pt-8 border-t border-slate-100">
          <div className="bg-slate-900 text-white p-6 rounded-2xl relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 bg-white/5 w-24 h-24 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <h5 className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-2">Did You Know?</h5>
            <p className="text-[10px] leading-relaxed opacity-80 font-medium">
              The Heine-Borel theorem states that in ℝⁿ, a set is compact if and only if it is closed and bounded. This is crucial for optimization and analysis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisPanel;
