from fastapi import FastAPI, HTTPException, Query, Path
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

from sec_client import sec_client
import xbrl_parser
import financial_metrics
import valuation_engine
import peer_analysis
import acquisition_scoring
import trend_analysis

from database import SessionLocal, engine
import models
from filing_processor import FilingProcessor
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("sec_edgar_backend")

ACQUISITION_SECTORS = {
    "technology": ["AAPL","MSFT","GOOGL","META","AMZN","NVDA","AMD","INTC","AVGO","SNAP"],
    "banks": ["JPM","BAC","GS","MS","C"],
    "retail": ["WMT","COST","TGT","HD","LOW"]
}

# Ensure tables are created
try:
    models.Base.metadata.create_all(bind=engine)
    print("Database connected successfully")
except Exception as e:
    print("Database connection failed:", e)

app = FastAPI(
    title="Financial Data Extraction & Acquisition Analytics API",
    description="Production-level SEC XBRL data pipeline and analytics engine.",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_event():
    await sec_client.close()

async def build_full_report(ticker: str, form_type: str = "10-K"):
    ticker_upper = ticker.upper()
    cik = await xbrl_parser.get_cik_from_ticker(ticker_upper)
    subs = await xbrl_parser.get_company_submissions(cik)
    
    facts = await xbrl_parser.get_company_facts(cik)
    facts_gaap = facts.get("facts", {}).get("us-gaap", {})
    
    statements = xbrl_parser.extract_financial_data(facts_gaap)
    historical = xbrl_parser.get_historical_data(facts_gaap)
    
    metrics = financial_metrics.calculate_metrics(statements)
    growth = financial_metrics.calculate_growth(statements, historical)
    
    valuation = await valuation_engine.calculate_valuation(ticker_upper, statements)
    metrics["valuation"] = valuation
    metrics["revenue"] = statements["income_statement"]["revenue"]
    
    # Extract market cap from valuation engine if possible
    quote = await valuation_engine.get_yahoo_quote(ticker_upper)
    metrics["market_cap"] = quote.get("market_cap")
    
    db_session = SessionLocal()
    try:
        peers = peer_analysis.analyze_peers(db_session, ticker_upper)
    finally:
        db_session.close()
    acq = acquisition_scoring.score_acquisition(metrics, growth, statements)
    
    recent_forms = subs.get("filings", {}).get("recent", {})
    forms = recent_forms.get("form", [])
    dates = recent_forms.get("filingDate", [])
    
    match_idx = -1
    for i, form in enumerate(forms):
        if form.upper() == form_type.upper():
            match_idx = i
            break
            
    if match_idx == -1:
        raise HTTPException(status_code=404, detail=f"No {form_type} filings found for {ticker.upper()}.")
        
    filing_date = dates[match_idx] if match_idx < len(dates) else ""

    return {
        "company_info": {
            "ticker": ticker_upper,
            "company_name": subs.get("name"),
            "cik": cik,
            "form_type": form_type.upper(),
            "filing_date": filing_date
        },
        "financial_statements": statements,
        "financial_metrics": metrics,
        "growth_metrics": growth,
        "acquisition_indicators": acq,
        "metadata": {
            "data_source": "SEC EDGAR XBRL",
            "currency": "USD",
            "units": "full",
            "extraction_timestamp": datetime.utcnow().isoformat() + "Z"
        }
    }

@app.get("/company/{ticker}")
async def get_company(ticker: str):
    cik = await xbrl_parser.get_cik_from_ticker(ticker)
    subs = await xbrl_parser.get_company_submissions(cik)
    return {
        "ticker": ticker.upper(),
        "cik": cik,
        "company_name": subs.get("name"),
        "sic": subs.get("sic")
    }

@app.get("/financials/{ticker}")
async def get_financials(ticker: str):
    cik = await xbrl_parser.get_cik_from_ticker(ticker)
    facts = await xbrl_parser.get_company_facts(cik)
    facts_gaap = facts.get("facts", {}).get("us-gaap", {})
    statements = xbrl_parser.extract_financial_data(facts_gaap)
    return {"financial_statements": statements}

@app.get("/metrics/{ticker}")
async def get_metrics(ticker: str):
    res = await build_full_report(ticker)
    return {
        "financial_metrics": res["financial_metrics"],
        "growth_metrics": res["growth_metrics"]
    }

@app.get("/peer-analysis/{ticker}")
def get_peer_analysis(ticker: str):
    db_session = SessionLocal()
    try:
        result = peer_analysis.analyze_peers(db_session, ticker)
        if "error" in result:
             raise HTTPException(status_code=404, detail=result["error"])
        return result
    finally:
        db_session.close()

@app.get("/acquisition-score/{ticker}")
async def get_acquisition_score(ticker: str):
    res = await build_full_report(ticker)
    return {"acquisition_score": res["acquisition_indicators"]}

@app.get("/acquisition-targets/{sector}")
def get_acquisition_targets(sector: str):
    sector_lower = sector.lower()
    if sector_lower not in ACQUISITION_SECTORS:
        raise HTTPException(
            status_code=404, 
            detail=f"Sector '{sector_lower}' not found. Available sectors: {list(ACQUISITION_SECTORS.keys())}"
        )
        
    tickers = ACQUISITION_SECTORS[sector_lower]
    db_session = SessionLocal()
    
    try:
        companies = db_session.query(models.Company).filter(models.Company.ticker.in_(tickers)).all()
        company_ids = [c.id for c in companies]
        ticker_map = {c.id: c.ticker for c in companies}
        
        if not company_ids:
            return {"sector": sector_lower, "top_targets": []}
            
        # Get latest acquisition indicators for each company
        indicators = db_session.query(models.AcquisitionIndicator)\
            .filter(models.AcquisitionIndicator.company_id.in_(company_ids))\
            .order_by(models.AcquisitionIndicator.filing_date.desc())\
            .all()
            
        latest_indicators = {}
        for ind in indicators:
            if ind.company_id not in latest_indicators:
                latest_indicators[ind.company_id] = ind
                
        results = []
        for cid, ind in latest_indicators.items():
            fd = ind.financial_distress if ind.financial_distress is not None else 0
            va = ind.valuation_attractiveness if ind.valuation_attractiveness is not None else 0
            mp = ind.market_position if ind.market_position is not None else 0
            oe = ind.operational_efficiency if ind.operational_efficiency is not None else 0
            
            # Final logic weight:
            # acquisition_score = financial_distress * 0.30 + valuation_attractiveness * 0.25 + market_position * 0.20 + operational_efficiency * 0.25
            score = (fd * 0.30) + (va * 0.25) + (mp * 0.20) + (oe * 0.25)
            score_normalized = max(0, min(100, int(round(score))))
            
            results.append({
                "ticker": ticker_map[cid],
                "score": score_normalized
            })
            
        # Sort globally and trim to top 10
        results.sort(key=lambda x: x["score"], reverse=True)
        top_targets = results[:10]
        
        return {
            "sector": sector_lower,
            "top_targets": top_targets
        }
        
    finally:
        db_session.close()
    
def insert_report_to_db(report: dict):
    db = SessionLocal()
    try:
        c_info = report["company_info"]
        
        # Insert or update company
        existing_company = db.query(models.Company).filter(models.Company.ticker == c_info["ticker"]).first()
        if existing_company:
            existing_company.company_name = c_info["company_name"]
            existing_company.cik = c_info["cik"]
            existing_company.form_type = c_info["form_type"]
            existing_company.filing_date = c_info["filing_date"]
            db.commit()
            db.refresh(existing_company)
            company_id = existing_company.id
        else:
            company = models.Company(
                ticker=c_info["ticker"],
                company_name=c_info["company_name"],
                cik=c_info["cik"],
                form_type=c_info["form_type"],
                filing_date=c_info["filing_date"]
            )
            db.add(company)
            db.commit()
            db.refresh(company)
            company_id = company.id

        filing_date = c_info["filing_date"]

        fs_exists = db.query(models.FinancialStatement).filter(
            models.FinancialStatement.company_id == company_id,
            models.FinancialStatement.filing_date == filing_date
        ).first()

        if fs_exists:
            db.query(models.FinancialStatement).filter(models.FinancialStatement.company_id == company_id, models.FinancialStatement.filing_date == filing_date).delete()
            db.query(models.FinancialMetric).filter(models.FinancialMetric.company_id == company_id, models.FinancialMetric.filing_date == filing_date).delete()
            db.query(models.GrowthMetric).filter(models.GrowthMetric.company_id == company_id, models.GrowthMetric.filing_date == filing_date).delete()
            db.query(models.AcquisitionIndicator).filter(models.AcquisitionIndicator.company_id == company_id, models.AcquisitionIndicator.filing_date == filing_date).delete()
            db.query(models.Metadata).filter(models.Metadata.company_id == company_id, models.Metadata.filing_date == filing_date).delete()
            db.commit()

        fs = report["financial_statements"]
        fstmt = models.FinancialStatement(
            company_id=company_id,
            filing_date=filing_date,
            revenue=fs["income_statement"]["revenue"],
            cost_of_revenue=fs["income_statement"]["cost_of_revenue"],
            gross_profit=fs["income_statement"]["gross_profit"],
            operating_income=fs["income_statement"]["operating_income"],
            net_income=fs["income_statement"]["net_income"],
            interest_expense=fs["income_statement"]["interest_expense"],
            income_tax=fs["income_statement"]["income_tax"],
            ebit=fs["income_statement"]["ebit"],
            ebitda=fs["income_statement"]["ebitda"],
            operating_cash_flow=fs["cash_flow"]["operating_cash_flow"],
            capital_expenditure=fs["cash_flow"]["capital_expenditure"],
            depreciation=fs["cash_flow"]["depreciation"],
            free_cash_flow=fs["cash_flow"]["free_cash_flow"],
        )
        db.add(fstmt)

        fm = report["financial_metrics"]
        fmetric = models.FinancialMetric(
            company_id=company_id,
            filing_date=filing_date,
            gross_margin=fm["profitability"]["gross_margin"],
            operating_margin=fm["profitability"]["operating_margin"],
            net_profit_margin=fm["profitability"]["net_profit_margin"],
            roa=fm["profitability"]["roa"],
            roe=fm["profitability"]["roe"],
            roic=fm["profitability"]["roic"],
            ebitda_margin=fm["profitability"]["ebitda_margin"],
            current_ratio=fm["liquidity"]["current_ratio"],
            quick_ratio=fm["liquidity"]["quick_ratio"],
            cash_ratio=fm["liquidity"]["cash_ratio"],
            debt_to_equity=fm["solvency"]["debt_to_equity"],
            debt_to_assets=fm["solvency"]["debt_to_assets"],
            interest_coverage_ratio=fm["solvency"]["interest_coverage_ratio"],
            price_to_earnings=fm["valuation"]["price_to_earnings"] if fm.get("valuation") else None,
            price_to_book=fm["valuation"]["price_to_book"] if fm.get("valuation") else None,
            price_to_sales=fm["valuation"]["price_to_sales"] if fm.get("valuation") else None,
            enterprise_value=fm["valuation"]["enterprise_value"] if fm.get("valuation") else None,
            ev_to_ebitda=fm["valuation"]["ev_to_ebitda"] if fm.get("valuation") else None,
        )
        db.add(fmetric)

        gm = report["growth_metrics"]
        gmetric = models.GrowthMetric(
            company_id=company_id,
            filing_date=filing_date,
            revenue_growth_yoy=gm["revenue_growth_yoy"],
            net_income_growth_yoy=gm["net_income_growth_yoy"],
            free_cash_flow_growth=gm["free_cash_flow_growth"]
        )
        db.add(gmetric)

        ai = report["acquisition_indicators"]
        aindicator = models.AcquisitionIndicator(
            company_id=company_id,
            filing_date=filing_date,
            financial_distress=ai["financial_distress"],
            valuation_attractiveness=ai["valuation_attractiveness"],
            market_position=ai["market_position"],
            operational_efficiency=ai["operational_efficiency"]
        )
        db.add(aindicator)

        md = report["metadata"]
        mdata = models.Metadata(
            company_id=company_id,
            filing_date=filing_date,
            data_source=md["data_source"],
            currency=md["currency"],
            units=md["units"],
            extraction_timestamp=datetime.fromisoformat(md["extraction_timestamp"].replace("Z", "+00:00")) if "extraction_timestamp" in md else None
        )
        db.add(mdata)

        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error inserting into DB: {e}")
    finally:
        db.close()

@app.get("/trend-analysis/{ticker}")
def get_trend_analysis(ticker: str):
    db = SessionLocal()
    try:
        result = trend_analysis.get_trend_analysis(db, ticker)
        if "error" in result:
            raise HTTPException(status_code=404, detail=result["error"])
        return result
    finally:
        db.close()

@app.get("/report/{ticker}")
async def get_report(
    ticker: str = Path(..., description="Company ticker, e.g. AAPL"),
    form_type: str = Query("10-K", description="Filing type (10-K, 10-Q, 8-K)")
):
    report = await build_full_report(ticker, form_type)
    # Insert report into the database
    insert_report_to_db(report)
    return report

@app.get("/filing/latest")
async def get_latest_compat(
    ticker: str = Query(..., description="Company ticker, e.g. AAPL"),
    form_type: str = Query("10-K", description="Filing type (10-K, 10-Q, 8-K)")
):
    report = await build_full_report(ticker, form_type)
    # Insert report into the database
    insert_report_to_db(report)
    return report

@app.get("/")
def root():
    return {"message": "Advanced XBRL Financial API Running."}

async def process_historical_filings(ticker: str):
    ticker_upper = ticker.upper()
    cik = await xbrl_parser.get_cik_from_ticker(ticker_upper)
    subs = await xbrl_parser.get_company_submissions(cik)
    company_name = subs.get("name")
    
    filings = await sec_client.get_historical_filings(cik, form_type="10-K", limit=10)
    
    if not filings:
        return 0

    facts = await xbrl_parser.get_company_facts(cik)
    facts_gaap = facts.get("facts", {}).get("us-gaap", {})
    
    processed_count = 0
    db = SessionLocal()
    try:
        # Get or create company
        company = db.query(models.Company).filter(models.Company.ticker == ticker_upper).first()
        if not company:
            company = models.Company(
                ticker=ticker_upper,
                company_name=company_name,
                cik=cik,
                form_type="10-K",
                filing_date=filings[0]["filing_date"]
            )
            db.add(company)
            db.commit()
            db.refresh(company)

        for i, filing in enumerate(filings):
            filing_date = filing["filing_date"]
            
            # Check duplicate
            fs_exists = db.query(models.FinancialStatement).filter(
                models.FinancialStatement.company_id == company.id,
                models.FinancialStatement.filing_date == filing_date
            ).first()
            if fs_exists:
                continue

            # 1. Build the filing archive URL
            accession = filing.get("accession", "")
            if accession:
                acc_no_dash = accession.replace("-", "")
                archive_url = f"https://www.sec.gov/Archives/edgar/data/{cik.lstrip('0')}/{acc_no_dash}/{accession}-xbrl.zip"
            
            # 2. Download the XBRL file (skipped logically since xbrl_parser uses facts_gaap JSON directly)
            # 3. Parse financial statements using the existing xbrl_parser.py
            statements = xbrl_parser.extract_financial_data(facts_gaap, text="", year_offset=i)
            historical = xbrl_parser.get_historical_data(facts_gaap, year_offset=i)
            
            if not statements:
                continue

            fs = statements.get("income_statement", {})
            bs = statements.get("balance_sheet", {})
            cf = statements.get("cash_flow", {})
            
            # Skip if basic info lacks total revenue or assets entirely, but we try best effort
            if fs.get("revenue") is None and bs.get("total_assets") is None:
                continue
            
            fstmt = models.FinancialStatement(
                company_id=company.id,
                filing_date=filing_date,
                revenue=fs.get("revenue"),
                cost_of_revenue=fs.get("cost_of_revenue"),
                gross_profit=fs.get("gross_profit"),
                operating_income=fs.get("operating_income"),
                net_income=fs.get("net_income"),
                interest_expense=fs.get("interest_expense"),
                income_tax=fs.get("income_tax"),
                ebit=fs.get("ebit"),
                ebitda=fs.get("ebitda"),
                operating_cash_flow=cf.get("operating_cash_flow"),
                capital_expenditure=cf.get("capital_expenditure"),
                depreciation=cf.get("depreciation"),
                free_cash_flow=cf.get("free_cash_flow"),
                total_assets=bs.get("total_assets"),
                total_liabilities=bs.get("total_liabilities")
            )
            db.add(fstmt)
            
            try:
                metrics = financial_metrics.calculate_metrics(statements)
                growth = financial_metrics.calculate_growth(statements, historical)
                
                # Check for existing metric
                fm_exists = db.query(models.FinancialMetric).filter(
                    models.FinancialMetric.company_id == company.id,
                    models.FinancialMetric.filing_date == filing_date
                ).first()
                if not fm_exists:
                    fmet = models.FinancialMetric(
                        company_id=company.id,
                        filing_date=filing_date,
                        gross_margin=metrics["profitability"]["gross_margin"],
                        operating_margin=metrics["profitability"]["operating_margin"],
                        net_profit_margin=metrics["profitability"]["net_profit_margin"],
                        roe=metrics["profitability"]["roe"],
                        roa=metrics["profitability"]["roa"],
                        ebitda_margin=metrics["profitability"]["ebitda_margin"],
                        debt_to_equity=metrics["solvency"]["debt_to_equity"],
                        current_ratio=metrics["liquidity"]["current_ratio"],
                        quick_ratio=metrics["liquidity"]["quick_ratio"]
                    )
                    db.add(fmet)
                
                gm_exists = db.query(models.GrowthMetric).filter(
                    models.GrowthMetric.company_id == company.id,
                    models.GrowthMetric.filing_date == filing_date
                ).first()
                if not gm_exists:
                    gmet = models.GrowthMetric(
                        company_id=company.id,
                        filing_date=filing_date,
                        revenue_growth_yoy=growth["revenue_growth_yoy"],
                        net_income_growth_yoy=growth["net_income_growth_yoy"],
                        free_cash_flow_growth=growth["free_cash_flow_growth"]
                    )
                    db.add(gmet)
                    
                acq = acquisition_scoring.score_acquisition(metrics, growth, statements)
                am_exists = db.query(models.AcquisitionIndicator).filter(
                    models.AcquisitionIndicator.company_id == company.id,
                    models.AcquisitionIndicator.filing_date == filing_date
                ).first()
                if not am_exists:
                    amet = models.AcquisitionIndicator(
                        company_id=company.id,
                        filing_date=filing_date,
                        financial_distress=acq["financial_distress"],
                        valuation_attractiveness=acq["valuation_attractiveness"],
                        market_position=acq["market_position"],
                        operational_efficiency=acq["operational_efficiency"]
                    )
                    db.add(amet)
            except Exception as metric_err:
                print(f"Error calculating metrics for {filing_date}: {metric_err}")

            processed_count += 1
            
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        db.close()
        
    return processed_count


@app.get("/filing/history/{ticker}")
async def get_filing_history(ticker: str):
    processed = await process_historical_filings(ticker)
    return {
        "ticker": ticker.upper(),
        "filings_processed": processed,
        "status": "historical data stored successfully"
    }

@app.get("/api/company/{ticker}/filings")
async def get_available_filings(ticker: str):
    ticker_upper = ticker.upper()
    logger.info(f"Fetching available filings for {ticker_upper}")
    
    db = SessionLocal()
    try:
        # Check if we have filings in DB
        filings = db.query(models.Filing).filter(models.Filing.ticker == ticker_upper).all()
        if filings:
            return sorted(list(set([f.form_type for f in filings])))
        
        # If not, try to fetch meta to show what's available
        cik = await xbrl_parser.get_cik_from_ticker(ticker_upper)
        # Fetch a larger history to ensure we see 10-K/10-Q
        history = await sec_client.get_historical_filings(cik, form_type="", limit=100)
        
        SUPPORTED_TYPES = ["10-K", "10-Q", "8-K", "DEF 14A", "S-1", "S-1/A", "DEF-14A"]
        found_types = set()
        for h in history:
            ft = h["form_type"].upper()
            if ft in SUPPORTED_TYPES:
                found_types.add(ft)
        
        if not found_types:
            logger.warning(f"No supported filings found for {ticker_upper} in recent history")
            return []
            
        return sorted(list(found_types))
    except Exception as e:
        logger.error(f"Error fetching filings list for {ticker_upper}: {e}")
        return ["10-K", "10-Q", "8-K", "DEF 14A", "S-1"] # Fallback for demo
    finally:
        db.close()

@app.get("/api/company/{ticker}/filing/{form_type}")
async def get_filing_content(ticker: str, form_type: str):
    ticker_upper = ticker.upper()
    # Normalize: Standardize on hyphens where common (10-K, 10-Q, 8-K) 
    # but handle space for DEF 14A
    form_type_norm = form_type.upper().replace(" ", "-")
    if form_type_norm == "DEF-14A":
        # SEC often uses "DEF 14A"
        form_search_list = ["DEF 14A", "DEF-14A"]
    else:
        form_search_list = [form_type_norm, form_type_norm.replace("-", " ")]

    logger.info(f"Fetching {form_type_norm} filing content for {ticker_upper}")
    
    db = SessionLocal()
    try:
        # 1. Try DB first
        filing = db.query(models.Filing).filter(
            models.Filing.ticker == ticker_upper,
            models.Filing.form_type.in_(form_search_list)
        ).order_by(models.Filing.filing_date.desc()).first()
        
        if filing and filing.extracted_text:
            logger.info(f"Found {form_type} for {ticker_upper} in database")
            cik = await xbrl_parser.get_cik_from_ticker(ticker_upper)
            
            # Fetch sections
            sections = db.query(models.FilingSection).filter(models.FilingSection.filing_id == filing.id).all()
            
            # If sections don't exist in DB but text does (legacy data), process it on the fly or just return text
            # For now, if no sections, we'll return the full text as one section
            section_data = [{"title": s.title, "content": s.content} for s in sections]
            if not section_data:
                section_data = FilingProcessor.detect_sections(filing.extracted_text, form_type)
            
            return {
                "ticker": ticker_upper,
                "filing_type": form_type,
                "date": filing.filing_date,
                "accession": filing.accession_number,
                "cik": cik,
                "text": filing.extracted_text,
                "sections": section_data
            }
        
        # 2. Extract if not in DB or text empty
        logger.info(f"Filing {form_type} not found in DB for {ticker_upper}, attempting extraction")
        cik = await xbrl_parser.get_cik_from_ticker(ticker_upper)
        history = []
        for f_to_search in form_search_list:
            h = await sec_client.get_historical_filings(cik, form_type=f_to_search, limit=1)
            if h:
                history = h
                break
        
        if not history:
            logger.warning(f"No {form_type_norm} found in SEC history for {ticker_upper}")
            raise HTTPException(status_code=404, detail=f"No {form_type_norm} found for {ticker_upper}")
            
        latest = history[0]
        acc = latest["accession"]
        
        # Real extraction using the accession number
        extracted_text = await sec_client.get_filing_text(cik, acc)
        
        if not extracted_text or extracted_text.startswith("Error"):
            logger.error(f"Extraction failed for {ticker_upper} {form_type_norm}: {extracted_text}")
            raise HTTPException(status_code=500, detail=f"Failed to extract real content: {extracted_text}")

        # Store in DB for future
        new_filing = models.Filing(
            ticker=ticker_upper,
            form_type=form_type,
            filing_date=latest["filing_date"],
            accession_number=acc,
            extracted_text=extracted_text
        )
        db.add(new_filing)
        db.commit()
        db.refresh(new_filing)
        
        # Step 3, 4: Detect sections and store them
        sections_data = FilingProcessor.detect_sections(extracted_text, form_type)
        for sec in sections_data:
            f_sec = models.FilingSection(
                filing_id=new_filing.id,
                title=sec["title"],
                content=sec["content"]
            )
            db.add(f_sec)
        
        db.commit()
        
        return {
            "ticker": ticker_upper,
            "filing_type": form_type,
            "date": latest["filing_date"],
            "accession": acc,
            "text": extracted_text,
            "sections": sections_data
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing {form_type} for {ticker_upper}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

