var express = require('express');
var router = express.Router();

const db = require("../config/mysql");
const conn = db.init();

// 회원가입
router.post('/', function (req, res, next) {
    var sql = "insert into user values (?, ?, ?, ?, ?, ?)"
    var params = [req.body.id, req.body.password, req.body.gender, req.body.birth, req.body.weight, req.body.height]
    conn.query(sql, params, function (err, result) {
        if (err) {
            console.log("query is not excuteds: " + err);
            res.send("duplicate fail")
        } else {
            // 회원가입 시 유저 운동 세트 및 목표치 설정 알고리즘 들어가는 부분(현재는 스쿼트로 고정)
            var sql = "insert into user_exercise values (?,?,?,?)"
            var params = [null, req.body.id, "squarts", 20]
            console.log(sql)
            console.log(params)
            conn.query(sql, params, function (err, result) {
                if (err) console.log("query is not excuteds: " + err);
                else {
                    res.send("success");
                }
            })
        }
    })
});

// 유저 정보 id로 가져오기
router.get('/:id', function (req, res, next) {
    console.log(req.params.id)
    var sql = "select * from user where id = ?";
    var params = [req.params.id]
    conn.query(sql, params, function (err, result) {
        if (err) {
            console.log("query is not excuted: " + err);
            res.send("fail")
        } else res.send(result);
    })
});

// 로그인
router.post('/login', function (req, res, next) {
    console.log(req.body.id)
    console.log(req.body.password)

    var sql = "select * from user where id = ? and password = ?";
    var params = [req.body.id, req.body.password]
    conn.query(sql, params, function (err, result) {
        if (err) {
            console.log("query is not excuted: " + err);
            res.send("fail")
        } else if (result.length !== 1) {
            res.send("fail")
        } else {
            res.send(result[0])
        }
    })
})

// 유저별 운동세트 가져오
router.get('/:id/exercise-set', function (req, res, next) {
    console.log(req.params.id)
    var sql = "select * from user_exercise where user_id = ?";
    var params = [req.params.id]
    conn.query(sql, params, function (err, user_info) {
        if (err) {
            console.log("query is not excuted: " + err);
            res.send("fail")
        } else res.send(user_info)
    })
});

// 유저 운동 기록 가져오기
router.get('/exercise-record/:id', function (req, res, next) {
    console.log(req.params.id)
    var sql = "select id, user_exercise_id, target_count, do_count, CONVERT_TZ(work_date, '+0:00', '+9:00') as work_date from user_exercise_record where user_exercise_id = ? order by id desc";
    var params = [req.params.id]
    conn.query(sql, params, function (err, user_info) {
        if (err) {
            console.log("query is not excuted: " + err);
            res.send("fail")
        } else res.send(user_info)
    })
});

// 유저 운동 기록 입력하기
router.post('/exercise-record', function (req, res, next) {
    console.log(req.body)
    var sql = "insert into user_exercise_record values (?,?, ?, ?)";
    var params = [null, req.body.user_exercise_id, req.body.target_count, req.body.do_count]
    conn.query(sql, params, function (err, user_info) {
        if (err) {
            console.log("query is not excuted: " + err);
            res.send("fail")
        } else res.send("success")
    })
});

// 유저 운동 기록 일주일 치 가져오기 => 그래프용
router.get('/exercise-record/:id/week', function (req, res, next) {
    console.log(req.params.id)
    var sql = "select id, user_exercise_id, target_count, do_count, CONVERT_TZ(work_date, '+0:00', '+9:00') as work_date from user_exercise_record\n" +
        "where user_exercise_id = ? AND work_date >= DATE_SUB(NOW(), INTERVAL 1 WEEK) order by id desc";
    var params = [req.params.id]
    conn.query(sql, params, function (err, user_info) {
        if (err) {
            console.log("query is not excuted: " + err);
            res.send("fail")
        } else res.send(user_info)
    })
});

module.exports = router;
