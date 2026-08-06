import React, { useState } from 'react';
import { CompetitionResult, Activity } from '../types';
import { Award, Trophy, Medal, Search, Filter, Sparkles } from 'lucide-react';

interface ResultsSummaryProps {
  results: CompetitionResult[];
  activities: Activity[];
  academicYear: string;
}

export const ResultsSummary: React.FC<ResultsSummaryProps> = ({
  results,
  activities,
  academicYear
}) => {
  const [selectedActivityId, setSelectedActivityId] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  const filteredResults = results.filter(res => {
    const matchesYear = res.academicYear === academicYear;
    const matchesActivity = selectedActivityId === 'all' || res.activityId === selectedActivityId;
    const matchesLevel = selectedLevel === 'all' || res.level === selectedLevel;
    return matchesYear && matchesActivity && matchesLevel;
  });

  const getAwardBadge = (award: string) => {
    switch (award) {
      case 'รางวัลชนะเลิศ':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 shadow-sm">
            <Trophy className="w-4 h-4 text-amber-500 fill-amber-400" />
            🥇 รางวัลชนะเลิศ
          </span>
        );
      case 'รองชนะเลิศอันดับ 1':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-slate-200 text-slate-800 border border-slate-300">
            <Medal className="w-4 h-4 text-slate-400 fill-slate-300" />
            🥈 รองอันดับ 1
          </span>
        );
      case 'รองชนะเลิศอันดับ 2':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-800/10 text-amber-800 border border-amber-700/20">
            <Medal className="w-4 h-4 text-amber-700 fill-amber-600" />
            🥉 รองอันดับ 2
          </span>
        );
      case 'รางวัลชมเชย':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            ⭐ รางวัลชมเชย
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            🎖️ เข้าร่วมการแข่งขัน
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/80 shadow-md">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-amber-100 text-amber-700 rounded-2xl">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              ประกาศสรุปผลการแข่งขัน
            </h2>
            <p className="text-sm text-slate-600">
              ผลรางวัลการแข่งขันสัปดาห์วิทยาศาสตร์ โรงเรียนหนองวัวซอพิทยาคม ปีการศึกษา {academicYear}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-200/80">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">เลือกกิจกรรม:</label>
            <select
              value={selectedActivityId}
              onChange={(e) => setSelectedActivityId(e.target.value)}
              className="w-full glass-input px-3.5 py-2 rounded-xl text-sm font-semibold border-slate-300"
            >
              <option value="all">-- ทุกกิจกรรมการแข่งขัน --</option>
              {activities.map(act => (
                <option key={act.id} value={act.id}>{act.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">เลือกระดับชั้น:</label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full glass-input px-3.5 py-2 rounded-xl text-sm font-semibold border-slate-300"
            >
              <option value="all">-- ทุกระดับชั้น (ม.ต้น / ม.ปลาย) --</option>
              <option value="ม.ต้น">มัธยมศึกษาตอนต้น (ม.1 - ม.3)</option>
              <option value="ม.ปลาย">มัธยมศึกษาตอนปลาย (ม.4 - ม.6)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results List */}
      {filteredResults.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-3xl space-y-3">
          <Award className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-700">ยังไม่มีการประกาศผลการแข่งขัน</h3>
          <p className="text-xs sm:text-sm text-slate-500">
            เจ้าหน้าที่ยังไม่ได้ลงผลการแข่งขันในกิจกรรมที่เลือก
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredResults.map((res) => (
            <div key={res.id} className="glass-card rounded-3xl p-6 border border-white/80 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    res.level === 'ม.ต้น' ? 'bg-sky-100 text-sky-800' : 'bg-purple-100 text-purple-800'
                  }`}>
                    {res.level}
                  </span>
                  <h3 className="font-bold text-lg text-slate-800">
                    {res.activityTitle}
                  </h3>
                </div>

                {getAwardBadge(res.award)}
              </div>

              {/* Award Details */}
              <div className="space-y-2">
                {res.teamName && (
                  <div className="text-sm font-bold text-indigo-700">
                    ชื่อทีม: {res.teamName}
                  </div>
                )}

                <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/60 space-y-1">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    รายชื่อผู้ได้รับรางวัล:
                  </div>
                  {res.members.map((m, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span>{m.title}{m.fullName}</span>
                      <span className="text-xs text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {m.grade}/{m.room} (รหัส {m.studentId})
                      </span>
                    </div>
                  ))}
                </div>

                {res.score && (
                  <div className="text-xs font-semibold text-slate-500">
                    คะแนนรวม: <span className="font-bold text-slate-700">{res.score}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
