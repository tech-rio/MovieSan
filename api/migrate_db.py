import sqlite3
import os

db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "movies.db")
conn = sqlite3.connect(db_path)
cur = conn.cursor()

try:
    cur.execute("ALTER TABLE download_links ADD COLUMN is_dead INTEGER DEFAULT 0")
    print("Added is_dead column")
except sqlite3.OperationalError as e:
    print(f"is_dead column already exists or error: {e}")

try:
    cur.execute("ALTER TABLE download_links ADD COLUMN last_checked_at TEXT DEFAULT NULL")
    print("Added last_checked_at column")
except sqlite3.OperationalError as e:
    print(f"last_checked_at column already exists or error: {e}")

conn.commit()
conn.close()
print("Migration complete.")
