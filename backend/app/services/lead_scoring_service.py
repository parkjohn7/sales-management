from dataclasses import dataclass

HOT_LEAD_MIN_SCORE = 80
WARM_LEAD_MIN_SCORE = 50
MAX_LEAD_SCORE = 100


@dataclass(frozen=True)
class LeadScoringInput:
    budget_confirmed: bool = False
    authority_confirmed: bool = False
    timeline_within_3_months: bool = False
    price_page_visit_count: int = 0
    downloaded_material: bool = False


def calculate_lead_score(lead: LeadScoringInput) -> int:
    score = 0
    if lead.budget_confirmed:
        score += 25
    if lead.authority_confirmed:
        score += 25
    if lead.timeline_within_3_months:
        score += 20
    if lead.price_page_visit_count >= 3:
        score += 15
    if lead.downloaded_material:
        score += 15
    return min(score, MAX_LEAD_SCORE)


def calculate_lead_grade(score: int) -> str:
    if score >= HOT_LEAD_MIN_SCORE:
        return "HOT"
    if score >= WARM_LEAD_MIN_SCORE:
        return "WARM"
    return "COLD"


def score_and_grade(lead: LeadScoringInput) -> tuple[int, str]:
    score = calculate_lead_score(lead)
    return score, calculate_lead_grade(score)
