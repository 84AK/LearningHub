# 🚀 AI-Learn Hub (v2.0)

> **Next.js 15 & Google Sheets API를 활용한 프리미엄 AI 학습 리소스 센터**

AI-Learn Hub는 교육 기관 및 기업을 위한 맞춤형 AI 학습 가이드를 제공하는 고성능 리소스 아카이브입니다. 기존 Firebase 아키텍처를 탈피하여 **Google Apps Script(GAS)**와 **Google Sheets**를 백엔드로 사용하는 서버리스 구조로 설계되었습니다.

[![Website](https://img.shields.io/badge/Website-AK_Labs-blue?style=for-the-badge)](https://litt.ly/aklabs)
[![Tech Stack](https://img.shields.io/badge/Next.js_15-Black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Styling](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

---

## ✨ Key Features

- **🍱 Bento Grid Design**: 2026년 최신 트렌드인 벤토 그리드 레이아웃을 통해 정보를 직관적이고 아름답게 배치합니다.
- **📱 Responsive & Alive**: 모바일 기기에 완벽 대응하는 반응형 레이아웃과 Framer Motion을 활용한 부드러운 인터랙션을 제공합니다.
- **📊 Real-time Dashboard**: Google Sheets와 직접 연동되어 별도의 DB 서버 없이도 실시간으로 리소스를 관리하고 사용 통계를 추적합니다.
- **🔐 Secure Access**: 기관별 보안 코드 시스템을 통해 학습 리소스에 대한 접근 권한을 안전하게 제어합니다.
- **⚡ High Performance**: GAS의 캐시 서비스를 활용하여 데이터 로딩 속도를 최적화했습니다.

---

## 🛠 Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19
- **Styling**: Tailwind CSS V4, Lucide Icons, Framer Motion
- **Backend**: Google Apps Script (GAS)
- **Database**: Google Sheets
- **Deployment**: Vercel / GitHub Pages

---

## 🚀 Getting Started

### 1. Google Sheets & GAS 설정
1. 제공된 `Docs/GAS/Code.gs` 파일을 구글 앱스 스크립트 에디터에 붙여넣습니다.
2. 스크립트 내 `SPREADSHEET_ID`를 설정한 후 `initSpreadsheet` 함수를 실행하여 시트를 자동 생성합니다.
3. '웹 앱'으로 배포하고 생성된 **URL**을 복사합니다.

### 2. 환경 변수 설정
프로젝트 루트에 `.env.local` 파일을 생성하고 아래 내용을 입력합니다.
```env
NEXT_PUBLIC_GAS_URL=여러분의_GAS_배포_URL
```

### 3. 로컬 개발 서버 실행
```bash
npm install
npm run dev
```

---

## 📂 Project Structure

```text
├── app/               # Next.js App Router (페이지 및 API)
├── components/        # 재사용 가능한 UI 컴포넌트 (Navbar, Card 등)
├── Docs/
│   ├── GAS/          # Google Apps Script 백엔드 코드
│   └── Work_Logs/    # 프로젝트 개발 로그 및 히스토리
├── lib/               # 공통 유틸리티 (GAS 통신 로직 등)
└── public/            # 정적 에셋 (이미지 등)
```

---

## 🔗 Links & Contact

- **Official Website**: [아크랩스 (AK Labs)](https://litt.ly/aklabs)
- **Email**: mosebb@gmail.com
- **Developed by**: [Antigravity AI Assistant]

---

> 본 프로젝트는 2026년 최신 웹 표준을 준수하며, 사용자에게 최상의 시각적 경험과 관리 효율성을 제공하기 위해 제작되었습니다.
