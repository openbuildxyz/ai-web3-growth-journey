const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// 服务静态文件
app.use(express.static(path.join(__dirname, 'dist')));

// 所有路由指向index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// 启动服务器
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});