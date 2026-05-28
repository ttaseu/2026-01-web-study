export default async function handler(req, res) {
    // POST 요청(데이터 저장하라는 요청)만 허용합니다.
    if (req.method !== 'POST') {
        return res.status(405).json({ error: '허용되지 않은 요청입니다.' });
    }

    // 프론트엔드에서 보낸 데이터를 꺼냅니다.
    const { map_id, nickname, content } = req.body;

    // 데이터가 다 있는지 검사합니다.
    if (!map_id || !nickname || !content) {
        return res.status(400).json({ error: '필수 입력값이 누락되었습니다.' });
    }

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

    try {
        // Supabase로 데이터를 쏴서 저장(INSERT)합니다.
        const response = await fetch(`${SUPABASE_URL}/rest/v1/map_comments`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation' // 저장 후 저장된 데이터를 바로 반환해달라는 뜻
            },
            body: JSON.stringify({ map_id, nickname, content })
        });

        if (!response.ok) {
            throw new Error('데이터베이스 저장 중 오류가 발생했습니다.');
        }
        return res.status(200).json({ success: true });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}