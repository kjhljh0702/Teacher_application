-- 교사링크 v6 security schema
-- Run as a project administrator in the Supabase SQL Editor.

begin;

do $$
begin
  create type public.app_role as enum ('teacher', 'director', 'operator', 'admin');
exception
  when duplicate_object then null;
end
$$;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  requested_role text not null default 'teacher',
  org_type text,
  region text,
  experience text,
  alias text,
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp()
);

-- v3 compatibility: role/verified can remain physically present, but no client
-- receives privileges for those legacy columns.
alter table public.profiles add column if not exists requested_role text;
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'role'
  ) then
    execute $migration$
      update public.profiles
      set requested_role = case when role in ('teacher', 'director') then role else 'teacher' end
      where requested_role is null
    $migration$;
  else
    update public.profiles set requested_role = 'teacher' where requested_role is null;
  end if;
end
$$;
alter table public.profiles alter column requested_role set default 'teacher';
alter table public.profiles alter column requested_role set not null;

create table if not exists public.user_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role public.app_role not null default 'teacher',
  verified boolean not null default false,
  granted_by uuid references auth.users (id) on delete set null,
  granted_at timestamptz not null default statement_timestamp(),
  revoked_at timestamptz
);

create table if not exists public.reviews (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  facility_type text not null,
  facility_name text not null,
  region text not null,
  overall_score numeric(2,1) not null,
  pay_score numeric(2,1) not null,
  workload_score numeric(2,1) not null,
  leadership_score numeric(2,1) not null,
  growth_score numeric(2,1) not null,
  tag text,
  content text not null,
  alias text,
  org_type text,
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp()
);

create table if not exists public.jobs (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  center_name text not null,
  position text not null,
  region text not null,
  salary text not null,
  employment_type text not null,
  work_hours text not null,
  deadline date,
  description text not null,
  alias text,
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp()
);

create table if not exists public.community_posts (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  category text not null,
  topic text not null,
  body text not null,
  alias text,
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp()
);

create table if not exists public.facilities (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  facility_type text not null,
  facility_name text not null,
  region text not null,
  road_address text not null,
  latitude numeric(9,6) not null,
  longitude numeric(9,6) not null,
  status text not null default 'pending',
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp()
);

create table if not exists public.item_reports (
  item_id text primary key,
  kind text not null,
  status text not null default 'visible',
  handled_by uuid references auth.users (id) on delete set null,
  handled_at timestamptz,
  updated_at timestamptz not null default statement_timestamp()
);

alter table public.item_reports add column if not exists kind text;
alter table public.item_reports add column if not exists status text default 'visible';
alter table public.item_reports add column if not exists handled_by uuid;
alter table public.item_reports add column if not exists handled_at timestamptz;
alter table public.item_reports add column if not exists updated_at timestamptz default statement_timestamp();
update public.item_reports set kind = 'unknown' where kind is null;
update public.item_reports set status = 'visible' where status not in ('visible', 'hidden') or status is null;
alter table public.item_reports alter column kind set not null;
alter table public.item_reports alter column status set not null;
alter table public.item_reports alter column updated_at set not null;

create table if not exists public.report_events (
  id bigint generated always as identity primary key,
  item_id text not null,
  kind text not null,
  reason text not null default '기타',
  reporter_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default statement_timestamp()
);

alter table public.report_events add column if not exists item_id text;
alter table public.report_events add column if not exists kind text;
alter table public.report_events add column if not exists reason text default '기타';
alter table public.report_events add column if not exists reporter_id uuid;
alter table public.report_events add column if not exists created_at timestamptz default statement_timestamp();
alter table public.report_events alter column reason set default '기타 정책 위반';
update public.report_events
set reason = '기타 정책 위반'
where reason is null or reason not in (
  '개인정보 노출', '아동정보 노출', '명예훼손·모욕', '폭력·위협',
  '성적·음란 표현', '허위 채용·사기', '스팸·광고', '기타 정책 위반'
);

create table if not exists public.role_audit_log (
  id bigint generated always as identity primary key,
  target_user_id uuid not null references auth.users (id) on delete cascade,
  actor_user_id uuid references auth.users (id) on delete set null,
  previous_role public.app_role,
  previous_verified boolean,
  next_role public.app_role not null,
  next_verified boolean not null,
  request_id uuid not null,
  created_at timestamptz not null default statement_timestamp()
);

create table if not exists public.moderation_audit_log (
  id bigint generated always as identity primary key,
  item_id text not null,
  kind text not null,
  actor_user_id uuid references auth.users (id) on delete set null,
  previous_status text,
  next_status text not null,
  created_at timestamptz not null default statement_timestamp()
);

-- Keep the earliest legacy report when upgrading to one-report-per-user/item.
delete from public.report_events newer
using public.report_events older
where newer.item_id = older.item_id
  and newer.reporter_id = older.reporter_id
  and newer.id > older.id;

create index if not exists idx_reviews_created_at on public.reviews (created_at desc);
create index if not exists idx_reviews_user_created_at on public.reviews (user_id, created_at desc);
create index if not exists idx_jobs_created_at on public.jobs (created_at desc);
create index if not exists idx_jobs_deadline on public.jobs (deadline);
create index if not exists idx_jobs_user_created_at on public.jobs (user_id, created_at desc);
create index if not exists idx_community_created_at on public.community_posts (created_at desc);
create index if not exists idx_community_user_created_at on public.community_posts (user_id, created_at desc);
create index if not exists idx_facilities_created_at on public.facilities (created_at desc);
create index if not exists idx_facilities_region_type on public.facilities (region, facility_type);
create index if not exists idx_facilities_user_created_at on public.facilities (user_id, created_at desc);
create unique index if not exists uq_facilities_name_address
on public.facilities (lower(btrim(facility_name)), lower(btrim(road_address)));
create index if not exists idx_report_events_item_id on public.report_events (item_id);
create index if not exists idx_report_events_created_at on public.report_events (created_at desc);
create index if not exists idx_report_events_reporter_created_at on public.report_events (reporter_id, created_at desc);
create unique index if not exists uq_report_events_item_reporter on public.report_events (item_id, reporter_id);

do $$
begin
  alter table public.profiles
    add constraint profiles_requested_role_check
    check (requested_role in ('teacher', 'director')) not valid;
exception when duplicate_object then null;
end
$$;

do $$
begin
  alter table public.reviews
    add constraint reviews_score_check
    check (
      overall_score between 1 and 5 and pay_score between 1 and 5
      and workload_score between 1 and 5 and leadership_score between 1 and 5
      and growth_score between 1 and 5
    ) not valid;
exception when duplicate_object then null;
end
$$;

do $$
begin
  alter table public.reviews
    add constraint reviews_length_check
    check (char_length(id) between 1 and 100 and char_length(facility_name) between 1 and 80 and char_length(content) between 1 and 1200) not valid;
exception when duplicate_object then null;
end
$$;

do $$
begin
  alter table public.jobs
    add constraint jobs_length_check
    check (char_length(id) between 1 and 100 and char_length(center_name) between 1 and 80 and char_length(description) between 1 and 1500) not valid;
exception when duplicate_object then null;
end
$$;

do $$
begin
  alter table public.community_posts
    add constraint community_length_check
    check (char_length(id) between 1 and 100 and char_length(topic) between 1 and 100 and char_length(body) between 1 and 1200) not valid;
exception when duplicate_object then null;
end
$$;

do $$
begin
  alter table public.facilities
    add constraint facilities_public_data_check
    check (
      char_length(id) between 1 and 100
      and facility_type in ('유치원', '어린이집')
      and char_length(facility_name) between 2 and 80
      and char_length(road_address) between 8 and 160
      and region in ('서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주')
      and latitude between 33.0 and 38.7
      and longitude between 124.5 and 131.9
      and status in ('pending', 'verified', 'rejected')
    ) not valid;
exception when duplicate_object then null;
end
$$;

do $$
begin
  alter table public.item_reports
    add constraint item_reports_status_check
    check (status in ('visible', 'hidden')) not valid;
exception when duplicate_object then null;
end
$$;

do $$
begin
  alter table public.report_events
    add constraint report_events_length_check
    check (char_length(item_id) between 1 and 100 and kind in ('review', 'job', 'community') and char_length(reason) between 1 and 120) not valid;
exception when duplicate_object then null;
end
$$;

alter table public.report_events drop constraint if exists report_events_reason_check;
alter table public.report_events
  add constraint report_events_reason_check
  check (reason in (
    '개인정보 노출', '아동정보 노출', '명예훼손·모욕', '폭력·위협',
    '성적·음란 표현', '허위 채용·사기', '스팸·광고', '기타 정책 위반'
  )) not valid;
alter table public.report_events validate constraint report_events_reason_check;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = statement_timestamp();
  return new;
end;
$$;

create or replace function public.public_text_has_restricted_language(p_value text)
returns boolean
language sql
immutable
security invoker
set search_path = ''
as $$
  with normalized as (
    select regexp_replace(
      regexp_replace(lower(coalesce(p_value, '')), '[[:space:][:punct:]·ㆍ…]+', '', 'g'),
      '시발(점|역)',
      '',
      'g'
    ) as value
  )
  select
    value ~ '(개씹|개씨발|개시발|씹새끼|씹새|씹년|씹놈|씨발|시발|씨팔|시팔|씹발|쒸발|쉬발|슈발|싯팔|ㅅㅂ|ㅆㅂ|썅|썅년|썅놈|쌍년|쌍놈|개새끼|개새기|개세끼|개세기|개자식|개같은|개같다|개같네|개같이|개같아서|병신|븅신|빙신|ㅂㅅ|등신|머저리|지랄|지롤|ㅈㄹ|존나|졸라|ㅈㄴ|좆|좃|좇|조까|좆까|좃까|좆같은|좆같다|좃같은|좃같다|미친놈|미친년|미친새끼|미친것|미친|꺼져|닥쳐|엿먹어|엿먹|뒈져|뒤져|디져|또라이|꼴통|찌질이|찐따|호구|애미|에미|느금마|니미|니기미|창녀|걸레년|걸레같은|틀딱|맘충|급식충)'
    or value ~ '(오럴섹스|애널섹스|구강성교|항문성교|질내사정|질외사정|콘돔없이|가슴만져|엉덩이만져|성기만져|성기노출|성기사진|꼬추사진|자지사진|보지사진|음란사진|음란영상|야한사진|야한영상|누드사진|나체사진|성인방송|섹스|쎅스|쌕스|섹쓰|ㅅㅅ|야동|야사|포르노|음란물|성인물|자위행위|딸딸이|딸치기|딸치다|딸잡이|오럴|애널|펠라치오|펠라|후장|보빨|씹보지|씹자지|질싸|노콘|섹파|원나잇|조건만남|몸캠|벗방|누드|알몸|발기|성노예)'
  from normalized;
$$;

create or replace function public.public_text_has_prohibited_content(
  p_value text,
  p_allow_institution_name boolean default false
)
returns boolean
language sql
immutable
security invoker
set search_path = ''
as $$
  select
    public.public_text_has_restricted_language(p_value)
    or coalesce(p_value, '') ~* '(죽여[[:space:]]*버리|살해[[:space:]]*하|협박[[:space:]]*하|테러[[:space:]]*하)'
    or coalesce(p_value, '') ~ '(010|011|016|017|018|019)[-[:space:]]*[0-9]{3,4}[-[:space:]]*[0-9]{4}'
    or coalesce(p_value, '') ~* '[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}'
    or coalesce(p_value, '') ~ '[0-9]{6}[-[:space:]]*[1-4][0-9]{6}'
    or coalesce(p_value, '') ~ '(^|[^가-힣])(김|이|박|최|정|강|조|윤|장|임|한|오|서|신|권|황|안|송|전|홍|유|고|문|양|손|배|백|허|남|심|노|하|곽|성|차|주|우|구|민|진|지|엄|채|원|천|방|공|현|함|변|염|여|추|도|소|석|선|설|마|길|연|위|표|명|기|반|왕|금|옥|육|인|맹|제|모|탁|국|어|은|편|용)[가-힣]{2}[[:space:]]*(부원장|원장|보육교사|담임선생님|선생님|교사|주임|실장|조리사|담임|원감|씨)(님)?'
    or coalesce(p_value, '') ~ '(^|[^가-힣])(김|이|박|최|정|강|조|윤|장|임|한|오|서|신|권|황|안|송|전|홍|유|고|문|양|손|배|백|허|남|심|노|하|곽|성|차|주|우|구|민|진|지|엄|채|원|천|방|공|현|함|변|염|여|추|도|소|석|선|설|마|길|연|위|표|명|기|반|왕|금|옥|육|인|맹|제|모|탁|국|어|은|편|용)[[:space:]]+(부원장|원장|보육교사|담임선생님|선생님|교사|주임|실장|조리사|담임|원감)(님)?'
    or (
      not p_allow_institution_name
      and regexp_replace(
        coalesce(p_value, ''),
        '(국공립|공립|사립|민간|가정|직장|법인|병설|단설|공공형|국립)(유치원|어린이집)',
        '',
        'g'
      ) ~ '[가-힣A-Za-z0-9]{2,30}(유치원|어린이집)'
    );
$$;

create or replace function public.enforce_public_text_policy()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  value_to_check text;
  values_to_check text[];
  row_data jsonb := to_jsonb(new);
begin
  values_to_check := case tg_table_name
    when 'profiles' then array[row_data ->> 'alias']
    when 'reviews' then array[row_data ->> 'tag', row_data ->> 'content', row_data ->> 'alias']
    when 'jobs' then array[row_data ->> 'position', row_data ->> 'salary', row_data ->> 'work_hours', row_data ->> 'description', row_data ->> 'alias']
    when 'community_posts' then array[row_data ->> 'topic', row_data ->> 'body', row_data ->> 'alias']
    when 'facilities' then array[]::text[]
    else null
  end;

  if values_to_check is null then
    raise exception 'unsupported public text policy target' using errcode = '42501';
  end if;

  if tg_table_name = 'reviews' and public.public_text_has_prohibited_content(row_data ->> 'facility_name', true) then
    raise exception 'public text policy violation' using errcode = 'P0001';
  elsif tg_table_name = 'jobs' and public.public_text_has_prohibited_content(row_data ->> 'center_name', true) then
    raise exception 'public text policy violation' using errcode = 'P0001';
  elsif tg_table_name = 'facilities' and public.public_text_has_prohibited_content(row_data ->> 'facility_name', true) then
    raise exception 'public text policy violation' using errcode = 'P0001';
  end if;

  if tg_table_name = 'facilities' and public.public_text_has_prohibited_content(row_data ->> 'road_address', true) then
    raise exception 'public text policy violation' using errcode = 'P0001';
  end if;

  foreach value_to_check in array values_to_check loop
    if public.public_text_has_prohibited_content(value_to_check, false) then
      raise exception 'public text policy violation' using errcode = 'P0001';
    end if;
  end loop;

  if tg_table_name in ('profiles', 'reviews', 'jobs', 'community_posts') then
    if (row_data ->> 'alias') is not null and (row_data ->> 'alias') ~ '^(김|이|박|최|정|강|조|윤|장|임|한|오|서|신|권|황|안|송|전|홍|유|고|문|양|손|배|백|허|남|심|노|하|곽|성|차|주|우|구|민|진|지|엄|채|원|천|방|공|현|함|변|염|여|추|도|소|석|선|설|마|길|연|위|표|명|기|반|왕|금|옥|육|인|맹|제|모|탁|국|어|은|편|용)[가-힣]{2,3}$' then
      raise exception 'public alias may identify a person' using errcode = 'P0001';
    end if;
  end if;

  return new;
end;
$$;

create or replace function public.has_app_role(allowed_roles public.app_role[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles as access
    where access.user_id = (select auth.uid())
      and access.role = any(allowed_roles)
      and access.verified = true
      and access.revoked_at is null
  );
$$;

create or replace function public.content_item_exists(p_item_id text, p_kind text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select case p_kind
    when 'review' then exists (select 1 from public.reviews where id = p_item_id)
    when 'job' then exists (select 1 from public.jobs where id = p_item_id)
    when 'community' then exists (select 1 from public.community_posts where id = p_item_id)
    else false
  end;
$$;

create or replace function public.enforce_content_insert_limits()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  recent_count integer;
  maximum_count integer;
begin
  if current_user_id is null or new.user_id <> current_user_id then
    raise exception 'invalid content owner' using errcode = '42501';
  end if;

  maximum_count := case tg_table_name
    when 'reviews' then 5
    when 'jobs' then 10
    when 'community_posts' then 20
    when 'facilities' then 10
    else 0
  end;
  if maximum_count = 0 then
    raise exception 'unsupported write target' using errcode = '42501';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(current_user_id::text || ':' || tg_table_name, 0)
  );

  if tg_table_name = 'reviews' then
    select count(*) into recent_count from public.reviews
    where user_id = current_user_id and created_at >= statement_timestamp() - interval '1 hour';
  elsif tg_table_name = 'jobs' then
    select count(*) into recent_count from public.jobs
    where user_id = current_user_id and created_at >= statement_timestamp() - interval '1 hour';
  elsif tg_table_name = 'community_posts' then
    select count(*) into recent_count from public.community_posts
    where user_id = current_user_id and created_at >= statement_timestamp() - interval '1 hour';
  else
    select count(*) into recent_count from public.facilities
    where user_id = current_user_id and created_at >= statement_timestamp() - interval '1 hour';
  end if;

  if recent_count >= maximum_count then
    raise exception 'write rate limit exceeded' using errcode = 'P0001';
  end if;

  new.created_at = statement_timestamp();
  new.updated_at = statement_timestamp();
  return new;
end;
$$;

create or replace function public.enforce_report_event_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  recent_count integer;
begin
  if current_user_id is null or new.reporter_id <> current_user_id then
    raise exception 'invalid reporter' using errcode = '42501';
  end if;
  if not public.content_item_exists(new.item_id, new.kind) then
    raise exception 'content item not found' using errcode = '23503';
  end if;
  if new.reason not in (
    '개인정보 노출', '아동정보 노출', '명예훼손·모욕', '폭력·위협',
    '성적·음란 표현', '허위 채용·사기', '스팸·광고', '기타 정책 위반'
  ) then
    raise exception 'invalid report reason' using errcode = '22023';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(current_user_id::text || ':report_events', 0)
  );
  select count(*) into recent_count
  from public.report_events
  where reporter_id = current_user_id
    and created_at >= statement_timestamp() - interval '1 hour';
  if recent_count >= 30 then
    raise exception 'report rate limit exceeded' using errcode = 'P0001';
  end if;

  new.created_at = statement_timestamp();
  return new;
end;
$$;

create or replace function public.enforce_moderation_actor()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.handled_by = auth.uid();
  new.handled_at = statement_timestamp();
  new.updated_at = statement_timestamp();
  return new;
end;
$$;

create or replace function public.audit_moderation_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.moderation_audit_log (
    item_id, kind, actor_user_id, previous_status, next_status
  ) values (
    new.item_id,
    new.kind,
    coalesce(auth.uid(), new.handled_by),
    case when tg_op = 'UPDATE' then old.status else null end,
    new.status
  );
  return new;
end;
$$;

create or replace function public.get_report_statuses()
returns table (
  item_id text,
  kind text,
  report_count bigint,
  status text,
  last_reported_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  with event_summary as (
    select events.item_id, min(events.kind) as kind, count(*) as report_count, max(events.created_at) as last_reported_at
    from public.report_events as events
    group by events.item_id
  )
  select
    coalesce(summary.item_id, moderation.item_id),
    coalesce(moderation.kind, summary.kind, 'unknown'),
    coalesce(summary.report_count, 0),
    coalesce(moderation.status, case when coalesce(summary.report_count, 0) >= 3 then 'hidden' else 'visible' end),
    summary.last_reported_at
  from event_summary as summary
  full join public.item_reports as moderation on moderation.item_id = summary.item_id;
$$;

create or replace function public.get_operator_report_queue()
returns table (
  item_id text,
  kind text,
  report_count bigint,
  status text,
  last_reported_at timestamptz,
  reasons jsonb
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.has_app_role(array['operator', 'admin']::public.app_role[]) then
    raise exception 'operator access required' using errcode = '42501';
  end if;

  return query
  with reason_counts as (
    select events.item_id, coalesce(events.reason, '기타') as reason, count(*) as reason_count
    from public.report_events as events
    group by events.item_id, coalesce(events.reason, '기타')
  ), reason_summary as (
    select counts.item_id, jsonb_object_agg(counts.reason, counts.reason_count) as reasons
    from reason_counts as counts
    group by counts.item_id
  ), event_summary as (
    select events.item_id, min(events.kind) as kind, count(*) as report_count, max(events.created_at) as last_reported_at
    from public.report_events as events
    group by events.item_id
  )
  select
    coalesce(summary.item_id, moderation.item_id),
    coalesce(moderation.kind, summary.kind, 'unknown'),
    coalesce(summary.report_count, 0),
    coalesce(moderation.status, case when coalesce(summary.report_count, 0) >= 3 then 'hidden' else 'visible' end),
    summary.last_reported_at,
    coalesce(reason_summary.reasons, '{}'::jsonb)
  from event_summary as summary
  full join public.item_reports as moderation on moderation.item_id = summary.item_id
  left join reason_summary on reason_summary.item_id = coalesce(summary.item_id, moderation.item_id)
  order by coalesce(summary.last_reported_at, moderation.updated_at) desc nulls last;
end;
$$;

create or replace function public.admin_set_user_role(
  p_actor_user_id uuid,
  p_target_user_id uuid,
  p_role public.app_role,
  p_verified boolean,
  p_request_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  prior_role public.app_role;
  prior_verified boolean;
  changes_last_hour integer;
begin
  if p_actor_user_id is null or p_target_user_id is null or p_request_id is null then
    raise exception 'invalid role change request' using errcode = '22023';
  end if;
  if p_actor_user_id = p_target_user_id then
    raise exception 'administrators cannot change their own role' using errcode = '42501';
  end if;
  if not exists (
    select 1 from public.user_roles as actor
    where actor.user_id = p_actor_user_id
      and actor.role = 'admin'::public.app_role
      and actor.verified = true
      and actor.revoked_at is null
  ) then
    raise exception 'administrator access required' using errcode = '42501';
  end if;
  if not exists (select 1 from auth.users where id = p_target_user_id) then
    raise exception 'target user not found' using errcode = 'P0002';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_actor_user_id::text || ':role_admin', 0)
  );
  select count(*) into changes_last_hour
  from public.role_audit_log
  where actor_user_id = p_actor_user_id
    and created_at >= statement_timestamp() - interval '1 hour';
  if changes_last_hour >= 100 then
    raise exception 'role administration rate limit exceeded' using errcode = 'P0001';
  end if;

  select role, verified into prior_role, prior_verified
  from public.user_roles
  where user_id = p_target_user_id;

  insert into public.user_roles (user_id, role, verified, granted_by, granted_at, revoked_at)
  values (
    p_target_user_id,
    p_role,
    p_verified,
    p_actor_user_id,
    statement_timestamp(),
    case when p_verified then null else statement_timestamp() end
  )
  on conflict (user_id) do update set
    role = excluded.role,
    verified = excluded.verified,
    granted_by = excluded.granted_by,
    granted_at = excluded.granted_at,
    revoked_at = excluded.revoked_at;

  insert into public.role_audit_log (
    target_user_id,
    actor_user_id,
    previous_role,
    previous_verified,
    next_role,
    next_verified,
    request_id
  ) values (
    p_target_user_id,
    p_actor_user_id,
    prior_role,
    prior_verified,
    p_role,
    p_verified,
    p_request_id
  );

  return jsonb_build_object(
    'user_id', p_target_user_id,
    'role', p_role,
    'verified', p_verified
  );
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
drop trigger if exists profiles_public_text_policy on public.profiles;
create trigger profiles_public_text_policy before insert or update on public.profiles
for each row execute function public.enforce_public_text_policy();

drop trigger if exists reviews_insert_limits on public.reviews;
create trigger reviews_insert_limits before insert on public.reviews
for each row execute function public.enforce_content_insert_limits();
drop trigger if exists reviews_set_updated_at on public.reviews;
create trigger reviews_set_updated_at before update on public.reviews
for each row execute function public.set_updated_at();
drop trigger if exists reviews_public_text_policy on public.reviews;
create trigger reviews_public_text_policy before insert or update on public.reviews
for each row execute function public.enforce_public_text_policy();

drop trigger if exists jobs_insert_limits on public.jobs;
create trigger jobs_insert_limits before insert on public.jobs
for each row execute function public.enforce_content_insert_limits();
drop trigger if exists jobs_set_updated_at on public.jobs;
create trigger jobs_set_updated_at before update on public.jobs
for each row execute function public.set_updated_at();
drop trigger if exists jobs_public_text_policy on public.jobs;
create trigger jobs_public_text_policy before insert or update on public.jobs
for each row execute function public.enforce_public_text_policy();

drop trigger if exists community_insert_limits on public.community_posts;
create trigger community_insert_limits before insert on public.community_posts
for each row execute function public.enforce_content_insert_limits();
drop trigger if exists community_set_updated_at on public.community_posts;
create trigger community_set_updated_at before update on public.community_posts
for each row execute function public.set_updated_at();
drop trigger if exists community_public_text_policy on public.community_posts;
create trigger community_public_text_policy before insert or update on public.community_posts
for each row execute function public.enforce_public_text_policy();

drop trigger if exists facilities_insert_limits on public.facilities;
create trigger facilities_insert_limits before insert on public.facilities
for each row execute function public.enforce_content_insert_limits();
drop trigger if exists facilities_set_updated_at on public.facilities;
create trigger facilities_set_updated_at before update on public.facilities
for each row execute function public.set_updated_at();
drop trigger if exists facilities_public_text_policy on public.facilities;
create trigger facilities_public_text_policy before insert or update on public.facilities
for each row execute function public.enforce_public_text_policy();

drop trigger if exists report_events_insert_guard on public.report_events;
create trigger report_events_insert_guard before insert on public.report_events
for each row execute function public.enforce_report_event_insert();

drop trigger if exists item_reports_set_actor on public.item_reports;
create trigger item_reports_set_actor before insert or update on public.item_reports
for each row execute function public.enforce_moderation_actor();
drop trigger if exists item_reports_audit on public.item_reports;
create trigger item_reports_audit after insert or update on public.item_reports
for each row execute function public.audit_moderation_change();

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.reviews enable row level security;
alter table public.jobs enable row level security;
alter table public.community_posts enable row level security;
alter table public.facilities enable row level security;
alter table public.item_reports enable row level security;
alter table public.report_events enable row level security;
alter table public.role_audit_log enable row level security;
alter table public.moderation_audit_log enable row level security;

alter table public.profiles force row level security;
alter table public.user_roles force row level security;
alter table public.reviews force row level security;
alter table public.jobs force row level security;
alter table public.community_posts force row level security;
alter table public.facilities force row level security;
alter table public.item_reports force row level security;
alter table public.report_events force row level security;
alter table public.role_audit_log force row level security;
alter table public.moderation_audit_log force row level security;

drop policy if exists profiles_select_authenticated on public.profiles;
drop policy if exists profiles_select_self on public.profiles;
drop policy if exists profiles_insert_self on public.profiles;
drop policy if exists profiles_update_self on public.profiles;
create policy profiles_select_self on public.profiles for select to authenticated
using ((select auth.uid()) = user_id);
create policy profiles_insert_self on public.profiles for insert to authenticated
with check ((select auth.uid()) = user_id and requested_role in ('teacher', 'director'));
create policy profiles_update_self on public.profiles for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id and requested_role in ('teacher', 'director'));

drop policy if exists user_roles_select_self on public.user_roles;
create policy user_roles_select_self on public.user_roles for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists reviews_select_all on public.reviews;
drop policy if exists reviews_insert_authenticated on public.reviews;
drop policy if exists reviews_update_owner on public.reviews;
create policy reviews_select_all on public.reviews for select to anon, authenticated using (true);
create policy reviews_insert_authenticated on public.reviews for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy reviews_update_owner on public.reviews for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists jobs_select_all on public.jobs;
drop policy if exists jobs_insert_authenticated on public.jobs;
drop policy if exists jobs_update_owner on public.jobs;
create policy jobs_select_all on public.jobs for select to anon, authenticated using (true);
create policy jobs_insert_authenticated on public.jobs for insert to authenticated
with check (
  (select auth.uid()) = user_id
  and (select auth.jwt() ->> 'is_anonymous') is distinct from 'true'
  and public.has_app_role(array['director', 'admin']::public.app_role[])
);
create policy jobs_update_owner on public.jobs for update to authenticated
using (
  (select auth.uid()) = user_id
  and (select auth.jwt() ->> 'is_anonymous') is distinct from 'true'
  and public.has_app_role(array['director', 'admin']::public.app_role[])
)
with check (
  (select auth.uid()) = user_id
  and (select auth.jwt() ->> 'is_anonymous') is distinct from 'true'
  and public.has_app_role(array['director', 'admin']::public.app_role[])
);

drop policy if exists community_select_all on public.community_posts;
drop policy if exists community_insert_authenticated on public.community_posts;
drop policy if exists community_update_owner on public.community_posts;
create policy community_select_all on public.community_posts for select to anon, authenticated using (true);
create policy community_insert_authenticated on public.community_posts for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy community_update_owner on public.community_posts for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists facilities_select_all on public.facilities;
drop policy if exists facilities_insert_authenticated on public.facilities;
drop policy if exists facilities_update_pending_owner on public.facilities;
create policy facilities_select_all on public.facilities for select to anon, authenticated
using (status in ('pending', 'verified'));
create policy facilities_insert_authenticated on public.facilities for insert to authenticated
with check ((select auth.uid()) = user_id and status = 'pending');
create policy facilities_update_pending_owner on public.facilities for update to authenticated
using ((select auth.uid()) = user_id and status = 'pending')
with check ((select auth.uid()) = user_id and status = 'pending');

drop policy if exists reports_select_all on public.item_reports;
drop policy if exists reports_select_operator_only on public.item_reports;
drop policy if exists reports_insert_operator_only on public.item_reports;
drop policy if exists reports_update_operator_only on public.item_reports;
create policy reports_select_operator_only on public.item_reports for select to authenticated
using (public.has_app_role(array['operator', 'admin']::public.app_role[]));
create policy reports_insert_operator_only on public.item_reports for insert to authenticated
with check (
  public.has_app_role(array['operator', 'admin']::public.app_role[])
  and status in ('visible', 'hidden')
  and kind in ('review', 'job', 'community')
  and public.content_item_exists(item_id, kind)
);
create policy reports_update_operator_only on public.item_reports for update to authenticated
using (public.has_app_role(array['operator', 'admin']::public.app_role[]))
with check (
  public.has_app_role(array['operator', 'admin']::public.app_role[])
  and status in ('visible', 'hidden')
  and kind in ('review', 'job', 'community')
  and public.content_item_exists(item_id, kind)
);

drop policy if exists report_events_select_all on public.report_events;
drop policy if exists report_events_insert_self on public.report_events;
create policy report_events_insert_self on public.report_events for insert to authenticated
with check (
  (select auth.uid()) = reporter_id
  and kind in ('review', 'job', 'community')
  and public.content_item_exists(item_id, kind)
);

-- No policies are intentionally created for either audit table.

revoke all on table public.profiles from public, anon, authenticated;
revoke all on table public.user_roles from public, anon, authenticated;
revoke all on table public.reviews from public, anon, authenticated;
revoke all on table public.jobs from public, anon, authenticated;
revoke all on table public.community_posts from public, anon, authenticated;
revoke all on table public.facilities from public, anon, authenticated;
revoke all on table public.item_reports from public, anon, authenticated;
revoke all on table public.report_events from public, anon, authenticated;
revoke all on table public.role_audit_log from public, anon, authenticated;
revoke all on table public.moderation_audit_log from public, anon, authenticated;

grant select (user_id, requested_role, org_type, region, experience, alias, created_at, updated_at)
on table public.profiles to authenticated;
grant insert (user_id, requested_role, org_type, region, experience, alias)
on table public.profiles to authenticated;
grant update (requested_role, org_type, region, experience, alias)
on table public.profiles to authenticated;

grant select (user_id, role, verified, granted_at, revoked_at)
on table public.user_roles to authenticated;

grant select (id, facility_type, facility_name, region, overall_score, pay_score, workload_score, leadership_score, growth_score, tag, content, alias, org_type, created_at)
on table public.reviews to anon, authenticated;
grant insert (id, user_id, facility_type, facility_name, region, overall_score, pay_score, workload_score, leadership_score, growth_score, tag, content, alias, org_type)
on table public.reviews to authenticated;
grant update (facility_type, facility_name, region, overall_score, pay_score, workload_score, leadership_score, growth_score, tag, content, alias, org_type)
on table public.reviews to authenticated;

grant select (id, center_name, position, region, salary, employment_type, work_hours, deadline, description, alias, created_at)
on table public.jobs to anon, authenticated;
grant insert (id, user_id, center_name, position, region, salary, employment_type, work_hours, deadline, description, alias)
on table public.jobs to authenticated;
grant update (center_name, position, region, salary, employment_type, work_hours, deadline, description, alias)
on table public.jobs to authenticated;

grant select (id, category, topic, body, alias, created_at)
on table public.community_posts to anon, authenticated;
grant insert (id, user_id, category, topic, body, alias)
on table public.community_posts to authenticated;
grant update (category, topic, body, alias)
on table public.community_posts to authenticated;

grant select (id, facility_type, facility_name, region, road_address, latitude, longitude, status, created_at)
on table public.facilities to anon, authenticated;
grant insert (id, user_id, facility_type, facility_name, region, road_address, latitude, longitude)
on table public.facilities to authenticated;
grant update (facility_type, facility_name, region, road_address, latitude, longitude)
on table public.facilities to authenticated;

grant select (item_id, kind, status, handled_at, updated_at)
on table public.item_reports to authenticated;
grant insert (item_id, kind, status) on table public.item_reports to authenticated;
grant update (kind, status) on table public.item_reports to authenticated;

grant insert (item_id, kind, reason, reporter_id) on table public.report_events to authenticated;
grant usage, select on sequence public.report_events_id_seq to authenticated;

grant select, insert, update on table public.user_roles to service_role;
grant select, insert on table public.role_audit_log to service_role;
grant usage, select on sequence public.role_audit_log_id_seq to service_role;

revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.public_text_has_restricted_language(text) from public, anon, authenticated;
revoke all on function public.public_text_has_prohibited_content(text, boolean) from public, anon, authenticated;
revoke all on function public.enforce_public_text_policy() from public, anon, authenticated;
revoke all on function public.has_app_role(public.app_role[]) from public, anon, authenticated;
revoke all on function public.content_item_exists(text, text) from public, anon, authenticated;
revoke all on function public.enforce_content_insert_limits() from public, anon, authenticated;
revoke all on function public.enforce_report_event_insert() from public, anon, authenticated;
revoke all on function public.enforce_moderation_actor() from public, anon, authenticated;
revoke all on function public.audit_moderation_change() from public, anon, authenticated;
revoke all on function public.get_report_statuses() from public, anon, authenticated;
revoke all on function public.get_operator_report_queue() from public, anon, authenticated;
revoke all on function public.admin_set_user_role(uuid, uuid, public.app_role, boolean, uuid) from public, anon, authenticated;

grant execute on function public.has_app_role(public.app_role[]) to authenticated;
grant execute on function public.content_item_exists(text, text) to authenticated;
grant execute on function public.get_report_statuses() to anon, authenticated;
grant execute on function public.get_operator_report_queue() to authenticated;
grant execute on function public.admin_set_user_role(uuid, uuid, public.app_role, boolean, uuid) to service_role;

drop function if exists public.is_operator_claim();

commit;
