import asyncio
from sec_client import sec_client

async def main():
    cik = "0000019617" # JPM CIK
    filings = await sec_client.get_historical_filings(cik, form_type="10-K", limit=5)
    print("Filings found:", len(filings))
    for f in filings:
        print(f)
    await sec_client.close()

if __name__ == "__main__":
    asyncio.run(main())
