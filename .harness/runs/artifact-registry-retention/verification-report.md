# Verification Report: artifact-registry-retention

## Summary

Artifact Registry 비용 절감을 위해 배포 태그 전략과 cleanup policy를 정리했다.
운영 저장소 `cherrychat-prod-2026 / cherrychat-repo`에 cleanup policy를 적용했고,
현재 Cloud Run이 사용하는 digest를 보존한 상태에서 backend/frontend 이미지를
각각 최근 5개만 남기도록 정리했다.

## Commands

```bash
bash -n scripts/gcp/deploy-cloud-run.sh
bash -n scripts/gcp/apply-artifact-cleanup-policy.sh
bash -n scripts/gcp/prune-artifact-images.sh
python -c "import yaml, pathlib; yaml.safe_load(pathlib.Path('.github/workflows/deploy-cloud-run.yml').read_text())"
make verify
```

## Results

- `bash -n scripts/gcp/deploy-cloud-run.sh` 통과
- `bash -n scripts/gcp/apply-artifact-cleanup-policy.sh` 통과
- `bash -n scripts/gcp/prune-artifact-images.sh` 통과
- workflow YAML 파싱 통과
- `make verify` 통과
- 운영 저장소 cleanup policy 적용 완료
  - keep tagged: `latest`, `prod`
  - keep recent: backend `5`, frontend `5`
  - delete untagged older than `7d`
- 운영 active digest에 `prod` 태그 추가 완료
  - backend: `sha256:bd8aec8b06cd19232b929107d2e553dad2b85a796d699ec568cddd4cd8d00e2c`
  - frontend: `sha256:7540e847d5ca1fba42b1fe5f8870a0c755e61222594a7abe58b216f1a20ba921`
- 운영 오래된 이미지 정리 완료
  - backend 남은 digest: 5개
  - frontend 남은 digest: 5개
- repository size field는 즉시 크게 줄지 않았음
  - before: `68238.654MB`
  - after: `68238.323MB`
  - Artifact Registry 용량 지표 반영/GC 지연 가능성 있음

## Risks / Follow-ups

- 실제 운영 프로젝트와 repo 문서 기본 프로젝트가 다를 수 있으므로 적용 대상 프로젝트를 명시적으로 기록해야 한다.
- cleanup policy는 시간이 지나면서 자동 삭제를 수행하므로 첫 주 동안 결과를 모니터링하는 것이 좋다.
- 다음 배포 이후 `prod` 태그가 workflow에서 자동 갱신되는지 한 번 더 확인하면 안정적이다.
