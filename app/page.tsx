'use client';

import { useState, useEffect } from 'react';
import { fetchFromGAS } from '@/lib/gas';
import { ResourceCard } from '@/components/ResourceCard';
import { Search, BookOpen, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Home() {
  const [resources, setResources] = useState<any[]>([]);
  const [institutions, setInstitutions] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resData, instData] = await Promise.all([
        fetchFromGAS<any[]>('getResources'),
        fetchFromGAS<any[]>('getInstitutions')
      ]);

      if (resData) setResources(resData);
      if (instData) {
        const instMap = instData.reduce((acc, curr) => {
          acc[curr.id] = curr.name;
          return acc;
        }, {} as Record<string, string>);
        setInstitutions(instMap);
      }
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredResources = resources.filter(res => 
    res.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (institutions[res.institutionId] || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-10 max-w-[1400px] mx-auto">
      <header className="mb-10 lg:mb-16">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl lg:text-5xl font-display font-bold text-text-main mb-4 tracking-tight"
        >
          AI 학습 리소스 센터
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-text-muted text-base lg:text-xl max-w-2xl leading-relaxed"
        >
          기관 및 기업별로 구성된 맞춤형 AI 활용 가이드를 확인하고 실무에 바로 적용해 보세요.
        </motion.p>
      </header>

      {/* 검색 바 */}
      <div className="flex flex-col md:flex-row gap-4 mb-12">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-primary transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="기관명 또는 가이드 제목으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-border-subtle rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-brand-accent/50 focus:border-brand-primary transition-all shadow-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-64 bg-white/50 animate-pulse rounded-[2rem] border border-border-subtle" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          <AnimatePresence mode="popLayout">
            {filteredResources.map((resource) => (
              <ResourceCard
                key={resource.id}
                id={resource.id}
                title={resource.title}
                description={resource.description}
                thumbnailUrl={resource.thumbnailUrl}
                guideUrl={resource.guideUrl}
                passwordHash={resource.password}
                institutionName={institutions[resource.institutionId] || '교육 기관'}
                isPasswordProtected={resource.isPasswordProtected}
              />
            ))}
          </AnimatePresence>
          
          {filteredResources.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-24 text-center bg-white rounded-[2.5rem] border border-dashed border-border-subtle shadow-inner"
            >
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <BookOpen className="text-text-muted" size={32} />
              </div>
              <p className="text-text-muted font-bold text-lg">검색 결과가 없습니다.</p>
              <button 
                onClick={() => setSearchTerm('')} 
                className="mt-4 px-6 py-2 bg-brand-accent text-brand-primary text-sm font-bold rounded-full hover:bg-brand-primary hover:text-white transition-all"
              >
                모든 자료 보기
              </button>
            </motion.div>
          )}
        </div>
      )}

      {/* 서비스 안내 섹션 */}
      <section className="mt-24 p-8 lg:p-16 bg-white rounded-[3rem] border border-border-subtle shadow-sm relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 bg-brand-accent rounded-2xl flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform">
              <Sparkles className="text-brand-primary" size={26} />
            </div>
            <h2 className="text-2xl lg:text-3xl font-display font-bold">서비스 제안 및 향후 계획</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <h3 className="font-bold text-xl text-brand-primary">개인화 학습 진행도</h3>
              <p className="text-text-muted text-sm lg:text-base leading-relaxed">각 가이드에 '수강 완료' 체크 기능을 넣어 사용자의 학습 이력을 트래킹합니다.</p>
            </div>
            <div className="space-y-4">
              <h3 className="font-bold text-xl text-brand-primary">비밀번호 만료 정책</h3>
              <p className="text-text-muted text-sm lg:text-base leading-relaxed">특정 기간이 지나면 자동으로 접속 권한을 회수하는 보안 시스템을 구축합니다.</p>
            </div>
            <div className="space-y-4">
              <h3 className="font-bold text-xl text-brand-primary">대시보드 인사이트</h3>
              <p className="text-text-muted text-sm lg:text-base leading-relaxed">어떤 가이드가 가장 많이 조회되었는지 데이터를 시각화하여 제공합니다.</p>
            </div>
          </div>
        </div>
        {/* Background Decor */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-brand-accent/30 rounded-full blur-[100px] opacity-60" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-80 h-80 bg-blue-100/20 rounded-full blur-[80px]" />
      </section>

      <footer className="mt-20 py-12 border-t border-border-subtle flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-brand-primary rounded flex items-center justify-center">
            <GraduationCap className="text-white w-4 h-4" />
          </div>
          <p className="text-sm text-text-muted font-bold tracking-tight uppercase">AI-Learn Hub v2.0</p>
        </div>
        <div className="flex gap-8 items-center">
          <a href="https://litt.ly/aklabs" target="_blank" rel="noopener noreferrer" className="text-sm text-text-muted hover:text-brand-primary transition-colors font-bold">AK Labs</a>
          <span className="w-1 h-1 bg-gray-300 rounded-full" />
          <p className="text-sm text-text-muted font-medium">© 2026. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

import { GraduationCap } from 'lucide-react';
