import requests
import json

base_url = "http://127.0.0.1:8000"

def test_filings_list(ticker):
    print(f"\n--- Testing filings list for {ticker} ---")
    try:
        response = requests.get(f"{base_url}/api/company/{ticker}/filings")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")

def test_filing_content(ticker, form_type):
    print(f"\n--- Testing filing content for {ticker} {form_type} ---")
    try:
        # Use '-' for URL if needed, but my backend handles replace('-' to ' ')
        response = requests.get(f"{base_url}/api/company/{ticker}/filing/{form_type}")
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Ticker: {data.get('ticker')}")
            print(f"Type: {data.get('filing_type')}")
            print(f"Date: {data.get('date')}")
            content = data.get('text', '')
            print(f"Content Length: {len(content)}")
            print(f"Snippet: {content[:100]}...")
        else:
            print(f"Error Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_filings_list("AAPL")
    test_filing_content("AAPL", "10-K")
