// 범용적인 추천 영웅 템플릿
const defaultRoleData = {
    brawl: {
        tank: { heroes: ["라인하르트", "라마트라", "오리사"], synergy: ["루시우", "바티스트"], counter: "파라 (대처: 방벽으로 버티며 히트스캔 딜러의 포커싱 유도)" },
        damage: { heroes: ["[서브딜] 메이", "[메인딜] 캐서디", "[메인딜] 리퍼"], synergy: ["라인하르트", "루시우"], counter: "위도우메이커 (대처: 사각지대 활용 및 빙벽/방벽으로 시야 차단)" },
        support: { heroes: ["루시우", "바티스트", "모이라"], synergy: ["근접 탱커진"], counter: "솜브라 (대처: 힐러끼리 뭉쳐서 해킹 및 핑 대비)" }
    },
    dive: {
        tank: { heroes: ["윈스턴", "D.Va", "둠피스트"], synergy: ["아나", "트레이서"], counter: "리퍼, 바스티온 (대처: 상대 쿨타임이 빠진 후 진입하거나 방어 매트릭스 활용)" },
        damage: { heroes: ["[서브딜] 트레이서", "[서브딜] 겐지", "[서브딜] 솜브라"], synergy: ["윈스턴", "젠야타"], counter: "브리기테, 토르비욘 (대처: 포탑을 먼저 철거하거나 브리기테를 피해 우회 공격)" },
        support: { heroes: ["아나", "키리코", "브리기테"], synergy: ["다이브 탱커"], counter: "트레이서, 솜브라 (대처: 수면총 등 CC기를 아끼고 브리기테로 아나 보호)" }
    },
    poke: {
        tank: { heroes: ["시그마", "오리사"], synergy: ["바티스트", "위도우메이커"], counter: "윈스턴, 둠피스트 (대처: 거리를 벌리고 진입하는 적을 강착 등으로 밀어내기)" },
        damage: { heroes: ["[메인딜] 위도우메이커", "[메인딜] 애쉬", "[메인딜] 소전"], synergy: ["시그마", "메르시"], counter: "솜브라, 겐지 (대처: 고지대 변경 및 아군 힐러 시야 안에서 교전)" },
        support: { heroes: ["바티스트", "젠야타", "일리아리"], synergy: ["포킹 딜러진"], counter: "트레이서, 윈스턴 (대처: 젠야타 부조화 포커싱 혹은 불사 장치로 턴 넘기기)" }
    }
};

// 파이썬 데이터가 쏙 들어올 대형 데이터 상자 변수 선언
let mapData = {}; 

// DOM Elements
const mapGrid = document.getElementById('mapGrid');
const step2Section = document.getElementById('step2');
const roleButtons = document.querySelectorAll('.role-item');
const resultBox = document.getElementById('resultBox');
const resultTitle = document.getElementById('resultTitle');
const strategyList = document.getElementById('strategyList');
const roleDataContent = document.getElementById('roleDataContent');

// 👑 변경: HTML 디자인과 클래스명을 동일하게 매칭 ('ow-tab-btn' 취득)
const regionTabButtons = document.querySelectorAll('.ow-tab-btn');
const tierSelect = document.getElementById('tierSelect');

// 댓글용 DOM Elements
const commentForm = document.getElementById('commentForm');
const commentNickname = document.getElementById('commentNickname');
const commentContent = document.getElementById('commentContent');
const commentList = document.getElementById('commentList');
const commentSubmitBtn = document.getElementById('commentSubmitBtn');
const likeBtn = document.getElementById('likeBtn');
const likeCount = document.getElementById('likeCount');

// State Variables
let currentMapId = null;
let currentRole = null;
let currentRegion = 'asia'; // 👑 서버 대륙 상태 변수 추가 (기본값 아시아)
let currentTier = 'all';    // 티어 상태 변수 기본값

// 사용자 고유 세션 ID 생성 및 관리 (로그인 대용)
let userSessionId = localStorage.getItem('owMapMaster_sessionId');
if (!userSessionId) {
    userSessionId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    localStorage.setItem('owMapMaster_sessionId', userSessionId);
}

// 현재 사용자가 좋아요를 눌렀는지 상태를 저장하는 변수
let isLikedByCurrentUser = false;

// 한 번 불러온 맵의 좋아요 데이터를 임시 기억하는 캐시 저장소 (빠른 로딩용)
const mapLikesCache = {};

// 유튜브식 좋아요 기능을 위한 상태 변수
let initialLikeState = false; 
let currentLikesCount = 0; 
let likeDebounceTimer = null;
let userInteractedSinceLoad = false;

// --- 이벤트 리스너 --- //

// 역할군 선택 이벤트
roleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        roleButtons.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');

        currentRole = btn.dataset.role;
        sessionStorage.setItem('owMapMaster_role', currentRole);

        step2Section.classList.remove('disabled');
        step2Section.scrollIntoView({ behavior: 'smooth', block: 'start' });

        if (currentMapId) renderResult();
    });
});

// 👑 추가 및 보정: 아시아/미국/유럽 탭 클릭 시 이벤트 액션 구현
if (regionTabButtons.length > 0) {
    regionTabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            regionTabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // HTML의 data-region="usa" 단어를 데이터 구조 규격인 "na"로 안전 치환
            let selectedRegion = btn.dataset.region;
            if (selectedRegion === 'usa') selectedRegion = 'na';

            currentRegion = selectedRegion;
            
            // 👑 중요: 서버가 바뀌면 맵 타일 목록의 조건도 변경될 수 있으므로 다시 리로드
            initMapGrid();
            if (currentMapId) renderResult({ scroll: false });
        });
    });
}

// 티어 선택 드롭다운 체인지 이벤트 리스너
if (tierSelect) {
    tierSelect.addEventListener('change', (e) => {
        currentTier = e.target.value;
        initMapGrid(); // 티어 변경 시에도 맵 그리드 유효성 다시 갱신
        if (currentMapId) renderResult({ scroll: false }); 
    });
}

// --- 렌더링 및 UI 로직 --- //

function updateLikeButtonUI(likesCount, isLiked) {
    currentLikesCount = likesCount;
    isLikedByCurrentUser = isLiked;
    
    likeCount.textContent = likesCount > 0 ? likesCount : '0';

    const textNode = likeBtn.childNodes[0];
    if (isLiked) {
        likeBtn.classList.add('liked');
        textNode.textContent = '👍 추천 완료 ';
    } else {
        likeBtn.classList.remove('liked');
        textNode.textContent = '👍 추천해요 ';
    }
    
    likeBtn.disabled = false; 
}

// 맵 카테고리 정의
const mapCategories = [
    { id: 'control', name: '쟁탈', maps: ['ilios', 'lijiangTower', 'nepal', 'oasis', 'busan', 'samoa', 'antarcticPeninsula'] },
    { id: 'escort', name: '호위', maps: ['dorado', 'route66', 'gibraltar', 'havana', 'rialto', 'junkertown', 'circuitRoyal', 'shambali'] },
    { id: 'hybrid', name: '혼합', maps: ['kingsRow', 'numbani', 'hollywood', 'eichenwalde', 'blizzardWorld', 'midtown', 'paraiso'] },
    { id: 'push', name: '밀기', maps: ['colosseo', 'newQueenStreet', 'esperanca', 'runasapi'] },
    { id: 'flashpoint', name: '플래시포인트', maps: ['suravasa', 'newJunkCity', 'atlis'] }
];

// 맵 모드별 공통 전략 팁
const modeStrategies = {
    control: [
        "[공통] 첫 한타의 중요성: 첫 거점 점령 후에는 거점 안에서만 싸우지 말고, 앞쪽에서 저지선을 형성해 진입을 늦추며 시간을 버세요.",
        "[공통] 궁극기 설계: 단순히 궁을 아끼지 말고, 상대의 특정 궁극기(예: 초월)를 카운팅하고 타이밍을 맞춰 '이길 한타'를 만드세요."
    ],
    escort: [
        "[공통] 맵 이해도: 구간마다 유리한 영웅 조합이 다를 수 있으므로 적절한 영웅 교체가 중요합니다.",
        "[공통] 자리 싸움(고속도로): 화물을 먹은 직후 멍하니 있지 말고, 미리 다음 경유지로 나가 유리한 자리를 선점하세요.",
        "[공통] 궁극기 배분: 불리한 지형을 극복하기 위해 궁극기를 과감히 투자하여 자리를 뺏는 것이 운영의 핵심입니다.",
        "[공통] 측면 활용: 정면으로만 나가지 말고 이동기가 좋은 영웅으로 사이드를 활용해 사방을 흔드세요."
    ],
    hybrid: [
        "[공통] 맵 이해도: 구간마다 유리한 영웅 조합이 다를 수 있으므로 적절한 영웅 교체가 중요합니다.",
        "[공통] 자리 싸움(고속도로): 거점/화물을 먹은 직후 멍하니 있지 말고, 미리 다음 경유지로 나가 유리한 자리를 선점하세요.",
        "[공통] 궁극기 배분: 불리한 지형을 극복하기 위해 궁극기를 과감히 투자하여 자리를 뺏는 것이 운영의 핵심입니다.",
        "[공통] 측면 활용: 정면으로만 나가지 말고 이동기가 좋은 영웅으로 사이드를 활용해 사방을 흔드세요."
    ],
    push: [
        "[공통] 연승의 중요성: 밀기는 연달아 이기는 것이 중요합니다. 리드 시 궁극기를 활용해서라도 최대한 더 밀어두세요.",
        "[공통] 궁극기 운영: 질 때도 상대 궁극기를 빼거나 주요 힐러를 잡아 다음 한타를 준비하는 '잘 지는 법'을 익히세요.",
        "[공통] 거점 방어: 리드를 잡았다면 불리한 위치까지 내려가 싸우지 말고, 성벽 등 유리한 고지대에서 수성하세요."
    ],
    flashpoint: [
        "[공통] 거점 선점: 게이지가 빨리 차오르므로, 팀 궁극기를 조율해 거점을 먼저 먹고 시작하는 쪽이 압도적으로 유리합니다.",
        "[공통] 이동 중 교전 금지: 거점 활성화에 맞춰 빠르게 이동하세요. 불필요한 교전은 리스폰 꼬임과 거점 손실로 이어집니다."
    ]
};

// 1. 맵 타일 렌더링
function initMapGrid() {
    mapGrid.innerHTML = '';

    mapCategories.forEach(category => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'map-category';

        const title = document.createElement('div');
        title.className = 'map-category-title';
        title.textContent = category.name;
        categoryDiv.appendChild(title);

        const gridDiv = document.createElement('div');
        gridDiv.className = 'map-grid';

        category.maps.forEach(mapId => {
            // 👑 정밀 보정: [현재지역][현재티어] 삼중 트리 분리 체크 레이어 적용
            const regBox = mapData[currentRegion] || mapData['asia'];
            const tierBox = regBox ? (regBox[currentTier] || regBox['all']) : null;
            const data = tierBox ? tierBox[mapId] : null;
            if (!data) return; 

            const btn = document.createElement('button');
            btn.className = 'map-btn';
            btn.dataset.mapId = mapId;
            if (currentMapId === mapId) btn.classList.add('selected'); // 선택 유지 상태값 동기화
            
            const mapName = data.name.includes(' (') ? data.name.split(' (')[0] : data.name; 
            
            let mapImageName = mapName;
            if (mapId === "gibraltar") mapImageName = "감시 기지- 지브롤터";
            else if (mapId === "kingsRow") mapImageName = "왕의 길";
            else if (mapId === "numbani") mapImageName = "눔바니";
            else if (mapId === "hollywood") mapImageName = "할리우드";
            else if (mapId === "eichenwalde") mapImageName = "아이헨발데";
            else if (mapId === "blizzardWorld") mapImageName = "블리자드 월드";
            else if (mapId === "midtown") mapImageName = "미드타운";
            else if (mapId === "paraiso") mapImageName = "파라이수";
            else if (mapId === "ilios") mapImageName = "일리오스";
            else if (mapId === "lijiangTower") mapImageName = "리장 타워";
            else if (mapId === "nepal") mapImageName = "네팔";
            else if (mapId === "oasis") mapImageName = "오아시스";
            else if (mapId === "busan") mapImageName = "부산";
            else if (mapId === "samoa") mapImageName = "사모아";
            else if (mapId === "antarcticPeninsula") mapImageName = "남극 반도";
            else if (mapId === "dorado") mapImageName = "도라도";
            else if (mapId === "route66") mapImageName = "66번 국도";
            else if (mapId === "havana") mapImageName = "하바나";
            else if (mapId === "rialto") mapImageName = "리알토";
            else if (mapId === "junkertown") mapImageName = "쓰레기촌";
            else if (mapId === "circuitRoyal") mapImageName = "서킷 로얄";
            else if (mapId === "shambali") mapImageName = "샴발리 수도원";
            else if (mapId === "colosseo") mapImageName = "콜로세오";
            else if (mapId === "newQueenStreet") mapImageName = "뉴 퀸 스트리트";
            else if (mapId === "esperanca") mapImageName = "이스페란사";
            else if (mapId === "runasapi") mapImageName = "루나사피";
            else if (mapId === "suravasa") mapImageName = "수라바사";
            else if (mapId === "newJunkCity") mapImageName = "뉴 정크 시티";
            else if (mapId === "atlis" || mapId === "aatlis") mapImageName = "아틀리스";

            const img = document.createElement('img');
            img.src = `images/${mapImageName}.webp`; 
            
            img.onerror = () => {
                img.src = `https://placehold.co/400x225/1E1E1E/FF5A36?text=${encodeURIComponent(mapName)}`;
            };
            img.alt = mapName;
            img.className = 'map-image';

            const overlay = document.createElement('div');
            overlay.className = 'map-overlay';

            const infoDiv = document.createElement('div');
            infoDiv.className = 'map-info';

            const nameSpan = document.createElement('span');
            nameSpan.className = 'map-name';
            nameSpan.textContent = mapName;

            const subInfoSpan = document.createElement('span');
            subInfoSpan.className = 'map-sub-info';
            subInfoSpan.textContent = category.name.split(' ')[0]; 

            infoDiv.appendChild(nameSpan);
            infoDiv.appendChild(subInfoSpan);
            overlay.appendChild(infoDiv);

            btn.appendChild(img);
            btn.appendChild(overlay);

            const prefetchLikes = () => {
                if (!mapLikesCache[mapId]) {
                    const promise = fetch(`/api/getMapLikes?mapId=${mapId}&user_session_id=${userSessionId}`, { cache: 'no-store' })
                        .then(res => res.ok ? res.json() : Promise.reject('Fetch Fail'))
                        .then(data => {
                            mapLikesCache[mapId] = { resolved: true, data };
                            if (currentMapId === mapId) {
                                initialLikeState = data.is_liked_by_user;
                                if (!userInteractedSinceLoad) updateLikeButtonUI(data.likes_count, data.is_liked_by_user);
                            }
                            return data;
                        })
                        .catch(() => {
                            mapLikesCache[mapId] = null; 
                            if (currentMapId === mapId && !userInteractedSinceLoad) updateLikeButtonUI(0, false);
                            return null;
                        });
                    mapLikesCache[mapId] = { resolved: false, promise };
                }
            };
            btn.addEventListener('mouseenter', prefetchLikes);
            btn.addEventListener('touchstart', prefetchLikes, { passive: true });

            btn.addEventListener('click', () => {
                if (btn.classList.contains('selected')) {
                    btn.classList.remove('selected');
                    currentMapId = null;
                    sessionStorage.removeItem('owMapMaster_map'); 
                    resultBox.classList.add('hidden'); 
                } else {
                    document.querySelectorAll('.map-btn').forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                    currentMapId = mapId;
                    sessionStorage.setItem('owMapMaster_map', currentMapId); 
                    
                    if (currentRole) renderResult();
                }
            });
            
            gridDiv.appendChild(btn);
        });

        categoryDiv.appendChild(gridDiv);
        mapGrid.appendChild(categoryDiv);
    });
}

const formatTextWithBadges = (text) => {
    if (typeof text !== 'string') return text;
    return text
        .replace(/\[대회\]\s*/g, '<span class="badge badge-tournament">🏆 대회</span> ')
        .replace(/\[경쟁전\]\s*/g, '') 
        .replace(/\[공통\]\s*/g, '<span class="badge badge-common">🤝 공통</span> ')
        .replace(/\[메인딜\]\s*/g, '<span class="badge badge-main-dps">🎯 메인딜</span> ')
        .replace(/\[다이브\]\s*/g, '<span class="badge badge-dive">☄️ 다이브</span> ')
        .replace(/\[러쉬\]\s*/g, '<span class="badge badge-rush">🏃 러쉬</span> ')
        .replace(/\[포킹\]\s*/g, '<span class="badge badge-poke">🏹 포킹</span> ')
        .replace(/\[앵커\]\s*/g, '<span class="badge badge-anchor">🛡️ 앵커</span> ')
        .replace(/\[서브딜\]\s*/g, '<span class="badge badge-sub-dps">🗡️ 서브딜</span> ');
};

const formatSynergyWithIcons = (synergyText) => {
    let tags = '';
    const tagMatch = synergyText.match(/^(\[[^\]]+\]\s*)+/);
    if (tagMatch) {
        tags = tagMatch[0];
        synergyText = synergyText.substring(tags.length);
    }
    
    let description = '';
    const descMatch = synergyText.match(/\s*\([^)]+\)$/);
    if (descMatch) {
        description = descMatch[0];
        synergyText = synergyText.substring(0, synergyText.length - description.length);
    }

    const archetypeRegex = /\[(다이브|러쉬|포킹|앵커)\]/g;
    const archMatches = tags.match(archetypeRegex) || [];
    let cleanTags = tags.replace(archetypeRegex, '').trim();
    let tagsHtml = formatTextWithBadges(cleanTags);

    if (archMatches.length > 1) {
        const swaps = synergyText.split('+').filter(h => h.includes('→')).map(h => h.replace(/\[.*?\]/g, '').trim());
        const swapText = swaps.join(', ');
        
        const archElements = archMatches.map(a => formatTextWithBadges(a));
        const arrowHtml = `
            <div style="display:inline-flex; flex-direction:column; align-items:center; justify-content:center; margin: 0 10px; transform: translateY(2px);">
                <span style="color: var(--ow-orange); font-weight: bold; line-height: 0.8; font-size: 1.3em;">→</span>
                <span style="font-size: 0.7em; color: #cbd5e1; margin-top: 4px; font-weight: normal; text-align: center; max-width: 250px; line-height: 1.3; word-break: keep-all;">${swapText}</span>
            </div>
        `;
        const archHtml = archElements.join(arrowHtml);
        tagsHtml += `<div style="display: inline-flex; align-items: flex-start; margin-left: 4px;">${archHtml}</div>`;
    } else if (archMatches.length === 1) {
        tagsHtml += ` ${formatTextWithBadges(archMatches[0])}`;
    }

    if (synergyText.includes('+') || synergyText.includes('→') || synergyText.trim().length > 0) {
        const groups = synergyText.split('+').map(h => h.trim()).filter(h => h.length > 0);
        const formattedHeroes = groups.map(group => {
            if (group.includes('→')) {
                const swaps = group.split('→').map(h => createHeroElement(h.trim()));
                return `<div style="display:inline-flex; align-items:center; background: rgba(249, 158, 26, 0.15); padding: 8px 12px; border-radius: 8px; border: 1px dashed rgba(249, 158, 26, 0.4);">` + swaps.join('<span style="margin: 0 10px; color: var(--ow-orange); font-weight: bold; font-size: 1.2em;">→</span>') + `</div>`;
            }
            return `<div style="display:inline-flex; align-items:center;">${createHeroElement(group)}</div>`;
        }).join('<span style="margin: 0 8px; color: var(--ow-orange); font-weight: bold; font-size: 1.2em;">+</span>');
        
        let descHtml = `<div style="color: #a0aec0; font-size: 0.9em; padding-left:4px; margin-top:4px;">${description}</div>`;
        if (description.includes('|')) {
            const inner = description.replace(/^\s*\(/, '').replace(/\)\s*$/, '');
            const [title, reason] = inner.split('|').map(s => s.trim());
            descHtml = `<div style="color: #e0e6ed; font-size: 0.95em; font-weight: bold; margin-top:6px; padding-left:4px;">[${title}]</div><div style="color: #f99e1a; font-size: 0.85em; padding-left:4px; margin-top:3px;">💡 ${reason}</div>`;
        }

        return `<div style="margin-bottom: 16px; line-height: 1.6; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.05);"><div style="display:flex; align-items: flex-start; margin-bottom: 10px; flex-wrap: wrap;">${tagsHtml}</div><div style="display:flex; flex-wrap:wrap; align-items:center; margin-top:6px; margin-bottom:4px; gap:6px; padding-left:4px;">${formattedHeroes}</div>${descHtml}</div>`;
    }

    return `<div style="margin-bottom: 8px;">${tagsHtml + formatTextWithBadges(synergyText + description)}</div>`;
};

const heroNameEnKrMap = {
    "Ana": "아나", "Anran": "안란", "Ashe": "애쉬", "Baptiste": "바티스트", "Bastion": "바스티온", 
    "Brigitte": "브리기테", "Cassidy": "캐서디", "D.Va": "디바", "Domina": "도미나", "Doomfist": "둠피스트", 
    "Echo": "에코", "Emre": "엠레", "Freja": "프레야", "Genji": "겐지", "Hanzo": "한조", "Hazard": "해저드", 
    "Illari": "일리아리", "Jetpack Cat": "제트팩 캣", "Junker Queen": "정커퀸", "Junkrat": "정크랫", 
    "Juno": "주노", "Kiriko": "키리코", "Lifeweaver": "라이프위버", "Lucio": "루시우", "Lúcio": "루시우", 
    "Mauga": "마우가", "Mei": "메이", "Mercy": "메르시", "Mizuki": "미즈키", "Moira": "모이라", 
    "Orisa": "오리사", "Pharah": "파라", "Ramattra": "라마트라", "Reaper": "리퍼", "Reinhardt": "라인하르트", 
    "Roadhog": "로드호그", "Sierra": "시에라", "Sigma": "시그마", "Sojourn": "소전", "Soldier: 76": "솔저: 76", 
    "Sombra": "솜브라", "Symmetra": "시메트라", "Torbjörn": "토르비욘", "Torbjorn": "토르비욘", 
    "Tracer": "트레이서", "Vendetta": "벤데타", "Venture": "벤처", "Widowmaker": "위도우메이커", 
    "Winston": "윈스턴", "Wrecking Ball": "레킹볼", "Wuyang": "우양", "Zarya": "자리야", "Zenyatta": "젠야타"
};

const createHeroElement = (heroStr, rank = null) => {
    const pureName = heroStr.split(' (')[0].trim();
    const statsInfo = heroStr.includes(' (') ? heroStr.split(' (')[1].replace(')', '') : '';
    
    const koreanName = heroNameEnKrMap[pureName] || pureName;

    const mainDpsList = ["Cassidy", "Soldier: 76", "Ashe", "Widowmaker", "Reaper", "Bastion", "Sojourn"];
    const subDpsList = ["Tracer", "Genji", "Sombra", "Echo", "Pharah", "Mei", "Symmetra", "Venture", "Hanzo"];

    let leftBadges = '';
    if (rank !== null) leftBadges += `<span class="badge badge-rank">👑 ${rank}위</span>`;
    
    if (currentRole === 'damage') {
        if (mainDpsList.includes(pureName)) leftBadges += '<span class="badge badge-main-dps">🎯 메인딜</span>';
        if (subDpsList.includes(pureName)) leftBadges += '<span class="badge badge-sub-dps">🗡️ 서브딜</span>';
    }

    let imageName = koreanName;
    if (pureName === 'Soldier: 76') imageName = '솔져';

    const imgSrc = `images/${imageName}.webp`;
    const fallbackSrc = `https://placehold.co/30x30/28323f/f99e1a?text=${encodeURIComponent(koreanName.substring(0, 1))}`;

    return `<div class="hero-item-wrapper" style="margin-bottom: 12px; background: rgba(255,255,255,0.02); padding: 8px; border-radius: 6px;">
                <div style="display:flex; justify-content: space-between; align-items: center; width: 100%;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <div class="hero-item" style="margin: 0; cursor: pointer;" onclick="goToHeroPage('${encodeURIComponent(pureName)}')">
                            <img src="${imgSrc}" alt="${koreanName}" class="hero-icon" onerror="this.src='${fallbackSrc}'">
                            <span class="hero-name" style="font-weight:bold;">${koreanName}</span>
                        </div>
                        <div class="hero-badges-left" style="position:static; display:inline-flex; gap:4px;">${leftBadges}</div>
                    </div>
                    ${statsInfo ? `<span style="font-size: 0.85em; color: #cbd5e1; background: rgba(0,0,0,0.3); padding: 3px 8px; border-radius: 4px;">${statsInfo}</span>` : ''}
                </div>
            </div>`;
}

const getFormattedHeroes = (heroes) => {
    if (!heroes) return '';
    const heroArray = Array.isArray(heroes) ? heroes : [heroes];
    const flatHeroes = [...new Set(heroArray.flat(Infinity))];
    return flatHeroes.map((hero, index) => `<div class="hero-group">${createHeroElement(hero, index + 1)}</div>`).join('');
};

// 3. 결과창 렌더링
function renderResult(options = { scroll: true }) {
    if (!currentMapId || !currentRole) return;

    // 👑 초정밀 보정: 파이썬 json 대문자 데이터 규격(ASIA, NA, EU / ALL)과 매칭하기 위해 강제 대문자 치환 레이어 주입
    const jsonRegion = currentRegion.toUpperCase(); // asia -> ASIA, na -> NA
    const jsonTier = currentTier.toUpperCase();     // all -> ALL

    const regBox = mapData[jsonRegion] || mapData['ASIA'];
    const tierBox = regBox ? (regBox[jsonTier] || regBox['ALL']) : null;
    
    // 블리자드 공식 소스코드는 개별 맵 구분이 아닌 'all-maps' 통합 매트릭스로 뽑혀 나왔으므로 
    // 어떤 맵을 선택하든 오피셜 실시간 누적 수치가 매끄럽게 흐르도록 폴백 바인딩 처리
    const data = tierBox ? (tierBox[currentMapId] || tierBox['all-maps']) : null;

    if (!data) {
        roleDataContent.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color:#cbd5e1; padding:30px; background:rgba(0,0,0,0.1); border-radius:8px;">선택한 서버 및 티어의 통계 지표가 부족하여 데이터를 출력할 수 없습니다.</p>';
        return;
    }

    const roleData = data.roles[currentRole];

    let currentCategory = '';
    mapCategories.forEach(cat => {
        if (cat.maps.includes(currentMapId)) {
            currentCategory = cat.id;
        }
    });

    const roleName = currentRole === 'tank' ? '돌격' : currentRole === 'damage' ? '공격' : '지원';
    // 맵 뱃지 명칭 파싱 보정
    const mapDisplayName = data.name ? (data.name.includes(' (') ? data.name.split(' (')[0] : data.name) : "오버워치 전장";
    resultTitle.textContent = `${mapDisplayName} - ${roleName} 전략`;

    const combinedStrategies = [...(data.strategy || []), ...(modeStrategies[currentCategory] || [])];

    strategyList.innerHTML = '';
    combinedStrategies.forEach(text => {
        const li = document.createElement('li');
        li.innerHTML = formatTextWithBadges(text); 
        strategyList.appendChild(li);
    });

    roleDataContent.innerHTML = `
        <div class="card">
            <h3>⭐ 추천 영웅 Top 5</h3>
            <div style="margin-top: 15px; margin-bottom: 10px; display:flex; flex-direction:column; gap:2px;">${getFormattedHeroes(roleData.heroes)}</div>
            <p style="font-size:0.9em; color:#e0e6ed; margin-top:8px;">현재 경쟁전 승률 점수(Score) 가중치가 가장 높은 상위 5명 조합입니다.</p>
        </div>
        <div class="card">
            <h3>🤝 시너지 픽</h3>
            <div>${roleData.synergy ? roleData.synergy.map(s => formatSynergyWithIcons(s)).join('') : '<p style="color:#cbd5e1;">시너지 분석 준비 중</p>'}</div>
            <p style="font-size:0.9em; color:#e0e6ed; margin-top:10px;">대회 검증 조합 및 실시간 API 자동 업데이트 시너지 데이터셋입니다.</p>
        </div>
        <div class="card" style="grid-column: 1 / -1;">
            <h3>📖 조합 아키타입 가이드</h3>
            <div style="display: flex; flex-wrap: wrap; gap: 15px; margin-top: 15px;">
                <div style="flex: 1 1 45%; background: rgba(0,0,0,0.2); padding: 15px; border-radius: 8px;">
                    <strong style="color: #3498db; font-size: 1.1em;">☄️ 다이브 (Dive)</strong>
                    <p style="font-size: 0.9em; margin: 8px 0 0; color: #e0e6ed; line-height: 1.5;">고기동성 영웅(윈스턴, 둠피스트 등)을 활용해 적의 취약한 지원가를 순식간에 덮치는 기동전 조합입니다.</p>
                </div>
                <div style="flex: 1 1 45%; background: rgba(0,0,0,0.2); padding: 15px; border-radius: 8px;">
                    <strong style="color: #e67e22; font-size: 1.1em;">🏃 러쉬 / 브롤 (Rush/Brawl)</strong>
                    <p style="font-size: 0.9em; margin: 8px 0 0; color: #e0e6ed; line-height: 1.5;">루시우의 속도 버프 등을 받아 다 같이 뭉쳐서 진입한 뒤, 근접 난전을 펼치는 공격적 조합입니다.</p>
                </div>
                <div style="flex: 1 1 45%; background: rgba(0,0,0,0.2); padding: 15px; border-radius: 8px;">
                    <strong style="color: #9b59b6; font-size: 1.1em;">🏹 포킹 (Poke)</strong>
                    <p style="font-size: 0.9em; margin: 8px 0 0; color: #e0e6ed; line-height: 1.5;">긴 사거리의 영웅(시그마, 위도우메이커 등)을 배치해 원거리에서 대미지를 누적시키고 접근을 차단합니다.</p>
                </div>
                <div style="flex: 1 1 45%; background: rgba(0,0,0,0.2); padding: 15px; border-radius: 8px;">
                    <strong style="color: #95a5a6; font-size: 1.1em;">🛡️ 앵커 / 안티-다이브 (Anchor)</strong>
                    <p style="font-size: 0.9em; margin: 8px 0 0; color: #e0e6ed; line-height: 1.5;">특정 거점이나 요충지에 단단하게 진형을 구축하고 들어오는 적을 튼튼하게 받아치는 수비형 조합입니다.</p>
                </div>
            </div>
        </div>
    `;

    resultBox.classList.remove('hidden');
    loadComments(currentMapId); 
    loadLikes(currentMapId); 
   
    if (options.scroll) {
        resultBox.scrollIntoView({ behavior: 'smooth' });
    }
}

// --- 💬 댓글 기능 로직 --- //

async function loadComments(mapId) {
    commentList.innerHTML = '<p style="text-align: center; color: #a0aec0;">댓글을 불러오는 중...</p>';
    try {
        const response = await fetch(`/api/getComments?mapId=${mapId}`);
        if (!response.ok) throw new Error('댓글 로드 실패');
        
        const comments = await response.json();
        commentList.innerHTML = ''; 
        
        if (comments.length === 0) {
            commentList.innerHTML = '<p style="text-align: center; color: #a0aec0;">아직 작성된 댓글이 없습니다. 첫 번째 댓글을 남겨보세요!</p>';
            return;
        }

        comments.forEach(comment => {
            const dateObj = new Date(comment.created_at);
            const dateStr = `${dateObj.getFullYear()}.${String(dateObj.getMonth() + 1).padStart(2, '0')}.${String(dateObj.getDate()).padStart(2, '0')} ${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;
            
            const commentDiv = document.createElement('div');
            commentDiv.className = 'comment-item';
            commentDiv.innerHTML = `
                <div class="comment-header">
                    <span class="comment-author">${comment.nickname}</span>
                    <span class="comment-date">${dateStr}</span>
                </div>
                <div class="comment-body">${comment.content}</div>
            `;
            commentList.appendChild(commentDiv);
        });
    } catch (error) {
        commentList.innerHTML = '<p style="text-align: center; color: #e74c3c;">댓글을 불러오는 중 오류가 발생했습니다.</p>';
    }
}

commentForm.addEventListener('submit', async (e) => {
    e.preventDefault(); 
    if (!currentMapId) return;
    
    const nickname = commentNickname.value.trim();
    const content = commentContent.value.trim();
    
    commentSubmitBtn.disabled = true;
    commentSubmitBtn.textContent = '저장 중...';

    try {
        const response = await fetch('/api/addComment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ map_id: currentMapId, nickname, content })
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(`[서버 에러] ${errData.error}`);
        }

        commentNickname.value = '';
        commentContent.value = '';
        await loadComments(currentMapId);
    } catch (error) {
        alert(error.message);
    } finally {
        commentSubmitBtn.disabled = false;
        commentSubmitBtn.textContent = '댓글 남기기';
    }
});

function loadLikes(mapId) {
    userInteractedSinceLoad = false; 

    if (mapLikesCache[mapId] && mapLikesCache[mapId].resolved) {
        initialLikeState = mapLikesCache[mapId].data.is_liked_by_user;
        updateLikeButtonUI(mapLikesCache[mapId].data.likes_count, mapLikesCache[mapId].data.is_liked_by_user);
        return;
    }

    updateLikeButtonUI(0, false);
    likeCount.textContent = ''; 

    if (!mapLikesCache[mapId]) {
        const promise = fetch(`/api/getMapLikes?mapId=${mapId}&user_session_id=${userSessionId}`, { cache: 'no-store' })
            .then(res => res.ok ? res.json() : Promise.reject('Fetch Fail'))
            .then(data => {
                mapLikesCache[mapId] = { resolved: true, data };
                if (currentMapId === mapId) {
                    initialLikeState = data.is_liked_by_user;
                    if (!userInteractedSinceLoad) updateLikeButtonUI(data.likes_count, data.is_liked_by_user);
                }
                return data;
            })
            .catch(() => {
                mapLikesCache[mapId] = null;
                if (currentMapId === mapId && !userInteractedSinceLoad) updateLikeButtonUI(0, false);
                return null;
            });
        mapLikesCache[mapId] = { resolved: false, promise };
    } else if (!mapLikesCache[mapId].resolved) {
        mapLikesCache[mapId].promise.then(data => {
            if (data && currentMapId === mapId) {
                initialLikeState = data.is_liked_by_user;
                if (!userInteractedSinceLoad) updateLikeButtonUI(data.likes_count, data.is_liked_by_user);
            }
        });
    }
}

likeBtn.addEventListener('click', () => {
    if (!currentMapId) return;

    userInteractedSinceLoad = true; 

    const newIsLiked = !isLikedByCurrentUser;
    const newCount = newIsLiked ? currentLikesCount + 1 : Math.max(0, currentLikesCount - 1);
    
    updateLikeButtonUI(newCount, newIsLiked);

    if (mapLikesCache[currentMapId]) {
        mapLikesCache[currentMapId] = { resolved: true, data: { likes_count: newCount, is_liked_by_user: newIsLiked } };
    }

    clearTimeout(likeDebounceTimer);
    const targetMapId = currentMapId;

    likeDebounceTimer = setTimeout(async () => {
        if (newIsLiked !== initialLikeState) {
            try {
                const response = await fetch('/api/likeMap', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ map_id: targetMapId, user_session_id: userSessionId })
                });
                
                if (!response.ok) throw new Error('서버 통신 에러');
                
                const data = await response.json();
                
                mapLikesCache[targetMapId] = { resolved: true, data };
                if (currentMapId === targetMapId) {
                    initialLikeState = data.is_liked_by_user;
                    updateLikeButtonUI(data.likes_count, data.is_liked_by_user);
                }
            } catch (error) {
                const rollbackLiked = !newIsLiked;
                const rollbackCount = rollbackLiked ? newCount + 1 : Math.max(0, newCount - 1);
                
                mapLikesCache[targetMapId] = { resolved: true, data: { likes_count: rollbackCount, is_liked_by_user: rollbackLiked } };
                if (currentMapId === targetMapId) {
                    initialLikeState = rollbackLiked;
                    updateLikeButtonUI(rollbackCount, rollbackLiked);
                }
            }
        }
    }, 600);
});

window.goToHeroPage = function(encodedHeroName) {
    const heroName = decodeURIComponent(encodedHeroName);
    const koreanName = heroNameEnKrMap[heroName] || heroName;
    
    if (heroName.includes('Sojourn')) {
        window.location.href = 'sojourn.html';
    } else if (heroName.includes('Tracer')) {
        window.location.href = 'tracer.html';
    } else if (heroName.includes('Echo')) {
        window.location.href = 'echo.html';
    } else {
        alert(`[${koreanName}] 영웅의 상세 분석 페이지는 준비 중입니다!`);
    }
};

const navEntries = performance.getEntriesByType("navigation");
const isReload = navEntries.length > 0 && navEntries[0].type === "reload";

if (isReload) {
    sessionStorage.removeItem('owMapMaster_role');
    sessionStorage.removeItem('owMapMaster_map');
}

if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
}

// 🌐 3. [완전 자동화 비동기 초기화 전용 함수]
async function initApp() {
    try {
        const response = await fetch('processed_mapData.json');
        if (!response.ok) throw new Error('데이터 파일을 불러오는 데 실패했습니다.');
        mapData = await response.json();

        // 👑 순서 패치: 데이터 적재 완료 후 맵 그리드를 그려야 오류가 안 터집니다!
        initMapGrid();

        // --- 🌍 전체 데이터 백그라운드 사전 로딩 (Global Prefetch) --- //
        function preloadAllMapLikes() {
            let delay = 0;
            mapCategories.forEach(category => {
                category.maps.forEach(mapId => {
                    const regBox = mapData[currentRegion] || mapData['asia'];
                    const tierBox = regBox ? (regBox[currentTier] || regBox['all']) : null;
                    if (!tierBox || !tierBox[mapId]) return; 
                    setTimeout(() => {
                        if (!mapLikesCache[mapId]) {
                            const promise = fetch(`/api/getMapLikes?mapId=${mapId}&user_session_id=${userSessionId}`, { cache: 'no-store' })
                                .then(res => res.ok ? res.json() : Promise.reject('Fetch Fail'))
                                .then(data => {
                                    mapLikesCache[mapId] = { resolved: true, data };
                                    if (currentMapId === mapId) {
                                        initialLikeState = data.is_liked_by_user;
                                        if (!userInteractedSinceLoad) updateLikeButtonUI(data.likes_count, data.is_liked_by_user);
                                    }
                                    return data;
                                })
                                .catch(() => { mapLikesCache[mapId] = null; return null; });
                            mapLikesCache[mapId] = { resolved: false, promise };
                        }
                    }, delay);
                    delay += 50; 
                });
            });
        }
        setTimeout(preloadAllMapLikes, 500); 

        const savedRole = sessionStorage.getItem('owMapMaster_role');
        const savedMap = sessionStorage.getItem('owMapMaster_map');

        if (savedRole) {
            const roleBtn = document.querySelector(`.role-item[data-role="${savedRole}"]`);
            if (roleBtn) {
                document.querySelectorAll('.role-item').forEach(b => b.classList.remove('selected'));
                roleBtn.classList.add('selected');
                currentRole = savedRole;
                step2Section.classList.remove('disabled');
            }
        }

        if (savedMap) {
            const mapBtn = document.querySelector(`.map-btn[data-map-id="${savedMap}"]`);
            if (mapBtn) {
                document.querySelectorAll('.map-btn').forEach(b => b.classList.remove('selected'));
                mapBtn.classList.add('selected');
                currentMapId = savedMap;
            }
        }

        if (currentRole && currentMapId) {
            renderResult({ scroll: false });
            setTimeout(() => resultBox.scrollIntoView({ behavior: 'auto', block: 'start' }), 10);
        } else if (currentRole) {
            setTimeout(() => step2Section.scrollIntoView({ behavior: 'auto', block: 'start' }), 10);
        } else {
            window.scrollTo(0, 0);
        }

    } catch (error) {
        console.error('초기화 중 오류 발생:', error);
        mapGrid.innerHTML = '<p style="text-align:center; color:#e74c3c;">맵 데이터를 불러오지 못했습니다.</p>';
    }
}

// 🚀 애플리케이션 시작!
initApp();