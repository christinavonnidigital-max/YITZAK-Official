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
  MapPin
} from 'lucide-react';

interface TrainingCourse {
  id: string;
  no: number;
  name: string;
  category: string;
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
}

const UPCOMING_COURSES: TrainingCourse[] = [
  {
    id: 'course-1',
    no: 1,
    name: 'BRC Food - Global Standard for Food Safety Issue 9: Lead Auditor',
    category: 'BRC approved',
    duration: '5 Days',
    month: 'July',
    dates: 'July 27 to 31 July 2026',
    daysList: [27, 28, 29, 30, 31],
    time: '9:30 AM to 5:30 PM IST',
    mode: 'Online',
    instructor: 'Dr. Anand Verma, Principal Auditor',
    price: '₹24,500 / $350 USD',
    description: 'Comprehensive certification course designed for food safety professionals and internal auditors seeking official validation as BRCGS Lead Auditors. Covers detailed auditing methodologies, FDA alignment, and Issue 9 hazard analysis protocols.',
    seatsTotal: 15,
    seatsLeft: 3
  },
  {
    id: 'course-2',
    no: 2,
    name: 'GLOBALG.A.P. Version 6 Smart Training',
    category: 'FCID Approved',
    duration: '2 Days',
    month: 'July',
    dates: 'July 28, 29 July 2026',
    daysList: [28, 29],
    time: '9:30 AM to 5:30 PM IST',
    mode: 'Online',
    instructor: 'Mr. Pierre Dubois, GAP Expert',
    price: '₹14,000 / $195 USD',
    description: 'Official curriculum explaining the key changes, compliance criteria, and reporting requirements in Version 6 of the GLOBALG.A.P. Smart standard. Focused on environmental sustainability and agricultural safety checklists.',
    seatsTotal: 20,
    seatsLeft: 6
  },
  {
    id: 'course-3',
    no: 3,
    name: 'Practical Guide to EU Food Labelling & Regulatory Requirements',
    category: 'FCID Approved',
    duration: '4 hrs',
    month: 'July',
    dates: '29th July 2026',
    daysList: [29],
    time: '9:30 AM to 13:30 PM IST',
    mode: 'Online',
    instructor: 'Dr. Evelyn Carter, EU Regulation Advisor',
    price: '₹7,500 / $99 USD',
    description: 'A practical, laser-focused masterclass on navigating complex European Union food labeling regulations. Covers nutrition declaration tables, allergen highlighting, health claims, and package artwork compliance.',
    seatsTotal: 30,
    seatsLeft: 12
  },
  {
    id: 'course-4',
    no: 4,
    name: 'BRCGS Global Standard for Packaging Materials Issue 7: Auditor Training (LAC)',
    category: 'BRC approved',
    duration: '3 Days',
    month: 'August',
    dates: '11,12,13 Aug 2026',
    daysList: [11, 12, 13],
    time: '9:30 AM to 5:30 PM IST',
    mode: 'Online',
    instructor: 'Ms. Sarah Jenkins, Packaging Auditor',
    price: '₹18,500 / $260 USD',
    description: 'Essential auditor upskilling for the brand-new Issue 7. Gain professional competency in hazard assessment, critical control points, and supply chain material traceability for global packaging manufacturers.',
    seatsTotal: 15,
    seatsLeft: 4
  },
  {
    id: 'course-5',
    no: 5,
    name: 'BRCGS Internal Auditor (IA) Training',
    category: 'BRC approved',
    duration: '2 Days',
    month: 'August',
    dates: '20,21 Aug 2026',
    daysList: [20, 21],
    time: '9:30 AM to 5:30 PM IST',
    mode: 'Online',
    instructor: 'Mr. Rajesh Nair, Senior Lead Assessor',
    price: '₹12,000 / $165 USD',
    description: 'Learn the techniques and philosophy of effective internal auditing against BRCGS global standards. Includes practical mock audits, compliance report writing, and dynamic root-cause analysis training.',
    seatsTotal: 22,
    seatsLeft: 8
  },
  {
    id: 'course-6',
    no: 6,
    name: 'PCQI Human Foods Version 2 Training',
    category: 'FSPCA approved',
    duration: '2.5 Days',
    month: 'August',
    dates: '20,21,22 Aug 2026',
    daysList: [20, 21, 22],
    time: '9:30 AM to 5:30 PM IST',
    mode: 'Online',
    instructor: 'Dr. Michael Taylor, Certified FSPCA Lead Instructor',
    price: '₹21,000 / $295 USD',
    description: 'Official curriculum to qualify as a Preventive Controls Qualified Individual (PCQI). Necessary under US FDA FSMA regulations for exporting food and beverage products to North American markets.',
    seatsTotal: 12,
    seatsLeft: 2
  },
  {
    id: 'course-7',
    no: 7,
    name: 'FSSC 22000 IA V 7 – Internal Auditor Training',
    category: 'FCID Approved',
    duration: '2 Days',
    month: 'August',
    dates: '24,25 Aug 2026',
    daysList: [24, 25],
    time: '9:30 AM to 5:30 PM IST',
    mode: 'Online',
    instructor: 'Mr. Samuel Grooves, FSMS Consultant',
    price: '₹15,000 / $210 USD',
    description: 'Specialist internal auditor training updated for FSSC 22000 Version 7. Learn to construct, execute, and document robust Food Safety Management System (FSMS) internal audits under the new scheme rules.',
    seatsTotal: 25,
    seatsLeft: 11
  },
  {
    id: 'course-8',
    no: 8,
    name: 'FOSTAC – Catering Training',
    category: 'FSSAI approved',
    duration: '1 Day',
    month: 'September',
    dates: '16 Sept 2026',
    daysList: [16],
    time: '9:30 AM to 5:30 PM IST',
    mode: 'Classroom / On-Site',
    instructor: 'Mrs. Geeta Sharma, FSSAI FoSTaC Master Trainer',
    price: '₹2,500 / $35 USD',
    description: 'Official statutory training mandated under FSSAI rules for food handlers, kitchen supervisors, and quality executives in the catering and hospitality sector in India. Includes statutory certification.',
    seatsTotal: 40,
    seatsLeft: 19
  },
  {
    id: 'course-9',
    no: 9,
    name: 'FOSTAC – Advance Manufacturing Training',
    category: 'FSSAI approved',
    duration: '1 Day',
    month: 'September',
    dates: '17-Sep-26',
    daysList: [17],
    time: '9:30 AM to 5:30 PM IST',
    mode: 'Classroom / On-Site',
    instructor: 'Mrs. Geeta Sharma, FSSAI FoSTaC Master Trainer',
    price: '₹3,000 / $45 USD',
    description: 'Advanced food safety and hygienic practices training for personnel in large-scale food manufacturing units, as per FSSAI regulations. Fully satisfies legal audit requirements.',
    seatsTotal: 35,
    seatsLeft: 14
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
  const [selectedCourse, setSelectedCourse] = useState<TrainingCourse | null>(null);
  const [addedCalendars, setAddedCalendars] = useState<Record<string, boolean>>({});

  // Lock body scroll when course specification modal is open
  useEffect(() => {
    if (selectedCourse) {
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100vh';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.body.style.height = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.height = '';
      document.documentElement.style.overflow = '';
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

    return matchesSearch && matchesCategory && matchesMode;
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
    <div className="space-y-8 max-w-[1280px] mx-auto py-4 px-1">
      
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

      {/* Control panel / Filters */}
      <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 shadow-sm flex flex-col lg:flex-row justify-between items-center gap-6">
        {/* Search */}
        <div className="relative w-full lg:max-w-sm shrink-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ash" size={16} />
          <input
            type="text"
            placeholder="Search training name or standard..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-[#E5E5E5] text-charcoal font-sans text-xs focus:border-primary outline-none rounded-xl"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full justify-start lg:justify-end">
          {/* Category */}
          <div className="flex items-center gap-2 border border-[#E5E5E5] rounded-xl px-3 py-1.5">
            <Filter size={12} className="text-ash" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-xs text-charcoal font-sans border-none outline-none pr-2 cursor-pointer"
            >
              <option value="all">All Accreditation</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Delivery Mode */}
          <div className="flex items-center gap-2 border border-[#E5E5E5] rounded-xl px-3 py-1.5">
            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              className="bg-transparent text-xs text-charcoal font-sans border-none outline-none pr-2 cursor-pointer"
            >
              <option value="all">All Formats</option>
              <option value="Online">Online Sessions</option>
              <option value="Classroom">In-Person/On-site</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {(searchQuery || categoryFilter !== 'all' || modeFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
                setModeFilter('all');
              }}
              className="text-xs text-[#B68A35] font-semibold hover:underline"
            >
              Clear Filters
            </button>
          )}

          {/* View Toggles */}
          <div className="h-8 w-px bg-[#E5E5E5] hidden md:block" />
          <div className="bg-[#F3F4F6] p-1 rounded-xl flex items-center gap-1 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid' 
                  ? 'bg-white text-primary shadow-sm' 
                  : 'text-ash hover:text-primary'
              }`}
              title="Interactive Monthly Calendar Grid"
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
              title="Full Curriculum List"
            >
              <List size={15} />
            </button>
          </div>
        </div>
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
                <div className="border-t border-[#E5E5E5] pt-4 mt-6">
                  <div className="bg-surface p-3 border border-[#E5E5E5]/40 rounded-xl space-y-2 text-xs">
                    <div className="flex gap-2 items-start">
                      <HelpCircle size={14} className="text-[#B68A35] mt-0.5 shrink-0" />
                      <p className="text-[11px] leading-relaxed text-ash">
                        Need an exclusive batch or custom tailored curriculum for your organization?
                      </p>
                    </div>
                    <button
                      onClick={() => onReserveCourse('Custom Corporate Cohort Inquiry', 'Contact for Scheduling')}
                      className="text-xs font-bold text-[#B68A35] hover:underline flex items-center gap-1"
                    >
                      Inquire Custom Corporate Training <ArrowRight size={12} />
                    </button>
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
                          <span className="text-ash">Time (IST):</span>
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

      {/* Course Specifications Modal */}
      <AnimatePresence>
        {selectedCourse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-primary/40 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-[#E5E5E5] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] my-auto shrink-0"
            >
              {/* Modal Banner */}
              <div className="bg-primary text-white p-6 md:p-8 flex justify-between items-start border-b border-white/5 shrink-0">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#DFC181] block mb-2">
                    {selectedCourse.category} accredited module
                  </span>
                  <h3 className="font-serif text-lg md:text-xl font-bold leading-tight max-w-lg">
                    {selectedCourse.name}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="text-white/60 hover:text-white p-1 rounded-full transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
                <div>
                  <h4 className="font-serif text-xs font-bold text-primary uppercase tracking-wider mb-2">
                    Course Specification
                  </h4>
                  <p className="font-sans text-xs md:text-sm text-ash leading-relaxed">
                    {selectedCourse.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#F9F9F9] border border-[#E5E5E5] rounded-xl p-4 font-mono text-xs">
                  <div className="space-y-2">
                    <div className="flex justify-between py-1 border-b border-[#E5E5E5]/60">
                      <span className="text-ash">Course Ref:</span>
                      <span className="text-charcoal font-bold">#2026-Y{selectedCourse.no}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#E5E5E5]/60">
                      <span className="text-ash">Duration:</span>
                      <span className="text-primary font-bold">{selectedCourse.duration}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#E5E5E5]/60">
                      <span className="text-ash">Dates:</span>
                      <span className="text-charcoal font-bold">{selectedCourse.dates}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-ash">Time (IST):</span>
                      <span className="text-charcoal font-bold">{selectedCourse.time}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between py-1 border-b border-[#E5E5E5]/60">
                      <span className="text-ash">Delivery Mode:</span>
                      <span className="text-primary font-bold">{selectedCourse.mode}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#E5E5E5]/60">
                      <span className="text-ash">Pricing:</span>
                      <span className="text-[#B68A35] font-bold">{selectedCourse.price}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#E5E5E5]/60">
                      <span className="text-ash">Seats Capacity:</span>
                      <span className="text-charcoal font-bold">{selectedCourse.seatsTotal} Total</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-ash">Availability:</span>
                      <span className={`font-bold ${
                        selectedCourse.seatsLeft <= 3 ? 'text-red-600 animate-pulse' : 'text-green-600'
                      }`}>
                        {selectedCourse.seatsLeft} Seats Remaining
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 items-center bg-primary/5 p-4 rounded-xl border border-primary/10">
                  <User size={18} className="text-[#B68A35] shrink-0" />
                  <div className="text-xs">
                    <p className="text-ash uppercase tracking-wider font-mono font-bold text-[10px]">Assigned Lead Instructor</p>
                    <p className="text-primary font-bold font-sans mt-0.5">{selectedCourse.instructor}</p>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="border-t border-[#E5E5E5] p-6 bg-[#F9F9F9] flex flex-col sm:flex-row gap-3 justify-end shrink-0">
                {/* Save Course Mock sync to calendar */}
                <button
                  onClick={() => handleMockAddToCalendar(selectedCourse.id)}
                  className="bg-white border border-[#E5E5E5] hover:border-primary text-primary text-xs font-sans font-bold uppercase tracking-widest py-3 px-6 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 focus:outline-none"
                >
                  {addedCalendars[selectedCourse.id] ? (
                    <>
                      <CheckCircle size={14} className="text-green-600" />
                      <span>Saved to My Calendar</span>
                    </>
                  ) : (
                    <>
                      <CalendarIcon size={14} />
                      <span>Add to My Calendar</span>
                    </>
                  )}
                </button>

                {/* Instant Reserve Seat (Launches booking flow) */}
                <button
                  onClick={() => {
                    const notesStr = `Course Inquiry: Ref #${selectedCourse.no} - ${selectedCourse.name}\nDates: ${selectedCourse.dates}\nFormat: ${selectedCourse.mode}`;
                    onReserveCourse(notesStr, selectedCourse.dates);
                    setSelectedCourse(null);
                  }}
                  className="bg-[#B68A35] hover:opacity-95 text-white text-xs font-sans font-bold uppercase tracking-widest py-3 px-6 rounded-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 focus:outline-none"
                >
                  <span>Reserve Seat / Inquire</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
