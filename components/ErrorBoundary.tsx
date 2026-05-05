'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMsg = '알 수 없는 오류가 발생했습니다.';
      try {
        const parsed = JSON.parse(this.state.error?.message || '{}');
        if (parsed.error && parsed.error.includes('insufficient permissions')) {
          errorMsg = '이 리소스에 접근할 수 있는 권한이 없습니다. (Security Rules)';
        } else if (parsed.error) {
          errorMsg = `오류: ${parsed.error}`;
        }
      } catch {
        errorMsg = this.state.error?.message || errorMsg;
      }

      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#fcfcfc] text-center">
          <div className="w-24 h-24 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mb-8">
            <ShieldAlert size={48} />
          </div>
          <h1 className="text-3xl font-display font-bold mb-4">문제가 발생했습니다</h1>
          <p className="text-[#666] max-w-md mb-10 leading-relaxed">
            {errorMsg}
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-4 bg-[#141414] text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-[#333] transition-all"
            >
              <RefreshCcw size={20} />
              다시 시도
            </button>
            <Link href="/">
              <button className="px-8 py-4 bg-white border border-[#ddd] rounded-2xl font-bold flex items-center gap-2 hover:bg-[#f5f5f5] transition-all">
                <Home size={20} />
                메인으로
              </button>
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
