import React, { useState } from 'react';
import { 
  BarChart3, 
  Sparkles, 
  ArrowLeft, 
  TrendingUp, 
  Layers, 
  BrainCircuit, 
  Database,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface CareerMatrixViewProps {
  onClose: () => void;
}

interface Dimension {
  name: string;
  de: number;
  aie: number;
  desc: string;
}

export const CareerMatrixView: React.FC<CareerMatrixViewProps> = ({ onClose }) => {
  const [activeDimensionIndex, setActiveDimensionIndex] = useState<number | null>(null);

  // User Skill Profile Interactive Assessment
  const [mathProficiency, setMathProficiency] = useState(50);
  const [distributedSystems, setDistributedSystems] = useState(50);
  const [probabilisticComfort, setProbabilisticComfort] = useState(50);

  const dimensions: Dimension[] = [
    {
      name: 'Initial Entry Barrier',
      de: 90,
      aie: 42,
      desc: 'Data Engineering requires steep upfront knowledge of distributed operating systems, network topologies, and transactional ACID guarantees before shipping code. AI Engineering allows rapid Python API prototyping.',
    },
    {
      name: 'Problem Non-Linearity',
      de: 38,
      aie: 96,
      desc: 'Data pipelines are deterministic: row inputs yield verifiable outputs. AI models exhibit emergent probabilistic behavior, hallucinations, and non-deterministic latency paths.',
    },
    {
      name: 'Knowledge Half-Life',
      de: 88,
      aie: 32,
      desc: 'SQL, relational algebra, and partitioning principles have remained stable for 40+ years. AI engineering frameworks, model architectures, and quantization methods turn over every 6-12 months.',
    },
    {
      name: 'Operational Blast Radius',
      de: 95,
      aie: 58,
      desc: 'Corrupting an enterprise gold lakehouse impacts entire corporate balance sheets, payrolls, and regulatory filings. An AI response failure can often be caught by a retry or fallback guardrail.',
    },
    {
      name: 'Math & Hardware Depth',
      de: 62,
      aie: 94,
      desc: 'Industrializing modern AI to 99.9% reliability requires deep mathematical optimization, CUDA kernel memory management, high-dimensional vector spaces, and loss function tuning.',
    },
  ];

  // Radar Chart Mathematics (center at 160, 160, radius = 110)
  const cx = 160;
  const cy = 160;
  const radius = 110;
  const count = dimensions.length;

  const getCoordinates = (index: number, value: number) => {
    const angle = (Math.PI * 2 / count) * index - Math.PI / 2;
    const r = (value / 100) * radius;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    return { x, y };
  };

  const dePolygonPoints = dimensions.map((d, i) => {
    const { x, y } = getCoordinates(i, d.de);
    return `${x},${y}`;
  }).join(' ');

  const aiePolygonPoints = dimensions.map((d, i) => {
    const { x, y } = getCoordinates(i, d.aie);
    return `${x},${y}`;
  }).join(' ');

  // Compute Career Recommendation
  const computeRecommendation = () => {
    const deScore = distributedSystems * 1.5 + (100 - probabilisticComfort);
    const aieScore = mathProficiency * 1.2 + probabilisticComfort * 1.5;

    if (Math.abs(deScore - aieScore) < 25) {
      return {
        title: 'Convergent Systems Architect',
        badge: 'DUAL MASTERY',
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        desc: 'You balance strong fundamentals in distributed systems with mathematical comfort. You are prime for high-impact roles bridging data pipelines with low-latency vector databases and inference systems.',
      };
    } else if (deScore > aieScore) {
      return {
        title: 'Principal Data Engineer',
        badge: 'DETERMINISTIC SYSTEMS',
        color: 'text-sky-700 bg-sky-50 border-sky-200',
        desc: 'You thrive in building robust, fault-tolerant distributed infrastructure, stream processing, and lakehouse storage formats with high transactional certainty.',
      };
    } else {
      return {
        title: 'Applied AI & ML Systems Engineer',
        badge: 'PROBABILISTIC COGNITION',
        color: 'text-purple-700 bg-purple-50 border-purple-200',
        desc: 'You are excited by non-deterministic challenges, fine-tuning adapters (LoRA), multi-agent reasoning graphs, and high-throughput LLM serving optimizations.',
      };
    }
  };

  const recommendation = computeRecommendation();

  return (
    <section className="glass-panel p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <span className="p-1.5 rounded-xl bg-amber-100 text-amber-600">
              <BarChart3 className="w-5 h-5" />
            </span>
            <span>Comparative Discipline Matrix & Career Analytics</span>
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
            Evaluating structural trade-offs between Data Engineering and AI Engineering across initial barriers, problem non-linearity, knowledge half-life, operational blast radius, and mathematical depth.
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

      {/* Main Grid: Radar Chart + Dimensional Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* SVG Radar Chart Column */}
        <div className="lg:col-span-5 glass-card p-5 rounded-3xl border border-slate-200 flex flex-col items-center select-none shadow-xs">
          <div className="w-full flex items-center justify-between text-xs mb-2">
            <div className="flex items-center space-x-2 font-bold text-sky-700">
              <span className="w-3 h-3 rounded-full bg-sky-500" />
              <span>Data Engineering</span>
            </div>
            <div className="flex items-center space-x-2 font-bold text-purple-700">
              <span className="w-3 h-3 rounded-full bg-purple-600" />
              <span>AI Engineering</span>
            </div>
          </div>

          <div className="relative w-[320px] h-[320px]">
            <svg viewBox="0 0 320 320" className="w-full h-full">
              {/* Concentric Grid Rings */}
              {[0.25, 0.5, 0.75, 1.0].map((level) => {
                const points = dimensions.map((_, i) => {
                  const angle = (Math.PI * 2 / count) * i - Math.PI / 2;
                  const r = radius * level;
                  return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
                }).join(' ');
                return (
                  <polygon
                    key={level}
                    points={points}
                    fill="none"
                    stroke="#E2E8F0"
                    strokeWidth="1.2"
                    strokeDasharray={level < 1 ? '3 3' : 'none'}
                  />
                );
              })}

              {/* Radial Axis Lines */}
              {dimensions.map((_, i) => {
                const angle = (Math.PI * 2 / count) * i - Math.PI / 2;
                const x = cx + radius * Math.cos(angle);
                const y = cy + radius * Math.sin(angle);
                return (
                  <line
                    key={i}
                    x1={cx}
                    y1={cy}
                    x2={x}
                    y2={y}
                    stroke="#CBD5E1"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Data Engineering Polygon */}
              <polygon
                points={dePolygonPoints}
                fill="rgba(2, 132, 199, 0.22)"
                stroke="#0284C7"
                strokeWidth="2.5"
              />

              {/* AI Engineering Polygon */}
              <polygon
                points={aiePolygonPoints}
                fill="rgba(124, 58, 237, 0.22)"
                stroke="#7C3AED"
                strokeWidth="2.5"
              />

              {/* Interactive Node Anchors */}
              {dimensions.map((d, i) => {
                const dePos = getCoordinates(i, d.de);
                const aiePos = getCoordinates(i, d.aie);
                const labelPos = getCoordinates(i, 132);

                return (
                  <g key={i}>
                    {/* DE Node */}
                    <circle
                      cx={dePos.x}
                      cy={dePos.y}
                      r="4"
                      fill="#0284C7"
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                      className="cursor-pointer hover:r-6 transition-all"
                      onClick={() => {
                        soundEngine.playTone(450, 'sine', 0.08, 0.03);
                        setActiveDimensionIndex(i);
                      }}
                    />
                    {/* AIE Node */}
                    <circle
                      cx={aiePos.x}
                      cy={aiePos.y}
                      r="4"
                      fill="#7C3AED"
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                      className="cursor-pointer hover:r-6 transition-all"
                      onClick={() => {
                        soundEngine.playTone(550, 'sine', 0.08, 0.03);
                        setActiveDimensionIndex(i);
                      }}
                    />
                    {/* Dimension Label */}
                    <text
                      x={labelPos.x}
                      y={labelPos.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-[9.5px] font-bold font-sans fill-slate-600 hover:fill-slate-900 cursor-pointer"
                      onClick={() => {
                        soundEngine.playTone(500, 'sine', 0.08, 0.03);
                        setActiveDimensionIndex(i);
                      }}
                    >
                      {d.name.split(' ')[0]}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <p className="text-[11px] text-slate-400 mt-2 text-center">
            Click any node or dimension axis to inspect comparative architectural analysis.
          </p>
        </div>

        {/* Dimension Breakdown Cards */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Dimensional Evaluation Breakdown
            </h3>
            <span className="text-xs text-slate-400">5 Architectural Axes</span>
          </div>

          <div className="space-y-2.5">
            {dimensions.map((dim, idx) => {
              const isSelected = activeDimensionIndex === idx;
              return (
                <div
                  key={dim.name}
                  onClick={() => {
                    soundEngine.playTone(480 + idx * 30, 'sine', 0.08, 0.03);
                    setActiveDimensionIndex(isSelected ? null : idx);
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/70 border-indigo-300 shadow-sm'
                      : 'bg-white border-slate-200/90 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                    <span className="text-slate-900">{dim.name}</span>
                    <div className="flex items-center space-x-3 text-[11px] font-mono">
                      <span className="text-sky-700">DE: {dim.de}%</span>
                      <span className="text-slate-300">|</span>
                      <span className="text-purple-700">AIE: {dim.aie}%</span>
                    </div>
                  </div>

                  {/* Comparative Progress Bars */}
                  <div className="grid grid-cols-2 gap-2 my-2">
                    <div className="bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-sky-500 h-full rounded-full" style={{ width: `${dim.de}%` }} />
                    </div>
                    <div className="bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-purple-500 h-full rounded-full" style={{ width: `${dim.aie}%` }} />
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {dim.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Interactive Career Roadmap Assessment */}
      <div className="pt-4 border-t border-slate-200">
        <div className="p-5 bg-slate-50 rounded-3xl border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Personalized Career Specialization Recommender</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Adjust your personal strengths to see where you sit on the Data vs. AI engineering spectrum.
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${recommendation.color}`}>
              {recommendation.badge}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1.5 bg-white p-3 rounded-2xl border border-slate-200/80">
              <div className="flex justify-between font-bold text-slate-700">
                <span>Distributed Systems</span>
                <span className="font-mono text-sky-600">{distributedSystems}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={distributedSystems}
                onChange={(e) => setDistributedSystems(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
              />
            </div>

            <div className="space-y-1.5 bg-white p-3 rounded-2xl border border-slate-200/80">
              <div className="flex justify-between font-bold text-slate-700">
                <span>Math & Tensor Geometry</span>
                <span className="font-mono text-purple-600">{mathProficiency}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={mathProficiency}
                onChange={(e) => setMathProficiency(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
            </div>

            <div className="space-y-1.5 bg-white p-3 rounded-2xl border border-slate-200/80">
              <div className="flex justify-between font-bold text-slate-700">
                <span>Tolerance for Non-Determinism</span>
                <span className="font-mono text-emerald-600">{probabilisticComfort}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={probabilisticComfort}
                onChange={(e) => setProbabilisticComfort(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>
          </div>

          {/* Recommendation Output Card */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm text-slate-900">Recommended Path: {recommendation.title}</span>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                {recommendation.desc}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
