# Impact Map: Sales Health Zero KPI Rendering

## Goal

대시보드 첫 화면의 `Sales Health` 패널에서 실제 KPI 값이 0일 때 `8%`가 아니라 `0%`로 표시되도록 수정한다.

## Why

- 데이터가 없는 상태를 8%로 보이게 하면 사용자가 실제 성과가 있는 것으로 오해할 수 있다.
- 대시보드 KPI는 실제 데이터 상태를 그대로 반영해야 한다.

## Files In Scope

- `frontend/src/features/Dashboard.tsx`
- `frontend/src/App.test.tsx`

## Expected Change

1. `Sales Health` 진행률 계산 로직에서 0값 보정치를 제거한다.
2. 0 데이터일 때 `0%`가 렌더링되는 회귀 테스트를 추가한다.

## Risks

- 기존에 “비어 보이지 않게 하려던” 디자인 의도가 사라질 수 있다.
- 수치 표현이 바뀌므로 테스트에서 명시적으로 고정해야 한다.

## Verification

- `npm --prefix frontend test -- --run`
- 필요 시 `make verify`
