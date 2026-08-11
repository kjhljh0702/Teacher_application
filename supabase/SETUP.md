# Supabase Setup (교사링크 v6)

## 1. 프로젝트와 인증

1. 별도 staging Supabase 프로젝트를 먼저 준비합니다.
2. Authentication에서 Anonymous Sign-Ins와 Kakao provider를 활성화합니다.
3. Kakao 개발자 콘솔 Redirect URI에 `https://<project-ref>.supabase.co/auth/v1/callback`을 등록합니다.
4. Supabase Auth URL Configuration의 Site URL과 Redirect URLs에 실제 앱 주소를 등록합니다.
5. 익명 계정을 카카오 계정에 연결하려면 Auth의 manual identity linking 설정을 활성화합니다.
6. Authentication CAPTCHA에서 Cloudflare Turnstile을 활성화합니다.
7. SQL Editor에서 `supabase/schema.sql` 전체를 실행합니다.

기존 v3 데이터가 있으면 스키마가 같은 사용자·게시물의 작성자 ID를 유지하면서 중복 신고만 사용자/게시물별 한 건으로 정리합니다. staging 백업에서 먼저 실행하세요.

## 2. 공개 앱 설정

`config.example.js`를 기준으로 `config.js`를 설정합니다.

```js
window.APP_CONFIG = Object.freeze({
  supabaseUrl: "https://<project-ref>.supabase.co",
  supabasePublishableKey: "sb_publishable_...",
  kakaoMapJavaScriptKey: "<kakao-javascript-key>",
  turnstileSiteKey: "<public-turnstile-site-key>",
  allowedOAuthRedirectOrigins: ["http://localhost:4173", "https://app.example.kr"],
  allowDemoMode: false,
});
```

`config.js`는 공개 파일입니다. 카카오 지도에는 REST API 키나 Client Secret이 아닌 JavaScript 키만 사용합니다. `sb_secret_...`, service-role JWT, Kakao Client Secret, Turnstile secret을 절대 입력하지 마세요. 앱은 secret/service-role 형태를 거부하고 세션은 `sessionStorage`에만 저장합니다. 운영 배포에서 `allowDemoMode`는 반드시 `false`로 두어 로그인 없이 앱 내부로 진입하지 못하게 합니다.

## 3. 카카오 지도 설정

1. Kakao Developers 앱에서 Web 플랫폼을 추가합니다.
2. `http://localhost:4173`, `http://127.0.0.1:4173`, 실제 HTTPS 앱 origin만 사이트 도메인으로 등록합니다.
3. 앱 키의 JavaScript 키를 `kakaoMapJavaScriptKey`에 입력합니다.
4. 운영에서는 `_headers`의 CSP와 `Referrer-Policy: strict-origin-when-cross-origin`이 실제 응답에 적용되는지 확인합니다.
5. 주소 검색 실패 시 사용자가 검증되지 않은 좌표로 클라우드 등록을 우회할 수 없는지 확인합니다.

JavaScript 키는 브라우저에서 보이는 공개 식별자입니다. 비밀로 숨기는 대신 카카오 콘솔에서 정확한 도메인만 허용하고 미사용 도메인을 제거합니다. 기관 등록은 클라이언트 주소 확인을 통과해도 서버에서는 무조건 `pending`으로 시작하므로, 운영 검수 전에는 “확인된 공식 정보”로 표시하면 안 됩니다.

## 4. 최초 관리자 부트스트랩

1. 관리자로 사용할 계정으로 카카오 로그인합니다.
2. Supabase Authentication Users 화면에서 해당 UUID를 확인합니다.
3. SQL Editor에서 아래 쿼리를 한 번만 실행합니다.

```sql
insert into public.user_roles (user_id, role, verified, granted_by, granted_at, revoked_at)
values (
  '<ADMIN_USER_UUID>',
  'admin'::public.app_role,
  true,
  '<ADMIN_USER_UUID>',
  statement_timestamp(),
  null
)
on conflict (user_id) do update set
  role = excluded.role,
  verified = true,
  granted_by = excluded.granted_by,
  granted_at = excluded.granted_at,
  revoked_at = null;
```

최초 관리자 수동 SQL 외에는 `user_roles`를 직접 수정하지 않습니다. 관리자는 자기 역할을 API로 변경할 수 없으므로 최소 두 명의 관리자 계정을 유지하는 것이 안전합니다.

## 5. 역할 관리 Edge Function

새 Supabase secret key를 함수 환경에만 설정합니다. legacy `SUPABASE_SERVICE_ROLE_KEY`도 런타임 기본값으로 동작하지만 신규 배포는 secret key를 권장합니다.

```bash
supabase login
supabase link --project-ref <project-ref>
supabase secrets set APP_SUPABASE_SECRET_KEY=sb_secret_... \
  ALLOWED_ORIGINS=https://app.example.kr,http://localhost:4173
supabase functions deploy manage-user-role
```

역할 변경 요청은 로그인한 관리자 access token으로 호출합니다.

```js
const { data, error } = await supabase.functions.invoke("manage-user-role", {
  body: {
    targetUserId: "<TARGET_USER_UUID>",
    role: "operator",
    verified: true,
  },
});
```

허용 역할은 `teacher`, `director`, `operator`, `admin`입니다. `verified: false`는 해당 신뢰 권한을 즉시 비활성화하고 `revoked_at`을 기록합니다. 모든 변경은 `role_audit_log`에 원자적으로 기록됩니다.

## 6. 역할 의미

| 역할 | 검증 조건 | 권한 |
|---|---:|---|
| teacher | 불필요 | 리뷰·커뮤니티 작성 |
| director | `verified=true`, 카카오 계정 | 채용 공고 작성/본인 수정 |
| operator | `verified=true` | 신고 사유 열람, 숨김/복원 |
| admin | `verified=true`, 카카오 계정 | 운영 처리와 서버 API를 통한 역할 관리 |

프로필의 교사/원장 선택은 `profiles.requested_role`에만 저장되며 위 권한을 부여하지 않습니다.

## 7. 배포 확인

1. `_headers`를 지원하는 호스팅인지 확인하고 실제 응답 헤더를 검사합니다.
2. 지원하지 않으면 동일 정책을 CDN/웹 서버 설정에 옮깁니다.
3. `ALLOWED_ORIGINS`는 정확한 운영 origin만 허용하고 와일드카드를 쓰지 않습니다.
4. Redirect URLs에서 preview URL과 사용하지 않는 도메인을 제거합니다.
5. 익명 로그인 CAPTCHA, Auth rate limits, 데이터베이스 백업/PITR를 활성화합니다.
6. staging에서 아래 권한 테스트를 모두 수행한 후 production에 적용합니다.

## 8. 필수 권한 테스트

- 비로그인 사용자는 공개 피드를 읽을 수 있지만 작성자 UUID는 조회할 수 없어야 합니다.
- 익명 사용자는 리뷰·커뮤니티를 작성할 수 있고 채용 공고는 작성할 수 없어야 합니다.
- 인증되지 않은 원장 희망 프로필은 채용 공고를 작성할 수 없어야 합니다.
- 인증된 director는 자기 공고만 수정할 수 있어야 합니다.
- 일반 사용자는 `user_roles`, 신고 큐, 신고 사유, 감사 로그를 수정하거나 열람할 수 없어야 합니다.
- operator/admin만 신고 상태를 변경할 수 있어야 합니다.
- 같은 사용자의 같은 게시물 재신고는 unique violation으로 거부돼야 합니다.
- 연속 쓰기가 시간당 제한을 넘으면 서버에서 거부돼야 합니다.
- 교사·원장은 기관을 등록할 수 있지만 공개 SELECT에서 등록자 UUID를 읽지 못해야 합니다.
- 등록자는 자기 `pending` 기관만 수정할 수 있고 타인의 기관이나 검수 완료 상태는 수정하지 못해야 합니다.
- 같은 기관명과 도로명주소의 중복 등록과 대한민국 영역 밖 좌표는 서버에서 거부돼야 합니다.
- 관리자 API는 허용되지 않은 Origin, 익명 관리자, 자기 역할 변경을 모두 거부해야 합니다.
