let nameInput = document.getElementById('username');
let roleInput = document.getElementById('role');
let statusInput = document.getElementById('status');
let submitInput = document.getElementById('submit');
let mod = 'create';
let temp;
let dataemp;
let employee=[];
window.onload=function(){
    if(localStorage.getItem("employee")){
        employee=JSON.parse(localStorage.getItem("employee"));
        showData()
    }
}
submit.onclick = function(){
    let newemp = {
        username:nameInput.value.trim(),
        role:roleInput.value.trim(),
        status: statusInput.value.trim()
    };
    if(newemp.username !== ""
    && newemp.role !== ""
    && newemp.status !== ""){
        if (mod==='create'){
         employee.push(newemp);
        }else{
            employee[temp]=newemp;
            mod='create';
            submit.innerHTML="add employee";
        }
        //  clearData()
       localStorage.setItem('employee',JSON.stringify(employee));     
       showData();
            } else{
                alert("please fill in all fields");
            }
        };
    
// //clear inputs
function clearData(){
    nameInput.value='';
    roleInput.value='';
    statusInput.value='';
}
//read
function showData()
{
   let body ='';
    for(let i = 0; i < employee.length; i++){
       body += `
        <div class="grid">
            <div>${i+1}</div>
            <div>${employee[i].username}</div>
            <div>${employee[i].role}</div>
            <div>${employee[i].status}</div>
            <div><button onclick="updateData(${i})" id="update">update</button></div>
            <div><button onclick="deleteData( ${i} )" id="delete">delete</button></div>
        </div>
        `    ;  
    }
    document.getElementById('grid-body').innerHTML = body;
    let btnDelete = document.getElementById('deleteAll');
    if(employee.length > 0){
        btnDelete.innerHTML =`
        <button onclick="deleteAll()">delete all (${employee.length})</button>
        `;
}else{
    btnDelete.innerHTML =``;

}
}

showData()
 //delete
function deleteData(i){
    employee.splice(i,1);
    localStorage.setItem("employee",JSON.stringify(employee));
    showData()
}
//delete all
function deleteAll(){
      employee=[];
    localStorage.removeItem('employee');
    showData();
}
// //update
function updateData(i){
    nameInput.value = employee[i].username;
    roleInput.value = employee[i].role;
    statusInput.value= employee[i].status;
    mod = 'update';
    dataemp = i;
    submit.innerHTML = 'update';
    scroll({
        top:0,
        behavior:'smooth',
    })
}
// //search
let searchMood = 'username';
function getSearchMood(id)
{
    let search = document.getElementById('search');
    if(id == 'searchName'){
        searchMood = 'username';
        search.placeholder = 'search by Employee Name';
    }else{
        searchMood = 'role';
        search.placeholder = 'search by Role';
    }
    search.focus()
    search.value = '';
    showData();
}

function searchData(value)
{
    let body = '';
if(searchMood =='username'){
    for(let i = 0; i < employee.length; i++){
        if(employee[i].username.includes(value.toLowerCase())){
            body += `
        <div class="grid">
            <div>${i+1}</div>
            <div>${employee[i].username}</div>
            <div>${employee[i].role}</div>
            <div>${employee[i].status}</div>
            <div><button onclick="updateData(${i})" id="update">update</button></div>
            <div><button onclick="deleteData( ${i} )" id="delete">delete</button></div>
        </div>
        `;    
        
        }
    }

}else{
    for(let i = 0; i < employee.length; i++){
        if(employee[i].role.includes(value.toLowerCase())){
            body += `
           <div class="grid">
            <div>${i+1}</div>
            <div>${employee[i].username}</div>
            <div>${employee[i].role}</div>
            <div>${employee[i].status}</div>
            <div><button onclick="updateData(${i})" id="update">update</button></div>
            <div><button onclick="deleteData( ${i} )" id="delete">delete</button></div>
        </div>
        `;    
        
        }
    }

}
document.getElementById('grid-body').innerHTML = body;

}