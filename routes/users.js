const router = require('koa-router')()
const { User } = require('../config/model')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const keys = require('../config/key')

router.prefix('/api')

router.get('/', function (ctx, next) {
  ctx.body = 'this is a users response!'
})


/**
 * @register 
 *  注册api
 */
router.post('/register', async (ctx, next) => {
  const retFind = await User.find({email: ctx.request.body.email})
  if (retFind.length > 0) {
    ctx.status = 500
    ctx.body = {'msg': '邮箱被占用'}
  } else {
    let newUser = new User({
      username: ctx.request.body.username,
      password: ctx.request.body.password,
      email: ctx.request.body.email
    })

    await newUser.save().then(user => {
      ctx.body = {'msg': 'success'}
    }).catch(err => {
      console.log(err)
    })
    // ctx.body = newUser
  }
})

/**
 * @login 
 *  登录 api
 */
router.post('/login', async (ctx, next) => {
  const body = ctx.request.body
  
  const retFind = await User.find({username: body.username})

  // 判断是否存在用户
  if (retFind.length == 0) {
    ctx.status = 412
    ctx.body = {'msg': '该用户未注册'}
  } else {
    // 验证密码
    let retPassword = await bcrypt.compareSync(body.password, retFind[0].password)
    if (!retPassword) {
      ctx.status = 412
      ctx.body = {'msg': 'password invalid'}
    } else {
      ctx.status = 200
      // ctx.body = {'msg': 'success'}

      // 生成token
      let token = jwt.sign({id: String(retFind[0]._id)}, keys.secretOrKey, {expiresIn: 3500})
      ctx.body = {_id: retFind[0]._id, token:"Bearer:" + token}
    }
  }


})


/**
 * @profile 
 *  验证token
 */
router.get('/profile', async (ctx, next) => {
  // const body = ctx.request.body
  const raw = String(ctx.request.headers.authorization).split(' ').pop()
  const { id } = jwt.verify(raw, keys.secretOrKey)
  const retFind = await User.findById(id)
  ctx.body = {id: retFind._id, username: retFind.username, email: retFind.email}
})

module.exports = router
