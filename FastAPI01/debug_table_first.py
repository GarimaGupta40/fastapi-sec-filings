import httpx
import asyncio
from bs4 import BeautifulSoup

async def main():
    headers = {"User-Agent": "FastAPI01 SEC Research (garim@example.com)"}
    url = "https://www.sec.gov/Archives/edgar/data/1318605/000110465925090866/0001104659-25-090866-index.html"
    async with httpx.AsyncClient(headers=headers, timeout=30.0) as client:
        r = await client.get(url)
        soup = BeautifulSoup(r.text, "html.parser")
        table = soup.find("table", {"class": "tableFile", "summary": "Document Format Files"})
        if not table:
            print("Table not found")
            return
        
        rows = table.find_all("tr")
        for row in rows[:15]:
            cols = [td.text.strip() for td in row.find_all(["th", "td"])]
            print(cols)

if __name__ == "__main__":
    asyncio.run(main())
