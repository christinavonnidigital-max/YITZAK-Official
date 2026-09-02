import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  ArrowLeft, 
  Search, 
  FileText, 
  Layers, 
  CheckSquare, 
  ShieldCheck, 
  Award, 
  Clock, 
  Sparkles, 
  AlertCircle,
  ListTodo,
  Workflow
} from 'lucide-react';
import AppIcon from './AppIcon';

export interface PhaseTask {
  id: string;
  title: string;
  description: string;
}

export interface ImplementationPhase {
  id: string;
  phaseNumber: string;
  title: string;
  shortTitle: string;
  subtitle: string;
  timeline: string;
  icon: React.ElementType;
  summary: string;
  deliverables: string[];
  tasks: PhaseTask[];
}

export const IMPLEMENTATION_PHASES: ImplementationPhase[] = [
  {
    id: 'discovery',
    phaseNumber: '01',
    title: 'Phase 1: Discovery & Baseline Assessment',
    shortTitle: 'Discovery & Assessment',
    subtitle: 'Baseline Review & Scope Definition',
    timeline: 'Weeks 1–2 (Indicative)',
    icon: Search,
    summary: 'Systematic review of existing operational processes, documentation baselines, workflow bottlenecks, and governance requirements across targeted operational departments.',
    deliverables: ['Operational Baseline Assessment Report', 'Process Hierarchy & Scope Register', 'Governance & Risk Register'],
    tasks: [
      { id: 'p1-t1', title: 'Stakeholder Interviews & Context Review', description: 'Engage department leads to map current operational pain points, expectations, and reporting lines.' },
      { id: 'p1-t2', title: 'As-Is Process Identification', description: 'Document existing end-to-end operational workflows and identify friction points, redundancies, and information gaps.' },
      { id: 'p1-t3', title: 'Operational & Administrative Controls Evaluation', description: 'Review existing departmental oversight rules, internal approval thresholds, and operational recordkeeping mechanisms.' },
      { id: 'p1-t4', title: 'Scope & Milestone Definition', description: 'Establish project scope boundaries, core objectives, and target operational indicators.' },
    ]
  },
  {
    id: 'design',
    phaseNumber: '02',
    title: 'Phase 2: Process Design & SOP Mapping',
    shortTitle: 'Process Design & SOPs',
    subtitle: 'Blueprinting & Governance Framework',
    timeline: 'Weeks 3–5 (Indicative)',
    icon: FileText,
    summary: 'Standardising operational workflows through formal SOP drafting, clear governance frameworks, and practical RACI matrices tailored to your team.',
    deliverables: ['Standardised SOP Playbook', 'RACI Matrix & Approval Gates', 'Governance & Operational Control Plan'],
    tasks: [
      { id: 'p2-t1', title: 'Standard Operating Procedure (SOP) Formulation', description: 'Formulate clear, structured step-by-step SOP documents tailored to each defined operational function.' },
      { id: 'p2-t2', title: 'RACI & Operational Governance Formulation', description: 'Define Responsible, Accountable, Consulted, and Informed roles for every critical workflow.' },
      { id: 'p2-t3', title: 'Internal Quality Control Checkpoints', description: 'Integrate practical verification checkpoints, sign-off thresholds, and error prevention gates.' },
      { id: 'p2-t4', title: 'Applicable Standards & Compliance Alignment', description: 'Align internal procedures with relevant ISO standards, applicable regulatory and scheme requirements, and local statutory obligations.' },
    ]
  },
  {
    id: 'systems',
    phaseNumber: '03',
    title: 'Phase 3: Systems, Workflows & Operational Controls',
    shortTitle: 'Systems & Controls',
    subtitle: 'Workflow Enablement & Tooling Alignment',
    timeline: 'Weeks 6–8 (Indicative)',
    icon: Layers,
    summary: 'Establishing structured operational workflows, documentation repositories, and foundational controls to support daily execution.',
    deliverables: ['Operational Workflow Protocols', 'Authorisation & Control Checklists', 'System Readiness & Validation Notes'],
    tasks: [
      { id: 'p3-t1', title: 'Standardised Administrative & Onboarding Workflows', description: 'Implement structured operational checklists, departmental onboarding guides, and procedural record templates.' },
      { id: 'p3-t2', title: 'Approval Gates & Operational Oversight Controls', description: 'Configure purchase approval paths, operational verification gates, and recurring reconciliation workflows.' },
      { id: 'p3-t3', title: 'Workflow Documentation & Digital Repository Setup', description: 'Organise central document repositories and shared tracking tools for procedural transparency.' },
      { id: 'p3-t4', title: 'Pilot Review & Procedural Walkthroughs', description: 'Run walkthrough sessions across selected operational teams to validate usability before broader rollout.' },
    ]
  },
  {
    id: 'execution',
    phaseNumber: '04',
    title: 'Phase 4: Workforce Enablement & Operational Review',
    shortTitle: 'Enablement & Review',
    subtitle: 'Capacity Building & Process Verification',
    timeline: 'Weeks 9–11 (Indicative)',
    icon: CheckSquare,
    summary: 'Guiding process owners, facilitating practical workforce enablement on updated procedures, and conducting operational reviews.',
    deliverables: ['Training Records and Certificates of Completion', 'Operational Review & Efficiency Findings', 'Readiness Review Summary'],
    tasks: [
      { id: 'p4-t1', title: 'Role-Based Workforce Enablement', description: 'Conduct structured, hands-on briefing sessions for staff and supervisors on updated SOPs and operational tools.' },
      { id: 'p4-t2', title: 'Operational Flow & Handoff Reviews', description: 'Assess workflow execution in real-world settings to identify practical bottlenecks or unneeded complexity.' },
      { id: 'p4-t3', title: 'Internal Readiness & Adherence Review', description: 'Perform an internal compliance walkthrough to evaluate procedural adherence and document consistency.' },
      { id: 'p4-t4', title: 'SOP Refinement & Practical Adjustments', description: 'Refine documentation based on direct feedback and operational observations from frontline personnel.' },
    ]
  },
  {
    id: 'governance',
    phaseNumber: '05',
    title: 'Phase 5: Governance Handover & Sustained Review',
    shortTitle: 'Governance & Handover',
    subtitle: 'Ownership Transfer & Long-term Stability',
    timeline: 'Week 12+ (Indicative)',
    icon: ShieldCheck,
    summary: 'Transferring operational ownership to internal process champions, establishing leadership KPI monitoring, and defining periodic review cadence.',
    deliverables: ['Management Oversight KPI Framework', 'Operational Handover Protocol', 'Review and Renewal Planning'],
    tasks: [
      { id: 'p5-t1', title: 'Management Oversight KPI Framework', description: 'Deploy core KPI indicators and oversight checklists for leadership to monitor compliance, accuracy, and operational cadence.' },
      { id: 'p5-t2', title: 'Management Ownership Handover', description: 'Formally transition procedural oversight to designated internal process owners with established escalation rules.' },
      { id: 'p5-t3', title: 'Periodic Audit & Review Planning', description: 'Establish a structured schedule for internal audits, management reviews, and procedural updates.' },
      { id: 'p5-t4', title: 'Client Handover & Completion Summary', description: 'Provide the finalised operational documentation repository, implementation roadmap wrap-up, and formal handover summary.' },
    ]
  }
];

interface ProcessImplementationRoadmapProps {
  onInquirePhase?: (phaseTitle: string) => void;
}

export default function ProcessImplementationRoadmap({ onInquirePhase }: ProcessImplementationRoadmapProps) {
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);

  const activePhase = IMPLEMENTATION_PHASES[activePhaseIndex];

  return (
    <div className="bg-white border border-stone-200 rounded-2xl sm:rounded-3xl shadow-xs overflow-hidden">
      {/* Header Section */}
      <div className="p-6 sm:p-8 md:p-10 border-b border-stone-200 bg-linear-to-b from-stone-50/60 to-white">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#023625]/5 text-[#023625] rounded-full text-[11px] font-mono font-bold uppercase tracking-wider border border-[#023625]/10">
              <AppIcon name="alt_route" size={13} color="#B68A35" />
              <span>Implementation Methodology</span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-primary tracking-tight">
              5-Phase Implementation Methodology
            </h3>
            <p className="font-sans text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              From baseline diagnostics and SOP formulation to workforce enablement and governance handover. Select any phase below to review structured deliverables and core activities.
            </p>
          </div>

          {/* Indicative Timing Banner */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 sm:p-4 w-full lg:w-80 shrink-0 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-mono text-[#7a5a1f] font-bold uppercase tracking-wider">
              <Clock size={13} className="text-[#B68A35]" />
              <span>Structured Engagement</span>
            </div>
            <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
              Typical timing varies by scope, site readiness, and delivery model.
            </p>
            <div className="text-[10px] font-mono text-ash pt-0.5">
              Phase {activePhaseIndex + 1} of 5 Active
            </div>
          </div>
        </div>
      </div>

      {/* 5-Phase Stepper Row */}
      <div className="p-6 sm:p-8 md:p-10 space-y-6">
        <div className="flex items-center justify-between text-xs font-mono text-ash">
          <span className="uppercase tracking-wider font-bold text-[11px] text-[#023625] flex items-center gap-1.5">
            <ListTodo size={13} className="text-[#B68A35]" />
            Implementation Phases
          </span>
          <span className="text-[11px] hidden sm:inline">Select a phase to view detail</span>
        </div>

        {/* 5 Phase Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-stretch">
          {IMPLEMENTATION_PHASES.map((phase, idx) => {
            const isActive = idx === activePhaseIndex;
            const PhaseIcon = phase.icon;

            return (
              <button
                key={phase.id}
                type="button"
                onClick={() => setActivePhaseIndex(idx)}
                className={`p-3.5 sm:p-4 rounded-xl border text-left transition-all duration-150 cursor-pointer flex flex-col justify-between h-full min-h-[135px] ${
                  isActive
                    ? 'bg-[#023625] border-[#023625] text-white shadow-sm'
                    : 'bg-white border-stone-200 text-stone-700 hover:border-[#B68A35]/50 hover:bg-stone-50/60'
                }`}
              >
                {/* Header: Phase Pill + Icon */}
                <div className="flex items-center justify-between gap-2 mb-2.5 h-6">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-[#B68A35] text-white'
                      : 'bg-stone-100 text-stone-700 border border-stone-200/60'
                  }`}>
                    PHASE {phase.phaseNumber}
                  </span>

                  <PhaseIcon size={15} className={isActive ? 'text-[#DFC181]' : 'text-stone-400'} />
                </div>

                {/* Body: Title with fixed 2-line height for aligned baseline */}
                <div className="flex-1 flex flex-col justify-between">
                  <h4 className={`font-serif text-xs sm:text-sm font-bold line-clamp-2 leading-snug h-9 sm:h-10 flex items-start ${
                    isActive ? 'text-white' : 'text-primary'
                  }`}>
                    {idx + 1}. {phase.shortTitle}
                  </h4>

                  <div className={`flex items-center justify-between text-[11px] font-sans mt-3 pt-2.5 border-t ${
                    isActive ? 'border-white/15 text-white/75' : 'border-stone-100 text-ash'
                  }`}>
                    <span className="flex items-center gap-1 font-mono text-[10px]">
                      <Clock size={10} className="shrink-0 text-[#B68A35]" />
                      {phase.timeline}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Phase Details Display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activePhase.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="border border-stone-200 rounded-2xl bg-stone-50/50 p-5 sm:p-7 space-y-6"
          >
            {/* Active Phase Top Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-5">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#7a5a1f] bg-[#B68A35]/15 border border-[#B68A35]/30 px-2.5 py-0.5 rounded-full">
                    {activePhase.subtitle}
                  </span>
                  <span className="text-stone-300 hidden sm:inline">•</span>
                  <span className="text-xs font-mono text-ash font-medium flex items-center gap-1">
                    <Clock size={12} className="text-[#B68A35]" />
                    Estimated Window: <strong className="text-stone-800">{activePhase.timeline}</strong>
                  </span>
                </div>
                <h4 className="font-serif text-xl sm:text-2xl font-bold text-primary">
                  {activePhase.title}
                </h4>
                <p className="font-sans text-xs sm:text-sm text-on-surface-variant max-w-3xl leading-relaxed">
                  {activePhase.summary}
                </p>
              </div>

              {/* Step Navigation Controls */}
              <div className="flex items-center gap-2 shrink-0 self-start md:self-auto bg-white border border-stone-200 rounded-xl p-1.5 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setActivePhaseIndex(prev => Math.max(0, prev - 1))}
                  disabled={activePhaseIndex === 0}
                  className="p-2 rounded-lg hover:bg-stone-100 text-stone-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all flex items-center gap-1 text-xs font-mono"
                  title="Previous Phase"
                >
                  <ArrowLeft size={14} />
                  <span className="hidden sm:inline">Prev</span>
                </button>

                <span className="text-xs font-mono text-stone-600 font-bold px-2">
                  {activePhaseIndex + 1} / {IMPLEMENTATION_PHASES.length}
                </span>

                <button
                  type="button"
                  onClick={() => setActivePhaseIndex(prev => Math.min(IMPLEMENTATION_PHASES.length - 1, prev + 1))}
                  disabled={activePhaseIndex === IMPLEMENTATION_PHASES.length - 1}
                  className="p-2 rounded-lg hover:bg-stone-100 text-stone-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all flex items-center gap-1 text-xs font-mono"
                  title="Next Phase"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Grid Layout: Core Scope Activities & Deliverables */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
              {/* Left Column: Core Activities */}
              <div className="lg:col-span-7 space-y-3.5">
                <div className="flex items-center justify-between">
                  <h5 className="font-serif text-sm sm:text-base font-bold text-primary flex items-center gap-2">
                    <Workflow size={16} className="text-[#B68A35]" />
                    <span>Methodology &amp; Key Activities</span>
                  </h5>
                  <span className="text-[11px] font-mono text-ash bg-white border border-stone-200 px-2 py-0.5 rounded-md">
                    {activePhase.tasks.length} Focus Areas
                  </span>
                </div>

                <div className="space-y-2.5">
                  {activePhase.tasks.map((task, tIdx) => (
                    <div
                      key={task.id}
                      className="p-3.5 sm:p-4 rounded-xl border border-stone-200 bg-white flex items-start gap-3 shadow-2xs"
                    >
                      <div className="w-6 h-6 rounded-lg bg-stone-100 text-[#023625] font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-stone-200/80">
                        {tIdx + 1}
                      </div>

                      <div className="space-y-0.5 flex-1 min-w-0">
                        <h6 className="font-serif text-xs sm:text-sm font-bold leading-snug text-primary">
                          {task.title}
                        </h6>
                        <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                          {task.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Methodology Note */}
                <div className="flex items-start gap-2 text-xs font-sans text-stone-500 bg-stone-100/70 p-3 rounded-lg border border-stone-200/60">
                  <AlertCircle size={14} className="text-stone-400 shrink-0 mt-0.5" />
                  <span>
                    Each engagement is scoped around the organisation's requirements. Typical timing varies by scope, site readiness, and delivery model.
                  </span>
                </div>
              </div>

              {/* Right Column: Key Deliverables & Engagement Callout */}
              <div className="lg:col-span-5 space-y-4">
                {/* Deliverables Card */}
                <div className="bg-white border border-stone-200 rounded-xl p-4 sm:p-5 shadow-2xs space-y-3.5">
                  <h5 className="font-serif text-sm font-bold text-primary flex items-center gap-2 border-b border-stone-100 pb-2.5">
                    <Award size={16} className="text-[#B68A35]" />
                    <span>Typical Phase Outputs</span>
                  </h5>

                  <ul className="space-y-2 font-sans text-xs text-on-surface-variant">
                    {activePhase.deliverables.map((deliv, dIdx) => (
                      <li key={dIdx} className="flex items-start gap-2.5 bg-stone-50/80 p-2.5 rounded-lg border border-stone-200/60">
                        <Sparkles size={13} className="text-[#B68A35] shrink-0 mt-0.5" />
                        <span className="font-medium text-stone-800">{deliv}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Inquiry & Engagement CTA */}
                <div className="bg-[#023625] text-white rounded-xl p-4 sm:p-5 space-y-3.5 border border-white/10 shadow-md">
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono text-[#DFC181] font-bold uppercase tracking-wider">
                      Advisory &amp; Implementation
                    </div>
                    <h5 className="font-serif text-sm sm:text-base font-bold text-white leading-snug">
                      Plan Phase {activePhase.phaseNumber} for Your Organisation
                    </h5>
                    <p className="font-sans text-xs text-white/80 leading-relaxed">
                      Each engagement is scoped around the organisation's requirements, operational priorities, and compliance roadmap.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onInquirePhase && onInquirePhase(activePhase.title)}
                    className="w-full bg-[#B68A35] hover:bg-[#a3792b] text-white font-sans font-bold text-xs uppercase tracking-widest py-3 px-4 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm active:scale-95"
                  >
                    <span>Inquire About {activePhase.shortTitle}</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

