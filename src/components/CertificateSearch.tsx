import React, { useState, useRef } from 'react';
import { CompetitionResult, CertificateConfig, Activity } from '../types';
import { ensureFontLoaded, getStudentUniqueCertId } from '../services/storage';
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
  results = [],
  activities = [],
  certificateConfigs = [],
  academicYear
}) => {
  const safeResults = Array.isArray(results) ? results.filter(Boolean) : [];
  const safeActivities = Array.isArray(activities) ? activities.filter(Boolean) : [];
  const safeCertConfigs = Array.isArray(certificateConfigs) ? certificateConfigs.filter(Boolean) : [];

  const [mobilePreviewImage, setMobilePreviewImage] = useState<{ url: string; fileName: string } | null>(null);
  const isMobileDevice = typeof window !== 'undefined' && (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768);

  const [selectedSearchYear, setSelectedSearchYear] = useState<string>(academicYear || '2569');
  const [searchTerm, setSearchTerm] = useState('');
  const [downloadingFormat, setDownloadingFormat] = useState<'pdf' | 'png' | null>(null);
  
  // Interactive Preview Modal State
  const [previewCert, setPreviewCert] = useState<{
    result: CompetitionResult;
    studentName: string;
    studentCertId: string;
    config?: CertificateConfig;
  } | null>(null);

  const printRef = useRef<HTMLDivElement>(null);
  const printRefHD = useRef<HTMLDivElement>(null);

  // Years options list (e.g. 2568, 2569, 2570, 2571, 2572)
  const defaultYear = academicYear || '2569';
  const yearOptions = ['2568', '2569', '2570', '2571', '2572'];
  if (defaultYear && !yearOptions.includes(defaultYear)) {
    yearOptions.push(defaultYear);
  }

  // Search by student name or surname within the selected academic year
  const matchingCertificates: {
    result: CompetitionResult;
    studentName: string;
    studentTitle: string;
    studentGrade: string;
    studentRoom: number;
    studentId: string;
    studentCertId: string;
  }[] = [];

  const searchClean = searchTerm.trim().toLowerCase();

  if (searchClean.length >= 2) {
    safeResults.forEach(res => {
      if (res && res.academicYear === selectedSearchYear && Array.isArray(res.members)) {
        res.members.forEach((member, memberIdx) => {
          if (!member) return;
          const full = `${member.title || ''}${member.fullName || ''}`.toLowerCase();
          const nameOnly = (member.fullName || '').toLowerCase();
          if (full.includes(searchClean) || nameOnly.includes(searchClean) || (member.studentId && member.studentId.includes(searchClean))) {
            const studentCertId = getStudentUniqueCertId(res.certificateId, memberIdx);
            matchingCertificates.push({
              result: res,
              studentName: `${member.title || ''}${member.fullName || ''}`,
              studentTitle: member.title || '',
              studentGrade: member.grade || '',
              studentRoom: member.room || 1,
              studentId: member.studentId || '',
              studentCertId
            });
          }
        });
      }
    });
  }

  // Font family helper supporting all 28 Thai Google Fonts
  const getFontClass = (fontName?: string) => {
    const target = fontName || 'Sarabun';
    const clean = target.toLowerCase().replace(/\s+/g, '');
    return `font-${clean}`;
  };

  const findBestCertConfig = (configs: CertificateConfig[], actId: string, year?: string) => {
    if (!configs || configs.length === 0) return undefined;
    let match = configs.find(c => c && c.activityId === actId && (!year || c.academicYear === year));
    if (!match) match = configs.find(c => c && c.activityId === actId);
    if (!match) match = configs.find(c => c && (c.activityId === 'default' || c.id?.startsWith('default_')));
    if (!match) match = configs[0];
    return match;
  };

  // Open Preview Modal
  const handleOpenPreview = (res: CompetitionResult, studentName: string, studentCertId: string) => {
    const config = findBestCertConfig(safeCertConfigs, res.activityId, res.academicYear);
    if (config?.fontFamily) {
      ensureFontLoaded(config.fontFamily);
    }
    setPreviewCert({ result: res, studentName, studentCertId, config });
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

  // Direct Canvas 2D Generator for 100% Taint-Free, High Resolution Certificate Rendering
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
    canvas.width = 1600;
    canvas.height = 1131;
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
      maxAvailableWidth: number = canvas.width * 0.78
    ) => {
      let size = Math.round(initialFontSize * 2.0);
      ctx.font = getCanvasFont(fontWeight, size);
      let textWidth = ctx.measureText(text).width;
      while (textWidth > maxAvailableWidth && size > 14) {
        size -= 1.5;
        ctx.font = getCanvasFont(fontWeight, size);
        textWidth = ctx.measureText(text).width;
      }
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, (targetXPercent / 100) * canvas.width, (targetYPercent / 100) * canvas.height);
    };

    // Helper to lock central text elements at exact 50% horizontal center
    const getCenterX = (xVal?: number) => {
      return 50;
    };

    // 1. Student Name
    if (config?.visibleElements?.studentName ?? true) {
      const pos = config?.positions?.studentName || { x: 50, y: 42, fontSize: 34, color: '#0c4a6e', fontWeight: 'bold' };
      drawTextAutoFit(item.studentName, 50, pos.y || 42, pos.fontSize || 34, pos.color || '#0c4a6e', pos.fontWeight || 'bold');
    }

    // 2. Award Text
    if (config?.visibleElements?.award ?? true) {
      const pos = config?.positions?.award || { x: 50, y: 52, fontSize: 26, color: '#b45309', fontWeight: 'bold' };
      drawTextAutoFit(getFullAwardText(item.award), 50, pos.y || 52, pos.fontSize || 26, pos.color || '#b45309', pos.fontWeight || 'bold');
    }

    // 3. Activity Name & Level
    if (config?.visibleElements?.activityName ?? true) {
      const pos = config?.positions?.activityName || { x: 50, y: 60, fontSize: 22, color: '#334155', fontWeight: 'bold' };
      const levelStr = item.level === 'ม.ต้น' ? 'ระดับชั้นมัธยมศึกษาตอนต้น' : 'ระดับชั้นมัธยมศึกษาตอนปลาย';
      drawTextAutoFit(`${item.activityTitle} ${levelStr}`, 50, pos.y || 60, pos.fontSize || 22, pos.color || '#334155', pos.fontWeight || 'bold');
    }

    // 4. Certificate ID (Strict Admin Positions)
    if (config?.visibleElements?.certId ?? true) {
      const pos = config?.positions?.certId || { x: 75, y: 88, fontSize: 14, color: '#64748b', fontWeight: 'normal' };
      const scaledSize = Math.max(26, Math.round((pos.fontSize || 14) * 2.0));
      ctx.font = getCanvasFont(pos.fontWeight || 'normal', scaledSize);
      ctx.fillStyle = pos.color || '#64748b';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const rawId = item.certificateId || '';
      const displayCertId = rawId.startsWith('เลขที่') ? rawId : `เลขที่ ${rawId}`;
      ctx.fillText(displayCertId, (pos.x / 100) * canvas.width, (pos.y / 100) * canvas.height);
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
        certificateId: previewCert.studentCertId || previewCert.result.certificateId || `NWSP-${previewCert.result.academicYear}-${previewCert.result.id.slice(0, 6).toUpperCase()}`,
        academicYear: previewCert.result.academicYear
      };

      const cleanName = previewCert.studentName.replace(/[/\\?%*:|"<>]/g, '_');
      const cleanTitle = previewCert.result.activityTitle.replace(/[/\\?%*:|"<>]/g, '_');
      const fileName = `เกียรติบัตร_${cleanName}_${cleanTitle}`;

      // Always generate 1600x1131 Super HD Canvas 2D for 100% Sharp Background & Exact Center Alignment
      const canvas = await generateCertificateCanvas2D(item, previewCert.config);

      let imgData: string;
      if (printRefHD.current) {
        try {
          const domCanvas = await html2canvas(printRefHD.current, {
            scale: 1,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: 1600,
            height: 1131
          });
          imgData = domCanvas.toDataURL(format === 'png' ? 'image/png' : 'image/jpeg', 0.95);
        } catch (e) {
          console.warn("Offscreen capture failed, using Canvas2D fallback:", e);
          const canvas = await generateCertificateCanvas2D(item, previewCert.config);
          imgData = canvas.toDataURL(format === 'png' ? 'image/png' : 'image/jpeg', 0.95);
        }
      } else {
        const canvas = await generateCertificateCanvas2D(item, previewCert.config);
        try {
          imgData = canvas.toDataURL(format === 'png' ? 'image/png' : 'image/jpeg', 0.95);
        } catch (e) {
          const fallbackCanvas = await generateCertificateCanvas2D(item, { ...previewCert.config, bgImageUrl: undefined });
          imgData = fallbackCanvas.toDataURL(format === 'png' ? 'image/png' : 'image/jpeg', 0.95);
        }
      }

      if (format === 'png') {
        // Build Blob URL for 100% Mobile Phone & Desktop Compatibility
        const arr = imgData.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], { type: mime });
        const blobUrl = URL.createObjectURL(blob);

        if (isMobileDevice) {
          // Open interactive mobile image save viewer (supports tap & hold / long press to save)
          setMobilePreviewImage({ url: blobUrl, fileName: `${fileName}.png` });
        }

        const link = document.createElement('a');
        link.download = `${fileName}.png`;
        link.href = blobUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // PDF Export
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4'
        });

        pdf.addImage(imgData, 'JPEG', 0, 0, 297, 210);
        try {
          pdf.save(`${fileName}.pdf`);
        } catch (saveErr) {
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
                      {cert.studentCertId || cert.result.certificateId || 'เลขที่เกียรติบัตรระบบ'}
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
                    onClick={() => handleOpenPreview(cert.result, cert.studentName, cert.studentCertId)}
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

      {/* Off-Screen 1600x1131 HD Render Container for 100% Perfect HTML-to-Image 1:1 Match */}
      {previewCert && (
        <div className="fixed -left-[9999px] -top-[9999px] pointer-events-none z-[-100] opacity-0 overflow-hidden">
          <div
            ref={printRefHD}
            className={`w-[1600px] h-[1131px] bg-white relative rounded-none overflow-hidden text-slate-900 select-none ${getFontClass(previewCert.config?.fontFamily)}`}
            style={{
              fontFamily: previewCert.config?.fontFamily ? `"${previewCert.config.fontFamily}", Sarabun, sans-serif` : 'Sarabun, sans-serif',
              backgroundImage: previewCert.config?.bgImageUrl 
                ? `url(${previewCert.config.bgImageUrl})` 
                : 'radial-gradient(circle at 50% 50%, #ffffff 0%, #f0f9ff 100%)',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {/* Student Name */}
            {(previewCert.config?.visibleElements?.studentName ?? true) && (
              <div
                className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-bold whitespace-nowrap text-center"
                style={{
                  top: `${previewCert.config?.positions?.studentName?.y || 42}%`,
                  fontSize: `${(previewCert.config?.positions?.studentName?.fontSize || 34) * 2.0}px`,
                  color: previewCert.config?.positions?.studentName?.color || '#0c4a6e'
                }}
              >
                {previewCert.studentName}
              </div>
            )}

            {/* Award Text */}
            {(previewCert.config?.visibleElements?.award ?? true) && (
              <div
                className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-bold whitespace-nowrap text-center"
                style={{
                  top: `${previewCert.config?.positions?.award?.y || 52}%`,
                  fontSize: `${(previewCert.config?.positions?.award?.fontSize || 26) * 2.0}px`,
                  color: previewCert.config?.positions?.award?.color || '#b45309'
                }}
              >
                {getFullAwardText(previewCert.result.award)}
              </div>
            )}

            {/* Activity Name & Level */}
            {(previewCert.config?.visibleElements?.activityName ?? true) && (
              <div
                className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-bold whitespace-nowrap text-center"
                style={{
                  top: `${previewCert.config?.positions?.activityName?.y || 60}%`,
                  fontSize: `${(previewCert.config?.positions?.activityName?.fontSize || 22) * 2.0}px`,
                  color: previewCert.config?.positions?.activityName?.color || '#334155'
                }}
              >
                {previewCert.result.activityTitle} {previewCert.result.level === 'ม.ต้น' ? 'ระดับชั้นมัธยมศึกษาตอนต้น' : 'ระดับชั้นมัธยมศึกษาตอนปลาย'}
              </div>
            )}

            {/* Certificate ID */}
            {(previewCert.config?.visibleElements?.certId ?? true) && (
              <div
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 whitespace-nowrap ${getFontClass(previewCert.config?.fontFamily)}`}
                style={{
                  left: `${previewCert.config?.positions?.certId?.x || 75}%`,
                  top: `${previewCert.config?.positions?.certId?.y || 88}%`,
                  fontSize: `${(previewCert.config?.positions?.certId?.fontSize || 14) * 2.0}px`,
                  color: previewCert.config?.positions?.certId?.color || '#64748b',
                  fontFamily: previewCert.config?.fontFamily ? `"${previewCert.config.fontFamily}", Sarabun, sans-serif` : 'Sarabun, sans-serif'
                }}
              >
                {previewCert.studentCertId ? (previewCert.studentCertId.startsWith('เลขที่') ? previewCert.studentCertId : `เลขที่ ${previewCert.studentCertId}`) : (previewCert.result.certificateId || `NWSP-${previewCert.result.academicYear}-${previewCert.result.id.slice(0, 6).toUpperCase()}`)}
              </div>
            )}
          </div>
        </div>
      )}

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
                      left: `${(previewCert.config.positions.studentName.x >= 35 && previewCert.config.positions.studentName.x <= 65) ? 50 : previewCert.config.positions.studentName.x}%`,
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
                      left: `${(previewCert.config.positions.award.x >= 35 && previewCert.config.positions.award.x <= 65) ? 50 : previewCert.config.positions.award.x}%`,
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
                      left: `${(previewCert.config.positions.activityName.x >= 35 && previewCert.config.positions.activityName.x <= 65) ? 50 : previewCert.config.positions.activityName.x}%`,
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
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 whitespace-nowrap ${getFontClass(previewCert.config?.fontFamily)}`}
                    style={previewCert.config?.positions?.certId ? {
                      left: `${previewCert.config.positions.certId.x}%`,
                      top: `${previewCert.config.positions.certId.y}%`,
                      fontSize: `${(previewCert.config.positions.certId.fontSize / 800) * 100}cqw`,
                      color: previewCert.config.positions.certId.color,
                      fontFamily: previewCert.config?.fontFamily ? `"${previewCert.config.fontFamily}", Sarabun, sans-serif` : 'Sarabun, sans-serif'
                    } : {
                      left: '75%',
                      top: '88%',
                      fontSize: '1.75cqw',
                      color: '#64748b',
                      fontFamily: previewCert.config?.fontFamily ? `"${previewCert.config.fontFamily}", Sarabun, sans-serif` : 'Sarabun, sans-serif'
                    }}
                  >
                    {previewCert.studentCertId ? (previewCert.studentCertId.startsWith('เลขที่') ? previewCert.studentCertId : `เลขที่ ${previewCert.studentCertId}`) : (previewCert.result.certificateId || `NWSP-${previewCert.result.academicYear}-${previewCert.result.id.slice(0, 6).toUpperCase()}`)}
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
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold rounded-xl text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {downloadingFormat === 'png' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileImage className="w-4 h-4" />
                )}
                {isMobileDevice ? '📸 บันทึกรูปภาพเกียรติบัตร (ไฟล์ภาพ PNG)' : 'ดาวน์โหลดเป็นไฟล์ PNG (ภาพคมชัด)'}
              </button>

              {!isMobileDevice && (
                <button
                  onClick={() => handleExportFile('pdf')}
                  disabled={downloadingFormat !== null}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 text-white font-extrabold rounded-xl text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {downloadingFormat === 'pdf' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  ดาวน์โหลดเป็นไฟล์ PDF (สำหรับพิมพ์)
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Interactive Mobile Image Saver Modal (Long-Press to Save to Photos) */}
      {mobilePreviewImage && (
        <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 text-center space-y-4 shadow-2xl border border-white/80 my-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2 text-emerald-700 font-extrabold text-sm">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                บันทึกรูปภาพเกียรติบัตรลงมือถือ
              </div>
              <button
                onClick={() => setMobilePreviewImage(null)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="bg-emerald-50 text-emerald-800 p-3 rounded-2xl border border-emerald-200 text-xs font-bold space-y-1 text-left">
                <p className="flex items-center gap-1.5 font-extrabold text-emerald-900">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  วิธีบันทึกรูปภาพลงสมาร์ทโฟน/แท็บเล็ต:
                </p>
                <p>1. แตะค้างที่รูปภาพเกียรติบัตรด้านล่าง</p>
                <p>2. เลือก <strong>"บันทึกภาพ" (Add to Photos)</strong> หรือ <strong>"ดาวน์โหลดรูปภาพ"</strong></p>
              </div>

              <div className="w-full aspect-[1.414/1] rounded-2xl overflow-hidden border border-slate-300 shadow-md bg-slate-100 flex items-center justify-center p-1">
                <img 
                  src={mobilePreviewImage.url} 
                  alt="เกียรติบัตรฉบับจริง"
                  className="w-full h-full object-contain rounded-xl select-all touch-auto"
                  style={{ maxWidth: '100%', maxHeight: '100%', display: 'block' }}
                />
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <a
                href={mobilePreviewImage.url}
                download={mobilePreviewImage.fileName}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-md"
              >
                <Download className="w-4 h-4" />
                ดาวน์โหลดรูปภาพลงเครื่องโดยตรง
              </a>
              <button
                onClick={() => setMobilePreviewImage(null)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
