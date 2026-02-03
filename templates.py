from typing import Dict, Any, List

RESPONSE_TEMPLATES = {
    "compliance": {
        "customer": """Dear {customer},

Thank you for reaching out. We have received your notification regarding shipment {shipment_id}.

Our compliance team is actively investigating this matter and will contact you within 24 hours with a full status update. We take all compliance matters seriously and are committed to swift resolution.

Best regards,
Operations Team""",
        "internal": """COMPLIANCE ALERT
Shipment: {shipment_id}
Order: {order_id}
Issue: {issue}
Priority: URGENT
Action Required: Coordinate with compliance team immediately"""
    },
    "shipment_urgent": {
        "customer": """Dear {customer},

We sincerely apologize for the delay regarding shipment {shipment_id} (Order {order_id}).

Our logistics team is investigating this urgently. We will provide you with a detailed update within 2 hours, including:
- Current status and location
- Expected delivery timeline
- Any necessary corrective actions

We appreciate your patience and will keep you informed every step of the way.

Best regards,
Customer Operations""",
        "internal": """URGENT SHIPMENT INVESTIGATION
Shipment: {shipment_id}
Order: {order_id}
Invoice: {invoice_id}
Status: REQUIRES IMMEDIATE ATTENTION
Next Step: Contact supplier and verify shipment status"""
    },
    "delivery_confirmation": {
        "customer": """Dear {customer},

Great news! Your shipment {shipment_id} has been successfully delivered. 

Order: {order_id}
Tracking Reference: {tracking_ref}

Thank you for your business. If you have any questions, please don't hesitate to reach out.

Best regards,
Logistics Team""",
        "internal": """DELIVERY CONFIRMED
Shipment: {shipment_id}
Order: {order_id}
Status: Delivered
Action: Update order status and notify accounting team"""
    },
    "payment": {
        "customer": """Dear {customer},

Thank you for your prompt payment of invoice {invoice_id}.

Your payment has been received and processed. A receipt will be sent separately.

We appreciate your business and look forward to future transactions.

Best regards,
Accounting Team""",
        "internal": """PAYMENT RECEIVED
Invoice: {invoice_id}
Order: {order_id}
Amount: ${amount}
Status: Payment processed
Action: Update accounting records"""
    },
    "inquiry": {
        "customer": """Dear {customer},

Thank you for inquiring about order {order_id}.

Current Status:
- Shipment: {shipment_id}
- Expected Arrival: {expected_arrival}
- Tracking Reference: {tracking_ref}

For real-time tracking updates, please use the reference number above. We will notify you immediately upon delivery.

Best regards,
Customer Service""",
        "internal": """CUSTOMER INQUIRY
Order: {order_id}
Shipment: {shipment_id}
Category: Status inquiry
Action: Respond with current shipment status"""
    },
    "general": {
        "customer": """Dear {customer},

Thank you for contacting us. Your message has been received and forwarded to the appropriate team.

We will respond to your inquiry shortly.

Best regards,
Operations Team""",
        "internal": """GENERAL INQUIRY
Email requires review and manual routing
Category: {category}
Action: Assign to appropriate team"""
    }
}


def generate_customer_response(
    category: str,
    entities: Dict[str, list],
    shipment_status: Dict[str, Any] = None,
    order_info: Dict[str, Any] = None,
    invoice_info: Dict[str, Any] = None
) -> str:
    """Generate customer-facing response based on classification."""
    
    template = RESPONSE_TEMPLATES.get(category, RESPONSE_TEMPLATES["general"])["customer"]
    
    # Prepare template variables
    variables = {
        "customer": order_info.get("customer", "Valued Customer") if order_info else "Valued Customer",
        "shipment_id": entities.get("shipments", ["N/A"])[0] if entities.get("shipments") else "N/A",
        "order_id": entities.get("orders", ["N/A"])[0] if entities.get("orders") else "N/A",
        "invoice_id": entities.get("invoices", ["N/A"])[0] if entities.get("invoices") else "N/A",
        "expected_arrival": shipment_status.get("expected_arrival", "N/A") if shipment_status else "N/A",
        "tracking_ref": entities.get("tracking_refs", ["N/A"])[0] if entities.get("tracking_refs") else "N/A",
        "amount": invoice_info.get("amount", "N/A") if invoice_info else "N/A",
    }
    
    return template.format(**variables)


def generate_internal_summary(
    category: str,
    entities: Dict[str, list],
    urgency_score: int,
    shipment_status: Dict[str, Any] = None,
    order_info: Dict[str, Any] = None
) -> str:
    """Generate internal ops team summary."""
    
    template = RESPONSE_TEMPLATES.get(category, RESPONSE_TEMPLATES["general"])["internal"]
    
    # Prepare template variables
    variables = {
        "shipment_id": entities.get("shipments", ["N/A"])[0] if entities.get("shipments") else "N/A",
        "order_id": entities.get("orders", ["N/A"])[0] if entities.get("orders") else "N/A",
        "invoice_id": entities.get("invoices", ["N/A"])[0] if entities.get("invoices") else "N/A",
        "issue": shipment_status.get("hold_reason", "Unknown") if shipment_status else "Unknown",
        "category": category,
        "amount": order_info.get("items", [{}])[0].get("qty", "N/A") if order_info else "N/A",
    }
    
    summary = template.format(**variables)
    summary += f"\n\nUrgency Score: {urgency_score}/10"
    
    return summary
