const mongoose = require('mongoose');

// 定義 schema
const ChatSchema = new mongoose.Schema({
    name:{type:String, required: true},
    chat:{type: String, required: true}
});

// 創建模型對象，對文檔的操作對象
const ChatModel = mongoose.model('chats', ChatSchema);

module.exports = ChatModel;