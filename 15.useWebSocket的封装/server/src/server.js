const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');

// 创建express应用
const app = express();
const httpServer = createServer(app);
const port = 3000;

// 配置Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  }
});

const merchants = [
  "商家1",
  "商家2",
  "商家3",
  "商家4",
  "商家5",
  "商家6",
]

function generateSalesData() { 
  return merchants.map(name => {
    return {
      name,
      value: Math.floor(Math.random() * 200) + 100
    }
  })
}

io.on('connection', (socket) => { 
  console.log('客户端已经连接：' + socket.id);

  socket.emit('salesData', generateSalesData());

  const interval = setInterval(() => { 
    socket.emit('salesData', generateSalesData());
  }, 2000);

  socket.on('disconnect', () => { 
    console.log('客户端已经断开：' + socket.id);
    clearInterval(interval);
  });
});

httpServer.listen(port, () => { 
  console.log(`服务运行在 http://localhost:${port}`);
})