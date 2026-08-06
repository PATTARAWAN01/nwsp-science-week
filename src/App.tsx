import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ActivityCard } from './components/ActivityCard';
import { ActivityDetailsModal } from './components/ActivityDetailsModal';
import { RegisterModal } from './components/RegisterModal';
import { RegistrationSummary } from './components/RegistrationSummary';
import { ResultsSummary } from './components/ResultsSummary';
import { CertificateSearch } from './components/CertificateSearch';
import { Footer } from './components/Footer';

// Admin Components
import { AdminLogin } from './components/admin/AdminLogin';
import { ActivityManager } from './components/admin/ActivityManager';
import { StudentResultManager } from './components/admin/StudentResultManager';
import { CertificateEditor } from './components/admin/CertificateEditor';

// Storage & Data Services
import { 
  getActivities, 
  getRegistrations, 
  getResults, 
  getCertificateConfigs, 
  getAcademicYear, 
  checkAdminAuth, 
  setAdminAuth 
} from './services/storage';

import { Activity, Registration, CompetitionResult, CertificateConfig } from './types';
import { Trophy, Users, Award, Lock, LogOut } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState('activities');
  const [adminSubTab, setAdminSubTab] = useState('activities');
  
  // Data States
  const [academicYear, setAcademicYearState] = useState('2569');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [results, setResults] = useState<CompetitionResult[]>([]);
  const [certConfigs, setCertConfigs] = useState<CertificateConfig[]>([]);

  // UI States
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedActivityForRegister, setSelectedActivityForRegister] = useState<Activity | null>(null);

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedActivityForDetails, setSelectedActivityForDetails] = useState<Activity | null>(null);

  const [selectedLevelFilter, setSelectedLevelFilter] = useState('ทั้งหมด');

  // Initial Load & Refresh Function
  const loadData = async () => {
    try {
      const year = getAcademicYear();
      setAcademicYearState(year);

      const [actList, regList, resList, configList] = await Promise.all([
        getActivities(year).catch(() => []),
        getRegistrations(year).catch(() => []),
        getResults(year).catch(() => []),
        getCertificateConfigs().catch(() => [])
      ]);

      setActivities(actList || []);
      setRegistrations(regList || []);
      setResults(resList || []);
      setCertConfigs(configList || []);

      setIsAdminLoggedIn(checkAdminAuth());
    } catch (err) {
      console.warn("App loadData fallback warning:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenRegister = (activity?: Activity) => {
    if (activity) {
      setSelectedActivityForRegister(activity);
    } else {
      setSelectedActivityForRegister(null);
    }
    setIsRegisterModalOpen(true);
  };

  const handleOpenDetails = (activity: Activity) => {
    setSelectedActivityForDetails(activity);
    setIsDetailsModalOpen(true);
  };

  const handleAdminLogout = () => {
    setAdminAuth(false);
    setIsAdminLoggedIn(false);
    setActiveTab('activities');
  };

  // Filter activities for homepage card grid
  const filteredActivities = activities.filter(act => {
    const matchesLevel = selectedLevelFilter === 'ทั้งหมด' || act.levels.includes(selectedLevelFilter as any);
    return matchesLevel;
  });

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-cyan-500 selection:text-white">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        academicYear={academicYear}
        isAdminLoggedIn={isAdminLoggedIn}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
      />

      {/* Main Body Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* PUBLIC TAB 1: Activities Grid (หน้าหลักแสดงรายละเอียดการแข่งขัน) */}
        {activeTab === 'activities' && (
          <div className="space-y-8">
            <Hero
              academicYear={academicYear}
              totalActivities={activities.length}
              totalRegistrations={registrations.length}
              selectedLevelFilter={selectedLevelFilter}
              setSelectedLevelFilter={setSelectedLevelFilter}
            />

            {/* Activities Card List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-sky-600" />
                  รายการกิจกรรมการแข่งขัน ({filteredActivities.length} กิจกรรม)
                </h2>
                {selectedLevelFilter !== 'ทั้งหมด' && (
                  <span className="text-xs font-bold text-sky-700 bg-sky-100 px-3 py-1 rounded-full">
                    กรอง: {selectedLevelFilter}
                  </span>
                )}
              </div>

              {filteredActivities.length === 0 ? (
                <div className="glass-panel p-12 text-center rounded-3xl space-y-3">
                  <Trophy className="w-12 h-12 text-slate-300 mx-auto" />
                  <h3 className="text-lg font-bold text-slate-700">ไม่พบกิจกรรมการแข่งขัน</h3>
                  <p className="text-xs text-slate-500">
                    ลองสลับระดับชั้นเพื่อดูกิจกรรมอื่นๆ
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredActivities.map((activity, idx) => (
                    <ActivityCard
                      key={activity.id}
                      activity={activity}
                      index={idx}
                      onRegister={handleOpenRegister}
                      onOpenDetails={handleOpenDetails}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PUBLIC TAB 2: Registration Summary (สรุปการรับสมัครแต่ละกิจกรรม) */}
        {activeTab === 'registrations' && (
          <RegistrationSummary
            registrations={registrations}
            activities={activities}
            academicYear={academicYear}
          />
        )}

        {/* PUBLIC TAB 3: Results Summary (สรุปผลการแข่งขัน) */}
        {activeTab === 'results' && (
          <ResultsSummary
            results={results}
            activities={activities}
            academicYear={academicYear}
          />
        )}

        {/* PUBLIC TAB 4: Certificates Search & Download (ดาวน์โหลดเกียรติบัตร) */}
        {activeTab === 'certificates' && (
          <CertificateSearch
            results={results}
            activities={activities}
            certificateConfigs={certConfigs}
            academicYear={academicYear}
          />
        )}

        {/* ADMIN PORTAL TAB */}
        {activeTab === 'admin' && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Admin Bar */}
            <div className="glass-panel p-6 rounded-3xl border border-purple-200 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-2xl shadow-md">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900">แผงควบคุมหลังบ้านแอดมิน (Admin Dashboard)</h2>
                  <p className="text-xs text-slate-500">
                    จัดการข้อมูลการแข่งขัน ผู้สมัคร ผลรางวัล และเกียรติบัตรออนไลน์ ปีการศึกษา {academicYear}
                  </p>
                </div>
              </div>

              <button
                onClick={handleAdminLogout}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 self-start sm:self-center"
              >
                <LogOut className="w-4 h-4" /> ออกจากระบบแอดมิน
              </button>
            </div>

            {/* Admin Sub Navigation Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
              <button
                onClick={() => setAdminSubTab('activities')}
                className={`px-5 py-2.5 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 ${
                  adminSubTab === 'activities'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                    : 'bg-white/80 text-slate-700 hover:bg-white border border-slate-200'
                }`}
              >
                <Trophy className="w-4 h-4" />
                1.1 จัดการกิจกรรมการแข่งขัน
              </button>

              <button
                onClick={() => setAdminSubTab('results')}
                className={`px-5 py-2.5 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 ${
                  adminSubTab === 'results'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                    : 'bg-white/80 text-slate-700 hover:bg-white border border-slate-200'
                }`}
              >
                <Users className="w-4 h-4" />
                1.2 จัดการผลการแข่งขัน & ผู้สมัคร
              </button>

              <button
                onClick={() => setAdminSubTab('certificates')}
                className={`px-5 py-2.5 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 ${
                  adminSubTab === 'certificates'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                    : 'bg-white/80 text-slate-700 hover:bg-white border border-slate-200'
                }`}
              >
                <Award className="w-4 h-4" />
                1.3 ออกแบบเกียรติบัตรออนไลน์ (Canvas)
              </button>
            </div>

            {/* Admin Sub Tab Views */}
            {adminSubTab === 'activities' && (
              <ActivityManager
                activities={activities}
                academicYear={academicYear}
                onRefresh={loadData}
              />
            )}

            {adminSubTab === 'results' && (
              <StudentResultManager
                registrations={registrations}
                results={results}
                activities={activities}
                academicYear={academicYear}
                onRefresh={loadData}
              />
            )}

            {adminSubTab === 'certificates' && (
              <CertificateEditor
                activities={activities}
                academicYear={academicYear}
              />
            )}

          </div>
        )}

      </main>

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <AdminLogin
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={() => {
          setIsAdminLoggedIn(true);
          setActiveTab('admin');
        }}
      />

      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        activities={activities}
        initialActivity={selectedActivityForRegister}
        academicYear={academicYear}
        onSuccess={loadData}
      />

      <ActivityDetailsModal
        isOpen={isDetailsModalOpen}
        activity={selectedActivityForDetails}
        onClose={() => setIsDetailsModalOpen(false)}
        onRegister={handleOpenRegister}
      />

    </div>
  );
}
