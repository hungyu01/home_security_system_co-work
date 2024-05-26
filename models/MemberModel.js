const mongoose = require('mongoose');

// 定義書籍 schema
const MemberSchema = new mongoose.Schema({
    guest:{type:String, required: true},
    time: Date,
    relation:{type: String, require: true},
    remarks:{type: String}
});

// 創建模型對象，對文檔的操作對象
const MemberModel = mongoose.model('member', MemberSchema);

module.exports = MemberModel;