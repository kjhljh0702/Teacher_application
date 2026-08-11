const APP_VERSION = 6;
const STORAGE_KEY = "teacher_link_v2_state";
const AUTO_HIDE_REPORT_COUNT = 3;
const CLOUD_SYNC_TABLES = {
  profile: "profiles",
  reviews: "reviews",
  jobs: "jobs",
  community: "community_posts",
  facilities: "facilities",
};

const REGION_OPTIONS = [
  "서울",
  "경기",
  "인천",
  "부산",
  "대구",
  "광주",
  "대전",
  "울산",
  "세종",
  "강원",
  "충북",
  "충남",
  "전북",
  "전남",
  "경북",
  "경남",
  "제주",
];

const CATEGORY_OPTIONS = ["수업자료", "노무상담", "고충토로", "이직상담"];
const NOTIFICATION_TARGETS = new Set(["home", "facilities", "reviews", "jobs", "community", "profile"]);
const CONTENT_POLICY = window.TeacherLinkContentPolicy;
if (!CONTENT_POLICY) throw new Error("콘텐츠 정책 모듈을 불러오지 못했습니다.");
const REPORT_REASON_OPTIONS = Object.freeze([
  "개인정보 노출",
  "아동정보 노출",
  "명예훼손·모욕",
  "폭력·위협",
  "성적·음란 표현",
  "허위 채용·사기",
  "스팸·광고",
  "기타 정책 위반",
]);
const COMMON_KOREAN_SURNAMES = new Set(Array.from("김이박최정강조윤장임한오서신권황안송전홍유고문양손배백허남심노하곽성차주우구민진지엄채원천방공현함변염여추도소석선설마길연위표명기반왕금옥육인맹제모탁국어은편용"));
const GENERIC_INSTITUTION_PREFIXES = new Set(["국공립", "공립", "사립", "민간", "가정", "직장", "법인", "병설", "단설", "공공형", "국립"]);
const KOREA_BOUNDS = Object.freeze({ south: 33, north: 38.7, west: 124.5, east: 131.9 });
const REGION_CENTERS = Object.freeze({
  서울: [37.5665, 126.978], 경기: [37.275, 127.009], 인천: [37.456, 126.705], 부산: [35.18, 129.075],
  대구: [35.872, 128.602], 광주: [35.16, 126.852], 대전: [36.35, 127.385], 울산: [35.539, 129.311],
  세종: [36.48, 127.289], 강원: [37.885, 127.73], 충북: [36.635, 127.491], 충남: [36.659, 126.673],
  전북: [35.82, 127.109], 전남: [34.817, 126.463], 경북: [36.576, 128.505], 경남: [35.238, 128.692], 제주: [33.5, 126.531],
});

const refs = {
  tabs: Array.from(document.querySelectorAll(".tab-btn")),
  panels: {
    home: document.getElementById("homePanel"),
    facilities: document.getElementById("facilitiesPanel"),
    reviews: document.getElementById("reviewsPanel"),
    jobs: document.getElementById("jobsPanel"),
    community: document.getElementById("communityPanel"),
    profile: document.getElementById("profilePanel"),
    moderation: document.getElementById("moderationPanel"),
  },
  appShell: document.getElementById("appShell"),
  authGate: document.getElementById("authGate"),
  authCloudStatus: document.getElementById("authCloudStatus"),
  demoModeBtn: document.getElementById("demoModeBtn"),
  exitDemoBtn: document.getElementById("exitDemoBtn"),
  homeAlias: document.getElementById("homeAlias"),
  profileBadge: document.getElementById("profileBadge"),
  profileSummaryText: document.getElementById("profileSummaryText"),
  profileBtn: document.getElementById("profileBtn"),
  notificationWrap: document.getElementById("notificationWrap"),
  notificationBtn: document.getElementById("notificationBtn"),
  notificationBadge: document.getElementById("notificationBadge"),
  notificationTray: document.getElementById("notificationTray"),
  notificationList: document.getElementById("notificationList"),
  markNotificationsReadBtn: document.getElementById("markNotificationsReadBtn"),
  notificationPermissionBtn: document.getElementById("notificationPermissionBtn"),
  notificationSoundBtn: document.getElementById("notificationSoundBtn"),
  notificationTestBtn: document.getElementById("notificationTestBtn"),
  notificationPrivacyHint: document.getElementById("notificationPrivacyHint"),
  profileNotificationBtn: document.getElementById("profileNotificationBtn"),
  profileSoundBtn: document.getElementById("profileSoundBtn"),
  editProfileBtn: document.getElementById("editProfileBtn"),
  closeProfileBtn: document.getElementById("closeProfileBtn"),
  profileGate: document.getElementById("profileGate"),
  profileForm: document.getElementById("profileForm"),
  reviewForm: document.getElementById("reviewForm"),
  facilityForm: document.getElementById("facilityForm"),
  facilitySearch: document.getElementById("facilitySearch"),
  facilityTypeFilter: document.getElementById("facilityTypeFilter"),
  facilityRadiusFilter: document.getElementById("facilityRadiusFilter"),
  nearbyFacilitiesBtn: document.getElementById("nearbyFacilitiesBtn"),
  demoLocationBtn: document.getElementById("demoLocationBtn"),
  verifyFacilityAddressBtn: document.getElementById("verifyFacilityAddressBtn"),
  facilityAddressStatus: document.getElementById("facilityAddressStatus"),
  facilityMap: document.getElementById("facilityMap"),
  facilityMapMode: document.getElementById("facilityMapMode"),
  facilityMapHint: document.getElementById("facilityMapHint"),
  facilityList: document.getElementById("facilityList"),
  facilityCount: document.getElementById("facilityCount"),
  locationPrivacyHint: document.getElementById("locationPrivacyHint"),
  reviewPolicyHint: document.getElementById("reviewPolicyHint"),
  jobPolicyHint: document.getElementById("jobPolicyHint"),
  communityPolicyHint: document.getElementById("communityPolicyHint"),
  reviewSearch: document.getElementById("reviewSearch"),
  reviewFacilityType: document.getElementById("reviewFacilityType"),
  reviewRegion: document.getElementById("reviewRegion"),
  reviewMinRating: document.getElementById("reviewMinRating"),
  reviewList: document.getElementById("reviewList"),
  reviewCount: document.getElementById("reviewCount"),
  jobForm: document.getElementById("jobForm"),
  jobFormHint: document.getElementById("jobFormHint"),
  jobSearch: document.getElementById("jobSearch"),
  jobRegionFilter: document.getElementById("jobRegionFilter"),
  jobOrderBy: document.getElementById("jobOrderBy"),
  jobList: document.getElementById("jobList"),
  jobCount: document.getElementById("jobCount"),
  communityForm: document.getElementById("communityForm"),
  communitySearch: document.getElementById("communitySearch"),
  communityCategoryFilter: document.getElementById("communityCategoryFilter"),
  communityOrderBy: document.getElementById("communityOrderBy"),
  communityList: document.getElementById("communityList"),
  communityCount: document.getElementById("communityCount"),
  reportList: document.getElementById("reportList"),
  reportCount: document.getElementById("reportCount"),
  reportGate: document.getElementById("reportGate"),
  reportForm: document.getElementById("reportForm"),
  closeReportBtn: document.getElementById("closeReportBtn"),
  insightGrid: document.getElementById("insightGrid"),
  regionBars: document.getElementById("regionBars"),
  statReviews: document.getElementById("statReviews"),
  statJobs: document.getElementById("statJobs"),
  statCommunity: document.getElementById("statCommunity"),
  statReports: document.getElementById("statReports"),
  exportBtn: document.getElementById("exportBtn"),
  importInput: document.getElementById("importInput"),
  resetBtn: document.getElementById("resetBtn"),
  cloudStatus: document.getElementById("cloudStatus"),
  cloudAuthBtn: document.getElementById("cloudAuthBtn"),
  cloudKakaoBtn: document.getElementById("cloudKakaoBtn"),
  cloudLinkKakaoBtn: document.getElementById("cloudLinkKakaoBtn"),
  cloudSyncBtn: document.getElementById("cloudSyncBtn"),
  cloudSignOutBtn: document.getElementById("cloudSignOutBtn"),
  captchaContainer: document.getElementById("captchaContainer"),
  toast: document.getElementById("toast"),
};

const state = createDefaultState();
const cloudRuntime = {
  client: null,
  user: null,
  access: {
    role: "teacher",
    verified: false,
  },
  authSubscription: null,
  isSyncing: false,
  captchaToken: "",
  captchaWidgetId: null,
};

const mapRuntime = {
  sdkState: "idle",
  map: null,
  geocoder: null,
  markers: [],
  userMarker: null,
  userLocation: null,
  verifiedAddress: null,
  activeFacilityId: "",
  visibleFacilities: [],
};

const reportRuntime = {
  itemId: "",
  kind: "",
};

let notificationAudioContext = null;

void boot();

async function boot() {
  hydrateState();
  stripLegacyCloudCredentials();
  populateRegionSelects();
  bindEvents();

  if (!state.reviews.length && !state.jobs.length && !state.community.length) {
    seedData();
  }
  if (!state.facilities.length) seedFacilities();
  if (!state.notifications.length) seedNotifications();

  syncEntryGate();
  syncProfileGate();
  syncRoleUi();
  const hashTarget = window.location.hash.replace(/^#/, "");
  applyTab(NOTIFICATION_TARGETS.has(hashTarget) ? hashTarget : state.ui.activeTab || "home");
  renderAll();
  void initializeFacilityMap();
  await connectCloudFromConfig();
  await setupCaptcha();
  syncEntryGate();
  syncProfileGate();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./service-worker.js?v=6.5.0").catch(() => {
      // noop
    });
  }
}

function createDefaultState() {
  return {
    version: APP_VERSION,
    profile: {
      role: "",
      orgType: "",
      region: "",
      experience: "",
      alias: "",
      verified: false,
    },
    ui: {
      activeTab: "home",
      demoMode: false,
    },
    reviews: [],
    facilities: [],
    jobs: [],
    community: [],
    reactions: {},
    myReactions: {},
    bookmarks: {
      jobs: {},
    },
    cloud: {
      userId: "",
      lastSyncAt: 0,
    },
    reports: {},
    moderationLog: [],
    preferences: {
      browserNotifications: false,
      sound: true,
    },
    notifications: [],
  };
}

function populateRegionSelects() {
  const regionSelects = [
    refs.reviewRegion,
    refs.jobRegionFilter,
    refs.profileForm.querySelector('select[name="region"]'),
    refs.reviewForm.querySelector('select[name="region"]'),
    refs.facilityForm.querySelector('select[name="region"]'),
    refs.jobForm.querySelector('select[name="region"]'),
  ].filter(Boolean);

  regionSelects.forEach((select) => {
    const current = select.value;
    const baseOption = select.querySelector("option[value='all']") || select.querySelector("option[value='']");
    const base = baseOption ? baseOption.outerHTML : "";
    select.innerHTML = base + REGION_OPTIONS.map((region) => `<option value="${escapeHtml(region)}">${escapeHtml(region)}</option>`).join("");
    if (current) {
      select.value = current;
    }
  });
}

function bindEvents() {
  refs.profileBtn.addEventListener("click", () => {
    applyTab("profile");
    persistState();
  });

  refs.notificationBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    setNotificationTray(refs.notificationTray.hidden);
  });

  refs.notificationTray.addEventListener("click", (event) => event.stopPropagation());
  refs.markNotificationsReadBtn.addEventListener("click", markAllNotificationsRead);
  refs.notificationPermissionBtn.addEventListener("click", () => void toggleBrowserNotifications());
  refs.profileNotificationBtn.addEventListener("click", () => void toggleBrowserNotifications());
  refs.notificationSoundBtn.addEventListener("click", toggleNotificationSound);
  refs.profileSoundBtn.addEventListener("click", toggleNotificationSound);
  refs.notificationTestBtn.addEventListener("click", sendTestNotification);
  refs.notificationList.addEventListener("click", onNotificationItemClick);

  document.addEventListener("click", () => setNotificationTray(false));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setNotificationTray(false);
  });

  navigator.serviceWorker?.addEventListener("message", (event) => {
    if (event.data?.type !== "OPEN_NOTIFICATION") return;
    openNotificationTarget(event.data.target);
  });

  refs.editProfileBtn.addEventListener("click", () => {
    refs.profileGate.hidden = false;
    fillProfileForm();
  });

  refs.closeProfileBtn.addEventListener("click", () => {
    if (!state.profile.role) {
      showToast("첫 진입에서는 프로필 설정이 필요합니다.");
      return;
    }
    refs.profileGate.hidden = true;
  });

  refs.profileForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const isFirstProfile = !state.profile.role;
    const form = new FormData(refs.profileForm);
    const role = sanitizeText(form.get("role"), 12);
    const orgType = sanitizeText(form.get("orgType"), 12);
    const region = sanitizeText(form.get("region"), 12);
    const experience = sanitizeText(form.get("experience"), 12);
    let alias = sanitizeText(form.get("alias"), 24);
    const aliasPolicy = runPolicyFilter(alias);
    const aliasReplaced = Boolean(alias && (aliasPolicy.blocked || aliasPolicy.masked > 0 || isLikelyStandaloneKoreanName(alias)));

    if (!["teacher", "director"].includes(role) || !orgType || !region || !experience) {
      showToast("프로필 항목을 모두 선택해 주세요.");
      return;
    }

    if (!alias || aliasReplaced) alias = randomAlias();

    state.profile = {
      role,
      orgType,
      region,
      experience,
      alias,
      verified: false,
    };

    refs.reviewRegion.value = region;
    refs.jobRegionFilter.value = region;
    refs.reviewForm.querySelector('select[name="region"]').value = region;
    refs.jobForm.querySelector('select[name="region"]').value = region;
    refs.facilityForm.querySelector('select[name="region"]').value = region;

    persistState();
    syncProfileGate();
    syncRoleUi();
    renderAll();
    await upsertRemoteProfile();
    if (isFirstProfile) applyTab("home");
    showToast(aliasReplaced ? "실명·민감 표현 가능성이 있어 익명 별칭을 자동 생성했습니다." : "프로필 설정이 완료됐습니다.");
  });

  refs.tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      applyTab(tab.dataset.tab);
      persistState();
    });
  });

  document.querySelectorAll("[data-go-page]").forEach((button) => {
    button.addEventListener("click", () => {
      applyTab(button.dataset.goPage);
      persistState();
    });
  });

  [refs.reviewSearch, refs.reviewFacilityType, refs.reviewRegion, refs.reviewMinRating].forEach((el) => {
    el.addEventListener("input", renderReviews);
    el.addEventListener("change", renderReviews);
  });

  [refs.facilitySearch, refs.facilityTypeFilter, refs.facilityRadiusFilter].forEach((el) => {
    el.addEventListener("input", renderFacilities);
    el.addEventListener("change", renderFacilities);
  });

  refs.facilityForm.elements.roadAddress.addEventListener("input", () => {
    mapRuntime.verifiedAddress = null;
    setFacilityAddressStatus("주소를 수정했습니다. 다시 확인해 주세요.", "");
  });

  refs.verifyFacilityAddressBtn.addEventListener("click", () => {
    void verifyFacilityAddress();
  });

  refs.nearbyFacilitiesBtn.addEventListener("click", () => {
    void useCurrentLocation();
  });

  refs.demoLocationBtn.addEventListener("click", () => {
    setNearbyLocation({ latitude: 37.5665, longitude: 126.978 }, "서울시청 기준으로 가까운 기관부터 표시합니다.");
  });

  [refs.jobSearch, refs.jobRegionFilter, refs.jobOrderBy].forEach((el) => {
    el.addEventListener("input", renderJobs);
    el.addEventListener("change", renderJobs);
  });

  [refs.communitySearch, refs.communityCategoryFilter, refs.communityOrderBy].forEach((el) => {
    el.addEventListener("input", renderCommunity);
    el.addEventListener("change", renderCommunity);
  });

  refs.reviewForm.addEventListener("submit", onReviewSubmit);
  refs.facilityForm.addEventListener("submit", onFacilitySubmit);
  refs.jobForm.addEventListener("submit", onJobSubmit);
  refs.communityForm.addEventListener("submit", onCommunitySubmit);
  refs.reportForm.addEventListener("submit", submitReport);
  refs.closeReportBtn.addEventListener("click", closeReportModal);
  refs.reportGate.addEventListener("click", (event) => {
    if (event.target === refs.reportGate) closeReportModal();
  });
  bindPolicyPreview(refs.reviewForm, refs.reviewPolicyHint);
  bindPolicyPreview(refs.jobForm, refs.jobPolicyHint);
  bindPolicyPreview(refs.communityForm, refs.communityPolicyHint);

  document.body.addEventListener("click", onBodyActionClick);

  refs.exportBtn.addEventListener("click", exportState);
  refs.importInput.addEventListener("change", importStateFromFile);
  refs.resetBtn.addEventListener("click", resetToSeed);

  refs.cloudAuthBtn.addEventListener("click", () => {
    void signInCloudAnonymously();
  });

  refs.cloudKakaoBtn.addEventListener("click", () => {
    void signInCloudWithKakao();
  });

  refs.cloudLinkKakaoBtn.addEventListener("click", () => {
    void signInCloudWithKakao();
  });

  refs.demoModeBtn.addEventListener("click", () => {
    if (!getAppConfig().allowDemoMode) return;
    state.ui.demoMode = true;
    state.ui.activeTab = "home";
    persistState();
    syncEntryGate();
    syncProfileGate();
    applyTab("home");
    renderCloudStatus();
    showToast("로컬 데모 모드로 시작합니다.");
  });

  refs.exitDemoBtn.addEventListener("click", () => {
    state.ui.demoMode = false;
    state.ui.activeTab = "home";
    persistState();
    syncEntryGate();
    syncProfileGate();
    renderCloudStatus();
  });

  refs.cloudSyncBtn.addEventListener("click", () => {
    void syncCloudNow();
  });

  refs.cloudSignOutBtn.addEventListener("click", () => {
    void signOutCloud();
  });
}

function bindPolicyPreview(form, hint) {
  form.querySelectorAll("[data-policy-preview]").forEach((field) => {
    field.addEventListener("input", () => renderPolicyPreview(form, hint));
  });
}

function renderPolicyPreview(form, hint) {
  const results = Array.from(form.querySelectorAll("[data-policy-preview]"), (field) => runPolicyFilter(field.value));
  const blocked = results.find((result) => result.blocked);
  if (blocked) {
    hint.textContent = `등록 제한: ${blocked.reason}`;
    hint.className = "hint policy-hint blocked";
    return;
  }
  const counts = mergePolicyCounts(...results);
  const summary = formatPolicySummary(counts);
  hint.textContent = summary ? `등록 시 자동 마스킹: ${summary}` : "정책 검사 통과 · 지목과 욕설·19금 표현 없이 경험 중심으로 작성해 주세요.";
  hint.className = `hint policy-hint${summary ? " masking" : ""}`;
}

async function verifyFacilityAddress() {
  const addressInput = refs.facilityForm.elements.roadAddress;
  const region = sanitizeText(refs.facilityForm.elements.region.value, 12);
  const roadAddress = sanitizeText(addressInput.value, 120);

  mapRuntime.verifiedAddress = null;
  if (!isLikelyRoadAddress(roadAddress)) {
    setFacilityAddressStatus("도로명과 건물번호가 포함된 주소를 입력해 주세요.", "error");
    return;
  }

  refs.verifyFacilityAddressBtn.disabled = true;
  setFacilityAddressStatus("도로명주소를 확인하고 있습니다.", "");
  try {
    if (mapRuntime.geocoder && window.kakao?.maps?.services) {
      const result = await geocodeRoadAddress(roadAddress);
      if (!result) {
        setFacilityAddressStatus("카카오 주소 검색에서 확인되지 않았습니다.", "error");
        return;
      }
      const latitude = Number(result.y);
      const longitude = Number(result.x);
      if (!isCoordinateInKorea(latitude, longitude)) {
        setFacilityAddressStatus("대한민국 영역 밖의 주소는 등록할 수 없습니다.", "error");
        return;
      }
      const canonical = sanitizeText(result.road_address?.address_name || result.address_name || roadAddress, 120);
      addressInput.value = canonical;
      mapRuntime.verifiedAddress = { roadAddress: canonical, latitude, longitude, mode: "kakao" };
      setFacilityAddressStatus(`확인 완료 · ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`, "verified");
      previewVerifiedAddress(latitude, longitude);
      return;
    }

    if (!cloudRuntime.client && getAppConfig().allowDemoMode) {
      if (!REGION_CENTERS[region]) {
        setFacilityAddressStatus("지역을 먼저 선택해 주세요.", "error");
        return;
      }
      const [latitude, longitude] = makeDemoCoordinate(region, roadAddress);
      mapRuntime.verifiedAddress = { roadAddress, latitude, longitude, mode: "demo" };
      setFacilityAddressStatus("로컬 데모 좌표로 확인됨 · 운영 등록에는 카카오 지도 키 필요", "demo");
      previewVerifiedAddress(latitude, longitude);
      return;
    }

    setFacilityAddressStatus("지도 API가 설정되지 않아 주소를 검증할 수 없습니다.", "error");
  } finally {
    refs.verifyFacilityAddressBtn.disabled = false;
  }
}

function geocodeRoadAddress(roadAddress) {
  return new Promise((resolve) => {
    mapRuntime.geocoder.addressSearch(roadAddress, (results, status) => {
      const ok = window.kakao?.maps?.services?.Status?.OK;
      resolve(status === ok && results?.length ? results[0] : null);
    });
  });
}

async function onFacilitySubmit(event) {
  event.preventDefault();
  if (!state.profile.role) {
    showToast("프로필 설정 후 기관을 등록할 수 있습니다.");
    refs.profileGate.hidden = false;
    return;
  }

  const form = new FormData(refs.facilityForm);
  const facilityType = sanitizeText(form.get("facilityType"), 12);
  const facilityName = sanitizeText(form.get("facilityName"), 60);
  const region = sanitizeText(form.get("region"), 12);
  const roadAddress = sanitizeText(form.get("roadAddress"), 120);
  const verified = mapRuntime.verifiedAddress;

  if (!["유치원", "어린이집"].includes(facilityType) || facilityName.length < 2 || !REGION_OPTIONS.includes(region)) {
    showToast("기관 유형, 기관명, 지역을 확인해 주세요.");
    return;
  }
  if (!isSafeStructuredPublicName(facilityName)) {
    showToast("기관명에는 욕설·19금 표현·연락처·개인 지목을 넣을 수 없습니다.");
    return;
  }
  if (!verified || normalizeAddress(verified.roadAddress) !== normalizeAddress(roadAddress)) {
    setFacilityAddressStatus("현재 입력한 도로명주소를 먼저 확인해 주세요.", "error");
    showToast("도로명주소 확인이 필요합니다.");
    return;
  }
  if (cloudRuntime.client && verified.mode !== "kakao") {
    showToast("클라우드 기관 등록은 카카오 주소 검증 후 가능합니다.");
    return;
  }

  const duplicate = state.facilities.some((item) => {
    return normalizeAddress(item.roadAddress) === normalizeAddress(roadAddress) && item.facilityName === facilityName;
  });
  if (duplicate) {
    showToast("같은 이름과 주소의 기관이 이미 등록되어 있습니다.");
    return;
  }

  const facility = {
    id: makeId(),
    facilityType,
    facilityName,
    region,
    roadAddress,
    latitude: roundCoordinate(verified.latitude),
    longitude: roundCoordinate(verified.longitude),
    status: "pending",
    createdAt: Date.now(),
  };

  if (!(await upsertRemoteFacility(facility))) return;
  state.facilities.unshift(facility);
  mapRuntime.activeFacilityId = facility.id;
  mapRuntime.verifiedAddress = null;
  refs.facilityForm.reset();
  refs.facilityForm.elements.region.value = state.profile.region || "";
  setFacilityAddressStatus("주소 확인이 필요합니다.", "");
  persistState();
  renderFacilities();
  showToast("기관 등록 요청이 접수되었습니다. 검수 대기로 표시됩니다.");
}

function useCurrentLocation() {
  if (!window.isSecureContext || !navigator.geolocation) {
    showToast("현재 위치는 HTTPS 또는 localhost에서 사용할 수 있습니다.");
    return;
  }
  refs.nearbyFacilitiesBtn.disabled = true;
  refs.locationPrivacyHint.textContent = "현재 위치 권한을 확인하고 있습니다. 좌표는 교사링크 계정·DB에 저장하지 않습니다.";
  navigator.geolocation.getCurrentPosition(
    (position) => {
      refs.nearbyFacilitiesBtn.disabled = false;
      setNearbyLocation(
        { latitude: position.coords.latitude, longitude: position.coords.longitude },
        `내 위치 기준 · 정확도 약 ${Math.round(position.coords.accuracy)}m · 교사링크 계정·DB에는 저장하지 않습니다.`,
      );
    },
    (error) => {
      refs.nearbyFacilitiesBtn.disabled = false;
      const message = error.code === 1 ? "위치 권한이 거부되었습니다. 브라우저 설정에서 허용해 주세요." : "현재 위치를 확인하지 못했습니다.";
      refs.locationPrivacyHint.textContent = `${message} 서울 중심 보기는 권한 없이 사용할 수 있습니다.`;
      showToast(message);
    },
    { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 },
  );
}

function setNearbyLocation(location, message) {
  if (!isCoordinateInKorea(location.latitude, location.longitude)) {
    showToast("현재 대한민국 영역의 기관만 지원합니다.");
    return;
  }
  mapRuntime.userLocation = {
    latitude: Number(location.latitude),
    longitude: Number(location.longitude),
  };
  refs.locationPrivacyHint.textContent = message;
  renderFacilities();
}

function isLikelyRoadAddress(value) {
  return value.length >= 8 && /[가-힣]/.test(value) && /(?:로|길)\s*\d/.test(value);
}

function normalizeAddress(value) {
  return sanitizeText(value, 120).replace(/\s+/g, "").toLowerCase();
}

function isCoordinateInKorea(latitude, longitude) {
  return Number.isFinite(latitude) && Number.isFinite(longitude)
    && latitude >= KOREA_BOUNDS.south && latitude <= KOREA_BOUNDS.north
    && longitude >= KOREA_BOUNDS.west && longitude <= KOREA_BOUNDS.east;
}

function roundCoordinate(value) {
  return Math.round(Number(value) * 1e6) / 1e6;
}

function makeDemoCoordinate(region, address) {
  const center = REGION_CENTERS[region] || REGION_CENTERS.서울;
  let hash = 0;
  for (const char of address) hash = ((hash << 5) - hash + char.charCodeAt(0)) | 0;
  const latOffset = (((hash & 255) / 255) - 0.5) * 0.045;
  const lngOffset = ((((hash >>> 8) & 255) / 255) - 0.5) * 0.055;
  return [roundCoordinate(center[0] + latOffset), roundCoordinate(center[1] + lngOffset)];
}

async function onReviewSubmit(event) {
  event.preventDefault();
  if (!state.profile.role) {
    showToast("프로필 설정 후 작성 가능합니다.");
    refs.profileGate.hidden = false;
    return;
  }

  const form = new FormData(refs.reviewForm);
  const facilityType = sanitizeText(form.get("facilityType"), 12);
  const facilityName = sanitizeText(form.get("facilityName"), 40);
  const region = sanitizeText(form.get("region"), 12);
  const tagPolicy = runPolicyFilter(sanitizeText(form.get("tag"), 24));
  const tag = normalizeTag(tagPolicy.text);
  const overall = clampScore(form.get("overall"));
  const payScore = clampScore(form.get("payScore"));
  const workloadScore = clampScore(form.get("workloadScore"));
  const leadershipScore = clampScore(form.get("leadershipScore"));
  const growthScore = clampScore(form.get("growthScore"));
  const contentPolicy = runPolicyFilter(sanitizeText(form.get("content"), 500));
  const policyCounts = mergePolicyCounts(tagPolicy, contentPolicy);

  if (!isSafeStructuredPublicName(facilityName)) {
    showToast("시설명에는 욕설·19금 표현·연락처·개인 지목을 넣을 수 없습니다.");
    return;
  }

  const blockedPolicy = [tagPolicy, contentPolicy].find((policy) => policy.blocked);
  if (blockedPolicy) {
    refs.reviewPolicyHint.textContent = `등록 제한: ${blockedPolicy.reason}`;
    refs.reviewPolicyHint.className = "hint policy-hint blocked";
    showToast("정책 위반 표현이 감지되어 등록이 제한됐습니다.");
    return;
  }

  if (!facilityType || !facilityName || !region || !tag || !contentPolicy.text) {
    showToast("리뷰 필수 항목을 채워주세요.");
    return;
  }

  refs.reviewPolicyHint.textContent = formatPolicyResultMessage(policyCounts);
  refs.reviewPolicyHint.className = `hint policy-hint${formatPolicySummary(policyCounts) ? " masking" : ""}`;

  const review = {
    id: makeId(),
    facilityType,
    facilityName,
    region,
    scores: {
      overall,
      pay: payScore,
      workload: workloadScore,
      leadership: leadershipScore,
      growth: growthScore,
    },
    tag,
    content: contentPolicy.text,
    alias: state.profile.alias,
    orgType: state.profile.orgType,
    createdAt: Date.now(),
  };
  if (!(await upsertRemoteReview(review))) return;
  state.reviews.unshift(review);

  refs.reviewForm.reset();
  refs.reviewForm.querySelector('select[name="region"]').value = state.profile.region || "";
  resetPolicyHint(refs.reviewPolicyHint);
  persistState();
  renderAll();
  showPolicySubmitToast("리뷰가 익명 등록되었습니다.", policyCounts);
}

async function onJobSubmit(event) {
  event.preventDefault();

  if (!canPostJobs()) {
    showToast("채용 공고 등록은 카카오 로그인 후 인증된 원장만 가능합니다.");
    return;
  }

  const form = new FormData(refs.jobForm);
  const centerName = sanitizeText(form.get("centerName"), 40);
  const positionPolicy = runPolicyFilter(sanitizeText(form.get("position"), 40));
  const position = positionPolicy.text;
  const region = sanitizeText(form.get("region"), 12);
  const salary = sanitizeText(form.get("salary"), 30);
  const employmentType = sanitizeText(form.get("employmentType"), 12);
  const workHours = sanitizeText(form.get("workHours"), 24);
  const deadline = sanitizeText(form.get("deadline"), 12);
  const descriptionPolicy = runPolicyFilter(sanitizeText(form.get("description"), 500));
  const policyCounts = mergePolicyCounts(positionPolicy, descriptionPolicy);

  if (!isSafeStructuredPublicName(centerName)) {
    showToast("기관명에는 욕설·19금 표현·연락처·개인 지목을 넣을 수 없습니다.");
    return;
  }

  const blockedPolicy = [positionPolicy, descriptionPolicy].find((policy) => policy.blocked);
  if (blockedPolicy) {
    refs.jobPolicyHint.textContent = `등록 제한: ${blockedPolicy.reason}`;
    refs.jobPolicyHint.className = "hint policy-hint blocked";
    showToast("정책 위반 표현이 감지되어 등록이 제한됐습니다.");
    return;
  }

  if (!centerName || !position || !region || !salary || !employmentType || !workHours || !deadline || !descriptionPolicy.text) {
    showToast("공고 필수 항목을 채워주세요.");
    return;
  }

  const job = {
    id: makeId(),
    centerName,
    position,
    region,
    salary,
    employmentType,
    workHours,
    deadline,
    description: descriptionPolicy.text,
    alias: state.profile.alias,
    createdAt: Date.now(),
  };
  if (!(await upsertRemoteJob(job))) return;
  state.jobs.unshift(job);

  refs.jobForm.reset();
  refs.jobForm.querySelector('select[name="region"]').value = state.profile.region || "";
  resetPolicyHint(refs.jobPolicyHint);
  persistState();
  renderAll();
  showPolicySubmitToast("채용 공고가 등록되었습니다.", policyCounts);
}

async function onCommunitySubmit(event) {
  event.preventDefault();

  if (!state.profile.role) {
    showToast("프로필 설정 후 작성 가능합니다.");
    refs.profileGate.hidden = false;
    return;
  }

  const form = new FormData(refs.communityForm);
  const category = sanitizeText(form.get("category"), 12);
  const topicPolicy = runPolicyFilter(sanitizeText(form.get("topic"), 60));
  const topic = topicPolicy.text;
  const bodyPolicy = runPolicyFilter(sanitizeText(form.get("body"), 700));
  const policyCounts = mergePolicyCounts(topicPolicy, bodyPolicy);

  const blockedPolicy = [topicPolicy, bodyPolicy].find((policy) => policy.blocked);
  if (blockedPolicy) {
    refs.communityPolicyHint.textContent = `등록 제한: ${blockedPolicy.reason}`;
    refs.communityPolicyHint.className = "hint policy-hint blocked";
    showToast("정책 위반 표현이 감지되어 등록이 제한됐습니다.");
    return;
  }

  if (!CATEGORY_OPTIONS.includes(category) || !topic || !bodyPolicy.text) {
    showToast("커뮤니티 필수 항목을 확인해 주세요.");
    return;
  }

  const post = {
    id: makeId(),
    category,
    topic,
    body: bodyPolicy.text,
    alias: state.profile.alias,
    createdAt: Date.now(),
  };
  if (!(await upsertRemoteCommunity(post))) return;
  state.community.unshift(post);

  refs.communityForm.reset();
  resetPolicyHint(refs.communityPolicyHint);
  persistState();
  renderAll();
  showPolicySubmitToast("커뮤니티 글이 등록되었습니다.", policyCounts);
}

function onBodyActionClick(event) {
  const actionable = event.target.closest("[data-action]");
  if (!actionable) return;

  const action = actionable.dataset.action;
  const id = actionable.dataset.id;
  const kind = actionable.dataset.kind;

  if (action === "focusFacility") {
    focusFacility(id);
    return;
  }

  if (action === "helpful") {
    toggleHelpful(id);
    return;
  }

  if (action === "bookmarkJob") {
    toggleJobBookmark(id);
    return;
  }

  if (action === "report") {
    void reportItem(id, kind);
    return;
  }

  if (action === "restore") {
    void setReportStatus(id, "visible");
    return;
  }

  if (action === "hide") {
    void setReportStatus(id, "hidden");
  }
}

function toggleHelpful(id) {
  if (!id) return;
  const hasLiked = Boolean(state.myReactions[id]);
  if (hasLiked) {
    state.myReactions[id] = false;
    state.reactions[id] = Math.max(0, (state.reactions[id] || 1) - 1);
  } else {
    state.myReactions[id] = true;
    state.reactions[id] = (state.reactions[id] || 0) + 1;
  }
  persistState();
  renderAll();
}

function toggleJobBookmark(id) {
  if (!id) return;
  state.bookmarks.jobs[id] = !state.bookmarks.jobs[id];
  persistState();
  renderJobs();
  showToast(state.bookmarks.jobs[id] ? "공고를 스크랩했습니다." : "스크랩이 해제되었습니다.");
}

function reportItem(id, kind) {
  if (!id || !["review", "job", "community"].includes(kind)) return;
  reportRuntime.itemId = id;
  reportRuntime.kind = kind;
  refs.reportForm.reset();
  refs.reportGate.hidden = false;
  requestAnimationFrame(() => refs.reportForm.elements.reason.focus());
}

function closeReportModal() {
  refs.reportGate.hidden = true;
  refs.reportForm.reset();
  reportRuntime.itemId = "";
  reportRuntime.kind = "";
}

async function submitReport(event) {
  event.preventDefault();
  const id = reportRuntime.itemId;
  const kind = reportRuntime.kind;
  const reason = sanitizeText(new FormData(refs.reportForm).get("reason"), 40);
  if (!id || !["review", "job", "community"].includes(kind)) {
    closeReportModal();
    return;
  }
  if (!REPORT_REASON_OPTIONS.includes(reason)) {
    showToast("신고 사유를 선택해 주세요.");
    return;
  }

  const reportedAt = Date.now();
  if (cloudRuntime.client) {
    if (!cloudRuntime.user?.id) {
      showToast("신고하려면 먼저 로그인해 주세요.");
      return;
    }
    const accepted = await insertRemoteReportEvent({
      itemId: id,
      kind,
      reason,
      createdAt: reportedAt,
    });
    if (!accepted) return;
    closeReportModal();
    await pullRemoteSnapshot({ quiet: true, replaceEvenIfEmpty: true });
    const remoteEntry = state.reports[id];
    showToast(remoteEntry?.status === "hidden" ? "신고 접수 후 게시물이 숨김 처리되었습니다." : "신고가 접수되었습니다.");
    return;
  }

  const entry = ensureReportEntry(id, kind);
  entry.count += 1;
  entry.reasons[reason] = (entry.reasons[reason] || 0) + 1;
  entry.lastReportedAt = reportedAt;

  if (entry.count >= AUTO_HIDE_REPORT_COUNT) {
    entry.status = "hidden";
  }

  state.moderationLog.unshift({
    id: makeId(),
    itemId: id,
    action: "report",
    reason,
    at: Date.now(),
  });

  closeReportModal();
  persistState();
  renderAll();

  if (entry.status === "hidden") {
    showToast("신고 누적으로 자동 숨김 처리되었습니다.");
    return;
  }

  showToast(`신고 접수 완료 (${entry.count}/${AUTO_HIDE_REPORT_COUNT})`);
}

async function setReportStatus(itemId, status) {
  if (!itemId || !state.reports[itemId]) return;
  if (!canModerateReports()) {
    showToast("숨김/복원 처리는 운영자 권한에서만 가능합니다.");
    return;
  }

  const saved = await upsertRemoteModerationStatus(itemId, status);
  if (!saved) return;

  state.reports[itemId].status = status;
  state.moderationLog.unshift({
    id: makeId(),
    itemId,
    action: status === "hidden" ? "hide" : "restore",
    at: Date.now(),
  });

  persistState();
  renderAll();
  showToast(status === "hidden" ? "게시글을 숨김 유지했습니다." : "게시글을 복원했습니다.");
}

function applyTab(tabName) {
  const requested = refs.panels[tabName] ? tabName : "home";
  const next = requested === "moderation" && !canModerateReports() ? "home" : requested;
  const changed = state.ui.activeTab !== next;
  state.ui.activeTab = next;

  if (window.location.hash !== `#${next}`) {
    window.history.replaceState(null, "", `#${next}`);
  }

  refs.tabs.forEach((tab) => {
    const isActive = tab.dataset.tab === next;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });

  Object.entries(refs.panels).forEach(([key, panel]) => {
    panel.classList.toggle("active", key === next);
  });

  if (changed && !refs.appShell.hidden) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (next === "facilities") {
    window.setTimeout(() => {
      mapRuntime.map?.relayout?.();
      renderFacilityMap(mapRuntime.visibleFacilities);
    }, 0);
  }
}

function hasEnteredApp() {
  return Boolean(cloudRuntime.user || (getAppConfig().allowDemoMode && state.ui.demoMode));
}

function syncEntryGate() {
  const entered = hasEnteredApp();
  refs.authGate.hidden = entered;
  refs.appShell.hidden = !entered;
  document.body.classList.toggle("entry-open", !entered);
  refs.demoModeBtn.hidden = !getAppConfig().allowDemoMode;
  if (!entered) {
    refs.profileGate.hidden = true;
    setNotificationTray(false);
  }
}

function syncProfileGate() {
  const hasProfile = Boolean(state.profile.role);
  refs.profileGate.hidden = !hasEnteredApp() || hasProfile;
  fillProfileForm();
}

function fillProfileForm() {
  const { role, orgType, region, experience, alias } = state.profile;
  refs.profileForm.elements.role.value = role || "";
  refs.profileForm.elements.orgType.value = orgType || "";
  refs.profileForm.elements.region.value = region || "";
  refs.profileForm.elements.experience.value = experience || "신입";
  refs.profileForm.elements.alias.value = alias || "";
}

function syncRoleUi() {
  const effectiveRole = getEffectiveRole();
  const roleLabel =
    effectiveRole === "director"
      ? "원장"
      : effectiveRole === "operator"
      ? "운영자"
      : effectiveRole === "admin"
      ? "관리자"
      : "선생님";
  const verification = cloudRuntime.user
    ? cloudRuntime.access.verified
      ? "인증"
      : "미인증"
    : cloudRuntime.client
    ? "로그인 필요"
    : "로컬";
  const org = state.profile.orgType || "기관미설정";
  const region = state.profile.region || "지역미설정";
  refs.profileBadge.textContent = `${roleLabel} · ${org} · ${region} · ${verification}`;
  refs.homeAlias.textContent = state.profile.alias || roleLabel;
  refs.profileSummaryText.textContent = state.profile.role
    ? `${state.profile.alias || roleLabel} · ${roleLabel} · ${org} · ${region}`
    : "프로필을 설정해 주세요";

  const canPost = canPostJobs();
  refs.jobFormHint.textContent = canPost
    ? "인증된 원장 권한: 채용 공고 등록이 활성화되었습니다."
    : "채용 등록은 카카오 로그인 후 인증된 원장 계정만 가능합니다.";

  refs.jobForm.querySelectorAll("input, select, textarea, button").forEach((el) => {
    if (el.type === "button") return;
    if (el.tagName === "BUTTON") {
      el.disabled = !canPost;
      return;
    }
    el.disabled = !canPost;
  });

  const submitBtn = refs.jobForm.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.disabled = !canPost;

  const moderationTab = refs.tabs.find((tab) => tab.dataset.tab === "moderation");
  const canModerate = canModerateReports();
  if (moderationTab) {
    moderationTab.disabled = !canModerate;
    moderationTab.hidden = !canModerate;
    if (!canModerate && state.ui.activeTab === "moderation") {
      applyTab("home");
      persistState();
    }
  }
}

function getEffectiveRole() {
  if (cloudRuntime.client && cloudRuntime.user) {
    return cloudRuntime.access.role || "teacher";
  }
  return state.profile.role === "director" ? "director" : "teacher";
}

function canModerateReports() {
  if (!cloudRuntime.client || !cloudRuntime.user || !cloudRuntime.access.verified) return false;
  return ["operator", "admin"].includes(cloudRuntime.access.role);
}

function canPostJobs() {
  if (!cloudRuntime.client) return state.profile.role === "director";
  if (!cloudRuntime.user) return false;
  return !isAnonymousUser() && cloudRuntime.access.verified && ["director", "admin"].includes(cloudRuntime.access.role);
}

function isAnonymousUser() {
  return Boolean(cloudRuntime.user?.is_anonymous || cloudRuntime.user?.app_metadata?.provider === "anonymous");
}

function getCloudProviderLabel() {
  const provider = sanitizeText(cloudRuntime.user?.app_metadata?.provider || "", 20).toLowerCase();
  if (!provider) return "세션없음";
  if (provider === "anonymous") return "익명";
  if (provider === "kakao") return "카카오";
  return provider;
}

function setCloudStatusText(message) {
  [refs.cloudStatus, refs.authCloudStatus].forEach((element) => {
    if (element) element.textContent = message;
  });
}

function renderCloudStatus() {
  const config = getAppConfig();
  const hasUser = Boolean(cloudRuntime.user?.id);
  refs.cloudAuthBtn.disabled = !cloudRuntime.client || hasUser;
  refs.cloudKakaoBtn.disabled = !cloudRuntime.client || hasUser;
  refs.cloudSyncBtn.disabled = !hasUser || cloudRuntime.isSyncing;
  refs.cloudSignOutBtn.hidden = !hasUser;
  refs.cloudLinkKakaoBtn.hidden = !hasUser || !isAnonymousUser();
  refs.cloudLinkKakaoBtn.disabled = !hasUser;
  refs.exitDemoBtn.hidden = hasUser || !state.ui.demoMode;
  refs.demoModeBtn.hidden = !config.allowDemoMode;

  if (!cloudRuntime.client) {
    const message = config.supabaseUrl
      ? "클라우드 연결을 준비하고 있습니다. 잠시 후 다시 시도해 주세요."
      : "현재 로컬 데모 환경입니다. 실제 로그인은 config.js에 Supabase 공개 설정 후 사용할 수 있습니다.";
    setCloudStatusText(message);
    return;
  }

  if (cloudRuntime.isSyncing) {
    setCloudStatusText("클라우드에서 최신 데이터를 불러오고 있습니다.");
    return;
  }

  const userId = cloudRuntime.user?.id || state.cloud.userId;
  const provider = getCloudProviderLabel();
  const operator = canModerateReports() ? " · 운영권한" : "";
  const loginText = userId ? `로그인됨 ${shortId(userId)}` : "로그인 필요";
  const syncText = state.cloud.lastSyncAt ? ` · 마지막 동기화 ${formatDate(state.cloud.lastSyncAt)}` : "";
  setCloudStatusText(`클라우드 연결됨 · ${provider} · ${loginText}${operator}${syncText}`);
}

function getAppConfig() {
  const config = window.APP_CONFIG && typeof window.APP_CONFIG === "object" ? window.APP_CONFIG : {};
  return {
    supabaseUrl: sanitizeText(config.supabaseUrl, 200),
    supabasePublishableKey: sanitizeText(config.supabasePublishableKey, 400),
    kakaoMapJavaScriptKey: sanitizeText(config.kakaoMapJavaScriptKey, 100),
    turnstileSiteKey: sanitizeText(config.turnstileSiteKey, 120),
    allowDemoMode: config.allowDemoMode === true,
    allowedOAuthRedirectOrigins: Array.isArray(config.allowedOAuthRedirectOrigins)
      ? config.allowedOAuthRedirectOrigins.map((origin) => sanitizeText(origin, 200))
      : [],
  };
}

async function initializeFacilityMap() {
  const key = getAppConfig().kakaoMapJavaScriptKey;
  if (!key) {
    mapRuntime.sdkState = "demo";
    renderFacilities();
    return;
  }
  if (!/^[A-Za-z0-9_-]{16,100}$/.test(key)) {
    mapRuntime.sdkState = "error";
    refs.facilityMapHint.textContent = "카카오 지도 JavaScript 키 형식이 올바르지 않습니다.";
    renderFacilities();
    return;
  }

  mapRuntime.sdkState = "loading";
  renderFacilities();
  try {
    await loadKakaoMapSdk(key);
    mapRuntime.sdkState = "ready";
    mapRuntime.geocoder = new window.kakao.maps.services.Geocoder();
    mapRuntime.map = new window.kakao.maps.Map(refs.facilityMap, {
      center: new window.kakao.maps.LatLng(37.5665, 126.978),
      level: 8,
    });
    refs.facilityMap.classList.remove("demo-map");
    refs.facilityMap.classList.add("kakao-map");
    renderFacilities();
  } catch (_) {
    mapRuntime.sdkState = "error";
    mapRuntime.map = null;
    mapRuntime.geocoder = null;
    renderFacilities();
  }
}

function loadKakaoMapSdk(key) {
  if (window.kakao?.maps?.services) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.getElementById("kakao-map-script");
    const onLoaded = () => {
      if (!window.kakao?.maps?.load) {
        reject(new Error("Kakao Maps SDK unavailable"));
        return;
      }
      window.kakao.maps.load(() => resolve());
    };
    if (existing) {
      existing.addEventListener("load", onLoaded, { once: true });
      existing.addEventListener("error", reject, { once: true });
      return;
    }
    const script = document.createElement("script");
    script.id = "kakao-map-script";
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(key)}&autoload=false&libraries=services`;
    script.async = true;
    script.addEventListener("load", onLoaded, { once: true });
    script.addEventListener("error", () => reject(new Error("Kakao Maps SDK failed to load")), { once: true });
    document.head.appendChild(script);
  });
}

function renderFacilities() {
  const search = refs.facilitySearch.value.trim().toLowerCase();
  const type = refs.facilityTypeFilter.value;
  const radiusValue = refs.facilityRadiusFilter.value;
  const radius = radiusValue === "all" ? Infinity : Number(radiusValue);

  let items = state.facilities
    .filter((facility) => {
      if (type !== "all" && facility.facilityType !== type) return false;
      const haystack = `${facility.facilityName} ${facility.roadAddress} ${facility.region}`.toLowerCase();
      return !search || haystack.includes(search);
    })
    .map((facility) => ({
      ...facility,
      distanceKm: mapRuntime.userLocation
        ? distanceInKm(mapRuntime.userLocation.latitude, mapRuntime.userLocation.longitude, facility.latitude, facility.longitude)
        : null,
    }));

  if (mapRuntime.userLocation) {
    items = items.filter((facility) => facility.distanceKm <= radius).sort((a, b) => a.distanceKm - b.distanceKm);
  } else {
    items.sort((a, b) => b.createdAt - a.createdAt);
  }

  if (mapRuntime.activeFacilityId && !items.some((item) => item.id === mapRuntime.activeFacilityId)) {
    mapRuntime.activeFacilityId = "";
  }
  mapRuntime.visibleFacilities = items;
  refs.facilityCount.textContent = `${items.length}곳`;
  refs.facilityList.innerHTML = items.length
    ? items.map(facilityCard).join("")
    : emptyCard(mapRuntime.userLocation ? "선택한 반경 안에 등록된 기관이 없습니다." : "조건에 맞는 기관이 없습니다.");
  renderFacilityMap(items);
}

function facilityCard(facility) {
  const status = facility.status === "verified" ? "주소 확인됨" : facility.status === "sample" ? "샘플 데이터" : "검수 대기";
  const distance = Number.isFinite(facility.distanceKm) ? formatDistance(facility.distanceKm) : facility.region;
  const active = facility.id === mapRuntime.activeFacilityId ? " active" : "";
  return `<button class="facility-item${active}" type="button" data-action="focusFacility" data-id="${escapeHtml(facility.id)}">
      <span class="facility-item-head"><h4>${escapeHtml(facility.facilityName)}</h4><span class="pill">${escapeHtml(facility.facilityType)}</span></span>
      <span class="facility-address">${escapeHtml(facility.roadAddress)}</span>
      <span class="facility-item-foot"><span>${escapeHtml(status)}</span><span class="facility-distance">${escapeHtml(distance)}</span></span>
    </button>`;
}

function renderFacilityMap(items) {
  if (mapRuntime.sdkState === "ready" && mapRuntime.map && window.kakao?.maps) {
    renderKakaoFacilityMap(items);
    refs.facilityMapMode.textContent = "카카오 지도";
    refs.facilityMapHint.textContent = mapRuntime.userLocation
      ? "파란 점이 현재 기준 위치입니다. 위치 좌표는 교사링크 계정·DB에 저장하지 않습니다."
      : "핀을 누르면 기관 정보를 선택할 수 있습니다.";
    return;
  }

  renderDemoFacilityMap(items);
  const isLoading = mapRuntime.sdkState === "loading";
  const isError = mapRuntime.sdkState === "error";
  refs.facilityMapMode.textContent = isLoading ? "지도 연결 중" : isError ? "지도 연결 실패" : "로컬 데모 지도";
  refs.facilityMapHint.textContent = isLoading
    ? "카카오 지도를 불러오고 있습니다."
    : isError
      ? "카카오 지도 로드에 실패했습니다. 앱 도메인 등록과 JavaScript 키를 확인해 주세요."
      : "실제 도로지도가 아닌 기능 확인용 좌표 화면입니다. config.js에 카카오 JavaScript 키를 설정하면 실제 지도로 전환됩니다.";
}

function renderKakaoFacilityMap(items) {
  const kakaoMaps = window.kakao.maps;
  mapRuntime.markers.forEach((marker) => marker.setMap(null));
  mapRuntime.markers = [];
  if (mapRuntime.userMarker) mapRuntime.userMarker.setMap(null);

  const bounds = new kakaoMaps.LatLngBounds();
  items.forEach((facility) => {
    const position = new kakaoMaps.LatLng(facility.latitude, facility.longitude);
    const marker = new kakaoMaps.Marker({ map: mapRuntime.map, position, title: facility.facilityName });
    kakaoMaps.event.addListener(marker, "click", () => focusFacility(facility.id));
    mapRuntime.markers.push(marker);
    bounds.extend(position);
  });

  if (mapRuntime.userLocation) {
    const userPosition = new kakaoMaps.LatLng(mapRuntime.userLocation.latitude, mapRuntime.userLocation.longitude);
    mapRuntime.userMarker = new kakaoMaps.Marker({ map: mapRuntime.map, position: userPosition, title: "내 기준 위치" });
    bounds.extend(userPosition);
  }

  if (items.length || mapRuntime.userLocation) mapRuntime.map.setBounds(bounds, 42, 42, 42, 42);
}

function renderDemoFacilityMap(items) {
  refs.facilityMap.classList.add("demo-map");
  refs.facilityMap.classList.remove("kakao-map");
  const points = items.map((item) => ({ latitude: item.latitude, longitude: item.longitude }));
  if (mapRuntime.userLocation) points.push(mapRuntime.userLocation);
  const viewport = coordinateViewport(points);
  const pinHtml = items.map((facility) => {
    const position = coordinateToPercent(facility.latitude, facility.longitude, viewport);
    const typeClass = facility.facilityType === "어린이집" ? " daycare" : "";
    const active = facility.id === mapRuntime.activeFacilityId ? " active" : "";
    return `<button class="map-pin${typeClass}${active}" style="left:${position.x}%;top:${position.y}%" type="button" data-action="focusFacility" data-id="${escapeHtml(facility.id)}" aria-label="${escapeHtml(facility.facilityName)}"><span>${facility.facilityType === "유치원" ? "유" : "어"}</span></button>`;
  }).join("");
  const userHtml = mapRuntime.userLocation
    ? (() => {
        const position = coordinateToPercent(mapRuntime.userLocation.latitude, mapRuntime.userLocation.longitude, viewport);
        return `<span class="map-user-pin" style="left:${position.x}%;top:${position.y}%" title="내 기준 위치"></span>`;
      })()
    : "";
  refs.facilityMap.innerHTML = pinHtml + userHtml;
}

function coordinateViewport(points) {
  if (!points.length) return { south: 37.48, north: 37.65, west: 126.86, east: 127.1 };
  let south = Math.min(...points.map((point) => Number(point.latitude)));
  let north = Math.max(...points.map((point) => Number(point.latitude)));
  let west = Math.min(...points.map((point) => Number(point.longitude)));
  let east = Math.max(...points.map((point) => Number(point.longitude)));
  const latPad = Math.max(0.045, (north - south) * 0.18);
  const lngPad = Math.max(0.055, (east - west) * 0.18);
  south -= latPad; north += latPad; west -= lngPad; east += lngPad;
  return { south, north, west, east };
}

function coordinateToPercent(latitude, longitude, viewport) {
  const x = ((Number(longitude) - viewport.west) / (viewport.east - viewport.west)) * 100;
  const y = (1 - ((Number(latitude) - viewport.south) / (viewport.north - viewport.south))) * 100;
  return { x: Math.max(4, Math.min(96, x)), y: Math.max(8, Math.min(96, y)) };
}

function focusFacility(id) {
  const facility = state.facilities.find((item) => item.id === id);
  if (!facility) return;
  mapRuntime.activeFacilityId = id;
  renderFacilities();
  if (mapRuntime.map && window.kakao?.maps) {
    mapRuntime.map.panTo(new window.kakao.maps.LatLng(facility.latitude, facility.longitude));
  }
  refs.facilityList.querySelector(`[data-id="${window.CSS?.escape ? window.CSS.escape(id) : id}"]`)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
}

function previewVerifiedAddress(latitude, longitude) {
  if (mapRuntime.map && window.kakao?.maps) {
    mapRuntime.map.panTo(new window.kakao.maps.LatLng(latitude, longitude));
    mapRuntime.map.setLevel(4);
  }
}

function setFacilityAddressStatus(message, type) {
  refs.facilityAddressStatus.textContent = message;
  refs.facilityAddressStatus.className = `address-status${type ? ` ${type}` : ""}`;
}

function distanceInKm(lat1, lon1, lat2, lon2) {
  const toRadians = (value) => (Number(value) * Math.PI) / 180;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(kilometers) {
  if (kilometers < 1) return `${Math.max(10, Math.round(kilometers * 1000 / 10) * 10)}m`;
  return `${kilometers.toFixed(kilometers < 10 ? 1 : 0)}km`;
}

function isSafePublicApiKey(key) {
  if (!key || key.startsWith("sb_secret_")) return false;
  if (key.startsWith("sb_publishable_")) return true;
  const parts = key.split(".");
  if (parts.length !== 3) return false;
  try {
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload.role === "anon";
  } catch (_) {
    return false;
  }
}

function isSafeSupabaseUrl(value) {
  try {
    const url = new URL(value);
    const isLocalhost = ["localhost", "127.0.0.1"].includes(url.hostname);
    return (url.protocol === "https:" || (isLocalhost && url.protocol === "http:")) && !url.username && !url.password;
  } catch (_) {
    return false;
  }
}

async function connectCloudFromConfig() {
  const config = getAppConfig();
  if (!config.supabaseUrl || !config.supabasePublishableKey) {
    renderCloudStatus();
    return;
  }
  if (!isSafeSupabaseUrl(config.supabaseUrl) || !isSafePublicApiKey(config.supabasePublishableKey)) {
    setCloudStatusText("공개 설정이 유효하지 않습니다. Secret/Service Role 키는 사용할 수 없습니다.");
    syncEntryGate();
    return;
  }
  await connectCloud(config.supabaseUrl, config.supabasePublishableKey);
}

async function connectCloud(url, publishableKey) {
  if (!window.supabase || typeof window.supabase.createClient !== "function") {
    showToast("Supabase SDK 로드에 실패했습니다.");
    return;
  }

  try {
    const client = window.supabase.createClient(url, publishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.sessionStorage,
      },
    });

    cloudRuntime.client = client;
    attachCloudAuthListener();

    const sessionResult = await client.auth.getSession();
    if (sessionResult.error) {
      throw sessionResult.error;
    }
    await applyCloudSession(sessionResult.data.session || null);
    await pullRemoteSnapshot({ quiet: true, replaceEvenIfEmpty: false });
    renderAll();
  } catch (error) {
    cloudRuntime.client = null;
    cloudRuntime.user = null;
    renderCloudStatus();
    syncEntryGate();
    syncProfileGate();
    showToast(`연결 실패: ${sanitizeError(error)}`);
  }
}

async function signOutCloud() {
  if (!cloudRuntime.client) return;
  const result = await cloudRuntime.client.auth.signOut({ scope: "local" });
  if (result.error) {
    showToast(`로그아웃 실패: ${sanitizeError(result.error)}`);
    return;
  }
  state.ui.demoMode = false;
  await applyCloudSession(null);
  showToast("로그아웃되었습니다.");
}

function attachCloudAuthListener() {
  if (!cloudRuntime.client) return;
  if (cloudRuntime.authSubscription?.unsubscribe) {
    cloudRuntime.authSubscription.unsubscribe();
  }
  const authState = cloudRuntime.client.auth.onAuthStateChange((_event, session) => {
    void applyCloudSession(session || null);
  });
  cloudRuntime.authSubscription = authState.data.subscription;
}

async function applyCloudSession(session) {
  const wasSignedIn = Boolean(cloudRuntime.user);
  cloudRuntime.user = session?.user || null;
  cloudRuntime.access = { role: "teacher", verified: false };
  state.cloud.userId = cloudRuntime.user?.id || "";
  if (cloudRuntime.user) {
    state.ui.demoMode = false;
    if (!wasSignedIn) state.ui.activeTab = "home";
    await pullCurrentAccess();
    await pullRemoteProfile(cloudRuntime.user.id, { quiet: true });
  }
  persistState();
  syncEntryGate();
  syncProfileGate();
  syncRoleUi();
  renderAll();
}

async function pullCurrentAccess() {
  if (!cloudRuntime.client || !cloudRuntime.user?.id) return;
  const result = await cloudRuntime.client
    .from("user_roles")
    .select("role,verified")
    .eq("user_id", cloudRuntime.user.id)
    .maybeSingle();
  if (result.error) {
    showToast(`권한 확인 실패: ${sanitizeError(result.error)}`);
    return;
  }
  if (result.data) {
    cloudRuntime.access = {
      role: ["teacher", "director", "operator", "admin"].includes(result.data.role) ? result.data.role : "teacher",
      verified: Boolean(result.data.verified),
    };
  }
}

async function signInCloudAnonymously() {
  if (!cloudRuntime.client) {
    showToast("먼저 Supabase 연결을 완료해 주세요.");
    return;
  }
  try {
    const config = getAppConfig();
    if (config.turnstileSiteKey && !cloudRuntime.captchaToken) {
      showToast("봇 방지 확인을 먼저 완료해 주세요.");
      return;
    }
    const result = await cloudRuntime.client.auth.signInAnonymously({
      options: cloudRuntime.captchaToken ? { captchaToken: cloudRuntime.captchaToken } : undefined,
    });
    if (result.error) throw result.error;
    await applyCloudSession(result.data.session || null);
    await upsertRemoteProfile();
    await pullRemoteSnapshot({ quiet: true, replaceEvenIfEmpty: false });
    resetCaptcha();
    renderAll();
    showToast("익명 로그인이 완료되었습니다.");
  } catch (error) {
    showToast(`로그인 실패: ${sanitizeError(error)}`);
  }
}

async function signInCloudWithKakao() {
  if (!cloudRuntime.client) {
    showToast("먼저 Supabase 연결을 완료해 주세요.");
    return;
  }

  try {
    const config = getAppConfig();
    if (config.allowedOAuthRedirectOrigins.length && !config.allowedOAuthRedirectOrigins.includes(window.location.origin)) {
      showToast("현재 주소는 허용된 OAuth 리디렉션 출처가 아닙니다.");
      return;
    }
    const redirectTo = `${window.location.origin}${window.location.pathname}`;
    const oauthOptions = { provider: "kakao", options: { redirectTo } };
    const result = isAnonymousUser()
      ? await cloudRuntime.client.auth.linkIdentity(oauthOptions)
      : await cloudRuntime.client.auth.signInWithOAuth(oauthOptions);
    if (result.error) throw result.error;
  } catch (error) {
    showToast(`카카오 로그인 시작 실패: ${sanitizeError(error)}`);
  }
}

async function setupCaptcha() {
  const siteKey = getAppConfig().turnstileSiteKey;
  if (!siteKey || !refs.captchaContainer) return;
  try {
    await loadTurnstileScript();
    cloudRuntime.captchaWidgetId = window.turnstile.render(refs.captchaContainer, {
      sitekey: siteKey,
      callback: (token) => {
        cloudRuntime.captchaToken = token;
      },
      "expired-callback": () => {
        cloudRuntime.captchaToken = "";
      },
      "error-callback": () => {
        cloudRuntime.captchaToken = "";
      },
    });
  } catch (error) {
    showToast(`봇 방지 모듈 로드 실패: ${sanitizeError(error)}`);
  }
}

function loadTurnstileScript() {
  if (window.turnstile) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.getElementById("turnstile-script");
    if (existing) {
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener("error", () => reject(new Error("Turnstile script failed")), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.id = "turnstile-script";
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.addEventListener("load", resolve, { once: true });
    script.addEventListener("error", () => reject(new Error("Turnstile script failed")), { once: true });
    document.head.appendChild(script);
  });
}

function resetCaptcha() {
  cloudRuntime.captchaToken = "";
  if (window.turnstile && cloudRuntime.captchaWidgetId !== null) {
    window.turnstile.reset(cloudRuntime.captchaWidgetId);
  }
}

async function syncCloudNow() {
  if (!cloudRuntime.client) {
    showToast("클라우드가 연결되어 있지 않습니다.");
    return;
  }
  if (cloudRuntime.isSyncing) {
    showToast("이미 동기화 중입니다.");
    return;
  }
  cloudRuntime.isSyncing = true;
  renderCloudStatus();
  try {
    await pullRemoteSnapshot({ quiet: true, replaceEvenIfEmpty: true });
    state.cloud.lastSyncAt = Date.now();
    persistState();
    renderAll();
    showToast("최신 데이터를 불러왔습니다.");
  } catch (error) {
    showToast(`동기화 실패: ${sanitizeError(error)}`);
  } finally {
    cloudRuntime.isSyncing = false;
    renderCloudStatus();
  }
}

async function pullRemoteSnapshot({ quiet = false, replaceEvenIfEmpty = false } = {}) {
  const client = cloudRuntime.client;
  if (!client) return;
  const hadPreviousCloudSnapshot = Boolean(state.cloud.lastSyncAt);
  const knownJobIds = new Set(state.jobs.map((item) => item.id));
  const knownCommunityIds = new Set(state.community.map((item) => item.id));

  const operatorQueueRequest = canModerateReports()
    ? client.rpc("get_operator_report_queue")
    : Promise.resolve({ data: [], error: null });
  const [reviewsRes, jobsRes, communityRes, facilitiesRes, statusRes, operatorQueueRes] = await Promise.all([
    client
      .from(CLOUD_SYNC_TABLES.reviews)
      .select("id,facility_type,facility_name,region,overall_score,pay_score,workload_score,leadership_score,growth_score,tag,content,alias,org_type,created_at")
      .order("created_at", { ascending: false }),
    client
      .from(CLOUD_SYNC_TABLES.jobs)
      .select("id,center_name,position,region,salary,employment_type,work_hours,deadline,description,alias,created_at")
      .order("created_at", { ascending: false }),
    client
      .from(CLOUD_SYNC_TABLES.community)
      .select("id,category,topic,body,alias,created_at")
      .order("created_at", { ascending: false }),
    client
      .from(CLOUD_SYNC_TABLES.facilities)
      .select("id,facility_type,facility_name,region,road_address,latitude,longitude,status,created_at")
      .order("created_at", { ascending: false }),
    client.rpc("get_report_statuses"),
    operatorQueueRequest,
  ]);

  const firstError = [reviewsRes.error, jobsRes.error, communityRes.error, facilitiesRes.error, statusRes.error, operatorQueueRes.error].find(Boolean);
  if (firstError) {
    if (!quiet) showToast(`클라우드 읽기 실패: ${sanitizeError(firstError)}`);
    return;
  }

  const remoteReviews = (reviewsRes.data || []).map(rowToReview);
  const remoteJobs = (jobsRes.data || []).map(rowToJob);
  const remoteCommunity = (communityRes.data || []).map(rowToCommunity);
  const remoteFacilities = (facilitiesRes.data || []).map(rowToFacility);
  const aggregatedReports = {};
  const statusRows = statusRes.data || [];
  statusRows.forEach((row) => {
    const itemId = row.item_id;
    if (!itemId) return;
    aggregatedReports[itemId] = {
      kind: row.kind || "unknown",
      count: Number(row.report_count || 0),
      reasons: {},
      status: row.status === "hidden" ? "hidden" : "visible",
      lastReportedAt: fromIso(row.last_reported_at),
    };
  });

  (operatorQueueRes.data || []).forEach((row) => {
    const itemId = row.item_id;
    if (!itemId) return;
    if (!aggregatedReports[itemId]) {
      aggregatedReports[itemId] = {
        kind: row.kind || "unknown",
        count: Number(row.report_count || 0),
        reasons: row.reasons && typeof row.reasons === "object" ? row.reasons : {},
        status: row.status === "hidden" ? "hidden" : "visible",
        lastReportedAt: fromIso(row.last_reported_at),
      };
      return;
    }
    aggregatedReports[itemId].count = Number(row.report_count || aggregatedReports[itemId].count);
    aggregatedReports[itemId].reasons = row.reasons && typeof row.reasons === "object" ? row.reasons : {};
    aggregatedReports[itemId].status = row.status === "hidden" ? "hidden" : "visible";
    aggregatedReports[itemId].kind = row.kind || aggregatedReports[itemId].kind;
    aggregatedReports[itemId].lastReportedAt = fromIso(row.last_reported_at);
  });

  const remoteCount =
    remoteReviews.length + remoteJobs.length + remoteCommunity.length + remoteFacilities.length + statusRows.length + (operatorQueueRes.data || []).length;
  if (!replaceEvenIfEmpty && remoteCount === 0) {
    return;
  }

  state.reviews = remoteReviews;
  state.jobs = remoteJobs;
  state.community = remoteCommunity;
  state.facilities = remoteFacilities;
  state.reports = aggregatedReports;
  state.cloud.lastSyncAt = Date.now();

  if (hadPreviousCloudSnapshot) {
    const newJobs = remoteJobs.filter((item) => !knownJobIds.has(item.id));
    const newCommunity = remoteCommunity.filter((item) => !knownCommunityIds.has(item.id));
    if (newJobs.length) {
      pushAppNotification(
        {
          type: "job",
          title: `새 채용 공고 ${newJobs.length}건`,
          body: `${newJobs[0].centerName} · ${newJobs[0].position}${newJobs.length > 1 ? " 외" : ""}`,
          target: "jobs",
        },
        { deliver: true, persist: false, render: false },
      );
    }
    if (newCommunity.length) {
      pushAppNotification(
        {
          type: "community",
          title: `새 커뮤니티 글 ${newCommunity.length}건`,
          body: newCommunity[0].topic,
          target: "community",
        },
        { deliver: true, persist: false, render: false },
      );
    }
  }
  persistState();

  if (cloudRuntime.user?.id) {
    await pullRemoteProfile(cloudRuntime.user.id, { quiet: true });
  }

  renderAll();
}

async function pullRemoteProfile(userId, { quiet = false } = {}) {
  const client = cloudRuntime.client;
  if (!client || !userId) return;
  const result = await client
    .from(CLOUD_SYNC_TABLES.profile)
    .select("user_id,requested_role,org_type,region,experience,alias,created_at,updated_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (result.error) {
    if (!quiet) showToast(`프로필 로드 실패: ${sanitizeError(result.error)}`);
    return;
  }

  if (!result.data) return;
  state.profile = {
    role: ["teacher", "director"].includes(result.data.requested_role) ? result.data.requested_role : state.profile.role,
    orgType: result.data.org_type || state.profile.orgType,
    region: result.data.region || state.profile.region,
    experience: result.data.experience || state.profile.experience,
    alias: result.data.alias || state.profile.alias,
    verified: cloudRuntime.access.verified,
  };
  persistState();
  syncRoleUi();
}

async function upsertRemoteProfile() {
  const client = cloudRuntime.client;
  if (!client || !cloudRuntime.user?.id) return !client;

  const payload = {
    user_id: cloudRuntime.user.id,
    requested_role: ["teacher", "director"].includes(state.profile.role) ? state.profile.role : "teacher",
    org_type: state.profile.orgType || null,
    region: state.profile.region || null,
    experience: state.profile.experience || null,
    alias: state.profile.alias || null,
  };

  const result = await client.from(CLOUD_SYNC_TABLES.profile).upsert(payload, { onConflict: "user_id" });
  if (result.error) {
    showToast(`프로필 클라우드 저장 실패: ${sanitizeError(result.error)}`);
    return false;
  }
  return true;
}

async function upsertRemoteReview(review) {
  const client = cloudRuntime.client;
  if (!client) return true;
  if (!cloudRuntime.user?.id) {
    showToast("리뷰를 등록하려면 먼저 로그인해 주세요.");
    return false;
  }
  const result = await client.from(CLOUD_SYNC_TABLES.reviews).insert(reviewToRow(review));
  if (!result.error) {
    state.cloud.lastSyncAt = Date.now();
    persistState();
    renderCloudStatus();
    return true;
  }
  showToast(`리뷰 클라우드 저장 실패: ${sanitizeError(result.error)}`);
  return false;
}

async function upsertRemoteJob(job) {
  const client = cloudRuntime.client;
  if (!client) return true;
  if (!cloudRuntime.user?.id) {
    showToast("채용 공고를 등록하려면 먼저 로그인해 주세요.");
    return false;
  }
  const result = await client.from(CLOUD_SYNC_TABLES.jobs).insert(jobToRow(job));
  if (!result.error) {
    state.cloud.lastSyncAt = Date.now();
    persistState();
    renderCloudStatus();
    return true;
  }
  showToast(`채용 클라우드 저장 실패: ${sanitizeError(result.error)}`);
  return false;
}

async function upsertRemoteCommunity(post) {
  const client = cloudRuntime.client;
  if (!client) return true;
  if (!cloudRuntime.user?.id) {
    showToast("글을 등록하려면 먼저 로그인해 주세요.");
    return false;
  }
  const result = await client.from(CLOUD_SYNC_TABLES.community).insert(communityToRow(post));
  if (!result.error) {
    state.cloud.lastSyncAt = Date.now();
    persistState();
    renderCloudStatus();
    return true;
  }
  showToast(`커뮤니티 클라우드 저장 실패: ${sanitizeError(result.error)}`);
  return false;
}

async function upsertRemoteFacility(facility) {
  const client = cloudRuntime.client;
  if (!client) return true;
  if (!cloudRuntime.user?.id) {
    showToast("기관을 등록하려면 먼저 로그인해 주세요.");
    return false;
  }
  const result = await client.from(CLOUD_SYNC_TABLES.facilities).insert(facilityToRow(facility));
  if (!result.error) {
    state.cloud.lastSyncAt = Date.now();
    persistState();
    renderCloudStatus();
    return true;
  }
  if (result.error.code === "23505") {
    showToast("같은 이름과 주소의 기관이 이미 등록되어 있습니다.");
    return false;
  }
  showToast(`기관 클라우드 저장 실패: ${sanitizeError(result.error)}`);
  return false;
}

async function insertRemoteReportEvent(payload) {
  const client = cloudRuntime.client;
  if (!client || !cloudRuntime.user?.id || !payload?.itemId) return false;
  const result = await client.from("report_events").insert({
    item_id: payload.itemId,
    kind: payload.kind || "unknown",
    reason: payload.reason || "기타 정책 위반",
    reporter_id: cloudRuntime.user.id,
  });
  if (result.error) {
    if (result.error.code === "23505") {
      showToast("이미 신고한 게시물입니다.");
      return false;
    }
    showToast(`신고 이벤트 저장 실패: ${sanitizeError(result.error)}`);
    return false;
  }
  state.cloud.lastSyncAt = Date.now();
  persistState();
  renderCloudStatus();
  return true;
}

async function upsertRemoteModerationStatus(itemId, status) {
  const client = cloudRuntime.client;
  if (!client || !cloudRuntime.user?.id || !itemId || !canModerateReports()) return false;

  const current = state.reports[itemId];
  const row = moderationStatusToRow(itemId, status, current?.kind || "unknown");
  const result = await client.from("item_reports").upsert(row, { onConflict: "item_id" });
  if (result.error) {
    showToast(`신고 상태 저장 실패: ${sanitizeError(result.error)}`);
    return false;
  }
  state.cloud.lastSyncAt = Date.now();
  persistState();
  renderCloudStatus();
  return true;
}

function moderationStatusToRow(itemId, status, kind = "unknown") {
  return {
    item_id: itemId,
    kind,
    status: status === "hidden" ? "hidden" : "visible",
  };
}

function reviewToRow(review) {
  return {
    id: review.id,
    user_id: cloudRuntime.user?.id,
    facility_type: review.facilityType,
    facility_name: review.facilityName,
    region: review.region,
    overall_score: Number(review.scores?.overall || 0),
    pay_score: Number(review.scores?.pay || 0),
    workload_score: Number(review.scores?.workload || 0),
    leadership_score: Number(review.scores?.leadership || 0),
    growth_score: Number(review.scores?.growth || 0),
    tag: review.tag,
    content: review.content,
    alias: review.alias || null,
    org_type: review.orgType || null,
  };
}

function jobToRow(job) {
  return {
    id: job.id,
    user_id: cloudRuntime.user?.id,
    center_name: job.centerName,
    position: job.position,
    region: job.region,
    salary: job.salary,
    employment_type: job.employmentType,
    work_hours: job.workHours,
    deadline: job.deadline || null,
    description: job.description,
    alias: job.alias || null,
  };
}

function communityToRow(post) {
  return {
    id: post.id,
    user_id: cloudRuntime.user?.id,
    category: post.category,
    topic: post.topic,
    body: post.body,
    alias: post.alias || null,
  };
}

function facilityToRow(facility) {
  return {
    id: facility.id,
    user_id: cloudRuntime.user?.id,
    facility_type: facility.facilityType,
    facility_name: facility.facilityName,
    region: facility.region,
    road_address: facility.roadAddress,
    latitude: Number(facility.latitude),
    longitude: Number(facility.longitude),
  };
}

function rowToReview(row) {
  return {
    id: row.id,
    facilityType: row.facility_type || "유치원",
    facilityName: row.facility_name || "이름 미상",
    region: row.region || "서울",
    scores: {
      overall: clampScore(row.overall_score || 0),
      pay: clampScore(row.pay_score || 0),
      workload: clampScore(row.workload_score || 0),
      leadership: clampScore(row.leadership_score || 0),
      growth: clampScore(row.growth_score || 0),
    },
    tag: normalizeTag(row.tag || "#근무후기"),
    content: row.content || "",
    alias: row.alias || "익명",
    orgType: row.org_type || "",
    createdAt: fromIso(row.created_at),
  };
}

function rowToJob(row) {
  return {
    id: row.id,
    centerName: row.center_name || "기관명 미상",
    position: row.position || "교사",
    region: row.region || "서울",
    salary: row.salary || "협의",
    employmentType: row.employment_type || "정규직",
    workHours: row.work_hours || "09:00-18:00",
    deadline: row.deadline || "",
    description: row.description || "",
    alias: row.alias || "익명",
    createdAt: fromIso(row.created_at),
  };
}

function rowToCommunity(row) {
  return {
    id: row.id,
    category: CATEGORY_OPTIONS.includes(row.category) ? row.category : "고충토로",
    topic: row.topic || "제목 없음",
    body: row.body || "",
    alias: row.alias || "익명",
    createdAt: fromIso(row.created_at),
  };
}

function rowToFacility(row) {
  return {
    id: row.id,
    facilityType: row.facility_type === "어린이집" ? "어린이집" : "유치원",
    facilityName: sanitizeText(row.facility_name || "이름 미상", 60),
    region: REGION_OPTIONS.includes(row.region) ? row.region : "서울",
    roadAddress: sanitizeText(row.road_address || "주소 미상", 120),
    latitude: roundCoordinate(row.latitude),
    longitude: roundCoordinate(row.longitude),
    status: row.status === "verified" ? "verified" : "pending",
    createdAt: fromIso(row.created_at),
  };
}

function sanitizeError(error) {
  return sanitizeText(error?.message || "알 수 없는 오류", 120);
}

function shortId(value) {
  if (!value) return "";
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function toIso(timestamp) {
  const date = new Date(Number(timestamp) || Date.now());
  return date.toISOString();
}

function fromIso(value) {
  const date = new Date(value || Date.now());
  return Number.isNaN(date.getTime()) ? Date.now() : date.getTime();
}

function renderAll() {
  renderFacilities();
  renderReviews();
  renderJobs();
  renderCommunity();
  renderNotifications();
  renderModeration();
  renderInsights();
  renderStats();
  renderCloudStatus();
}

function renderNotifications() {
  const items = state.notifications.slice(0, 30);
  const unread = items.filter((item) => !item.read).length;
  refs.notificationBadge.textContent = unread > 99 ? "99+" : String(unread);
  refs.notificationBadge.hidden = unread === 0;
  refs.notificationBtn.setAttribute("aria-label", unread ? `알림센터 열기, 읽지 않은 알림 ${unread}개` : "알림센터 열기");
  refs.markNotificationsReadBtn.disabled = unread === 0;

  refs.notificationList.innerHTML = items.length
    ? items
        .map(
          (item) => `<button class="notification-item${item.read ? "" : " unread"}" type="button" data-notification-id="${escapeHtml(item.id)}">
            <span class="notification-kind" aria-hidden="true">${escapeHtml(notificationKindIcon(item.type))}</span>
            <span class="notification-copy">
              <strong>${escapeHtml(item.title)}</strong>
              <span>${escapeHtml(item.body)}</span>
              <small>${escapeHtml(formatDate(item.createdAt))}</small>
            </span>
          </button>`,
        )
        .join("")
    : '<p class="notification-empty">새 알림이 없습니다.</p>';

  const supported = "Notification" in window && window.isSecureContext;
  const permission = supported ? Notification.permission : "unsupported";
  const browserEnabled = permission === "granted" && state.preferences.browserNotifications;
  const permissionLabel =
    permission === "denied"
      ? "브라우저 설정에서 허용"
      : browserEnabled
      ? "브라우저 알림 끄기"
      : "브라우저 알림 켜기";
  refs.notificationPermissionBtn.textContent = permissionLabel;
  refs.profileNotificationBtn.textContent = permissionLabel;
  refs.notificationPermissionBtn.disabled = !supported || permission === "denied";
  refs.profileNotificationBtn.disabled = !supported || permission === "denied";

  const soundLabel = state.preferences.sound ? "소리 켜짐" : "소리 꺼짐";
  refs.notificationSoundBtn.textContent = soundLabel;
  refs.profileSoundBtn.textContent = soundLabel;
  refs.notificationSoundBtn.setAttribute("aria-pressed", String(state.preferences.sound));
  refs.profileSoundBtn.setAttribute("aria-pressed", String(state.preferences.sound));
  refs.notificationPrivacyHint.textContent =
    permission === "denied"
      ? "알림이 차단되어 있습니다. 브라우저의 사이트 설정에서 직접 허용해 주세요."
      : "잠금화면에는 상세 내용 대신 일반 문구만 표시됩니다.";
}

function notificationKindIcon(type) {
  if (type === "job") return "채";
  if (type === "community") return "톡";
  if (type === "facility") return "지";
  return "교";
}

function seedNotifications() {
  const now = Date.now();
  state.notifications = [
    createNotificationItem({
      type: "job",
      title: "새 채용 공고를 확인해 보세요",
      body: "지역과 근무 조건에 맞는 공고를 채용 페이지에서 비교할 수 있어요.",
      target: "jobs",
      createdAt: now - 12 * 60 * 1000,
    }),
    createNotificationItem({
      type: "community",
      title: "동료 교사들의 새 이야기",
      body: "수업, 노무, 이직 고민을 익명으로 나눠보세요.",
      target: "community",
      createdAt: now - 48 * 60 * 1000,
    }),
    createNotificationItem({
      type: "system",
      title: "상세 내용은 앱 안에서만",
      body: "잠금화면 알림에는 기관명이나 게시글 내용을 표시하지 않습니다.",
      target: "profile",
      createdAt: now - 2 * 60 * 60 * 1000,
    }),
  ];
  persistState();
}

function createNotificationItem({ type = "system", title, body, target = "home", createdAt = Date.now() }) {
  return {
    id: makeId(),
    type: ["job", "community", "facility", "system"].includes(type) ? type : "system",
    title: sanitizeText(title, 60) || "새 알림",
    body: sanitizeText(body, 140) || "새 소식이 도착했습니다.",
    target: NOTIFICATION_TARGETS.has(target) ? target : "home",
    createdAt: Number(createdAt) || Date.now(),
    read: false,
  };
}

function pushAppNotification(payload, { deliver = false, persist = true, render = true } = {}) {
  const item = createNotificationItem(payload);
  state.notifications.unshift(item);
  state.notifications = state.notifications.slice(0, 50);
  if (persist) persistState();
  if (render) renderNotifications();
  if (deliver) void deliverSystemNotification(item);
  return item;
}

function setNotificationTray(open) {
  const next = Boolean(open && hasEnteredApp());
  refs.notificationTray.hidden = !next;
  refs.notificationBtn.setAttribute("aria-expanded", String(next));
}

function markAllNotificationsRead() {
  state.notifications.forEach((item) => {
    item.read = true;
  });
  persistState();
  renderNotifications();
}

function onNotificationItemClick(event) {
  const button = event.target.closest("[data-notification-id]");
  if (!button) return;
  const item = state.notifications.find((entry) => entry.id === button.dataset.notificationId);
  if (!item) return;
  item.read = true;
  openNotificationTarget(item.target);
  persistState();
  renderNotifications();
}

function openNotificationTarget(target) {
  const safeTarget = NOTIFICATION_TARGETS.has(target) ? target : "home";
  setNotificationTray(false);
  applyTab(safeTarget);
  persistState();
}

async function toggleBrowserNotifications() {
  if (!("Notification" in window) || !window.isSecureContext) {
    showToast("브라우저 알림은 HTTPS 또는 localhost에서 사용할 수 있습니다.");
    return;
  }

  if (Notification.permission === "denied") {
    showToast("브라우저 사이트 설정에서 알림 권한을 허용해 주세요.");
    renderNotifications();
    return;
  }

  if (Notification.permission === "granted") {
    state.preferences.browserNotifications = !state.preferences.browserNotifications;
    persistState();
    renderNotifications();
    showToast(state.preferences.browserNotifications ? "브라우저 알림을 켰습니다." : "브라우저 알림을 껐습니다.");
    return;
  }

  const permission = await Notification.requestPermission();
  state.preferences.browserNotifications = permission === "granted";
  persistState();
  renderNotifications();
  if (permission !== "granted") {
    showToast("알림 권한이 허용되지 않았습니다.");
    return;
  }
  pushAppNotification(
    {
      type: "system",
      title: "브라우저 알림이 켜졌어요",
      body: "새 채용과 커뮤니티 소식을 안전한 일반 문구로 알려드릴게요.",
      target: "profile",
    },
    { deliver: true },
  );
}

function toggleNotificationSound() {
  state.preferences.sound = !state.preferences.sound;
  persistState();
  renderNotifications();
  if (state.preferences.sound) playNotificationSound();
  showToast(state.preferences.sound ? "알림 소리를 켰습니다." : "알림 소리를 껐습니다.");
}

function sendTestNotification() {
  pushAppNotification(
    {
      type: "system",
      title: "테스트 알림",
      body: "알림센터와 소리 설정이 정상적으로 동작합니다.",
      target: "home",
    },
    { deliver: true },
  );
  showToast("테스트 알림을 보냈습니다.");
}

async function deliverSystemNotification(item) {
  if (state.preferences.sound && document.visibilityState === "visible") playNotificationSound();
  if (!state.preferences.browserNotifications || !("Notification" in window) || Notification.permission !== "granted") return;

  const options = {
    body: "앱을 열어 새 소식을 확인해 주세요.",
    icon: "./favicon.svg",
    badge: "./favicon.svg",
    tag: `teacher-link-${item.type}`,
    data: { target: NOTIFICATION_TARGETS.has(item.target) ? item.target : "home" },
    silent: !state.preferences.sound || document.visibilityState === "visible",
  };

  try {
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification("교사링크 새 알림", options);
      return;
    }
    new Notification("교사링크 새 알림", options);
  } catch (_) {
    showToast("기기 알림을 표시하지 못했습니다. 앱 알림센터에서 확인해 주세요.");
  }
}

function playNotificationSound() {
  if (!state.preferences.sound) return;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  try {
    notificationAudioContext ||= new AudioContextClass();
    const context = notificationAudioContext;
    if (context.state === "suspended") void context.resume();
    const start = context.currentTime + 0.01;
    [0, 0.11].forEach((offset, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = index === 0 ? 660 : 880;
      gain.gain.setValueAtTime(0.0001, start + offset);
      gain.gain.exponentialRampToValueAtTime(0.08, start + offset + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + offset + 0.14);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(start + offset);
      oscillator.stop(start + offset + 0.15);
    });
  } catch (_) {
    // Audio can be unavailable until the browser accepts a user gesture.
  }
}

function renderReviews() {
  const search = refs.reviewSearch.value.trim().toLowerCase();
  const facilityType = refs.reviewFacilityType.value;
  const region = refs.reviewRegion.value;
  const minRating = Number(refs.reviewMinRating.value || 0);

  const items = state.reviews
    .filter((review) => {
      if (isItemHidden(review.id)) return false;
      if (search && !review.facilityName.toLowerCase().includes(search)) return false;
      if (facilityType !== "all" && review.facilityType !== facilityType) return false;
      if (region !== "all" && review.region !== region) return false;
      if ((review.scores?.overall || 0) < minRating) return false;
      return true;
    })
    .sort((a, b) => b.createdAt - a.createdAt);

  refs.reviewCount.textContent = `${items.length}건`;
  refs.reviewList.innerHTML = items.length
    ? items.map((review) => reviewCard(review)).join("")
    : emptyCard("조건에 맞는 리뷰가 없습니다.");
}

function reviewCard(review) {
  const helpful = state.reactions[review.id] || 0;
  const scores = review.scores || {};

  return `<article class="item">
      <h4>${escapeHtml(review.facilityName)} (${escapeHtml(review.facilityType)})</h4>
      <p class="meta">${escapeHtml(review.region)} · ${formatDate(review.createdAt)} · ${escapeHtml(review.alias || "익명")}</p>
      <div class="score-line">
        <span class="pill">총평 ${formatScore(scores.overall)}</span>
        <span class="pill">급여 ${formatScore(scores.pay)}</span>
        <span class="pill">업무 ${formatScore(scores.workload)}</span>
        <span class="pill">리더십 ${formatScore(scores.leadership)}</span>
        <span class="pill">성장 ${formatScore(scores.growth)}</span>
        <span class="pill">${escapeHtml(normalizeTag(review.tag))}</span>
      </div>
      <p>${escapeHtml(review.content)}</p>
      <div class="item-actions">
        <button class="btn tiny ghost" data-action="helpful" data-kind="review" data-id="${review.id}">도움돼요 ${helpful}</button>
        <button class="link-btn" data-action="report" data-kind="review" data-id="${review.id}">신고</button>
      </div>
    </article>`;
}

function renderJobs() {
  const search = refs.jobSearch.value.trim().toLowerCase();
  const region = refs.jobRegionFilter.value;
  const orderBy = refs.jobOrderBy.value;

  let items = state.jobs.filter((job) => {
    if (isItemHidden(job.id)) return false;
    const hay = `${job.centerName} ${job.position}`.toLowerCase();
    if (search && !hay.includes(search)) return false;
    if (region !== "all" && job.region !== region) return false;
    return true;
  });

  if (orderBy === "salary") {
    items = items.sort((a, b) => a.salary.localeCompare(b.salary, "ko"));
  } else {
    items = items.sort((a, b) => b.createdAt - a.createdAt);
  }

  refs.jobCount.textContent = `${items.length}건`;
  refs.jobList.innerHTML = items.length ? items.map((job) => jobCard(job)).join("") : emptyCard("조건에 맞는 공고가 없습니다.");
}

function jobCard(job) {
  const helpful = state.reactions[job.id] || 0;
  const bookmarked = Boolean(state.bookmarks.jobs[job.id]);
  const expired = isDeadlinePast(job.deadline);

  return `<article class="item">
      <h4>${escapeHtml(job.centerName)} · ${escapeHtml(job.position)}</h4>
      <p class="meta">${escapeHtml(job.region)} · ${escapeHtml(job.salary)} · ${escapeHtml(job.employmentType)} · ${escapeHtml(job.workHours)}</p>
      <div class="score-line">
        <span class="pill">마감 ${escapeHtml(job.deadline || "미정")}</span>
        <span class="pill ${expired ? "warn" : ""}">${expired ? "마감됨" : "모집중"}</span>
      </div>
      <p>${escapeHtml(job.description)}</p>
      <div class="item-actions">
        <button class="btn tiny ghost" data-action="bookmarkJob" data-kind="job" data-id="${job.id}">${bookmarked ? "스크랩됨" : "스크랩"}</button>
        <button class="btn tiny ghost" data-action="helpful" data-kind="job" data-id="${job.id}">도움돼요 ${helpful}</button>
        <button class="link-btn" data-action="report" data-kind="job" data-id="${job.id}">신고</button>
      </div>
    </article>`;
}

function renderCommunity() {
  const search = refs.communitySearch.value.trim().toLowerCase();
  const category = refs.communityCategoryFilter.value;
  const orderBy = refs.communityOrderBy.value;

  let items = state.community.filter((post) => {
    if (isItemHidden(post.id)) return false;
    const hay = `${post.topic} ${post.body}`.toLowerCase();
    if (search && !hay.includes(search)) return false;
    if (category !== "all" && post.category !== category) return false;
    return true;
  });

  if (orderBy === "helpful") {
    items = items.sort((a, b) => (state.reactions[b.id] || 0) - (state.reactions[a.id] || 0));
  } else {
    items = items.sort((a, b) => b.createdAt - a.createdAt);
  }

  refs.communityCount.textContent = `${items.length}건`;
  refs.communityList.innerHTML = items.length
    ? items.map((post) => communityCard(post)).join("")
    : emptyCard("조건에 맞는 게시글이 없습니다.");
}

function communityCard(post) {
  const helpful = state.reactions[post.id] || 0;
  return `<article class="item">
      <h4>${escapeHtml(post.topic)}</h4>
      <p class="meta">${escapeHtml(post.category)} · ${escapeHtml(post.alias || "익명")} · ${formatDate(post.createdAt)}</p>
      <p>${escapeHtml(post.body)}</p>
      <div class="item-actions">
        <button class="btn tiny ghost" data-action="helpful" data-kind="community" data-id="${post.id}">도움돼요 ${helpful}</button>
        <button class="link-btn" data-action="report" data-kind="community" data-id="${post.id}">신고</button>
      </div>
    </article>`;
}

function renderModeration() {
  if (!canModerateReports()) {
    refs.reportCount.textContent = "-";
    refs.reportList.innerHTML = emptyCard("운영자 권한에서만 신고 큐를 볼 수 있습니다.");
    return;
  }

  const entries = Object.entries(state.reports)
    .map(([itemId, report]) => ({ itemId, report, item: findItem(itemId) }))
    .filter(({ item }) => Boolean(item))
    .sort((a, b) => (b.report.count || 0) - (a.report.count || 0));

  refs.reportCount.textContent = `${entries.length}건`;

  if (!entries.length) {
    refs.reportList.innerHTML = emptyCard("신고 큐가 비어 있습니다.");
    return;
  }

  refs.reportList.innerHTML = entries
    .map(({ itemId, report, item }) => {
      const reasonText = Object.entries(report.reasons || {})
        .map(([reason, count]) => `${reason}(${count})`)
        .join(", ");

      return `<article class="item report-item">
          <h4>${escapeHtml(itemLabel(item))}</h4>
          <p class="meta">신고 ${report.count}회 · 상태 ${report.status === "hidden" ? "숨김" : "노출"} · 마지막 ${formatDate(
        report.lastReportedAt || item.createdAt
      )}</p>
          <p class="report-reasons">사유: ${escapeHtml(reasonText || "없음")}</p>
          <div class="item-actions split">
            <button class="btn tiny ghost" data-action="restore" data-id="${itemId}">복원</button>
            <button class="btn tiny danger" data-action="hide" data-id="${itemId}">숨김 유지</button>
          </div>
        </article>`;
    })
    .join("");
}

function itemLabel(item) {
  if (item.type === "review") return `[리뷰] ${item.facilityName}`;
  if (item.type === "job") return `[채용] ${item.centerName} · ${item.position}`;
  return `[커뮤니티] ${item.topic}`;
}

function renderInsights() {
  const visibleReviews = state.reviews.filter((r) => !isItemHidden(r.id));
  const visibleJobs = state.jobs.filter((j) => !isItemHidden(j.id));
  const visibleCommunity = state.community.filter((c) => !isItemHidden(c.id));

  const avgOverall = average(visibleReviews.map((r) => Number(r.scores?.overall || 0))).toFixed(2);
  const avgWorkload = average(visibleReviews.map((r) => Number(r.scores?.workload || 0))).toFixed(2);
  const openJobs = visibleJobs.filter((job) => !isDeadlinePast(job.deadline)).length;
  const hiddenItems = Object.values(state.reports).filter((report) => report.status === "hidden").length;

  refs.insightGrid.innerHTML = [
    metricCard("평균 총평점", `${Number(avgOverall) || 0}`),
    metricCard("평균 업무강도", `${Number(avgWorkload) || 0}`),
    metricCard("모집중 공고", `${openJobs}`),
    metricCard("숨김 게시물", `${hiddenItems}`),
    metricCard("선생님 글 비중", `${ratio(visibleCommunity.length, visibleCommunity.length + visibleReviews.length)}%`),
    metricCard("지역 커버", `${new Set(visibleReviews.map((r) => r.region)).size}개`),
    metricCard("스크랩 공고", `${Object.values(state.bookmarks.jobs).filter(Boolean).length}`),
    metricCard("총 신고 사유 수", `${countAllReportReasons()}`),
  ].join("");

  renderRegionBars(visibleReviews);
}

function metricCard(label, value) {
  return `<article class="metric"><p>${escapeHtml(label)}</p><strong>${escapeHtml(value)}</strong></article>`;
}

function renderRegionBars(reviews) {
  const counts = REGION_OPTIONS.map((region) => ({
    region,
    count: reviews.filter((review) => review.region === region).length,
  })).filter((row) => row.count > 0);

  if (!counts.length) {
    refs.regionBars.innerHTML = emptyCard("지역별 리뷰 데이터가 아직 부족합니다.");
    return;
  }

  const max = Math.max(...counts.map((row) => row.count));
  refs.regionBars.innerHTML = counts
    .sort((a, b) => b.count - a.count)
    .map((row) => {
      const pct = Math.max(8, Math.round((row.count / max) * 100));
      return `<div class="bar-row">
          <span>${escapeHtml(row.region)}</span>
          <div class="bar"><span style="width:${pct}%"></span></div>
          <strong>${row.count}</strong>
        </div>`;
    })
    .join("");
}

function renderStats() {
  refs.statReviews.textContent = String(state.reviews.filter((review) => !isItemHidden(review.id)).length);
  refs.statJobs.textContent = String(state.jobs.filter((job) => !isItemHidden(job.id)).length);
  refs.statCommunity.textContent = String(state.community.filter((post) => !isItemHidden(post.id)).length);
  refs.statReports.textContent = String(Object.values(state.reports).reduce((acc, report) => acc + (report.count || 0), 0));
}

function findItem(itemId) {
  const review = state.reviews.find((item) => item.id === itemId);
  if (review) return { ...review, type: "review" };
  const job = state.jobs.find((item) => item.id === itemId);
  if (job) return { ...job, type: "job" };
  const community = state.community.find((item) => item.id === itemId);
  if (community) return { ...community, type: "community" };
  return null;
}

function ensureReportEntry(itemId, kind) {
  if (!state.reports[itemId]) {
    state.reports[itemId] = {
      kind: kind || "unknown",
      count: 0,
      reasons: {},
      status: "visible",
      lastReportedAt: Date.now(),
    };
  }
  return state.reports[itemId];
}

function isItemHidden(itemId) {
  return state.reports[itemId] && state.reports[itemId].status === "hidden";
}

function runPolicyFilter(input) {
  let text = (input || "").trim();
  const counts = { contact: 0, identifier: 0, person: 0, institution: 0, profanity: 0, sexual: 0 };
  if (!text) return { text: "", blocked: false, masked: 0, counts, reason: "" };

  const blockedPatterns = [
    /죽여\s*버리/i,
    /살해\s*하/i,
    /협박\s*하/i,
    /테러\s*하/i,
  ];

  for (const pattern of blockedPatterns) {
    if (pattern.test(text)) {
      return { text: "", blocked: true, masked: 0, counts, reason: "폭력·협박·위해 표현" };
    }
  }

  const restrictedLanguage = CONTENT_POLICY.maskRestrictedLanguage(text, (match) => {
    const compact = match.replace(/[^가-힣A-Za-z0-9ㄱ-ㅎㅏ-ㅣ]/g, "");
    return maskWithStars(compact || match);
  });
  text = restrictedLanguage.text;
  let masked = restrictedLanguage.masked;
  counts.profanity += restrictedLanguage.counts.profanity;
  counts.sexual += restrictedLanguage.counts.sexual;

  const maskRules = [
    {
      type: "contact",
      pattern: /\b(010|011|016|017|018|019)[- ]?\d{3,4}[- ]?\d{4}\b/g,
      replace: () => "[연락처 **]",
    },
    {
      type: "contact",
      pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
      replace: () => "[이메일 **]",
    },
    {
      type: "identifier",
      pattern: /\b\d{6}[- ]?[1-4]\d{6}\b/g,
      replace: () => "[식별번호 **]",
    },
    {
      type: "person",
      pattern: /(?<![가-힣])((?:김|이|박|최|정|강|조|윤|장|임|한|오|서|신|권|황|안|송|전|홍|유|고|문|양|손|배|백|허|남|심|노|하|곽|성|차|주|우|구|민|진|지|엄|채|원|천|방|공|현|함|변|염|여|추|도|소|석|선|설|마|길|연|위|표|명|기|반|왕|금|옥|육|인|맹|제|모|탁|국|어|은|편|용)[가-힣]{2})(\s*)((?:부원장|원장|보육교사|담임선생님|선생님|교사|주임|실장|조리사|담임|원감|씨)(?:님)?)/g,
      replace: (match, name, spacing, role) => `${maskWithStars(name)}${spacing}${role}`,
    },
    {
      type: "person",
      pattern: /(?<![가-힣])((?:김|이|박|최|정|강|조|윤|장|임|한|오|서|신|권|황|안|송|전|홍|유|고|문|양|손|배|백|허|남|심|노|하|곽|성|차|주|우|구|민|진|지|엄|채|원|천|방|공|현|함|변|염|여|추|도|소|석|선|설|마|길|연|위|표|명|기|반|왕|금|옥|육|인|맹|제|모|탁|국|어|은|편|용))(\s+)((?:부원장|원장|보육교사|담임선생님|선생님|교사|주임|실장|조리사|담임|원감)(?:님)?)/g,
      replace: (match, surname, spacing, role) => `${maskWithStars(surname)}${spacing}${role}`,
    },
    {
      type: "institution",
      pattern: /([가-힣A-Za-z0-9]{2,30})(유치원|어린이집)/g,
      shouldMask: (match, name) => !GENERIC_INSTITUTION_PREFIXES.has(name),
      replace: (match, name, type) => `${maskWithStars(name)}${type}`,
    },
  ];

  maskRules.forEach((rule) => {
    text = text.replace(rule.pattern, (...args) => {
      if (rule.shouldMask && !rule.shouldMask(...args)) return args[0];
      masked += 1;
      counts[rule.type] += 1;
      return rule.replace(...args);
    });
  });

  return { text, blocked: false, masked, counts, reason: "" };
}

function maskWithStars(value) {
  const length = Math.max(2, Math.min(8, Array.from(String(value || "")).length));
  return "*".repeat(length);
}

function isLikelyStandaloneKoreanName(value) {
  const text = sanitizeText(value, 24);
  return /^[가-힣]{2,4}$/.test(text) && COMMON_KOREAN_SURNAMES.has(text[0]);
}

function isSafeStructuredPublicName(value) {
  const result = runPolicyFilter(value);
  return !result.blocked
    && result.counts.profanity === 0
    && result.counts.sexual === 0
    && result.counts.contact === 0
    && result.counts.identifier === 0
    && result.counts.person === 0;
}

function mergePolicyCounts(...results) {
  const merged = { contact: 0, identifier: 0, person: 0, institution: 0, profanity: 0, sexual: 0 };
  results.forEach((result) => {
    Object.keys(merged).forEach((key) => {
      merged[key] += Number(result?.counts?.[key] || 0);
    });
  });
  return merged;
}

function formatPolicySummary(counts) {
  const labels = {
    person: "개인 이름",
    institution: "본문 기관명",
    profanity: "욕설",
    sexual: "19금 표현",
    contact: "연락처·이메일",
    identifier: "식별번호",
  };
  return Object.entries(labels)
    .filter(([key]) => Number(counts?.[key] || 0) > 0)
    .map(([key, label]) => `${label} ${counts[key]}건`)
    .join(" · ");
}

function formatPolicyResultMessage(counts) {
  const summary = formatPolicySummary(counts);
  return summary ? `자동 마스킹 완료: ${summary}` : "정책 검사 통과";
}

function resetPolicyHint(hint) {
  hint.textContent = "실명·본문 기관명·욕설·19금 표현·연락처는 등록 시 ** 처리됩니다.";
  hint.className = "hint policy-hint";
}

function showPolicySubmitToast(message, counts) {
  const summary = formatPolicySummary(counts);
  showToast(summary ? `${message} ${summary}을 가렸습니다.` : message);
}

function normalizeTag(value) {
  const cleaned = sanitizeText(value, 24).replace(/\s+/g, "");
  if (!cleaned) return "";
  return cleaned.startsWith("#") ? cleaned : `#${cleaned}`;
}

function clampScore(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return 3;
  return Math.max(1, Math.min(5, Math.round(n * 2) / 2));
}

function formatScore(value) {
  const n = Number(value || 0);
  if (!n) return "0";
  return Number.isInteger(n) ? `${n}` : n.toFixed(1);
}

function sanitizeText(value, maxLength) {
  const text = String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
  return text;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function average(list) {
  if (!list.length) return 0;
  const sum = list.reduce((acc, n) => acc + (Number(n) || 0), 0);
  return sum / list.length;
}

function ratio(a, b) {
  if (!b) return 0;
  return Math.round((a / b) * 100);
}

function countAllReportReasons() {
  return Object.values(state.reports).reduce((acc, report) => {
    return acc + Object.values(report.reasons || {}).reduce((sum, count) => sum + count, 0);
  }, 0);
}

function isDeadlinePast(deadline) {
  if (!deadline) return false;
  const end = new Date(deadline);
  if (Number.isNaN(end.getTime())) return false;
  end.setHours(23, 59, 59, 999);
  return Date.now() > end.getTime();
}

function formatDate(ts) {
  if (!ts) return "-";
  const date = new Date(ts);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function randomAlias() {
  const a = ["차분한", "현실적인", "든든한", "성실한", "솔직한", "유연한"];
  const b = ["교실고양이", "해피펭귄", "연두고래", "단단한토끼", "새벽부엉이", "맑은참새"];
  return `${pick(a)} ${pick(b)}#${Math.floor(100 + Math.random() * 900)}`;
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function makeId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  const bytes = new Uint8Array(16);
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function emptyCard(message) {
  return `<article class="item"><p class="meta">${escapeHtml(message)}</p></article>`;
}

function showToast(message) {
  refs.toast.textContent = message;
  refs.toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => refs.toast.classList.remove("show"), 2200);
}

function persistState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(buildSafeStateSnapshot()));
  } catch (_) {
    // noop
  }
}

function buildSafeStateSnapshot({ forExport = false } = {}) {
  const snapshot = JSON.parse(JSON.stringify(state));
  snapshot.profile.role = ["teacher", "director"].includes(snapshot.profile.role) ? snapshot.profile.role : "teacher";
  snapshot.profile.verified = false;
  snapshot.cloud = forExport
    ? { userId: "", lastSyncAt: 0 }
    : { userId: sanitizeText(snapshot.cloud?.userId, 80), lastSyncAt: Number(snapshot.cloud?.lastSyncAt || 0) };
  snapshot.preferences = {
    browserNotifications: Boolean(snapshot.preferences?.browserNotifications),
    sound: snapshot.preferences?.sound !== false,
  };
  snapshot.notifications = Array.isArray(snapshot.notifications)
    ? snapshot.notifications.slice(0, 50).map((item) => ({
        id: sanitizeText(item.id, 100) || makeId(),
        type: ["job", "community", "facility", "system"].includes(item.type) ? item.type : "system",
        title: sanitizeText(item.title, 60),
        body: sanitizeText(item.body, 140),
        target: NOTIFICATION_TARGETS.has(item.target) ? item.target : "home",
        createdAt: Number(item.createdAt) || Date.now(),
        read: Boolean(item.read),
      }))
    : [];
  return snapshot;
}

function stripLegacyCloudCredentials() {
  if (!state.cloud || typeof state.cloud !== "object") {
    state.cloud = createDefaultState().cloud;
    return;
  }
  delete state.cloud.url;
  delete state.cloud.anonKey;
  delete state.cloud.publishableKey;
  delete state.cloud.serviceRoleKey;
  delete state.cloud.secretKey;
  delete state.cloud.enabled;
  delete state.cloud.connectedAt;
  persistState();
}

function hydrateState() {
  let parsed = null;

  const rawV2 = localStorage.getItem(STORAGE_KEY);
  if (rawV2) {
    try {
      parsed = JSON.parse(rawV2);
    } catch (_) {
      parsed = null;
    }
  }

  if (!parsed) {
    const legacyRaw = localStorage.getItem("k_teacher_link_v1");
    if (legacyRaw) {
      try {
        parsed = migrateLegacyState(JSON.parse(legacyRaw));
      } catch (_) {
        parsed = null;
      }
    }
  }

  if (!parsed) return;

  if (parsed.version !== APP_VERSION) {
    parsed = migrateLegacyState(parsed);
  }

  if (!parsed) return;

  const fallback = createDefaultState();
  Object.assign(state, fallback, parsed);

  state.profile = { ...fallback.profile, ...(parsed.profile || {}) };
  state.profile.role = ["teacher", "director"].includes(state.profile.role) ? state.profile.role : "teacher";
  state.profile.verified = false;
  state.ui = { ...fallback.ui, ...(parsed.ui || {}) };
  state.bookmarks = { ...fallback.bookmarks, ...(parsed.bookmarks || {}) };
  state.cloud = { ...fallback.cloud, ...(parsed.cloud || {}) };
  state.preferences = { ...fallback.preferences, ...(parsed.preferences || {}) };
  state.preferences.browserNotifications = Boolean(state.preferences.browserNotifications);
  state.preferences.sound = state.preferences.sound !== false;
  state.notifications = Array.isArray(parsed.notifications)
    ? parsed.notifications.slice(0, 50).map((item) => ({
        id: sanitizeText(item?.id, 100) || makeId(),
        type: ["job", "community", "facility", "system"].includes(item?.type) ? item.type : "system",
        title: sanitizeText(item?.title, 60) || "새 알림",
        body: sanitizeText(item?.body, 140) || "새 소식이 도착했습니다.",
        target: NOTIFICATION_TARGETS.has(item?.target) ? item.target : "home",
        createdAt: Number(item?.createdAt) || Date.now(),
        read: Boolean(item?.read),
      }))
    : [];
  state.reports = parsed.reports && typeof parsed.reports === "object" ? parsed.reports : {};
  state.reactions = parsed.reactions && typeof parsed.reactions === "object" ? parsed.reactions : {};
  state.myReactions = parsed.myReactions && typeof parsed.myReactions === "object" ? parsed.myReactions : {};

  state.reviews = Array.isArray(parsed.reviews) ? parsed.reviews : [];
  state.jobs = Array.isArray(parsed.jobs) ? parsed.jobs : [];
  state.community = Array.isArray(parsed.community) ? parsed.community : [];
  state.facilities = Array.isArray(parsed.facilities)
    ? parsed.facilities.filter((facility) => isCoordinateInKorea(Number(facility.latitude), Number(facility.longitude)))
    : [];
}

function migrateLegacyState(legacy) {
  if (!legacy || typeof legacy !== "object") return null;

  if (legacy.version === APP_VERSION && legacy.profile) {
    return legacy;
  }

  if (legacy.profile && Array.isArray(legacy.reviews) && Array.isArray(legacy.jobs) && Array.isArray(legacy.community)) {
    return {
      ...legacy,
      version: APP_VERSION,
    };
  }

  const next = createDefaultState();

  next.profile.role = legacy.role === "director" || legacy.role === "teacher" ? legacy.role : "";
  next.profile.orgType = "";
  next.profile.region = "서울";
  next.profile.experience = "1-3년";
  next.profile.alias = randomAlias();
  next.profile.verified = false;

  if (Array.isArray(legacy.reviews)) {
    next.reviews = legacy.reviews.map((item) => {
      const overall = clampScore(item.rating || item.overall || 3);
      return {
        id: item.id || makeId(),
        facilityType: item.facilityType || "유치원",
        facilityName: item.facilityName || "이름 미상",
        region: item.region || "서울",
        scores: {
          overall,
          pay: overall,
          workload: overall,
          leadership: overall,
          growth: overall,
        },
        tag: normalizeTag(item.tag || "#근무후기"),
        content: sanitizeText(item.content || "", 500),
        alias: sanitizeText(item.writer || randomAlias(), 24),
        orgType: item.facilityType || "",
        createdAt: Number(item.createdAt) || Date.now(),
      };
    });
  }

  if (Array.isArray(legacy.jobs)) {
    next.jobs = legacy.jobs.map((item) => ({
      id: item.id || makeId(),
      centerName: item.centerName || "기관명 미상",
      position: item.position || "교사",
      region: item.location || item.region || "서울",
      salary: sanitizeText(item.salary || "협의", 30),
      employmentType: "정규직",
      workHours: "09:00-18:00",
      deadline: dateAfterDays(14),
      description: sanitizeText(item.description || "", 500),
      alias: sanitizeText(item.writer || randomAlias(), 24),
      createdAt: Number(item.createdAt) || Date.now(),
    }));
  }

  if (Array.isArray(legacy.community)) {
    next.community = legacy.community.map((item) => ({
      id: item.id || makeId(),
      category: "고충토로",
      topic: sanitizeText(item.topic || "제목 없음", 60),
      body: sanitizeText(item.body || "", 700),
      alias: sanitizeText(item.writer || randomAlias(), 24),
      createdAt: Number(item.createdAt) || Date.now(),
    }));
  }

  if (legacy.reports && typeof legacy.reports === "object") {
    Object.entries(legacy.reports).forEach(([itemId, count]) => {
      const n = Number(count) || 0;
      if (!n) return;
      next.reports[itemId] = {
        kind: "unknown",
        count: n,
        reasons: { "기존 신고 데이터": n },
        status: n >= AUTO_HIDE_REPORT_COUNT ? "hidden" : "visible",
        lastReportedAt: Date.now(),
      };
    });
  }

  next.version = APP_VERSION;
  return next;
}

function dateAfterDays(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function seedData() {
  if (!state.profile.alias) {
    state.profile.alias = randomAlias();
  }

  state.reviews = [
    {
      id: makeId(),
      facilityType: "유치원",
      facilityName: "해오름유치원",
      region: "서울",
      scores: {
        overall: 4.5,
        pay: 4,
        workload: 3,
        leadership: 4,
        growth: 4,
      },
      tag: "#동료협업좋음",
      content: "행사 시즌 업무량은 높지만 교실 지원 인력이 있어 버틸 수 있는 구조입니다.",
      alias: "재직인증 선생#451",
      orgType: "유치원",
      createdAt: Date.now() - 1000 * 60 * 60 * 6,
    },
    {
      id: makeId(),
      facilityType: "어린이집",
      facilityName: "별빛어린이집",
      region: "경기",
      scores: {
        overall: 3.5,
        pay: 3,
        workload: 4,
        leadership: 3,
        growth: 3,
      },
      tag: "#업무강도높음",
      content: "보조교사 배치가 부족한 날은 체감 강도가 높은 편입니다.",
      alias: "익명 선생#880",
      orgType: "어린이집",
      createdAt: Date.now() - 1000 * 60 * 60 * 12,
    },
  ];

  state.jobs = [
    {
      id: makeId(),
      centerName: "숲속어린이집",
      position: "만3세 담임교사",
      region: "경기",
      salary: "240만원~265만원",
      employmentType: "정규직",
      workHours: "09:00-18:00",
      deadline: dateAfterDays(10),
      description: "보조교사 1인 배치, 대체휴무 명시, 연차 사용 유연한 편입니다.",
      alias: "원장 익명#110",
      createdAt: Date.now() - 1000 * 60 * 60 * 8,
    },
    {
      id: makeId(),
      centerName: "사랑샘유치원",
      position: "방과후 전담교사",
      region: "부산",
      salary: "230만원~250만원",
      employmentType: "계약직",
      workHours: "10:00-19:00",
      deadline: dateAfterDays(18),
      description: "방과후 프로그램 운영 경험자를 우대합니다.",
      alias: "원장 익명#215",
      createdAt: Date.now() - 1000 * 60 * 60 * 20,
    },
  ];

  state.community = [
    {
      id: makeId(),
      category: "수업자료",
      topic: "신학기 생활안전 루틴 도입 아이디어 공유",
      body: "아침 등원 후 5분 안전점검 루틴을 카드형으로 만들었는데 반응이 좋아요. 다른 반 운영법도 궁금합니다.",
      alias: "새내기 선생#552",
      createdAt: Date.now() - 1000 * 60 * 60 * 4,
    },
    {
      id: makeId(),
      category: "노무상담",
      topic: "연차 사용 거절 사례 대응 경험 있으신가요?",
      body: "원칙적으로 가능한데 행사 직전이라 어렵다고 하셔서요. 유사 사례가 있으면 공유 부탁드립니다.",
      alias: "현실 선생#901",
      createdAt: Date.now() - 1000 * 60 * 60 * 15,
    },
  ];

  seedFacilities();

  persistState();
}

function seedFacilities() {
  state.facilities = [
    {
      id: makeId(), facilityType: "유치원", facilityName: "교사링크 샘플유치원", region: "서울",
      roadAddress: "서울특별시 중구 세종대로 110", latitude: 37.5663, longitude: 126.9779,
      status: "sample", createdAt: Date.now() - 1000 * 60 * 90,
    },
    {
      id: makeId(), facilityType: "어린이집", facilityName: "교사링크 샘플어린이집", region: "서울",
      roadAddress: "서울특별시 종로구 종로1길 36", latitude: 37.5731, longitude: 126.9792,
      status: "sample", createdAt: Date.now() - 1000 * 60 * 120,
    },
    {
      id: makeId(), facilityType: "유치원", facilityName: "경기 샘플유치원", region: "경기",
      roadAddress: "경기도 수원시 팔달구 효원로 241", latitude: 37.2636, longitude: 127.0286,
      status: "sample", createdAt: Date.now() - 1000 * 60 * 150,
    },
    {
      id: makeId(), facilityType: "어린이집", facilityName: "부산 샘플어린이집", region: "부산",
      roadAddress: "부산광역시 연제구 중앙대로 1001", latitude: 35.1798, longitude: 129.075,
      status: "sample", createdAt: Date.now() - 1000 * 60 * 180,
    },
  ];
  persistState();
}

function exportState() {
  const payload = {
    exportedAt: new Date().toISOString(),
    app: "교사링크 v6",
    version: APP_VERSION,
    state: buildSafeStateSnapshot({ forExport: true }),
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `teacher-link-backup-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);

  showToast("백업 파일을 내보냈습니다.");
}

function importStateFromFile(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const payload = JSON.parse(String(reader.result || "{}"));
      const imported = payload.state || payload;
      if (!imported || typeof imported !== "object") {
        showToast("백업 파일 형식이 올바르지 않습니다.");
        return;
      }

      const migrated = imported.version === APP_VERSION ? imported : migrateLegacyState(imported);
      if (!migrated) {
        showToast("불러올 수 없는 데이터입니다.");
        return;
      }

      const fresh = createDefaultState();
      Object.assign(state, fresh, migrated);
      state.profile = { ...fresh.profile, ...(migrated.profile || {}) };
      state.profile.role = ["teacher", "director"].includes(state.profile.role) ? state.profile.role : "teacher";
      state.profile.verified = false;
      state.ui = { ...fresh.ui, ...(migrated.ui || {}) };
      state.bookmarks = { ...fresh.bookmarks, ...(migrated.bookmarks || {}) };
      state.cloud = { ...fresh.cloud };
      state.preferences = { ...fresh.preferences, ...(migrated.preferences || {}) };
      state.preferences.browserNotifications = Boolean(state.preferences.browserNotifications);
      state.preferences.sound = state.preferences.sound !== false;
      state.notifications = Array.isArray(migrated.notifications)
        ? migrated.notifications.slice(0, 50).map((item) => ({
            id: sanitizeText(item?.id, 100) || makeId(),
            type: ["job", "community", "facility", "system"].includes(item?.type) ? item.type : "system",
            title: sanitizeText(item?.title, 60) || "새 알림",
            body: sanitizeText(item?.body, 140) || "새 소식이 도착했습니다.",
            target: NOTIFICATION_TARGETS.has(item?.target) ? item.target : "home",
            createdAt: Number(item?.createdAt) || Date.now(),
            read: Boolean(item?.read),
          }))
        : [];

      persistState();
      populateRegionSelects();
      syncEntryGate();
      syncProfileGate();
      syncRoleUi();
      applyTab(state.ui.activeTab || "home");
      renderAll();
      showToast("백업 데이터를 불러왔습니다.");
    } catch (_) {
      showToast("백업 파일 파싱에 실패했습니다.");
    } finally {
      refs.importInput.value = "";
    }
  };

  reader.readAsText(file, "utf-8");
}

function resetToSeed() {
  const ok = confirm("데이터를 샘플 상태로 초기화할까요?");
  if (!ok) return;

  const wasDemoMode = Boolean(state.ui.demoMode);
  const fresh = createDefaultState();
  fresh.ui.demoMode = wasDemoMode;
  Object.assign(state, fresh);
  state.profile.alias = randomAlias();
  persistState();
  seedData();
  seedNotifications();
  populateRegionSelects();
  syncEntryGate();
  syncProfileGate();
  syncRoleUi();
  applyTab("home");
  renderAll();
  showToast("샘플 데이터로 초기화되었습니다.");
}
