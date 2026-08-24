import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  Circle, 
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
  ChevronRight,
  Check,
  CalendarCheck,
  ListTodo
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
    title: 'Phase 1: Discovery & Gap Assessment',
    shortTitle: 'Discovery & Gap Audit',
    subtitle: 'Baseline Audit & Context Analysis',
    timeline: 'Weeks 1–2',
    icon: Search,
    summary: 'Comprehensive audit of existing operating procedures, organizational bottlenecks, and regulatory or compliance gaps across all operating departments.',
    deliverables: ['Operational Gap Assessment Report', 'Process Inventory & Hierarchy', 'Risk & Compliance Register'],
    tasks: [
      { id: 'p1-t1', title: 'Stakeholder Interviews & Context Audit', description: 'Engage department leads to map current operational pain points, expectations, and reporting lines.' },
      { id: 'p1-t2', title: 'As-Is Process Mapping', description: 'Document existing end-to-end operational workflows and identify friction points or redundant loops.' },
      { id: 'p1-t3', title: 'HR & Financial Controls Evaluation', description: 'Review baseline HR policies, payroll controls, approval matrix, and accounting oversight.' },
      { id: 'p1-t4', title: 'KPI & Scope Definition', description: 'Establish project scope boundaries, baseline metrics, and target compliance indicators.' },
    ]
  },
  {
    id: 'design',
    phaseNumber: '02',
    title: 'Phase 2: Process Design & SOP Mapping',
    shortTitle: 'Process Design & SOPs',
    subtitle: 'Blueprinting & Governance Framework',
    timeline: 'Weeks 3–5',
    icon: FileText,
    summary: 'Standardising operational workflows through formal SOP drafting, governance frameworks, and RACI matrices tailored to your team.',
    deliverables: ['Standardised SOP Playbook', 'RACI Matrix & Approval Gates', 'Governance Control Plan'],
    tasks: [
      { id: 'p2-t1', title: 'Standard Operating Procedure (SOP) Drafting', description: 'Formulate clear, step-by-step SOP documents tailored to each business function.' },
      { id: 'p2-t2', title: 'RACI & Governance Matrix Formulation', description: 'Define Responsible, Accountable, Consulted, and Informed roles for every critical workflow.' },
      { id: 'p2-t3', title: 'Internal Quality Control Checkpoints', description: 'Integrate verification checkpoints, sign-off thresholds, and error prevention gates.' },
      { id: 'p2-t4', title: 'Regulatory Standard Alignment', description: 'Align internal procedures with ISO standards, FoodChain ID requirements, and local labor laws.' },
    ]
  },
  {
    id: 'systems',
    phaseNumber: '03',
    title: 'Phase 3: Systems Integration & Infrastructure',
    shortTitle: 'Systems Integration',
    subtitle: 'HR, Accounting & Tooling Deployment',
    timeline: 'Weeks 6–8',
    icon: Layers,
    summary: 'Deploying robust operational infrastructure including HR management tools, accounting systems, and reporting workflows.',
    deliverables: ['HR & Payroll Management Framework', 'Financial Oversight & Invoicing Controls', 'System Test & Validation Logs'],
    tasks: [
      { id: 'p3-t1', title: 'HR & Onboarding Workflow Deployment', description: 'Implement standardized recruitment, onboarding checklists, leave management, and employee record structures.' },
      { id: 'p3-t2', title: 'Accounting & Financial Control Setup', description: 'Configure purchase order approvals, invoice verification, expense tracking, and monthly reconciliation workflows.' },
      { id: 'p3-t3', title: 'Digital Process Automation & Tracking', description: 'Set up digital tools or shared repositories for automated tracking and real-time visibility.' },
      { id: 'p3-t4', title: 'Pilot Testing & Stress Testing', description: 'Run simulated operations to identify bottlenecks before full organization-wide rollout.' },
    ]
  },
  {
    id: 'execution',
    phaseNumber: '04',
    title: 'Phase 4: Workforce Onboarding & Lean Audit',
    shortTitle: 'Onboarding & Lean Audit',
    subtitle: 'Capacity Enablement & Waste Reduction',
    timeline: 'Weeks 9–11',
    icon: CheckSquare,
    summary: 'Training process owners, conducting lean audits, and refining workflows based on real-world execution metrics.',
    deliverables: ['Staff Competence Training Certificates', 'Lean Time & Motion Audit Report', 'Audit Readiness Signoff'],
    tasks: [
      { id: 'p4-t1', title: 'Role-Based Workforce Training', description: 'Conduct interactive, hands-on workshops for staff and supervisors on updated SOPs and tools.' },
      { id: 'p4-t2', title: 'Lean Time & Motion Audits', description: 'Perform operational audits to identify idle time, excessive handoffs, or resource waste.' },
      { id: 'p4-t3', title: 'Mock Compliance & Audit Trial', description: 'Simulate an internal audit to verify team adherence to new governance and documentation rules.' },
      { id: 'p4-t4', title: 'Continuous SOP Refinement', description: 'Update documentation based on practical feedback from frontline team members.' },
    ]
  },
  {
    id: 'governance',
    phaseNumber: '05',
    title: 'Phase 5: Continuous Oversight & Handover',
    shortTitle: 'Governance & Handover',
    subtitle: 'Executive Dashboards & Long-term Scaling',
    timeline: 'Week 12+',
    icon: ShieldCheck,
    summary: 'Establishing real-time executive dashboards, handing over management ownership, and scheduling quarterly reviews.',
    deliverables: ['Executive Control Dashboard', 'Operational Handover Protocol', 'Quarterly Recertification Schedule'],
    tasks: [
      { id: 'p5-t1', title: 'Executive Control Dashboard Setup', description: 'Deploy KPI monitoring dashboards for leadership to track compliance, efficiency, and error rates.' },
      { id: 'p5-t2', title: 'Management Ownership Handover', description: 'Formally transfer governance ownership to internal process champions with clear escalation paths.' },
      { id: 'p5-t3', title: 'Quarterly Audit & Health Checks Schedule', description: 'Establish recurring quarterly health checks to ensure sustained compliance and procedural rigor.' },
      { id: 'p5-t4', title: 'Final Implementation Signoff', description: 'Deliver complete operational documentation repository and project completion certification.' },
    ]
  }
];

interface ProcessImplementationRoadmapProps {
  onInquirePhase?: (phaseTitle: string) => void;
}

export default function ProcessImplementationRoadmap({ onInquirePhase }: ProcessImplementationRoadmapProps) {
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({
    'p1-t1': true,
    'p1-t2': true,
  });

  const activePhase = IMPLEMENTATION_PHASES[activePhaseIndex];

  const toggleTask = (taskId: string) => {
    setCompletedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  // Calculate overall interactive progress
  const totalTasks = IMPLEMENTATION_PHASES.reduce((acc, phase) => acc + phase.tasks.length, 0);
  const totalCompleted = Object.values(completedTasks).filter(Boolean).length;
  const progressPercentage = Math.round((totalCompleted / totalTasks) * 100);

  const activePhaseCompletedCount = activePhase.tasks.filter(t => completedTasks[t.id]).length;

  return (
    <div className="bg-white border border-stone-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 shadow-sm space-y-6 sm:space-y-8">
      {/* Header & Interactive Progress Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-stone-200/80 pb-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#023625]/5 text-[#023625] rounded-full text-[11px] font-mono font-bold uppercase tracking-wider border border-[#023625]/10">
            <AppIcon name="alt_route" size={13} color="#B68A35" />
            <span>Interactive Implementation Roadmap</span>
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-primary tracking-tight">
            5-Phase Implementation Methodology
          </h3>
          <p className="font-sans text-xs sm:text-sm text-on-surface-variant max-w-2xl leading-relaxed">
            From baseline gap diagnostics to executive governance handover. Select any phase below to examine deliverables and simulate task readiness.
          </p>
        </div>

        {/* Compact Progress Card */}
        <div className="bg-[#023625] text-white p-4 sm:p-5 rounded-xl sm:rounded-2xl shrink-0 lg:w-80 border border-white/10 shadow-md">
          <div className="flex items-center justify-between text-xs font-mono mb-2.5">
            <span className="text-[#DFC181] font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <CalendarCheck size={13} className="text-[#B68A35]" />
              Readiness Progress
            </span>
            <span className="font-bold text-white text-xs">{totalCompleted} / {totalTasks} Tasks ({progressPercentage}%)</span>
          </div>
          <div className="w-full h-2.5 bg-white/15 rounded-full overflow-hidden p-0.5">
            <motion.div 
              className="h-full bg-linear-to-r from-[#B68A35] to-[#DFC181] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono text-white/60 mt-2">
            <span>Phase {activePhaseIndex + 1} Selected</span>
            <span className="text-[#DFC181]">{activePhaseCompletedCount}/{activePhase.tasks.length} Phase Tasks Done</span>
          </div>
        </div>
      </div>

      {/* Modern Stepper Tabs */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-ash px-1">
          <span className="uppercase tracking-wider font-bold text-[11px] text-[#023625] flex items-center gap-1.5">
            <ListTodo size={13} className="text-[#B68A35]" />
            Select Implementation Phase
          </span>
          <span className="text-[11px]">Click a phase to inspect</span>
        </div>

        {/* Scrollable / Responsive Phase Stepper */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
          {IMPLEMENTATION_PHASES.map((phase, idx) => {
            const isActive = idx === activePhaseIndex;
            const isDone = phase.tasks.every(t => completedTasks[t.id]);
            const phaseDoneCount = phase.tasks.filter(t => completedTasks[t.id]).length;
            const PhaseIcon = phase.icon;

            return (
              <button
                key={phase.id}
                onClick={() => setActivePhaseIndex(idx)}
                className={`p-3 sm:p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer relative flex flex-col justify-between min-h-[105px] sm:min-h-[120px] ${
                  idx === 4 ? 'col-span-2 sm:col-span-1' : 'col-span-1'
                } ${
                  isActive
                    ? 'bg-[#023625] border-[#023625] text-white shadow-md ring-2 ring-[#B68A35]/60 -translate-y-0.5'
                    : 'bg-white border-stone-200 text-on-surface-variant hover:border-[#B68A35]/40 hover:bg-stone-50/70'
                }`}
              >
                {/* Phase Number & Status Icon */}
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className={`text-[9px] sm:text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-[#B68A35] text-white'
                      : 'bg-stone-100 text-stone-700'
                  }`}>
                    PHASE {phase.phaseNumber}
                  </span>

                  {isDone ? (
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center">
                      <Check size={11} className="stroke-[3]" />
                    </span>
                  ) : (
                    <PhaseIcon size={15} className={isActive ? 'text-[#DFC181]' : 'text-stone-400'} />
                  )}
                </div>

                {/* Title & Timeline */}
                <div>
                  <h4 className={`font-serif text-xs sm:text-sm font-bold line-clamp-2 leading-snug ${
                    isActive ? 'text-white' : 'text-primary'
                  }`}>
                    {idx + 1}. {phase.shortTitle}
                  </h4>
                  <div className={`flex items-center justify-between text-[10px] sm:text-[11px] font-sans mt-2 pt-1.5 border-t ${
                    isActive ? 'border-white/15 text-white/75' : 'border-stone-100 text-ash'
                  }`}>
                    <span className="flex items-center gap-1 font-mono text-[9px] sm:text-[10px]">
                      <Clock size={10} className="shrink-0 text-[#B68A35]" />
                      {phase.timeline}
                    </span>
                    <span className="font-mono text-[9px] sm:text-[10px] font-bold">
                      {phaseDoneCount}/{phase.tasks.length}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Phase Details Display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activePhase.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="bg-stone-50/70 border border-stone-200/90 rounded-2xl p-4 sm:p-7 space-y-6"
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
                  Duration: <strong className="text-stone-700">{activePhase.timeline}</strong>
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

          {/* Grid Layout: Tasks Checklist & Key Deliverables */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Left Column: Sub-Tasks Checklist */}
            <div className="lg:col-span-7 space-y-3.5">
              <div className="flex items-center justify-between">
                <h5 className="font-serif text-sm sm:text-base font-bold text-primary flex items-center gap-2">
                  <CheckSquare size={16} className="text-[#B68A35]" />
                  <span>Action Items & Readiness Checklist</span>
                </h5>
                <span className="text-[11px] font-mono text-ash bg-white border border-stone-200 px-2 py-0.5 rounded-md">
                  {activePhaseCompletedCount} of {activePhase.tasks.length} Verified
                </span>
              </div>

              <div className="space-y-2.5">
                {activePhase.tasks.map((task, tIdx) => {
                  const isChecked = !!completedTasks[task.id];

                  return (
                    <div
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                        isChecked
                          ? 'bg-emerald-50/70 border-emerald-300/80 shadow-2xs'
                          : 'bg-white border-stone-200/90 hover:border-[#B68A35]/50 hover:shadow-2xs'
                      }`}
                    >
                      <button 
                        type="button" 
                        className="mt-0.5 shrink-0 cursor-pointer focus:outline-none"
                        aria-label={`Toggle task ${task.title}`}
                      >
                        {isChecked ? (
                          <CheckCircle2 size={18} className="text-emerald-600 fill-emerald-100" />
                        ) : (
                          <Circle size={18} className="text-stone-300 hover:text-[#B68A35]" />
                        )}
                      </button>

                      <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h6 className={`font-serif text-xs sm:text-sm font-bold leading-snug ${
                            isChecked ? 'text-emerald-950 line-through opacity-85' : 'text-primary'
                          }`}>
                            {activePhase.phaseNumber}.{tIdx + 1} {task.title}
                          </h6>
                          {isChecked && (
                            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded shrink-0">
                              Done
                            </span>
                          )}
                        </div>
                        <p className={`font-sans text-xs leading-relaxed ${
                          isChecked ? 'text-emerald-800/85' : 'text-on-surface-variant'
                        }`}>
                          {task.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Key Deliverables & Action Callout */}
            <div className="lg:col-span-5 space-y-4">
              {/* Deliverables Card */}
              <div className="bg-white border border-stone-200 rounded-xl p-4 sm:p-5 shadow-2xs space-y-3.5">
                <h5 className="font-serif text-sm font-bold text-primary flex items-center gap-2 border-b border-stone-100 pb-2.5">
                  <Award size={16} className="text-[#B68A35]" />
                  <span>Phase Deliverables</span>
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

              {/* Inquiry & Next Steps CTA */}
              <div className="bg-[#023625] text-white rounded-xl p-4 sm:p-5 space-y-3.5 border border-white/10 shadow-md">
                <div className="space-y-1">
                  <div className="text-[10px] font-mono text-[#DFC181] font-bold uppercase tracking-wider">
                    Bespoke Advisory
                  </div>
                  <h5 className="font-serif text-sm sm:text-base font-bold text-white leading-snug">
                    Schedule Phase {activePhase.phaseNumber} Implementation
                  </h5>
                  <p className="font-sans text-xs text-white/80 leading-relaxed">
                    Our principal consultants adapt each sub-task to your organization's specific sector, HR structure, and regulatory environment.
                  </p>
                </div>

                <button
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
  );
}
