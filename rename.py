import os, re
ignore_dirs = ['.git', 'node_modules', '.venv', 'dist', '__pycache__']
ignore_exts = ['.db', '.db-wal', '.db-shm', '.sqlite', '.sqlite3', '.png', '.jpg', '.ico', '.svg', '.json']
for root, dirs, files in os.walk('.'):
    dirs[:] = [d for d in dirs if d not in ignore_dirs]
    for file in files:
        if any(file.endswith(ext) for ext in ignore_exts): continue
        path = os.path.join(root, file)
        try:
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Special case for Header
            if 'Header.tsx' in path:
                content = content.replace('MOVIES<span className="text-primary">ALERT</span>', 'MOVIE<span className="text-primary">SAN</span>')
            
            # Replace MovieSan (case-insensitive) -> MovieSan
            # Wait, if we want to preserve some casing, we could do a function, 
            # but user just said "change everyMovieSan to MovieSan".
            # To be safe and look nice, we do case-insensitive replace to MovieSan.
            # But let's uppercase it if it was all caps originally? No, MovieSan is fine.
            new_content = re.sub(r'(?i)MovieSan', 'MovieSan', content)
            
            if new_content != content:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f'Updated {path}')
        except UnicodeDecodeError:
            pass
