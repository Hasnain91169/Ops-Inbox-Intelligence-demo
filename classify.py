import json
from typing import Dict, Any

def classify_email(entities: Dict, email_body: str, email_subject: str = "") -> Dict[str, Any]:
    """Classify email into category and determine routing."""
    
    classification = {
        "category": "general",
        "routing": "general_queue",
        "reason": ""
    }
    
    text_lower = (email_body + " " + email_subject).lower()
    
    # Compliance issues take highest priority
    if any(word in text_lower for word in ["compliance", "violation", "customs", "hs code", "hold"]):
        classification["category"] = "compliance"
        classification["routing"] = "compliance_team"
        classification["reason"] = "Compliance or customs-related issue detected"
        return classification
    
    # Urgent shipment issues
    if entities.get("shipments") and any(word in text_lower for word in ["missing", "lost", "urgent", "asap"]):
        classification["category"] = "shipment_urgent"
        classification["routing"] = "operations_urgent"
        classification["reason"] = "Urgent shipment issue requiring immediate action"
        return classification
    
    # Delivery confirmations
    if any(word in text_lower for word in ["delivered", "confirmation", "successful", "completed"]):
        classification["category"] = "delivery_confirmation"
        classification["routing"] = "general_queue"
        classification["reason"] = "Shipment delivery confirmation"
        return classification
    
    # Payment/invoicing
    if entities.get("invoices") and any(word in text_lower for word in ["payment", "invoice", "paid", "received"]):
        classification["category"] = "payment"
        classification["routing"] = "accounting_team"
        classification["reason"] = "Payment or invoice-related"
        return classification
    
    # Status inquiries
    if any(word in text_lower for word in ["status", "when", "tracking", "arrive", "question"]):
        classification["category"] = "inquiry"
        classification["routing"] = "customer_support"
        classification["reason"] = "Customer inquiry requiring response"
        return classification
    
    return classification


def score_urgency(entities: Dict, urgency_signals: Dict, email_subject: str = "") -> int:
    """Score urgency level from 1-10."""
    score = 0
    
    # Base score from signals
    score += min(urgency_signals.get("urgent_keywords", 0) * 2, 4)
    score += min(urgency_signals.get("all_caps_words", 0), 3)
    score += min(urgency_signals.get("exclamation_marks", 0) * 1, 2)
    
    # Boost if multiple high-value entities
    entity_count = (
        len(entities.get("shipments", [])) +
        len(entities.get("orders", [])) +
        len(entities.get("invoices", []))
    )
    if entity_count > 2:
        score += 2
    
    # Compliance issues are always high priority
    if "compliance" in email_subject.lower() or "violation" in email_subject.lower():
        score = max(score, 9)
    
    # Missing/lost shipments are high priority
    if "missing" in email_subject.lower() or "lost" in email_subject.lower():
        score = max(score, 8)
    
    return min(max(score, 1), 10)


def determine_routing(classification: Dict) -> str:
    """Return the appropriate queue/team for the email."""
    return classification.get("routing", "general_queue")
