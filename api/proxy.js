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

  res.json({
    message: {
      content: `你说的是：${text}。代理服务运行正常！`
    }
  });
});

module.exports = app;
