export default async function handler(req, res) {
    // GET 요청(데이터 달라는 요청)만 허용합니다.
    if (req.method !== 'GET') {
        return res.status(405).json({ error: '허용되지 않은 요청입니다.' });
    }

    // 프론트엔드에서 보낸 맵 이름(mapId)을 확인합니다.
    const { mapId } = req.query;
    if (!mapId) {
        return res.status(400).json({ error: 'mapId가 필요합니다.' });
    }

    // .env.local에 숨겨둔 Supabase URL과 Key를 꺼내옵니다.
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

    try {
        // Supabase REST API를 호출하여 해당 맵의 댓글을 최신순으로 가져옵니다.
        const response = await fetch(`${SUPABASE_URL}/rest/v1/map_comments?map_id=eq.${mapId}&select=*&order=created_at.desc`, {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        return res.status(200).json(data); // 프론트엔드로 데이터 전달
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}