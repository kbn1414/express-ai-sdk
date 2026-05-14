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
        'Authorization': 'Bearer uLh7ftujVLFv02Qw0xHD4giMWTLUPqQiSDaYgKfvxHSVebSmasyVjQF8ciqNlPasFzJSTpQ8Tx2kIeJXELDwNstl7FztNcmkS7wihulHpAuyLYCVwMJImmB3pu8xvVhC55lsH4SzCbXUVhyJT4qMzm25LNcV7QSi27bdrA',
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
