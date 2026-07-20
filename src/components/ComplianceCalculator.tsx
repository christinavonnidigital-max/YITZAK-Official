import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calculator, 
  TrendingUp, 
  Clock, 
  Building, 
  ShieldCheck, 
  Sparkles, 
  Users, 
  Layers, 
  ArrowRight,
  HelpCircle,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface ComplianceCalculatorProps {
  onInquire: (notes: string) => void;
}

const STANDARDS = [
  { id: 'iso-9001', name: 'ISO 9001:2015 (QMS)', baselineMonths: 6, complexity: 'Medium', failureRiskValue: 22000 },
  { id: 'fssc-22000', name: 'FSSC 22000 Version 7 (Food Safety)', baselineMonths: 8, complexity: 'High', failureRiskValue: 45000 },
  { id: 'sqf', name: 'SQF Edition 9 (Safe Quality Food)', baselineMonths: 7, complexity: 'High', failureRiskValue: 38000 },
  { id: 'brcgs-v9', name: 'BRCGS Food Safety Issue 9', baselineMonths: 9, complexity: 'Very High', failureRiskValue: 55000 },
  { id: 'globalgap-v6', name: 'GLOBALG.A.P. Version 6 Smart', baselineMonths: 5, complexity: 'Medium', failureRiskValue: 28000 },
  { id: 'as9100', name: 'AS9100 Rev D (Aerospace)', baselineMonths: 10, complexity: 'Very High', failureRiskValue: 65000 },
];

const READINESS_LEVELS = [
  { value: 10, label: 'Greenfield / Starting scratch', description: 'No documented systems, starting from ground zero.', timelineMultiplier: 1.5, baselineSuccess: 45 },
  { value: 40, label: 'Partially documented', description: 'Some written procedures exist but are not audited or fully adhered to.', timelineMultiplier: 1.1, baselineSuccess: 65 },
  { value: 70, label: 'Robust systems', description: 'Procedures are active and used daily; needs gap analysis & tuning.', timelineMultiplier: 0.7, baselineSuccess: 80 },
  { value: 90, label: 'Pre-audit verification', description: 'Internal audits done; seeking third-party compliance approval.', timelineMultiplier: 0.4, baselineSuccess: 92 },
];

export default function ComplianceCalculator({ onInquire }: ComplianceCalculatorProps) {
  const [selectedStandardId, setSelectedStandardId] = useState(STANDARDS[0].id);
  const [staffSize, setStaffSize] = useState(75);
  const [siteCount, setSiteCount] = useState(2);
  const [readinessVal, setReadinessVal] = useState(40);
  const [includeYitzakSupport, setIncludeYitzakSupport] = useState(true);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Calculation Results
  const [timeline, setTimeline] = useState(0);
  const [successRate, setSuccessRate] = useState(0);
  const [hoursSaved, setHoursSaved] = useState(0);
  const [financialRoi, setFinancialRoi] = useState(0);

  const selectedStandard = STANDARDS.find(s => s.id === selectedStandardId) || STANDARDS[0];
  const readinessObj = READINESS_LEVELS.find(r => r.value === readinessVal) || READINESS_LEVELS[1];

  useEffect(() => {
    // 1. Timeline Calculation (Months)
    // Baseline months adjusted by standard complexity & readiness level multiplier
    // Staff size and site count add minor scaling delays
    const sizeFactor = Math.log10(staffSize / 10) * 0.15;
    const siteFactor = (siteCount - 1) * 0.12;
    let computedTimeline = selectedStandard.baselineMonths * readinessObj.timelineMultiplier * (1 + sizeFactor + siteFactor);
    
    // Yitzak accelerator cuts timeline by 35%
    if (includeYitzakSupport) {
      computedTimeline = computedTimeline * 0.65;
    }
    
    // Ensure logical bounds (1.5 to 18 months)
    setTimeline(Math.max(1.5, Math.min(18, Math.round(computedTimeline * 10) / 10)));

    // 2. Success Rate Calculation (%)
    let computedSuccess = readinessObj.baselineSuccess;
    // Complexity reduces baseline success
    if (selectedStandard.complexity === 'High') computedSuccess -= 5;
    if (selectedStandard.complexity === 'Very High') computedSuccess -= 10;
    
    // Multi-site complexity reduces success slightly
    computedSuccess -= (siteCount - 1) * 2;

    // Yitzak boost
    if (includeYitzakSupport) {
      computedSuccess = Math.min(99.4, computedSuccess + 25);
    } else {
      computedSuccess = Math.max(35, Math.min(95, computedSuccess));
    }
    setSuccessRate(Math.round(computedSuccess * 10) / 10);

    // 3. Hours Saved Calculation
    // Total estimated hours required is based on complexity, staff size and site counts
    const totalComplianceHours = (selectedStandard.baselineMonths * 80) * (1 + (staffSize / 300)) * (1 + (siteCount * 0.2));
    // Guided implementation templates & streamlined auditor support saves 45% of hours
    const computedHours = includeYitzakSupport ? Math.round(totalComplianceHours * 0.45) : 0;
    setHoursSaved(computedHours);

    // 4. Financial Risk Mitigation ROI
    // Sum of audit failure delay penalties, employee overhead saved, and standard compliance failure costs
    const baseFailureValue = selectedStandard.failureRiskValue;
    const siteScaleFactor = siteCount * 0.9;
    const employeeRiskFactor = Math.min(3, 1 + (staffSize / 150));
    
    let riskMitigation = baseFailureValue * siteScaleFactor * employeeRiskFactor;
    // If starting greenfield, risk is higher
    if (readinessVal === 10) riskMitigation *= 1.3;
    if (readinessVal === 90) riskMitigation *= 0.8;

    // Save proportional to YITZAK training deployment effectiveness
    const computedRoi = includeYitzakSupport ? Math.round(riskMitigation * 0.85) : 0;
    setFinancialRoi(computedRoi);

  }, [selectedStandardId, staffSize, siteCount, readinessVal, includeYitzakSupport]);

  const handleBookInquiry = () => {
    const notesString = `[Compliance & ROI Calculator Result]
--------------------------------------------------
Standard: ${selectedStandard.name}
Facility Scale: ${staffSize} Staff, ${siteCount} Site(s)
Initial Readiness: ${readinessObj.label} (${readinessVal}%)
Yitzak Professional Training: ${includeYitzakSupport ? 'YES (Active)' : 'NO (Self-Guided)'}
--------------------------------------------------
Estimated Project Timeline: ${timeline} Months
Projected Audit Success Rate: ${successRate}%
Estimated Engineering Hours Saved: ${includeYitzakSupport ? hoursSaved + ' Hours' : 'N/A'}
Mitigated Financial Exposure Value: ${includeYitzakSupport ? '₹' + (financialRoi * 80).toLocaleString('en-IN') + ' / $' + financialRoi.toLocaleString() : 'N/A'}`;
    
    onInquire(notesString);
  };

  return (
    <div id="compliance-roi-calculator" className="py-16 md:py-24 bg-[#F9F9F9] border-t border-b border-[#E5E5E5] scroll-mt-24">
      <div className="max-w-[1280px] mx-auto px-4 md:px-16">
        
        {/* Header Block */}
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-antique-gold/10 border border-antique-gold/20 rounded-full mb-4">
            <Sparkles size={13} className="text-[#B68A35]" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#B68A35]">Corporate Decision Support Tool</span>
          </div>
          <h2 className="font-serif text-3xl md:text-[40px] text-primary font-bold mb-4">
            Compliance & ROI Calculator
          </h2>
          <p className="font-sans text-xs md:text-sm text-ash leading-relaxed">
            Formulate compliance readiness timelines, mitigate operational risks, and visualize the measurable financial benefits of a YITZAK-guided curriculum.
          </p>
          <div className="w-16 h-1 bg-[#B68A35] mx-auto mt-6"></div>
        </div>

        {/* Calculator Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Panel: Inputs */}
          <div className="lg:col-span-7 bg-white border border-[#E5E5E5] rounded-3xl p-6 md:p-8 flex flex-col justify-between space-y-6 shadow-sm">
            
            {/* Standard Selection */}
            <div className="space-y-3">
              <label className="text-[11px] font-bold font-mono text-primary uppercase tracking-wider flex items-center justify-between">
                <span>1. Select Targeted Standard</span>
                <span className="text-[10px] text-ash font-medium normal-case">Complexity: <strong className="text-[#B68A35] font-mono">{selectedStandard.complexity}</strong></span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {STANDARDS.map(standard => (
                  <button
                    key={standard.id}
                    onClick={() => setSelectedStandardId(standard.id)}
                    className={`p-3.5 text-left rounded-xl border text-xs font-sans transition-all cursor-pointer flex items-center justify-between ${
                      selectedStandardId === standard.id
                        ? 'border-[#B68A35] bg-antique-gold/5 text-primary font-bold shadow-xs'
                        : 'border-[#E5E5E5] bg-white text-charcoal hover:border-[#B68A35]/40'
                    }`}
                  >
                    <span>{standard.name}</span>
                    {selectedStandardId === standard.id && (
                      <CheckCircle2 size={14} className="text-[#B68A35] shrink-0 ml-2" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Scale Parameters */}
            <div className="space-y-5 pt-2 border-t border-[#E5E5E5]/50">
              <div className="text-[11px] font-bold font-mono text-primary uppercase tracking-wider">
                2. Define Facility Scale
              </div>

              {/* Staff slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-charcoal font-medium font-sans flex items-center gap-1">
                    <Users size={13} className="text-ash" />
                    Staff Size (FTEs)
                  </span>
                  <span className="font-mono font-bold text-primary bg-primary/5 px-2.5 py-0.5 rounded-lg border border-primary/10">
                    {staffSize} employees
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="1000"
                  step="5"
                  value={staffSize}
                  onChange={(e) => setStaffSize(Number(e.target.value))}
                  className="w-full h-1.5 bg-[#F1F3F4] rounded-lg appearance-none cursor-pointer accent-[#B68A35]"
                />
                <div className="flex justify-between text-[9px] text-ash font-mono">
                  <span>5 Staff</span>
                  <span>500 Staff</span>
                  <span>1000+ Staff</span>
                </div>
              </div>

              {/* Sites slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-charcoal font-medium font-sans flex items-center gap-1">
                    <Building size={13} className="text-ash" />
                    Operational Sites
                  </span>
                  <span className="font-mono font-bold text-primary bg-primary/5 px-2.5 py-0.5 rounded-lg border border-primary/10">
                    {siteCount} physical site{siteCount > 1 ? 's' : ''}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="1"
                  value={siteCount}
                  onChange={(e) => setSiteCount(Number(e.target.value))}
                  className="w-full h-1.5 bg-[#F1F3F4] rounded-lg appearance-none cursor-pointer accent-[#B68A35]"
                />
                <div className="flex justify-between text-[9px] text-ash font-mono">
                  <span>1 Site (Local)</span>
                  <span>8 Sites (Regional)</span>
                  <span>15 Sites (Multi-National)</span>
                </div>
              </div>
            </div>

            {/* Current Readiness Selector */}
            <div className="space-y-3 pt-2 border-t border-[#E5E5E5]/50">
              <label className="text-[11px] font-bold font-mono text-primary uppercase tracking-wider">
                3. Current Readiness Assessment
              </label>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {READINESS_LEVELS.map(level => (
                  <button
                    key={level.value}
                    onClick={() => setReadinessVal(level.value)}
                    className={`p-3 text-center rounded-xl border transition-all cursor-pointer flex flex-col items-center justify-center space-y-1 ${
                      readinessVal === level.value
                        ? 'border-[#B68A35] bg-antique-gold/5 text-primary font-bold'
                        : 'border-[#E5E5E5] bg-white text-ash hover:border-antique-gold/25'
                    }`}
                  >
                    <span className="font-mono text-xs">{level.value}%</span>
                    <span className="text-[10px] font-sans tracking-tight leading-tight block text-charcoal truncate w-full">
                      {level.label.split(' / ')[0]}
                    </span>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-ash leading-relaxed italic bg-neutral-50 p-2.5 rounded-lg border border-neutral-100">
                "{readinessObj.description}"
              </p>
            </div>

            {/* Yitzak Booster Toggle Switch */}
            <div className="pt-4 border-t border-[#E5E5E5]/50 flex items-center justify-between bg-antique-gold/5 p-4 rounded-2xl border border-antique-gold/15">
              <div className="space-y-1 pr-4">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="text-[#B68A35]" size={16} />
                  <span className="text-xs font-bold text-primary font-sans">Apply YITZAK Training Accelerator</span>
                </div>
                <p className="text-[10px] text-ash leading-relaxed">
                  Includes accredited syllabus, gap templates, mock audits, and dedicated instruction to boost readiness by 30% and shorten timeline by 35%.
                </p>
              </div>

              {/* Toggle switch visual */}
              <button
                onClick={() => setIncludeYitzakSupport(!includeYitzakSupport)}
                className={`w-12 h-6 rounded-full p-0.5 transition-colors duration-200 outline-none cursor-pointer relative shrink-0 ${
                  includeYitzakSupport ? 'bg-[#B68A35]' : 'bg-neutral-300'
                }`}
              >
                <div 
                  className={`w-5 h-5 rounded-full bg-white shadow-xs transform duration-200 ${
                    includeYitzakSupport ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

          </div>

          {/* Right Panel: ROI Estimates */}
          <div className="lg:col-span-5 bg-primary text-white border border-[#E5E5E5]/10 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden">
            
            {/* Pattern/Background decoration */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/2 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-6 z-10">
              
              {/* Header Title */}
              <div className="flex items-center gap-2 border-b border-white/10 pb-4">
                <div className="p-2 bg-[#DFC181]/15 rounded-xl border border-[#DFC181]/30">
                  <Calculator className="text-[#DFC181]" size={18} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-white leading-tight">Evaluation Output</h3>
                  <p className="text-[10px] font-mono text-[#DFC181] tracking-wider uppercase">Projected Readiness Model</p>
                </div>
              </div>

              {/* Main Outputs */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* Timeline Box */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-bold text-[#DFC181] tracking-wider uppercase">EST. TIMELINE</span>
                    <Clock size={12} className="text-white/60" />
                  </div>
                  <div className="font-mono text-xl md:text-2xl font-bold tracking-tight mt-1 text-white">
                    {timeline} <span className="text-xs font-sans font-normal text-white/70">Months</span>
                  </div>
                  <p className="text-[9px] text-white/50 leading-tight">To total audit readiness</p>
                </div>

                {/* Success Rate Box */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-bold text-[#DFC181] tracking-wider uppercase">SUCCESS PROJECTION</span>
                    <TrendingUp size={12} className="text-white/60" />
                  </div>
                  <div className="font-mono text-xl md:text-2xl font-bold tracking-tight mt-1 text-white flex items-baseline gap-0.5">
                    {successRate}%
                  </div>
                  <p className="text-[9px] text-white/50 leading-tight">Estimated first-attempt pass</p>
                </div>

              </div>

              {/* ROI & Impact Metrics Container */}
              <div className="space-y-4 pt-2">
                <div className="text-[10px] font-bold font-mono text-[#DFC181] tracking-wider uppercase border-b border-white/5 pb-2">
                  YITZAK Measurable Operational Impact
                </div>

                <div className="space-y-3.5">
                  {/* Hours Saved */}
                  <div className="flex items-start justify-between text-xs">
                    <div className="space-y-0.5">
                      <span className="font-semibold text-white">Engineering Effort Saved</span>
                      <p className="text-[9px] text-white/60">Hours saved through pre-built templates and expert syllabus guidance.</p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-[#DFC181] bg-white/5 px-2 py-0.5 rounded border border-white/10 text-xs shrink-0 whitespace-nowrap">
                        {includeYitzakSupport ? `${hoursSaved.toLocaleString()} Hrs` : '0 Hrs'}
                      </span>
                    </div>
                  </div>

                  {/* Financial Risk Avoided */}
                  <div className="flex items-start justify-between text-xs">
                    <div className="space-y-0.5">
                      <span className="font-semibold text-white">Audit Failure Risk Avoided</span>
                      <p className="text-[9px] text-white/60">Estimated avoidance of rework cost, delay penalties & business disruption.</p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-green-400 bg-white/5 px-2 py-0.5 rounded border border-white/10 text-xs shrink-0 whitespace-nowrap">
                        {includeYitzakSupport ? `₹${(financialRoi * 80).toLocaleString('en-IN')}` : '₹0'}
                      </span>
                      {includeYitzakSupport && (
                        <span className="block text-[9px] text-white/50 font-mono mt-0.5">~${financialRoi.toLocaleString()} USD</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Disclaimer / Warning when Yitzak is off */}
              <AnimatePresence>
                {!includeYitzakSupport && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="p-3.5 bg-red-950/20 border border-red-500/20 rounded-xl flex items-start gap-2.5 text-[10.5px] text-red-200 leading-normal"
                  >
                    <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Warning:</strong> Self-guided standards integration increases audit failure probabilities by over 25% and incurs an estimated {Math.round(timeline * 0.4)} months of project delivery slippage.
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

            {/* Direct CTA */}
            <div className="space-y-4 pt-6 mt-6 border-t border-white/10 z-10">
              <div className="text-[10px] text-white/60 font-sans leading-relaxed text-center">
                Need an official Gap Assessment or certified curriculum proposal? Submit your dynamic calculation metrics to our training managers.
              </div>
              
              <button
                onClick={handleBookInquiry}
                className="w-full bg-[#DFC181] hover:bg-[#DFC181]/90 text-primary font-sans font-bold text-xs uppercase tracking-widest py-3.5 px-6 rounded-xl cursor-pointer transition-all active:scale-95 text-center flex items-center justify-center gap-2 shadow-md focus:outline-none focus:ring-2 focus:ring-[#DFC181]/40"
              >
                <span>Request Custom Syllabus & Quote</span>
                <ArrowRight size={14} />
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
