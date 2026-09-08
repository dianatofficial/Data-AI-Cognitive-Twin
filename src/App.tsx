import React, { useState } from 'react';
import { curriculumStages } from './data/curriculumData';
import { stressScenarios } from './data/stressScenarios';
import { ViewMode, StressScenario } from './types/simulation';
import { Header } from './components/Header';
import { SpatialViewport } from './components/SpatialViewport';
import { CurriculumNav } from './components/CurriculumNav';
import { VisualArchitectureSchematic } from './components/VisualArchitectureSchematic';
import { EducationalPopup } from './components/EducationalPopup';
import { StressTestingLab } from './components/StressTestingLab';
import { CareerMatrixView } from './components/CareerMatrixView';
import { ArchitectureTopologyView } from './components/ArchitectureTopologyView';
import { GlossaryModal } from './components/GlossaryModal';
import { ExportReportModal } from './components/ExportReportModal';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('spatial');
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0);
  const [isWireframe, setIsWireframe] = useState<boolean>(false);

  // Modals
  const [isEducationalPopupOpen, setIsEducationalPopupOpen] = useState<boolean>(false);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);

  // Stress testing active state on 3D twin
  const [activeStressScenario, setActiveStressScenario] = useState<StressScenario | null>(null);
  const [activeStressMesh, setActiveStressMesh] = useState<string | null>(null);
  const [activeStressColor, setActiveStressColor] = useState<string | null>(null);

  const currentStage = curriculumStages[currentStageIndex];

  // Stage selection
  const handleSelectStage = (idx: number) => {
    setCurrentStageIndex(idx);
  };

  // Trigger stress test from inspector drawer or direct action
  const handleTriggerStressTestFromDrawer = (stageId: string) => {
    let scenarioToRun = stressScenarios[0];
    if (stageId === 'de_transformation') scenarioToRun = stressScenarios[0];
    else if (stageId === 'aie_serving') scenarioToRun = stressScenarios[1];
    else if (stageId === 'bridge_featurestore') scenarioToRun = stressScenarios[2];
    else if (stageId === 'de_orchestration') scenarioToRun = stressScenarios[3];
    else if (stageId === 'aie_agents') scenarioToRun = stressScenarios[4];

    setActiveStressScenario(scenarioToRun);
    setActiveStressMesh(scenarioToRun.affectedMesh);
    setActiveStressColor(scenarioToRun.id === 'temporal_leakage' ? 'amber' : 'red');
    setCurrentView('stresstest');
  };

  // Scenario selection inside Stress Lab
  const handleSelectStressScenario = (scenario: StressScenario) => {
    setActiveStressScenario(scenario);
    setActiveStressMesh(scenario.affectedMesh);
    setActiveStressColor(scenario.id === 'temporal_leakage' ? 'amber' : 'red');
  };

  // Apply remediation fix
  const handleApplyRemediation = () => {
    setActiveStressMesh(null);
    setActiveStressColor(null);
  };

  return (
    <div className="bg-slate-50 text-slate-800 font-sans min-h-screen flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <Header
        currentView={currentView}
        onChangeView={(view) => setCurrentView(view)}
        onSelectStage={handleSelectStage}
        onOpenGlossary={() => setIsGlossaryOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 flex flex-col space-y-6">
        {/* SPATIAL DIGITAL TWIN VIEW */}
        {currentView === 'spatial' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* 3D Canvas & Timeline Column (8 cols) */}
            <div className="lg:col-span-8 flex flex-col space-y-4">
              <SpatialViewport
                currentStageIdx={currentStageIndex}
                onSelectStage={handleSelectStage}
                activeStressMesh={activeStressMesh}
                activeStressColor={activeStressColor}
                isWireframe={isWireframe}
                onToggleWireframe={() => setIsWireframe(!isWireframe)}
              />

              {/* Step-by-Step Curriculum Navigation */}
              <CurriculumNav
                currentIndex={currentStageIndex}
                onSelectIndex={handleSelectStage}
                onOpenEducationalGuide={() => setIsEducationalPopupOpen(true)}
              />
            </div>

            {/* Visual Abstract Schematic & Telemetry Lab (4 cols) */}
            <div className="lg:col-span-4">
              <VisualArchitectureSchematic
                stage={currentStage}
                onOpenEducationalGuide={() => setIsEducationalPopupOpen(true)}
                onTriggerStressTest={handleTriggerStressTestFromDrawer}
              />
            </div>
          </div>
        )}

        {/* 2D ARCHITECTURE TOPOLOGY VIEW */}
        {currentView === 'topology' && (
          <ArchitectureTopologyView
            currentStageIdx={currentStageIndex}
            onSelectStage={(idx) => {
              handleSelectStage(idx);
              setCurrentView('spatial');
            }}
            onClose={() => setCurrentView('spatial')}
            onOpenDeepGuide={() => setIsEducationalPopupOpen(true)}
          />
        )}

        {/* STRESS TESTING LAB VIEW */}
        {currentView === 'stresstest' && (
          <StressTestingLab
            activeScenario={activeStressScenario}
            onSelectScenario={handleSelectStressScenario}
            onApplyFix={handleApplyRemediation}
            onClose={() => setCurrentView('spatial')}
          />
        )}

        {/* CAREER MATRIX & RADAR ANALYTICS VIEW */}
        {currentView === 'matrix' && (
          <CareerMatrixView onClose={() => setCurrentView('spatial')} />
        )}
      </main>

      {/* Educational Deep Guide Popup Modal */}
      <EducationalPopup
        stage={currentStage}
        isOpen={isEducationalPopupOpen}
        onClose={() => setIsEducationalPopupOpen(false)}
        onNext={() => setCurrentStageIndex((prev) => Math.min(curriculumStages.length - 1, prev + 1))}
        onPrev={() => setCurrentStageIndex((prev) => Math.max(0, prev - 1))}
        totalStages={curriculumStages.length}
        currentStageIndex={currentStageIndex}
      />

      {/* Glossary Lexicon Modal */}
      <GlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
        onJumpToStage={(idx) => {
          handleSelectStage(idx);
          setCurrentView('spatial');
        }}
      />

      {/* Export Report / Audit Modal */}
      <ExportReportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />

      {/* Clean Footer */}
      <footer className="w-full glass-panel border-t border-slate-200/80 py-4 px-6 text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-700">Data & AI Cognitive Twin</span>
            <span>• Spatial 3D Learning Architecture</span>
          </div>
          <div className="flex items-center space-x-4 text-slate-400 text-[11px]">
            <span>Powered by Three.js, React 19 & Vazirmatn Typography</span>
            <span>• Editorial Light Metaphor</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
