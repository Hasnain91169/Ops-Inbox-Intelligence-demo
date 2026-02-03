import re
from typing import Dict, List, Any

def extract_entities(email_body: str, email_subject: str = "") -> Dict[str, List[str]]:
    """Extract key entities from email content using regex patterns."""
    entities = {
        "shipments": [],
        "orders": [],
        "invoices": [],
        "hs_codes": [],
        "customers": [],
        "tracking_refs": []
    }
    
    # Shipment IDs: SHP-YYYY-NNN
    shipment_pattern = r'SHP-\d{4}-\d{3,}'
    entities["shipments"] = re.findall(shipment_pattern, email_body + " " + email_subject)
    
    # Order IDs: ORD-NNN or #ORD-NNN
    order_pattern = r'(?:#)?ORD-\d{3,}'
    entities["orders"] = re.findall(order_pattern, email_body + " " + email_subject)
    
    # Invoice IDs: INV-YYYY-NNN
    invoice_pattern = r'INV-\d{4}-\d{3,}'
    entities["invoices"] = re.findall(invoice_pattern, email_body + " " + email_subject)
    
    # HS Codes: 4-8 digits with optional periods (XXXX.XX format)
    hs_pattern = r'\b\d{4}(?:\.\d{2})?\b'
    hs_matches = re.findall(hs_pattern, email_body)
    entities["hs_codes"] = list(set(hs_matches))
    
    # Tracking references: TRACK-YYYY-NNN
    tracking_pattern = r'TRACK-\d{4}-\d{3,}'
    entities["tracking_refs"] = re.findall(tracking_pattern, email_body + " " + email_subject)
    
    # Customer emails (extract from body mentions)
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    entities["customers"] = re.findall(email_pattern, email_body)
    
    # Remove duplicates while preserving order
    for key in entities:
        entities[key] = list(dict.fromkeys(entities[key]))
    
    return entities


def extract_urgency_signals(email_body: str, email_subject: str = "") -> Dict[str, int]:
    """Detect urgency indicators in email content."""
    signals = {
        "urgent_keywords": 0,
        "all_caps_words": 0,
        "exclamation_marks": 0
    }
    
    # Urgent keywords
    urgent_words = ["urgent", "asap", "immediately", "critical", "emergency", "on hold", "flagged", "violation"]
    text_lower = (email_body + " " + email_subject).lower()
    signals["urgent_keywords"] = sum(1 for word in urgent_words if word in text_lower)
    
    # All-caps words (excluding short words)
    caps_pattern = r'\b[A-Z]{4,}\b'
    signals["all_caps_words"] = len(re.findall(caps_pattern, email_body + " " + email_subject))
    
    # Exclamation marks
    signals["exclamation_marks"] = (email_body + " " + email_subject).count("!")
    
    return signals
