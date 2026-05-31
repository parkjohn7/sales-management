from decimal import ROUND_HALF_UP, Decimal

STAGE_PROBABILITY: dict[str, int] = {
    "LEAD": 10,
    "QUALIFIED": 25,
    "PROPOSAL": 50,
    "NEGOTIATION": 75,
    "CLOSED_WON": 100,
    "CLOSED_LOST": 0,
}


def normalize_stage(stage: str) -> str:
    return stage.strip().upper().replace(" ", "_").replace("-", "_")


def get_stage_probability(stage: str) -> int:
    normalized = normalize_stage(stage)
    if normalized not in STAGE_PROBABILITY:
        allowed = ", ".join(STAGE_PROBABILITY)
        raise ValueError(f"Unknown pipeline stage '{stage}'. Allowed stages: {allowed}")
    return STAGE_PROBABILITY[normalized]


def calculate_forecast_amount(amount: Decimal | int | float | str, probability: int) -> Decimal:
    value = Decimal(str(amount))
    forecast = value * Decimal(probability) / Decimal("100")
    return forecast.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
