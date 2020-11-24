// const jurusan = document.querySelector('#jurusan');

// let kelas = jurusan.value;

function pilihJurusan(kelas){
    let [id_jurusan, jurusan] = kelas.value.split(',');
    fetch(`http://localhost:8080/home/tambah/${id_jurusan}`)
        .then(response=> response.json().then(response=>{
            console.log(response);
            cetakKelas(response)
        }))
}


async function cetakKelas(response){
    let kelas = response.data[0].kelas.split(',');
    let inpKelas = document.querySelector('.inputKelas');
    inpKelas.innerHTML = '';
    let inner = '';
    inner += `
    <label for="kelas">Kelas</label>
    <select class="form-control" id="kelas" name="kelas">
    `;
    
    await kelas.forEach(k=>{
    inner += `<option value="${k}">${k}</option>`;
    });
    
    inner += `</select>`;
    inpKelas.innerHTML = inner;
   
}
