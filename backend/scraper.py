import re
import time
import random
from bs4 import BeautifulSoup
from urllib.parse import quote_plus

# Selenium Imports
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

EMAIL_REGEX = r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"

def get_chrome_driver():
    """Initializes a Chrome browser driver using Selenium."""
    chrome_options = Options()
    
    # Visible, interactive Chrome browser so the user can see it run and solve CAPTCHAs if needed
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--start-maximized")
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")
    
    # Set a common user agent to appear as a normal desktop browser
    chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
    
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_experimental_option('useAutomationExtension', False)
    
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    
    driver.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {
        "source": "Object.defineProperty(navigator, 'webdriver', {get: () => undefined})"
    })
    
    return driver

def extract_emails_from_text(text):
    """Finds all emails in a block of text using regular expressions."""
    if not text:
        return []
    emails = re.findall(EMAIL_REGEX, text)
    valid_emails = []
    for email in emails:
        email_lower = email.lower()
        if not any(email_lower.endswith(ext) for ext in [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"]):
            valid_emails.append(email.strip().lower())
    return list(set(valid_emails))

def google_search_scraper(query, num_results=20, simulate=False):
    """
    Launches a real visible Chrome browser, searches Google, and extracts emails.
    Uses human-simulated search typing and scrolling inputs to bypass bot detection.
    """
    driver = None
    leads = []
    
    try:
        driver = get_chrome_driver()
        print("[Selenium] Navigating to Google homepage...")
        driver.get("https://www.google.com")
        
        # Human-like delay after landing
        time.sleep(random.uniform(2.5, 4.0))
        
        # Locate search input field
        print(f"[Selenium] Slowly typing search query (stealth typing): {query}")
        search_input = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.NAME, "q"))
        )
        
        # Clear search input slowly
        search_input.clear()
        time.sleep(random.uniform(0.5, 1.0))
        
        # Slow typing simulation
        for char in query:
            search_input.send_keys(char)
            time.sleep(random.uniform(0.04, 0.20))
            
        time.sleep(random.uniform(0.8, 1.5))
        
        # Submit the query
        search_input.send_keys(Keys.RETURN)
        
        # Let search result load
        print("[Selenium] Search query submitted. Waiting for results...")
        WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )
        
        # Dynamic CAPTCHA check
        page_source_lower = driver.page_source.lower()
        title_lower = driver.title.lower()
        if "unusual traffic" in title_lower or "captcha" in page_source_lower or "recaptcha" in page_source_lower:
            print("\n[STEALTH WARNING] Google has triggered a CAPTCHA challenge.")
            print("[STEALTH ACTION] Please solve the CAPTCHA inside the visible Chrome browser window now to continue the extraction session...\n")
            # Wait up to 90 seconds for manual resolution
            solved = False
            for elapsed in range(45):
                time.sleep(2.0)
                current_title = driver.title.lower()
                current_source = driver.page_source.lower()
                if "unusual traffic" not in current_title and "captcha" not in current_source and "recaptcha" not in current_source:
                    print("[STEALTH SUCCESS] CAPTCHA solved successfully! Resuming extraction pipeline...")
                    solved = True
                    break
            if not solved:
                print("[STEALTH ERROR] CAPTCHA solve timeout. Proceeding with raw HTML contents.")
                
        # Scroll down in randomized human steps to trigger rendering of lazy results
        print("[Selenium] Simulating human reading scroll movements...")
        for step in range(3):
            scroll_amt = (step + 1) * 350
            driver.execute_script(f"window.scrollTo(0, {scroll_amt});")
            time.sleep(random.uniform(1.8, 3.5))
            
        pages_scraped = 0
        max_pages = max(1, (num_results // 10) + 1)
        serp_emails = []
        discovered_targets = []
        
        while pages_scraped < max_pages:
            print(f"\n[Selenium] Extracting search results from Page {pages_scraped + 1}...")
            
            # Extract page source
            html = driver.page_source
            soup = BeautifulSoup(html, 'html.parser')
            
            # 1. BULK EMAIL HARVESTING FROM SERP TEXT OF CURRENT PAGE
            raw_text = soup.get_text()
            page_serp_emails = extract_emails_from_text(raw_text)
            serp_emails.extend(page_serp_emails)
            print(f"[Selenium] Extracted {len(page_serp_emails)} emails directly from Page {pages_scraped + 1} SERP text.")
            
            # 2. ROBUST SEARCH RESULT EXTRACTION
            h3_elements = soup.find_all("h3")
            page_targets = []
            
            for h3 in h3_elements:
                title = h3.get_text().strip()
                a_tag = h3.find_parent("a")
                if not a_tag or not a_tag.get("href"):
                    a_tag = h3.select_one("a") or h3.find_next("a")
                    
                if not a_tag or not a_tag.get("href"):
                    continue
                    
                url = a_tag['href']
                if not url.startswith("http") or "google.com" in url:
                    continue
                    
                parent_container = h3.find_parent("div", class_="g") or h3.find_parent("div")
                snippet = ""
                if parent_container:
                    snippet = parent_container.get_text().replace(title, "").strip()
                    
                # Clean name
                name = title.split("•")[0].split("(@")[0].strip()
                if "Instagram" in name:
                    name = name.replace("Instagram", "").strip()
                if not name or name.lower() in ["login", "instagram", "photos", "video"]:
                    name = "Creator"
                    
                page_targets.append({
                    "url": url,
                    "name": name,
                    "snippet": snippet
                })
                
            print(f"[Selenium] Discovered {len(page_targets)} potential profiles on Page {pages_scraped + 1}.")
            discovered_targets.extend(page_targets)
            
            # 3. MAP EXTRACTED EMAILS AND CRAWL CURRENT PAGE TARGETS
            for target in page_targets:
                emails_in_snippet = extract_emails_from_text(target["snippet"])
                
                # Check for SERP bulk email overlap
                for email in page_serp_emails:
                    if email in target["snippet"].lower() or email in target["url"].lower():
                        emails_in_snippet.append(email)
                        
                emails_in_snippet = list(set(emails_in_snippet))
                
                if emails_in_snippet:
                    for email in emails_in_snippet:
                        leads.append({
                            "email": email,
                            "source_url": target["url"],
                            "name": target["name"],
                            "query": query,
                            "snippet": target["snippet"][:200]
                        })
                else:
                    # Navigate directly to profile page to harvest emails!
                    print(f"[Selenium] Navigating directly to profile page: {target['url']}")
                    try:
                        current_search_url = driver.current_url
                        driver.get(target["url"])
                        time.sleep(random.uniform(3.0, 5.0))
                        
                        page_html = driver.page_source
                        page_soup = BeautifulSoup(page_html, 'html.parser')
                        for script in page_soup(["script", "style"]):
                            script.decompose()
                        page_text = page_soup.get_text()
                        page_emails = extract_emails_from_text(page_text)
                        
                        for link in page_soup.find_all('a', href=True):
                            href = link['href']
                            if href.startswith('mailto:'):
                                email = href.replace('mailto:', '').split('?')[0].strip()
                                if re.match(EMAIL_REGEX, email):
                                    page_emails.append(email.lower())
                                    
                        page_emails = list(set(page_emails))
                        if page_emails:
                            print(f"[Selenium] Discovered emails on page: {page_emails}")
                            for email in page_emails:
                                leads.append({
                                    "email": email,
                                    "source_url": target["url"],
                                    "name": target["name"],
                                    "query": query,
                                    "snippet": f"Directly harvested from page source. {target['snippet'][:100]}"
                                })
                        
                        # Return to search results offset url safely
                        driver.get(current_search_url)
                        WebDriverWait(driver, 15).until(EC.presence_of_element_located((By.TAG_NAME, "body")))
                        time.sleep(random.uniform(1.5, 2.5))
                    except Exception as ex:
                        print(f"[Selenium] Error loading target URL {target['url']}: {ex}")
                        try:
                            driver.get(current_search_url)
                            WebDriverWait(driver, 15).until(EC.presence_of_element_located((By.TAG_NAME, "body")))
                        except:
                            pass
                        continue
            
            # Check unique leads count
            unique_leads = len(set(l["email"] for l in leads))
            print(f"[Selenium] Unique leads collected so far: {unique_leads}")
            if unique_leads >= num_results:
                print(f"[Selenium] Reached target leads count ({num_results}). Terminating pagination loop.")
                break
                
            # If not reached target, let's look for "Next" pagination button
            pages_scraped += 1
            if pages_scraped >= max_pages:
                break
                
            print("[Selenium] Attempting to navigate to next Google search results page...")
            next_button = None
            for selector in [
                (By.ID, "pnnext"),
                (By.CSS_SELECTOR, "a[aria-label='Next page']"),
                (By.XPATH, "//a[span[contains(text(), 'Next')]]"),
                (By.XPATH, "//a[contains(text(), 'Next')]"),
                (By.PARTIAL_LINK_TEXT, "Next")
            ]:
                try:
                    btn = driver.find_element(*selector)
                    if btn and btn.is_displayed():
                        next_button = btn
                        break
                except:
                    continue
                    
            if next_button:
                # Scroll to button and click it
                driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", next_button)
                time.sleep(random.uniform(1.0, 2.0))
                
                try:
                    next_button.click()
                except:
                    driver.execute_script("arguments[0].click();", next_button)
                    
                print("[Selenium] Navigating to next page...")
                time.sleep(random.uniform(4.5, 7.0))
                
                # Check for CAPTCHA on page change
                page_source_lower = driver.page_source.lower()
                title_lower = driver.title.lower()
                if "unusual traffic" in title_lower or "captcha" in page_source_lower or "recaptcha" in page_source_lower:
                    print("\n[STEALTH WARNING] Google has triggered a CAPTCHA challenge on page navigation.")
                    print("[STEALTH ACTION] Please solve the CAPTCHA inside the visible Chrome browser window now to continue the extraction session...\n")
                    solved = False
                    for elapsed in range(45):
                        time.sleep(2.0)
                        current_title = driver.title.lower()
                        current_source = driver.page_source.lower()
                        if "unusual traffic" not in current_title and "captcha" not in current_source and "recaptcha" not in current_source:
                            print("[STEALTH SUCCESS] CAPTCHA solved! Resuming extraction...")
                            solved = True
                            break
                    if not solved:
                        print("[STEALTH ERROR] CAPTCHA solve timeout. Proceeding with raw HTML contents.")
            else:
                print("[Selenium] No \"Next\" button detected. Reached end of Google index.")
                break
                    
    except Exception as e:
        print(f"[Selenium] Critical Search Error: {e}")
    finally:
        if driver:
            print("[Selenium] Terminating Chrome automated session.")
            driver.quit()
            
    # Deduplicate matching results
    seen_emails = set()
    deduped_leads = []
    for lead in leads:
        if lead["email"] not in seen_emails:
            seen_emails.add(lead["email"])
            deduped_leads.append(lead)
            
    # If leads is empty, try to match any bulk SERP emails with found URLs as fallback
    if not deduped_leads and serp_emails and discovered_targets:
        print("[Selenium] Fallback: Associating SERP emails to discovered links...")
        for i, email in enumerate(serp_emails):
            if i < len(discovered_targets):
                target = discovered_targets[i]
                deduped_leads.append({
                    "email": email,
                    "source_url": target["url"],
                    "name": target["name"],
                    "query": query,
                    "snippet": "Associated via SERP fallback parsing."
                })
                
    print(f"[Selenium] Extraction complete. Discovered {len(deduped_leads)} valid leads.")
    return deduped_leads

if __name__ == "__main__":
    test_query = 'site:instagram.com "ugc" "travel" "gmail.com"'
    results = google_search_scraper(test_query, num_results=5)
    print(f"Successfully scraped {len(results)} leads.")
    for r in results:
        print(f"- {r['name']} ({r['email']}) from {r['source_url']}")
