import { Schema, model } from 'mongoose';

// 定義 schema
const MemberSchema = new Schema({
    guest:{type:String, required: true},
    time: Date,
    relation:{type: String, require: true},
    remarks:{type: String}
});

// 創建模型對象，對文檔的操作對象
const MemberModel = model('member', MemberSchema);

export default MemberModel;