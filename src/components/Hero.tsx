import React from 'react';
import { 
  Atom, 
  Rocket, 
  Award, 
  CheckCircle2
} from 'lucide-react';

interface HeroProps {
  academicYear: string;
  totalActivities: number;
  totalRegistrations: number;
}

export const Hero: React.FC<HeroProps> = ({
  academicYear,
  totalActivities,
  totalRegistrations,
}) => {
  return (
    <div className="relative overflow-hidden pt-6 pb-6 sm:pt-8 sm:pb-10">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-10 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 left-1/3 w-80 h-80 bg-pink-400/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto space-y-5">
          
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/85 backdrop-blur-md border border-cyan-200 shadow-sm shadow-cyan-500/10 text-xs sm:text-sm font-semibold text-cyan-800 animate-pulse">
            <Atom className="w-4 h-4 text-cyan-600 animate-spin-slow" />
            <span>งานสัปดาห์วิทยาศาสตร์แห่งชาติ • โรงเรียน&#8203;หนองวัวซอ&#8203;พิทยาคม</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-emerald-700 font-bold">ปีการศึกษา {academicYear}</span>
          </div>

          {/* Main Headline (Fixed Typo: พิชิตชัยชนะ) */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight sm:leading-none">
            ค้นพบความท้าทายทางวิทยาศาสตร์ <br />
            <span className="text-gradient">แสดงศักยภาพ พิชิตชัยชนะ</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            ระบบรับสมัครการแข่งขันออนไลน์ สรุปผลรางวัล และดาวน์โหลดเกียรติบัตรสำหรับนักเรียนระดับชั้น ม.1 - ม.6 <span className="pointer-events-none inline-block">โรงเรียน&#8203;หนองวัวซอ&#8203;พิทยาคม</span>
          </p>

          {/* Quick Counter Badges */}
          <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-6 pt-2">
            <div className="glass-panel px-5 py-2.5 rounded-2xl flex items-center gap-3 border border-white/80">
              <div className="p-2 rounded-xl bg-cyan-100 text-cyan-700">
                <Rocket className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xl font-bold text-slate-800">{totalActivities}</div>
                <div className="text-xs text-slate-500 font-medium">กิจกรรมการแข่งขัน</div>
              </div>
            </div>

            <div className="glass-panel px-5 py-2.5 rounded-2xl flex items-center gap-3 border border-white/80">
              <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xl font-bold text-slate-800">{totalRegistrations}</div>
                <div className="text-xs text-slate-500 font-medium">ทีม/ผู้สมัครเข้าร่วมแล้ว</div>
              </div>
            </div>

            <div className="glass-panel px-5 py-2.5 rounded-2xl flex items-center gap-3 border border-white/80">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                <Award className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xl font-bold text-slate-800">เกียรติบัตร</div>
                <div className="text-xs text-slate-500 font-medium">ออกเกียรติบัตรออนไลน์ PDF / PNG</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
