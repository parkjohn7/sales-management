"""drop opportunity next_step

Revision ID: 0008_drop_opportunity_next_step
Revises: 0007_opportunity_lost_reason_text
Create Date: 2026-06-01
"""

from alembic import op
import sqlalchemy as sa


revision = "0008_drop_opportunity_next_step"
down_revision = "0007_opportunity_lost_reason_text"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.drop_column("opportunities", "next_step")


def downgrade() -> None:
    op.add_column("opportunities", sa.Column("next_step", sa.String(length=255), nullable=True))
