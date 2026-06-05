# Verification Report

## Planned Checks

- Backend integration tests for lead conversion and opportunity list payload
- Frontend tests for converted lead link and originating lead link behavior
- `make verify`
- Cloud Run deploy
- Server database data sync check for 3 demo records

## Results

- Backend integration regression:
  - `UV_CACHE_DIR=/private/tmp/uv-cache PYTHONPYCACHEPREFIX=/private/tmp/pycache uv run pytest tests/integration/test_api_flow.py -q`
  - Result: `11 passed`
- Frontend regression:
  - `npm test -- --run src/App.test.tsx`
  - Result: `8 passed`
- Full verification:
  - `UV_CACHE_DIR=/private/tmp/uv-cache PYTHONPYCACHEPREFIX=/private/tmp/pycache make verify`
  - Result: backend lint/typecheck/unit/integration and frontend lint/typecheck/test all passed
- Cloud Run redeploy:
  - Backend revision: `sales-management-backend-00020-sb6`
  - Frontend revision: `sales-management-frontend-00009-jwt`
  - Backend health: `https://sales-management-backend-nrkjvfgjra-du.a.run.app/api/v1/health` returned `{"success":true,"data":{"status":"ok"}}`
  - Frontend root: `https://sales-management-frontend-nrkjvfgjra-du.a.run.app/` returned HTML with title `CherrySales`
- Server demo data sync:
  - `python3 scripts/gcp/seed_cloud_run_demo.py`
  - Result: `Cloud Run demo seed synced.`
  - API verification summary:
    - Demo leads: `3`
    - Demo opportunities: `3`
    - Demo activities: `3`
    - Leads returned `converted_opportunity_name`
    - Opportunities returned `lead_company_name` and `lead_contact_name`
