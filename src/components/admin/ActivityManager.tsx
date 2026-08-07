import React, { useState } from 'react';
import { Activity, LevelCategory } from '../../types';
import { saveActivity, deleteActivity, setAcademicYear } from '../../services/storage';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  User, 
  CheckSquare, 
  Square,
  Sparkles,
  UserPlus,
  X,
  RefreshCw,
  Power,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

interface ActivityManagerProps {
  activities: Activity[];
  academicYear: string;
  onRefresh: () => void;
}

export const ActivityManager: React.FC<ActivityManagerProps> = ({
  activities,
  academicYear,
  onRefresh
}) => {
  const [editingYear, setEditingYear] = useState(academicYear);
  const [newYearInput, setNewYearInput] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'individual' | 'team'>('team');
  const [teamSize, setTeamSize] = useState(3);
  const [teachersText, setTeachersText] = useState('');
  const [levels, setLevels] = useState<LevelCategory[]>(['ม.ต้น', 'ม.ปลาย']);
  const [details, setDetails] = useState('');
  const [rules, setRules] = useState('');
  const [awardsText, setAwardsText] = useState('รางวัลชนะเลิศ, รองชนะเลิศอันดับ 1-2 รับเกียรติบัตรพร้อมของรางวัล และผู้เข้าร่วมรับเกียรติบัตรออนไลน์ทุกคน');
  
  // Schedules for Junior (ม.ต้น)
  const [juniorDate, setJuniorDate] = useState('');
  const [juniorTime, setJuniorTime] = useState('');
  const [juniorLocation, setJuniorLocation] = useState('');

  // Schedules for Senior (ม.ปลาย)
  const [seniorDate, setSeniorDate] = useState('');
  const [seniorTime, setSeniorTime] = useState('');
  const [seniorLocation, setSeniorLocation] = useState('');

  const [isOpen, setIsOpen] = useState(true);

  // 1-Click Instant Open/Close Registration Toggle Handler
  const handleToggleStatus = async (act: Activity) => {
    const updatedActivity: Activity = {
      ...act,
      isOpen: !act.isOpen
    };
    await saveActivity(updatedActivity);
    onRefresh();
  };

  const handleOpenAdd = () => {
    setEditingActivity(null);
    setTitle('');
    setType('team');
    setTeamSize(3);
    setTeachersText('');
    setLevels(['ม.ต้น', 'ม.ปลาย']);
    setDetails('');
    setRules('');
    setAwardsText('รางวัลชนะเลิศ, รองชนะเลิศอันดับ 1-2 รับเกียรติบัตรพร้อมของรางวัล และผู้เข้าร่วมรับเกียรติบัตรออนไลน์ทุกคน');
    setJuniorDate('');
    setJuniorTime('');
    setJuniorLocation('');
    setSeniorDate('');
    setSeniorTime('');
    setSeniorLocation('');
    setIsOpen(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (act: Activity) => {
    setEditingActivity(act);
    setTitle(act.title);
    setType(act.type);
    setTeamSize(act.teamSize);
    setTeachersText(act.teachers ? act.teachers.join(', ') : '');
    setLevels(act.levels || []);
    setDetails(act.details);
    setRules(act.rules);
    setAwardsText(act.awardsText || 'รางวัลชนะเลิศ, รองชนะเลิศอันดับ 1-2 รับเกียรติบัตรพร้อมของรางวัล และผู้เข้าร่วมรับเกียรติบัตรออนไลน์ทุกคน');
    
    // Separate schedules for Junior vs Senior
    setJuniorDate(act.schedules.junior?.date || act.schedules.general?.date || '');
    setJuniorTime(act.schedules.junior?.time || act.schedules.general?.time || '');
    setJuniorLocation(act.schedules.junior?.location || act.schedules.general?.location || '');

    setSeniorDate(act.schedules.senior?.date || '');
    setSeniorTime(act.schedules.senior?.time || '');
    setSeniorLocation(act.schedules.senior?.location || '');

    setIsOpen(act.isOpen);
    setIsModalOpen(true);
  };

  const handleYearChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newYearInput.trim()) return;
    await setAcademicYear(newYearInput.trim());
    setEditingYear(newYearInput.trim());
    setNewYearInput('');
    onRefresh();
    alert(`เปลี่ยนปีการศึกษาแสดงผลเป็นปี ${newYearInput.trim()} เรียบร้อยแล้ว`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const teacherArray = teachersText
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const hasJunior = levels.includes('ม.ต้น');
    const hasSenior = levels.includes('ม.ปลาย');

    const updatedActivity: Activity = {
      id: editingActivity ? editingActivity.id : `act-${Date.now()}`,
      academicYear: editingActivity ? editingActivity.academicYear : academicYear,
      title: title.trim(),
      type,
      teamSize: type === 'team' ? Math.max(2, teamSize) : 1,
      teachers: teacherArray,
      levels,
      details,
      rules,
      awardsText: awardsText.trim() || 'รางวัลชนะเลิศ, รองชนะเลิศอันดับ 1-2 รับเกียรติบัตรพร้อมของรางวัล และผู้เข้าร่วมรับเกียรติบัตรออนไลน์ทุกคน',
      schedules: {
        junior: (hasJunior && juniorDate) ? { date: juniorDate, time: juniorTime, location: juniorLocation } : undefined,
        senior: (hasSenior && seniorDate) ? { date: seniorDate, time: seniorTime, location: seniorLocation } : undefined,
        general: (!juniorDate && !seniorDate) ? { date: 'กำหนดในวันแข่ง', time: '12.00 น.', location: 'อาคารเรียน' } : undefined
      },
      isOpen,
      createdAt: editingActivity ? editingActivity.createdAt : new Date().toISOString()
    };

    await saveActivity(updatedActivity);
    setIsModalOpen(false);
    onRefresh();
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`คุณต้องการลบกิจกรรม "${name}" ใช่หรือไม่?`)) {
      await deleteActivity(id);
      onRefresh();
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= activities.length) return;

    const currentAct = activities[index];
    const targetAct = activities[targetIndex];

    const currentOrder = currentAct.order ?? (index + 1);
    const targetOrder = targetAct.order ?? (targetIndex + 1);

    const updatedCurrent: Activity = { ...currentAct, order: targetOrder };
    const updatedTarget: Activity = { ...targetAct, order: currentOrder };

    await saveActivity(updatedCurrent);
    await saveActivity(updatedTarget);
    onRefresh();
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Year Switcher Panel */}
      <div className="glass-panel p-6 rounded-3xl border border-white/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold text-purple-700 bg-purple-100 px-3 py-1 rounded-full inline-flex items-center gap-1.5 mb-1">
            <Calendar className="w-3.5 h-3.5" />
            ตั้งค่าปีการศึกษา (Multi-Academic Year)
          </div>
          <h3 className="text-xl font-bold text-slate-800">
            ปีการศึกษาปัจจุบันที่แสดงผลหน้าแรก: <span className="text-purple-600 font-extrabold">{academicYear}</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            เมื่อเข้าสู่ปีการศึกษาใหม่ แอดมินสามารถป้อนปีการศึกษาเพื่อเปิดรับสมัครใหม่ โดยระบบจะเก็บสถิติปีก่อนหน้าไว้ทั้งหมด
          </p>
        </div>

        <form onSubmit={handleYearChangeSubmit} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="เช่น 2570"
            value={newYearInput}
            onChange={(e) => setNewYearInput(e.target.value)}
            className="glass-input px-3.5 py-2 rounded-xl text-sm font-bold text-slate-800 w-32 border-slate-300"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4" />
            เปลี่ยนปีการศึกษา
          </button>
        </form>
      </div>

      {/* Activities Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">จัดการกิจกรรมการแข่งขัน ({activities.length} รายการ)</h2>
          <p className="text-xs text-slate-500">จัดลำดับ เปิด-ปิดการรับสมัคร เพิ่ม แก้ไข ลบ กำหนดครูผู้ดูแล กติกา และรางวัลการแข่งขันประจำปี {academicYear}</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-sky-500/20 hover:scale-[1.02] transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          เพิ่มกิจกรรมการแข่งขันใหม่
        </button>
      </div>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activities.map((act, idx) => (
          <div key={act.id} className="glass-card p-6 rounded-3xl border border-white/80 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-800 text-white font-extrabold text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    act.type === 'team' ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {act.type === 'team' ? `ทีม (${act.teamSize} คน)` : 'เดี่ยว (1 คน)'}
                  </span>
                </div>

                <button
                  onClick={() => handleToggleStatus(act)}
                  className={`px-3 py-1 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1.5 border shadow-2xs ${
                    act.isOpen
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200'
                      : 'bg-rose-100 text-rose-900 border-rose-300 hover:bg-rose-200'
                  }`}
                  title="คลิกเพื่อเปิดหรือปิดการรับสมัครกิจกรรมนี้ทันที"
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${act.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                  {act.isOpen ? '🟢 เปิดรับสมัคร (กดเพื่อปิด)' : '🔴 ปิดรับสมัคร (กดเพื่อเปิด)'}
                </button>
              </div>

              <h3 className="font-bold text-lg text-slate-800">{act.title}</h3>

              {act.teachers && act.teachers.length > 0 && (
                <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                  <strong>ครูผู้ดูแล:</strong> {act.teachers.join(', ')}
                </div>
              )}

              {act.awardsText && (
                <div className="text-xs text-rose-800 bg-rose-50/80 p-2.5 rounded-xl border border-rose-100 font-semibold">
                  <strong>🎁 รางวัล:</strong> {act.awardsText}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div className="flex items-center gap-1">
                {act.levels.map(l => (
                  <span key={l} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-bold">
                    {l}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                {/* 1-Click Up/Down Reorder Controls */}
                <div className="flex items-center gap-1 border-r border-slate-200 pr-2 mr-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMoveOrder(idx, 'up')}
                    className="p-1.5 bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-800 disabled:opacity-30 disabled:hover:bg-slate-100 rounded-lg text-xs font-bold transition-colors"
                    title="ขยับขึ้นด้านบน"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === activities.length - 1}
                    onClick={() => handleMoveOrder(idx, 'down')}
                    className="p-1.5 bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-800 disabled:opacity-30 disabled:hover:bg-slate-100 rounded-lg text-xs font-bold transition-colors"
                    title="ขยับลงด้านล่าง"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => handleOpenEdit(act)}
                  className="px-3 py-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" /> แก้ไข
                </button>
                <button
                  onClick={() => handleDelete(act.id, act.title)}
                  className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> ลบ
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Activity Modal (With Awards Text Field & Separate Schedules) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-white/80 space-y-5 my-8">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-xl font-extrabold text-slate-900">
                {editingActivity ? 'แก้ไขกิจกรรมการแข่งขัน' : 'เพิ่มกิจกรรมการแข่งขันใหม่'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full text-slate-400 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              
              {/* Toggle Switch */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">สถานะการเปิดรับสมัครกิจกรรมนี้</span>
                  <span className="text-[11px] text-slate-500">เลือกเปิดให้ผู้สมัครลงทะเบียน หรือปิดรับสมัครสำหรับกิจกรรมนี้</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(!isOpen)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    isOpen
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                      : 'bg-rose-600 text-white shadow-md shadow-rose-500/20'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  {isOpen ? '🟢 เปิดรับสมัครอยู่' : '🔴 ปิดรับสมัครแล้ว'}
                </button>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อกิจกรรมการแข่งขัน *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น การแข่งขันตอบปัญหาวิทยาศาสตร์"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-semibold border-slate-300"
                />
              </div>

              {/* Type & Team Size */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">รูปแบบการแข่ง</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full glass-input px-3.5 py-2 rounded-xl text-sm font-semibold border-slate-300"
                  >
                    <option value="individual">แข่งประเภทเดี่ยว (1 คน)</option>
                    <option value="team">แข่งประเภททีม</option>
                  </select>
                </div>

                {type === 'team' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">จำนวนคนในทีม *</label>
                    <input
                      type="number"
                      min={2}
                      max={10}
                      value={teamSize}
                      onChange={(e) => setTeamSize(parseInt(e.target.value))}
                      className="w-full glass-input px-3.5 py-2 rounded-xl text-sm font-semibold border-slate-300"
                    />
                  </div>
                )}
              </div>

              {/* Teachers in Charge */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ครูผู้ดูแลกิจกรรม (คั่นด้วยเครื่องหมายจุลภาค , )
                </label>
                <input
                  type="text"
                  placeholder="เช่น นางจงกลณี โฮซิน, นายณัฐกิจ คำภูธร"
                  value={teachersText}
                  onChange={(e) => setTeachersText(e.target.value)}
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-sm border-slate-300"
                />
              </div>

              {/* Requirement: Awards Text Input Field (รางวัลการแข่งขัน) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  รางวัลการแข่งขัน (เช่น เงินรางวัล ถ้วยรางวัล หรือเกียรติบัตร) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น รางวัลชนะเลิศ เกียรติบัตรพร้อมเงินรางวัล 500 บาท, ผู้เข้าร่วมรับเกียรติบัตรทุกคน"
                  value={awardsText}
                  onChange={(e) => setAwardsText(e.target.value)}
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm font-medium border-slate-300 text-rose-900"
                />
              </div>

              {/* Grade Level Checkboxes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">ระดับชั้นที่ให้เปิดแข่ง (Checklist):</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={levels.includes('ม.ต้น')}
                      onChange={(e) => {
                        if (e.target.checked) setLevels([...levels, 'ม.ต้น']);
                        else setLevels(levels.filter(l => l !== 'ม.ต้น'));
                      }}
                      className="w-4 h-4 text-sky-600 rounded"
                    />
                    มัธยมศึกษาตอนต้น (ม.1-3)
                  </label>

                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={levels.includes('ม.ปลาย')}
                      onChange={(e) => {
                        if (e.target.checked) setLevels([...levels, 'ม.ปลาย']);
                        else setLevels(levels.filter(l => l !== 'ม.ปลาย'));
                      }}
                      className="w-4 h-4 text-purple-600 rounded"
                    />
                    มัธยมศึกษาตอนปลาย (ม.4-6)
                  </label>
                </div>
              </div>

              {/* Separate Schedules for Junior (ม.ต้น) and Senior (ม.ปลาย) */}
              <div className="space-y-3 pt-1">
                <label className="block text-xs font-bold text-slate-800 border-b pb-1">
                  กำหนดการแข่งขัน วัน-เวลา-สถานที่ (แยกตามช่วงชั้น):
                </label>

                {levels.includes('ม.ต้น') && (
                  <div className="space-y-2 bg-sky-50/80 p-3.5 rounded-2xl border border-sky-200">
                    <span className="text-xs font-bold text-sky-900 flex items-center gap-1.5">
                      📍 กำหนดการแข่งขัน ระดับมัธยมศึกษาตอนต้น (ม.ต้น):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[11px] text-slate-600 mb-0.5">วันที่แข่งขัน ม.ต้น</label>
                        <input
                          type="text"
                          placeholder="เช่น 18 ส.ค. 2569"
                          value={juniorDate}
                          onChange={(e) => setJuniorDate(e.target.value)}
                          className="glass-input px-3 py-1.5 rounded-lg text-xs w-full font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-600 mb-0.5">เวลาแข่งขัน ม.ต้น</label>
                        <input
                          type="text"
                          placeholder="เช่น 09.00 - 12.00 น."
                          value={juniorTime}
                          onChange={(e) => setJuniorTime(e.target.value)}
                          className="glass-input px-3 py-1.5 rounded-lg text-xs w-full font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-600 mb-0.5">สถานที่แข่ง ม.ต้น</label>
                        <input
                          type="text"
                          placeholder="เช่น ห้องเคมี 314"
                          value={juniorLocation}
                          onChange={(e) => setJuniorLocation(e.target.value)}
                          className="glass-input px-3 py-1.5 rounded-lg text-xs w-full font-medium"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {levels.includes('ม.ปลาย') && (
                  <div className="space-y-2 bg-purple-50/80 p-3.5 rounded-2xl border border-purple-200">
                    <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                      📍 กำหนดการแข่งขัน ระดับมัธยมศึกษาตอนปลาย (ม.ปลาย):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[11px] text-slate-600 mb-0.5">วันที่แข่งขัน ม.ปลาย</label>
                        <input
                          type="text"
                          placeholder="เช่น 18 ส.ค. 2569"
                          value={seniorDate}
                          onChange={(e) => setSeniorDate(e.target.value)}
                          className="glass-input px-3 py-1.5 rounded-lg text-xs w-full font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-600 mb-0.5">เวลาแข่งขัน ม.ปลาย</label>
                        <input
                          type="text"
                          placeholder="เช่น 13.00 - 16.00 น."
                          value={seniorTime}
                          onChange={(e) => setSeniorTime(e.target.value)}
                          className="glass-input px-3 py-1.5 rounded-lg text-xs w-full font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-600 mb-0.5">สถานที่แข่ง ม.ปลาย</label>
                        <input
                          type="text"
                          placeholder="เช่น ห้องชีววิทยา 315"
                          value={seniorLocation}
                          onChange={(e) => setSeniorLocation(e.target.value)}
                          className="glass-input px-3 py-1.5 rounded-lg text-xs w-full font-medium"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Details & Rules Rich Formatting Tip */}
              <div className="bg-sky-50/90 p-3.5 rounded-2xl border border-sky-200 text-xs text-sky-950 space-y-1">
                <div className="font-bold text-sky-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                  ทิปการตกแต่งข้อความ (หัวข้อตัวหนา & เคาะเว้นวรรค):
                </div>
                <p className="text-[11px] text-slate-700">
                  • พิมพ์ <code className="bg-white px-1.5 py-0.5 rounded border border-sky-200 font-mono font-bold text-purple-700">**ข้อความ**</code> เพื่อทำให้กลายเป็น <strong className="font-extrabold text-slate-900">ตัวหนา</strong> (เช่น <span className="font-mono text-purple-700">**รายละเอียดการแข่ง:**</span>)
                </p>
                <p className="text-[11px] text-slate-700">
                  • กด Enter เพื่อขึ้นบรรทัดใหม่ และเคาะ Spacebar เว้นวรรคข้อความได้ตามต้องการโดยระบบจะรักษาการเว้นวรรคไว้ทั้งหมด
                </p>
              </div>

              {/* Details */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">รายละเอียดกิจกรรม</label>
                <textarea
                  rows={4}
                  placeholder="เช่น **คุณสมบัติผู้แข่ง:** นักเรียน ม.1-3&#10;**การเตรียมตัว:** นำอุปกรณ์มาเอง"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full glass-input p-3 rounded-xl text-sm border-slate-300 font-medium leading-relaxed whitespace-pre-wrap"
                />
              </div>

              {/* Rules */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">กติกาการแข่งขัน</label>
                <textarea
                  rows={4}
                  placeholder="เช่น **เกณฑ์ตัดสิน:**&#10;• ความสมบูรณ์ 50 คะแนน&#10;• ความตรงต่อเวลา 50 คะแนน"
                  value={rules}
                  onChange={(e) => setRules(e.target.value)}
                  className="w-full glass-input p-3 rounded-xl text-sm border-slate-300 font-medium leading-relaxed whitespace-pre-wrap"
                />
              </div>

              {/* Submit */}
              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-sky-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-sky-700"
                >
                  บันทึกข้อมูลกิจกรรม
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
