import React from 'react';
import { ArrowLeft, Zap, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';
import { curriculumStages } from '../data/curriculumData';
import { soundEngine } from '../utils/soundEngine';

interface ArchitectureTopologyViewProps {
  currentStageIdx: number;
  onSelectStage: (idx: number) => void;
  onClose: () => void;
  onOpenDeepGuide: () => void;
}

export const ArchitectureTopologyView: React.FC<ArchitectureTopologyViewProps> = ({
  currentStageIdx,
  onSelectStage,
  onClose,
  onOpenDeepGuide,
}) => {
  return (
    <section className="glass-panel p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <span className="p-1.5 rounded-xl bg-indigo-100 text-indigo-700">
              <Cpu className="w-5 h-5" />
            </span>
            <span>End-to-End Enterprise Cognitive Topology</span>
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
            A comprehensive, high-resolution architectural topology diagram mapping raw transactional event streams through analytical storage and the dual feature store into modern agentic AI serving infrastructure.
          </p>
        </div>

        <button
          onClick={() => {
            soundEngine.playTone(400, 'square', 0.08, 0.03);
            onClose();
          }}
          className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 self-start md:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Spatial Twin</span>
        </button>
      </div>

      {/* 2D Horizontal Node Pipeline Flow */}
      <div className="space-y-6">
        {/* Domain Group 1: Data Engineering Powertrain */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-sky-100 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-800 flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              <span>Phase 1: Deterministic Data Powertrain (CDC, Transform, Lakehouse, DAG)</span>
            </span>
            <span className="text-[11px] font-mono text-sky-600 font-semibold">4 Microservices</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {curriculumStages.slice(0, 4).map((stg, i) => {
              const isSelected = currentStageIdx === i;
              return (
                <div
                  key={stg.id}
                  onClick={() => {
                    soundEngine.playTone(450 + i * 30, 'sine', 0.08, 0.03);
                    onSelectStage(i);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-sky-50/90 border-sky-400 shadow-md ring-2 ring-sky-200'
                      : 'bg-white border-slate-200/90 hover:border-sky-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-mono font-bold text-sky-700 mb-1.5">
                      <span>STEP 0{i + 1}</span>
                      <span>{stg.specs.latency}</span>
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                      {stg.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {stg.intro}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-sky-700">
                    <span>Inspect Node</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Domain Group 2: The Convergent Bridge */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Phase 2: Convergent Bridge (Dual Feature Store & Data Contracts)</span>
            </span>
            <span className="text-[11px] font-mono text-emerald-600 font-semibold">Critical Nexus</span>
          </div>

          <div
            onClick={() => {
              soundEngine.playTone(520, 'sine', 0.08, 0.03);
              onSelectStage(4);
            }}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              currentStageIdx === 4
                ? 'bg-emerald-50/90 border-emerald-400 shadow-md ring-2 ring-emerald-200'
                : 'bg-white border-slate-200/90 hover:border-emerald-300'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-700">STEP 05 • CENTRAL SYNCHRONIZER</span>
                <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                  {curriculumStages[4].title}
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Dual-state synchronization serving sub-5ms cached features for real-time online inference alongside immutable time-travel batch snapshots for training.
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDeepGuide();
                }}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all self-start sm:self-auto shrink-0"
              >
                Deep Blueprint
              </button>
            </div>
          </div>
        </div>

        {/* Domain Group 3: AI Engineering Cognition */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-purple-100 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-800 flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
              <span>Phase 3: Probabilistic AI Cognition (Embeddings, HNSW, LoRA, Agents, PagedAttention)</span>
            </span>
            <span className="text-[11px] font-mono text-purple-600 font-semibold">5 Microservices</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {curriculumStages.slice(5).map((stg, i) => {
              const actualIdx = i + 5;
              const isSelected = currentStageIdx === actualIdx;
              return (
                <div
                  key={stg.id}
                  onClick={() => {
                    soundEngine.playTone(550 + i * 30, 'sine', 0.08, 0.03);
                    onSelectStage(actualIdx);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-purple-50/90 border-purple-400 shadow-md ring-2 ring-purple-200'
                      : 'bg-white border-slate-200/90 hover:border-purple-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-mono font-bold text-purple-700 mb-1.5">
                      <span>STEP 0{actualIdx + 1}</span>
                      <span>{stg.specs.latency.split('/')[0]}</span>
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                      {stg.title.split('&')[0].trim()}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {stg.intro}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-purple-700">
                    <span>Inspect Node</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
