//引入express模块
const express = require('express');
//引入md5加密
const md5 = require('blueimp-md5')
//引入Users
const Users = require('../models/users');
//引入cookie-parser
const cookieParser = require('cookie-parser')
//获取router
const Router = express.Router;
//创建路由
const router = new Router();
//解析请求体数据
router.use(express.urlencoded({extended: true}));
//解析cookie
router.use(cookieParser())
//登录
router.post('/login',async (req,res)=>{
  
  const {username,password} = req.body
  //判断
  if( !username || !password){
    res.json({
      "code":2,
      "msg":"用户输入不合法"
    })
    return;
  }
  //去数据库查找
  try {
    const data = await Users.findOne({username,password:md5(password)})
    if(data){
      res.cookie('userid', data.id, {maxAge: 1000 * 3600 * 24 * 7});
      res.json({
        "code":0,
        "data":{
          "_id":data.id,
          "username":data.username,
          "type":data.type
        }
      })
    }else{
      res.json({
        "code":1,
        "msg":"用户名或密码错误"
      })
    }
  } catch(e){
    res.json({
      "code":3,
      "msg":"网络不稳定，请稍后再试"
    })
  }
})
//注册
router.post('/register',async(req,res)=>{
  // 1. 收集用户提交信息
  const {username,password,type} = req.body
  console.log(username,password,type)
  //2.判断用户是否合法
  if( !username || !password || !type){
    res.json({
      "code":2,
      "msg":"用户输入不合法"
    })
    return;
  }
  //3.去数据库中查找数据是否存在
  // Users.findOne({username})
  //   .then(data=>{
  //     console.log(data)//文档对象吧
  //     if(data){
  //       return Promise.reject({
  //         "code":1,
  //         "msg":"用户名已存在"
  //       })
  //     }else{
  //      return Users.create({username,password:md5(password),type})
  //     }
  //   })
  //   .catch(err=>{
  //     if(!err.code){
  //       err = {
  //         "code":3,
  //         "msg":"网络不稳定，请稍后再试"
  //       }
  //     }
  //     return Promise.reject(err)
  //   })
  //   .then(data=>{
  //     console.log(data)
  //     res.json({
  //       code:0,
  //       data:{
  //         _id: data.id,
  //         username:data.username,
  //         type:data.type
  //       }
  //     })
  //   })
  //   .catch(err=>{
  //     if(!err.code){
  //       err = {
  //         "code":3,
  //         "msg":"网络不稳定，请稍后再试"
  //       }
  //     }
  //     //返回失败响应
  //     res.json(err);
  //   })
  try{
    const data = await Users.findOne({username});
    if(data){
      res.json({
        "code":1,
        "msg":"用户名已存在"
      })
    }else{
      const data = await Users.create({username,password:md5(password),type});
      //返回成功的响应
      res.cookie('userid', data.id, {maxAge: 1000 * 3600 * 24 * 7});
      res.json({
        code:0,
        data:{
          _id:data.id,
          username:data.username,
          type:data.type
        }
      })
    }
  }catch (e){
    console.log(e)
    res.json({
      "code":3,
      "msg":"网络不稳定，请稍后再试"
    })
  }
})
// 更新用户信息的路由
router.post('/update', (req, res) => {
  // 从请求的cookie得到userid
  const userid = req.cookies.userid
  // 如果不存在, 直接返回一个提示信息
  if (!userid) {
    return res.json({code: 1, msg: '请先登陆'});
  }
  // 存在, 根据userid更新对应的user文档数据
  // 得到提交的用户数据
  const user = req.body // 没有_id
  Users.findByIdAndUpdate({_id: userid}, user)
    .then(oldUser => {
      if (!oldUser) {
        //更新数据失败
        // 通知浏览器删除userid cookie
        res.clearCookie('userid');
        // 返回返回一个提示信息
        res.json({code: 1, msg: '请先登陆'});
      } else {
        //更新数据成功
        // 准备一个返回的user数据对象
        const {_id, username, type} = oldUser;
        //此对象有所有的数据
        const data = Object.assign({_id, username, type}, user)
        // 返回成功的响应
        res.json({code: 0, data})
      }
    })
    .catch(error => {
      // console.error('登陆异常', error)
      res.send({code: 3, msg: '网络不稳定，请重新试试~'})
    })
})

module.exports = router

// (err,data)=>{
//   if(!err){
//     //方法没有出错
//     if(data){
//       res.json({
//         "code":1,
//         "msg":"用户已存在"
//       })
//     }else{
//       //4.将数据存在数据库中
//       Users.create({username,password:md5(password),type},(err,data)=>{
//         if(!err){
//           res.json({
//             code:0,
//             data:{
//               _id:data._id,
//               username:data.username,
//               password:data.password
//             }
//           })
//         }else{
//           //方法出错了
//           console.log(err)
//           console.log(1)
//           res.json({
//             "code":3,
//             "msg":"网络出错，请稍后再试"
//           })
//         }
//       })
//     }
//   }else{
//     //方法出错
//     res.json({
//       "code":3,
//       "msg":"网络出错，请稍后再试"
//     })
//   }
// }