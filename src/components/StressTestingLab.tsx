import React, { useState, useEffect } from 'react';
import { 
  AlertOctagon, 
  ShieldAlert, 
  CheckCircle2, 
  Wrench, 
  Flame, 
  Code2, 
  Copy, 
  Check, 
  ArrowLeft,
  Activity
} from 'lucide-react';
import { stressScenarios } from '../data/stressScenarios';
import { StressScenario } from '../types/simulation';
import { soundEngine } from '../utils/soundEngine';

interface StressTestingLabProps {
  onApplyFix: () => void;
  onSelectScenario: (scenario: StressScenario) => void;
  activeScenario: StressScenario | null;
  onClose: () => void;
}

export const StressTestingLab: React.FC<StressTestingLabProps> = ({
  onApplyFix,
  onSelectScenario,
  activeScenario,
  onClose,
}) => {
  const [copiedFix, setCopiedFix] = useState(false);
  const [fixApplied, setFixApplied] = useState(false);

  useEffect(() => {
    setFixApplied(false);
    setCopiedFix(false);
  }, [activeScenario?.id]);

  const handleScenarioClick = (scenario: StressScenario) => {
    soundEngine.playAlert();
    setFixApplied(false);
    onSelectScenario(scenario);
  };

  const handleExecuteRemediation = () => {
    soundEngine.playChime();
    setFixApplied(true);
    onApplyFix();
  };

  const handleCopyFix = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedFix(true);
    soundEngine.playTone(600, 'sine', 0.1, 0.04);
    setTimeout(() => setCopiedFix(false), 2000);
  };

  return (
    <section className="glass-panel p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <span className="p-1.5 rounded-xl bg-rose-100 text-rose-600">
              <Flame className="w-5 h-5" />
            </span>
            <span>Enterprise Interactive Stress-Testing Simulation Lab</span>
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
            Select real-world enterprise failure scenarios to trigger real-time 3D mechanical structural degradation, telemetry alerts, and test architectural remediation strategies.
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

      {/* Scenario Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {stressScenarios.map((sc) => {
          const isSelected = activeScenario?.id === sc.id;
          return (
            <div
              key={sc.id}
              onClick={() => handleScenarioClick(sc)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
                isSelected
                  ? 'bg-rose-50/90 border-rose-400 shadow-md ring-2 ring-rose-200'
                  : 'glass-card border-slate-200/90 hover:border-rose-300 hover:shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                    {sc.subsystemLabel}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-extrabold border ${sc.riskClass}`}>
                    {sc.riskBadge}
                  </span>
                </div>
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-rose-600 transition-colors">
                  {sc.title}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1.5 line-clamp-3 leading-relaxed">
                  {sc.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-bold text-rose-600">
                <span>Inject Fault</span>
                <span>→</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Scenario Telemetry and Remediation Stage */}
      {activeScenario ? (
        <div className="p-5 bg-slate-900 text-slate-100 rounded-3xl border border-slate-800 space-y-4 shadow-xl animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <span className={`w-3 h-3 rounded-full ${fixApplied ? 'bg-emerald-400' : 'bg-rose-500 animate-ping'}`} />
              <span className="text-xs font-mono font-bold text-rose-400">
                ACTIVE SCENARIO: {activeScenario.title}
              </span>
            </div>
            <span
              className={`text-xs px-3 py-1 rounded-xl font-mono font-bold self-start sm:self-auto ${
                fixApplied
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-rose-950 text-rose-300 border border-rose-800'
              }`}
            >
              {fixApplied ? 'EQUILIBRIUM RESTORED' : activeScenario.telemetryAlert}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-1.5">
              <span className="font-bold text-slate-300 flex items-center space-x-1.5">
                <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                <span>3D Structural Breakdown Telemetry</span>
              </span>
              <p className="text-slate-400 leading-relaxed">
                {activeScenario.breakdown}
              </p>
            </div>

            <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-1.5">
              <span className="font-bold text-emerald-400 flex items-center space-x-1.5">
                <Wrench className="w-3.5 h-3.5 text-emerald-400" />
                <span>Architectural Engineering Remediation</span>
              </span>
              <p className="text-slate-300 leading-relaxed">
                {activeScenario.remediation}
              </p>
            </div>
          </div>

          {/* Remediation Code Snippet */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono flex items-center space-x-1.5">
                <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Remediation Pattern Implementation</span>
              </span>
              <button
                onClick={() => handleCopyFix(activeScenario.codeFix)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-slate-300 flex items-center space-x-1 transition-colors"
              >
                {copiedFix ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedFix ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-3.5 bg-slate-950 text-slate-200 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800">
              <code>{activeScenario.codeFix}</code>
            </pre>
          </div>

          {/* Execute Fix Button */}
          {!fixApplied ? (
            <button
              onClick={handleExecuteRemediation}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold text-xs rounded-2xl transition-all shadow-lg flex items-center justify-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Execute Architectural Remediation & Restore Nominal Operations</span>
            </button>
          ) : (
            <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs text-center font-bold flex items-center justify-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>System Restored to Equilibrium • 3D Canvas Geometry Reset to Baseline</span>
            </div>
          )}
        </div>
      ) : (
        <div className="p-8 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-slate-500 text-xs">
          Select any failure scenario above to initialize real-time fault injection simulation on the 3D twin.
        </div>
      )}
    </section>
  );
};
