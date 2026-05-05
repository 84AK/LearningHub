# AI Learning Hub 작업 로그 (2026-04-16)

본 로그는 서기(Scribe) 역할로서 프로젝트의 진행 상황, 수정 사항, 에러 해결 및 구현 내용을 기록한 문서입니다.

## 1. 프로젝트 개요
- **목표**: 교육 기관별 AI 학습 자료를 안전하게 공유하고 관리하는 아카이브 웹앱 구축.
- **주요 기능**:
  - 벤토 그리드 레이아웃의 자료 갤러리.
  - 6자리 영문/숫자 비밀번호를 통한 콘텐츠 접근 제어.
  - 관리자 대시보드 (기관 및 자료 등록, 비밀번호 자동 생성).
  - Firebase Authentication 및 Firestore 기반 실시간 데이터 연동.

## 2. 작업 내용

### 설계 (Architect)
- 2026년 최신 트렌드를 반영한 벤토 그리드 및 글래스모피즘(Glassmorphism) 설계.
- Firebase Firestore 컬렉션 구조 설계 (`users`, `institutions`, `resources`).

### 구현 (Worker & Designer)
- **Firebase 연동**: `lib/firebase.ts`를 통해 SDK 초기화 및 에러 핸들링 함수 구현.
- **사용자 UI**: `Navbar`, `ResourceCard`, `ErrorBoundary` 컴포넌트 개발.
- **메인 페이지**: 실시간 `onSnapshot`을 이용한 자료 목록 표시 및 검색 기능.
- **관리자 페이지**: 자료 등록 폼 및 삭제 기능, 랜덤 비밀번호 생성기 구현.

### 문제 해결 (Solver)
- **빌드 에러 수정**: `Navbar.tsx`에서 존재하지 않는 `shadcn/ui` 컴포넌트 임포트 제거.
- **Firebase 프로비저닝**: 리전 미지정으로 인한 초기 설정 에러 해결 (`asia-northeast3` 리전 명시적 지정).
- **보안 강화**: Firestore Security Rules에 `hasOnly()` 및 `size()` 체크를 추가하여 스키마 오염 및 DoS 공격 방지.

## 3. 기술 스택 상세
- **Framework**: Next.js 15.5+
- **Styling**: Tailwind CSS V4, Motion (Framer Motion)
- **Database**: Firebase Firestore (Enterprise Edition)
- **Auth**: Firebase Authentication (Google Login)

## 4. 학습 및 참고 사항
- **Glassmorphism 2.0**: 백드롭 블러와 세밀한 보더(0.5px)를 활용해 세련된 모달 구현.
- **Bento Grid**: 자료 카드의 가독성과 시각적 리듬감을 위해 `aspect-ratio`와 그리드 배치 활용.

---
**기록 담당**: 서기 (Scribe)
**최종 빌드**: 성공 (2026-04-16 16:17)
