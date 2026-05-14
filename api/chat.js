const fetch = require('node-fetch');

module.exports = async (req, res) => {
  // 跨域配置
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 健康检查
  if (req.method === 'GET') {
    return res.status(200).json({ status: 'ok', message: '代理服务运行正常' });
  }

  // 只接受POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: '缺少text参数' });
    }

    // 先返回测试消息，确保函数能跑通
    return res.status(200).json({
      content: `✅ 代理服务完全正常！你发送的是：${text}`
    });

    // 等测试成功后，再取消下面的注释，连接Coze
    
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
    res.json({ content: data.message.content });
    

  } catch (error) {
    console.error('错误:', error);
    return res.status(500).json({ error: '服务器错误', details: error.message });
  }
};
