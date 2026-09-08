export type SubsystemType = 'de' | 'aie' | 'bridge';

export interface CodeBlueprint {
  language: string;
  title: string;
  filename: string;
  code: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface CurriculumStage {
  id: string;
  badge: string;
  badgeColor: string;
  subsystem: SubsystemType;
  title: string;
  phonetic: string;
  analogy: string;
  intro: string;
  mechanics: Array<{ title: string; desc: string }>;
  math: string;
  mathExplanation: string;
  blueprint: CodeBlueprint;
  failure: {
    title: string;
    description: string;
    risk: 'CRITICAL' | 'HIGH RISK' | 'SILENT DEGRADATION';
  };
  sandbox: {
    label: string;
    base: number;
    unit: string;
    min: number;
    max: number;
    defaultVal: number;
    calc: (val: number) => { metricA: string; metricB: string; status: string };
  };
  checklist: string[];
  quiz: QuizQuestion;
  camPos: { x: number; y: number; z: number };
  targetPos: { x: number; y: number; z: number };
  meshName: string;
  specs: {
    latency: string;
    availability: string;
    protocol: string;
    memoryProfile: string;
  };
}

export interface StressScenario {
  id: string;
  title: string;
  subsystem: SubsystemType;
  subsystemLabel: string;
  riskBadge: string;
  riskClass: string;
  description: string;
  telemetryAlert: string;
  breakdown: string;
  remediation: string;
  codeFix: string;
  affectedMesh: string;
}

export interface GlossaryItem {
  id: string;
  term: string;
  category: 'Data Engineering' | 'AI Engineering' | 'Infrastructure' | 'Algorithms';
  pronunciation?: string;
  definition: string;
  enterpriseContext: string;
  relatedStageId?: string;
}

export type ViewMode = 'spatial' | 'topology' | 'stresstest' | 'matrix';
