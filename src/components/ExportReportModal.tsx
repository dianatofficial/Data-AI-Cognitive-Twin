import React, { useState } from 'react';
import { X, Download, Printer, Check, FileJson, FileText } from 'lucide-react';
import { curriculumStages } from '../data/curriculumData';
import { soundEngine } from '../utils/soundEngine';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({ isOpen, onClose }) => {
  const [downloaded, setDownloaded] = useState(false);

  if (!isOpen) return null;

  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(curriculumStages, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'enterprise-data-ai-cognitive-twin-spec.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setDownloaded(true);
    soundEngine.playChime();
    setTimeout(() => setDownloaded(false), 2500);
  };

  const handlePrint = () => {
    soundEngine.playTone(550, 'sine', 0.1, 0.04);
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden text-slate-800">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className="p-1.5 rounded-xl bg-indigo-100 text-indigo-700">
              <Download className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-none">
                Export Enterprise Architecture Specification
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Download blueprints, mathematical models, code implementations, and SLAs
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playTone(400, 'square', 0.08, 0.03);
              onClose();
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center space-x-1.5">
              <FileJson className="w-4 h-4 text-indigo-600" />
              <span>Full System Twin JSON Manifest</span>
            </h4>
            <p className="text-slate-600 leading-relaxed">
              Export all 10 architectural subassemblies, including mathematical formulas, production Python/Spark/PyTorch/vLLM code snippets, production readiness checklists, and failure scenarios.
            </p>
            <div className="pt-2">
              <button
                onClick={handleDownloadJSON}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all flex items-center space-x-2 shadow-xs active:scale-95"
              >
                {downloaded ? <Check className="w-4 h-4 text-emerald-300" /> : <Download className="w-4 h-4" />}
                <span>{downloaded ? 'Downloaded Manifest!' : 'Download JSON Specification'}</span>
              </button>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center space-x-1.5">
              <Printer className="w-4 h-4 text-indigo-600" />
              <span>Printable Architecture Audit Summary</span>
            </h4>
            <p className="text-slate-600 leading-relaxed">
              Generate a clean, print-ready or PDF export document for executive architectural review, compliance audits, and team onboarding.
            </p>
            <div className="pt-2">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all flex items-center space-x-2 shadow-xs active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span>Open Print / PDF Preview</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
