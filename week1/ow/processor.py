import json

def to_camel_case(text):
    """slug 형식(예: new-junk-city)을 camelCase(예: newJunkCity)로 변환합니다."""
    parts = text.split('-')
    return parts[0] + ''.join(word.capitalize() for word in parts[1:])

def process_map_data():
    input_filename = "owtics_raw_data.json"
    output_filename = "processed_mapData.json"

    try:
        with open(input_filename, "r", encoding="utf-8") as f:
            raw_data = json.load(f)
    except FileNotFoundError:
        print(f"❌ '{input_filename}' 파일이 없습니다. scraper.py를 먼저 실행해 주세요.")
        return

    # "GetMapsTopPicks"의 "entries" 배열에 접근
    entries = raw_data.get("GetMapsTopPicks", {}).get("mapsTopPicks", {}).get("entries", [])
    
    if not entries:
        print("❌ 맵 탑픽 데이터(entries)를 찾을 수 없습니다. JSON 구조를 확인해 주세요.")
        return

    processed_data = {}

    for entry in entries:
        map_info = entry.get("map", {})
        map_name = map_info.get("name", "Unknown Map")
        map_slug = map_info.get("slug", "unknown-map")
        
        # script.js의 키값과 호환되도록 slug 변환 (예외 처리 포함)
        map_key = to_camel_case(map_slug)
        if map_slug == "watchpoint-gibraltar":
            map_key = "gibraltar"
        elif map_slug == "aatlis":
            map_key = "atlis"

        roles_data = {}
        for top_role in entry.get("topByRole", []):
            role_type = top_role.get("role", "").lower() # TANK -> tank
            measurement = top_role.get("measurement", {})
            hero_name = measurement.get("hero", {}).get("name", "Unknown")
            win_rate = measurement.get("winRate", 0)
            pick_rate = measurement.get("pickRate", 0)

            # 영웅 이름과 통계를 script.js의 heroes 배열에 넣기 좋은 형태로 포맷팅
            formatted_hero = f"{hero_name} (승률: {win_rate}%, 픽률: {pick_rate}%)"
            
            roles_data[role_type] = {
                "heroes": [formatted_hero],
                "synergy": ["API 자동 업데이트 데이터"], # 임시 값
                "counter": "데이터 분석 중..." # 임시 값
            }

        processed_data[map_key] = {
            "name": map_name,
            "strategy": ["[자동화 데이터] 현재 맵 기준 역할별 가장 효율이 높은 영웅입니다."],
            "roles": roles_data
        }

    # script.js에 바로 복붙할 수 있는 형태로 저장
    with open(output_filename, "w", encoding="utf-8") as f:
        json.dump(processed_data, f, ensure_ascii=False, indent=4)

    print(f"✅ 데이터 가공 완료! '{output_filename}' 파일이 생성되었습니다.")
    print("이 파일의 내용을 복사해서 script.js의 mapData 부분을 교체해보세요!")

if __name__ == "__main__":
    process_map_data()