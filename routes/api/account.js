import { Router } from 'express';
const router = Router();
// 導入 jwt
import jwt from 'jsonwebtoken';

//導入 moment
import moment from 'moment';
import MemberModel, { find, findByIdAndDelete, findById, findByIdAndUpdate } from '../../models/MemberModel';
//導入中間件
import checkTokenMiddleware from '../../middleware/checkTokenMiddleware';
// 記帳本
router.get('/homepage/member', checkTokenMiddleware, async function(req, res, next) {
    try {
        // 從資料庫中讀取所有的帳單訊息，按時間降序排列
        try {
          let member = await find().sort({ time: -1 }).exec();
          res.json({
            code: '0000',
            msg: '讀取成功',
            data: member
          });
        } catch (error) {
          res.json({
            code: '1000',
            msg: '讀取失敗',
            data: null
          });
        }
      
    } catch (error) {
      res.json({
        code: '1000',
        msg: '讀取失敗',
        data: null
      });
    }
  });

// 新增紀錄
router.post("/homepage/member", checkTokenMiddleware, async (req, res) => {
  try {
    // 將日期轉成 Date 類型
    let member = new MemberModel({
      ...req.body,
      time: moment(req.body.time).toDate()
    });
    // 儲存到資料庫中
    await member.save();
    // 成功後重定向
    res.json({
        code: '0000',
        msg: '新增成功',
        data: member
    })
  } catch (error) {
    res.json({
        code: '1001',
        msg: '新增失敗',
        data: null
    });
  }
});

// 刪除記帳紀錄
router.delete('/homepage/member/:id', checkTokenMiddleware, async (req, res) => {
    try {
      // 獲得 params 的 id 參數
      let id = req.params.id;
      // 刪除記錄
      await findByIdAndDelete(id);
      // 提醒
      res.json({
        code: '0000',
        msg: '刪除成功',
        data: {}
      })
    } catch (error) {
        res.json({
            code: '1002',
            msg: '刪除失敗',
            data: null
          })
    }
  });

// 獲取單個資料訊息
router.get('/homepage/member/:id', checkTokenMiddleware, async function(req, res) {
    try {
        // 獲得 params 的 id 參數
        let id = req.params.id;
        // 查詢單筆記錄
        let member = await findById(id);
        // 如果找到記錄，回傳該記錄；否則回傳錯誤訊息
        if (member) {
            res.json({
                code: '0000',
                msg: '查詢成功',
                data: member
            });
        } else {
            res.json({
                code: '1014',
                msg: '找不到對應的記錄',
                data: null
            });
        }
    } catch (error) {
        res.json({
            code: '1004',
            msg: '查詢失敗！！',
            data: null
        });
    }
});

// 更新單筆訊息
router.patch('/homepage/member/:id', checkTokenMiddleware, async function(req, res){
    try {
        // 獲得 params 的 id 參數
        let id = req.params.id;
        // 更新記錄
        let member = await findByIdAndUpdate(id, req.body, { new: true });
        // 如果找到記錄，回傳該記錄；否則回傳錯誤訊息
        if(member){
            res.json({
                code: '0000',
                msg: '更新成功',
                data: member
            });
        } else {
            res.json({
                code: '1015',
                msg: '找不到可更新的記錄',
                data: null
            });
        }
    } catch (error) {
        res.json({
            code: '1005',
            msg: '更新失敗',
            data: null
        });
    }
});

export default router;
