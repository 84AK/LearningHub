'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Lock, Eye, EyeOff, Building2, ChevronRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { saveToGAS } from '@/lib/gas';

interface ResourceCardProps {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  guideUrl: string;
  passwordHash?: string;
  institutionName: string;
  isPasswordProtected?: boolean;
}

export function ResourceCard({ 
  id, 
  title, 
  description, 
  thumbnailUrl, 
  guideUrl, 
  passwordHash, 
  institutionName,
  isPasswordProtected = true 
}: ResourceCardProps) {
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [password, setPassword] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [thumbError, setThumbError] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAccess = async () => {
    // Log activity to GAS first
    try {
      await saveToGAS('saveActivity', {
        payload: {
          resourceId: id,
          resourceTitle: title,
          institutionName,
          timestamp: new Date().toISOString(),
          type: 'access'
        }
      });
    } catch (e) {
      console.error("활동 로그 저장 실패:", e);
    }

    if (isPasswordProtected) {
      if (password.trim() === passwordHash?.toString().trim()) {
        setIsSuccess(true);
        
        // 팝업 차단을 피하기 위해 클릭 즉시 빈 창(또는 로딩창)을 띄움
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write('<html style="background:#f8fafc"><head><title>가이드 불러오는 중...</title><meta charset="UTF-8"></head><body style="display:flex;justify-content:center;align-items:center;height:100vh;margin:0;font-family:-apple-system,BlinkMacSystemFont,sans-serif;color:#64748b;font-weight:bold;">잠시만 기다려주세요. 가이드 문서로 이동합니다...</body></html>');
        }
        
        // 사용자가 성공 화면을 볼 수 있도록 1.5초 대기 후 페이지 이동
        setTimeout(() => {
          if (newWindow) {
            newWindow.location.href = guideUrl;
          } else {
            // 팝업이 차단된 경우 현재 탭에서 강제 이동
            window.location.href = guideUrl;
          }
          
          setShowPasswordInput(false);
          setPassword('');
          setShowPasswordText(false);
          setError(false);
          setIsSuccess(false);
        }, 1500);
      } else {
        setError(true);
      }
    } else {
      window.open(guideUrl, '_blank');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="group bg-white rounded-[2rem] border border-border-subtle overflow-hidden flex flex-col shadow-sm hover:shadow-bold transition-all duration-300 h-full"
    >
      {/* Thumbnail Area */}
      <div className="relative h-48 w-full bg-gray-50 overflow-hidden">
        {thumbnailUrl && !thumbError ? (
          <Image 
            src={thumbnailUrl} 
            alt={title} 
            fill 
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setThumbError(true)}
            unoptimized={thumbnailUrl.includes('notion.so')}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-text-muted gap-2 bg-gradient-to-br from-gray-50 to-gray-100">
            <Building2 size={32} strokeWidth={1.5} />
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">AI Hub Resource</span>
          </div>
        )}
        
        {/* Institution Badge */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-full text-[11px] font-bold text-brand-primary shadow-sm border border-brand-accent uppercase tracking-wider">
            {institutionName}
          </span>
        </div>

        {isPasswordProtected && (
          <div className="absolute top-4 right-4 w-8 h-8 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 shadow-inner">
            <Lock size={14} />
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-text-main mb-2 line-clamp-1 group-hover:text-brand-primary transition-colors">
          {title}
        </h3>
        <p className="text-sm text-text-muted mb-6 line-clamp-2 leading-relaxed flex-1">
          {description || '인공지능 활용 가이드 및 학습 리소스를 확인해보세요.'}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-border-subtle/50 mt-auto">
          <div className="flex items-center gap-1.5 text-text-muted shrink-0">
            <Eye size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Guide</span>
          </div>
          
          <button 
            onClick={() => isPasswordProtected ? setShowPasswordInput(true) : handleAccess()}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-accent text-brand-primary text-xs font-bold rounded-xl hover:bg-brand-primary hover:text-white transition-all group/btn shadow-sm whitespace-nowrap"
          >
            학습 시작
            <ChevronRight size={14} className="transition-transform group-hover/btn:translate-x-1" />
          </button>
        </div>
      </div>

      {/* Password Modal */}
      {mounted && typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showPasswordInput && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-[2.5rem] p-8 lg:p-10 w-full max-w-md shadow-2xl relative overflow-hidden"
              >
                <div className="relative z-10">
                  {isSuccess ? (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex flex-col items-center justify-center py-10"
                    >
                      <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                        <CheckCircle2 className="text-emerald-500" size={40} />
                      </div>
                      <h3 className="text-2xl font-bold text-text-main mb-2">코드 인증 성공!</h3>
                      <p className="text-text-muted text-center font-medium leading-relaxed">
                        가이드 페이지가 곧 열립니다!<br/>
                        <span className="text-xs text-brand-primary opacity-80">(잠시만 기다려주세요...)</span>
                      </p>
                    </motion.div>
                  ) : (
                    <>
                      <div className="w-14 h-14 bg-brand-accent rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-inner">
                        <Lock className="text-brand-primary" size={24} />
                      </div>
                      <h3 className="text-2xl font-display font-bold text-center mb-2">보안 코드 입력</h3>
                      <p className="text-text-muted text-center mb-8 text-sm leading-relaxed px-4">
                        가이드 열람을 위해 지급받은<br /><span className="text-brand-primary font-bold">보안 코드</span>를 입력해 주세요.
                      </p>
                      
                      <div className="space-y-4">
                        <div className="relative">
                          <input 
                            type={showPasswordText ? "text" : "password"}
                            placeholder="••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAccess()}
                            autoFocus
                            className={`w-full pl-5 pr-14 py-4 bg-gray-50 border ${error ? 'border-red-500 animate-shake' : 'border-border-subtle'} rounded-2xl focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-100' : 'focus:ring-brand-accent'} transition-all text-center text-xl tracking-widest font-bold`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswordText(!showPasswordText)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-text-muted hover:text-brand-primary transition-colors"
                            title={showPasswordText ? "비밀번호 숨기기" : "비밀번호 보기"}
                          >
                            {showPasswordText ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                        {error && <p className="text-red-500 text-[11px] text-center font-bold">코드가 일치하지 않습니다. 다시 확인해주세요.</p>}
                        
                        <div className="flex gap-3 pt-2">
                          <button 
                            onClick={() => { setShowPasswordInput(false); setPassword(''); setError(false); }}
                            className="flex-1 py-4 text-xs font-bold text-text-muted hover:bg-gray-100 rounded-2xl transition-all"
                          >
                            닫기
                          </button>
                          <button 
                            onClick={handleAccess}
                            className="flex-[2] py-4 bg-brand-primary text-white text-xs font-bold rounded-2xl hover:bg-brand-dark transition-all shadow-lg shadow-blue-100"
                          >
                            가이드 열기
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-brand-accent/40 rounded-full blur-3xl opacity-50" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </motion.div>
  );
}
