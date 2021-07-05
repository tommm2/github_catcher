const text = document.getElementById('text');
const btn = document.querySelectorAll('.btn-group');
const repo_list = document.getElementById('repo-list');
const alert =  document.getElementById('alert');
const page_El = document.getElementById('pagination');

let repo_arr = JSON.parse(localStorage.getItem('repo')) || [];

// 分頁
function pagination(data, now_page = 1) {
  const data_total = data.length;
  const page_data = 6;
  const page_total = Math.ceil(data_total / page_data);
  let current_page = now_page;

  if(current_page > now_page) { current_page = now_page };

  const min_data = current_page * page_data - page_data + 1;
  const max_data = current_page * page_data;
  const new_data = [];

  data.forEach((item, index) => {
    const num = index + 1;
    if(num >= min_data && num <= max_data) {
      new_data.push(item);
    }
  })

  const page = {
    page_total,
    current_page,
    prev: current_page > 1,
    next: current_page < page_total,
  }

  if(page_total !== 0) {
    updatePageDOM(page);
    updateDOM(new_data);
  } else {
    page_El.innerHTML = ''
  }
}

// 分頁DOM
function updatePageDOM(item) {
  const { page_total, current_page, prev, next } = item;
  let str = '';

  str += prev 
  ? `<li class="page-item">
      <a class="page-link" href="#" data-page="${Number(current_page) - 1}">Prev</a>
    </li>` 
  : `<li class="page-item">
      <span style="color:#fff" class="page-link">Prev</span>
    </li>`;

  for(let i = 1; i <= page_total; i++) {
      str += Number(current_page) === i
      ? `<li class="page-item">
          <a style="color:#fff; cursor: default;" href="#" class="page-link" data-page="${i}">${i}</a>
        </li>`
      : `<li class="page-item">
          <a href="#" class="page-link" data-page="${i}">${i}</a>
        </li>`
    }

  str += next 
  ? `<li class="page-item">
      <a class="page-link" href="#" data-page="${Number(current_page) + 1}">Next</a>
    </li>`
  : `<li class="page-item disabled">
      <span style="color:#fff" class="page-link">Next</span>
    </li>`

  page_El.innerHTML = str;
}

// 切換 alert訊息的狀態
function showAlert(msg) {
  alert.innerText = msg;
  alert.classList.add('show');
  setTimeout(() => {
    alert.classList.remove('show');
  },3000)
}

// 取得github資料
function getRepoData() {
  repo_arr.splice(0);
  fetch(`https://api.github.com/users/${text.value}/repos`)
  .then(res => res.json())
  .then(data => {
    if(data.message === 'Not Found') {
      showAlert('無此使用者');
      removeData();
    } else {
      data.forEach(item => repo_arr.push(item));
    }
    localStorage.setItem('repo', JSON.stringify(repo_arr));
    pagination(repo_arr);
  })
}

// 刪除資料
function removeData() {
  repo_arr.splice(0);
  localStorage.setItem('repo', JSON.stringify(repo_arr));
  page_El.innerHTML = '';
  updateDOM(repo_arr);
}

// 更新畫面
function updateDOM(data) {
  let str = '';
  data.forEach(item => { 
    const { name, clone_url } = item;
    str += `<li><span title="${name}">${name}</span><a href="${clone_url}">連結</a></li>` ;
  })
  repo_list.innerHTML = str;
}

// 判斷按鈕
function judgeButtonWork(e) {
  if(e.target.value === 'get') {
    if(text.value) {
      getRepoData();
      text.value = '';
    } else {
      showAlert('請輸入github名稱');
    }
  } else if(e.target.value === 'clear'){
    removeData();
  } else {
    return;
  }
}

pagination(repo_arr);

// Event listener
btn.forEach((item) => item.addEventListener('click', judgeButtonWork));
page_El.addEventListener('click', e => {
  e.preventDefault();
  if(e.target.nodeName !== 'A') return;
  const page_index = e.target.dataset.page;
  pagination(repo_arr, page_index);
})
