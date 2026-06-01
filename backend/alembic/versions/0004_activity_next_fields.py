"""add next activity fields

Revision ID: 0004_activity_next_fields
Revises: 0003_salesforce_like_fields
Create Date: 2026-06-01
"""

from alembic import op
import sqlalchemy as sa


revision = "0004_activity_next_fields"
down_revision = "0003_salesforce_like_fields"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("activities", sa.Column("next_activity_subject", sa.String(length=255), nullable=True))
    op.add_column("activities", sa.Column("next_activity_type", sa.String(length=32), nullable=True))
    op.add_column("activities", sa.Column("next_activity_due_date", sa.Date(), nullable=True))
    op.add_column("activities", sa.Column("next_activity_priority", sa.String(length=32), nullable=True))
    op.create_index("ix_activities_next_activity_type", "activities", ["next_activity_type"])
    op.create_index("ix_activities_next_activity_due_date", "activities", ["next_activity_due_date"])
    op.create_index("ix_activities_next_activity_priority", "activities", ["next_activity_priority"])


def downgrade() -> None:
    op.drop_index("ix_activities_next_activity_priority", table_name="activities")
    op.drop_index("ix_activities_next_activity_due_date", table_name="activities")
    op.drop_index("ix_activities_next_activity_type", table_name="activities")
    op.drop_column("activities", "next_activity_priority")
    op.drop_column("activities", "next_activity_due_date")
    op.drop_column("activities", "next_activity_type")
    op.drop_column("activities", "next_activity_subject")
