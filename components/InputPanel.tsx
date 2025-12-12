import React, { useState, useEffect } from 'react';
import { SetComponent, ComponentType } from '../types';
import { Plus, Trash2, Layers, AlertCircle, Infinity as InfinityIcon } from 'lucide-react';
import { safeEvaluate } from '../utils/mathUtils';

interface InputPanelProps {
  components: SetComponent[];
  onChange: (components: SetComponent[]) => void;
  onClear: () => void;
}

const InputPanel: React.FC<InputPanelProps> = ({ components, onChange, onClear }) => {
  const [activeType, setActiveType] = useState<ComponentType>('interval');
  
  // Interval Inputs (State as strings to allow "inf")
  const [startInput, setStartInput] = useState("0");
  const [endInput, setEndInput] = useState("1");
  
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  
  // Finite Inputs
  const [finitePointsStr, setFinitePointsStr] = useState("0, 1, 2");
  
  // Sequence Inputs
  const [seqType, setSeqType] = useState<'1/n' | 'alternating' | 'geometric' | 'custom'>('1/n');
  const [customFormula, setCustomFormula] = useState("(-1)^n / n");
  const [formulaPreview, setFormulaPreview] = useState<number[]>([]);
  const [formulaError, setFormulaError] = useState(false);

  // Helper to parse inputs like "inf", "infinity"
  const parseBound = (val: string): number => {
    const v = val.toLowerCase().trim();
    if (v === 'inf' || v === 'infinity' || v === '∞' || v === '+inf') return Infinity;
    if (v === '-inf' || v === '-infinity' || v === '-∞') return -Infinity;
    return parseFloat(v);
  };

  // Logic to enforce Open Brackets on Infinity
  useEffect(() => {
    const s = parseBound(startInput);
    const e = parseBound(endInput);
    if (s === -Infinity && !leftOpen) setLeftOpen(true);
    if (e === Infinity && !rightOpen) setRightOpen(true);
  }, [startInput, endInput]);

  // Effect to preview custom formula
  useEffect(() => {
    if (activeType === 'sequence' && seqType === 'custom') {
        const preview: number[] = [];
        let isErr = false;
        for(let i=1; i<=5; i++) {
            const val = safeEvaluate(customFormula, i);
            if (val === null || isNaN(val)) {
                isErr = true;
                break;
            }
            preview.push(Number(val.toFixed(3)));
        }
        setFormulaError(isErr);
        setFormulaPreview(isErr ? [] : preview);
    }
  }, [customFormula, activeType, seqType]);

  const addComponent = () => {
    if (activeType === 'sequence' && seqType === 'custom' && formulaError) return;

    const newId = Math.random().toString(36).substr(2, 9);
    let newComp: SetComponent = { id: newId, type: activeType };

    if (activeType === 'interval') {
      const s = parseBound(startInput);
      const e = parseBound(endInput);
      if (isNaN(s) || isNaN(e)) return; // Validation
      newComp.interval = { start: s, end: e, leftOpen, rightOpen };
    } else if (activeType === 'finite') {
      const arr = finitePointsStr.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
      newComp.finite = { points: arr };
    } else if (activeType === 'sequence') {
      newComp.sequence = { type: seqType, limit: 50, customFormula: seqType === 'custom' ? customFormula : undefined };
    }

    onChange([...components, newComp]);
  };

  const removeComponent = (id: string) => {
    onChange(components.filter(c => c.id !== id));
  };

  const insertInfinity = (field: 'start' | 'end', negative: boolean = false) => {
      const sym = negative ? "-∞" : "∞";
      if (field === 'start') setStartInput(sym);
      else setEndInput(sym);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
      <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex justify-between items-center shrink-0">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wide">
            <Layers className="w-4 h-4 text-indigo-600"/> Set Builder
        </h2>
        <button onClick={onClear} className="text-xs text-red-600 hover:text-red-800 font-medium">
            Reset
        </button>
      </div>

      <div className="p-4 bg-slate-50/30 border-b border-slate-100 shrink-0">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">New Component Type</div>
        
        {/* Type Selector */}
        <div className="flex gap-1 mb-4 p-1 bg-slate-100 rounded-lg">
            {(['interval', 'finite', 'sequence'] as const).map(t => (
                <button
                    key={t}
                    onClick={() => setActiveType(t)}
                    className={`flex-1 py-1.5 text-xs rounded-md font-medium capitalize transition-all ${
                        activeType === t 
                        ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    {t}
                </button>
            ))}
        </div>

        {/* Dynamic Inputs */}
        <div className="space-y-3 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            {activeType === 'interval' && (
                <div className="flex flex-col gap-2">
                    <div className="flex gap-2 items-center">
                        <button 
                            onClick={() => setLeftOpen(!leftOpen)} 
                            className={`w-10 h-10 flex items-center justify-center border rounded-md text-base font-bold transition-colors ${parseBound(startInput) === -Infinity ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-50 hover:bg-slate-100 text-slate-700'}`}
                            disabled={parseBound(startInput) === -Infinity}
                            title={parseBound(startInput) === -Infinity ? "Must be open for -Infinity" : "Toggle Bracket"}
                        >
                            {leftOpen ? '(' : '['}
                        </button>
                        
                        <div className="relative w-full">
                             <input type="text" value={startInput} onChange={e => setStartInput(e.target.value)} className="w-full p-2 border border-slate-200 rounded-md text-center text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900" placeholder="-Inf" />
                             <button onClick={() => insertInfinity('start', true)} className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-indigo-600" title="Insert -∞"><InfinityIcon size={12} /></button>
                        </div>
                        
                        <span className="text-slate-400 font-bold">,</span>
                        
                        <div className="relative w-full">
                            <input type="text" value={endInput} onChange={e => setEndInput(e.target.value)} className="w-full p-2 border border-slate-200 rounded-md text-center text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900" placeholder="Inf" />
                            <button onClick={() => insertInfinity('end', false)} className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-indigo-600" title="Insert ∞"><InfinityIcon size={12} /></button>
                        </div>

                        <button 
                            onClick={() => setRightOpen(!rightOpen)} 
                            className={`w-10 h-10 flex items-center justify-center border rounded-md text-base font-bold transition-colors ${parseBound(endInput) === Infinity ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-50 hover:bg-slate-100 text-slate-700'}`}
                            disabled={parseBound(endInput) === Infinity}
                            title={parseBound(endInput) === Infinity ? "Must be open for Infinity" : "Toggle Bracket"}
                        >
                            {rightOpen ? ')' : ']'}
                        </button>
                    </div>
                </div>
            )}

            {activeType === 'finite' && (
                <div className="space-y-1">
                    <label className="text-xs text-slate-500">Points (comma separated)</label>
                    <input 
                        type="text" 
                        value={finitePointsStr}
                        onChange={e => setFinitePointsStr(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-md text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900"
                        placeholder="e.g. 1, 3.5, -2" 
                    />
                </div>
            )}

            {activeType === 'sequence' && (
                <div className="space-y-3">
                    <select 
                        value={seqType} 
                        onChange={e => setSeqType(e.target.value as any)}
                        className="w-full p-2 border border-slate-200 rounded-md text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900"
                    >
                        <option value="1/n">Harmonic (1/n)</option>
                        <option value="alternating">Alternating (-1)^n</option>
                        <option value="geometric">Geometric (1/2)^n</option>
                        <option value="custom">Custom Formula...</option>
                    </select>
                    
                    {seqType === 'custom' && (
                        <div className="space-y-2">
                             <label className="text-xs text-slate-500 flex justify-between">
                                Formula (in terms of n)
                             </label>
                             <div className="relative">
                                <input 
                                    type="text" 
                                    value={customFormula}
                                    onChange={e => setCustomFormula(e.target.value)}
                                    className={`w-full p-2 border rounded-md text-sm font-mono focus:ring-2 outline-none bg-white text-slate-900 ${formulaError ? 'border-red-300 ring-red-200' : 'border-slate-200 focus:ring-indigo-500'}`}
                                    placeholder="e.g. (n+1)/n"
                                />
                             </div>
                             {formulaError ? (
                                 <div className="text-xs text-red-600 flex items-center gap-1">
                                     <AlertCircle size={12}/> Invalid formula
                                 </div>
                             ) : (
                                 <div className="text-xs text-slate-500 font-mono bg-slate-50 p-2 rounded border border-slate-100 overflow-hidden text-ellipsis whitespace-nowrap">
                                     {`{ ${formulaPreview.join(', ')}, ... }`}
                                 </div>
                             )}
                        </div>
                    )}
                </div>
            )}

            <button 
                onClick={addComponent}
                disabled={activeType === 'sequence' && seqType === 'custom' && formulaError}
                className="w-full py-2.5 bg-indigo-600 text-white rounded-md text-sm font-semibold hover:bg-indigo-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <Plus size={16} /> Add Component
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Active Components (Union)</div>
        {components.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-sm italic border-2 border-dashed border-slate-200 rounded-lg">
                Set A is empty.<br/>Add components above.
            </div>
        )}
        {components.map(comp => (
            <div key={comp.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm group hover:border-indigo-300 hover:shadow-md transition-all">
                <div className="text-sm font-mono text-slate-700">
                    {comp.type === 'interval' && `[${comp.interval?.leftOpen ? '(' : '['}${comp.interval?.start === -Infinity ? '-∞' : comp.interval?.start}, ${comp.interval?.end === Infinity ? '∞' : comp.interval?.end}${comp.interval?.rightOpen ? ')' : ']'}]`}
                    {comp.type === 'finite' && `{ ${comp.finite?.points.length} points }`}
                    {comp.type === 'sequence' && (comp.sequence?.type === 'custom' ? `Seq: ${comp.sequence.customFormula}` : `Seq: ${comp.sequence?.type}`)}
                </div>
                <button onClick={() => removeComponent(comp.id)} className="text-slate-400 hover:text-red-500 p-1.5 rounded-md hover:bg-red-50 transition-colors">
                    <Trash2 size={14} />
                </button>
            </div>
        ))}
      </div>
    </div>
  );
};

export default InputPanel;