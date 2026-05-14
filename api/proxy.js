const express = require('express');
const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json());

app.post('/api/chat', (req, res) => {
  const { text } = req.body;

  // 直接返回模拟回复，绕过 Coze 屏蔽问题
  res.json({
    message: {
      content: `你说的是：${text}。这是代理服务正常返回的测试回复～`
    }
  });
});

module.exports = app;
