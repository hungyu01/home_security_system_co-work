/**
 * 
 * @param {*} success 資料庫連接成功的回應
 * @param {*} error   資料庫連接失敗的回應
*/
const mongoose = require('mongoose');
const {DBHOST, DBPORT, DBNAME} =  require('../config/config');

module.exports = function(success, error) {
    // 設置 strictQuery 避免開啟時出現警告提醒
    mongoose.set('strictQuery', true);

    if(typeof error !== 'function'){
        //將 error 放在樣板中
        error = () =>{
            console.log('連接失敗~~')
        }
    }

    // 連線 MongoDB
    mongoose.connect(`mongodb://${DBHOST}:${DBPORT}/${DBNAME}`, { useNewUrlParser: true, useUnifiedTopology: true });

    // 連接成功的回調
    mongoose.connection.once('open', () => {
        success();
    });

    // 連接失敗的回調
    mongoose.connection.on('error', (err) => {
        error(err);
    });

    // 連接關閉的回調
    mongoose.connection.on('close', () => {
        console.log('連接關閉');
    });
};
