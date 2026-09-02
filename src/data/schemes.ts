export interface SchemePhase {
  phase: string;
  title: string;
  description: string;
}

export interface SchemeItem {
  id: string;
  code: string;
  initial: string;
  title: string;
  category: string;
  badge: string;
  badgeType: 'emerald' | 'sky' | 'indigo' | 'purple';
  shortDescription: string;
  keyPoints: string[];
  inquiryNote: string;
  overview: string;
  targetIndustries: string[];
  yitzakRole: string[];
  preparationPhases: SchemePhase[];
  accreditationNote: string;
}

export const CERTIFICATION_SCHEMES: SchemeItem[] = [
  {
    id: 'product-label',
    code: 'PROD-LABEL',
    initial: 'P',
    title: 'Product & Label',
    category: 'Products & Claims',
    badge: 'FoodChain ID Scheme',
    badgeType: 'emerald',
    shortDescription: 'Preparation and advisory for FoodChain ID certification schemes covering product claims that hold up to global market and regulatory scrutiny, including Non-GMO Project Verification, Organic, Identity Preserved, and Gluten-Free.',
    keyPoints: ['Non-GMO', 'Organic', 'Identity Preserved', 'Gluten-Free'],
    inquiryNote: 'Inquiry: Ask About Product & Label Certification Scheme (Non-GMO / Organic / Claims)',
    overview: 'Consumer demand and export regulations for verified product attributes (such as non-genetically modified ingredients, certified organic status, and allergen claims) require rigorous ingredient tracing, segregation controls, and laboratory testing protocols.',
    targetIndustries: [
      'Food & beverage manufacturers',
      'Grain millers, oilseed crushers & ingredient processors',
      'Agricultural exporters targeting North America and the EU',
      'Specialty FMCG brand owners and co-packers'
    ],
    yitzakRole: [
      'Formulation & bill-of-materials (BOM) compliance screening against scheme standards',
      'Supply chain mapping, supplier affidavit collection & traceability validation',
      'Site segregation procedures to prevent cross-contact and ingredient mixing',
      'Preparation of standard operating procedures and technical submission packs for compliance evaluation'
    ],
    preparationPhases: [
      {
        phase: 'Phase 1',
        title: 'Ingredient Risk Analysis',
        description: 'Review high-risk crops, inputs, enzymes, and carrier agents against scheme rules.'
      },
      {
        phase: 'Phase 2',
        title: 'Traceability & Segregation',
        description: 'Establish lot identification, cleanout logs, and mass balance verification.'
      },
      {
        phase: 'Phase 3',
        title: 'Documentation Pack',
        description: 'Compile supplier statements, lab test certificates, and compliance declarations.'
      },
      {
        phase: 'Phase 4',
        title: 'Submission & Coordination',
        description: 'Coordinate the next steps toward formal external assessment.'
      }
    ],
    accreditationNote: 'Yitzak provides pre-assessment advisory and compliance documentation preparation. Formal certification is conducted and issued by the relevant accredited certification body.'
  },
  {
    id: 'globalgap',
    code: 'GLOBALGAP',
    initial: 'G',
    title: 'GLOBALG.A.P.',
    category: 'Farm Assurance',
    badge: 'GFSI Benchmarked',
    badgeType: 'sky',
    shortDescription: 'Advisory and readiness support for good agricultural practice certification pathways covering food safety, traceability, and worker welfare under GFSI-benchmarked standards recognised by major international retailers.',
    keyPoints: ['Good Ag Practice', 'Chain of Custody', 'GRASP', 'Produce Handling'],
    inquiryNote: 'Inquiry: Ask About GLOBALG.A.P. Certification Preparation Scheme',
    overview: 'GLOBALG.A.P. Integrated Farm Assurance (IFA) is the primary gateway for fresh produce growers, packhouses, and exporters supplying supermarket programmes across the UK, Europe, the Middle East, and regional African retailers.',
    targetIndustries: [
      'Commercial horticultural growers and fruit/vegetable farms',
      'Packhouses and central packing facilities',
      'Fresh produce exporters and aggregator groups',
      'Cold-chain logistics and agricultural supply chains'
    ],
    yitzakRole: [
      'IFA Version 6 gap assessment across All Farm Base, Crops Base, and Fruit & Veg modules',
      'Chain of Custody (CoC) mass-balance implementation for packhouses and export hubs',
      'GRASP worker welfare risk assessments, health & safety policies, and grievance systems',
      'Internal audit team training, chemical management protocols, and pre-harvest drill'
    ],
    preparationPhases: [
      {
        phase: 'Phase 1',
        title: 'Farm Baseline Assessment',
        description: 'Detailed physical and procedural diagnostic against IFA v6 Control Points & Compliance Criteria.'
      },
      {
        phase: 'Phase 2',
        title: 'SOPs & Record Infrastructure',
        description: 'Implement spray records, water testing protocols, fertilizer storage, and hygiene checkpoints.'
      },
      {
        phase: 'Phase 3',
        title: 'Internal Audit & Worker Training',
        description: 'Execute mandatory annual internal audit, GRASP interviews, and worker safety briefings.'
      },
      {
        phase: 'Phase 4',
        title: 'External Audit Readiness',
        description: 'Final close-out of non-conformances and inspection scheduling coordination.'
      }
    ],
    accreditationNote: 'Yitzak prepares your farm and packhouse operations for audit. Official GLOBALG.A.P. certification audits are performed and certified by accredited certification bodies.'
  },
  {
    id: 'brcgs',
    code: 'BRCGS',
    initial: 'B',
    title: 'BRCGS Standard',
    category: 'Food Safety & Quality',
    badge: 'Global Standard',
    badgeType: 'indigo',
    shortDescription: 'Comprehensive preparation and advisory for globally recognised food safety certification pathways across manufacturing, packaging, storage, and distribution.',
    keyPoints: ['Food Safety Issue 9', 'Packaging', 'Storage & Dist.', 'Agents & Brokers'],
    inquiryNote: 'Inquiry: Ask About BRCGS Certification Preparation Scheme',
    overview: 'BRCGS Global Standards provide a comprehensive framework for food safety, quality management, and operational criteria required in food manufacturing, packaging converting, and supply chain logistics.',
    targetIndustries: [
      'Primary food processing, bakeries, beverage plants, and meat processing facilities',
      'Food packaging manufacturers (corrugated, flexible plastic, glass, tins)',
      'Ambient, chilled, and frozen storage and distribution warehouses',
      'Food agents, brokers, and ingredient importers'
    ],
    yitzakRole: [
      'Diagnostic gap audit against BRCGS Food Safety Issue 9 / Packaging Materials standard',
      'Food Safety Culture plan design, governance KPIs, and whistleblowing mechanism rollout',
      'Hazard Analysis and Critical Control Points (HACCP) validation and TACCP/VACCP vulnerability reviews',
      'Mock audit simulations, corrective action preventive action (CAPA) tracking, and staff coaching'
    ],
    preparationPhases: [
      {
        phase: 'Phase 1',
        title: 'Standard Gap Assessment',
        description: 'Clause-by-clause review of prerequisite programmes (PRPs), fabrication, and systems.'
      },
      {
        phase: 'Phase 2',
        title: 'HACCP & Culture Development',
        description: 'Validate hazard plans, environmental monitoring, allergen matrix, and food safety culture.'
      },
      {
        phase: 'Phase 3',
        title: 'Mock Audit & Drill',
        description: 'Simulated external audit across plant floor, traceability recall test, and records verification.'
      },
      {
        phase: 'Phase 4',
        title: 'Audit Coordination',
        description: 'Support closing findings and coordinating audit dates for external certification.'
      }
    ],
    accreditationNote: 'Yitzak delivers implementation consulting and audit readiness. BRCGS certification is formally audited and awarded by accredited certification bodies.'
  },
  {
    id: 'fssc-iso',
    code: 'FSSC-ISO',
    initial: 'F',
    title: 'FSSC 22000 & ISO Systems',
    category: 'Management Systems & Food Safety',
    badge: 'Integrated Systems',
    badgeType: 'purple',
    shortDescription: 'Advisory, gap reviews, and preparation for FSSC 22000 (Version 6), ISO 22000 (Food Safety), ISO 9001 (Quality), ISO 14001 (Environmental), ISO 45001 (OH&S), and ISO 27001 (Information Security).',
    keyPoints: ['FSSC 22000 v6', 'ISO 22000 / 22001', 'ISO 9001', 'ISO 14001', 'ISO 45001', 'ISO 27001'],
    inquiryNote: 'Inquiry: Ask About ISO & FSSC 22000 Integrated Management Schemes',
    overview: 'Integrated ISO management systems streamline quality, food safety, occupational health, and environmental compliance under the unified Annex SL High-Level Structure (HLS), cutting redundant audits and driving operational efficiency.',
    targetIndustries: [
      'Commercial manufacturers, FMCG producers, and engineering operations',
      'Food and ingredient packaging operations seeking GFSI-benchmarked FSSC 22000 v6',
      'Logistics, warehousing, and corporate service organisations across Southern Africa',
      'Multi-site enterprises requiring integrated IMS systems (Quality + Environment + Safety)'
    ],
    yitzakRole: [
      'Integrated Management System (IMS) architecture design and documentation standardisation',
      'FSSC 22000 Version 6 prerequisite programme (ISO/TS 22002-1) alignment and threat assessment',
      'ISO 9001:2015, ISO 14001:2015, and ISO 45001:2018 risk register formulation and context mapping',
      'Internal audit program governance, lead auditor mentoring, and Stage 1/Stage 2 preparation'
    ],
    preparationPhases: [
      {
        phase: 'Phase 1',
        title: 'IMS Diagnostic & Scope',
        description: 'Map internal processes, legal requirements, and existing management system controls.'
      },
      {
        phase: 'Phase 2',
        title: 'System Integration & SOPs',
        description: 'Formulate harmonised policies, risk matrices, operational procedures, and PRPs.'
      },
      {
        phase: 'Phase 3',
        title: 'Internal Audit & Management Review',
        description: 'Conduct full system internal audit cycle and chair formal executive management review.'
      },
      {
        phase: 'Phase 4',
        title: 'Stage 1 & 2 Readiness',
        description: 'Address non-conformances and coordinate external certification audit pathway.'
      }
    ],
    accreditationNote: 'Yitzak provides systems advisory and preparation support. Accredited ISO certificates and FSSC 22000 licenses are issued by accredited certification bodies.'
  }
];
