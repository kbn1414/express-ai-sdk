// api/proxy.js
const express = require('express');
const fetch = require('node-fetch');
const app = express();

// 开启跨域
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

app.use(express.json());

// 代理 Coze 接口
app.post('/api/chat', async (req, res) => {
    const { text, sessionId } = req.body;
    const API_URL = "https://t8jn2bbr9k.coze.site/stream_run";
    const API_TOKEN = "uLh7ftujVLFv02Qw0xHD4giMWTLUPqQiSDaYgKfvxHSVebSmasyVjQF8ciqNlPasFzJSTpQ8Tx2kIeJXELDwNstl7FztNcmkS7wihulHpAuyLYCVwMJImmB3pu8xvVhC55lsH4SzCbXUVhyJT4qMzm25LNcV7QSi27bdrA";
    const PROJECT_ID = "7636326096509665316";

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: {
                    query: { prompt: [{ type: "text", content: { text } }] },
                    type: "query"
                },
                session_id: sessionId || "default-session",
                project_id: PROJECT_ID
            })
        });

        if (!response.ok) throw new Error(`Coze API错误: ${response.status}`);

        // 流式响应转发
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
    } catch (error) {
        console.error('代理错误:', error);
        res.status(500).json({ error: '服务器异常' });
    }
});

module.exports = app;
