'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchFromGAS, saveToGAS } from '@/lib/gas';
import { Navbar } from '@/components/Navbar';
import Image from 'next/image';
import { Plus, Trash2, Building2, BookOpen, Key, Link as LinkIcon, Image as ImageIcon, RefreshCcw, Info, Monitor, X, Edit } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Random Password Generator
const generatePassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Thumbnail Component for independent error handling
function ResourceThumbnail({ url }: { url?: string }) {
  const [error, setError] = useState(false);
  
  if (!url || error) {
    return <ImageIcon size={20} />;
  }

  return (
    <Image 
      src={url} 
      alt="" 
      fill 
      unoptimized={url.includes('notion.so')}
      className="object-cover" 
      referrerPolicy="no-referrer"
      onError={() => setError(true)}
    />
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [institutions, setInstitutions] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  
  // Form States
  const [instName, setInstName] = useState('');
  const [instType, setInstType] = useState('school');
  const [resTitle, setResTitle] = useState('');
  const [resDesc, setResDesc] = useState('');
  const [resInstId, setResInstId] = useState('');
  const [resGuideUrl, setResGuideUrl] = useState('');
  const [resThumbUrl, setResThumbUrl] = useState('');
  const [resPassword, setResPassword] = useState('');
  const [isResPasswordProtected, setIsResPasswordProtected] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auth Check
  useEffect(() => {
    const savedAdmin = localStorage.getItem('vcep_admin');
    if (!savedAdmin) {
      router.push('/login');
    } else {
      setAdmin(JSON.parse(savedAdmin));
      loadAllData();
    }
  }, [router]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const instData = await fetchFromGAS<any[]>('getInstitutions');
      if (instData) setInstitutions(instData);

      const resData = await fetchFromGAS<any[]>('getResources');
      if (resData) setResources(resData);
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddInstitution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instName) return;
    setIsSubmitting(true);
    try {
      const success = await saveToGAS('addInstitution', {
        payload: { name: instName, type: instType }
      });
      if (success) {
        setInstName('');
        loadAllData(); // Refresh
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resTitle || !resInstId || !resGuideUrl) return;
    if (isResPasswordProtected && !resPassword) return;

    setIsSubmitting(true);
    try {
      const resourceData = {
        title: resTitle,
        description: resDesc,
        institutionId: resInstId,
        guideUrl: resGuideUrl,
        thumbnailUrl: resThumbUrl,
        password: isResPasswordProtected ? resPassword : '',
        isPasswordProtected: isResPasswordProtected,
        updatedAt: new Date().toISOString(),
      };

      let success;
      if (editingId) {
        success = await saveToGAS('updateResource', {
          payload: { id: editingId, ...resourceData }
        });
        setEditingId(null);
      } else {
        success = await saveToGAS('addResource', {
          payload: resourceData
        });
      }
      
      if (success) {
        setResTitle(''); setResDesc(''); setResGuideUrl(''); setResThumbUrl(''); setResPassword(''); setResInstId('');
        loadAllData();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditStart = (res: any) => {
    setEditingId(res.id);
    setResTitle(res.title);
    setResDesc(res.description || '');
    setResInstId(res.institutionId);
    setResGuideUrl(res.guideUrl);
    setResThumbUrl(res.thumbnailUrl || '');
    setResPassword(res.password || '');
    setIsResPasswordProtected(res.isPasswordProtected !== false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [deleteId, setDeleteId] = useState<{coll: string, id: string} | null>(null);
  const [largeDisplay, setLargeDisplay] = useState<{title: string, password: string} | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const action = deleteId.coll === 'institutions' ? 'deleteInstitution' : 'deleteResource';
      const success = await saveToGAS(action, { payload: { id: deleteId.id } });
      if (success) {
        setDeleteId(null);
        loadAllData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading && !admin) return (
    <div className="flex items-center justify-center min-h-screen bg-bg-main">
      <div className="w-10 h-10 border-4 border-brand-accent border-t-brand-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <main className="p-10 flex flex-col gap-8 bg-bg-main min-h-screen">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-2">
        <div className="title-group">
          <h1 className="text-3xl font-display font-bold text-text-main mb-1">학습 자료 관리 대시보드</h1>
          <p className="text-sm text-text-muted">학습 리소스를 등록하고 효율적으로 관리하세요.</p>
        </div>
      </header>
      
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteId(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white p-8 rounded-2xl max-w-sm w-full shadow-bold border border-border-subtle">
              <h3 className="text-xl font-bold mb-4 text-text-main">정말 삭제하시겠습니까?</h3>
              <p className="text-sm text-text-muted mb-8">이 작업은 되돌릴 수 없으며 시스템 데이터에 즉시 반영됩니다.</p>
              <div className="flex gap-4">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-3 bg-bg-main border border-border-subtle rounded-xl font-bold text-text-muted transition-colors hover:bg-gray-100">취소</button>
                <button onClick={handleDelete} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors">삭제</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Large Password Display Modal (Presentation Mode) */}
      <AnimatePresence>
        {largeDisplay && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-12">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setLargeDisplay(null)} 
              className="absolute inset-0 bg-brand-primary/95 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, y: 40 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.8, y: 40 }} 
              className="relative w-full max-w-5xl bg-white p-6 md:p-16 rounded-[2rem] md:rounded-[3rem] shadow-bold border border-white/20 text-center"
            >
              <button 
                onClick={() => setLargeDisplay(null)}
                className="absolute top-6 right-6 md:top-10 md:right-10 p-2 md:p-4 rounded-full hover:bg-bg-main text-text-muted transition-all"
              >
                <X size={24} className="md:w-8 md:h-8" />
              </button>
              
              <div className="mb-6 md:mb-12">
                <span className="inline-block px-4 py-1.5 md:px-6 md:py-2 bg-brand-accent text-brand-primary rounded-full text-xs md:text-lg font-bold uppercase tracking-widest mb-4 md:mb-6">
                  Access Password
                </span>
                <h2 className="text-2xl md:text-4xl font-display font-bold text-text-main mb-4 leading-tight">{largeDisplay.title}</h2>
                <div className="w-16 md:w-24 h-1 bg-brand-primary mx-auto rounded-full opacity-20" />
              </div>

              <div className="bg-bg-main py-12 md:py-20 rounded-[2rem] border-2 border-dashed border-brand-primary/30 mb-12 shadow-inner flex flex-col items-center justify-center overflow-hidden">
                <div className="text-[clamp(3rem,14vw,9rem)] font-mono font-black text-brand-primary tracking-[0.1em] md:tracking-[0.2em] leading-none mb-8 select-all whitespace-nowrap">
                  {largeDisplay.password}
                </div>
                <p className="text-lg md:text-xl text-text-muted font-medium opacity-80">영문 대소문자와 숫자를 정확히 입력해 주세요.</p>
              </div>

              <div className="flex items-center justify-center gap-3 text-text-muted font-bold text-sm tracking-widest uppercase">
                <Info size={18} className="text-brand-primary" />
                입장 시 6자리 비밀번호 확인이 필요합니다
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Management Panels */}
        <div className="lg:col-span-4 space-y-8">
          {/* Institution Panel */}
          <section className="bg-white p-6 rounded-2xl shadow-subtle border border-border-subtle">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-brand-accent text-brand-primary rounded-xl flex items-center justify-center">
                <Building2 size={24} />
              </div>
              <h2 className="text-lg font-display font-bold text-text-main">기관 등록</h2>
            </div>
            
            <form onSubmit={handleAddInstitution} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5 ml-1">기관 이름</label>
                <input
                  id="inst-name-input"
                  type="text"
                  placeholder="예: 미래창의고등학교"
                  value={instName}
                  onChange={(e) => setInstName(e.target.value)}
                  suppressHydrationWarning
                  className="w-full px-4 py-2.5 bg-bg-main border border-border-subtle rounded-lg text-sm outline-none focus:border-brand-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1.5 ml-1">기관 유형</label>
                <select
                  id="inst-type-select"
                  value={instType}
                  onChange={(e) => setInstType(e.target.value)}
                  suppressHydrationWarning
                  className="w-full px-4 py-2.5 bg-bg-main border border-border-subtle rounded-lg text-sm outline-none focus:border-brand-primary transition-all appearance-none"
                >
                  <option value="school">학교</option>
                  <option value="organization">기관 / 단체</option>
                  <option value="corporation">기업</option>
                </select>
              </div>
              <button
                disabled={isSubmitting || !instName}
                className="w-full py-3 bg-brand-primary text-white rounded-lg font-bold text-sm tracking-wide flex items-center justify-center gap-2 hover:bg-brand-dark transition-all disabled:opacity-50 shadow-lg shadow-blue-50"
              >
                <Plus size={18} />
                기관 등록
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-border-subtle space-y-3">
              <h3 className="text-[11px] font-bold text-text-muted uppercase tracking-[0.2em] pl-1 mb-4">참여 기관 목록</h3>
              <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
                {institutions.map(inst => (
                  <div key={inst.id} className="group flex items-center justify-between p-3 bg-bg-main rounded-lg border border-border-subtle hover:bg-white transition-all">
                    <span className="text-sm font-medium text-text-main">{inst.name}</span>
                    <button 
                      onClick={() => setDeleteId({ coll: 'institutions', id: inst.id })}
                      className="p-1.5 text-text-muted opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Content Resource Panel */}
        <div className="lg:col-span-8 space-y-8">
          <section className="bg-white p-8 rounded-2xl shadow-subtle border border-border-subtle">
            <div className="flex items-center gap-3 mb-8">
              <div className={`w-12 h-12 ${editingId ? 'bg-orange-100 text-orange-600' : 'bg-brand-accent text-brand-primary'} rounded-xl flex items-center justify-center transition-colors`}>
                {editingId ? <Edit size={28} /> : <BookOpen size={28} />}
              </div>
              <h2 className="text-xl font-display font-bold text-text-main">
                {editingId ? '리소스 수정하기' : '신규 리소스 등록'}
              </h2>
            </div>

            <form onSubmit={handleAddResource} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider ml-1">자료 제목</label>
                <input
                  id="res-title-input"
                  type="text"
                  placeholder="예: ChatGPT 실무 입문"
                  value={resTitle}
                  onChange={(e) => setResTitle(e.target.value)}
                  suppressHydrationWarning
                  className="w-full px-4 py-2.5 bg-bg-main border border-border-subtle rounded-lg text-sm outline-none focus:border-brand-primary transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider ml-1">담당 기관</label>
                <select
                  id="res-inst-select"
                  value={resInstId}
                  onChange={(e) => setResInstId(e.target.value)}
                  suppressHydrationWarning
                  className="w-full px-4 py-2.5 bg-bg-main border border-border-subtle rounded-lg text-sm outline-none focus:border-brand-primary transition-all"
                >
                  <option value="">Choose Institution...</option>
                  {institutions.map(inst => (
                    <option key={inst.id} value={inst.id}>{inst.name}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider ml-1">요약 설명</label>
                <textarea
                  id="res-desc-textarea"
                  placeholder="Learning guide summary..."
                  value={resDesc}
                  onChange={(e) => setResDesc(e.target.value)}
                  suppressHydrationWarning
                  className="w-full px-4 py-2.5 bg-bg-main border border-border-subtle rounded-lg text-sm outline-none focus:border-brand-primary transition-all h-20 resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider ml-1">가이드 URL</label>
                <input
                  id="res-guide-url-input"
                  type="url"
                  placeholder="https://..."
                  value={resGuideUrl}
                  onChange={(e) => setResGuideUrl(e.target.value)}
                  suppressHydrationWarning
                  className="w-full px-4 py-2.5 bg-bg-main border border-border-subtle rounded-lg text-sm outline-none focus:border-brand-primary transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider ml-1">썸네일 URL</label>
                <div className="flex gap-4">
                  <input
                    id="res-thumb-url-input"
                    type="url"
                    placeholder="https://..."
                    value={resThumbUrl}
                    onChange={(e) => setResThumbUrl(e.target.value)}
                    suppressHydrationWarning
                    className="flex-1 px-4 py-2.5 bg-bg-main border border-border-subtle rounded-lg text-sm outline-none focus:border-brand-primary transition-all"
                  />
                  {resThumbUrl && (
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-border-subtle relative bg-gray-100 flex items-center justify-center">
                      <ResourceThumbnail url={resThumbUrl} />
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-text-muted mt-1 ml-1 flex items-center gap-1">
                  <Info size={10} className="text-brand-primary" />
                  노션 첨부파일 주소는 접근권한 문제로 표시되지 않을 수 있습니다.
                </p>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider ml-1">접근 보안 설정</label>
                  <button
                    type="button"
                    onClick={() => setIsResPasswordProtected(!isResPasswordProtected)}
                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                      isResPasswordProtected 
                        ? 'bg-brand-primary text-white' 
                        : 'bg-gray-100 text-text-muted'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full border-2 border-white transition-all ${isResPasswordProtected ? 'bg-white' : 'translate-x-0 bg-gray-400'}`} />
                    {isResPasswordProtected ? '비밀번호 사용 중' : '보안 해제됨'}
                  </button>
                </div>

                {isResPasswordProtected ? (
                  <div className="flex gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div 
                      id="res-password-display"
                      suppressHydrationWarning
                      className="flex-1 px-4 py-3 bg-bg-main border border-dashed border-brand-primary rounded-lg text-center font-mono font-bold tracking-[0.4em] text-lg text-brand-primary"
                    >
                      {resPassword || '------'}
                    </div>
                    <button
                      type="button"
                      onClick={() => setResPassword(generatePassword())}
                      className="px-4 bg-white border border-border-subtle rounded-lg hover:bg-bg-main transition-all text-text-muted"
                    >
                      <RefreshCcw size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="px-4 py-4 bg-green-50 border border-green-100 rounded-lg flex items-center gap-3 text-green-700">
                    <Info size={18} className="shrink-0" />
                    <p className="text-xs font-medium">비밀번호 없이 누구나 클릭만으로 가이드에 접근할 수 있게 설정됩니다.</p>
                  </div>
                )}
              </div>

              <div className="md:col-span-2 pt-4 flex gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting || !resTitle || !resInstId || !resGuideUrl || (isResPasswordProtected && !resPassword)}
                  className={`flex-1 py-3 ${editingId ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-50' : 'bg-brand-primary hover:bg-brand-dark shadow-blue-50'} text-white rounded-lg font-bold text-sm transition-all shadow-lg disabled:opacity-50`}
                >
                  {editingId ? '수정 내용 저장' : '저장하기'}
                </button>
                <button
                  type="button"
                  onClick={() => { 
                    setEditingId(null);
                    setResTitle(''); setResInstId(''); setResDesc(''); setResGuideUrl(''); setResThumbUrl(''); setResPassword(''); 
                  }}
                  className="px-8 py-3 bg-white border border-border-subtle text-text-muted rounded-lg font-bold text-sm hover:bg-gray-50 transition-all"
                >
                  {editingId ? '수정 취소' : '취소'}
                </button>
              </div>
            </form>
          </section>

          {/* Published List */}
          <section className="space-y-4">
            <h2 className="text-sm font-bold text-text-muted uppercase tracking-[0.2em] px-2">최근 게시 자료 현황</h2>
            <div className="grid grid-cols-1 gap-3">
              {resources.map(res => (
                <div key={res.id} className="bg-white p-4 rounded-xl border border-border-subtle flex items-center justify-between group hover:shadow-subtle transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-bg-main rounded-lg overflow-hidden relative flex items-center justify-center text-text-muted">
                      <ResourceThumbnail url={res.thumbnailUrl} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-text-main">{res.title}</h4>
                      <p className="text-[11px] text-text-muted flex items-center gap-3">
                        <span className="font-bold text-brand-primary uppercase">{institutions.find(i => i.id === res.institutionId)?.name || 'EDUCATION'}</span>
                        <span className="flex items-center gap-1 font-mono text-brand-dark">
                          {res.isPasswordProtected !== false ? (
                            <>
                              <Key size={10} /> {res.password}
                            </>
                          ) : (
                            <span className="text-green-600 font-bold tracking-tight">OPEN ACCESS</span>
                          )}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={() => handleEditStart(res)}
                      className="p-2 text-text-muted hover:text-brand-primary hover:bg-brand-accent rounded-lg transition-all"
                      title="수정하기"
                    >
                      <Edit size={16} />
                    </button>
                    {res.isPasswordProtected !== false && (
                      <button 
                        onClick={() => setLargeDisplay({ title: res.title, password: res.password })}
                        className="p-2 text-brand-primary hover:bg-brand-accent rounded-lg transition-all"
                        title="크게 보기"
                      >
                        <Monitor size={16} />
                      </button>
                    )}
                    <button 
                      onClick={() => setDeleteId({ coll: 'resources', id: res.id })}
                      className="p-2 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
