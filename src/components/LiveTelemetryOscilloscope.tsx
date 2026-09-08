import React, { useState, useEffect } from 'react';
import { Activity, Zap, Cpu, HardDrive, Wifi, ShieldAlert } from 'lucide-react';
import { CurriculumStage } from '../types/simulation';

interface LiveTelemetryOscilloscopeProps {
  stage: CurriculumStage;
  activeStressMesh: string | null;
}

export const LiveTelemetryOscilloscope: React.FC<LiveTelemetryOscilloscopeProps> = ({
  stage,
  activeStressMesh,
}) => {
  const [wavePoints, setWavePoints] = useState<number[]>([]);
  const [tick, setTick] = useState<number>(0);

  // Generate dynamic live oscilloscope wave
  useEffect(() => {
    // initialize points
    const initial = Array.from({ length: 28 }, (_, i) => 25 + Math.sin(i * 0.4) * 12);
    setWavePoints(initial);

    const interval = setInterval(() => {
      setTick((t) => t + 1);
      setWavePoints((prev) => {
        const nextVal = activeStressMesh
          ? 35 + Math.sin(Date.now() * 0.02) * 20 + (Math.random() - 0.5) * 15
          : 25 + Math.sin(Date.now() * 0.005) * 8 + (Math.random() - 0.5) * 4;
        return [...prev.slice(1), Math.max(5, Math.min(50, nextVal))];
      });
    }, 100);

    return () => clearInterval(interval);
  }, [activeStressMesh]);

  // Construct SVG path for waveform
  const pathD = wavePoints
    .map((val, idx) => {
      const x = (idx / (wavePoints.length - 1)) * 280;
      const y = 55 - val;
      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  const isFault = !!activeStressMesh;

  return (
    <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl border border-slate-800 space-y-3 font-mono">
      <div className="flex items-center justify-between text-[11px] border-b border-slate-800 pb-2">
        <div className="flex items-center space-x-1.5 font-bold">
          <Activity className={`w-3.5 h-3.5 ${isFault ? 'text-rose-400 animate-ping' : 'text-emerald-400'}`} />
          <span className={isFault ? 'text-rose-400' : 'text-emerald-400'}>
            {isFault ? 'TELEMETRY ANOMALY DETECTED' : 'LIVE TELEMETRY STREAM'}
          </span>
        </div>
        <span className="text-slate-400">100 Hz SAMPLING</span>
      </div>

      {/* SVG Waveform Monitor */}
      <div className="relative h-16 w-full bg-slate-950 rounded-xl border border-slate-800/80 overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:16px_16px] opacity-25" />
        <svg viewBox="0 0 280 60" className="w-full h-full preserve-3d">
          {/* Gradient area under curve */}
          <path
            d={`${pathD} L 280 60 L 0 60 Z`}
            fill={isFault ? 'rgba(244, 63, 94, 0.2)' : 'rgba(56, 189, 248, 0.15)'}
          />
          {/* Stroke wave */}
          <path
            d={pathD}
            fill="none"
            stroke={isFault ? '#f43f5e' : '#38bdf8'}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>

        {/* Live scanning sweep line */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-white/40 shadow-[0_0_8px_white]"
          style={{ left: `${(tick % 100)}%` }}
        />
      </div>

      {/* 3 Real-Time Visual Metric Dials */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/80">
          <div className="text-[9px] text-slate-400 flex items-center justify-center space-x-1">
            <Cpu className="w-3 h-3 text-sky-400" />
            <span>THROUGHPUT</span>
          </div>
          <div className="text-xs font-bold text-sky-300 mt-1">
            {isFault ? '14.2 MB/s' : stage.specs.throughput}
          </div>
        </div>

        <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/80">
          <div className="text-[9px] text-slate-400 flex items-center justify-center space-x-1">
            <Zap className={`w-3 h-3 ${isFault ? 'text-rose-400' : 'text-emerald-400'}`} />
            <span>p99 LATENCY</span>
          </div>
          <div className={`text-xs font-bold mt-1 ${isFault ? 'text-rose-400' : 'text-emerald-300'}`}>
            {isFault ? '1840 ms' : stage.specs.latency}
          </div>
        </div>

        <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/80">
          <div className="text-[9px] text-slate-400 flex items-center justify-center space-x-1">
            <HardDrive className="w-3 h-3 text-purple-400" />
            <span>SLA BOUND</span>
          </div>
          <div className="text-xs font-bold text-purple-300 mt-1">
            {isFault ? '91.4% (BREACH)' : stage.specs.availability}
          </div>
        </div>
      </div>
    </div>
  );
};
