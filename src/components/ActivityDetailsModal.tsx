import React from 'react';
import { Activity } from '../types';
import { 
  X, 
  Users, 
  User, 
  MapPin, 
  Calendar, 
  Sparkles, 
  BookOpen, 
  UserCheck, 
  Award, 
  FileText
} from 'lucide-react';

interface ActivityDetailsModalProps {
  isOpen: boolean;
  activity: Activity | null;
  onClose: () => void;
  onRegister: (activity: Activity) => void;
}

export const ActivityDetailsModal: React.FC<ActivityDetailsModalProps> = ({
  isOpen,
  activity,
  onClose,
  onRegister
}) => {
  if (!isOpen || !activity) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white/95 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-white/80 overflow-hidden relative">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 p-5 sm:p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" strokeWidth={1.75} />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            {activity.type === 'team' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-md">
                <Users className="w-3.5 h-3.5" strokeWidth={1.75} />
                ประเภททีม ({activity.teamSize} คน)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-400/30 text-white backdrop-blur-md">
                <User className="w-3.5 h-3.5" strokeWidth={1.75} />
                ประเภทเดี่ยว (1 คน)
              </span>
            )}

            {activity.levels.map(lvl => (
              <span key={lvl} className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white">
                {lvl}
              </span>
            ))}
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            {activity.title}
          </h2>
          <p className="text-xs text-sky-100 mt-1">
            รายละเอียดและกติกาการแข่งขันสัปดาห์วิทยาศาสตร์ โรงเรียนหนองวัวซอพิทยาคม
          </p>
        </div>

        {/* Modal Body / Clean Line-Art Icon Sections */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 text-slate-700 text-sm">
          
          {/* Section 1: Details */}
          <div className="space-y-2 bg-sky-50/70 p-4 rounded-2xl border border-sky-100">
            <h4 className="font-extrabold text-sky-900 flex items-center gap-2 text-sm">
              <FileText className="w-4 h-4 text-sky-600" strokeWidth={1.75} />
              รายละเอียดกิจกรรมการแข่งขัน
            </h4>
            <div className="whitespace-pre-line leading-relaxed text-xs sm:text-sm text-slate-700 font-medium">
              {activity.details}
            </div>
          </div>

          {/* Section 2: Rules */}
          <div className="space-y-2 bg-purple-50/70 p-4 rounded-2xl border border-purple-100">
            <h4 className="font-extrabold text-purple-900 flex items-center gap-2 text-sm">
              <BookOpen className="w-4 h-4 text-purple-600" strokeWidth={1.75} />
              กติกาและเกณฑ์การตัดสิน
            </h4>
            <div className="whitespace-pre-line leading-relaxed text-xs sm:text-sm text-slate-700 font-medium">
              {activity.rules}
            </div>
          </div>

          {/* Section 3: Schedule & Location */}
          <div className="space-y-2 bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100">
            <h4 className="font-extrabold text-emerald-900 flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-emerald-600" strokeWidth={1.75} />
              กำหนดการแข่งขัน (วัน-เวลา-สถานที่)
            </h4>
            <div className="space-y-2 text-xs sm:text-sm">
              {activity.schedules.junior && (
                <div className="flex items-start gap-2 bg-white/80 p-2.5 rounded-xl border border-emerald-200/60">
                  <span className="font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded text-xs">ม.ต้น</span>
                  <div>
                    <div className="font-semibold text-slate-800">{activity.schedules.junior.date} ({activity.schedules.junior.time})</div>
                    <div className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 inline shrink-0" strokeWidth={1.75} /> {activity.schedules.junior.location}
                    </div>
                  </div>
                </div>
              )}

              {activity.schedules.senior && (
                <div className="flex items-start gap-2 bg-white/80 p-2.5 rounded-xl border border-emerald-200/60">
                  <span className="font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded text-xs">ม.ปลาย</span>
                  <div>
                    <div className="font-semibold text-slate-800">{activity.schedules.senior.date} ({activity.schedules.senior.time})</div>
                    <div className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 inline shrink-0" strokeWidth={1.75} /> {activity.schedules.senior.location}
                    </div>
                  </div>
                </div>
              )}

              {activity.schedules.general && (
                <div className="flex items-start gap-2 bg-white/80 p-2.5 rounded-xl border border-emerald-200/60">
                  <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-xs">ม.ต้น & ม.ปลาย</span>
                  <div>
                    <div className="font-semibold text-slate-800">{activity.schedules.general.date} ({activity.schedules.general.time})</div>
                    <div className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 inline shrink-0" strokeWidth={1.75} /> {activity.schedules.general.location}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Teachers */}
          {activity.teachers && activity.teachers.length > 0 && (
            <div className="space-y-2 bg-amber-50/70 p-4 rounded-2xl border border-amber-100">
              <h4 className="font-extrabold text-amber-900 flex items-center gap-2 text-sm">
                <UserCheck className="w-4 h-4 text-amber-600" strokeWidth={1.75} />
                ครูผู้ดูแลกิจกรรม
              </h4>
              <div className="flex flex-wrap gap-2">
                {activity.teachers.map((t, idx) => (
                  <span key={idx} className="bg-white px-3 py-1 rounded-xl text-xs font-semibold text-slate-800 border border-amber-200 shadow-2xs">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Section 5: Awards */}
          <div className="space-y-1 bg-rose-50/70 p-4 rounded-2xl border border-rose-100">
            <h4 className="font-extrabold text-rose-900 flex items-center gap-2 text-sm">
              <Award className="w-4 h-4 text-rose-600" strokeWidth={1.75} />
              รางวัลการแข่งขัน
            </h4>
            <div className="text-xs sm:text-sm font-semibold text-rose-800">
              {activity.awardsText}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-200 transition-colors"
          >
            ปิดหน้าต่างนี้
          </button>

          <button
            onClick={() => {
              onClose();
              onRegister(activity);
            }}
            disabled={!activity.isOpen}
            className={`px-7 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg transition-all ${
              activity.isOpen
                ? 'bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 text-white shadow-sky-500/25 hover:shadow-sky-500/40 hover:scale-[1.01]'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            <Sparkles className="w-4 h-4" strokeWidth={1.75} />
            {activity.isOpen ? 'สมัครแข่งขัน' : 'ปิดรับสมัครแล้ว'}
          </button>
        </div>

      </div>
    </div>
  );
};
