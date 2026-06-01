export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: '허용되지 않은 요청입니다.' });
    }

    const { map_id, user_session_id } = req.body;
    if (!map_id || !user_session_id) {
        return res.status(400).json({ error: 'map_id와 user_session_id가 필요합니다.' });
    }

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

    try {
        // 1. 이 사용자가 이 맵에 이미 좋아요를 눌렀는지 확인
        const checkResponse = await fetch(`${SUPABASE_URL}/rest/v1/map_likes?map_id=eq.${map_id}&user_session_id=eq.${user_session_id}&select=id`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });
        const existingLike = await checkResponse.json();

        let isLikedByUser = false;

        // 2. 좋아요 토글 로직
        if (existingLike.length > 0) {
            // 이미 좋아요를 눌렀다면 -> 삭제 (좋아요 취소)
            const likeId = existingLike[0].id;
            const deleteRes = await fetch(`${SUPABASE_URL}/rest/v1/map_likes?id=eq.${likeId}`, {
                method: 'DELETE',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                }
            });
            if (!deleteRes.ok) {
                const err = await deleteRes.json();
                throw new Error(`좋아요 취소 실패: ${err.message || err.error}`);
            }
            isLikedByUser = false;
        } else {
            // 좋아요를 누르지 않았다면 -> 추가
            const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/map_likes`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ map_id, user_session_id })
            });
            if (!insertRes.ok) {
                const err = await insertRes.json();
                throw new Error(`좋아요 추가 실패: ${err.message || err.error}`);
            }
            isLikedByUser = true;
        }

        // 3. 최종 좋아요 개수 다시 조회해서 반환
        const finalCountResponse = await fetch(`${SUPABASE_URL}/rest/v1/map_likes?map_id=eq.${map_id}&select=id`, { 
            headers: { 
                'apikey': SUPABASE_ANON_KEY, 
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            } 
        });
        const finalData = await finalCountResponse.json();
        const totalLikes = finalData.length;
        
        return res.status(200).json({ success: true, likes_count: totalLikes, is_liked_by_user: isLikedByUser });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}