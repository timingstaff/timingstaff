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
  const checkInventory = getCheckInventoryCount();

  document.getElementById("managerSummary").innerHTML = `
    <div class="manager-box">매출<strong>65%</strong></div>
    <div class="manager-box">업무<strong>${completed}/${total}</strong></div>
    <div class="manager-box">공지 미확인<strong>${unread}명</strong></div>
    <div class="manager-box">재고 확인<strong>${checkInventory}건</strong></div>
  `;

  document.getElementById("managerStaffStatus").innerHTML =
    clockRecords.length
      ? clockRecords.map(record => `${record.user} · ${record.type} · ${record.time}<br>`).join("")
      : "아직 출퇴근 기록이 없습니다.";

  document.getElementById("managerNoticeStatus").innerHTML =
    staffMembers.map(name => {
      const found = noticeConfirmedUsers.find(user => user.name === name);
      return found ? `✅ ${name} · ${found.time}<br>` : `⏳ ${name} · 미확인<br>`;
    }).join("");

  document.getElementById("managerTaskStatus").innerHTML =
    tasks.map(task => {
      const latest = task.logs[task.logs.length - 1];
      return latest
        ? `${task.title} · ${latest.type} · ${latest.user} · ${latest.time}<br>`
        : `${task.title} · 미완료<br>`;
    }).join("");

  renderManagerBriefing(unread, completed, total, checkInventory);
}

function renderManagerBriefing(unread, completed, total, checkInventory) {
  const briefing = document.getElementById("managerBriefing");
  if (!briefing) return;

  let lines = [];

  if (unread > 0) {
    lines.push(`• 공지 미확인 직원이 ${unread}명 있습니다.`);
  }

  if (completed < total) {
    lines.push(`• 오늘 업무가 ${total - completed}개 남아 있습니다.`);
  }

  if (checkInventory > 0) {
    lines.push(`• 재고 확인이 필요한 항목이 ${checkInventory}건 있습니다.`);
  }

  lines.push("• 현재 매출은 목표 대비 65%입니다.");

  if (lines.length === 1 && unread === 0 && completed === total && checkInventory === 0) {
    lines = ["• 현재 매장은 순조롭게 운영 중입니다."];
  }

  briefing.innerHTML = lines.join("<br>");
}
