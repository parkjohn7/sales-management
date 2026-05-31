from __future__ import annotations

import uuid
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import (
    JSON,
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


def new_id() -> str:
    return str(uuid.uuid4())


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )


class Role(Base):
    __tablename__ = "roles"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    name: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    users: Mapped[list[User]] = relationship(back_populates="role")


class User(TimestampMixin, Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    role_id: Mapped[str | None] = mapped_column(ForeignKey("roles.id"))
    team_id: Mapped[str | None] = mapped_column(String(36), index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    role: Mapped[Role | None] = relationship(back_populates="users")


class Account(TimestampMixin, Base):
    __tablename__ = "accounts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    name: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    business_number: Mapped[str | None] = mapped_column(String(64), index=True)
    account_type: Mapped[str | None] = mapped_column(String(64), index=True)
    industry: Mapped[str | None] = mapped_column(String(120), index=True)
    annual_revenue: Mapped[Decimal | None] = mapped_column(Numeric(14, 2))
    employee_count: Mapped[int | None] = mapped_column(Integer)
    phone: Mapped[str | None] = mapped_column(String(64), index=True)
    website: Mapped[str | None] = mapped_column(String(255))
    address: Mapped[str | None] = mapped_column(Text)
    owner_id: Mapped[str | None] = mapped_column(String(36), index=True)

    contacts: Mapped[list[Contact]] = relationship(back_populates="account")
    opportunities: Mapped[list[Opportunity]] = relationship(back_populates="account")


class Contact(TimestampMixin, Base):
    __tablename__ = "contacts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    account_id: Mapped[str] = mapped_column(ForeignKey("accounts.id"), index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str | None] = mapped_column(String(255), index=True)
    phone: Mapped[str | None] = mapped_column(String(64), index=True)
    mobile_phone: Mapped[str | None] = mapped_column(String(64), index=True)
    title: Mapped[str | None] = mapped_column(String(120))
    department: Mapped[str | None] = mapped_column(String(120))
    role_type: Mapped[str | None] = mapped_column(String(64))

    account: Mapped[Account] = relationship(back_populates="contacts")
    opportunities: Mapped[list[Opportunity]] = relationship(back_populates="contact")


class Lead(TimestampMixin, Base):
    __tablename__ = "leads"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    company_name: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    contact_name: Mapped[str] = mapped_column(String(120), nullable=False)
    title: Mapped[str | None] = mapped_column(String(120))
    email: Mapped[str | None] = mapped_column(String(255), index=True)
    phone: Mapped[str | None] = mapped_column(String(64), index=True)
    source_channel: Mapped[str] = mapped_column(String(64), index=True, default="manual")
    lead_source: Mapped[str | None] = mapped_column(String(64), index=True)
    rating: Mapped[str | None] = mapped_column(String(32), index=True)
    annual_revenue: Mapped[Decimal | None] = mapped_column(Numeric(14, 2))
    employee_count: Mapped[int | None] = mapped_column(Integer)
    campaign_name: Mapped[str | None] = mapped_column(String(255), index=True)
    inquiry_content: Mapped[str | None] = mapped_column(Text)
    budget_confirmed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    authority_confirmed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    timeline_within_3_months: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    price_page_visit_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    downloaded_material: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    lead_score: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    lead_grade: Mapped[str] = mapped_column(String(16), default="COLD", index=True, nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="NEW", index=True, nullable=False)
    owner_id: Mapped[str | None] = mapped_column(String(36), index=True)
    raw_payload: Mapped[dict | None] = mapped_column(JSON)
    chatbot_log: Mapped[dict | None] = mapped_column(JSON)

    opportunities: Mapped[list[Opportunity]] = relationship(back_populates="lead")
    activities: Mapped[list[Activity]] = relationship(back_populates="lead")


class Opportunity(TimestampMixin, Base):
    __tablename__ = "opportunities"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    account_id: Mapped[str] = mapped_column(ForeignKey("accounts.id"), index=True, nullable=False)
    contact_id: Mapped[str | None] = mapped_column(ForeignKey("contacts.id"), index=True)
    lead_id: Mapped[str | None] = mapped_column(ForeignKey("leads.id"), index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    opportunity_type: Mapped[str | None] = mapped_column(String(64), index=True)
    stage: Mapped[str] = mapped_column(String(32), default="LEAD", index=True, nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=Decimal("0"), nullable=False)
    probability: Mapped[int] = mapped_column(Integer, default=10, nullable=False)
    forecast_amount: Mapped[Decimal] = mapped_column(
        Numeric(14, 2), default=Decimal("0"), nullable=False
    )
    expected_close_date: Mapped[date | None] = mapped_column(Date, index=True)
    next_step: Mapped[str | None] = mapped_column(String(255))
    primary_campaign_source: Mapped[str | None] = mapped_column(String(255), index=True)
    competitor: Mapped[str | None] = mapped_column(String(255))
    closed_date: Mapped[date | None] = mapped_column(Date)
    lost_reason: Mapped[str | None] = mapped_column(String(255))
    owner_id: Mapped[str | None] = mapped_column(String(36), index=True)

    account: Mapped[Account] = relationship(back_populates="opportunities")
    contact: Mapped[Contact | None] = relationship(back_populates="opportunities")
    lead: Mapped[Lead | None] = relationship(back_populates="opportunities")
    activities: Mapped[list[Activity]] = relationship(back_populates="opportunity")
    stage_histories: Mapped[list[StageHistory]] = relationship(back_populates="opportunity")


class Activity(Base):
    __tablename__ = "activities"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    lead_id: Mapped[str | None] = mapped_column(ForeignKey("leads.id"), index=True)
    opportunity_id: Mapped[str | None] = mapped_column(ForeignKey("opportunities.id"), index=True)
    subject: Mapped[str | None] = mapped_column(String(255), index=True)
    activity_type: Mapped[str] = mapped_column(String(32), index=True, nullable=False)
    activity_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    due_date: Mapped[date | None] = mapped_column(Date, index=True)
    status: Mapped[str | None] = mapped_column(String(32), index=True)
    priority: Mapped[str | None] = mapped_column(String(32), index=True)
    description: Mapped[str | None] = mapped_column(Text)
    owner_id: Mapped[str | None] = mapped_column(String(36), index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    lead: Mapped[Lead | None] = relationship(back_populates="activities")
    opportunity: Mapped[Opportunity | None] = relationship(back_populates="activities")


class StageHistory(Base):
    __tablename__ = "stage_histories"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    opportunity_id: Mapped[str] = mapped_column(
        ForeignKey("opportunities.id"), index=True, nullable=False
    )
    previous_stage: Mapped[str | None] = mapped_column(String(32))
    new_stage: Mapped[str] = mapped_column(String(32), nullable=False)
    previous_probability: Mapped[int | None] = mapped_column(Integer)
    new_probability: Mapped[int] = mapped_column(Integer, nullable=False)
    changed_by: Mapped[str | None] = mapped_column(String(36), index=True)
    changed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    reason: Mapped[str | None] = mapped_column(Text)

    opportunity: Mapped[Opportunity] = relationship(back_populates="stage_histories")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    actor_id: Mapped[str | None] = mapped_column(String(36), index=True)
    action: Mapped[str] = mapped_column(String(32), index=True, nullable=False)
    resource_type: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    resource_id: Mapped[str | None] = mapped_column(String(36), index=True)
    ip_address: Mapped[str | None] = mapped_column(String(64))
    user_agent: Mapped[str | None] = mapped_column(Text)
    before_value: Mapped[dict | None] = mapped_column(JSON)
    after_value: Mapped[dict | None] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )


class AdminSetting(TimestampMixin, Base):
    __tablename__ = "admin_settings"

    key: Mapped[str] = mapped_column(String(120), primary_key=True)
    value: Mapped[dict] = mapped_column(JSON, nullable=False)
    updated_by: Mapped[str | None] = mapped_column(String(36), index=True)
