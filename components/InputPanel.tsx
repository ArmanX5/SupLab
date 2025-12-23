
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SetComponent, ComponentType } from '../types';
import { 
  Plus, 
  Trash2, 
  Calculator, 
  Waves, 
  Hash, 
  IterationCcw, 
  FunctionSquare, 
  Brackets,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

interface InputPanelProps {
  components: SetComponent[];
  onChange: (components: SetComponent[]) => void;
  onClear: () => void;
}

const InputPanel: React.FC<InputPanelProps> = ({ components, onChange, onClear }) => {
  const [activeType, setActiveType] = useState<ComponentType>('interval');
  
  const [startInput, setStartInput] = useState("0");
  const [endInput, setEndInput] = useState("1");
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const [finitePointsStr, setFinitePointsStr] = useState("0, 1, 2");
  const [seqType, setSeqType] = useState<'1/n' | 'alternating' | 'geometric' | 'custom'>('1/n');
  const [customFormula, setCustomFormula] = useState("(-1)^n / n");
  const [funcType, setFuncType] = useState<'explicit' | 'parametric' | 'implicit'>('explicit');
  const [formulaX, setFormulaX] = useState("cos(t)");
  const [formulaY, setFormulaY] = useState("sin(t)");
  const [formulaZ, setFormulaZ] = useState("t/5");
  const [domainStart, setDomainStart] = useState("-pi");
  const [domainEnd, setDomainEnd] = useState("pi");

  const parseBound = (val: string): number => {
    const v = val.trim().toLowerCase();
    if (!v) return 0;

    const special: Record<string, number> = {
      inf: Infinity,
      '+inf': Infinity,
      infinity: Infinity,
      '∞': Infinity,
      '-inf': -Infinity,
      '-infinity': -Infinity,
      '-∞': -Infinity,
      pi: Math.PI,
      '+pi': Math.PI,
      '-pi': -Math.PI,
      e: Math.E,
      '+e': Math.E,
      '-e': -Math.E,
    };

    if (v in special) return special[v];

    const parsed = parseFloat(v);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const normalizeDomain = (rawStart: string, rawEnd: string): [number, number] => {
    let start = parseBound(rawStart);
    let end = parseBound(rawEnd);

    // Keep domain finite to avoid runaway sampling
    if (!Number.isFinite(start)) start = -10;
    if (!Number.isFinite(end)) end = 10;

    if (start > end) [start, end] = [end, start];

    if (start === end) {
      const delta = Math.max(1, Math.abs(start) * 0.05, 0.5);
      start -= delta;
      end += delta;
    }

    return [start, end];
  };

  const addComponent = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    let newComp: SetComponent = { id: newId, type: activeType };

    if (activeType === 'interval') {
      newComp.interval = { start: parseBound(startInput), end: parseBound(endInput), leftOpen, rightOpen };
    } else if (activeType === 'finite') {
      const arr = finitePointsStr.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
      newComp.finite = { points: arr };
    } else if (activeType === 'sequence') {
      newComp.sequence = { type: seqType, limit: 150, customFormula: seqType === 'custom' ? customFormula : undefined };
    } else if (activeType === 'function') {
      const domain = normalizeDomain(domainStart, domainEnd);

      newComp.function = {
        funcType,
        formulaX: funcType === 'parametric' ? formulaX : undefined,
        formulaY,
        formulaZ: funcType === 'parametric' ? formulaZ : undefined,
        domain,
        samples: funcType === 'implicit' ? 600 : 300
      };
    }

    onChange([...components, newComp]);
  };

  const removeComponent = (id: string) => {
    onChange(components.filter(c => c.id !== id));
  };

  const types = [
    { id: 'interval', label: 'Interval', icon: Brackets },
    { id: 'finite', label: 'Finite', icon: Hash },
    { id: 'sequence', label: 'Sequence', icon: IterationCcw },
    { id: 'function', label: 'Function', icon: FunctionSquare },
  ];

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200 flex flex-col h-full overflow-hidden">
      <div className="bg-slate-50/80 px-6 py-5 border-b border-slate-200 flex justify-between items-center shrink-0">
        <h2 className="text-xs font-bold text-slate-800 flex items-center gap-2 uppercase tracking-widest">
            <Calculator className="w-4 h-4 text-indigo-600"/> Set Definition
        </h2>
        <button onClick={onClear} className="text-[10px] text-slate-400 hover:text-red-500 font-bold uppercase tracking-widest transition-colors hover:bg-red-50 px-2 py-1 rounded-md">
            Clear
        </button>
      </div>

      <div className="p-5 border-b border-slate-100 shrink-0 bg-white">
        <div className="flex gap-1 mb-6 p-1 bg-slate-100/80 rounded-2xl border border-slate-200/50">
            {types.map(t => {
              const Icon = t.icon;
              return (
                <button
                    key={t.id}
                    onClick={() => setActiveType(t.id as ComponentType)}
                    className={`flex-1 py-2.5 px-2 rounded-xl flex flex-col items-center gap-1 transition-all ${
                        activeType === t.id 
                        ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' 
                        : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
                    }`}
                >
                    <Icon size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">{t.label}</span>
                </button>
              );
            })}
        </div>

        <motion.div 
          layout
          className="space-y-4 bg-slate-50/30 p-5 rounded-2xl border border-slate-200/60"
        >
            {activeType === 'interval' && (
                <div className="flex gap-2 items-center">
                    <button 
                      onClick={() => setLeftOpen(!leftOpen)} 
                      className={`w-12 h-12 flex items-center justify-center border-2 rounded-xl text-lg font-bold transition-all ${leftOpen ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-100 text-slate-400'}`}
                    >
                      {leftOpen ? '(' : '['}
                    </button>
                    <div className="flex-1 space-y-1">
                      <input 
                        type="text" value={startInput} onChange={e => setStartInput(e.target.value)} 
                        className="w-full p-2.5 bg-white border-2 border-slate-100 rounded-xl text-center text-xs font-mono focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 outline-none transition-all" 
                        placeholder="-∞" 
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <input 
                        type="text" value={endInput} onChange={e => setEndInput(e.target.value)} 
                        className="w-full p-2.5 bg-white border-2 border-slate-100 rounded-xl text-center text-xs font-mono focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 outline-none transition-all" 
                        placeholder="∞" 
                      />
                    </div>
                    <button 
                      onClick={() => setRightOpen(!rightOpen)} 
                      className={`w-12 h-12 flex items-center justify-center border-2 rounded-xl text-lg font-bold transition-all ${rightOpen ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-100 text-slate-400'}`}
                    >
                      {rightOpen ? ')' : ']'}
                    </button>
                </div>
            )}

            {activeType === 'function' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="flex bg-white/80 p-1 rounded-xl gap-1 border border-slate-100">
                  {(['explicit', 'parametric', 'implicit'] as const).map(f => (
                    <button 
                      key={f} onClick={() => setFuncType(f)}
                      className={`flex-1 py-1.5 px-2 text-[9px] font-bold rounded-lg uppercase transition-all ${funcType === f ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                
                <div className="space-y-3">
                  {funcType === 'parametric' ? (
                    <div className="grid grid-cols-1 gap-2">
                      {['X', 'Y', 'Z'].map((axis, i) => (
                        <div key={axis} className="relative group">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-indigo-400 uppercase tracking-tighter">{axis}(t) =</span>
                          <input 
                            value={axis === 'X' ? formulaX : axis === 'Y' ? formulaY : formulaZ} 
                            onChange={e => axis === 'X' ? setFormulaX(e.target.value) : axis === 'Y' ? setFormulaY(e.target.value) : setFormulaZ(e.target.value)} 
                            className="w-full pl-12 pr-4 py-2.5 bg-white border-2 border-slate-100 rounded-xl text-xs font-mono focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 outline-none transition-all" 
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-indigo-400 uppercase tracking-tighter">
                        {funcType === 'explicit' ? 'f(x) =' : 'F(x,y) ='}
                      </span>
                      <input 
                        value={formulaY} onChange={e => setFormulaY(e.target.value)} 
                        className="w-full pl-16 pr-4 py-2.5 bg-white border-2 border-slate-100 rounded-xl text-xs font-mono focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 outline-none transition-all" 
                        placeholder={funcType === 'implicit' ? 'x^2 + y^2 - 1' : 'sin(x)'} 
                      />
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <span className="text-[9px] font-bold text-slate-400 uppercase ml-2 tracking-tighter mb-1 block">Domain Min</span>
                      <input 
                        value={domainStart} onChange={e => setDomainStart(e.target.value)} 
                        className="w-full p-2.5 bg-white border-2 border-slate-100 rounded-xl text-xs text-center font-mono focus:border-indigo-400 outline-none transition-all" 
                      />
                    </div>
                    <div className="relative">
                      <span className="text-[9px] font-bold text-slate-400 uppercase ml-2 tracking-tighter mb-1 block">Domain Max</span>
                      <input 
                        value={domainEnd} onChange={e => setDomainEnd(e.target.value)} 
                        className="w-full p-2.5 bg-white border-2 border-slate-100 rounded-xl text-xs text-center font-mono focus:border-indigo-400 outline-none transition-all" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeType === 'finite' && (
              <div className="space-y-2 animate-in fade-in duration-300">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Point Array</span>
                  <HelpCircle size={14} className="text-slate-300" />
                </div>
                <textarea 
                  value={finitePointsStr} onChange={e => setFinitePointsStr(e.target.value)} 
                  className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl text-xs font-mono focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 outline-none h-24 resize-none transition-all" 
                  placeholder="e.g. 1, 2, 3.14, -pi" 
                />
              </div>
            )}

            {activeType === 'sequence' && (
               <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase ml-1 tracking-tighter">N-th Term Definition</span>
                    <select 
                      value={seqType} onChange={e => setSeqType(e.target.value as any)} 
                      className="w-full p-3 bg-white border-2 border-slate-100 rounded-xl text-xs font-bold text-slate-700 focus:border-indigo-400 outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="1/n">Harmonic Class (1/n)</option>
                      <option value="alternating">Alternating Series ((-1)^n/n)</option>
                      <option value="geometric">Geometric (0.5^n)</option>
                      <option value="custom">Custom Formula</option>
                    </select>
                  </div>
                  {seqType === 'custom' && (
                     <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-indigo-400">aₙ =</span>
                        <input 
                          value={customFormula} onChange={e => setCustomFormula(e.target.value)} 
                          className="w-full pl-12 pr-4 py-2.5 bg-white border-2 border-slate-100 rounded-xl text-xs font-mono focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 outline-none transition-all" 
                          placeholder="n/(n+1)" 
                        />
                     </div>
                  )}
               </div>
            )}

            <button 
              onClick={addComponent} 
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-[11px] font-extrabold uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-200 flex items-center justify-center gap-3 transition-all active:scale-[0.98] mt-2 group"
            >
                <Plus size={18} className="group-hover:rotate-90 transition-transform" /> 
                Add To Workspace
            </button>
        </motion.div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Universe Projection</span>
          <span className="text-[10px] font-mono bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full text-indigo-600 font-bold">
            {components.length} ELEMENT{components.length !== 1 ? 'S' : ''}
          </span>
        </div>
        
        <AnimatePresence mode="popLayout">
          {components.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 text-slate-300 border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-white/50"
              >
                  <Waves className="mb-4 opacity-10" size={48} />
                  <p className="text-[11px] font-bold uppercase tracking-widest italic text-slate-400">Set is Vacuously Empty</p>
              </motion.div>
          ) : (
            <div className="space-y-3">
              {components.map((comp, idx) => (
                  <motion.div 
                    key={comp.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: idx * 0.05 }}
                    className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50/50 transition-all group group-hover:scale-[1.02]"
                  >
                      <div className="flex flex-col overflow-hidden">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[9px] font-extrabold text-indigo-500 uppercase tracking-widest">{comp.type}</span>
                            <div className="h-px w-4 bg-slate-200" />
                          </div>
                          <div className="text-[11px] font-mono text-slate-700 truncate max-w-[200px] leading-relaxed">
                              {comp.type === 'interval' && `${comp.interval?.leftOpen ? '(' : '['}${comp.interval?.start}, ${comp.interval?.end}${comp.interval?.rightOpen ? ')' : ']'}`}
                              {comp.type === 'function' && `${comp.function?.funcType}: ${comp.function?.formulaY?.slice(0, 15)}`}
                              {comp.type === 'sequence' && `Seq: ${comp.sequence?.type === 'custom' ? comp.sequence.customFormula : comp.sequence?.type}`}
                              {comp.type === 'finite' && `{ ${comp.finite?.points.slice(0,3).join(', ')}${comp.finite?.points.length > 3 ? '...' : ''} }`}
                          </div>
                      </div>
                      <button 
                        onClick={() => removeComponent(comp.id)} 
                        className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                      >
                          <Trash2 size={18} />
                      </button>
                  </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default InputPanel;
