import React, { useState, useEffect } from 'react';
import { 
  X, 
  BookOpen, 
  Code2, 
  Binary, 
  CheckSquare, 
  HelpCircle, 
  Copy, 
  Check, 
  ChevronLeft, 
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  Zap
} from 'lucide-react';
import { CurriculumStage } from '../types/simulation';
import { soundEngine } from '../utils/soundEngine';

interface EducationalPopupProps {
  stage: CurriculumStage;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  totalStages: number;
  currentStageIndex: number;
}

export const EducationalPopup: React.FC<EducationalPopupProps> = ({
  stage,
  isOpen,
  onClose,
  onNext,
  onPrev,
  totalStages,
  currentStageIndex,
}) => {
  const [activeTab, setActiveTab] = useState<'blueprint' | 'code' | 'math' | 'checklist' | 'quiz'>('blueprint');
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [hasAnsweredQuiz, setHasAnsweredQuiz] = useState(false);

  useEffect(() => {
    setSelectedQuizAnswer(null);
    setHasAnsweredQuiz(false);
    setCopiedCode(false);
  }, [stage.id]);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(stage.blueprint.code);
    setCopiedCode(true);
    soundEngine.playTone(600, 'sine', 0.1, 0.04);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleQuizSelect = (idx: number) => {
    if (hasAnsweredQuiz) return;
    setSelectedQuizAnswer(idx);
    setHasAnsweredQuiz(true);
    if (idx === stage.quiz.correctIndex) {
      soundEngine.playChime();
    } else {
      soundEngine.playTone(280, 'sawtooth', 0.2, 0.05);
    }
  };

  const resetQuizForStage = () => {
    setSelectedQuizAnswer(null);
    setHasAnsweredQuiz(false);
  };

  const handlePrev = () => {
    resetQuizForStage();
    onPrev();
  };

  const handleNext = () => {
    resetQuizForStage();
    onNext();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden text-slate-800"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider border ${stage.badgeColor}`}>
              {stage.badge}
            </span>
            <span className="text-xs font-mono text-slate-500 font-bold">
              Milestone {currentStageIndex + 1} of {totalStages}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button 
              onClick={handlePrev} 
              disabled={currentStageIndex === 0}
              className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-all"
              title="Previous Stage"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={handleNext}
              disabled={currentStageIndex === totalStages - 1}
              className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-all"
              title="Next Stage"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => {
                soundEngine.playTone(400, 'square', 0.08, 0.03);
                onClose();
              }}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all ml-2"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Title Bar */}
        <div className="px-6 pt-4 pb-2">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {stage.title}
          </h2>
          <p className="text-xs font-mono text-slate-500 mt-1">
            {stage.phonetic}
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-slate-100 flex items-center space-x-1 sm:space-x-3 overflow-x-auto text-xs font-bold py-1">
          <button
            onClick={() => {
              soundEngine.playTone(500, 'sine', 0.08, 0.03);
              setActiveTab('blueprint');
            }}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'blueprint'
                ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Architecture & Blueprint</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playTone(540, 'sine', 0.08, 0.03);
              setActiveTab('code');
            }}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'code'
                ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Production Code</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playTone(580, 'sine', 0.08, 0.03);
              setActiveTab('math');
            }}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'math'
                ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Binary className="w-3.5 h-3.5" />
            <span>Formulation & Math</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playTone(620, 'sine', 0.08, 0.03);
              setActiveTab('checklist');
            }}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'checklist'
                ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Production Checklist</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playTone(660, 'sine', 0.08, 0.03);
              setActiveTab('quiz');
            }}
            className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'quiz'
                ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Knowledge Check</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 p-6 overflow-y-auto max-h-[58vh] space-y-5">
          {/* TAB 1: BLUEPRINT */}
          {activeTab === 'blueprint' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-1.5 flex items-center space-x-1.5">
                  <Zap className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Mechanical Analogy: {stage.analogy}</span>
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                  {stage.intro}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2.5">
                  Core Engineering Mechanics
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {stage.mechanics.map((mech, i) => (
                    <div key={i} className="p-3.5 rounded-2xl border border-slate-200/90 bg-white hover:border-indigo-200 transition-colors space-y-1 shadow-xs">
                      <div className="flex items-center space-x-1.5 font-bold text-xs text-slate-900">
                        <span className="w-2 h-2 rounded-full bg-indigo-600" />
                        <span>{mech.title}</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {mech.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Engineering Specs Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <span className="text-slate-400 block text-[10px] font-mono">LATENCY PROFILE</span>
                  <span className="font-bold text-slate-800">{stage.specs.latency}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <span className="text-slate-400 block text-[10px] font-mono">AVAILABILITY SLA</span>
                  <span className="font-bold text-slate-800">{stage.specs.availability}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <span className="text-slate-400 block text-[10px] font-mono">CORE PROTOCOL</span>
                  <span className="font-bold text-slate-800">{stage.specs.protocol}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <span className="text-slate-400 block text-[10px] font-mono">RESOURCE PROFILE</span>
                  <span className="font-bold text-slate-800">{stage.specs.memoryProfile}</span>
                </div>
              </div>

              {/* Failure Risk Alert Box */}
              <div className="p-4 bg-rose-50/80 rounded-2xl border border-rose-200 text-xs space-y-1.5">
                <div className="flex items-center space-x-1.5 text-rose-900 font-bold">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>Production Failure Mode: {stage.failure.title}</span>
                </div>
                <p className="text-rose-800 leading-relaxed">
                  {stage.failure.description}
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTION CODE */}
          {activeTab === 'code' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-slate-900 text-slate-200 px-4 py-2.5 rounded-t-2xl border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="font-mono text-xs text-slate-300 ml-2 font-semibold">
                    {stage.blueprint.filename}
                  </span>
                </div>

                <button
                  onClick={handleCopyCode}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 flex items-center space-x-1.5 transition-colors"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>

              <pre className="p-4 bg-slate-950 text-slate-100 rounded-b-2xl overflow-x-auto text-xs font-mono leading-relaxed max-h-[380px] shadow-inner">
                <code>{stage.blueprint.code}</code>
              </pre>

              <p className="text-xs text-slate-500 italic">
                * Production pattern tested for enterprise resilience and fault-tolerant cloud execution.
              </p>
            </div>
          )}

          {/* TAB 3: MATH & FORMULATION */}
          {activeTab === 'math' && (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50/70 rounded-2xl border border-indigo-100 space-y-2">
                <h4 className="text-xs font-bold uppercase text-indigo-900 tracking-wider">
                  Mathematical Representation
                </h4>
                <div className="p-3 bg-white rounded-xl border border-indigo-200/80 font-mono text-xs sm:text-sm text-indigo-950 shadow-xs">
                  {stage.math}
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-2">
                <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                  Algorithmic Intuition & Formal Proof
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  {stage.mathExplanation}
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: PRODUCTION CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                Production Readiness Verification Protocol
              </h4>
              <div className="space-y-2.5">
                {stage.checklist.map((item, idx) => (
                  <div key={idx} className="flex items-start space-x-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs">
                    <span className="w-5 h-5 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 mt-0.5">
                      ✓
                    </span>
                    <span className="text-slate-700 leading-relaxed font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: KNOWLEDGE CHECK */}
          {activeTab === 'quiz' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800">
                  Concept Mastery Challenge
                </span>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  {stage.quiz.question}
                </h3>
              </div>

              <div className="space-y-2">
                {stage.quiz.options.map((option, idx) => {
                  let btnStyle = 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700';
                  if (hasAnsweredQuiz) {
                    if (idx === stage.quiz.correctIndex) {
                      btnStyle = 'border-emerald-400 bg-emerald-50 text-emerald-900 font-semibold';
                    } else if (idx === selectedQuizAnswer) {
                      btnStyle = 'border-rose-400 bg-rose-50 text-rose-900';
                    } else {
                      btnStyle = 'border-slate-100 bg-slate-50 text-slate-400 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleQuizSelect(idx)}
                      disabled={hasAnsweredQuiz}
                      className={`w-full text-left p-3.5 rounded-2xl border text-xs sm:text-sm transition-all flex items-start space-x-3 ${btnStyle}`}
                    >
                      <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="leading-relaxed">{option}</span>
                    </button>
                  );
                })}
              </div>

              {hasAnsweredQuiz && (
                <div className={`p-4 rounded-2xl border text-xs space-y-1.5 animate-in fade-in duration-300 ${
                  selectedQuizAnswer === stage.quiz.correctIndex
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                    : 'bg-rose-50/80 border-rose-200 text-rose-950'
                }`}>
                  <div className="font-bold flex items-center space-x-1.5">
                    {selectedQuizAnswer === stage.quiz.correctIndex ? (
                      <>
                        <span className="text-emerald-600 text-sm">🎉</span>
                        <span>Correct! Outstanding Architectural Comprehension.</span>
                      </>
                    ) : (
                      <>
                        <span className="text-rose-600 text-sm">❌</span>
                        <span>Incorrect. Review Pedagogical Explanation:</span>
                      </>
                    )}
                  </div>
                  <p className="leading-relaxed opacity-90">
                    {stage.quiz.explanation}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Enterprise Cognitive Twin Interactive Curriculum</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all active:scale-95"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
