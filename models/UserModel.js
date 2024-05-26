const mongoose = require('mongoose');

// 定義書籍 schema
const UserSchema = new mongoose.Schema({
    username: String,
    password: String
});
// 創建模型對象，對文檔的操作對象
const UserModel = mongoose.model('users', UserSchema);

module.exports = UserModel;