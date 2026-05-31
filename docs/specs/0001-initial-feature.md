# Task Spec: Sales Management MVP Foundation

## 1. Background

The project is being initialized as a Korean-language 영업관리시스템.
The first implementation establishes a small but usable sales-management foundation instead of jumping directly into a broad enterprise product.

## 2. Goal

Build the first approved MVP slice for managing Leads, Accounts, Contacts, Opportunities, Activities, Forecast, Dashboard, and development JWT RBAC.

## 3. Non-goals

- Do not implement unrelated features.
- Do not call the product by external CRM category acronyms in product-facing documentation.
- Do not implement billing, accounting, marketing automation, or complex CRM integrations in the first slice.
- Do not implement production OIDC/SSO in v1.

## 4. Acceptance Criteria

- [ ] Architecture docs are updated.
- [ ] First MVP workflow is defined before implementation.
- [ ] Tests are defined for any business logic introduced.
- [ ] `make verify` runs backend and frontend checks.
- [ ] Lead score, forecast, stage change, and permission behavior are covered by tests.
- [ ] Verification commands pass.

## 5. Verification Commands

```bash
make lint
make typecheck
make test
make verify
```
