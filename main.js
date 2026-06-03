const clock = document.querySelector("#clock");

const loginForm = document.querySelector("#login-form");
const loginInput = document.querySelector("#login-form input");
const greeting = document.querySelector("#greeting");

const todoForm = document.querySelector("#todo-form");
const todoInput = document.querySelector("#todo-form input");
const todoList = document.querySelector("#todo-list");

const quote = document.querySelector("#quote");
const weather = document.querySelector("#weather");

const USERNAME_KEY = "username";
const TODOS_KEY = "todos";
const HIDDEN_CLASSNAME = "hidden";

let todos = [];

/* 1. 실시간 시계 */
function getClock() {
  const date = new Date();

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  clock.innerText = `${hours}:${minutes}:${seconds}`;
}

getClock();
setInterval(getClock, 1000);

/* 2. 로그인 */
function showMainScreen(username) {
  loginForm.classList.add(HIDDEN_CLASSNAME);

  greeting.classList.remove(HIDDEN_CLASSNAME);
  todoForm.classList.remove(HIDDEN_CLASSNAME);
  todoList.classList.remove(HIDDEN_CLASSNAME);

  greeting.innerText = `Hello, ${username}`;
}

function handleLoginSubmit(event) {
  event.preventDefault();

  const username = loginInput.value.trim();

  if (username === "") return;

  localStorage.setItem(USERNAME_KEY, username);

  showMainScreen(username);
}

const savedUsername = localStorage.getItem(USERNAME_KEY);

if (savedUsername === null) {
  loginForm.classList.remove(HIDDEN_CLASSNAME);

  greeting.classList.add(HIDDEN_CLASSNAME);
  todoForm.classList.add(HIDDEN_CLASSNAME);
  todoList.classList.add(HIDDEN_CLASSNAME);

  loginForm.addEventListener("submit", handleLoginSubmit);
} else {
  showMainScreen(savedUsername);
}

/* 3. 투두리스트 */
function saveTodos() {
  localStorage.setItem(TODOS_KEY, JSON.stringify(todos));
}

function deleteTodo(event) {
  const li = event.target.closest("li");
  const targetId = Number(li.id);

  todos = todos.filter((todo) => todo.id !== targetId);

  li.remove();
  saveTodos();
}

function toggleCompleteTodo(event) {
  const li = event.target.closest("li");
  const targetId = Number(li.id);

  todos = todos.map((todo) => {
    if (todo.id === targetId) {
      return {
        ...todo,
        completed: !todo.completed,
      };
    }

    return todo;
  });

  li.classList.toggle("completed");
  saveTodos();
}

function paintTodo(todoObj) {
  const li = document.createElement("li");
  li.id = todoObj.id;

  if (todoObj.completed) {
    li.classList.add("completed");
  }

  const span = document.createElement("span");
  span.innerText = todoObj.text;

  const buttonBox = document.createElement("div");
  buttonBox.className = "todo-buttons";

  const completeButton = document.createElement("button");
  completeButton.innerText = "✓";
  completeButton.className = "complete-btn";
  completeButton.addEventListener("click", toggleCompleteTodo);

  const deleteButton = document.createElement("button");
  deleteButton.innerText = "×";
  deleteButton.className = "delete-btn";
  deleteButton.addEventListener("click", deleteTodo);

  buttonBox.appendChild(completeButton);
  buttonBox.appendChild(deleteButton);

  li.appendChild(span);
  li.appendChild(buttonBox);

  todoList.appendChild(li);
}

function handleTodoSubmit(event) {
  event.preventDefault();

  const newTodo = todoInput.value.trim();

  if (newTodo === "") return;

  todoInput.value = "";

  const newTodoObj = {
    id: Date.now(),
    text: newTodo,
    completed: false,
  };

  todos.push(newTodoObj);
  paintTodo(newTodoObj);
  saveTodos();
}

todoForm.addEventListener("submit", handleTodoSubmit);

const savedTodos = localStorage.getItem(TODOS_KEY);

if (savedTodos !== null) {
  todos = JSON.parse(savedTodos);
  todos.forEach(paintTodo);
}

/* 4. 랜덤 배경 이미지 */
const images = [
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba",
  "https://images.unsplash.com/photo-1493246507139-91e8fad9978e",
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429",
];

const chosenImage = images[Math.floor(Math.random() * images.length)];
document.body.style.backgroundImage = `url(${chosenImage}?auto=format&fit=crop&w=1600&q=80)`;

/* 5. 랜덤 문구 */
const quotes = [
  "오늘의 작은 실행이 내일의 방향을 바꾼다.",
  "완벽한 계획보다 작게 끝낸 실행이 낫다.",
  "집중은 시간을 줄이고 결과를 키운다.",
  "좋은 하루는 좋은 첫 행동에서 시작된다.",
];

quote.innerText = quotes[Math.floor(Math.random() * quotes.length)];

/* 6. 날씨와 위치 */
function weatherCodeToText(code) {
  if (code === 0) return "맑음";
  if ([1, 2, 3].includes(code)) return "구름";
  if ([45, 48].includes(code)) return "안개";
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "비";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "눈";
  if ([95, 96, 99].includes(code)) return "뇌우";
  return "날씨";
}

function onGeoSuccess(position) {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      const temp = data.current.temperature_2m;
      const code = data.current.weather_code;
      const weatherText = weatherCodeToText(code);

      weather.innerText = `${weatherText} / ${temp}°C`;
    })
    .catch(() => {
      weather.innerText = "날씨 정보를 불러올 수 없습니다.";
    });
}

function onGeoError() {
  weather.innerText = "위치 권한이 필요합니다.";
}

navigator.geolocation.getCurrentPosition(onGeoSuccess, onGeoError);