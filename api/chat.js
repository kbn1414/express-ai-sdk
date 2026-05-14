export const config = {
  runtime: 'edge', // 关键：启用边缘运行时
};

export default async function handler(req) {
  // 跨域配置
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }

  if (req.method === 'GET') {
    return new Response(JSON.stringify({ status: 'ok', message: '边缘代理运行正常' }), {
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }

  const { text } = await req.json();

  try {
    const response = await fetch('https://t8jn2bbr9k.coze.site/stream_run', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer uLh7ftujVLFv02Qw0xHD4giMWTLUPqQiSDaYgKfvxHSVebSmasyVjQF8ciqNlPasFzJSTpQ8Tx2kIeJXELDwNstl7FztNcmkS7wihulHpAuyLYCVwMJImmB3pu8xvVhC55lsH4SzCbXUVhyJT4qMzm25LNcV7QSi27bdrA',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: { query: { prompt: [{ type: "text", content: { text } }] }, type: "query" },
        session_id: "test",
        project_id: "7636326096509665316"
      })
    });

    const data = await response.json();
    return new Response(JSON.stringify({ content: data.message.content }), {
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ content: `✅ 边缘代理正常！错误：${e.message}` }), {
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }
}
