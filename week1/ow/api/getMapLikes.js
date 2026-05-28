export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: '허용되지 않은 요청입니다.' });
    }

    const { mapId } = req.query;
    if (!mapId) {
        return res.status(400).json({ error: 'mapId가 필요합니다.' });
    }

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

    try {
        // map_likes 테이블에서 해당 맵의 좋아요 개수를 가져옵니다.
        const response = await fetch(`${SUPABASE_URL}/rest/v1/map_likes?map_id=eq.${mapId}&select=id`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Prefer': 'count=exact'
            }
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(`DB 조회 오류: ${errData.message || errData.error}`);
        }
        
        const contentRange = response.headers.get('content-range');
        let totalLikes = 0;
        if (contentRange) {
            totalLikes = parseInt(contentRange.split('/')[1], 10);
        }
        
        return res.status(200).json({ likes_count: totalLikes });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}