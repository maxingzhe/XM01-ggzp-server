//引入express模块
const express = require('express');
//引入连接数据库模块
const db = require('./db');
//引入路由
const router = require('./router')

const app = express();

(async()=>{
  await db;
  app.use(router)
})()

app.listen(4000,err=>{
  if(!err)console.log('服务器启动成功了')
  else console.log(err)
})