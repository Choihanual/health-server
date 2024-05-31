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
            var birthDate = new Date(req.body.birth.substr(0, 4),
                req.body.birth.substr(4,2) -1,
                req.body.birth.substr(6,2));
            var currentDate = new Date();
            var age = currentDate.getFullYear() - birthDate.getFullYear()
            if (currentDate < new Date(currentDate.getFullYear(), birthDate.getMonth(), birthDate.getDate())) {
                age--;
            }

            const baseSquatCount = 30;
            const ageAdjustment = Math.floor(age /5);
            const weightAdjustment = Math.floor(req.body.weight / 10);
            const heightAdjustment = Math.floor(req.body.height / 100);
            let recommendedCount = baseSquatCount - ageAdjustment - weightAdjustment - heightAdjustment;
            if (recommendedCount < 5) {
                recommendedCount = 5;
            }

            var sql = "insert into user_exercise values (?,?,?,?)"
            var params = [null, req.body.id, "squats", recommendedCount]
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

// 유저별 운동세트 가져오기
router.get('/:id/exercise-set', function (req, res, next) {
    var sql = "select * from user_exercise where user_id = ?";
    var params = [req.params.id]
    conn.query(sql, params, function (err, result){
        if (err) {
            console.log("err err", err)
        } else {
            // 마지막 유저의 운동 횟수로 다음 운동 목표 횟수 설정 알고리즘
            console.log(result)
            var sql = "select id, do_count from user_exercise_record where user_exercise_id = ? order by id desc limit 1"
            var params = [result[0].user_exercise_id]
            conn.query(sql, params, function (err, exercise_record){
                if (err) {
                    console.log("err err", err)
                } else {
                    // 마지막 유저의 운동 횟수로 다음 운동 목표 횟수 설정 알고리즘
                    console.log(exercise_record)
                    if (exercise_record.length !== 0) {
                        var sql = "select * from user where id = ?"
                        var params = [req.params.id]
                        conn.query(sql, params, function(err, user_info) {
                            if (err) {
                                console.log("err err", err)
                            } else {
                                const bmi = user_info[0].weight / ((user_info[0].height/100)*(user_info[0].height/100))
                                var count = 0
                                // 비만인 경우 이전 기록의 +1
                                if (bmi >= 30) {
                                    count = exercise_record[0].do_count + 1
                                    // 과체중인 경우 이전 기록의 +2
                                } else if (bmi >= 25) {
                                    count = exercise_record[0].do_count + 2
                                    // 정상인 경우 이전 기록의 +3
                                } else {
                                    count = exercise_record[0].do_count + 3
                                }

                                var sql = "Update user_exercise SET target_count = ? WHERE user_exercise_id = ?"
                                var params = [count, result[0].user_exercise_id]
                                conn.query(sql, params, function(err, update_result){
                                    if (err) {
                                        console.log(err)
                                    } else {
                                        console.log("good")
                                    }
                                })

                            }
                        })

                    }
                }
            })
        }
    })



    var sql = "select * from user_exercise where user_id = ?";
    var params = [req.params.id]
    conn.query(sql, params, function (err, user_info) {
        if (err) {
            console.log("query is not excuted: " + err);
            res.send("fail")
        } else {


            res.send(user_info)
        }
    })
});

// 유저 운동 기록 가져오기
router.get('/exercise-record/:id', function (req, res, next) {
    console.log(req.params.id)
    var sql = "select id, user_exercise_id, user_id, exercise_name, target_count, do_count, CONVERT_TZ(work_date, '+0:00', '+9:00') as work_date from user_exercise_record where user_id = ? order by id desc";
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
    var workDate = new Date(req.body.work_date.substr(0, 4),
        req.body.work_date.substr(4,2) -1,
        req.body.work_date.substr(6,2));
    var sql = "select * from user_exercise where user_id = ? and exercise_name = ?"
    var params = [req.body.user_id, req.body.exercise_name]
    conn.query(sql, params, function(err, result){
        if (err) {
            console.log(err);
            res.send("fail")
        } else {
            var sql = "insert into user_exercise_record values (?,?, ?, ?, ?,?,?)";
            var params = [null, result[0].user_exercise_id, req.body.target_count, req.body.do_count, workDate, req.body.exercise_name, req.body.user_id]
            conn.query(sql, params, function (err, user_info) {
                if (err) {
                    console.log("query is not excuted: " + err);
                    res.send("fail")
                } else res.send("success")
            })
        }
    })
});

// 유저 운동 기록 일주일 치 가져오기 => 그래프용
router.get('/exercise-record/:id/week', function (req, res, next) {
    console.log(req.params.id)
    var sql = "select id, user_exercise_id, user_id, exercise_name, target_count, do_count, CONVERT_TZ(work_date, '+0:00', '+9:00') as work_date from user_exercise_record\n" +
        "where user_id = ? AND work_date >= DATE_SUB(NOW(), INTERVAL 1 WEEK) order by id desc";
    var params = [req.params.id]
    conn.query(sql, params, function (err, user_info) {
        if (err) {
            console.log("query is not excuted: " + err);
            res.send("fail")
        } else res.send(user_info)
    })
});

module.exports = router;
