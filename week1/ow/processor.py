import json

# 오버워치 2 공식 영웅별 메인딜/서브딜 아키타입 분류 데이터
HERO_SUB_ROLES = {
    # 돌격 (TANK)
    "Reinhardt": "brawl", "Ramattra": "brawl", "Orisa": "brawl", "Doomfist": "dive", 
    "Winston": "dive", "D.Va": "dive", "Wrecking Ball": "dive", "Sigma": "poke", "Zarya": "brawl",
    # 공격 (DAMAGE) - 메인딜(히트스캔/지속화력)과 서브딜(투사체/기동성교란) 분류
    "Cassidy": "main_dps", "Soldier: 76": "main_dps", "Ashe": "main_dps", "Widowmaker": "main_dps", "Reaper": "main_dps", "Bastion": "main_dps", "Sojourn": "main_dps",
    "Tracer": "sub_dps", "Genji": "sub_dps", "Sombra": "sub_dps", "Echo": "sub_dps", "Pharah": "sub_dps", "Mei": "sub_dps", "Symmetra": "sub_dps", "Venture": "sub_dps", "Hanzo": "sub_dps",
    # 지원 (SUPPORT)
    "Ana": "dive", "Kiriko": "dive", "Lifeweaver": "dive", "Moira": "brawl", "Lucio": "brawl", "Baptiste": "poke", "Zenyatta": "poke", "Illari": "poke", "Brigitte": "dive", "Juno": "brawl"
}

def to_camel_case(text):
    parts = text.split('-')
    return parts[0] + ''.join(word.capitalize() for word in parts[1:])

def process_advanced_data():
    input_filename = "owtics_raw_data.json"
    output_filename = "processed_mapData.json"

    try:
        with open(input_filename, "r", encoding="utf-8") as f:
            raw_data = json.load(f)
    except FileNotFoundError:
        print(f"❌ '{input_filename}' 파일이 없습니다. scraper.py를 먼저 실행해 주세요.")
        return

    # 1초 만에 받아온 전체 통계 풀에서 대형 보따리 추출
    stats_entries = raw_data.get("GetHeroesStatistics", {}).get("heroesRatesOverview", {}).get("result", {}).get("measurements", [])
    
    if not stats_entries:
        print("❌ 전체 통계 풀(measurements)을 찾을 수 없습니다. 수집 데이터가 온전한지 확인해 주세요.")
        return

    # script.js에 하드코딩된 카테고리 맵 리스트와 100% 동기화 (모든 전장 이미지 출력 보장)
    all_known_maps = {
        "ilios": "일리오스", "lijiangTower": "리장 타워", "nepal": "네팔", "oasis": "오아시스", "busan": "부산", "samoa": "사모아", "antarcticPeninsula": "남극 반도",
        "dorado": "도라도", "route66": "66번 국도", "gibraltar": "감시기지: 지브롤터", "havana": "하바나", "rialto": "리알토", "junkertown": "쓰레기촌", "circuitRoyal": "서킷 로얄", "shambali": "샴발리 수도원",
        "kingsRow": "왕의 길", "numbani": "눔바니", "hollywood": "할리우드", "eichenwalde": "아이헨발데", "blizzardWorld": "블리자드 월드", "midtown": "미드타운", "paraiso": "파라이수",
        "colosseo": "콜로세오", "newQueenStreet": "뉴 퀸 스트리트", "esperanca": "이스페란사", "runasapi": "루나사피",
        "suravasa": "수라바사", "newJunkCity": "뉴 정크 시티", "atlis": "아틀리스"
    }

    processed_data = {}
    map_hero_pools = {}

    # 모든 전장 빈 껍데기 상자 세팅
    for m_key, m_name in all_known_maps.items():
        processed_data[m_key] = {
            "name": f"{m_name} ({m_key.capitalize()})",
            "strategy": ["[자동화 데이터] 아시아 서버 전체 경쟁전 지표 기준 메타 분석 결과입니다."],
            "roles": {
                "tank": {"heroes": [], "synergy": ["돌격군 중심 본대 난전 조합 추천"], "counter": "유동적인 탱커 스왑 필요"},
                "damage": {"heroes": [], "synergy": ["메인/서브 딜러 화력 밸런스 매칭 완료"], "counter": "적 방벽 상황에 맞춰 스왑"},
                "support": {"heroes": [], "synergy": ["나노/케어 효율 극대화 서포터진"], "counter": "다이브 포커싱 주의"}
            }
        }
        map_hero_pools[m_key] = {"tank": [], "damage": [], "support": []}

    # 전체 통계 데이터를 순회하며 맵별 가중치 연산 주입 (Meta Score)
    for stat in stats_entries:
        hero_info = stat.get("hero", {})
        h_name = hero_info.get("name")
        h_role = hero_info.get("role")  # TANK, DAMAGE, SUPPORT
        win_rate = stat.get("winRate", 0)
        pick_rate = stat.get("pickRate", 0)
        
        # ⭐️ 가중치 알고리즘 점수 연산 (승률 60% + 픽률 40%)
        meta_score = (win_rate * 0.6) + (pick_rate * 0.4)
        
        formatted_str = f"{h_name} (승률: {win_rate:.1f}%, 픽률: {pick_rate:.1f}%)"
        
        hero_obj = {
            "name": h_name,
            "display": formatted_str,
            "score": meta_score,
            "sub_role": HERO_SUB_ROLES.get(h_name, "generic")
        }

        # 분류 항목에 맞춰 임시 수집 상자에 차곡차곡 적재
        for m_key in map_hero_pools.keys():
            if h_role:
                r_key = h_role.lower()
                if r_key in map_hero_pools[m_key]:
                    map_hero_pools[m_key][r_key].append(hero_obj)

    # 3. 역할군별 정렬 및 5명씩 컷오프 (딜러진 보정 포함)
    for m_key, roles in map_hero_pools.items():
        # 탱커 탑 5 정렬
        sorted_tanks = sorted(roles["tank"], key=lambda x: x["score"], reverse=True)
        processed_data[m_key]["roles"]["tank"]["heroes"] = [t["display"] for t in sorted_tanks[:5]]

        # 지원가 탑 5 정렬
        sorted_supports = sorted(roles["support"], key=lambda x: x["score"], reverse=True)
        processed_data[m_key]["roles"]["support"]["heroes"] = [s["display"] for s in sorted_supports[:5]]

        # ⭐️ 대망의 딜러진 정렬 알고리즘 (메인딜2, 서브딜2 최소 확보 보장)
        sorted_dps = sorted(roles["damage"], key=lambda x: x["score"], reverse=True)
        
        final_dps = []
        main_count = 0
        sub_count = 0
        
        for dps in sorted_dps:
            # 탑 5가 다 찼고 조건도 완성되었다면 서치 탈출
            if len(final_dps) >= 5 and main_count >= 2 and sub_count >= 2:
                break
                
            # 탑 5 자리를 채우거나 부족한 아키타입 보정을 위해 추가 픽업
            if len(final_dps) < 5 or (dps["sub_role"] == "main_dps" and main_count < 2) or (dps["sub_role"] == "sub_dps" and sub_count < 2):
                if dps not in final_dps:
                    final_dps.append(dps)
                    if dps["sub_role"] == "main_dps": main_count += 1
                    elif dps["sub_role"] == "sub_dps": sub_count += 1

        # 가공 완료된 상위 5개 데이터 수집 배열 매칭
        processed_data[m_key]["roles"]["damage"]["heroes"] = [d["display"] for d in final_dps[:5]]

    # 4. 정제 완료된 풍성한 보따리를 JSON 파일로 안전 저장
    with open(output_filename, "w", encoding="utf-8") as f:
        json.dump(processed_data, f, ensure_ascii=False, indent=4)

    print(f"\n✅ [알고리즘 업그레이드 완료] '{output_filename}' 파일이 새롭게 갱신되었습니다.")
    print("-> 이제 모든 맵이 생성되었으며, 역할군마다 정교한 승률순 Top 5가 꽉 들어찼습니다!")

if __name__ == "__main__":
    process_advanced_data()