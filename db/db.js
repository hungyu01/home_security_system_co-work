/**
 * 
 * @param {*} success 資料庫連接成功的回應
 * @param {*} error   資料庫連接失敗的回應
*/
import { set, connect, connection } from 'mongoose';
import { DBHOST, DBPORT, DBNAME } from '../config/config';

export default function(success, error) {
    // 設置 strictQuery 避免開啟時出現警告提醒
    set('strictQuery', true);

    if(typeof error !== 'function'){
        //將 error 放在樣板中
        error = () =>{
            console.log('連接失敗~~')
        }
    }

    // 連線 MongoDB
    connect(`mongodb://${DBHOST}:${DBPORT}/${DBNAME}`);

    // 連接成功的回調
    connection.once('open', () => {
        success();
    });

    // 連接失敗的回調
    connection.on('error', (err) => {
        error(err);
    });

    // 連接關閉的回調
    connection.on('close', () => {
        console.log('連接關閉');
    });
};
