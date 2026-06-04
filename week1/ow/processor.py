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
    if text == "watchpoint-gibraltar": return "gibraltar"
    if text == "shambali-monastery": return "shambali"
    if text == "aatlis": return "atlis"
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

    global_matrix = raw_data.get("GetMapHeroRatesGlobalMatrix", {})
    if not global_matrix:
        print("❌ 글로벌 매트릭스 통계 알맹이를 찾지 못했습니다.")
        return

    all_known_maps = {
        "ilios": "일리오스", "lijiangTower": "리장 타워", "nepal": "네팔", "oasis": "오아시스", "busan": "부산", "samoa": "사모아", "antarcticPeninsula": "남극 반도",
        "dorado": "도라도", "route66": "66번 국도", "gibraltar": "감시기지: 지브롤터", "havana": "하바나", "rialto": "리알토", "junkertown": "쓰레기촌", "circuitRoyal": "서킷 로얄", "shambali": "샴발리 수도원",
        "kingsRow": "왕의 길", "numbani": "눔바니", "hollywood": "할리우드", "eichenwalde": "아이헨발데", "blizzardWorld": "블리자드 월드", "midtown": "미드타운", "paraiso": "파라이수",
        "colosseo": "콜로세오", "newQueenStreet": "뉴 퀸 스트리트", "esperanca": "이스페란사", "runasapi": "루나사피",
        "suravasa": "수라바사", "newJunkCity": "뉴 정크 시티", "atlis": "아틀리스"
    }

    final_output = {}

    for reg_key, tiers_dict in global_matrix.items():
        # 👑 프론트 '미국' 세그먼트 버튼 매칭을 위해 'na' 키값을 'usa'로 보정치 적용
        js_reg_key = "usa" if reg_key == "NA" else reg_key.lower()
        final_output[js_reg_key] = {}

        for tier_key, maps_dict in tiers_dict.items():
            js_tier_key = "grandmaster" if tier_key == "CHAMPION" else tier_key.lower()
            final_output[js_reg_key][js_tier_key] = {}

            for m_slug, measurements in maps_dict.items():
                m_key = to_camel_case(m_slug)
                if m_key not in all_known_maps: continue
                
                m_name = all_known_maps[m_key]
                final_output[js_reg_key][js_tier_key][m_key] = {
                    "name": f"{m_name} ({m_key.capitalize()})",
                    "strategy": [f"[실시간 메타] 선택된 서버 및 티어 기준 {m_name} 전장의 오피셜 지표 연동 결과입니다."],
                    "roles": {
                        "tank": {"heroes": [], "synergy": ["전장 맞춤형 돌격군 지표 추천"], "counter": "유동적인 탱커 스왑 필요"},
                        "damage": {"heroes": [], "synergy": ["메인/서브 딜러 화력 밸런스 매칭 완료"], "counter": "적 방벽 상황에 맞춰 스왑"},
                        "support": {"heroes": [], "synergy": ["나노/케어 효율 극대화 서포터진"], "counter": "포커싱 주의"}
                    }
                }

                map_hero_pools = {"tank": [], "damage": [], "support": []}
                if not measurements: continue

                recent_hero_tracker = {}
                for stat in measurements:
                    hero_info = stat.get("hero", {}) or {}
                    h_name = hero_info.get("name")
                    h_role = hero_info.get("role")
                    if not h_name or not h_role: continue

                    win_rate = stat.get("winRate", 0) or 0
                    pick_rate = stat.get("pickRate", 0) or 0
                    
                    recent_hero_tracker[h_name] = {
                        "role": h_role.lower(),
                        "winRate": win_rate,
                        "pickRate": pick_rate,
                        "score": (win_rate * 0.6) + (pick_rate * 0.4)
                    }

                for h_name, h_data in recent_hero_tracker.items():
                    r_key = h_data["role"]
                    formatted_str = f"{h_name} (승률: {h_data['winRate']:.1f}%, 픽률: {h_data['pickRate']:.1f}%)"
                    if r_key in map_hero_pools:
                        map_hero_pools[r_key].append({
                            "name": h_name, "display": formatted_str, "score": h_data["score"], "sub_role": HERO_SUB_ROLES.get(h_name, "generic")
                        })

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
                        final_output[js_reg_key][js_tier_key][m_key]["roles"]["damage"]["heroes"] = [d["display"] for d in final_dps[:5]]
                    else:
                        sorted_heroes = sorted(h_list, key=lambda x: x["score"], reverse=True)
                        final_output[js_reg_key][js_tier_key][m_key]["roles"][r_type]["heroes"] = [h["display"] for h in sorted_heroes[:5]]

    with open(output_filename, "w", encoding="utf-8") as f:
        json.dump(final_output, f, ensure_ascii=False, indent=4)
        
    print(f"\n✅ [프로세서 가공 완료] 3대 대륙 서버용 트리가 최종 구축되었습니다!")

if __name__ == "__main__":
    process_advanced_data()