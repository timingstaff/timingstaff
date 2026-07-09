function getCompletedTaskCount() {
  return tasks.filter(task =>
    task.logs.some(log =>
      log.type === "완료" || log.type === "재확인 완료"
    )
  ).length;
}

function updateTaskProgress() {
  const total = tasks.length;
  const completed = getCompletedTaskCount();
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  document.getElementById("taskProgressText").textContent =
    `${completed} / ${total} 완료`;

  document.getElementById("taskProgressFill").style.width =
    `${percent}%`;
}

function completeTask(index) {
  if (!requireNoticeConfirm()) return;

  const task = tasks[index];

  const hasCompleted = task.logs.some(log =>
    log.type === "완료" || log.type === "재확인 완료"
  );

  const actionType = hasCompleted ? "재확인 완료" : "완료";
  const time = getNowTime();

  task.logs.push({
    user: currentUser,
    time,
    type: actionType
  });

  saveData();
  addTimeline(currentUser, actionType, `${task.title} · ${actionType} · ${time}`);

  renderTasks();
  updateTaskProgress();
  updateStatusBox();
  renderManagerDashboard();
}

function requestRecheck(index) {
  if (!requireNoticeConfirm()) return;

  const time = getNowTime();

  tasks[index].logs.push({
    user: currentUser,
    time,
    type: "재확인 요청"
  });

  saveData();
  addTimeline(currentUser, "재확인 요청", `${tasks[index].title} · 재확인 요청 · ${time}`);

  renderTasks();
  renderManagerDashboard();

  const statusBox = document.getElementById("statusBox");

  statusBox.className = "status-card status-yellow";

  statusBox.innerHTML = `
    <strong>🟡 재확인 요청</strong>
    <p>${tasks[index].title} 재확인이 필요합니다.</p>
  `;
}

function renderTasks() {
  const taskList = document.getElementById("taskList");

  taskList.innerHTML = tasks.map((task,index)=>{

    const logs = task.logs.length
      ? task.logs.map(log=>{

        let badge="";

        if(log.type==="완료")
          badge='<span class="badge green">완료</span>';

        else if(log.type==="재확인 완료")
          badge='<span class="badge blue">재확인 완료</span>';

        else
          badge='<span class="badge yellow">재확인 요청</span>';

        return `
          <div>
            ${badge}
            ${log.user} · ${log.time}
          </div>
        `;

      }).join("")
      :
      "⏳ 미완료";

    const buttonText =
      task.logs.some(log =>
        log.type==="완료" ||
        log.type==="재확인 완료")
      ? "재확인 완료"
      : "완료";

    return `
      <div class="task">
        <div class="task-title">
          ${task.title}
        </div>

        <div class="task-log">
          ${logs}
        </div>

        <div class="task-actions">
          <button
            class="green-btn"
            onclick="completeTask(${index})">
            ${buttonText}
          </button>

          <button
            class="gray-btn"
            onclick="requestRecheck(${index})">
            재확인 요청
          </button>
        </div>
      </div>
    `;

  }).join("");
}
