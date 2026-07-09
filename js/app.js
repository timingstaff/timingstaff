import React, { useMemo, useState } from "react";
import "./style.css";
import {
  loadData,
  saveData,
  defaultData,
} from "./storage";

const menus = [
  "홈",
  "공지",
  "출퇴근",
  "고양이케어",
  "오늘의할일",
  "업무일지",
  "재고체크",
  "매출",
  "관리자",
];

export default function App() {
  const [page, setPage] = useState("홈");
  const [data, setData] = useState(() => loadData());

  const today = useMemo(() => {
    const now = new Date();
    return {
      date: now.toLocaleDateString("ko-KR"),
      day: now.toLocaleDateString("ko-KR", { weekday: "long" }),
    };
  }, []);

  const updateData = (nextData) => {
    setData(nextData);
    saveData(nextData);
  };

  const addItem = (key, item) => {
    const nextData = {
      ...data,
      [key]: [item, ...data[key]],
    };
    updateData(nextData);
  };

  const removeItem = (key, id) => {
    const nextData = {
      ...data,
      [key]: data[key].filter((item) => item.id !== id),
    };
    updateData(nextData);
  };

  const resetAll = () => {
    if (!window.confirm("전체 데이터를 초기화할까요?")) return;
    updateData(defaultData);
  };

  return (
    <div className="app">
      <header className="top">
        <div>
          <h1>타이밍 매니저</h1>
          <p>
            {today.date} · {today.day}
          </p>
        </div>
        <button className="dangerBtn" onClick={resetAll}>
          초기화
        </button>
      </header>

      <nav className="nav">
        {menus.map((menu) => (
          <button
            key={menu}
            className={page === menu ? "active" : ""}
            onClick={() => setPage(menu)}
          >
            {menu}
          </button>
        ))}
      </nav>

      <main className="main">
        {page === "홈" && <Home data={data} today={today} />}
        {page === "공지" && (
          <Notice data={data} addItem={addItem} removeItem={removeItem} />
        )}
        {page === "출퇴근" && (
          <Attendance data={data} addItem={addItem} removeItem={removeItem} />
        )}
        {page === "고양이케어" && (
          <CatCare data={data} addItem={addItem} removeItem={removeItem} />
        )}
        {page === "오늘의할일" && (
          <Todo data={data} updateData={updateData} removeItem={removeItem} />
        )}
        {page === "업무일지" && (
          <WorkLog data={data} addItem={addItem} removeItem={removeItem} />
        )}
        {page === "재고체크" && (
          <Inventory data={data} addItem={addItem} removeItem={removeItem} />
        )}
        {page === "매출" && (
          <Sales data={data} addItem={addItem} removeItem={removeItem} />
        )}
        {page === "관리자" && <Admin data={data} />}
      </main>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <section className="card">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function Home({ data, today }) {
  return (
    <div className="grid">
      <Card title="오늘">
        <p className="bigText">{today.date}</p>
        <p>{today.day}</p>
        <p className="muted">날씨 연동은 다음 버전에서 추가</p>
      </Card>

      <Card title="공지">
        <MiniList items={data.notices} empty="공지 없음" />
      </Card>

      <Card title="오늘의 할 일">
        <MiniList items={data.todos} empty="할 일 없음" />
      </Card>

      <Card title="고양이 케어">
        <MiniList items={data.catCare} empty="체크 없음" />
      </Card>
    </div>
  );
}

function Notice({ data, addItem, removeItem }) {
  const [text, setText] = useState("");

  const submit = () => {
    if (!text.trim()) return;
    addItem("notices", makeItem(text));
    setText("");
  };

  return (
    <Card title="공지">
      <InputArea
        value={text}
        setValue={setText}
        placeholder="공지 내용을 입력하세요"
        onSubmit={submit}
      />
      <List items={data.notices} onRemove={(id) => removeItem("notices", id)} />
    </Card>
  );
}

function Attendance({ data, addItem, removeItem }) {
  const [name, setName] = useState("");

  const check = (type) => {
    if (!name.trim()) return;
    addItem("attendance", {
      id: Date.now(),
      text: `${name} ${type}`,
      time: new Date().toLocaleString("ko-KR"),
    });
    setName("");
  };

  return (
    <Card title="직원 출퇴근">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="직원 이름"
      />
      <div className="row">
        <button onClick={() => check("출근")}>출근</button>
        <button onClick={() => check("퇴근")}>퇴근</button>
      </div>
      <List
        items={data.attendance}
        onRemove={(id) => removeItem("attendance", id)}
      />
    </Card>
  );
}

function CatCare({ data, addItem, removeItem }) {
  const careItems = ["밥", "물", "화장실", "약", "특이사항"];
  const [text, setText] = useState("");

  const submit = (care) => {
    addItem("catCare", makeItem(care));
  };

  const submitMemo = () => {
    if (!text.trim()) return;
    addItem("catCare", makeItem(text));
    setText("");
  };

  return (
    <Card title="고양이 케어">
      <div className="row wrap">
        {careItems.map((item) => (
          <button key={item} onClick={() => submit(item)}>
            {item}
          </button>
        ))}
      </div>

      <InputArea
        value={text}
        setValue={setText}
        placeholder="고양이 특이사항"
        onSubmit={submitMemo}
      />

      <List items={data.catCare} onRemove={(id) => removeItem("catCare", id)} />
    </Card>
  );
}

function Todo({ data, updateData, removeItem }) {
  const [text, setText] = useState("");

  const submit = () => {
    if (!text.trim()) return;
    updateData({
      ...data,
      todos: [makeItem(text, { done: false }), ...data.todos],
    });
    setText("");
  };

  const toggle = (id) => {
    updateData({
      ...data,
      todos: data.todos.map((todo) =>
        todo.id === id ? { ...todo, done: !todo.done } : todo
      ),
    });
  };

  return (
    <Card title="오늘의 할 일">
      <InputArea
        value={text}
        setValue={setText}
        placeholder="할 일을 입력하세요"
        onSubmit={submit}
      />

      <ul className="list">
        {data.todos.map((todo) => (
          <li key={todo.id}>
            <span
              className={todo.done ? "done" : ""}
              onClick={() => toggle(todo.id)}
            >
              {todo.text}
            </span>
            <button onClick={() => removeItem("todos", todo.id)}>삭제</button>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function WorkLog({ data, addItem, removeItem }) {
  const [text, setText] = useState("");

  const submit = () => {
    if (!text.trim()) return;
    addItem("workLogs", makeItem(text));
    setText("");
  };

  return (
    <Card title="업무일지">
      <InputArea
        value={text}
        setValue={setText}
        placeholder="손님 특징, 컴플레인, 예약, 특이사항"
        onSubmit={submit}
      />
      <List items={data.workLogs} onRemove={(id) => removeItem("workLogs", id)} />
    </Card>
  );
}

function Inventory({ data, addItem, removeItem }) {
  const [text, setText] = useState("");

  const submit = () => {
    if (!text.trim()) return;
    addItem("inventory", makeItem(text));
    setText("");
  };

  return (
    <Card title="재고 체크">
      <InputArea
        value={text}
        setValue={setText}
        placeholder="예: 맥주 12병 / 토닉워터 부족"
        onSubmit={submit}
      />
      <List
        items={data.inventory}
        onRemove={(id) => removeItem("inventory", id)}
      />
    </Card>
  );
}

function Sales({ data, addItem, removeItem }) {
  const [cash, setCash] = useState("");
  const [transfer, setTransfer] = useState("");
  const [memo, setMemo] = useState("");

  const submit = () => {
    const cashNum = Number(cash || 0);
    const transferNum = Number(transfer || 0);

    addItem("sales", {
      id: Date.now(),
      text: `현금 ${cashNum.toLocaleString()}원 / 계좌 ${transferNum.toLocaleString()}원 / 합계 ${(
        cashNum + transferNum
      ).toLocaleString()}원 ${memo ? `/ ${memo}` : ""}`,
      time: new Date().toLocaleString("ko-KR"),
    });

    setCash("");
    setTransfer("");
    setMemo("");
  };

  return (
    <Card title="매출">
      <input
        value={cash}
        onChange={(e) => setCash(e.target.value)}
        placeholder="현금"
        type="number"
      />
      <input
        value={transfer}
        onChange={(e) => setTransfer(e.target.value)}
        placeholder="계좌이체"
        type="number"
      />
      <input
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        placeholder="메모"
      />
      <button onClick={submit}>매출 기록</button>

      <List items={data.sales} onRemove={(id) => removeItem("sales", id)} />
    </Card>
  );
}

function Admin({ data }) {
  return (
    <Card title="관리자 전용모드">
      <p>현재는 관리자 화면 뼈대입니다.</p>
      <p>다음 버전에서 공연자 정보, 급여관리, 권한관리를 붙입니다.</p>

      <div className="adminBox">
        <p>공지 {data.notices.length}개</p>
        <p>출퇴근 기록 {data.attendance.length}개</p>
        <p>고양이 케어 {data.catCare.length}개</p>
        <p>할 일 {data.todos.length}개</p>
        <p>업무일지 {data.workLogs.length}개</p>
        <p>재고 기록 {data.inventory.length}개</p>
        <p>매출 기록 {data.sales.length}개</p>
      </div>
    </Card>
  );
}

function InputArea({ value, setValue, placeholder, onSubmit }) {
  return (
    <div className="inputArea">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
      />
      <button onClick={onSubmit}>등록</button>
    </div>
  );
}

function List({ items, onRemove }) {
  if (!items.length) return <p className="muted">아직 기록이 없습니다.</p>;

  return (
    <ul className="list">
      {items.map((item) => (
        <li key={item.id}>
          <div>
            <p>{item.text}</p>
            <small>{item.time}</small>
          </div>
          <button onClick={() => onRemove(item.id)}>삭제</button>
        </li>
      ))}
    </ul>
  );
}

function MiniList({ items, empty }) {
  if (!items.length) return <p className="muted">{empty}</p>;

  return (
    <ul className="miniList">
      {items.slice(0, 3).map((item) => (
        <li key={item.id}>{item.text}</li>
      ))}
    </ul>
  );
}

function makeItem(text, extra = {}) {
  return {
    id: Date.now(),
    text,
    time: new Date().toLocaleString("ko-KR"),
    ...extra,
  };
            }
