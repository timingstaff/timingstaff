const staffMembers = ["마린", "애디", "타마", "도트"];

let currentUser = "마린";

let noticeConfirmedUsers = [];

let clockRecords = [];

let tasks = [
  {
    title: "주류 재고 체크",
    logs: []
  },
  {
    title: "소스통 청소",
    logs: []
  },
  {
    title: "고양이방 소독",
    logs: []
  }
];

function getNowTime() {
  return new Date().toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function setTodayDate() {
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const date = String(today.getDate()).padStart(2, "0");
  const day = days[today.getDay()];

  document.getElementById("todayDate").textContent =
    `${year}.${month}.${date} (${day})`;
}

function updateCurrentUser() {
  const select = document.getElementById("staffSelect");
  currentUser = select.value;

  document.getElementById("userName").textContent = currentUser;
}

function isCurrentUserNoticeConfirmed() {
  return noticeConfirmedUsers.some(user => user.name === currentUser);
}

function requireNoticeConfirm() {
  if (!isCurrentUserNoticeConfirmed()) {
    alert("중요 공지를 먼저 확인해주세요.");
    return false;
  }

  return true;
}

function confirmNotice() {
  if (!isCurrentUserNoticeConfirmed()) {
    noticeConfirmedUsers.push({
      name: currentUser,
      time: getNowTime()
    });
  }

  renderNoticeReadList();
  updateStatusBox();
}

function renderNoticeReadList() {
  let html = `읽음 ${noticeConfirmedUsers.length} / ${staffMembers.length}<br>`;

  staffMembers.forEach(name => {
    const confirmed = noticeConfirmedUsers.find(user => user.name === name);

    if (confirmed) {
      html += `✅ ${name} ${confirmed.time}<br>`;
    } else {
      html += `⏳ ${name} 미확인<br>`;
    }
  });

  document.getElementById("readList").innerHTML = html;
}

function updateStatusBox() {
  const statusBox = document.getElementById("statusBox");
  const unreadCount = staffMembers.length - noticeConfirmedUsers.length;

  if (unreadCount > 0) {
    statusBox.className = "status-card status-red";
    statusBox.innerHTML = `
      <strong>🔴 중요 공지 미확인 ${unreadCount}명</strong>
      <p>모든 직원의 공지 확인이 필요합니다.</p>
    `;
    return;
  }

  const hasUncheckedTask = tasks.some(task => task.logs.length === 0);

  if (hasUncheckedTask) {
    statusBox.className = "status-card status-yellow";
    statusBox.innerHTML = `
      <strong>🟡 오늘 해야 할 일 남음</strong>
      <p>아직 완료되지 않은 업무가 있습니다.</p>
    `;
    return;
  }

  statusBox.className = "status-card status-green";
  statusBox.innerHTML = `
    <strong>🟢 정상 운영</strong>
    <p>현재 긴급하게 확인할 사항이 없습니다.</p>
  `;
}

function clockIn() {
  if (!requireNoticeConfirm()) return;

  const time = getNowTime();

  clockRecords.push({
    user: currentUser,
    type: "출근",
    time
  });

  renderClockLog();
}

function clockOut() {
  if (!requireNoticeConfirm()) return;

  const time = getNowTime();

  clockRecords.push({
    user: currentUser,
    type: "퇴근",
    time
  });

  renderClockLog();
}

function renderClockLog() {
  if (clockRecords.length === 0) {
    document.getElementById("clockLog").textContent = "아직 기록이 없습니다.";
    return;
  }

  const latest = clockRecords[clockRecords.length - 1];

  document.getElementById("clockLog").textContent =
    `${latest.user} ${latest.type} 기록: ${latest.time}`;
}

function completeTask(index) {
  if (!requireNoticeConfirm()) return;

  const task = tasks[index];
  const isFirstComplete = task.logs.length === 0;

  task.logs.push({
    user: currentUser,
    time: getNowTime(),
    type: isFirstComplete ? "완료" : "재확인 완료"
  });

  renderTasks();
  updateStatusBox();
}

function requestRecheck(index) {
  if (!requireNoticeConfirm()) return;

  const task = tasks[index];

  task.logs.push({
    user: currentUser,
    time: getNowTime(),
    type: "재확인 요청"
  });

  renderTasks();

  const statusBox = document.getElementById("statusBox");
  statusBox.className = "status-card status-yellow";
  statusBox.innerHTML = `
    <strong>🟡 재확인 요청 있음</strong>
    <p>${task.title} 재확인이 필요합니다.</p>
  `;
}

function renderTasks() {
  const taskList = document.getElementById("taskList");

  taskList.innerHTML = tasks.map((task, index) => {
    const logsHtml = task.logs.length
      ? task.logs.map(log => {
          if (log.type === "완료") {
            return `
              <div>
                <span class="badge green">✅ 완료</span>
                ${log.user} · ${log.time}
              </div>
            `;
          }

          if (log.type === "재확인 완료") {
            return `
              <div>
                <span class="badge blue">🔄 재확인 완료</span>
                ${log.user} · ${log.time}
              </div>
            `;
          }

          return `
            <div>
              <span class="badge yellow">⚠️ 재확인 요청</span>
              ${log.user} · ${log.time}
            </div>
          `;
        }).join("")
      : `<div>⏳ 미완료</div>`;

    const mainButtonText =
      task.logs.length === 0 ? "완료" : "재확인 완료";

    return `
      <div class="task">
        <div class="task-title">${task.title}</div>

        <div class="task-log">
          ${logsHtml}
        </div>

        <div class="task-actions">
          <button class="green-btn" onclick="completeTask(${index})">
            ${mainButtonText}
          </button>

          <button class="gray-btn" onclick="requestRecheck(${index})">
            재확인 요청
          </button>
        </div>
      </div>
    `;
  }).join("");
}

function handleLockedMenuClick(menuName) {
  if (!requireNoticeConfirm()) return;

  alert(`${menuName} 메뉴는 다음 버전에서 연결됩니다.`);
}

function initializeApp() {
  setTodayDate();
  renderNoticeReadList();
  renderTasks();
  updateStatusBox();

  document.getElementById("staffSelect").addEventListener("change", updateCurrentUser);

  document.getElementById("noticeConfirmBtn").addEventListener("click", confirmNotice);

  document.getElementById("clockInBtn").addEventListener("click", clockIn);

  document.getElementById("clockOutBtn").addEventListener("click", clockOut);

  document.getElementById("homeBtn").addEventListener("click", () => handleLockedMenuClick("홈"));

  document.getElementById("workLogBtn").addEventListener("click", () => handleLockedMenuClick("업무일지"));

  document.getElementById("inventoryBtn").addEventListener("click", () => handleLockedMenuClick("재고"));

  document.getElementById("catCareBtn").addEventListener("click", () => handleLockedMenuClick("고양이"));

  document.getElementById("moreBtn").addEventListener("click", () => handleLockedMenuClick("더보기"));
}

initializeApp();
