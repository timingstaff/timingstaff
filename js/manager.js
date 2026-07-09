function showHome() {
  document.getElementById("homeScreen").classList.remove("hidden");
  document.getElementById("managerScreen").classList.add("hidden");
}

function showManager() {
  document.getElementById("homeScreen").classList.add("hidden");
  document.getElementById("managerScreen").classList.remove("hidden");

  renderManagerDashboard();
}

function renderManagerDashboard() {
  const completed = getCompletedTaskCount();
  const total = tasks.length;
  const unread = staffMembers.length - noticeConfirmedUsers.length;
  const urgentInventory = getUrgentInventoryCount();
  const checkInventory = getCheckInventoryCount();

  document.getElementById("managerSummary").innerHTML = `
    <div class="manager-box">매출<strong>65%</strong></div>
    <div class="manager-box">업무<strong>${completed}/${total}</strong></div>
    <div class="manager-box">공지 미확인<strong>${unread}명</strong></div>
    <div class="manager-box">재고 확인<strong>${checkInventory}건</strong></div>
  `;

  document.getElementById("managerStaffStatus").innerHTML =
    clockRecords.length
      ? clockRecords
          .map(record => `${record.user} · ${record.type} · ${record.time}<br>`)
          .join("")
      : "아직 출퇴근 기록이 없습니다.";

  document.getElementById("managerNoticeStatus").innerHTML =
    staffMembers
      .map(name => {
        const found = noticeConfirmedUsers.find(user => user.name === name);

        return found
          ? `✅ ${name} · ${found.time}<br>`
          : `⏳ ${name} · 미확인<br>`;
      })
      .join("");

  document.getElementById("managerTaskStatus").innerHTML =
    tasks
      .map(task => {
        const latest = task.logs[task.logs.length - 1];

        return latest
          ? `${task.title} · ${latest.type} · ${latest.user} · ${latest.time}<br>`
          : `${task.title} · 미완료<br>`;
      })
      .join("");
}
