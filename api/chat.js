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
      return new Response(JSON.stringify({
        content: `❌ 接口错误：状态码${response.status}，内容：${errorText}`
      }), {
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    const allRawLines = [];
    const allDataObjects = [];
    const allSequenceIds = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine === '') continue;

        allRawLines.push(trimmedLine);

        if (trimmedLine.startsWith('data: ')) {
          try {
            const data = JSON.parse(trimmedLine.slice(6));
            allDataObjects.push(data);
            if (data.sequence_id) {
              allSequenceIds.push(data.sequence_id);
            }
          } catch (e) {
            allRawLines.push(`⚠️ 解析失败的行：${trimmedLine}，错误：${e.message}`);
          }
        }
      }
    }

    // 修复：用普通字符串拼接，避免模板字符串嵌套问题
    const report = 
      "=== 完整原始数据调试报告 ===\n" +
      `1. 总原始行数：${allRawLines.length}\n` +
      `2. 解析成功的data对象数：${allDataObjects.length}\n` +
      `3. 所有sequence_id：${allSequenceIds.join(', ')}\n` +
      `4. 排序后的sequence_id：${allSequenceIds.sort((a,b)=>a-b).join(', ')}\n\n` +
      "--- 所有原始行 ---\n" +
      allRawLines.join('\n') + "\n\n" +
      "--- 所有解析后的data对象 ---\n" +
      JSON.stringify(allDataObjects, null, 2);

    return new Response(JSON.stringify({ content: report }), {
      headers: { ...headers, 'Content-Type': 'application/json' },
    });

  } catch (e) {
    return new Response(JSON.stringify({
      content: `❌ 代理错误：${e.message}`
    }), {
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }
}
