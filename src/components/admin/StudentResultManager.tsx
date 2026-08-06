import React, { useState } from 'react';
import { Registration, CompetitionResult, Activity, AwardType, StudentGrade, StudentTitle } from '../../types';
import { 
  saveRegistration, 
  deleteRegistration, 
  saveResult, 
  deleteResult 
} from '../../services/storage';
import { 
  Users, 
  Award, 
  Edit3, 
  Trash2, 
  Trophy, 
  Search, 
  X
} from 'lucide-react';

interface StudentResultManagerProps {
  registrations: Registration[];
  results: CompetitionResult[];
  activities: Activity[];
  academicYear: string;
  onRefresh: () => void;
}

export const StudentResultManager: React.FC<StudentResultManagerProps> = ({
  registrations,
  results,
  activities,
  academicYear,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState<'applicants' | 'recordResults'>('applicants');
  const [searchTerm, setSearchTerm] = useState('');

  // Result Recording Filters
  const [selectedActivityId, setSelectedActivityId] = useState<string>(activities[0]?.id || '');
  const [selectedLevel, setSelectedLevel] = useState<'ม.ต้น' | 'ม.ปลาย'>('ม.ต้น');

  // Editing Registration State
  const [editingReg, setEditingReg] = useState<Registration | null>(null);

  // Result Recording Modal State
  const [recordingReg, setRecordingReg] = useState<Registration | null>(null);
  const [selectedAward, setSelectedAward] = useState<AwardType>('รางวัลชนะเลิศ');
  const [certIdInput, setCertIdInput] = useState<string>('');
  const [scoreInput, setScoreInput] = useState<string>('');

  // Filter registrations for current year
  const filteredRegs = registrations.filter(r => {
    const matchesYear = r.academicYear === academicYear;
    const searchClean = searchTerm.trim().toLowerCase();
    const matchesSearch = !searchClean || 
      r.activityTitle.toLowerCase().includes(searchClean) ||
      (r.teamName && r.teamName.toLowerCase().includes(searchClean)) ||
      r.members.some(m => m.fullName.toLowerCase().includes(searchClean) || m.studentId.includes(searchClean));
    return matchesYear && matchesSearch;
  });

  // Filter registrations for Award Recording tab
  const activityRegistrations = registrations.filter(r => 
    r.academicYear === academicYear && r.activityId === selectedActivityId && r.level === selectedLevel
  );

  const handleDeleteReg = async (id: string) => {
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายการสมัครนี้?")) {
      await deleteRegistration(id);
      onRefresh();
    }
  };

  const handleOpenRecordAwardModal = (reg: Registration) => {
    setRecordingReg(reg);
    setSelectedAward('รางวัลชนะเลิศ');
    setCertIdInput(`NWSP-${academicYear}-${reg.activityId.slice(-3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`);
    setScoreInput('');
  };

  const handleSaveResultSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordingReg) return;

    const newResult: CompetitionResult = {
      id: `res-${Date.now()}`,
      academicYear,
      activityId: recordingReg.activityId,
      activityTitle: recordingReg.activityTitle,
      level: recordingReg.level,
      registrationId: recordingReg.id,
      teamName: recordingReg.teamName,
      members: recordingReg.members,
      award: selectedAward,
      certificateId: certIdInput.trim() || undefined,
      score: scoreInput.trim() || undefined,
      updatedAt: new Date().toISOString()
    };

    await saveResult(newResult);
    setRecordingReg(null);
    onRefresh();
    alert(`บันทึกผลการแข่งขันและรหัสเกียรติบัตรเรียบร้อยแล้ว!`);
  };

  const handleDeleteResult = async (id: string) => {
    if (confirm("คุณต้องการลบผลการแข่งขันนี้หรือไม่?")) {
      await deleteResult(id);
      onRefresh();
    }
  };

  const handleUpdateRegSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReg) return;
    await saveRegistration(editingReg);
    setEditingReg(null);
    onRefresh();
    alert("บันทึกการแก้ไขข้อมูลผู้สมัคร (ระดับชั้น/ห้องเรียน) เรียบร้อยแล้ว");
  };

  const currentActivity = activities.find(a => a.id === selectedActivityId);

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Sub tabs switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('applicants')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'applicants'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-500/20'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            1.2.1 จัดการข้อมูลผู้สมัคร ({filteredRegs.length} รายการ)
          </button>

          <button
            onClick={() => setActiveTab('recordResults')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'recordResults'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            1.2.2 ลงผลการแข่งขันแยกรายกิจกรรม 🏆
          </button>
        </div>

        {/* Search */}
        {activeTab === 'applicants' && (
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="ค้นหาชื่อ, รหัส..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full glass-input pl-9 pr-3 py-1.5 rounded-xl text-xs"
            />
          </div>
        )}
      </div>

      {/* TAB 1: Applicants Management */}
      {activeTab === 'applicants' && (
        <div className="space-y-4">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            ข้อมูลรายชื่อผู้สมัครเข้าร่วมแข่งขันทั้งหมดในปีการศึกษา {academicYear}
          </div>

          {filteredRegs.length === 0 ? (
            <div className="glass-panel p-10 text-center rounded-3xl text-slate-500 text-sm">
              ไม่มีข้อมูลผู้สมัครแข่งขันในระบบ
            </div>
          ) : (
            filteredRegs.map((reg) => (
              <div key={reg.id} className="glass-card p-5 rounded-2xl border border-white/80 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                      reg.level === 'ม.ต้น' ? 'bg-sky-100 text-sky-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {reg.level}
                    </span>
                    <span className="font-bold text-slate-800 text-sm sm:text-base">
                      {reg.activityTitle}
                    </span>
                    {reg.teamName && (
                      <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        ชื่อทีม: {reg.teamName}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingReg(reg)}
                      className="px-3 py-1 bg-sky-100 hover:bg-sky-200 text-sky-800 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> แก้ไขชื่อ/ชั้น/ห้อง
                    </button>
                    <button
                      onClick={() => handleDeleteReg(reg.id)}
                      className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> ลบรายการ
                    </button>
                  </div>
                </div>

                {/* Members list */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {reg.members.map((m, idx) => (
                    <div key={idx} className="bg-white/80 p-2.5 rounded-xl border border-slate-200/80 text-xs space-y-0.5">
                      <div className="font-bold text-slate-800">{m.title}{m.fullName}</div>
                      <div className="text-slate-500">รหัส {m.studentId} • ชั้น {m.grade}/{m.room}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: Award Recording */}
      {activeTab === 'recordResults' && (
        <div className="space-y-6">
          <div className="glass-panel p-5 rounded-2xl border border-amber-200/80 space-y-4">
            <div className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-600" />
              เลือกลงผลรางวัลการแข่งขัน: 1. เลือกกิจกรรม ➔ 2. เลือกระดับชั้น ➔ 3. เลือกลงผลรางวัลทีมที่สมัคร
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">1. เลือกกิจกรรมการแข่งขัน:</label>
                <select
                  value={selectedActivityId}
                  onChange={(e) => setSelectedActivityId(e.target.value)}
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-sm font-semibold border-slate-300"
                >
                  {activities.map(act => (
                    <option key={act.id} value={act.id}>{act.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">2. เลือกระดับชั้น:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSelectedLevel('ม.ต้น')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs transition-all ${
                      selectedLevel === 'ม.ต้น'
                        ? 'bg-sky-600 text-white shadow-md'
                        : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    มัธยมศึกษาตอนต้น
                  </button>
                  <button
                    onClick={() => setSelectedLevel('ม.ปลาย')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs transition-all ${
                      selectedLevel === 'ม.ปลาย'
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    มัธยมศึกษาตอนปลาย
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-1">
              <span>รายชื่อทีม/ผู้สมัครที่ลงทะเบียนกิจกรรม "{currentActivity?.title}" ({selectedLevel}):</span>
              <span>รวม {activityRegistrations.length} ทีม</span>
            </div>

            {activityRegistrations.length === 0 ? (
              <div className="glass-panel p-10 text-center rounded-3xl text-slate-500 text-sm">
                ยังไม่มีทีมหรือผู้สมัครในกิจกรรมและระดับชั้นนี้
              </div>
            ) : (
              activityRegistrations.map((reg) => {
                const existingResult = results.find(r => r.registrationId === reg.id && r.academicYear === academicYear);

                return (
                  <div key={reg.id} className="glass-card p-5 rounded-2xl border border-white/80 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <div>
                        {reg.teamName ? (
                          <span className="font-extrabold text-base text-slate-900">
                            ทีม: {reg.teamName}
                          </span>
                        ) : (
                          <span className="font-extrabold text-base text-slate-900">
                            {reg.members[0]?.fullName} (ผู้สมัครเดี่ยว)
                          </span>
                        )}
                        <span className="text-xs text-slate-500 ml-2">
                          (สมาชิก {reg.members.length} คน)
                        </span>
                      </div>

                      {existingResult ? (
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-amber-100 text-amber-900 text-xs font-extrabold rounded-full border border-amber-300">
                            🏆 {existingResult.award} {existingResult.certificateId && `(รหัส: ${existingResult.certificateId})`}
                          </span>
                          <button
                            onClick={() => handleDeleteResult(existingResult.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleOpenRecordAwardModal(reg)}
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                        >
                          <Trophy className="w-4 h-4" /> ลงผลรางวัลและรหัสเกียรติบัตร
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs text-slate-700">
                      {reg.members.map((m, idx) => (
                        <span key={idx} className="bg-white/80 px-2.5 py-1 rounded-lg border border-slate-200">
                          {m.title}{m.fullName} ({m.grade}/{m.room} • รหัส {m.studentId})
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Record Award Result Modal */}
      {recordingReg && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-lg text-slate-900">บันทึกผลรางวัล & รหัสเกียรติบัตร</h3>
              <button onClick={() => setRecordingReg(null)} className="p-1 rounded-full text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-sky-50 p-3 rounded-xl text-xs space-y-1 text-sky-900">
              <div><strong>กิจกรรม:</strong> {recordingReg.activityTitle} ({recordingReg.level})</div>
              {recordingReg.teamName && <div><strong>ทีม:</strong> {recordingReg.teamName}</div>}
              <div><strong>ผู้แข่งขัน:</strong> {recordingReg.members.map(m => m.fullName).join(', ')}</div>
            </div>

            <form onSubmit={handleSaveResultSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">เลือกรางวัลที่ได้รับ *</label>
                <select
                  value={selectedAward}
                  onChange={(e) => setSelectedAward(e.target.value as AwardType)}
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-sm font-semibold border-slate-300"
                >
                  <option value="รางวัลชนะเลิศ">🥇 รางวัลชนะเลิศ</option>
                  <option value="รองชนะเลิศอันดับ 1">🥈 รองชนะเลิศอันดับ 1</option>
                  <option value="รองชนะเลิศอันดับ 2">🥉 รองชนะเลิศอันดับ 2</option>
                  <option value="รางวัลชมเชย">⭐ รางวัลชมเชย</option>
                  <option value="เข้าร่วมการแข่งขัน">🎖️ เข้าร่วมการแข่งขัน</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ป้อนรหัสเกียรติบัตร (Certificate ID Manual):
                </label>
                <input
                  type="text"
                  placeholder="เช่น NWSP-2569-001"
                  value={certIdInput}
                  onChange={(e) => setCertIdInput(e.target.value)}
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-sm font-mono tracking-wider font-bold text-purple-700 border-purple-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">คะแนน (ถ้ามี)</label>
                <input
                  type="text"
                  placeholder="เช่น 48/50 หรือ 1.52 เมตร"
                  value={scoreInput}
                  onChange={(e) => setScoreInput(e.target.value)}
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-sm border-slate-300"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRecordingReg(null)}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-bold shadow-md"
                >
                  บันทึกผลรางวัล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Registration Modal (Includes Grade & Room Editing) */}
      {editingReg && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-lg text-slate-900">แก้ไขข้อมูลผู้สมัคร (ชื่อ-สกุล, ชั้น, ห้อง)</h3>
              <button onClick={() => setEditingReg(null)} className="p-1 rounded-full text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateRegSubmit} className="space-y-4">
              {editingReg.teamName !== undefined && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อทีม</label>
                  <input
                    type="text"
                    value={editingReg.teamName}
                    onChange={(e) => setEditingReg({ ...editingReg, teamName: e.target.value })}
                    className="w-full glass-input px-3.5 py-2 rounded-xl text-sm font-semibold border-slate-300"
                  />
                </div>
              )}

              <div className="space-y-4">
                <label className="block text-xs font-bold text-slate-700">สมาชิกในทีม ({editingReg.members.length} คน)</label>
                {editingReg.members.map((m, idx) => (
                  <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 text-xs">
                    <div className="font-bold text-sky-800 border-b pb-1">คนที่ {idx + 1}</div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-600 mb-1">รหัสนักเรียน (5 หลัก)</label>
                        <input
                          type="text"
                          maxLength={5}
                          value={m.studentId}
                          onChange={(e) => {
                            const updated = [...editingReg.members];
                            updated[idx].studentId = e.target.value;
                            setEditingReg({ ...editingReg, members: updated });
                          }}
                          className="glass-input p-2 rounded-lg font-mono w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-600 mb-1">คำนำหน้าชื่อ</label>
                        <select
                          value={m.title}
                          onChange={(e) => {
                            const updated = [...editingReg.members];
                            updated[idx].title = e.target.value as StudentTitle;
                            setEditingReg({ ...editingReg, members: updated });
                          }}
                          className="glass-input p-2 rounded-lg w-full"
                        >
                          <option value="เด็กชาย">เด็กชาย</option>
                          <option value="เด็กหญิง">เด็กหญิง</option>
                          <option value="นาย">นาย</option>
                          <option value="นางสาว">นางสาว</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-slate-600 mb-1">ชื่อ - นามสกุล</label>
                        <input
                          type="text"
                          value={m.fullName}
                          onChange={(e) => {
                            const updated = [...editingReg.members];
                            updated[idx].fullName = e.target.value;
                            setEditingReg({ ...editingReg, members: updated });
                          }}
                          className="glass-input p-2 rounded-lg w-full font-medium"
                        />
                      </div>

                      {/* Requirement: Edit Grade (ระดับชั้น) */}
                      <div>
                        <label className="block text-slate-600 mb-1">ระดับชั้น</label>
                        <select
                          value={m.grade}
                          onChange={(e) => {
                            const updated = [...editingReg.members];
                            updated[idx].grade = e.target.value as StudentGrade;
                            setEditingReg({ ...editingReg, members: updated });
                          }}
                          className="glass-input p-2 rounded-lg w-full font-bold text-sky-800"
                        >
                          <option value="ม.1">ม.1</option>
                          <option value="ม.2">ม.2</option>
                          <option value="ม.3">ม.3</option>
                          <option value="ม.4">ม.4</option>
                          <option value="ม.5">ม.5</option>
                          <option value="ม.6">ม.6</option>
                        </select>
                      </div>

                      {/* Requirement: Edit Room (ห้องเรียน 1 - 5) */}
                      <div>
                        <label className="block text-slate-600 mb-1">ห้องเรียน</label>
                        <select
                          value={m.room}
                          onChange={(e) => {
                            const updated = [...editingReg.members];
                            updated[idx].room = parseInt(e.target.value);
                            setEditingReg({ ...editingReg, members: updated });
                          }}
                          className="glass-input p-2 rounded-lg w-full font-bold text-purple-800"
                        >
                          <option value={1}>ห้อง 1</option>
                          <option value={2}>ห้อง 2</option>
                          <option value={3}>ห้อง 3</option>
                          <option value={4}>ห้อง 4</option>
                          <option value={5}>ห้อง 5</option>
                        </select>
                      </div>

                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingReg(null)}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-sky-600 text-white rounded-xl text-sm font-bold shadow-md"
                >
                  บันทึกการแก้ไข
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
