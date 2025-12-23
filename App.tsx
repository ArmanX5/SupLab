
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SetComponent, Dimension, MetricType, SpaceDomain } from './types';
import NumberLine from './components/NumberLine';
import PlaneView from './components/PlaneView';
import SpaceView from './components/SpaceView';
import InputPanel from './components/InputPanel';
import AnalysisPanel from './components/AnalysisPanel';
import ConfigurationPanel from './components/ConfigurationPanel';
import { calculateAnalysis, METRICS } from './utils/mathUtils';
import { 
  Info, 
  ZoomIn, 
  ZoomOut, 
  Search, 
  Activity, 
  Box, 
  Square, 
  Minus, 
  Settings2, 
  GraduationCap,
  LayoutGrid,
  ChevronRight
} from 'lucide-react';

const App: React.FC = () => {
  const [dimension, setDimension] = useState<Dimension>(1);
  const [metricId] = useState<MetricType>('l2'); // Fixed to Euclidean only
  const [components, setComponents] = useState<SetComponent[]>([
    { id: 'init1', type: 'interval', interval: { start: 0, end: 1, leftOpen: false, rightOpen: false } }
  ]);
  const [spaceDomain, setSpaceDomain] = useState<SpaceDomain | undefined>(undefined);

  const [zoom, setZoom] = useState(1);
  const [epsilon, setEpsilon] = useState(0.2);
  const [magnifierActive, setMagnifierActive] = useState(false);

  const activeMetric = useMemo(() => METRICS[metricId], [metricId]);
  const analysis = useMemo(
    () => calculateAnalysis(components, dimension, activeMetric, spaceDomain), 
    [components, dimension, activeMetric, spaceDomain]
  );

  const handleDimensionChange = (dim: Dimension) => {
    setDimension(dim);
    // Reset space domain when changing dimensions
    setSpaceDomain(undefined);
  };

  return (
    <div className="min-h-screen bg-academic-50 text-slate-900 font-sans p-4 md:p-6 lg:p-8 flex flex-col antialiased">
      {/* Header Section */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200/60 pb-8"
      >
        <div className="flex items-center gap-5">
          <div className="bg-indigo-600 p-3.5 rounded-2xl shadow-xl shadow-indigo-100 text-white transform hover:rotate-3 transition-transform cursor-pointer">
            <GraduationCap size={32} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
                Metric Space Lab
              </h1>
              <span className="hidden md:inline-block text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full uppercase tracking-widest">
                Academic Edition
              </span>
            </div>
            <p className="text-slate-500 text-sm mt-0.5 font-medium flex items-center gap-1">
              Topological Analysis & Convergence Workbench <ChevronRight size={14} className="text-slate-300" /> <span className="text-indigo-500">v2.5.0</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
           <div className="flex bg-white shadow-sm p-1 rounded-xl border border-slate-200">
              {([1, 2, 3] as Dimension[]).map(d => (
                <button 
                   key={d} onClick={() => handleDimensionChange(d)}
                   className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${dimension === d ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                >
                   {d === 1 ? <Minus size={14}/> : d === 2 ? <Square size={14}/> : <Box size={14}/>}
                   ℝ{d}
                </button>
              ))}
           </div>

           <div className="h-10 w-px bg-slate-200 mx-1 hidden md:block" />

           {/* Euclidean Metric Badge (Fixed) */}
           <div className="flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-200 transition-all">
              <Settings2 size={16} className="text-white" />
              <div className="flex flex-col">
                <span className="text-[9px] uppercase font-bold text-indigo-100 tracking-tighter">Metric Space</span>
                <span className="text-xs font-bold text-white">Euclidean (ℓ²)</span>
              </div>
           </div>
        </div>
      </motion.header>

      {/* Main Content Grid */}
      <main className="flex-1 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0">
        {/* Left Column: Set Builder + Configuration */}
        <motion.section 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-3 flex flex-col gap-4 overflow-hidden"
        >
          <InputPanel 
            components={components}
            onChange={setComponents}
            onClear={() => setComponents([])}
          />
          
          <ConfigurationPanel
            dimension={dimension}
            spaceDomain={spaceDomain}
            onDomainChange={setSpaceDomain}
          />
        </motion.section>

        {/* Center Column: Viewport */}
        <motion.section 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-6 flex flex-col gap-6"
        >
          <div className="bg-white rounded-3xl shadow-2xl shadow-indigo-100/20 border border-slate-200 flex flex-col h-[600px] overflow-hidden group">
             <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white/80 backdrop-blur-md z-10">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${analysis.isEmpty ? 'bg-slate-300' : 'bg-emerald-500 animate-pulse'}`} />
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <Activity size={14} className="text-indigo-400" />
                    Viewport: {dimension === 1 ? 'Linear Projector' : dimension === 2 ? 'Metric Plane' : 'Spatial Isometric'}
                  </h3>
                </div>
                <div className="flex gap-2">
                     <button 
                        onClick={() => setMagnifierActive(!magnifierActive)}
                        className={`p-2.5 rounded-xl border transition-all ${magnifierActive ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50/30'}`}
                        title="Focus Area"
                     >
                        <Search size={16} />
                     </button>
                     <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm ring-1 ring-black/5">
                        <button onClick={() => setZoom(Math.max(0.5, zoom - 0.5))} className="p-2.5 hover:bg-slate-50 border-r border-slate-100 text-slate-500 hover:text-slate-800 transition-colors"><ZoomOut size={16}/></button>
                        <span className="text-[11px] font-mono w-12 text-center bg-white text-indigo-600 font-bold">{zoom.toFixed(1)}x</span>
                        <button onClick={() => setZoom(Math.min(10, zoom + 0.5))} className="p-2.5 hover:bg-slate-50 border-l border-slate-100 text-slate-500 hover:text-slate-800 transition-colors"><ZoomIn size={16}/></button>
                     </div>
                </div>
             </div>

             <div className="flex-1 min-h-0 w-full relative p-4">
                 <AnimatePresence mode="wait">
                   <motion.div
                     key={dimension}
                     initial={{ opacity: 0, scale: 0.98 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 1.02 }}
                     className="w-full h-full"
                   >
                     {dimension === 1 ? (
                        <NumberLine 
                            components={components} 
                            analysis={analysis} 
                            zoom={zoom}
                            epsilon={epsilon}
                            magnifierActive={magnifierActive}
                        />
                     ) : dimension === 2 ? (
                        <PlaneView 
                            components={components}
                            analysis={analysis}
                            zoom={zoom}
                            epsilon={epsilon}
                            activeMetric={activeMetric}
                        />
                     ) : (
                        <SpaceView 
                            components={components}
                            analysis={analysis}
                            zoom={zoom}
                        />
                     )}
                   </motion.div>
                 </AnimatePresence>
             </div>
             
             <div className="px-8 py-4 bg-slate-50/80 border-t border-slate-100 rounded-b-3xl flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                <div className="flex items-center gap-5">
                  <span className="flex items-center gap-1.5"><LayoutGrid size={14} className="text-indigo-400" /> Space: ℝ{dimension}</span>
                  <div className="w-px h-3 bg-slate-300" />
                  <span>Metric: {activeMetric.name}</span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-math-sup shadow-sm shadow-red-200" /> Supremum
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-math-inf shadow-sm shadow-blue-200" /> Infimum
                  </div>
                </div>
             </div>
          </div>
        </motion.section>

        {/* Right Column: Analysis Panel */}
        <motion.section 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-3 flex flex-col h-full overflow-hidden"
        >
          <AnalysisPanel 
            result={analysis} 
            epsilon={epsilon}
            setEpsilon={setEpsilon}
            activeMetric={activeMetric}
          />
        </motion.section>
      </main>
      
      <footer className="w-full max-w-7xl mx-auto mt-12 mb-4 flex flex-col md:flex-row justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest gap-4">
        <p>&copy; 2025 Metric Lab. For Educational Purposes Only.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-indigo-500 transition-colors">Topology Reference</a>
          <a href="#" className="hover:text-indigo-500 transition-colors">Axiom Documentation</a>
          <a href="#" className="hover:text-indigo-500 transition-colors">Lab Support</a>
        </div>
      </footer>
    </div>
  );
};

export default App;
