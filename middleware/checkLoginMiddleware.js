//宣告登入檢測的 middleware
export default (req, res, next)=>{
    if(!req.session.username){
      return res.redirect('/login');
    }
    next();
  };