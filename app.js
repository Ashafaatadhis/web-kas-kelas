const express = require('express');
const app = express();
const home = require('./home.js');
const mysql = require('mysql2');
const cookieParser = require('cookie-parser');
const connection = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database:'kas'
});

app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(express.static('public'));

app.use('/home', home);

app.listen(8080, () => {
    console.log('server running...');
});

