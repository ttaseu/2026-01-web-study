const mapData = {
    kingsRow: {
        name: "왕의 길 (King's Row)",
        strategy: "좁은 골목과 우회로가 많은 하이브리드 맵입니다. 1거점에서는 공격팀이 고지대를 선점하는 것이 중요하며, 화물 운송 구간에서는 좁은 길목에서 난전이 자주 일어납니다.",
        comp: "러쉬(Brawl) 조합 / 2방벽 조합",
        heroes: ["라인하르트", "자리야", "메이", "루시우", "바티스트"]
    },
    ilios: {
        name: "일리오스 (Ilios)",
        strategy: "등대, 우물, 폐허 세 가지 거점으로 이루어진 쟁탈 맵입니다. 낙사 구간이 많아 넉백 스킬을 가진 영웅이 유리하며, 폐허에서는 시야가 넓어 스나이퍼가 활약하기 좋습니다.",
        comp: "다이브(Dive) 조합 / 포킹(Poke) 조합(폐허 한정)",
        heroes: ["윈스턴", "루시우", "로드호그", "파라", "위도우메이커"]
    },
    dorado: {
        name: "도라도 (Dorado)",
        strategy: "고지대가 매우 중요한 호위 맵입니다. 특히 2경유지 구간은 수비팀이 고지대를 잡고 포킹하기 매우 좋으므로, 기동성이 뛰어난 영웅들로 고지대를 걷어내는 것이 핵심입니다.",
        comp: "다이브(Dive) 조합 / 포킹(Poke) 조합",
        heroes: ["윈스턴", "D.Va", "겐지", "트레이서", "아나"]
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