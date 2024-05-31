
var express = require('express');
var router = express.Router();


// 근전도 센서 데이터
router.post('/', function(req, res, next) {
    console.log(req.app.io);

    req.app.io.emit('data', req.body.data);

    res.send("success")
});



module.exports = router;
