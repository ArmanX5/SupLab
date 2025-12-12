import React from 'react';
import { AnalysisResult, Universe } from '../types';
import { Check, X, AlertTriangle, Ruler, Calculator, Globe, AlertOctagon } from 'lucide-react';

interface AnalysisPanelProps {
  result: AnalysisResult;
  epsilon: number;
  setEpsilon: (val: number) => void;
  universe: Universe;
  setUniverse: (u: Universe) => void;
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ result, epsilon, setEpsilon, universe, setUniverse }) => {
  const formatNum = (n: number | null | string) => {
    if (n === null) return 'DNE';
    if (n === 'infinity') return 'DNE (Unbounded)';
    if (n === '-infinity') return 'DNE (Unbounded)';
    if (typeof n === 'number') {
        // Special display for SQRT2 if very close
        if (Math.abs(n - Math.SQRT2) < 1e-7) return '√2 (≈1.414)';
        if (Math.abs(n - Math.PI) < 1e-7) return 'π (≈3.141)';
        return parseFloat(n.toFixed(4)).toString();
    }
    return n;
  };

  const isUnbounded = !result.boundedAbove || !result.boundedBelow;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 shrink-0">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wide mb-3">
          <Calculator className="w-4 h-4 text-indigo-600"/> Analysis & Bounds
        </h2>
        
        {/* Universe Toggle */}
        <div className="flex bg-slate-200 p-1 rounded-lg">
            <button 
                onClick={() => setUniverse('R')}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-bold rounded-md transition-all ${universe === 'R' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                <span className="font-serif italic">ℝ</span> Real
            </button>
            <button 
                onClick={() => setUniverse('Q')}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-bold rounded-md transition-all ${universe === 'Q' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                <span className="font-serif italic">ℚ</span> Rational
            </button>
        </div>
      </div>

      <div className="p-5 space-y-6 flex-1 overflow-y-auto">
        {/* Empty State Warning */}
        {result.isEmpty && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <p className="text-sm text-amber-800">The set is currently empty. Add components to begin analysis.</p>
          </div>
        )}

        {/* Completeness Warning */}
        {result.completenessGap && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex flex-col gap-2 animate-pulse-slow">
                <div className="flex items-start gap-2">
                    <AlertOctagon className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-bold text-red-800">Completeness Axiom Fail</h4>
                        <p className="text-xs text-red-700 mt-1 leading-snug">
                            The theoretical limit is <strong>{formatNum(result.theoreticalSup)}</strong>, which is Irrational and <strong>does not exist</strong> in ℚ.
                        </p>
                    </div>
                </div>
                <div className="text-[10px] uppercase font-bold text-red-500 tracking-wider text-right border-t border-red-100 pt-1 mt-1">
                    Gap Detected
                </div>
            </div>
        )}

        {/* Epsilon Lab */}
        {!result.isEmpty && !result.completenessGap && (
             <div className={`border rounded-lg p-4 space-y-4 transition-colors ${result.boundedAbove ? 'bg-indigo-50/50 border-indigo-100' : 'bg-slate-50 border-slate-100 opacity-70'}`}>
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Ruler className="w-4 h-4 text-indigo-500" /> Epsilon Band (ε)
                    </h3>
                    <span className="text-xs font-mono font-bold bg-white px-2 py-0.5 rounded border border-indigo-200 text-indigo-700">ε = {epsilon}</span>
                </div>
                <input 
                    type="range" 
                    min="0.01" max="1.0" step="0.01" 
                    value={epsilon}
                    onChange={(e) => setEpsilon(parseFloat(e.target.value))}
                    disabled={!result.boundedAbove}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <p className="text-xs text-slate-600 leading-relaxed">
                    {result.boundedAbove && typeof result.sup === 'number' ? (
                        <>
                            <strong>Approximation Property:</strong> Since {formatNum(result.sup)} is the Sup, for any ε {'>'} 0, there exists <span className="font-mono">a ∈ A</span> such that:
                            <div className="mt-2 p-2 bg-white rounded border border-indigo-100 font-mono text-center text-indigo-800">
                                {formatNum(result.sup - epsilon)} &lt; a ≤ {formatNum(result.sup)}
                            </div>
                        </>
                    ) : (
                        <span className="text-slate-500 italic">Epsilon logic requires the set to be bounded above and complete.</span>
                    )}
                </p>
            </div>
        )}

        {/* Values Table */}
        {!result.isEmpty && (
        <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-2 text-left text-slate-500 font-semibold text-xs uppercase">Metric</th>
                <th className="px-4 py-2 text-right text-slate-500 font-semibold text-xs uppercase">Value</th>
                <th className="px-4 py-2 text-center text-slate-500 font-semibold text-xs uppercase">In Set?</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              <tr className="group hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-mono text-math-sup font-bold flex items-center gap-2">
                    sup(A) 
                    {universe === 'Q' && <span className="text-[9px] bg-slate-100 text-slate-500 px-1 rounded">in ℚ</span>}
                </td>
                <td className="px-4 py-3 text-right font-mono text-slate-700">
                    {result.completenessGap ? <span className="text-red-500 font-bold">DNE</span> : formatNum(result.sup)}
                </td>
                <td className="px-4 py-3 text-center">
                    {result.max !== null ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700 tracking-wide">
                            Max
                        </span>
                    ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-400 tracking-wide">
                            No
                        </span>
                    )}
                </td>
              </tr>
              <tr className="group hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-mono text-math-inf font-bold flex items-center gap-2">
                    inf(A)
                    {universe === 'Q' && <span className="text-[9px] bg-slate-100 text-slate-500 px-1 rounded">in ℚ</span>}
                </td>
                <td className="px-4 py-3 text-right font-mono text-slate-700">{formatNum(result.inf)}</td>
                <td className="px-4 py-3 text-center">
                    {result.min !== null ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700 tracking-wide">
                            Min
                        </span>
                    ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-400 tracking-wide">
                            No
                        </span>
                    )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        )}

        {/* Boundedness Checks */}
        {!result.isEmpty && (
        <div className="grid grid-cols-2 gap-3">
          <div className={`p-3 bg-white rounded-lg border text-center shadow-sm ${!result.boundedAbove ? 'border-red-100 bg-red-50/20' : 'border-slate-200'}`}>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Bounded Above</p>
            <div className="flex items-center justify-center gap-2">
              {result.boundedAbove ? <Check className="w-5 h-5 text-emerald-500" /> : <X className="w-5 h-5 text-red-500" />}
            </div>
            {result.boundedAbove && (
                <p className="text-[9px] text-emerald-600 mt-1">Has upper bounds</p>
            )}
          </div>
          <div className={`p-3 bg-white rounded-lg border text-center shadow-sm ${!result.boundedBelow ? 'border-red-100 bg-red-50/20' : 'border-slate-200'}`}>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Bounded Below</p>
             <div className="flex items-center justify-center gap-2">
              {result.boundedBelow ? <Check className="w-5 h-5 text-emerald-500" /> : <X className="w-5 h-5 text-red-500" />}
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisPanel;