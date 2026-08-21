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
  Zap,
  ChevronRight
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
    shortTitle: '1. Discovery & Gap Audit',
    subtitle: 'Baseline Audit & Context Analysis',
    timeline: 'Weeks 1–2',
    icon: Search,
    summary: 'Comprehensive audit of existing operating procedures, organizational bottlenecks, and regulatory or compliance gaps.',
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
    shortTitle: '2. Process Design & SOPs',
    subtitle: 'Blueprinting & Governance Framework',
    timeline: 'Weeks 3–5',
    icon: FileText,
    summary: 'Standardising operational workflows through formal SOP drafting, governance frameworks, and RACI matrices.',
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
    shortTitle: '3. Systems Integration',
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
    shortTitle: '4. Onboarding & Lean Audit',
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
    shortTitle: '5. Governance & Handover',
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
    <div className="bg-white border border-[#E5E5E5] rounded-3xl p-6 sm:p-8 md:p-10 shadow-sm space-y-8">
      {/* Header & Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#E5E5E5] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#023625]/5 text-[#023625] rounded-full text-xs font-mono font-bold uppercase tracking-wider mb-2 border border-[#023625]/10">
            <AppIcon name="alt_route" size={14} color="#B68A35" />
            <span>Interactive Implementation Navigator</span>
          </div>
          <h3 className="font-serif text-2xl md:text-3xl font-bold text-primary">
            Process Implementation Roadmap
          </h3>
          <p className="font-sans text-xs md:text-sm text-on-surface-variant mt-1 max-w-2xl">
            Select a phase below to explore specific sub-tasks, timeline expectations, and key deliverables. Toggle tasks to simulate implementation readiness.
          </p>
        </div>

        {/* Progress Card */}
        <div className="bg-[#023625] text-white p-4 rounded-2xl shrink-0 min-w-[240px] border border-white/10 shadow-inner">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="text-[#B68A35] font-bold uppercase">Overall Completion</span>
            <span className="font-bold text-white">{totalCompleted} / {totalTasks} Tasks ({progressPercentage}%)</span>
          </div>
          <div className="w-full h-2 bg-white/15 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-[#B68A35] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* Stepper Tabs (Horizontal on Desktop, Scrollable / Grid on Mobile) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
        {IMPLEMENTATION_PHASES.map((phase, idx) => {
          const isActive = idx === activePhaseIndex;
          const isPassed = idx < activePhaseIndex;
          const PhaseIcon = phase.icon;
          const phaseTaskCount = phase.tasks.length;
          const phaseDoneCount = phase.tasks.filter(t => completedTasks[t.id]).length;

          return (
            <button
              key={phase.id}
              onClick={() => setActivePhaseIndex(idx)}
              className={`p-3.5 sm:p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer relative flex flex-col justify-between min-h-[110px] ${
                isActive
                  ? 'bg-[#023625] border-[#023625] text-white shadow-md ring-2 ring-[#B68A35]/50 scale-[1.02]'
                  : isPassed
                  ? 'bg-[#FAFAF8] border-[#B68A35]/30 text-primary hover:border-[#B68A35] hover:bg-white'
                  : 'bg-white border-[#E5E5E5] text-on-surface-variant hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-2">
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                  isActive
                    ? 'bg-[#B68A35] text-white'
                    : isPassed
                    ? 'bg-[#023625]/10 text-[#023625]'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  PHASE {phase.phaseNumber}
                </span>

                <PhaseIcon size={16} className={isActive ? 'text-[#B68A35]' : 'text-ash'} />
              </div>

              <div>
                <h4 className={`font-serif text-xs sm:text-sm font-bold line-clamp-2 leading-tight ${
                  isActive ? 'text-white' : 'text-primary'
                }`}>
                  {phase.shortTitle}
                </h4>
                <div className={`flex items-center justify-between text-[11px] font-sans mt-2 pt-2 border-t ${
                  isActive ? 'border-white/10 text-white/70' : 'border-gray-200 text-ash'
                }`}>
                  <span className="flex items-center gap-1 font-mono text-[10px]">
                    <Clock size={10} className="shrink-0" />
                    {phase.timeline}
                  </span>
                  <span className="font-mono text-[10px] font-bold">
                    {phaseDoneCount}/{phaseTaskCount}
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
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="bg-[#FAFAF8] border border-[#E5E5E5] rounded-2xl p-6 sm:p-8 space-y-6"
        >
          {/* Active Phase Top Banner */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-200 pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase text-[#B68A35]">
                  {activePhase.subtitle}
                </span>
                <span className="text-gray-300">•</span>
                <span className="text-xs font-mono text-ash font-medium flex items-center gap-1">
                  <Clock size={12} className="text-[#B68A35]" />
                  Timeline: {activePhase.timeline}
                </span>
              </div>
              <h4 className="font-serif text-xl sm:text-2xl font-bold text-primary">
                {activePhase.title}
              </h4>
              <p className="font-sans text-xs sm:text-sm text-on-surface-variant max-w-3xl leading-relaxed">
                {activePhase.summary}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setActivePhaseIndex(prev => Math.max(0, prev - 1))}
                disabled={activePhaseIndex === 0}
                className="p-2.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                title="Previous Phase"
              >
                <ArrowLeft size={16} />
              </button>

              <span className="text-xs font-mono text-ash font-bold">
                {activePhaseIndex + 1} of {IMPLEMENTATION_PHASES.length}
              </span>

              <button
                onClick={() => setActivePhaseIndex(prev => Math.min(IMPLEMENTATION_PHASES.length - 1, prev + 1))}
                disabled={activePhaseIndex === IMPLEMENTATION_PHASES.length - 1}
                className="p-2.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                title="Next Phase"
              >
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Grid Layout: Tasks Checklist & Key Deliverables */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Sub-Tasks List */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <h5 className="font-serif text-base font-bold text-primary flex items-center gap-2">
                  <CheckSquare size={16} className="text-[#B68A35]" />
                  <span>Phase Sub-Tasks & Action Items</span>
                </h5>
                <span className="text-xs font-mono text-ash">
                  {activePhaseCompletedCount} of {activePhase.tasks.length} Checked
                </span>
              </div>

              <div className="space-y-3">
                {activePhase.tasks.map((task, tIdx) => {
                  const isChecked = !!completedTasks[task.id];

                  return (
                    <motion.div
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      whileHover={{ scale: 1.005 }}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                        isChecked
                          ? 'bg-emerald-50/50 border-emerald-200'
                          : 'bg-white border-gray-200 hover:border-[#B68A35]/50 hover:shadow-xs'
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
                          <Circle size={18} className="text-gray-300 hover:text-[#B68A35]" />
                        )}
                      </button>

                      <div className="space-y-0.5 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h6 className={`font-serif text-xs sm:text-sm font-bold ${
                            isChecked ? 'text-emerald-950 line-through opacity-80' : 'text-primary'
                          }`}>
                            {tIdx + 1}. {task.title}
                          </h6>
                        </div>
                        <p className={`font-sans text-xs leading-relaxed ${
                          isChecked ? 'text-emerald-800/80' : 'text-on-surface-variant'
                        }`}>
                          {task.description}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Key Deliverables & Action Callout */}
            <div className="lg:col-span-5 space-y-6">
              {/* Deliverables Card */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
                <h5 className="font-serif text-sm font-bold text-primary flex items-center gap-2 border-b border-gray-100 pb-3">
                  <Award size={16} className="text-[#B68A35]" />
                  <span>Key Phase Deliverables</span>
                </h5>

                <ul className="space-y-2.5 font-sans text-xs text-on-surface-variant">
                  {activePhase.deliverables.map((deliv, dIdx) => (
                    <li key={dIdx} className="flex items-start gap-2.5 bg-[#FAFAF8] p-2.5 rounded-lg border border-gray-100">
                      <Sparkles size={14} className="text-[#B68A35] shrink-0 mt-0.5" />
                      <span className="font-medium text-primary">{deliv}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Inquiry & Next Steps CTA */}
              <div className="bg-[#023625] text-white rounded-xl p-5 space-y-4 border border-white/10 shadow-sm">
                <div className="space-y-1">
                  <div className="text-[11px] font-mono text-[#B68A35] font-bold uppercase tracking-wider">
                    Custom Execution Plan
                  </div>
                  <h5 className="font-serif text-base font-bold text-white">
                    Need tailored execution for {activePhase.shortTitle}?
                  </h5>
                  <p className="font-sans text-xs text-white/80 leading-relaxed">
                    Our principal consultants adapt each sub-task to your organization's specific sector, HR structure, and regulatory environment.
                  </p>
                </div>

                <button
                  onClick={() => onInquirePhase && onInquirePhase(activePhase.title)}
                  className="w-full bg-[#B68A35] hover:bg-[#a3792b] text-white font-sans font-bold text-xs uppercase tracking-widest py-3 px-4 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm active:scale-95"
                >
                  <span>Inquire About {activePhase.phaseNumber}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
