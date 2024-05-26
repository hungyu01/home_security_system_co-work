//宣告登入檢測的 middleware
module.exports = (req, res, next)=>{
    if(!req.session.username){
      return res.redirect('/login');
    }
    next();
  };