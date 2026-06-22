import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, UserPlus, Trash2, Edit2, Calendar, FileText, CheckCircle, 
  XSquare, Clock, MapPin, Phone, Printer, Plus, X, Search 
} from 'lucide-react';
import { Teacher, TeacherAttendance, SchoolInfo } from '../types';

interface TeacherManagementProps {
  teachers: Teacher[];
  teacherAttendance: TeacherAttendance[];
  schoolInfo: SchoolInfo;
  onUpdateTeachers: (list: Teacher[]) => void;
  onUpdateAttendance: (list: TeacherAttendance[]) => void;
  activeSubTab?: 'list' | 'roles' | 'attendance';
}

export default function TeacherManagement({
  teachers,
  teacherAttendance,
  schoolInfo,
  onUpdateTeachers,
  onUpdateAttendance,
  activeSubTab = 'list',
}: TeacherManagementProps) {
   // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToast({ message, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  // Modal / Form States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState<Omit<Teacher, 'id'>>({
    idNumber: '',
    name: '',
    gender: 'ប្រុស',
    dob: '',
    phone: '',
    subject: '',
    role: 'គ្រូបង្រៀន',
    responsibilities: [],
  });

  // Role details input helper
  const [newResp, setNewResp] = useState('');

  // Attendance date picker
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedAttDate, setSelectedAttDate] = useState(todayStr);

  // Active Teacher for Print ID Card
  const [selectedPrintTeacher, setSelectedPrintTeacher] = useState<Teacher | null>(null);

  // Delete configuration
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false);

  // QR Code generator references
  const canvasRefs = useRef<{ [key: string]: HTMLCanvasElement | null }>({});

  const generateQRCode = (canvas: HTMLCanvasElement | null, text: string) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const size = 120;
    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#0f172a'; // slate dark

    // Draw position detection anchors (outer and inner squares)
    const drawAnchor = (dx: number, dy: number) => {
      ctx.fillRect(dx, dy, 28, 28);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(dx + 4, dy + 4, 20, 20);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(dx + 8, dy + 8, 12, 12);
    };

    drawAnchor(4, 4);
    drawAnchor(size - 32, 4);
    drawAnchor(4, size - 32);

    // Mini bottom-right alignment square
    ctx.fillRect(size - 20, size - 20, 10, 10);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(size - 18, size - 18, 6, 6);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(size - 16, size - 16, 2, 2);

    // Hash code generation
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }

    const random = () => {
      const x = Math.sin(hash++) * 10000;
      return x - Math.floor(x);
    };

    // Draw variable pixel patterns
    for (let x = 8; x < size - 8; x += 4) {
      for (let y = 8; y < size - 8; y += 4) {
        if (
          (x < 35 && y < 35) ||
          (x > size - 37 && y < 35) ||
          (x < 35 && y > size - 37)
        ) {
          continue; // Skip finder patterns
        }
        if (random() > 0.42) {
          ctx.fillRect(x, y, 4, 4);
        }
      }
    }
  };

  useEffect(() => {
    // Redraw QR code when active printing card is set
    if (selectedPrintTeacher) {
      const targetId = `qr-${selectedPrintTeacher.id}`;
      // Allow DOM to render then generate
      setTimeout(() => {
        generateQRCode(canvasRefs.current[targetId], `SCHOOL-TEACHER-AUTH-ID:${selectedPrintTeacher.idNumber}`);
      }, 100);
    }
  }, [selectedPrintTeacher, isBadgeModalOpen]);

  const handleOpenAdd = () => {
    setEditingTeacher(null);
    setFormData({
      idNumber: `TCH-${String(teachers.length + 1).padStart(3, '0')}`,
      name: '',
      gender: 'ប្រុស',
      dob: '',
      phone: '',
      subject: '',
      role: 'គ្រូបង្រៀន',
      responsibilities: [],
    });
    setNewResp('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (t: Teacher) => {
    setEditingTeacher(t);
    setFormData({
      idNumber: t.idNumber,
      name: t.name,
      gender: t.gender,
      dob: t.dob,
      phone: t.phone,
      subject: t.subject,
      role: t.role,
      responsibilities: t.responsibilities,
    });
    setNewResp('');
    setIsFormOpen(true);
  };

  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTeacher) {
      // Update
      const updated = teachers.map(t => t.id === editingTeacher.id ? { ...t, ...formData } : t);
      onUpdateTeachers(updated);
      showToast(`បានកែសម្រួលព័ត៌មានគ្រូបង្រៀនឈ្មោះ "${formData.name}" ដោយជោគជ័យ។`);
    } else {
      // Create new
      const newTch: Teacher = {
        id: `TCH-${Date.now()}`,
        ...formData,
      };
      onUpdateTeachers([...teachers, newTch]);
      showToast(`បានចុះឈ្មោះគ្រូបង្រៀនថ្មីឈ្មោះ "${formData.name}" ទទួលបានជោគជ័យ!`);
    }
    setIsFormOpen(false);
  };

  const handleDeleteTeacher = (id: string, name: string) => {
    setDeleteTarget({ id, name });
  };

  const confirmDeleteTeacher = () => {
    if (!deleteTarget) return;
    const { id } = deleteTarget;
    onUpdateTeachers(teachers.filter(t => t.id !== id));
    if (selectedPrintTeacher?.id === id) setSelectedPrintTeacher(null);
    setDeleteTarget(null);
  };

  const confirmDeleteAllTeachers = () => {
    onUpdateTeachers([]);
    setSelectedPrintTeacher(null);
    setIsDeleteAllOpen(false);
  };

  const addResponsibility = () => {
    if (newResp.trim()) {
      setFormData({
        ...formData,
        responsibilities: [...formData.responsibilities, newResp.trim()],
      });
      setNewResp('');
    }
  };

  const removeResponsibility = (idx: number) => {
    setFormData({
      ...formData,
      responsibilities: formData.responsibilities.filter((_, i) => i !== idx),
    });
  };

  // List filter
  const filteredTeachers = teachers.filter(t => 
    t.name.includes(searchTerm) || 
    t.idNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.subject.includes(searchTerm) ||
    t.role.includes(searchTerm)
  );

  // Attendance management helpers
  const handleMarkAttendance = (teacherId: string, status: 'វត្តមាន' | 'ច្បាប់' | 'អវត្តមាន', reason?: string) => {
    const existingIdx = teacherAttendance.findIndex(a => a.teacherId === teacherId && a.date === selectedAttDate);
    const updated = [...teacherAttendance];

    if (existingIdx > -1) {
      updated[existingIdx] = {
        ...updated[existingIdx],
        status,
        reason: reason || '',
      };
    } else {
      updated.push({
        id: `ATT-${Date.now()}-${teacherId}`,
        teacherId,
        date: selectedAttDate,
        status,
        reason: reason || '',
      });
    }
    onUpdateAttendance(updated);
  };

  const handlePrintTrigger = () => {
    window.print();
  };

  // Dynamic header details based on sub-tab
  const getHeaderDetails = () => {
    switch (activeSubTab) {
      case 'roles':
        return {
          title: 'តួនាទី និងភារកិច្ចគ្រូបង្រៀន',
          desc: 'គ្រប់គ្រងការចាត់ចែងតួនាទី និងភារកិច្ចទទួលខុសត្រូវបន្ថែមរបស់បុគ្គលិកគ្រូ',
        };
      case 'attendance':
        return {
          title: 'វត្តមានបុគ្គលិក-គ្រូបង្រៀន',
          desc: 'កត់ត្រា និងតាមដានវត្តមានបុគ្គលិក-គ្រូបង្រៀនប្រចាំថ្ងៃ',
        };
      case 'list':
      default:
        return {
          title: 'ព័ត៌មានគ្រូបង្រៀន',
          desc: 'គ្រប់គ្រងព័ត៌មានគ្រូ ប័ណ្ណសម្គាល់ខ្លួន និងការចុះឈ្មោះគ្រូថ្មី',
        };
    }
  };

  const header = getHeaderDetails();

  return (
    <div id="school-teachers-section" className="space-y-6">
      {/* Tab Header Selector */}
      {activeSubTab !== 'list' && (
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-xs">
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-slate-800 font-sans">{header.title}</h1>
            <p className="text-slate-500 text-xs sm:text-sm font-semibold">{header.desc}</p>
          </div>
        </div>
      )}

      {/* ៣.១-៣.២ SUBTAB: TEACHERS LIST & IDENTITY BADGES */}
      {activeSubTab === 'list' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-5">
          {/* Integrated Header Container */}
          <div className="border-b border-slate-100 pb-4 flex flex-col md:flex-row gap-4 items-center justify-between">
            <h1 className="text-lg font-bold text-slate-800 tracking-tight">ព័ត៌មានគ្រូបង្រៀន</h1>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              {/* Search input placed directly on the left of action buttons */}
              <div className="relative w-full sm:w-48">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="ស្វែងរកគ្រូ"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="block w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-1 focus:ring-teal-500 outline-none"
                />
              </div>

              <div className="flex gap-2 w-full sm:w-auto shrink-0">
                <button
                  type="button"
                  onClick={handleOpenAdd}
                  className="flex-1 sm:flex-none px-4 py-2 bg-white border border-purple-600 hover:bg-purple-50 text-purple-600 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 text-purple-600 shrink-0" />
                  ចុះឈ្មោះគ្រូថ្មី
                </button>

                <button
                  type="button"
                  onClick={() => setIsDeleteAllOpen(true)}
                  disabled={teachers.length === 0}
                  className="flex-1 sm:flex-none px-4 py-2 bg-white border border-rose-600 hover:bg-rose-50 disabled:opacity-50 disabled:cursor-not-allowed text-rose-600 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 text-rose-600 shrink-0" />
                  លុបទិន្នន័យ
                </button>
              </div>
            </div>
          </div>

          {/* List Table - Integrated under the same white container */}
          <div className="border border-slate-100 rounded-none overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-emerald-700 text-white font-bold text-xs uppercase" id="teachers-list-th-row">
                    <th className="px-4 py-3 text-center">អត្តសញ្ញាណ</th>
                    <th className="px-4 py-3">ឈ្មោះគ្រូ</th>
                    <th className="px-3 py-3 text-center">ភេទ</th>
                    <th className="px-4 py-3">មុខវិជ្ជាឯក</th>
                    <th className="px-4 py-3">លេខទូរស័ព្ទ</th>
                    <th className="px-4 py-3 text-right">សកម្មភាព</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeachers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-slate-400 text-xs font-medium">
                        គ្មានសំណុំទិន្នន័យគ្រូបង្រៀនត្រូវបានរកឃើញទេ។
                      </td>
                    </tr>
                  ) : (
                    filteredTeachers.map(t => (
                      <tr 
                        key={t.id} 
                        className="border-b border-emerald-600 hover:bg-slate-50/50 transition-colors text-xs text-slate-700 font-medium"
                      >
                        <td className="px-4 py-3 font-mono font-semibold text-teal-600 text-center bg-slate-50/30">
                          {t.idNumber}
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-800">
                          {t.name}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold ${
                            t.gender === 'ប្រុស' ? 'bg-sky-50 text-sky-700' : 'bg-pink-50 text-pink-700'
                          }`}>
                            {t.gender}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600 font-semibold">{t.subject}</td>
                        <td className="px-4 py-3 text-slate-500">{t.phone}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(t)}
                              title="កែសម្រួលទិន្នន័យ"
                              className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteTeacher(t.id, t.name)}
                              title="លុបទិន្នន័យគ្រូ"
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ៣.៣. SUBTAB: TEACHER ROLES & RESPONSIBILITIES */}
      {activeSubTab === 'roles' && (
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teachers.map(t => (
              <div 
                key={t.id} 
                className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col justify-between gap-4 hover:border-teal-300 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="space-y-0.5">
                      <h3 className="font-bold text-slate-800 text-sm">{t.name}</h3>
                      <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded uppercase">
                        {t.idNumber}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-slate-500 bg-white border border-slate-100 px-2 py-0.5 rounded-md">
                      {t.role}
                    </span>
                  </div>

                  <div className="pt-3 space-y-1.5">
                    <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">ភារកិច្ចទទួលខុសត្រូវ</span>
                    {t.responsibilities.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">មិនទាន់បានកំណត់ភារកិច្ចបន្ថែមនៅឡើយទេ...</p>
                    ) : (
                      <ul className="list-disc pl-4 text-xs text-slate-600 space-y-1 font-semibold">
                        {t.responsibilities.map((resp, idx) => (
                          <li key={idx} className="leading-snug">{resp}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-100/50">
                  <button
                    onClick={() => handleOpenEdit(t)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    កែប្រែភារកិច្ច
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ៣.៤. SUBTAB: TEACHER ATTENDANCE */}
      {activeSubTab === 'attendance' && (
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xs space-y-6">
          {/* Header & Date selector */}
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">កាលបរិច្ឆេទកត់ត្រាវត្តមាន</span>

            <div className="flex items-center gap-2">
              <label htmlFor="teacher-att-date-input" className="text-xs font-bold text-slate-400">កាលបរិច្ឆេទ៖</label>
              <input
                id="teacher-att-date-input"
                type="date"
                value={selectedAttDate}
                onChange={e => setSelectedAttDate(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-teal-500"
              />
            </div>
          </div>

          {/* Table logging */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-emerald-700 text-white font-bold text-xs uppercase" id="teacher-attendance-th-row">
                    <th className="px-4 py-3 text-center">អត្តលេខ</th>
                    <th className="px-4 py-3">ឈ្មោះបុគ្គលិក</th>
                    <th className="px-4 py-3">មុខវិជ្ជា/តួនាទី</th>
                    <th className="px-4 py-3 text-center">ស្ថានភាពវត្តមាន</th>
                    <th className="px-4 py-3">ចំណាំ/មូលហេតុ</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-slate-400 text-xs font-semibold">
                        មិនទាន់មានទិន្នន័យគ្រូបង្រៀននៅក្នុងប្រព័ន្ធឡើយ។
                      </td>
                    </tr>
                  ) : (
                    teachers.map(t => {
                      const att = teacherAttendance.find(a => a.teacherId === t.id && a.date === selectedAttDate);
                      return (
                        <tr 
                          key={t.id} 
                          className="border-b border-emerald-600 hover:bg-slate-50/50 transition-colors text-xs text-slate-700 font-medium"
                        >
                          <td className="px-4 py-3 font-mono text-center font-semibold text-teal-600 bg-slate-50/30">{t.idNumber}</td>
                        <td className="px-4 py-3 font-bold text-slate-800">{t.name}</td>
                        <td className="px-4 py-3 text-slate-600 font-semibold">{t.role} ({t.subject})</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center items-center gap-1.5">
                            <button
                              onClick={() => handleMarkAttendance(t.id, 'វត្តមាន')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                                att?.status === 'វត្តមាន'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              វត្តមាន (វ)
                            </button>
                            <button
                              onClick={() => handleMarkAttendance(t.id, 'ច្បាប់')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                                att?.status === 'ច្បាប់'
                                  ? 'bg-sky-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              ច្បាប់ (ច)
                            </button>
                            <button
                              onClick={() => handleMarkAttendance(t.id, 'អវត្តមាន')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                                att?.status === 'អវត្តមាន'
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              អវត្តមាន (អ)
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={att?.reason || ''}
                            onChange={e => handleMarkAttendance(t.id, att?.status || 'វត្តមាន', e.target.value)}
                            placeholder="មូលហេតុអវត្តមាន ឬ ស្លាកចំណាំ..."
                            className="w-full px-2 py-1 bg-slate-50/70 border border-slate-100 text-xs rounded-md focus:bg-white focus:border-teal-400 outline-none"
                          />
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

      {/* FORM MODAL FOR CREATE/EDIT TEACHER */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden border border-slate-100 shadow-xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-base">
                {editingTeacher ? 'កែសម្រួលព័ត៌មានគ្រូខ្មែរ' : 'ចុះឈ្មោះបុគ្គលិក-គ្រូថ្មី'}
              </h3>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <form onSubmit={handleSaveTeacher} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="teacher-code-input" className="text-xs font-bold text-slate-600">លេខកូដសម្គាល់គ្រូ</label>
                  <input
                    id="teacher-code-input"
                    type="text"
                    required
                    value={formData.idNumber}
                    onChange={e => setFormData({ ...formData, idNumber: e.target.value })}
                    placeholder="ឧ. TCH-005"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="teacher-name-input" className="text-xs font-bold text-slate-600">គោត្តនាម & នាមខ្លួន</label>
                  <input
                    id="teacher-name-input"
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="លី សុខជា"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">ភេទ</label>
                  <div className="flex gap-4 pt-1.5">
                    {(['ប្រុស', 'ស្រី'] as const).map(g => (
                      <label key={g} className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700">
                        <input
                          type="radio"
                          name="teacherGender"
                          checked={formData.gender === g}
                          onChange={() => setFormData({ ...formData, gender: g })}
                        />
                        <span>{g}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="teacher-dob-input" className="text-xs font-bold text-slate-600">ថ្ងៃខែឆ្នាំកំណើត</label>
                  <input
                    id="teacher-dob-input"
                    type="date"
                    required
                    value={formData.dob}
                    onChange={e => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="teacher-phone-input" className="text-xs font-bold text-slate-600">លេខទូរស័ព្ទ</label>
                  <input
                    id="teacher-phone-input"
                    type="text"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="012 345 678"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="teacher-subject-input" className="text-xs font-bold text-slate-600">មុខវិជ្ជាបង្រៀនឯក</label>
                  <input
                    id="teacher-subject-input"
                    type="text"
                    required
                    value={formData.subject}
                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="គណិតវិទ្យា"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="teacher-role-input" className="text-xs font-bold text-slate-600">តួនាទី / មុខតំណែង</label>
                <input
                  id="teacher-role-input"
                  type="text"
                  required
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                  placeholder="គ្រូបង្រៀន / ជំនួយការការិយាល័យ"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white"
                />
              </div>

              {/* Configure Responsibilities */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-600 block">ចាត់តាំងភារកិច្ចបន្ថែម</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newResp}
                    onChange={e => setNewResp(e.target.value)}
                    placeholder="ឧ. ទទួលបន្ទុកសម្ភារពិសោធន៍គីមី"
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={addResponsibility}
                    className="px-3 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold flex items-center justify-center cursor-pointer hover:bg-teal-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {formData.responsibilities.map((r, i) => (
                    <span 
                      key={i} 
                      className="px-2 py-1 bg-teal-50 text-teal-800 rounded-lg text-[10px] font-bold flex items-center gap-1 border border-teal-100"
                    >
                      {r}
                      <button 
                        type="button" 
                        onClick={() => removeResponsibility(i)}
                        className="text-teal-600 hover:text-teal-900 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-slate-150 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" />
                  រក្សាទុកបុគ្គលិក
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BADGE PREVIEW MODAL POPUP */}
      {isBadgeModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden border border-slate-100 shadow-xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                ប័ណ្ណសម្គាល់ខ្លួនបុគ្គលិក-គ្រូ
              </h3>
              <button 
                onClick={() => setIsBadgeModalOpen(false)}
                className="p-1.5 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col items-center">
              {/* Dropdown to switch teacher inside the modal */}
              <div className="w-full space-y-1">
                <label className="text-xs font-bold text-slate-500 block">ជ្រើសរើសបុគ្គលិក-គ្រូ៖</label>
                <select
                  value={selectedPrintTeacher?.id || ''}
                  onChange={(e) => {
                    const found = teachers.find(t => t.id === e.target.value);
                    if (found) setSelectedPrintTeacher(found);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white outline-none cursor-pointer"
                >
                  <option value="" disabled>--- ជ្រើសរើសគ្រូបង្រៀន ---</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.role})</option>
                  ))}
                </select>
              </div>

              {selectedPrintTeacher ? (
                <>
                  {/* Visual Card component */}
                  <div 
                    id={`teacher-id-card-view-${selectedPrintTeacher.id}`}
                    className="w-[280px] bg-white rounded-2xl shadow-md border-2 border-purple-600 overflow-hidden flex flex-col items-center p-5 space-y-4 relative text-center"
                  >
                    <p className="text-[9px] font-bold text-purple-700 tracking-wider">
                      {schoolInfo.schoolType} {schoolInfo.schoolName}
                    </p>

                    <div className="w-full border-b-2 border-slate-100"></div>

                    <div className="flex flex-col items-center space-y-1">
                      {/* Simulated profile avatar */}
                      <div className="w-20 h-20 rounded-full border-2 border-purple-600 bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-extrabold uppercase">
                        {selectedPrintTeacher.name[0]}
                      </div>
                      <h4 className="text-sm font-extrabold text-slate-800 mt-2">
                        {selectedPrintTeacher.name}
                      </h4>
                      <p className="text-[10px] font-bold text-purple-700 uppercase tracking-widest">
                        {selectedPrintTeacher.role} ({selectedPrintTeacher.subject})
                      </p>
                    </div>

                    <div className="w-full bg-slate-50 p-2.5 rounded-lg text-left text-[11px] text-slate-600 font-semibold space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-[10px]">អត្តលេខបុគ្គលិក</span>
                        <span className="font-mono text-purple-700">{selectedPrintTeacher.idNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-[10px]">ភេទ</span>
                        <span>{selectedPrintTeacher.gender}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-[10px]">ថ្ងៃខែឆ្នាំកំណើត</span>
                        <span>{selectedPrintTeacher.dob || '---'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-[10px]">លេខទូរស័ព្ទ</span>
                        <span>{selectedPrintTeacher.phone}</span>
                      </div>
                    </div>

                    {/* Dynamic canvas QR Code to scan attendance */}
                    <div className="flex flex-col items-center space-y-1">
                      <canvas 
                        ref={el => { canvasRefs.current[`qr-${selectedPrintTeacher.id}`] = el; }}
                        className="w-28 h-28 border border-slate-100 rounded-lg p-1.5"
                        width={120}
                        height={120}
                      />
                      <span className="text-[9px] font-mono font-bold text-slate-400">
                        QR CODE សម្គាល់វត្តមាន
                      </span>
                    </div>

                    <div className="w-full border-t border-dashed border-slate-200 pt-2 text-[10px] text-slate-400 italic">
                      ហត្ថលេខានាយកសាលា និងត្រា
                    </div>
                  </div>

                  {/* Print actions */}
                  <div className="w-full space-y-2 pt-2">
                    <button
                      onClick={handlePrintTrigger}
                      className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-transform cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      ព្រីនចេញដោយផ្ទាល់ (Print Card)
                    </button>
                    <p className="text-[10px] text-center text-slate-400 uppercase leading-relaxed font-semibold">
                      * កាតនេះបោះពុម្ពទំហំស្ដង់ដារតម្រូវទៅតាមម៉ាស៊ីនព្រីន
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-slate-400 text-xs">
                  គ្មានគ្រូត្រូវបានជ្រើសរើសទេ
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Secret Print-Only container to printed Teacher ID beautifully with standard native printing */}
      {selectedPrintTeacher && (
        <div className="hidden print:block absolute inset-0 bg-white p-6 font-sans">
          <div className="w-[320px] bg-white rounded-2xl border-4 border-teal-600 overflow-hidden flex flex-col items-center p-6 space-y-5 text-center mx-auto">
            <h5 className="text-[10px] font-extrabold text-teal-700 uppercase tracking-widest">
              {schoolInfo.schoolType} {schoolInfo.schoolName}
            </h5>
            <div className="w-full border-b-2 border-slate-100"></div>

            <div className="flex flex-col items-center space-y-1">
              <div className="w-24 h-24 rounded-full border-2 border-teal-600 bg-teal-100 flex items-center justify-center text-teal-800 text-4xl font-extrabold uppercase">
                {selectedPrintTeacher.name[0]}
              </div>
              <h4 className="text-base font-extrabold text-slate-800 mt-2">
                {selectedPrintTeacher.name}
              </h4>
              <p className="text-xs font-bold text-teal-700 uppercase tracking-widest mt-0.5">
                {selectedPrintTeacher.role} ({selectedPrintTeacher.subject})
              </p>
            </div>

            <div className="w-full bg-slate-50 p-3 rounded-lg text-left text-xs text-slate-700 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold text-[10px]">អត្តលេខបុគ្គលិក:</span>
                <span className="font-mono font-bold text-slate-800">{selectedPrintTeacher.idNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold text-[10px]">ភេទ:</span>
                <span className="font-bold text-slate-800">{selectedPrintTeacher.gender}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold text-[10px]">ថ្ងៃខែឆ្នាំកំណើត:</span>
                <span className="font-bold text-slate-800">{selectedPrintTeacher.dob || '---'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold text-[10px]">លេខទូរស័ព្ទ:</span>
                <span className="font-bold text-slate-800">{selectedPrintTeacher.phone}</span>
              </div>
            </div>

            {/* Print canvas placeholder element: drawing high-res simulated QR in black vector */}
            <div className="flex flex-col items-center space-y-1">
              {/* Uses Canvas directly to render in print layout */}
              <canvas 
                ref={el => { if (el) generateQRCode(el, `SCHOOL-TEACHER-AUTH-ID:${selectedPrintTeacher.idNumber}`); }}
                className="w-32 h-32 border border-slate-100 rounded-lg p-1"
                width={120}
                height={120}
              />
              <span className="text-[9px] font-mono font-bold text-slate-400">
                QR CODE សម្គាល់វត្តមាន
              </span>
            </div>

            <div className="w-full border-t border-dashed border-slate-300 pt-3 text-[10px] text-slate-400 italic">
              ហត្ថលេខានាយកសាលា និងត្រា
            </div>
          </div>
        </div>
      )}

      {/* SINGLE TEACHER DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden border border-slate-100 shadow-xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 bg-rose-50 rounded-full">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-base font-sans">បញ្ជាក់ការលុបព័ត៌មាន</h3>
            </div>
            <p className="text-slate-600 text-xs font-semibold leading-relaxed">
              តើអ្នកពិតជាចង់លុបទិន្នន័យគ្រូបង្រៀនឈ្មោះ <span className="font-extrabold text-slate-950">"{deleteTarget.name}"</span> មែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់ក្រោយវិញបានឡើយ។
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-705 rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                បោះបង់
              </button>
              <button
                type="button"
                onClick={confirmDeleteTeacher}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                យល់ព្រមលុប
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ALL TEACHERS DELETE CONFIRMATION MODAL */}
      {isDeleteAllOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden border border-slate-100 shadow-xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 bg-rose-50 rounded-full">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-base font-sans">បញ្ជាក់ការលុបទិន្នន័យទាំងអស់</h3>
            </div>
            <p className="text-slate-600 text-xs font-semibold leading-relaxed">
              តើអ្នកពិតជាចង់លុបទិន្នន័យគ្រូបង្រៀនទាំងអស់មែនទេ? សកម្មភាពនេះនឹងលុបគ្រូទាំងអស់ចេញពីប្រព័ន្ធ ហើយមិនអាចត្រឡប់ក្រោយវិញបានឡើយ។
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteAllOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-705 rounded-xl text-xs font-bold cursor-pointer transition-colors"
               >
                បោះបង់
              </button>
              <button
                type="button"
                onClick={confirmDeleteAllTeachers}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                យល់ព្រមលុបទាំងអស់
              </button>
            </div>
          </div>
        </div>
      )}
      {/* TOAST NOTIFICATION FEEDBACK */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-[200] flex bg-white border-l-4 border-emerald-500 shadow-xl rounded-xl p-4 items-center gap-3 max-w-sm border border-slate-100 transition-all duration-300 transform scale-100 animate-in fade-in slide-in-from-bottom-4">
          <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-full shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-slate-800 text-xs font-bold font-sans">ជោគជ័យ</p>
            <p className="text-slate-600 text-[11px] font-semibold">{toast.message}</p>
          </div>
          <button 
            onClick={() => setToast(null)}
            className="text-slate-350 hover:text-slate-500 ml-auto focus:outline-none cursor-pointer p-0.5 hover:bg-slate-50 rounded-md transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
