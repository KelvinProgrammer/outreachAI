from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import List, Optional
import sqlite3
import uvicorn
import time
import random

from database import init_db, get_db_connection
from scraper import google_search_scraper
from outreach import generate_email_with_deepseek, send_outreach_email, get_settings

app = FastAPI(title="Outbound Lead & Outreach Engine API")

# Setup CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, lock down to the NextJS client origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize DB on startup
@app.on_event("startup")
def startup_event():
    init_db()

# Pydantic models for request bodies
class ScrapeRequest(BaseModel):
    query: str
    num_results: int = 10
    simulate: bool = True

class SettingsRequest(BaseModel):
    deepseek_api_key: str
    outreach_template: str
    outreach_subject: str
    delay_seconds: int = 60

class SMTPRequest(BaseModel):
    host: str
    port: int
    username: str
    password: str
    use_tls: int = 1
    sender_email: str
    sender_name: str

class TestSMTPRequest(BaseModel):
    test_email: str

class SaveEmailRequest(BaseModel):
    subject: str
    body: str

# API Endpoints

@app.get("/api/leads")
def get_leads(status: Optional[str] = None):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if status:
        cursor.execute("SELECT * FROM leads WHERE status = ? ORDER BY created_at DESC", (status,))
    else:
        cursor.execute("SELECT * FROM leads ORDER BY created_at DESC")
        
    leads = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return leads

@app.post("/api/leads/clear")
def clear_leads():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM leads")
    conn.commit()
    conn.close()
    return {"message": "All leads deleted successfully"}

@app.delete("/api/leads/{lead_id}")
def delete_lead(lead_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM leads WHERE id = ?", (lead_id,))
    conn.commit()
    conn.close()
    return {"message": f"Lead {lead_id} deleted successfully"}

@app.post("/api/scrape")
def trigger_scrape(payload: ScrapeRequest):
    if not payload.query:
        raise HTTPException(status_code=400, detail="Search query is required")
        
    try:
        leads = google_search_scraper(payload.query, payload.num_results, payload.simulate)
        
        # Save to DB
        conn = get_db_connection()
        cursor = conn.cursor()
        
        new_leads_count = 0
        for lead in leads:
            try:
                cursor.execute("""
                INSERT INTO leads (email, source_url, query, name, status)
                VALUES (?, ?, ?, ?, 'pending')
                """, (lead["email"], lead["source_url"], lead["query"], lead["name"]))
                new_leads_count += 1
            except sqlite3.IntegrityError:
                # Email already exists in database, skip it
                pass
                
        conn.commit()
        conn.close()
        
        return {
            "status": "success",
            "total_harvested": len(leads),
            "new_added": new_leads_count,
            "leads": leads
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/settings")
def get_general_settings():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM settings WHERE id = 1")
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        return {}
        
    res = dict(row)
    # Mask API key for security
    if res["deepseek_api_key"]:
        key = res["deepseek_api_key"]
        res["deepseek_api_key"] = key[:4] + "*" * (len(key) - 8) + key[-4:] if len(key) > 8 else "****"
    return res

@app.post("/api/settings")
def save_general_settings(payload: SettingsRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if a new key was entered, or if the masked one is being submitted (skip update in that case)
    if payload.deepseek_api_key.startswith("http") or "*" in payload.deepseek_api_key:
        # Retrieve existing key
        cursor.execute("SELECT deepseek_api_key FROM settings WHERE id = 1")
        existing_key = cursor.fetchone()[0]
        api_key = existing_key
    else:
        api_key = payload.deepseek_api_key
        
    cursor.execute("""
    UPDATE settings 
    SET deepseek_api_key = ?, outreach_template = ?, outreach_subject = ?, delay_seconds = ?
    WHERE id = 1
    """, (api_key, payload.outreach_template, payload.outreach_subject, payload.delay_seconds))
    
    conn.commit()
    conn.close()
    return {"message": "Settings updated successfully"}

@app.get("/api/smtp")
def get_smtp_config():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM smtp_config WHERE id = 1")
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        return {}
        
    res = dict(row)
    # Mask password for security
    if res["password"]:
        res["password"] = "********"
    return res

@app.post("/api/smtp")
def save_smtp_config(payload: SMTPRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if masked password is submitted
    if payload.password == "********":
        cursor.execute("SELECT password FROM smtp_config WHERE id = 1")
        existing_password = cursor.fetchone()[0]
        password = existing_password
    else:
        password = payload.password
        
    cursor.execute("""
    UPDATE smtp_config 
    SET host = ?, port = ?, username = ?, password = ?, use_tls = ?, sender_email = ?, sender_name = ?
    WHERE id = 1
    """, (payload.host, payload.port, payload.username, password, payload.use_tls, payload.sender_email, payload.sender_name))
    
    conn.commit()
    conn.close()
    return {"message": "SMTP configuration updated successfully"}

@app.post("/api/generate/{lead_id}")
def generate_lead_email(lead_id: int):
    success, msg = generate_email_with_deepseek(lead_id)
    if not success:
        raise HTTPException(status_code=400, detail=msg)
        
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT generated_subject, generated_body FROM leads WHERE id = ?", (lead_id,))
    lead = cursor.fetchone()
    conn.close()
    
    return {
        "status": "success",
        "message": msg,
        "subject": lead["generated_subject"] if lead else "",
        "body": lead["generated_body"] if lead else ""
    }

@app.post("/api/send/{lead_id}")
def send_lead_email(lead_id: int):
    success, msg = send_outreach_email(lead_id)
    if not success:
        raise HTTPException(status_code=400, detail=msg)
    return {"status": "success", "message": msg}

@app.post("/api/leads/{lead_id}/save")
def save_lead_email(lead_id: int, payload: SaveEmailRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    UPDATE leads 
    SET generated_subject = ?, generated_body = ?, status = 'generated'
    WHERE id = ?
    """, (payload.subject, payload.body, lead_id))
    conn.commit()
    conn.close()
    return {"status": "success", "message": "Email draft saved successfully"}

# Dynamic background outreach campaign worker
def run_campaign_background(lead_ids: List[int]):
    print(f"Starting background campaign for {len(lead_ids)} leads.")
    for lead_id in lead_ids:
        # Check if still valid (e.g. not unsubscribed)
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT status FROM leads WHERE id = ?", (lead_id,))
        lead = cursor.fetchone()
        
        if not lead or lead["status"] in ["sent", "unsubscribed"]:
            conn.close()
            continue
            
        conn.close()
        
        try:
            # 1. Generate Email via DeepSeek
            generate_email_with_deepseek(lead_id)
            # 2. Dispatch Email via SMTP
            send_outreach_email(lead_id)
            
            # Fetch rate limit settings
            settings_row, _ = get_settings()
            delay = settings_row["delay_seconds"] if settings_row else 60
            
            # Add random jitter to seem natural and prevent blacklisting
            sleep_time = delay + random.randint(-10, 20)
            if sleep_time < 5:
                sleep_time = 5
                
            print(f"Waiting {sleep_time} seconds before next email to protect domain reputation...")
            time.sleep(sleep_time)
        except Exception as e:
            print(f"Background campaign error at lead {lead_id}: {e}")

@app.post("/api/campaign/run")
def start_campaign(payload: List[int], background_tasks: BackgroundTasks):
    if not payload:
        raise HTTPException(status_code=400, detail="No leads selected for campaign")
    background_tasks.add_task(run_campaign_background, payload)
    return {"status": "started", "message": f"Campaign launched in background for {len(payload)} leads."}

@app.post("/api/unsubscribe")
def handle_unsubscribe(email: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE leads SET status = 'unsubscribed' WHERE email = ?", (email.strip().lower(),))
    conn.commit()
    conn.close()
    return {"message": f"Successfully unsubscribed {email}"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
