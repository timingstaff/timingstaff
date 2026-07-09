const staffMembers = ["마린", "애디", "타마", "도트"];

let currentUser = "";
let noticeConfirmedUsers = [];
let clockRecords = [];

let tasks = [
  { title: "주류 재고 체크", logs: [] },
  { title: "소스통 청소", logs: [] },
  { title: "고양이방 소독", logs: [] }
];

function saveCurrentUser(name) {
  localStorage.setItem("timingstaff_current_user", name);
  document.cookie = `timingstaff_current_user=${name}; path=/; max-age=2592000`;
}

function getSavedCurrentUser() {
  const localUser = localStorage.getItem("timingstaff_current_user");
  if (localUser) return localUser;

  const cookieUser = document.cookie
    .split("; ")
    .find(row => row.startsWith("timingstaff_current_user="));

  return cookieUser ? cookieUser.split("=")[1] : "";
}

function loginAsStaff(name) {
  currentUser = name;
  saveCurrentUser(name);

  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("appScreen").style.display = "block";

  document.getElementById("staffSelect").value = name;
  document.getElementById("userName").textContent = name;

  saveData();
  updateStatusBox();
}

function updateCurrentUser() {
  loginAsStaff(document.getElementById("staffSelect").value);
}

function handleLockedMenuClick(menuName) {
  if (!requireNoticeConfirm()) return;
  alert(`${menuName} 메뉴는 다음 버전에서 연결됩니다.`);
}

function initializeApp() {
  loadData();

  const savedUser = getSavedCurrentUser();

  setTodayDate();
  renderNoticeReadList();
  renderClockLog();
  renderTasks();
  updateTaskProgress();
  updateStatusBox();
  renderManagerDashboard();

  document.getElementById("staffSelect").addEventListener("change", updateCurrentUser);
  document.getElementById("noticeConfirmBtn").addEventListener("click", confirmNotice);
  document.getElementById("clockInBtn").addEventListener("click", clockIn);
  document.getElementById("clockOutBtn").addEventListener("click", clockOut);

  document.getElementById("homeBtn").addEventListener("click", showHome);
  document.getElementById("workLogBtn").addEventListener("click", () => handleLockedMenuClick("업무일지"));
  document.getElementById("inventoryBtn").addEventListener("click", () => handleLockedMenuClick("재고"));
  document.getElementById("catCareBtn").addEventListener("click", () => handleLockedMenuClick("고양이"));
  document.getElementById("managerBtn").addEventListener("click", showManager);

  if (savedUser) {
    loginAsStaff(savedUser);
  } else {
    document.getElementById("loginScreen").style.display = "flex";
    document.getElementById("appScreen").style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", initializeApp);
function resetLogin() {
  localStorage.removeItem("timingstaff_current_user");
  localStorage.removeItem("currentUser");
  document.cookie = "timingstaff_current_user=; path=/; max-age=0";
  alert("로그인 기록을 초기화했습니다.");
  location.reload();
}
