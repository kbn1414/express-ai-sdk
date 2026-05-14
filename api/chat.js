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
    return new Response(JSON.stringify({ status: 'ok', message: '边缘代理运行正常' }), {
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
        content: { query: { prompt: [{ type: "text", content: { text } }] }, type: "query" },
        session_id: "test",
        project_id: "7636326096509665316"
      })
    });

    // 先检查Coze是否返回了错误状态码
    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({
        content: `❌ Coze返回错误：状态码${response.status}，内容：${errorText}`
      }), {
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    // 尝试解析JSON
    let data;
    try {
      data = await response.json();
    } catch (e) {
      const rawText = await response.text();
      return new Response(JSON.stringify({
        content: `❌ Coze返回不是JSON格式：${rawText}`
      }), {
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    // 检查是否有message.content
    if (data?.message?.content) {
      return new Response(JSON.stringify({ content: data.message.content }), {
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    } else {
      // 打印Coze返回的完整内容
      return new Response(JSON.stringify({
        content: `✅ 连接Coze成功！但返回格式不对，完整内容：${JSON.stringify(data, null, 2)}`
      }), {
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

  } catch (e) {
    return new Response(JSON.stringify({
      content: `❌ 代理错误：${e.message}`
    }), {
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }
}
