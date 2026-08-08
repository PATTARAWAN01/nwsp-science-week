import React, { useState, useEffect, useRef } from 'react';
import { Registration, CompetitionResult, Activity, AwardType, StudentGrade, StudentTitle, CertNumberConfig, CertificateConfig } from '../../types';
import { 
  saveRegistration, 
  deleteRegistration, 
  saveResult, 
  deleteResult,
  getCertNumberConfig,
  saveCertNumberConfig,
  getCertificateConfigs
} from '../../services/storage';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  Users, 
  Award, 
  Edit3, 
  Trash2, 
  Trophy, 
  Search, 
  X,
  Settings,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Printer,
  Download,
  Loader2
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

  // Certificate Sequence Configuration State
  const [certSeqConfig, setCertSeqConfig] = useState<CertNumberConfig>({
    prefix: 'เลขที่ ',
    startingNumber: 1903,
    suffix: `/${academicYear}`,
    padding: 0
  });
  const [isSeqConfigModalOpen, setIsSeqConfigModalOpen] = useState(false);
  const [cfgPrefixInput, setCfgPrefixInput] = useState('เลขที่ ');
  const [cfgStartNumInput, setCfgStartNumInput] = useState('1903');
  const [cfgSuffixInput, setCfgSuffixInput] = useState(`/${academicYear}`);

  useEffect(() => {
    getCertNumberConfig(academicYear).then((cfg) => {
      setCertSeqConfig(cfg);
      setCfgPrefixInput(cfg.prefix);
      setCfgStartNumInput(cfg.startingNumber.toString());
      setCfgSuffixInput(cfg.suffix);
    });
  }, [academicYear]);

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

  const generateNextCertId = (seqIndex?: number) => {
    const yearResults = results.filter(r => r.academicYear === academicYear);
    const idx = seqIndex !== undefined ? seqIndex : yearResults.length;
    const num = certSeqConfig.startingNumber + idx;
    return `${certSeqConfig.prefix}${num}${certSeqConfig.suffix}`;
  };

  const handleOpenRecordAwardModal = (reg: Registration) => {
    setRecordingReg(reg);
    setSelectedAward('รางวัลชนะเลิศ');
    
    // Check existing result for this reg
    const existingRes = results.find(r => r.registrationId === reg.id);
    if (existingRes && existingRes.certificateId) {
      setCertIdInput(existingRes.certificateId);
      setSelectedAward(existingRes.award);
      setScoreInput(existingRes.score || '');
    } else {
      const autoCertId = generateNextCertId();
      setCertIdInput(autoCertId);
      setScoreInput('');
    }
  };

  const handleAutoGenerateClick = () => {
    let seq = results.filter(r => r.academicYear === academicYear).length;
    let candidate = generateNextCertId(seq);
    while (results.some(r => r.academicYear === academicYear && r.certificateId === candidate && r.registrationId !== recordingReg?.id)) {
      seq++;
      candidate = generateNextCertId(seq);
    }
    setCertIdInput(candidate);
  };

  const handleSaveSeqConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newStartNum = parseInt(cfgStartNumInput.trim()) || 1;
    const newCfg: CertNumberConfig = {
      prefix: cfgPrefixInput,
      startingNumber: newStartNum,
      suffix: cfgSuffixInput,
      padding: 0
    };
    await saveCertNumberConfig(newCfg, academicYear);
    setCertSeqConfig(newCfg);
    setIsSeqConfigModalOpen(false);
    alert(`บันทึกตั้งค่ารันเลขเกียรติบัตรเริ่มต้นเรียบร้อยแล้ว!\nตัวอย่าง: ${newCfg.prefix}${newCfg.startingNumber}${newCfg.suffix}`);
  };

  const duplicateResult = certIdInput.trim()
    ? results.find(r => 
        r.academicYear === academicYear && 
        r.certificateId && 
        r.certificateId.trim().toLowerCase() === certIdInput.trim().toLowerCase() && 
        r.registrationId !== recordingReg?.id
      )
    : null;

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

  // Batch PDF Export State
  const [isExportingBatchPDF, setIsExportingBatchPDF] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0, name: '' });
  const [batchItem, setBatchItem] = useState<{
    studentName: string;
    award: string;
    activityTitle: string;
    level: string;
    certificateId: string;
    academicYear: string;
  } | null>(null);
  const [allCertConfigs, setAllCertConfigs] = useState<CertificateConfig[]>([]);

  const batchPrintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getCertificateConfigs().then(setAllCertConfigs);
  }, []);

  const getFullAwardText = (awardStr: string) => {
    if (awardStr === 'รางวัลชนะเลิศ') return 'ได้รับรางวัลชนะเลิศ';
    if (awardStr === 'รางวัลรองชนะเลิศอันดับ 1') return 'ได้รับรางวัลรองชนะเลิศอันดับ 1';
    if (awardStr === 'รางวัลรองชนะเลิศอันดับ 2') return 'ได้รับรางวัลรองชนะเลิศอันดับ 2';
    if (awardStr === 'รางวัลชมเชย') return 'ได้รับรางวัลชมเชย';
    if (awardStr === 'เข้าร่วมการแข่งขัน') return 'ได้เข้าร่วมการแข่งขัน';
    return `ได้รับ${awardStr}`;
  };

  const findCertConfig = (configs: CertificateConfig[], actId: string, actTitle?: string, year?: string) => {
    if (!configs || configs.length === 0) return null;
    let match = configs.find(c => c && c.activityId === actId && (!year || c.academicYear === year));
    if (match) return match;

    match = configs.find(c => c && c.activityId === actId);
    if (match) return match;

    const act = safeActivities.find(a => a && (a.id === actId || a.title === actTitle));
    if (act) {
      match = configs.find(c => c && c.activityId === act.id);
      if (match) return match;
    }

    return configs.find(c => c && c.academicYear === (year || academicYear)) || configs[0] || null;
  };

  const batchCertConfig = findCertConfig(allCertConfigs, selectedActivityId, undefined, academicYear);

  // Direct Canvas 2D Generator for 100% Taint-Free, Lightning Fast PDF Certificate Rendering
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

    // Ensure selected custom font stylesheet & font binary are 100% loaded before rendering to Canvas 2D
    if (fontFamily && fontFamily !== 'Sarabun') {
      const fontId = `gfont-${fontFamily.replace(/\s+/g, '-').toLowerCase()}`;
      if (!document.getElementById(fontId)) {
        await new Promise<void>((resolve) => {
          const link = document.createElement('link');
          link.id = fontId;
          link.rel = 'stylesheet';
          const fontQuery = fontFamily.replace(/\s+/g, '+');
          link.href = `https://fonts.googleapis.com/css2?family=${fontQuery}:wght@400;600;700&display=swap`;
          link.onload = () => resolve();
          link.onerror = () => resolve();
          document.head.appendChild(link);
          setTimeout(resolve, 1500);
        });
      }

      try {
        await Promise.all([
          document.fonts.load(`700 50px ${fontSpecifier}`),
          document.fonts.load(`400 50px ${fontSpecifier}`),
          document.fonts.ready
        ]);
      } catch (e) {
        console.warn("Font pre-load warning:", e);
      }
    }

    // 1. Student Name
    if (config?.visibleElements?.studentName ?? true) {
      const pos = config?.positions?.studentName || { x: 50, y: 42, fontSize: 34, color: '#0c4a6e', fontWeight: 'bold' };
      const scaledSize = Math.round(pos.fontSize * 1.7);
      ctx.font = getCanvasFont(pos.fontWeight || 'bold', scaledSize);
      ctx.fillStyle = pos.color || '#0c4a6e';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(item.studentName, (pos.x / 100) * canvas.width, (pos.y / 100) * canvas.height);
    }

    // 2. Award Text
    if (config?.visibleElements?.award ?? true) {
      const pos = config?.positions?.award || { x: 50, y: 52, fontSize: 26, color: '#b45309', fontWeight: 'bold' };
      const scaledSize = Math.round(pos.fontSize * 1.7);
      ctx.font = getCanvasFont(pos.fontWeight || 'bold', scaledSize);
      ctx.fillStyle = pos.color || '#b45309';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(getFullAwardText(item.award), (pos.x / 100) * canvas.width, (pos.y / 100) * canvas.height);
    }

    // 3. Activity Name & Level
    if (config?.visibleElements?.activityName ?? true) {
      const pos = config?.positions?.activityName || { x: 50, y: 60, fontSize: 22, color: '#334155', fontWeight: 'bold' };
      const scaledSize = Math.round(pos.fontSize * 1.7);
      const levelStr = item.level === 'ม.ต้น' ? 'ระดับชั้นมัธยมศึกษาตอนต้น' : 'ระดับชั้นมัธยมศึกษาตอนปลาย';
      ctx.font = getCanvasFont(pos.fontWeight || 'bold', scaledSize);
      ctx.fillStyle = pos.color || '#334155';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${item.activityTitle} ${levelStr}`, (pos.x / 100) * canvas.width, (pos.y / 100) * canvas.height);
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

  const handleExportBatchPDF = async () => {
    const currentAct = activities.find(a => a.id === selectedActivityId);
    if (!currentAct) return;

    const studentsToExport: {
      studentName: string;
      award: string;
      activityTitle: string;
      level: string;
      certificateId: string;
      academicYear: string;
    }[] = [];

    // Check if results exist for this activity & level
    const activityResults = results.filter(
      r => r.academicYear === academicYear && r.activityId === selectedActivityId && r.level === selectedLevel
    );

    if (activityResults.length > 0) {
      activityResults.forEach(res => {
        res.members.forEach(m => {
          studentsToExport.push({
            studentName: `${m.title}${m.fullName}`,
            award: res.award,
            activityTitle: res.activityTitle,
            level: res.level,
            certificateId: res.certificateId || `NWSP-${academicYear}-${res.id.slice(0, 6).toUpperCase()}`,
            academicYear: res.academicYear
          });
        });
      });
    } else if (activityRegistrations.length > 0) {
      // If no awards logged yet, export participant certs for all registered applicants
      let seq = certSeqConfig.startingNumber;
      activityRegistrations.forEach(reg => {
        reg.members.forEach(m => {
          studentsToExport.push({
            studentName: `${m.title}${m.fullName}`,
            award: 'เข้าร่วมการแข่งขัน',
            activityTitle: reg.activityTitle,
            level: reg.level,
            certificateId: `${certSeqConfig.prefix}${seq++}${certSeqConfig.suffix}`,
            academicYear: reg.academicYear
          });
        });
      });
    }

    if (studentsToExport.length === 0) {
      alert("ไม่มีรายชื่อผู้สมัครหรือผู้ได้รับรางวัลในกิจกรรมและระดับชั้นนี้");
      return;
    }

    setIsExportingBatchPDF(true);
    setBatchProgress({ current: 0, total: studentsToExport.length, name: '' });

    try {
      // Fetch latest saved certificate configuration for this activity
      const freshConfigs = await getCertificateConfigs();
      setAllCertConfigs(freshConfigs);
      const activeCertConfig = findCertConfig(freshConfigs, selectedActivityId, currentActivity?.title, academicYear) || batchCertConfig;

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      for (let i = 0; i < studentsToExport.length; i++) {
        const item = studentsToExport[i];
        setBatchItem(item);
        setBatchProgress({ current: i + 1, total: studentsToExport.length, name: item.studentName });

        const canvas = await generateCertificateCanvas2D(item, activeCertConfig);
        let imgData: string;
        try {
          imgData = canvas.toDataURL('image/jpeg', 0.95);
        } catch (e) {
          console.warn("Canvas export tainted, generating clean fallback canvas:", e);
          const fallbackCanvas = await generateCertificateCanvas2D(item, { ...batchCertConfig, bgImageUrl: undefined });
          imgData = fallbackCanvas.toDataURL('image/jpeg', 0.95);
        }

        if (i > 0) {
          pdf.addPage('a4', 'landscape');
        }
        pdf.addImage(imgData, 'JPEG', 0, 0, 297, 210);

        // Yield execution briefly for UI responsiveness
        await new Promise(r => setTimeout(r, 20));
      }

      // Sanitize filename to prevent file system errors with slashes or special characters
      const cleanTitle = currentAct.title.replace(/[/\\?%*:|"<>]/g, '_');
      const cleanLevel = selectedLevel.replace(/[/\\?%*:|"<>]/g, '_');
      const fileName = `เกียรติบัตรทั้งหมด_${cleanTitle}_${cleanLevel}_ปี${academicYear}.pdf`;

      try {
        pdf.save(fileName);
      } catch (saveErr) {
        console.warn("pdf.save failed, using Blob URL fallback:", saveErr);
        const blob = pdf.output('blob');
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
      }

      alert(`ส่งออกไฟล์ PDF เกียรติบัตรสำเร็จ! รวมทั้งหมด ${studentsToExport.length} รายชื่อในไฟล์เดียวเรียบร้อยแล้ว`);
    } catch (err: any) {
      console.error("Batch PDF Export error detail:", err);
      alert(`เกิดข้อผิดพลาดในการสร้างไฟล์ PDF: ${err?.message || 'ข้อผิดพลาดระบบ'}\nกรุณาลองใหม่อีกครั้ง หรือใช้ปุ่มพิมพ์ผ่านเบราว์เซอร์`);
    } finally {
      setIsExportingBatchPDF(false);
      setBatchItem(null);
    }
  };

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

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Batch Export Loading & Visible Canvas Preview Overlay Modal */}
      {isExportingBatchPDF && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 text-center space-y-4 shadow-2xl border border-white/80 my-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2 text-purple-700 font-extrabold text-sm sm:text-base">
                <Loader2 className="w-5 h-5 animate-spin" />
                กำลังสร้างไฟล์ PDF เกียรติบัตรทั้งหมด...
              </div>
              <div className="text-xs font-bold text-slate-500">
                {batchProgress.current} จากทั้งหมด {batchProgress.total} รายชื่อ ({Math.round((batchProgress.current / batchProgress.total) * 100)}%)
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
              <div
                className="bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 h-full transition-all duration-150"
                style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
              />
            </div>

            <div className="text-xs font-bold text-slate-700">
              กำลังประมวลผล: <span className="text-purple-700 underline">{batchProgress.name}</span>
            </div>

            {/* Live Render Canvas inside Viewport for 100% Reliable html2canvas Capture */}
            <div className="glass-panel p-2.5 rounded-2xl border border-slate-200 shadow-lg overflow-hidden flex justify-center bg-slate-100">
              {batchItem && (
                <div
                  ref={batchPrintRef}
                  className={`w-full max-w-[700px] aspect-[1.414/1] bg-white relative rounded-xl overflow-hidden shadow-md text-slate-900 select-none ${getFontClass(batchCertConfig?.fontFamily)}`}
                  style={{
                    backgroundImage: batchCertConfig?.bgImageUrl 
                      ? `url(${batchCertConfig.bgImageUrl})` 
                      : 'radial-gradient(circle at 50% 50%, #ffffff 0%, #f0f9ff 100%)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  {!batchCertConfig?.bgImageUrl && (
                    <div className="absolute inset-3 border-2 border-dashed border-sky-300 rounded-xl pointer-events-none" />
                  )}

                  {!batchCertConfig?.bgImageUrl && (
                    <div className="text-center pt-4 space-y-1 relative z-10">
                      <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-purple-600 rounded-xl mx-auto p-0.5 shadow-sm">
                        <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center text-sky-600 font-extrabold text-sm">
                          NWSP
                        </div>
                      </div>
                      <h1 className="text-sm font-bold text-slate-800 tracking-wide font-sans">
                        โรงเรียนหนองวัวซอพิทยาคม
                      </h1>
                      <p className="text-xs font-medium text-slate-600">
                        ขอมอบเกียรติบัตรฉบับนี้เพื่อแสดงว่า
                      </p>
                    </div>
                  )}

                  {/* Configured Student Name */}
                  {(batchCertConfig?.visibleElements?.studentName ?? true) && (
                    <div
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 font-bold whitespace-nowrap"
                      style={batchCertConfig?.positions?.studentName ? {
                        left: `${batchCertConfig.positions.studentName.x}%`,
                        top: `${batchCertConfig.positions.studentName.y}%`,
                        fontSize: `${batchCertConfig.positions.studentName.fontSize * 0.45}px`,
                        color: batchCertConfig.positions.studentName.color
                      } : {
                        left: '50%',
                        top: '42%',
                        fontSize: '18px',
                        color: '#0c4a6e'
                      }}
                    >
                      {batchItem.studentName}
                    </div>
                  )}

                  {/* Configured Full Award Text */}
                  {(batchCertConfig?.visibleElements?.award ?? true) && (
                    <div
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 font-bold whitespace-nowrap"
                      style={batchCertConfig?.positions?.award ? {
                        left: `${batchCertConfig.positions.award.x}%`,
                        top: `${batchCertConfig.positions.award.y}%`,
                        fontSize: `${batchCertConfig.positions.award.fontSize * 0.45}px`,
                        color: batchCertConfig.positions.award.color
                      } : {
                        left: '50%',
                        top: '52%',
                        fontSize: '14px',
                        color: '#b45309'
                      }}
                    >
                      {getFullAwardText(batchItem.award)}
                    </div>
                  )}

                  {/* Configured Activity Name & Level */}
                  {(batchCertConfig?.visibleElements?.activityName ?? true) && (
                    <div
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 font-bold whitespace-nowrap"
                      style={batchCertConfig?.positions?.activityName ? {
                        left: `${batchCertConfig.positions.activityName.x}%`,
                        top: `${batchCertConfig.positions.activityName.y}%`,
                        fontSize: `${batchCertConfig.positions.activityName.fontSize * 0.45}px`,
                        color: batchCertConfig.positions.activityName.color
                      } : {
                        left: '50%',
                        top: '60%',
                        fontSize: '12px',
                        color: '#334155'
                      }}
                    >
                      {batchItem.activityTitle} {batchItem.level === 'ม.ต้น' ? 'ระดับชั้นมัธยมศึกษาตอนต้น' : 'ระดับชั้นมัธยมศึกษาตอนปลาย'}
                    </div>
                  )}

                  {/* Configured Certificate ID */}
                  {(batchCertConfig?.visibleElements?.certId ?? true) && (
                    <div
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 font-mono whitespace-nowrap"
                      style={batchCertConfig?.positions?.certId ? {
                        left: `${batchCertConfig.positions.certId.x}%`,
                        top: `${batchCertConfig.positions.certId.y}%`,
                        fontSize: `${batchCertConfig.positions.certId.fontSize * 0.45}px`,
                        color: batchCertConfig.positions.certId.color
                      } : {
                        left: '75%',
                        top: '88%',
                        fontSize: '9px',
                        color: '#64748b'
                      }}
                    >
                      {batchItem.certificateId}
                    </div>
                  )}

                  {!batchCertConfig?.bgImageUrl && (
                    <div className="absolute bottom-4 right-8 text-center space-y-0.5 text-[10px] text-slate-600">
                      <div className="w-32 border-b border-slate-400 mx-auto pb-0.5 font-serif text-slate-700 italic">
                        (นายณัฐกิจ คำภูธร)
                      </div>
                      <div className="font-semibold text-slate-800">ประธานกลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี</div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <p className="text-[11px] text-slate-400">ระบบกำลังประมวลผลและรวบรวมเกียรติบัตรทุกรายชื่อในไฟล์เดียว...</p>
          </div>
        </div>
      )}
      
      {/* Sub tabs switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap items-center gap-2">
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

          {/* Requirement: Button to open Certificate Sequence Config Modal */}
          <button
            onClick={() => setIsSeqConfigModalOpen(true)}
            className="px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl font-bold text-xs border border-purple-200 transition-colors flex items-center gap-1.5 ml-auto sm:ml-0"
            title="คลิกเพื่อกำหนดโครงสร้างรันเลขเกียรติบัตร เช่น เลขที่ 1903/2569"
          >
            <Settings className="w-3.5 h-3.5" />
            ตั้งค่ารันเลขเกียรติบัตร ({certSeqConfig.prefix}{certSeqConfig.startingNumber}{certSeqConfig.suffix})
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-bold text-slate-700 px-3 py-3 bg-white/90 rounded-2xl border border-purple-200/80 shadow-2xs">
              <div className="flex flex-wrap items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-600" />
                <span>รายชื่อทีม/ผู้สมัครกิจกรรม "{currentActivity?.title}" ({selectedLevel}):</span>
                <span className="bg-sky-100 text-sky-800 px-2 py-0.5 rounded-md font-extrabold">รวม {activityRegistrations.length} ทีม</span>
              </div>

              {/* Requirement: 1-Click Batch Export All Certificates PDF */}
              <button
                type="button"
                onClick={handleExportBatchPDF}
                disabled={isExportingBatchPDF || activityRegistrations.length === 0}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 hover:opacity-95 text-white rounded-xl font-extrabold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                title="คลิกเดียวเพื่อส่งออกเกียรติบัตรทุกรายชื่อในกิจกรรมนี้เป็นไฟล์ PDF รวมทุกหน้า"
              >
                <Printer className="w-4 h-4" />
                ส่งออกเกียรติบัตรทุกรายชื่อ (PDF รวมทุกหน้า) 📄
              </button>
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

              {/* Certificate ID with Re-check Duplicate Status */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    เลขที่เกียรติบัตร (Certificate ID) *
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoGenerateClick}
                    className="text-[11px] font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 border border-purple-200"
                    title="คำนวณรันเลขอัตโนมัติตามโครงสร้างหลังบ้าน"
                  >
                    <RefreshCw className="w-3 h-3" />
                    ⚡ รันเลขอัตโนมัติถัดไป
                  </button>
                </div>

                <input
                  type="text"
                  required
                  placeholder="เช่น เลขที่ 1903/2569"
                  value={certIdInput}
                  onChange={(e) => setCertIdInput(e.target.value)}
                  className={`w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-mono tracking-wider font-bold transition-all border ${
                    duplicateResult
                      ? 'border-rose-400 bg-rose-50/50 text-rose-900 focus:ring-rose-500'
                      : certIdInput.trim()
                      ? 'border-emerald-400 bg-emerald-50/50 text-emerald-900 focus:ring-emerald-500'
                      : 'border-slate-300 text-purple-700'
                  }`}
                />

                {/* Re-check Status Alert Box */}
                {certIdInput.trim() && (
                  <div className={`mt-2 p-2.5 rounded-xl border text-xs font-semibold flex items-start gap-2 ${
                    duplicateResult
                      ? 'bg-rose-50 border-rose-200 text-rose-800'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  }`}>
                    {duplicateResult ? (
                      <>
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-rose-900">⚠️ แจ้งเตือนเลขซ้ำ:</strong> เลขเกียรติบัตรนี้ถูกบันทึกไปแล้วโดย{' '}
                          <span className="font-bold underline text-rose-900">
                            {duplicateResult.teamName || duplicateResult.members.map(m => m.fullName).join(', ')}
                          </span>{' '}
                          ({duplicateResult.activityTitle})
                        </div>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-emerald-900">✅ รีเช็คเรียบร้อย:</strong> เลขเกียรติบัตรนี้ยังว่างและสามารถใช้งานลงรางวัลได้
                        </div>
                      </>
                    )}
                  </div>
                )}
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
                  className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={!!duplicateResult}
                  className={`px-6 py-2 rounded-xl text-sm font-bold shadow-md transition-all ${
                    duplicateResult
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                      : 'bg-amber-500 hover:bg-amber-600 text-white'
                  }`}
                >
                  {duplicateResult ? '⚠️ ไม่สามารถบันทึก (เลขซ้ำ)' : 'บันทึกผลรางวัล'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Certificate Sequence Setting Modal */}
      {isSeqConfigModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-lg text-slate-900">ตั้งค่าโครงสร้างเลขเกียรติบัตร ({academicYear})</h3>
              </div>
              <button onClick={() => setIsSeqConfigModalOpen(false)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              กำหนดรูปแบบคำนำหน้า เลขรันลำดับเริ่มต้น และคำลงท้าย สำหรับรันเลขเกียรติบัตรอัตโนมัติประจำปีการศึกษา {academicYear}
            </p>

            <form onSubmit={handleSaveSeqConfigSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  คำนำหน้า (Prefix) (พิมพ์เว้นว่างได้ เช่น "เลขที่ " หรือ "")
                </label>
                <input
                  type="text"
                  placeholder='เช่น "เลขที่ " หรือ "ศก.นว."'
                  value={cfgPrefixInput}
                  onChange={(e) => setCfgPrefixInput(e.target.value)}
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-sm font-semibold border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  เลขรันลำดับเริ่มต้น (Starting Number) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="เช่น 1903 หรือ 1"
                  value={cfgStartNumInput}
                  onChange={(e) => setCfgStartNumInput(e.target.value)}
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-sm font-extrabold text-purple-800 border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  คำลงท้าย (Suffix) (เช่น "/2569")
                </label>
                <input
                  type="text"
                  placeholder='เช่น "/2569"'
                  value={cfgSuffixInput}
                  onChange={(e) => setCfgSuffixInput(e.target.value)}
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-sm font-semibold border-slate-300"
                />
              </div>

              {/* Live Preview Box */}
              <div className="bg-purple-50 p-3.5 rounded-2xl border border-purple-200 text-xs text-purple-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  ตัวอย่างรูปแบบเลขที่จะสร้างขึ้นอัตโนมัติ:
                </div>
                <div className="text-base font-mono font-extrabold text-purple-900 text-center py-1 bg-white rounded-xl border border-purple-200 shadow-2xs">
                  {cfgPrefixInput}{cfgStartNumInput || '1'}{cfgSuffixInput}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSeqConfigModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold shadow-md"
                >
                  บันทึกโครงสร้างรันเลข
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
