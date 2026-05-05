'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchFromGAS, saveToGAS } from '@/lib/gas';
import { Navbar } from '@/components/Navbar';
import { Building2, Plus, Trash2, Search, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function InstitutionsAdmin() {
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('school');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const savedAdmin = localStorage.getItem('vcep_admin');
    if (!savedAdmin) {
      router.push('/login');
    } else {
      setAdmin(JSON.parse(savedAdmin));
      loadInstitutions();
    }
  }, [router]);

  const loadInstitutions = async () => {
    setLoading(true);
    try {
      const data = await fetchFromGAS<any[]>('getInstitutions');
      if (data) setInstitutions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    setIsSubmitting(true);
    try {
      const success = await saveToGAS('addInstitution', {
        payload: { name: newName, type: newType }
      });
      if (success) {
        setNewName('');
        loadInstitutions();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까? 관련 리소스는 유지되나 기관명이 표시되지 않을 수 있습니다.')) return;
    try {
      const success = await saveToGAS('deleteInstitution', { payload: { id } });
      if (success) loadInstitutions();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = institutions.filter(inst => 
    inst.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && !admin) return null;

  return (
    <main className="p-6 lg:p-10 bg-bg-main min-h-screen">
      <div className="max-w-4xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <button 
              onClick={() => router.push('/admin')}
              className="flex items-center gap-2 text-text-muted hover:text-brand-primary mb-2 transition-colors text-sm font-bold"
            >
              <ArrowLeft size={16} /> 대시보드로 돌아가기
            </button>
            <h1 className="text-3xl font-display font-bold text-text-main">참여 기관 관리</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white px-4 py-2 rounded-2xl border border-border-subtle shadow-sm">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Total</span>
              <p className="text-xl font-bold text-brand-primary">{institutions.length}</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Form */}
          <div className="lg:col-span-1">
            <section className="bg-white p-6 rounded-[2rem] border border-border-subtle shadow-sm sticky top-10">
              <div className="flex items-center gap-2 mb-6">
                <Plus className="text-brand-primary" size={20} />
                <h2 className="text-lg font-bold">새 기관 추가</h2>
              </div>
              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-text-muted mb-1.5 block ml-1 uppercase tracking-wider">Institution Name</label>
                  <input 
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="기관명을 입력하세요"
                    className="w-full px-4 py-3 bg-gray-50 border border-border-subtle rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-text-muted mb-1.5 block ml-1 uppercase tracking-wider">Type</label>
                  <select 
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-border-subtle rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent transition-all appearance-none"
                  >
                    <option value="school">초/중/고등학교</option>
                    <option value="university">대학교/대학원</option>
                    <option value="company">일반 기업</option>
                    <option value="org">기타 단체</option>
                  </select>
                </div>
                <button 
                  disabled={isSubmitting}
                  className="w-full py-4 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-dark transition-all disabled:opacity-50 shadow-lg shadow-blue-100 mt-2"
                >
                  {isSubmitting ? '추가 중...' : '기관 등록하기'}
                </button>
              </form>
            </section>
          </div>

          {/* List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input 
                type="text"
                placeholder="기관명으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-border-subtle rounded-2xl focus:outline-none shadow-sm"
              />
            </div>

            {loading ? (
              <div className="py-20 text-center bg-white rounded-[2rem] border border-border-subtle">
                <p className="text-text-muted animate-pulse">데이터 불러오는 중...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                <AnimatePresence mode="popLayout">
                  {filtered.map((inst) => (
                    <motion.div 
                      key={inst.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white p-5 rounded-2xl border border-border-subtle flex items-center justify-between group hover:border-brand-primary transition-all shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-brand-accent rounded-xl flex items-center justify-center text-brand-primary">
                          <Building2 size={20} />
                        </div>
                        <div>
                          <h3 className="font-bold text-text-main">{inst.name}</h3>
                          <p className="text-xs text-text-muted uppercase tracking-tighter">{inst.type}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDelete(inst.id)}
                        className="p-2 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {filtered.length === 0 && (
                  <div className="py-20 text-center bg-white rounded-[2rem] border border-dashed border-border-subtle">
                    <p className="text-text-muted">등록된 기관이 없습니다.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
