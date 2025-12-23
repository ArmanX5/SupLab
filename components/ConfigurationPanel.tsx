import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SpaceDomain, Dimension } from '../types';
import { Settings2, Box, Maximize2, MinusSquare } from 'lucide-react';

interface ConfigurationPanelProps {
  dimension: Dimension;
  spaceDomain: SpaceDomain | undefined;
  onDomainChange: (domain: SpaceDomain | undefined) => void;
}

const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({ 
  dimension, 
  spaceDomain, 
  onDomainChange 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isBounded, setIsBounded] = useState(spaceDomain?.isBoundedSpace ?? false);
  
  // Local state for bounds
  const [xMin, setXMin] = useState(spaceDomain?.bounds.xMin ?? -10);
  const [xMax, setXMax] = useState(spaceDomain?.bounds.xMax ?? 10);
  const [yMin, setYMin] = useState(spaceDomain?.bounds.yMin ?? -10);
  const [yMax, setYMax] = useState(spaceDomain?.bounds.yMax ?? 10);
  const [zMin, setZMin] = useState(spaceDomain?.bounds.zMin ?? -10);
  const [zMax, setZMax] = useState(spaceDomain?.bounds.zMax ?? 10);

  const handleApply = () => {
    if (!isBounded) {
      onDomainChange(undefined);
      return;
    }

    const domain: SpaceDomain = {
      dimension,
      bounds: {
        xMin,
        xMax,
        ...(dimension >= 2 && { yMin, yMax }),
        ...(dimension === 3 && { zMin, zMax })
      },
      isBoundedSpace: true
    };

    onDomainChange(domain);
  };

  const handleReset = () => {
    setIsBounded(false);
    onDomainChange(undefined);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-5 py-4 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 transition-all border-b border-slate-200"
      >
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Settings2 size={18} className="text-white" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-bold text-slate-800">Space Configuration</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isBounded ? 'Bounded Domain Active' : 'Unbounded (ℝⁿ)'}
            </p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <Box size={20} className="text-indigo-600" />
        </motion.div>
      </button>

      {/* Expandable Content */}
      <motion.div
        initial={false}
        animate={{ height: isExpanded ? 'auto' : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="p-5 space-y-4">
          {/* Bounded Toggle */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2">
              <Maximize2 size={16} className="text-indigo-600" />
              <span className="text-sm font-semibold text-slate-700">Restrict to Bounded Domain</span>
            </div>
            <button
              onClick={() => {
                setIsBounded(!isBounded);
                if (isBounded) handleReset();
              }}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                isBounded ? 'bg-indigo-600' : 'bg-slate-300'
              }`}
            >
              <motion.div
                animate={{ x: isBounded ? 24 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
              />
            </button>
          </div>

          {/* Bounds Configuration */}
          {isBounded && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <MinusSquare size={14} />
                Domain Bounds
              </div>

              {/* X Bounds */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">
                    x_min
                  </label>
                  <input
                    type="number"
                    value={xMin}
                    onChange={(e) => setXMin(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    step="0.5"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">
                    x_max
                  </label>
                  <input
                    type="number"
                    value={xMax}
                    onChange={(e) => setXMax(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    step="0.5"
                  />
                </div>
              </div>

              {/* Y Bounds (for R² and R³) */}
              {dimension >= 2 && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1 block">
                      y_min
                    </label>
                    <input
                      type="number"
                      value={yMin}
                      onChange={(e) => setYMin(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      step="0.5"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1 block">
                      y_max
                    </label>
                    <input
                      type="number"
                      value={yMax}
                      onChange={(e) => setYMax(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      step="0.5"
                    />
                  </div>
                </div>
              )}

              {/* Z Bounds (for R³) */}
              {dimension === 3 && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1 block">
                      z_min
                    </label>
                    <input
                      type="number"
                      value={zMin}
                      onChange={(e) => setZMin(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      step="0.5"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1 block">
                      z_max
                    </label>
                    <input
                      type="number"
                      value={zMax}
                      onChange={(e) => setZMax(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      step="0.5"
                    />
                  </div>
                </div>
              )}

              {/* Example Domain Presets */}
              <div className="pt-2 border-t border-slate-200">
                <p className="text-xs font-semibold text-slate-600 mb-2">Quick Presets:</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setXMin(0); setXMax(1);
                      if (dimension >= 2) { setYMin(0); setYMax(1); }
                      if (dimension === 3) { setZMin(0); setZMax(1); }
                    }}
                    className="px-3 py-1.5 text-xs font-bold bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
                  >
                    Unit Cube
                  </button>
                  <button
                    onClick={() => {
                      setXMin(-1); setXMax(1);
                      if (dimension >= 2) { setYMin(-1); setYMax(1); }
                      if (dimension === 3) { setZMin(-1); setZMax(1); }
                    }}
                    className="px-3 py-1.5 text-xs font-bold bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    [-1, 1]ⁿ
                  </button>
                  <button
                    onClick={() => {
                      setXMin(-5); setXMax(5);
                      if (dimension >= 2) { setYMin(-5); setYMax(5); }
                      if (dimension === 3) { setZMin(-5); setZMax(5); }
                    }}
                    className="px-3 py-1.5 text-xs font-bold bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors"
                  >
                    [-5, 5]ⁿ
                  </button>
                </div>
              </div>

              {/* Apply Button */}
              <button
                onClick={handleApply}
                className="w-full mt-3 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-200"
              >
                Apply Domain Configuration
              </button>
            </motion.div>
          )}

          {/* Info Text */}
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-800 leading-relaxed">
              <strong>Note:</strong> Restricting to a bounded domain affects compactness analysis. 
              A set is compact in ℝⁿ if and only if it is closed and bounded.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ConfigurationPanel;
