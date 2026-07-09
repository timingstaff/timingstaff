function clockIn() {
  if (!requireNoticeConfirm()) return;

  clockRecords.push({
    user: currentUser,
    type: "출근",
    time: getNowTime()
  });

  saveData();
  renderClockLog();
  renderManagerDashboard();
}

function clockOut() {
  if (!requireNoticeConfirm()) return;

  clockRecords.push({
    user: currentUser,
    type: "퇴근",
    time: getNowTime()
  });

  saveData();
  renderClockLog();
  renderManagerDashboard();
}

function renderClockLog() {
  const clockLog = document.getElementById("clockLog");

  if (!clockLog) return;

  if (clockRecords.length === 0) {
    clockLog.textContent = "아직 기록이 없습니다.";
    return;
  }

  const latest = clockRecords[clockRecords.length - 1];

  clockLog.textContent =
    `${latest.user} ${latest.type} 기록 · ${latest.time}`;
}
