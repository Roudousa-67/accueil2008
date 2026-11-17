import zipfile, sys, os
NATIVE = os.environ.get('ACCUEIL_NATIVE_DEX') or os.path.join(os.path.dirname(os.path.abspath(__file__)), 'classes3.dex')
orig, out = sys.argv[1], sys.argv[2]
SRC = sys.argv[3] if len(sys.argv) > 3 else '/home/claude/src'
zi = zipfile.ZipFile(orig); zo = zipfile.ZipFile(out, 'w'); seen = set()
def add(name, data, ctype):
    n = zipfile.ZipInfo(name, date_time=(2026, 11, 8, 12, 0, 0)); n.compress_type = ctype; zo.writestr(n, data); seen.add(name)
for i in zi.infolist():
    if i.filename.startswith('META-INF/'): continue
    if i.filename == 'classes3.dex' and os.path.isfile(NATIVE): data = open(NATIVE, 'rb').read()
    elif i.filename == 'AndroidManifest.xml': data = open(sys.argv[4] if len(sys.argv) > 4 else '/home/claude/src_manifest.xml', 'rb').read()
    elif i.filename.startswith('assets/'):
        if not os.path.exists(os.path.join(SRC, i.filename[7:])): print('-', i.filename); continue   # supprimé des sources : ne pas le recopier
        data = open(os.path.join(SRC, i.filename[7:]), 'rb').read()
    else: data = zi.read(i.filename)
    add(i.filename, data, i.compress_type)
for root, _, files in os.walk(SRC):
    for f in sorted(files):
        rel = os.path.relpath(os.path.join(root, f), SRC); name = 'assets/' + rel.replace(os.sep, '/')
        if name in seen: continue
        ext = f.rsplit('.', 1)[-1].lower()
        add(name, open(os.path.join(root, f), 'rb').read(), zipfile.ZIP_STORED if ext in ('webp', 'jpg', 'png', 'woff2', 'glb') else zipfile.ZIP_DEFLATED)
        print('+', name)
zo.close()
