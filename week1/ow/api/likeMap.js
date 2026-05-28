export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: '허용되지 않은 요청입니다.' });
    }

    const { map_id } = req.body;
    if (!map_id) {
        return res.status(400).json({ error: 'map_id가 필요합니다.' });
    }

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

    try {
        // 1. map_likes 테이블에 새로운 좋아요 기록 추가 (INSERT)
        const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/map_likes`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ map_id: map_id })
        });
        
        if (!insertResponse.ok) {
            const errData = await insertResponse.json();
            throw new Error(`DB 추가 오류: ${errData.message || errData.error || '알 수 없는 오류'}`);
        }

        // 2. 추가 후 해당 맵의 전체 좋아요 개수 조회
        const countResponse = await fetch(`${SUPABASE_URL}/rest/v1/map_likes?map_id=eq.${map_id}&select=id`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Prefer': 'count=exact'
            }
        });

        let totalLikes = 1;
        if (countResponse.ok) {
            const contentRange = countResponse.headers.get('content-range');
            if (contentRange) {
                totalLikes = parseInt(contentRange.split('/')[1], 10);
            }
        }

        return res.status(200).json({ success: true, likes_count: totalLikes });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}