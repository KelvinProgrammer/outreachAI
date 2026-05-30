import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import sqlite3
import time
import requests
from database import get_db_connection

def get_settings():
    """Fetches configuration from the settings and smtp_config tables."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM settings WHERE id = 1")
    settings_row = cursor.fetchone()
    
    cursor.execute("SELECT * FROM smtp_config WHERE id = 1")
    smtp_row = cursor.fetchone()
    
    conn.close()
    return settings_row, smtp_row

def generate_email_with_deepseek(lead_id):
    """
    Uses the DeepSeek API to generate a personalized email for the given lead.
    If no API key is provided, falls back to local template parsing.
    """
    settings_row, smtp_row = get_settings()
    if not settings_row:
        return False, "Settings not initialized"
        
    api_key = settings_row["deepseek_api_key"]
    template = settings_row["outreach_template"]
    subject_template = settings_row["outreach_subject"]
    
    # Fetch lead details
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM leads WHERE id = ?", (lead_id,))
    lead = cursor.fetchone()
    
    if not lead:
        conn.close()
        return False, "Lead not found"
        
    # Replace templates locally as initial structure
    sender_name = smtp_row["sender_name"] if (smtp_row and smtp_row["sender_name"]) else "Collaborations Team"
    
    email_params = {
        "{name}": lead["name"] or "Creator",
        "{email}": lead["email"],
        "{source_url}": lead["source_url"] or "your profile",
        "{query}": lead["query"] or "UGC Travel collaborations",
        "{sender_name}": sender_name
    }
    
    subject = subject_template
    body = template
    for key, val in email_params.items():
        subject = subject.replace(key, val)
        body = body.replace(key, val)
        
    # If DeepSeek key is provided, use it to personalize/enrich the email
    if api_key and len(api_key.strip()) > 5:
        try:
            print(f"Calling DeepSeek API to personalize email for: {lead['email']}")
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
            
            prompt = f"""
You are an expert sales and collaborations manager. Optimize this draft email body to make it sound extremely natural, personalized, engaging, and professional. 

Target Recipient Details:
- Name: {lead['name'] or 'Creator'}
- Niche/Platform: {lead['source_url']}
- Found via Search: {lead['query']}

Original Template Draft:
---
{body}
---

Requirements:
1. Maintain the core call to action and offer from the template.
2. Make it highly engaging, friendly, and brief (under 150 words).
3. Do NOT include any placeholders like [Your Name] or [Insert Link] - use the actual values from the template.
4. Output ONLY the optimized email body text, with no header, introductory, or concluding remarks.
"""
            
            payload = {
                "model": "deepseek-chat",
                "messages": [
                    {"role": "system", "content": "You are a professional email outreach assistant."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.7,
                "max_tokens": 300
            }
            
            # DeepSeek base endpoint
            response = requests.post("https://api.deepseek.com/v1/chat/completions", json=payload, headers=headers, timeout=20)
            if response.status_code == 200:
                result = response.json()
                body = result["choices"][0]["message"]["content"].strip()
                print("DeepSeek customization applied successfully!")
            else:
                print(f"DeepSeek API error: HTTP {response.status_code}. Falling back to template replacement.")
        except Exception as e:
            print(f"Error calling DeepSeek API: {e}. Using local template replacement.")
            
    # Update lead record in SQLite
    cursor.execute("""
    UPDATE leads 
    SET generated_subject = ?, generated_body = ?, status = 'generated'
    WHERE id = ?
    """, (subject, body, lead_id))
    
    conn.commit()
    conn.close()
    return True, "Email generated successfully"

def send_outreach_email(lead_id):
    """
    Sends the generated email to the lead using the configured SMTP server.
    Ensures safe SSL/TLS connections and attaches an unsubscribe footer.
    """
    settings_row, smtp_row = get_settings()
    if not smtp_row or not smtp_row["host"] or not smtp_row["username"] or not smtp_row["password"]:
        return False, "SMTP settings are incomplete"
        
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM leads WHERE id = ?", (lead_id,))
    lead = cursor.fetchone()
    
    if not lead:
        conn.close()
        return False, "Lead not found"
        
    if lead["status"] == "unsubscribed":
        conn.close()
        return False, "Lead is unsubscribed"
        
    subject = lead["generated_subject"]
    body = lead["generated_body"]
    
    if not subject or not body:
        conn.close()
        return False, "Email content has not been generated yet"
        
    # Append Opt-out compliance footer
    unsubscribe_footer = f"\n\n---\nTo unsubscribe from our collaborations database, reply to this email with 'UNSUBSCRIBE' or visit http://localhost:3000/unsubscribe?email={lead['email']}"
    body += unsubscribe_footer
    
    sender_email = smtp_row["sender_email"] or smtp_row["username"]
    sender_name = smtp_row["sender_name"] or "Collaborations Team"
    
    msg = MIMEMultipart()
    msg['From'] = f"{sender_name} <{sender_email}>"
    msg['To'] = lead["email"]
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain', 'utf-8'))
    
    try:
        host = smtp_row["host"]
        port = smtp_row["port"]
        username = smtp_row["username"]
        password = smtp_row["password"]
        use_tls = smtp_row["use_tls"]
        
        # Connect to SMTP
        if use_tls == 1 and port == 465:
            # Port 465 implies explicit SSL
            server = smtplib.SMTP_SSL(host, port, timeout=15)
        else:
            # Port 587 or others imply STARTTLS
            server = smtplib.SMTP(host, port, timeout=15)
            server.ehlo()
            if use_tls == 1:
                server.starttls()
                server.ehlo()
                
        server.login(username, password)
        server.sendmail(sender_email, [lead["email"]], msg.as_string())
        server.quit()
        
        # Update SQLite record
        cursor.execute("""
        UPDATE leads 
        SET status = 'sent', sent_at = CURRENT_TIMESTAMP, error_message = NULL
        WHERE id = ?
        """, (lead_id,))
        
        conn.commit()
        conn.close()
        return True, "Email sent successfully"
        
    except Exception as e:
        error_msg = str(e)
        print(f"SMTP error sending to {lead['email']}: {error_msg}")
        
        cursor.execute("""
        UPDATE leads 
        SET status = 'failed', error_message = ?
        WHERE id = ?
        """, (error_msg, lead_id))
        
        conn.commit()
        conn.close()
        return False, f"SMTP Error: {error_msg}"
