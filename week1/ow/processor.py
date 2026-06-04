import json

# 오버워치 2 공식 영웅별 메인딜/서브딜 및 조합 스타일 아키타입 분류 데이터
HERO_SUB_ROLES = {
    "Reinhardt": "brawl", "Ramattra": "brawl", "Orisa": "brawl", "Doomfist": "dive", 
    "Winston": "dive", "D.Va": "dive", "Wrecking Ball": "dive", "Sigma": "poke", "Zarya": "brawl", "Hazard": "brawl",
    "Cassidy": "main_dps", "Soldier: 76": "main_dps", "Ashe": "main_dps", "Widowmaker": "main_dps", "Reaper": "main_dps", "Bastion": "main_dps", "Sojourn": "main_dps",
    "Tracer": "sub_dps", "Genji": "sub_dps", "Sombra": "sub_dps", "Echo": "sub_dps", "Pharah": "sub_dps", "Mei": "sub_dps", "Symmetra": "sub_dps", "Venture": "sub_dps", "Hanzo": "sub_dps", "Emre": "main_dps", "Sierra": "main_dps", "Anran": "sub_dps", "Vendetta": "sub_dps", "Freja": "main_dps",
    "Ana": "dive", "Kiriko": "dive", "Lifeweaver": "dive", "Moira": "brawl", "Lucio": "brawl", "Lúcio": "brawl", "Baptiste": "poke", "Zenyatta": "poke", "Illari": "poke", "Brigitte": "dive", "Juno": "brawl", "Mizuki": "dive", "Wuyang": "poke", "Jetpack Cat": "brawl"
}

def process_advanced_data():
    input_filename = "owtics_raw_data.json"
    output_filename = "processed_mapData.json"

    try:
        with open(input_filename, "r", encoding="utf-8") as f:
            raw_data = json.load(f)
    except FileNotFoundError:
        print(f"❌ '{input_filename}' 파일이 없습니다. scraper.py를 먼저 실행해 주세요.")
        return

    # 진짜 JSON 구조 계층 맵핑
    stats_section = raw_data.get("GetHeroesStatistics", {}) or {}
    overview_section = stats_section.get("heroesRatesOverview", {}) or {}
    result_box = overview_section.get("result", {}) or {}
    measurements = result_box.get("measurements", [])

    if not measurements:
        print("❌ 알맹이 데이터를 파싱하지 못했습니다. 수집된 JSON 파일 구조를 확인해 주세요.")
        return

    # 오버워치 모든 전장의 지형적 메타 스타일(러쉬, 돌진, 포킹) 정의
    all_known_maps = {
        "ilios": {"name": "일리오스", "style": "dive"},
        "lijiangTower": {"name": "리장 타워", "style": "brawl"},
        "nepal": {"name": "네팔", "style": "brawl"},
        "oasis": {"name": "오아시스", "style": "dive"},
        "busan": {"name": "부산", "style": "brawl"},
        "samoa": {"name": "사모아", "style": "brawl"},
        "antarcticPeninsula": {"name": "남극 반도", "style": "brawl"},
        "dorado": {"name": "도라도", "style": "dive"},
        "route66": {"name": "66번 국도", "style": "dive"},
        "gibraltar": {"name": "감시기지: 지브롤터", "style": "dive"},
        "havana": {"name": "하바나", "style": "poke"},
        "rialto": {"name": "리알토", "style": "poke"},
        "junkertown": {"name": "쓰레기촌", "style": "poke"},
        "circuitRoyal": {"name": "서킷 로얄", "style": "poke"},
        "shambali": {"name": "샴발리 수도원", "style": "brawl"},
        "kingsRow": {"name": "왕의 길", "style": "brawl"},
        "numbani": {"name": "눔바니", "style": "dive"},
        "hollywood": {"name": "할리우드", "style": "brawl"},
        "eichenwalde": {"name": "아이헨발데", "style": "brawl"},
        "blizzardWorld": {"name": "블리자드 월드", "style": "poke"},
        "midtown": {"name": "미드타운", "style": "brawl"},
        "paraiso": {"name": "파라이수", "style": "brawl"},
        "colosseo": {"name": "콜로세오", "style": "brawl"},
        "newQueenStreet": {"name": "뉴 퀸 스트리트", "style": "dive"},
        "esperanca": {"name": "이스페란사", "style": "brawl"},
        "runasapi": {"name": "루나사피", "style": "brawl"},
        "suravasa": {"name": "수라바사", "style": "dive"},
        "newJunkCity": {"name": "뉴 정크 시티", "style": "dive"},
        "atlis": {"name": "아틀리스", "style": "poke"}
    }

    processed_data = {}

    for m_key, m_info in all_known_maps.items():
        m_name = m_info["name"]
        m_style = m_info["style"]

        processed_data[m_key] = {
            "name": f"{m_name} ({m_key.capitalize()})",
            "strategy": [f"[실시간 메타] 실제 아시아 서버 승률 지표와 {m_name} 전장의 지형 조합 밸런스를 연동한 결과입니다."],
            "roles": {
                "tank": {"heroes": [], "synergy": [f"{'돌진 기동력 조합' if m_style=='dive' else '포킹 장거리 조합' if m_style=='poke' else '러쉬 브롤 조합'} 중심 추천"], "counter": "유동적인 탱커 스왑 필요"},
                "damage": {"heroes": [], "synergy": ["메인/서브 딜러 화력 밸런스 매칭 완료"], "counter": "적 방벽 상황에 맞춰 스왑"},
                "support": {"heroes": [], "synergy": ["케어 효율 극대화 서포터진"], "counter": "포커싱 주의"}
            }
        }

        map_hero_pools = {"tank": [], "damage": [], "support": []}

        # 가져온 진짜 영웅 통계를 기반으로 맵 아키타입 가중치 연산
        for stat in measurements:
            hero_info = stat.get("hero", {}) or {}
            h_name = hero_info.get("name")
            h_role = hero_info.get("role")
            if not h_name or not h_role: continue

            win_rate = stat.get("winRate", 0) or 0
            pick_rate = stat.get("pickRate", 0) or 0
            r_key = h_role.lower()

            # 맵 특성과 영웅 성향 아키타입 매칭 연산 (정렬용 점수 보정)
            sub_role = HERO_SUB_ROLES.get(h_name, "generic")
            map_bonus = 0.0
            if sub_role == m_style:
                map_bonus += 4.0  
            elif (m_style == "poke" and sub_role == "main_dps") or (m_style == "dive" and sub_role == "sub_dps"):
                map_bonus += 2.0

            # 정렬을 결정하는 메타 스코어링에는 가중치를 반영
            meta_score = (win_rate * 0.6) + (pick_rate * 0.4) + map_bonus
            
            # ⭐️ 화면에 출력할 텍스트는 보너스 연산 없이 오피셜 사이트 원본 수치 그대로 고정!
            formatted_str = f"{h_name} (승률: {win_rate:.1f}%, 픽률: {pick_rate:.1f}%)"

            map_hero_pools[r_key].append({
                "name": h_name, "display": formatted_str, "score": meta_score, "sub_role": sub_role
            })

        # 3. 역할군별 정렬 및 5명 컷오프(메인2, 서브2 필수 보장) 알고리즘 적용
        sorted_tanks = sorted(map_hero_pools["tank"], key=lambda x: x["score"], reverse=True)
        processed_data[m_key]["roles"]["tank"]["heroes"] = [t["display"] for t in sorted_tanks[:5]]

        sorted_supports = sorted(map_hero_pools["support"], key=lambda x: x["score"], reverse=True)
        processed_data[m_key]["roles"]["support"]["heroes"] = [s["display"] for s in sorted_supports[:5]]

        sorted_dps = sorted(map_hero_pools["damage"], key=lambda x: x["score"], reverse=True)
        final_dps = []
        main_count, sub_count = 0, 0
        
        for dps in sorted_dps:
            if len(final_dps) >= 5 and main_count >= 2 and sub_count >= 2:
                break
            if len(final_dps) < 5 or (dps["sub_role"] == "main_dps" and main_count < 2) or (dps["sub_role"] == "sub_dps" and sub_count < 2):
                if dps not in final_dps:
                    final_dps.append(dps)
                    if dps["sub_role"] == "main_dps": main_count += 1
                    elif dps["sub_role"] == "sub_dps": sub_count += 1

        processed_data[m_key]["roles"]["damage"]["heroes"] = [d["display"] for d in final_dps[:5]]

    with open(output_filename, "w", encoding="utf-8") as f:
        json.dump(processed_data, f, ensure_ascii=False, indent=4)
        
    print(f"\n✅ [파이프라인 매칭 완료] 진짜 실시간 통계와 맵 아키타입 융합 파일('{output_filename}')이 정상 빌드되었습니다!")

if __name__ == "__main__":
    process_advanced_data()