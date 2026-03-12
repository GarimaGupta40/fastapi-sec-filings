import re
from bs4 import BeautifulSoup
from typing import Dict, List, Any

class FilingProcessor:
    @staticmethod
    def clean_html(html_content: str) -> str:
        """Step 1 & 2: Parse HTML and Clean Text"""
        soup = BeautifulSoup(html_content, "html.parser")
        
        # Remove scripts, styles, and other non-content tags
        for tag in soup(["script", "style", "header", "footer", "nav"]):
            tag.decompose()
            
        # Extract text with preserved breaks
        text = soup.get_text(separator="\n")
        
        # Cleaning Step: Remove SEC artifacts
        # 1. Remove exhibit identifiers
        text = re.sub(r'EX-\d+\.\d+.*', '', text)
        
        # 2. Remove page numbers (standalone lines with just digits)
        text = re.sub(r'^\s*\d+\s*$', '', text, flags=re.MULTILINE)
        
        # 3. Remove common HTML remnants and file names
        text = re.sub(r'.*\.htm\b', '', text, flags=re.IGNORECASE)
        
        # 4. Remove excessive whitespace
        text = re.sub(r'\n{3,}', '\n\n', text)
        
        # 5. Remove "Table of Contents" markers if they are standalone
        text = re.sub(r'^\s*Table of Contents\s*$', '', text, flags=re.MULTILINE | re.IGNORECASE)
        
        return text.strip()

    @staticmethod
    def detect_sections(text: str, form_type: str) -> List[Dict[str, str]]:
        """Step 3: Section Detection based on form type"""
        sections = []
        form_type = form_type.upper()
        
        # Define common section headers for different forms
        headers_map = {
            "10-K": [
                r"Item\s+1\.\s+Business",
                r"Item\s+1A\.\s+Risk Factors",
                r"Item\s+7\.\s+Management’s Discussion and Analysis",
                r"Item\s+8\.\s+Financial Statements",
                r"Item\s+9A\.\s+Controls and Procedures",
                r"Item\s+10\.\s+Directors, Executive Officers and Corporate Governance",
            ],
            "10-Q": [
                r"Part\s+I\s+—\s+Financial Information",
                r"Item\s+1\.\s+Financial Statements",
                r"Item\s+2\.\s+Management’s Discussion and Analysis",
                r"Item\s+3\.\s+Quantitative and Qualitative Disclosures",
                r"Item\s+1A\.\s+Risk Factors",
                r"Item\s+1\.\s+Legal Proceedings",
            ],
            "8-K": [
                r"Item\s+1\.01\s+Entry into a Material Definitive Agreement",
                r"Item\s+2\.02\s+Results of Operations and Financial Condition",
                r"Item\s+5\.02\s+Departure of Directors or Certain Officers",
                r"Item\s+8\.01\s+Other Events",
                r"Item\s+9\.01\s+Financial Statements and Exhibits",
            ],
            "DEF 14A": [
                r"Proxy Summary",
                r"Corporate Governance",
                r"Executive Compensation",
                r"Audit Committee Matters",
                r"Proposal\s+\d+",
                r"Stock Ownership",
            ]
        }
        
        # Default headers if not specified
        relevant_headers = headers_map.get(form_type, [r"Item\s+\d+"])
        
        # Build a single regex for splitting
        regex_pattern = "(" + "|".join(relevant_headers) + ")"
        
        # Split text into sections
        parts = re.split(regex_pattern, text, flags=re.IGNORECASE)
        
        if len(parts) <= 1:
            # Fallback: Just return the whole thing as "Full Document" if no sections detected
            return [{"title": "Full Document", "content": text}]
            
        # The first part is usually the introduction/header
        if parts[0].strip():
            sections.append({"title": "Introduction", "content": parts[0].strip()})
            
        # iterate through matches
        for i in range(1, len(parts), 2):
            title = parts[i].strip()
            content = parts[i+1].strip() if i+1 < len(parts) else ""
            
            # Clean up the title (remove extra spaces/newlines)
            title = re.sub(r'\s+', ' ', title)
            sections.append({"title": title, "content": content})
            
        return sections

