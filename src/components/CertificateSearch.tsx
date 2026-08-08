import React, { useState, useRef } from 'react';
import { CompetitionResult, CertificateConfig, Activity } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  Award, 
  Search, 
  Download, 
  FileText,
  Loader2,
  Sparkles,
  Eye,
  X,
  FileImage,
  Calendar
} from 'lucide-react';

interface CertificateSearchProps {
  results: CompetitionResult[];
  activities: Activity[];
  certificateConfigs: CertificateConfig[];
  academicYear: string;
}

export const CertificateSearch: React.FC<CertificateSearchProps> = ({
  results,
  activities,
  certificateConfigs,
  academicYear
}) => {
  const [selectedSearchYear, setSelectedSearchYear] = useState<string>(academicYear);
  const [searchTerm, setSearchTerm] = useState('');
  const [downloadingFormat, setDownloadingFormat] = useState<'pdf' | 'png' | null>(null);
  
  // Interactive Preview Modal State
  const [previewCert, setPreviewCert] = useState<{
    result: CompetitionResult;
    studentName: string;
    config?: CertificateConfig;
  } | null>(null);

  const printRef = useRef<HTMLDivElement>(null);

  // Years options list (e.g. 2568, 2569, 2570, 2571, 2572)
  const yearOptions = ['2568', '2569', '2570', '2571', '2572'];
  if (!yearOptions.includes(academicYear)) {
    yearOptions.push(academicYear);
  }

  // Search by student name or surname within the selected academic year
  const matchingCertificates: {
    result: CompetitionResult;
    studentName: string;
    studentTitle: string;
    studentGrade: string;
    studentRoom: number;
    studentId: string;
  }[] = [];

  const searchClean = searchTerm.trim().toLowerCase();

  if (searchClean.length >= 2) {
    results.forEach(res => {
      if (res.academicYear === selectedSearchYear) {
        res.members.forEach(member => {
          const full = `${member.title}${member.fullName}`.toLowerCase();
          const nameOnly = member.fullName.toLowerCase();
          if (full.includes(searchClean) || nameOnly.includes(searchClean) || member.studentId.includes(searchClean)) {
            matchingCertificates.push({
              result: res,
              studentName: `${member.title}${member.fullName}`,
              studentTitle: member.title,
              studentGrade: member.grade,
              studentRoom: member.room,
              studentId: member.studentId
            });
          }
        });
      }
    });
  }

  // Font family helper
  const getFontClass = (fontName?: string) => {
    switch (fontName) {
      case 'Charm': return 'font-charm';
      case 'Chonburi': return 'font-chonburi';
      case 'Mali': return 'font-mali';
      case 'Niramit': return 'font-niramit';
      case 'Prompt': return 'font-prompt';
      default: return 'font-sarabun';
    }
  };

  // Open Preview Modal
  const handleOpenPreview = (res: CompetitionResult, studentName: string) => {
    const config = certificateConfigs.find(
      c => c.activityId === res.activityId && c.level === res.level && c.academicYear === res.academicYear
    );
    setPreviewCert({ result: res, studentName, config });
  };

  // Export as PDF or PNG
  const handleExportFile = async (format: 'pdf' | 'png') => {
    if (!printRef.current || !previewCert) return;

    setDownloadingFormat(format);

    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const fileName = `เกียรติบัตร_${previewCert.studentName}_${previewCert.result.activityTitle}`;

      if (format === 'png') {
        const link = document.createElement('a');
        link.download = `${fileName}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } else {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${fileName}.pdf`);
      }
    } catch (err) {
      console.error("Export failed:", err);
      alert("เกิดข้อผิดพลาดในการดาวน์โหลดเอกสาร");
    } finally {
      setDownloadingFormat(null);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/80 shadow-md">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold">
            <Award className="w-4 h-4 text-purple-600" />
            ระบบออกเกียรติบัตรออนไลน์ (E-Certificate)
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">
            ค้นหาและดาวน์โหลดเกียรติบัตร
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            พิมพ์ชื่อ นามสกุล หรือรหัสนักเรียน เพื่อดูตัวอย่างและดาวน์โหลดเกียรติบัตร (PDF หรือ PNG)
          </p>

          {/* Academic Year Selector & Search Box */}
          <div className="pt-2 max-w-xl mx-auto space-y-3">
            
            {/* Requirement: Select Academic Year First */}
            <div className="flex items-center justify-center gap-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-purple-600" />
                เลือกปีการศึกษา:
              </label>
              <select
                value={selectedSearchYear}
                onChange={(e) => setSelectedSearchYear(e.target.value)}
                className="glass-input px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold text-purple-900 border-purple-300"
              >
                {yearOptions.map(y => (
                  <option key={y} value={y}>ปีการศึกษา {y}</option>
                ))}
              </select>
            </div>

            {/* Search Input Box */}
            <div className="relative glass-panel rounded-2xl p-2 flex items-center gap-2 border border-purple-200 shadow-xl shadow-purple-500/10">
              <Search className="w-5 h-5 text-purple-500 ml-3 shrink-0" />
              <input
                type="text"
                placeholder="พิมพ์ชื่อ หรือ นามสกุล เช่น สมชาย, รุ่งเรือง, 12345..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent border-0 focus:outline-none text-slate-800 text-sm sm:text-base placeholder:text-slate-400 py-2 font-medium"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-xs px-3 py-1.5 rounded-xl bg-slate-200 text-slate-600 hover:bg-slate-300 font-bold"
                >
                  ล้างคำค้น
                </button>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Search Results Grid */}
      {!searchTerm.trim() ? (
        <div className="glass-panel p-12 text-center rounded-3xl space-y-3 max-w-2xl mx-auto">
          <Search className="w-12 h-12 text-purple-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-700">พิมพ์ชื่อหรือนามสกุลเพื่อค้นหาเกียรติบัตร (ปีการศึกษา {selectedSearchYear})</h3>
          <p className="text-xs text-slate-500">
            ระบบจะแสดงรายการเกียรติบัตรที่ได้รับ สามารถกดดูตัวอย่าง Preview และเลือกดาวน์โหลดเป็น PDF หรือ PNG ได้ทันที
          </p>
        </div>
      ) : matchingCertificates.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-3xl space-y-3 max-w-2xl mx-auto">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-700">ไม่พบเกียรติบัตรสำหรับคำค้นหา "{searchTerm}" ในปีการศึกษา {selectedSearchYear}</h3>
          <p className="text-xs text-slate-500">
            ลองสลับปีการศึกษา หรือตรวจสอบการสะกดชื่อ-นามสกุลอีกครั้ง
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2">
            พบเกียรติบัตรทั้งหมด {matchingCertificates.length} รายการ (ปีการศึกษา {selectedSearchYear})
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matchingCertificates.map((item, idx) => {
              const itemKey = `${item.result.id}-${item.studentId}-${idx}`;

              return (
                <div key={itemKey} className="glass-card rounded-3xl p-6 border border-white/80 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                        {item.result.level}
                      </span>
                      <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
                        {item.result.award}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-lg text-slate-900">{item.studentName}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        ชั้น {item.studentGrade}/{item.studentRoom} • รหัสนักเรียน {item.studentId}
                      </p>
                    </div>

                    <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-200/60 text-xs space-y-1 text-slate-700">
                      <div><strong>กิจกรรม:</strong> {item.result.activityTitle}</div>
                      {item.result.teamName && (
                        <div><strong>ทีม:</strong> {item.result.teamName}</div>
                      )}
                      <div><strong>ปีการศึกษา:</strong> {item.result.academicYear}</div>
                      {item.result.certificateId && (
                        <div className="font-mono text-purple-700 font-bold"><strong>รหัสเกียรติบัตร:</strong> {item.result.certificateId}</div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenPreview(item.result, item.studentName)}
                    className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 text-white font-bold rounded-2xl shadow-md shadow-purple-500/20 hover:shadow-purple-500/35 transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    ดูตัวอย่างเกียรติบัตร & เลือกดาวน์โหลด (Preview)
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Large Glassmorphic Preview Modal */}
      {previewCert && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn overflow-y-auto">
          <div className="bg-white/95 rounded-3xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl border border-white/80 space-y-5 relative my-auto">
            
            <button
              onClick={() => setPreviewCert(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors z-20"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                ตัวอย่างเกียรติบัตรออนไลน์ (E-Certificate Preview)
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                {previewCert.studentName}
              </h3>
              <p className="text-xs text-slate-500">
                {previewCert.result.activityTitle} ({previewCert.result.level})
              </p>
            </div>

            {/* Live Render Container */}
            <div className="glass-panel p-2.5 rounded-2xl border border-slate-200 shadow-lg overflow-hidden flex justify-center bg-slate-100">
              <div
                ref={printRef}
                className={`w-full max-w-[800px] aspect-[1.414/1] bg-white relative rounded-xl overflow-hidden shadow-md flex flex-col items-center justify-between p-6 sm:p-8 text-slate-900 select-none ${getFontClass(previewCert.config?.fontFamily)}`}
                style={{
                  backgroundImage: previewCert.config?.bgImageUrl 
                    ? `url(${previewCert.config.bgImageUrl})` 
                    : 'radial-gradient(circle at 50% 50%, #ffffff 0%, #f0f9ff 100%)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {!previewCert.config?.bgImageUrl && (
                  <div className="absolute inset-3 border-2 border-dashed border-sky-300 rounded-xl pointer-events-none" />
                )}

                {/* Header Logo */}
                <div className="text-center pt-2 space-y-1 relative z-10">
                  <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-purple-600 rounded-xl mx-auto p-0.5 shadow-sm">
                    <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center text-sky-600 font-extrabold text-sm">
                      NWSP
                    </div>
                  </div>
                  <h1 className="text-sm sm:text-base font-bold text-slate-800 tracking-wide font-sans">
                    โรงเรียนหนองวัวซอพิทยาคม
                  </h1>
                  <p className="text-xs font-medium text-slate-600">
                    ขอมอบเกียรติบัตรฉบับนี้เพื่อแสดงว่า
                  </p>
                </div>

                {/* Student Name */}
                <div className="text-center my-2 relative z-10 space-y-1">
                  <h2 className="text-xl sm:text-3xl font-extrabold text-sky-900 tracking-wide">
                    {previewCert.studentName}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-700 max-w-lg mx-auto leading-relaxed">
                    {previewCert.result.award === 'เข้าร่วมการแข่งขัน'
                      ? `ได้เข้าร่วม ${previewCert.result.activityTitle} ${previewCert.result.level === 'ม.ต้น' ? 'ระดับชั้นมัธยมศึกษาตอนต้น' : 'ระดับชั้นมัธยมศึกษาตอนปลาย'}`
                      : `ได้รับ ${previewCert.result.award} ใน ${previewCert.result.activityTitle} ${previewCert.result.level === 'ม.ต้น' ? 'ระดับชั้นมัธยมศึกษาตอนต้น' : 'ระดับชั้นมัธยมศึกษาตอนปลาย'}`}
                    <br />
                    <span className="text-xs text-slate-600 block mt-1">
                      เนื่องในงานสัปดาห์วิทยาศาสตร์ ประจำปีการศึกษา {previewCert.result.academicYear}
                    </span>
                  </p>
                </div>

                {/* Footer Signatures */}
                <div className="w-full flex items-end justify-between px-4 pb-2 relative z-10 text-[10px] sm:text-xs text-slate-600">
                  <div className="text-left space-y-0.5">
                    <div>รหัสเกียรติบัตร: {previewCert.result.certificateId || `NWSP-${previewCert.result.academicYear}-${previewCert.result.id.slice(0, 6).toUpperCase()}`}</div>
                  </div>

                  <div className="text-center space-y-0.5">
                    <div className="w-32 border-b border-slate-400 mx-auto pb-0.5 font-serif text-slate-700 italic">
                      (นายณัฐกิจ คำภูธร)
                    </div>
                    <div className="font-semibold text-slate-800">ประธานกลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี</div>
                  </div>
                </div>

              </div>
            </div>

            {/* Action Buttons: Download PDF or Download PNG */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setPreviewCert(null)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-100 transition-colors"
              >
                ปิดหน้าต่าง
              </button>

              <button
                onClick={() => handleExportFile('png')}
                disabled={downloadingFormat !== null}
                className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {downloadingFormat === 'png' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileImage className="w-4 h-4" />
                )}
                ดาวน์โหลดเป็นไฟล์ PNG (ภาพคมชัด)
              </button>

              <button
                onClick={() => handleExportFile('pdf')}
                disabled={downloadingFormat !== null}
                className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 text-white font-bold rounded-xl text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {downloadingFormat === 'pdf' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                ดาวน์โหลดเป็นไฟล์ PDF (สำหรับพิมพ์)
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
