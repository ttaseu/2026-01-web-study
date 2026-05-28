-- =================================================================================
-- 1. 오버워치 맵 전략 데이터를 저장할 메인 테이블 생성 (기존 script.js의 mapData)
-- =================================================================================
CREATE TABLE IF NOT EXISTS public.maps (
    id text PRIMARY KEY, -- 'kingsRow', 'ilios' 등 영문 ID
    name text NOT NULL,  -- 한글 맵 이름
    likes_count integer DEFAULT 0, -- 좋아요(추천) 누적 수
    data jsonb NOT NULL, -- 역할별 추천 영웅 및 시너지 정보를 담은 JSON 데이터
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- =================================================================================
-- 2. 사용자가 의견이나 팁을 남길 수 있는 댓글 테이블 생성
-- =================================================================================
CREATE TABLE IF NOT EXISTS public.map_comments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    map_id text NOT NULL REFERENCES public.maps(id) ON DELETE CASCADE, -- maps 테이블과 연결 (맵 삭제 시 댓글도 삭제)
    
    -- 9. 입력값 길이 제한 Check Constraint 적용
    nickname text NOT NULL CHECK (char_length(nickname) >= 2 AND char_length(nickname) <= 12),
    content text NOT NULL CHECK (char_length(content) >= 5 AND char_length(content) <= 300),
    
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- =================================================================================
-- 6. RLS(Row Level Security) 활성화
-- (이 설정을 켜야 우리가 만든 Policy 규칙대로만 데이터에 접근할 수 있습니다)
-- =================================================================================
ALTER TABLE public.maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.map_comments ENABLE ROW LEVEL SECURITY;

-- 기존 Policy 초기화 (다시 실행해도 에러가 나지 않도록)
DROP POLICY IF EXISTS "누구나 맵 데이터를 조회할 수 있음" ON public.maps;
DROP POLICY IF EXISTS "누구나 댓글을 조회할 수 있음" ON public.map_comments;
DROP POLICY IF EXISTS "누구나 댓글을 작성할 수 있음" ON public.map_comments;

-- =================================================================================
-- 7. SELECT Policy: 누구나(anon, authenticated) 데이터를 읽을 수 있게 허용
-- =================================================================================
CREATE POLICY "누구나 맵 데이터를 조회할 수 있음"
    ON public.maps FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "누구나 댓글을 조회할 수 있음"
    ON public.map_comments FOR SELECT TO anon, authenticated
    USING (true);

-- =================================================================================
-- 8. INSERT Policy: 누구나(anon) 댓글을 작성할 수 있게 허용 (service_role 불필요)
-- =================================================================================
CREATE POLICY "누구나 댓글을 작성할 수 있음"
    ON public.map_comments FOR INSERT TO anon, authenticated
    WITH CHECK (true);

-- =================================================================================
-- 9. UPDATE Policy: 누구나(anon) 맵의 좋아요 수를 업데이트할 수 있게 허용
-- =================================================================================
CREATE POLICY "누구나 맵 데이터를 업데이트할 수 있음"
    ON public.maps FOR UPDATE TO anon, authenticated
    USING (true);

-- =================================================================================
-- 10. GRANT: anon(미인증 사용자)과 authenticated(로그인 사용자)에게 권한 부여
-- =================================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON TABLE public.maps TO anon, authenticated;
-- 댓글 테이블은 쓰기도 가능해야 하므로 INSERT 권한 추가 부여
GRANT SELECT, INSERT ON TABLE public.map_comments TO anon, authenticated;
GRANT UPDATE ON TABLE public.maps TO anon, authenticated;

-- =================================================================================
-- 4 & 5. 초기 샘플 데이터 Insert (ON CONFLICT UPDATE를 사용하여 여러 번 실행해도 안전함)
-- =================================================================================

-- 맵 샘플 데이터 (script.js의 일부 데이터)
INSERT INTO public.maps (id, name, data)
VALUES
    (
        'kingsRow', 
        '왕의 길 (King''s Row)', 
        '{"strategy": ["[경쟁전] 표준 승리 엔진: 아나-트레이서-엠레 체제가 범용적"], "roles": {"tank": {"heroes": ["시그마", "윈스턴"]}, "damage": {"heroes": ["트레이서", "엠레"]}, "support": {"heroes": ["아나", "키리코"]}}}'::jsonb
    ),
    (
        'ilios', 
        '일리오스 (Ilios)', 
        '{"strategy": ["[경쟁전] 돌격군 메타: 윈스턴과 해저드가 압도적인 지표로 거점 장악"], "roles": {"tank": {"heroes": ["윈스턴", "해저드"]}, "damage": {"heroes": ["트레이서", "에코"]}, "support": {"heroes": ["키리코", "일리아리"]}}}'::jsonb
    )
ON CONFLICT (id) DO UPDATE
SET
    name = EXCLUDED.name,
    data = EXCLUDED.data,
    updated_at = now();

-- 댓글 샘플 데이터 (UUID를 명시하여 여러 번 실행 시 중복 생성 방지)
INSERT INTO public.map_comments (id, map_id, nickname, content)
VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'kingsRow', '옵치뉴비', '왕의 길 수비에서는 시그마가 정말 좋네요! 꿀팁 감사합니다.'),
    ('550e8400-e29b-41d4-a716-446655440002', 'kingsRow', '그마가고싶다', '상대가 러쉬 조합일 때는 어떻게 막는 게 좋을까요?'),
    ('550e8400-e29b-41d4-a716-446655440003', 'ilios', '낙사주의보', '우물에서 해저드로 적들 끌어당기는 맛에 합니다 ㅋㅋ')
ON CONFLICT (id) DO UPDATE
SET
    map_id = EXCLUDED.map_id,
    nickname = EXCLUDED.nickname,
    content = EXCLUDED.content;