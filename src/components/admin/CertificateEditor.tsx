import React, { useState, useEffect } from 'react';
import { CertificateConfig, Activity, LevelCategory, TextPosition } from '../../types';
import { getCertificateConfigs, saveCertificateConfig } from '../../services/storage';
import { 
  Upload, 
  Type, 
  Save, 
  Image as ImageIcon,
  Sparkles,
  CheckSquare,
  Square
} from 'lucide-react';

interface CertificateEditorProps {
  activities: Activity[];
  academicYear: string;
}

export const CertificateEditor: React.FC<CertificateEditorProps> = ({
  activities,
  academicYear
}) => {
  const [selectedActivityId, setSelectedActivityId] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<LevelCategory>('ม.ต้น');
  const [bgImageUrl, setBgImageUrl] = useState<string>('');
  const [certificateFont, setCertificateFont] = useState<string>('Sarabun');

  // Element visibility toggles (requirement: เลือกเปิด/ปิด 6 รายการอิสระ)
  const [visibleElements, setVisibleElements] = useState<{
    studentName: boolean;
    award: boolean;
    activityName: boolean;
    levelText: boolean;
    academicYearText: boolean;
    certId: boolean;
  }>({
    studentName: true,
    award: true,
    activityName: true,
    levelText: true,
    academicYearText: true,
    certId: true
  });

  // Text Positions State (IssueDate removed, AcademicYearText separated)
  const [positions, setPositions] = useState<{
    studentName: TextPosition;
    award: TextPosition;
    activityName: TextPosition;
    levelText: TextPosition;
    academicYearText: TextPosition;
    issueDate: TextPosition;
    certId: TextPosition;
  }>({
    studentName: { x: 50, y: 42, fontSize: 34, color: '#0c4a6e', fontWeight: 'bold' },
    award: { x: 50, y: 52, fontSize: 26, color: '#b45309', fontWeight: 'bold' },
    activityName: { x: 50, y: 60, fontSize: 22, color: '#334155', fontWeight: 'bold' },
    levelText: { x: 50, y: 67, fontSize: 18, color: '#475569', fontWeight: 'normal' },
    academicYearText: { x: 50, y: 73, fontSize: 16, color: '#475569', fontWeight: 'normal' },
    issueDate: { x: 25, y: 88, fontSize: 14, color: '#64748b', fontWeight: 'normal' },
    certId: { x: 75, y: 88, fontSize: 14, color: '#64748b', fontWeight: 'normal' },
  });

  const [activeElementKey, setActiveElementKey] = useState<string>('studentName');

  useEffect(() => {
    if (activities.length > 0 && !selectedActivityId) {
      setSelectedActivityId(activities[0].id);
    }
  }, [activities]);

  useEffect(() => {
    const loadConfig = async () => {
      const allConfigs = await getCertificateConfigs();
      const match = allConfigs.find(
        c => c.activityId === selectedActivityId && c.academicYear === academicYear
      );
      if (match) {
        if (match.bgImageUrl) setBgImageUrl(match.bgImageUrl);
        if (match.fontFamily) setCertificateFont(match.fontFamily);
        if (match.positions) setPositions(match.positions);
      } else {
        // Reset background image if no config exists for this activity
        setBgImageUrl('');
      }
    };
    if (selectedActivityId) {
      loadConfig();
    }
  }, [selectedActivityId, academicYear]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBgImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveConfig = async () => {
    if (!selectedActivityId) return;

    const config: CertificateConfig = {
      id: `cert-config-${academicYear}-${selectedActivityId}`,
      academicYear,
      activityId: selectedActivityId,
      level: selectedLevel,
      bgImageUrl,
      fontFamily: certificateFont,
      positions
    };

    await saveCertificateConfig(config);
    alert(`บันทึกรูปแบบการตั้งค่าเกียรติบัตรสำหรับกิจกรรมนี้เรียบร้อยแล้ว! (ใช้รูปแบบและพื้นหลังเดียวกันทั้ง ม.ต้น และ ม.ปลาย)`);
  };

  const handlePositionChange = (key: string, field: keyof TextPosition, val: any) => {
    setPositions(prev => ({
      ...prev,
      [key]: {
        ...prev[key as keyof typeof prev],
        [field]: val
      }
    }));
  };

  const fontOptions = [
    { value: 'Sarabun', label: 'Sarabun (สารบัญ - มาตรฐานราชการ)' },
    { value: 'Prompt', label: 'Prompt (พรม - ทันสมัย อ่านง่าย)' },
    { value: 'Charm', label: 'Charm (ชาม - ลายมืออ่อนช้อย)' },
    { value: 'Chonburi', label: 'Chonburi (ชลบุรี - ตัวหนาพิธีการ)' },
    { value: 'Mali', label: 'Mali (มะลิ - ลายมือน่ารัก)' },
    { value: 'Niramit', label: 'Niramit (นิรมิต - หรูหราเป็นทางการ)' },
  ];

  const getFontClass = (fontName?: string) => {
    switch (fontName || certificateFont) {
      case 'Charm': return 'font-charm';
      case 'Chonburi': return 'font-chonburi';
      case 'Mali': return 'font-mali';
      case 'Niramit': return 'font-niramit';
      case 'Prompt': return 'font-prompt';
      default: return 'font-sarabun';
    }
  };

  const currentActivity = activities.find(a => a.id === selectedActivityId);

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-white/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full inline-flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            1.3 ออกแบบและตั้งค่าเกียรติบัตรออนไลน์ (Canvas Editor)
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800">
            ออกแบบเลือกฟอนต์และองค์ประกอบเกียรติบัตร
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            เลือกข้อความที่ต้องการให้แสดง อัปโหลดเทมเพลต และปรับตำแหน่งข้อความเกียรติบัตร
          </p>
        </div>

        <button
          onClick={handleSaveConfig}
          className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-all flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          บันทึกการตั้งค่าเกียรติบัตร
        </button>
      </div>

      {/* 3-Step Filter Panel */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">1. เลือกปีการศึกษา:</label>
          <div className="glass-input px-3.5 py-2 rounded-xl text-sm font-bold text-purple-700 bg-purple-50/50 border-purple-200">
            ปีการศึกษา {academicYear}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">2. เลือกกิจกรรมการแข่งขัน:</label>
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
          <label className="block text-xs font-bold text-slate-700 mb-1">3. เลือกระดับชั้น:</label>
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

      {/* Editor & Preview Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Controls Sidebar */}
        <div className="space-y-4">
          
          {/* Elements Visibility Toggles */}
          <div className="glass-card p-5 rounded-2xl border border-white/80 space-y-3">
            <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-sky-600" />
              เลือกข้อความที่ต้องการให้แสดงบนใบเกียรติบัตร:
            </label>
            <div className="space-y-2 text-xs font-medium text-slate-700">
              {[
                { key: 'studentName', label: '1. ชื่อ - นามสกุล นักเรียน' },
                { key: 'award', label: '2. รางวัลที่ได้รับ' },
                { key: 'activityName', label: '3. ชื่อกิจกรรม และระดับชั้น (อยู่บรรทัดเดียวกัน)' },
                { key: 'academicYearText', label: '4. ข้อความปีการศึกษา' },
                { key: 'certId', label: '5. รหัสเกียรติบัตร' },
              ].map(el => (
                <label key={el.key} className="flex items-center gap-2 cursor-pointer bg-white p-2 rounded-xl border border-slate-200 hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={visibleElements[el.key as keyof typeof visibleElements] ?? true}
                    onChange={(e) => setVisibleElements({ ...visibleElements, [el.key]: e.target.checked })}
                    className="w-4 h-4 text-sky-600 rounded"
                  />
                  <span>{el.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Font Selector */}
          <div className="glass-card p-5 rounded-2xl border border-white/80 space-y-3">
            <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Type className="w-4 h-4 text-purple-600" />
              เลือกฟอนต์หลักใบเกียรติบัตร (Font Family)
            </label>
            <select
              value={certificateFont}
              onChange={(e) => setCertificateFont(e.target.value)}
              className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-bold text-purple-900 border-purple-300"
            >
              {fontOptions.map(f => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>

          {/* Upload Background Template */}
          <div className="glass-card p-5 rounded-2xl border border-white/80 space-y-3">
            <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-sky-600" />
              อัปโหลดเทมเพลตภาพพื้นหลังใบเกียรติบัตร (JPG/PNG)
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="cert-bg-upload"
              />
              <label
                htmlFor="cert-bg-upload"
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 border border-dashed border-slate-300 rounded-xl text-xs font-bold text-slate-700 cursor-pointer flex items-center justify-center gap-2 transition-colors"
              >
                <Upload className="w-4 h-4 text-slate-500" />
                {bgImageUrl ? 'เปลี่ยนภาพแม่แบบพื้นหลัง' : 'อัปโหลดภาพพื้นหลังเกียรติบัตร'}
              </label>
            </div>
          </div>

          {/* Text Positions Adjuster */}
          <div className="glass-card p-5 rounded-2xl border border-white/80 space-y-4">
            <h4 className="font-bold text-sm text-slate-800 border-b pb-2">
              ปรับตำแหน่งและขนาดข้อความ
            </h4>

            {/* Element Selector */}
            <div className="grid grid-cols-2 gap-1.5 text-xs font-semibold">
              {[
                { id: 'studentName', label: '1. ชื่อนักเรียน' },
                { id: 'award', label: '2. รางวัลที่ได้รับ' },
                { id: 'activityName', label: '3. กิจกรรม & ระดับชั้น' },
                { id: 'academicYearText', label: '4. ปีการศึกษา' },
                { id: 'certId', label: '5. รหัสเกียรติบัตร' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveElementKey(item.id)}
                  className={`px-2.5 py-2 rounded-xl text-left transition-all text-[11px] ${
                    activeElementKey === item.id
                      ? 'bg-sky-600 text-white font-bold shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Controls for Active Element */}
            {activeElementKey && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
                <div className="font-bold text-slate-800 border-b pb-1">
                  ตั้งค่าข้อความ: {activeElementKey}
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">ตำแหน่งแนวนอน X ({positions[activeElementKey as keyof typeof positions]?.x}%)</label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={positions[activeElementKey as keyof typeof positions]?.x || 50}
                    onChange={(e) => handlePositionChange(activeElementKey, 'x', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">ตำแหน่งแนวตั้ง Y ({positions[activeElementKey as keyof typeof positions]?.y}%)</label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={positions[activeElementKey as keyof typeof positions]?.y || 50}
                    onChange={(e) => handlePositionChange(activeElementKey, 'y', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-600 mb-1">ขนาดฟอนต์ (px)</label>
                    <input
                      type="number"
                      min={10}
                      max={72}
                      value={positions[activeElementKey as keyof typeof positions]?.fontSize || 20}
                      onChange={(e) => handlePositionChange(activeElementKey, 'fontSize', parseInt(e.target.value))}
                      className="glass-input p-1.5 rounded-lg w-full text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1">สีข้อความ</label>
                    <input
                      type="color"
                      value={positions[activeElementKey as keyof typeof positions]?.color || '#000000'}
                      onChange={(e) => handlePositionChange(activeElementKey, 'color', e.target.value)}
                      className="w-full h-8 rounded-lg cursor-pointer border border-slate-300"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Live Canvas Preview with Font Styling & Visibility Controls */}
        <div className="lg:col-span-2 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-1">
            <span>แสดงผลพรีวิวใบเกียรติบัตร (Live Canvas Preview):</span>
            <span className="text-purple-700 font-bold bg-purple-100 px-2 py-0.5 rounded">
              ฟอนต์: {certificateFont}
            </span>
          </div>

          <div className="glass-panel p-4 rounded-3xl border border-white/80 shadow-xl overflow-hidden">
            <div
              className={`w-full aspect-[1.414/1] bg-white relative rounded-2xl overflow-hidden shadow-inner border border-slate-200 ${getFontClass()}`}
              style={{
                backgroundImage: bgImageUrl ? `url(${bgImageUrl})` : 'radial-gradient(circle at 50% 50%, #ffffff 0%, #f0f9ff 100%)',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              {!bgImageUrl && (
                <div className="absolute inset-3 border-2 border-dashed border-sky-300 rounded-xl pointer-events-none" />
              )}

              {/* Student Name */}
              {visibleElements.studentName && (
                <div
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 font-bold whitespace-nowrap transition-all"
                  style={{
                    left: `${positions.studentName.x}%`,
                    top: `${positions.studentName.y}%`,
                    fontSize: `${positions.studentName.fontSize * 0.5}px`,
                    color: positions.studentName.color
                  }}
                >
                  เด็กชายสมชาย ใฝ่ดี (ตัวอย่างชื่อนักเรียน)
                </div>
              )}

              {/* Award */}
              {visibleElements.award && (
                <div
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 font-bold whitespace-nowrap transition-all"
                  style={{
                    left: `${positions.award.x}%`,
                    top: `${positions.award.y}%`,
                    fontSize: `${positions.award.fontSize * 0.5}px`,
                    color: positions.award.color
                  }}
                >
                  รางวัลชนะเลิศ (ตัวอย่างผลรางวัล)
                </div>
              )}

              {/* Activity Name & Level (Combined on same line as requested) */}
              {visibleElements.activityName && (
                <div
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 font-bold whitespace-nowrap transition-all"
                  style={{
                    left: `${positions.activityName.x}%`,
                    top: `${positions.activityName.y}%`,
                    fontSize: `${positions.activityName.fontSize * 0.5}px`,
                    color: positions.activityName.color
                  }}
                >
                  {currentActivity?.title || 'การแข่งขันตอบปัญหาวิทยาศาสตร์'} {selectedLevel === 'ม.ต้น' ? 'ระดับชั้นมัธยมศึกษาตอนต้น' : 'ระดับชั้นมัธยมศึกษาตอนปลาย'}
                </div>
              )}

              {/* Academic Year Text */}
              {visibleElements.academicYearText && (
                <div
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 whitespace-nowrap transition-all"
                  style={{
                    left: `${positions.academicYearText?.x ?? positions.activityName.x}%`,
                    top: `${positions.academicYearText?.y ?? (positions.activityName.y + 7)}%`,
                    fontSize: `${(positions.academicYearText?.fontSize ?? (positions.activityName.fontSize - 4)) * 0.5}px`,
                    color: positions.academicYearText?.color ?? positions.activityName.color
                  }}
                >
                  เนื่องในงานสัปดาห์วิทยาศาสตร์ ประจำปีการศึกษา {academicYear}
                </div>
              )}

              {/* Certificate ID */}
              {visibleElements.certId && (
                <div
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 font-mono whitespace-nowrap transition-all"
                  style={{
                    left: `${positions.certId.x}%`,
                    top: `${positions.certId.y}%`,
                    fontSize: `${positions.certId.fontSize * 0.5}px`,
                    color: positions.certId.color
                  }}
                >
                  NWSP-{academicYear}-001 (รหัสเกียรติบัตร)
                </div>
              )}

            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
