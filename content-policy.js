(function initializeTeacherLinkContentPolicy(globalScope) {
  "use strict";

  const TERM_GROUPS = Object.freeze({
    profanity: Object.freeze([
      "개씹", "개씨발", "개시발", "씹새끼", "씹새", "씹년", "씹놈",
      "씨발", "시발", "씨팔", "시팔", "씹발", "쒸발", "쉬발", "슈발", "싯팔", "ㅅㅂ", "ㅆㅂ",
      "썅", "썅년", "썅놈", "쌍년", "쌍놈",
      "개새끼", "개새기", "개세끼", "개세기", "개자식", "개같은", "개같다", "개같네", "개같이", "개같아서",
      "병신", "븅신", "빙신", "ㅂㅅ", "등신", "머저리",
      "지랄", "지롤", "ㅈㄹ", "존나", "졸라", "ㅈㄴ",
      "좆", "좃", "좇", "조까", "좆까", "좃까", "좆같은", "좆같다", "좃같은", "좃같다",
      "미친놈", "미친년", "미친새끼", "미친것", "미친",
      "꺼져", "닥쳐", "엿먹어", "엿먹", "뒈져", "뒤져", "디져",
      "또라이", "꼴통", "찌질이", "찐따", "호구",
      "애미", "에미", "느금마", "니미", "니기미",
      "창녀", "걸레년", "걸레같은", "틀딱", "맘충", "급식충",
    ]),
    sexual: Object.freeze([
      "오럴섹스", "애널섹스", "구강성교", "항문성교", "질내사정", "질외사정", "콘돔없이",
      "가슴만져", "엉덩이만져", "성기만져", "성기노출", "성기사진", "꼬추사진", "자지사진", "보지사진",
      "음란사진", "음란영상", "야한사진", "야한영상", "누드사진", "나체사진", "성인방송",
      "섹스", "쎅스", "쌕스", "섹쓰", "ㅅㅅ", "야동", "야사", "포르노", "음란물", "성인물",
      "자위행위", "딸딸이", "딸치기", "딸치다", "딸잡이",
      "오럴", "애널", "펠라치오", "펠라", "후장", "보빨", "씹보지", "씹자지",
      "질싸", "노콘", "섹파", "원나잇", "조건만남", "몸캠", "벗방", "누드", "알몸", "발기", "성노예",
    ]),
  });

  const SEPARATOR_SOURCE = "[\\s._~!@#$%^&*()+\\-=/\\\\|,?<>:;\"'·ㆍ…]*";
  const SEPARATOR_PATTERN = /[\s._~!@#$%^&*()+\-=/\\|,?<>:;"'·ㆍ…]/gu;

  function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function buildPatternSource(terms) {
    return [...terms]
      .sort((left, right) => Array.from(right).length - Array.from(left).length)
      .map((term) => Array.from(term.normalize("NFKC"), escapeRegExp).join(SEPARATOR_SOURCE))
      .join("|");
  }

  const PATTERN_SOURCES = Object.freeze({
    profanity: buildPatternSource(TERM_GROUPS.profanity),
    sexual: buildPatternSource(TERM_GROUPS.sexual),
  });

  function isAllowedContext(type, match, offset, source) {
    if (type !== "profanity" || compact(match) !== "시발") return false;
    const suffix = source.slice(offset + match.length).replace(SEPARATOR_PATTERN, "");
    return suffix.startsWith("점") || suffix.startsWith("역");
  }

  function compact(value) {
    return String(value).replace(SEPARATOR_PATTERN, "").toLowerCase();
  }

  function maskRestrictedLanguage(input, createMask) {
    let text = String(input || "").normalize("NFKC");
    const counts = { profanity: 0, sexual: 0 };

    for (const type of ["profanity", "sexual"]) {
      const pattern = new RegExp(`(?:${PATTERN_SOURCES[type]})`, "giu");
      text = text.replace(pattern, (match, offset, source) => {
        if (isAllowedContext(type, match, offset, source)) return match;
        counts[type] += 1;
        return createMask(match, type);
      });
    }

    return {
      text,
      counts,
      masked: counts.profanity + counts.sexual,
    };
  }

  globalScope.TeacherLinkContentPolicy = Object.freeze({
    terms: TERM_GROUPS,
    maskRestrictedLanguage,
  });
})(globalThis);
