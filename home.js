const express = require('express');
const app = express();
const home = express.Router();
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
home.get('/index/:page?',(req, res)=>{
    let jumlah = 0;
    console.log(req.cookies);
    connection.execute('SELECT SUM(bayar) AS jumlahKas FROM transaksi', (err, result, field)=>{
        jumlah += parseInt(result[0].jumlahKas);
    });
    if(!req.params.page ){
        req.params.page = 1;
    }
    connection.execute('SELECT nama FROM siswa',(err, result)=>{
        if(err)console.log(err.message);
        let {jumlahSetiapHalaman, jumlahHalaman, halamanAktif, awalData}= pagination(result.length, 7, req.params.page);
        connection.execute(`SELECT * FROM siswa LIMIT ${awalData}, ${jumlahSetiapHalaman}`, (err, result, field)=>{
            if(err) console.log(err.message);
            let {cookies} = req;
            console.log(cookies);
            req.baseUrl = 'http://localhost:8080/';
            res.render('index.ejs', {
                data:result,
                jumlahKas:jumlah,
                title:'Dashboard',
                baseUrl: req.baseUrl,
                cookies,
                jumlahHalaman,
                nomorData:awalData, 
                halamanAktif
            });
        });
    });

});

home.post('/index',(req, res)=>{
    req.baseUrl = 'http://localhost:8080/';
    const {nis, tglTransaksi, jmlPembayaran, tglBayar} = req.body;
    let statuss = '';
    if(jmlPembayaran < '500'){
        statuss = 'BELUM LUNAS';
    }else{
        statuss = 'LUNAS';
    }
    connection.execute('INSERT INTO transaksi SET nis = ?, bayar = ?, status = ?, tglBayar = ?, tgl_transaksi = ?',[
        nis, jmlPembayaran, statuss, tglBayar, tglTransaksi
    ], (err, field)=>{
        if(err) console.log(err.message);
        if(field.affectedRows > 0){
            res.cookie('flashData', `transaksi berhasil`, {path: `/home/index`,expires: new Date(Date.now() + 1000), encode: String});
            // res.clearCookie('flashData', {path:`${req.baseUrl}home`});
        }else{
            res.cookie('flashData', `transaksi gagal`, {path: `/home/index`,expires: new Date(Date.now() + 1000), encode: String});
        }
        res.redirect(`${req.baseUrl}home/index`);
    });
})

// home.get('/transaksi',(req, res)=>{
//     connection.execute('SELECT * FROM siswa', (err, result, field)=>{
//         // let cookk = qs.parse(res.cookie('flashData').getHeader('set-cookie').includes('undefined'))
//         // console.log(cookk)
//         let {cookies} = req;
        
//         if(err) console.log(err.message);
//         req.baseUrl = 'http://localhost:8080/';
//         res.render('transaksi.ejs', {
//             data:result,
//             baseUrl: req.baseUrl,
//             title:'Transaksi',
//             cookies    
//         });
//         // res.clearCookie('flashData', {path: `${req.baseUrl}home/transaksi`});
//     });

// });

home.get('/detail/fetch/:id', (req,res)=>{

    // connection.execute('UPDATE transaksi SET bayar = ? WHERE id = ?', [req.params.id])

    connection.execute('SELECT * FROM transaksi WHERE id = ?', [req.params.id], (err, result)=>{
        res.json({data:result});
    });
});

home.post('/detail/ubah', (req, res)=>{
    let status = '';
    req.baseUrl = 'http://localhost:8080/';
    let {id, jmlPembayaran} = req.body
    console.log(req.body);
    connection.execute('SELECT bayar FROM transaksi WHERE id = ?', [id], (err, result)=>{
        if(err)console.log(err.message);
        let total = (result[0].bayar + parseInt(jmlPembayaran))
        console.log(total);
        if(total == 500){
            status = 'LUNAS';
        }else{
            status = 'BELUM LUNAS';
        }
        connection.execute('UPDATE transaksi SET bayar = ?, status = ? WHERE id = ?', [total, status, id], (err, field)=>{
            if(err)console.log(err.message);
            console.log(field);
            if(field.affectedRows > 0){
                // ${req.baseUrl}home/index
                res.cookie('flashData', `Transaksi berhasil`, {path: `/home/index`,expires: new Date(Date.now() + 1000), encode: String});
            }else{
                res.cookie('flashData', `Transaksi gagal`, {path: `/home/index`,expires: new Date(Date.now() + 1000), encode: String});
            }
            res.redirect(`${req.baseUrl}home/index`);
            
        })
    });
});

home.get('/detail/:nis/:page',(req, res)=>{
    connection.execute('SELECT status FROM transaksi WHERE nis = ?', [req.params.nis],(err, result)=>{
        if(err)console.log(err.message);
        let {jumlahSetiapHalaman, jumlahHalaman, halamanAktif, awalData}= pagination(result.length, 7, req.params.page);
        connection.execute(`SELECT * FROM transaksi WHERE nis = ? LIMIT ${awalData}, ${jumlahSetiapHalaman}`,[req.params.nis], (err, result, field)=>{
            if(err) console.log(err.message);
            req.baseUrl = 'http://localhost:8080/';
            res.render('detail.ejs', {
                data:result,
                baseUrl: req.baseUrl,
                nis:req.params.nis,
                jumlahHalaman,
                nomorData:awalData, 
                halamanAktif
            });
        });
    });

    

});

home.get('/filter/:nis/:status/:page/:tglAwal?/:tglAkhir?', (req, res)=>{
    //jika req.params.status == ALL
    if(req.params.status == 'ALL'){
        if(req.params.tglAwal == undefined && req.params.tglAkhir == undefined){
            connection.execute('SELECT status FROM transaksi WHERE nis = ?', [req.params.nis],(err, result)=>{
                if(err)console.log(err.message);
                
                console.log(result.length)
                let {jumlahSetiapHalaman, jumlahHalaman, halamanAktif, awalData}= pagination(result.length, 7, req.params.page);
                connection.execute(`SELECT * FROM transaksi WHERE nis = ? LIMIT ${awalData}, ${jumlahSetiapHalaman}`,[req.params.nis], (err, result, field)=>{
                    if(err) console.log(err.message);
                    res.json({data:result, jumlahSetiapHalaman, jumlahHalaman, halamanAktif, awalData, status:req.params.status});
                });
            });
            
        }else if(req.params.tglAkhir == undefined && req.params.tglAwal !== undefined){
            connection.execute(`SELECT status FROM transaksi WHERE nis = ? AND tglBayar >= '${req.params.tglAwal}'`, [req.params.nis],(err, result)=>{
                if(err)console.log(err.message);
                let {jumlahSetiapHalaman, jumlahHalaman, halamanAktif, awalData}= pagination(result.length, 7, req.params.page);
                connection.execute(`SELECT * FROM transaksi WHERE nis = ? AND tglBayar >= '${req.params.tglAwal}'  ORDER BY tglBayar ASC LIMIT ${awalData}, ${jumlahSetiapHalaman} `,[req.params.nis], (err, result)=>{
                    if(err)console.log(err.message);
                    res.json({data:result, jumlahSetiapHalaman, jumlahHalaman, halamanAktif, awalData, tglAwal:req.params.tglAwal, status:req.params.status});
                });
            })
        }else{


            connection.execute(`SELECT status FROM transaksi WHERE nis = ? AND tglBayar BETWEEN '${req.params.tglAwal}' 
            AND '${req.params.tglAkhir}'`, [req.params.nis],(err, result)=>{
                if(err)console.log(err.message);
                let {jumlahSetiapHalaman, jumlahHalaman, halamanAktif, awalData}= pagination(result.length, 7, req.params.page);
                connection.execute(`SELECT * FROM transaksi WHERE nis = ? AND tglBayar BETWEEN '${req.params.tglAwal}' 
                AND '${req.params.tglAkhir}' ORDER BY tglBayar ASC LIMIT ${awalData}, ${jumlahSetiapHalaman}`,[req.params.nis], (err, result)=>{
                    if(err)console.log(err.message);
                    res.json({data:result, jumlahSetiapHalaman, jumlahHalaman, halamanAktif, awalData, tglAwal:req.params.tglAwal, tglAkhir:req.params.tglAkhir, status:req.params.status});
                });
            });
        }
    }//akhir if req.params.status == ALL
    //===========================================================================================================
    else{

        if(req.params.tglAwal == undefined && req.params.tglAkhir == undefined){
            connection.execute('SELECT status FROM transaksi WHERE nis = ? AND status = ?', [req.params.nis, req.params.status],(err, result)=>{
                if(err)console.log(err.message);
                
                console.log(result.length)
                let {jumlahSetiapHalaman, jumlahHalaman, halamanAktif, awalData}= pagination(result.length, 7, req.params.page);
                connection.execute(`SELECT * FROM transaksi WHERE nis = ? AND status = ? LIMIT ${awalData}, ${jumlahSetiapHalaman}`,[req.params.nis, req.params.status], (err, result, field)=>{
                    if(err) console.log(err.message);
                    res.json({data:result, jumlahSetiapHalaman, jumlahHalaman, halamanAktif, awalData, status:req.params.status});
                });
            });
            
        }else if(req.params.tglAkhir == undefined && req.params.tglAwal !== undefined){
            connection.execute(`SELECT status FROM transaksi WHERE nis = ? AND status = ? AND tglBayar >= '${req.params.tglAwal}'`, [req.params.nis, req.params.status],(err, result)=>{
                if(err)console.log(err.message);
                let {jumlahSetiapHalaman, jumlahHalaman, halamanAktif, awalData}= pagination(result.length, 7, req.params.page);
                connection.execute(`SELECT * FROM transaksi WHERE nis = ? AND status = ? AND tglBayar >= '${req.params.tglAwal}'  ORDER BY tglBayar ASC LIMIT ${awalData}, ${jumlahSetiapHalaman} `,[req.params.nis, req.params.status], (err, result)=>{
                    if(err)console.log(err.message);
                    res.json({data:result, jumlahSetiapHalaman, jumlahHalaman, halamanAktif, awalData, tglAwal:req.params.tglAwal, status:req.params.status});
                });
            })
        }else{


            connection.execute(`SELECT status FROM transaksi WHERE nis = ? AND status = ? AND tglBayar BETWEEN '${req.params.tglAwal}' 
            AND '${req.params.tglAkhir}'`, [req.params.nis, req.params.status],(err, result)=>{
                if(err)console.log(err.message);
                let {jumlahSetiapHalaman, jumlahHalaman, halamanAktif, awalData}= pagination(result.length, 7, req.params.page);
                connection.execute(`SELECT * FROM transaksi WHERE nis = ? AND status = ? AND tglBayar BETWEEN '${req.params.tglAwal}' 
                AND '${req.params.tglAkhir}' ORDER BY tglBayar ASC LIMIT ${awalData}, ${jumlahSetiapHalaman}`,[req.params.nis, req.params.status], (err, result)=>{
                    if(err)console.log(err.message);
                    res.json({data:result, jumlahSetiapHalaman, jumlahHalaman, halamanAktif, awalData, tglAwal:req.params.tglAwal, tglAkhir:req.params.tglAkhir, status:req.params.status});
                });
            });
        }

    }

});

home.get('/tambah/:jurusan?', (req, res)=>{
    req.baseUrl = 'http://localhost:8080/';
    const {cookies} = req;
    if(req.params.jurusan){
        connection.execute(`SELECT jurusan.id_jurusan, jurusan.jurusan, GROUP_CONCAT(kelas.kelas) AS kelas FROM jurusan, kelas WHERE jurusan.id_jurusan = '${req.params.jurusan}' AND jurusan.id_jurusan = kelas.jurusan GROUP BY jurusan`, (err, result)=>{
            res.json({data:result});
        });
    }else{
    //query jurusan
        connection.execute(`SELECT jurusan.id_jurusan, jurusan.jurusan, GROUP_CONCAT(kelas.kelas) AS kelas FROM jurusan, kelas WHERE jurusan.id_jurusan = kelas.jurusan GROUP BY jurusan`, (err, result)=>{
            // let oke = await convKelas(result);
            res.render('tambah.ejs', {
                baseUrl:req.baseUrl,
                title:'tambah siswa',
                jurusan:result,
                cookies
            });
        });
    }
});

home.post('/tambah', (req, res)=>{
    let {nis, nama, kelas, jurusan} = req.body;
    req.baseUrl = 'http://localhost:8080/';
    jurusan = jurusan.split(',');
    let [id_jurusan, jurusann] = jurusan;
    connection.execute('INSERT INTO siswa SET nis = ?, nama = ?, kelas = ?, jurusan = ?', [
        nis, nama, kelas, jurusann
    ], (err, field)=>{
        if(err)console.log(err.message);
        if(field.affectedRows > 0){
            res.cookie('flashData', `Data berhasil ditambahkan`, {path: `/home/tambah`,expires: new Date(Date.now() + 1000), encode: String});
            // res.clearCookie('flashData', {path:`${req.baseUrl}home`});
        }else{
            res.cookie('flashData', `Data gagal ditambahkan`, {path: `/home/tambah`,expires: new Date(Date.now() + 1000), encode: String});
        }
        res.redirect(`${req.baseUrl}home/tambah`);
    });
});

home.get('/cari/:page/:keyword?', (req, res)=>{
    
    if(req.params.keyword == undefined){
        connection.execute(`SELECT nama FROM siswa`,(err, result)=>{

            if(err)console.log(err.message);
            let {jumlahSetiapHalaman, jumlahHalaman, halamanAktif, awalData}= pagination(result.length, 7, req.params.page);
            connection.execute(`SELECT * FROM siswa LIMIT ${awalData}, ${jumlahSetiapHalaman}`, (err, result)=>{

                if(err)console.log(err.message);
                res.json({data:result, jumlahSetiapHalaman, jumlahHalaman, halamanAktif, awalData});
            });
        });
    }else{
        connection.execute(`SELECT nama FROM siswa WHERE nis LIKE '%${req.params.keyword}%' OR nama LIKE '%${req.params.keyword}%' 
        OR kelas LIKE '%${req.params.keyword}%' OR jurusan LIKE '%${req.params.keyword}%'`,(err, result)=>{

            if(err)console.log(err.message);
            let {jumlahSetiapHalaman, jumlahHalaman, halamanAktif, awalData}= pagination(result.length, 7, req.params.page);
            connection.execute(`SELECT * FROM siswa WHERE nis LIKE '%${req.params.keyword}%' OR nama LIKE '%${req.params.keyword}%' 
            OR kelas LIKE '%${req.params.keyword}%' OR jurusan LIKE '%${req.params.keyword}%' LIMIT ${awalData}, ${jumlahSetiapHalaman}`, (err, result)=>{

                if(err)console.log(err.message);
                res.json({data:result, jumlahSetiapHalaman, jumlahHalaman, halamanAktif, awalData});
            });
        });
    }

});

function pagination(leng, jmlDataPerHalaman, hlmnAktif){
    let jumlahData = leng;
    let jumlahSetiapHalaman = jmlDataPerHalaman;
    let jumlahHalaman = Math.ceil(jumlahData/jumlahSetiapHalaman);
    let halamanAktif = parseInt(hlmnAktif);
    let awalData = (halamanAktif * jumlahSetiapHalaman) - jumlahSetiapHalaman;

    return {jumlahData, jumlahSetiapHalaman, jumlahHalaman, halamanAktif, awalData};
}


// function convKelas(result){
//     return result.forEach(j=>{
//         return j.split(',');
//     })
// }
module.exports = home;