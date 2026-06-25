from tasks import check_dead_links
import sqlite3
import os

print("Running check_dead_links()...")
check_dead_links()

db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "movies.db")
conn = sqlite3.connect(db_path)
cur = conn.cursor()
dead_count = cur.execute("SELECT COUNT(*) FROM download_links WHERE is_dead = 1").fetchone()[0]
checked_count = cur.execute("SELECT COUNT(*) FROM download_links WHERE last_checked_at IS NOT NULL").fetchone()[0]

print(f"Dead links found: {dead_count}")
print(f"Total links checked: {checked_count}")
conn.close()
