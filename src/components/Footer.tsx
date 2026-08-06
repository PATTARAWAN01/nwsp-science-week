import React from 'react';
import { SchoolLogo } from './SchoolLogo';
import { Heart, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full glass-panel border-t border-white/60 mt-16 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        
        {/* School branding */}
        <div className="flex items-center gap-3">
          <SchoolLogo size="sm" />
          <div>
            <div className="font-bold text-slate-800 text-sm">
              งานสัปดาห์วิทยาศาสตร์ • โรงเรียนหนองวัวซอพิทยาคม
            </div>
            <p className="text-xs text-slate-500">
              กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี
            </p>
          </div>
        </div>

        {/* Mandatory Credit requirement #9 */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/80 border border-purple-200/80 shadow-xs text-xs font-semibold text-slate-700">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>Created and Developed by <strong className="text-purple-700 font-extrabold">Pattarawan Suwanvapee</strong></span>
        </div>

      </div>
    </footer>
  );
};
