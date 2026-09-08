import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Sliders, 
  AlertTriangle, 
  Binary, 
  BookOpen, 
  Activity, 
  ShieldCheck,
  Flame
} from 'lucide-react';
import { CurriculumStage } from '../types/simulation';
import { soundEngine } from '../utils/soundEngine';

interface InspectorDrawerProps {
  stage: CurriculumStage;
  onOpenEducationalGuide: () => void;
  onTriggerStressTest: (stageId: string) => void;
}

export const InspectorDrawer: React.FC<InspectorDrawerProps> = ({
  stage,
  onOpenEducationalGuide,
  onTriggerStressTest,
}) => {
  const [sliderVal, setSliderVal] = useState<number>(stage.sandbox.defaultVal);

  useEffect(() => {
    setSliderVal(stage.sandbox.defaultVal);
  }, [stage.id, stage.sandbox.defaultVal]);

  const sandboxResult = stage.sandbox.calc(sliderVal);

  const handleSliderChange = (newVal: number) => {
    setSliderVal(newVal);
    soundEngine.playTone(400 + newVal * 2, 'sine', 0.05, 0.02);
  };

  return (
    <aside className="glass-panel p-5 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col h-full space-y-4">
      {/* Category Badge & Live Health Status */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
        <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider border ${stage.badgeColor}`}>
          {stage.badge}
        </span>
        <span className="text-xs text-emerald-700 font-mono font-bold flex items-center space-x-1.5 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Nominal Telemetry</span>
        </span>
      </div>

      {/* Title & Phonetic Mechanical Analogy */}
      <div>
        <h3 className="text-xl font-bold text-slate-900 leading-tight tracking-tight">
          {stage.title}
        </h3>
        <p className="text-xs font-mono text-slate-500 mt-1">
          {stage.phonetic}
        </p>
      </div>

      {/* Introductory Summary */}
      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 text-xs text-slate-600 leading-relaxed font-medium">
        {stage.intro}
      </div>

      {/* Scrollable Technical Content */}
      <div className="flex-1 space-y-3.5 overflow-y-auto max-h-[300px] lg:max-h-[340px] pr-1">
        {/* Core Mechanics List */}
        <div>
          <h4 className="text-[11px] font-bold uppercase text-slate-400 tracking-wider mb-2">
            Mechanical Blueprint & Architecture
          </h4>
          <ul className="space-y-2 text-xs text-slate-700">
            {stage.mechanics.map((item, idx) => (
              <li key={idx} className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                <span className="leading-relaxed">
                  <strong className="text-slate-900">{item.title}: </strong>
                  {item.desc}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Mathematical Formulation */}
        <div className="p-3.5 bg-indigo-50/70 rounded-2xl border border-indigo-100 text-xs space-y-1.5">
          <span className="font-bold text-indigo-950 flex items-center space-x-1.5">
            <Binary className="w-3.5 h-3.5 text-indigo-600" />
            <span>Mathematical & Algorithmic Formulation</span>
          </span>
          <code className="block font-mono text-indigo-950 bg-white p-2.5 rounded-xl border border-indigo-200/80 break-all text-[11px] shadow-xs">
            {stage.math}
          </code>
        </div>

        {/* Production Failure Mode */}
        <div className="p-3.5 bg-rose-50/80 rounded-2xl border border-rose-100 text-xs space-y-1">
          <span className="font-bold text-rose-900 flex items-center space-x-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Production Failure Risk</span>
          </span>
          <p className="text-rose-800 leading-relaxed">
            <strong>{stage.failure.title}: </strong>
            {stage.failure.description}
          </p>
        </div>

        {/* Live Parameter Sandbox Simulator */}
        <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200/80 text-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-amber-950 flex items-center space-x-1.5">
              <Sliders className="w-3.5 h-3.5 text-amber-600" />
              <span>{stage.sandbox.label}</span>
            </span>
            <span className="font-mono text-indigo-700 bg-white px-2.5 py-0.5 rounded-lg border border-amber-200 font-bold text-[11px] shadow-xs">
              {sandboxResult.metricA}
            </span>
          </div>

          <input
            type="range"
            min={stage.sandbox.min}
            max={stage.sandbox.max}
            value={sliderVal}
            onChange={(e) => handleSliderChange(Number(e.target.value))}
            className="w-full h-1.5 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
          />

          <div className="flex items-center justify-between text-[11px] text-amber-900 font-medium pt-0.5">
            <span>Result: {sandboxResult.metricB}</span>
            <span className="font-bold font-mono px-1.5 py-0.5 bg-amber-100 rounded text-amber-800">
              {sandboxResult.status}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 border-t border-slate-200/80 flex flex-col gap-2">
        <button
          onClick={() => {
            soundEngine.playModalOpen();
            onOpenEducationalGuide();
          }}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-xs rounded-2xl shadow transition-all flex items-center justify-center space-x-2"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Open Full Educational Guide & Blueprints</span>
        </button>

        <button
          onClick={() => {
            soundEngine.playAlert();
            onTriggerStressTest(stage.id);
          }}
          className="w-full py-2 bg-slate-900 hover:bg-slate-800 active:scale-98 text-slate-100 font-semibold text-xs rounded-2xl shadow-xs transition-all flex items-center justify-center space-x-2"
        >
          <Flame className="w-3.5 h-3.5 text-rose-400" />
          <span>Stress-Test This Component</span>
        </button>
      </div>
    </aside>
  );
};
