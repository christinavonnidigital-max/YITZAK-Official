import React from 'react';
import { ArrowLeft, Printer } from 'lucide-react';

interface PrivacyPolicyProps {
  onNavigateHome?: () => void;
  onNavigateContact?: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({
  onNavigateHome
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-[#F9F9F9] min-h-screen text-[#2D3142] py-10 sm:py-14 px-4 sm:px-6 md:px-10 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
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
              <span className="text-[#B68A35] font-semibold">Privacy Notice</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl text-primary font-bold tracking-tight">
              Privacy Notice
            </h1>
            <p className="text-xs sm:text-sm text-ash">
              Protection of Personal Information Act (POPIA) Notice
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 no-print">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-border text-xs font-serif font-bold text-primary hover:border-[#B68A35] hover:text-[#B68A35] transition-colors cursor-pointer shadow-2xs"
            >
              <Printer size={13} />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* Five Concise Sections */}
        <div className="bg-white border border-border/80 rounded-2xl p-6 sm:p-10 shadow-xs space-y-8 text-xs sm:text-sm text-ash leading-relaxed">
          
          {/* Section 1 */}
          <section className="space-y-2">
            <h2 className="font-serif text-base font-bold text-primary">
              1. Who we are and how to contact us
            </h2>
            <p>
              <strong>Yitzak Consulting (Pty) Ltd</strong> is a quality management and food safety advisory practice based in South Africa.
            </p>
            <p>
              For any privacy enquiries or to exercise your rights under the Protection of Personal Information Act (POPIA), contact us at:
            </p>
            <ul className="list-none space-y-1 pl-1 text-xs">
              <li><strong>Email:</strong> <a href="mailto:info@yitzak.co.za" className="text-[#B68A35] hover:underline">info@yitzak.co.za</a></li>
              <li><strong>Phone:</strong> +27 (0)10 210 7715</li>
              <li><strong>Address:</strong> 359 Surrey Avenue, Ferndale / Randburg, 2194, South Africa</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-2 pt-4 border-t border-border/60">
            <h2 className="font-serif text-base font-bold text-primary">
              2. Information collected through enquiries, bookings, and services
            </h2>
            <p>
              We collect information you provide directly when requesting a consultation, booking a training course, or engaging our advisory services. This typically includes:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li>Your name, job title, and organization name</li>
              <li>Business email address and telephone number</li>
              <li>Details related to your standard of interest (e.g. ISO 9001, ISO 14001, ISO 45001, ISO 27001, ISO 22000, FSSC 22000, BRCGS) and facility scope</li>
            </ul>
            <p className="pt-1">
              Where secure client access is provided by invitation, we process the business email address and account identifiers needed to manage access and protect the service.
            </p>
            <div className="mt-3 p-3 bg-[#FAF8F5] border border-border/80 rounded-xl space-y-1">
              <h3 className="font-serif font-bold text-xs text-primary">
                Local Device Storage for Enquiries & Consultations
              </h3>
              <p className="text-xs text-ash leading-relaxed">
                When completing a consultation request, non-sensitive options (such as selected service pillar) may be remembered. Contact information and notes are stored on your device only if you explicitly check <em>"Save my progress on this device"</em>. Any saved draft remains solely within your browser’s local storage for a maximum of 7 days and is automatically removed thereafter, upon confirmed submission, or immediately when clicking <em>"Clear Draft"</em>.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-2 pt-4 border-t border-border/60">
            <h2 className="font-serif text-base font-bold text-primary">
              3. How and why we use it
            </h2>
            <p>
              We process personal information only for legitimate business purposes in connection with our services, including:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li>Responding to consultation requests, assessments, and quotation enquiries</li>
              <li>Delivering agreed consulting, auditing, and accredited training programs</li>
              <li>Issuing training attendance records and certificates</li>
              <li>Maintaining operational records and administrative communications</li>
            </ul>
            <p className="text-xs italic pt-1">
              We do not sell personal information or use it for unsolicited third-party direct marketing.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-2 pt-4 border-t border-border/60">
            <h2 className="font-serif text-base font-bold text-primary">
              4. Service providers and international transfers
            </h2>
            <p>
              We may use trusted third-party technology providers to host our digital services, secure communications, and support day-to-day operations. Where data is processed or hosted through cloud infrastructure outside South Africa, it is handled under appropriate security safeguards and confidentiality arrangements consistent with POPIA principles.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-2 pt-4 border-t border-border/60">
            <h2 className="font-serif text-base font-bold text-primary">
              5. Rights, retention, and complaints
            </h2>
            <p>
              Under POPIA, you have the right to request access to the personal information we hold about you, request the correction of inaccurate information, or object to processing where applicable.
            </p>
            <p>
              We retain personal information only for as long as necessary to fulfill the purposes for which it was collected or to comply with applicable legal and professional obligations.
            </p>
            <p>
              To exercise your rights or raise a query, please email <a href="mailto:info@yitzak.co.za" className="text-[#B68A35] font-semibold hover:underline">info@yitzak.co.za</a>. If you are not satisfied with our response, you have the right to contact the Information Regulator (South Africa) at <a href="mailto:complaints.IR@inforegulator.org.za" className="text-[#B68A35] hover:underline">complaints.IR@inforegulator.org.za</a>.
            </p>
          </section>

        </div>

      </div>
    </div>
  );
};

export default PrivacyPolicy;
