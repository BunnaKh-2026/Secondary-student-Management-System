import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, Settings, Users, CheckSquare, Edit, FileText, 
  Calendar, Award, Plus, Trash2, CheckCircle2, Save, X, Star, Printer 
} from 'lucide-react';
import { 
  Classroom, Student, StudentScore, StudentAttendance, 
  HomeTeacherTask, PreStartConfig, SubjectConfig, SchoolInfo 
} from '../types';

interface ClassroomDetailsProps {
  classroom: Classroom;
  students: Student[];
  studentScores: StudentScore[];
  studentAttendance: StudentAttendance[];
  htTasks: HomeTeacherTask[];
  schoolInfo: SchoolInfo;
  onBack: () => void;
  onUpdatePreStartConfig: (classId: string, config: PreStartConfig) => void;
  onUpdateScores: (scores: StudentScore[]) => void;
  onUpdateAttendance: (attendance: StudentAttendance[]) => void;
  onUpdateHTTasks: (tasks: HomeTeacherTask[]) => void;
  activeTab?: 'config' | 'register' | 'tasks' | 'scores' | 'results' | 'attendance';
  onActiveTabChange?: (tab: 'config' | 'register' | 'tasks' | 'scores' | 'results' | 'attendance') => void;
}

export default function ClassroomDetails({
  classroom,
  students,
  studentScores,
  studentAttendance,
  htTasks,
  schoolInfo,
  onBack,
  onUpdatePreStartConfig,
  onUpdateScores,
  onUpdateAttendance,
  onUpdateHTTasks,
  activeTab: activeTabProp,
  onActiveTabChange: onActiveTabChangeProp,
}: ClassroomDetailsProps) {
  // Navigation Tabs specific to ClassroomDetails
  const [localActiveTab, setLocalActiveTab] = useState<'config' | 'register' | 'tasks' | 'scores' | 'results' | 'attendance'>('register');

  const activeTab = activeTabProp !== undefined ? activeTabProp : localActiveTab;
  const setActiveTab = onActiveTabChangeProp !== undefined ? onActiveTabChangeProp : setLocalActiveTab;

  // Load / Initialize PreStartConfig
  const config: PreStartConfig = useMemo(() => {
    return classroom.preStartConfig || {
      classroomId: classroom.id,
      homeTeacherName: 'មិនទាន់កំណត់',
      academicYear: '២០២៥-២០២៦',
      semester1Months: ['វិច្ឆិកា', 'ធ្នូ', 'មករា', 'កុម្ភៈ', 'មីនា'],
      semester2Months: ['មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា'],
      activeMonthsForAverage: ['វិច្ឆិកា', 'ធ្នូ'],
      subjects: [
        { id: '1', name: 'ភាសាខ្មែរ', coefficient: 2, isActive: true },
        { id: '2', name: 'គណិតវិទ្យា', coefficient: 2, isActive: true },
        { id: '3', name: 'រូបវិទ្យា', coefficient: 1.5, isActive: true },
        { id: '4', name: 'គីមីវិទ្យា', coefficient: 1.5, isActive: true },
        { id: '5', name: 'ជីវវិទ្យា', coefficient: 1, isActive: true },
        { id: '6', name: 'ប្រវត្តិវិទ្យា', coefficient: 1, isActive: true },
        { id: '7', name: 'ភូមិវិទ្យា', coefficient: 1, isActive: true },
        { id: '8', name: 'សីលធម៌-ពលរដ្ឋ', coefficient: 1, isActive: true },
        { id: '9', name: 'ភាសាបរទេស (អង់គ្លេស)', coefficient: 1, isActive: true },
        { id: '10', name: 'ព័ត៌មានវិទ្យា', coefficient: 1, isActive: true },
      ],
    };
  }, [classroom]);

  // Form Config Local State
  const [configHTName, setConfigHTName] = useState(config.homeTeacherName);
  const [configYear, setConfigYear] = useState(config.academicYear);
  const [activeMonthsLocal, setActiveMonthsLocal] = useState<string[]>(config.activeMonthsForAverage);
  const [subjectsLocal, setSubjectsLocal] = useState<SubjectConfig[]>(config.subjects);

  // Home Teacher tasks helper State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDeadline, setNewTaskDeadline] = useState(new Date().toISOString().split('T')[0]);

  // Filter students belonging to this class
  const classStudents = useMemo(() => students.filter(s => s.classroomId === classroom.id), [students, classroom]);

  // General Month Selector helper mapping
  const allConfigMonths = useMemo(() => [...config.semester1Months, ...config.semester2Months], [config]);
  const [selectedScoreMonth, setSelectedScoreMonth] = useState<string>(allConfigMonths[0] || 'វិច្ឆិកា');

  // Input states for scores layout matrix
  const [editingScoresLocal, setEditingScoresLocal] = useState<{ [studentId: string]: { [subjId: string]: string } }>({});

  // Active student for print Certificate of Merit (ប័ណ្ណសរសើរ)
  const [certificateStudent, setCertificateStudent] = useState<Student | null>(null);
  const [certificateRank, setCertificateRank] = useState('១');

  // Attendance Dates Filter
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);

  // Initialize Config Panel inputs on mount or config update
  useEffect(() => {
    setConfigHTName(config.homeTeacherName);
    setConfigYear(config.academicYear);
    setActiveMonthsLocal(config.activeMonthsForAverage);
    setSubjectsLocal(config.subjects);
  }, [config]);

  // Load scores to local edit buffers when changing selected month
  useEffect(() => {
    const buffers: typeof editingScoresLocal = {};
    classStudents.forEach(s => {
      const dbScore = studentScores.find(sc => sc.studentId === s.id && sc.month === selectedScoreMonth);
      buffers[s.id] = {};
      config.subjects.forEach(sub => {
        if (sub.isActive) {
          buffers[s.id][sub.id] = dbScore?.scores[sub.id] !== undefined ? String(dbScore.scores[sub.id]) : '';
        }
      });
    });
    setEditingScoresLocal(buffers);
  }, [selectedScoreMonth, classStudents, config, studentScores]);

  // CONFIGURATION SAVE
  const handleSaveConfig = () => {
    const updatedConfig: PreStartConfig = {
      ...config,
      homeTeacherName: configHTName,
      academicYear: configYear,
      activeMonthsForAverage: activeMonthsLocal,
      subjects: subjectsLocal,
    };
    onUpdatePreStartConfig(classroom.id, updatedConfig);
    alert('រក្សាទុកព័ត៌មានមុនចាប់ផ្ដើមដោយជោគជ័យ!');
  };

  const handleToggleMonthAverage = (mName: string) => {
    if (activeMonthsLocal.includes(mName)) {
      setActiveMonthsLocal(activeMonthsLocal.filter(x => x !== mName));
    } else {
      setActiveMonthsLocal([...activeMonthsLocal, mName]);
    }
  };

  const handleToggleSubjectActive = (subId: string) => {
    setSubjectsLocal(subjectsLocal.map(s => s.id === subId ? { ...s, isActive: !s.isActive } : s));
  };

  const handleUpdateSubjectCoeff = (subId: string, val: number) => {
    setSubjectsLocal(subjectsLocal.map(s => s.id === subId ? { ...s, coefficient: val } : s));
  };

  // HT TASKS ACTIONS
  const classTasks = useMemo(() => htTasks.filter(t => t.classroomId === classroom.id), [htTasks, classroom]);
  
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask: HomeTeacherTask = {
      id: `TSK-${Date.now()}`,
      classroomId: classroom.id,
      title: newTaskTitle.trim(),
      deadline: newTaskDeadline,
      isCompleted: false,
    };
    onUpdateHTTasks([...htTasks, newTask]);
    setNewTaskTitle('');
  };

  const handleToggleTask = (taskId: string) => {
    const updated = htTasks.map(t => t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t);
    onUpdateHTTasks(updated);
  };

  const handleDeleteTask = (taskId: string) => {
    onUpdateHTTasks(htTasks.filter(t => t.id !== taskId));
  };

  // SCORES RECORDING SAVE
  const handleSaveScoresMatrix = () => {
    let updatedScores = [...studentScores];

    classStudents.forEach(s => {
      const localMap = editingScoresLocal[s.id] || {};
      const scoreObj: { [id: string]: number } = {};
      
      config.subjects.forEach(sub => {
        if (sub.isActive && localMap[sub.id]) {
          scoreObj[sub.id] = parseFloat(localMap[sub.id]) || 0;
        }
      });

      // Find if exists
      const idx = updatedScores.findIndex(x => x.studentId === s.id && x.month === selectedScoreMonth);
      if (idx > -1) {
        updatedScores[idx] = {
          ...updatedScores[idx],
          scores: scoreObj,
        };
      } else {
        updatedScores.push({
          id: `SC-${Date.now()}-${s.id}`,
          studentId: s.id,
          classroomId: classroom.id,
          month: selectedScoreMonth,
          scores: scoreObj,
        });
      }
    });

    onUpdateScores(updatedScores);
    alert('រក្សាទុកតារាងពិន្ទុសម្រាប់ប្រចាំខែនេះរួចរាល់!');
  };

  // MATH CALCULATOR ENGINE FOR ANALYSIS
  const activeConfigMonths = config.activeMonthsForAverage;
  const activeConfigSubjects = useMemo(() => config.subjects.filter(s => s.isActive), [config]);
  const totalCoefficients = useMemo(() => activeConfigSubjects.reduce((acc, s) => acc + s.coefficient, 0), [activeConfigSubjects]);

  // Compute stats for results sheet (Grades & Rankings)
  const academicCalculationsReport = useMemo(() => {
    return classStudents.map(student => {
      // Get all scores belonging to this student for active months
      const activeMonthsScores = studentScores.filter(sc => 
        sc.studentId === student.id && 
        activeConfigMonths.includes(sc.month)
      );

      // Math average computing
      let cumulativeSum = 0;
      let scoreFoundCount = 0;

      // Subject-specific cumulative totals
      const averageBySubject: { [subjId: string]: number } = {};
      
      activeConfigSubjects.forEach(sub => {
        let subjectSum = 0;
        let subjectCount = 0;

        activeMonthsScores.forEach(moScore => {
          const val = moScore.scores[sub.id];
          if (val !== undefined) {
            subjectSum += val;
            subjectCount++;
          }
        });

        const subAvg = subjectCount > 0 ? subjectSum / subjectCount : 0;
        averageBySubject[sub.id] = subAvg;

        cumulativeSum += subAvg * sub.coefficient;
        if (subjectCount > 0) scoreFoundCount++;
      });

      // Compute general average out of 50 (or percentage out of 10)
      const denominator = totalCoefficients || 1;
      const computedAverage = scoreFoundCount > 0 ? cumulativeSum / denominator : 0;

      return {
        student,
        subjectAverages: averageBySubject,
        totalPoints: cumulativeSum,
        average: parseFloat(computedAverage.toFixed(2)),
        isPassed: computedAverage >= 25, // default passing grade in secondary is a 25/50, or 5/10!
      };
    })
    // Sort descending to assign ranks
    .sort((a, b) => b.average - a.average)
    .map((item, index, arr) => {
      // Handle same average ties
      let rank = index + 1;
      if (index > 0 && item.average === arr[index - 1].average) {
        // Find previous item rank
        let prev = index - 1;
        while (prev >= 0 && arr[prev].average === item.average) {
          prev--;
        }
        rank = prev + 2;
      }
      return {
        ...item,
        rank,
      };
    });
  }, [classStudents, studentScores, activeConfigMonths, activeConfigSubjects, totalCoefficients]);

  // Honor roll filter threshold (average study > 40 out of 50, which is an excellent 8/10 average)
  const honorRollStudents = useMemo(() => {
    return academicCalculationsReport.filter(r => r.average >= 38);
  }, [academicCalculationsReport]);

  // STUDENT ATTENDANCE LOCAL CONTROLLER
  const handleMarkStudentAttendance = (studentId: string, status: typeof studentAttendance[0]['status'], noteValue?: string) => {
    // Current semester designation
    let semester: 'ឆមាសទី១' | 'ឆមាសទី២' = 'ឆមាសទី១';
    const monthIndex = allConfigMonths.indexOf(selectedScoreMonth);
    if (monthIndex > config.semester1Months.length - 1) {
      semester = 'ឆមាសទី២';
    }

    const todayRosterIdx = studentAttendance.findIndex(a => 
      a.studentId === studentId && 
      a.date === attendanceDate
    );
    const updated = [...studentAttendance];

    if (todayRosterIdx > -1) {
      updated[todayRosterIdx] = {
        ...updated[todayRosterIdx],
        status,
        notes: noteValue !== undefined ? noteValue : (updated[todayRosterIdx].notes || ''),
      };
    } else {
      updated.push({
        id: `SATT-${Date.now()}-${studentId}`,
        studentId,
        classroomId: classroom.id,
        date: attendanceDate,
        month: selectedScoreMonth,
        semester,
        status,
        notes: noteValue || '',
      });
    }

    onUpdateAttendance(updated);
  };

  return (
    <div id="classroom-details-roster" className="space-y-6">
      {/* 2. REGISTER TAB - LIST OF CLASSROOM STUDENTS */}
      {activeTab === 'register' && (
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3 border-slate-100">
            <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-600" />
              បញ្ជីឈ្មោះសិស្ស {classroom.name}
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold text-xs">
                  <th className="px-4 py-3 text-center">លេខរៀង</th>
                  <th className="px-4 py-3 text-center">អត្តលេខសិស្ស</th>
                  <th className="px-4 py-3">ឈ្មោះខ្មែរ</th>
                  <th className="px-4 py-3">ឈ្មោះឡាតាំង</th>
                  <th className="px-3 py-3 text-center">ភេទ</th>
                  <th className="px-4 py-3">ថ្ងៃខែឆ្នាំកំណើត</th>
                  <th className="px-4 py-3">លេខអណាព្យាបាល</th>
                </tr>
              </thead>
              <tbody>
                {classStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-slate-400 text-xs font-medium">
                      មិនទាន់មានសិស្សានុសិស្សត្រូវបានចាត់បញ្ចូលថ្នាក់នេះនៅឡើយទេ។
                    </td>
                  </tr>
                ) : (
                  classStudents.map(s => (
                    <tr 
                      key={s.id} 
                      className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors text-xs text-slate-700 font-semibold"
                    >
                      <td className="px-4 py-3 text-center font-mono text-slate-400">{s.rollNumber}</td>
                      <td className="px-4 py-3 text-center font-mono font-bold text-teal-600">{s.studentIdCard}</td>
                      <td className="px-4 py-3 font-bold text-slate-800">{s.nameKhmer}</td>
                      <td className="px-4 py-3 font-mono text-slate-500 uppercase">{s.nameLatin}</td>
                      <td className="px-3 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold ${
                          s.gender === 'ប្រុស' ? 'bg-sky-50 text-sky-700' : 'bg-pink-50 text-pink-700'
                        }`}>
                          {s.gender}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-sans">{s.dob || '---'}</td>
                      <td className="px-4 py-3 font-sans text-slate-500">{s.parentPhone}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 1. CONFIG START TAB - ព័ត៌មានមុនចាប់ផ្ដើម */}
      {activeTab === 'config' && (
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6">
          <div className="space-y-1 border-b border-slate-100 pb-3">
            <h2 className="font-bold text-slate-800 text-lg">ព័ត៌មានមុនចាប់ផ្ដើម (កំណត់លក្ខខណ្ឌថ្នាក់សិក្សា)</h2>
            <p className="text-slate-500 text-xs">កំណត់គ្រូបន្ទុកថ្នាក់ កាលបរិច្ឆេទខែសិក្សា ចាត់ចែងមុខវិជ្ជាសកម្ម និងមេគុណសម្រាប់ឆមាសនីមួយៗ</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* General parameters */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="config-home-teacher-input" className="text-xs font-bold text-slate-600 block">១. គ្រូបន្ទុកថ្នាក់បច្ចុប្បន្ន</label>
                <input
                  id="config-home-teacher-input"
                  type="text"
                  value={configHTName}
                  onChange={e => setConfigHTName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="config-year-input" className="text-xs font-bold text-slate-600 block">២. ឆ្នាំសិក្សាសាលា</label>
                <input
                  id="config-year-input"
                  type="text"
                  value={configYear}
                  onChange={e => setConfigYear(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white"
                />
              </div>

              {/* Toggle averaging months */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">៣. ជ្រើសរើសខែយកមកបូកបញ្ចូលមធ្យមពិន្ទុ</label>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {allConfigMonths.map(mon => {
                    const isSel = activeMonthsLocal.includes(mon);
                    return (
                      <button
                        key={mon}
                        type="button"
                        onClick={() => handleToggleMonthAverage(mon)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                          isSel
                            ? 'bg-teal-600 border-teal-600 text-white'
                            : 'bg-white border-slate-250 text-slate-600'
                        }`}
                      >
                        {mon} {isSel && '✓'}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Subject weight coefficients and toggles */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-600 block">៤. មុខវិជ្ជាសកម្ម & កំណត់មេគុណស្ដង់ដារ</label>
              <div className="border border-slate-100 rounded-xl overflow-hidden max-h-72 overflow-y-auto divide-y divide-slate-100">
                {subjectsLocal.map(subj => (
                  <div key={subj.id} className="p-3 flex items-center justify-between text-xs bg-slate-50/30">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={subj.isActive}
                        onChange={() => handleToggleSubjectActive(subj.id)}
                        className="w-4 h-4 text-teal-600 border-slate-200 focus:ring-teal-500 rounded"
                      />
                      <span className={`font-bold ${subj.isActive ? 'text-slate-800' : 'text-slate-400 line-through'}`}>
                        {subj.name}
                      </span>
                    </div>

                    {subj.isActive && (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-semibold">មេគុណ៖</span>
                        <input
                          type="number"
                          step="0.5"
                          min="1"
                          max="4"
                          value={subj.coefficient}
                          onChange={e => handleUpdateSubjectCoeff(subj.id, parseFloat(e.target.value) || 1)}
                          className="w-12 px-1.5 py-0.5 bg-white border border-slate-200 rounded text-center text-xs font-bold text-teal-700"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleSaveConfig}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              រក្សាទុកការកំណត់ទាំងអស់
            </button>
          </div>
        </div>
      )}

      {/* 3. HOME TEACHER CHORES TAB - កិច្ចការគ្រូបន្ទុកថ្នាក់ */}
      {activeTab === 'tasks' && (
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6 animate-fade-in">
          <div className="space-y-1 border-b border-slate-100 pb-3">
            <h2 className="font-bold text-slate-800 text-lg">៣-ក. កិច្ចការ ឬខ្លឹមសារការងារគ្រូបន្ទុកថ្នាក់ ({classroom.name})</h2>
            <p className="text-slate-500 text-xs text-right-aligned">កំណត់ និងតាមដានរដ្ឋបាលការងាររបស់ថ្នាក់ ដើម្បីការបញ្ជាក់លទ្ធផលត្រឹមត្រូវ</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Create task form panel */}
            <form onSubmit={handleAddTask} className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-4 h-fit">
              <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider">បង្កើតកិច្ចការថ្មី</h3>
              
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 block">ខ្លឹមសារការងារ/ឈ្មោះភារកិច្ច</label>
                <input
                  type="text"
                  required
                  placeholder="ឧ. បំពេញកម្រងព័ត៌មានវត្តមាន"
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-250 rounded-xl text-xs outline-none focus:border-teal-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 block">កាលបរិច្ឆេទកំណត់បញ្ចប់</label>
                <input
                  type="date"
                  required
                  value={newTaskDeadline}
                  onChange={e => setNewTaskDeadline(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-250 rounded-xl text-xs outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                បន្ថែមការចាត់ចែង
              </button>
            </form>

            {/* List panel */}
            <div className="lg:col-span-2 space-y-3">
              <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider">បញ្ជីកិច្ចការកំពុងអនុវត្ត</h3>
              {classTasks.length === 0 ? (
                <div className="p-8 border border-dashed border-slate-200 rounded-2xl text-center text-slate-400 text-xs">
                  មិនទាន់មានការបន្ថែមការងារសម្រាប់គ្រូបន្ទុកថ្នាក់នេះនៅឡើយទេ។
                </div>
              ) : (
                <div className="space-y-2">
                  {classTasks.map(task => (
                    <div 
                      key={task.id}
                      className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-colors ${
                        task.isCompleted
                          ? 'bg-slate-50 border-slate-100 text-slate-400'
                          : 'bg-white border-slate-150 hover:border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => handleToggleTask(task.id)}
                          className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-all ${
                            task.isCompleted
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'bg-white border-slate-300 hover:border-teal-500'
                          }`}
                        >
                          {task.isCompleted && '✓'}
                        </button>
                        <div>
                          <p className={`text-xs font-bold ${task.isCompleted ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                            {task.title}
                          </p>
                          <span className="text-[10px] text-slate-400 font-semibold">កំណត់៖ {task.deadline}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                        title="លុបកិច្ចការ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. SCORES INPUT TAB - ស្រង់ពិន្ទុសិស្ស */}
      {activeTab === 'scores' && (
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-3">
            <div className="space-y-0.5">
              <h2 className="font-bold text-slate-800 text-lg">ស្រង់ពិន្ទុសិស្ស (តាមខែឆមាសនីមួយៗ)</h2>
              <p className="text-slate-500 text-xs">ជ្រើសរើសខែសកម្ម ដើម្បីបញ្ចូលពិន្ទុសម្រាប់សិស្សម្នាក់ៗតាមមុខវិជ្ជា</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">ជ្រើសរើសខែស្រង់ពិន្ទុ៖</span>
              <select
                value={selectedScoreMonth}
                onChange={e => setSelectedScoreMonth(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none font-bold text-teal-700"
              >
                {allConfigMonths.map(mon => (
                  <option key={mon} value={mon}>{mon}</option>
                ))}
              </select>
            </div>
          </div>

          {classStudents.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-xs">
              សូមបញ្ចូលសិស្សានុសិស្សមកកាន់ថ្នាក់រៀននេះជាមុនសិន!
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto border border-slate-100 rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-150 text-slate-600 font-bold text-xs uppercase">
                      <th className="px-4 py-3 text-center w-12 bg-slate-100/50">លេខរៀង</th>
                      <th className="px-4 py-3 w-40">ឈ្មោះសិស្សខ្មែរ</th>
                      {activeConfigSubjects.map(sub => (
                        <th key={sub.id} className="px-3 py-3 text-center min-w-[90px]">
                          <div>{sub.name}</div>
                          <div className="text-[10px] text-slate-400 font-medium">មេគុណ {sub.coefficient}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {classStudents.map((s, idx) => (
                      <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors text-xs font-semibold">
                        <td className="px-4 py-3 text-center font-mono text-slate-400 bg-slate-50/10">{s.rollNumber || idx + 1}</td>
                        <td className="px-4 py-3 font-bold text-slate-800">{s.nameKhmer}</td>
                        
                        {activeConfigSubjects.map(sub => {
                          const val = editingScoresLocal[s.id]?.[sub.id] || '';
                          return (
                            <td key={sub.id} className="px-3 py-2">
                              <input
                                type="text"
                                value={val}
                                onChange={e => {
                                  const cpy = { ...editingScoresLocal };
                                  if (!cpy[s.id]) cpy[s.id] = {};
                                  cpy[s.id][sub.id] = e.target.value;
                                  setEditingScoresLocal(cpy);
                                }}
                                placeholder="0-50"
                                className="w-full px-2 py-1 bg-slate-50 border border-slate-200 text-center text-xs font-semibold rounded-md focus:bg-white focus:border-teal-500 outline-none"
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSaveScoresMatrix}
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
                >
                  <Save className="w-4 h-4" />
                  សុពលភាពតារាងពិន្ទុ {selectedScoreMonth}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. STUDENT ATTENDANCE TAB - គ្រប់គ្រងវត្តមានសិស្ស */}
      {activeTab === 'attendance' && (
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-3">
            <div className="space-y-0.5">
              <h2 className="font-bold text-slate-800 text-lg">គ្រប់គ្រងវត្តមានសិស្ស ({selectedScoreMonth})</h2>
              <p className="text-slate-500 text-xs">ជ្រើសរើសថ្ងៃខែ ដើម្បីកត់ត្រាច្បាប់ និងអវត្តមានសម្រាប់សិស្សនីមួយៗ</p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">កាលបរិច្ឆេទថ្ងៃ៖</span>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={e => setAttendanceDate(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">ខែ៖</span>
                <select
                  value={selectedScoreMonth}
                  onChange={e => setSelectedScoreMonth(e.target.value)}
                  className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-teal-700 outline-none"
                >
                  {allConfigMonths.map(mon => (
                    <option key={mon} value={mon}>{mon}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-150 text-slate-600 font-bold text-xs uppercase">
                  <th className="px-4 py-3 text-center w-12">លេខរៀង</th>
                  <th className="px-4 py-3 w-40">ឈ្មោះសិស្សខ្មែរ</th>
                  <th className="px-4 py-3 text-center">ស្ថានភាពវត្តមាន</th>
                  <th className="px-4 py-3">កំណត់ចំណាំ / មូលហេតុ</th>
                </tr>
              </thead>
              <tbody>
                {classStudents.map((s, idx) => {
                  const sAtt = studentAttendance.find(a => a.studentId === s.id && a.date === attendanceDate);
                  return (
                    <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors text-xs font-semibold">
                      <td className="px-4 py-3 text-center font-mono text-slate-400">{s.rollNumber || idx + 1}</td>
                      <td className="px-4 py-3 font-bold text-slate-800">{s.nameKhmer}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center items-center gap-1.5">
                          <button
                            onClick={() => handleMarkStudentAttendance(s.id, 'វត្តមាន')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                              sAtt?.status === 'វត្តមាន' || !sAtt
                                ? 'bg-emerald-605 bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            វត្តមាន (វ)
                          </button>
                          <button
                            onClick={() => handleMarkStudentAttendance(s.id, 'អវត្តមានមានច្បាប់')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                              sAtt?.status === 'អវត្តមានមានច្បាប់'
                                ? 'bg-sky-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            ច្បាប់ (ច)
                          </button>
                          <button
                            onClick={() => handleMarkStudentAttendance(s.id, 'អវត្តមានគ្មានច្បាប់')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                              sAtt?.status === 'អវត្តមានគ្មានច្បាប់'
                                ? 'bg-rose-605 bg-rose-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            អត់ច្បាប់ (អ)
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={sAtt?.notes || ''}
                          onChange={e => handleMarkStudentAttendance(s.id, sAtt?.status || 'វត្តមាន', e.target.value)}
                          placeholder="ទិន្នន័យចំណាំបន្ថែម..."
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 text-xs rounded-md focus:bg-white outline-none"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. RESULTS & CERTIFICATE SHEET - លទ្ធផលសិក្សា  */}
      {activeTab === 'results' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
            <h2 className="font-bold text-slate-800 text-base border-b pb-3 border-slate-100 flex items-center gap-2">
              <Award className="w-5 h-5 text-teal-600 font-semibold" />
              តារាងចំណាត់ថ្នាក់សរុប (មធ្យមភាគប្រចាំខែ {activeConfigMonths.join(', ')})
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold text-xs uppercase">
                    <th className="px-4 py-3 text-center">ចំណាត់ថ្នាក់</th>
                    <th className="px-4 py-3 text-center">អត្តលេខ</th>
                    <th className="px-4 py-3">ឈ្មោះខ្មែរ</th>
                    <th className="px-4 py-3">ឈ្មោះឡាតាំង</th>
                    <th className="px-3 py-3 text-center">ភេទ</th>
                    <th className="px-4 py-3 text-right">ពិន្ទុបូកសរុប</th>
                    <th className="px-4 py-3 text-center">មធ្យមពិន្ទុ</th>
                    <th className="px-4 py-3 text-center">ស្ថានភាព</th>
                    <th className="px-4 py-3 text-right">ប័ណ្ណសរសើរ</th>
                  </tr>
                </thead>
                <tbody>
                  {academicCalculationsReport.map((item) => (
                    <tr 
                      key={item.student.id} 
                      className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors text-xs text-slate-700 font-bold"
                    >
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                          item.rank === 1 ? 'bg-amber-100 text-amber-800 font-mono ring-2 ring-amber-300' :
                          item.rank === 2 ? 'bg-slate-200 text-slate-800 font-mono' :
                          item.rank === 3 ? 'bg-amber-50 text-amber-700 font-mono' : 'text-slate-400 font-mono'
                        }`}>
                          {item.rank}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-mono text-teal-600 bg-slate-50/20">{item.student.studentIdCard}</td>
                      <td className="px-4 py-3 text-slate-800">{item.student.nameKhmer}</td>
                      <td className="px-4 py-3 uppercase text-slate-400 font-mono">{item.student.nameLatin}</td>
                      <td className="px-3 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-sm text-[10px] ${
                          item.student.gender === 'ប្រុស' ? 'bg-sky-50 text-sky-700' : 'bg-pink-50 text-pink-700'
                        }`}>
                          {item.student.gender}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-800 text-right">{item.totalPoints.toFixed(1)}</td>
                      <td className="px-4 py-3 text-center font-mono font-bold text-teal-700 text-sm">{item.average}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          item.average >= 25 ? 'bg-emerald-105 bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {item.average >= 25 ? 'ឡើងថ្នាក់' : 'រងចាំប្រឡងឡើងវិញ'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => {
                            setCertificateStudent(item.student);
                            setCertificateRank(String(item.rank));
                          }}
                          className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap ml-auto"
                        >
                          <Award className="w-3.5 h-3.5" />
                          ចេញប័ណ្ណសរសើរ
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Honor Roll listing */}
            <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Star className="w-5 h-5 text-amber-500 fill-amber-300" />
                តារាងកិត្តិយស (Honor Roll - មធ្យមភាគ្គ ≥ ៣៨ ពិន្ទុ)
              </h3>
              
              {honorRollStudents.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-6 text-center">មិនទាន់មានសិស្សគំរូ និងនិទ្ទេសល្អគ្រប់គ្រាន់ប្រឡងជាប់ថ្នាក់កិត្តិយសនៅឡើយ។</p>
              ) : (
                <div className="space-y-2">
                  {honorRollStudents.map(h => (
                    <div key={h.student.id} className="p-3 bg-amber-50/40 rounded-xl border border-amber-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-extrabold text-xs">
                          {h.rank}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-xs">{h.student.nameKhmer}</p>
                          <span className="text-[10px] text-slate-400 font-semibold">{h.student.studentIdCard}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-amber-700 bg-amber-100/50 px-2.5 py-1 rounded-md">
                          ពិន្ទុ៖ {h.average}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Certificate Merit print controller */}
            <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Printer className="w-5 h-5 text-indigo-600" />
                ប័ណ្ណសរសើរ / លិខិតកោតសរសើរ
              </h3>

              {certificateStudent ? (
                <div className="space-y-4 text-center">
                  <p className="text-xs text-slate-500">អ្នកបានជ្រើសរើស៖ <span className="font-bold text-slate-800">{certificateStudent.nameKhmer}</span> (ចំណាត់ថ្នាក់៖ {certificateRank})</p>
                  
                  {/* Miniature screen layout mockup of Cambodian Certificate */}
                  <div className="p-4 bg-yellow-50/50 rounded-2xl border-4 border-yellow-500 flex flex-col items-center justify-center text-center space-y-2 max-w-[320px] mx-auto shadow-inner relative">
                    <div className="absolute top-1 left-1 right-1 bottom-1 border border-dashed border-yellow-600/30"></div>
                    <span className="text-[8px] font-extrabold text-slate-400 uppercase leading-none">ព្រះរាជាណាចក្រកម្ពុជា</span>
                    <span className="text-[7px] font-bold text-slate-500">ជាតិ សាសនា ព្រះមហាក្សត្រ</span>
                    <div className="w-12 border-b border-slate-300"></div>
                    <span className="text-xs font-extrabold text-yellow-700 uppercase tracking-widest pt-1">ប័ណ្ណសរសើរ</span>
                    <p className="text-[10px] text-slate-600 leading-normal px-2">
                       លោកនាយក {schoolInfo.schoolName} សូមកោតសរសើរ និងជូនប័ណ្ណនេះចំពោះសិស្ស <span className="font-bold text-slate-800">{certificateStudent.nameKhmer}</span> សិក្សាក្នុង <span className="font-bold text-slate-800">{classroom.name}</span> ដែលបានប្រឹងប្រែងរហូតសម្រេចបាន ចំណាត់ថ្នាក់ទី <span className="font-bold text-amber-800 text-xs">{certificateRank}</span>។
                    </p>
                    <span className="text-[7px] text-slate-400 font-semibold pt-1">ចុះហត្ថលេខា និងបោះត្រា</span>
                  </div>

                  <button
                    onClick={window.print}
                    className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer w-full transition-transform"
                  >
                    <Printer className="w-4 h-4" />
                    បោះពុម្ពប័ណ្ណសរសើរប្លង់ដើម (Print PDF)
                  </button>
                </div>
              ) : (
                <div className="py-12 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-xs">
                  សូមចុចលើប៊ូតុង "ចេញប័ណ្ណសរសើរ" ក្នុងតារាងចំណាត់ថ្នាក់ខាងលើ ដើម្បីរៀបចំប័ណ្ណសរសើរ។
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Secret Certificate Print-Only container fully customizable on exact print layout */}
      {certificateStudent && (
        <div className="hidden print:block absolute inset-0 bg-white p-12 font-sans text-center">
          <div className="max-w-xl mx-auto border-[12px] border-yellow-500 p-8 rounded-3xl space-y-8 relative shadow-lg bg-stone-50">
            {/* Cambodian Standard gold certificates borders ornaments */}
            <div className="absolute top-2 left-2 right-2 bottom-2 border border-yellow-700"></div>
            <div className="absolute top-4 left-4 right-4 bottom-4 border-2 border-dashed border-yellow-600/50"></div>

            <div className="space-y-1.5 text-center">
              <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-widest">ព្រះរាជាណាចក្រកម្ពុជា</h2>
              <h3 className="text-xs font-bold text-slate-600">ជាតិ សាសនា ព្រះមហាក្សត្រ</h3>
              <div className="w-20 border-b border-slate-300 mx-auto"></div>
            </div>

            <div className="space-y-1">
              <p className="text-[11px] font-bold text-slate-500 text-left">ក្រសួងអប់រំ យុវជន និងកីឡា</p>
              <p className="text-xs font-extrabold text-slate-700 text-left">{schoolInfo.schoolType} {schoolInfo.schoolName}</p>
            </div>

            <div className="space-y-3.5">
              <h1 className="text-3xl font-extrabold text-yellow-600 tracking-widest uppercase">ប័ណ្ណសរសើរ</h1>
              <p className="text-slate-500 text-xs italic font-semibold">CERTIFICATE OF MERIT</p>
            </div>

            <div className="space-y-5 text-sm text-slate-700 text-center leading-relaxed">
              <p>
                គណៈនាយកនៃសាលារៀនយើងខ្ញុំ មានសេចក្ដីសោមនស្សរីករាយ សូមប្រគល់ប័ណ្ណសរសើរនេះជូនចំពោះ៖
              </p>
              <h2 className="text-2xl font-extrabold text-slate-900 border-b-2 border-slate-300 pb-1.5 max-w-[280px] mx-auto uppercase">
                {certificateStudent.nameKhmer}
              </h2>
              <p className="font-semibold text-slate-600">
                ភេទ ៖ <span className="font-extrabold text-slate-800">{certificateStudent.gender}</span> | ថ្ងៃខែឆ្នាំកំណើត ៖ <span className="font-extrabold text-slate-800">{certificateStudent.dob}</span>
              </p>
              <p className="text-slate-700 font-sans leading-normal">
                ដែលជានិស្សិតសិក្សាក្នុង <span className="font-extrabold text-slate-800">{classroom.name}</span> ដែលមានសមត្ថភាពខិតខំប្រឹងប្រែង រៀនសូត្រសម្រេចបានលទ្ធផល <span className="text-stone-900">ល្អប្រសើរ</span>
              </p>
              <p className="font-semibold text-slate-700">
                ទទួលបាន៖ ចំណាត់ថ្នាក់ទី <span className="text-xl font-extrabold text-amber-700 bg-amber-50 px-3 py-1 rounded border border-amber-200">{certificateRank}</span> ក្នុងលទ្ធផលសិក្សាចុងឆមាស។
              </p>
            </div>

            <div className="pt-12 flex justify-between items-center text-xs text-slate-500">
              <div className="text-left leading-normal space-y-1 font-semibold">
                <p>លេខចុះបញ្ជី៖ {classroom.id}-{certificateStudent.studentIdCard}</p>
                <p>ឆ្នាំសិក្សា៖ {config.academicYear}</p>
              </div>

              <div className="text-right leading-normal italic font-semibold text-slate-600">
                <p>ធ្វើនៅ {schoolInfo.province}, ថ្ងៃទី {new Date().toLocaleDateString('km-KH')}</p>
                <p className="font-bold text-slate-800 pt-1 leading-none">{schoolInfo.directorName}</p>
                <p className="text-[10px] text-slate-400">នាយកសាលា និងត្រាកិត្តិយស</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
