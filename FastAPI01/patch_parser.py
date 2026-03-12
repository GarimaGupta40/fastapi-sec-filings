import re

with open("xbrl_parser.py", "r") as f:
    code = f.read()

code = code.replace(
    'def extract_financial_data(facts_gaap: dict, text: str = ""):',
    'def extract_financial_data(facts_gaap: dict, text: str = "", year_offset: int = 0):'
)

# Replace get_value(facts_gaap, "Tag") with get_value(facts_gaap, "Tag", year_offset)
code = re.sub(r'get_value\((facts_gaap), ("[^"]+")\)', r'get_value(\1, \2, year_offset)', code)

# Replace get_best_value(facts_gaap, TAGS) with get_best_value(facts_gaap, TAGS, year_offset)
code = re.sub(r'get_best_value\((facts_gaap), ([A-Z_]+)\)', r'get_best_value(\1, \2, year_offset)', code)

with open("xbrl_parser.py", "w") as f:
    f.write(code)

print("Updated xbrl_parser.py")
