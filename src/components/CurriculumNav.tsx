import React, { useEffect, useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, Sparkles, BookOpen } from 'lucide-react';
import { curriculumStages } from '../data/curriculumData';
import { soundEngine } from '../utils/soundEngine';

interface CurriculumNavProps {
  currentIndex: number;
  onSelectIndex: (idx: number) => void;
  onOpenEducationalGuide: () => void;
}

export const CurriculumNav: React.FC<CurriculumNavProps> = ({
  currentIndex,
  onSelectIndex,
  onOpenEducationalGuide,
}) => {
  const [isTourPlaying, setIsTourPlaying] = useState(false);
  const pillsContainerRef = useRef<HTMLDivElement>(null);
  const currentIndexRef = useRef(currentIndex);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  // Guided Tour Auto-Advance
  useEffect(() => {
    if (!isTourPlaying) return;
    const interval = setInterval(() => {
      const nextIdx = (currentIndexRef.current + 1) % curriculumStages.length;
      soundEngine.playStep(nextIdx);
      onSelectIndex(nextIdx);
    }, 7000);

    return () => clearInterval(interval);
  }, [isTourPlaying, onSelectIndex]);

  // Scroll active pill into view
  useEffect(() => {
    const activeEl = document.getElementById(`step-pill-${currentIndex}`);
    if (activeEl && pillsContainerRef.current) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [currentIndex]);

  const handlePrev = () => {
    soundEngine.playTone(380, 'sine', 0.08, 0.04);
    if (currentIndex > 0) {
      onSelectIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    soundEngine.playTone(480, 'sine', 0.08, 0.04);
    if (currentIndex < curriculumStages.length - 1) {
      onSelectIndex(currentIndex + 1);
    }
  };

  const toggleTour = () => {
    const next = !isTourPlaying;
    setIsTourPlaying(next);
    soundEngine.playTone(next ? 600 : 350, 'triangle', 0.1, 0.04);
  };

  const progressPercent = Math.round(((currentIndex + 1) / curriculumStages.length) * 100);

  return (
    <div className="glass-panel p-4 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <span>🧭 Interactive Step-by-Step Curriculum</span>
              <span className="text-[11px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                Milestone {currentIndex + 1} / {curriculumStages.length} ({progressPercent}%)
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Click any milestone node to execute Bezier camera zoom and examine live telemetry
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Guided Tour Auto Player */}
          <button
            onClick={toggleTour}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 border ${
              isTourPlaying
                ? 'bg-amber-500 text-white border-amber-600 animate-pulse'
                : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200 shadow-xs'
            }`}
            title="Autoplay Guided Step-by-Step Tour"
          >
            {isTourPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-amber-600" />}
            <span className="hidden sm:inline">{isTourPlaying ? 'Pause Tour' : 'Autoplay Tour'}</span>
          </button>

          {/* Deep Educational Guide Modal Launcher */}
          <button
            onClick={() => {
              soundEngine.playModalOpen();
              onOpenEducationalGuide();
            }}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-all flex items-center space-x-1.5 shadow-xs active:scale-95"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Deep Guide</span>
          </button>

          {/* Prev / Next buttons */}
          <div className="flex items-center space-x-1">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none text-slate-700 transition-all border border-slate-200"
              title="Previous Step"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex === curriculumStages.length - 1}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none text-white text-xs font-bold transition-all shadow-sm flex items-center space-x-1"
              title="Next Step"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-sky-500 via-emerald-500 to-purple-600 transition-all duration-300 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Horizontal Step Pills Bar */}
      <div
        ref={pillsContainerRef}
        className="flex items-center space-x-2 overflow-x-auto pb-1 pt-1 scroll-smooth"
      >
        {curriculumStages.map((stage, idx) => {
          const isSelected = idx === currentIndex;
          const dotColor =
            stage.subsystem === 'de'
              ? 'bg-sky-500'
              : stage.subsystem === 'aie'
              ? 'bg-purple-500'
              : 'bg-emerald-500';

          return (
            <button
              key={stage.id}
              id={`step-pill-${idx}`}
              onClick={() => {
                soundEngine.playStep(idx);
                onSelectIndex(idx);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-2 border ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-indigo-200 scale-102'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${dotColor}`} />
              <span>{idx + 1}. {stage.title.split('&')[0].trim()}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
