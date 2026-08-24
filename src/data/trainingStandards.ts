export interface TrainingCourseItem {
  title: string;
  description: string;
  tags: string[];
}

export interface TrainingCategory {
  id: string;
  label: string;
  title: string;
  badge: string;
  description: string;
  courses: TrainingCourseItem[];
}

/**
 * Current Professional Training Standards offered by Yitzak & FoodChain ID.
 * Standards covered:
 * 1. ISO 9001 (Quality Management)
 * 2. ISO 14001 (Environmental Management)
 * 3. ISO 45001 (Occupational Health & Safety)
 * 4. ISO 22000 & FSSC 22000 (Food Safety Management Systems)
 * 5. BRCGS (Global Standard for Food Safety & Packaging)
 * 6. GLOBALG.A.P. (Good Agricultural Practice)
 * 7. HACCP & GMP (Core Hazard Analysis & Prerequisite Programmes)
 * 8. Integrated Management Systems (IMS)
 */
export const PORTFOLIO_CATEGORIES: TrainingCategory[] = [
  {
    id: 'food-safety',
    label: 'Food Safety & GFSI',
    title: 'Food Safety & GFSI Standards',
    badge: 'ISO 22000 / FSSC 22000 / BRCGS / HACCP',
    description: 'Comprehensive capability programmes across leading global food safety benchmarks, prerequisite controls, and GFSI schemes.',
    courses: [
      {
        title: 'ISO 22000:2018 Food Safety Management System (FSMS)',
        description: 'Comprehensive understanding of ISO 22000 requirements, hazard control plans, prerequisite programmes (PRPs), and system implementation.',
        tags: ['ISO 22000', 'FSMS', 'Implementation']
      },
      {
        title: 'FSSC 22000 Version 6 Implementation & Internal Auditor',
        description: 'Complete guidance on FSSC 22000 scheme requirements, ISO/TS sector PRPs, food defence, food fraud (TACCP/VACCP), and audit protocols.',
        tags: ['FSSC 22000', 'GFSI', 'Internal Auditor']
      },
      {
        title: 'BRCGS Global Standard for Food Safety (Issue 9)',
        description: 'In-depth training for implementing, maintaining, and auditing against the benchmarked BRCGS Food Safety standard and senior management commitment.',
        tags: ['BRCGS', 'GFSI', 'Food Safety']
      },
      {
        title: 'BRCGS Packaging Materials (Issue 7)',
        description: 'Rigorous compliance, hazard and risk management (HARA), and hygiene standards for primary and secondary food packaging manufacturers.',
        tags: ['BRCGS Packaging', 'HARA', 'Manufacturing']
      },
      {
        title: 'HACCP Advanced Practitioner & Food Safety Principles',
        description: 'Systematic hazard analysis, critical control point (CCP) determination, critical limits, monitoring procedures, and verification protocols.',
        tags: ['HACCP', 'Codex', 'Risk Analysis']
      },
      {
        title: 'Good Manufacturing Practices (GMP) & Hygiene Controls',
        description: 'Core prerequisite programmes, sanitation standards, allergen management, personal hygiene, and contamination prevention.',
        tags: ['GMP', 'PRPs', 'Hygiene']
      },
      {
        title: 'Food Defence & Food Fraud Mitigation (TACCP & VACCP)',
        description: 'Methodologies to assess vulnerability to economically motivated adulteration and intentional contamination across the supply chain.',
        tags: ['TACCP', 'VACCP', 'Supply Chain']
      },
      {
        title: 'Food Safety Culture Maturity & Leadership',
        description: 'Actionable strategies to measure, cultivate, and elevate food safety culture, workforce engagement, and operational accountability.',
        tags: ['Culture', 'Leadership', 'Governance']
      }
    ]
  },
  {
    id: 'agriculture',
    label: 'GLOBALG.A.P. & Agriculture',
    title: 'GLOBALG.A.P. & Agricultural Standards',
    badge: 'GLOBALG.A.P. v6 / Farm Assurance',
    description: 'On-farm safety, sustainable agricultural practices, traceability, and farm assurance training for primary producers and exporters.',
    courses: [
      {
        title: 'GLOBALG.A.P. IFA Version 6 Smart & GGN Implementation',
        description: 'Detailed roadmap for achieving and maintaining compliance with GLOBALG.A.P. Integrated Farm Assurance (IFA) Version 6 standards.',
        tags: ['GLOBALG.A.P.', 'IFA v6', 'Agriculture']
      },
      {
        title: 'GLOBALG.A.P. Farm Internal Assessor & Quality Management',
        description: 'Techniques for conducting internal farm inspections, multi-site producer group audits, and managing Option 2 quality management systems.',
        tags: ['Assessor', 'Option 2', 'QMS']
      },
      {
        title: 'Good Agricultural Practices (GAP) & Soil / Water Management',
        description: 'Practical training on pre-harvest microbial risk mitigation, water quality testing, fertilizer stewardship, and worker welfare compliance.',
        tags: ['GAP', 'Sustainability', 'Compliance']
      },
      {
        title: 'Produce Traceability & Post-Harvest Packhouse Controls',
        description: 'Establishing unbroken batch traceability from field to export container, including cold-chain management and packhouse hygiene.',
        tags: ['Traceability', 'Packhouse', 'Export']
      }
    ]
  },
  {
    id: 'quality',
    label: 'ISO 9001 (Quality)',
    title: 'Quality Management Systems (QMS)',
    badge: 'ISO 9001:2015',
    description: 'Structured methodologies to drive customer satisfaction, process consistency, risk-based thinking, and ISO 9001 compliance.',
    courses: [
      {
        title: 'ISO 9001:2015 Quality Management System Implementation',
        description: 'Step-by-step roadmap for architecting, documenting, and deploying a robust Quality Management System tailored to your business operations.',
        tags: ['ISO 9001', 'QMS', 'Implementation']
      },
      {
        title: 'ISO 9001:2015 Internal Auditor & Lead Auditor Skills (ISO 19011)',
        description: 'Equipping audit teams with professional competence to plan, execute, report, and follow up internal and vendor quality audits.',
        tags: ['Internal Auditor', 'ISO 19011', 'Auditing']
      },
      {
        title: 'Root Cause Analysis & Corrective Action (CAPA) Workshop',
        description: 'Mastering 5-Why analysis, Fishbone (Ishikawa) diagrams, risk containment, and verification of corrective action effectiveness.',
        tags: ['CAPA', 'Problem Solving', 'Continuous Improvement']
      },
      {
        title: 'Supplier Quality Assurance & Vendor Auditing',
        description: 'Frameworks for evaluating vendor capability, establishing quality service level agreements, and conducting external supplier audits.',
        tags: ['Vendor Audit', 'Supply Chain', 'Risk']
      },
      {
        title: 'Document Control, SOP Architecture & Records Integrity',
        description: 'Best practices for managing policies, standard operating procedures, revision histories, and digital data governance.',
        tags: ['Documentation', 'SOPs', 'Governance']
      }
    ]
  },
  {
    id: 'environmental',
    label: 'ISO 14001 (Environmental)',
    title: 'Environmental Management Systems (EMS)',
    badge: 'ISO 14001:2015',
    description: 'Frameworks for environmental stewardship, legal compliance, carbon reduction, resource efficiency, and sustainable operations.',
    courses: [
      {
        title: 'ISO 14001:2015 Environmental System Implementation',
        description: 'Designing and deploying an EMS that ensures regulatory compliance, minimizes environmental footprint, and enhances corporate reputation.',
        tags: ['ISO 14001', 'EMS', 'Sustainability']
      },
      {
        title: 'Environmental Aspect & Impact Assessment Workshop',
        description: 'Systematic identification and evaluation of direct and indirect environmental aspects under normal, abnormal, and emergency conditions.',
        tags: ['Aspects & Impacts', 'Risk Assessment', 'Compliance']
      },
      {
        title: 'ISO 14001:2015 Internal Environmental Auditor',
        description: 'Conducting thorough environmental audits, evaluating compliance registers, waste management streams, and emission controls.',
        tags: ['Environmental Audit', 'ISO 19011', 'Verification']
      },
      {
        title: 'Resource Efficiency, Waste Minimisation & Circularity',
        description: 'Practical operational strategies for water stewardship, energy conservation, effluent management, and industrial waste reduction.',
        tags: ['Efficiency', 'Waste Management', 'Circular Economy']
      }
    ]
  },
  {
    id: 'ohs',
    label: 'ISO 45001 (OH&S)',
    title: 'Occupational Health & Safety (OH&S)',
    badge: 'ISO 45001:2018',
    description: 'Proactive management systems to eliminate workplace hazards, safeguard worker health, and fulfill statutory safety mandates.',
    courses: [
      {
        title: 'ISO 45001:2018 Occupational Health & Safety Implementation',
        description: 'Roadmap to establish an international standard OHSMS that protects personnel, prevents incidents, and drives continuous safety improvement.',
        tags: ['ISO 45001', 'OH&S', 'Safety Management']
      },
      {
        title: 'Hazard Identification & Risk Assessment (HIRA)',
        description: 'Practical methodology to identify workplace hazards, calculate risk scores, and establish robust hierarchies of controls.',
        tags: ['HIRA', 'Risk Control', 'Workplace Safety']
      },
      {
        title: 'ISO 45001:2018 Internal Safety Auditor Training',
        description: 'Training internal safety teams to audit operational compliance, safe work procedures, contractor safety, and emergency readiness.',
        tags: ['Safety Auditor', 'ISO 19011', 'Compliance']
      },
      {
        title: 'Incident Investigation & Root Cause Prevention',
        description: 'Structured methodologies for investigating near-misses and occupational accidents to prevent recurrence and strengthen safety protocols.',
        tags: ['Incident Investigation', 'Root Cause', 'Prevention']
      },
      {
        title: 'Health & Safety Committee Leadership & Worker Participation',
        description: 'Empowering safety representatives with statutory knowledge, inspection checklists, and worker consultation mechanisms.',
        tags: ['Safety Committee', 'Worker Consultation', 'Culture']
      }
    ]
  },
  {
    id: 'ims',
    label: 'Integrated Systems (IMS)',
    title: 'Integrated Management Systems (IMS)',
    badge: 'ISO 9001 + ISO 14001 + ISO 45001 + ISO 50001 + ISO 22000/22001',
    description: 'Unified management frameworks consolidating Quality, Environmental, OHS, Energy Management, and Food Safety into a single streamlined system.',
    courses: [
      {
        title: 'Integrated Management Systems (IMS) Implementation',
        description: 'Leveraging the ISO High-Level Structure (Annex SL) to integrate ISO 9001, ISO 14001, ISO 45001, and ISO 22000 into one coherent system.',
        tags: ['IMS', 'Annex SL', 'Integration']
      },
      {
        title: 'IMS Lead Internal Auditor (Multi-Standard Auditing)',
        description: 'Conducting comprehensive multi-standard internal audits efficiently, eliminating audit fatigue and duplicative review processes.',
        tags: ['Integrated Audit', 'ISO 19011', 'Efficiency']
      },
      {
        title: 'Business Process Harmonisation & Lean Governance',
        description: 'Eliminating redundant documentation, streamlining approval workflows, and aligning compliance requirements with commercial objectives.',
        tags: ['Process Mapping', 'Lean', 'Operational Excellence']
      }
    ]
  }
];
