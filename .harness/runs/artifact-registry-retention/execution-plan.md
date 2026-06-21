# Execution Plan: artifact-registry-retention

## 1. Files to Modify

- `.github/workflows/deploy-cloud-run.yml`: `latest + prod` 태그 전략과 cleanup policy 자동 적용
- `scripts/gcp/deploy-cloud-run.sh`: 수동 배포도 `latest + prod` 태그 전략으로 일치
- `docs/deployment/gcp-cloud-run.md`: retention 정책과 즉시 정리 절차 문서화
- `plan.md`: 2026-06-21 작업 상태 추가
- `history.md`: 완료 후 실행 이력 추가
- `.harness/runs/artifact-registry-retention/verification-report.md`: 검증/원격 정리 결과 기록

## 1.1 Files to Read Only

- `AGENTS.md`
- `.harness/rules/security-rules.md`
- `.harness/rules/testing-rules.md`
- `.github/workflows/deploy-cloud-run.yml`
- `scripts/gcp/deploy-cloud-run.sh`
- `docs/deployment/gcp-cloud-run.md`

## 1.2 Shared File Coordination

- `.github/workflows/deploy-cloud-run.yml`: 배포 태그/cleanup 정책 범위만 수정
- `docs/deployment/gcp-cloud-run.md`: retention 정책 섹션 추가

## 2. Implementation Steps

1. 현재 Cloud Run revision digest와 Artifact Registry 이미지 상태를 확인해 keep set을 정의한다.
2. workflow와 수동 배포 스크립트를 `latest + prod` 태그 전략으로 수정한다.
3. cleanup policy를 적용하는 스텝과 운영 문서를 추가한다.
4. 현재 운영 저장소에서 active digest와 최근 5개를 제외한 오래된 이미지를 삭제한다.
5. 검증과 기록을 마무리한다.

## 3. Tests to Add or Update

- 신규 코드 테스트는 추가하지 않는다.
- 아래 검증을 수행한다.
  - `bash -n scripts/gcp/deploy-cloud-run.sh`
  - workflow YAML 파싱
  - `make verify`

## 4. Verification Steps

```bash
bash -n scripts/gcp/deploy-cloud-run.sh
python -c "import yaml, pathlib; yaml.safe_load(pathlib.Path('.github/workflows/deploy-cloud-run.yml').read_text())"
make verify
```

## 5. Assumptions

- [ASSUMPTION] 유지 정책은 `latest + prod + 최근 5개`를 기본값으로 한다.
- [ASSUMPTION] 현재 Cloud Run이 사용 중인 digest는 tagged 여부와 무관하게 절대 삭제하지 않는다.
- [ASSUMPTION] Artifact Registry cleanup policy는 운영 저장소에 즉시 적용 가능하다.

## 5.1 Rollback Scope

- workflow / 배포 스크립트 / 문서 변경 revert
- cleanup policy는 이전 정책이 없었으므로 필요 시 dry-run 또는 별도 새 정책으로 되돌린다.

## 6. Approval Required

Approval is required before implementation if this task includes:

- [ ] Database schema change
- [ ] Authentication / authorization
- [ ] Payment / billing
- [ ] External API contract
- [x] CI/CD or deployment
- [ ] Production dependency
- [ ] Large refactor
