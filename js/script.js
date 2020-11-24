$(function(){
    $(".datepicker").datepicker({
        format: 'yyyy-mm-dd',
        autoclose: true,
        todayHighlight: true,
    });
   });

function bayar(element){
    const nis = document.querySelector('#nis');
    nis.value = element.dataset.nis;
}

function cari(){

    let keyword = document.querySelector('#keyword');
    let url = '';
    if(keyword.value == '') url = `http://localhost:8080/home/cari/1`;
    else url = `http://localhost:8080/home/cari/1/${keyword.value}`;
    
    fetch(url)
        .then(response=> response.json().then(response=>{
            console.log(response);
            cetakFilter(response.data, response.awalData);
            cetakPagination(response, keyword.value);
        }))

}

function cetakPagination(respon, keyword){
    // document.querySelector('.paginasi').innerHTML = '';
    console.log('ini keyword' + keyword)
    document.querySelector('.paginasi').innerHTML = '';
    let oke = '';
    oke += `
    <ul class="pagination">
    `;
    if(respon.halamanAktif > 1){
        oke += `
        <li class="page-item"><a class="page-link" onclick="prev(${keyword}, ${respon.halamanAktif-1})">Previous</a></li>
        `;
    }

    new Promise((resolve, reject)=>{
        for(let j = 0; j < respon.jumlahHalaman; j++){
            oke +=`
            <li class="page-item"><a class="page-link" onclick="page(${keyword}, ${j+1})">${j+1}</a></li>
            `;
        }
        resolve(oke);
    }).then((resp)=>{
        if(respon.halamanAktif < respon.jumlahHalaman){
            // let tg = [];
            // let tglawal = respon.tglAwal.split('-');
            // tglawal = tglawal.join('L').toString();
            // tg.push(tglawal)
            // console.log(tg)
            resp +=`
            <li class="page-item"><a class="page-link" onclick="next(${keyword}, ${respon.halamanAktif+1})">Next</a></li>
            `;
        }
        resp +=`
        </ul>
        `;
        console.log( document.querySelector('.paginasi'))
        console.log( resp)
        document.querySelector('.paginasi').innerHTML = resp;
    })
    
    
    
    
}

function page(keyword,halamanAktif){
    let url = '';
    url =  `http://localhost:8080/home/cari/${halamanAktif}/${keyword}`;
    fetch(url)
    .then(resp => resp.json().then(resp => {
        console.log(resp)
        cetakFilter(resp.data, resp.awalData);
        cetakPagination(resp, keyword);
    }));
}
function prev(keyword, halamanAktif){
    let url = '';
    url =  `http://localhost:8080/home/cari/${halamanAktif}/${keyword}`;
    fetch(url)
    .then(resp => resp.json().then(resp => {
        console.log(resp)
        cetakFilter(resp.data, resp.awalData);
        cetakPagination(resp, keyword);
    }));
}
function next(keyword,halamanAktif){
    let url = ``;
    url =  `http://localhost:8080/home/filter/${halamanAktif}/${keyword}`;
    console.log(url)
    fetch(url)
    .then(resp => resp.json().then(resp => {
        console.log(resp) 
        console.log(keyword) 
        cetakFilter(resp.data, resp.awalData);
        cetakPagination(resp, keyword);
      
    }));
}

function cetakFilter(resp, awalData){
    console.log(resp)
    let i = parseInt(awalData);
    console.log(document.querySelector('tbody'))
    document.querySelector('tbody').innerHTML = '';
    console.log(document.querySelector('tbody'))
    // <% let i = 0; %>
    // <% data.forEach(d => { %>
    // <tr>
    //     <th scope="row"><%=++i;%></th>
    //     <td><%=d.nis%></td>
    //     <td><%=d.nama%></td>
    //     <td><%=d.kelas%></td>
    //     <td><%=d.jurusan%></td>
    //     <td><a href="" class="badge badge-success mr-2" onclick="bayar(this)" data-toggle="modal" data-nis="<%=d.nis%>" data-target="#transaksiKas">Bayar</a><a href="<%=baseUrl;%>home/detail/<%=d.nis%>/1" class="badge badge-primary">Detail</a></td>
    // </tr>    
    resp.forEach(d=>{
        document.querySelector('tbody').innerHTML +=  `
        <tr>
            <th scope="row">${++i}</th>
            <td>${d.nis}</td>
            <td>${d.nama}</td>
            <td>${d.kelas}</td>
            <td>${d.jurusan}</td>
            <td><a href="" class="badge badge-success mr-2" onclick="bayar(this)" data-toggle="modal" data-nis="${d.nis}" data-target="#transaksiKas">Bayar</a>
            <a href="http://localhost:8080/home/detail/${d.nis}/1" class="badge badge-primary">Detail</a>
            </td>
        </tr>       
        `;
    });
   
}