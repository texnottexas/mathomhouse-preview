"""
Rewrite root-relative paths for subdirectory GitHub Pages deployment.

The source uses root-relative paths like /styles/index.css that work at root.
When deployed to /mathomhouse-preview/ they need the subdirectory prefix.
External https:// URLs are left untouched.
"""
import os
import re

SUBDIR = "/mathomhouse-preview"
EXTS = {'.html', '.js', '.css'}
SKIP_DIRS = {'.git', '.github', 'EnigmaDominators', 'domainmaps', 'old files', 'archive'}

patterns = [
    # href="/... src="/... action="/... — but not href="https://
    (re.compile(r'((?:href|src|action)=["\'])\/(?![/a-z]+://)'), r'\g<1>' + SUBDIR + '/'),
    # fetch('/... or fetch("/...
    (re.compile(r"(fetch\(['\"])\/(?![/a-z]+://)"), r'\g<1>' + SUBDIR + '/'),
    # JS string: '/styles/...', '/images/...', '/header.html', '/cutelogo...'
    (re.compile(r"(['\"])\/(styles|images|scripts|header\.html|cutelogo)([^'\"]*['\"])"),
     r'\g<1>' + SUBDIR + r'/\g<2>\g<3>'),
]

changed = 0
for root, dirs, files in os.walk('.'):
    dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
    for fname in files:
        if os.path.splitext(fname)[1].lower() not in EXTS:
            continue
        fpath = os.path.join(root, fname)
        try:
            with open(fpath, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
        except Exception:
            continue
        orig = content
        for pat, repl in patterns:
            content = pat.sub(repl, content)
        if content != orig:
            with open(fpath, 'w', encoding='utf-8') as f:
                f.write(content)
            changed += 1
            print(f'  patched: {fpath}')

print(f'Total files patched: {changed}')
