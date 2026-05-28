# 📝 index.html 완벽 해부 가이드 (초보자용)

HTML은 웹 페이지의 **'뼈대'**를 만드는 언어입니다. 
코드가 복잡해 보이지만, 사실 투명한 상자(`<div>`) 안에 글자나 이미지를 차곡차곡 담아놓은 것에 불과합니다. 
지금부터 `index.html` 코드를 위에서부터 아래로 쪼개서 아주 쉽게 설명해 드릴게요!

---

## 1. 문서의 시작과 기본 설정
```html
<!DOCTYPE html>
<html lang="ko">
```
* `<!DOCTYPE html>`: 컴퓨터(브라우저)에게 "이 문서는 최신 HTML5 버전으로 작성되었어!"라고 알려주는 선언문입니다. 항상 맨 위에 적습니다.
* `<html lang="ko">`: HTML 문서의 진짜 시작점입니다. `lang="ko"`는 이 페이지가 주로 **한국어**로 작성되었다는 것을 구글 검색엔진이나 번역기에게 알려주는 역할을 합니다.

---

## 2. 보이지 않는 설정 구역 `<head>`
```html
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>오버워치 전략 가이드</title>
    <link rel="stylesheet" href="style.css">
</head>
```
`<head>` 부분은 사람 눈(웹 화면)에는 보이지 않지만, 페이지를 위한 **중요한 설정**들이 들어가는 곳입니다. (사람으로 치면 뇌와 같습니다.)
* `<meta charset="UTF-8">`: 한글이 웱댫처럼 깨지지 않고 정상적으로 나오게 해주는 마법의 주문(인코딩 설정)입니다.
* `<meta name="viewport" ...>`: 스마트폰으로 접속했을 때 화면 크기가 기기에 맞게 자동으로 조절되도록 해주는 모바일 필수 설정입니다.
* `<title>`: 인터넷 브라우저 맨 위 탭에 표시되는 페이지의 이름입니다.
* `<link rel="stylesheet" href="style.css">`: 예쁘게 꾸며주는 디자인 파일(`style.css`, 사람으로 치면 옷)을 가져와서 입혀주는(연결해 주는) 코드입니다.

---

## 3. 눈에 보이는 화면의 시작 `<body>`와 `<header>`
```html
<body>
    <header class="header">
        <h1>옵기본</h1>
        <p>맵과 역할군을 고르면 승리 전략이 보입니다.</p>
    </header>
```
* `<body>`: 이 태그 안쪽에 적힌 모든 내용이 실제 **웹 화면에 보이게 됩니다.**
* `<header>`: 웹 페이지의 맨 위쪽 '머리말' 구역을 묶어주는 상자입니다.
  * `class="header"`: 나중에 CSS(디자인)나 JS(동작)에서 "얘 좀 꾸며줘!" 하고 부르기 위해 달아놓은 **별명(이름표)**입니다.
* `<h1>`: 제목(Heading)을 나타냅니다. 숫자가 1에 가까울수록 가장 크고 중요한 제목입니다.
* `<p>`: 일반적인 텍스트 문단(Paragraph)을 적을 때 쓰는 태그입니다.

---

## 4. 메인 컨텐츠를 담는 큰 상자 `<div class="container">`
```html
    <div class="container">
```
* `<div>`: 특별한 의미는 없지만, 내용물들을 하나로 묶어주는 **투명한 상자(Division)**입니다. 웹 개발에서 가장 많이 쓰이는 태그입니다.
* `class="container"`: "이 상자의 이름을 container(그릇)로 할게!"라는 뜻입니다. 보통 화면 가운데에 컨텐츠를 모아둘 때 이 이름을 많이 씁니다.

---

## 5. Step 1: 역할군 선택 구역
```html
        <!-- Step 1: 역할군 선택 -->
        <section class="step-section" id="step1">
            <h2>Step 1. 역할군 선택</h2>
            <div class="role-buttons">
                <div class="role-item" data-role="tank">
                    <img src="images/돌격.png" alt="돌격" class="role-icon">
                    <span>돌격 (Tank)</span>
                </div>
                <!-- 공격, 지원 코드 생략 -->
            </div>
        </section>
```
* `<!-- 내용 -->`: 이것은 **주석(메모)**입니다. 개발자가 보기 위해 적은 글이며 웹 화면에는 나타나지 않습니다.
* `<section>`: `<div>`와 비슷하지만, "여기는 하나의 의미 있는 구역이야!"라고 명확히 알려주는 상자입니다.
* `id="step1"`: class가 여러 명에게 줄 수 있는 별명이라면, **id는 전교에 단 하나뿐인 주민등록번호**입니다. 자바스크립트가 정확히 이 구역을 조종할 수 있게 해줍니다.
* `<div class="role-item" data-role="tank">`: 버튼 역할을 하는 상자입니다. `data-role`은 자바스크립트에게 "이 버튼은 돌격(tank) 버튼이야"라고 몰래 알려주는 숨겨진 정보입니다.
* `<img>`: 이미지를 넣는 태그입니다. `src="경로"`로 사진을 불러오고, `alt="이름"`은 사진이 안 뜰 때 대신 보여줄 글자입니다.
* `<span>`: 줄바꿈 없이 글자만 딱 묶어주는 아주 작은 투명 상자입니다.

---

## 6. Step 2: 맵 선택 구역
```html
        <!-- Step 2: 맵 선택 -->
        <section class="step-section disabled" id="step2">
            <h2>Step 2. 맵 선택</h2>
            <div id="mapGrid"></div>
        </section>
```
* `class="step-section disabled"`: 역할군을 고르기 전에는 맵을 누를 수 없도록, CSS를 이용해 흐릿하게(disabled) 막아둔 상태입니다.
* `<div id="mapGrid"></div>`: 상자 안이 텅 비어 있죠? 자바스크립트 파일(`script.js`)이 수십 개의 맵 이미지와 버튼을 만들어서 **이 빈 상자 안에 자동으로 쏙쏙 집어넣을 예정**이기 때문입니다!

---

## 7. 결과창 구역 (숨김 상태)
```html
        <!-- 결과창 -->
        <section id="resultBox" class="hidden">
            <h2 id="resultTitle" class="result-title">맵 이름 - 역할군 전략</h2>
            
            <div class="card strategy-card">
                <h3>🗺️ 거점별 핵심 전략</h3>
                <ul id="strategyList"></ul>
            </div>

            <div id="roleDataContent" class="role-content-grid">
                <!-- JS에서 추천 영웅, 시너지, 카운터 내용이 렌더링됩니다 -->
            </div>
        </section>
```
* `class="hidden"`: 처음 사이트에 들어왔을 때는 결과가 보이면 안 되므로, CSS로 안 보이게 꽁꽁 숨겨둔 상태입니다.
* `<ul>`: 점(•)으로 시작하는 목록(List)을 만드는 상자입니다. 역시 속이 비어있으며, 나중에 자바스크립트가 전략 텍스트들을 넣게 됩니다.

---

## 8. 생명력(동작) 불어넣기 및 문서 끝내기
```html
    </div>
    <script src="script.js?v=202407"></script>
</body>
</html>
```
* `</div>`: 위에서 열었던 큰 그릇(`container`) 상자를 닫습니다.
* `<script src="script.js..."></script>`: 웹 페이지에 **클릭 등의 동작(자바스크립트)**을 부여하는 연결 고리입니다. (사람으로 치면 근육과 신경입니다.)
  * `?v=202407`: 브라우저가 옛날 파일을 기억하고 있는 걸 방지하기 위해 붙여둔 팁(버전 표시)입니다.
* `</body>`, `</html>`: "이제 화면에 그릴 내용 끝!", "문서 진짜 끝!" 하고 닫아주는 문구입니다.