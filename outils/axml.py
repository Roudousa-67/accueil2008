import struct, sys
src, dst = sys.argv[1], sys.argv[2]
b = bytearray(open(src,'rb').read())
assert struct.unpack_from('<H', b, 0)[0] == 3
off = 8
t, hs, sz, cnt, scnt, flags, sstart, stystart = struct.unpack_from('<HHIIIIII', b, off)
assert t == 1
utf8 = bool(flags & 0x100)
offs = struct.unpack_from('<%dI' % cnt, b, off + hs)
def getstr(i):
    p = off + sstart + offs[i]
    if utf8:
        n = b[p]; p += 1
        if n & 0x80: p += 1
        n2 = b[p]; p += 1
        if n2 & 0x80: n2 = ((n2 & 0x7f) << 8) | b[p]; p += 1
        return b[p:p+n2].decode('utf8'), p, 'u8'
    n = struct.unpack_from('<H', b, p)[0]; p += 2
    return b[p:p+n*2].decode('utf-16le'), p, 'u16'
strs = [getstr(i)[0] for i in range(cnt)]
iCode = strs.index('versionCode'); iName = strs.index('versionName')
# walk chunks
p = off + sz
done = 0
while p < len(b):
    ct, chs, csz = struct.unpack_from('<HHI', b, p)
    if ct == 0x0102:
        ns, name, astart, asize, acount = struct.unpack_from('<IIHHH', b, p + 16)
        if strs[name] == 'manifest':
            for k in range(acount):
                a = p + 16 + astart + k * asize
                ans, aname, raw, tsize, res0, dtype, data = struct.unpack_from('<IIIHBBI', b, a)
                if aname == iCode:
                    print('versionCode', data, '->', sys.argv[4]); struct.pack_into('<I', b, a + 16, int(sys.argv[4])); done += 1
                if aname == iName:
                    s, sp, enc = getstr(raw); print('versionName', s)
                    assert len(s) == len(sys.argv[3]), s
                    new = sys.argv[3]
                    b[sp:sp+len(new)*(1 if enc=='u8' else 2)] = new.encode('utf8' if enc=='u8' else 'utf-16le'); done += 1
            break
    p += csz
assert done == 2
open(dst,'wb').write(b)
