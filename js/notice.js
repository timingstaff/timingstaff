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

  saveData();
  renderNoticeReadList();
  updateStatusBox();
  renderManagerDashboard();
}

function renderNoticeReadList() {
  const readList = document.getElementById("readList");
  if (!readList) return;

  let html = `<strong>읽음 ${noticeConfirmedUsers.length} / ${staffMembers.length}</strong><br>`;

  staffMembers.forEach(name => {
    const confirmed = noticeConfirmedUsers.find(user => user.name === name);

    if (confirmed) {
      html += `✅ ${name} · ${confirmed.time}<br>`;
    } else {
      html += `⏳ ${name} · 미확인<br>`;
    }
  });

  readList.innerHTML = html;
}
