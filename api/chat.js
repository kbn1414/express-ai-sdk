const fetch = require('node-fetch');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { text } = req.body;

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
    res.json({ content: data.message.content });
  } catch (e) {
    res.json({ content: "✅ 代理运行成功！Coze连接失败，检查Token和ID" });
  }
};
