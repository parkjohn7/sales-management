from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class DevTokenRequest(BaseModel):
    user_id: str = "dev-sales-rep"
    email: str = "sales@example.com"
    name: str = "개발 영업 담당자"
    role: str = "SALES_REP"
    team_id: str | None = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict[str, str | None]


class AccountCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    business_number: str | None = None
    industry: str | None = None
    website: str | None = None
    address: str | None = None
    account_type: str | None = None
    annual_revenue: Decimal | None = Field(default=None, ge=0)
    employee_count: int | None = Field(default=None, ge=0)
    phone: str | None = None
    owner_id: str | None = None


class AccountUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    business_number: str | None = None
    industry: str | None = None
    website: str | None = None
    address: str | None = None
    account_type: str | None = None
    annual_revenue: Decimal | None = Field(default=None, ge=0)
    employee_count: int | None = Field(default=None, ge=0)
    phone: str | None = None
    owner_id: str | None = None


class AccountRead(AccountCreate):
    model_config = ConfigDict(from_attributes=True)

    id: str
    created_at: datetime
    updated_at: datetime


class ContactCreate(BaseModel):
    account_id: str
    name: str = Field(min_length=1, max_length=120)
    email: str | None = None
    phone: str | None = None
    title: str | None = None
    role_type: str | None = None
    mobile_phone: str | None = None
    department: str | None = None


class ContactUpdate(BaseModel):
    account_id: str | None = None
    name: str | None = Field(default=None, min_length=1, max_length=120)
    email: str | None = None
    phone: str | None = None
    title: str | None = None
    role_type: str | None = None
    mobile_phone: str | None = None
    department: str | None = None


class ContactRead(ContactCreate):
    model_config = ConfigDict(from_attributes=True)

    id: str
    created_at: datetime
    updated_at: datetime


class LeadCreate(BaseModel):
    company_name: str = Field(min_length=1, max_length=255)
    contact_name: str = Field(min_length=1, max_length=120)
    email: str | None = None
    phone: str | None = None
    title: str | None = None
    lead_source: str | None = None
    rating: str | None = None
    annual_revenue: Decimal | None = Field(default=None, ge=0)
    employee_count: int | None = Field(default=None, ge=0)
    campaign_name: str | None = None
    source_channel: str = "manual"
    inquiry_content: str | None = None
    budget_confirmed: bool = False
    authority_confirmed: bool = False
    timeline_within_3_months: bool = False
    price_page_visit_count: int = Field(default=0, ge=0)
    downloaded_material: bool = False
    owner_id: str | None = None
    raw_payload: dict | None = None
    chatbot_log: dict | None = None


class LeadUpdate(BaseModel):
    company_name: str | None = Field(default=None, min_length=1, max_length=255)
    contact_name: str | None = Field(default=None, min_length=1, max_length=120)
    email: str | None = None
    phone: str | None = None
    title: str | None = None
    lead_source: str | None = None
    rating: str | None = None
    annual_revenue: Decimal | None = Field(default=None, ge=0)
    employee_count: int | None = Field(default=None, ge=0)
    campaign_name: str | None = None
    source_channel: str | None = None
    inquiry_content: str | None = None
    budget_confirmed: bool | None = None
    authority_confirmed: bool | None = None
    timeline_within_3_months: bool | None = None
    price_page_visit_count: int | None = Field(default=None, ge=0)
    downloaded_material: bool | None = None
    status: str | None = None
    owner_id: str | None = None


class LeadRead(LeadCreate):
    model_config = ConfigDict(from_attributes=True)

    id: str
    lead_score: int
    lead_grade: str
    status: str
    created_at: datetime
    updated_at: datetime


class LeadAssignRequest(BaseModel):
    owner_id: str


class LeadConvertRequest(BaseModel):
    opportunity_name: str | None = None
    amount: Decimal = Field(default=Decimal("0"), ge=0)


class OpportunityCreate(BaseModel):
    account_id: str
    contact_id: str | None = None
    lead_id: str | None = None
    name: str = Field(min_length=1, max_length=255)
    stage: str = "LEAD"
    amount: Decimal = Field(default=Decimal("0"), ge=0)
    expected_close_date: date | None = None
    owner_id: str | None = None
    opportunity_type: str | None = None
    next_step: str | None = None
    primary_campaign_source: str | None = None
    competitor: str | None = None


class OpportunityUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    amount: Decimal | None = Field(default=None, ge=0)
    expected_close_date: date | None = None
    owner_id: str | None = None
    opportunity_type: str | None = None
    next_step: str | None = None
    primary_campaign_source: str | None = None
    competitor: str | None = None


class OpportunityStageChangeRequest(BaseModel):
    stage: str
    reason: str | None = None
    closed_date: date | None = None
    lost_reason: str | None = None


class OpportunityRead(OpportunityCreate):
    model_config = ConfigDict(from_attributes=True)

    id: str
    probability: int
    forecast_amount: Decimal
    closed_date: date | None = None
    lost_reason: str | None = None
    created_at: datetime
    updated_at: datetime


class ActivityCreate(BaseModel):
    lead_id: str | None = None
    opportunity_id: str | None = None
    subject: str | None = None
    activity_type: str
    activity_date: datetime
    due_date: date | None = None
    status: str | None = None
    priority: str | None = None
    description: str | None = None
    owner_id: str | None = None


class ActivityUpdate(BaseModel):
    lead_id: str | None = None
    opportunity_id: str | None = None
    subject: str | None = None
    activity_type: str | None = None
    activity_date: datetime | None = None
    due_date: date | None = None
    status: str | None = None
    priority: str | None = None
    description: str | None = None
    owner_id: str | None = None


class ActivityRead(ActivityCreate):
    model_config = ConfigDict(from_attributes=True)

    id: str
    created_at: datetime


class AdminSettingsUpdate(BaseModel):
    stage_probabilities: dict[str, int] = Field(default_factory=dict)
    lead_scoring_policy: dict[str, int] = Field(default_factory=dict)
    integration_policy: dict[str, bool | str] = Field(default_factory=dict)


class AdminSettingsRead(AdminSettingsUpdate):
    updated_by: str | None = None
    updated_at: datetime | None = None


class RolePolicyRead(BaseModel):
    role: str
    data_scope: str
    permissions: list[str]


class AuditLogRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    actor_id: str | None
    action: str
    resource_type: str
    resource_id: str | None
    created_at: datetime


class LoginCredentialMailRequest(BaseModel):
    to_email: str
    user_name: str
    temporary_password: str


class LoginCredentialMailResponse(BaseModel):
    sent: bool
    message: str
