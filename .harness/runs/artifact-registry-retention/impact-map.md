# Impact Map: artifact-registry-retention

Generated at: 2026-06-21 15:10:00

## 1. Task Summary

Artifact Registry 비용 절감을 위해 현재 운영 중인 이미지 digest를 보존한 상태에서
오래된 이미지를 정리하고, GitHub Actions / 수동 배포 스크립트 / 운영 문서를
`latest + prod + 최근 5개 유지` 전략으로 바꾼다.

## 2. Files to Modify

| File | Reason |
|---|---|
| `.github/workflows/deploy-cloud-run.yml` | 배포 태그 전략과 cleanup policy 적용 자동화 |
| `scripts/gcp/deploy-cloud-run.sh` | 수동 배포 스크립트 태그 전략 일치 |
| `docs/deployment/gcp-cloud-run.md` | 운영 retention 정책과 cleanup 적용 절차 문서화 |
| `plan.md` | 현재 작업 상태 반영 |
| `history.md` | 완료 이력 기록 |
| `.harness/runs/artifact-registry-retention/verification-report.md` | 검증 결과 기록 |

## 3. Files to Read

| File | Reason |
|---|---|
| `AGENTS.md` | CI/CD, 배포 수정 범위 확인 |
| `.harness/rules/security-rules.md` | 운영 명령과 secret 노출 방지 확인 |
| `.harness/rules/testing-rules.md` | 검증 범위 확인 |
| `.github/workflows/deploy-cloud-run.yml` | 현재 배포 태그 구조 확인 |
| `scripts/gcp/deploy-cloud-run.sh` | 수동 배포 전략 확인 |
| `docs/deployment/gcp-cloud-run.md` | 기존 배포 문서와 일치시킬 기준 확인 |

## 4. Dependent Files

| File | Dependency |
|---|---|
| GCP Artifact Registry repository | cleanup policy 적용 대상 |
| Cloud Run backend/frontend revisions | active digest 보존 기준 |

## 5. Tests Affected

| Test | Reason |
|---|---|
| `make verify` | repo 기본 회귀 검증 |
| `bash -n scripts/gcp/deploy-cloud-run.sh` | 배포 스크립트 문법 검증 |
| `python -c ... yaml.safe_load(...)` | workflow YAML 파싱 검증 |

## 6. Parallel Work Conflicts

| Shared file or module | Potential conflict | Coordination plan |
|---|---|---|
| `.github/workflows/deploy-cloud-run.yml` | 다른 배포 수정과 충돌 가능 | retention/cleanup 관련 변경만 최소 범위 적용 |
| `docs/deployment/gcp-cloud-run.md` | 운영 문서 수정 충돌 가능 | 새 retention 섹션만 추가 |

## 7. Architecture Boundaries

Do not modify:

- 애플리케이션 기능 코드
- 인증/권한 로직
- DB 스키마

## 8. Existing Patterns

Follow:

- GitHub Actions에서 backend/frontend를 별도 이미지로 빌드/배포하는 현재 구조 유지
- 운영 문서에 실제 명령과 정책을 함께 남기는 패턴 유지

## 9. Merge Sequencing

- Merge Agent 또는 배포 담당 브랜치에서 우선 적용 가능

## 10. Risk Areas

- 현재 Cloud Run이 쓰는 digest를 잘못 삭제하면 롤백/재기동 위험이 있다.
- cleanup policy 문법이 틀리면 정책이 적용되지 않거나 의도치 않게 과도 삭제될 수 있다.
- 현재 로컬 gcloud 프로젝트가 repo 기본 프로젝트와 다를 수 있어 운영 문서와 실제 적용 대상을 분리해 기록해야 한다.
