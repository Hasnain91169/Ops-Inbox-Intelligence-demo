#!/usr/bin/env python3
"""
Ops Inbox AI Demo - Logistics Operations Email Processing System
Processes incoming operational emails, extracts entities, classifies urgency,
and generates appropriate responses and audit trails.
"""

import json
import sys
from pathlib import Path

# Import custom modules
import extract
import classify
import templates
import audit


def load_json_file(filepath: str) -> dict or list:
    """Load and parse a JSON file."""
    try:
        with open(filepath, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Error: File not found - {filepath}")
        return None
    except json.JSONDecodeError:
        print(f"Error: Invalid JSON in {filepath}")
        return None


def process_email(email: dict, orders: list, shipments: list, invoices: list) -> dict:
    """Process a single email through the entire pipeline."""
    
    # Extract entities
    entities = extract.extract_entities(email["body"], email["subject"])
    urgency_signals = extract.extract_urgency_signals(email["body"], email["subject"])
    
    # Classify and route
    classification = classify.classify_email(entities, email["body"], email["subject"])
    urgency_score = classify.score_urgency(entities, urgency_signals, email["subject"])
    routing = classify.determine_routing(classification)
    
    # Lookup related data
    order_info = None
    shipment_status = None
    invoice_info = None
    
    if entities.get("orders"):
        order_id = entities["orders"][0]
        order_info = next((o for o in orders if o["id"] == order_id), None)
    
    if entities.get("shipments"):
        shipment_id = entities["shipments"][0]
        shipment_status = next((s for s in shipments if s["id"] == shipment_id), None)
    
    if entities.get("invoices"):
        invoice_id = entities["invoices"][0]
        invoice_info = next((i for i in invoices if i["id"] == invoice_id), None)
    
    # Generate responses
    customer_response = templates.generate_customer_response(
        classification["category"],
        entities,
        shipment_status,
        order_info,
        invoice_info
    )
    
    internal_summary = templates.generate_internal_summary(
        classification["category"],
        entities,
        urgency_score,
        shipment_status,
        order_info
    )
    
    # Create audit trail
    audit_trail = audit.generate_audit_trail(
        email["id"],
        email["from"],
        email["subject"],
        classification["category"],
        routing,
        urgency_score,
        entities
    )
    
    return {
        "email_id": email["id"],
        "email_from": email["from"],
        "email_subject": email["subject"],
        "email_timestamp": email["timestamp"],
        "extracted_entities": entities,
        "urgency_signals": urgency_signals,
        "classification": classification,
        "urgency_score": urgency_score,
        "routing_queue": routing,
        "related_data": {
            "order_id": order_info["id"] if order_info else None,
            "shipment_id": shipment_status["id"] if shipment_status else None,
            "invoice_id": invoice_info["id"] if invoice_info else None
        },
        "customer_response": customer_response,
        "internal_summary": internal_summary,
        "audit_trail": audit_trail
    }


def display_processing_results(results: list):
    """Display formatted results to console."""
    print("\n" + "="*80)
    print("OPS INBOX AI DEMO - PROCESSING RESULTS")
    print("="*80 + "\n")
    
    for i, result in enumerate(results, 1):
        print(f"EMAIL {i}: {result['email_subject']}")
        print(f"From: {result['email_from']}")
        print(f"Timestamp: {result['email_timestamp']}")
        print("-" * 80)
        
        # Entities
        print(f"Extracted Entities:")
        for entity_type, values in result['extracted_entities'].items():
            if values:
                print(f"  {entity_type}: {', '.join(values)}")
        
        # Classification
        print(f"\nClassification:")
        print(f"  Category: {result['classification']['category']}")
        print(f"  Routing: {result['routing_queue']}")
        print(f"  Reason: {result['classification']['reason']}")
        
        # Urgency
        print(f"\nUrgency Assessment:")
        print(f"  Score: {result['urgency_score']}/10")
        print(f"  Signals: {result['urgency_signals']}")
        
        # Related Data
        print(f"\nRelated Data:")
        for key, value in result['related_data'].items():
            if value:
                print(f"  {key}: {value}")
        
        # Customer Response
        print(f"\nCUSTOMER RESPONSE:")
        print("-" * 40)
        print(result['customer_response'])
        print("-" * 40)
        
        # Internal Summary
        print(f"\nINTERNAL OPERATIONS SUMMARY:")
        print("-" * 40)
        print(result['internal_summary'])
        print("-" * 40)
        
        # Audit Trail
        if result['audit_trail']:
            audit_record = result['audit_trail'][0]
            print(f"\nAUDIT TRAIL: {audit_record['audit_id']}")
            print(f"  Status: {audit_record['processing']['processing_status']}")
            print(f"  Actions:")
            for action in audit_record['actions']:
                print(f"    - {action['action_id']}: {action['type']} - {action['description']}")
        
        print("\n" + "="*80 + "\n")


def save_results_to_file(results: list, output_file: str = "processing_results.json"):
    """Save all results to a JSON file."""
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2)
    print(f"Results saved to {output_file}")


def main():
    """Main application entry point."""
    print("Starting Ops Inbox AI Demo...\n")
    
    # Load data files from current directory (Demo_2)
    current_dir = Path.cwd()
    
    inbox = load_json_file(str(current_dir / "inbox.json"))
    orders = load_json_file(str(current_dir / "orders.json"))
    shipments = load_json_file(str(current_dir / "shipments.json"))
    invoices = load_json_file(str(current_dir / "invoices.json"))
    compliance = load_json_file(str(current_dir / "compliance.json"))
    
    # Verify all files loaded
    if not all([inbox, orders, shipments, invoices, compliance]):
        print("Error: Failed to load one or more data files")
        return
    
    print(f"Loaded {len(inbox)} emails from inbox")
    print(f"Processing emails...\n")
    
    # Process each email
    results = []
    for email in inbox:
        result = process_email(email, orders, shipments, invoices)
        results.append(result)
    
    # Display results
    display_processing_results(results)
    
    # Save results
    save_results_to_file(results)
    
    # Summary stats
    print("\n" + "="*80)
    print("PROCESSING SUMMARY")
    print("="*80)
    print(f"Total emails processed: {len(results)}")
    
    category_counts = {}
    routing_counts = {}
    urgency_distribution = {"high": 0, "medium": 0, "low": 0}
    
    for result in results:
        category = result['classification']['category']
        routing = result['routing_queue']
        score = result['urgency_score']
        
        category_counts[category] = category_counts.get(category, 0) + 1
        routing_counts[routing] = routing_counts.get(routing, 0) + 1
        
        if score >= 7:
            urgency_distribution["high"] += 1
        elif score >= 4:
            urgency_distribution["medium"] += 1
        else:
            urgency_distribution["low"] += 1
    
    print(f"\nEmails by Category:")
    for cat, count in sorted(category_counts.items()):
        print(f"  {cat}: {count}")
    
    print(f"\nEmails by Routing Queue:")
    for route, count in sorted(routing_counts.items()):
        print(f"  {route}: {count}")
    
    print(f"\nUrgency Distribution:")
    print(f"  High (7-10): {urgency_distribution['high']}")
    print(f"  Medium (4-6): {urgency_distribution['medium']}")
    print(f"  Low (1-3): {urgency_distribution['low']}")
    
    print("\n" + "="*80)
    print("Demo completed successfully!")
    print("="*80 + "\n")


if __name__ == "__main__":
    main()
