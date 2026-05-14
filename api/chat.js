export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }

  if (req.method === 'GET') {
    return new Response(JSON.stringify({ status: 'ok', message: '代理运行正常' }), {
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }

  const { text } = await req.json();

  try {
    const response = await fetch('https://t8jn2bbr9k.coze.site/stream_run', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6ImIzYjhkYTRlLWYwMzktNGE2ZS1iNjhmLTdiZjAzMjE0YzMwNyJ9.eyJpc3MiOiJodHRwczovL2FwaS5jb3plLmNuIiwiYXVkIjpbImt5cXNiS2swV3BucmE3UjY5bjAxWjR4ZmRqSlRMa3Z5Il0sImV4cCI6ODIxMDI2Njg3Njc5OSwiaWF0IjoxNzc4NzM2NDYxLCJzdWIiOiJzcGlmZmU6Ly9hcGkuY296ZS5jbi93b3JrbG9hZF9pZGVudGl0eS9pZDo3NjM2MzMyMTcwNjkyMjYzOTc4Iiwic3JjIjoiaW5ib3VuZF9hdXRoX2FjY2Vzc190b2tlbl9pZDo3NjM5NjE0OTMwNDEyMzcxOTY4In0.aFVgg_DF9GlKt4X_G_-eMo5XXUix_g1IFAtoEJ3MjL4VIZDz7eiy6k19EPxQ4PdRewtJw0d7NXJAi1E4BF7vuqfYGenAhQPx90ttPmxwpBQf5asF5qkV7vIsDLPAmfd_WT_hcPCQOkYxuFrBgElqmzcpFa44LkXTzBDo6p8O_v3PsEW4YD6ElWLfv4-h3JOI7-RAOVpfsJqykAOTX4gr9jeI1_7c6_Axxcnuv10sK77MO9itH0t-0V6iJwEOa8ytdR9lYGCg6liOh978oxyybGX42mdhXazylyI9lQxR-9xxz3Eh6jXtzAQnoCiSM795Mrle367QOg0wMunl0EjGvg',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: {
          query: {
            prompt: [
              {
                type: "text",
                content: { text }
              }
            ]
          },
          type: "query"
        },
        session_id: "test_session_" + Date.now(),
        project_id: "7636326096509665316"
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({ content: `❌ 接口错误：${errorText}` }), { headers });
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = ''; // 核心：缓存不完整的流式数据
    const fragments = new Map();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // 拼接缓存 + 新数据，解决分块截断问题
      buffer += decoder.decode(value, { stream: true });
      // 按换行符分割完整的行
      const lines = buffer.split('\n');
      // 最后一行可能不完整，放回缓存
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data: ')) continue;

        try {
          // 解析完整的JSON数据
          const data = JSON.parse(trimmed.slice(6));
          if (data.type === 'answer' && data.content?.answer) {
            fragments.set(data.sequence_id, data.content.answer);
          }
        } catch (e) {
          continue;
        }
      }
    }

    // 按序号排序，拼接所有内容
    const sortedIds = Array.from(fragments.keys()).sort((a, b) => a - b);
    const fullContent = sortedIds.map(id => fragments.get(id)).join('');

    return new Response(JSON.stringify({ content: fullContent }), { headers });

  } catch (e) {
    return new Response(JSON.stringify({ content: `❌ 错误：${e.message}` }), { headers });
  }
}
