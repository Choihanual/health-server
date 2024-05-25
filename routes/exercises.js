var express = require('express');
var router = express.Router();

const db = require("../config/mysql");
const conn = db.init();

// 회원가입
router.post('/', function(req, res, next) {
    var sql = "insert into user values (?, ?, ?, ?, ?, ?)"
    var params = [req.body.id, req.body.password, req.body.gender, req.body.birth, req.body.weight, req.body.height]
    conn.query(sql, params, function (err, result) {
        if (err) console.log("query is not excuted: " + err);
        else res.send("success");
    })
});



module.exports = router;
