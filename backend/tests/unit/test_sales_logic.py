from datetime import date
from decimal import Decimal

import pytest
from app.models import Opportunity
from app.services.forecast_service import calculate_forecast_amount, get_stage_probability
from app.services.lead_scoring_service import (
    LeadScoringInput,
    calculate_lead_grade,
    calculate_lead_score,
)
from app.services.opportunity_service import apply_stage_change


def test_lead_score_and_grade_hot() -> None:
    lead = LeadScoringInput(
        budget_confirmed=True,
        authority_confirmed=True,
        timeline_within_3_months=True,
        price_page_visit_count=3,
        downloaded_material=True,
    )

    score = calculate_lead_score(lead)

    assert score == 100
    assert calculate_lead_grade(score) == "HOT"


def test_lead_grade_boundaries() -> None:
    assert calculate_lead_grade(80) == "HOT"
    assert calculate_lead_grade(50) == "WARM"
    assert calculate_lead_grade(49) == "COLD"


def test_forecast_amount_uses_stage_probability() -> None:
    assert get_stage_probability("proposal") == 50
    assert calculate_forecast_amount(Decimal("50000000"), 50) == Decimal("25000000.00")


def test_closed_lost_requires_lost_reason() -> None:
    opportunity = Opportunity(
        id="opportunity-1",
        account_id="account-1",
        name="테스트 영업기회",
        stage="NEGOTIATION",
        amount=Decimal("10000000"),
        probability=75,
        forecast_amount=Decimal("7500000"),
    )

    with pytest.raises(ValueError):
        apply_stage_change(opportunity, new_stage="CLOSED_LOST", changed_by="user-1")


def test_stage_change_updates_probability_forecast_and_closed_date() -> None:
    opportunity = Opportunity(
        id="opportunity-1",
        account_id="account-1",
        name="테스트 영업기회",
        stage="PROPOSAL",
        amount=Decimal("20000000"),
        probability=50,
        forecast_amount=Decimal("10000000"),
    )

    history = apply_stage_change(
        opportunity,
        new_stage="CLOSED_WON",
        changed_by="user-1",
        closed_date=date(2026, 5, 31),
    )

    assert opportunity.stage == "CLOSED_WON"
    assert opportunity.probability == 100
    assert opportunity.forecast_amount == Decimal("20000000.00")
    assert opportunity.closed_date == date(2026, 5, 31)
    assert history.previous_stage == "PROPOSAL"
    assert history.new_stage == "CLOSED_WON"
