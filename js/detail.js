let hitungCekBayar = 0;
let bayarCekBayar = '';

//ada bug disini
// document.body.addEventListener('click', ()=>{
//     bayarClose();
// });

function bayarClose(){
    hitungCekBayar = 0;
    console.log('klik')
}
function cekBayar(element){
    hitungCekBayar++; 
    console.log(hitungCekBayar);
    if(hitungCekBayar == 1){
         bayarCekBayar = element.value;
         console.log('true')
    }
    if(parseInt(element.value) > parseInt(bayarCekBayar)){
        console.log('false')
        element.value = bayarCekBayar;
    }
    console.log(bayarCekBayar);
    console.log(hitungCekBayar);
}

function bayar(element){
    const nis = document.querySelector('#nis');
    const jmlPembayaran = document.querySelector('#jmlPembayaran');
    const tglBayar = document.querySelector('#tglBayar');
    const id = document.querySelector('#id');
    jmlPembayaran.value = '';
    tglBayar.value = '';
    console.log(element.dataset.id);
    fetch(`http://localhost:8080/home/detail/fetch/${element.dataset.id}`)
        .then((response)=> response.json().then(response=>{
            let tanggal = new Date(response.data[0].tglBayar)
            console.log(response.data[0]);
            
            jmlPembayaran.value = (500-response.data[0].bayar);
            id.value = response.data[0].id;  
            let tgl = `${tanggal.getDate()}-${tanggal.getMonth()+1}-${tanggal.getFullYear()}`;
            tglBayar.value = tgl;
        }));
}

function filter(){
    const tglAwal = document.querySelector('#tanggalAwal');
    const tglAkhir = document.querySelector('#tanggalAkhir');
    const status = document.querySelector('#status');
    console.log(status.value == 'ALL');
    console.log(typeof tglAwal.value)
    const nis = document.querySelector('#nis');
    if(tglAwal.value === '' && tglAkhir.value === ''){

        fetch(`http://localhost:8080/home/filter/${nis.value}/${status.value}/1`)
        .then(resp => resp.json().then(resp => {
            
            cetakFilter(resp.data, resp.awalData);
            cetakPagination(resp, nis.value);
        }));

    }else if(tglAkhir.value === '' && tglAwal.value !== ''){
        console.log(typeof tglAwal.value.toString())
        console.log(`http://localhost:8080/home/filter/${nis.value}/${status.value}/1/${tglAwal.value}`)
        fetch(`http://localhost:8080/home/filter/${nis.value}/${status.value}/1/${tglAwal.value}`)
        .then(resp => resp.json().then(resp => {
            console.log(resp)
            cetakFilter(resp.data, resp.awalData);
            cetakPagination(resp, nis.value);
        }));
    }else{
    fetch(`http://localhost:8080/home/filter/${nis.value}/${status.value}/1/${tglAwal.value}/${tglAkhir.value}`)
        .then(resp => resp.json().then(resp => {
            cetakFilter(resp.data, resp.awalData);
            cetakPagination(resp, nis.value);
            
        }));
    }
}

function cetakPagination(respon, nis){
    // document.querySelector('.paginasi').innerHTML = '';
    console.log(respon.tglAwal)
    console.log('ini nis' + nis)
    let oke = '';
    oke += `
    <ul class="pagination">
    `;
    if(respon.halamanAktif > 1){
        oke += `
        <li class="page-item"><a class="page-link" onclick="prev(${nis}, ${respon.halamanAktif-1}, '${respon.status}',  '${respon.tglAwal}', '${respon.tglAkhir}')">Previous</a></li>
        `;
    }

    new Promise((resolve, reject)=>{
        for(let j = 0; j < respon.jumlahHalaman; j++){
            oke +=`
            <li class="page-item"><a class="page-link" onclick="page(${nis}, ${j+1}, '${respon.status}', '${respon.tglAwal}', '${respon.tglAkhir}')">${j+1}</a></li>
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
            console.log(respon.tglAkhir)
            resp +=`
            <li class="page-item"><a class="page-link" onclick="next(${nis}, ${respon.halamanAktif+1}, '${respon.status}', '${respon.tglAwal}', '${respon.tglAkhir}')">Next</a></li>
            `;
        }
        resp +=`
        </ul>
        `;
        console.log(resp)
        document.querySelector('.paginasi').innerHTML = resp;
    })
    
    
    
    
}

function page(nis, halamanAktif, status, tglAwal, tglAkhir){
    let url = '';
    if(tglAwal == 'undefined' && tglAkhir == 'undefined') url = `http://localhost:8080/home/filter/${nis}/${status}/${halamanAktif}`;
    else if(tglAwal !== 'undefined' && tglAkhir == 'undefined') url = `http://localhost:8080/home/filter/${nis}/${status}/${halamanAktif}/${tglAwal}`;
    else url =  `http://localhost:8080/home/filter/${nis}/${status}/${halamanAktif}/${tglAwal}/${tglAkhir}`;
    fetch(url)
    .then(resp => resp.json().then(resp => {
        console.log(resp)
        cetakFilter(resp.data, resp.awalData);
        cetakPagination(resp, nis);
    }));
}
function prev(nis, halamanAktif, status, tglAwal, tglAkhir){
    let url = '';
    if(tglAwal == 'undefined' && tglAkhir == 'undefined') url = `http://localhost:8080/home/filter/${nis}/${status}/${halamanAktif}`;
    else if(tglAwal !== 'undefined' && tglAkhir == 'undefined') url = `http://localhost:8080/home/filter/${nis}/${status}/${halamanAktif}/${tglAwal}`;
    else url =  `http://localhost:8080/home/filter/${nis}/${status}/${halamanAktif}/${tglAwal}/${tglAkhir}`;
    
    fetch(url)
    .then(resp => resp.json().then(resp => {
        console.log(resp)
        cetakFilter(resp.data, resp.awalData);
        cetakPagination(resp, nis);
    }));
}
function next(nis,halamanAktif, status, tglAwal, tglAkhir){
    let url = ``;

    // let url = `http://localhost:8080/home/filter/${nis}/${halamanAktif}`;
    if(tglAwal == 'undefined' && tglAkhir == 'undefined'){
        url = `http://localhost:8080/home/filter/${nis}/${status}/${halamanAktif}`;
    }else if(tglAwal !== 'undefined' && tglAkhir === 'undefined'){
        url = `http://localhost:8080/home/filter/${nis}/${status}/${halamanAktif}/${tglAwal}`;
    }else{
        url =  `http://localhost:8080/home/filter/${nis}/${status}/${halamanAktif}/${tglAwal}/${tglAkhir}`;
    }
    console.log(url)
    fetch(url)
    .then(resp => resp.json().then(resp => {
        console.log(resp) 
        console.log(nis) 
        cetakFilter(resp.data, resp.awalData);
        cetakPagination(resp, nis);
      
    }));
}

async function cetakFilter(resp, awalData){
    console.log(resp)
    let i = parseInt(awalData);
    let template = '';
    await resp.forEach(d=>{
        let tanggal = new Date(d.tglBayar);
        console.log();
        template +=  `
        <tr>
            <th scope="row">${++i}</th>
            <td>${d.bayar}</td>
            <td>${tanggal.getDate()}-${tanggal.getMonth()+1}-${tanggal.getFullYear()}</td>
            <td>${d.status}</td>
        `;
        if(d.status == 'BELUM LUNAS'){
            template += `<td><a href="" class="badge badge-primary mr-2" onclick="bayar(this)" data-toggle="modal" data-bayar="${d.bayar}" data-id="${d.id}" data-target="#transaksiKas">Bayar</a></td>`;
        }else{
            template += `<td></td>`;
        }
        template += `</tr>`;
    });
    document.querySelector('tbody').innerHTML = template;

   
}