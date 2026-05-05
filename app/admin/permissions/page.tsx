'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchFromGAS } from '@/lib/gas';
import { Navbar } from '@/components/Navbar';
import { ShieldCheck, ArrowLeft, Key, Users, Info, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function PermissionsAdmin() {
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedAdmin = localStorage.getItem('vcep_admin');
    if (!savedAdmin) {
      router.push('/login');
    } else {
      setAdmin(JSON.parse(savedAdmin));
      setLoading(false);
    }
  }, [router]);

  if (loading && !admin) return null;

  return (
    <main className="p-6 lg:p-10 bg-bg-main min-h-screen">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10">
          <button 
            onClick={() => router.push('/admin')}
            className="flex items-center gap-2 text-text-muted hover:text-brand-primary mb-2 transition-colors text-sm font-bold"
          >
            <ArrowLeft size={16} /> 대시보드로 돌아가기
          </button>
          <h1 className="text-3xl font-display font-bold text-text-main flex items-center gap-3">
            <ShieldCheck className="text-brand-primary" /> 접근 권한 설정
          </h1>
        </header>

        <div className="grid grid-cols-1 gap-8">
          {/* Info Card */}
          <section className="bg-white p-8 lg:p-10 rounded-[2.5rem] border border-border-subtle shadow-sm relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-brand-accent rounded-2xl flex items-center justify-center">
                  <Key className="text-brand-primary" size={24} />
                </div>
                <h2 className="text-xl font-bold">통합 계정 관리 안내</h2>
              </div>
              
              <div className="space-y-6 text-text-main">
                <p className="leading-relaxed">
                  현재 AI-Learn Hub의 관리자 계정은 연동된 **구글 스프레드시트의 &lsquo;관리자&rsquo; 시트**를 통해 통합 관리되고 있습니다.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 bg-gray-50 rounded-2xl border border-border-subtle">
                    <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-2">현재 로그인 계정</p>
                    <p className="text-lg font-bold text-brand-primary">{admin?.username}</p>
                  </div>
                  <div className="p-5 bg-gray-50 rounded-2xl border border-border-subtle">
                    <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-2">권한 레벨</p>
                    <p className="text-lg font-bold text-brand-primary">시스템 수퍼 관리자</p>
                  </div>
                </div>

                <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 flex gap-4">
                  <Info className="text-blue-500 shrink-0" size={24} />
                  <div className="text-sm">
                    <p className="font-bold text-blue-900 mb-1">계정 추가 및 비밀번호 변경 방법</p>
                    <p className="text-blue-800 leading-relaxed">
                      새로운 관리자를 추가하거나 비밀번호를 변경하려면 스프레드시트의 **&lsquo;관리자&rsquo;** 시트에 새로운 행을 추가하거나 기존 데이터를 수정해 주세요. 수정 사항은 다음 로그인 시점부터 즉시 적용됩니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* Decor */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-brand-accent/30 rounded-full blur-3xl" />
          </section>

          {/* Warning Section */}
          <section className="bg-red-50 p-8 rounded-[2.5rem] border border-red-100 flex flex-col md:flex-row gap-6 items-center">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center shrink-0">
              <AlertCircle className="text-red-500" size={32} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-900 mb-1">보안 주의사항</h3>
              <p className="text-sm text-red-800 leading-relaxed">
                관리자 계정 정보가 담긴 스프레드시트 파일의 공유 권한을 엄격히 관리해 주세요. 스프레드시트 주소가 노출되더라도 관리자 시트 접근 권한이 없으면 로그인이 불가능하지만, 원본 파일의 보안이 가장 중요합니다.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
