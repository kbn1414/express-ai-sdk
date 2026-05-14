// Vercel 原生 Serverless 函数，不需要 Express，零依赖
export default async function handler(req, res) {
  // 全局跨域配置，支持所有域名
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 健康检查接口（GET 请求直接返回成功）
  if (req.method === 'GET') {
    return res.status(200).json({ status: 'ok', message: '代理服务运行正常' });
  }

  // 只接受 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { text, sessionId } = req.body;
    if (!text) {
      return res.status(400).json({ error: '缺少 text 参数' });
    }

    // --------------------------
    // 这里替换成你的真实 AI 接口
    // 目前是模拟回复，确保能跑通
    // --------------------------
    return res.status(200).json({
      success: true,
      content: `✅ 代理服务运行正常！你发送的内容是：${text}`,
      sessionId: sessionId || 'default-session'
    });

    // 当你需要接入真实 Coze 时，取消下面这段注释，替换上面的模拟回复
    /*
    const fetch = await import('node-fetch');
    const response = await fetch.default('https://你的Coze域名.coze.site/stream_run', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer 你的Coze Token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: {
          query: { prompt: [{ type: "text", content: { text } }] },
          type: "query"
        },
        session_id: sessionId || 'default-session',
        project_id: '你的Coze项目ID'
      })
    });

    if (!response.ok) {
      throw new Error(`Coze API 错误: ${response.status}`);
    }

    // 流式响应转发（支持打字效果）
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(decoder.decode(value, { stream: true }));
    }
    res.end();
    */

  } catch (error) {
    console.error('代理错误:', error);
    return res.status(500).json({ error: '服务器内部错误', details: error.message });
  }
}
