import os
from huey import SqliteHuey, crontab

# Use a sqlite database for the task queue to avoid needing Redis
db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "huey.db")

huey = SqliteHuey(filename=db_path)

@huey.task()
def run_spider_task(max_pages: int = 0):
    from scheduler import run_spider
    run_spider(max_pages)

@huey.periodic_task(crontab(hour='0,12', minute='0'))
def scheduled_crawl():
    """Run the spiders periodically every 12 hours."""
    from scheduler import run_spider
    run_spider(0)

@huey.periodic_task(crontab(minute='0'))
def check_dead_links():
    """Run every hour to verify a batch of download links."""
    import sqlite3
    import httpx
    from datetime import datetime, timezone
    from concurrent.futures import ThreadPoolExecutor
    
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "movies.db")
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    # Get oldest 200 unchecked links or links checked long ago
    cur.execute("""
        SELECT id, url FROM download_links 
        WHERE is_dead = 0
        ORDER BY last_checked_at ASC NULLS FIRST
        LIMIT 200
    """)
    links = cur.fetchall()
    
    if not links:
        conn.close()
        return

    dead_ids = []
    checked_ids = []
    now = datetime.now(timezone.utc).isoformat()
    
    def check_link(row):
        link_id, url = row
        try:
            # Fake User-Agent to avoid 403s on file hosts
            headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0.0.0"}
            with httpx.Client(follow_redirects=True, timeout=10.0) as client:
                res = client.head(url, headers=headers)
                
                # 404 Not Found, 410 Gone means dead.
                if res.status_code in [404, 410]:
                    dead_ids.append(link_id)
        except Exception:
            # Connection errors, timeouts can also imply dead links or strict blocks
            dead_ids.append(link_id)
        
        checked_ids.append(link_id)

    with ThreadPoolExecutor(max_workers=10) as pool:
        pool.map(check_link, links)

    # Update DB
    if dead_ids:
        placeholders = ",".join("?" * len(dead_ids))
        cur.execute(
            f"UPDATE download_links SET is_dead = 1 WHERE id IN ({placeholders})",
            dead_ids
        )
    
    if checked_ids:
        placeholders = ",".join("?" * len(checked_ids))
        cur.execute(
            f"UPDATE download_links SET last_checked_at = ? WHERE id IN ({placeholders})",
            [now] + checked_ids
        )
        
    conn.commit()
    conn.close()

