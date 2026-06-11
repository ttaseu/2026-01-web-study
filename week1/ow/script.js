// 범용적인 추천 영웅 템플릿
const defaultRoleData = {
    brawl: {
        tank: { heroes: ["라인하르트", "라마트라", "오리사"], synergy: ["루시우", "바티스트"], counter: "파라" },
        damage: { heroes: ["[서브딜] 메이", "[메인딜] 캐서디", "[메인딜] 리퍼"], synergy: ["라인하르트", "루시우"], counter: "위도우메이커" },
        support: { heroes: ["루시우", "바티스트", "모이라"], synergy: ["근접 탱커진"], counter: "솜브라" }
    },
    dive: {
        tank: { heroes: ["윈스턴", "D.Va", "둠피스트"], synergy: ["아나", "트레이서"], counter: "리퍼" },
        damage: { heroes: ["[서브딜] 트레이서", "[서브딜] 겐지", "[서브딜] 솜브라"], synergy: ["윈스턴", "젠야타"], counter: "브리기테" },
        support: { heroes: ["아나", "키리코", "브리기테"], synergy: ["다이브 탱커"], counter: "트레이서" }
    },
    poke: {
        tank: { heroes: ["시그마", "오리사"], synergy: ["바티스트", "위도우메이커"], counter: "윈스턴" },
        damage: { heroes: ["[메인딜] 위도우메이커", "[메인딜] 애쉬", "[메인딜] 소전"], synergy: ["시그마", "메르시"], counter: "솜브라" },
        support: { heroes: ["바티스트", "젠야타", "일리아리"], synergy: ["포킹 딜러진"], counter: "트레이서" }
    }
};

let mapData = {}; 

// DOM Elements
const mapGrid = document.getElementById('mapGrid');
const step2Section = document.getElementById('step2');
const roleButtons = document.querySelectorAll('.role-item');
const resultBox = document.getElementById('resultBox');
const resultTitle = document.getElementById('resultTitle');
const strategyList = document.getElementById('strategyList');
const roleDataContent = document.getElementById('roleDataContent');
const regionTabButtons = document.querySelectorAll('.ow-tab-btn');
const tierSelect = document.getElementById('tierSelect');

let currentMapId = null;
let currentRole = null;
let currentRegion = 'asia'; 
let currentTier = 'all';    

const mapCategories = [
    { id: 'control', name: '쟁탈', maps: ['ilios', 'lijiangTower', 'nepal', 'oasis', 'busan', 'samoa', 'antarcticPeninsula'] },
    { id: 'escort', name: '호위', maps: ['dorado', 'route66', 'gibraltar', 'havana', 'rialto', 'junkertown', 'circuitRoyal', 'shambali'] },
    { id: 'hybrid', name: '혼합', maps: ['kingsRow', 'numbani', 'hollywood', 'eichenwalde', 'blizzardWorld', 'midtown', 'paraiso'] },
    { id: 'push', name: '밀기', maps: ['colosseo', 'newQueenStreet', 'esperanca', 'runasapi'] },
    { id: 'flashpoint', name: '플래시포인트', maps: ['suravasa', 'newJunkCity', 'atlis'] }
];

const mapKoreanNamesFallback = {
    "ilios": "일리오스", "lijiangTower": "리장 타워", "nepal": "네팔", "oasis": "오아시스", "busan": "부산", "samoa": "사모아", "antarcticPeninsula": "남극 반도",
    "dorado": "도라도", "route66": "66번 국도", "gibraltar": "감시기지: 지브롤터", "havana": "하바나", "rialto": "리알토", "junkertown": "쓰레기촌", "circuitRoyal": "서킷 로얄", "shambali": "샴발리 수도원",
    "kingsRow": "왕의 길", "numbani": "눔바니", "hollywood": "할리우드", "eichenwalde": "아이헨발데", "blizzardWorld": "블리자드 월드", "midtown": "미드타운", "paraiso": "파라이수",
    "colosseo": "콜로세오", "newQueenStreet": "뉴 퀸 스트리트", "esperanca": "이스페란사", "runasapi": "루나사피",
    "suravasa": "수라바사", "newJunkCity": "뉴 정크 시티", "atlis": "아틀리스"
};

const modeStrategies = {
    control: ["[공통] 첫 한타 거점 선점 후 저지선 형성 중요", "[공통] 상대 카운터 궁극기 체크 필수"],
    escort: ["[공통] 구간마다 유기적인 영웅 스왑 운영 권장", "[공통] 경유지 통과 후 고지대 자리 선점 우선"],
    hybrid: ["[공통] A거점 돌파 후 화물 호위 지형지물 활용", "[공통] 공격 시 오프닝 픽을 위한 사이드 흔들기"],
    push: ["[공통] 로봇 리드 시 과감한 궁극기 투자로 이득 극대화", "[공통] 리스폰 관리 및 잘 지는 턴 넘기기 연습"],
    push: ["[공통] 로봇 리드 시 과감한 궁극기 투자로 이득 극대화", "[공통] 리스폰 관리 및 잘 지는 턴 넘기기 연습"],
    flashpoint: ["[공통] 거점 활성화 전 이동 동선 교전 전면 배제", "[공통] 점령 속도가 빠르므로 거점 밟기 포커싱"]
};

// 역할군 선택 이벤트
roleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        roleButtons.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        currentRole = btn.dataset.role;
        step2Section.classList.remove('disabled');
        if (currentMapId) renderResult();
    });
});

// 서버 선택 탭 이벤트
if (regionTabButtons.length > 0) {
    regionTabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            regionTabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            let selectedRegion = btn.dataset.region;
            if (selectedRegion === 'usa') selectedRegion = 'na';
            currentRegion = selectedRegion;
            initMapGrid();
            if (currentMapId) renderResult({ scroll: false });
        });
    });
}

// 티어 선택 이벤트
if (tierSelect) {
    tierSelect.addEventListener('change', (e) => {
        currentTier = e.target.value;
        initMapGrid();
        if (currentMapId) renderResult({ scroll: false }); 
    });
}

// 👑 안전하게 데이터를 꺼내오는 마스터 유틸 함수 (대소문자 완벽 대응)
function getTargetMapData(reg, tier, mapId) {
    const rKey = reg.toLowerCase();
    const tKey = tier.toLowerCase();
    
    const regBox = mapData[rKey] || mapData[rKey.toUpperCase()];
    if (!regBox) return null;
    
    const tierBox = regBox[tKey] || regBox[tKey.toUpperCase()];
    if (!tierBox) return null;
    
    return tierBox[mapId] || tierBox[mapId.toLowerCase()] || tierBox[mapId.toUpperCase()];
}

// 1. 맵 타일 그리드 렌더링
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
            const data = getTargetMapData(currentRegion, currentTier, mapId);

            const btn = document.createElement('button');
            btn.className = 'map-btn';
            btn.dataset.mapId = mapId;
            if (currentMapId === mapId) btn.classList.add('selected');
            
            // 👑 [맵 이름 한글화 버그 박멸] 데이터가 깨져있어도 사전에서 한글명을 칼같이 매칭!
            const fallbackName = mapKoreanNamesFallback[mapId] || mapId;
            const mapName = data && data.name ? (data.name.includes(' (') ? data.name.split(' (')[0] : data.name) : fallbackName; 

            const img = document.createElement('img');
            img.src = `images/${fallbackName}.webp`; 
            img.onerror = () => {
                img.src = `https://placehold.co/400x225/1E1E1E/FF5A36?text=${encodeURIComponent(mapName)}`;
            };
            img.alt = mapName;
            img.className = 'map-image';

            const overlay = document.createElement('div');
            overlay.className = 'map-overlay';
            overlay.innerHTML = `<div class="map-info"><span class="map-name">${mapName}</span><span class="map-sub-info">${category.name}</span></div>`;

            btn.appendChild(img);
            btn.appendChild(overlay);

            btn.addEventListener('click', () => {
                if (btn.classList.contains('selected')) {
                    btn.classList.remove('selected');
                    currentMapId = null;
                    resultBox.classList.add('hidden'); 
                } else {
                    document.querySelectorAll('.map-btn').forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                    currentMapId = mapId;
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
    return text.replace(/\[공통\]/g, '<span class="badge badge-common">🤝 공통</span>')
               .replace(/\[다이브\]/g, '<span class="badge badge-dive">☄️ 다이브</span>')
               .replace(/\[러쉬\]/g, '<span class="badge badge-rush">🏃 러쉬</span>')
               .replace(/\[포킹\]/g, '<span class="badge badge-poke">🏹 포킹</span>');
};

const heroNameEnKrMap = {
    "Ana": "아나", "Ashe": "애쉬", "Baptiste": "바티스트", "Bastion": "바스티온", "Brigitte": "브리기테",
    "Cassidy": "캐서디", "D.Va": "디바", "Domina": "도미나", "Doomfist": "둠피스트", "Echo": "에코",
    "Genji": "겐지", "Hanzo": "한조", "Illari": "일리아리", "Junker Queen": "정커퀸", "Junkrat": "정크랫",
    "Juno": "주노", "Kiriko": "키리코", "Lifeweaver": "라이프위버", "Lucio": "루시우", "Mauga": "마우가",
    "Mei": "메이", "Mercy": "메르시", "Moira": "모이라", "Orisa": "오리사", "Pharah": "파라",
    "Ramattra": "라마트라", "Reaper": "리퍼", "Reinhardt": "라인하르트", "Roadhog": "로드호그",
    "Sigma": "시그마", "Sojourn": "소전", "Soldier: 76": "솔저: 76", "Sombra": "솜브라",
    "Symmetra": "시메트라", "Torbjörn": "토르비욘", "Tracer": "트레이서", "Venture": "벤처",
    "Widowmaker": "위도우메이커", "Winston": "윈스턴", "Wrecking Ball": "레킹볼", "Zarya": "자리야", "Zenyatta": "젠야타"
};

// 2. 전략 및 추천 영웅 렌더링 함수
function renderResult(options = { scroll: true }) {
    if (!currentMapId || !currentRole) return;

    const data = getTargetMapData(currentRegion, currentTier, currentMapId);

    if (!data) {
        roleDataContent.innerHTML = '<p style="grid-column:1/-1; text-align:center; padding:20px;">공식 홈페이지 데이터를 연동 중입니다. 잠시만 기다려주세요!</p>';
        return;
    }

    const roleData = data.roles && data.roles[currentRole] ? data.roles[currentRole] : { heroes: [], synergy: [] };
    
    let currentCategory = '';
    mapCategories.forEach(cat => { if (cat.maps.includes(currentMapId)) currentCategory = cat.id; });

    const roleName = currentRole === 'tank' ? '돌격' : currentRole === 'damage' ? '공격' : '지원';
    const cleanMapName = data.name ? data.name.split(' (')[0] : mapKoreanNamesFallback[currentMapId];
    resultTitle.textContent = `${cleanMapName} - ${roleName} 메타`;

    const combinedStrategies = [...(data.strategy || []), ...(modeStrategies[currentCategory] || [])];
    strategyList.innerHTML = '';
    combinedStrategies.forEach(text => {
        const li = document.createElement('li');
        li.innerHTML = formatTextWithBadges(text);
        strategyList.appendChild(li);
    });

    const flatHeroesHtml = roleData.heroes.map((h, i) => {
        const pureName = h.split(' (')[0].trim();
        const statStr = h.includes(' (') ? h.split(' (')[1].replace(')', '') : '';
        const krName = heroNameEnKrMap[pureName] || pureName;
        return `<div style="display:flex; justify-content:space-between; background:rgba(255,255,255,0.03); padding:8px; border-radius:4px; margin-bottom:6px;">
            <span><strong>👑 ${i+1}위</strong> ${krName}</span>
            <span style="font-size:0.9em; color:#cbd5e1;">${statStr}</span>
        </div>`;
    }).join('');

    roleDataContent.innerHTML = `
        <div class="card"><h3>⭐ 추천 영웅 Top 5</h3><div style="margin-top:15px;">${flatHeroesHtml || '<p>통계 수집 중</p>'}</div></div>
        <div class="card"><h3>🤝 조합 시너지</h3><div style="margin-top:15px; color:#f99e1a;">${roleData.synergy ? roleData.synergy.join('<br>') : '추천 조합 연동 중'}</div></div>
    `;

    resultBox.classList.remove('hidden');
    if (options.scroll) {
        setTimeout(() => {
            resultBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }
}

async function initApp() {
    try {
        const response = await fetch('processed_mapData.json', { cache: 'no-store' });
        mapData = await response.json();
        initMapGrid();
    } catch (error) {
        console.error('초기화 장벽 에러:', error);
    }
}

initApp();