function clockIn() {
  if (!requireNoticeConfirm()) return;

  const time = getNowTime();

  clockRecords.push({
    user: currentUser,
    type: "출근",
    time
  });

  saveData();
  addTimeline(currentUser, "출근", `${currentUser} 출근 기록 · ${time}`);

  renderClockLog();
  renderManagerDashboard();
}

function clockOut() {
  if (!requireNoticeConfirm()) return;

  const time = getNowTime();

  clockRecords.push({
    user: currentUser,
    type: "퇴근",
    time
  });

  saveData();
  addTimeline(currentUser, "퇴근", `${currentUser} 퇴근 기록 · ${time}`);

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
