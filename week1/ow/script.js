// 범용적인 추천 영웅 템플릿
const defaultRoleData = {
    brawl: {
        tank: { heroes: ["라인하르트", "라마트라", "오리사"], synergy: ["루시우", "바티스트"], counter: "파라 (대처: 방벽으로 버티며 히트스캔 딜러의 포커싱 유도)" },
        damage: { heroes: ["메이", "캐서디", "리퍼"], synergy: ["라인하르트", "루시우"], counter: "위도우메이커 (대처: 사각지대 활용 및 빙벽/방벽으로 시야 차단)" },
        support: { heroes: ["루시우", "바티스트", "모이라"], synergy: ["근접 탱커진"], counter: "솜브라 (대처: 힐러끼리 뭉쳐서 해킹 및 핑 대비)" }
    },
    dive: {
        tank: { heroes: ["윈스턴", "D.Va", "둠피스트"], synergy: ["아나", "트레이서"], counter: "리퍼, 바스티온 (대처: 상대 쿨타임이 빠진 후 진입하거나 방어 매트릭스 활용)" },
        damage: { heroes: ["트레이서", "겐지", "솜브라"], synergy: ["윈스턴", "젠야타"], counter: "브리기테, 토르비욘 (대처: 포탑을 먼저 철거하거나 브리기테를 피해 우회 공격)" },
        support: { heroes: ["아나", "키리코", "브리기테"], synergy: ["다이브 탱커"], counter: "트레이서, 솜브라 (대처: 수면총 등 CC기를 아끼고 브리기테로 아나 보호)" }
    },
    poke: {
        tank: { heroes: ["시그마", "오리사"], synergy: ["바티스트", "위도우메이커"], counter: "윈스턴, 둠피스트 (대처: 거리를 벌리고 진입하는 적을 강착 등으로 밀어내기)" },
        damage: { heroes: ["위도우메이커", "애쉬", "소전"], synergy: ["시그마", "메르시"], counter: "솜브라, 겐지 (대처: 고지대 변경 및 아군 힐러 시야 안에서 교전)" },
        support: { heroes: ["바티스트", "젠야타", "일리아리"], synergy: ["포킹 딜러진"], counter: "트레이서, 윈스턴 (대처: 젠야타 부조화 포커싱 혹은 불사 장치로 턴 넘기기)" }
    }
};

const mapData = {
    // --- 혼합 (Hybrid) ---
    kingsRow: { name: "왕의 길 (King's Row)", strategy: ["1거점: 동상 주변 고지대 장악 및 초크포인트 압박", "2거점: 좁은 골목(ㄱ자 구간)에서 화력을 집중하는 난전 유도", "3거점: 실내 코너를 낀 근접 교전 및 궁극기 연계가 핵심"], roles: defaultRoleData.brawl },
    numbani: { name: "눔바니 (Numbani)", strategy: ["1거점: 수비 시 고지대 선점이 절대적, 공격은 다이브로 무너뜨려야 함", "2거점: 넓은 2층 지형을 활용한 포지셔닝 대결", "3거점: 좁은 실내 진입로에서의 소모전"], roles: defaultRoleData.dive },
    hollywood: { name: "할리우드 (Hollywood)", strategy: ["1거점: 엘리베이터 고지대 장악과 정면 방벽 싸움", "2거점: 서부 시대 세트장의 좁은 골목 교전 및 지붕 위 저격 조심", "3거점: 실내 개활지에서의 빠른 합류전"], roles: defaultRoleData.dive },
    eichenwalde: { name: "아이헨발데 (Eichenwalde)", strategy: ["1거점: 성문 앞 좁은 초크포인트를 뚫는 기동성 필요", "2거점: 성 다리 위 낙사 스킬 활용 및 성벽 고지대 차지", "3거점: 성 내부 좁은 통로를 뚫기 위한 러쉬 조합 강세"], roles: defaultRoleData.brawl },
    blizzardWorld: { name: "블리자드 월드 (Blizzard World)", strategy: ["1거점: 우회로를 통한 측면 찌르기 및 동상 뒤 은폐", "2거점: 실외 긴 시야를 활용한 포킹과 고지대 싸움", "3거점: 실내 기둥을 낀 난전"], roles: defaultRoleData.poke },
    midtown: { name: "미드타운 (Midtown)", strategy: ["1거점: 소방서 고지대 교전 및 기차역 입구 돌파", "2거점: 기차역 내부 및 다리 밑 난전", "3거점: 중앙 터미널의 개방된 공간 힘싸움"], roles: defaultRoleData.brawl },
    paraiso: { name: "파라이수 (Paraíso)", strategy: ["1거점: 해변가 및 건물 위 고지대 기동전", "2거점: 우회로가 많은 클럽 내부 교전", "3거점: 나선형 오르막길에서의 끈질긴 화물 비비기"], roles: defaultRoleData.dive },

    // --- 쟁탈 (Control) ---
    ilios: { name: "일리오스 (Ilios)", strategy: ["등대: 낙사 구간을 활용한 넉백 스킬 요주의", "우물: 거점 중앙 우물 낙사 유도 및 당기기 조심", "폐허: 시야가 매우 넓어 스나이퍼 포지셔닝이 승패 좌우"], roles: defaultRoleData.dive },
    lijiangTower: { name: "리장 타워 (Lijiang Tower)", strategy: ["야시장: 거점 밖 낙사 구간과 실내 난전 대비", "정원: 다리를 건널 때 넉백 스킬 주의 및 중앙 점령전", "관제탑: 거점 안 넓은 공간에서 광역 기술 연계"], roles: defaultRoleData.brawl },
    nepal: { name: "네팔 (Nepal)", strategy: ["마을: 고지대 확보 및 좁은 입구 돌파", "제단: 중앙 거점 난전과 외곽 우회로 활용", "성소: 지하 및 거점 주변 벽을 활용한 치열한 난전"], roles: defaultRoleData.brawl },
    oasis: { name: "오아시스 (Oasis)", strategy: ["도심: 도약 패드를 이용한 기동전 및 2층 장악", "정원: 고지대 통로와 측면 공격로 활용", "대학교: 지하 통로를 통한 기습과 거점 중앙 난전"], roles: defaultRoleData.dive },
    busan: { name: "부산 (Busan)", strategy: ["사찰: 거점 밖 고지대 장악", "시내: 개활지 교전 및 엄폐물 활용 (포킹)", "메카 기지: 올라가는 벽을 활용한 수직 기동전"], roles: defaultRoleData.poke },
    samoa: { name: "사모아 (Samoa)", strategy: ["해변: 낙사 지형 혼합 및 고지대 기동성 중요", "도심: 좁은 실내 거점 난전", "화산: 수직적 구조물을 낀 다이브 교전"], roles: defaultRoleData.dive },

    // --- 호위 (Escort) ---
    dorado: { name: "도라도 (Dorado)", strategy: ["1거점: 다리 위 고지대를 장악한 수비 뚫기", "2거점: 은행 지붕 등 고지대 다이브 및 걷어내기 필수", "3거점: 실내 오르막길에서의 화력 집중"], roles: defaultRoleData.dive },
    route66: { name: "66번 국도 (Route 66)", strategy: ["1거점: 주유소 지붕 고지대 장악이 중요", "2거점: 곡선 도로를 따라가는 화물 템포 싸움", "3거점: 좁은 실내(데드락 기지)에서의 난전"], roles: defaultRoleData.poke },
    gibraltar: { name: "감시기지: 지브롤터 (Gibraltar)", imageName: "감시 기지- 지브롤터", strategy: ["1거점: 서버실 위 2층 수직 기동전", "2거점: 우주선 위 고지대 차지 및 다이브 필수", "3거점: 마지막 코너에서의 유지력 싸움"], roles: defaultRoleData.dive },
    havana: { name: "하바나 (Havana)", strategy: ["1거점: 탁 트인 도로의 스나이퍼 견제 필수", "2거점: 양조장 내부 좁은 통로 화력전", "3거점: 성벽을 낀 엄청난 직선 시야 스나이퍼 대결"], roles: defaultRoleData.poke },
    rialto: { name: "리알토 (Rialto)", strategy: ["1거점: 수로 다리 주변 낙사 요주의", "2거점: 긴 골목과 고지대를 통한 수비측 화력망 돌파", "3거점: 실내로 진입하는 코너 수비 뚫기"], roles: defaultRoleData.poke },
    junkertown: { name: "쓰레기촌 (Junkertown)", strategy: ["1거점: 넓은 개활지에서 장거리 저격 교전", "2거점: 시야가 제한된 마을 내부 측면 공격", "3거점: 돌아가는 프로펠러 기믹 및 실내 난전"], roles: defaultRoleData.poke },
    circuitRoyal: { name: "서킷 로얄 (Circuit Royal)", strategy: ["1거점: 가파른 오르막길을 뚫는 방벽 힘싸움", "2거점: 넓은 2층 테라스에서의 포킹", "3거점: 실내 U자형 코너 저격전"], roles: defaultRoleData.poke },
    shambali: { name: "샴발리 수도원 (Shambali Monastery)", strategy: ["1거점: 오르막길을 수비하는 상대의 스팸(Spam) 딜 버티기", "2거점: 동굴 안팎을 넘나드는 곡선 난전", "3거점: 좁은 실내로 몰아넣는 러쉬 싸움"], roles: defaultRoleData.brawl },

    // --- 밀기 (Push) ---
    colosseo: { name: "콜로세오 (Colosseo)", strategy: ["초반: 긴 대로 회랑에서의 눈치 싸움 및 기둥 엄폐", "중반: 상대 진영으로 넘어가는 다리 굴다리 교전", "후반: 좁은 스폰 앞 일직선 화력 집중"], roles: defaultRoleData.poke },
    newQueenStreet: { name: "뉴 퀸 스트리트 (New Queen Street)", strategy: ["초반: 맵 중앙 샛길을 통한 끊임없는 측면 찌르기", "중반: 곡선 형태 도로에서의 양각 피하기", "후반: 상점 내부를 통한 우회 기습 차단"], roles: defaultRoleData.brawl },
    esperanca: { name: "이스페란사 (Esperança)", strategy: ["초반: 중앙 탑 고지대와 시야 트인 곳 포킹전", "중반: 벽을 낀 기동성 높은 템포 교전", "후반: 좁아지는 스폰 지역 앞 난전"], roles: defaultRoleData.dive },
    runasapi: { name: "루나사피 (Runasapi)", strategy: ["초반: 중앙 태양석 기둥을 끼고 도는 빠른 난전", "중반: 좁은 골목과 오르막길 지형 활용", "후반: 스폰 합류 속도 차이를 이용한 압박"], roles: defaultRoleData.brawl },

    // --- 플래시포인트 & 격돌 (Flashpoint / Clash) ---
    suravasa: { name: "수라바사 (Suravasa)", strategy: ["공통: 거점 간 우회로가 많아 소규모 난전 잦음", "포인트: 빠른 기동력으로 거점 먼저 밟기", "교전: 좁은 입구를 통제하는 진형 구축"], roles: defaultRoleData.dive },
    newJunkCity: { name: "뉴 정크 시티 (New Junk City)", strategy: ["공통: 맵이 매우 넓어 루시우 등 이속 버프 필수", "포인트: 투기장 내부 합류 및 진형 싸움 집중", "교전: 고지대 층간 수직 기동성 활용"], roles: defaultRoleData.dive },
    atlis: { name: "아틀리스 (Atlis)", strategy: ["공통: 플래시포인트 특유의 넓은 전장과 거점 간 빠른 이동 필요", "포인트: 거점 주변의 엄폐물과 고지대 장악", "교전: 난전 중 합류 속도와 유지력 싸움"], roles: defaultRoleData.brawl }
};

// DOM Elements
const mapGrid = document.getElementById('mapGrid');
const step2Section = document.getElementById('step2');
const roleButtons = document.querySelectorAll('.role-btn');
const resultBox = document.getElementById('resultBox');
const resultTitle = document.getElementById('resultTitle');
const strategyList = document.getElementById('strategyList');
const roleDataContent = document.getElementById('roleDataContent');

// State Variables
let currentMapId = null;
let currentRole = null;

// 맵 카테고리 정의
const mapCategories = [
    { id: 'control', name: '쟁탈 [ Control ]', maps: ['ilios', 'lijiangTower', 'nepal', 'oasis', 'busan', 'samoa'] },
    { id: 'escort', name: '호위 [ Escort ]', maps: ['dorado', 'route66', 'gibraltar', 'havana', 'rialto', 'junkertown', 'circuitRoyal', 'shambali'] },
    { id: 'hybrid', name: '혼합 [ Hybrid ]', maps: ['kingsRow', 'numbani', 'hollywood', 'eichenwalde', 'blizzardWorld', 'midtown', 'paraiso'] },
    { id: 'push', name: '밀기 [ Push ]', maps: ['colosseo', 'newQueenStreet', 'esperanca', 'runasapi'] },
    { id: 'flashpoint', name: '플래시포인트 [ Flashpoint ]', maps: ['suravasa', 'newJunkCity', 'atlis'] }
];

// 1. 맵 타일 렌더링
function initMapGrid() {
    mapGrid.innerHTML = '';

    mapCategories.forEach(category => {
        // 카테고리별 영역 생성
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'map-category';

        // 타이틀 생성
        const title = document.createElement('div');
        title.className = 'map-category-title';
        title.textContent = category.name;
        categoryDiv.appendChild(title);

        // 맵 버튼들을 담을 그리드 생성
        const gridDiv = document.createElement('div');
        gridDiv.className = 'map-grid';

        category.maps.forEach(mapId => {
            const data = mapData[mapId];
            if (!data) return;

            const btn = document.createElement('button');
            btn.className = 'map-btn';
            btn.dataset.mapId = mapId;
            
            const mapName = data.name.split(' (')[0]; // 한글 이름
            const mapNameEng = data.name.split('(')[1].replace(')', ''); // 임시 이미지를 위한 영어 이름 추출
            const mapImageName = data.imageName || mapName; // 커스텀 파일명이 있으면 사용, 없으면 기본 이름
            
            // 로컬 images 폴더의 맵 이미지 연결
            const img = document.createElement('img');
            img.src = `images/${mapImageName}.webp`; // 예: images/감시 기지- 지브롤터.webp
            
            // 만약 해당 이름의 이미지가 없거나 못 불러올 경우 대비 (안전장치)
            img.onerror = () => {
                img.src = `https://placehold.co/150x100/28323f/f99e1a?text=${encodeURIComponent(mapNameEng)}`;
            };
            img.alt = mapName;
            img.className = 'map-image';

            // 맵 이름 텍스트 생성
            const nameSpan = document.createElement('span');
            nameSpan.className = 'map-name';
            nameSpan.textContent = mapName;

            btn.appendChild(img);
            btn.appendChild(nameSpan);

            btn.addEventListener('click', () => {
                document.querySelectorAll('.map-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                currentMapId = mapId;
                
                step2Section.classList.remove('disabled');
                
                if (currentRole) renderResult();
            });
            
            gridDiv.appendChild(btn);
        });

        categoryDiv.appendChild(gridDiv);
        mapGrid.appendChild(categoryDiv);
    });
}

// 2. 역할군 버튼 이벤트 연결
roleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        currentRole = btn.dataset.role;
        
        // 맵과 역할이 모두 선택되었다면 결과창 표시
        if (currentMapId && currentRole) {
            renderResult();
        }
    });
});

// 3. 결과창 렌더링
function renderResult() {
    if (!currentMapId || !currentRole) return;

    const data = mapData[currentMapId];
    const roleData = data.roles[currentRole];

    // 제목 업데이트
    const roleName = currentRole === 'tank' ? '돌격' : currentRole === 'damage' ? '공격' : '지원';
    resultTitle.textContent = `${data.name} - ${roleName} 전략`;

    // 거점별 핵심 전략 리스트
    strategyList.innerHTML = '';
    data.strategy.forEach(text => {
        const li = document.createElement('li');
        li.textContent = text;
        strategyList.appendChild(li);
    });

    // 역할군 데이터 (추천 영웅, 시너지, 카운터) 카드 생성
    roleDataContent.innerHTML = `
        <div class="card">
            <h3>⭐ 추천 영웅</h3>
            <p><strong>${roleData.heroes.join(', ')}</strong></p>
            <p style="font-size:0.9em; color:#e0e6ed;">현재 맵 지형에 가장 유리한 픽입니다.</p>
        </div>
        <div class="card">
            <h3>🤝 시너지 픽</h3>
            <p><strong>${roleData.synergy.join(', ')}</strong></p>
            <p style="font-size:0.9em; color:#e0e6ed;">함께 기용하면 찰떡궁합인 영웅입니다.</p>
        </div>
        <div class="card">
            <h3>⚠️ 카운터 주의</h3>
            <p style="color: #f75555; font-weight: bold;">${roleData.counter.split(' (')[0]}</p>
            <p style="font-size:0.9em; color:#e0e6ed;">${roleData.counter.substring(roleData.counter.indexOf('(')).replace(/[\(\)]/g, '')}</p>
        </div>
    `;

    // 결과창 보이기 및 부드러운 스크롤
    resultBox.classList.remove('hidden');
    resultBox.scrollIntoView({ behavior: 'smooth' });
}

// 초기화 실행
initMapGrid();