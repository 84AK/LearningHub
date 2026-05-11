'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchFromGAS } from '@/lib/gas';
import { Navbar } from '@/components/Navbar';
import { BarChart3, Users, BookOpen, Clock, ArrowLeft, TrendingUp, Calendar as CalendarIcon } from 'lucide-react';
import { motion } from 'motion/react';

export default function StatisticsAdmin() {
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalViews: 0,
    uniqueResources: 0,
    uniqueInstitutions: 0,
    recentActivityCount: 0,
    topResource: '데이터 없음',
    topInstitution: '데이터 없음'
  });

  useEffect(() => {
    const savedAdmin = localStorage.getItem('vcep_admin');
    if (!savedAdmin) {
      router.push('/login');
    } else {
      setAdmin(JSON.parse(savedAdmin));
      loadStatistics();
    }
  }, [router]);

  const loadStatistics = async () => {
    setLoading(true);
    try {
      const data = await fetchFromGAS<any[]>('getActivities');
      if (data) {
        setActivities(data.reverse()); // 최신순
        
        // 간단한 통계 계산
        const resources = new Set(data.map(a => a.resourceId));
        const institutions = new Set(data.map(a => a.institutionName));
        
        // 최빈값 계산 함수
        const getMostFrequent = (arr: any[]) => {
          if (arr.length === 0) return '데이터 없음';
          const counts = arr.reduce((acc, val) => {
            if (val) acc[val] = (acc[val] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          
          const keys = Object.keys(counts);
          if (keys.length === 0) return '데이터 없음';
          return keys.reduce((a, b) => counts[a] > counts[b] ? a : b);
        };

        const topResourceTitle = getMostFrequent(data.map(a => a.resourceTitle));
        const topInstName = getMostFrequent(data.map(a => a.institutionName));
        
        setStats({
          totalViews: data.length,
          uniqueResources: resources.size,
          uniqueInstitutions: institutions.size,
          recentActivityCount: data.filter(a => {
            const date = new Date(a.timestamp);
            const today = new Date();
            return date.toDateString() === today.toDateString();
          }).length,
          topResource: topResourceTitle,
          topInstitution: topInstName
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !admin) return null;

  return (
    <main className="p-6 lg:p-10 bg-bg-main min-h-screen">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <button 
            onClick={() => router.push('/admin')}
            className="flex items-center gap-2 text-text-muted hover:text-brand-primary mb-2 transition-colors text-sm font-bold"
          >
            <ArrowLeft size={16} /> 대시보드로 돌아가기
          </button>
          <h1 className="text-3xl font-display font-bold text-text-main flex items-center gap-3">
            <BarChart3 className="text-brand-primary" /> 사용 통계 인사이트
          </h1>
        </header>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: '전체 조회수', value: stats.totalViews, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: '학습 리소스 수', value: stats.uniqueResources, icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: '활성 참여 기관', value: stats.uniqueInstitutions, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: '오늘의 학습', value: stats.recentActivityCount, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-[2rem] border border-border-subtle shadow-sm flex items-center gap-5"
            >
              <div className={`w-14 h-14 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center shadow-inner`}>
                <item.icon size={28} />
              </div>
              <div>
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">{item.label}</p>
                <p className="text-2xl font-bold text-text-main">{item.value.toLocaleString()}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity List */}
          <section className="lg:col-span-2 bg-white rounded-[2.5rem] border border-border-subtle shadow-sm overflow-hidden flex flex-col h-[600px]">
            <div className="p-8 border-b border-border-subtle flex items-center justify-between bg-gray-50/50">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <CalendarIcon size={20} className="text-brand-primary" /> 실시간 학습 로그
              </h2>
              <button onClick={loadStatistics} className="text-xs font-bold text-brand-primary hover:underline">
                새로고침
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {activities.length > 0 ? (
                activities.map((activity, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-brand-accent hover:bg-white transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl border border-border-subtle flex items-center justify-center text-text-muted group-hover:text-brand-primary group-hover:border-brand-primary transition-colors shadow-sm">
                        <Users size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-text-main line-clamp-1">{activity.resourceTitle}</p>
                        <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider">{activity.institutionName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-text-muted">{new Date(activity.timestamp).toLocaleDateString()}</p>
                      <p className="text-[10px] font-medium text-brand-primary">{new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-text-muted opacity-50">
                  <BarChart3 size={48} strokeWidth={1} className="mb-4" />
                  <p className="text-sm font-medium">활동 내역이 아직 없습니다.</p>
                </div>
              )}
            </div>
          </section>

          {/* Top Resources Chart Placeholder */}
          <section className="lg:col-span-1 bg-brand-primary rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-200 flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-2xl font-display font-bold mb-6">데이터 요약</h2>
              <div className="space-y-6">
                <div>
                  <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-2">가장 많이 본 자료</p>
                  <p className="text-xl font-bold line-clamp-2">{stats.topResource}</p>
                </div>
                <div>
                  <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-2">최다 접속 기관</p>
                  <p className="text-xl font-bold">{stats.topInstitution}</p>
                </div>
              </div>
            </div>
            <div className="relative z-10 pt-10">
              <div className="w-full h-2 bg-blue-400/30 rounded-full mb-2 overflow-hidden">
                <div className="w-[75%] h-full bg-white rounded-full" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-blue-100">월간 목표 달성률 75%</p>
            </div>
            {/* Decor */}
            <div className="absolute bottom-0 right-0 translate-y-1/4 translate-x-1/4 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          </section>
        </div>
      </div>
    </main>
  );
}
