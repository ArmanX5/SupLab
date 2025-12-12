import React, { useState, useMemo } from 'react';
import { SetComponent, Universe } from './types';
import NumberLine from './components/NumberLine';
import InputPanel from './components/InputPanel';
import AnalysisPanel from './components/AnalysisPanel';
import { calculateAnalysis } from './utils/mathUtils';
import { Info, ZoomIn, ZoomOut, Search, Activity, BookOpen } from 'lucide-react';

const App: React.FC = () => {
  // === Application State ===
  
  // Set Composition (Union)
  const [components, setComponents] = useState<SetComponent[]>([
    { id: 'init1', type: 'interval', interval: { start: 0, end: 1, leftOpen: false, rightOpen: false } }
  ]);

  // Laboratory Tools
  const [zoom, setZoom] = useState(1);
  const [epsilon, setEpsilon] = useState(0.2);
  const [magnifierActive, setMagnifierActive] = useState(false);
  const [universe, setUniverse] = useState<Universe>('R');

  // Derived State
  const analysis = useMemo(() => calculateAnalysis(components, universe), [components, universe]);

  // Scenarios
  const loadDedekindScenario = () => {
    setUniverse('Q');
    setComponents([
        { 
            id: 'dedekind-cut', 
            type: 'interval', 
            interval: { start: -Infinity, end: Math.SQRT2, leftOpen: true, rightOpen: true } 
        }
    ]);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-6 lg:p-8 flex flex-col">
      {/* Header */}
      <header className="w-full max-w-[1600px] mx-auto mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <Activity className="text-indigo-600 w-8 h-8"/>
            SupLab <span className="text-xs font-semibold text-white bg-slate-800 px-2 py-0.5 rounded-full tracking-wide">PRO</span>
          </h1>
          <p className="text-slate-500 text-sm mt-0.5 ml-11">Advanced Real Analysis Laboratory</p>
        </div>
      </header>

      {/* Dashboard Grid */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-0">
        
        {/* LEFT COLUMN: Input Panel (Span 3) */}
        <section className="lg:col-span-3 h-[500px] lg:h-auto lg:max-h-[800px] flex flex-col">
          <InputPanel 
            components={components}
            onChange={setComponents}
            onClear={() => setComponents([])}
          />
        </section>

        {/* CENTER COLUMN: Visualization (Span 6) */}
        <section className="lg:col-span-6 flex flex-col gap-4">
          {/* Main Chart Card */}
          <div className="bg-white p-1 rounded-xl shadow-lg border border-slate-200 flex flex-col h-[500px] sticky top-6">
             {/* Toolbar */}
             <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between shrink-0">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Visualization Stage</h3>
                <div className="flex gap-2">
                     <button 
                        onClick={() => setMagnifierActive(!magnifierActive)}
                        className={`p-1.5 rounded-md border transition-all ${magnifierActive ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'}`}
                        title="Toggle Microscope"
                     >
                        <Search size={16} />
                     </button>
                     <div className="flex items-center border border-slate-200 rounded-md overflow-hidden bg-white shadow-sm">
                        <button onClick={() => setZoom(Math.max(0.5, zoom - 0.5))} className="p-1.5 hover:bg-slate-50 border-r border-slate-100 text-slate-600"><ZoomOut size={14}/></button>
                        <span className="text-[10px] font-mono w-8 text-center bg-white text-slate-500">{zoom}x</span>
                        <button onClick={() => setZoom(Math.min(5, zoom + 0.5))} className="p-1.5 hover:bg-slate-50 border-l border-slate-100 text-slate-600"><ZoomIn size={14}/></button>
                     </div>
                </div>
             </div>

             {/* Chart Area */}
             <div className="flex-1 min-h-0 w-full relative bg-slate-50/10">
                 <NumberLine 
                    components={components} 
                    analysis={analysis} 
                    zoom={zoom}
                    epsilon={epsilon}
                    magnifierActive={magnifierActive}
                 />
             </div>
             
             {/* Footer Info */}
             <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 rounded-b-xl flex items-center gap-2 text-xs text-slate-500">
                <Info size={14} className="text-indigo-500" />
                <span>Interact with the sliders on the right to visualize the Epsilon definition of Supremum.</span>
             </div>
          </div>

          {/* Scenarios / Context */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <BookOpen size={14} /> Learning Scenarios
              </h4>
              <div className="flex gap-3 overflow-x-auto pb-2">
                <button 
                    onClick={loadDedekindScenario}
                    className="flex flex-col items-start px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 hover:border-indigo-300 transition-all text-xs group"
                >
                    <span className="font-bold text-indigo-700 mb-0.5">Scenario: Dedekind Cut</span>
                    <span className="text-indigo-500 font-mono text-[10px]">{`{x ∈ Q : x² < 2}`}</span>
                </button>

                <div className="w-px bg-slate-200 mx-1"></div>

                <button 
                    onClick={() => {
                        setUniverse('R');
                        setComponents([
                            { id: 's1', type: 'interval', interval: { start: 0, end: 1, leftOpen: true, rightOpen: true } },
                            { id: 's2', type: 'interval', interval: { start: 2, end: 3, leftOpen: false, rightOpen: false } }
                        ]);
                    }}
                    className="px-4 py-2 border border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-slate-50 hover:text-indigo-700 transition-all text-xs font-medium text-slate-600 whitespace-nowrap"
                >
                    Disjoint (0,1) ∪ [2,3]
                </button>
                <button 
                    onClick={() => {
                        setUniverse('R');
                        setComponents([
                            { id: 's3', type: 'sequence', sequence: { type: '1/n', limit: 20 } },
                            { id: 's4', type: 'finite', finite: { points: [2] } }
                        ]);
                    }}
                    className="px-4 py-2 border border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-slate-50 hover:text-indigo-700 transition-all text-xs font-medium text-slate-600 whitespace-nowrap"
                >
                    Sequence {`{1/n}`} ∪ {`{2}`}
                </button>
                <button 
                    onClick={() => {
                        setUniverse('R');
                        setComponents([
                            { id: 'c1', type: 'sequence', sequence: { type: 'custom', limit: 50, customFormula: "sin(n)/n" } }
                        ]);
                    }}
                    className="px-4 py-2 border border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-slate-50 hover:text-indigo-700 transition-all text-xs font-medium text-slate-600 whitespace-nowrap"
                >
                    Custom: sin(n)/n
                </button>
              </div>
          </div>
        </section>

        {/* RIGHT COLUMN: Analysis (Span 3) */}
        <section className="lg:col-span-3 h-[500px] lg:h-auto lg:max-h-[800px] flex flex-col">
          <AnalysisPanel 
            result={analysis} 
            epsilon={epsilon}
            setEpsilon={setEpsilon}
            universe={universe}
            setUniverse={setUniverse}
          />
        </section>

      </main>
    </div>
  );
};

export default App;