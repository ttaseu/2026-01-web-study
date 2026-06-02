import json
import requests


def fetch_owtics_data():
    url = "https://api.owtics.gg/graphql"

    headers = {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    }

    # 복잡한 loads 과정 없이 파이썬 딕셔너리/리스트 객체로 직접 정의하여 에러를 원천 차단합니다.
    payload = [
        {
            "operationName": "GetHeroesTrending",
            "variables": {"input": {"region": "ASIA", "mode": "COMPETITIVE", "tier": "ALL"}},
            "extensions": {"clientLibrary": {"name": "@apollo/client", "version": "4.1.6"}},
            "query": "query GetHeroesTrending($input: HeroesTrendingInput!) {\n  heroesTrending(input: $input) {\n    __typename\n    ... on HeroesTrendingAvailable {\n      lastUpdatedAt\n      rising {\n        pickRateDiff\n        winRateDiff\n        current {\n          hero {\n            id\n            name\n            role\n            subRole\n            primaryColor\n            assets {\n              icon\n              __typename\n            }\n            detailsUrl\n            __typename\n          }\n          region\n          tier\n          mode\n          pickRate\n          winRate\n          __typename\n        }\n        previous {\n          pickRate\n          winRate\n          season {\n            id\n            displaySeason\n            isMidseason\n            __typename\n          }\n          __typename\n        }\n        __typename\n      }\n      falling {\n        pickRateDiff\n        winRateDiff\n        current {\n          hero {\n            id\n            name\n            role\n            subRole\n            primaryColor\n            assets {\n              icon\n              __typename\n            }\n            detailsUrl\n            __typename\n          }\n          region\n          tier\n          mode\n          pickRate\n          winRate\n          __typename\n        }\n        previous {\n          pickRate\n          winRate\n          season {\n            id\n            displaySeason\n            isMidseason\n            __typename\n          }\n          __typename\n        }\n        __typename\n      }\n      filter {\n        region\n        mode\n        tier\n        coldStartSwitched\n        current {\n          id\n          displaySeason\n          isMidseason\n          __typename\n        }\n        previous {\n          id\n          displaySeason\n          isMidseason\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    ... on HeroesTrendingUnavailable {\n      reason\n      __typename\n    }\n  }\n}"
        },
        {
            "operationName": "GetMapsTopPicks",
            "variables": {"input": {"region": "ASIA", "mode": "COMPETITIVE", "limit": 7}},
            "extensions": {"clientLibrary": {"name": "@apollo/client", "version": "4.1.6"}},
            "query": "query GetMapsTopPicks($input: MapsTopPicksInput!) {\n  mapsTopPicks(input: $input) {\n    __typename\n    ... on MapsTopPicksAvailable {\n      lastUpdatedAt\n      filter {\n        region\n        mode\n        tier\n        season {\n          id\n          displaySeason\n          isMidseason\n          __typename\n        }\n        __typename\n      }\n      entries {\n        rank\n        map {\n          id\n          name\n          slug\n          mode\n          thumbnail\n          __typename\n        }\n        topByRole {\n          role\n          pickRateLift\n          measurement {\n            pickRate\n            winRate\n            hero {\n              id\n              name\n              role\n              subRole\n              primaryColor\n              assets {\n                icon\n                __typename\n              }\n              detailsUrl\n              __typename\n            }\n            __typename\n          }\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    ... on MapsTopPicksUnavailable {\n      reason\n      __typename\n    }\n  }\n}"
        },
        {
            "operationName": "GetRolesTopHeroes",
            "variables": {"input": {"region": "ASIA", "mode": "COMPETITIVE"}},
            "extensions": {"clientLibrary": {"name": "@apollo/client", "version": "4.1.6"}},
            "query": "query GetRolesTopHeroes($input: RolesTopHeroesInput!) {\n  rolesTopHeroes(input: $input) {\n    __typename\n    ... on RolesTopHeroesAvailable {\n      lastUpdatedAt\n      minPickRate\n      filter {\n        region\n        mode\n        season {\n          id\n          displaySeason\n          isMidseason\n          __typename\n        }\n        __typename\n      }\n      buckets {\n        role\n        eligibleCount\n        totalCount\n        entries {\n          pickRate\n          winRate\n          hero {\n            id\n            name\n            role\n            subRole\n            primaryColor\n            assets {\n              icon\n              __typename\n            }\n            detailsUrl\n            __typename\n          }\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    ... on RolesTopHeroesUnavailable {\n      reason\n      __typename\n    }\n  }\n}"
        },
        {
            "operationName": "GetHeroesStatistics",
            "variables": {"heroesRatesOverviewInput": {"region": "ASIA", "mode": "COMPETITIVE", "tier": "ALL", "season": None}},
            "extensions": {"clientLibrary": {"name": "@apollo/client", "version": "4.1.6"}},
            "query": "query GetHeroesStatistics($heroesRatesOverviewInput: HeroesRatesOverviewInput!) {\n  currentSeason {\n    id\n    season\n    displaySeason\n    era\n    isMidseason\n    startDate\n    isColdStart\n    __typename\n  }\n  heroes(first: 50) {\n    edges {\n      node {\n        id\n        name\n        slug\n        role\n        subRole\n        primaryColor\n        assets {\n          icon\n          __typename\n        }\n        detailsUrl\n        __typename\n      }\n      __typename\n    }\n    pageInfo {\n      hasNextPage\n      __typename\n    }\n    __typename\n  }\n  heroesRatesOverview(input: $heroesRatesOverviewInput) {\n    availability {\n      regions\n      modes\n      seasons {\n        id\n        season\n        displaySeason\n        era\n        isMidseason\n        __typename\n      }\n      tiers\n      __typename\n    }\n    lastUpdatedAt\n    filter {\n      region\n      mode\n      season {\n        id\n        season\n        displaySeason\n        era\n        isMidseason\n        __typename\n      }\n      tier\n      __typename\n    }\n    result {\n      __typename\n      ... on HeroesRatesOverviewAvailable {\n        measurements {\n          hero {\n            id\n            name\n            role\n            subRole\n            primaryColor\n            assets {\n              icon\n              __typename\n            }\n            detailsUrl\n            __typename\n          }\n          season {\n            id\n            season\n            displaySeason\n            era\n            isMidseason\n            __typename\n          }\n          mode\n          region\n          tier\n          winRate\n          pickRate\n          banRate\n          kda\n          __typename\n        }\n        tierSpread {\n          hero {\n            id\n            name\n            __typename\n          }\n          tiers {\n            tier\n            pickRate\n            winRate\n            banRate\n            __typename\n          }\n          __typename\n        }\n        __typename\n      }\n      ... on HeroesRatesOverviewUnavailable {\n        reason\n        __typename\n      }\n    }\n    __typename\n  }\n}"
        }
    ]

    try:
        print("🚀 OWTICS.GG API에 데이터를 요청하는 중...")
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()

        response_data = response.json()
        
        extracted_data = {
            "GetHeroesTrending": None,
            "GetMapsTopPicks": None,
            "GetRolesTopHeroes": None,
            "GetHeroesStatistics": None
        }

        # 응답 배열 순서대로 데이터를 매칭하여 딕셔너리에 쏙 뺍니다.
        for i, op in enumerate(payload):
            op_name = op.get("operationName")
            if op_name in extracted_data:
                extracted_data[op_name] = response_data[i].get("data")

        output_filename = "owtics_raw_data.json"
        with open(output_filename, "w", encoding="utf-8") as f:
            json.dump(extracted_data, f, ensure_ascii=False, indent=4)

        print(f"\n✅ 데이터 수집 완료! '{output_filename}' 파일이 안전하게 생성되었습니다.")

    except requests.exceptions.RequestException as re:
        print(f"❌ 네트워크 요청 에러 발생: {re}")


if __name__ == "__main__":
    fetch_owtics_data()