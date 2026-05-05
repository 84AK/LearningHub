'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchFromGAS } from '@/lib/gas';
import { LogIn, ShieldAlert, GraduationCap, User, Lock, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('아이디와 비밀번호를 모두 입력해 주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchFromGAS<any>('adminLogin', { username, password });
      
      if (result && result.success) {
        // 관리자 세션 저장 (단순 구현)
        localStorage.setItem('vcep_admin', JSON.stringify(result.user));
        router.push('/admin');
      } else {
        setError(result?.message || '로그인에 실패했습니다. 정보를 다시 확인해 주세요.');
      }
    } catch (err) {
      console.error(err);
      setError('서버 통신 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#f8fafc] relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-accent/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-primary/10 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[440px] z-10"
      >
        <div className="bg-white/80 backdrop-blur-2xl border border-white border-opacity-50 rounded-[2.5rem] p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] overflow-hidden relative">
          
          <div className="flex flex-col items-center mb-10">
            <motion.div 
              whileHover={{ rotate: 15, scale: 1.1 }}
              className="w-16 h-16 bg-gradient-to-br from-brand-primary to-[#6366f1] text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-brand-primary/20"
            >
              <GraduationCap size={36} />
            </motion.div>
            <h1 className="text-3xl font-display font-black text-text-main tracking-tight mb-2">관리자 로그인</h1>
            <p className="text-text-muted text-sm font-medium">학습 리소스를 관리하기 위해 로그인하세요.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest ml-1">Admin ID</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-primary transition-colors">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  placeholder="아이디를 입력하세요"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary focus:bg-white transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-primary transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary focus:bg-white transition-all font-medium"
                />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold flex items-center gap-3 border border-red-100"
                >
                  <ShieldAlert size={16} />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-brand-primary text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl shadow-brand-primary/20 mt-4 group"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>로그인 하기</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-gray-100 text-center">
            <p className="text-[11px] text-text-muted font-medium leading-relaxed">
              관리자 계정 문의는 아래 메일로 연락주세요.<br/>
              <span className="text-brand-primary font-bold">mosebb@gmail.com</span>
            </p>
          </div>
        </div>

        <Link href="/" className="mt-10 flex items-center justify-center gap-2 text-sm font-bold text-text-muted hover:text-brand-primary transition-colors group">
          <ArrowRight size={16} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
          <span>메인 페이지로 돌아가기</span>
        </Link>
      </motion.div>
    </main>
  );
}
