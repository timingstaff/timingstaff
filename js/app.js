const staffMembers = ["마린", "애디", "타마", "도트"];

let currentUser = "마린";
let noticeConfirmedUsers = [];
let clockRecords = [];

let tasks = [
  { title: "주류 재고 체크", logs: [] },
  { title: "소스통 청소", logs: [] },
  { title: "고양이방 소독", logs: [] }
];

function updateCurrentUser() {
  currentUser = document.getElementById("staffSelect").value;
  document.getElementById("userName").textContent = currentUser;
  saveData();
}

function updateStatusBox() {
  const statusBox = document.getElementById("statusBox");

  const unread = staffMembers.length - noticeConfirmedUsers.length;
  const completed = getCompletedTaskCount();
  const total = tasks.length;
  const salesPercent = 65;

  if (unread > 0) {
    statusBox.className = "status-card status-red";
    statusBox.innerHTML = `
      <strong>🔴 공지 ${noticeConfirmedUsers.length}/${staffMembers.length} │ 업무 ${completed}/${total} │ 매출 ${salesPercent}%</strong>
      <p>중요 공지를 먼저 확인해주세요.</p>
    `;
    return;
  }

  if (completed < total) {
    statusBox.className = "status-card status-yellow";
    statusBox.innerHTML = `
      <strong>🟡 공지 완료 │ 업무 ${completed}/${total} │ 매출 ${salesPercent}%</strong>
      <p>아직 완료되지 않은 업무가 있습니다.</p>
    `;
    return;
  }

  statusBox.className = "status-card status-green";
  statusBox.innerHTML = `
    <strong>🟢 공지 완료 │ 업무 완료 │ 매출 ${salesPercent}%</strong>
    <p>현재 순조롭게 운영 중입니다.</p>
  `;
}

function handleLockedMenuClick(menuName) {
  if (!requireNoticeConfirm()) return;
  alert(`${menuName} 메뉴는 다음 버전에서 연결됩니다.`);
}

function openManagerMode() {
  if (!requireNoticeConfirm()) return;

  showManager();

  const managerSection = document.getElementById("managerSection");
  const homeSection = document.getElementById("homeSection");

  if (homeSection) {
    homeSection.style.display = "none";
  }

  if (managerSection) {
    managerSection.style.display = "block";
    managerSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  renderManagerDashboard();
}

function openHomeMode() {
  showHome();

  const managerSection = document.getElementById("managerSection");
  const homeSection = document.getElementById("homeSection");

  if (managerSection) {
    managerSection.style.display = "none";
  }

  if (homeSection) {
    homeSection.style.display = "block";
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function initializeApp() {
  loadData();

  setTodayDate();

  document.getElementById("staffSelect").value = currentUser;
  document.getElementById("userName").textContent = currentUser;

  renderNoticeReadList();
  renderClockLog();
  renderTasks();
  updateTaskProgress();
  updateStatusBox();
  renderManagerDashboard();

  const managerSection = document.getElementById("managerSection");
  if (managerSection) {
    managerSection.style.display = "none";
  }

  document.getElementById("staffSelect").addEventListener("change", updateCurrentUser);
  document.getElementById("noticeConfirmBtn").addEventListener("click", confirmNotice);
  document.getElementById("clockInBtn").addEventListener("click", clockIn);
  document.getElementById("clockOutBtn").addEventListener("click", clockOut);

  document.getElementById("homeBtn").addEventListener("click", openHomeMode);
  document.getElementById("workLogBtn").addEventListener("click", () => handleLockedMenuClick("업무일지"));
  document.getElementById("inventoryBtn").addEventListener("click", () => handleLockedMenuClick("재고"));
  document.getElementById("catCareBtn").addEventListener("click", () => handleLockedMenuClick("고양이"));
  document.getElementById("managerBtn").addEventListener("click", openManagerMode);
}

initializeApp();
