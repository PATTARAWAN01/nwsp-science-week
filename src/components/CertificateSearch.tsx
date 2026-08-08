import React, { useState, useRef } from 'react';
import { CompetitionResult, CertificateConfig, Activity } from '../types';
import { ensureFontLoaded } from '../services/storage';
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
      c => c.activityId === res.activityId && (!res.academicYear || c.academicYear === res.academicYear)
    ) || certificateConfigs.find(
      c => c.activityId === res.activityId
    ) || certificateConfigs[0];
    setPreviewCert({ result: res, studentName, config });
  };

  // Helper for Award Text
  const getFullAwardText = (awardStr: string) => {
    if (awardStr === 'รางวัลชนะเลิศ') return 'ได้รับรางวัลชนะเลิศ';
    if (awardStr === 'รางวัลรองชนะเลิศอันดับ 1') return 'ได้รับรางวัลรองชนะเลิศอันดับ 1';
    if (awardStr === 'รางวัลรองชนะเลิศอันดับ 2') return 'ได้รับรางวัลรองชนะเลิศอันดับ 2';
    if (awardStr === 'รางวัลชมเชย') return 'ได้รับรางวัลชมเชย';
    if (awardStr === 'เข้าร่วมการแข่งขัน') return 'ได้เข้าร่วมการแข่งขัน';
    if (awardStr.startsWith('ได้รับ') || awardStr.startsWith('ได้เข้าร่วม')) return awardStr;
    return `ได้รับ${awardStr}`;
  };

  // Direct Canvas 2D Renderer for 100% Reliable PDF/PNG Exports
  const generateCertificateCanvas2D = async (
    item: {
      studentName: string;
      award: string;
      activityTitle: string;
      level: string;
      certificateId: string;
      academicYear: string;
    },
    config: CertificateConfig | null
  ): Promise<HTMLCanvasElement> => {
    const canvas = document.createElement('canvas');
    canvas.width = 2000;
    canvas.height = 1414;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let bgLoaded = false;
    if (config?.bgImageUrl) {
      try {
        const img = new Image();
        if (config.bgImageUrl.startsWith('http://') || config.bgImageUrl.startsWith('https://')) {
          img.crossOrigin = 'anonymous';
        }
        img.src = config.bgImageUrl;
        await new Promise<void>((resolve) => {
          img.onload = () => {
            try {
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              bgLoaded = true;
            } catch (e) {
              console.warn("drawImage failed:", e);
            }
            resolve();
          };
          img.onerror = () => resolve();
        });
      } catch (e) {
        console.warn("Bg image load exception:", e);
      }
    }

    if (!bgLoaded) {
      const grad = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width / 2
      );
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(1, '#f0f9ff');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 6;
      ctx.setLineDash([16, 12]);
      ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);
      ctx.setLineDash([]);
    }

    const fontFamily = config?.fontFamily || 'Sarabun';
    const cleanFontName = fontFamily.replace(/["']/g, '').trim();
    const fontSpecifier = `'${cleanFontName}'`;

    const getCanvasFont = (weight: string, size: number) => {
      const w = weight === 'bold' ? '700' : (weight || '400');
      return `${w} ${size}px ${fontSpecifier}, Sarabun, sans-serif`;
    };

    // Ensure WebFont binary is 100% loaded in browser memory before drawing page 1
    await ensureFontLoaded(fontFamily);

    const drawTextAutoFit = (
      text: string,
      targetXPercent: number,
      targetYPercent: number,
      initialFontSize: number,
      color: string,
      fontWeight: string,
      maxAvailableWidth: number = canvas.width * 0.85
    ) => {
      let size = Math.round(initialFontSize * 1.7);
      ctx.font = getCanvasFont(fontWeight, size);
      let textWidth = ctx.measureText(text).width;
      while (textWidth > maxAvailableWidth && size > 16) {
        size -= 2;
        ctx.font = getCanvasFont(fontWeight, size);
        textWidth = ctx.measureText(text).width;
      }
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, (targetXPercent / 100) * canvas.width, (targetYPercent / 100) * canvas.height);
    };

    // 1. Student Name
    if (config?.visibleElements?.studentName ?? true) {
      const pos = config?.positions?.studentName || { x: 50, y: 42, fontSize: 34, color: '#0c4a6e', fontWeight: 'bold' };
      drawTextAutoFit(item.studentName, pos.x || 50, pos.y || 42, pos.fontSize || 34, pos.color || '#0c4a6e', pos.fontWeight || 'bold');
    }

    // 2. Award Text
    if (config?.visibleElements?.award ?? true) {
      const pos = config?.positions?.award || { x: 50, y: 52, fontSize: 26, color: '#b45309', fontWeight: 'bold' };
      drawTextAutoFit(getFullAwardText(item.award), pos.x || 50, pos.y || 52, pos.fontSize || 26, pos.color || '#b45309', pos.fontWeight || 'bold');
    }

    // 3. Activity Name & Level
    if (config?.visibleElements?.activityName ?? true) {
      const pos = config?.positions?.activityName || { x: 50, y: 60, fontSize: 22, color: '#334155', fontWeight: 'bold' };
      const levelStr = item.level === 'ม.ต้น' ? 'ระดับชั้นมัธยมศึกษาตอนต้น' : 'ระดับชั้นมัธยมศึกษาตอนปลาย';
      drawTextAutoFit(`${item.activityTitle} ${levelStr}`, pos.x || 50, pos.y || 60, pos.fontSize || 22, pos.color || '#334155', pos.fontWeight || 'bold');
    }

    // 4. Certificate ID
    if (config?.visibleElements?.certId ?? true) {
      const pos = config?.positions?.certId || { x: 75, y: 88, fontSize: 14, color: '#64748b', fontWeight: 'normal' };
      const scaledSize = Math.round(pos.fontSize * 1.6);
      ctx.font = getCanvasFont(pos.fontWeight || 'normal', scaledSize);
      ctx.fillStyle = pos.color || '#64748b';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(item.certificateId, (pos.x / 100) * canvas.width, (pos.y / 100) * canvas.height);
    }

    if (!bgLoaded) {
      ctx.font = 'italic 22px serif';
      ctx.fillStyle = '#334155';
      ctx.textAlign = 'center';
      ctx.fillText('(นายณัฐกิจ คำภูธร)', canvas.width * 0.82, canvas.height * 0.84);

      ctx.font = 'bold 18px Sarabun, sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.fillText('ประธานกลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี', canvas.width * 0.82, canvas.height * 0.88);
    }

    return canvas;
  };

  // Export as PDF or PNG
  const handleExportFile = async (format: 'pdf' | 'png') => {
    if (!previewCert) return;

    setDownloadingFormat(format);

    try {
      const item = {
        studentName: previewCert.studentName,
        award: previewCert.result.award,
        activityTitle: previewCert.result.activityTitle,
        level: previewCert.result.level,
        certificateId: previewCert.result.certificateId || `NWSP-${previewCert.result.academicYear}-${previewCert.result.id.slice(0, 6).toUpperCase()}`,
        academicYear: previewCert.result.academicYear
      };

      const canvas = await generateCertificateCanvas2D(item, previewCert.config);
      const cleanName = previewCert.studentName.replace(/[/\\?%*:|"<>]/g, '_');
      const cleanTitle = previewCert.result.activityTitle.replace(/[/\\?%*:|"<>]/g, '_');
      const fileName = `เกียรติบัตร_${cleanName}_${cleanTitle}`;

      let imgData: string;
      try {
        imgData = canvas.toDataURL(format === 'png' ? 'image/png' : 'image/jpeg', 0.95);
      } catch (e) {
        console.warn("Canvas export tainted, generating clean fallback canvas:", e);
        const fallbackCanvas = await generateCertificateCanvas2D(item, { ...previewCert.config, bgImageUrl: undefined });
        imgData = fallbackCanvas.toDataURL(format === 'png' ? 'image/png' : 'image/jpeg', 0.95);
      }

      if (format === 'png') {
        const link = document.createElement('a');
        link.download = `${fileName}.png`;
        link.href = imgData;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4'
        });

        pdf.addImage(imgData, 'JPEG', 0, 0, 297, 210);
        try {
          pdf.save(`${fileName}.pdf`);
        } catch (saveErr) {
          console.warn("pdf.save failed, using Blob URL fallback:", saveErr);
          const blob = pdf.output('blob');
          const blobUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = `${fileName}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
        }
      }
    } catch (err: any) {
      console.error("Single Certificate Export error detail:", err);
      alert(`เกิดข้อผิดพลาดในการสร้างเกียรติบัตร: ${err?.message || 'ข้อผิดพลาดระบบ'}`);
    } finally {
      setDownloadingFormat(null);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Search Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/80 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
          <div className="space-y-1">
            <div className="text-xs font-bold text-sky-700 bg-sky-100 px-3 py-1 rounded-full inline-flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              ระบบสืบค้น & ดาวน์โหลดเกียรติบัตรฉบับจริง
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              ค้นหาเกียรติบัตรออนไลน์ (Online Certificate Search)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              พิมพ์ชื่อ หรือนามสกุล หรือเลขประจำตัวนักเรียน เพื่อค้นหาและดาวน์โหลดใบเกียรติบัตรฉบับจริง
            </p>
          </div>

          {/* Academic Year Selector */}
          <div className="flex items-center gap-2 bg-slate-100/80 p-2 rounded-2xl border border-slate-200 self-start md:self-auto">
            <Calendar className="w-4 h-4 text-slate-500 ml-2" />
            <span className="text-xs font-bold text-slate-700">ปีการศึกษา:</span>
            <select
              value={selectedSearchYear}
              onChange={(e) => setSelectedSearchYear(e.target.value)}
              className="bg-white text-sky-900 font-extrabold text-xs px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm cursor-pointer"
            >
              {yearOptions.map(y => (
                <option key={y} value={y}>ปีการศึกษา {y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Input Field */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="พิมพ์ ชื่อ หรือ นามสกุล หรือ เลขประจำตัวนักเรียน..."
            className="w-full pl-12 pr-4 py-3.5 glass-input rounded-2xl text-sm sm:text-base font-bold text-slate-800 placeholder-slate-400 border-slate-300 shadow-inner focus:ring-2 focus:ring-sky-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Results List Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Award className="w-4 h-4 text-sky-600" />
            รายการเกียรติบัตรที่ค้นพบ
            {searchClean.length >= 2 && (
              <span className="bg-sky-100 text-sky-800 text-xs px-2 py-0.5 rounded-full font-extrabold">
                {matchingCertificates.length} รายการ
              </span>
            )}
          </h3>
        </div>

        {searchClean.length < 2 ? (
          <div className="glass-panel p-8 text-center rounded-3xl border border-dashed border-slate-300 text-slate-500 space-y-2">
            <Search className="w-10 h-10 mx-auto text-slate-300 animate-pulse" />
            <p className="text-sm font-bold">กรุณาพิมพ์ชื่อ นามสกุล หรือรหัสนักเรียนอย่างน้อย 2 ตัวอักษรเพื่อค้นหา</p>
          </div>
        ) : matchingCertificates.length === 0 ? (
          <div className="glass-panel p-8 text-center rounded-3xl border border-rose-200 bg-rose-50/30 text-rose-700 space-y-2">
            <FileText className="w-10 h-10 mx-auto text-rose-400" />
            <p className="text-sm font-bold">ไม่พบรายชื่อเกียรติบัตรตามคีย์เวิร์ด "{searchTerm}" ในปีการศึกษา {selectedSearchYear}</p>
            <p className="text-xs text-slate-500">กรุณาตรวจสอบการสะกดชื่อ-นามสกุล หรือลองเปลี่ยนปีการศึกษาที่มุมขวาบน</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matchingCertificates.map((cert, idx) => (
              <div 
                key={`${cert.result.id}-${cert.studentId}-${idx}`}
                className="glass-card p-5 rounded-2xl border border-white/80 shadow-md hover:shadow-lg transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-100">
                      {cert.result.activityTitle} ({cert.result.level})
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {cert.result.certificateId || 'เลขที่เกียรติบัตรระบบ'}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-extrabold text-slate-900">
                      {cert.studentName}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">
                      ชั้นมัธยมศึกษาปีที่ {cert.studentGrade}/{cert.studentRoom} • รหัสนักเรียน {cert.studentId}
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    {getFullAwardText(cert.result.award)}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => handleOpenPreview(cert.result, cert.studentName)}
                    className="flex-1 py-2 px-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Eye className="w-3.5 h-3.5" /> พรีวิว & ดาวน์โหลด
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interactive Preview & Download Modal */}
      {previewCert && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-4 sm:p-6 text-center space-y-4 shadow-2xl border border-white/80 my-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2 text-sky-800 font-extrabold text-sm sm:text-base">
                <Sparkles className="w-5 h-5 text-sky-600" />
                ตัวอย่างใบเกียรติบัตรออนไลน์ (Preview Certificate)
              </div>
              <button
                onClick={() => setPreviewCert(null)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live Render Container with Container Queries cqw responsive text scaling */}
            <div className="glass-panel p-2.5 rounded-2xl border border-slate-200 shadow-lg overflow-hidden flex justify-center bg-slate-100">
              <div
                ref={printRef}
                className={`w-full max-w-[800px] aspect-[1.414/1] bg-white relative rounded-xl overflow-hidden shadow-md text-slate-900 select-none [container-type:inline-size] ${getFontClass(previewCert.config?.fontFamily)}`}
                style={{
                  fontFamily: previewCert.config?.fontFamily ? `"${previewCert.config.fontFamily}", Sarabun, sans-serif` : 'Sarabun, sans-serif',
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

                {/* Configured Student Name */}
                {(previewCert.config?.visibleElements?.studentName ?? true) && (
                  <div
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 font-bold whitespace-nowrap"
                    style={previewCert.config?.positions?.studentName ? {
                      left: `${previewCert.config.positions.studentName.x}%`,
                      top: `${previewCert.config.positions.studentName.y}%`,
                      fontSize: `${(previewCert.config.positions.studentName.fontSize / 800) * 100}cqw`,
                      color: previewCert.config.positions.studentName.color
                    } : {
                      left: '50%',
                      top: '42%',
                      fontSize: '4.25cqw',
                      color: '#0c4a6e'
                    }}
                  >
                    {previewCert.studentName}
                  </div>
                )}

                {/* Configured Full Award Text */}
                {(previewCert.config?.visibleElements?.award ?? true) && (
                  <div
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 font-bold whitespace-nowrap"
                    style={previewCert.config?.positions?.award ? {
                      left: `${previewCert.config.positions.award.x}%`,
                      top: `${previewCert.config.positions.award.y}%`,
                      fontSize: `${(previewCert.config.positions.award.fontSize / 800) * 100}cqw`,
                      color: previewCert.config.positions.award.color
                    } : {
                      left: '50%',
                      top: '52%',
                      fontSize: '3.25cqw',
                      color: '#b45309'
                    }}
                  >
                    {getFullAwardText(previewCert.result.award)}
                  </div>
                )}

                {/* Configured Activity Name & Level */}
                {(previewCert.config?.visibleElements?.activityName ?? true) && (
                  <div
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 font-bold whitespace-nowrap"
                    style={previewCert.config?.positions?.activityName ? {
                      left: `${previewCert.config.positions.activityName.x}%`,
                      top: `${previewCert.config.positions.activityName.y}%`,
                      fontSize: `${(previewCert.config.positions.activityName.fontSize / 800) * 100}cqw`,
                      color: previewCert.config.positions.activityName.color
                    } : {
                      left: '50%',
                      top: '60%',
                      fontSize: '2.75cqw',
                      color: '#334155'
                    }}
                  >
                    {previewCert.result.activityTitle} {previewCert.result.level === 'ม.ต้น' ? 'ระดับชั้นมัธยมศึกษาตอนต้น' : 'ระดับชั้นมัธยมศึกษาตอนปลาย'}
                  </div>
                )}

                {/* Configured Certificate ID */}
                {(previewCert.config?.visibleElements?.certId ?? true) && (
                  <div
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 font-mono whitespace-nowrap"
                    style={previewCert.config?.positions?.certId ? {
                      left: `${previewCert.config.positions.certId.x}%`,
                      top: `${previewCert.config.positions.certId.y}%`,
                      fontSize: `${(previewCert.config.positions.certId.fontSize / 800) * 100}cqw`,
                      color: previewCert.config.positions.certId.color
                    } : {
                      left: '75%',
                      top: '88%',
                      fontSize: '1.75cqw',
                      color: '#64748b'
                    }}
                  >
                    {previewCert.result.certificateId || `NWSP-${previewCert.result.academicYear}-${previewCert.result.id.slice(0, 6).toUpperCase()}`}
                  </div>
                )}

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
