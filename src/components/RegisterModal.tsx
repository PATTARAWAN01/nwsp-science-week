import React, { useState, useEffect } from 'react';
import { Activity, LevelCategory, StudentTitle, StudentGrade, ApplicantStudent, Registration } from '../types';
import { saveRegistration } from '../services/storage';
import confetti from 'canvas-confetti';
import { 
  X, 
  Users, 
  User, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  CreditCard, 
  School,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  activities: Activity[];
  initialActivity?: Activity | null;
  academicYear: string;
  onSuccess: () => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  activities,
  initialActivity,
  academicYear,
  onSuccess
}) => {
  const [level, setLevel] = useState<LevelCategory>('ม.ต้น');
  const [selectedActivityId, setSelectedActivityId] = useState('');
  const [teamName, setTeamName] = useState('');
  const [members, setMembers] = useState<ApplicantStudent[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Set default initial activity or first available
  useEffect(() => {
    if (initialActivity) {
      setSelectedActivityId(initialActivity.id);
      if (initialActivity.levels.includes('ม.ต้น')) {
        setLevel('ม.ต้น');
      } else if (initialActivity.levels.includes('ม.ปลาย')) {
        setLevel('ม.ปลาย');
      }
    } else if (activities.length > 0) {
      setSelectedActivityId(activities[0].id);
    }
  }, [initialActivity, activities]);

  // Filter activities matching chosen level
  const availableActivities = activities.filter(act => act.levels.includes(level) && act.isOpen);
  const currentActivity = activities.find(act => act.id === selectedActivityId) || availableActivities[0];

  // Adjust member list count based on teamSize & sanitize grade when level changes
  useEffect(() => {
    if (!currentActivity) return;

    const count = currentActivity.type === 'team' ? currentActivity.teamSize : 1;
    const isJuniorLevel = level === 'ม.ต้น';
    const defaultTitle: StudentTitle = isJuniorLevel ? 'เด็กชาย' : 'นาย';
    const defaultGrade: StudentGrade = isJuniorLevel ? 'ม.1' : 'ม.4';

    setMembers(prev => {
      const newMembers: ApplicantStudent[] = [];
      for (let i = 0; i < count; i++) {
        const p = prev[i];
        if (p) {
          const currentIsJunior = ['ม.1', 'ม.2', 'ม.3'].includes(p.grade);
          let sanitizedGrade = p.grade;
          let sanitizedTitle = p.title;

          if (isJuniorLevel && !currentIsJunior) {
            sanitizedGrade = 'ม.1';
          } else if (!isJuniorLevel && currentIsJunior) {
            sanitizedGrade = 'ม.4';
          }

          newMembers.push({
            ...p,
            title: p.title || defaultTitle,
            grade: sanitizedGrade || defaultGrade,
          });
        } else {
          newMembers.push({
            studentId: '',
            title: defaultTitle,
            fullName: '',
            grade: defaultGrade,
            room: 1
          });
        }
      }
      return newMembers;
    });
    setErrors({});
  }, [currentActivity, level]);

  if (!isOpen) return null;

  const handleMemberChange = (index: number, field: keyof ApplicantStudent, value: any) => {
    setMembers(prev => {
      const updated = [...prev];
      const member = { ...updated[index], [field]: value };

      if (field === 'grade') {
        const isJunior = ['ม.1', 'ม.2', 'ม.3'].includes(value);
        const maxRoom = isJunior ? 5 : 4;
        if (member.room > maxRoom) {
          member.room = 1;
        }
      }
      updated[index] = member;
      return updated;
    });

    if (errors[`${index}_${field}`]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[`${index}_${field}`];
        return next;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!currentActivity) {
      newErrors['activity'] = 'กรุณาเลือกกิจกรรมการแข่งขัน';
      setErrors(newErrors);
      return false;
    }

    if (currentActivity.type === 'team' && !teamName.trim()) {
      newErrors['teamName'] = 'กรุณากรอกชื่อทีม';
    }

    members.forEach((m, idx) => {
      const idClean = m.studentId.trim();
      if (!idClean) {
        newErrors[`${idx}_studentId`] = 'กรุณากรอกรหัสนักเรียน';
      } else if (!/^\d{5}$/.test(idClean)) {
        newErrors[`${idx}_studentId`] = 'รหัสนักเรียนต้องเป็นตัวเลข 5 หลักเท่านั้น (เช่น 12345)';
      }

      if (!m.fullName.trim()) {
        newErrors[`${idx}_fullName`] = 'กรุณากรอก ชื่อ-สกุล';
      }

      const isJuniorGrade = ['ม.1', 'ม.2', 'ม.3'].includes(m.grade);
      const maxRoom = isJuniorGrade ? 5 : 4;
      if (m.room < 1 || m.room > maxRoom) {
        newErrors[`${idx}_room`] = `ระดับชั้น ${m.grade} เลือกห้องได้ตั้งแต่ 1 - ${maxRoom} เท่านั้น`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !currentActivity) return;

    setIsSubmitting(true);
    try {
      const newRegistration: Registration = {
        id: `reg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        academicYear,
        activityId: currentActivity.id,
        activityTitle: currentActivity.title,
        level,
        teamName: currentActivity.type === 'team' ? teamName.trim() : undefined,
        members: members.map(m => ({
          ...m,
          studentId: m.studentId.trim(),
          fullName: m.fullName.trim()
        })),
        registeredAt: new Date().toISOString()
      };

      await saveRegistration(newRegistration);
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      setSubmitSuccess(true);
      setTimeout(() => {
        setIsSubmitting(false);
      }, 500);
    } catch (err) {
      console.error("Registration error:", err);
      setIsSubmitting(false);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง");
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white/95 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-white/80 overflow-hidden relative">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 p-5 sm:p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <span className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
              <Sparkles className="w-5 h-5 text-yellow-300" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
              ลงทะเบียนเข้าแข่งขันสัปดาห์วิทยาศาสตร์ ปี {academicYear}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            ฟอร์มสมัครเข้าร่วมการแข่งขัน
          </h2>
          <p className="text-xs sm:text-sm text-sky-100 mt-1">
            โรงเรียนหนองวัวซอพิทยาคม • กรอกข้อมูลให้ครบถ้วนเพื่อรับสิทธิ์แข่งขัน
          </p>
        </div>

        {/* Modal Content / Form Body */}
        {submitSuccess ? (
          <div className="p-8 sm:p-12 text-center space-y-6 flex-1 flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 animate-bounce">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-slate-800">สมัครแข่งขันเรียบร้อยแล้ว! 🎉</h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                บันทึกข้อมูลการสมัครแข่งขัน <span className="font-bold text-sky-600">"{currentActivity?.title}"</span> สำเร็จแล้ว นักเรียนสามารถตรวจสอบรายชื่อได้ในหน้ารายงานสรุปการสมัคร
              </p>
            </div>
            <button
              onClick={() => {
                onSuccess();
                onClose();
              }}
              className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg"
            >
              ปิดหน้าต่างนี้
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
            
            {/* Step 1: Select Grade Level & Activity */}
            <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <School className="w-4 h-4 text-sky-600" />
                เลือกระดับชั้นและกิจกรรมการแข่งขัน
              </label>

              {/* Level Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLevel('ม.ต้น')}
                  className={`py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-all ${
                    level === 'ม.ต้น'
                      ? 'bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-500/20'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  มัธยมศึกษาตอนต้น (ม.1 - ม.3)
                </button>

                <button
                  type="button"
                  onClick={() => setLevel('ม.ปลาย')}
                  className={`py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-all ${
                    level === 'ม.ปลาย'
                      ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-500/20'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  มัธยมศึกษาตอนปลาย (ม.4 - ม.6)
                </button>
              </div>

              {/* Activity Selector Select dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  เลือกกิจกรรม ({level}):
                </label>
                <select
                  value={selectedActivityId}
                  onChange={(e) => setSelectedActivityId(e.target.value)}
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl font-semibold text-sm text-slate-800 border-slate-300"
                >
                  {availableActivities.length === 0 ? (
                    <option value="">-- ไม่มีกิจกรรมเปิดรับสมัครสำหรับช่วงชั้นนี้ --</option>
                  ) : (
                    availableActivities.map(act => (
                      <option key={act.id} value={act.id}>
                        {act.title} ({act.type === 'team' ? `ทีม ${act.teamSize} คน` : 'เดี่ยว'})
                      </option>
                    ))
                  )}
                </select>
              </div>

              {currentActivity && (
                <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    {currentActivity.type === 'team' ? <Users className="w-4 h-4 text-indigo-600" /> : <User className="w-4 h-4 text-emerald-600" />}
                    เงื่อนไข: {currentActivity.type === 'team' ? `แข่งเป็นทีม บังคับกรอกข้อมูลสมาชิกครบ ${currentActivity.teamSize} คน` : 'แข่งประเภทเดี่ยว 1 คน'}
                  </div>
                  {currentActivity.teachers && currentActivity.teachers.length > 0 && (
                    <div className="text-slate-500">
                      <strong>ครูผู้ดูแล:</strong> {currentActivity.teachers.join(', ')}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Step 2: Team Name (If Team Activity) */}
            {currentActivity?.type === 'team' && (
              <div className="space-y-2 bg-indigo-50/70 p-4 rounded-2xl border border-indigo-100">
                <label className="block text-xs font-bold text-indigo-900">
                  ชื่อทีมแข่งขัน <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="เช่น ทีมไซแอนซ์ซ่า, สปีดโค้ดดิ้ง NWSP"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className={`w-full glass-input px-4 py-2.5 rounded-xl font-medium text-sm text-slate-800 ${
                    errors['teamName'] ? 'border-rose-500 focus:ring-rose-200' : 'border-indigo-200'
                  }`}
                />
                {errors['teamName'] && (
                  <p className="text-xs font-bold text-rose-600 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> {errors['teamName']}
                  </p>
                )}
              </div>
            )}

            {/* Step 3: Member Details Forms (Requirement #6: Removed Numbers from Field Labels) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-purple-600" />
                  ข้อมูลผู้สมัคร ({members.length} คน)
                </label>
              </div>

              {members.map((member, index) => {
                const isJuniorGrade = ['ม.1', 'ม.2', 'ม.3'].includes(member.grade);
                const maxRoom = isJuniorGrade ? 5 : 4;
                const roomOptions = Array.from({ length: maxRoom }, (_, i) => i + 1);

                return (
                  <div key={index} className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-100">
                        {currentActivity?.type === 'team' ? `สมาชิกคนที่ ${index + 1}` : 'ข้อมูลผู้สมัคร'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* 1. Student ID (Removed "1.") */}
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700">
                          เลขประจำตัวนักเรียน (5 หลัก) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          maxLength={5}
                          placeholder="เช่น 12345"
                          value={member.studentId}
                          onChange={(e) => handleMemberChange(index, 'studentId', e.target.value)}
                          className={`w-full glass-input px-3.5 py-2 rounded-xl text-sm font-mono tracking-wider ${
                            errors[`${index}_studentId`] ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300'
                          }`}
                        />
                        {errors[`${index}_studentId`] && (
                          <p className="text-xs font-bold text-rose-600 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            {errors[`${index}_studentId`]}
                          </p>
                        )}
                      </div>

                      {/* 2. Title (Removed "2.") */}
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700">
                          คำนำหน้าชื่อ <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={member.title}
                          onChange={(e) => handleMemberChange(index, 'title', e.target.value as StudentTitle)}
                          className="w-full glass-input px-3.5 py-2 rounded-xl text-sm border-slate-300"
                        >
                          <option value="เด็กชาย">เด็กชาย</option>
                          <option value="เด็กหญิง">เด็กหญิง</option>
                          <option value="นาย">นาย</option>
                          <option value="นางสาว">นางสาว</option>
                        </select>
                      </div>

                      {/* 3. Full Name (Removed "3.") */}
                      <div className="sm:col-span-2 space-y-1">
                        <label className="block text-xs font-bold text-slate-700">
                          ชื่อ - สกุล <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="กรอกชื่อและนามสกุลเต็มในช่องนี้"
                          value={member.fullName}
                          onChange={(e) => handleMemberChange(index, 'fullName', e.target.value)}
                          className={`w-full glass-input px-3.5 py-2 rounded-xl text-sm ${
                            errors[`${index}_fullName`] ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300'
                          }`}
                        />
                        {errors[`${index}_fullName`] && (
                          <p className="text-xs font-bold text-rose-600 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {errors[`${index}_fullName`]}
                          </p>
                        )}
                      </div>

                      {/* 4. Grade (Removed "4.") */}
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700">
                          ระดับชั้น <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={member.grade}
                          onChange={(e) => handleMemberChange(index, 'grade', e.target.value as StudentGrade)}
                          className="w-full glass-input px-3.5 py-2 rounded-xl text-sm border-slate-300 font-semibold"
                        >
                          {level === 'ม.ต้น' ? (
                            <>
                              <option value="ม.1">ม.1</option>
                              <option value="ม.2">ม.2</option>
                              <option value="ม.3">ม.3</option>
                            </>
                          ) : (
                            <>
                              <option value="ม.4">ม.4</option>
                              <option value="ม.5">ม.5</option>
                              <option value="ม.6">ม.6</option>
                            </>
                          )}
                        </select>
                      </div>

                      {/* 5. Room (Removed "5.") */}
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
                          <span>ห้องเรียน <span className="text-rose-500">*</span></span>
                          <span className="text-slate-400 font-normal">
                            ({isJuniorGrade ? 'เลือกได้ห้อง 1 - 5' : 'เลือกได้ห้อง 1 - 4'})
                          </span>
                        </label>
                        <select
                          value={member.room}
                          onChange={(e) => handleMemberChange(index, 'room', parseInt(e.target.value))}
                          className="w-full glass-input px-3.5 py-2 rounded-xl text-sm border-slate-300 font-semibold text-sky-700"
                        >
                          {roomOptions.map(r => (
                            <option key={r} value={r}>ห้อง {r}</option>
                          ))}
                        </select>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer Submit */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-100 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-7 py-3 bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center gap-2"
              >
                {isSubmitting ? 'กำลังบันทึกข้อมูล...' : 'ยืนยันการลงทะเบียนสมัคร'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
