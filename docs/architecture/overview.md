# Architecture Overview

## 1. Purpose

SalesMangemetService is an internal sales management system.
It will help a team manage customer accounts, sales opportunities, follow-up tasks, pipeline status, and performance reporting in one workflow.

## 2. Users

- Primary user: sales representative who manages customers, deals, and follow-up activities.
- Admin user: manager who reviews pipeline, performance, permissions, and team-level reports.
- External system: future integrations may include email, calendar, accounting, CRM import/export, and notification services.

## 3. Major Components

```text
Client / UI
  -> API
    -> Application Service
      -> Domain Model
        -> Repository / External Adapter
```

## 4. Key Flows

1. Register or import a customer account and contact.
2. Create a sales opportunity, update stage, amount, owner, and expected close date.
3. Schedule follow-up activity and review pipeline/reporting views.

## 5. Architecture Decisions

- Keep domain logic separate from UI and infrastructure.
- Start with a clear API/data contract before choosing implementation details.
- Do not add production dependencies until the first approved implementation plan.

## 6. Risks

- Requirements may expand quickly into full CRM scope; initial MVP must stay focused.
- Customer/contact data may contain personal information and needs explicit handling rules.
- Reporting requirements may affect the first data model.

## 7. Open Questions

- Which platform should be built first: web app, desktop app, or mobile-friendly web?
- What roles and permissions are required at launch?
- Should the MVP support import/export from Excel or Google Sheets?
