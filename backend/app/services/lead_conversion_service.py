from decimal import Decimal

from sqlalchemy.orm import Session

from app.models import Account, Contact, Lead, Opportunity
from app.services.forecast_service import calculate_forecast_amount, get_stage_probability


def convert_lead(
    db: Session,
    lead: Lead,
    *,
    opportunity_name: str | None = None,
    amount: Decimal | int | str = Decimal("0"),
    owner_id: str | None = None,
) -> tuple[Account, Contact, Opportunity]:
    account = Account(name=lead.company_name)
    db.add(account)
    db.flush()

    contact = Contact(
        account_id=account.id,
        name=lead.contact_name,
        email=lead.email,
        phone=lead.phone,
        role_type="UNKNOWN",
    )
    db.add(contact)
    db.flush()

    probability = get_stage_probability("QUALIFIED")
    opportunity = Opportunity(
        account_id=account.id,
        contact_id=contact.id,
        lead_id=lead.id,
        name=opportunity_name or f"{lead.company_name} 영업 기회",
        stage="QUALIFIED",
        amount=Decimal(str(amount)),
        probability=probability,
        forecast_amount=calculate_forecast_amount(amount, probability),
        owner_id=owner_id or lead.owner_id,
    )
    db.add(opportunity)

    lead.status = "CONVERTED"
    db.flush()
    return account, contact, opportunity
