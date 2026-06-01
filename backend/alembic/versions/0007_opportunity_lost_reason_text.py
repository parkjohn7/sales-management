"""widen opportunity lost_reason to text

Revision ID: 0007_opportunity_lost_reason_text
Revises: 0006_activity_next_memo_remove_next_activity
Create Date: 2026-06-01
"""

from alembic import op
import sqlalchemy as sa


revision = "0007_opportunity_lost_reason_text"
down_revision = "0006_activity_next_memo_remove_next_activity"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table("opportunities") as batch_op:
        batch_op.alter_column(
            "lost_reason",
            existing_type=sa.String(length=255),
            type_=sa.Text(),
            existing_nullable=True,
        )


def downgrade() -> None:
    with op.batch_alter_table("opportunities") as batch_op:
        batch_op.alter_column(
            "lost_reason",
            existing_type=sa.Text(),
            type_=sa.String(length=255),
            existing_nullable=True,
        )
