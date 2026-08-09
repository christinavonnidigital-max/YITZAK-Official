import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Download, Printer, Search, Filter, BookOpen, ArrowRight, ShieldCheck, Award, Sparkles, CheckCircle2, ExternalLink, Share2, HelpCircle } from 'lucide-react';
import { exportCapabilitySheetPDF, exportKnowledgeResourcePDF, triggerSmartPrint } from '../utils/portfolioExport';

interface KnowledgeCenterProps {
  onOpenBooking: (pillarId?: string, notes?: string) => void;
  onNavigateToContact: () => void;
}

export interface ResourceItem {
  id: string;
  title: string;
  category: 'Whitepaper' | 'Standard Brief' | 'Audit Checklist' | 'Case Study';
  refNo: string;
  fileSize: string;
  pages: number;
  publishedDate: string;
  standards: string[];
  description: string;
  keyTakeaways: string[];
}

export const KNOWLEDGE_RESOURCES: ResourceItem[] = [
  {
    id: 'res-1',
    title: 'FSSC 22000 Version 6 Transition & PRP Assessment Matrix',
    category: 'Whitepaper',
    refNo: 'YITZ-WP-2026-01',
    fileSize: '3.2 MB',
    pages: 18,
    publishedDate: 'January 2026',
    standards: ['FSSC 22000 v6', 'ISO 22000', 'PRP Verification'],
    description: 'A practical, step-by-step transition roadmap for food safety managers navigating FSSC 22000 Version 6 updates, food fraud/defense enhancements, and equipment management protocols.',
    keyTakeaways: [
      'Detailed comparison of Version 5.1 vs Version 6 additions',
      'Auditing templates for food loss and waste mitigation protocols',
      'Clear checklists for multi-site supply chain verification'
    ]
  },
  {
    id: 'res-2',
    title: 'BRCGS Issue 9 Food Safety Culture Assessment Guide',
    category: 'Standard Brief',
    refNo: 'YITZ-SB-2026-04',
    fileSize: '2.8 MB',
    pages: 12,
    publishedDate: 'February 2026',
    standards: ['BRCGS Issue 9', 'Culture', 'Leadership'],
    description: 'Framework for measuring organizational behavior, leadership engagement, and employee compliance mindset to satisfy BRCGS Issue 9 Clause 1.1.2 requirements.',
    keyTakeaways: [
      'Maturity model survey templates for shopfloor and executive personnel',
      'Action plan formulation to elevate food safety culture scores',
      'KPI dashboards for tracking behavioral compliance metrics'
    ]
  },
  {
    id: 'res-3',
    title: 'ISO Integrated Management Systems (IMS) Manual & Implementation Guide',
    category: 'Whitepaper',
    refNo: 'YITZ-WP-2026-02',
    fileSize: '4.5 MB',
    pages: 24,
    publishedDate: 'March 2026',
    standards: ['ISO 9001', 'ISO 14001', 'ISO 45001', 'IMS'],
    description: 'Harmonising Quality, Environmental, and Occupational Health & Safety into a unified, lean management architecture that eliminates document duplication and streamlines multi-standard audits.',
    keyTakeaways: [
      'High-Level Structure (Annex SL) alignment matrix',
      'Unified risk assessment methodology across quality, safety, and ESG',
      'Combined internal audit schedule and sampling procedures'
    ]
  },
  {
    id: 'res-4',
    title: 'HACCP & PCQI Verification & Validation Protocol Checklist',
    category: 'Audit Checklist',
    refNo: 'YITZ-CK-2026-08',
    fileSize: '1.9 MB',
    pages: 8,
    publishedDate: 'April 2026',
    standards: ['HACCP', 'PCQI', 'FDA FSMA'],
    description: 'Ready-to-use audit checklists and verification logs for HACCP team leaders, quality directors, and Preventive Controls Qualified Individuals (PCQI) managing export lines.',
    keyTakeaways: [
      'Critical Control Point (CCP) and Process Preventive Control monitoring logs',
      'Environmental monitoring sampling matrix and corrective action flows',
      'FDA FSMA Foreign Supplier Verification Program (FSVP) review points'
    ]
  },
  {
    id: 'res-5',
    title: 'TACCP / VACCP Threat & Vulnerability Assessment Framework',
    category: 'Whitepaper',
    refNo: 'YITZ-WP-2026-03',
    fileSize: '3.1 MB',
    pages: 15,
    publishedDate: 'May 2026',
    standards: ['TACCP', 'VACCP', 'Food Defense', 'Food Fraud'],
    description: 'Systematic methodology to protect raw materials and finished products from intentional adulteration, cyber-physical threats, and economic food fraud across international supply corridors.',
    keyTakeaways: [
      'Vulnerability Assessment Critical Control Point (VACCP) scoring tool',
      'Threat Assessment Critical Control Point (TACCP) physical security audit',
      'Supply chain authenticity testing schedules and laboratory guidelines'
    ]
  },
  {
    id: 'res-6',
    title: 'GLOBALG.A.P. Farm Assurance & Chain of Custody Standard Brief',
    category: 'Standard Brief',
    refNo: 'YITZ-SB-2026-05',
    fileSize: '2.4 MB',
    pages: 10,
    publishedDate: 'June 2026',
    standards: ['GLOBALG.A.P.', 'CoC', 'Farm Assurance'],
    description: 'Essential compliance guidelines for agricultural producers, fresh produce packhouses, and exporters aiming for GFSI-benchmarked retail buyer acceptance.',
    keyTakeaways: [
      'Good Agricultural Practice (G.A.P.) control points and compliance criteria',
      'GRASP social practice module integration guidelines',
      'Chain of Custody (CoC) traceability from farm gate to distribution center'
    ]
  },
  {
    id: 'res-7',
    title: 'Internal Audit Execution & Corrective Action (CAPA) Playbook',
    category: 'Audit Checklist',
    refNo: 'YITZ-CK-2026-09',
    fileSize: '2.1 MB',
    pages: 10,
    publishedDate: 'July 2026',
    standards: ['ISO 19011', 'CAPA', 'Root Cause Analysis'],
    description: 'Practical guide for internal audit managers on applying 5 Whys, Fishbone diagrams, and objective evidence sampling during accredited scheme internal audits.',
    keyTakeaways: [
      'Non-conformity classification criteria (Critical, Major, Minor)',
      'Root cause determination workflow to prevent audit recurrence',
      'CAPA efficacy verification timelines and close-out documentation'
    ]
  },
  {
    id: 'res-8',
    title: 'Environmental Aspect & Impact Assessment Matrix (ISO 14001:2015)',
    category: 'Case Study',
    refNo: 'YITZ-CS-2026-02',
    fileSize: '1.8 MB',
    pages: 14,
    publishedDate: 'August 2026',
    standards: ['ISO 14001', 'Sustainability', 'Carbon Footprint'],
    description: 'Field study detailing how a medium-scale food processing plant implemented life-cycle environmental aspect registers and achieved ISO 14001 certification within 6 months.',
    keyTakeaways: [
      'Aspect and impact scoring system for water, waste, and carbon emissions',
      'Legal compliance register setup for environmental permits and effluent',
      'Employee sustainability engagement and waste reduction metrics'
    ]
  }
];

export default function KnowledgeCenter({ onOpenBooking, onNavigateToContact }: KnowledgeCenterProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModalResource, setActiveModalResource] = useState<ResourceItem | null>(null);

  const categories = ['All', 'Whitepaper', 'Standard Brief', 'Audit Checklist', 'Case Study'];

  const filteredResources = KNOWLEDGE_RESOURCES.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.standards.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          item.refNo.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleDownloadPDF = (resource: ResourceItem) => {
    exportKnowledgeResourcePDF(resource);
  };

  const handlePrintPDF = (resource: ResourceItem) => {
    triggerSmartPrint(() => exportKnowledgeResourcePDF(resource));
  };

  return (
    <div className="bg-white min-h-screen text-on-surface">
      {/* Knowledge Center Hero Banner */}
      <section className="relative pt-10 md:pt-16 pb-12 px-4 md:px-16 max-w-[1280px] mx-auto">
        <div className="max-w-4xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#B68A35]/10 text-[#7a5a1f] rounded-full border border-[#B68A35]/30 text-xs font-mono font-bold uppercase tracking-widest">
            <BookOpen size={14} className="text-[#B68A35]" />
            <span>Institutional Publications &amp; Technical Library</span>
          </div>

          <h1 className="font-serif text-[36px] md:text-[54px] leading-[44px] md:leading-[62px] text-primary font-bold tracking-tight">
            Knowledge Centre
          </h1>

          <p className="font-sans text-sm md:text-lg text-on-surface-variant leading-relaxed max-w-3xl">
            Access peer-reviewed whitepapers, accredited scheme transition briefs, regulatory checklists, and operational compliance frameworks prepared by Yitzak senior technical advisors.
          </p>

          {/* Direct Action Bar */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => exportKnowledgeResourcePDF(KNOWLEDGE_RESOURCES[0])}
              className="bg-[#B68A35] hover:bg-[#a37a2e] text-white font-sans font-bold text-xs uppercase tracking-widest py-3.5 px-6 rounded cursor-pointer transition-all active:scale-95 shadow-sm inline-flex items-center gap-2"
            >
              <Download size={14} />
              <span>Download Institutional Whitepaper PDF</span>
            </button>
            <button
              onClick={() => triggerSmartPrint(() => exportKnowledgeResourcePDF(KNOWLEDGE_RESOURCES[0]))}
              className="border border-[#023625] text-[#023625] hover:bg-[#023625] hover:text-white font-sans font-bold text-xs uppercase tracking-widest py-3.5 px-6 rounded cursor-pointer transition-all active:scale-95 inline-flex items-center gap-2"
            >
              <Printer size={14} />
              <span>Print Library Summary</span>
            </button>
          </div>
        </div>
      </section>

      {/* Featured Publication Spotlight Card */}
      <section className="py-6 px-4 md:px-16 max-w-[1280px] mx-auto">
        <div className="bg-[#023625] text-white p-6 sm:p-8 md:p-10 rounded-2xl relative overflow-hidden shadow-lg border border-white/10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/15 pb-4">
            <div className="flex items-center gap-2">
              <span className="bg-[#B68A35] text-white text-[10px] font-mono uppercase tracking-widest font-bold px-3 py-1 rounded-full">
                Featured Flagship Publication
              </span>
              <span className="text-white/60 font-mono text-xs">2026 Edition</span>
            </div>
            <span className="text-xs font-mono text-[#DFC181]">Ref: YITZ-PUB-2026-FLAGSHIP</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            <div className="lg:col-span-8 space-y-3">
              <h2 className="font-serif text-2xl md:text-3xl font-bold leading-snug">
                Institutional Frameworks 2026: Developing Competence, Enabling Compliance
              </h2>
              <p className="font-sans text-xs md:text-sm text-white/85 leading-relaxed">
                A definitive technical briefing on aligning food safety management systems (FSMS), accredited schemes (FSSC 22000, BRCGS, GLOBALG.A.P.), and integrated ISO governance with modern supply-chain requirements.
              </p>
              
              <div className="flex flex-wrap gap-2 pt-2">
                {['FSSC 22000 v6', 'BRCGS Issue 9', 'ISO 9001/14001/45001', 'GFSI Alignment', 'TACCP/VACCP'].map((tag, idx) => (
                  <span key={idx} className="bg-white/10 text-white/90 border border-white/20 text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-3">
              <button
                onClick={() => exportKnowledgeResourcePDF(KNOWLEDGE_RESOURCES[0])}
                className="w-full bg-[#B68A35] hover:bg-[#a3792c] text-white font-sans text-xs uppercase tracking-widest font-bold py-3.5 px-5 rounded-lg transition-all cursor-pointer shadow-sm inline-flex items-center justify-center gap-2"
              >
                <Download size={14} />
                <span>Download Full Report (PDF)</span>
              </button>
              <button
                onClick={() => {
                  const item = KNOWLEDGE_RESOURCES[0];
                  setActiveModalResource(item);
                }}
                className="w-full border border-white/30 hover:border-white text-white font-sans text-xs uppercase tracking-widest font-bold py-3 px-5 rounded-lg transition-all cursor-pointer inline-flex items-center justify-center gap-2"
              >
                <BookOpen size={14} />
                <span>Read Key Takeaways</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Resource Catalog with Filters and Live Search */}
      <section className="py-12 px-4 md:px-16 max-w-[1280px] mx-auto space-y-8">
        
        {/* Search and Category Filter Toolbar */}
        <div className="bg-[#F9F9F9] p-4 sm:p-6 rounded-2xl border border-border space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Search Input Box */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ash" size={16} />
              <input
                type="text"
                placeholder="Search publications, standards, or reference numbers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-xs sm:text-sm text-primary placeholder:text-ash/70 focus:outline-none focus:border-[#B68A35] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ash hover:text-primary text-xs font-bold font-mono"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Filter Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-2 rounded-lg text-[11px] font-mono font-bold uppercase tracking-wider whitespace-nowrap cursor-pointer transition-all shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-primary text-white shadow-2xs'
                      : 'bg-white text-on-surface-variant border border-border hover:bg-mist'
                  }`}
                >
                  {cat === 'All' ? 'All Publications' : cat}
                </button>
              ))}
            </div>

          </div>

          <div className="flex items-center justify-between text-xs font-mono text-ash pt-2 border-t border-border/60">
            <span>Showing {filteredResources.length} of {KNOWLEDGE_RESOURCES.length} institutional resources</span>
            {(searchQuery || selectedCategory !== 'All') && (
              <button
                onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
                className="text-[#B68A35] hover:underline font-bold"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredResources.map((resource) => (
            <div
              key={resource.id}
              className="bg-white border border-border rounded-2xl p-6 hover:shadow-md hover:border-[#B68A35]/50 transition-all flex flex-col justify-between space-y-5 group"
            >
              <div className="space-y-4">
                
                {/* Header Badge Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    resource.category === 'Whitepaper'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : resource.category === 'Standard Brief'
                      ? 'bg-sky-50 text-sky-800 border-sky-200'
                      : resource.category === 'Audit Checklist'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-purple-50 text-purple-800 border-purple-200'
                  }`}>
                    {resource.category}
                  </span>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-ash">
                    <span>{resource.refNo}</span>
                    <span>•</span>
                    <span>{resource.fileSize}</span>
                  </div>
                </div>

                {/* Title and Description */}
                <div className="space-y-2">
                  <h3 className="font-serif text-lg font-bold text-primary group-hover:text-[#B68A35] transition-colors leading-snug">
                    {resource.title}
                  </h3>
                  <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                    {resource.description}
                  </p>
                </div>

                {/* Standards Tags (Wrapped correctly so no tag seeps out!) */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {resource.standards.map((std, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] bg-[#F4F4F4] text-primary border border-[#E0E0E0] px-2.5 py-0.5 rounded-md font-mono font-semibold whitespace-nowrap max-w-full"
                    >
                      {std}
                    </span>
                  ))}
                </div>

              </div>

              {/* Card Footer Actions */}
              <div className="pt-4 border-t border-border/60 flex flex-wrap items-center justify-between gap-2">
                <button
                  onClick={() => setActiveModalResource(resource)}
                  className="text-xs font-bold text-primary hover:text-[#B68A35] uppercase tracking-wider inline-flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <BookOpen size={13} />
                  <span>View Details</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePrintPDF(resource)}
                    className="p-2 border border-border text-ash hover:text-primary hover:bg-mist rounded-lg transition-colors cursor-pointer"
                    title="Print Document Record"
                  >
                    <Printer size={13} />
                  </button>
                  <button
                    onClick={() => handleDownloadPDF(resource)}
                    className="bg-[#B68A35] hover:bg-[#a37a2e] text-white font-mono text-[11px] font-bold uppercase tracking-wider py-2 px-3.5 rounded-lg transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Download size={13} />
                    <span>PDF Download</span>
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>

        {filteredResources.length === 0 && (
          <div className="text-center py-16 bg-[#F9F9F9] rounded-2xl border border-dashed border-border space-y-3">
            <HelpCircle size={32} className="text-ash mx-auto" />
            <h3 className="font-serif text-lg font-bold text-primary">No publications matched your search</h3>
            <p className="text-xs text-ash max-w-md mx-auto">
              Try adjusting your keyword or filter category. Alternatively, contact our technical desk for custom research requests.
            </p>
            <button
              onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
              className="mt-2 bg-[#B68A35] text-white font-mono text-xs uppercase tracking-wider font-bold py-2.5 px-4 rounded-lg cursor-pointer"
            >
              Clear Search &amp; Filters
            </button>
          </div>
        )}

      </section>

      {/* Advisory Consultation Section */}
      <section className="bg-[#023625] text-white py-14 px-4 md:px-16 border-t border-white/10">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <span className="text-[#B68A35] font-mono text-xs uppercase tracking-widest font-bold block">Custom Technical Studies</span>
            <h2 className="font-serif text-2xl md:text-3xl font-bold">Need a bespoke compliance gap assessment or study?</h2>
            <p className="font-sans text-xs md:text-sm text-white/80 leading-relaxed">
              Yitzak senior consultants prepare customized gap reports, technical policy formulations, and institutional audit readiness documents tailored to your facility.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              onClick={() => onOpenBooking('compliance', 'Inquiry: Custom Knowledge Briefing & Compliance Gap Study')}
              className="bg-[#B68A35] hover:bg-[#a3792c] text-white font-sans text-xs uppercase tracking-widest font-bold py-3.5 px-6 rounded-lg transition-all cursor-pointer shadow-sm inline-flex items-center justify-center gap-2"
            >
              <span>Schedule Advisory Briefing</span>
              <ArrowRight size={14} />
            </button>
            <button
              onClick={onNavigateToContact}
              className="border border-white/30 hover:border-white text-white font-sans text-xs uppercase tracking-widest font-bold py-3.5 px-6 rounded-lg transition-all cursor-pointer inline-flex items-center justify-center gap-2"
            >
              <span>Contact Desk</span>
            </button>
          </div>
        </div>
      </section>

      {/* Resource View Modal */}
      <AnimatePresence>
        {activeModalResource && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl max-w-2xl w-full border border-border shadow-2xl overflow-hidden my-8"
            >
              {/* Modal Header */}
              <div className="bg-[#023625] text-white p-6 relative">
                <button
                  onClick={() => setActiveModalResource(null)}
                  className="absolute top-5 right-5 text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                >
                  ✕
                </button>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#B68A35] text-white text-[10px] font-mono uppercase font-bold px-2.5 py-0.5 rounded-full">
                      {activeModalResource.category}
                    </span>
                    <span className="text-white/60 font-mono text-xs">{activeModalResource.refNo}</span>
                  </div>
                  <h3 className="font-serif text-xl md:text-2xl font-bold pr-8">
                    {activeModalResource.title}
                  </h3>
                  <p className="text-xs font-mono text-[#DFC181]">
                    Published: {activeModalResource.publishedDate} • {activeModalResource.fileSize} ({activeModalResource.pages} Pages)
                  </p>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                <div className="space-y-2">
                  <h4 className="font-serif font-bold text-sm text-primary uppercase tracking-wider">Executive Overview</h4>
                  <p className="font-sans text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    {activeModalResource.description}
                  </p>
                </div>

                <div className="space-y-3 bg-[#F9F9F9] p-4 rounded-xl border border-border">
                  <h4 className="font-serif font-bold text-xs text-primary uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-[#B68A35]" />
                    <span>Key Technical Takeaways &amp; Modules</span>
                  </h4>
                  <ul className="space-y-2 font-sans text-xs text-on-surface-variant">
                    {activeModalResource.keyTakeaways.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[#B68A35] font-bold">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-serif font-bold text-xs text-primary uppercase tracking-wider">Targeted Standards &amp; Schemes</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {activeModalResource.standards.map((std, idx) => (
                      <span key={idx} className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-md font-mono font-bold">
                        {std}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-[#F4F4F4] border-t border-border flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => {
                    setActiveModalResource(null);
                    onOpenBooking('compliance', `Inquiry on Knowledge Centre Resource: ${activeModalResource.title}`);
                  }}
                  className="text-xs font-bold text-primary hover:text-[#B68A35] uppercase tracking-wider inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Inquire Related Advisory</span>
                  <ArrowRight size={12} />
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePrintPDF(activeModalResource)}
                    className="border border-border bg-white text-primary hover:bg-mist text-xs font-bold py-2.5 px-4 rounded-lg cursor-pointer transition-colors inline-flex items-center gap-1.5"
                  >
                    <Printer size={13} />
                    <span>Print Record</span>
                  </button>
                  <button
                    onClick={() => handleDownloadPDF(activeModalResource)}
                    className="bg-[#B68A35] hover:bg-[#a37a2e] text-white font-mono text-xs uppercase font-bold py-2.5 px-4 rounded-lg cursor-pointer transition-all inline-flex items-center gap-1.5 shadow-2xs"
                  >
                    <Download size={13} />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
