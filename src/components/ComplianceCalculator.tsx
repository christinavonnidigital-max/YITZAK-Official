import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Clock, 
  Building2, 
  Users, 
  ArrowRight,
  ChevronDown,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import AppIcon from './AppIcon';

interface ComplianceCalculatorProps {
  onInquire: (notes: string) => void;
}

const STANDARDS = [
  { id: 'fssc-22000', name: 'FSSC 22000 (Food Safety V7)', baselineMonths: 8, complexity: 'High', baseDailyRiskZAR: 45000 },
  { id: 'iso-9001', name: 'ISO 9001:2015 (Quality QMS)', baselineMonths: 6, complexity: 'Medium', baseDailyRiskZAR: 28000 },
  { id: 'sqf', name: 'SQF Edition 9 (Safe Quality Food)', baselineMonths: 7, complexity: 'High', baseDailyRiskZAR: 40000 },
  { id: 'brcgs-v9', name: 'BRCGS Food Safety Issue 9', baselineMonths: 9, complexity: 'Very High', baseDailyRiskZAR: 55000 },
  { id: 'globalgap-v6', name: 'GLOBALG.A.P. Version 6 Smart', baselineMonths: 5, complexity: 'Medium', baseDailyRiskZAR: 30000 },
  { id: 'as9100', name: 'AS9100 Rev D (Aerospace QMS)', baselineMonths: 10, complexity: 'Very High', baseDailyRiskZAR: 65000 },
];

const READINESS_LEVELS = [
  { value: 10, label: 'Greenfield', description: 'Starting from scratch without documented systems.', timelineMultiplier: 1.5, baselineSuccess: 45, riskFactor: 1.35 },
  { value: 40, label: 'Partially Documented', description: 'Written procedures exist but need auditing & refinement.', timelineMultiplier: 1.1, baselineSuccess: 65, riskFactor: 1.15 },
  { value: 70, label: 'Active Systems', description: 'Systems operational daily; requires gap remediation.', timelineMultiplier: 0.7, baselineSuccess: 80, riskFactor: 0.90 },
  { value: 90, label: 'Pre-Audit Verification', description: 'Internal audits complete; ready for 3rd-party audit.', timelineMultiplier: 0.4, baselineSuccess: 92, riskFactor: 0.70 },
];

export default function ComplianceCalculator({ onInquire }: ComplianceCalculatorProps) {
  const [selectedStandardId, setSelectedStandardId] = useState(STANDARDS[0].id);
  const [staffSize, setStaffSize] = useState(75);
  const [siteCount, setSiteCount] = useState(2);
  const [readinessVal, setReadinessVal] = useState(40);
  const [includeYitzakSupport, setIncludeYitzakSupport] = useState(true);

  // Computed Outputs
  const [timeline, setTimeline] = useState(0);
  const [successRate, setSuccessRate] = useState(0);
  const [hoursSaved, setHoursSaved] = useState(0);
  const [dailyRiskZAR, setDailyRiskZAR] = useState(0);
  const [daysSaved, setDaysSaved] = useState(0);
  const [totalMitigatedZAR, setTotalMitigatedZAR] = useState(0);
  const [totalMitigatedUSD, setTotalMitigatedUSD] = useState(0);

  const selectedStandard = STANDARDS.find(s => s.id === selectedStandardId) || STANDARDS[0];
  const readinessObj = READINESS_LEVELS.find(r => r.value === readinessVal) || READINESS_LEVELS[1];

  useEffect(() => {
    // 1. Unassisted vs Assisted Timeline Calculation (Months)
    const sizeFactor = Math.log10(staffSize / 10) * 0.15;
    const siteFactor = (siteCount - 1) * 0.12;
    const rawTimeline = selectedStandard.baselineMonths * readinessObj.timelineMultiplier * (1 + sizeFactor + siteFactor);
    
    const assistedTimeline = rawTimeline * 0.65;
    const activeTimeline = includeYitzakSupport ? assistedTimeline : rawTimeline;
    const finalTimelineMonths = Math.max(1.5, Math.min(18, Math.round(activeTimeline * 10) / 10));
    setTimeline(finalTimelineMonths);

    // 2. Success Rate Calculation (%)
    let computedSuccess = readinessObj.baselineSuccess;
    if (selectedStandard.complexity === 'High') computedSuccess -= 5;
    if (selectedStandard.complexity === 'Very High') computedSuccess -= 10;
    computedSuccess -= (siteCount - 1) * 2;

    if (includeYitzakSupport) {
      computedSuccess = Math.min(99.4, computedSuccess + 25);
    } else {
      computedSuccess = Math.max(35, Math.min(95, computedSuccess));
    }
    setSuccessRate(Math.round(computedSuccess * 10) / 10);

    // 3. Hours Saved Calculation
    const totalComplianceHours = (selectedStandard.baselineMonths * 80) * (1 + (staffSize / 300)) * (1 + (siteCount * 0.2));
    const computedHours = includeYitzakSupport ? Math.round(totalComplianceHours * 0.45) : 0;
    setHoursSaved(computedHours);

    // 4. Facility-Scaled Financial Risk Model
    // Daily risk scales directly with staff size, site count, readiness and scheme complexity
    const calculatedDailyRisk = (selectedStandard.baseDailyRiskZAR + (staffSize * 350)) * siteCount * readinessObj.riskFactor;
    setDailyRiskZAR(Math.round(calculatedDailyRisk));

    // Working days saved (21.5 working days per month)
    const monthDifference = rawTimeline - assistedTimeline;
    const workingDaysSaved = Math.max(10, Math.round(monthDifference * 21.5));
    setDaysSaved(workingDaysSaved);

    // Total Financial Risk Mitigated = Daily Risk x Days Saved
    const mitigatedZAR = includeYitzakSupport ? Math.round(calculatedDailyRisk * workingDaysSaved) : 0;
    setTotalMitigatedZAR(mitigatedZAR);
    setTotalMitigatedUSD(Math.round(mitigatedZAR / 18.5)); // 1 USD ≈ 18.5 ZAR

  }, [selectedStandardId, staffSize, siteCount, readinessVal, includeYitzakSupport]);

  const handleBookInquiry = () => {
    const notesString = `[Compliance & Scaled Financial Risk Summary]
Target Standard: ${selectedStandard.name}
Facility Scale: ${staffSize} Staff (FTEs), ${siteCount} Site(s)
Initial Readiness: ${readinessObj.label} (${readinessVal}%)
Yitzak Advisory & Training Support: ${includeYitzakSupport ? 'ACTIVE' : 'INACTIVE'}
--------------------------------------------------
Target Timeline: ${timeline} Months
Projected Audit Pass Rate: ${successRate}%
Engineering Hours Saved: ${includeYitzakSupport ? hoursSaved + ' Hours' : 'N/A'}
Estimated Daily Risk Exposure: R ${dailyRiskZAR.toLocaleString('en-ZA')} ZAR/day
Days of Audit Delay Prevented: ${daysSaved} Working Days
Total Risk Exposure Value Mitigated: ${includeYitzakSupport ? 'R ' + totalMitigatedZAR.toLocaleString('en-ZA') + ' ZAR (~$' + totalMitigatedUSD.toLocaleString() + ' USD)' : 'N/A'}`;
    
    onInquire(notesString);
  };

  return (
    <div id="compliance-roi-calculator" className="pt-24 pb-16 sm:pt-24 sm:pb-20 md:pt-24 md:pb-20 bg-[#F9F9F9] border-t border-b border-[#E5E5E5] scroll-mt-[150px] font-sans">
      <div className="max-w-[1280px] mx-auto px-4 md:px-16">
        
        {/* Header Block */}
        <div className="text-center mb-10 max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#B68A35]/10 border border-[#B68A35]/30 rounded-full">
            <Sparkles size={13} className="text-[#B68A35]" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#B68A35]">Executive Decision Tool</span>
          </div>
          <h2 className="font-serif text-3xl md:text-[38px] text-primary font-bold tracking-tight">
            Compliance &amp; ROI Calculator
          </h2>
          <p className="font-sans text-xs md:text-sm text-ash leading-relaxed">
            Estimate compliance timelines, audit pass likelihood, and facility-scaled financial risk mitigation tailored to your organisation in South Africa.
          </p>
        </div>

        {/* Main Card Container */}
        <div className="bg-white border border-[#E5E5E5] rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left Inputs Column (7 Cols) */}
          <div className="lg:col-span-7 p-6 md:p-8 space-y-6">
            
            {/* Step 1: Standard Selection Dropdown */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-primary">
                <span>1. Target Standard</span>
                <span className="text-[10px] text-ash normal-case font-normal">
                  Complexity: <strong className="text-[#B68A35] font-mono">{selectedStandard.complexity}</strong>
                </span>
              </div>
              <div className="relative">
                <select
                  value={selectedStandardId}
                  onChange={(e) => setSelectedStandardId(e.target.value)}
                  className="w-full bg-[#F9F9F9] border border-[#E5E5E5] focus:border-[#023625] text-xs font-bold text-primary rounded-xl py-3 pl-4 pr-10 appearance-none cursor-pointer outline-none transition-colors"
                >
                  {STANDARDS.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ash pointer-events-none" />
              </div>
            </div>

            {/* Step 2: Scale Controls */}
            <div className="space-y-4 pt-4 border-t border-[#E5E5E5]">
              <div className="text-xs font-semibold uppercase tracking-wider text-primary">
                2. Facility Scale
              </div>

              {/* Staff Slider */}
              <div className="space-y-2 bg-[#F9F9F9] p-3.5 rounded-xl border border-[#E5E5E5]/60">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-charcoal font-medium flex items-center gap-1.5">
                    <Users size={14} className="text-[#B68A35]" />
                    Staff Size (FTEs)
                  </span>
                  <span className="font-mono font-bold text-xs text-[#023625] bg-white px-2.5 py-1 rounded-md border border-[#E5E5E5]">
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
                  className="w-full h-1.5 bg-[#E5E5E5] rounded-lg appearance-none cursor-pointer accent-[#B68A35]"
                />
              </div>

              {/* Site Count Slider */}
              <div className="space-y-2 bg-[#F9F9F9] p-3.5 rounded-xl border border-[#E5E5E5]/60">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-charcoal font-medium flex items-center gap-1.5">
                    <Building2 size={14} className="text-[#B68A35]" />
                    Operating Sites
                  </span>
                  <span className="font-mono font-bold text-xs text-[#023625] bg-white px-2.5 py-1 rounded-md border border-[#E5E5E5]">
                    {siteCount} {siteCount === 1 ? 'Site' : 'Sites'}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="1"
                  value={siteCount}
                  onChange={(e) => setSiteCount(Number(e.target.value))}
                  className="w-full h-1.5 bg-[#E5E5E5] rounded-lg appearance-none cursor-pointer accent-[#B68A35]"
                />
              </div>
            </div>

            {/* Step 3: Current Readiness */}
            <div className="space-y-2.5 pt-4 border-t border-[#E5E5E5]">
              <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-primary">
                <span>3. Current Readiness</span>
                <span className="text-[11px] font-mono text-[#B68A35] font-bold">{readinessObj.label}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {READINESS_LEVELS.map(level => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => setReadinessVal(level.value)}
                    className={`py-2.5 px-2 rounded-xl border text-xs text-center transition-all cursor-pointer ${
                      readinessVal === level.value
                        ? 'border-[#B68A35] bg-[#B68A35]/10 font-bold text-primary shadow-xs'
                        : 'border-[#E5E5E5] bg-white text-ash hover:border-[#B68A35]/40'
                    }`}
                  >
                    <span className="block font-mono text-xs">{level.value}%</span>
                    <span className="block text-[10px] truncate leading-tight mt-0.5">{level.label}</span>
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-ash italic bg-[#F9F9F9] p-2.5 rounded-lg border border-[#E5E5E5]/60">
                "{readinessObj.description}"
              </p>
            </div>

            {/* Accelerator Toggle */}
            <div className="pt-4 border-t border-[#E5E5E5] flex items-center justify-between bg-[#023625]/5 p-4 rounded-xl border border-[#023625]/10">
              <div className="space-y-0.5 pr-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#023625]">
                  <AppIcon name="verified_user" size={18} color="#B68A35" />
                  <span>Apply Yitzak Guided Accelerator</span>
                </div>
                <p className="text-[11px] text-ash">
                  Leverage structured syllabi, gap analysis templates, and expert mock audits to cut timelines by ~35%.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIncludeYitzakSupport(!includeYitzakSupport)}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer relative shrink-0 ${
                  includeYitzakSupport ? 'bg-[#023625]' : 'bg-[#E5E5E5]'
                }`}
              >
                <div 
                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                    includeYitzakSupport ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

          </div>

          {/* Right Outputs Column (5 Cols) */}
          <div className="lg:col-span-5 bg-[#023625] text-white p-6 md:p-8 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-white/10 relative">
            <div className="space-y-6">
              <div className="flex items-center gap-2.5 border-b border-white/10 pb-4">
                <AppIcon name="calculate" size={24} color="#DFC181" />
                <div>
                  <h3 className="font-serif text-lg font-bold text-white">Projected Outcomes</h3>
                  <span className="text-[10px] font-mono text-[#DFC181] uppercase tracking-wider">Dynamic Assessment Summary</span>
                </div>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-[#B68A35]">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Estimated Time</span>
                    <Clock size={14} />
                  </div>
                  <div className="text-2xl font-mono font-bold text-white">
                    {timeline} <span className="text-xs font-sans font-normal text-white/70">mo</span>
                  </div>
                  <span className="text-[10px] text-white/60 block">To audit readiness</span>
                </div>

                <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-[#B68A35]">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Pass Likelihood</span>
                    <TrendingUp size={14} />
                  </div>
                  <div className="text-2xl font-mono font-bold text-white">
                    {successRate}%
                  </div>
                  <span className="text-[10px] text-white/60 block">1st-attempt audit pass</span>
                </div>
              </div>

              {/* Impact Callouts */}
              <div className="space-y-3 pt-2 border-t border-white/10 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-white/80">Engineering Hours Saved:</span>
                  <span className="font-mono font-bold text-[#B68A35] bg-white/5 px-2 py-0.5 rounded border border-white/10">
                    {includeYitzakSupport ? `${hoursSaved.toLocaleString()} hrs` : '0 hrs'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-white/80">Est. Daily Risk Exposure:</span>
                  <span className="font-mono font-bold text-amber-300 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                    R {dailyRiskZAR.toLocaleString('en-ZA')} / day
                  </span>
                </div>

                <div className="flex justify-between items-start pt-1">
                  <span className="text-white/80">Total Risk Exposure Mitigated:</span>
                  <div className="text-right">
                    <span className="font-mono font-bold text-emerald-400 text-sm block">
                      {includeYitzakSupport ? `R ${totalMitigatedZAR.toLocaleString('en-ZA')}` : 'R 0'}
                    </span>
                    {includeYitzakSupport && (
                      <span className="text-[10px] text-white/50 font-mono">
                        ~${totalMitigatedUSD.toLocaleString()} USD ({daysSaved} days saved)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {!includeYitzakSupport && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-[11px] flex items-start gap-2">
                  <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
                  <span>Unassisted implementation increases failure probabilities and typically adds 3–5 months in delays.</span>
                </div>
              )}
            </div>

            {/* Bottom CTA */}
            <div className="pt-6 border-t border-white/10 space-y-3">
              <p className="text-[11px] text-white/70 text-center">
                Want a formal proposal matching these specs?
              </p>
              <button
                type="button"
                onClick={handleBookInquiry}
                className="w-full bg-[#B68A35] hover:bg-[#a3792b] text-white font-sans font-bold text-xs uppercase tracking-widest py-3.5 px-4 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 shadow-md"
              >
                <span>Request Custom Quote &amp; Plan</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}


