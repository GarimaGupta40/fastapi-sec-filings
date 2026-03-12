from sqlalchemy.orm import Session
from sqlalchemy import asc
import models
from typing import Optional

def calculate_cagr(beginning_value: float, ending_value: float, years: int) -> Optional[float]:
    if beginning_value is None or ending_value is None:
        return None
    if beginning_value <= 0 or years <= 0:
        return None
    try:
        return (ending_value / beginning_value) ** (1 / years) - 1
    except Exception:
        return None

def determine_trend(cagr: Optional[float]) -> str:
    if cagr is None:
        return "insufficient data"
    if cagr > 0.05:
        return "growing"
    elif cagr < -0.05:
        return "declining"
    else:
        return "stable"

def get_trend_analysis(db: Session, ticker: str):
    ticker_upper = ticker.upper()
    
    # 1. Fetch company ID
    company = db.query(models.Company).filter(models.Company.ticker == ticker_upper).first()
    if not company:
        return {"error": f"Company {ticker_upper} not found in database."}

    # 2. Fetch historical financial data from financial_statements
    statements = db.query(models.FinancialStatement)\
                   .filter(models.FinancialStatement.company_id == company.id)\
                   .filter(models.FinancialStatement.filing_date.isnot(None))\
                   .order_by(asc(models.FinancialStatement.filing_date))\
                   .all()

    if len(statements) < 3:
        return {"error": "insufficient data"}

    def get_metric_cagr(metric_name: str):
        # Extract values that are not None
        values = [getattr(stmt, metric_name, None) for stmt in statements]
        values = [v for v in values if v is not None]
        
        n_periods = len(values) - 1
        if n_periods < 2:  # Need at least 3 points (0, 1, 2) to span 2 years, but user asks for 3 data points.
            return None
            
        beg_val = values[0]
        end_val = values[-1]
        cagr = calculate_cagr(beg_val, end_val, n_periods)
        return round(cagr, 4) if cagr is not None else None

    revenue_cagr = get_metric_cagr("revenue")
    net_income_cagr = get_metric_cagr("net_income")
    fcf_cagr = get_metric_cagr("free_cash_flow")

    historical_data = []
    for stmt in statements:
        historical_data.append({
            "name": stmt.filing_date[:4] if stmt.filing_date else "N/A",
            "Revenue": round(stmt.revenue / 1e9, 2) if stmt.revenue else 0,
            "NetIncome": round(stmt.net_income / 1e9, 2) if stmt.net_income else 0,
            "FCF": round(stmt.free_cash_flow / 1e9, 2) if stmt.free_cash_flow else 0
        })

    return {
        "ticker": ticker_upper,
        "revenue_trend": determine_trend(revenue_cagr),
        "revenue_cagr": revenue_cagr,
        "net_income_trend": determine_trend(net_income_cagr),
        "net_income_cagr": net_income_cagr,
        "free_cash_flow_trend": determine_trend(fcf_cagr),
        "historical_data": historical_data
    }
