import React from 'react';
import { Activity } from '../types';
import { 
  Users, 
  User, 
  MapPin, 
  Sparkles, 
  BookOpen, 
  UserCheck, 
  ExternalLink
} from 'lucide-react';

interface ActivityCardProps {
  activity: Activity;
  index: number;
  onRegister: (activity: Activity) => void;
  onOpenDetails: (activity: Activity) => void;
}

// 7 Strikingly Distinct Vibrant Color Themes for all 7 competitions
const CARD_THEMES = [
  {
    // 1. ตอบปัญหาวิทยาศาสตร์ (Ice Cyan & Sky Blue Background)
    cardBg: 'bg-gradient-to-br from-sky-100/90 via-cyan-50/80 to-white/95 border-sky-300 shadow-sky-500/10 hover:border-sky-400',
    borderTop: 'bg-gradient-to-r from-sky-400 via-cyan-500 to-teal-400',
    badgeType: 'bg-sky-200/90 text-sky-900 border-sky-300 font-bold',
    titleColor: 'text-sky-950 group-hover:text-sky-600',
    btnBg: 'bg-gradient-to-r from-sky-500 via-cyan-600 to-teal-600 text-white shadow-sky-500/25 hover:shadow-sky-500/40',
    scheduleBg: 'bg-sky-100/60 border-sky-200/80 text-sky-950',
    detailsBtn: 'bg-sky-200/80 text-sky-900 hover:bg-sky-300/80 border-sky-300 font-bold',
  },
  {
    // 2. แก้ปัญหาทางวิทยาศาสตร์ (Deep Lavender & Purple Tint Background)
    cardBg: 'bg-gradient-to-br from-purple-100/90 via-indigo-50/80 to-white/95 border-purple-300 shadow-purple-500/10 hover:border-purple-400',
    borderTop: 'bg-gradient-to-r from-purple-500 via-indigo-500 to-violet-500',
    badgeType: 'bg-purple-200/90 text-purple-900 border-purple-300 font-bold',
    titleColor: 'text-purple-950 group-hover:text-purple-600',
    btnBg: 'bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 text-white shadow-purple-500/25 hover:shadow-purple-500/40',
    scheduleBg: 'bg-purple-100/60 border-purple-200/80 text-purple-950',
    detailsBtn: 'bg-purple-200/80 text-purple-900 hover:bg-purple-300/80 border-purple-300 font-bold',
  },
  {
    // 3. วาดภาพทางวิทยาศาสตร์ (Coral Pink & Rose Tint Background)
    cardBg: 'bg-gradient-to-br from-rose-100/90 via-pink-50/80 to-white/95 border-rose-300 shadow-rose-500/10 hover:border-rose-400',
    borderTop: 'bg-gradient-to-r from-rose-400 via-pink-500 to-coral-500',
    badgeType: 'bg-rose-200/90 text-rose-900 border-rose-300 font-bold',
    titleColor: 'text-rose-950 group-hover:text-rose-600',
    btnBg: 'bg-gradient-to-r from-rose-500 via-pink-600 to-purple-600 text-white shadow-rose-500/25 hover:shadow-rose-500/40',
    scheduleBg: 'bg-rose-100/60 border-rose-200/80 text-rose-950',
    detailsBtn: 'bg-rose-200/80 text-rose-900 hover:bg-rose-300/80 border-rose-300 font-bold',
  },
  {
    // 4. ตอบปัญหาคอมพิวเตอร์และเทคโนโลยี (Mint Emerald & Teal Tint Background)
    cardBg: 'bg-gradient-to-br from-emerald-100/90 via-teal-50/80 to-white/95 border-emerald-300 shadow-emerald-500/10 hover:border-emerald-400',
    borderTop: 'bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500',
    badgeType: 'bg-emerald-200/90 text-emerald-950 border-emerald-300 font-bold',
    titleColor: 'text-emerald-950 group-hover:text-emerald-600',
    btnBg: 'bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 text-white shadow-emerald-500/25 hover:shadow-emerald-500/40',
    scheduleBg: 'bg-emerald-100/60 border-emerald-200/80 text-emerald-950',
    detailsBtn: 'bg-emerald-200/80 text-emerald-950 hover:bg-emerald-300/80 border-emerald-300 font-bold',
  },
  {
    // 5. ออกแบบภาพอินโฟกราฟิก (Sunset Amber & Gold Tint Background)
    cardBg: 'bg-gradient-to-br from-amber-100/90 via-orange-50/80 to-white/95 border-amber-300 shadow-amber-500/10 hover:border-amber-400',
    borderTop: 'bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-500',
    badgeType: 'bg-amber-200/90 text-amber-950 border-amber-300 font-bold',
    titleColor: 'text-amber-950 group-hover:text-amber-600',
    btnBg: 'bg-gradient-to-r from-amber-500 via-orange-600 to-red-500 text-white shadow-amber-500/25 hover:shadow-amber-500/40',
    scheduleBg: 'bg-amber-100/60 border-amber-200/80 text-amber-950',
    detailsBtn: 'bg-amber-200/80 text-amber-950 hover:bg-amber-300/80 border-amber-300 font-bold',
  },
  {
    // 6. จรวดขวดน้ำ (Royal Indigo & Blue Tint Background)
    cardBg: 'bg-gradient-to-br from-blue-100/90 via-indigo-50/80 to-white/95 border-blue-300 shadow-blue-500/10 hover:border-blue-400',
    borderTop: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600',
    badgeType: 'bg-blue-200/90 text-blue-950 border-blue-300 font-bold',
    titleColor: 'text-blue-950 group-hover:text-blue-600',
    btnBg: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white shadow-blue-500/25 hover:shadow-blue-500/40',
    scheduleBg: 'bg-blue-100/60 border-blue-200/80 text-blue-950',
    detailsBtn: 'bg-blue-200/80 text-blue-950 hover:bg-blue-300/80 border-blue-300 font-bold',
  },
  {
    // 7. ชุดรีไซเคิล (Vibrant Fuchsia & Magenta Tint Background)
    cardBg: 'bg-gradient-to-br from-fuchsia-100/90 via-pink-50/80 to-white/95 border-fuchsia-300 shadow-fuchsia-500/10 hover:border-fuchsia-400',
    borderTop: 'bg-gradient-to-r from-fuchsia-500 via-pink-500 to-rose-500',
    badgeType: 'bg-fuchsia-200/90 text-fuchsia-950 border-fuchsia-300 font-bold',
    titleColor: 'text-fuchsia-950 group-hover:text-fuchsia-600',
    btnBg: 'bg-gradient-to-r from-fuchsia-600 via-pink-600 to-rose-600 text-white shadow-fuchsia-500/25 hover:shadow-fuchsia-500/40',
    scheduleBg: 'bg-fuchsia-100/60 border-fuchsia-200/80 text-fuchsia-950',
    detailsBtn: 'bg-fuchsia-200/80 text-fuchsia-950 hover:bg-fuchsia-300/80 border-fuchsia-300 font-bold',
  }
];

export const ActivityCard: React.FC<ActivityCardProps> = ({ 
  activity, 
  index = 0, 
  onRegister,
  onOpenDetails
}) => {
  const theme = CARD_THEMES[index % CARD_THEMES.length];

  const isAllClosed = !activity.isOpen || (activity.levels && activity.levels.length > 0 && activity.levels.every(l => (activity.closedLevels || []).includes(l)));

  return (
    <div className={`rounded-3xl p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden group backdrop-blur-md border shadow-lg transition-all duration-300 hover:-translate-y-1.5 ${theme.cardBg}`}>
      
      {/* Top Distinct Accent Gradient Line */}
      <div className={`absolute top-0 left-0 right-0 h-2.5 ${theme.borderTop}`} />

      <div>
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            {activity.type === 'team' ? (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border ${theme.badgeType}`}>
                <Users className="w-3.5 h-3.5" />
                ประเภททีม ({activity.teamSize} คน)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-200/90 text-emerald-950 border border-emerald-300">
                <User className="w-3.5 h-3.5" />
                ประเภทเดี่ยว (1 คน)
              </span>
            )}
          </div>

          {/* Independent Level Status Badges (ม.ต้น / ม.ปลาย) */}
          <div className="flex flex-wrap items-center gap-1.5">
            {activity.levels.map((lvl) => {
              const isLevelClosed = (activity.closedLevels || []).includes(lvl) || !activity.isOpen;
              return (
                <span 
                  key={lvl} 
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border transition-all ${
                    isLevelClosed
                      ? 'bg-rose-100/90 text-rose-800 border-rose-300'
                      : 'bg-emerald-100/90 text-emerald-800 border-emerald-300'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isLevelClosed ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'}`} />
                  <span>{lvl}:</span>
                  <span>{isLevelClosed ? 'ปิดรับสมัคร' : 'เปิดรับสมัคร'}</span>
                </span>
              );
            })}
          </div>
        </div>

        {/* Title */}
        <h3 className={`text-xl sm:text-2xl font-extrabold mb-3 ${theme.titleColor} transition-colors leading-snug`}>
          {activity.title}
        </h3>

        {/* Teacher Supervisors (ครูผู้ดูแลกิจกรรม) */}
        {activity.teachers && activity.teachers.length > 0 && (
          <div className="mb-4 bg-white/70 backdrop-blur-md p-3 rounded-2xl border border-white/80 shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1.5">
              <UserCheck className="w-3.5 h-3.5 text-slate-600" />
              <span>ครูผู้ดูแลกิจกรรม:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {activity.teachers.map((t, idx) => (
                <span key={idx} className="text-xs bg-white/90 px-2.5 py-0.5 rounded-lg border border-slate-200 text-slate-800 font-semibold shadow-2xs">
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Schedule & Location Box */}
        <div className={`space-y-2 mb-4 p-3.5 rounded-2xl border text-xs sm:text-sm ${theme.scheduleBg}`}>
          {activity.schedules.junior && (
            <div className="flex items-start gap-2 text-slate-800">
              <span className="font-bold text-sky-800 bg-sky-200/80 px-1.5 py-0.5 rounded text-xs shrink-0">ม.ต้น</span>
              <div>
                <span className="font-bold">{activity.schedules.junior.date} ({activity.schedules.junior.time})</span>
                <div className="text-slate-600 text-xs flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-600 inline shrink-0" /> {activity.schedules.junior.location}
                </div>
              </div>
            </div>
          )}

          {activity.schedules.senior && (
            <div className="flex items-start gap-2 text-slate-800">
              <span className="font-bold text-purple-800 bg-purple-200/80 px-1.5 py-0.5 rounded text-xs shrink-0">ม.ปลาย</span>
              <div>
                <span className="font-bold">{activity.schedules.senior.date} ({activity.schedules.senior.time})</span>
                <div className="text-slate-600 text-xs flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-600 inline shrink-0" /> {activity.schedules.senior.location}
                </div>
              </div>
            </div>
          )}

          {activity.schedules.general && (
            <div className="flex items-start gap-2 text-slate-800">
              <span className="font-bold text-emerald-800 bg-emerald-200/80 px-1.5 py-0.5 rounded text-xs shrink-0">ม.ต้น & ม.ปลาย</span>
              <div>
                <span className="font-bold">{activity.schedules.general.date} ({activity.schedules.general.time})</span>
                <div className="text-slate-600 text-xs flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-600 inline shrink-0" /> {activity.schedules.general.location}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Details Button without "(Pop-up)" text */}
        <div className="mb-5">
          <button
            onClick={() => onOpenDetails(activity)}
            className={`w-full flex items-center justify-center gap-2 text-xs font-extrabold px-3.5 py-2.5 rounded-xl border shadow-2xs transition-all ${theme.detailsBtn}`}
          >
            <BookOpen className="w-4 h-4" />
            ดูกติกาและรายละเอียดการแข่งขันเพิ่มเติม
            <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-70" />
          </button>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={() => onRegister(activity)}
        disabled={isAllClosed}
        className={`w-full py-3.5 px-5 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg transition-all duration-200 ${
          !isAllClosed
            ? `${theme.btnBg} hover:scale-[1.01] active:scale-[0.99]`
            : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
        }`}
      >
        <Sparkles className="w-4 h-4" />
        {!isAllClosed ? 'สมัครแข่งขัน' : 'ปิดรับสมัครแล้ว'}
      </button>
    </div>
  );
};
