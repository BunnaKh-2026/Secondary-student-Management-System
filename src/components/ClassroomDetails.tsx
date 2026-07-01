import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, Settings, Users, CheckSquare, Edit, FileText, 
  Calendar, Award, Plus, Trash2, CheckCircle2, Save, X, Star, Printer,
  Search, Eye, Edit2, GraduationCap
} from 'lucide-react';
import { 
  Classroom, Student, StudentScore, StudentAttendance, 
  HomeTeacherTask, PreStartConfig, SubjectConfig, SchoolInfo,
  Teacher
} from '../types';
import { getDefaultSubjectsForClass, isSubjectExcludedForGrade } from '../data/subjectLayouts';

const toArabicClassname = (name: string): string => {
  if (!name) return '';
  let clean = name.replace(/^(ថ្នាក់ទី|ថ្នាក់)\s*/g, '').trim();
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
  return replaced
    .replace(/អា/gi, 'A')
    .replace(/ប៊ី/gi, 'B')
    .replace(/ស៊ី/gi, 'C')
    .replace(/ឌី/gi, 'D')
    .replace(/អេ/gi, 'A')
    .replace(/បេ/gi, 'B')
    .replace(/សេ/gi, 'C')
    .replace(/ដេ/gi, 'D')
    .replace(/\s+/g, '');
};

const toArabicClassnameWithPrefix = (name: string): string => {
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
};

const formatToDDMMYYYY = (dateStr: string): string => {
  if (!dateStr) return '-';
  const clean = dateStr.trim();
  
  // Try matching standard YYYY-MM-DD
  const matchIso = clean.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (matchIso) {
    return `${matchIso[3]}-${matchIso[2]}-${matchIso[1]}`;
  }
  
  // If it matches DD-MM-YYYY or DD/MM/YYYY, return with hyphens
  const matchDmy = clean.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
  if (matchDmy) {
    return `${matchDmy[1]}-${matchDmy[2]}-${matchDmy[3]}`;
  }
  
  // Try fallback parsing via native Date
  const d = new Date(clean);
  if (!isNaN(d.getTime())) {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }
  
  return dateStr;
};

const calculateYearsOfService = (dateStr?: string, teacherServiceLimitDate?: string): number => {
  if (!dateStr) return 0;
  const joinDateObj = new Date(dateStr);
  const today = teacherServiceLimitDate ? new Date(teacherServiceLimitDate) : new Date();
  if (isNaN(joinDateObj.getTime())) return 0;
  
  let diffYears = today.getFullYear() - joinDateObj.getFullYear();
  const monthDiff = today.getMonth() - joinDateObj.getMonth();
  const dayDiff = today.getDate() - joinDateObj.getDate();
  
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    diffYears--;
  }
  return Math.max(0, diffYears);
};

const calculateTeacherAge = (dobStr: string, teacherAgeLimitDate?: string): string => {
  if (!dobStr) return '';
  const birthDate = new Date(dobStr);
  if (isNaN(birthDate.getTime())) return '';
  const today = teacherAgeLimitDate ? new Date(teacherAgeLimitDate) : new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0 ? String(age) : '';
};

interface ClassroomDetailsProps {
  classroom: Classroom;
  classrooms: Classroom[];
  students: Student[];
  studentScores: StudentScore[];
  studentAttendance: StudentAttendance[];
  htTasks: HomeTeacherTask[];
  schoolInfo: SchoolInfo;
  teachers?: Teacher[];
  onUpdateTeachers?: (teachers: Teacher[]) => void;
  onBack: () => void;
  onUpdatePreStartConfig: (classId: string, config: PreStartConfig) => void;
  onUpdateScores: (scores: StudentScore[]) => void;
  onUpdateAttendance: (attendance: StudentAttendance[]) => void;
  onUpdateHTTasks: (tasks: HomeTeacherTask[]) => void;
  onUpdateStudents?: (students: Student[]) => void;
  activeTab?: 'config' | 'register' | 'tasks' | 'scores' | 'results' | 'attendance';
  onActiveTabChange?: (tab: 'config' | 'register' | 'tasks' | 'scores' | 'results' | 'attendance') => void;
}

export default function ClassroomDetails({
  classroom,
  classrooms,
  students,
  studentScores,
  studentAttendance,
  htTasks,
  schoolInfo,
  teachers = [],
  onUpdateTeachers,
  onBack,
  onUpdatePreStartConfig,
  onUpdateScores,
  onUpdateAttendance,
  onUpdateHTTasks,
  onUpdateStudents,
  activeTab: activeTabProp,
  onActiveTabChange: onActiveTabChangeProp,
}: ClassroomDetailsProps) {
  // Navigation Tabs specific to ClassroomDetails
  const [localActiveTab, setLocalActiveTab] = useState<'config' | 'register' | 'tasks' | 'scores' | 'results' | 'attendance'>('register');

  const activeTab = activeTabProp !== undefined ? activeTabProp : localActiveTab;
  const setActiveTab = onActiveTabChangeProp !== undefined ? onActiveTabChangeProp : setLocalActiveTab;

  // Load / Initialize PreStartConfig
  const config: PreStartConfig = useMemo(() => {
    const baseConfig = classroom.preStartConfig || {
      classroomId: classroom.id,
      homeTeacherName: 'មិនទាន់កំណត់',
      academicYear: '២០២៥-២០២៦',
      semester1Months: ['វិច្ឆិកា', 'ធ្នូ', 'មករា', 'កុម្ភៈ', 'មីនា'],
      semester2Months: ['មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា'],
      activeMonthsForAverage: ['វិច្ឆិកា', 'ធ្នូ'],
      subjects: getDefaultSubjectsForClass(classroom.grade, classroom.classType),
    };
    return {
      ...baseConfig,
      subjects: baseConfig.subjects.filter(sub => !isSubjectExcludedForGrade(classroom.grade, sub.name, sub.id)),
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

  // Student List Search, Filter, Sort States
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState(classroom.id); // Defaults to current classroom ID!
  const [studentSortField, setStudentSortField] = useState<'name' | 'classroom' | null>(null);
  const [studentSortDirection, setStudentSortDirection] = useState<'asc' | 'desc'>('asc');
  const [activeSortMenu, setActiveSortMenu] = useState<'name' | 'classroom' | null>(null);

  // Drag and drop states for students list
  const [draggingStudentId, setDraggingStudentId] = useState<string | null>(null);
  const [dragOverStudentId, setDragOverStudentId] = useState<string | null>(null);

  // Viewing/editing modals
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);

  useEffect(() => {
    setClassFilter(classroom.id);
  }, [classroom.id]);

  const calculateAge = (dobString: string, referenceDateString?: string): string => {
    if (!dobString) return '';
    const birthDate = new Date(dobString);
    if (isNaN(birthDate.getTime())) return '';
    const today = referenceDateString ? new Date(referenceDateString) : new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? String(age) : '';
  };

  const filteredStudents = useMemo(() => {
    const filtered = students.filter(s => {
      const matchesSearch = s.nameKhmer.includes(searchTerm) || 
        s.nameLatin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.studentIdCard.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesClass = classFilter ? s.classroomId === classFilter : true;
      return matchesSearch && matchesClass;
    });

    if (!studentSortField) {
      return filtered;
    }

    return [...filtered].sort((a, b) => {
      let comparison = 0;
      if (studentSortField === 'name') {
        comparison = a.nameKhmer.localeCompare(b.nameKhmer, 'km');
      } else if (studentSortField === 'classroom') {
        const clsA = classrooms.find(c => c.id === a.classroomId)?.name || '';
        const clsB = classrooms.find(c => c.id === b.classroomId)?.name || '';
        comparison = clsA.localeCompare(clsB, 'km');
      }
      return studentSortDirection === 'asc' ? comparison : -comparison;
    });
  }, [students, searchTerm, classFilter, studentSortField, studentSortDirection, classrooms]);

  const handleStudentDragStart = (e: React.DragEvent, id: string) => {
    const target = e.target as HTMLElement;
    if (target.closest('input') || target.closest('button') || target.closest('select')) {
      e.preventDefault();
      return;
    }
    setDraggingStudentId(id);
  };

  const handleStudentDragOver = (e: React.DragEvent, id: string) => {
    if (draggingStudentId && draggingStudentId !== id) {
      e.preventDefault();
      if (dragOverStudentId !== id) {
        setDragOverStudentId(id);
      }
    }
  };

  const handleStudentDropRow = (targetId: string) => {
    if (!draggingStudentId || draggingStudentId === targetId || !onUpdateStudents) return;

    const sourceIndex = students.findIndex(s => s.id === draggingStudentId);
    const targetIndex = students.findIndex(s => s.id === targetId);

    if (sourceIndex === -1 || targetIndex === -1) return;

    const updated = [...students];
    const [movedItem] = updated.splice(sourceIndex, 1);
    updated.splice(targetIndex, 0, movedItem);

    const classroomIdsToUpdate = Array.from(new Set([movedItem.classroomId, students[targetIndex].classroomId]));
    
    classroomIdsToUpdate.forEach(classId => {
      let count = 1;
      for (let i = 0; i < updated.length; i++) {
        if (updated[i].classroomId === classId) {
          updated[i] = {
            ...updated[i],
            rollNumber: String(count++)
          };
        }
      }
    });

    onUpdateStudents(updated);

    setDraggingStudentId(null);
    setDragOverStudentId(null);
  };

  const handleStudentDragEnd = () => {
    setDraggingStudentId(null);
    setDragOverStudentId(null);
  };

  const handleDeleteStudent = (studentId: string, nameKhmer: string) => {
    if (!onUpdateStudents) return;
    const confirmDelete = window.confirm(`តើអ្នកពិតជាចង់លុបទិន្នន័យរបស់សិស្សឈ្មោះ «${nameKhmer}» មែនទេ?`);
    if (confirmDelete) {
      const updated = students.filter(s => s.id !== studentId);
      onUpdateStudents(updated);
    }
  };

  // General Month Selector helper mapping
  const allConfigMonths = useMemo(() => [...config.semester1Months, ...config.semester2Months], [config]);
  const [selectedScoreMonth, setSelectedScoreMonth] = useState<string>(allConfigMonths[0] || 'វិច្ឆិកា');

  const selectedTeacher = useMemo(() => {
    return teachers.find(t => t.classCharge === classroom.name) || null;
  }, [teachers, classroom.name]);

  // Keep homeTeacherName in PreStartConfig automatically synchronized with the matched teacher
  useEffect(() => {
    const correctHTName = selectedTeacher ? selectedTeacher.name : 'មិនទាន់កំណត់';
    if (config.homeTeacherName !== correctHTName) {
      onUpdatePreStartConfig(classroom.id, {
        ...config,
        homeTeacherName: correctHTName,
      });
    }
  }, [selectedTeacher, config, classroom.id, onUpdatePreStartConfig]);

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
    <div id="classroom-details-roster" className={`space-y-6 ${activeTab === 'register' ? 'flex-1 flex flex-col h-full min-h-0' : ''}`}>
      {/* 2. REGISTER TAB - LIST OF CLASSROOM STUDENTS */}
      {activeTab === 'register' && (
        <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs space-y-5 animate-fade-in text-slate-755 w-full max-w-full overflow-hidden flex-1 flex flex-col min-h-0">
          {/* Integrated Header Container */}
          <div className="border-b border-slate-100 pb-4 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 w-full">
            {/* Title */}
            <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-600" />
              បញ្ជីឈ្មោះសិស្ស {toArabicClassnameWithPrefix(classroom.name)}
            </h2>
            
            {/* Controls Container */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between xl:justify-end gap-3 w-full xl:w-auto">
              
              {/* Left Group: Search box */}
              <div className="flex flex-row items-center gap-2 w-full sm:w-auto min-w-0">
                {/* Search box */}
                <div className="relative flex-1 sm:w-44 xl:w-48 sm:shrink-0 min-w-0">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="ស្វែងរកសិស្ស"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="block w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-1 focus:ring-teal-500 outline-none font-medium"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Students Table */}
          <div className="border border-slate-200 rounded-xl shadow-xs flex-1 flex flex-col overflow-hidden min-h-0 w-full max-w-full">
            <div className="flex-1 overflow-y-auto overflow-x-auto min-h-0 scrollbar-thin">
              <table className="w-full text-left border-collapse table-auto whitespace-nowrap">
                <thead className="sticky top-0 z-20 bg-emerald-700 whitespace-nowrap text-white">
                  <tr className="bg-emerald-700 text-white font-bold text-xs uppercase whitespace-nowrap" id="students-list-th-row">
                    <th className="w-[70px] min-w-[70px] max-w-[70px] px-4 py-3 text-center bg-emerald-700 whitespace-nowrap border-l border-r border-b border-white/30 sticky left-0 z-30" rowSpan={2}>ល.រ</th>
                    <th className="w-[110px] min-w-[110px] max-w-[110px] px-4 py-3 text-center bg-emerald-700 whitespace-nowrap border-r border-b border-white/30 sticky left-[70px] z-30" rowSpan={2}>អត្តលេខ</th>
                    <th className="w-[180px] min-w-[180px] max-w-[180px] px-4 py-3 text-center bg-emerald-700 relative select-none whitespace-nowrap border-r border-b border-white/30 sticky left-[180px] z-30" rowSpan={2}>គោត្តនាម-នាម</th>
                    <th className="px-4 py-3 bg-emerald-700 whitespace-nowrap border-r border-b border-white/30" rowSpan={2}>ឈ្មោះឡាតាំង</th>
                    <th className="px-3 py-3 text-center bg-emerald-700 whitespace-nowrap border-r border-b border-white/30" rowSpan={2}>ភេទ</th>
                    <th className="px-4 py-3 text-center bg-emerald-700 whitespace-nowrap border-r border-b border-white/30" rowSpan={2}>ថ្ងៃខែឆ្នាំកំណើត</th>
                    <th className="px-4 py-3 text-center bg-emerald-700 whitespace-nowrap border-r border-b border-white/30" rowSpan={2}>អាយុ</th>
                    <th className="px-4 py-3 bg-emerald-700 whitespace-nowrap border-r border-b border-white/30" rowSpan={2}>ថ្នាក់</th>
                    <th 
                      colSpan={4} 
                      className="px-4 py-2 text-center bg-emerald-700 border-r border-b border-white/30 font-bold whitespace-nowrap"
                      style={{ fontFamily: '"Khmer OS Siemreap", "Siemreap", sans-serif' }}
                    >
                      ទីកន្លែងកំណើត
                    </th>
                    <th className="px-4 py-3 bg-emerald-700 whitespace-nowrap border-r border-b border-white/30" rowSpan={2}>បញ្ហារបស់សិស្ស</th>
                    <th className="px-4 py-3 bg-emerald-700 whitespace-nowrap border-r border-b border-white/30" rowSpan={2}>ស្ថានភាពសិស្ស</th>
                    <th className="px-4 py-3 bg-emerald-700 whitespace-nowrap border-r border-b border-white/30" rowSpan={2}>ប្រភេទសិស្ស</th>
                    <th className="px-4 py-3 bg-emerald-700 whitespace-nowrap border-r border-b border-white/30" rowSpan={2}>ជនជាតិដើមភាគតិច</th>
                    
                    <th 
                      colSpan={4} 
                      className="px-4 py-2 text-center bg-emerald-700 border-r border-b border-white/30 font-bold whitespace-nowrap"
                      style={{ fontFamily: '"Khmer OS Siemreap", "Siemreap", sans-serif' }}
                    >
                      ប្រឡងសញ្ញាបត្រមធ្យមសិក្សាបឋមភូមិ
                    </th>

                    <th className="px-4 py-3 bg-emerald-700 whitespace-nowrap border-r border-b border-white/30" rowSpan={2}>ឈ្មោះឪពុក</th>
                    <th className="px-4 py-3 bg-emerald-700 whitespace-nowrap border-r border-b border-white/30" rowSpan={2}>មុខរបរឪពុក</th>
                    <th className="px-4 py-3 bg-emerald-700 whitespace-nowrap border-r border-b border-white/30" rowSpan={2}>ឈ្មោះម្ដាយ</th>
                    <th className="px-4 py-3 bg-emerald-700 whitespace-nowrap border-r border-b border-white/30" rowSpan={2}>មុខរបរម្ដាយ</th>
                    <th className="px-4 py-3 bg-emerald-700 whitespace-nowrap border-r border-b border-white/30" rowSpan={2}>លេខទូរស័ព្ទអាណាព្យាបាល</th>
                    <th 
                      colSpan={4} 
                      className="px-4 py-2 text-center bg-emerald-700 border-r border-b border-white/30 font-bold whitespace-nowrap"
                      style={{ fontFamily: '"Khmer OS Siemreap", "Siemreap", sans-serif' }}
                    >
                      ទីលំនៅបច្ចុប្បន្ន
                    </th>
                    <th className="px-4 py-3 text-center bg-emerald-700 whitespace-nowrap border-b border-white/30" rowSpan={2}>សកម្មភាព</th>
                  </tr>
                  <tr className="bg-emerald-700 text-white font-bold text-[10px] uppercase border-b border-white/30 whitespace-nowrap">
                    {/* ទីកន្លែងកំណើត sub-headers */}
                    <th className="px-3 py-1.5 text-center border-r border-b border-white/30 whitespace-nowrap" style={{ fontFamily: '"Khmer OS Siemreap", "Siemreap", sans-serif' }}>រាជធានី/ខេត្ត</th>
                    <th className="px-3 py-1.5 text-center border-r border-b border-white/30 whitespace-nowrap" style={{ fontFamily: '"Khmer OS Siemreap", "Siemreap", sans-serif' }}>ស្រុក/ក្រុង/ខណ្ឌ</th>
                    <th className="px-3 py-1.5 text-center border-r border-b border-white/30 whitespace-nowrap" style={{ fontFamily: '"Khmer OS Siemreap", "Siemreap", sans-serif' }}>ឃុំ/សង្កាត់</th>
                    <th className="px-3 py-1.5 text-center border-r border-b border-white/30 whitespace-nowrap" style={{ fontFamily: '"Khmer OS Siemreap", "Siemreap", sans-serif' }}>ភូមិ</th>

                    {/* ប្រឡងសញ្ញាបត្រ sub-headers */}
                    <th className="px-3 py-1.5 text-center border-r border-b border-white/30 whitespace-nowrap" style={{ fontFamily: '"Khmer OS Siemreap", "Siemreap", sans-serif' }}>សម័យប្រឡង</th>
                    <th className="px-3 py-1.5 text-center border-r border-b border-white/30 whitespace-nowrap" style={{ fontFamily: '"Khmer OS Siemreap", "Siemreap", sans-serif' }}>មណ្ឌលប្រឡង</th>
                    <th className="px-3 py-1.5 text-center border-r border-b border-white/30 whitespace-nowrap" style={{ fontFamily: '"Khmer OS Siemreap", "Siemreap", sans-serif' }}>លេខបន្ទប់</th>
                    <th className="px-3 py-1.5 text-center border-r border-b border-white/30 whitespace-nowrap" style={{ fontFamily: '"Khmer OS Siemreap", "Siemreap", sans-serif' }}>លេខតុ</th>

                    {/* ទីលំនៅបច្ចុប្បន្ន sub-headers */}
                    <th className="px-3 py-1.5 text-center border-r border-b border-white/30 whitespace-nowrap" style={{ fontFamily: '"Khmer OS Siemreap", "Siemreap", sans-serif' }}>រាជធានី/ខេត្ត</th>
                    <th className="px-3 py-1.5 text-center border-r border-b border-white/30 whitespace-nowrap" style={{ fontFamily: '"Khmer OS Siemreap", "Siemreap", sans-serif' }}>ស្រុក/ក្រុង/ខណ្ឌ</th>
                    <th className="px-3 py-1.5 text-center border-r border-b border-white/30 whitespace-nowrap" style={{ fontFamily: '"Khmer OS Siemreap", "Siemreap", sans-serif' }}>ឃុំ/សង្កាត់</th>
                    <th className="px-3 py-1.5 text-center border-r border-b border-white/30 whitespace-nowrap" style={{ fontFamily: '"Khmer OS Siemreap", "Siemreap", sans-serif' }}>ភូមិ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={30} className="px-4 py-12 text-center text-slate-400 text-xs font-semibold">
                        រកមិនឃើញទិន្នន័យសិស្សានុសិស្សត្រូវបានកំណត់ឡើយ។
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((s, idx) => {
                      const cls = classrooms.find(c => c.id === s.classroomId);
                      return (
                        <tr 
                          key={s.id} 
                          className="border-b border-slate-200 transition-colors text-xs text-slate-700 font-medium group/row whitespace-nowrap hover:bg-slate-50/50"
                        >
                          <td className="w-[70px] min-w-[70px] max-w-[70px] px-4 py-3 text-center font-bold text-slate-400 whitespace-nowrap select-none border-l border-r border-slate-200 border-b border-slate-200 sticky left-0 z-10 bg-white">
                            {s.rollNumber}
                          </td>
                          <td className="w-[110px] min-w-[110px] max-w-[110px] px-4 py-3 text-center font-mono font-semibold text-teal-600 whitespace-nowrap border-r border-slate-200 border-b border-slate-200 sticky left-[70px] z-10 bg-white">{s.studentIdCard}</td>
                          <td className="w-[180px] min-w-[180px] max-w-[180px] px-4 py-3 font-bold text-slate-800 whitespace-nowrap border-r border-slate-200 border-b border-slate-200 sticky left-[180px] z-10 bg-white">
                            <div className="flex items-center gap-2 whitespace-nowrap">
                              {s.photoUrl ? (
                                <img 
                                  src={s.photoUrl} 
                                  alt="រូបថតសិស្ស" 
                                  className="w-6 h-6 rounded-full object-cover border border-slate-200 shrink-0"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] text-white font-bold shrink-0 shadow-xs whitespace-nowrap ${
                                  s.gender === 'ប្រុស' ? 'bg-sky-500' : 'bg-pink-500'
                                }`}>
                                  {s.gender === 'ប្រុស' ? 'ប្រ' : 'ស្រ'}
                                </div>
                              )}
                              <span className="whitespace-nowrap">{s.nameKhmer}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-600 font-mono whitespace-nowrap border-r border-slate-200 border-b border-slate-200">
                            {s.nameLatin || '-'}
                          </td>
                          <td className="px-3 py-3 text-center whitespace-nowrap border-r border-slate-200 border-b border-slate-200">
                            <span className={`text-xs font-bold whitespace-nowrap ${
                              s.gender === 'ប្រុស' ? 'text-sky-600' : 'text-pink-600'
                            }`}>
                              {s.gender || '-'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center text-slate-700 font-mono whitespace-nowrap border-r border-slate-200 border-b border-slate-200">
                            {s.dob ? s.dob.split('-').reverse().join('-') : '-'}
                          </td>
                          <td className="px-4 py-3 text-center text-slate-750 font-bold whitespace-nowrap border-r border-slate-200 border-b border-slate-200">
                            {calculateAge(s.dob, schoolInfo.studentAgeLimitDate) ? `${calculateAge(s.dob, schoolInfo.studentAgeLimitDate)} ឆ្នាំ` : '-'}
                          </td>
                          <td className="px-4 py-3 text-center whitespace-nowrap border-r border-slate-200 border-b border-slate-200">
                            <span className="font-bold text-slate-600 whitespace-nowrap">
                              {cls ? toArabicClassname(cls.name) : '-'}
                            </span>
                          </td>
                          {/* ៤ ជួរឈរទិន្នន័យ ទីកន្លែងកំណើត */}
                          <td className="px-3 py-3 text-center text-slate-700 font-bold border-r border-slate-200 border-b border-slate-200 whitespace-nowrap">
                            {s.pobProvince || '-'}
                          </td>
                          <td className="px-3 py-3 text-center text-slate-700 font-bold border-r border-slate-200 border-b border-slate-200 whitespace-nowrap">
                            {s.pobDistrict || '-'}
                          </td>
                          <td className="px-3 py-3 text-center text-slate-700 font-bold border-r border-slate-200 border-b border-slate-200 whitespace-nowrap">
                            {s.pobCommune || '-'}
                          </td>
                          <td className="px-3 py-3 text-center text-slate-700 font-bold border-r border-slate-200 border-b border-slate-200 whitespace-nowrap">
                            {s.pobVillage || '-'}
                          </td>
                          <td className="px-4 py-3 text-amber-700 font-bold whitespace-nowrap border-r border-slate-200 border-b border-slate-200">
                            {s.studentIssue || 'គ្មាន'}
                          </td>
                          <td className="px-4 py-3 text-center whitespace-nowrap border-r border-slate-200 border-b border-slate-200">
                            <span className={`font-bold whitespace-nowrap ${
                              s.studentStatus === 'ឈប់រៀន' ? 'text-rose-600' :
                              s.studentStatus === 'ផ្ទេរចេញ' ? 'text-amber-600' :
                              s.studentStatus === 'ព្យួរការសិក្សា' ? 'text-indigo-600' :
                              'text-emerald-600'
                            }`}>
                              {s.studentStatus || 'កំពុងរៀន'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center text-slate-800 font-bold whitespace-nowrap border-r border-slate-200 border-b border-slate-200">
                            {s.studentType || '-'}
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-slate-600 whitespace-nowrap border-r border-slate-200 border-b border-slate-200">
                            {s.indigenousGroup || 'ទេ'}
                          </td>
                          
                          {/* ៤ ជួរឈរទិន្នន័យ ប្រឡងសញ្ញាបត្រមធ្យមសិក្សាបឋមភូមិ */}
                          <td className="px-3 py-3 text-center font-mono text-slate-700 border-r border-slate-200 border-b border-slate-200 whitespace-nowrap">
                            {s.diplomaExamSession ? s.diplomaExamSession.split('-').reverse().join('-') : '-'}
                          </td>
                          <td className="px-3 py-3 text-center text-slate-700 border-r border-slate-200 border-b border-slate-200 font-bold whitespace-nowrap">
                            {s.diplomaExamCenter || '-'}
                          </td>
                          <td className="px-3 py-3 text-center font-mono text-slate-700 border-r border-slate-200 border-b border-slate-200 font-bold whitespace-nowrap">
                            {s.diplomaExamRoom || '-'}
                          </td>
                          <td className="px-3 py-3 text-center font-mono text-slate-700 border-r border-slate-200 border-b border-slate-200 font-bold whitespace-nowrap">
                            {s.diplomaExamTable || '-'}
                          </td>

                          <td className="px-4 py-3 text-slate-700 font-bold whitespace-nowrap border-r border-slate-200 border-b border-slate-200">
                            {s.fatherName || '-'}
                          </td>
                          <td className="px-4 py-3 text-slate-600 whitespace-nowrap border-r border-slate-200 border-b border-slate-200">
                            {s.fatherOccupation || '-'}
                          </td>
                          <td className="px-4 py-3 text-slate-700 font-bold whitespace-nowrap border-r border-slate-200 border-b border-slate-200">
                            {s.motherName || '-'}
                          </td>
                          <td className="px-4 py-3 text-slate-600 whitespace-nowrap border-r border-slate-200 border-b border-slate-200">
                            {s.motherOccupation || '-'}
                          </td>
                          <td className="px-4 py-3 text-center font-mono text-slate-700 font-bold whitespace-nowrap border-r border-slate-200 border-b border-slate-200">
                            {s.parentPhone || '-'}
                          </td>
                          {/* ៤ ជួរឈរទិន្នន័យ ទីលំនៅបច្ចុប្បន្ន */}
                          <td className="px-3 py-3 text-center text-slate-700 font-bold border-r border-slate-200 border-b border-slate-200 whitespace-nowrap">
                            {s.currentAddressProvince || '-'}
                          </td>
                          <td className="px-3 py-3 text-center text-slate-700 font-bold border-r border-slate-200 border-b border-slate-200 whitespace-nowrap">
                            {s.currentAddressDistrict || '-'}
                          </td>
                          <td className="px-3 py-3 text-center text-slate-700 font-bold border-r border-slate-200 border-b border-slate-200 whitespace-nowrap">
                            {s.currentAddressCommune || '-'}
                          </td>
                          <td className="px-3 py-3 text-center text-slate-700 font-bold border-r border-slate-200 border-b border-slate-200 whitespace-nowrap">
                            {s.currentAddressVillage || '-'}
                          </td>
                          <td className="px-4 py-3 text-center border-b border-slate-200">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setViewingStudent(s)}
                                title="មើលព័ត៌មានលម្អិត"
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 1. CONFIG START TAB - ព័ត៌មានគ្រូទទួលបន្ទុកថ្នាក់ */}
      {activeTab === 'config' && (
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6">
          <div className="space-y-1 border-b border-slate-100 pb-4">
            <h2 className="font-bold text-slate-800 text-lg">ព័ត៌មានគ្រូទទួលបន្ទុកថ្នាក់</h2>
          </div>

          <div className="max-w-4xl mx-auto">
            {selectedTeacher ? (
              <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-150 rounded-2xl p-6 md:p-8 space-y-6 shadow-xs">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                  {selectedTeacher.photoUrl ? (
                    <img
                      src={selectedTeacher.photoUrl}
                      alt={selectedTeacher.name}
                      referrerPolicy="no-referrer"
                      className="w-24 h-32 rounded-2xl object-contain bg-slate-100 border-4 border-white shadow-md"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-2xl bg-teal-600 text-white flex items-center justify-center text-3xl font-bold uppercase border-4 border-white shadow-md">
                      {selectedTeacher.name.charAt(0)}
                    </div>
                  )}
                  <div className="text-center sm:text-left space-y-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100/70 text-teal-800 font-bold text-[10px]">
                      គ្រូទទួលបន្ទុកថ្នាក់ផ្លូវការ
                    </span>
                    <h3 className="font-bold text-slate-800 text-xl flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      {selectedTeacher.name}
                      {selectedTeacher.nameLatin && (
                        <span className="font-mono text-xs text-slate-400 font-semibold uppercase bg-slate-200/60 px-2 py-0.5 rounded-md">
                          {selectedTeacher.nameLatin}
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">អត្តលេខបុគ្គលិក៖ {selectedTeacher.idNumber}</p>
                  </div>
                </div>

                <hr className="border-slate-200/60" />

                {/* Info Grid - 1 column on mobile, 2 columns on medium screens and up */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Left Column: Personal info */}
                  <div className="bg-white p-4 rounded-xl border border-slate-100 space-y-3 shadow-xs">
                    <h5 className="font-bold text-emerald-800 border-b border-slate-100 pb-1.5 flex items-center gap-1.5 text-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      ព័ត៌មានផ្ទាល់ខ្លួន
                    </h5>
                    <div className="grid grid-cols-3 gap-y-2 text-slate-600">
                      <span className="col-span-1 font-bold">ភេទ:</span>
                      <span className="col-span-2 text-slate-800 font-semibold">{selectedTeacher.gender}</span>

                      <span className="col-span-1 font-bold">ថ្ងៃខែឆ្នាំកំណើត:</span>
                      <span className="col-span-2 text-slate-800 font-semibold">{formatToDDMMYYYY(selectedTeacher.dob)}</span>
                      
                      <span className="col-span-1 font-bold">អាយុ:</span>
                      <span className="col-span-2 text-slate-800 font-semibold">{calculateTeacherAge(selectedTeacher.dob, schoolInfo.teacherAgeLimitDate) ? `${calculateTeacherAge(selectedTeacher.dob, schoolInfo.teacherAgeLimitDate)} ឆ្នាំ` : '-'}</span>
                      
                      <span className="col-span-1 font-bold">លេខទូរស័ព្ទ:</span>
                      <span className="col-span-2 text-slate-800 font-mono font-semibold">{selectedTeacher.phone || '-'}</span>

                      <span className="col-span-1 font-bold">ជនជាតិភាគតិច:</span>
                      <span className="col-span-2 text-slate-800 font-semibold">{selectedTeacher.ethnicity || 'ទេ'}</span>

                      <span className="col-span-1 font-bold">កម្រិតវប្បធម៌:</span>
                      <span className="col-span-2 text-slate-800 font-semibold">{selectedTeacher.educationLevel || '-'}</span>
                    </div>
                  </div>

                  {/* Right Column: Work info */}
                  <div className="bg-white p-4 rounded-xl border border-slate-100 space-y-3 shadow-xs">
                    <h5 className="font-bold text-emerald-800 border-b border-slate-100 pb-1.5 flex items-center gap-1.5 text-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      ព័ត៌មានបម្រើការងារ
                    </h5>
                    <div className="grid grid-cols-3 gap-y-2 text-slate-600">
                      <span className="col-span-1 font-bold">ឯកទេស:</span>
                      <span className="col-span-2 text-slate-800 font-semibold">{selectedTeacher.subject}</span>
                      
                      <span className="col-span-1 font-bold">មុខវិជ្ជាបង្រៀន:</span>
                      <span className="col-span-2 text-slate-800 font-semibold">{selectedTeacher.teachingSubjects || '-'}</span>
                      
                      <span className="col-span-1 font-bold">បន្ទុកថ្នាក់:</span>
                      <span className="col-span-2 text-slate-800 font-semibold">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold text-[11px]">
                          {selectedTeacher.classCharge ? toArabicClassnameWithPrefix(selectedTeacher.classCharge) : '-'}
                        </span>
                      </span>

                      <span className="col-span-1 font-bold">ក្របខ័ណ្ឌ:</span>
                      <span className="col-span-2 text-slate-800 font-semibold">{selectedTeacher.framework || '-'}</span>

                      <span className="col-span-1 font-bold">កាំប្រាក់:</span>
                      <span className="col-span-2 text-slate-800 font-mono font-semibold">{selectedTeacher.salaryRank || '-'}</span>

                      <span className="col-span-1 font-bold">ថ្ងៃចូលធ្វើការ:</span>
                      <span className="col-span-2 text-slate-800 font-semibold">{formatToDDMMYYYY(selectedTeacher.joinDate || '')}</span>

                      <span className="col-span-1 font-bold">ឆ្នាំបម្រើការ:</span>
                      <span className="col-span-2 text-slate-800 font-semibold">{calculateYearsOfService(selectedTeacher.joinDate, schoolInfo.teacherServiceLimitDate) ? `${calculateYearsOfService(selectedTeacher.joinDate, schoolInfo.teacherServiceLimitDate)} ឆ្នាំ` : '-'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="min-h-[250px] border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-8 text-center space-y-3 bg-slate-50/50">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                  <Users className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-700 text-sm KhmerOS">មិនទាន់មានគ្រូទទួលបន្ទុកថ្នាក់នៅឡើយទេ</h4>
                <p className="text-xs text-slate-400 max-w-md leading-relaxed">
                  សូមចូលទៅកាន់ផ្នែក <span className="font-bold text-slate-600">«ព័ត៌មានគ្រូបង្រៀន»</span> រួចចុះឈ្មោះ ឬកែសម្រួលព័ត៌មានគ្រូបង្រៀនដោយកំណត់ជ្រើសរើស <span className="font-bold text-teal-600">«បន្ទុកថ្នាក់»</span> របស់គាត់ឱ្យមកថ្នាក់ <span className="font-bold text-teal-600">{toArabicClassnameWithPrefix(classroom.name)}</span> នេះ។
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. HOME TEACHER CHORES TAB - កិច្ចការគ្រូបន្ទុកថ្នាក់ */}
      {activeTab === 'tasks' && (
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6 animate-fade-in">
          <div className="space-y-1 border-b border-slate-100 pb-3">
            <h2 className="font-bold text-slate-800 text-lg">៣-ក. កិច្ចការ ឬខ្លឹមសារការងារគ្រូបន្ទុកថ្នាក់ ({toArabicClassnameWithPrefix(classroom.name)})</h2>
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
                      {activeConfigSubjects.map(sub => {
                        const mx = sub.maxScore || (sub.coefficient * 50);
                        return (
                          <th key={sub.id} className="px-3 py-3 text-center min-w-[100px]">
                            <div className="whitespace-nowrap">{sub.name}</div>
                            <div className="text-[10px] text-slate-400 font-medium whitespace-nowrap mt-0.5">
                              {mx} ពិន្ទុ - មេគុណ {sub.coefficient}
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {classStudents.map((s, idx) => (
                      <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors text-xs font-semibold">
                        <td className="px-4 py-3 text-center font-mono text-slate-400 bg-slate-50/10">{s.rollNumber || idx + 1}</td>
                        <td className="px-4 py-3 font-bold text-slate-800">{s.nameKhmer}</td>
                        
                        {activeConfigSubjects.map(sub => {
                          const val = editingScoresLocal[s.id]?.[sub.id] || '';
                          const mx = sub.maxScore || (sub.coefficient * 50);
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
                                placeholder={`0-${mx}`}
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
                       លោកនាយក {schoolInfo.schoolName} សូមកោតសរសើរ និងជូនប័ណ្ណនេះចំពោះសិស្ស <span className="font-bold text-slate-800">{certificateStudent.nameKhmer}</span> សិក្សាក្នុង <span className="font-bold text-slate-800">{toArabicClassnameWithPrefix(classroom.name)}</span> ដែលបានប្រឹងប្រែងរហូតសម្រេចបាន ចំណាត់ថ្នាក់ទី <span className="font-bold text-amber-800 text-xs">{certificateRank}</span>។
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
                ដែលជានិស្សិតសិក្សាក្នុង <span className="font-extrabold text-slate-800">{toArabicClassnameWithPrefix(classroom.name)}</span> ដែលមានសមត្ថភាពខិតខំប្រឹងប្រែង រៀនសូត្រសម្រេចបានលទ្ធផល <span className="text-stone-900">ល្អប្រសើរ</span>
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

      {/* VIEW STUDENT DETAILS MODAL */}
      {viewingStudent && (() => {
        const cls = classrooms.find(c => c.id === viewingStudent.classroomId);
        const className = cls ? toArabicClassname(cls.name) : '-';
        return (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden border border-slate-100 shadow-xl flex flex-col">
              {/* Header */}
              <div className="px-5 py-3.5 bg-emerald-700 text-white flex items-center justify-between">
                <h3 className="font-bold text-xs flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  <span>ព័ត៌មានលម្អិតរបស់សិស្សានុសិស្ស</span>
                </h3>
                <button 
                  onClick={() => setViewingStudent(null)}
                  className="p-1 hover:bg-emerald-800 rounded-full text-white/80 hover:text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Profile Content - scrollable on mobile */}
              <div className="p-4 space-y-3 overflow-y-auto max-h-[75vh] md:max-h-none md:overflow-visible">
                {/* Top Summary Banner */}
                <div className="flex items-center gap-4 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/60">
                  {viewingStudent.photoUrl ? (
                    <img 
                      src={viewingStudent.photoUrl} 
                      alt={viewingStudent.nameKhmer} 
                      className="w-24 h-30 rounded-lg object-cover object-top border-2 border-emerald-200 shrink-0 shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className={`w-24 h-30 rounded-lg flex flex-col items-center justify-center text-sm text-white font-bold shrink-0 shadow-sm ${
                      viewingStudent.gender === 'ប្រុស' ? 'bg-sky-500' : 'bg-pink-500'
                    }`}>
                      <span className="text-xl mb-1">
                        {viewingStudent.gender === 'ប្រុស' ? 'ប' : 'ស'}
                      </span>
                      <span className="text-[10px] opacity-80">
                        {viewingStudent.gender || 'សិស្ស'}
                      </span>
                    </div>
                  )}
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-slate-800">
                      {viewingStudent.nameKhmer}
                    </h4>
                    <div className="flex flex-col gap-1.5 mt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 font-bold min-w-[75px]">ភេទ៖</span>
                        <span className={`px-1.5 py-0.5 rounded-sm text-[9px] font-bold ${
                          viewingStudent.gender === 'ប្រុស' ? 'bg-sky-100 text-sky-800' : 'bg-pink-100 text-pink-800'
                        }`}>
                          {viewingStudent.gender}
                        </span>
                      </div>
                      {viewingStudent.studentIdCard && (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500 font-bold min-w-[75px]">អត្តលេខសិស្ស៖</span>
                          <span className="text-[10px] font-mono font-bold text-teal-600 bg-slate-100 px-1.5 py-0.5 rounded-sm">
                            {viewingStudent.studentIdCard}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 font-bold min-w-[75px]">ថ្នាក់៖</span>
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded-sm">
                          {className}
                        </span>
                      </div>
                      {viewingStudent.rollNumber && (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500 font-bold min-w-[75px]">លេខរៀងបញ្ជី៖</span>
                          <span className="text-[10px] font-bold text-purple-800 bg-purple-50 px-1.5 py-0.5 rounded-sm">
                            {viewingStudent.rollNumber}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Info Grid - 1 column on mobile, 2 columns on medium screens and up */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                  {/* Left Column: Personal info */}
                  <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 space-y-1.5">
                    <h5 className="font-bold text-emerald-800 border-b border-slate-100 pb-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      ព័ត៌មានផ្ទាល់ខ្លួន
                    </h5>
                    <div className="grid grid-cols-3 gap-y-1.5 text-slate-650">
                      <span className="col-span-1 font-bold">ថ្ងៃខែឆ្នាំកំណើត:</span>
                      <span className="col-span-2 text-slate-800 font-semibold">{viewingStudent.dob ? viewingStudent.dob.split('-').reverse().join('-') : '-'}</span>
                      
                      <span className="col-span-1 font-bold">អាយុ:</span>
                      <span className="col-span-2 text-slate-800 font-semibold">
                        {calculateAge(viewingStudent.dob, schoolInfo.studentAgeLimitDate) ? `${calculateAge(viewingStudent.dob, schoolInfo.studentAgeLimitDate)} ឆ្នាំ` : '-'}
                      </span>
                      
                      <span className="col-span-1 font-bold">ទីកន្លែងកំណើត:</span>
                      <span className="col-span-2 text-slate-800 font-semibold leading-relaxed">
                        {[viewingStudent.pobVillage, viewingStudent.pobCommune, viewingStudent.pobDistrict, viewingStudent.pobProvince].filter(Boolean).join(' ') || viewingStudent.pob || '-'}
                      </span>

                      <span className="col-span-1 font-bold">ជនជាតិភាគតិច:</span>
                      <span className="col-span-2 text-slate-800 font-semibold">{viewingStudent.indigenousGroup || 'ទេ'}</span>

                      <span className="col-span-1 font-bold">បញ្ហាផ្សេងៗ:</span>
                      <span className="col-span-2 text-red-700 font-bold leading-relaxed">{viewingStudent.studentIssue || 'គ្មាន'}</span>
                    </div>
                  </div>

                  {/* Right Column: Family / Address info */}
                  <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 space-y-1.5">
                    <h5 className="font-bold text-emerald-800 border-b border-slate-100 pb-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      ព័ត៌មានគ្រួសារ និងស្នាក់នៅ
                    </h5>
                    <div className="grid grid-cols-3 gap-y-1.5 text-slate-650">
                      <span className="col-span-1 font-bold">ឈ្មោះឪពុក:</span>
                      <span className="col-span-2 text-slate-800 font-semibold">{viewingStudent.fatherName || '-'} ({viewingStudent.fatherOccupation || '-'})</span>
                      
                      <span className="col-span-1 font-bold">ឈ្មោះម្តាយ:</span>
                      <span className="col-span-2 text-slate-800 font-semibold">{viewingStudent.motherName || '-'} ({viewingStudent.motherOccupation || '-'})</span>
                      
                      <span className="col-span-1 font-bold">លេខទូរស័ព្ទ:</span>
                      <span className="col-span-2 text-slate-800 font-mono font-semibold">
                        {viewingStudent.parentPhone || '-'}
                        {viewingStudent.parentPhone2 ? ` / ${viewingStudent.parentPhone2}` : ''}
                      </span>

                      <span className="col-span-1 font-bold">អាសយដ្ឋានបច្ចុប្បន្ន:</span>
                      <span className="col-span-2 text-slate-800 font-semibold leading-relaxed">
                        {[viewingStudent.currentAddressVillage, viewingStudent.currentAddressCommune, viewingStudent.currentAddressDistrict, viewingStudent.currentAddressProvince].filter(Boolean).join(' ') || viewingStudent.currentAddress || '-'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons inside footer */}
                <div className="flex justify-end pt-1.5 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setViewingStudent(null)}
                    className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                  >
                    បិទផ្ទាំង
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
