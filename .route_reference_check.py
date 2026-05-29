from pathlib import Path
import re

root = Path('app')

# Build set of valid route references using actual file paths and expo-router path style
valid_paths = set()
for p in sorted(root.rglob('*.tsx')):
    rel = p.relative_to(root)
    parts = list(rel.parts)
    if parts[0].startswith('('):
        group = parts[0]
        path_parts = [group] + parts[1:]
    else:
        path_parts = parts
    # route style: /(group)/... or /path
    if parts[0].startswith('('):
        route = '/' + '/'.join(path_parts)
    else:
        route = '/' + '/'.join(path_parts)
    route = route.replace('\\', '/')
    valid_paths.add(route)
    # index route alias for group roots
    if len(parts) == 2 and parts[1] == 'index.tsx':
        valid_paths.add('/' + parts[0])
    elif len(parts) == 1 and parts[0] == 'index.tsx':
        valid_paths.add('/')

# Normalize valid paths for matches without extension
normalized = set()
for path in valid_paths:
    normalized.add(path)
    if path.endswith('/index.tsx'):
        normalized.add(path[:-len('/index.tsx')])
    if path.endswith('/_layout.tsx'):
        normalized.add(path[:-len('/_layout.tsx')])

# Search references in .tsx and .ts files excluding node_modules
refs = []
for p in sorted(Path('.').rglob('*.[tT][sx]')):
    if 'node_modules' in p.parts or p.suffix == '.d.ts':
        continue
    text = p.read_text(errors='ignore')
    for m in re.finditer(r'\b(?:router\.push|router\.replace|Link\s+href|Redirect\s+href|href\s*=|navigate\()\s*["\"](/[^"\"]*)["\"]', text):
        refs.append((str(p), m.group(1)))

bad = []
for file, target in refs:
    candidate = target
    if candidate.endswith('/'):
        candidate = candidate[:-1]
    if candidate == '':
        candidate = '/'
    if candidate not in normalized:
        bad.append((file, target))

print('VALID ROUTES', len(normalized))
print('NAV REFS', len(refs))
print('BAD REFS', len(bad))
for b in bad:
    print(b)
