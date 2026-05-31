"""salesforce like fields

Revision ID: 0003_salesforce_like_fields
Revises: 0002_admin_settings
Create Date: 2026-06-01
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0003_salesforce_like_fields"
down_revision: str | None = "0002_admin_settings"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("accounts", sa.Column("account_type", sa.String(length=64), nullable=True))
    op.add_column("accounts", sa.Column("annual_revenue", sa.Numeric(14, 2), nullable=True))
    op.add_column("accounts", sa.Column("employee_count", sa.Integer(), nullable=True))
    op.add_column("accounts", sa.Column("phone", sa.String(length=64), nullable=True))
    op.add_column("accounts", sa.Column("owner_id", sa.String(length=36), nullable=True))
    op.create_index("ix_accounts_account_type", "accounts", ["account_type"])
    op.create_index("ix_accounts_phone", "accounts", ["phone"])
    op.create_index("ix_accounts_owner_id", "accounts", ["owner_id"])

    op.add_column("contacts", sa.Column("mobile_phone", sa.String(length=64), nullable=True))
    op.add_column("contacts", sa.Column("department", sa.String(length=120), nullable=True))
    op.create_index("ix_contacts_mobile_phone", "contacts", ["mobile_phone"])

    op.add_column("leads", sa.Column("title", sa.String(length=120), nullable=True))
    op.add_column("leads", sa.Column("lead_source", sa.String(length=64), nullable=True))
    op.add_column("leads", sa.Column("rating", sa.String(length=32), nullable=True))
    op.add_column("leads", sa.Column("annual_revenue", sa.Numeric(14, 2), nullable=True))
    op.add_column("leads", sa.Column("employee_count", sa.Integer(), nullable=True))
    op.add_column("leads", sa.Column("campaign_name", sa.String(length=255), nullable=True))
    op.create_index("ix_leads_lead_source", "leads", ["lead_source"])
    op.create_index("ix_leads_rating", "leads", ["rating"])
    op.create_index("ix_leads_campaign_name", "leads", ["campaign_name"])

    op.add_column(
        "opportunities",
        sa.Column("opportunity_type", sa.String(length=64), nullable=True),
    )
    op.add_column("opportunities", sa.Column("next_step", sa.String(length=255), nullable=True))
    op.add_column(
        "opportunities", sa.Column("primary_campaign_source", sa.String(length=255), nullable=True)
    )
    op.add_column("opportunities", sa.Column("competitor", sa.String(length=255), nullable=True))
    op.create_index("ix_opportunities_opportunity_type", "opportunities", ["opportunity_type"])
    op.create_index(
        "ix_opportunities_primary_campaign_source",
        "opportunities",
        ["primary_campaign_source"],
    )

    op.add_column("activities", sa.Column("subject", sa.String(length=255), nullable=True))
    op.add_column("activities", sa.Column("due_date", sa.Date(), nullable=True))
    op.add_column("activities", sa.Column("status", sa.String(length=32), nullable=True))
    op.add_column("activities", sa.Column("priority", sa.String(length=32), nullable=True))
    op.create_index("ix_activities_subject", "activities", ["subject"])
    op.create_index("ix_activities_due_date", "activities", ["due_date"])
    op.create_index("ix_activities_status", "activities", ["status"])
    op.create_index("ix_activities_priority", "activities", ["priority"])


def downgrade() -> None:
    op.drop_index("ix_activities_priority", table_name="activities")
    op.drop_index("ix_activities_status", table_name="activities")
    op.drop_index("ix_activities_due_date", table_name="activities")
    op.drop_index("ix_activities_subject", table_name="activities")
    op.drop_column("activities", "priority")
    op.drop_column("activities", "status")
    op.drop_column("activities", "due_date")
    op.drop_column("activities", "subject")

    op.drop_index("ix_opportunities_primary_campaign_source", table_name="opportunities")
    op.drop_index("ix_opportunities_opportunity_type", table_name="opportunities")
    op.drop_column("opportunities", "competitor")
    op.drop_column("opportunities", "primary_campaign_source")
    op.drop_column("opportunities", "next_step")
    op.drop_column("opportunities", "opportunity_type")

    op.drop_index("ix_leads_campaign_name", table_name="leads")
    op.drop_index("ix_leads_rating", table_name="leads")
    op.drop_index("ix_leads_lead_source", table_name="leads")
    op.drop_column("leads", "campaign_name")
    op.drop_column("leads", "employee_count")
    op.drop_column("leads", "annual_revenue")
    op.drop_column("leads", "rating")
    op.drop_column("leads", "lead_source")
    op.drop_column("leads", "title")

    op.drop_index("ix_contacts_mobile_phone", table_name="contacts")
    op.drop_column("contacts", "department")
    op.drop_column("contacts", "mobile_phone")

    op.drop_index("ix_accounts_owner_id", table_name="accounts")
    op.drop_index("ix_accounts_phone", table_name="accounts")
    op.drop_index("ix_accounts_account_type", table_name="accounts")
    op.drop_column("accounts", "owner_id")
    op.drop_column("accounts", "phone")
    op.drop_column("accounts", "employee_count")
    op.drop_column("accounts", "annual_revenue")
    op.drop_column("accounts", "account_type")
