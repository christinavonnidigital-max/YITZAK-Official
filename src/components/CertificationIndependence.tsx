import React from 'react';
import { ArrowLeft, Printer, ShieldCheck, Scale, Award, FileText, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';

interface CertificationIndependenceProps {
  onNavigateHome?: () => void;
  onNavigateCertifications?: () => void;
  onNavigateContact?: () => void;
}

export const CertificationIndependence: React.FC<CertificationIndependenceProps> = ({
  onNavigateHome,
  onNavigateCertifications,
  onNavigateContact
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-[#F9F9F9] min-h-screen text-[#2D3142] py-10 sm:py-14 px-4 sm:px-6 md:px-10 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header with Breadcrumb and Print */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-ash">
              {onNavigateHome && (
                <button 
                  onClick={onNavigateHome}
                  className="hover:text-[#B68A35] transition-colors cursor-pointer flex items-center gap-1"
                >
                  <ArrowLeft size={13} />
                  <span>Home</span>
                </button>
              )}
              <span>/</span>
              {onNavigateCertifications && (
                <>
                  <button 
                    onClick={onNavigateCertifications}
                    className="hover:text-[#B68A35] transition-colors cursor-pointer"
                  >
                    Certifications
                  </button>
                  <span>/</span>
                </>
              )}
              <span className="text-[#B68A35] font-semibold">Independence &amp; Impartiality</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl text-primary font-bold tracking-tight">
              Certification Independence &amp; Impartiality Statement
            </h1>
            <p className="text-xs sm:text-sm text-ash">
              Governance notice regarding Certification Bodies (CBs), FoodChain ID, and ISO/IEC 17021-1:2015 Clause 5.2 compliance
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 no-print">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-border text-xs font-serif font-bold text-primary hover:border-[#B68A35] hover:text-[#B68A35] transition-colors cursor-pointer shadow-2xs"
            >
              <Printer size={13} />
              <span>Print Statement</span>
            </button>
          </div>
        </div>

        {/* Regulatory Highlight Callout Box */}
        <div className="bg-[#FAF7F0] border-2 border-[#B68A35]/40 rounded-2xl p-5 sm:p-6 shadow-sm flex items-start gap-4">
          <Scale size={24} className="text-[#B68A35] shrink-0 mt-1" />
          <div className="space-y-1.5 text-xs sm:text-sm text-on-surface">
            <span className="font-mono text-xs uppercase font-bold text-[#023625] tracking-wider block">
              Accreditation Standard Requirement · ISO/IEC 17021-1:2015 Clause 5.2
            </span>
            <p className="leading-relaxed text-on-surface-variant">
              International conformity assessment standards require strict structural and operational separation between 
              <strong> Management System Consultancy</strong> (Clause 5.2.5) and <strong>Third-Party Certification Bodies</strong> (Clause 5.2.9). 
              This statement defines the strict independence between Yitzak Consulting (Pty) Ltd and accredited certification bodies, including FoodChain ID.
            </p>
          </div>
        </div>

        {/* Structured Sections Container */}
        <div className="bg-white border border-border/80 rounded-2xl p-6 sm:p-10 shadow-xs space-y-10 text-xs sm:text-sm text-ash leading-relaxed">
          
          {/* Section 1: Executive Statement */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <ShieldCheck size={18} className="text-[#B68A35]" />
              <h2 className="font-serif text-lg font-bold">
                1. Principle of Complete Impartiality
              </h2>
            </div>
            <p>
              Yitzak Consulting (Pty) Ltd operates as an independent management consulting, workforce capability, and compliance advisory firm. 
              We are dedicated to building competence, establishing standard operating procedures (SOPs), and assisting organisations in establishing robust Quality and Food Safety Management Systems (FSMS / QMS).
            </p>
            <p>
              We firmly uphold the principles of impartiality, transparency, and integrity. We do not participate in any commercial, financial, or promotional arrangements that compromise the autonomy or credibility of accredited third-party certification.
            </p>
          </section>

          {/* Section 2: Division of Roles Matrix */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Award size={18} className="text-[#B68A35]" />
              <h2 className="font-serif text-lg font-bold">
                2. Clear Division of Roles: Consultancy vs. Certification Body
              </h2>
            </div>
            <p>
              To ensure compliance with <strong>ISO/IEC 17021-1:2015 Clause 5.2.5</strong> (which prohibits Certification Bodies from providing management system consultancy), the roles of Yitzak Consulting and FoodChain ID are strictly segregated:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Yitzak Box */}
              <div className="bg-[#F8FAF9] border border-[#023625]/20 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#023625]" />
                  <span className="font-mono text-xs uppercase font-bold text-[#023625] tracking-wider">
                    Yitzak Consulting (Pty) Ltd
                  </span>
                </div>
                <div className="text-[11px] font-semibold text-[#B68A35] uppercase">
                  Advisory &amp; Competence Provider
                </div>
                <ul className="space-y-2 text-xs text-charcoal">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={13} className="text-[#023625] shrink-0 mt-0.5" />
                    <span>Conducts diagnostic gap assessments and readiness reviews</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={13} className="text-[#023625] shrink-0 mt-0.5" />
                    <span>Formulates SOPs, HACCP plans, and process governance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={13} className="text-[#023625] shrink-0 mt-0.5" />
                    <span>Delivers internal auditor and workforce competence training</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={13} className="text-[#023625] shrink-0 mt-0.5" />
                    <span><strong>Does NOT</strong> conduct accredited certification audits</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={13} className="text-[#023625] shrink-0 mt-0.5" />
                    <span><strong>Does NOT</strong> issue accredited ISO, FSSC, or BRCGS certificates</span>
                  </li>
                </ul>
              </div>

              {/* FoodChain ID Box */}
              <div className="bg-[#FAF7F0] border border-[#B68A35]/30 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#B68A35]" />
                  <span className="font-mono text-xs uppercase font-bold text-[#7a5a1f] tracking-wider">
                    FoodChain ID
                  </span>
                </div>
                <div className="text-[11px] font-semibold text-[#7a5a1f] uppercase">
                  Independent Certification Body &amp; Academy
                </div>
                <ul className="space-y-2 text-xs text-charcoal">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={13} className="text-[#B68A35] shrink-0 mt-0.5" />
                    <span>Independent, accredited third-party Certification Body (CB)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={13} className="text-[#B68A35] shrink-0 mt-0.5" />
                    <span>Independently plans, conducts, and scores certification audits</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={13} className="text-[#B68A35] shrink-0 mt-0.5" />
                    <span>Certification decisions made solely by independent committees</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={13} className="text-[#B68A35] shrink-0 mt-0.5" />
                    <span>Issues official accredited certificates under accreditation rules</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={13} className="text-[#B68A35] shrink-0 mt-0.5" />
                    <span><strong>Does NOT</strong> offer or provide management system consultancy</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3: Clause 5.2.9 Compliance - No Guarantees or Preferential Treatment */}
          <section className="space-y-3 bg-[#FFFDF9] border border-[#B68A35]/25 rounded-xl p-5 sm:p-6">
            <div className="flex items-center gap-2 text-primary">
              <AlertTriangle size={18} className="text-[#B68A35]" />
              <h2 className="font-serif text-lg font-bold text-[#023625]">
                3. ISO/IEC 17021-1 Clause 5.2.9 Compliance: No Guarantees or Preferential Treatment
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-charcoal font-medium">
              ISO/IEC 17021-1:2015 Clause 5.2.9 explicitly states:
            </p>
            <blockquote className="border-l-3 border-[#B68A35] pl-4 py-1 italic text-xs text-gray-700 bg-white/80 rounded-r">
              &ldquo;The certification body&rsquo;s activities shall not be marketed or offered as linked with the activities of an organization that provides management system consultancy... stating or implying that certification would be simpler, easier, faster or less expensive if the certification body were used. A certification body shall not state or imply that certification would be simpler, easier, faster or less expensive if a specified consultancy organization were used.&rdquo;
            </blockquote>
            <p className="pt-1">
              In full accordance with this standard:
            </p>
            <ul className="space-y-2 list-disc list-inside text-xs sm:text-sm text-charcoal">
              <li>
                <strong>No Guarantee of Certification:</strong> Engaging Yitzak Consulting for gap assessments, internal audits, SOP development, or training does not guarantee, state, or imply that an organisation will pass an accredited certification audit.
              </li>
              <li>
                <strong>No Simpler, Faster, or Discounted Auditing:</strong> Working with Yitzak Consulting does not make an audit through FoodChain ID (or any other certification body) simpler, easier, expedited, or less expensive.
              </li>
              <li>
                <strong>Objective Assessment:</strong> All certification audits conducted by FoodChain ID auditors are performed autonomously and evaluated strictly against normative scheme requirements without bias or leniency.
              </li>
            </ul>
          </section>

          {/* Section 4: Absolute Freedom of Choice for Clients */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <Scale size={18} className="text-[#B68A35]" />
              <h2 className="font-serif text-lg font-bold">
                4. Freedom of Choice of Certification Body
              </h2>
            </div>
            <p>
              Clients who engage Yitzak Consulting maintain complete and unrestricted freedom to select any accredited Certification Body of their choice for formal third-party certification.
            </p>
            <p>
              While Yitzak assists clients in understanding scheme requirements and can facilitate access to FoodChain ID Academy training courses, clients are never required or pressured to select FoodChain ID for their certification audit. Our advisory prepares clients to meet standard requirements regardless of which accredited certification body conducts the final assessment.
            </p>
          </section>

          {/* Section 5: FoodChain ID Academy Courses */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <FileText size={18} className="text-[#B68A35]" />
              <h2 className="font-serif text-lg font-bold">
                5. FoodChain ID Academy Educational Framework
              </h2>
            </div>
            <p>
              Yitzak Consulting collaborates with FoodChain ID Academy to facilitate access to selected scheme-approved auditor and professional training courses across Southern Africa.
            </p>
            <p>
              These training courses represent standardized educational curricula designed to build scheme competence. They do not constitute client-specific consultancy. Examinations and certifications resulting from FoodChain ID Academy courses are administered, evaluated, and issued independently by FoodChain ID in accordance with Academy criteria.
            </p>
          </section>

          {/* Section 6: Governance & Inquiries */}
          <section className="space-y-3 border-t border-border pt-6">
            <h2 className="font-serif text-base font-bold text-primary">
              6. Governance Inquiries &amp; Impartiality Feedback
            </h2>
            <p>
              If you have any questions regarding this impartiality statement or require further clarification regarding our operational boundaries with certification bodies, please contact our compliance desk:
            </p>
            <div className="bg-mist p-4 rounded-xl text-xs space-y-1 font-mono text-charcoal">
              <div><strong>Entity:</strong> Yitzak Consulting (Pty) Ltd</div>
              <div><strong>Email:</strong> info@yitzak.co.za / cgumpo@yitzak.co.za</div>
              <div><strong>Website:</strong> <a href="https://yitzak.co.za" className="text-[#B68A35] underline">yitzak.co.za</a></div>
              <div><strong>Certification Body Portal:</strong> <a href="https://www.foodchainid.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline inline-flex items-center gap-1">foodchainid.com <ExternalLink size={11} /></a></div>
            </div>
          </section>

        </div>

        {/* Bottom Navigation Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 no-print">
          <div className="flex items-center gap-3">
            {onNavigateHome && (
              <button
                onClick={onNavigateHome}
                className="text-xs font-serif font-bold text-primary hover:text-[#B68A35] transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft size={14} />
                <span>Return to Home</span>
              </button>
            )}
            {onNavigateCertifications && (
              <>
                <span className="text-gray-300">·</span>
                <button
                  onClick={onNavigateCertifications}
                  className="text-xs font-serif font-bold text-primary hover:text-[#B68A35] transition-colors cursor-pointer"
                >
                  View Certification Schemes
                </button>
              </>
            )}
          </div>
          {onNavigateContact && (
            <button
              onClick={onNavigateContact}
              className="bg-primary hover:bg-[#1f4d3a] text-white font-sans font-bold text-xs uppercase tracking-widest py-2.5 px-5 rounded-xl cursor-pointer transition-all shadow-2xs"
            >
              Contact Compliance Desk
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default CertificationIndependence;
