import { jsPDF } from 'jspdf';

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
export function exportPortfolioToPDF(categories: Category[]) {
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
