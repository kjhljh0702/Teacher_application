\set ON_ERROR_STOP on

insert into auth.users (id, is_anonymous) values
  ('00000000-0000-4000-8000-000000000001', true),
  ('00000000-0000-4000-8000-000000000002', false),
  ('00000000-0000-4000-8000-000000000003', false),
  ('00000000-0000-4000-8000-000000000004', false),
  ('00000000-0000-4000-8000-000000000005', false);

insert into public.user_roles (user_id, role, verified, granted_by) values
  ('00000000-0000-4000-8000-000000000002', 'director', true, '00000000-0000-4000-8000-000000000004'),
  ('00000000-0000-4000-8000-000000000003', 'operator', true, '00000000-0000-4000-8000-000000000004'),
  ('00000000-0000-4000-8000-000000000004', 'admin', true, '00000000-0000-4000-8000-000000000004');

create or replace function public.test_assert(condition boolean, message text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not condition then
    raise exception 'assertion failed: %', message;
  end if;
end;
$$;
grant execute on function public.test_assert(boolean, text) to anon, authenticated, service_role;

set role authenticated;
set request.jwt.claim.sub = '00000000-0000-4000-8000-000000000001';
set request.jwt.claims = '{"is_anonymous":true}';

insert into public.reviews (
  id, user_id, facility_type, facility_name, region,
  overall_score, pay_score, workload_score, leadership_score, growth_score,
  tag, content, alias, org_type
) values (
  'review-owner-test', '00000000-0000-4000-8000-000000000001', '유치원', '테스트유치원', '서울',
  4, 4, 3, 4, 4, '#테스트', '작성자 권한 테스트', '익명', '유치원'
);

insert into public.reviews (
  id, user_id, facility_type, facility_name, region,
  overall_score, pay_score, workload_score, leadership_score, growth_score,
  tag, content, alias, org_type
) values (
  'review-masked-policy-test', '00000000-0000-4000-8000-000000000001', '유치원', '정상유치원', '서울',
  4, 4, 4, 4, 4, '#정책', '*** 원장과 ***유치원에 관한 근무 경험', '익명', '유치원'
);

insert into public.reviews (
  id, user_id, facility_type, facility_name, region,
  overall_score, pay_score, workload_score, leadership_score, growth_score,
  tag, content, alias, org_type
) values (
  'review-generic-institution-test', '00000000-0000-4000-8000-000000000001', '유치원', '정상유치원', '서울',
  4, 4, 4, 4, 4, '#정책', '공립유치원 운영 방식에 관한 일반 경험', '익명', '유치원'
);

insert into public.reviews (
  id, user_id, facility_type, facility_name, region,
  overall_score, pay_score, workload_score, leadership_score, growth_score,
  tag, content, alias, org_type
) values (
  'review-safe-language-context-test', '00000000-0000-4000-8000-000000000001', '유치원', '정상유치원', '서울',
  4, 4, 4, 4, 4, '#정책', '새 사업의 시발점이며 성희롱 피해 신고 절차를 확인했습니다', '익명', '유치원'
);

do $$
begin
  begin
    insert into public.reviews (
      id, user_id, facility_type, facility_name, region,
      overall_score, pay_score, workload_score, leadership_score, growth_score,
      tag, content, alias, org_type
    ) values (
      'review-profanity-denied', '00000000-0000-4000-8000-000000000001', '유치원', '정상유치원', '서울',
      4, 4, 4, 4, 4, '#정책', '씨발이라는 욕설 원문', '익명', '유치원'
    );
    raise exception 'raw profanity unexpectedly succeeded';
  exception when raise_exception then
    if sqlerrm <> 'public text policy violation' then raise; end if;
  end;

  begin
    insert into public.reviews (
      id, user_id, facility_type, facility_name, region,
      overall_score, pay_score, workload_score, leadership_score, growth_score,
      tag, content, alias, org_type
    ) values (
      'review-obfuscated-profanity-denied', '00000000-0000-4000-8000-000000000001', '유치원', '정상유치원', '서울',
      4, 4, 4, 4, 4, '#정책', '썅 그리고 개.같.은 운영', '익명', '유치원'
    );
    raise exception 'obfuscated profanity unexpectedly succeeded';
  exception when raise_exception then
    if sqlerrm <> 'public text policy violation' then raise; end if;
  end;

  begin
    insert into public.reviews (
      id, user_id, facility_type, facility_name, region,
      overall_score, pay_score, workload_score, leadership_score, growth_score,
      tag, content, alias, org_type
    ) values (
      'review-sexual-language-denied', '00000000-0000-4000-8000-000000000001', '유치원', '정상유치원', '서울',
      4, 4, 4, 4, 4, '#정책', '오 럴 섹 스와 몸-캠 홍보', '익명', '유치원'
    );
    raise exception 'sexual language unexpectedly succeeded';
  exception when raise_exception then
    if sqlerrm <> 'public text policy violation' then raise; end if;
  end;

  begin
    insert into public.reviews (
      id, user_id, facility_type, facility_name, region,
      overall_score, pay_score, workload_score, leadership_score, growth_score,
      tag, content, alias, org_type
    ) values (
      'review-person-denied', '00000000-0000-4000-8000-000000000001', '유치원', '정상유치원', '서울',
      4, 4, 4, 4, 4, '#정책', '김민수 원장을 직접 지목', '익명', '유치원'
    );
    raise exception 'raw personal name unexpectedly succeeded';
  exception when raise_exception then
    if sqlerrm <> 'public text policy violation' then raise; end if;
  end;

  begin
    insert into public.reviews (
      id, user_id, facility_type, facility_name, region,
      overall_score, pay_score, workload_score, leadership_score, growth_score,
      tag, content, alias, org_type
    ) values (
      'review-institution-denied', '00000000-0000-4000-8000-000000000001', '유치원', '정상유치원', '서울',
      4, 4, 4, 4, 4, '#정책', '해오름유치원을 본문에서 직접 지목', '익명', '유치원'
    );
    raise exception 'raw institution name unexpectedly succeeded';
  exception when raise_exception then
    if sqlerrm <> 'public text policy violation' then raise; end if;
  end;
end;
$$;

do $$
begin
  begin
    insert into public.profiles (user_id, requested_role, org_type, region, experience, alias)
    values ('00000000-0000-4000-8000-000000000001', 'teacher', '유치원', '서울', '1-3년', '김민수');
    raise exception 'personal-name alias unexpectedly succeeded';
  exception when raise_exception then
    if sqlerrm <> 'public alias may identify a person' then raise; end if;
  end;
end;
$$;

insert into public.community_posts (id, user_id, category, topic, body, alias)
values ('community-report-test', '00000000-0000-4000-8000-000000000001', '정보', '테스트', '신고 테스트', '익명');

insert into public.facilities (
  id, user_id, facility_type, facility_name, region, road_address, latitude, longitude
) values (
  'facility-owner-test', '00000000-0000-4000-8000-000000000001', '유치원', '보안테스트유치원', '서울',
  '서울특별시 중구 세종대로 110', 37.566300, 126.977900
);

update public.facilities set facility_name = '본인수정유치원' where id = 'facility-owner-test';
select public.test_assert(
  exists (select 1 from public.facilities where id = 'facility-owner-test' and facility_name = '본인수정유치원'),
  'facility owner could not update pending row'
);

do $$
begin
  begin
    update public.reviews set content = '개새끼라는 욕설 원문' where id = 'review-owner-test';
    raise exception 'unsafe review update unexpectedly succeeded';
  exception when raise_exception then
    if sqlerrm <> 'public text policy violation' then raise; end if;
  end;
end;
$$;

do $$
begin
  begin
    insert into public.jobs (
      id, user_id, center_name, position, region, salary,
      employment_type, work_hours, deadline, description, alias
    ) values (
      'anonymous-job-denied', '00000000-0000-4000-8000-000000000001', '기관', '교사', '서울', '협의',
      '정규직', '09:00-18:00', current_date + 10, '거부되어야 함', '익명'
    );
    raise exception 'anonymous job insert unexpectedly succeeded';
  exception when insufficient_privilege then null;
  end;
end;
$$;

do $$
begin
  begin
    select user_id from public.reviews limit 1;
    raise exception 'author UUID unexpectedly readable';
  exception when insufficient_privilege then null;
  end;
end;
$$;

do $$
begin
  begin
    select user_id from public.facilities limit 1;
    raise exception 'facility author UUID unexpectedly readable';
  exception when insufficient_privilege then null;
  end;
end;
$$;

do $$
begin
  begin
    select * from public.report_events limit 1;
    raise exception 'report events unexpectedly readable';
  exception when insufficient_privilege then null;
  end;
end;
$$;

do $$
begin
  begin
    update public.user_roles set role = 'admin' where user_id = '00000000-0000-4000-8000-000000000001';
    raise exception 'trusted role unexpectedly writable';
  exception when insufficient_privilege then null;
  end;
end;
$$;

reset role;
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-4000-8000-000000000002';
set request.jwt.claims = '{"is_anonymous":false}';

insert into public.jobs (
  id, user_id, center_name, position, region, salary,
  employment_type, work_hours, deadline, description, alias
) values (
  'director-job-test', '00000000-0000-4000-8000-000000000002', '기관', '교사', '서울', '협의',
  '정규직', '09:00-18:00', current_date + 10, '인증 원장 공고', '원장'
);

do $$
declare
  changed integer;
begin
  update public.reviews set content = '타인 수정 시도' where id = 'review-owner-test';
  get diagnostics changed = row_count;
  perform public.test_assert(changed = 0, 'non-owner changed another review');
end;
$$;

do $$
declare
  changed integer;
begin
  update public.facilities set facility_name = '타인수정시도' where id = 'facility-owner-test';
  get diagnostics changed = row_count;
  perform public.test_assert(changed = 0, 'non-owner changed another facility');
end;
$$;

do $$
begin
  begin
    insert into public.facilities (
      id, user_id, facility_type, facility_name, region, road_address, latitude, longitude
    ) values (
      'facility-duplicate-test', '00000000-0000-4000-8000-000000000002', '유치원', '본인수정유치원', '서울',
      '서울특별시 중구 세종대로 110', 37.566300, 126.977900
    );
    raise exception 'duplicate facility unexpectedly succeeded';
  exception when unique_violation then null;
  end;
end;
$$;

do $$
begin
  begin
    insert into public.report_events (item_id, kind, reason, reporter_id)
    values ('community-report-test', 'community', '김민수 원장 개인정보', '00000000-0000-4000-8000-000000000002');
    raise exception 'free-text report reason unexpectedly succeeded';
  exception when invalid_parameter_value then null;
  end;
end;
$$;

insert into public.report_events (item_id, kind, reason, reporter_id)
values ('community-report-test', 'community', '성적·음란 표현', '00000000-0000-4000-8000-000000000002');

do $$
begin
  begin
    insert into public.report_events (item_id, kind, reason, reporter_id)
    values ('community-report-test', 'community', '스팸·광고', '00000000-0000-4000-8000-000000000002');
    raise exception 'duplicate report unexpectedly succeeded';
  exception when unique_violation then null;
  end;
end;
$$;

do $$
begin
  begin
    insert into public.item_reports (item_id, kind, status)
    values ('community-report-test', 'community', 'hidden');
    raise exception 'non-operator moderation unexpectedly succeeded';
  exception when insufficient_privilege then null;
  end;
end;
$$;

reset role;
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-4000-8000-000000000003';
set request.jwt.claims = '{"is_anonymous":false}';

insert into public.item_reports (item_id, kind, status)
values ('community-report-test', 'community', 'hidden');

select public.test_assert(
  exists (select 1 from public.get_operator_report_queue() where item_id = 'community-report-test' and status = 'hidden'),
  'operator queue did not expose moderated report'
);

reset role;
set role anon;
select public.test_assert(
  exists (select 1 from public.get_report_statuses() where item_id = 'community-report-test' and status = 'hidden'),
  'public aggregate status is missing'
);

reset role;
set role service_role;
select public.admin_set_user_role(
  '00000000-0000-4000-8000-000000000004',
  '00000000-0000-4000-8000-000000000005',
  'director',
  true,
  '10000000-0000-4000-8000-000000000001'
);
select public.test_assert(
  exists (
    select 1 from public.role_audit_log
    where target_user_id = '00000000-0000-4000-8000-000000000005'
      and next_role = 'director'
      and next_verified = true
  ),
  'role change audit record is missing'
);

reset role;
drop function public.test_assert(boolean, text);
select 'security policy integration checks passed' as result;
