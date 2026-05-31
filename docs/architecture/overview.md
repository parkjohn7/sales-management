# Architecture Overview

## 1. Purpose

SalesMangemetService is an internal sales management system.
It will help a team manage customer accounts, sales opportunities, follow-up tasks, pipeline status, and performance reporting in one workflow.
Product-facing documentation must use `영업관리시스템` as the product name.

## 2. Users

- Primary user: sales representative who manages customers, deals, and follow-up activities.
- Admin user: manager who reviews pipeline, performance, permissions, and team-level reports.
- External system: future integrations may include email, calendar, accounting, CRM import/export, and notification services.

## 3. Major Components

```text
React / TypeScript / Tailwind UI
  -> FastAPI /api/v1
    -> Application Services
      -> Domain Services
        -> SQLAlchemy Models / PostgreSQL
```

## 4. Key Flows

1. Register or import a customer account and contact.
2. Create a sales opportunity, update stage, amount, owner, and expected close date.
3. Schedule follow-up activity and review pipeline/reporting views.

## 5. Architecture Decisions

- Keep domain logic separate from UI and infrastructure.
- Use development JWT RBAC for v1 and keep OIDC/SSO as a later integration.
- Preserve the common response shape across all APIs.
- Feature agents work on separate branches and merge only after Test Agent verification.

## 6. Risks

- Requirements may expand quickly into full CRM scope; initial MVP must stay focused.
- Customer/contact data may contain personal information and needs explicit handling rules.
- Reporting requirements may affect the first data model.

## 7. Open Questions

- Web app is first; mobile app is out of MVP scope.
- Launch roles are Super Admin, Sales Manager, Sales Rep, Executive, and Marketing User.
- Should the MVP support import/export from Excel or Google Sheets?
