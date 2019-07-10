const mongoose = require('mongoose')

// 连接数据哭
mongoose.connect('mongodb://localhost:27017/koa', {
  useNewUrlParser: true,
  useFindAndModify: true
})

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    set(val) {
      return require('bcrypt').hashSync(val, 10)
    },
    required: true
  },
  email: {
    type: String,
    default: `&{username}@test.com`,
    required: true
  }
})

const User = mongoose.model('User', UserSchema)

// User.create({
//   username: 'xians1',
//   password: '123123',
//   email: 'test@test.com'
// })

// 暴露模块
module.exports = { User }
