export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: '허용되지 않은 요청입니다.' });
    }

    const { mapId, user_session_id } = req.query;
    if (!mapId || !user_session_id) {
        return res.status(400).json({ error: 'mapId와 user_session_id가 필요합니다.' });
    }

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

    try {
        // map_likes 테이블에서 해당 맵의 좋아요 개수를 가져옵니다.
        const countResponse = await fetch(`${SUPABASE_URL}/rest/v1/map_likes?map_id=eq.${mapId}&select=id&count=exact`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Prefer': 'count=exact'
            }
        });

        if (!countResponse.ok) throw new Error('DB 개수 조회 오류');
        const contentRange = countResponse.headers.get('content-range');
        const totalLikes = contentRange ? parseInt(contentRange.split('/')[1], 10) : 0;

        // 현재 사용자가 좋아요를 눌렀는지 확인
        const userLikeResponse = await fetch(`${SUPABASE_URL}/rest/v1/map_likes?map_id=eq.${mapId}&user_session_id=eq.${user_session_id}&select=id`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });

        if (!userLikeResponse.ok) throw new Error('DB 사용자 좋아요 조회 오류');
        const userLikeData = await userLikeResponse.json();
        const isLikedByUser = userLikeData.length > 0;

        return res.status(200).json({ likes_count: totalLikes, is_liked_by_user: isLikedByUser });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}