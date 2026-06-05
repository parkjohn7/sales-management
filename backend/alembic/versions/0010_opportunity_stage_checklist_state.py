"""add opportunity stage checklist state

Revision ID: 0010_opportunity_stage_checklist_state
Revises: 0009_expand_numeric_precision
Create Date: 2026-06-05
"""

from alembic import op
import sqlalchemy as sa


revision = "0010_opportunity_stage_checklist_state"
down_revision = "0009_expand_numeric_precision"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("opportunities", sa.Column("stage_checklist_state", sa.JSON(), nullable=True))


def downgrade() -> None:
    op.drop_column("opportunities", "stage_checklist_state")
