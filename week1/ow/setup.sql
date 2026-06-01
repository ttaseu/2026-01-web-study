-- =================================================================================
-- 1. '좋아요(추천해요)' 기록을 저장할 새로운 테이블 생성
-- =================================================================================
CREATE TABLE IF NOT EXISTS public.map_likes (
    -- id: 각 좋아요 기록의 고유 식별자 (무작위 UUID 자동 생성)
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- map_id: 어떤 맵에 달린 좋아요인지 식별 (maps 테이블의 id를 참조, 맵 삭제 시 같이 삭제됨)
    map_id text NOT NULL REFERENCES public.maps(id) ON DELETE CASCADE,
    
    -- user_session_id: 어떤 사용자가 눌렀는지 식별하는 ID (JS에서 생성)
    user_session_id text NOT NULL,

    -- created_at: 좋아요가 눌린 정확한 날짜와 시간 (현재 시간 자동 기록)
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 기존 Policy 초기화 (다시 실행해도 에러가 나지 않도록)
DROP POLICY IF EXISTS "누구나 좋아요 기록을 조회할 수 있음" ON public.map_likes;
DROP POLICY IF EXISTS "누구나 좋아요 기록을 추가할 수 있음" ON public.map_likes;
DROP POLICY IF EXISTS "누구나 좋아요 기록을 삭제할 수 있음" ON public.map_likes;

-- =================================================================================
-- 3. SELECT Policy: 로그인 없이 누구나(anon) 좋아요 데이터를 조회할 수 있게 허용
-- =================================================================================
CREATE POLICY "누구나 좋아요 기록을 조회할 수 있음"
    ON public.map_likes FOR SELECT TO anon, authenticated
    USING (true);

-- =================================================================================
-- 4. INSERT Policy: 로그인 없이 누구나(anon) 좋아요 데이터를 추가할 수 있게 허용
-- =================================================================================
CREATE POLICY "누구나 좋아요 기록을 추가할 수 있음"
    ON public.map_likes FOR INSERT TO anon, authenticated
    WITH CHECK (true);

-- =================================================================================
-- 5. DELETE Policy: 로그인 없이 누구나(anon) 자신의 좋아요 기록을 삭제할 수 있게 허용
-- =================================================================================
CREATE POLICY "누구나 좋아요 기록을 삭제할 수 있음"
    ON public.map_likes FOR DELETE TO anon, authenticated
    USING (true);

-- =================================================================================
-- 6. GRANT: anon(미인증 사용자)에게 실제 테이블의 SELECT, INSERT, DELETE 권한 부여
-- =================================================================================
GRANT SELECT, INSERT, DELETE ON TABLE public.map_likes TO anon, authenticated;