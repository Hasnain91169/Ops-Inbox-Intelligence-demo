import json
from datetime import datetime
from typing import Dict, Any, List

def create_audit_record(
    email_id: str,
    email_from: str,
    email_subject: str,
    category: str,
    routing: str,
    urgency_score: int,
    entities: Dict[str, list],
    extraction_time: str = None
) -> Dict[str, Any]:
    """Create a comprehensive audit record for the processed email."""
    
    if extraction_time is None:
        extraction_time = datetime.utcnow().isoformat() + "Z"
    
    record = {
        "audit_id": f"AUD-{email_id.replace('email_', '')}",
        "timestamp": extraction_time,
        "email_id": email_id,
        "email_from": email_from,
        "email_subject": email_subject,
        "processing": {
            "category": category,
            "routing_queue": routing,
            "urgency_score": urgency_score,
            "processing_status": "completed"
        },
        "extracted_entities": {
            "shipments": entities.get("shipments", []),
            "orders": entities.get("orders", []),
            "invoices": entities.get("invoices", []),
            "hs_codes": entities.get("hs_codes", []),
            "tracking_refs": entities.get("tracking_refs", []),
            "customer_emails": entities.get("customers", [])
        },
        "actions": []
    }
    
    return record


def add_action_to_audit(
    audit_record: Dict[str, Any],
    action_type: str,
    description: str,
    status: str = "pending"
) -> Dict[str, Any]:
    """Add an action item to the audit record."""
    
    action = {
        "action_id": f"ACT-{len(audit_record['actions']) + 1}",
        "type": action_type,
        "description": description,
        "status": status,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
    
    audit_record["actions"].append(action)
    return audit_record


def generate_audit_trail(
    email_id: str,
    email_from: str,
    email_subject: str,
    category: str,
    routing: str,
    urgency_score: int,
    entities: Dict[str, list]
) -> List[Dict[str, Any]]:
    """Generate complete audit trail for an email."""
    
    # Create initial audit record
    audit = create_audit_record(
        email_id, email_from, email_subject, category, routing, urgency_score, entities
    )
    
    # Add actions based on category
    if category == "compliance":
        audit = add_action_to_audit(audit, "escalation", "Escalate to compliance team immediately")
        audit = add_action_to_audit(audit, "notification", "Notify customer of compliance review")
    elif category == "shipment_urgent":
        audit = add_action_to_audit(audit, "investigation", "Investigate missing shipment status")
        audit = add_action_to_audit(audit, "supplier_contact", "Contact supplier for shipment location")
        audit = add_action_to_audit(audit, "customer_response", "Send urgent response to customer")
    elif category == "delivery_confirmation":
        audit = add_action_to_audit(audit, "order_update", "Update order status to delivered")
        audit = add_action_to_audit(audit, "accounting_notification", "Notify accounting team")
    elif category == "payment":
        audit = add_action_to_audit(audit, "payment_processing", "Process payment and generate receipt")
        audit = add_action_to_audit(audit, "accounting_update", "Update accounting records")
    elif category == "inquiry":
        audit = add_action_to_audit(audit, "customer_response", "Send shipment status to customer")
    else:
        audit = add_action_to_audit(audit, "manual_review", "Email requires manual review and routing")
    
    return [audit]
