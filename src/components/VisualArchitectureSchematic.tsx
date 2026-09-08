import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Layers, 
  Activity, 
  Sliders, 
  ArrowRight, 
  RefreshCw, 
  Database, 
  Cpu, 
  Share2, 
  Compass,
  FileCode,
  Terminal,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { CurriculumStage } from '../types/simulation';
import { soundEngine } from '../utils/soundEngine';
import { LiveTelemetryOscilloscope } from './LiveTelemetryOscilloscope';

interface VisualArchitectureSchematicProps {
  stage: CurriculumStage;
  onOpenEducationalGuide: () => void;
  onTriggerStressTest: (stageId: string) => void;
}

export const VisualArchitectureSchematic: React.FC<VisualArchitectureSchematicProps> = ({
  stage,
  onOpenEducationalGuide,
  onTriggerStressTest,
}) => {
  const [activeTab, setActiveTab] = useState<'schematic' | 'telemetry' | 'sandbox'>('schematic');
  const [tick, setTick] = useState<number>(0);
  const [sliderVal, setSliderVal] = useState<number>(stage.sandbox.defaultVal);
  
  // LoRA Rank slider state for stage 7
  const [loraRank, setLoraRank] = useState<number>(16);
  // Time travel commit state for stage 2
  const [deltaVersion, setDeltaVersion] = useState<number>(3);
  // HNSW layer highlight for stage 6
  const [hnswLayer, setHnswLayer] = useState<number>(1);
  // Vector space query similarity for stage 5
  const [vectorQueryAngle, setVectorQueryAngle] = useState<number>(35);

  // Sync sandbox slider on stage change
  useEffect(() => {
    setSliderVal(stage.sandbox.defaultVal);
  }, [stage.id, stage.sandbox.defaultVal]);

  // Live animation ticker for moving diagrams
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((prev) => (prev + 1) % 100);
    }, 120);
    return () => clearInterval(interval);
  }, []);

  const sandboxResult = stage.sandbox.calc(sliderVal);

  const handleSliderChange = (newVal: number) => {
    setSliderVal(newVal);
    soundEngine.playTone(420 + newVal * 2.5, 'sine', 0.04, 0.02);
  };

  // -------------------------------------------------------------
  // RENDER DYNAMIC VISUAL SCHEMATIC FOR CURRENT STAGE
  // -------------------------------------------------------------
  const renderVisualSchematic = () => {
    switch (stage.id) {
      case 'de_ingestion':
        // Kafka & Debezium CDC Stream Ingestion Schematic
        return (
          <div className="space-y-4">
            {/* Live Pipeline Flow Graphic */}
            <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl border border-slate-800 relative overflow-hidden">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-3 border-b border-slate-800 pb-2">
                <span className="flex items-center space-x-1 text-sky-400 font-bold">
                  <Database className="w-3.5 h-3.5" />
                  <span>TRANSACTION LOG STREAM (WAL)</span>
                </span>
                <span className="text-emerald-400 font-bold">0.8ms INGRESS LAG</span>
              </div>

              {/* Animated Disk WAL Blocks */}
              <div className="flex items-center space-x-1.5 overflow-x-auto py-2">
                {[0, 1, 2, 3, 4, 5, 6, 7].map((blockIdx) => {
                  const isActive = (tick % 8) === blockIdx;
                  return (
                    <div
                      key={blockIdx}
                      className={`flex-1 min-w-[38px] h-14 rounded-xl border flex flex-col items-center justify-center text-[10px] font-mono transition-all ${
                        isActive
                          ? 'bg-sky-500 text-white border-sky-300 shadow-md shadow-sky-500/50 scale-105'
                          : 'bg-slate-800/80 text-slate-400 border-slate-700'
                      }`}
                    >
                      <span className="font-bold">L-{blockIdx + 101}</span>
                      <span className="text-[9px] opacity-75">{isActive ? 'COMMITTING' : 'SYNCED'}</span>
                    </div>
                  );
                })}
              </div>

              {/* Data Flow Laser Beam */}
              <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono text-[11px]">Debezium Tailer Active</span>
                </div>
                <div className="font-mono text-[11px] text-sky-400 font-bold">
                  {(sliderVal * 250).toLocaleString()} msg/sec
                </div>
              </div>
            </div>

            {/* Visual Architecture Comparison Badges */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-800 flex items-center space-x-1.5 text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-sky-500" />
                  <span>WAL Binary Log Parsing</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Near-zero database CPU overhead with table-lock bypass.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-800 flex items-center space-x-1.5 text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Idempotent Hasher</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Strictly-once delivery semantics via key hash routing.
                </p>
              </div>
            </div>
          </div>
        );

      case 'de_transformation':
        // Apache Spark Distributed Worker Partition Matrix
        return (
          <div className="space-y-4">
            <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-3 border-b border-slate-800 pb-2">
                <span className="text-sky-400 font-bold flex items-center space-x-1">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>DISTRIBUTED EXECUTOR CLUSTER</span>
                </span>
                <span className="text-emerald-400 font-bold">AQE OPTIMIZED</span>
              </div>

              {/* 4 Spark Worker Cores with Animated Workload */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((core) => {
                  const load = ((Math.sin(tick * 0.2 + core) * 0.5 + 0.5) * 60 + 35).toFixed(0);
                  return (
                    <div key={core} className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-center">
                      <div className="text-[10px] font-mono text-slate-400">CORE #{core}</div>
                      <div className="text-sm font-mono font-bold text-sky-400 mt-0.5">{load}%</div>
                      <div className="w-full bg-slate-700 h-1.5 rounded-full mt-1.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-sky-400 to-indigo-500 h-full transition-all duration-200 rounded-full"
                          style={{ width: `${load}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Shuffle Stage Bar */}
              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Adaptive Coalescing (Shuffle)</span>
                <span className="text-emerald-400 font-bold">Zero Skew Detected</span>
              </div>
            </div>

            <div className="p-3 bg-indigo-50/80 rounded-xl border border-indigo-100 text-xs text-indigo-900">
              <strong className="font-bold">Amdahl's Scaling Law: </strong>
              Parallel speedup is mathematically limited by serial shuffle stages. AQE automatically merges small partitions.
            </div>
          </div>
        );

      case 'de_lakehouse':
        // Delta Lake & Parquet Columnar Storage with Interactive Time Travel
        return (
          <div className="space-y-4">
            <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2 border-b border-slate-800 pb-2">
                <span className="text-sky-400 font-bold">DELTA LAKE ACID LOG & TIME-TRAVEL</span>
                <span className="text-amber-400 font-bold">SNAPSHOT v{deltaVersion}</span>
              </div>

              {/* Parquet Columnar Slices Graphic */}
              <div className="grid grid-cols-3 gap-2 my-3">
                <div className="p-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-center">
                  <div className="text-[10px] font-mono text-slate-400">COL_USER_ID</div>
                  <div className="text-xs font-mono font-bold text-sky-400 mt-1">BIT-PACKED</div>
                  <div className="text-[9px] text-slate-500 mt-0.5">8.2x Compression</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-center">
                  <div className="text-[10px] font-mono text-slate-400">COL_TIMESTAMP</div>
                  <div className="text-xs font-mono font-bold text-emerald-400 mt-1">RLE ENCODED</div>
                  <div className="text-[9px] text-slate-500 mt-0.5">12.4x Compression</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-center">
                  <div className="text-[10px] font-mono text-slate-400">COL_EMBED_VEC</div>
                  <div className="text-xs font-mono font-bold text-purple-400 mt-1">FP16 DENSE</div>
                  <div className="text-[9px] text-slate-500 mt-0.5">Zero Null Skew</div>
                </div>
              </div>

              {/* Time Travel Version Scrubber */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>Interactive Time-Travel Version:</span>
                  <span className="text-amber-400 font-bold">v{deltaVersion} (Commit {deltaVersion * 12})</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5"
                  value={deltaVersion}
                  onChange={(e) => {
                    setDeltaVersion(Number(e.target.value));
                    soundEngine.playTone(300 + Number(e.target.value) * 60, 'sine', 0.05, 0.02);
                  }}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>v0 (Genesis)</span>
                  <span>v5 (Latest Snapshot)</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-sky-50 rounded-xl border border-sky-100 text-xs text-sky-900">
              <strong className="font-bold">Columnar Projection Pruning: </strong>
              Only requested columns are decompressed from NVMe lake storage, reducing I/O bandwidth by up to 92%.
            </div>
          </div>
        );

      case 'de_orchestration':
        // Apache Airflow / Dagster Topological DAG
        return (
          <div className="space-y-4">
            <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-3 border-b border-slate-800 pb-2">
                <span className="text-cyan-400 font-bold">TOPOLOGICAL DAG DEPENDENCY GRAPH</span>
                <span className="text-emerald-400 font-bold">CRON HEARTBEAT: 60s</span>
              </div>

              {/* Visual Node Graph */}
              <div className="flex items-center justify-between py-2 text-[10px] font-mono">
                <div className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-center">
                  <div className="text-emerald-400 font-bold">SENSOR</div>
                  <div className="text-[9px] text-slate-400">S3 File Wait</div>
                </div>
                <div className="h-0.5 w-6 bg-emerald-500 animate-pulse" />
                <div className="p-2 rounded-xl bg-sky-950 border border-sky-700 text-center shadow-sm">
                  <div className="text-sky-300 font-bold">SPARK ETL</div>
                  <div className="text-[9px] text-slate-400">Dedup & Join</div>
                </div>
                <div className="h-0.5 w-6 bg-sky-500 animate-pulse" />
                <div className="p-2 rounded-xl bg-purple-950 border border-purple-700 text-center">
                  <div className="text-purple-300 font-bold">VEC INDEX</div>
                  <div className="text-[9px] text-slate-400">HNSW Sync</div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-slate-800 pt-2">
                <span>Task SLA Enforcement:</span>
                <span className="text-emerald-400 font-bold">100% Punctual</span>
              </div>
            </div>

            <div className="p-3 bg-cyan-50 rounded-xl border border-cyan-100 text-xs text-cyan-900">
              <strong className="font-bold">Idempotent Backfilling: </strong>
              Partition keys guarantee that re-running any upstream pipeline date slice never yields duplicate lakehouse rows.
            </div>
          </div>
        );

      case 'bridge_featurestore':
        // Convergent Dual-Clutch Feature Store (Redis vs Lakehouse)
        return (
          <div className="space-y-4">
            <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-3 border-b border-slate-800 pb-2">
                <span className="text-emerald-400 font-bold">DUAL-CLUTCH FEATURE SYNCHRONIZER</span>
                <span className="text-sky-400 font-bold">DRIFT: 0.00%</span>
              </div>

              {/* Split Architecture: Online Cache vs Offline Batch */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-center">
                  <div className="text-[10px] font-mono text-emerald-400 font-bold">ONLINE TIER (REDIS)</div>
                  <div className="text-lg font-mono font-extrabold text-emerald-300 mt-1">1.2 ms</div>
                  <div className="text-[9px] text-emerald-500 mt-0.5">Point Lookups / Serving</div>
                </div>
                <div className="p-3 rounded-xl bg-sky-950/60 border border-sky-800 text-center">
                  <div className="text-[10px] font-mono text-sky-400 font-bold">OFFLINE TIER (ICEBERG)</div>
                  <div className="text-lg font-mono font-extrabold text-sky-300 mt-1">100M rows</div>
                  <div className="text-[9px] text-sky-500 mt-0.5">Point-in-Time Joins</div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Point-in-Time Join Integrity:</span>
                <span className="text-emerald-400 font-bold">Zero Leakage</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-xs text-emerald-900">
              <strong className="font-bold">Temporal Data Leakage Prevention: </strong>
              Prevents the model from training on features generated after the prediction event occurred.
            </div>
          </div>
        );

      case 'aie_embeddings':
        // High-Dimensional Vector Embeddings Scatter Space
        return (
          <div className="space-y-4">
            <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2 border-b border-slate-800 pb-2">
                <span className="text-purple-400 font-bold">1536-D HYPERSPACE PROJECTION</span>
                <span className="text-emerald-400 font-bold">COSINE SIM: {(Math.cos(vectorQueryAngle * Math.PI / 180)).toFixed(3)}</span>
              </div>

              {/* 2D Vector Projection Visualizer Canvas */}
              <div className="relative h-28 w-full bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:12px_12px] opacity-20" />
                
                {/* Cluster Points */}
                <div className="absolute left-6 top-5 px-2 py-0.5 rounded bg-sky-900/80 border border-sky-600 text-[9px] font-mono text-sky-200">
                  Database Cluster
                </div>
                <div className="absolute right-6 bottom-5 px-2 py-0.5 rounded bg-purple-900/80 border border-purple-600 text-[9px] font-mono text-purple-200">
                  Agent Reasoner
                </div>

                {/* Animated Query Vector Ray */}
                <div 
                  className="w-20 h-0.5 bg-gradient-to-r from-amber-400 to-transparent absolute origin-left transition-transform"
                  style={{ transform: `rotate(${vectorQueryAngle}deg)` }}
                />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400 z-10 shadow-lg shadow-amber-400/80" />
              </div>

              {/* Query Angle Slider */}
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>Semantic Trajectory Angle:</span>
                  <span className="text-amber-400 font-bold">{vectorQueryAngle}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="90"
                  value={vectorQueryAngle}
                  onChange={(e) => {
                    setVectorQueryAngle(Number(e.target.value));
                    soundEngine.playTone(350 + Number(e.target.value) * 4, 'sine', 0.04, 0.02);
                  }}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>
            </div>

            <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 text-xs text-purple-900">
              <strong className="font-bold">Geometric Distance: </strong>
              Semantic similarity equals the cosine angle between vectors in high-dimensional latent space.
            </div>
          </div>
        );

      case 'aie_retrieval':
        // HNSW Proximity Graph Multi-Layer Traversal
        return (
          <div className="space-y-4">
            <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-3 border-b border-slate-800 pb-2">
                <span className="text-fuchsia-400 font-bold">HNSW MULTI-LAYER NAVIGABLE GRAPH</span>
                <span className="text-emerald-400 font-bold">O(LOG N) SEARCH</span>
              </div>

              {/* Layer Selection Buttons */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[
                  { layer: 2, name: 'Layer 2 (Express)', desc: 'Sparse highway hops' },
                  { layer: 1, name: 'Layer 1 (Coarse)', desc: 'Medium density routing' },
                  { layer: 0, name: 'Layer 0 (Dense)', desc: 'Ground truth nodes' },
                ].map((l) => (
                  <button
                    key={l.layer}
                    onClick={() => {
                      setHnswLayer(l.layer);
                      soundEngine.playTone(500 + l.layer * 80, 'sine', 0.08, 0.03);
                    }}
                    className={`p-2 rounded-xl text-left border transition-all ${
                      hnswLayer === l.layer
                        ? 'bg-fuchsia-950/80 border-fuchsia-500 text-fuchsia-200'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <div className="text-[10px] font-mono font-bold">{l.name}</div>
                    <div className="text-[9px] opacity-75">{l.desc}</div>
                  </button>
                ))}
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center justify-between">
                <span>Active Routing Strategy:</span>
                <span className="text-fuchsia-400 font-bold">
                  {hnswLayer === 2 ? 'Long-Range Geometric Skip' : hnswLayer === 1 ? 'Neighborhood Clustering' : 'Greedy Beam Search'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-fuchsia-50 rounded-xl border border-fuchsia-100 text-xs text-fuchsia-900">
              <strong className="font-bold">Skip-List Graph Principle: </strong>
              Traversing high-level sparse layers avoids calculating distances against millions of candidate vectors.
            </div>
          </div>
        );

      case 'aie_finetuning':
        // LoRA Low-Rank Adaptation Tensor Matrix Decomposition
        const origWeights = 7000; // 7B params
        const loraWeights = (loraRank * 0.42).toFixed(1);
        const compressionRatio = ((1 - Number(loraWeights) / origWeights) * 100).toFixed(2);

        return (
          <div className="space-y-4">
            <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-3 border-b border-slate-800 pb-2">
                <span className="text-pink-400 font-bold">PEFT / LoRA MATRIX DECOMPOSITION</span>
                <span className="text-emerald-400 font-bold">{compressionRatio}% VRAM SAVED</span>
              </div>

              {/* Mathematical Tensor Diagram */}
              <div className="flex items-center justify-center space-x-3 py-2 text-center text-xs font-mono">
                <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
                  <div className="text-slate-400 text-[10px]">W0 (Base Model)</div>
                  <div className="text-slate-200 font-bold mt-0.5">7,000M params</div>
                  <div className="text-[9px] text-rose-400 font-bold">FROZEN</div>
                </div>

                <div className="text-pink-400 font-bold text-lg">+</div>

                <div className="p-3 rounded-xl bg-pink-950/80 border border-pink-700">
                  <div className="text-pink-400 text-[10px]">B × A (Rank r={loraRank})</div>
                  <div className="text-pink-200 font-bold mt-0.5">{loraWeights}M params</div>
                  <div className="text-[9px] text-emerald-400 font-bold">TRAINABLE</div>
                </div>
              </div>

              {/* Interactive Rank Slider */}
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>Adapter Rank (r):</span>
                  <span className="text-pink-400 font-bold">r = {loraRank}</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="64"
                  step="4"
                  value={loraRank}
                  onChange={(e) => {
                    setLoraRank(Number(e.target.value));
                    soundEngine.playTone(320 + Number(e.target.value) * 5, 'sine', 0.04, 0.02);
                  }}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                />
              </div>
            </div>

            <div className="p-3 bg-pink-50 rounded-xl border border-pink-100 text-xs text-pink-900">
              <strong className="font-bold">Intrinsic Low-Rank Dimension: </strong>
              Weight updates during task-specific adaptation reside in a low-dimensional manifold, rendering full 7B parameter backprop unnecessary.
            </div>
          </div>
        );

      case 'aie_agents':
        // Multi-Agent Reasoning Swarm Choreography
        return (
          <div className="space-y-4">
            <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-3 border-b border-slate-800 pb-2">
                <span className="text-indigo-400 font-bold">AUTONOMOUS MULTI-AGENT SWARM</span>
                <span className="text-emerald-400 font-bold">CONSENSUS REACHED</span>
              </div>

              {/* 3 Circular Agents Network */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700">
                  <div className="w-2.5 h-2.5 rounded-full bg-sky-400 mx-auto mb-1 animate-ping" />
                  <div className="font-bold text-sky-300 text-[11px]">PLANNER</div>
                  <div className="text-[9px] text-slate-400 mt-0.5">Task Split</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 mx-auto mb-1 animate-pulse" />
                  <div className="font-bold text-emerald-300 text-[11px]">CODER</div>
                  <div className="text-[9px] text-slate-400 mt-0.5">Execution</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400 mx-auto mb-1 animate-pulse" />
                  <div className="font-bold text-amber-300 text-[11px]">CRITIC</div>
                  <div className="text-[9px] text-slate-400 mt-0.5">Verification</div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Reflection Feedback Loop:</span>
                <span className="text-indigo-400 font-bold">Round #2 Verified</span>
              </div>
            </div>

            <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 text-xs text-indigo-900">
              <strong className="font-bold">Autonomous Verification: </strong>
              Decoupling execution from evaluation prevents compounding hallucinations and guarantees self-healing code synthesis.
            </div>
          </div>
        );

      case 'aie_serving':
      default:
        // vLLM PagedAttention KV Cache Allocation
        return (
          <div className="space-y-4">
            <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-3 border-b border-slate-800 pb-2">
                <span className="text-purple-400 font-bold">vLLM PAGED-ATTENTION MEMORY MAP</span>
                <span className="text-emerald-400 font-bold">4.2x BATCH HEADROOM</span>
              </div>

              {/* Memory Block Allocation Grid */}
              <div className="grid grid-cols-6 gap-1.5 p-2 bg-slate-950 rounded-xl border border-slate-800">
                {Array.from({ length: 18 }).map((_, i) => {
                  const isAllocated = (i + tick) % 3 !== 0;
                  return (
                    <div
                      key={i}
                      className={`h-7 rounded-lg border flex items-center justify-center text-[9px] font-mono ${
                        isAllocated
                          ? 'bg-purple-600/80 border-purple-400 text-white font-bold'
                          : 'bg-slate-800/40 border-slate-700 text-slate-500'
                      }`}
                    >
                      B-{i}
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>VRAM Fragmentation:</span>
                <span className="text-emerald-400 font-bold">0.00% (Virtual Paged)</span>
              </div>
            </div>

            <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 text-xs text-purple-900">
              <strong className="font-bold">Virtual Memory Allocation: </strong>
              PagedAttention mirrors operating system virtual memory pages to eliminate contiguous pre-allocation waste in KV caches.
            </div>
          </div>
        );
    }
  };

  return (
    <aside className="glass-panel p-5 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col h-full space-y-4 select-none">
      {/* Top Category Badge & Nominal Telemetry */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
        <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider border ${stage.badgeColor}`}>
          {stage.badge}
        </span>
        <span className="text-xs text-emerald-700 font-mono font-bold flex items-center space-x-1.5 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Nominal Telemetry</span>
        </span>
      </div>

      {/* Component Title & Analogy */}
      <div>
        <h3 className="text-xl font-bold text-slate-900 leading-tight tracking-tight">
          {stage.title}
        </h3>
        <p className="text-xs font-mono text-slate-500 mt-1">
          {stage.phonetic}
        </p>
      </div>

      {/* View Tabs: Schematic, Telemetry, Sandbox */}
      <div className="flex items-center space-x-1 bg-slate-100/90 p-1 rounded-2xl text-xs font-bold">
        <button
          onClick={() => {
            soundEngine.playTone(480, 'sine', 0.06, 0.02);
            setActiveTab('schematic');
          }}
          className={`flex-1 py-1.5 rounded-xl transition-all flex items-center justify-center space-x-1 ${
            activeTab === 'schematic' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Schematic</span>
        </button>
        <button
          onClick={() => {
            soundEngine.playTone(500, 'sine', 0.06, 0.02);
            setActiveTab('telemetry');
          }}
          className={`flex-1 py-1.5 rounded-xl transition-all flex items-center justify-center space-x-1 ${
            activeTab === 'telemetry' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Telemetry</span>
        </button>
        <button
          onClick={() => {
            soundEngine.playTone(520, 'sine', 0.06, 0.02);
            setActiveTab('sandbox');
          }}
          className={`flex-1 py-1.5 rounded-xl transition-all flex items-center justify-center space-x-1 ${
            activeTab === 'sandbox' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Knobs</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto max-h-[380px] lg:max-h-[420px] pr-1 space-y-4">
        {activeTab === 'schematic' && renderVisualSchematic()}

        {activeTab === 'telemetry' && (
          <div className="space-y-3">
            <LiveTelemetryOscilloscope stage={stage} activeStressMesh={null} />
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
              <div className="font-bold text-slate-800 flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero Buffer Backpressure</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Telemetry signals verify memory consumption is strictly within 65% headroom bounds.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'sandbox' && (
          <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-950 text-xs flex items-center space-x-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-600" />
                <span>{stage.sandbox.label}</span>
              </span>
              <span className="font-mono text-indigo-700 bg-white px-2.5 py-0.5 rounded-lg border border-amber-200 font-bold text-xs shadow-xs">
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

            <div className="flex items-center justify-between text-xs text-amber-900 font-medium pt-1">
              <span>Dynamic Impact: {sandboxResult.metricB}</span>
              <span className="font-bold font-mono px-2 py-0.5 bg-amber-100 rounded text-amber-800 text-[11px]">
                {sandboxResult.status}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Action Triggers */}
      <div className="pt-2 border-t border-slate-200/80 flex flex-col gap-2">
        <button
          onClick={() => {
            soundEngine.playModalOpen();
            onOpenEducationalGuide();
          }}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-xs rounded-2xl shadow transition-all flex items-center justify-center space-x-2"
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Launch Full Interactive Visual Guide & Code</span>
        </button>

        <button
          onClick={() => {
            soundEngine.playAlert();
            onTriggerStressTest(stage.id);
          }}
          className="w-full py-2 bg-slate-900 hover:bg-slate-800 active:scale-98 text-slate-100 font-semibold text-xs rounded-2xl shadow-xs transition-all flex items-center justify-center space-x-2"
        >
          <Zap className="w-3.5 h-3.5 text-rose-400" />
          <span>Inject Chaos & Stress-Test Component</span>
        </button>
      </div>
    </aside>
  );
};
