# Verification Report: sales-management-v2-runtime-split

## Summary

영업관리시스템 v2.0 Phase A의 runtime split skeleton을 추가했다.
main-api는 유지하고 worker/service 실행 단위의 설정, entrypoint, compose skeleton,
unit smoke test를 도입했다.

## Commands

```bash
cd backend && uv run pytest tests/unit/test_runtime_split.py -q
docker compose config
make verify
```

## Results

- unit smoke test 통과: `3 passed`
- `docker compose config` 통과
- `make verify` 통과
- backend unit test: `8 passed`
- backend integration test: `11 passed`
- frontend test: `9 passed`
- warning:
  - `StarletteDeprecationWarning` 1건 존재. 현재 실패 원인은 아니며 후속 의존성 정리 대상이다.

## Risks / Follow-ups

- worker는 아직 business logic이 없는 skeleton이다.
- 다음 단계에서 shared contract와 command API가 실제 사용되는지 연결해야 한다.
