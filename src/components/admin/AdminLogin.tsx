import React, { useState } from 'react';
import { setAdminAuth } from '../../services/storage';
import { Lock, KeyRound, AlertCircle, ShieldCheck, X } from 'lucide-react';

interface AdminLoginProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'nwsp1234') {
      setAdminAuth(true);
      setError('');
      setPassword('');
      onLoginSuccess();
      onClose();
    } else {
      setError('รหัสผ่านไม่ถูกต้อง! กรุณาลองใหม่อีกครั้ง');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white/95 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-white/80 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center text-white shadow-lg shadow-purple-500/25">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">เข้าสู่ระบบหลังบ้านแอดมิน</h2>
            <p className="text-xs text-slate-500 mt-1">
              โรงเรียนหนองวัวซอพิทยาคม • ระบบจัดการกิจกรรมและออกเกียรติบัตร
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              ป้อนรหัสผ่านผู้ดูแลระบบ (Admin Password):
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                placeholder="ป้อนรหัสผ่าน"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm font-semibold text-slate-800 border-slate-300"
                autoFocus
              />
            </div>
            {error && (
              <p className="text-xs font-bold text-rose-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" /> {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all"
          >
            เข้าสู่ระบบแอดมิน
          </button>
        </form>
      </div>
    </div>
  );
};
