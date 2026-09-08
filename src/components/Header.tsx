import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Volume2, 
  VolumeX, 
  Download, 
  BookMarked, 
  Cpu, 
  Flame, 
  BarChart3, 
  Box, 
  Layers
} from 'lucide-react';
import { curriculumStages } from '../data/curriculumData';
import { ViewMode } from '../types/simulation';
import { soundEngine } from '../utils/soundEngine';

interface HeaderProps {
  currentView: ViewMode;
  onChangeView: (view: ViewMode) => void;
  onSelectStage: (idx: number) => void;
  onOpenGlossary: () => void;
  onOpenExport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onChangeView,
  onSelectStage,
  onOpenGlossary,
  onOpenExport,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(soundEngine.isEnabled());
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleAudio = () => {
    const next = soundEngine.toggle();
    setAudioEnabled(next);
  };

  const handleSearchSelect = (idx: number) => {
    soundEngine.playTone(520, 'sine', 0.1, 0.05);
    onSelectStage(idx);
    onChangeView('spatial');
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const searchResults = searchQuery.trim() === '' ? [] : curriculumStages.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      s.intro.toLowerCase().includes(q) ||
      s.mechanics.some((m) => m.title.toLowerCase().includes(q) || m.desc.toLowerCase().includes(q))
    );
  });

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/80 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Subtitle */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onChangeView('spatial')}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-sm ring-2 ring-indigo-100">
              ❖
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-extrabold text-slate-900 tracking-tight leading-none">
                  DATA & AI COGNITIVE TWIN
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  v4.0 3D SPATIAL
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Whole-to-Part Mechanical 3D Learning Architecture
              </p>
            </div>
          </div>

          {/* Mobile Audio toggle */}
          <div className="flex items-center space-x-1.5 md:hidden">
            <button
              onClick={handleToggleAudio}
              className="p-2 text-slate-500 hover:text-slate-800 rounded-xl bg-slate-100 text-xs"
              title="Toggle Audio Feedback"
            >
              {audioEnabled ? <Volume2 className="w-4 h-4 text-indigo-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>
          </div>
        </div>

        {/* Global Concept Search */}
        <div ref={searchRef} className="relative w-full md:w-72">
          <div className="relative">
            <input
              type="text"
              placeholder="Search concepts (CDC, LoRA, HNSW)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              className="w-full px-3.5 py-1.5 pl-8 text-xs bg-slate-100/90 hover:bg-white focus:bg-white border border-slate-200 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800 placeholder:text-slate-400"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
          </div>

          {/* Search Dropdown */}
          {isSearchOpen && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 glass-panel rounded-2xl shadow-xl border border-slate-200 max-h-72 overflow-y-auto z-50 p-1.5 divide-y divide-slate-100 animate-in fade-in duration-150">
              {searchResults.map((item) => {
                const idx = curriculumStages.findIndex((s) => s.id === item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSearchSelect(idx)}
                    className="p-2.5 hover:bg-indigo-50/80 cursor-pointer rounded-xl transition-colors text-xs flex flex-col"
                  >
                    <span className="font-bold text-slate-900 flex items-center justify-between">
                      <span>{item.title}</span>
                      <span className="text-[10px] font-mono font-bold text-indigo-600">{item.badge}</span>
                    </span>
                    <span className="text-[11px] text-slate-500 truncate mt-0.5">
                      {item.intro}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Global View Selector Navigation */}
        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <nav className="flex items-center space-x-1 bg-slate-200/70 p-1 rounded-2xl text-xs font-semibold whitespace-nowrap">
            <button
              onClick={() => {
                soundEngine.playTone(480, 'sine', 0.08, 0.03);
                onChangeView('spatial');
              }}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1.5 ${
                currentView === 'spatial'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Box className="w-3.5 h-3.5 text-indigo-600" />
              <span>3D Digital Twin</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playTone(520, 'sine', 0.08, 0.03);
                onChangeView('topology');
              }}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1.5 ${
                currentView === 'topology'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-sky-600" />
              <span>Topology</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playTone(560, 'sine', 0.08, 0.03);
                onChangeView('stresstest');
              }}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1.5 ${
                currentView === 'stresstest'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-rose-700'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-rose-500" />
              <span>Stress Lab</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playTone(600, 'sine', 0.08, 0.03);
                onChangeView('matrix');
              }}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1.5 ${
                currentView === 'matrix'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-amber-700'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-amber-500" />
              <span>Career Matrix</span>
            </button>
          </nav>

          {/* Lexicon / Glossary Modal Launcher */}
          <button
            onClick={() => {
              soundEngine.playModalOpen();
              onOpenGlossary();
            }}
            className="p-2 text-slate-600 hover:text-slate-900 rounded-xl bg-slate-200/70 hover:bg-white text-xs items-center transition-all flex space-x-1"
            title="Searchable Technical Glossary"
          >
            <BookMarked className="w-4 h-4 text-indigo-600" />
            <span className="hidden xl:inline font-bold">Lexicon</span>
          </button>

          {/* Export Report Launcher */}
          <button
            onClick={() => {
              soundEngine.playModalOpen();
              onOpenExport();
            }}
            className="p-2 text-slate-600 hover:text-slate-900 rounded-xl bg-slate-200/70 hover:bg-white text-xs items-center transition-all flex space-x-1"
            title="Export Architecture Report & Manifest"
          >
            <Download className="w-4 h-4 text-slate-700" />
            <span className="hidden xl:inline font-bold">Export</span>
          </button>

          {/* Audio Synthesizer Toggle */}
          <button
            onClick={handleToggleAudio}
            className="hidden md:flex p-2 text-slate-600 hover:text-slate-900 rounded-xl bg-slate-200/70 hover:bg-white text-xs items-center transition-all"
            title="Toggle Spatial Audio Feedback"
          >
            {audioEnabled ? <Volume2 className="w-4 h-4 text-indigo-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>
        </div>
      </div>
    </header>
  );
};
