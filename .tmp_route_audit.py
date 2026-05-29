from pathlib import Path

root = Path('app')
route_set = set()
for p in sorted(root.rglob('*.tsx')):
    parts = list(p.relative_to(root).parts)
    if parts[0].startswith('('):
        route = '/' + '/'.join(parts[1:])
    else:
        route = '/' + '/'.join(parts)
    route = route.replace('//', '/')
    route_set.add(route)

refs = []
for p in sorted(Path('.').rglob('*.tsx')):
    text = p.read_text(errors='ignore')
    for delim in ("'", '"'):
        start = 0
        while True:
            idx = text.find(delim, start)
            if idx == -1:
                break
            if idx + 1 < len(text) and text[idx+1] == '/':
                end = text.find(delim, idx+2)
                if end != -1:
                    refs.append((str(p), text[idx+1:end]))
                    start = end + 1
                    continue
            start = idx + 1

bad = [r for r in refs if r[1] not in route_set]
print('COUNT ROUTES', len(route_set))
print('COUNT HREFS', len(refs))
print('COUNT BAD', len(bad))
for b in bad:
    print(b)
