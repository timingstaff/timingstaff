# TimingStaff API

> 데이터가 연결되면 운영이 실시간이 된다.

---

# 목적

TimingStaff에서 사용하는 데이터 항목과 연결 방식을 정의한다.

이 문서는 Supabase 연동 전 기준 문서로 사용한다.

---

# 1. Staff API

직원 정보

- id
- name
- role
- phone
- hourly_wage
- status
- created_at

---

# 2. Notice API

공지 정보

- id
- title
- content
- level
- created_by
- created_at
- updated_at
- is_active

---

# 3. Notice Read API

공지 읽음 확인

- id
- notice_id
- staff_id
- read_at

---

# 4. Attendance API

출퇴근 기록

- id
- staff_id
- date
- clock_in
- clock_out
- total_hours
- memo

---

# 5. Task API

오늘 해야 할 일

- id
- title
- description
- repeat_type
- day_of_week
- assigned_to
- status
- created_by
- created_at

---

# 6. Task Log API

업무 완료 / 재확인 기록

- id
- task_id
- staff_id
- action_type
- memo
- created_at

---

# 7. Inventory API

재고 정보

- id
- name
- category
- barcode
- unit
- quantity
- min_quantity
- status
- memo
- updated_by
- updated_at

---

# 8. Sales API

매출 정보

- id
- date
- total_sales
- target_sales
- achievement_rate
- memo
- created_at

---

# 9. Cat Care API

고양이 케어 기록

- id
- date
- care_type
- status
- staff_id
- memo
- photo_url
- created_at

---

# 10. Performance API

공연 관리

- id
- performance_date
- team_name
- members
- setlist
- fee
- settlement_status
- memo
- created_at

---

# 11. Admin Settings API

관리자 설정

- id
- store_name
- open_time
- close_time
- target_sales
- notice_lock_enabled
- updated_at

---

# 12. Timeline API

오늘 활동 기록

- id
- type
- title
- description
- staff_id
- created_at

---

# 13. AI Briefing API

AI 운영 브리핑

- id
- date
- summary
- recommendation
- risk_level
- created_at

---

# API 원칙

- 모든 데이터는 id를 가진다.
- 모든 중요한 행동은 시간 기록을 남긴다.
- 직원용 데이터와 관리자용 데이터를 구분한다.
- 삭제보다 비활성화를 우선한다.
- AI는 저장된 데이터를 기반으로만 분석한다.
- 실시간 공유가 필요한 데이터는 Supabase에 저장한다.
