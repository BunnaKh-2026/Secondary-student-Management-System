import React from 'react';
import { Users, GraduationCap, School, CheckSquare, Calendar, Star, AlertCircle, Edit, FileText } from 'lucide-react';
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
    </div>
  );
}
