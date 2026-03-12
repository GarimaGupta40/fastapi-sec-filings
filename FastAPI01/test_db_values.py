from database import SessionLocal
import models
db = SessionLocal()
company = db.query(models.Company).filter(models.Company.ticker == 'AAPL').first()
statements = db.query(models.FinancialStatement).filter(models.FinancialStatement.company_id == company.id).all()
for s in statements:
    print(f"{s.filing_date} Rev: {s.revenue} NI: {s.net_income} FCF: {s.free_cash_flow}")
