"""expand numeric precision for revenue and opportunity amounts

Revision ID: 0009_expand_numeric_precision
Revises: 0008_drop_opportunity_next_step
Create Date: 2026-06-01
"""

from alembic import op
import sqlalchemy as sa


revision = "0009_expand_numeric_precision"
down_revision = "0008_drop_opportunity_next_step"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column(
        "accounts",
        "annual_revenue",
        existing_type=sa.Numeric(precision=14, scale=2),
        type_=sa.Numeric(precision=18, scale=2),
        existing_nullable=True,
    )
    op.alter_column(
        "leads",
        "annual_revenue",
        existing_type=sa.Numeric(precision=14, scale=2),
        type_=sa.Numeric(precision=18, scale=2),
        existing_nullable=True,
    )
    op.alter_column(
        "opportunities",
        "amount",
        existing_type=sa.Numeric(precision=14, scale=2),
        type_=sa.Numeric(precision=18, scale=2),
        existing_nullable=False,
    )
    op.alter_column(
        "opportunities",
        "forecast_amount",
        existing_type=sa.Numeric(precision=14, scale=2),
        type_=sa.Numeric(precision=18, scale=2),
        existing_nullable=False,
    )


def downgrade() -> None:
    op.alter_column(
        "opportunities",
        "forecast_amount",
        existing_type=sa.Numeric(precision=18, scale=2),
        type_=sa.Numeric(precision=14, scale=2),
        existing_nullable=False,
    )
    op.alter_column(
        "opportunities",
        "amount",
        existing_type=sa.Numeric(precision=18, scale=2),
        type_=sa.Numeric(precision=14, scale=2),
        existing_nullable=False,
    )
    op.alter_column(
        "leads",
        "annual_revenue",
        existing_type=sa.Numeric(precision=18, scale=2),
        type_=sa.Numeric(precision=14, scale=2),
        existing_nullable=True,
    )
    op.alter_column(
        "accounts",
        "annual_revenue",
        existing_type=sa.Numeric(precision=18, scale=2),
        type_=sa.Numeric(precision=14, scale=2),
        existing_nullable=True,
    )
