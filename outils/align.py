import zipfile, sys
src, dst = sys.argv[1], sys.argv[2]
zi = zipfile.ZipFile(src); zo = zipfile.ZipFile(dst, 'w')
for i in zi.infolist():
    data = zi.read(i.filename)
    n = zipfile.ZipInfo(i.filename, date_time=i.date_time); n.compress_type = i.compress_type; n.external_attr = i.external_attr
    if i.compress_type == zipfile.ZIP_STORED:
        hdr = zo.fp.tell() + 30 + len(i.filename.encode())
        pad = (4 - hdr % 4) % 4
        n.extra = b'\x00' * pad if pad == 0 else (b'\xd9\x35' + (pad + 2).to_bytes(2,'little') + b'\x00'*(pad+2)) if pad >= 0 else b''
        # recompute with extra header (4 bytes + payload) so that total extra makes data aligned
        need = (4 - (hdr) % 4) % 4
        n.extra = b'' if need == 0 else b'\xd9\x35' + (need + 4 - 4 + 4 - 4).to_bytes(2,'little')  # placeholder, fixed below
        tot = need if need >= 4 else need + 4 if need else 0
        n.extra = b'' if tot == 0 else b'\xd9\x35' + (tot - 4).to_bytes(2,'little') + b'\x00' * (tot - 4)
    zo.writestr(n, data)
zo.close()
zc = zipfile.ZipFile(dst); bad = 0
for i in zc.infolist():
    if i.compress_type == 0:
        zc.fp.seek(i.header_offset); h = zc.fp.read(30); nl = int.from_bytes(h[26:28],'little'); el = int.from_bytes(h[28:30],'little')
        if (i.header_offset + 30 + nl + el) % 4: bad += 1
print('misaligned stored entries:', bad)
