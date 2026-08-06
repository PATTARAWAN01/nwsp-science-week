import React, { useState } from 'react';
import { SchoolLogo } from './SchoolLogo';
import { 
  Trophy, 
  Users, 
  Award, 
  Search, 
  Lock, 
  Menu, 
  X,
  Download
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  academicYear: string;
  isAdminLoggedIn: boolean;
  onOpenAdminLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  academicYear,
  isAdminLoggedIn,
  onOpenAdminLogin
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Requirement: Change menu name from "ค้นหาเกียรติบัตร" to "ดาวน์โหลดเกียรติบัตร"
  const navItems = [
    { id: 'activities', label: 'กิจกรรมการแข่งขัน', icon: Trophy },
    { id: 'registrations', label: 'สรุปการรับสมัคร', icon: Users },
    { id: 'results', label: 'สรุปผลรางวัล', icon: Award },
    { id: 'certificates', label: 'ดาวน์โหลดเกียรติบัตร', icon: Download },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/60 shadow-sm backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & School Header Title with Distinct Year Color Accent */}
          <div 
            onClick={() => setActiveTab('activities')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <SchoolLogo size="lg" className="group-hover:scale-105 transition-transform" />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-base sm:text-xl font-extrabold text-slate-900 tracking-tight leading-none">
                  สัปดาห์วิทยาศาสตร์
                </span>
                {/* Requirement: Distinct Vibrant Color Accent for Academic Year (พ.ศ.) */}
                <span className="text-base sm:text-xl bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent font-black px-2 py-0.5 rounded-lg bg-sky-50/80 border border-sky-200/80 shadow-2xs">
                  {academicYear}
                </span>
              </div>
              <span className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
                โรงเรียนหนองวัวซอพิทยาคม
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-slate-100/70 p-1.5 rounded-2xl border border-slate-200/80">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-sky-500/20'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-white/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Admin Action Button */}
          <div className="hidden lg:flex items-center gap-3">
            {isAdminLoggedIn ? (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                  activeTab === 'admin'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-purple-100 text-purple-800 hover:bg-purple-200 border border-purple-200'
                }`}
              >
                <Lock className="w-4 h-4 text-purple-600" />
                หลังบ้านแอดมิน
              </button>
            ) : (
              <button
                onClick={onOpenAdminLogin}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-700 hover:text-purple-700 bg-slate-100 hover:bg-purple-50 border border-slate-200 transition-all flex items-center gap-1.5"
              >
                <Lock className="w-4 h-4 text-slate-500" />
                เข้าสู่ระบบแอดมิน
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden glass-panel border-t border-slate-200/80 p-4 space-y-2 animate-fadeIn">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-3 transition-all ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}

          <div className="pt-2 border-t border-slate-200">
            {isAdminLoggedIn ? (
              <button
                onClick={() => {
                  setActiveTab('admin');
                  setMobileMenuOpen(false);
                }}
                className="w-full px-4 py-3 rounded-xl font-bold text-sm bg-purple-600 text-white flex items-center gap-3"
              >
                <Lock className="w-5 h-5" />
                เข้าสู่แผงควบคุมหลังบ้านแอดมิน
              </button>
            ) : (
              <button
                onClick={() => {
                  onOpenAdminLogin();
                  setMobileMenuOpen(false);
                }}
                className="w-full px-4 py-3 rounded-xl font-bold text-sm bg-slate-100 text-slate-700 flex items-center gap-3"
              >
                <Lock className="w-5 h-5" />
                เข้าสู่ระบบแอดมิน
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
