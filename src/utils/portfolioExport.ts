// Dynamic loader for jsPDF to keep the initial page bundle lightweight and fast
async function getJsPDF() {
  const { jsPDF } = await import('jspdf');
  return jsPDF;
}

interface Course {
  title: string;
  description: string;
  tags: string[];
}

interface Category {
  id: string;
  label: string;
  title: string;
  badge: string;
  description?: string;
  courses: Course[];
}

/**
 * Cleanly exports the current training portfolio categories as a CSV file.
 * Spreadsheet-friendly, supports standard excel import.
 */
export function exportPortfolioToCSV(categories: Category[]) {
  const headers = ['Category', 'Course Title', 'Description', 'Key Tags/Certifications'];
  const rows = [];

  for (const cat of categories) {
    for (const course of cat.courses) {
      // Escape quotes in content
      const categoryLabel = cat.label.replace(/"/g, '""');
      const title = course.title.replace(/"/g, '""');
      const description = course.description.replace(/"/g, '""');
      const tags = course.tags.join(', ').replace(/"/g, '""');

      rows.push([
        `"${categoryLabel}"`,
        `"${title}"`,
        `"${description}"`,
        `"${tags}"`
      ]);
    }
  }

  const csvContent = [
    headers.join(','),
    ...rows.map(e => e.join(','))
  ].join('\n');

  // Trigger browser download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'Yitzak_Training_Portfolio_2026.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exports the training portfolio as a professional, corporate PDF.
 * Styled to fit the Yitzak identity (Forest green and antique gold highlights).
 * Includes auto-wrap, dynamic height calculation, and clean page breaks.
 */
export async function exportPortfolioToPDF(categories: Category[]) {
  const jsPDF = await getJsPDF();
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageHeight = 297;
  const pageWidth = 210;
  const marginX = 15;
  const contentWidth = pageWidth - (marginX * 2); // 180mm
  
  let y = 15;
  let pageCount = 1;

  // Helper to draw clean footers on all pages
  const drawFooter = (pageNum: number) => {
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(115, 115, 115); // Ash gray
    // Bottom border line above footer
    doc.setDrawColor(229, 229, 229);
    doc.setLineWidth(0.3);
    doc.line(marginX, pageHeight - 15, pageWidth - marginX, pageHeight - 15);
    
    doc.text(`Page ${pageNum}`, pageWidth - marginX, pageHeight - 10, { align: 'right' });
    doc.text('CONFIDENTIAL - YITZAK Professional Training Division © 2026', marginX, pageHeight - 10);
  };

  // Helper for check page break
  const checkSpace = (neededHeight: number) => {
    // If we exceed printable boundary, create a new page
    if (y + neededHeight > pageHeight - 22) {
      drawFooter(pageCount);
      doc.addPage();
      pageCount++;
      y = 20; // reset y with top margin

      // Subsequent page mini-header
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(2, 54, 37); // Yitzak Primary Forest Green
      doc.text('YITZAK INSTITUTIONAL ADVISORY  |  PROFESSIONAL TRAINING PORTFOLIO', marginX, y);
      
      doc.setDrawColor(182, 138, 53); // Antique Gold
      doc.setLineWidth(0.4);
      doc.line(marginX, y + 2, pageWidth - marginX, y + 2);
      
      y += 10;
    }
  };

  // --- PAGE 1 COVER / HEADER BLOCK ---
  // Top thick gold bar
  doc.setFillColor(182, 138, 53); // Antique Gold
  doc.rect(0, 0, pageWidth, 4, 'F');

  y = 20;
  // Brand Header
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(2, 54, 37); // Yitzak Forest Green
  doc.text('Y I T Z A K', marginX, y);

  y += 6;
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(125, 88, 0); // Warm gold
  doc.text('INSTITUTIONAL COMPLIANCE, MANAGEMENT SYSTEMS & RISK ADVISORY', marginX, y);

  y += 10;
  // Title
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(43, 43, 43); // Dark charcoal
  doc.text('PROFESSIONAL TRAINING PORTFOLIO', marginX, y);

  y += 5;
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(115, 115, 115);
  doc.text('Official Curriculum Guide & Certified Programmes  |  Year: 2026', marginX, y);

  y += 4;
  doc.setDrawColor(229, 229, 229);
  doc.setLineWidth(0.5);
  doc.line(marginX, y, pageWidth - marginX, y);

  y += 10;
  // Corporate intro text
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(65, 73, 68); // Soft charcoal
  const introText = 'This document presents the professional training portfolio of Yitzak, including selected FoodChain ID Academy courses available through our partnership. Our programmes are designed to build practical capability, support compliance with internationally aligned standards, and develop capable people across your organisation.';
  const introLines = doc.splitTextToSize(introText, contentWidth);
  doc.text(introLines, marginX, y);
  
  y += (introLines.length * 4.5) + 8;

  // Render categories and courses
  for (const cat of categories) {
    // 1. Render Category Title Block
    checkSpace(18);
    
    // Fill category banner backgrounds
    doc.setFillColor(249, 249, 249);
    doc.rect(marginX, y, contentWidth, 10, 'F');
    
    // Left highlight bar
    doc.setFillColor(2, 54, 37); // Forest Green
    doc.rect(marginX, y, 3, 10, 'F');

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(2, 54, 37);
    doc.text(cat.title.toUpperCase(), marginX + 6, y + 6.5);

    // Badge tag right-aligned inside the banner
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(182, 138, 53); // Gold
    doc.text(cat.badge, pageWidth - marginX - 4, y + 6.5, { align: 'right' });

    y += 15;

    // 2. Render Courses
    for (const course of cat.courses) {
      // Split description text early to calculate its exact line count
      const descLines = doc.splitTextToSize(course.description, contentWidth - 4);
      const blockHeight = 4 + (descLines.length * 4.5) + 6; // title space + desc lines + tags gap + safety padding

      checkSpace(blockHeight);

      // Course title (with bullet circle or custom bullet)
      doc.setFillColor(182, 138, 53); // gold dot
      doc.circle(marginX + 2, y - 1, 0.8, 'F');

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(43, 43, 43);
      doc.text(course.title, marginX + 6, y);

      y += 5;

      // Course description
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(65, 73, 68);
      doc.text(descLines, marginX + 6, y);

      y += (descLines.length * 4.2) + 2;

      // Tags inline list
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(125, 88, 0); // Gold
      doc.text(`Focus Areas: ${course.tags.join('  |  ')}`, marginX + 6, y);

      y += 8; // Spacer between courses
    }
    
    y += 5; // Extra gap between categories
  }

  // Draw final footer
  drawFooter(pageCount);

  // Download PDF
  doc.save('Yitzak_Training_Portfolio_2026.pdf');
}

/**
 * Exports an individual course syllabus specification as a formal PDF document.
 */
export async function exportCourseSyllabusPDF(course: any) {
  const jsPDF = await getJsPDF();
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageHeight = 297;
  const pageWidth = 210;
  const marginX = 15;
  const contentWidth = pageWidth - (marginX * 2);

  // Gold header accent bar
  doc.setFillColor(182, 138, 53);
  doc.rect(0, 0, pageWidth, 4, 'F');

  let y = 18;

  // Header Title
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(2, 54, 37); // Yitzak Forest Green
  doc.text('Y I T Z A K', marginX, y);

  y += 5;
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(125, 88, 0);
  doc.text('INSTITUTIONAL ADVISORY | OFFICIAL SYLLABUS SPECIFICATION', marginX, y);

  y += 10;
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(43, 43, 43);
  const titleLines = doc.splitTextToSize(course.name || course.title, contentWidth);
  doc.text(titleLines, marginX, y);

  y += (titleLines.length * 6) + 2;

  // Key Stats Box
  doc.setFillColor(248, 248, 248);
  doc.rect(marginX, y, contentWidth, 22, 'F');
  doc.setDrawColor(229, 229, 229);
  doc.rect(marginX, y, contentWidth, 22, 'S');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(2, 54, 37);
  doc.text(`Ref #: ${course.no || 'REC'}`, marginX + 4, y + 6);
  doc.text(`Category: ${course.category || 'General'}`, marginX + 50, y + 6);
  doc.text(`Duration: ${course.duration || 'N/A'}`, marginX + 110, y + 6);

  doc.text(`Dates: ${course.dates || 'Scheduled Session'}`, marginX + 4, y + 14);
  doc.text(`Mode: ${course.mode || 'Online'}`, marginX + 50, y + 14);
  doc.text(`Instructor: ${course.instructor || 'Lead Auditor'}`, marginX + 110, y + 14);

  y += 30;

  // Description
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(2, 54, 37);
  doc.text('COURSE OVERVIEW & OBJECTIVES', marginX, y);

  y += 6;
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(65, 73, 68);
  const descLines = doc.splitTextToSize(course.description || '', contentWidth);
  doc.text(descLines, marginX, y);

  y += (descLines.length * 4.5) + 10;

  // Syllabus Modules
  if (course.syllabus && course.syllabus.length > 0) {
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(2, 54, 37);
    doc.text('SYLLABUS MODULES & LEARNING OUTCOMES', marginX, y);
    y += 8;

    for (const mod of course.syllabus) {
      if (y > pageHeight - 30) {
        doc.addPage();
        y = 20;
      }

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(43, 43, 43);
      doc.text(mod.title, marginX, y);

      y += 4.5;
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(125, 88, 0);
      doc.text(`Hours: ${mod.hours}  |  Accreditation: ${mod.accreditations}`, marginX, y);

      y += 5;
      if (mod.outcomes && mod.outcomes.length > 0) {
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(65, 73, 68);
        for (const out of mod.outcomes) {
          const outLines = doc.splitTextToSize(`• ${out}`, contentWidth - 5);
          doc.text(outLines, marginX + 3, y);
          y += (outLines.length * 4);
        }
      }
      y += 4;
    }
  }

  // Footer
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(115, 115, 115);
  doc.text('CONFIDENTIAL - YITZAK Professional Training Division © 2026', marginX, pageHeight - 10);

  const cleanFilename = (course.name || 'Syllabus').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
  doc.save(`Yitzak_Syllabus_${cleanFilename}.pdf`);
}

/**
 * Safely triggers window.print(). If blocked by iframe sandbox or browser restrictions,
 * it safely catches the error and executes a fallback (e.g. PDF generation).
 */
export function triggerSmartPrint(fallbackFn?: () => void) {
  try {
    window.print();
  } catch (err) {
    console.warn('Native window.print() failed or restricted in frame:', err);
    if (fallbackFn) {
      fallbackFn();
    }
  }
}

/**
 * Exports the Yitzak Official Institutional Capabilities Statement as a professional PDF document.
 * Includes letterhead, accreditation credentials, 4 advisory pillars, and contact information.
 */
export async function exportCapabilitySheetPDF(type: string = 'capability_sheet') {
  try {
    const jsPDF = await getJsPDF();
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageHeight = 297;
    const pageWidth = 210;
    const marginX = 15;
    const contentWidth = pageWidth - (marginX * 2);

    // Top thick gold bar accent
    doc.setFillColor(182, 138, 53); // Antique Gold #B68A35
    doc.rect(0, 0, pageWidth, 4, 'F');

    let y = 18;

    // Header Title
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(2, 54, 37); // Yitzak Forest Green #023625
    doc.text('Y I T Z A K', marginX, y);

    y += 5;
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(125, 88, 0); // Warm gold
    doc.text('INSTITUTIONAL ADVISORY, COMPLIANCE & CAPABILITY BUILDING', marginX, y);

    // Ref Box (Top Right)
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`REF: YITZ-CAP-2026-SA`, pageWidth - marginX, 18, { align: 'right' });
    doc.text(`DATE: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`, pageWidth - marginX, 23, { align: 'right' });

    y += 10;
    doc.setDrawColor(229, 229, 229);
    doc.setLineWidth(0.5);
    doc.line(marginX, y, pageWidth - marginX, y);

    y += 10;

    const docTitle = type === 'certification_portfolio'
      ? 'ACCREDITED CERTIFICATION PORTFOLIO & AUDIT READINESS'
      : type === 'consulting_statement'
      ? 'CONSULTING & ADVISORY CAPABILITIES STATEMENT'
      : 'BUSINESS PROCESS IMPLEMENTATION CAPABILITY SHEET';

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(2, 54, 37);
    doc.text(docTitle, marginX, y);

    y += 7;
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(65, 73, 68);
    const introText = 'Yitzak is a specialized compliance, audit, and capability consulting practice delivering across Southern Africa. Through our official partnership with FoodChain ID, we provide access to selected FoodChain ID Academy training courses and accredited certification pathways, alongside practical management system advisory.';
    const introLines = doc.splitTextToSize(introText, contentWidth);
    doc.text(introLines, marginX, y);

    y += (introLines.length * 4.5) + 8;

    // Four Pillars Box
    const pillars = [
      {
        title: '1. Professional Training',
        desc: 'Instructor-led competence building across BRCGS, FSSC 22000, ISO 22000 & HACCP. Official partner with FoodChain ID Academy.'
      },
      {
        title: '2. Consulting & Advisory',
        desc: 'Practical guidance to implement learning, gap assessments, management system formulation, SOP drafting, and internal audits.'
      },
      {
        title: '3. Accredited Certification (FoodChain ID Audits)',
        desc: 'Official delivery of accredited FoodChain ID certification audits across GLOBALG.A.P., Non-GMO, Organic, and GFSI food safety schemes.'
      },
      {
        title: '4. Business Process Implementation',
        desc: 'Building solid operational foundations from zero, process mapping, risk controls, HR/Accounting setup, and lean audits.'
      }
    ];

    doc.setFillColor(249, 249, 249);
    doc.rect(marginX, y, contentWidth, 8, 'F');
    doc.setFillColor(2, 54, 37);
    doc.rect(marginX, y, 3, 8, 'F');

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(2, 54, 37);
    doc.text('FOUR INTEGRATED OPERATIONAL PILLARS', marginX + 6, y + 5.5);

    y += 14;

    for (const p of pillars) {
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(182, 138, 53); // Gold
      doc.text(p.title, marginX, y);

      y += 4.5;
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(65, 73, 68);
      const pLines = doc.splitTextToSize(p.desc, contentWidth - 4);
      doc.text(pLines, marginX, y);

      y += (pLines.length * 4.2) + 6;
    }

    // FoodChain ID Partnership Banner
    y += 2;
    doc.setFillColor(2, 54, 37); // Dark Green
    doc.rect(marginX, y, contentWidth, 24, 'F');

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(223, 193, 129); // Gold accent #DFC181
    doc.text('OFFICIAL FOODCHAIN ID PARTNERSHIP', marginX + 6, y + 7);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    const fcText = 'Through our global partnership with FoodChain ID, Yitzak connects clients directly to internationally accredited certification bodies and FoodChain ID Academy qualifications recognized across global supply chains.';
    const fcLines = doc.splitTextToSize(fcText, contentWidth - 12);
    doc.text(fcLines, marginX + 6, y + 13);

    y += 32;

    // Contact Info & Footer
    doc.setDrawColor(229, 229, 229);
    doc.setLineWidth(0.5);
    doc.line(marginX, y, pageWidth - marginX, y);

    y += 6;
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(2, 54, 37);
    doc.text('HEADQUARTERS & ADVISORY DESK', marginX, y);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Address: 359 Surrey Avenue, Randburg, South Africa', marginX, y + 4.5);
    doc.text('Email: info@yitzak.co.za | Website: www.yitzak.co.za', marginX, y + 8.5);

    doc.text('Developing Competence. Enabling Compliance.', pageWidth - marginX, y + 4.5, { align: 'right' });
    doc.text('© 2026 Yitzak Consulting (Pty) Ltd', pageWidth - marginX, y + 8.5, { align: 'right' });

    // Page bottom bar
    doc.setFillColor(182, 138, 53);
    doc.rect(0, pageHeight - 4, pageWidth, 4, 'F');

    const filename = type === 'certification_portfolio'
      ? 'Yitzak_Certification_Portfolio_2026.pdf'
      : type === 'consulting_statement'
      ? 'Yitzak_Advisory_Capabilities_Statement_2026.pdf'
      : 'Yitzak_Capability_Sheet_2026.pdf';

    // Download PDF document directly
    doc.save(filename);

    // Try opening PDF blob in new window for direct browser printing
    try {
      const blobUrl = doc.output('bloburl');
      if (blobUrl) {
        const printWin = window.open(blobUrl, '_blank');
        if (printWin) {
          printWin.focus();
        }
      }
    } catch (e) {
      console.warn('Browser popup blocked PDF print preview window:', e);
    }
  } catch (err) {
    console.error('Error generating capability PDF:', err);
    alert('Unable to generate capability PDF document. Please check console.');
  }
}

export interface ExportableKnowledgeResource {
  title: string;
  category: string;
  refNo: string;
  fileSize?: string;
  pages?: number;
  publishedDate?: string;
  standards: string[];
  description: string;
  keyTakeaways: string[];
}

/**
 * Exports a specific Knowledge Centre publication / whitepaper as an official Yitzak PDF document.
 */
export async function exportKnowledgeResourcePDF(resource: ExportableKnowledgeResource) {
  try {
    const jsPDF = await getJsPDF();
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageHeight = 297;
    const pageWidth = 210;
    const marginX = 15;
    const contentWidth = pageWidth - (marginX * 2);

    // Top gold bar accent
    doc.setFillColor(182, 138, 53); // Gold #B68A35
    doc.rect(0, 0, pageWidth, 4, 'F');

    let y = 18;

    // Brand Title
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(2, 54, 37); // Yitzak Forest Green #023625
    doc.text('Y I T Z A K', marginX, y);

    y += 5;
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(125, 88, 0); // Warm gold
    doc.text('INSTITUTIONAL TECHNICAL LIBRARY & ADVISORY BRIEFING', marginX, y);

    // Ref Box (Top Right)
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`REF: ${resource.refNo}`, pageWidth - marginX, 18, { align: 'right' });
    doc.text(`PUBLISHED: ${resource.publishedDate || '2026 Edition'}`, pageWidth - marginX, 23, { align: 'right' });

    y += 10;
    doc.setDrawColor(229, 229, 229);
    doc.setLineWidth(0.5);
    doc.line(marginX, y, pageWidth - marginX, y);

    y += 10;

    // Category Banner Box
    doc.setFillColor(245, 245, 245);
    doc.rect(marginX, y, contentWidth, 8, 'F');
    doc.setFillColor(2, 54, 37);
    doc.rect(marginX, y, 3, 8, 'F');

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(2, 54, 37);
    const catLabel = `${resource.category.toUpperCase()} PUBLICATION  |  ${resource.pages || 12} PAGES  |  ${resource.fileSize || 'PDF'}`;
    doc.text(catLabel, marginX + 6, y + 5.5);

    y += 14;

    // Title
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(2, 54, 37);
    const titleLines = doc.splitTextToSize(resource.title, contentWidth);
    doc.text(titleLines, marginX, y);

    y += (titleLines.length * 6) + 4;

    // Standards / Focus Tags
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(182, 138, 53);
    doc.text(`TARGET SCHEMES & STANDARDS: ${resource.standards.join('  •  ')}`, marginX, y);

    y += 8;

    // Divider
    doc.setDrawColor(240, 240, 240);
    doc.line(marginX, y, pageWidth - marginX, y);

    y += 8;

    // Executive Overview Section
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(2, 54, 37);
    doc.text('1. EXECUTIVE OVERVIEW & TECHNICAL SCOPE', marginX, y);

    y += 6;
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(65, 73, 68);
    const descLines = doc.splitTextToSize(resource.description, contentWidth);
    doc.text(descLines, marginX, y);

    y += (descLines.length * 4.5) + 8;

    // Key Takeaways Section
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(2, 54, 37);
    doc.text('2. KEY TECHNICAL TAKEAWAYS & IMPLEMENTATION MODULES', marginX, y);

    y += 7;

    for (let i = 0; i < resource.keyTakeaways.length; i++) {
      const takeaway = resource.keyTakeaways[i];
      doc.setFillColor(182, 138, 53); // Gold bullet
      doc.circle(marginX + 3, y - 1, 0.9, 'F');

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8.8);
      doc.setTextColor(43, 43, 43);
      const pointLines = doc.splitTextToSize(takeaway, contentWidth - 8);
      doc.text(pointLines, marginX + 8, y);

      y += (pointLines.length * 4.3) + 3;
    }

    y += 6;

    // Audit Readiness Box
    doc.setFillColor(249, 249, 249);
    doc.rect(marginX, y, contentWidth, 24, 'F');
    doc.setDrawColor(229, 229, 229);
    doc.rect(marginX, y, contentWidth, 24, 'S');

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(2, 54, 37);
    doc.text('COMPLIANCE & AUDIT READINESS INTEGRATION', marginX + 6, y + 6.5);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.2);
    doc.setTextColor(65, 73, 68);
    const auditText = 'This publication forms part of the Yitzak Institutional Compliance Framework. Our senior technical advisors assist facilities in translating these requirements into verified Standard Operating Procedures (SOPs), HACCP verification logs, and internal audit evidence for official certification.';
    const auditLines = doc.splitTextToSize(auditText, contentWidth - 12);
    doc.text(auditLines, marginX + 6, y + 12);

    y += 32;

    // Contact Info & Footer
    doc.setDrawColor(229, 229, 229);
    doc.setLineWidth(0.5);
    doc.line(marginX, y, pageWidth - marginX, y);

    y += 6;
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(2, 54, 37);
    doc.text('YITZAK TECHNICAL ADVISORY DESK', marginX, y);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Official Partner: FoodChain ID Academy | Randburg, South Africa', marginX, y + 4.5);
    doc.text('Advisory Inquiries: info@yitzak.co.za | www.yitzak.co.za', marginX, y + 8.5);

    doc.text('Developing Competence. Enabling Compliance.', pageWidth - marginX, y + 4.5, { align: 'right' });
    doc.text('© 2026 Yitzak Consulting (Pty) Ltd', pageWidth - marginX, y + 8.5, { align: 'right' });

    // Page bottom bar
    doc.setFillColor(182, 138, 53);
    doc.rect(0, pageHeight - 4, pageWidth, 4, 'F');

    const cleanName = resource.title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
    const filename = `Yitzak_${resource.refNo}_${cleanName}.pdf`;

    // Download PDF
    doc.save(filename);
  } catch (err) {
    console.error('Error generating knowledge resource PDF:', err);
    alert('Unable to generate publication PDF document. Please check console.');
  }
}

