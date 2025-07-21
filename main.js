let employees = [];
let trash = [];
let currentEmployeeId = null;

const form = document.getElementById('my-form');
const nameInput = document.getElementById('name');
const roleInput = document.getElementById('role');
const salaryInput = document.getElementById('salary');
const statusSelect = document.getElementById('status');
const formError = document.getElementById('form-error');
const tableBody = document.querySelector('.main-table tbody');
const trashTableBody = document.querySelector('#trash-table tbody');
const trashContainer = document.getElementById('trash-container');
const toggleTrashBtn = document.getElementById('toggle-trash');
const trashCount = document.getElementById('trash-count');
const totalPayroll = document.getElementById('total-payroll');
const deleteLowSalaryBtn = document.getElementById('delete-low-salary');
const modal = document.getElementById('bonus-modal');
const closeModal = document.querySelector('.close-modal');
const bonusPercentageInput = document.getElementById('bonus-percentage');
const saveBonusBtn = document.getElementById('save-bonus');
const searchNameInput = document.getElementById('search-name');
const filterRoleInput = document.getElementById('filter-role');
const filterMinSalaryInput = document.getElementById('filter-min-salary');
const filterMaxSalaryInput = document.getElementById('filter-max-salary');
const filterMinBonusInput = document.getElementById('filter-min-bonus');
const filterMaxBonusInput = document.getElementById('filter-max-bonus');
const filterStatusSelect = document.getElementById('filter-status');
const applyFiltersBtn = document.getElementById('apply-filters');
const clearFiltersBtn = document.getElementById('clear-filters');

function init() {
  loadEmployees();
  renderEmployees();
  updateTotalPayroll();
  
  form.addEventListener('submit', handleFormSubmit);
  toggleTrashBtn.addEventListener('click', toggleTrash);
  deleteLowSalaryBtn.addEventListener('click', deleteLowSalaryEmployees);
  closeModal.addEventListener('click', closeBonusModal);
  saveBonusBtn.addEventListener('click', saveBonus);
  applyFiltersBtn.addEventListener('click', applyFilters);
  clearFiltersBtn.addEventListener('click', clearFilters);
  
  tableBody.addEventListener('click', handleTableClick);
  
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeBonusModal();
    }
  });
}

function handleTableClick(e) {
  if (e.target.classList.contains('bonusBtn')) {
    openBonusModal(e.target.dataset.id);
  } else if (e.target.id === 'update') {
    editEmployee(e.target.dataset.id);
  } else if (e.target.id === 'delete') {
    deleteEmployee(e.target.dataset.id);
  }
}

function loadEmployees() {
  const savedEmployees = localStorage.getItem('employees');
  const savedTrash = localStorage.getItem('trash');
  
  if (savedEmployees) {
    employees = JSON.parse(savedEmployees);
  }
  
  if (savedTrash) {
    trash = JSON.parse(savedTrash);
    trashCount.textContent = `(${trash.length})`;
  }
}

function saveEmployees() {
  localStorage.setItem('employees', JSON.stringify(employees));
  localStorage.setItem('trash', JSON.stringify(trash));
}

function renderEmployees(filteredEmployees = null) {
  const employeesToRender = filteredEmployees || employees;
  
  tableBody.innerHTML = '';
  
  if (employeesToRender.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = `<td colspan="7" style="text-align: center;">No employees found</td>`;
    tableBody.appendChild(row);
    return;
  }
  
  employeesToRender.forEach((employee, index) => {
    const row = document.createElement('tr');
    row.className = 'grid';
    
    const bonusAmount = employee.bonusPercentage 
      ? (employee.salary * employee.bonusPercentage / 100).toFixed(2)
      : '0.00';
    
    const highSalaryBadge = employee.salary >= 100000 
      ? '<span class="badge-high-salary">High</span>' 
      : '';
    
    const bonusBadge = employee.bonusPercentage 
      ? '<span class="badge-bonus">Bonus</span>' 
      : '';
    
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${employee.name}${highSalaryBadge}</td>
      <td>${employee.role}</td>
      <td>${employee.status}</td>
      <td>${employee.salary.toLocaleString()} R</td>
      <td>${employee.bonusPercentage || '0'}% ${bonusBadge}</td>
      <td>
        <button class="bonusBtn" data-id="${employee.id}">Bonus</button>
        <button id="update" data-id="${employee.id}">Edit</button>
        <button id="delete" data-id="${employee.id}">Delete</button>
      </td>
    `;
    
    tableBody.appendChild(row);
  });
}

function renderTrash() {
  trashTableBody.innerHTML = '';
  
  if (trash.length === 0) {
    const row = document.createElement('tr');
    row.className = 'grid';
    row.innerHTML = `<td colspan="6" style="text-align: center;">Trash is empty</td>`;
    trashTableBody.appendChild(row);
    return;
  }
  
  trash.forEach((employee, index) => {
    const row = document.createElement('tr');
    row.className = 'grid';
    
    const bonusAmount = employee.bonusPercentage 
      ? (employee.salary * employee.bonusPercentage / 100).toFixed(2)
      : '0.00';
    
    row.innerHTML = `
      <td>${employee.name}</td>
      <td>${employee.role}</td>
      <td>${employee.status}</td>
      <td>${employee.salary.toLocaleString()} R</td>
      <td>${bonusAmount} R</td>
      <td>
        <button id="restore" data-id="${employee.id}">Restore</button>
        <button id="delete-permanent" data-id="${employee.id}">Delete</button>
      </td>
    `;
    
    trashTableBody.appendChild(row);
  });
  
  document.querySelectorAll('#restore').forEach(btn => {
    btn.addEventListener('click', (e) => restoreEmployee(e.target.dataset.id));
  });
  
  document.querySelectorAll('#delete-permanent').forEach(btn => {
    btn.addEventListener('click', (e) => deletePermanent(e.target.dataset.id));
  });
}

function handleFormSubmit(e) {
  e.preventDefault();
  
  if (!validateForm()) {
    return;
  }
  
  const employeeData = {
    name: nameInput.value.trim(),
    role: roleInput.value.trim(),
    salary: parseFloat(salaryInput.value),
    status: statusSelect.value,
    bonusPercentage: null,
    id: currentEmployeeId || Date.now().toString()
  };
  
  if (currentEmployeeId) {
    const index = employees.findIndex(emp => emp.id === currentEmployeeId);
    if (index !== -1) {
      employees[index] = employeeData;
    }
    currentEmployeeId = null;
    form.querySelector('button[type="submit"]').textContent = 'Add Employee';
  } else {
    employees.push(employeeData);
  }
  
  form.reset();
  renderEmployees();
  updateTotalPayroll();
  saveEmployees();
}

function validateForm() {
  let isValid = true;
  formError.textContent = '';
  
  if (!nameInput.value.trim()) {
    formError.textContent = 'Name is required';
    isValid = false;
  } else if (!/^[a-zA-Z\s]{3,}$/.test(nameInput.value.trim())) {
    formError.textContent = 'Name must be at least 3 characters and contain only letters';
    isValid = false;
  }
  
  if (!roleInput.value.trim()) {
    formError.textContent = 'Role is required';
    isValid = false;
  }
  
  if (!salaryInput.value.trim()) {
    formError.textContent = 'Salary is required';
    isValid = false;
  } else if (!/^\d+$/.test(salaryInput.value.trim())) {
    formError.textContent = 'Salary must be a number';
    isValid = false;
  } else if (parseFloat(salaryInput.value) <= 0) {
    formError.textContent = 'Salary must be greater than 0';
    isValid = false;
  }
  
  if (!statusSelect.value) {
    formError.textContent = 'Status is required';
    isValid = false;
  }
  
  return isValid;
}

function editEmployee(id) {
  const employee = employees.find(emp => emp.id === id);
  if (employee) {
    nameInput.value = employee.name;
    roleInput.value = employee.role;
    salaryInput.value = employee.salary;
    statusSelect.value = employee.status;
    currentEmployeeId = employee.id;
    form.querySelector('button[type="submit"]').textContent = 'Update Employee';
    nameInput.focus();
  }
}

function deleteEmployee(id) {
  const employeeIndex = employees.findIndex(emp => emp.id === id);
  if (employeeIndex !== -1) {
    const [deletedEmployee] = employees.splice(employeeIndex, 1);
    trash.push(deletedEmployee);
    trashCount.textContent = `(${trash.length})`;
    renderEmployees();
    renderTrash();
    updateTotalPayroll();
    saveEmployees();
  }
}

function deleteLowSalaryEmployees() {
  const lowSalaryEmployees = employees.filter(emp => emp.salary <= 20000);
  
  if (lowSalaryEmployees.length === 0) {
    alert('No employees with salary ≤ 20000 R found');
    return;
  }
  
  if (confirm(`Are you sure you want to delete ${lowSalaryEmployees.length} employee(s) with salary ≤ 20000 R?`)) {
    trash.push(...lowSalaryEmployees);
    employees = employees.filter(emp => emp.salary > 20000);
    trashCount.textContent = `(${trash.length})`;
    renderEmployees();
    renderTrash();
    updateTotalPayroll();
    saveEmployees();
    alert(`${lowSalaryEmployees.length} employee(s) moved to trash`);
  }
}

function restoreEmployee(id) {
  const employeeIndex = trash.findIndex(emp => emp.id === id);
  if (employeeIndex !== -1) {
    const [restoredEmployee] = trash.splice(employeeIndex, 1);
    employees.push(restoredEmployee);
    trashCount.textContent = `(${trash.length})`;
    renderEmployees();
    renderTrash();
    updateTotalPayroll();
    saveEmployees();
  }
}

function deletePermanent(id) {
  if (confirm('Are you sure you want to permanently delete this employee?')) {
    const employeeIndex = trash.findIndex(emp => emp.id === id);
    if (employeeIndex !== -1) {
      trash.splice(employeeIndex, 1);
      trashCount.textContent = `(${trash.length})`;
      renderTrash();
      saveEmployees();
    }
  }
}

function toggleTrash() {
  trashContainer.classList.toggle('hidden');
  toggleTrashBtn.textContent = trashContainer.classList.contains('hidden') 
    ? 'Show Trash' 
    : 'Hide Trash';
  renderTrash();
}

function updateTotalPayroll() {
  const total = employees.reduce((sum, emp) => sum + emp.salary, 0);
  totalPayroll.textContent = `${total.toLocaleString()} R`;
}

function openBonusModal(id) {
  currentEmployeeId = id;
  const employee = employees.find(emp => emp.id === id);
  if (employee) {
    bonusPercentageInput.value = employee.bonusPercentage || '';
    modal.classList.remove('hidden');
  }
}

function closeBonusModal() {
  modal.classList.add('hidden');
  currentEmployeeId = null;
  bonusPercentageInput.value = '';
}

function saveBonus() {
  const percentage = parseFloat(bonusPercentageInput.value);
  
  if (isNaN(percentage)) {
    alert('Please enter a valid bonus percentage');
    return;
  }
  
  if (percentage < 0 || percentage > 100) {
    alert('Bonus percentage must be between 0 and 100');
    return;
  }
  
  const employeeIndex = employees.findIndex(emp => emp.id === currentEmployeeId);
  if (employeeIndex !== -1) {
    employees[employeeIndex].bonusPercentage = percentage;
    renderEmployees();
    saveEmployees();
    closeBonusModal();
  }
}

function applyFilters() {
  let filteredEmployees = [...employees];
  
  const searchName = searchNameInput.value.trim().toLowerCase();
  if (searchName) {
    filteredEmployees = filteredEmployees.filter(emp => 
      emp.name.toLowerCase().includes(searchName)
    );
  }
  
  const filterRole = filterRoleInput.value.trim().toLowerCase();
  if (filterRole) {
    filteredEmployees = filteredEmployees.filter(emp => 
      emp.role.toLowerCase().includes(filterRole)
    );
  }
  
  const minSalary = parseFloat(filterMinSalaryInput.value);
  if (!isNaN(minSalary)) {
    filteredEmployees = filteredEmployees.filter(emp => 
      emp.salary >= minSalary
    );
  }
  
  const maxSalary = parseFloat(filterMaxSalaryInput.value);
  if (!isNaN(maxSalary)) {
    filteredEmployees = filteredEmployees.filter(emp => 
      emp.salary <= maxSalary
    );
  }
  
  const minBonus = parseFloat(filterMinBonusInput.value);
  if (!isNaN(minBonus)) {
    filteredEmployees = filteredEmployees.filter(emp => 
      emp.bonusPercentage !== null && emp.bonusPercentage >= minBonus
    );
  }
  
  const maxBonus = parseFloat(filterMaxBonusInput.value);
  if (!isNaN(maxBonus)) {
    filteredEmployees = filteredEmployees.filter(emp => 
      emp.bonusPercentage !== null && emp.bonusPercentage <= maxBonus
    );
  }
  
  const filterStatus = filterStatusSelect.value;
  if (filterStatus) {
    filteredEmployees = filteredEmployees.filter(emp => 
      emp.status === filterStatus
    );
  }
  
  renderEmployees(filteredEmployees);
}

function clearFilters() {
  searchNameInput.value = '';
  filterRoleInput.value = '';
  filterMinSalaryInput.value = '';
  filterMaxSalaryInput.value = '';
  filterMinBonusInput.value = '';
  filterMaxBonusInput.value = '';
  filterStatusSelect.value = '';
  renderEmployees();
}

document.addEventListener('DOMContentLoaded', init);