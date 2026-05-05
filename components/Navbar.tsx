'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, LogOut, LogIn, GraduationCap, Library, Building2, ShieldCheck, BarChart3, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function Navbar() {
  const [admin, setAdmin] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    const savedAdmin = localStorage.getItem('vcep_admin');
    if (savedAdmin) {
      setAdmin(JSON.parse(savedAdmin));
    } else {
      setAdmin(null);
    }
  }, [pathname]);

  useEffect(() => {
    setIsOpen(false); // 페이지 이동 시 메뉴 닫기
  }, [pathname]);

  const handleSignOut = () => {
    localStorage.removeItem('vcep_admin');
    setAdmin(null);
    router.push('/');
  };

  const role = admin ? 'admin' : null;

  const navItems = [
    { name: '학습 자료실', icon: Library, href: '/', active: pathname === '/' },
    ...(role === 'admin' ? [
      { name: '학습 자료 관리', icon: LayoutDashboard, href: '/admin', active: pathname === '/admin' },
      { name: '사용 통계', icon: BarChart3, href: '/admin/statistics', active: pathname === '/admin/statistics' },
      { name: '참여 기관 관리', icon: Building2, href: '/admin/institutions', active: pathname === '/admin/institutions' },
      { name: '접근 권한 설정', icon: ShieldCheck, href: '/admin/permissions', active: pathname === '/admin/permissions' },
    ] : [])
  ];

  if (!isMounted) return null; // 서버 사이드 렌더링 시에는 아무것도 렌더링하지 않음 (하이드레이션 에러 방지)

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-border-subtle flex items-center justify-between px-6 z-[60]">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
            <GraduationCap className="text-white w-5 h-5" />
          </div>
          <span className="font-display font-bold text-lg text-text-main">AI-Learn Hub</span>
        </Link>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-text-main">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Desktop/Mobile Sidebar */}
      <AnimatePresence>
        {(isOpen || window.innerWidth >= 1024) && (
          <>
            {/* Mobile Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-[70]"
            />
            
            <motion.aside 
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-[260px] bg-white border-r border-border-subtle flex flex-col py-8 z-[80] lg:z-50"
            >
              <div className="px-6 mb-10 hidden lg:block">
                <Link href="/" className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
                    <GraduationCap className="text-white w-5 h-5" />
                  </div>
                  <span className="font-display font-bold text-xl text-text-main tracking-tight">AI-Learn Hub</span>
                </Link>
              </div>

              {/* Mobile Close Button */}
              <button onClick={() => setIsOpen(false)} className="lg:hidden absolute top-6 right-6 p-2 text-text-muted">
                <X size={20} />
              </button>

              <nav className="flex-1 px-3 space-y-1 mt-4 lg:mt-0">
                {navItems.map((item) => (
                  <Link 
                    key={item.name}
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200
                      ${item.active 
                        ? 'bg-brand-accent text-brand-primary font-bold border-r-4 border-brand-primary rounded-r-none' 
                        : 'text-text-muted hover:bg-gray-50 hover:text-text-main'}
                    `}
                  >
                    <item.icon size={18} />
                    {item.name}
                  </Link>
                ))}
              </nav>

              <div className="px-3 border-t border-border-subtle pt-6">
                {admin ? (
                  <div className="space-y-1">
                    <div className="px-4 py-2 mb-2">
                      <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1">Authenticated</p>
                      <p className="text-sm font-medium text-text-main truncate">{admin.username}</p>
                    </div>
                    <button 
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-text-muted hover:bg-red-50 hover:text-red-500 transition-all rounded-xl"
                    >
                      <LogOut size={18} />
                      로그아웃
                    </button>
                  </div>
                ) : (
                  <Link 
                    href="/login"
                    className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-white bg-brand-primary hover:bg-brand-dark transition-all rounded-xl shadow-lg shadow-blue-100"
                  >
                    <LogIn size={18} />
                    관리자 로그인
                  </Link>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
