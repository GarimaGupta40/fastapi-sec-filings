import asyncio
from sec_client import sec_client

async def main():
    cik = "0000019617" # JPM CIK
    data = await sec_client.get(f"https://data.sec.gov/submissions/CIK{cik}.json")
    recent_forms = data.get("filings", {}).get("recent", {})
    forms = recent_forms.get("form", [])
    print("Forms found in recent: ", [f for f in forms if "10-K" in f.upper()])
    await sec_client.close()

if __name__ == "__main__":
    asyncio.run(main())
