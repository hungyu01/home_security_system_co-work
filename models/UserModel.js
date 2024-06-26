import { Schema, model } from 'mongoose';

// 定義 schema
const UserSchema = new Schema({
    username: String,
    password: String
});
// 創建模型對象，對文檔的操作對象
const UserModel = model('users', UserSchema);

export default UserModel;