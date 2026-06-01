"""replace activity subject fields with next_activity

Revision ID: 0005_activity_next_activity_and_remove_subject
Revises: 0004_activity_next_fields
Create Date: 2026-06-01
"""

from alembic import op
import sqlalchemy as sa


revision = "0005_activity_next_activity_and_remove_subject"
down_revision = "0004_activity_next_fields"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("activities", sa.Column("next_activity", sa.String(length=255), nullable=True))
    op.execute(
        "UPDATE activities "
        "SET next_activity = COALESCE(next_activity_subject, subject, next_activity)"
    )
    op.drop_index("ix_activities_subject", table_name="activities")
    op.drop_column("activities", "subject")
    op.drop_column("activities", "next_activity_subject")


def downgrade() -> None:
    op.add_column("activities", sa.Column("subject", sa.String(length=255), nullable=True))
    op.add_column("activities", sa.Column("next_activity_subject", sa.String(length=255), nullable=True))
    op.execute(
        "UPDATE activities "
        "SET next_activity_subject = COALESCE(next_activity, next_activity_subject)"
    )
    op.create_index("ix_activities_subject", "activities", ["subject"])
    op.drop_column("activities", "next_activity")
