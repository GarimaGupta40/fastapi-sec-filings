import httpx
import asyncio

async def main():
    headers = {"User-Agent": "FastAPI01 SEC Research (garim@example.com)"}
    url = "https://www.sec.gov/Archives/edgar/data/1318605/000110465925090866/0001104659-25-090866-index.html"
    async with httpx.AsyncClient(headers=headers) as client:
        r = await client.get(url)
        print(r.text[:2000])

if __name__ == "__main__":
    asyncio.run(main())
