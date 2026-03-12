import httpx
import logging
from fastapi import HTTPException
import asyncio
from typing import Dict, Any, List
from bs4 import BeautifulSoup
from filing_processor import FilingProcessor

logger = logging.getLogger(__name__)

HEADERS = {
    "User-Agent": "FastAPI01 SEC Research (garim@example.com)",
    "Accept-Encoding": "gzip, deflate",
}

class SECClient:
    def __init__(self):
        self.client = httpx.AsyncClient(headers=HEADERS, timeout=30.0)
        self.cache: Dict[str, Any] = {}
        self.rate_limit_lock = asyncio.Lock()
    
    async def get(self, url: str) -> dict:
        if url in self.cache:
            return self.cache[url]
        
        async with self.rate_limit_lock:
            await asyncio.sleep(0.12)
            try:
                r = await self.client.get(url, follow_redirects=True)
                if r.status_code == 404:
                    raise HTTPException(status_code=404, detail="Not found in SEC database.")
                if r.status_code == 403:
                    raise HTTPException(status_code=403, detail="Forbidden - Rate limit or User-Agent rejection.")
                r.raise_for_status()
                data = r.json()
                self.cache[url] = data
                return data
            except httpx.HTTPError as e:
                logger.error(f"HTTPError fetching {url}: {e}")
                raise HTTPException(status_code=502, detail="Error communicating with SEC API")
            except Exception as e:
                logger.error(f"Error fetching {url}: {str(e)}")
                raise HTTPException(status_code=500, detail="Internal Server Error")

    async def get_raw(self, url: str) -> str:
        async with self.rate_limit_lock:
            await asyncio.sleep(0.12)
            try:
                r = await self.client.get(url, follow_redirects=True)
                r.raise_for_status()
                return r.text
            except Exception as e:
                logger.error(f"Error fetching raw {url}: {str(e)}")
                return ""

    async def get_filing_text(self, cik: str, accession: str) -> str:
        # Step 1: Build the SEC filing index URL
        acc_no_dash = accession.replace("-", "")
        cik_short = cik.lstrip("0")
        index_url = f"https://www.sec.gov/Archives/edgar/data/{cik_short}/{acc_no_dash}/{accession}-index.html"
        
        logger.info(f"Fetching index for extraction: {index_url}")
        index_html = await self.get_raw(index_url)
        if not index_html:
            return "Error: Could not fetch filing index."

        # Step 2: Locate the main filing HTML document
        soup_index = BeautifulSoup(index_html, "html.parser")
        table = soup_index.find("table", {"class": "tableFile", "summary": "Document Format Files"})
        if not table:
            return "Error: Document table not found in index."

        # The SEC index table has columns: Seq, Description, Document, Type, Size
        # We look for the row where Type matches the form we want, or the first substantial HTML doc.
        main_doc_path = ""
        rows = table.find_all("tr")[1:] # Skip header
        
        # Priority 1: Look for a row where 'Type' or 'Description' contains '.htm' and isn't a graphic
        for row in rows:
            cells = row.find_all("td")
            if len(cells) < 4: continue
            
            doc_link_cell = cells[2]
            type_cell = cells[3]
            
            file_name = doc_link_cell.text.strip().split()[0] # Get the first part before any iXBRL suffix
            file_type = type_cell.text.strip().upper()
            
            # Skip graphics and images
            if "GRAPHIC" in file_type or "JPG" in file_type or "GIF" in file_type:
                continue
                
            if file_name.endswith(".htm") or file_name.endswith(".html"):
                if "index.html" not in file_name:
                    # Found a candidate
                    link = doc_link_cell.find("a")
                    if link:
                        main_doc_path = link["href"]
                        break
        
        if not main_doc_path:
            # Fallback: Just take the first valid link in the Document column that is htm
            for row in rows:
                cells = row.find_all("td")
                if len(cells) < 3: continue
                a_tag = cells[2].find("a")
                if a_tag:
                    fname = a_tag.text.strip().split()[0]
                    if fname.endswith(".htm") or fname.endswith(".html"):
                        if "index.html" not in fname:
                            main_doc_path = a_tag["href"]
                            break
        
        if not main_doc_path:
            return "Error: Main document path not found."

        # Sanitize main_doc_path: remove iXBRL viewer prefix if present
        if "/ix?doc=" in main_doc_path:
            main_doc_path = main_doc_path.split("/ix?doc=")[1]

        doc_url = f"https://www.sec.gov{main_doc_path}"
        logger.info(f"Fetching main doc: {doc_url}")
        
        # Step 3: Download and parse the main document
        doc_html = await self.get_raw(doc_url)
        if not doc_html:
            return "Error: Could not fetch main document HTML."

        soup_doc = BeautifulSoup(doc_html, "html.parser")
        
        # Remove scripts and styles
        for script_or_style in soup_doc(["script", "style"]):
            script_or_style.decompose()

        # Step 4: Extract and Clean Text using the new pipeline
        cleaned_text = FilingProcessor.clean_html(doc_html)
        return cleaned_text

    async def get_historical_filings(self, cik: str, form_type: str = "10-K", limit: int = 5) -> List[dict]:
        url = f"https://data.sec.gov/submissions/CIK{cik}.json"
        data = await self.get(url)
        recent_forms = data.get("filings", {}).get("recent", {})
        forms = recent_forms.get("form", [])
        dates = recent_forms.get("filingDate", [])
        accessions = recent_forms.get("accessionNumber", [])
        
        logger.info(f"Checking {len(forms)} filings in recent submissions for CIK {cik}")
        results = []
        for i, form in enumerate(forms):
            f_upper = form.upper()
            if not form_type or f_upper.startswith(form_type.upper()):
                results.append({
                    "accession": accessions[i] if i < len(accessions) else "",
                    "filing_date": dates[i] if i < len(dates) else "",
                    "form_type": f_upper
                })
                if len(results) >= limit:
                    break
        
        # Traverse older submission files if limit not reached
        if len(results) < limit:
            files = data.get("filings", {}).get("files", [])
            for f in files:
                url_f = f"https://data.sec.gov/submissions/{f['name']}"
                f_data = await self.get(url_f)
                f_forms = f_data.get("form", [])
                f_dates = f_data.get("filingDate", [])
                f_accessions = f_data.get("accessionNumber", [])
                
                for i, form in enumerate(f_forms):
                    if form.upper().startswith(form_type.upper()):
                        results.append({
                            "accession": f_accessions[i] if i < len(f_accessions) else "",
                            "filing_date": f_dates[i] if i < len(f_dates) else "",
                            "form_type": form.upper()
                        })
                        if len(results) >= limit:
                            break
                if len(results) >= limit:
                    break

        return results

    async def close(self):
        await self.client.aclose()

sec_client = SECClient()
