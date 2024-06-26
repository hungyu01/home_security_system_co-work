const mongoose = require('mongoose');

// 定義 schema
const MemberSchema = new mongoose.Schema({
    username: String,
    password: String
});
// 創建模型對象，對文檔的操作對象
const MemberModel = mongoose.model('member', MemberSchema);

module.exports = MemberModel;