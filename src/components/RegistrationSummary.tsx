import React, { useState, useRef } from 'react';
import { Registration, Activity } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  Users, 
  Search, 
  Printer, 
  Loader2
} from 'lucide-react';

interface RegistrationSummaryProps {
  registrations: Registration[];
  activities: Activity[];
  academicYear: string;
}

export const RegistrationSummary: React.FC<RegistrationSummaryProps> = ({
  registrations,
  activities,
  academicYear
}) => {
  const [selectedActivityId, setSelectedActivityId] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [exportingActivityId, setExportingActivityId] = useState<string | null>(null);

  const [printData, setPrintData] = useState<{
    activityTitle: string;
    level: string;
    teacherNames: string;
    teamsList: {
      teamName?: string;
      members: {
        studentId: string;
        fullName: string;
        grade: string;
        room: number;
      }[];
    }[];
  } | null>(null);

  const printSheetRef = useRef<HTMLDivElement>(null);

  // Filter registrations
  const filteredRegistrations = registrations.filter(reg => {
    const matchesYear = reg.academicYear === academicYear;
    const matchesActivity = selectedActivityId === 'all' || reg.activityId === selectedActivityId;
    const matchesLevel = selectedLevel === 'all' || reg.level === selectedLevel;
    
    const searchClean = searchTerm.trim().toLowerCase();
    const matchesSearch = !searchClean || 
      reg.activityTitle.toLowerCase().includes(searchClean) ||
      (reg.teamName && reg.teamName.toLowerCase().includes(searchClean)) ||
      reg.members.some(m => 
        m.fullName.toLowerCase().includes(searchClean) || 
        m.studentId.includes(searchClean)
      );

    return matchesYear && matchesActivity && matchesLevel && matchesSearch;
  });

  // Stats
  const totalJuniorTeams = registrations.filter(r => r.academicYear === academicYear && r.level === 'ม.ต้น').length;
  const totalSeniorTeams = registrations.filter(r => r.academicYear === academicYear && r.level === 'ม.ปลาย').length;

  const totalJuniorStudents = registrations
    .filter(r => r.academicYear === academicYear && r.level === 'ม.ต้น')
    .reduce((acc, r) => acc + r.members.length, 0);

  const totalSeniorStudents = registrations
    .filter(r => r.academicYear === academicYear && r.level === 'ม.ปลาย')
    .reduce((acc, r) => acc + r.members.length, 0);

  // Export Master Printable PDF Sign-in Sheet per Activity & Level (Sorted Chronologically Ascending by registeredAt)
  const handleExportSignInSheet = async (actId: string, levelFilter: string) => {
    const act = activities.find(a => a.id === actId);
    if (!act) return;

    setExportingActivityId(`${actId}-${levelFilter}`);

    const targetRegs = registrations.filter(
      r => r.academicYear === academicYear && r.activityId === actId && (levelFilter === 'all' || r.level === levelFilter)
    );

    // Requirement: Sort chronologically ascending by registration date & time (First registered = First in PDF)
    const sortedRegs = [...targetRegs].sort(
      (a, b) => new Date(a.registeredAt).getTime() - new Date(b.registeredAt).getTime()
    );

    const teamsList = sortedRegs.map(reg => ({
      teamName: reg.teamName,
      members: reg.members.map(m => ({
        studentId: m.studentId,
        fullName: `${m.title}${m.fullName}`,
        grade: m.grade,
        room: m.room
      }))
    }));

    setPrintData({
      activityTitle: act.title,
      level: levelFilter === 'all' ? 'มัธยมศึกษาตอนต้นและตอนปลาย' : levelFilter,
      teacherNames: act.teachers ? act.teachers.join(', ') : 'กลุ่มสาระวิทยาศาสตร์และเทคโนโลยี',
      teamsList
    });

    setTimeout(async () => {
      if (!printSheetRef.current) {
        setExportingActivityId(null);
        return;
      }

      try {
        const canvas = await html2canvas(printSheetRef.current, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`ใบลงชื่อและลงผลรางวัล_${act.title}_${levelFilter}.pdf`);
      } catch (err) {
        console.error("PDF export failed:", err);
        alert("เกิดข้อผิดพลาดในการสร้างไฟล์ PDF");
      } finally {
        setExportingActivityId(null);
      }
    }, 400);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/80 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold mb-2">
              <Users className="w-3.5 h-3.5" />
              สรุปยอดผู้เข้าแข่งขัน ปีการศึกษา {academicYear}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              สรุปรายชื่อการรับสมัครการแข่งขัน
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              ตรวจสอบรายชื่อผู้สมัคร พร้อมระบบส่งออกใบลายเซ็นเข้าแข่งขันและลงผลรางวัลสำหรับคุณครู
            </p>
          </div>

          {/* Quick Counter Summary Cards */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 shrink-0">
            <div className="bg-gradient-to-br from-sky-500 to-cyan-600 text-white p-4 rounded-2xl shadow-md">
              <div className="text-xs font-bold text-sky-100 uppercase tracking-wider">มัธยมศึกษาตอนต้น</div>
              <div className="text-2xl sm:text-3xl font-black mt-1">{totalJuniorTeams} <span className="text-sm font-normal">ทีม</span></div>
              <div className="text-xs text-sky-100 mt-0.5 font-medium">{totalJuniorStudents} ผู้เข้าแข่งขัน</div>
            </div>

            <div className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white p-4 rounded-2xl shadow-md">
              <div className="text-xs font-bold text-purple-100 uppercase tracking-wider">มัธยมศึกษาตอนปลาย</div>
              <div className="text-2xl sm:text-3xl font-black mt-1">{totalSeniorTeams} <span className="text-sm font-normal">ทีม</span></div>
              <div className="text-xs text-purple-100 mt-0.5 font-medium">{totalSeniorStudents} ผู้เข้าแข่งขัน</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="พิมพ์ชื่อ-สกุล, รหัสนักเรียน, ชื่อทีม..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full glass-input pl-10 pr-4 py-2 rounded-xl text-sm border-slate-300"
            />
          </div>

          {/* Activity Filter */}
          <div>
            <select
              value={selectedActivityId}
              onChange={(e) => setSelectedActivityId(e.target.value)}
              className="w-full glass-input px-3.5 py-2 rounded-xl text-sm border-slate-300 font-semibold"
            >
              <option value="all">-- เลือกส่งออกเป็นกิจกรรม --</option>
              {activities.map(act => (
                <option key={act.id} value={act.id}>{act.title}</option>
              ))}
            </select>
          </div>

          {/* Level Filter */}
          <div>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full glass-input px-3.5 py-2 rounded-xl text-sm border-slate-300 font-semibold"
            >
              <option value="all">-- ทุกระดับชั้น (ม.ต้น / ม.ปลาย) --</option>
              <option value="ม.ต้น">มัธยมศึกษาตอนต้น (ม.1 - ม.3)</option>
              <option value="ม.ปลาย">มัธยมศึกษาตอนปลาย (ม.4 - ม.6)</option>
            </select>
          </div>

        </div>

        {/* Printable PDF Sign-in Sheet Actions */}
        {selectedActivityId !== 'all' && (
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/60">
            <span className="text-xs font-bold text-slate-700">
              🖨️ ส่งออกใบลายมือชื่อและลงผลรางวัลรวมทุกทีมสำหรับกิจกรรมนี้:
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleExportSignInSheet(selectedActivityId, 'ม.ต้น')}
                disabled={exportingActivityId === `${selectedActivityId}-ม.ต้น`}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs shadow-sm transition-all flex items-center gap-1.5"
              >
                {exportingActivityId === `${selectedActivityId}-ม.ต้น` ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Printer className="w-3.5 h-3.5" />
                )}
                ส่งออกใบเซ็นชื่อ ม.ต้น (PDF รวมทุกทีม)
              </button>

              <button
                onClick={() => handleExportSignInSheet(selectedActivityId, 'ม.ปลาย')}
                disabled={exportingActivityId === `${selectedActivityId}-ม.ปลาย`}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-sm transition-all flex items-center gap-1.5"
              >
                {exportingActivityId === `${selectedActivityId}-ม.ปลาย` ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Printer className="w-3.5 h-3.5" />
                )}
                ส่งออกใบเซ็นชื่อ ม.ปลาย (PDF รวมทุกทีม)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Registrations List / Cards */}
      {filteredRegistrations.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-3xl space-y-3">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-700">ไม่พบรายการผู้สมัครแข่งขัน</h3>
          <p className="text-xs sm:text-sm text-slate-500">
            ยังไม่มีข้อมูลผู้สมัครแข่งขันตรงตามเงื่อนไขค้นหา
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>รายการสมัครทั้งหมด ({filteredRegistrations.length} รายการ)</span>
          </div>

          {filteredRegistrations.map((reg) => (
            <div key={reg.id} className="glass-card rounded-2xl p-5 border border-white/80 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    reg.level === 'ม.ต้น' ? 'bg-sky-100 text-sky-800' : 'bg-purple-100 text-purple-800'
                  }`}>
                    {reg.level}
                  </span>
                  <h4 className="font-bold text-base text-slate-800">
                    {reg.activityTitle}
                  </h4>
                  {reg.teamName && (
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-200">
                      ชื่อทีม: {reg.teamName}
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-400">
                  ลงทะเบียนเมื่อ {new Date(reg.registeredAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {/* Members Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-100 text-xs">
                      <th className="py-2 px-3 font-semibold">ลำดับ</th>
                      <th className="py-2 px-3 font-semibold">รหัสนักเรียน</th>
                      <th className="py-2 px-3 font-semibold">ชื่อ - นามสกุล</th>
                      <th className="py-2 px-3 font-semibold">ระดับชั้น/ห้อง</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reg.members.map((m, mIdx) => (
                      <tr key={mIdx} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 font-semibold text-slate-400">{mIdx + 1}</td>
                        <td className="py-2 px-3 font-mono text-slate-700 font-bold">{m.studentId}</td>
                        <td className="py-2 px-3 font-medium text-slate-900">
                          {m.title}{m.fullName}
                        </td>
                        <td className="py-2 px-3 font-medium text-slate-700">
                          <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-semibold">
                            {m.grade}/{m.room}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Offscreen Printable Sign-in Sheet Renderer (Chronological Order + Team Indexing) */}
      {printData && (
        <div className="fixed top-[-9999px] left-[-9999px] pointer-events-none">
          <div
            ref={printSheetRef}
            className="w-[794px] min-h-[1123px] bg-white p-10 text-slate-900 font-sarabun space-y-6"
          >
            {/* School Header */}
            <div className="text-center space-y-1.5 border-b-2 border-slate-800 pb-4">
              <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">
                ใบบันทึกการลงชื่อเข้าแข่งขันและลงผลรางวัล
              </h1>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                กิจกรรม{printData.activityTitle} ({printData.level})
              </h2>
              <h3 className="text-sm font-semibold text-slate-700">
                โรงเรียนหนองวัวซอพิทยาคม • ปีการศึกษา {academicYear}
              </h3>
              <div className="text-xs text-slate-600 font-medium">
                <strong>ครูผู้ดูแลกิจกรรม:</strong> {printData.teacherNames}
              </div>
            </div>

            {/* Attendance Table with Chronological Team Sequence Indexing (1, 2, 3...) */}
            <table className="w-full border-collapse border border-slate-400 text-xs font-sarabun">
              <thead>
                <tr className="bg-slate-100 text-center font-bold border-b border-slate-400">
                  <th className="border border-slate-400 py-2 px-1 w-10">ลำดับ</th>
                  <th className="border border-slate-400 py-2 px-2 w-24">ชื่อทีม / ประเภท</th>
                  <th className="border border-slate-400 py-2 px-1 w-14">รหัส</th>
                  <th className="border border-slate-400 py-2 px-3 text-left">ชื่อ - นามสกุล ผู้เข้าแข่งขัน</th>
                  <th className="border border-slate-400 py-2 px-1 w-14">ชั้น/ห้อง</th>
                  <th className="border border-slate-400 py-2 px-2 w-28 text-center">ลายมือชื่อ</th>
                  <th className="border border-slate-400 py-2 px-1 w-20 text-center">คะแนนของทีม</th>
                  <th className="border border-slate-400 py-2 px-1 w-20 text-center">รางวัล</th>
                </tr>
              </thead>
              <tbody>
                {printData.teamsList.map((team, tIdx) => {
                  const rowCount = team.members.length;
                  return team.members.map((m, mIdx) => {
                    return (
                      <tr key={`${tIdx}-${mIdx}`} className="border-b border-slate-300">
                        
                        {/* Merged Chronological Team Sequence Index (สมัครก่อนอยู่อันดับ 1, 2, 3...) */}
                        {mIdx === 0 && (
                          <td
                            rowSpan={rowCount}
                            className="border border-slate-400 py-2 text-center font-bold align-middle bg-slate-50/50"
                          >
                            {tIdx + 1}
                          </td>
                        )}

                        {/* Merged Team Name Cell */}
                        {mIdx === 0 && (
                          <td
                            rowSpan={rowCount}
                            className="border border-slate-400 py-2 px-2 text-center font-bold bg-slate-50/50 align-middle"
                          >
                            {team.teamName || 'ประเภทเดี่ยว'}
                          </td>
                        )}

                        <td className="border border-slate-400 py-2 text-center font-mono">{m.studentId}</td>
                        <td className="border border-slate-400 py-2 px-3 font-semibold">{m.fullName}</td>
                        <td className="border border-slate-400 py-2 text-center">{m.grade}/{m.room}</td>

                        {/* Individual Dotted Line for Signature for EVERY student */}
                        <td className="border border-slate-400 py-2 px-1 text-center text-slate-300 font-light">
                          ...............................
                        </td>

                        {/* Merged Team Score Cell */}
                        {mIdx === 0 && (
                          <td
                            rowSpan={rowCount}
                            className="border border-slate-400 py-2 px-1 text-center text-slate-400 font-light align-middle"
                          >
                            .............
                          </td>
                        )}

                        {/* Merged Team Award Cell */}
                        {mIdx === 0 && (
                          <td
                            rowSpan={rowCount}
                            className="border border-slate-400 py-2 px-1 text-center text-slate-400 font-light align-middle"
                          >
                            .............
                          </td>
                        )}
                      </tr>
                    );
                  });
                })}
              </tbody>
            </table>

            {/* Footer Signature Box for Supervising Teacher */}
            <div className="pt-8 flex justify-end">
              <div className="text-center space-y-2 text-xs">
                <div>ลงชื่อ..........................................................กรรมการผู้คุมการแข่งขัน</div>
                <div>( {printData.teacherNames.split(',')[0]} )</div>
                <div className="text-slate-500">วันที่............/............/............</div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
