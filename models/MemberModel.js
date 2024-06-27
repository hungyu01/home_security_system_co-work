const mongoose = require('mongoose');

// 定義 schema
const MemberSchema = new mongoose.Schema({
    guest:{type:String, required: true},
    phone:{type: String, require:true},
    time: Date,
    relation:{type: String, require: true},
    remarks:{type: String}
});

// 創建模型對象，對文檔的操作對象
const MemberModel = mongoose.model('members', MemberSchema);

module.exports = MemberModel;