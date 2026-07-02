import React, { useState, useEffect } from 'react';
import { 
  School, LayoutDashboard, Users, GraduationCap, Settings, 
  HelpCircle, Menu, X, Globe, Calendar, LogOut, CheckCircle,
  RefreshCw, CheckSquare, Award, ArrowLeft, Percent
} from 'lucide-react';
import { getSystemState, saveSystemState, SystemState } from './data/mockData';
import { SchoolInfo, Teacher, Classroom, Student, StudentScore, StudentAttendance, TeacherAttendance, HomeTeacherTask, PreStartConfig } from './types';

// Importing child views
import Dashboard from './components/Dashboard';
import SchoolSettings from './components/SchoolSettings';
import TeacherManagement from './components/TeacherManagement';
import StudentManagement from './components/StudentManagement';
import ClassroomDetails from './components/ClassroomDetails';
import GradingSettings from './components/GradingSettings';

// Academic years generation helper
function toKhmerDigits(num: number | string): string {
  const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
  return num.toString().split('').map(digit => {
    const d = parseInt(digit, 10);
    return isNaN(d) ? digit : khmerDigits[d];
  }).join('');
}

function toArabicClassnameWithPrefix(name: string): string {
  if (!name) return '';
  const prefix = name.startsWith('ថ្នាក់ទី') ? 'ថ្នាក់ទី ' : name.startsWith('ថ្នាក់') ? 'ថ្នាក់ ' : '';
  const clean = name.replace(/^(ថ្នាក់ទី|ថ្នាក់)\s*/g, '').trim();
  const khmerToArabic: { [key: string]: string } = {
    '០': '0', '១': '1', '២': '2', '៣': '3', '៤': '4',
    '៥': '5', '៦': '6', '៧': '7', '៨': '8', '៩': '9'
  };
  let replaced = '';
  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    if (khmerToArabic[char] !== undefined) {
      replaced += khmerToArabic[char];
    } else {
      replaced += char;
    }
  }
  return prefix + replaced
    .replace(/អា/gi, 'A')
    .replace(/ប៊ី/gi, 'B')
    .replace(/ស៊ី/gi, 'C')
    .replace(/ឌី/gi, 'D')
    .replace(/អេ/gi, 'A')
    .replace(/បេ/gi, 'B')
    .replace(/សេ/gi, 'C')
    .replace(/ដេ/gi, 'D')
    .replace(/\s+/g, '');
}

const ACADEMIC_YEARS_LIST = (() => {
  const list = [];
  for (let yr = 2026; yr <= 2049; yr++) {
    const nextYr = yr + 1;
    const yearStr = `${yr}-${nextYr}`;
    const label = `${toKhmerDigits(yr)}-${toKhmerDigits(nextYr)}`;
    list.push({ val: yearStr, label });
  }
  return list;
})();

export default function App() {
  // Global App State
  const [state, setState] = useState<SystemState>(() => getSystemState());

  // Deep route drill-down state (e.g. entering a class's scorecard)
  const [selectedClassroomId, setSelectedClassroomId] = useState<string | null>(null);

  // Active tab within the selected classroom detail view
  const [classroomActiveTab, setClassroomActiveTab] = useState<'config' | 'register' | 'tasks' | 'scores' | 'results' | 'attendance'>('register');

  // General tab navigation
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Subtab navigation for teachers (embedded submenu)
  const [activeTeacherSubTab, setActiveTeacherSubTab] = useState<'list' | 'roles' | 'attendance'>('list');

  // Subtab navigation for students (embedded submenu)
  const [activeStudentSubTab, setActiveStudentSubTab] = useState<'classes_list' | 'classes' | 'students' | 'coefficients' | 'months'>('classes_list');

  // Selected Academic Year state
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('2026-2027');
  const [isAcademicYearOpen, setIsAcademicYearOpen] = useState(false);

  // Collapsible sidebar visibility state (for both desktop and mobile viewports)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Sync state changes with robust LocalStorage
  useEffect(() => {
    saveSystemState(state);
  }, [state]);

  const handleUpdateSchoolInfo = (info: SchoolInfo) => {
    setState(prev => ({ ...prev, schoolInfo: info }));
  };

  const handleUpdateTeachers = (list: Teacher[]) => {
    const updatedClassrooms = state.classrooms.map(c => {
      const chargeTeacher = list.find(t => t.classCharge === c.name);
      const newHTName = chargeTeacher ? chargeTeacher.name : 'មិនទាន់កំណត់';
      if (c.preStartConfig && c.preStartConfig.homeTeacherName !== newHTName) {
        return {
          ...c,
          preStartConfig: {
            ...c.preStartConfig,
            homeTeacherName: newHTName
          }
        };
      }
      if (!c.preStartConfig && chargeTeacher) {
        return {
          ...c,
          preStartConfig: {
            classroomId: c.id,
            homeTeacherName: newHTName,
            academicYear: '២០២៥-២០២៦',
            semester1Months: ['វិច្ឆិកា', 'ធ្នូ', 'មករា', 'កុម្ភៈ', 'មីនា'],
            semester2Months: ['មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា'],
            activeMonthsForAverage: ['វិច្ឆិកា', 'ធ្នូ'],
            subjects: []
          }
        };
      }
      return c;
    });

    setState(prev => ({ 
      ...prev, 
      teachers: list,
      classrooms: updatedClassrooms
    }));
  };

  const handleUpdateClassrooms = (list: Classroom[]) => {
    setState(prev => ({ ...prev, classrooms: list }));
  };

  const handleUpdateStudents = (list: Student[]) => {
    setState(prev => ({ ...prev, students: list }));
  };

  const handleUpdateScores = (list: StudentScore[]) => {
    setState(prev => ({ ...prev, studentScores: list }));
  };

  const handleUpdateStudentAttendance = (list: StudentAttendance[]) => {
    setState(prev => ({ ...prev, studentAttendance: list }));
  };

  const handleUpdateTeacherAttendance = (list: TeacherAttendance[]) => {
    setState(prev => ({ ...prev, teacherAttendance: list }));
  };

  const handleUpdateHTTasks = (list: HomeTeacherTask[]) => {
    setState(prev => ({ ...prev, htTasks: list }));
  };

  const handleUpdatePreStartConfig = (classId: string, config: PreStartConfig) => {
    const targetClass = state.classrooms.find(c => c.id === classId);
    const className = targetClass ? targetClass.name : '';
    
    const updatedTeachers = state.teachers.map(t => {
      if (t.classCharge === className && t.name !== config.homeTeacherName) {
        return { ...t, classCharge: '' };
      }
      if (t.name === config.homeTeacherName && config.homeTeacherName !== 'មិនទាន់កំណត់') {
        return { ...t, classCharge: className };
      }
      return t;
    });

    const updatedClasses = state.classrooms.map(c => 
      c.id === classId ? { ...c, preStartConfig: config } : c
    );

    setState(prev => ({ 
      ...prev, 
      classrooms: updatedClasses,
      teachers: updatedTeachers
    }));
  };

  const handleNavigate = (tab: string, activeId?: string) => {
    setActiveTab(tab);
    if (activeId) {
      if (tab === 'teachers') {
        setActiveTeacherSubTab(activeId as any);
        setSelectedClassroomId(null);
      } else if (tab === 'students') {
        setActiveStudentSubTab(activeId as any);
        setSelectedClassroomId(null);
      } else {
        setSelectedClassroomId(activeId);
      }
    } else {
      setSelectedClassroomId(null);
      if (tab === 'teachers') {
        setActiveTeacherSubTab('list');
      } else if (tab === 'students') {
        setActiveStudentSubTab('students');
      }
    }
    // Close sidebar on mobile devices (width < 768px matches Tailwind md:)
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  // Find active classroom details
  const activeClassroomFull = state.classrooms.find(c => c.id === selectedClassroomId);

  // Pre-load layout print configs
  const appNameKh = "ប្រព័ន្ធគ្រប់គ្រងទិន្នន័យសិស្សមធ្យមសិក្សា";

  return (
    <div 
      id="secondary-school-management-root" 
      className={`${(activeTab === 'teachers' || activeTab === 'students') ? 'h-screen overflow-hidden' : 'min-h-screen'} bg-slate-50 flex text-slate-800`}
    >
      
      {/* Mobile background backdrop overlay to close sidebar easily on tap */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="print:hidden fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-35 md:hidden"
        />
      )}

      {/* 2. UPPER BANNER HEADER (Hidden on Print layout, stretching completely across the screen width) */}
      <header className="print:hidden fixed top-0 left-0 right-0 z-50 h-[88px] sm:h-16 bg-white border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-6 py-1 sm:py-0">
        <div className="flex items-center justify-start gap-1 w-full sm:w-auto h-11 sm:h-16">
          {/* Universal hamburger menu toggle for showing and hiding sidebar on both desktop & mobile */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-xl cursor-pointer flex items-center justify-center transition-colors"
            title="បង្ហាញ/លាក់ម៉ឺនុយខាងឆ្វេង"
          >
            <Menu className="w-5.5 h-5.5" />
          </button>

          <button
            onClick={() => window.location.reload()}
            className="p-1 hover:bg-blue-50 text-blue-600 hover:text-blue-800 rounded-xl cursor-pointer flex items-center justify-center transition-colors"
            title="ផ្ទុកឡើងវិញ (Refresh)"
            type="button"
          >
            <RefreshCw className="w-4.5 h-4.5 animate-hover-spin" />
          </button>

          {/* Title changes dynamically based on screen width */}
          <span className="text-[16px] xs:text-[18px] sm:text-[20px] font-serif text-slate-800 font-bold lg:hidden whitespace-nowrap pl-0.5">
            ប្រព័ន្ធគ្រប់គ្រងទិន្នន័យសិស្ស
          </span>
          <span className="text-[20px] md:text-[21px] font-serif text-slate-800 font-bold lg:inline hidden whitespace-nowrap pl-0.5">
            ប្រព័ន្ធគ្រប់គ្រងទិន្នន័យសិស្សមធ្យមសិក្សា
          </span>
        </div>

        <div className="flex items-center justify-center sm:justify-end w-full sm:w-auto h-9 sm:h-16 shrink-0">
          <div className="relative select-none w-[165px]">
            <button
              onClick={() => setIsAcademicYearOpen(!isAcademicYearOpen)}
              className="px-3 py-1 bg-white border border-purple-500 rounded-xl flex items-center gap-1 text-xs font-semibold text-purple-600 shadow-xs w-full h-[32px] justify-between cursor-pointer focus:outline-none"
            >
              <span className="text-purple-500 font-bold whitespace-nowrap">ឆ្នាំសិក្សា ៖</span>
              <span className="text-purple-700 font-bold whitespace-nowrap">
                {ACADEMIC_YEARS_LIST.find((y) => y.val === selectedAcademicYear)?.label || selectedAcademicYear}
              </span>
            </button>
            
            {isAcademicYearOpen && (
              <>
                {/* Backdrop to dismiss */}
                <div 
                  className="fixed inset-0 z-40 bg-transparent" 
                  onClick={() => setIsAcademicYearOpen(false)} 
                />
                
                {/* Rounded, offset downwards, centered dropdown menu list with custom scrollbar */}
                <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 bg-white border border-purple-500 rounded-2xl shadow-md py-1.5 max-h-72 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-purple-100/30 [&::-webkit-scrollbar-thumb]:bg-purple-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-purple-400">
                  {ACADEMIC_YEARS_LIST.map((item) => (
                    <button
                      key={item.val}
                      onClick={() => {
                        setSelectedAcademicYear(item.val);
                        setIsAcademicYearOpen(false);
                      }}
                      className={`w-full py-1.75 text-xs font-bold text-center transition-colors block cursor-pointer select-none ${
                        selectedAcademicYear === item.val
                          ? 'text-purple-700 bg-purple-100/50'
                          : 'text-purple-600 hover:bg-purple-50/70'
                      }`}
                      style={{ fontFamily: '"Khmer OS Siemreap", "Siemreap", sans-serif' }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 1. LEFT SIDEBAR NAVIGATION PANEL (Hidden on Print layout, fully toggleable) */}
      <aside className={`print:hidden fixed inset-y-0 left-0 z-40 w-40 bg-white border-r border-slate-200 text-slate-800 flex flex-col justify-between transition-transform duration-300 transform pt-[88px] sm:pt-16 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Navigation Items (Khmer Characters corresponding strictly to Requirements) */}
          <nav className="pl-1.5 pr-2.5 pt-4 pb-4 space-y-0.5 flex-1">

            {!selectedClassroomId && (
              <>
                {/* ១. ផ្ទាំងទំព័រដើម (Dashboard) */}
                <button
                  onClick={() => handleNavigate('dashboard')}
                  className={`w-full flex items-center gap-2 px-2 py-1.75 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'dashboard' && !selectedClassroomId
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 shrink-0" />
                  ទំព័រដើម
                </button>

                {/* ២. កំណត់ព័ត៌មាន (Settings) */}
                <button
                  onClick={() => handleNavigate('settings')}
                  className={`w-full flex items-center gap-2 px-2 py-1.75 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'settings'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Settings className="w-4 h-4 shrink-0" />
                  ព័ត៌មានសាលា
                </button>

                {/* កំណត់និទ្ទេស (Grading Scale) */}
                <button
                  onClick={() => handleNavigate('grading')}
                  className={`w-full flex items-center gap-2 px-2 py-1.75 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'grading'
                      ? 'bg-teal-600 text-white shadow-xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Award className="w-4 h-4 shrink-0" />
                  កំណត់និទ្ទេស
                </button>

                {/* ៣. បញ្ជីថ្នាក់រៀន (Class list) */}
                <button
                  onClick={() => {
                    handleNavigate('students');
                    setActiveStudentSubTab('classes_list');
                  }}
                  className={`w-full flex items-center gap-2 px-2 py-1.75 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'students' && activeStudentSubTab === 'classes_list' && !selectedClassroomId
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <School className="w-4 h-4 shrink-0" />
                  បញ្ជីថ្នាក់រៀន
                </button>

                {/* ប៊ូតុង មេគុណ (Coefficients) */}
                <button
                  onClick={() => {
                    handleNavigate('students', 'coefficients');
                  }}
                  className={`w-full flex items-center gap-2 px-2 py-1.75 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'students' && activeStudentSubTab === 'coefficients' && !selectedClassroomId
                      ? 'bg-teal-600 text-white shadow-xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Percent className="w-4 h-4 shrink-0" />
                  មុខវិជ្ជានិងមេគុណ
                </button>

                {/* ប៊ូតុង ខែយកពិន្ទុ (Months) */}
                <button
                  onClick={() => {
                    handleNavigate('students', 'months');
                  }}
                  className={`w-full flex items-center gap-2 px-2 py-1.75 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'students' && activeStudentSubTab === 'months' && !selectedClassroomId
                      ? 'bg-teal-600 text-white shadow-xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Calendar className="w-4 h-4 shrink-0" />
                  ខែក្នុងឆមាស
                </button>

                {/* ៤. បញ្ជីឈ្មោះគ្រូ (Teacher list) */}
                <button
                  onClick={() => {
                    handleNavigate('teachers');
                    setActiveTeacherSubTab('list');
                  }}
                  className={`w-full flex items-center gap-2 px-2 py-1.75 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'teachers' && activeTeacherSubTab === 'list'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Users className="w-4 h-4 shrink-0" />
                  បញ្ជីឈ្មោះគ្រូ
                </button>


                {/* បញ្ជីឈ្មោះសិស្ស (Student List) */}
                <button
                  onClick={() => {
                    handleNavigate('students');
                    setActiveStudentSubTab('students');
                  }}
                  className={`w-full flex items-center gap-2 px-2 py-1.75 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'students' && activeStudentSubTab === 'students' && !selectedClassroomId
                      ? 'bg-teal-600 text-white shadow-xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 shrink-0" />
                  បញ្ជីឈ្មោះសិស្ស
                </button>

                {/* ប៊ូតុង គ្រប់គ្រងថ្នាក់ (Classroom management) */}
                <button
                  onClick={() => {
                    handleNavigate('students', 'classes');
                  }}
                  className={`w-full flex items-center gap-2 px-2 py-1.75 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'students' && activeStudentSubTab === 'classes' && !selectedClassroomId
                      ? 'bg-teal-600 text-white shadow-xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <School className="w-4 h-4 shrink-0" />
                  គ្រប់គ្រងថ្នាក់រៀន
                </button>
              </>
            )}

            {selectedClassroomId && (
              <div className="pt-2.5 border-t border-slate-200 mt-2.5 space-y-1">
                <button
                  onClick={() => handleNavigate('students', 'classes')}
                  className="w-full flex items-center gap-2 px-2 py-2 bg-orange-50 hover:bg-orange-100 border border-orange-300 rounded-xl text-xs font-bold text-orange-600 transition-all cursor-pointer whitespace-nowrap mb-1.5"
                >
                  <ArrowLeft className="w-4 h-4 shrink-0 text-orange-600" />
                  ត្រឡប់ក្រោយ
                </button>
                <div className="relative px-1">
                  <select
                    value={selectedClassroomId || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val) {
                        setSelectedClassroomId(val);
                      }
                    }}
                    className="w-full pl-8 pr-3 py-2 rounded-xl text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200 mb-1 hover:bg-teal-100/50 transition-colors cursor-pointer appearance-none outline-none focus:ring-1 focus:ring-teal-500 truncate"
                  >
                    {state.classrooms.map((c) => (
                      <option key={c.id} value={c.id}>
                        {toArabicClassnameWithPrefix(c.name)}
                      </option>
                    ))}
                  </select>
                  <School className="absolute left-3 top-2.5 w-3.5 h-3.5 text-teal-500 pointer-events-none" />
                </div>

                {/* Sub-tabs under selected class */}
                <div className="space-y-0.5 pt-1">
                  {[
                    { id: 'register', label: 'បញ្ជីឈ្មោះសិស្ស', icon: Users },
                    { id: 'config', label: 'ព័ត៌មានគ្រូបន្ទុក', icon: Settings },
                    { id: 'tasks', label: 'កិច្ចការគ្រូបន្ទុក', icon: CheckSquare },
                    { id: 'attendance', label: 'វត្តមានសិស្ស', icon: Calendar },
                    { id: 'scores', label: 'ស្រង់ពិន្ទុប្រឡង', icon: GraduationCap },
                    { id: 'results', label: 'លទ្ធផលសិក្សា', icon: Award },
                  ].map((subTab) => {
                    const IconComp = subTab.icon;
                    const isActiveSub = classroomActiveTab === subTab.id;
                    return (
                      <button
                        key={subTab.id}
                        onClick={() => {
                          setClassroomActiveTab(subTab.id as any);
                        }}
                        className={`w-full text-left px-2 py-1.75 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                          isActiveSub
                            ? 'bg-teal-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <IconComp className={`w-4 h-4 shrink-0 ${isActiveSub ? 'text-white' : 'text-slate-400'}`} />
                        <span>{subTab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </nav>
        </div>

      </aside>

      {/* 2. MAIN APP CONTAINER WRAPPER */}
      <div className={`flex-1 flex flex-col pt-[88px] sm:pt-16 transition-all duration-300 focus:outline-none min-w-0 max-w-full overflow-hidden ${
        isSidebarOpen ? 'md:pl-40' : 'md:pl-0'
      } ${(activeTab === 'teachers' || activeTab === 'students') ? 'h-full overflow-hidden' : ''}`}>
        
        {/* MAIN BODY CORE CONTENT SECTION */}
        <main className={`flex-1 p-4 md:p-8 outline-none print:p-0 print:m-0 min-w-0 max-w-full ${
          (activeTab === 'teachers' || activeTab === 'students') ? 'h-full flex flex-col overflow-hidden min-h-0 pb-4 md:pb-6' : ''
        }`}>
          
          {/* Conditional rendering depending on target views */}
          <div className={`print:hidden w-full min-w-0 max-w-full ${
            (activeTab === 'teachers' || activeTab === 'students') ? 'flex-1 flex flex-col overflow-hidden min-h-0' : ''
          }`}>
            {/* If selected classroom is active, render ClassroomDetails sheets directly */}
            {selectedClassroomId && activeClassroomFull ? (
              <ClassroomDetails
                classroom={activeClassroomFull}
                classrooms={state.classrooms}
                students={state.students}
                studentScores={state.studentScores}
                studentAttendance={state.studentAttendance}
                htTasks={state.htTasks}
                schoolInfo={state.schoolInfo}
                teachers={state.teachers}
                onUpdateTeachers={handleUpdateTeachers}
                onBack={() => handleNavigate('students', 'classes')}
                onUpdatePreStartConfig={handleUpdatePreStartConfig}
                onUpdateScores={handleUpdateScores}
                onUpdateAttendance={handleUpdateStudentAttendance}
                onUpdateHTTasks={handleUpdateHTTasks}
                onUpdateStudents={handleUpdateStudents}
                activeTab={classroomActiveTab}
                onActiveTabChange={setClassroomActiveTab}
              />
            ) : (
              <>
                {activeTab === 'dashboard' && (
                  <Dashboard
                    teachers={state.teachers}
                    students={state.students}
                    classrooms={state.classrooms}
                    teacherAttendance={state.teacherAttendance}
                    studentAttendance={state.studentAttendance}
                    htTasks={state.htTasks}
                    schoolInfo={state.schoolInfo}
                    onNavigate={handleNavigate}
                  />
                )}

                {activeTab === 'settings' && (
                  <SchoolSettings
                    schoolInfo={state.schoolInfo}
                    onSave={handleUpdateSchoolInfo}
                  />
                )}

                {activeTab === 'grading' && (
                  <GradingSettings />
                )}

                {activeTab === 'teachers' && (
                  <TeacherManagement
                    teachers={state.teachers}
                    teacherAttendance={state.teacherAttendance}
                    schoolInfo={state.schoolInfo}
                    onUpdateTeachers={handleUpdateTeachers}
                    onUpdateAttendance={handleUpdateTeacherAttendance}
                    activeSubTab={activeTeacherSubTab}
                    classrooms={state.classrooms}
                  />
                )}

                {activeTab === 'students' && (
                  <StudentManagement
                    students={state.students}
                    classrooms={state.classrooms}
                    schoolInfo={state.schoolInfo}
                    onUpdateStudents={handleUpdateStudents}
                    onUpdateClassrooms={handleUpdateClassrooms}
                    onSelectClassroom={(classId) => {
                      setSelectedClassroomId(classId);
                      setClassroomActiveTab('register');
                    }}
                    activeSubTab={activeStudentSubTab}
                  />
                )}
              </>
            )}
          </div>

          {/* Under print layout configuration, browser displays only the focused target element (this is handled in page CSS natively) */}
        </main>
      </div>
    </div>
  );
}
