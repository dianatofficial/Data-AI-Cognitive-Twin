import React, { useState } from 'react';
import { X, Search, BookMarked, ArrowRight, Sparkles } from 'lucide-react';
import { glossaryItems } from '../data/glossaryData';
import { curriculumStages } from '../data/curriculumData';
import { soundEngine } from '../utils/soundEngine';

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJumpToStage: (stageIndex: number) => void;
}

export const GlossaryModal: React.FC<GlossaryModalProps> = ({
  isOpen,
  onClose,
  onJumpToStage,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  if (!isOpen) return null;

  const categories = ['All', 'Data Engineering', 'AI Engineering', 'Infrastructure', 'Algorithms'];

  const filteredItems = glossaryItems.filter((item) => {
    const matchesSearch =
      item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.enterpriseContext.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden text-slate-800">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-2.5">
            <span className="p-1.5 rounded-xl bg-indigo-100 text-indigo-700">
              <BookMarked className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-none">
                Enterprise Terminology & Technical Lexicon
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Comprehensive dictionary of mission-critical Data and AI Engineering terminology
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playTone(400, 'square', 0.08, 0.03);
              onClose();
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="p-6 border-b border-slate-100 space-y-3 bg-white">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search concepts (e.g. CDC, Parquet, LoRA, HNSW, PagedAttention)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white font-medium text-slate-800 placeholder:text-slate-400 transition-all"
            />
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs font-semibold">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  soundEngine.playTone(500, 'sine', 0.05, 0.02);
                  setActiveCategory(cat);
                }}
                className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-indigo-600 text-white shadow-xs font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Glossary Items List */}
        <div className="flex-1 p-6 overflow-y-auto max-h-[58vh] space-y-3.5">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => {
              const matchedIdx = item.relatedStageId
                ? curriculumStages.findIndex((s) => s.id === item.relatedStageId)
                : -1;

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-indigo-200 transition-all space-y-2 shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-bold text-slate-900">{item.term}</h3>
                      {item.pronunciation && (
                        <span className="text-[11px] font-mono text-slate-400">
                          {item.pronunciation}
                        </span>
                      )}
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200 self-start sm:self-auto">
                      {item.category}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">
                    {item.definition}
                  </p>

                  <div className="p-2.5 bg-indigo-50/60 rounded-xl border border-indigo-100 text-[11px] text-indigo-950 leading-relaxed font-medium">
                    <strong className="text-indigo-900">Enterprise Context: </strong>
                    {item.enterpriseContext}
                  </div>

                  {matchedIdx !== -1 && (
                    <div className="pt-1 flex justify-end">
                      <button
                        onClick={() => {
                          soundEngine.playTone(550, 'sine', 0.1, 0.04);
                          onClose();
                          onJumpToStage(matchedIdx);
                        }}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                      >
                        <span>Focus in 3D Spatial Twin</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              No matching technical terms found for "{searchTerm}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
