const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
const jwt = require('jsonwebtoken')
const { createPool } = require('mysql2')

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
    if(req.path == '/login') return next()
    try {
        const authheader =  req.headers.authorization
        jwt.verify(authheader.split(' ')[1], "123456")   
        return next();
    }
    catch {
        return res.status(400).json({
            code: -1,
            message: 'ไม่มีสิทธิ์'
        })
    }
})

const pool = createPool({
    charset: "utf8",
    namedPlaceholders: true,
    host: '127.0.0.1',
    port: 3306,
    user: "root",
    password: "",
    database: "gosoft_hw"
})

app.post('/login', (req, res) => {
    if (req.body.user == "admin" && req.body.pass == "1234") {
        const token = jwt.sign({ username: "admin" }, "123456")
        return res.status(200).json({
            code: 1,
            message: 'OK',
            data: token
        })
    }
    return res.status(400).json({
        code: -1,
        message: 'ERROR'
    })
})

app.get('/user', function (req, res, next) {
    pool.query('select * from employee', (err, val) => {
        console.log({ err, val })
        if (err) {
            return res.status(400).json({
                code: -1,
                message: 'ERROR'
            })
        }
        return res.status(200).json({
            code: 1,
            message: 'OK',
            data: val
        })
    })
});

app.post('/user', function (req, res, next) {
    pool.query('insert into employee (firstname, lastname, position, tel, email) value (:fn, :ln, :pos, :tel, :mail)', {
        fn: req.body.firstname,
        ln: req.body.lastname,
        pos: req.body.position,
        tel: req.body.phone,
        mail: req.body.email
    }, (err, val) => {
        if (err) {
            return res.status(400).json({
                code: -1,
                message: 'ERROR'
            })
        }
        return res.status(200).json({
            code: 1,
            message: 'OK'
        })
    })
});

app.put('/user/:id', function (req, res, next) {
    pool.query('update employee set position = :pos, tel = :tel, email = :mail where id = :id', {
        pos: req.body.position,
        tel: req.body.phone,
        mail: req.body.email,
        id: req.params.id
    }, (err, val) => {
        if (err) {
            return res.status(400).json({
                code: -1,
                message: 'ERROR'
            })
        }
        if (val.affectedRows == 0) return res.status(400).json({
            code: -1,
            message: 'ข้อมูลผิดพลาด'
        })
        return res.status(200).json({
            code: 1,
            message: 'OK'
        })
    })
})

app.delete('/user/:id', function (req, res, next) {
    pool.query('delete from employee where id = :id', {
        id: req.params.id
    }, (err, val) => {
        if (err) {
            return res.status(400).json({
                code: -1,
                message: 'ERROR'
            })
        }
        if (val.affectedRows == 0) return res.status(400).json({
            code: -1,
            message: 'ข้อมูลผิดพลาด'
        })
        return res.status(200).json({
            code: 1,
            message: 'OK'
        })
    })
})

app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`);
});