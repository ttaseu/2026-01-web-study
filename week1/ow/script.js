const mapData = {
    kingsRow: {
        name: "왕의 길 (King's Row)",
        strategy: "좁은 골목과 우회로가 많은 하이브리드 맵입니다. 1거점에서는 공격팀이 고지대를 선점하는 것이 중요하며, 화물 운송 구간에서는 좁은 길목에서 난전이 자주 일어납니다.",
        comp: "러쉬(Brawl) 조합 / 2방벽 조합",
        heroes: ["라인하르트", "자리야", "메이", "루시우", "바티스트"]
    },
    // --- 쟁탈 (Control) ---
    ilios: {
        name: "일리오스 (Ilios)",
        strategy: "등대, 우물, 폐허 세 가지 거점으로 이루어진 쟁탈 맵입니다. 낙사 구간이 많아 넉백 스킬을 가진 영웅이 유리하며, 폐허에서는 시야가 넓어 스나이퍼가 활약하기 좋습니다.",
        comp: "다이브(Dive) 조합 / 포킹(Poke) 조합(폐허 한정)",
        strategy: "등대, 우물, 폐허 거점으로 이루어진 쟁탈 맵입니다. 낙사 구간이 많아 넉백 스킬을 가진 영웅이 유리하며, 폐허에서는 스나이퍼가 활약하기 좋습니다.",
        comp: "다이브 조합 / 포킹 조합(폐허)",
        heroes: ["윈스턴", "루시우", "로드호그", "파라", "위도우메이커"]
    },
    lijiangTower: {
        name: "리장 타워 (Lijiang Tower)",
        strategy: "거점 주변으로 낙사 구간이 많고 실내 난전이 자주 일어납니다. 광역 기술이나 근접 교전에 강한 영웅이 힘을 씁니다.",
        comp: "러쉬 조합",
        heroes: ["시메트라", "루시우", "윈스턴", "메이", "리퍼"]
    },
    nepal: {
        name: "네팔 (Nepal)",
        strategy: "마을과 제단은 고지대와 실내 교전이, 성소는 중앙 거점을 둔 치열한 난전이 핵심입니다.",
        comp: "러쉬 조합 / 다이브 조합",
        heroes: ["라인하르트", "루시우", "모이라", "윈스턴", "트레이서"]
    },
    oasis: {
        name: "오아시스 (Oasis)",
        strategy: "도약 패드 등 기동성을 살릴 수 있는 지형과 우회로가 많습니다. 다이브 조합을 활용해 상대를 흔드는 것이 좋습니다.",
        comp: "다이브 조합",
        heroes: ["윈스턴", "파라", "메르시", "트레이서", "아나"]
    },
    busan: {
        name: "부산 (Busan)",
        strategy: "사찰, 시내, 메카 기지 각각 고지대와 넓은 개활지 특징이 뚜렷해 라운드별 유연한 픽 변경이 필요합니다.",
        comp: "다이브 조합 / 포킹 조합",
        heroes: ["D.Va", "에코", "위도우메이커", "바티스트", "아나"]
    },
    antarcticPeninsula: {
        name: "남극 반도 (Antarctic Peninsula)",
        strategy: "진입로가 제한적이며 좁은 지역에서 격렬한 난전이 벌어집니다. 유지력이 좋은 근접 교전 조합이 강세입니다.",
        comp: "러쉬 조합",
        heroes: ["라인하르트", "메이", "바티스트", "루시우", "리퍼"]
    },
    samoa: {
        name: "사모아 (Samoa)",
        strategy: "수직적인 구조와 낙사 지형이 혼합되어 있어, 고지대를 장악할 수 있는 기동성 높은 영웅이 유리합니다.",
        comp: "다이브 조합",
        heroes: ["윈스턴", "루시우", "둠피스트", "소전", "키리코"]
    },

    // --- 호위 (Escort) ---
    dorado: {
        name: "도라도 (Dorado)",
        strategy: "고지대가 매우 중요한 호위 맵입니다. 특히 2경유지 구간은 수비팀이 고지대를 잡고 포킹하기 매우 좋으므로, 기동성이 뛰어난 영웅들로 고지대를 걷어내는 것이 핵심입니다.",
        comp: "다이브(Dive) 조합 / 포킹(Poke) 조합",
        strategy: "고지대가 매우 중요한 맵입니다. 2경유지는 수비팀이 고지대를 잡고 포킹하기 좋으므로, 기동성 영웅들로 걷어내는 것이 핵심입니다.",
        comp: "다이브 조합 / 포킹 조합",
        heroes: ["윈스턴", "D.Va", "겐지", "트레이서", "아나"]
    },
    route66: {
        name: "66번 국도 (Route 66)",
        strategy: "1거점 주유소 지붕 등 고지대 장악이 중요하며, 3거점은 좁은 실내에서 난전이 일어납니다.",
        comp: "다이브 조합 / 포킹 조합",
        heroes: ["윈스턴", "애쉬", "아나", "트레이서", "키리코"]
    },
    gibraltar: {
        name: "감시기지: 지브롤터 (Gibraltar)",
        strategy: "수직 기동성이 절대적으로 중요한 맵으로, 고지대를 지속적으로 장악하고 이동할 수 있는 조합이 필수적입니다.",
        comp: "다이브 조합",
        heroes: ["윈스턴", "D.Va", "겐지", "트레이서", "아나"]
    },
    havana: {
        name: "아바나 (Havana)",
        strategy: "탁 트인 1거점과 3거점의 엄청난 직선 시야 때문에 스나이퍼의 기량이 게임을 크게 좌우합니다.",
        comp: "포킹 조합",
        heroes: ["위도우메이커", "시그마", "한조", "바티스트", "젠야타"]
    },
    rialto: {
        name: "리알토 (Rialto)",
        strategy: "다리 주변 낙사 구간이 있고, 긴 골목과 고지대를 통한 수비측의 화력망(포킹)이 매우 매섭습니다.",
        comp: "포킹 조합 / 다이브 조합",
        heroes: ["시그마", "위도우메이커", "로드호그", "아나", "바티스트"]
    },
    junkertown: {
        name: "쓰레기촌 (Junkertown)",
        strategy: "1거점의 넓은 개활지에서 장거리 교전이 주를 이루며, 3거점은 구조물이 많아 근접 교전이 빈번합니다.",
        comp: "포킹 조합",
        heroes: ["위도우메이커", "시그마", "애쉬", "바티스트", "젠야타"]
    },
    circuitRoyal: {
        name: "서킷 로얄 (Circuit Royal)",
        strategy: "긴 일직선 오르막길 위주의 맵으로, 단단한 방벽 영웅과 장거리 저격 영웅의 조합이 가장 강력합니다.",
        comp: "포킹 조합",
        heroes: ["시그마", "위도우메이커", "바티스트", "젠야타", "애쉬"]
    },
    shambali: {
        name: "샴발리 수도원 (Shambali Monastery)",
        strategy: "오르막길과 굴곡진 코너가 많아 수비팀이 고지대를 끼고 쉴 새 없이 스팸(Spam) 딜을 넣기 좋습니다.",
        comp: "포킹 조합 / 러쉬 조합",
        heroes: ["시그마", "라마트라", "소전", "바티스트", "아나"]
    },

    // --- 혼합 (Hybrid) ---
    kingsRow: {
        name: "왕의 길 (King's Row)",
        strategy: "좁은 골목과 우회로가 많은 맵입니다. 화물 구간의 좁은 길목에서 정면 힘싸움과 난전이 자주 일어납니다.",
        comp: "러쉬 조합",
        heroes: ["라인하르트", "자리야", "메이", "루시우", "바티스트"]
    },
    numbani: {
        name: "눔바니 (Numbani)",
        strategy: "1거점 수비 시 고지대 선점이 절대적이며, 기동성이 뛰어난 다이브 조합으로 고지대를 무너뜨려야 합니다.",
        comp: "다이브 조합",
        heroes: ["윈스턴", "D.Va", "겐지", "트레이서", "아나"]
    },
    hollywood: {
        name: "할리우드 (Hollywood)",
        strategy: "엘리베이터가 있는 고지대 장악과 2거점 서부 시대 세트장의 좁은 골목 교전이 특징인 맵입니다.",
        comp: "다이브 조합 / 러쉬 조합",
        heroes: ["윈스턴", "자리야", "에코", "트레이서", "아나"]
    },
    eichenwalde: {
        name: "아이헨발데 (Eichenwalde)",
        strategy: "1거점 성문 앞의 좁은 초크포인트를 뚫는 것이 관건이며, 화물 구간 다리에서는 낙사 스킬이 유용합니다.",
        comp: "러쉬 조합 / 다이브 조합",
        heroes: ["라인하르트", "파라", "메르시", "루시우", "윈스턴"]
    },
    blizzardWorld: {
        name: "블리자드 월드 (Blizzard World)",
        strategy: "1거점은 우회로를 통한 찌르기가 유효하고, 2거점 이후로는 긴 시야를 활용한 포킹 및 장거리 화력전이 중요합니다.",
        comp: "다이브 조합 / 포킹 조합",
        heroes: ["윈스턴", "애쉬", "아나", "트레이서", "키리코"]
    },
    midtown: {
        name: "미드타운 (Midtown)",
        strategy: "기차역의 좁은 입구와 소방서 고지대 교전이 중요하며, 화물 밀기 구간에서는 다리 밑 난전이 벌어집니다.",
        comp: "러쉬 조합",
        heroes: ["라인하르트", "루시우", "메이", "윈스턴", "소전"]
    },
    paraiso: {
        name: "파라이소 (Paraíso)",
        strategy: "고지대가 맵 전체에 분포해 있고 우회로가 많아 기동성 중심의 영웅들이 지형을 누비며 싸우기 좋습니다.",
        comp: "다이브 조합",
        heroes: ["윈스턴", "루시우", "에코", "트레이서", "아나"]
    },

    // --- 밀기 (Push) ---
    colosseo: {
        name: "콜로세오 (Colosseo)",
        strategy: "일직선 형태의 긴 대로와 회랑에서의 눈치 싸움이 치열하며, 튼튼한 유지력과 원거리 견제력이 필요합니다.",
        comp: "러쉬 조합 / 포킹 조합",
        heroes: ["라마트라", "시그마", "소전", "루시우", "바티스트"]
    },
    newQueenStreet: {
        name: "뉴 퀸 스트리트 (New Queen Street)",
        strategy: "맵이 곡선 형태이며, 건물 내부와 샛길을 통한 끊임없는 측면 공격(Flanking)이 요구됩니다.",
        comp: "다이브 조합 / 러쉬 조합",
        heroes: ["윈스턴", "트레이서", "루시우", "소전", "라마트라"]
    },
    esperanca: {
        name: "에스페란사 (Esperança)",
        strategy: "고지대와 시야가 트인 곳이 많아 기동성과 중장거리 교전 능력을 모두 갖춘 템포 조합이 유리합니다.",
        comp: "다이브 조합 / 템포 조합",
        heroes: ["윈스턴", "트레이서", "소전", "아나", "브리기테"]
    },
    runasapi: {
        name: "루나사피 (Runasapi)",
        strategy: "좁은 골목과 태양석 기둥을 끼고 도는 템포 빠른 난전이 특징이며 합류 속도가 매우 중요합니다.",
        comp: "러쉬 조합",
        heroes: ["라인하르트", "메이", "바티스트", "루시우", "리퍼"]
    },

    // --- 플래시포인트 & 격돌 (Flashpoint / Clash) ---
    suravasa: {
        name: "수라바사 (Suravasa)",
        strategy: "거점 간 거리가 가깝고 우회로가 매우 많아 소규모 난전과 기동성 위주의 조합이 유리합니다.",
        comp: "다이브 조합",
        heroes: ["루시우", "윈스턴", "트레이서", "모이라", "솜브라"]
    },
    newJunkCity: {
        name: "뉴 정크 시티 (New Junk City)",
        strategy: "맵이 매우 넓어 빠른 이동이 필수이며, 개활지 싸움보다 거점 내부에서의 합류 및 진형 싸움이 핵심입니다.",
        comp: "다이브 조합",
        heroes: ["루시우", "윈스턴", "트레이서", "겐지", "아나"]
    },
    hanaoka: {
        name: "하나오카 (Hanaoka)",
        strategy: "직선적인 중앙 힘싸움과 측면 찌르기가 동시에 일어나며, 방벽과 유지력을 바탕으로 거점을 사수해야 합니다.",
        comp: "러쉬 조합",
        heroes: ["라인하르트", "라마트라", "메이", "루시우", "바티스트"]
    },
    anubis: {
        name: "아누비스의 왕좌 (Throne of Anubis)",
        strategy: "거점 주변 은폐물과 좁은 통로가 많아 근접 난전이 강제되며, 폭발적인 딜을 넣는 영웅이 좋습니다.",
        comp: "러쉬 조합",
        heroes: ["윈스턴", "라인하르트", "벤처", "루시우", "모이라"]
    }
};

const mapSelect = document.getElementById('mapSelect');
const searchBtn = document.getElementById('searchBtn');
const resultBox = document.getElementById('resultBox');
const mapTitle = document.getElementById('mapTitle');
const strategyText = document.getElementById('strategyText');
const compText = document.getElementById('compText');
const heroList = document.getElementById('heroList');

searchBtn.addEventListener('click', () => {
    const selectedMap = mapSelect.value;
    
    if (!selectedMap) {
        alert('맵을 먼저 선택해주세요!');
        return;
    }

    const data = mapData[selectedMap];
    
    mapTitle.textContent = data.name;
    strategyText.textContent = data.strategy;
    compText.textContent = data.comp;
    
    // 이전 영웅 리스트를 지우고 새로 추가
    heroList.innerHTML = '';
    data.heroes.forEach(hero => {
        const li = document.createElement('li');
        li.textContent = hero;
        heroList.appendChild(li);
    });

    // 숨겨져 있던 결과 창을 보여줍니다.
    resultBox.classList.remove('hidden');
});