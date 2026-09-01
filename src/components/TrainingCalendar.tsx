import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Grid, 
  List, 
  Info, 
  BookOpen, 
  Search, 
  Filter, 
  Clock, 
  Laptop, 
  Sparkles, 
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Shield,
  ArrowRight,
  User,
  MapPin,
  Award,
  Printer,
  FileText
} from 'lucide-react';
import { exportCourseSyllabusPDF, triggerSmartPrint } from '../utils/portfolioExport';
import YitzakLogo from './YitzakLogo';

interface SyllabusModule {
  title: string;
  hours: string;
  accreditations: string;
  outcomes: string[];
}

interface TrainingCourse {
  id: string;
  no: number;
  name: string;
  category: string;
  standardCategory: 'GFSI' | 'ISO' | 'Leadership';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  vertical: 'Food Safety' | 'Aerospace' | 'Manufacturing';
  duration: string;
  month: 'July' | 'August' | 'September';
  dates: string;
  daysList: number[]; // Exact calendar days
  time: string;
  mode: string;
  instructor: string;
  price: string;
  description: string;
  seatsTotal: number;
  seatsLeft: number;
  syllabus: SyllabusModule[];
}

const UPCOMING_COURSES: TrainingCourse[] = [
  {
    id: 'course-1',
    no: 1,
    name: 'BRC Food - Global Standard for Food Safety Issue 9: Lead Auditor',
    category: 'BRC approved',
    standardCategory: 'GFSI',
    difficulty: 'Advanced',
    vertical: 'Food Safety',
    duration: '5 Days',
    month: 'July',
    dates: 'July 27 to 31 July 2026',
    daysList: [27, 28, 29, 30, 31],
    time: '9:30 AM to 5:30 PM SAST',
    mode: 'Online',
    instructor: 'Dr. Anand Verma, Principal Auditor',
    price: 'R 6,500 ZAR / $350 USD',
    description: 'Comprehensive certification course designed for food safety professionals and internal auditors seeking official validation as BRCGS Lead Auditors. Covers detailed auditing methodologies, FDA alignment, and Issue 9 hazard analysis protocols.',
    seatsTotal: 15,
    seatsLeft: 3,
    syllabus: [
      {
        title: 'Module 1: GFSI & BRCGS Issue 9 Core Protocols',
        hours: '8 Hours',
        accreditations: 'BRCGS Certified',
        outcomes: ['Understand the evolution of GFSI benchmarking requirements', 'Describe the structure and scope of BRCGS Food Safety Issue 9']
      },
      {
        title: 'Module 2: Management Commitment & Quality Management Systems',
        hours: '8 Hours',
        accreditations: 'GFSI Compliant',
        outcomes: ['Assess management commitment and food safety culture', 'Review internal audit protocols and corrective action workflows']
      },
      {
        title: 'Module 3: HACCP & Hazard Analysis Protocols',
        hours: '12 Hours',
        accreditations: 'FSPCA Aligned',
        outcomes: ['Construct comprehensive flow diagrams and hazard assessments', 'Establish critical control points (CCPs) and monitoring thresholds']
      },
      {
        title: 'Module 4: Lead Auditing Methodologies & Reporting',
        hours: '12 Hours',
        accreditations: 'IRCA Aligned',
        outcomes: ['Plan and conduct professional on-site audit simulations', 'Construct compliant audit reports and non-conformance lists']
      }
    ]
  },
  {
    id: 'course-2',
    no: 2,
    name: 'GLOBALG.A.P. Version 6 Smart Training',
    category: 'FCID Approved',
    standardCategory: 'GFSI',
    difficulty: 'Intermediate',
    vertical: 'Food Safety',
    duration: '2 Days',
    month: 'July',
    dates: 'July 28, 29 July 2026',
    daysList: [28, 29],
    time: '9:30 AM to 5:30 PM SAST',
    mode: 'Online',
    instructor: 'Mr. Pierre Dubois, GAP Expert',
    price: 'R 3,600 ZAR / $195 USD',
    description: 'Official curriculum explaining the key changes, compliance criteria, and reporting requirements in Version 6 of the GLOBALG.A.P. Smart standard. Focused on environmental sustainability and agricultural safety checklists.',
    seatsTotal: 20,
    seatsLeft: 6,
    syllabus: [
      {
        title: 'Module 1: Version 6 Core Principles & Structural Shifts',
        hours: '6 Hours',
        accreditations: 'GLOBALG.A.P. Approved',
        outcomes: ['Identify structural changes between Version 5.2 and Version 6', 'Understand farm-level environmental and welfare checklists']
      },
      {
        title: 'Module 2: On-Farm Implementation & Risk Mitigation',
        hours: '10 Hours',
        accreditations: 'FCID Approved',
        outcomes: ['Formulate crop and livestock hygiene safety plans', 'Verify fertilizer usage compliance and soil safety metrics']
      }
    ]
  },
  {
    id: 'course-3',
    no: 3,
    name: 'Practical Guide to EU Food Labelling & Regulatory Requirements',
    category: 'FCID Approved',
    standardCategory: 'GFSI',
    difficulty: 'Beginner',
    vertical: 'Food Safety',
    duration: '4 hrs',
    month: 'July',
    dates: '29th July 2026',
    daysList: [29],
    time: '9:30 AM to 13:30 PM SAST',
    mode: 'Online',
    instructor: 'Dr. Evelyn Carter, EU Regulation Advisor',
    price: 'R 1,850 ZAR / $99 USD',
    description: 'A practical, laser-focused masterclass on navigating complex European Union food labeling regulations. Covers nutrition declaration tables, allergen highlighting, health claims, and package artwork compliance.',
    seatsTotal: 30,
    seatsLeft: 12,
    syllabus: [
      {
        title: 'Module 1: EU Regulation 1169/2011 Framework',
        hours: '2 Hours',
        accreditations: 'FCID Regulatory',
        outcomes: ['Define basic labeling requirements for goods sold inside the EU', 'Map out required nutrition declaration parameters']
      },
      {
        title: 'Module 2: Allergen Management & Package Layouts',
        hours: '2 Hours',
        accreditations: 'EFSA Compliant',
        outcomes: ['Implement mandatory allergen highlighting in ingredient lists', 'Apply health and nutrition claims guidelines correctly']
      }
    ]
  },
  {
    id: 'course-4',
    no: 4,
    name: 'BRCGS Global Standard for Packaging Materials Issue 7: Auditor Training (LAC)',
    category: 'BRC approved',
    standardCategory: 'GFSI',
    difficulty: 'Intermediate',
    vertical: 'Manufacturing',
    duration: '3 Days',
    month: 'August',
    dates: '11,12,13 Aug 2026',
    daysList: [11, 12, 13],
    time: '9:30 AM to 5:30 PM SAST',
    mode: 'Online',
    instructor: 'Ms. Sarah Jenkins, Packaging Auditor',
    price: 'R 4,800 ZAR / $260 USD',
    description: 'Essential auditor upskilling for the brand-new Issue 7. Gain professional competency in hazard assessment, critical control points, and supply chain material traceability for global packaging manufacturers.',
    seatsTotal: 15,
    seatsLeft: 4,
    syllabus: [
      {
        title: 'Module 1: Packaging Materials Standard Scope & Issue 7 Changes',
        hours: '8 Hours',
        accreditations: 'BRCGS Accredited',
        outcomes: ['Detail core changes in the Issue 7 packaging standard', 'Differentiate requirements for high-risk versus low-risk contact materials']
      },
      {
        title: 'Module 2: Hazard and Risk Management (HARA)',
        hours: '8 Hours',
        accreditations: 'GFSI Aligned',
        outcomes: ['Develop a complete hazard and risk analysis for packaging operations', 'Implement supply chain quality checks and material certifications']
      },
      {
        title: 'Module 3: Packaging Site Auditing Techniques',
        hours: '8 Hours',
        accreditations: 'BRCGS Professional',
        outcomes: ['Conduct packaging factory walkthroughs and cleanliness checks', 'Log raw material batch trace-backs and non-conformities']
      }
    ]
  },
  {
    id: 'course-5',
    no: 5,
    name: 'BRCGS Internal Auditor (IA) Training',
    category: 'BRC approved',
    standardCategory: 'GFSI',
    difficulty: 'Intermediate',
    vertical: 'Manufacturing',
    duration: '2 Days',
    month: 'August',
    dates: '20,21 Aug 2026',
    daysList: [20, 21],
    time: '9:30 AM to 5:30 PM SAST',
    mode: 'Online',
    instructor: 'Mr. Rajesh Nair, Senior Lead Assessor',
    price: 'R 3,000 ZAR / $165 USD',
    description: 'Learn the techniques and philosophy of effective internal auditing against BRCGS global standards. Includes practical mock audits, compliance report writing, and dynamic root-cause analysis training.',
    seatsTotal: 22,
    seatsLeft: 8,
    syllabus: [
      {
        title: 'Module 1: Internal Audit Philosophy & Planning',
        hours: '6 Hours',
        accreditations: 'BRCGS IA',
        outcomes: ['Draft internal audit schedules and risk-based audit maps', 'Construct objective-driven audit checklists for internal processes']
      },
      {
        title: 'Module 2: Conducting Audits & Root Cause Analysis',
        hours: '10 Hours',
        accreditations: 'ISO 19011 Aligned',
        outcomes: ['Collect reliable evidence and conduct non-confrontational interviews', 'Perform robust 5-Why and Fishbone corrective root-cause analysis']
      }
    ]
  },
  {
    id: 'course-6',
    no: 6,
    name: 'PCQI Human Foods Version 2 Training',
    category: 'FSPCA approved',
    standardCategory: 'GFSI',
    difficulty: 'Advanced',
    vertical: 'Food Safety',
    duration: '2.5 Days',
    month: 'August',
    dates: '20,21,22 Aug 2026',
    daysList: [20, 21, 22],
    time: '9:30 AM to 5:30 PM SAST',
    mode: 'Online',
    instructor: 'Dr. Michael Taylor, Certified FSPCA Lead Instructor',
    price: 'R 5,500 ZAR / $295 USD',
    description: 'Official curriculum to qualify as a Preventive Controls Qualified Individual (PCQI). Necessary under US FDA FSMA regulations for exporting food and beverage products to North American markets.',
    seatsTotal: 12,
    seatsLeft: 2,
    syllabus: [
      {
        title: 'Module 1: FSMA & Preventive Controls Overview',
        hours: '8 Hours',
        accreditations: 'FSPCA Approved',
        outcomes: ['Understand the FDA Food Safety Modernization Act regulatory landscape', 'Explain roles and responsibilities of a designated PCQI']
      },
      {
        title: 'Module 2: Preventive Controls & Verification Loops',
        hours: '12 Hours',
        accreditations: 'FDA Compliant',
        outcomes: ['Establish process, allergen, sanitation, and supply-chain controls', 'Implement recall plans, environmental monitoring, and corrective actions']
      }
    ]
  },
  {
    id: 'course-7',
    no: 7,
    name: 'FSSC 22000 IA V 7 – Internal Auditor Training',
    category: 'FCID Approved',
    standardCategory: 'ISO',
    difficulty: 'Intermediate',
    vertical: 'Food Safety',
    duration: '2 Days',
    month: 'August',
    dates: '24,25 Aug 2026',
    daysList: [24, 25],
    time: '9:30 AM to 5:30 PM SAST',
    mode: 'Online',
    instructor: 'Mr. Samuel Grooves, FSMS Consultant',
    price: 'R 3,900 ZAR / $210 USD',
    description: 'Specialist internal auditor training updated for FSSC 22000 Version 7. Learn to construct, execute, and document robust Food Safety Management System (FSMS) internal audits under the new scheme rules.',
    seatsTotal: 25,
    seatsLeft: 11,
    syllabus: [
      {
        title: 'Module 1: ISO 22000:2018 & FSSC Version 7 Additional Requirements',
        hours: '8 Hours',
        accreditations: 'FSSC 22000 Approved',
        outcomes: ['Deconstruct ISO high-level structures (HLS) for food safety management', 'Incorporate FSSC specific requirements (food fraud, food defense)']
      },
      {
        title: 'Module 2: FSSC Auditing Protocols',
        hours: '8 Hours',
        accreditations: 'ISO 19011 Standard',
        outcomes: ['Audit operational prerequisite programs (PRPs)', 'Generate compliant audit trails and continuous improvement recommendations']
      }
    ]
  },
  {
    id: 'course-8',
    no: 8,
    name: 'FOSTAC – Catering Training',
    category: 'FSSAI approved',
    standardCategory: 'Leadership',
    difficulty: 'Beginner',
    vertical: 'Food Safety',
    duration: '1 Day',
    month: 'September',
    dates: '16 Sept 2026',
    daysList: [16],
    time: '9:30 AM to 5:30 PM SAST',
    mode: 'Classroom / On-Site',
    instructor: 'Mrs. Geeta Sharma, FSSAI FoSTaC Master Trainer',
    price: 'R 650 ZAR / $35 USD',
    description: 'Official statutory training mandated under FSSAI rules for food handlers, kitchen supervisors, and quality executives in the catering and hospitality sector in India. Includes statutory certification.',
    seatsTotal: 40,
    seatsLeft: 19,
    syllabus: [
      {
        title: 'Module 1: FSSAI Statutory Rules & Hygiene Guidelines',
        hours: '4 Hours',
        accreditations: 'FSSAI FoSTaC Mandated',
        outcomes: ['Define basic schedule 4 hygiene requirements for catering', 'Maintain appropriate cold-chain and thermal food holding controls']
      },
      {
        title: 'Module 2: Personal Hygiene & Waste Disposal',
        hours: '4 Hours',
        accreditations: 'FSSAI Certified',
        outcomes: ['Implement rigorous handwashing, pest control, and sanitation logs', 'Differentiate between safe storage of cooked and raw materials']
      }
    ]
  },
  {
    id: 'course-9',
    no: 9,
    name: 'FOSTAC – Advance Manufacturing Training',
    category: 'FSSAI approved',
    standardCategory: 'ISO',
    difficulty: 'Intermediate',
    vertical: 'Manufacturing',
    duration: '1 Day',
    month: 'September',
    dates: '17-Sep-26',
    daysList: [17],
    time: '9:30 AM to 5:30 PM SAST',
    mode: 'Classroom / On-Site',
    instructor: 'Mrs. Geeta Sharma, FSSAI FoSTaC Master Trainer',
    price: 'R 850 ZAR / $45 USD',
    description: 'Advanced food safety and hygienic practices training for personnel in large-scale food manufacturing units, as per FSSAI regulations. Fully satisfies legal audit requirements.',
    seatsTotal: 35,
    seatsLeft: 14,
    syllabus: [
      {
        title: 'Module 1: Advanced Manufacturing Quality and Statutory Safety',
        hours: '4 Hours',
        accreditations: 'FSSAI FoSTaC Mandated',
        outcomes: ['Understand high-risk food manufacturing statutory requirements', 'Implement critical process monitoring and batch coding techniques']
      },
      {
        title: 'Module 2: Facility Layout & Cross-Contamination Mitigation',
        hours: '4 Hours',
        accreditations: 'FSSAI Certified',
        outcomes: ['Assess plant hygiene layout flow to minimize airborne and physical hazards', 'Draft effective CIP (Clean-in-Place) verification plans']
      }
    ]
  },
  {
    id: 'course-10',
    no: 10,
    name: 'ISO 9001:2015 Quality Management Systems (QMS) Lead Auditor',
    category: 'ISO approved',
    standardCategory: 'ISO',
    difficulty: 'Advanced',
    vertical: 'Manufacturing',
    duration: '5 Days',
    month: 'August',
    dates: '17 to 21 Aug 2026',
    daysList: [17, 18, 19, 20, 21],
    time: '9:30 AM to 5:30 PM SAST',
    mode: 'Online',
    instructor: 'Mr. David Vance, Principal Quality Auditor',
    price: 'R 5,800 ZAR / $310 USD',
    description: 'Acquire the knowledge and skills needed to perform first, second, and third-party audits of quality management systems against ISO 9001 guidelines, in accordance with ISO 19011. Certified by international auditing registries.',
    seatsTotal: 18,
    seatsLeft: 5,
    syllabus: [
      {
        title: 'Module 1: ISO 9001:2015 Annex SL & Core Clauses',
        hours: '8 Hours',
        accreditations: 'IRCA Certified',
        outcomes: ['Interpret QMS requirements in the context of an audit', 'Describe the role of quality policy and customer focus']
      },
      {
        title: 'Module 2: Auditing Planning and Initiation',
        hours: '12 Hours',
        accreditations: 'ISO 19011 Standard',
        outcomes: ['Establish audit objectives, scope, and specific team mandates', 'Create comprehensive checklists aligned with operational risk profiles']
      },
      {
        title: 'Module 3: Execution, Reporting and Verification',
        hours: '20 Hours',
        accreditations: 'IRCA Lead Auditor',
        outcomes: ['Conduct audit interviews, review document trails, and log findings', 'Verify the effectiveness of corrective actions and preventive loops']
      }
    ]
  },
  {
    id: 'course-11',
    no: 11,
    name: 'AS9100 Rev D Aerospace Quality Systems Internal Auditor',
    category: 'ISO approved',
    standardCategory: 'ISO',
    difficulty: 'Advanced',
    vertical: 'Aerospace',
    duration: '3 Days',
    month: 'September',
    dates: '14, 15, 16 Sept 2026',
    daysList: [14, 15, 16],
    time: '9:30 AM to 5:30 PM SAST',
    mode: 'Online',
    instructor: 'Engr. Thomas Wright, Aerospace Compliance Auditor',
    price: 'R 6,900 ZAR / $375 USD',
    description: 'Master the specialized auditing requirements of the aerospace, defense, and aviation sectors. Gain deep capability in evaluating risk management, configuration control, and product safety protocols under the AS9100 standard.',
    seatsTotal: 12,
    seatsLeft: 3,
    syllabus: [
      {
        title: 'Module 1: AS9100 Rev D Core Requirements',
        hours: '8 Hours',
        accreditations: 'AIA Approved',
        outcomes: ['Explain the differences between ISO 9001 and aerospace AS9100', 'Analyze configuration management and design control clauses']
      },
      {
        title: 'Module 2: Operational Risk & Counterfeit Part Prevention',
        hours: '8 Hours',
        accreditations: 'Aerospace Standard',
        outcomes: ['Establish robust counterfeit parts prevention plans', 'Audit product safety and risk-based supply chain operations']
      },
      {
        title: 'Module 3: Aerospace Auditing Practices',
        hours: '8 Hours',
        accreditations: 'IAQG Aligned',
        outcomes: ['Draft AS9101 audit sheets and compliance reports', 'Evaluate manufacturing process parameters and quality escape lists']
      }
    ]
  },
  {
    id: 'course-12',
    no: 12,
    name: 'Executive Leadership & Strategic Risk Management in Compliance',
    category: 'Leadership approved',
    standardCategory: 'Leadership',
    difficulty: 'Advanced',
    vertical: 'Manufacturing',
    duration: '2 Days',
    month: 'September',
    dates: '22, 23 Sept 2026',
    daysList: [22, 23],
    time: '10:00 AM to 4:00 PM SAST',
    mode: 'Online',
    instructor: 'Dr. Yitzak Goldstein, Lead Compliance Advisor',
    price: 'R 4,600 ZAR / $250 USD',
    description: 'Designed for Quality Directors, Chief Compliance Officers, and senior training managers. Focuses on integrating food safety, quality standards, and statutory regulations into the broader corporate ESG and governance matrix.',
    seatsTotal: 25,
    seatsLeft: 15,
    syllabus: [
      {
        title: 'Module 1: Building a Culture of Quality and Integrity',
        hours: '6 Hours',
        accreditations: 'Corporate Governance',
        outcomes: ['Assess and quantify corporate safety and compliance culture', 'Align regulatory strategies with corporate ESG guidelines']
      },
      {
        title: 'Module 2: Governance, Risk and Crisis Control',
        hours: '6 Hours',
        accreditations: 'Strategic Compliance',
        outcomes: ['Deconstruct global product recall case studies', 'Formulate corporate compliance dashboards and board-level reporting protocols']
      }
    ]
  },
  {
    id: 'course-13',
    no: 13,
    name: 'ISO/IEC 27001:2022 Information Security Management (ISMS) Lead Implementer & Auditor',
    category: 'ISO approved',
    standardCategory: 'ISO',
    difficulty: 'Advanced',
    vertical: 'Manufacturing',
    duration: '3 Days',
    month: 'September',
    dates: '28, 29, 30 Sept 2026',
    daysList: [28, 29, 30],
    time: '9:00 AM to 5:00 PM SAST',
    mode: 'Online & Virtual Live',
    instructor: 'David Khumalo, Lead ISMS & Cybersecurity Auditor',
    price: 'R 7,200 ZAR / $395 USD',
    description: 'Master the principles of planning, implementing, maintaining, and auditing an Information Security Management System (ISMS) against ISO/IEC 27001:2022, Annex A controls, and data protection regulations.',
    seatsTotal: 15,
    seatsLeft: 6,
    syllabus: [
      {
        title: 'Module 1: ISO/IEC 27001:2022 Framework & Information Risk',
        hours: '8 Hours',
        accreditations: 'ISO 27001 Certified',
        outcomes: ['Understand ISO 27001:2022 structure and Annex A control categories', 'Conduct comprehensive information security risk assessments']
      },
      {
        title: 'Module 2: ISMS Implementation, Policies & Statement of Applicability',
        hours: '8 Hours',
        accreditations: 'ISMS Lead Implementer',
        outcomes: ['Develop robust access control, cryptography, and asset management policies', 'Formulate and maintain the Statement of Applicability (SoA)']
      },
      {
        title: 'Module 3: Internal Auditing & POPIA/GDPR Privacy Governance',
        hours: '8 Hours',
        accreditations: 'ISO 19011 Aligned',
        outcomes: ['Execute professional ISMS internal audits and log non-conformances', 'Integrate POPIA, GDPR, and ISO 27701 data protection workflows']
      }
    ]
  }
];

// Calendar grid configuration
interface MonthConfig {
  name: 'July' | 'August' | 'September';
  year: number;
  startDayOfWeek: number; // 0: Sunday, 1: Monday, ... 6: Saturday
  totalDays: number;
}

const MONTHS_CONFIG: MonthConfig[] = [
  { name: 'July', year: 2026, startDayOfWeek: 3, totalDays: 31 }, // July 1, 2026 is Wednesday (3)
  { name: 'August', year: 2026, startDayOfWeek: 6, totalDays: 31 }, // Aug 1, 2026 is Saturday (6)
  { name: 'September', year: 2026, startDayOfWeek: 2, totalDays: 30 } // Sept 1, 2026 is Tuesday (2)
];

interface TrainingCalendarProps {
  onReserveCourse: (courseName: string, courseDates: string) => void;
}

export default function TrainingCalendar({ onReserveCourse }: TrainingCalendarProps) {
  const [activeMonthIndex, setActiveMonthIndex] = useState(0); // 0: July, 1: August, 2: Sept
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [modeFilter, setModeFilter] = useState('all');
  const [standardCategoryFilter, setStandardCategoryFilter] = useState<'all' | 'GFSI' | 'ISO' | 'Leadership'>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'Beginner' | 'Intermediate' | 'Advanced'>('all');
  const [verticalFilter, setVerticalFilter] = useState<'all' | 'Food Safety' | 'Aerospace' | 'Manufacturing'>('all');
  const [selectedCourse, setSelectedCourse] = useState<TrainingCourse | null>(null);
  const [expandedModuleIndex, setExpandedModuleIndex] = useState<number | null>(0);
  const [addedCalendars, setAddedCalendars] = useState<Record<string, boolean>>({});

  // Automatically reset active module index when course changes
  useEffect(() => {
    setExpandedModuleIndex(0);
  }, [selectedCourse]);

  // Lock body scroll when course specification modal/drawer is open
  useEffect(() => {
    if (selectedCourse) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('has-open-drawer');
    } else {
      document.body.style.overflow = '';
      document.body.classList.remove('has-open-drawer');
    }
    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('has-open-drawer');
    };
  }, [selectedCourse]);

  const currentMonthConfig = MONTHS_CONFIG[activeMonthIndex];
  const currentMonthName = currentMonthConfig.name;

  // Filter courses
  const filteredCourses = UPCOMING_COURSES.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || course.category === categoryFilter;
    const matchesMode = modeFilter === 'all' || 
                        (modeFilter === 'Online' && course.mode === 'Online') ||
                        (modeFilter === 'Classroom' && course.mode.includes('Classroom'));

    const matchesStandard = standardCategoryFilter === 'all' || course.standardCategory === standardCategoryFilter;
    const matchesDifficulty = difficultyFilter === 'all' || course.difficulty === difficultyFilter;
    const matchesVertical = verticalFilter === 'all' || course.vertical === verticalFilter;

    return matchesSearch && matchesCategory && matchesMode && matchesStandard && matchesDifficulty && matchesVertical;
  });

  // Get courses specifically for the active month
  const activeMonthCourses = filteredCourses.filter(c => c.month === currentMonthName);

  // Categories list for filters
  const categories = Array.from(new Set(UPCOMING_COURSES.map(c => c.category)));

  // Generate calendar days
  const renderCalendarDays = () => {
    const { startDayOfWeek, totalDays } = currentMonthConfig;
    const days: React.ReactNode[] = [];

    // Empty cells for alignment before the 1st of the month
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(
        <div 
          key={`empty-${i}`} 
          className="aspect-square bg-surface-container-lowest border-b border-r border-[#E5E5E5]/40 opacity-30"
        />
      );
    }

    // Days with numbers
    for (let day = 1; day <= totalDays; day++) {
      // Find all courses on this specific day in this month
      const coursesOnDay = filteredCourses.filter(
        c => c.month === currentMonthName && c.daysList.includes(day)
      );

      const hasEvents = coursesOnDay.length > 0;

      days.push(
        <div 
          key={`day-${day}`}
          className={`aspect-square border-b border-r border-[#E5E5E5]/40 p-1 md:p-2 flex flex-col justify-between relative transition-all duration-300 ${
            hasEvents 
              ? 'bg-antique-gold/5 hover:bg-antique-gold/10 cursor-pointer' 
              : 'bg-white hover:bg-[#F9F9F9]'
          }`}
          onClick={() => {
            if (hasEvents) {
              setSelectedCourse(coursesOnDay[0]); // Select first course on day
            }
          }}
        >
          {/* Day Number */}
          <span className={`text-[11px] md:text-xs font-mono font-bold leading-none ${
            hasEvents 
              ? 'text-[#B68A35] bg-[#B68A35]/10 px-1.5 py-1 rounded' 
              : 'text-charcoal opacity-70'
          }`}>
            {day}
          </span>

          {/* Mini indicators */}
          {hasEvents && (
            <div className="space-y-1 mt-1.5 w-full">
              {coursesOnDay.map(course => (
                <div 
                  key={course.id}
                  className="hidden md:block text-[9px] truncate font-sans px-1.5 py-0.5 rounded border border-antique-gold/20 bg-white text-primary font-semibold hover:bg-primary hover:text-white transition-colors"
                  title={course.name}
                >
                  {course.category.replace(' approved', '').replace(' Approved', '')}: {course.no}
                </div>
              ))}
              {/* Mobile indicators */}
              <div className="md:hidden flex gap-0.5 justify-center mt-1">
                {coursesOnDay.map(course => (
                  <span 
                    key={course.id}
                    className="w-1.5 h-1.5 rounded-full bg-[#B68A35] inline-block animate-pulse"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  const handleNextMonth = () => {
    setActiveMonthIndex((prev) => (prev + 1) % MONTHS_CONFIG.length);
  };

  const handlePrevMonth = () => {
    setActiveMonthIndex((prev) => (prev - 1 + MONTHS_CONFIG.length) % MONTHS_CONFIG.length);
  };

  const handleMockAddToCalendar = (courseId: string) => {
    setAddedCalendars(prev => ({ ...prev, [courseId]: true }));
    setTimeout(() => {
      // Automatic revert to show it is a stateful sync mock
    }, 5000);
  };

  return (
    <div className={`space-y-8 max-w-[1280px] mx-auto py-4 px-1 ${selectedCourse ? 'hide-when-drawer-printing' : ''}`}>
      
      {/* Intro Banner */}
      <div className="bg-primary text-white p-8 md:p-12 rounded-3xl relative overflow-hidden shadow-xl border border-white/5">
        <div className="absolute top-0 right-0 p-12 opacity-5 hidden lg:block select-none pointer-events-none">
          <CalendarIcon size={220} className="stroke-1" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-[#B68A35]/20 text-[#DFC181] border border-[#B68A35]/30 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold mb-4">
            <Sparkles size={11} className="animate-spin-slow" />
            <span>Official 2026 Academic Schedule</span>
          </div>
          <h2 className="font-serif text-3xl md:text-[36px] text-white font-bold leading-tight mb-4">
            Upcoming Training Calendar
          </h2>
          <p className="font-sans text-xs md:text-sm text-white/80 leading-relaxed mb-6">
            Browse upcoming certified learning events in partnership with <strong>FoodChain ID Academy</strong> and statutory <strong>FSSAI FoSTaC</strong> schemes. Plan your compliance upskilling, verify dates, and immediately book custom consulting slots aligned to your chosen module.
          </p>
          <div className="flex flex-wrap gap-4 text-xs font-mono text-white/60">
            <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded border border-white/10">
              <Laptop size={12} className="text-antique-gold" /> Live Virtual Classrooms
            </span>
            <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded border border-white/10">
              <MapPin size={12} className="text-antique-gold" /> On-Site Statutory FoSTaC
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic Course Finder Control Panel */}
      <div className="bg-white border border-[#E5E5E5] rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
        {/* Row 1: Search & Base Filters */}
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 border-b border-[#E5E5E5]/60 pb-6">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ash" size={16} />
            <input
              type="text"
              placeholder="Search training name, code, standard, or core keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-[#F9F9F9] border border-[#E5E5E5] text-charcoal font-sans text-xs focus:bg-white focus:border-primary outline-none rounded-xl transition-all"
            />
          </div>

          {/* Format and Accreditation Selectors */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Accreditation Select */}
            <div className="flex items-center gap-2 border border-[#E5E5E5] bg-white rounded-xl px-3 py-2">
              <Filter size={12} className="text-ash" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-transparent text-xs text-charcoal font-sans border-none outline-none pr-1 cursor-pointer font-medium"
              >
                <option value="all">All Accreditations</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Delivery Format Select */}
            <div className="flex items-center gap-2 border border-[#E5E5E5] bg-white rounded-xl px-3 py-2">
              <Laptop size={12} className="text-ash" />
              <select
                value={modeFilter}
                onChange={(e) => setModeFilter(e.target.value)}
                className="bg-transparent text-xs text-charcoal font-sans border-none outline-none pr-1 cursor-pointer font-medium"
              >
                <option value="all">All Formats</option>
                <option value="Online">Online Virtual</option>
                <option value="Classroom">In-Person/On-site</option>
              </select>
            </div>

            {/* Grid / List Toggles */}
            <div className="h-8 w-px bg-[#E5E5E5] hidden md:block" />
            <div className="bg-[#F3F4F6] p-1 rounded-xl flex items-center gap-1 shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'grid' 
                    ? 'bg-white text-primary shadow-sm' 
                    : 'text-ash hover:text-primary'
                }`}
                title="Interactive Calendar Grid"
              >
                <Grid size={15} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'list' 
                    ? 'bg-white text-primary shadow-sm' 
                    : 'text-ash hover:text-primary'
                }`}
                title="Full Agenda List"
              >
                <List size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Multi-faceted Filter Chips (Elegant Design) */}
        <div className="space-y-4">
          <div className="text-[11px] font-bold font-mono text-primary uppercase tracking-wider mb-2 flex items-center gap-1">
            <Sparkles size={12} className="text-[#B68A35]" />
            <span>Multi-Faceted Curriculum Browser</span>
          </div>

          {/* Standard Category Chips */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs border-b border-[#E5E5E5]/30 pb-3">
            <span className="font-semibold text-charcoal font-mono w-28 text-[11px] uppercase tracking-wider text-ash/80">Standard Type:</span>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'All Standards' },
                { value: 'GFSI', label: 'GFSI Benchmarked' },
                { value: 'ISO', label: 'ISO Standards' },
                { value: 'Leadership', label: 'Executive Leadership' }
              ].map(opt => {
                const isActive = standardCategoryFilter === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setStandardCategoryFilter(opt.value as any)}
                    className={`px-3 py-1.5 text-xs rounded-full border transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-[#B68A35] text-white border-[#B68A35] font-semibold shadow-xs' 
                        : 'bg-[#F9F9F9] hover:bg-antique-gold/10 text-charcoal border-[#E5E5E5] hover:border-antique-gold/35'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Difficulty Level Chips */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs border-b border-[#E5E5E5]/30 pb-3">
            <span className="font-semibold text-charcoal font-mono w-28 text-[11px] uppercase tracking-wider text-ash/80">Difficulty Level:</span>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'All Levels' },
                { value: 'Beginner', label: 'Beginner / Foundation' },
                { value: 'Intermediate', label: 'Intermediate / Auditor' },
                { value: 'Advanced', label: 'Advanced / Lead Auditor' }
              ].map(opt => {
                const isActive = difficultyFilter === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setDifficultyFilter(opt.value as any)}
                    className={`px-3 py-1.5 text-xs rounded-full border transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-[#B68A35] text-white border-[#B68A35] font-semibold shadow-xs' 
                        : 'bg-[#F9F9F9] hover:bg-antique-gold/10 text-charcoal border-[#E5E5E5] hover:border-antique-gold/35'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Industry Vertical Chips */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs">
            <span className="font-semibold text-charcoal font-mono w-28 text-[11px] uppercase tracking-wider text-ash/80">Industry Sector:</span>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'All Industries' },
                { value: 'Food Safety', label: 'Food Safety & Agriculture' },
                { value: 'Aerospace', label: 'Aerospace Quality' },
                { value: 'Manufacturing', label: 'High-Tech Manufacturing' }
              ].map(opt => {
                const isActive = verticalFilter === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setVerticalFilter(opt.value as any)}
                    className={`px-3 py-1.5 text-xs rounded-full border transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-[#B68A35] text-white border-[#B68A35] font-semibold shadow-xs' 
                        : 'bg-[#F9F9F9] hover:bg-antique-gold/10 text-charcoal border-[#E5E5E5] hover:border-antique-gold/35'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Row 3: Active Filters Summary Bar */}
        {(searchQuery || categoryFilter !== 'all' || modeFilter !== 'all' || standardCategoryFilter !== 'all' || difficultyFilter !== 'all' || verticalFilter !== 'all') && (
          <div className="bg-antique-gold/5 border border-antique-gold/15 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-[#B68A35] font-medium">
              <span>Selected Criteria matches</span>
              <span className="bg-[#B68A35] text-white px-2 py-0.5 rounded-md font-mono font-bold">{filteredCourses.length}</span>
              <span>course{filteredCourses.length !== 1 ? 's' : ''}</span>
            </div>

            <button
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
                setModeFilter('all');
                setStandardCategoryFilter('all');
                setDifficultyFilter('all');
                setVerticalFilter('all');
              }}
              className="text-xs text-[#B68A35] hover:text-primary font-bold transition-colors underline decoration-dotted underline-offset-4 cursor-pointer focus:outline-none"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Main Content Render */}
      <AnimatePresence mode="wait">
        {viewMode === 'grid' ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Interactive Calendar Month Shell */}
            <div className="lg:col-span-8 bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden shadow-sm flex flex-col">
              
              {/* Calendar Month Header */}
              <div className="bg-primary text-white px-6 py-5 flex items-center justify-between border-b border-white/5">
                <button 
                  onClick={handlePrevMonth}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                  title="Previous month"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="text-center">
                  <h3 className="font-serif text-lg md:text-xl font-bold uppercase tracking-widest">
                    {currentMonthName} {currentMonthConfig.year}
                  </h3>
                  <p className="text-[10px] text-white/60 font-mono mt-0.5">
                    {activeMonthCourses.length} Registered Trainings Scheduled
                  </p>
                </div>
                <button 
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                  title="Next month"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              {/* Days of Week Header */}
              <div className="grid grid-cols-7 bg-[#F9F9F9] border-b border-[#E5E5E5]/60 text-center py-3 font-mono text-[10px] md:text-xs font-bold uppercase tracking-wider text-charcoal">
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 bg-surface-container-lowest flex-1 min-h-[350px]">
                {renderCalendarDays()}
              </div>

              {/* Quick tip */}
              <div className="bg-surface p-4 border-t border-[#E5E5E5]/50 flex items-center gap-2 text-[11px] text-ash">
                <Info size={14} className="text-[#B68A35]" />
                <span>Highlighted blocks represent certified active courses. Click any day block to view module specifications in the sidebar.</span>
              </div>
            </div>

            {/* Sidebar Details / Courses in Active Month */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 shadow-sm flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-serif text-base text-primary font-bold mb-4 border-b border-[#E5E5E5] pb-2 flex items-center gap-2">
                    <CalendarIcon size={16} className="text-[#B68A35]" />
                    <span>Modules in {currentMonthName}</span>
                  </h4>

                  {activeMonthCourses.length === 0 ? (
                    <div className="text-center py-16 text-ash space-y-2">
                      <AlertCircle className="mx-auto text-ash/60" size={24} />
                      <p className="text-xs">No matching scheduled courses found for this month.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                      {activeMonthCourses.map(course => (
                        <div
                          key={course.id}
                          onClick={() => setSelectedCourse(course)}
                          className={`p-4 border rounded-xl text-left transition-all cursor-pointer group ${
                            selectedCourse?.id === course.id 
                              ? 'border-primary bg-primary/5 shadow-sm' 
                              : 'border-[#E5E5E5] hover:border-antique-gold bg-white'
                          }`}
                        >
                          <span className={`text-[9px] font-mono px-2 py-0.5 rounded uppercase font-bold inline-block mb-2 ${
                            course.category.includes('BRC') ? 'bg-[#B68A35]/10 text-[#B68A35]' : 'bg-primary/5 text-primary'
                          }`}>
                            {course.category}
                          </span>
                          <h5 className="font-serif text-xs font-bold text-primary group-hover:text-secondary leading-snug line-clamp-2 transition-colors mb-2">
                            {course.name}
                          </h5>
                          <div className="flex justify-between items-center text-[10px] text-ash font-mono mt-2">
                            <span>📅 {course.dates}</span>
                            <span className="font-bold text-[#B68A35]">{course.duration}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Direct quick CTA */}
                <div className="border-t border-[#E5E5E5] pt-4 mt-6 space-y-3">
                  <div className="bg-surface p-3 border border-[#E5E5E5]/40 rounded-xl space-y-2 text-xs">
                    <div className="flex gap-2 items-start">
                      <HelpCircle size={14} className="text-[#B68A35] mt-0.5 shrink-0" />
                      <p className="text-[11px] leading-relaxed text-ash">
                        Need an exclusive batch or custom tailored curriculum for your organization?
                      </p>
                    </div>
                    <button
                      onClick={() => onReserveCourse('Custom In-House Cohort Inquiry', 'Contact for Scheduling')}
                      className="text-xs font-bold text-[#B68A35] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      Inquire Custom In-House Training <ArrowRight size={12} />
                    </button>
                  </div>

                  <div className="bg-[#023625]/5 p-3 border border-[#023625]/10 rounded-xl space-y-2 text-xs text-left">
                    <div className="flex gap-2 items-start">
                      <Award size={14} className="text-[#B68A35] mt-0.5 shrink-0" />
                      <p className="text-[11px] leading-relaxed text-primary font-sans font-medium">
                        Looking for global certifications? Explore the full course list at FoodChain ID Academy.
                      </p>
                    </div>
                    <a
                      href="https://www.foodchainid.com/academy/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-[#B68A35] hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Visit FoodChain ID Academy ↗</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* List View of All Courses */}
            {filteredCourses.length === 0 ? (
              <div className="bg-white border border-[#E5E5E5] rounded-2xl p-16 text-center text-ash space-y-3">
                <AlertCircle className="mx-auto text-ash/60" size={32} />
                <p className="text-sm">No courses match your filter parameters. Try broadening your query.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setCategoryFilter('all');
                    setModeFilter('all');
                  }}
                  className="bg-primary text-white text-xs px-4 py-2 font-semibold uppercase tracking-wider rounded"
                >
                  Reset Filter State
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map(course => (
                  <div 
                    key={course.id}
                    className="bg-white border border-[#E5E5E5] hover:border-[#B68A35] hover:shadow-md rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-4 mb-4">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#B68A35] bg-[#B68A35]/10 px-2.5 py-1 rounded">
                          {course.category}
                        </span>
                        <span className="text-[11px] font-mono font-bold text-ash">
                          Ref #{course.no}
                        </span>
                      </div>
                      <h4 className="font-serif text-sm font-bold text-primary hover:text-secondary transition-colors line-clamp-2 leading-relaxed mb-3">
                        {course.name}
                      </h4>
                      <p className="font-sans text-xs text-ash line-clamp-3 leading-relaxed mb-4">
                        {course.description}
                      </p>

                      <div className="space-y-2 border-t border-b border-[#E5E5E5]/60 py-3 mb-6 text-xs font-mono">
                        <div className="flex justify-between">
                          <span className="text-ash">Month:</span>
                          <span className="text-charcoal font-semibold">{course.month}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-ash">Schedule:</span>
                          <span className="text-primary font-semibold">{course.dates}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-ash">Time (SAST):</span>
                          <span className="text-charcoal font-semibold">{course.time}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-ash">Mode:</span>
                          <span className="text-primary font-semibold flex items-center gap-1">
                            {course.mode === 'Online' ? <Laptop size={12} /> : <MapPin size={12} />}
                            {course.mode}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-ash">Fee: <strong className="text-charcoal font-semibold font-mono">{course.price}</strong></span>
                        <span className={`text-[11px] font-semibold font-mono px-2 py-0.5 rounded ${
                          course.seatsLeft <= 3 ? 'bg-error-container text-on-error-container animate-pulse' : 'bg-surface text-ash'
                        }`}>
                          {course.seatsLeft} of {course.seatsTotal} seats left
                        </span>
                      </div>
                      <button
                        onClick={() => setSelectedCourse(course)}
                        className="w-full border border-primary text-primary hover:bg-primary hover:text-white transition-all text-xs font-sans font-bold uppercase tracking-widest py-3 rounded-lg flex items-center justify-center gap-2 cursor-pointer focus:outline-none"
                      >
                        <Info size={14} /> Full Details & Reserve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Course Specifications Sliding Side Drawer */}
      <AnimatePresence>
        {selectedCourse && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCourse(null)}
              className="fixed inset-0 z-50 bg-primary-900/60 backdrop-blur-xs cursor-pointer no-print-backdrop"
            />

            {/* Sliding Drawer Container */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="fixed top-0 right-0 z-50 h-full w-full max-w-xl bg-white shadow-2xl flex flex-col border-l border-[#E5E5E5] text-left printable-drawer"
            >
              {/* Print Letterhead Banner (Visible only during physical printing) */}
              <div className="hidden print:block p-6 border-b-2 border-[#B68A35] bg-white">
                <div className="flex justify-between items-end">
                  <div>
                    <YitzakLogo size={28} className="mb-2" />
                    <p className="text-xs font-mono text-[#7d5800] uppercase font-bold">Official Course Syllabus Specification</p>
                    <p className="text-[10px] text-gray-600 mt-1">Ref #{selectedCourse.no} | {selectedCourse.name}</p>
                  </div>
                  <div className="text-right text-[10px] font-mono text-gray-500">
                    <p>Printed: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    <p>Accreditation: Verified Syllabus</p>
                  </div>
                </div>
              </div>

              {/* Drawer Header */}
              <div className="bg-primary text-white p-6 sticky top-0 z-10 flex justify-between items-start border-b border-white/10 shadow-sm shrink-0">
                <div>
                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#DFC181] bg-[#DFC181]/15 px-2 py-0.5 rounded border border-[#DFC181]/35">
                      {selectedCourse.category}
                    </span>
                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-white/80 bg-white/10 px-2 py-0.5 rounded border border-white/20">
                      {selectedCourse.standardCategory}
                    </span>
                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#DFC181] bg-white/10 px-2 py-0.5 rounded border border-white/20">
                      {selectedCourse.difficulty}
                    </span>
                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-white/80 bg-white/10 px-2 py-0.5 rounded border border-white/20">
                      {selectedCourse.vertical}
                    </span>
                  </div>
                  <h3 className="font-serif text-base md:text-lg font-bold leading-tight max-w-md">
                    {selectedCourse.name}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="text-white/60 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer text-sm font-mono shrink-0 no-print"
                  title="Close Drawer"
                >
                  ✕
                </button>
              </div>

              {/* Drawer Scrollable Body */}
              <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                {/* Agenda / Overview */}
                <div>
                  <h4 className="font-serif text-xs font-bold text-primary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <BookOpen size={13} className="text-[#B68A35]" />
                    <span>Programme Overview</span>
                  </h4>
                  <p className="font-sans text-xs md:text-sm text-ash leading-relaxed">
                    {selectedCourse.description}
                  </p>
                </div>

                {/* Grid Course Parameters */}
                <div className="grid grid-cols-2 gap-3 bg-[#F9F9F9] border border-[#E5E5E5] rounded-xl p-4 font-mono text-xs">
                  <div className="space-y-2.5">
                    <div className="flex flex-col py-0.5 border-b border-[#E5E5E5]/60">
                      <span className="text-ash text-[9px] font-bold">COURSE REF</span>
                      <span className="text-charcoal font-bold mt-0.5 text-[11px]">#2026-Y{selectedCourse.no}</span>
                    </div>
                    <div className="flex flex-col py-0.5 border-b border-[#E5E5E5]/60">
                      <span className="text-ash text-[9px] font-bold">DURATION</span>
                      <span className="text-primary font-bold mt-0.5 text-[11px]">{selectedCourse.duration}</span>
                    </div>
                    <div className="flex flex-col py-0.5">
                      <span className="text-ash text-[9px] font-bold">SCHEDULED DATES</span>
                      <span className="text-charcoal font-bold mt-0.5 text-[11px]">{selectedCourse.dates}</span>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex flex-col py-0.5 border-b border-[#E5E5E5]/60">
                      <span className="text-ash text-[9px] font-bold">DELIVERY MODE</span>
                      <span className="text-primary font-bold mt-0.5 text-[11px]">{selectedCourse.mode}</span>
                    </div>
                    <div className="flex flex-col py-0.5 border-b border-[#E5E5E5]/60">
                      <span className="text-ash text-[9px] font-bold">FEES / PRICING</span>
                      <span className="text-[#B68A35] font-bold mt-0.5 text-[11px]">{selectedCourse.price}</span>
                    </div>
                    <div className="flex flex-col py-0.5">
                      <span className="text-ash text-[9px] font-bold">AVAILABILITY</span>
                      <span className={`font-bold mt-0.5 text-[11px] ${
                        selectedCourse.seatsLeft <= 3 ? 'text-red-600 animate-pulse' : 'text-green-600'
                      }`}>
                        {selectedCourse.seatsLeft} of {selectedCourse.seatsTotal} Seats Left
                      </span>
                    </div>
                  </div>
                </div>

                {/* Lead Instructor Profile */}
                <div className="flex gap-3.5 items-center bg-[#023625]/5 p-4 rounded-xl border border-[#023625]/10">
                  <div className="w-10 h-10 rounded-full bg-[#B68A35]/20 border border-[#B68A35]/30 flex items-center justify-center shrink-0">
                    <User size={16} className="text-[#B68A35]" />
                  </div>
                  <div className="text-xs">
                    <p className="text-ash uppercase tracking-wider font-mono font-bold text-[9px]">Assigned Lead Instructor</p>
                    <p className="text-primary font-bold font-sans mt-0.5">{selectedCourse.instructor}</p>
                  </div>
                </div>

                {/* Interactive Syllabus Accordions (Curriculum Browser) */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-2">
                    <h4 className="font-serif text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                      <Award size={13} className="text-[#B68A35]" />
                      <span>Syllabus Modules</span>
                    </h4>
                    <span className="font-mono text-[10px] text-[#B68A35] bg-antique-gold/10 px-2 py-0.5 rounded-full font-bold">
                      {selectedCourse.syllabus.length} Active Modules
                    </span>
                  </div>
                  <p className="text-[11px] text-ash leading-relaxed print:hidden">
                    Click any curriculum module below to examine classroom hours, accreditation compliance, and specific learning outcomes:
                  </p>

                  <div className="space-y-2">
                    {selectedCourse.syllabus.map((module, mIdx) => {
                      const isExpanded = expandedModuleIndex === mIdx;
                      return (
                        <div 
                          key={mIdx} 
                          className={`border rounded-xl transition-all overflow-hidden syllabus-module ${
                            isExpanded ? 'border-[#B68A35] bg-antique-gold/5 shadow-xs' : 'border-[#E5E5E5] hover:border-antique-gold/40 bg-white'
                          }`}
                        >
                          {/* Accordion Toggle Trigger Button */}
                          <button
                            onClick={() => setExpandedModuleIndex(isExpanded ? null : mIdx)}
                            className="w-full py-3.5 px-4 flex items-center justify-between text-left focus:outline-none transition-colors"
                          >
                            <span className="font-serif text-xs font-bold text-primary hover:text-[#B68A35] transition-colors leading-snug pr-4">
                              {module.title}
                            </span>
                            <span className={`text-[10px] text-[#B68A35] font-mono font-bold transform transition-transform print:hidden ${isExpanded ? 'rotate-180' : ''}`}>
                              ▼
                            </span>
                          </button>

                          {/* Collapsible content section using Framer Motion (Auto-expanded in print) */}
                          <div className={`syllabus-accordion-content ${isExpanded ? 'block' : 'hidden print:block'}`}>
                            <div className="px-4 pb-4 pt-1 border-t border-[#E5E5E5]/40 space-y-3.5 text-xs">
                              {/* Quick stats indicators */}
                              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-ash pt-1.5">
                                <div className="flex items-center gap-1.5 bg-white border border-[#E5E5E5]/60 px-2.5 py-1 rounded-lg">
                                  <Clock size={11} className="text-[#B68A35]" />
                                  <span><strong>Hours:</strong> {module.hours}</span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-white border border-[#E5E5E5]/60 px-2.5 py-1 rounded-lg">
                                  <Shield size={11} className="text-[#B68A35]" />
                                  <span><strong>Accreditation:</strong> {module.accreditations}</span>
                                </div>
                              </div>

                              {/* Outcomes List */}
                              <div className="space-y-2">
                                <p className="font-bold text-primary text-[10px] uppercase tracking-wider font-mono">Module Target Outcomes:</p>
                                <ul className="space-y-2 pl-0.5">
                                  {module.outcomes.map((outcome, oIdx) => (
                                    <li key={oIdx} className="flex items-start gap-2 text-ash text-[11px] leading-relaxed">
                                      <CheckCircle size={12} className="text-green-600 mt-0.5 shrink-0" />
                                      <span>{outcome}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Drawer Actions Footer */}
              <div className="border-t border-[#E5E5E5] p-6 bg-[#F9F9F9] flex flex-col sm:flex-row gap-3 justify-end shrink-0 sticky bottom-0 z-10 shadow-inner no-print">
                {/* Print Syllabus / Download PDF button */}
                <button
                  onClick={() => {
                    exportCourseSyllabusPDF(selectedCourse);
                    triggerSmartPrint();
                  }}
                  className="bg-primary hover:bg-[#1f4d3a] text-white text-xs font-sans font-bold uppercase tracking-widest py-3 px-5 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 focus:outline-none shadow-sm"
                  title="Print official course syllabus or download PDF"
                >
                  <Printer size={14} />
                  <span>Print / Download Syllabus</span>
                </button>

                {/* Add to Calendar button */}
                <button
                  onClick={() => handleMockAddToCalendar(selectedCourse.id)}
                  className="bg-white border border-[#E5E5E5] hover:border-[#B68A35] text-primary hover:text-[#B68A35] text-xs font-sans font-bold uppercase tracking-widest py-3 px-6 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 focus:outline-none"
                >
                  {addedCalendars[selectedCourse.id] ? (
                    <>
                      <CheckCircle size={14} className="text-green-600" />
                      <span>Saved to Calendar</span>
                    </>
                  ) : (
                    <>
                      <CalendarIcon size={14} />
                      <span>Add to Calendar</span>
                    </>
                  )}
                </button>

                {/* Direct Reserve CTA button */}
                <button
                  onClick={() => {
                    const notesStr = `Course Inquiry: Ref #${selectedCourse.no} - ${selectedCourse.name}\nDates: ${selectedCourse.dates}\nFormat: ${selectedCourse.mode}`;
                    onReserveCourse(notesStr, selectedCourse.dates);
                    setSelectedCourse(null);
                  }}
                  className="bg-[#B68A35] hover:bg-[#B68A35]/90 text-white text-xs font-sans font-bold uppercase tracking-widest py-3 px-6 rounded-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 focus:outline-none shadow-sm"
                >
                  <span>Reserve Seat / Inquire</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
