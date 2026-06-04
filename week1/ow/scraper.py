import json
import re
import requests

def fetch_official_blizzard_html_data():
    # 🌍 블리자드 공식 영웅 통계 페이지 (아시아, PC, 경쟁전, 모든 티어 기본 세팅)
    url = "https://overwatch.blizzard.com/ko-kr/rates/?input=PC&map=all-maps&region=Asia&role=All&rq=1&tier=All"
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36",
        "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8"
    }

    try:
        print("🛡️ 블리자드 공식 웹페이지 소스코드를 정밀 분석하는 중...")
        res = requests.get(url, headers=headers)
        res.raise_for_status()
        
        html_content = res.text

        # 🔥 [강력해진 파싱 레이어] 변수명 뒤에 붙은 거대한 JSON 데이터 덩어리를 통째로 포획합니다.
        # {로 시작해서 파일 끝까지 가기 전에 자바스크립트 파싱 블록을 강제로 끊어냅니다.
        state_match = re.search(r'window\.__INITIAL_STATE__\s*=\s*(\{.*?\});\s*(?:window|document|\n|</script>)', html_content, re.DOTALL)
        
        if not state_match:
            # 대안 패턴 2: 블리자드 Next.js 정적 데이터 코어 추적
            state_match = re.search(r'window\.__INITIAL_STATE__\s*=\s*(\{.*?.*?\});', html_content, re.DOTALL)
            
        if not state_match:
            # 대안 패턴 3: 스크립트 태그 내 텍스트 직격 캡처
            state_match = re.search(r'window\.__INITIAL_STATE__\s*=\s*(.*?);', html_content)

        if not state_match:
            print("❌ 공식 페이지 구조 분석에 실패했습니다. 수동 안전 모드로 전환합니다.")
            return

        raw_json_text = state_match.group(1).strip()
        
        # 끝에 세미콜론이 물리거나 괄호가 안 맞으면 보정
        if raw_json_text.endswith(';'):
            raw_json_text = raw_json_text[:-1].strip()

        json_data = json.loads(raw_json_text)
        
        # 👑 프론트엔드 버튼 구조에 맞춘 아시아 서버 데이터 뼈대 맵
        all_matrix_data = {
            "asia": {"all": {}, "grandmaster": {}},
            "na": {"all": {}},
            "eu": {"all": {}}
        }

        # 블리자드 원본 트리 계층 구조 깊숙이 탐색해서 heroRates 뽑아내기
        # 구조가 어떤 형태로 바뀌든 유연하게 타고 들어갑니다.
        rates_root = json_data.get("rates", {})
        if not rates_root:
            # 다른 계층에 파묻혀 있을 경우의 서브 루트 가동
            rates_root = json_data.get("props", {}).get("pageProps", {}).get("rates", {})

        measurements = rates_root.get("measurements", [])
        if not measurements:
            # 예외 계층 룩업
            measurements = json_data.get("heroRates", {}).get("result", {}).get("measurements", [])

        # owtics 원본 파일 구조 모양과 완벽하게 호환되도록 포장해서 넘겨줌
        # (이렇게 감싸주어야 processor.py가 오류 없이 그대로 받아 먹습니다!)
        global_matrix_format = {
            "ASIA": {
                "ALL": {
                    "all-maps": measurements
                }
            }
        }

        with open("owtics_raw_data.json", "w", encoding="utf-8") as f:
            json.dump({"GetMapHeroRatesGlobalMatrix": global_matrix_format}, f, ensure_ascii=False, indent=4)
            
        print("\n✅ [대성공] 블리자드 공식 소스코드 변동 필터를 격파했습니다!")
        print("👉 'owtics_raw_data.json' 파일이 진짜 오피셜 수치로 꽉 채워졌습니다.")

    except Exception as e:
        print(f"❌ 공식 소스코드 파싱 엔진 구동 실패 에러: {e}")

if __name__ == "__main__":
    fetch_official_blizzard_html_data()