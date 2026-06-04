import json

HERO_SUB_ROLES = {
    "Reinhardt": "brawl", "Ramattra": "brawl", "Orisa": "brawl", "Doomfist": "dive", 
    "Winston": "dive", "D.Va": "dive", "Wrecking Ball": "dive", "Sigma": "poke", "Zarya": "brawl", "Hazard": "brawl",
    "Cassidy": "main_dps", "Soldier: 76": "main_dps", "Ashe": "main_dps", "Widowmaker": "main_dps", "Reaper": "main_dps", "Bastion": "main_dps", "Sojourn": "main_dps",
    "Tracer": "sub_dps", "Genji": "sub_dps", "Sombra": "sub_dps", "Echo": "sub_dps", "Pharah": "sub_dps", "Mei": "sub_dps", "Symmetra": "sub_dps", "Venture": "sub_dps", "Hanzo": "sub_dps", "Emre": "main_dps", "Sierra": "main_dps", "Anran": "sub_dps", "Vendetta": "sub_dps", "Freja": "main_dps",
    "Ana": "dive", "Kiriko": "dive", "Lifeweaver": "dive", "Moira": "brawl", "Lucio": "brawl", "Lúcio": "brawl", "Baptiste": "poke", "Zenyatta": "poke", "Illari": "poke", "Brigitte": "dive", "Juno": "brawl", "Mizuki": "dive", "Wuyang": "poke", "Jetpack Cat": "brawl"
}

def to_camel_case(text):
    if not text: return ""
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

    multi_tier_data = raw_data.get("GetMapHeroRatesMultiTier", {})

    if not multi_tier_data:
        print("❌ 다중 티어 통계 알맹이를 찾지 못했습니다. JSON 구조를 확인하세요.")
        return

    all_known_maps = {
        "ilios": "일리오스", "lijiangTower": "리장 타워", "nepal": "네팔", "oasis": "오아시스", "busan": "부산", "samoa": "사모아", "antarcticPeninsula": "남극 반도",
        "dorado": "도라도", "route66": "66번 국도", "gibraltar": "감시기지: 지브롤터", "havana": "하바나", "rialto": "리알토", "junkertown": "쓰레기촌", "circuitRoyal": "서킷 로얄", "shambali": "샴발리 수도원",
        "kingsRow": "왕의 길", "numbani": "눔바니", "hollywood": "할리우드", "eichenwalde": "아이헨발데", "blizzardWorld": "블리자드 월드", "midtown": "미드타운", "paraiso": "파라이수",
        "colosseo": "콜로세오", "newQueenStreet": "뉴 퀸 스트리트", "esperanca": "이스페란사", "runasapi": "루나사피",
        "suravasa": "수라바사", "newJunkCity": "뉴 정크 시티", "atlis": "아틀리스"
    }

    final_output = {}

    # 🔗 각 티어별 상자를 순회하며 독립적인 정렬 맵 구조 생성
    for tier_key, maps_dict in multi_tier_data.items():
        # 프론트엔드와 매칭 편의를 위해 소문자 키값으로 치환 (ALL -> all, GRANDMASTER -> grandmaster)
        js_tier_key = tier_key.lower()
        final_output[js_tier_key] = {}

        for m_slug, measurements in maps_dict.items():
            m_key = to_camel_case(m_slug)
            if m_key not in all_known_maps: continue
            
            m_name = all_known_maps[m_key]
            
            final_output[js_tier_key][m_key] = {
                "name": f"{m_name} ({m_key.capitalize()})",
                "strategy": [f"[실시간 메타] 선택된 티어 기준 {m_name} 전장의 오피셜 지표 연동 결과입니다."],
                "roles": {
                    "tank": {"heroes": [], "synergy": ["전장 맞춤형 돌격군 지표 추천"], "counter": "유동적인 탱커 스왑 필요"},
                    "damage": {"heroes": [], "synergy": ["메인/서브 딜러 화력 밸런스 매칭 완료"], "counter": "적 방벽 상황에 맞춰 스왑"},
                    "support": {"heroes": [], "synergy": ["나노/케어 효율 극대화 서포터진"], "counter": "포커싱 주의"}
                }
            }

            map_hero_pools = {"tank": [], "damage": [], "support": []}
            if not measurements: continue

            for stat in measurements:
                hero_info = stat.get("hero", {}) or {}
                h_name = hero_info.get("name")
                h_role = hero_info.get("role")
                if not h_name or not h_role: continue

                win_rate = stat.get("winRate", 0) or 0
                pick_rate = stat.get("pickRate", 0) or 0
                r_key = h_role.lower()

                meta_score = (win_rate * 0.6) + (pick_rate * 0.4)
                formatted_str = f"{h_name} (승률: {win_rate:.1f}%, 픽률: {pick_rate:.1f}%)"

                if r_key in map_hero_pools:
                    map_hero_pools[r_key].append({
                        "name": h_name, "display": formatted_str, "score": meta_score, "sub_role": HERO_SUB_ROLES.get(h_name, "generic")
                    })

            # 3. 컷오프 알고리즘 적용
            for r_type, h_list in map_hero_pools.items():
                if r_type == "damage":
                    sorted_dps = sorted(h_list, key=lambda x: x["score"], reverse=True)
                    final_dps = []
                    main_count, sub_count = 0, 0
                    for dps in sorted_dps:
                        if len(final_dps) >= 5 and main_count >= 2 and sub_count >= 2: break
                        if len(final_dps) < 5 or (dps["sub_role"] == "main_dps" and main_count < 2) or (dps["sub_role"] == "sub_dps" and sub_count < 2):
                            if dps not in final_dps:
                                final_dps.append(dps)
                                if dps["sub_role"] == "main_dps": main_count += 1
                                elif dps["sub_role"] == "sub_dps": sub_count += 1
                    final_output[js_tier_key][m_key]["roles"]["damage"]["heroes"] = [d["display"] for d in final_dps[:5]]
                else:
                    sorted_heroes = sorted(h_list, key=lambda x: x["score"], reverse=True)
                    final_output[js_tier_key][m_key]["roles"][r_type]["heroes"] = [h["display"] for h in sorted_heroes[:5]]

    with open(output_filename, "w", encoding="utf-8") as f:
        json.dump(final_output, f, ensure_ascii=False, indent=4)
        
    print(f"\n✅ [다중 티어 빌드 완료] '{output_filename}'에 8개 티어 분리 가공이 완벽하게 끝났습니다!")

if __name__ == "__main__":
    process_advanced_data()