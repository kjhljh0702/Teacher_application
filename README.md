# 교사링크 v6

유치원·어린이집 교직원을 위한 기관 지도, 익명 시설 리뷰, 채용, 커뮤니티 웹앱입니다. 브라우저에 표시되는 별칭은 익명이지만, 악용 대응을 위해 서버에는 인증 사용자 ID가 보관됩니다.

웹앱: `https://kjhljh0702.github.io/Teacher_application/`

## 기능

- 첫 진입 카카오/익명 로그인 화면과 로컬 전용 데모 진입
- 데스크톱 좌측 메뉴, 모바일 하단 메뉴 기반의 앱형 독립 페이지
- 휴대폰·태블릿·가로모드·데스크톱 반응형 배치와 iOS 안전영역 대응
- 플립 커버 화면과 펼친 폴더블 화면 전용 내비게이션·다열 배치
- 앱 알림센터, 선택형 브라우저 알림, Web Audio 차임과 잠금화면 개인정보 보호
- 교사 커리어·채용·커뮤니티용 생성형 편집 일러스트 3종
- 홈·기관 지도·시설 리뷰·채용·커뮤니티·내 정보 화면 완전 분리
- 교사·원장 공통 기관 등록, 도로명주소 확인, 지도 핀과 기관 목록 연동
- 현재 위치 기준 반경 3/5/10km 거리순 검색과 유치원·어린이집 필터
- 카카오 지도 미설정 로컬 환경의 명확히 구분된 기능 확인용 데모 지도
- 익명 계정과 카카오 OAuth 로그인 및 익명 계정의 카카오 연결
- 교사·원장 프로필과 공개 작성자 ID가 없는 리뷰/채용/커뮤니티 피드
- 인증된 원장만 채용 공고 작성
- 운영자·관리자만 신고 사유 확인 및 숨김/복원
- 작성자 본인만 콘텐츠 수정, 삭제 정책 없음
- 사용자별 중복 신고 차단과 3건 자동 숨김
- 개인정보 재수집을 막는 8개 고정 신고 분류와 DB 허용 목록 검증
- 자유 본문의 실명·기관명·확장 욕설·19금 표현·연락처 자동 마스킹과 위해 표현 등록 차단
- 띄어쓰기·마침표·특수문자를 섞은 욕설 및 음란 표현 우회 탐지와 정상 문맥 예외 처리
- 클라이언트 우회를 막는 PostgreSQL 원문 검열 트리거
- 서버 생성 시각, 쓰기 속도 제한, 운영·권한 감사 로그
- 오프라인 PWA와 로컬 JSON 백업

## 보안 경계

- `config.js`에는 Supabase Project URL, `sb_publishable_...` 키, Turnstile site key, 카카오 지도 JavaScript 키만 둡니다.
- `sb_secret_...` 또는 legacy service-role 키는 Edge Function 환경에만 둡니다.
- `profiles.requested_role`은 사용자의 희망 역할이고 권한이 아닙니다.
- 실제 권한은 사용자가 쓸 수 없는 `user_roles`에서만 판정합니다.
- 공개 조회 권한에는 콘텐츠의 `user_id`, 신고자의 UUID, 신고 사유가 포함되지 않습니다.
- 기관 등록은 항상 검수 대기로 시작하고, 공개 조회에서 등록자 UUID를 제외합니다.
- 기관 등록·리뷰 대상의 구조화된 기관명은 허용하지만 자유 본문의 특정 기관명은 `**`로 마스킹합니다.
- 브라우저 마스킹은 작성 편의를 위한 1차 방어이며 DB trigger가 마스킹 전 원문의 직접 저장을 거부합니다.
- 현재 위치는 메모리에서 거리 계산에만 쓰며 앱 상태, 백업, 교사링크 DB에 저장하지 않습니다.
- 운영 환경에서는 반드시 Supabase를 설정합니다. Supabase가 없는 로컬 모드는 UI 데모이며 서버 권한 모델이 아닙니다.

자세한 위협 모델과 사고 대응은 `SECURITY.md`, 배포 순서는 `supabase/SETUP.md`를 참고하세요.

## 로컬 실행

```bash
cd /Users/ijeonghun/Desktop/app
python3 -m http.server 4173 --bind 127.0.0.1
```

`http://127.0.0.1:4173`에서 열 수 있습니다. `config.example.js`를 참고해 공개 설정을 `config.js`에 입력하면 Supabase와 실제 카카오 지도가 연결됩니다. 키가 없으면 기관 페이지는 실제 도로지도가 아닌 로컬 데모 지도로 표시됩니다. 로컬 `config.js`의 `allowDemoMode: true`는 미리보기 전용이며 운영에서는 반드시 `false`로 설정합니다.

## GitHub Pages 배포

`main` 브랜치에 푸시하면 `.github/workflows/pages.yml`이 보안 검사와 PostgreSQL 통합 검사를 실행한 뒤 정적 웹앱을 GitHub Pages에 배포합니다. 실제 클라우드 연결은 저장소 `Settings > Secrets and variables > Actions > Variables`에 아래 Repository Variables를 등록합니다.

- `SUPABASE_URL`: HTTPS Supabase 프로젝트 URL
- `SUPABASE_PUBLISHABLE_KEY`: `sb_publishable_` 공개 키
- `KAKAO_MAP_JAVASCRIPT_KEY`: 카카오 지도 JavaScript 공개 키
- `TURNSTILE_SITE_KEY`: 선택형 Cloudflare Turnstile 공개 site key
- `ALLOW_DEMO_MODE`: 실제 운영에서는 `false`

이 값들은 브라우저에 전달되는 공개 설정입니다. `sb_secret_`, service-role 키, 카카오 Client Secret, Turnstile secret은 GitHub Variables나 저장소 파일에 넣지 않습니다. Supabase OAuth redirect URL에는 `https://kjhljh0702.github.io/Teacher_application/`, 카카오 Web 플랫폼 도메인에는 `https://kjhljh0702.github.io`를 등록해야 합니다.

## 주요 파일

- `index.html`: 앱 UI, CSP 메타 정책, 고정 버전/SRI SDK
- `app.js`: 로그인, 익명 UI, 서버 우선 저장 흐름
- `config.js`: 공개 런타임 설정 전용
- `_headers`: 정적 호스팅용 HTTP 보안 헤더
- `service-worker.js`: 온라인 최신 파일 우선, 오프라인 앱 셸 캐시, `config.js` 네트워크 전용 처리
- `supabase/schema.sql`: 기관·콘텐츠 RLS, 컬럼 권한, 좌표/중복 검증, 속도 제한, 감사 로그
- `supabase/functions/manage-user-role/index.ts`: 관리자 전용 역할 변경 API
- `tests/security-check.mjs`: 보안 불변조건 정적 검사

## 검증

```bash
node --check app.js
node tests/security-check.mjs
node tests/content-policy-check.mjs
node tests/responsive-check.mjs
node tests/notification-check.mjs
tests/run-postgres-security.sh
```

SQL과 Edge Function은 실제 Supabase staging 프로젝트에도 배포해 `supabase/SETUP.md`의 권한 시나리오를 검증해야 합니다.
