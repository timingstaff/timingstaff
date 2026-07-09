const staffMembers = ["마린", "애디", "타마", "도트"];

let currentUser = "마린";
let noticeConfirmedUsers = [];
let clockRecords = [];

let tasks = [
  { title: "주류 재고 체크", logs: [] },
  { title: "소스통 청소", logs: [] },
  { title: "고양이방 소독", logs: [] },
  { title: "고양이방 소독", logs: [] }
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
  currentUser = document.getElementById("staffSelect").value;
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
  let html = `<strong>읽음 ${noticeConfirmedUsers.length} / ${staffMembers.length}</strong><br>`;

  staffMembers.forEach(name => {
    const confirmed = noticeConfirmedUsers.find(user => user.name === name);

    if (confirmed) {
      html += `✅ ${name} · ${confirmed.time}<br>`;
    } else {
      html += `⏳ ${name} · 미확인<br>`;
    }
  });

  document.getElementById("readList").innerHTML = html;
}

function getCompletedTaskCount() {
  return tasks.filter(task =>
    task.logs.some(log => log.type === "완료" || log.type === "재확인 완료")
  ).length;
}

function updateTaskProgress() {
  const total = tasks.length;
  const completed = getCompletedTaskCount();
  const percent = Math.round((completed / total) * 100);

  document.getElementById("taskProgressText").textContent =
    `${completed} / ${total} 완료`;

  document.getElementById("taskProgressFill").style.width =
    `${percent}%`;
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
      <strong>🔴 중요 공지 미확인 ${unread}명</strong>
      <p>공지 ${noticeConfirmedUsers.length}/${staffMembers.length} 확인 · 업무 ${completed}/${total} 완료 · 매출 ${salesPercent}%</p>
    `;
    return;
  }

  if (completed < total) {
    statusBox.className = "status-card status-yellow";
    statusBox.innerHTML = `
      <strong>🟡 오늘 해야 할 일 남음</strong>
      <p>공지 ${staffMembers.length}/${staffMembers.length} 확인 · 업무 ${completed}/${total} 완료 · 재고 확인 3건</p>
    `;
    return;
  }

  statusBox.className = "status-card status-green";
  statusBox.innerHTML = `
    <strong>🟢 정상 운영</strong>
    <p>공지 완료 · 업무 완료 · 매출 ${salesPercent}% · 현재 순조롭게 운영 중입니다.</p>
  `;
}

function clockIn() {
  if (!requireNoticeConfirm()) return;

  clockRecords.push({
    user: currentUser,
    type: "출근",
    time: getNowTime()
  });

  renderClockLog();
}

function clockOut() {
  if (!requireNoticeConfirm()) return;

  clockRecords.push({
    user: currentUser,
    type: "퇴근",
    time: getNowTime()
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
    `${latest.user} ${latest.type} 기록 · ${latest.time}`;
}

function completeTask(index) {
  if (!requireNoticeConfirm()) return;

  const task = tasks[index];

  const hasComplete = task.logs.some(log =>
    log.type === "완료" || log.type === "재확인 완료"
  );

  task.logs.push({
    user: currentUser,
    time: getNowTime(),
    type: hasComplete ? "재확인 완료" : "완료"
  });

  renderTasks();
  updateTaskProgress();
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
  updateTaskProgress();

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
            return `<div><span class="badge green">✅ 완료</span>${log.user} · ${log.time}</div>`;
          }

          if (log.type === "재확인 완료") {
            return `<div><span class="badge blue">🔄 재확인 완료</span>${log.user} · ${log.time}</div>`;
          }

          return `<div><span class="badge yellow">⚠️ 재확인 요청</span>${log.user} · ${log.time}</div>`;
        }).join("")
      : `<div>⏳ 미완료</div>`;

    const hasComplete = task.logs.some(log =>
      log.type === "완료" || log.type === "재확인 완료"
    );

    const buttonText = hasComplete ? "재확인 완료" : "완료";

    return `
      <div class="task">
        <div class="task-title">${task.title}</div>
        <div class="task-log">${logsHtml}</div>

        <div class="task-actions">
          <button class="green-btn" onclick="completeTask(${index})">
            ${buttonText}
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
  updateTaskProgress();
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
