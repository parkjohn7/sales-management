# Deployment

## Environments

- local
- dev
- staging
- production

## Deployment Steps

1. 코드 기준 검증 실행: `make verify`
2. 백엔드 마이그레이션 반영: `alembic upgrade head`
3. 백엔드/프론트 서비스 재시작 및 health check 확인
4. 핵심 업무 흐름 점검(고객사 삭제, 영업기회 수정, 활동 등록)
5. 로그에서 API 4xx/5xx 확인 후 릴리스 완료

## Rollback

1. 직전 배포 이미지/커밋으로 백엔드 롤백
2. 직전 프론트 이미지/커밋으로 롤백
3. 필요 시 DB 롤백(`alembic downgrade`) 또는 백업 복원

## Release Gate

- 프론트: `npm --prefix frontend run typecheck`, `npm --prefix frontend test -- --run`
- 백엔드: `uv run pytest`
- DB: `alembic current`가 최신 리비전과 일치
