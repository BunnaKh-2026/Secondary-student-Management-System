import React from 'react';
import { Users, GraduationCap, School, CheckSquare, Calendar, Star, AlertCircle, Edit, FileText, Percent, Award, BookOpen, Briefcase } from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { Teacher, Student, Classroom, TeacherAttendance, StudentAttendance, HomeTeacherTask, SchoolInfo } from '../types';

interface DashboardProps {
  teachers: Teacher[];
  students: Student[];
  classrooms: Classroom[];
  teacherAttendance: TeacherAttendance[];
  studentAttendance: StudentAttendance[];
  htTasks: HomeTeacherTask[];
  schoolInfo: SchoolInfo;
  onNavigate: (tab: string, activeId?: string) => void;
}

function getKhmerLunarDate(gregorianDate: Date): string {
  const khmerWeekdays = ['អាទិត្យ', 'ចន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍'];
  const khmerMonths = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
  
  const toKhmerDigits = (num: number | string): string => {
    const digits: { [key: string]: string } = {
      '0': '០', '1': '១', '2': '២', '3': '៣', '4': '៤', '5': '៥', '6': '៦', '7': '៧', '8': '៨', '9': '៩'
    };
    return String(num).split('').map(char => digits[char] || char).join('');
  };

  const dayOfWeek = khmerWeekdays[gregorianDate.getDay()];
  const solarDay = toKhmerDigits(gregorianDate.getDate());
  const solarMonth = khmerMonths[gregorianDate.getMonth()];
  const solarYear = toKhmerDigits(gregorianDate.getFullYear());

  const zodiac = "ឆ្នាំមមី";
  const era = "អដ្ឋស័ក";
  const BE = "ព.ស.២៥៧០";

  const refMidnight = new Date(2026, 5, 15);
  const currentMidnight = new Date(gregorianDate.getFullYear(), gregorianDate.getMonth(), gregorianDate.getDate());
  
  const diffTime = currentMidnight.getTime() - refMidnight.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  let lunarMonth = "";
  let lunarDayStr = "";
  
  if (diffDays >= 0) {
    if (diffDays < 30) {
      lunarMonth = "ខែបឋមាសាឍ";
      lunarDayStr = getDayOfCycle(diffDays, 30);
    } else if (diffDays < 60) {
      lunarMonth = "ខែទុតិយាសាឍ";
      lunarDayStr = getDayOfCycle(diffDays - 30, 30);
    } else if (diffDays < 89) {
      lunarMonth = "ខែស្រាពណ៍";
      lunarDayStr = getDayOfCycle(diffDays - 60, 29);
    } else if (diffDays < 119) {
      lunarMonth = "ខែភទ្របទ";
      lunarDayStr = getDayOfCycle(diffDays - 89, 30);
    } else if (diffDays < 148) {
      lunarMonth = "ខែអស្សុជ";
      lunarDayStr = getDayOfCycle(diffDays - 119, 29);
    } else {
      lunarMonth = "ខែកត្តិក";
      lunarDayStr = getDayOfCycle(diffDays - 148, 30);
    }
  } else {
    if (diffDays >= -29) {
      lunarMonth = "ខែជេស្ឋ";
      lunarDayStr = getDayOfCycle(diffDays + 29, 29);
    } else {
      lunarMonth = "ខែពិសាខ";
      lunarDayStr = getDayOfCycle(diffDays + 59, 30);
    }
  }

  function getDayOfCycle(index: number, monthLength: number): string {
    const dayNum = index + 1;
    if (dayNum <= 15) {
      return `${toKhmerDigits(dayNum)}កើត`;
    } else {
      const waningDay = dayNum - 15;
      return `${toKhmerDigits(waningDay)}រោច`;
    }
  }

  return `ថ្ងៃ${dayOfWeek} ${lunarDayStr} ${lunarMonth} ${zodiac} ${era} ${BE} ត្រូវនឹងថ្ងៃទី${solarDay} ខែ${solarMonth} គ.ស.${solarYear}`;
}

export default function Dashboard({
  teachers,
  students,
  classrooms,
  teacherAttendance,
  studentAttendance,
  htTasks,
  schoolInfo,
  onNavigate,
}: DashboardProps) {
  // Compute Stats
  const totalTeachers = teachers.length;
  const totalStudents = students.length;
  const totalClasses = classrooms.length;

  const boysCount = students.filter(s => s.gender === 'ប្រុស').length;
  const girlsCount = students.filter(s => s.gender === 'ស្រី').length;

  const teachersG_Male = teachers.filter(t => t.gender === 'ប្រុស').length;
  const teachersG_Female = teachers.filter(t => t.gender === 'ស្រី').length;

  // Active tasks
  const pendingTasks = htTasks.filter(t => !t.isCompleted);
  
  // Today's Date
  const todayStr = new Date().toISOString().split('T')[0];
  const formattedDateKh = new Date().toLocaleDateString('km-KH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Teacher Attendance Today
  const todayTeacherAttList = teacherAttendance.filter(a => a.date === todayStr);
  const presentTeachers = todayTeacherAttList.filter(a => a.status === 'វត្តមាន').length;
  const leaveTeachers = todayTeacherAttList.filter(a => a.status === 'ច្បាប់').length;
  const absentTeachers = todayTeacherAttList.filter(a => a.status === 'អវត្តមាន').length;

  const [dashboardTab, setDashboardTab] = React.useState<'overview' | 'stats' | 'teacher_stats'>('overview');

  // Teacher statistics computations
  const totalTeachersCount = teachers.length;
  const maleTeachersCount = teachersG_Male;
  const femaleTeachersCount = teachersG_Female;
  const maleTeachersPercent = totalTeachersCount > 0 ? parseFloat(((maleTeachersCount / totalTeachersCount) * 100).toFixed(1)) : 0;
  const femaleTeachersPercent = totalTeachersCount > 0 ? parseFloat(((femaleTeachersCount / totalTeachersCount) * 100).toFixed(1)) : 0;

  const teacherGenderData = [
    { name: 'ប្រុស', value: maleTeachersCount, percentage: maleTeachersPercent, color: '#0ea5e9' },
    { name: 'ស្រី', value: femaleTeachersCount, percentage: femaleTeachersPercent, color: '#ec4899' },
  ];

  // Distinct subjects
  const distinctSubjectsMap: { [key: string]: number } = {};
  teachers.forEach(t => {
    if (t.subject) {
      const subj = t.subject.trim();
      distinctSubjectsMap[subj] = (distinctSubjectsMap[subj] || 0) + 1;
    }
  });
  const subjectStatsData = Object.keys(distinctSubjectsMap).map(subj => ({
    name: subj,
    count: distinctSubjectsMap[subj],
  })).sort((a, b) => b.count - a.count);

  // Distinct degrees
  const distinctDegreesMap: { [key: string]: number } = {};
  teachers.forEach(t => {
    const deg = (t.educationDegree || t.educationLevel || "មិនបានបញ្ជាក់").trim();
    distinctDegreesMap[deg] = (distinctDegreesMap[deg] || 0) + 1;
  });
  const degreeStatsData = Object.keys(distinctDegreesMap).map(deg => ({
    name: deg,
    count: distinctDegreesMap[deg],
  })).sort((a, b) => b.count - a.count);

  // Home Teachers (គ្រូបន្ទុកថ្នាក់)
  const homeTeachersCount = teachers.filter(t => t.classCharge && t.classCharge.trim() !== '').length;

  const boysPercent = totalStudents > 0 ? parseFloat(((boysCount / totalStudents) * 100).toFixed(1)) : 0;
  const girlsPercent = totalStudents > 0 ? parseFloat(((girlsCount / totalStudents) * 100).toFixed(1)) : 0;

  // Recharts data for gender
  const genderData = [
    { name: 'ប្រុស', value: boysCount, percentage: boysPercent, color: '#0ea5e9' },
    { name: 'ស្រី', value: girlsCount, percentage: girlsPercent, color: '#ec4899' },
  ];

  // Classroom statistics computations
  const classroomStatsData = classrooms.map(cls => {
    const clsStudents = students.filter(s => s.classroomId === cls.id);
    const boys = clsStudents.filter(s => s.gender === 'ប្រុស').length;
    const girls = clsStudents.filter(s => s.gender === 'ស្រី').length;
    const total = clsStudents.length;
    const percentage = totalStudents > 0 ? parseFloat(((total / totalStudents) * 100).toFixed(1)) : 0;
    return {
      name: cls.name,
      boys: boys,
      girls: girls,
      total: total,
      percentage: percentage,
    };
  });

  return (
    <div id="school-dashboard-view" className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-sm flex flex-col justify-center gap-2">
        <div className="flex items-center gap-2.5">
          <School className="w-5 h-5 text-yellow-300" />
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">
            {schoolInfo.schoolName || "ប្រព័ន្ធគ្រប់គ្រងសាលារៀនមធ្យមសិក្សា"}
          </h1>
        </div>
        <div className="text-xs md:text-sm text-emerald-100/90 font-semibold pl-7 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-yellow-300 shrink-0" />
          <span>{getKhmerLunarDate(new Date())}</span>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setDashboardTab('overview')}
          className={`px-5 py-2.5 text-xs font-bold transition-all border-b-2 -mb-[2px] cursor-pointer flex items-center gap-2 ${
            dashboardTab === 'overview'
              ? 'border-teal-600 text-teal-600 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <School className="w-4 h-4 shrink-0" />
          ទិដ្ឋភាពទូទៅ
        </button>
        <button
          onClick={() => setDashboardTab('stats')}
          className={`px-5 py-2.5 text-xs font-bold transition-all border-b-2 -mb-[2px] cursor-pointer flex items-center gap-2 ${
            dashboardTab === 'stats'
              ? 'border-teal-600 text-teal-600 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <GraduationCap className="w-4 h-4 shrink-0" />
          ស្ថិតិសិស្ស
        </button>
        <button
          onClick={() => setDashboardTab('teacher_stats')}
          className={`px-5 py-2.5 text-xs font-bold transition-all border-b-2 -mb-[2px] cursor-pointer flex items-center gap-2 ${
            dashboardTab === 'teacher_stats'
              ? 'border-teal-600 text-teal-600 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4 shrink-0" />
          ស្ថិតិគ្រូ
        </button>
      </div>

      {dashboardTab === 'overview' && (
        <>
          {/* Main Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Core Teachers Card */}
        <div 
          onClick={() => onNavigate('teachers')}
          className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group flex items-start gap-4"
        >
          <div className="p-3.5 bg-emerald-50 rounded-xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
            <Users className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <span className="text-sm font-medium text-slate-500">សរុបបុគ្គលិក-គ្រូបង្រៀន</span>
            <div className="text-3xl font-bold text-slate-800">{totalTeachers} <span className="text-sm font-normal text-slate-400">នាក់</span></div>
            <div className="flex gap-2 text-xs font-semibold text-slate-500 pt-1">
              <span className="px-2 py-0.5 bg-sky-55 text-sky-700 rounded-sm">ប្រុស: {teachersG_Male}</span>
              <span className="px-2 py-0.5 bg-pink-50 text-pink-700 rounded-sm">ស្រី: {teachersG_Female}</span>
            </div>
          </div>
        </div>

        {/* Core Students Card */}
        <div 
          onClick={() => onNavigate('students')}
          className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group flex items-start gap-4"
        >
          <div className="p-3.5 bg-indigo-50 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <span className="text-sm font-medium text-slate-500">សរុបសិស្សានុសិស្ស</span>
            <div className="text-3xl font-bold text-slate-800">{totalStudents} <span className="text-sm font-normal text-slate-400">នាក់</span></div>
            <div className="flex gap-2 text-xs font-semibold text-slate-500 pt-1">
              <span className="px-2 py-0.5 bg-sky-55 text-sky-700 rounded-sm">ប្រុស: {boysCount}</span>
              <span className="px-2 py-0.5 bg-pink-50 text-pink-700 rounded-sm">ស្រី: {girlsCount}</span>
            </div>
          </div>
        </div>

        {/* Classrooms Card */}
        <div 
          onClick={() => onNavigate('students')} // Or direct view of classes
          className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group flex items-start gap-4"
        >
          <div className="p-3.5 bg-amber-50 rounded-xl text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-all">
            <School className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <span className="text-sm font-medium text-slate-500">ចំនួនថ្នាក់រៀនសរុប</span>
            <div className="text-3xl font-bold text-slate-800">{totalClasses} <span className="text-sm font-normal text-slate-400">ថ្នាក់</span></div>
            <p className="text-xs text-slate-400 pt-1">ចុចទីនេះដើម្បីគ្រប់គ្រងមុខវិជ្ជា និងពិន្ទុ</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Daily Status */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-600" />
              ស្ថានភាពវត្តមានបុគ្គលិក-គ្រូ (ថ្ងៃនេះ)
            </h2>
            <button 
              onClick={() => onNavigate('teachers', 'attendance')} 
              className="text-xs font-semibold text-teal-600 hover:underline"
            >
              កត់ត្រាវត្តមានគ្រូ
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
              <span className="text-xs font-semibold text-emerald-700 block mb-1">វត្តមាន</span>
              <span className="text-2xl font-bold text-emerald-600">{presentTeachers}</span>
              <span className="text-xs text-slate-400 ml-1">នាក់</span>
            </div>
            <div className="bg-sky-50/30 p-4 rounded-xl border border-sky-100">
              <span className="text-xs font-semibold text-sky-700 block mb-1">ច្បាប់ (ច)</span>
              <span className="text-2xl font-bold text-sky-600">{leaveTeachers}</span>
              <span className="text-xs text-slate-400 ml-1">នាក់</span>
            </div>
            <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100">
              <span className="text-xs font-semibold text-rose-700 block mb-1">អវត្តមានអត់ច្បាប់ (អ)</span>
              <span className="text-2xl font-bold text-rose-600">{absentTeachers}</span>
              <span className="text-xs text-slate-400 ml-1">នាក់</span>
            </div>
          </div>

          {todayTeacherAttList.length === 0 ? (
            <div className="bg-slate-50 rounded-xl p-4 text-center text-slate-500 text-sm flex flex-col items-center gap-2">
              <AlertCircle className="w-5 h-5 text-slate-400" />
              <span>មិនទាន់មានការកត់ត្រាវត្តមានសម្រាប់បុគ្គលិក-គ្រូបង្រៀននៅថ្ងៃនេះទេ។</span>
              <button 
                onClick={() => onNavigate('teachers', 'attendance')}
                className="mt-1 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold"
              >
                កត់ត្រាវត្តមានភ្លាមៗ
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">បញ្ជីឈ្មោះកត់ត្រាថ្ងៃនេះ</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {teachers.slice(0, 4).map(t => {
                  const att = todayTeacherAttList.find(a => a.teacherId === t.id);
                  return (
                    <div key={t.id} className="flex justify-between items-center px-3 py-2 bg-slate-50 rounded-lg text-xs">
                      <span className="font-semibold text-slate-700">{t.name} ({t.subject})</span>
                      {att ? (
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          att.status === 'វត្តមាន' ? 'bg-emerald-100 text-emerald-700' :
                          att.status === 'ច្បាប់' ? 'bg-sky-100 text-sky-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {att.status}
                        </span>
                      ) : (
                        <span className="text-slate-400">មិនទាន់កត់ត្រា</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Tasks Notification Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-teal-600" />
              ភារកិច្ចគ្រូបន្ទុកថ្នាក់ ({pendingTasks.length})
            </h2>
            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md font-semibold">
              បន្ទាន់
            </span>
          </div>

          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
            {pendingTasks.length === 0 ? (
              <div className="text-center text-slate-400 text-xs py-10 flex flex-col items-center gap-2">
                <Star className="w-8 h-8 text-yellow-400 animate-spin" style={{ animationDuration: '4s' }} />
                <span>អបអរសាទរ! គ្មានភារកិច្ចមិនទាន់បញ្ចប់ឡើយ។</span>
              </div>
            ) : (
              pendingTasks.slice(0, 4).map(task => {
                const cls = classrooms.find(c => c.id === task.classroomId);
                return (
                  <div key={task.id} className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 hover:border-amber-200 transition-colors space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-xs font-bold text-slate-700 leading-snug">
                        {task.title}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-teal-50 text-teal-700 rounded font-semibold whitespace-nowrap">
                        {cls?.name || 'ទូទៅ'}
                      </span>
                    </div>
                    {task.notes && <p className="text-[11px] text-slate-500 leading-tight">{task.notes}</p>}
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold">
                      <span>ឈានកំណត់៖ {task.deadline}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {pendingTasks.length > 4 && (
            <div className="text-center pt-1 border-t border-slate-50">
              <p className="text-xs text-slate-400 font-medium">និងភារកិច្ចរបស់ថ្នាក់ដទៃទៀត...</p>
            </div>
          )}
        </div>
      </div>

      {/* Classroom Quick Access & Overview */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
          <School className="w-5 h-5 text-teal-600" />
          បញ្ជីថ្នាក់រៀនសម្រាប់ស្វែងរកពិន្ទុ និងវត្តមានសិស្ស
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {classrooms.map(cls => (
            <div 
              key={cls.id}
              onClick={() => onNavigate('students', cls.id)}
              className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-teal-300 hover:shadow-xs transition-all cursor-pointer group flex justify-between items-center"
            >
              <div className="space-y-1">
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md uppercase">
                  កម្រិត {cls.grade}
                </span>
                <h4 className="font-bold text-slate-800 group-hover:text-teal-700 transition-colors">
                  {cls.name}
                </h4>
                <p className="text-xs text-slate-500">
                  សិស្សសរុប៖ {students.filter(s => s.classroomId === cls.id).length} នាក់
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 border border-slate-100 group-hover:border-teal-300 group-hover:text-teal-600 transition-all">
                <FileText className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
        </>
      )}

      {dashboardTab === 'stats' && (
        <div className="space-y-6 animate-fade-in">
          {/* Main Summary of stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-400 block mb-1">សិស្សសរុប</span>
              <div className="text-2xl font-black text-slate-800">{totalStudents} នាក់</div>
              <p className="text-[10px] text-slate-400 mt-2 font-semibold">ចំនួនសិស្សដែលបានចុះឈ្មោះ</p>
            </div>
            <div className="bg-sky-50/40 p-5 rounded-2xl border border-sky-100/60 flex flex-col justify-between">
              <span className="text-xs font-bold text-sky-700 block mb-1">សិស្សប្រុស</span>
              <div className="text-2xl font-black text-sky-600">{boysCount} នាក់</div>
              <p className="text-[10px] text-sky-500 mt-2 font-semibold">ស្មើនឹង {boysPercent}% នៃសិស្សទាំងអស់</p>
            </div>
            <div className="bg-pink-50/40 p-5 rounded-2xl border border-pink-100/60 flex flex-col justify-between">
              <span className="text-xs font-bold text-pink-700 block mb-1">សិស្សស្រី</span>
              <div className="text-2xl font-black text-pink-600">{girlsCount} នាក់</div>
              <p className="text-[10px] text-pink-505 mt-2 font-semibold">ស្មើនឹង {girlsPercent}% នៃសិស្សទាំងអស់</p>
            </div>
            <div className="bg-teal-50/40 p-5 rounded-2xl border border-teal-100/60 flex flex-col justify-between">
              <span className="text-xs font-bold text-teal-700 block mb-1">មធ្យមភាគក្នុងមួយថ្នាក់</span>
              <div className="text-2xl font-black text-teal-600">
                {classrooms.length > 0 ? (totalStudents / classrooms.length).toFixed(1) : 0} នាក់
              </div>
              <p className="text-[10px] text-teal-500 mt-2 font-semibold">សរុប {classrooms.length} ថ្នាក់រៀន</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gender Pie Chart */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-50 pb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600 block"></span>
                ស្ថិតិសិស្សតាមភេទ (ប្រុស-ស្រី)
              </h3>
              {totalStudents === 0 ? (
                <div className="h-[280px] flex flex-col items-center justify-center text-slate-400 text-xs">
                  មិនទាន់មានទិន្នន័យសិស្សានុសិស្សឡើយ
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="h-[240px] w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={genderData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {genderData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value, name, props: any) => [`${value} នាក់ (${props.payload.percentage}%)`, name]}
                          contentStyle={{ borderRadius: '12px', fontSize: '11px', border: '1px solid #f1f5f9' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Custom Legend to make it extremely beautiful and readable */}
                  <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-4">
                    <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-sky-500 block shrink-0"></span>
                        <span className="text-xs font-bold text-slate-600">ប្រុស</span>
                      </div>
                      <span className="text-xs font-extrabold text-slate-700">{boysCount} នាក់ ({boysPercent}%)</span>
                    </div>
                    <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-pink-500 block shrink-0"></span>
                        <span className="text-xs font-bold text-slate-600">ស្រី</span>
                      </div>
                      <span className="text-xs font-extrabold text-slate-700">{girlsCount} នាក់ ({girlsPercent}%)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Classroom Bar Chart */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-50 pb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600 block"></span>
                ភាគរយសិស្សតាមថ្នាក់រៀន (%)
              </h3>
              {totalStudents === 0 ? (
                <div className="h-[280px] flex flex-col items-center justify-center text-slate-400 text-xs">
                  មិនទាន់មានទិន្នន័យសិស្សានុសិស្សឡើយ
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="h-[240px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={classroomStatsData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 'bold', fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fontWeight: 'semibold', fill: '#64748b' }} axisLine={false} tickLine={false} unit="%" />
                        <Tooltip 
                          formatter={(value, name) => [`${value}%`, name === 'percentage' ? 'ភាគរយសិស្សសរុប' : name]}
                          contentStyle={{ borderRadius: '12px', fontSize: '11px', border: '1px solid #f1f5f9' }}
                        />
                        <Bar dataKey="percentage" radius={[6, 6, 0, 0]} fill="#14b8a6" maxBarSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="text-slate-400 text-[10px] text-center font-bold">
                    ក្រាហ្វបង្ហាញពីសមាមាត្រ % នៃចំនួនសិស្សក្នុងថ្នាក់នីមួយៗ ធៀបនឹងចំនួនសិស្សសរុបទូទាំងសាលា
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Classroom Detailed table view */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-3">
              <Percent className="w-4 h-4 text-teal-600" />
              តារាងលម្អិតចំនួនសិស្ស និងភាគរយសិស្សតាមថ្នាក់រៀន
            </h3>
            {totalStudents === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                រកមិនឃើញទិន្នន័យសិស្សានុសិស្សត្រូវបានកំណត់ឡើយ។
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                      <th className="px-4 py-3 text-slate-600">ថ្នាក់រៀន</th>
                      <th className="px-4 py-3 text-center text-slate-600">សិស្សសរុប</th>
                      <th className="px-4 py-3 text-center text-sky-600">សិស្សប្រុស</th>
                      <th className="px-4 py-3 text-center text-pink-600">សិស្សស្រី</th>
                      <th className="px-4 py-3 text-right text-teal-600">សមាមាត្រភាគរយ (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {classroomStatsData.map((data, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors font-medium">
                        <td className="px-4 py-3.5 font-bold text-slate-800">{data.name}</td>
                        <td className="px-4 py-3.5 text-center text-slate-700 font-extrabold">{data.total} នាក់</td>
                        <td className="px-4 py-3.5 text-center text-sky-600 font-semibold">{data.boys} នាក់</td>
                        <td className="px-4 py-3.5 text-center text-pink-600 font-semibold">{data.girls} នាក់</td>
                        <td className="px-4 py-3.5 text-right font-extrabold text-teal-600">
                          <div className="flex items-center justify-end gap-3">
                            <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden shrink-0 hidden sm:block">
                              <div className="bg-teal-500 h-full rounded-full" style={{ width: `${data.percentage}%` }} />
                            </div>
                            <span>{data.percentage}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {dashboardTab === 'teacher_stats' && (
        <div className="space-y-6 animate-fade-in">
          {/* Main Summary of teacher stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-400 block mb-1">បុគ្គលិក-គ្រូសរុប</span>
              <div className="text-2xl font-black text-slate-800">{totalTeachersCount} នាក់</div>
              <p className="text-[10px] text-slate-400 mt-2 font-semibold">ចំនួនបុគ្គលិក-គ្រូបង្រៀនទាំងអស់</p>
            </div>
            <div className="bg-sky-50/40 p-5 rounded-2xl border border-sky-100/60 flex flex-col justify-between">
              <span className="text-xs font-bold text-sky-700 block mb-1">គ្រូបង្រៀនប្រុស</span>
              <div className="text-2xl font-black text-sky-600">{maleTeachersCount} នាក់</div>
              <p className="text-[10px] text-sky-500 mt-2 font-semibold">ស្មើនឹង {maleTeachersPercent}% នៃគ្រូទាំងអស់</p>
            </div>
            <div className="bg-pink-50/40 p-5 rounded-2xl border border-pink-100/60 flex flex-col justify-between">
              <span className="text-xs font-bold text-pink-700 block mb-1">គ្រូបង្រៀនស្រី</span>
              <div className="text-2xl font-black text-pink-600">{femaleTeachersCount} នាក់</div>
              <p className="text-[10px] text-pink-500 mt-2 font-semibold">ស្មើនឹង {femaleTeachersPercent}% នៃគ្រូទាំងអស់</p>
            </div>
            <div className="bg-teal-50/40 p-5 rounded-2xl border border-teal-100/60 flex flex-col justify-between">
              <span className="text-xs font-bold text-teal-700 block mb-1">គ្រូមានបន្ទុកថ្នាក់</span>
              <div className="text-2xl font-black text-teal-600">{homeTeachersCount} នាក់</div>
              <p className="text-[10px] text-teal-500 mt-2 font-semibold">សរុប {homeTeachersCount} ថ្នាក់មានគ្រូបន្ទុក</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Teacher Gender Pie Chart */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-50 pb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600 block"></span>
                ស្ថិតិគ្រូបង្រៀនតាមភេទ (ប្រុស-ស្រី)
              </h3>
              {totalTeachersCount === 0 ? (
                <div className="h-[280px] flex flex-col items-center justify-center text-slate-400 text-xs">
                  មិនទាន់មានទិន្នន័យបុគ្គលិក-គ្រូបង្រៀនឡើយ
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="h-[240px] w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={teacherGenderData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {teacherGenderData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value, name, props: any) => [`${value} នាក់ (${props.payload.percentage}%)`, name]}
                          contentStyle={{ borderRadius: '12px', fontSize: '11px', border: '1px solid #f1f5f9' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Custom Legend */}
                  <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-4">
                    <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-sky-500 block shrink-0"></span>
                        <span className="text-xs font-bold text-slate-600">ប្រុស</span>
                      </div>
                      <span className="text-xs font-extrabold text-slate-700">{maleTeachersCount} នាក់ ({maleTeachersPercent}%)</span>
                    </div>
                    <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-pink-500 block shrink-0"></span>
                        <span className="text-xs font-bold text-slate-600">ស្រី</span>
                      </div>
                      <span className="text-xs font-extrabold text-slate-700">{femaleTeachersCount} នាក់ ({femaleTeachersPercent}%)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Teachers by Subject Bar Chart */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-50 pb-3">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600 block"></span>
                ស្ថិតិគ្រូបង្រៀនតាមមុខវិជ្ជាឯកទេស (នាក់)
              </h3>
              {subjectStatsData.length === 0 ? (
                <div className="h-[280px] flex flex-col items-center justify-center text-slate-400 text-xs">
                  មិនទាន់មានទិន្នន័យឯកទេសគ្រូឡើយ
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="h-[240px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={subjectStatsData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 'bold', fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fontWeight: 'semibold', fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip 
                          formatter={(value) => [`${value} នាក់`, 'ចំនួនគ្រូបង្រៀន']}
                          contentStyle={{ borderRadius: '12px', fontSize: '11px', border: '1px solid #f1f5f9' }}
                        />
                        <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="#0d9488" maxBarSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-slate-400 text-[10px] text-center font-bold">
                    ក្រាប់បង្ហាញពីចំនួនគ្រូបង្រៀនសរុបបែងចែកតាមមុខវិជ្ជាឯកទេសនីមួយៗក្នុងសាលា
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Educational Degrees list */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4 lg:col-span-1">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-3">
                <Award className="w-4 h-4 text-teal-600" />
                កម្រិតវប្បធម៌ / សញ្ញាបត្រ
              </h3>
              {degreeStatsData.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  មិនទាន់មានទិន្នន័យកម្រិតវប្បធម៌ឡើយ។
                </div>
              ) : (
                <div className="space-y-3">
                  {degreeStatsData.map((item, idx) => {
                    const pct = totalTeachersCount > 0 ? ((item.count / totalTeachersCount) * 100).toFixed(0) : 0;
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-slate-700">
                          <span>{item.name}</span>
                          <span>{item.count} នាក់ ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-teal-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Detailed table view */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs lg:col-span-2 space-y-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-3">
                <Briefcase className="w-4 h-4 text-teal-600" />
                បញ្ជីឈ្មោះគ្រូបង្រៀន និងតួនាទីសង្ខេប
              </h3>
              {totalTeachersCount === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  មិនទាន់មានទិន្នន័យគ្រូបង្រៀននៅក្នុងប្រព័ន្ធឡើយ។
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                        <th className="px-3 py-2 text-slate-600">ឈ្មោះគ្រូបង្រៀន</th>
                        <th className="px-3 py-2 text-center text-slate-600">ភេទ</th>
                        <th className="px-3 py-2 text-slate-600">មុខវិជ្ជា</th>
                        <th className="px-3 py-2 text-slate-600">តួនាទី</th>
                        <th className="px-3 py-2 text-slate-600">បន្ទុកថ្នាក់</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {teachers.slice(0, 10).map((t, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-3 py-2.5 font-bold text-slate-800">{t.name}</td>
                          <td className="px-3 py-2.5 text-center text-slate-600">
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              t.gender === 'ប្រុស' ? 'bg-sky-50 text-sky-700' : 'bg-pink-50 text-pink-700'
                            }`}>
                              {t.gender}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-slate-600 font-semibold">{t.subject || 'មិនមាន'}</td>
                          <td className="px-3 py-2.5 text-slate-500 font-medium">{t.role || 'គ្រូបង្រៀន'}</td>
                          <td className="px-3 py-2.5 text-slate-500 font-semibold">
                            {t.classCharge ? (
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md">
                                {t.classCharge}
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {totalTeachersCount > 10 && (
                    <div className="text-center pt-3 text-[11px] text-slate-400 font-bold">
                      បង្ហាញត្រឹម ១០ នាក់ដំបូង។ សូមចូលទៅកាន់ទំព័រ "គ្រប់គ្រងបុគ្គលិក-គ្រូ" ដើម្បីមើលបញ្ជីពេញលេញ។
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
