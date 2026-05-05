'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchFromGAS, saveToGAS } from '@/lib/gas';
import { Plus, Edit2, Trash2, Search, ExternalLink, ShieldCheck, LayoutDashboard, CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminDashboard() {
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resources, setResources] = useState<any[]>([]);
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Toast Notification state
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    institutionId: '',
    guideUrl: '',
    thumbnailUrl: '',
    password: '',
    isPasswordProtected: true
  });

  useEffect(() => {
    const savedAdmin = localStorage.getItem('vcep_admin');
    if (!savedAdmin) {
      router.push('/login');
    } else {
      setAdmin(JSON.parse(savedAdmin));
      loadData();
    }
  }, [router]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [resData, instData] = await Promise.all([
        fetchFromGAS<any[]>('getResources'),
        fetchFromGAS<any[]>('getInstitutions')
      ]);
      if (resData) setResources(resData);
      if (instData) setInstitutions(instData);
    } catch (err) {
      console.error(err);
      showToast('데이터를 불러오는데 실패했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (resource?: any) => {
    if (resource) {
      setEditingResource(resource);
      setFormData({
        title: resource.title,
        description: resource.description || '',
        institutionId: resource.institutionId,
        guideUrl: resource.guideUrl,
        thumbnailUrl: resource.thumbnailUrl || '',
        password: resource.password || '',
        isPasswordProtected: resource.isPasswordProtected ?? true
      });
    } else {
      setEditingResource(null);
      setFormData({
        title: '',
        description: '',
        institutionId: institutions[0]?.id || '',
        guideUrl: '',
        thumbnailUrl: '',
        password: '',
        isPasswordProtected: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const action = editingResource ? 'updateResource' : 'addResource';
      const payload = editingResource ? { ...formData, id: editingResource.id } : formData;
      
      const success = await saveToGAS(action, { payload });
      if (success) {
        showToast(editingResource ? '성공적으로 수정되었습니다!' : '새 자료가 등록되었습니다!');
        setIsModalOpen(false);
        loadData();
      } else {
        showToast('작업 처리에 실패했습니다.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('오류가 발생했습니다.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      const success = await saveToGAS('deleteResource', { payload: { id } });
      if (success) {
        showToast('삭제되었습니다.');
        loadData();
      }
    } catch (err) {
      console.error(err);
      showToast('삭제 중 오류가 발생했습니다.', 'error');
    }
  };

  const filteredResources = resources.filter(res => 
    res.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!admin && loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <Loader2 className="w-10 h-10 text-brand-primary animate-spin" />
      <p className="text-text-muted font-bold animate-pulse">관리자 대시보드 로딩 중...</p>
    </div>
  );

  return (
    <main className="p-6 lg:p-10 bg-bg-main min-h-screen">
      <div className="max-w-[1400px] mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-brand-primary font-bold mb-2">
              <LayoutDashboard size={18} />
              <span className="text-sm uppercase tracking-widest">Admin Dashboard</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-display font-black text-text-main tracking-tight">학습 자료 통합 관리</h1>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-brand-primary text-white font-black rounded-[1.25rem] hover:bg-brand-dark transition-all shadow-xl shadow-brand-primary/20 group active:scale-95"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            새 자료 등록하기
          </button>
        </header>

        {/* Status Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div 
              initial={{ opacity: 0, y: -100, x: '-50%' }}
              animate={{ opacity: 1, y: 20, x: '-50%' }}
              exit={{ opacity: 0, y: -100, x: '-50%' }}
              className={`fixed top-0 left-1/2 z-[110] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border ${
                toast.type === 'success' ? 'bg-white border-emerald-100 text-emerald-600' : 'bg-white border-red-100 text-red-600'
              }`}
            >
              {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              <span className="font-bold">{toast.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: '전체 자료 수', value: resources.length, icon: ShieldCheck, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: '참여 기관 수', value: institutions.length, icon: LayoutDashboard, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: '오늘의 업데이트', value: 'New', icon: Plus, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-[2rem] border border-border-subtle shadow-sm flex items-center gap-5">
              <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center shadow-inner`}>
                <stat.icon size={28} />
              </div>
              <div>
                <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-2xl font-black text-text-main">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-[2.5rem] border border-border-subtle shadow-sm overflow-hidden">
          <div className="p-8 border-b border-border-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-black text-text-main">리소스 라이브러리</h2>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input 
                type="text"
                placeholder="제목으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-border-subtle rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent transition-all text-sm font-medium"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-20 text-center flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
                <p className="text-text-muted font-bold">데이터를 동기화 중입니다...</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/50 border-b border-border-subtle">
                  <tr>
                    <th className="px-8 py-5 text-[11px] font-bold text-text-muted uppercase tracking-widest">ID / Title</th>
                    <th className="px-8 py-5 text-[11px] font-bold text-text-muted uppercase tracking-widest">Institution</th>
                    <th className="px-8 py-5 text-[11px] font-bold text-text-muted uppercase tracking-widest text-center">Status</th>
                    <th className="px-8 py-5 text-[11px] font-bold text-text-muted uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {filteredResources.map((res) => (
                    <tr key={res.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-brand-primary mb-1">#{res.id.substring(0,6)}</span>
                          <span className="font-bold text-text-main group-hover:text-brand-primary transition-colors">{res.title}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-text-muted">
                          {institutions.find(i => i.id === res.institutionId)?.name || '알 수 없음'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className="flex justify-center">
                          {res.isPasswordProtected ? (
                            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 text-orange-600 rounded-lg text-[10px] font-bold">
                              <ShieldCheck size={12} /> LOCKED
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold">PUBLIC</span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleOpenModal(res)}
                            className="p-2 text-text-muted hover:text-brand-primary hover:bg-brand-accent rounded-xl transition-all"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(res.id)}
                            className="p-2 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Resource Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmitting && setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[90vh]">
                <div className="p-8 border-b border-border-subtle flex items-center justify-between bg-gray-50/50">
                  <h2 className="text-2xl font-black text-text-main">
                    {editingResource ? '리소스 수정' : '새 리소스 등록'}
                  </h2>
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)} 
                    className="p-2 hover:bg-gray-100 rounded-full transition-all"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="p-8 space-y-6 overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest ml-1">Title</label>
                      <input 
                        type="text" required
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full px-5 py-4 bg-gray-50 border border-border-subtle rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-accent transition-all font-medium"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest ml-1">Institution</label>
                      <select 
                        required
                        value={formData.institutionId}
                        onChange={(e) => setFormData({...formData, institutionId: e.target.value})}
                        className="w-full px-5 py-4 bg-gray-50 border border-border-subtle rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-accent transition-all font-medium appearance-none"
                      >
                        <option value="">기관 선택</option>
                        {institutions.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest ml-1">Description</label>
                    <textarea 
                      rows={2}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-5 py-4 bg-gray-50 border border-border-subtle rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-accent transition-all font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest ml-1">Guide URL</label>
                      <input 
                        type="url" required
                        value={formData.guideUrl}
                        onChange={(e) => setFormData({...formData, guideUrl: e.target.value})}
                        className="w-full px-5 py-4 bg-gray-50 border border-border-subtle rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-accent transition-all font-medium"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest ml-1">Thumbnail URL (Optional)</label>
                      <input 
                        type="url"
                        value={formData.thumbnailUrl}
                        onChange={(e) => setFormData({...formData, thumbnailUrl: e.target.value})}
                        className="w-full px-5 py-4 bg-gray-50 border border-border-subtle rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-accent transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div className="p-6 bg-brand-accent/30 rounded-[2rem] border border-brand-accent/50 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="text-brand-primary" size={20} />
                        <span className="text-sm font-bold text-brand-primary">보안 코드 설정</span>
                      </div>
                      <input 
                        type="checkbox"
                        checked={formData.isPasswordProtected}
                        onChange={(e) => setFormData({...formData, isPasswordProtected: e.target.checked})}
                        className="w-5 h-5 accent-brand-primary cursor-pointer"
                      />
                    </div>
                    {formData.isPasswordProtected && (
                      <input 
                        type="text"
                        placeholder="접속 시 필요한 코드를 입력하세요"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className="w-full px-5 py-4 bg-white border border-brand-accent rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all font-bold tracking-widest text-center"
                      />
                    )}
                  </div>
                </div>

                <div className="p-8 bg-gray-50 border-t border-border-subtle flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 text-sm font-black text-text-muted hover:bg-gray-100 rounded-2xl transition-all"
                  >
                    취소하기
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-[2] py-4 bg-brand-primary text-white font-black rounded-2xl hover:bg-brand-dark transition-all shadow-xl shadow-brand-primary/20 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        처리 중...
                      </>
                    ) : (
                      editingResource ? '수정사항 저장' : '새 리소스 등록'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
