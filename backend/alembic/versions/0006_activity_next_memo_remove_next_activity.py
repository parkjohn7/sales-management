"""remove next_activity text and add next_activity_memo

Revision ID: 0006_activity_next_memo_remove_next_activity
Revises: 0005_activity_next_activity_and_remove_subject
Create Date: 2026-06-01
"""

from alembic import op
import sqlalchemy as sa


revision = "0006_activity_next_memo_remove_next_activity"
down_revision = "0005_activity_next_activity_and_remove_subject"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("activities", sa.Column("next_activity_memo", sa.Text(), nullable=True))
    op.execute(
        "UPDATE activities SET next_activity_memo = COALESCE(next_activity_memo, next_activity)"
    )
    op.drop_column("activities", "next_activity")


def downgrade() -> None:
    op.add_column("activities", sa.Column("next_activity", sa.String(length=255), nullable=True))
    op.execute(
        "UPDATE activities SET next_activity = COALESCE(next_activity, next_activity_memo)"
    )
    op.drop_column("activities", "next_activity_memo")
