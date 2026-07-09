const staffMembers = ["마린", "애디", "타마", "도트"];

let currentUser = localStorage.getItem("currentUser") || "";

let noticeConfirmedUsers = [];
let clockRecords = [];

let tasks = [
  { title: "주류 재고 체크", logs: [] },
  { title: "소스통 청소", logs: [] },
  { title: "고양이방 소독", logs: [] }
];

function loginAsStaff(name) {
  currentUser = name;

  localStorage.setItem("currentUser", name);

  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("appScreen").style.display = "block";

  document.getElementById("staffSelect").value = name;
  document.getElementById("userName").textContent = name;

  updateStatusBox();
}

function logout() {
  localStorage.removeItem("currentUser");

  document.getElementById("loginScreen").style.display = "flex";
  document.getElementById("appScreen").style.display = "none";
}

function updateCurrentUser() {
  currentUser = document.getElementById("staffSelect").value;

  localStorage.setItem("currentUser", currentUser);

  document.getElementById("userName").textContent = currentUser;

  saveData();
}

function initializeApp() {

  loadData();

  setTodayDate();

  renderNoticeReadList();
  renderClockLog();
  renderTasks();
  updateTaskProgress();
  updateStatusBox();
  renderManagerDashboard();

  document.getElementById("staffSelect")
    .addEventListener("change", updateCurrentUser);

  document.getElementById("noticeConfirmBtn")
    .addEventListener("click", confirmNotice);

  document.getElementById("clockInBtn")
    .addEventListener("click", clockIn);

  document.getElementById("clockOutBtn")
    .addEventListener("click", clockOut);

  document.getElementById("homeBtn")
    .addEventListener("click", showHome);

  document.getElementById("workLogBtn")
    .addEventListener("click", () => handleLockedMenuClick("업무일지"));

  document.getElementById("inventoryBtn")
    .addEventListener("click", () => handleLockedMenuClick("재고"));

  document.getElementById("catCareBtn")
    .addEventListener("click", () => handleLockedMenuClick("고양이"));

  document.getElementById("managerBtn")
    .addEventListener("click", showManager);

  if (currentUser) {
    loginAsStaff(currentUser);
  } else {
    document.getElementById("loginScreen").style.display = "flex";
    document.getElementById("appScreen").style.display = "none";
  }
}

initializeApp();
