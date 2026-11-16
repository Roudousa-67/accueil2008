// Voiture en 3D (three.js r147). Modèle « 2018 Peugeot 2008 » par tonielpro520 (Sketchfab), licence CC BY 4.0,
// simplifié, repeint (blanc nacré, toit et jantes noirs, calandre noire) et plaques EK-188-XR ajoutées.
(function () {
  const C3 = {};
  const DEF_YAW = -0.72;            // trois-quarts avant gauche
  const FOCUS = { rear: Math.PI - 0.6, left: -1.45, right: 1.45 };
  const ROAD_YAW = Math.PI;         // en roulant : vue de derrière, la voiture part sur la route
  let ring = null, accent = '#3B82F6';
  let R, S, cam, root, canvas, slot = null, state = 'off', yaw = DEF_YAW, target = null, vel = 0, drag = null, raf = 0;
  let wheels = [], speed = 0, lastT = 0, lastUser = 0, focus = null, bob = 0, w0 = 0, h0 = 0;

  C3.supported = function () {
    try { const c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl'))); } catch (e) { return false; }
  };

  function plateTexture() {
    const W = 1040, H = 220, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
    g.fillStyle = '#F6F6F4'; g.fillRect(0, 0, W, H);
    g.fillStyle = '#003399'; g.fillRect(6, 6, 108, H - 12); g.fillRect(W - 114, 6, 108, H - 12);
    g.fillStyle = '#FFCC00'; for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6; g.beginPath(); g.arc(60 + 30 * Math.cos(a), 66 + 30 * Math.sin(a), 5, 0, 7); g.fill(); }
    g.fillStyle = '#fff'; g.font = 'bold 60px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('F', 60, 170);
    g.fillStyle = '#111'; g.font = 'bold 150px "DejaVu Sans Condensed", "Roboto Condensed", Arial Narrow, sans-serif';
    g.save(); g.translate(W / 2, H / 2 + 6); const tw = g.measureText('EK-188-XR').width; const k = Math.min(1, 760 / tw); g.scale(k, 1); g.fillText('EK-188-XR', 0, 0); g.restore();
    g.strokeStyle = '#222'; g.lineWidth = 6; g.strokeRect(3, 3, W - 6, H - 6);
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; return t;
  }

  function shadowTexture() {
    const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
    const gr = g.createRadialGradient(128, 128, 10, 128, 128, 128); gr.addColorStop(0, 'rgba(0,0,0,.75)'); gr.addColorStop(.55, 'rgba(0,0,0,.35)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 256, 256); return new THREE.CanvasTexture(c);
  }

  // couleur par zone (toit noir, calandre noire) : calcul dans le shader selon la position
  function zoneTint(mat, glsl) {
    mat.onBeforeCompile = (sh) => {
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vPos3;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvPos3 = position;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vPos3;').replace('#include <color_fragment>', '#include <color_fragment>\n' + glsl);
    };
  }

  // sépare une géométrie en groupes de triangles. pick(cx,cy,cz) -> n° de groupe ou -1 (reste fixe)
  function splitGeo(mesh, ngroups, pick, recenter) {
    const g = mesh.geometry, idx = g.index, pos = g.attributes.position;
    const vi = (k) => (idx ? idx.getX(k) : k);
    const n = (idx ? idx.count : pos.count) / 3, groups = []; for (let i = 0; i <= ngroups; i++) groups.push([]);
    for (let t = 0; t < n; t++) {
      let cx = 0, cy = 0, cz = 0; for (let j = 0; j < 3; j++) { const v = vi(t * 3 + j); cx += pos.getX(v); cy += pos.getY(v); cz += pos.getZ(v); }
      const k = pick(cx / 3, cy / 3, cz / 3); groups[k < 0 ? ngroups : k].push(t);
    }
    return groups.map((tris, gi) => {
      if (!tris.length) return null;
      const ng = new THREE.BufferGeometry();
      Object.keys(g.attributes).forEach((name) => {
        const a = g.attributes[name], sz = a.itemSize, arr = new Float32Array(tris.length * 3 * sz), get = [a.getX, a.getY, a.getZ, a.getW];
        tris.forEach((t, i) => { for (let j = 0; j < 3; j++) { const v = vi(t * 3 + j); for (let c = 0; c < sz; c++) arr[(i * 3 + j) * sz + c] = get[c].call(a, v); } });
        ng.setAttribute(name, new THREE.BufferAttribute(arr, sz, false));
      });
      const m = new THREE.Mesh(ng, mesh.material);
      if (gi < ngroups && recenter) { const c = recenter[gi]; ng.translate(-c.x, -c.y, -c.z); m.position.copy(c); }
      return m;
    });
  }

  function load(onOk, onErr) {
    const x = new XMLHttpRequest(); x.open('GET', 'car/2008.glb'); x.responseType = 'arraybuffer';
    x.onload = () => { if (!x.response || (x.status && x.status !== 200 && x.status !== 0)) return onErr('http ' + x.status); try { new THREE.GLTFLoader().parse(x.response, '', onOk, onErr); } catch (e) { onErr(e); } };
    x.onerror = () => onErr('xhr'); x.send();
  }

  function build(gltf) {
    root = new THREE.Group(); const src = gltf.scene; src.updateMatrixWorld(true);
    // on « aplatit » le modèle : chaque pièce dans le repère du monde (Y en haut, avant vers +Z)
    const car = new THREE.Group(); const list = []; src.traverse((o) => { if (o.isMesh) list.push(o); });
    list.forEach((o) => { const g = o.geometry.clone(); g.applyMatrix4(o.matrixWorld); const m = new THREE.Mesh(g, o.material); car.add(m); });
    root.add(car); car.updateMatrixWorld(true);
    const mats = {}; const wheelMeshes = [];
    car.traverse((o) => { if (o.isMesh) { const n = o.material.name; mats[n] = o.material; if (/^Carro_(Roda|Roda_1|Pneu|Freio_Disco)$/.test(n)) { o.userData.n = n; wheelMeshes.push(o); } } });
    const phys = (o) => new THREE.MeshPhysicalMaterial(Object.assign({ name: 'x' }, o));
    const paint = phys({ color: 0xF3F2EE, metalness: 0.15, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.08, sheen: 0.4, sheenColor: new THREE.Color(0xE8E2FF), sheenRoughness: 0.5 });
    zoneTint(paint, 'if (vPos3.y > 1.47) diffuseColor.rgb = vec3(0.012);');                       // toit noir
    const chrome = phys({ color: 0x8A8E95, metalness: 0.9, roughness: 0.3, envMapIntensity: 0.6 });
    zoneTint(chrome, 'if (vPos3.y > 1.45 || (vPos3.y < 0.75 && abs(vPos3.z) < 1.75) || (vPos3.y < 0.62 && !(abs(vPos3.x) < 0.55 && vPos3.y < 0.42)) || (vPos3.z > 1.80 && vPos3.y > 0.62 && vPos3.y < 0.98 && abs(vPos3.x) < 0.62)) diffuseColor.rgb = vec3(0.03);'); // barres de toit, bas de caisse, calandre : noirs // calandre GT Line
    const plastic = new THREE.MeshStandardMaterial({ color: 0x0A0A0B, roughness: 0.7, metalness: 0, envMapIntensity: 0.25 });
    const rim = phys({ color: 0x050506, metalness: 0.5, roughness: 0.35, clearcoat: 0.5, clearcoatRoughness: 0.2, envMapIntensity: 0.45 });
    car.traverse((o) => {
      if (!o.isMesh) return; const n = o.material.name;
      if (n === 'Carro_Pintura') o.material = paint;
      else if (n === 'Carro_Cromado') o.material = chrome;
      else if (n === 'Carro_Roda' || n === 'Carro_Roda_1') o.material = rim;
      else if (n === 'Carro_Plastico' || n === 'Carro_Plastico_1') o.material = plastic;
      else if (n === 'Carro_Vidros') { o.material.roughness = 0.04; o.material.metalness = 0.4; o.material.opacity = 0.82; o.material.color.setHex(0x030405); zoneTint(o.material, 'if (vPos3.y > 1.50) diffuseColor = vec4(0.006, 0.006, 0.007, 1.0);'); }
    });
    if (!mats.Carro_Pintura) { // nouveau modèle (scan complet, déjà texturé) : on l'affiche tel quel
      const sh0 = new THREE.Mesh(new THREE.PlaneGeometry(2.9, 5.0), new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false }));
      sh0.rotation.x = -Math.PI / 2; sh0.position.y = 0.005; root.add(sh0); S.add(root); return;
    }
    // centres des 4 roues à partir des jantes
    const quad = (x, y, z) => (x > 0 ? 1 : 0) + (z > 0 ? 2 : 0);
    const rimMesh = wheelMeshes.find((m) => m.userData.n === 'Carro_Roda');
    const centers = [0, 1, 2, 3].map(() => new THREE.Box3());
    if (rimMesh) splitGeo(rimMesh, 4, quad).forEach((m, i) => { if (m && i < 4) { m.geometry.computeBoundingBox(); centers[i] = m.geometry.boundingBox; } });
    const C = centers.map((b) => { const v = new THREE.Vector3(); b.getCenter(v); return v; });
    const R = centers.map((b) => { const v = new THREE.Vector3(); b.getSize(v); return Math.max(v.y, v.z) / 2; });
    const inWheel = (x, y, z) => { const q = quad(x, y, z), c = C[q]; if (!c || !R[q]) return -1; return Math.abs(x - c.x) < 0.24 && Math.hypot(y - c.y, z - c.z) < R[q] * 1.38 ? q : -1; };
    wheelMeshes.forEach((m) => {
      splitGeo(m, 4, inWheel, C).forEach((p, i) => {
        if (!p) return;
        if (i < 4) { car.add(p); wheels.push(p); }
        else { if (m.userData.n === 'Carro_Pneu') p.material = plastic; car.add(p); } // le reste du « pneu » = passages de roue et bas de caisse
      });
      car.remove(m);
    });
    // plaques
    const pm = new THREE.MeshStandardMaterial({ map: plateTexture(), roughness: 0.45, metalness: 0, polygonOffset: true, polygonOffsetFactor: -2 });
    const pg = new THREE.PlaneGeometry(0.60, 0.127);
    const pf = new THREE.Mesh(pg, pm); pf.position.set(0, PLATE.f[0], PLATE.f[1]); pf.rotation.x = PLATE.f[2]; root.add(pf);
    const pr = new THREE.Mesh(pg, pm); pr.position.set(0, PLATE.r[0], PLATE.r[1]); pr.rotation.set(PLATE.r[2], Math.PI, 0); root.add(pr);
    // ombre au sol
    const sh = new THREE.Mesh(new THREE.PlaneGeometry(2.9, 5.0), new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false }));
    sh.rotation.x = -Math.PI / 2; sh.position.y = 0.005; root.add(sh);
    // (pas de plateau : juste la voiture et son ombre)
    S.add(root);
  }
  const PLATE = { f: [0.47, 2.112, -0.08], r: [0.86, -2.06, 0.12] };
  C3.PLATE = PLATE;

  C3.init = function () {
    if (state !== 'off') return;
    if (!window.THREE || !THREE.GLTFLoader || !C3.supported()) { state = 'fail'; return; }
    state = 'loading';
    try {
      R = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
      R.outputEncoding = THREE.sRGBEncoding; R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.05; R.setClearColor(0x000000, 0);
      canvas = R.domElement; canvas.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;touch-action:none;opacity:0;transition:opacity .5s';
      S = new THREE.Scene(); const pm = new THREE.PMREMGenerator(R); S.environment = pm.fromScene(new THREE.RoomEnvironment(), 0.04).texture;
      const sun = new THREE.DirectionalLight(0xffffff, 0.9); sun.position.set(-3, 6, 4); S.add(sun);
      cam = new THREE.PerspectiveCamera(26, 16 / 9, 0.5, 60);
      bindTouch();
    } catch (e) { state = 'fail'; return; }
    load((g) => { try { build(g); state = 'ready'; canvas.style.opacity = '1'; const im = slot && slot.querySelector('img'); if (im) im.style.opacity = '0'; resize(); kick(); } catch (e) { console.log('car3d', e); state = 'fail'; } },
      (e) => { console.log('car3d load', e); state = 'fail'; });
  };

  function resize() {
    if (!R || !slot) return; const w = slot.clientWidth, h = slot.clientHeight; if (!w || !h) return;
    if (w === w0 && h === h0) return; w0 = w; h0 = h;
    const sc = slot.getBoundingClientRect().width / w || 1; const dpr = Math.min(1.5, (window.devicePixelRatio || 1) * sc);
    R.setPixelRatio(dpr); R.setSize(w, h, false); cam.aspect = w / h;
    // cadrage : la voiture (rayon ~2,25) tient dans l'image quelle que soit la forme du bloc
    const r = 2.3, vf = cam.fov * Math.PI / 360, hf = Math.atan(Math.tan(vf) * cam.aspect);
    const d = r / Math.sin(Math.min(vf, hf)) * 0.64;
    cam.position.set(0, 0.7 + d * 0.17, d); cam.lookAt(0, 0.6, 0); cam.updateProjectionMatrix();
  }

  function frame(t) {
    raf = 0; if (!slot || state !== 'ready') return;
    const dt = Math.min(0.05, lastT ? (t - lastT) / 1000 : 0.016); lastT = t;
    resize();
    let busy = false, live = false;
    if (!drag) {
      if (Math.abs(vel) > 0.02) { yaw += vel * dt; vel *= Math.pow(0.04, dt); busy = live = true; }
      const idleMs = Date.now() - lastUser;
      const tgt = focus != null ? FOCUS[focus] : speed >= 5 ? (idleMs > 12000 ? ROAD_YAW : null) : (idleMs > 20000 ? DEF_YAW : null);
      if (tgt != null && Math.abs(vel) <= 0.02) { let d = tgt - yaw; d = Math.atan2(Math.sin(d), Math.cos(d)); if (Math.abs(d) > 0.002) { yaw += d * Math.min(1, dt * 2.2); busy = live = true; } }
    } else busy = live = true;
    if (speed >= 2) {
      const w = speed / 3.6 / 0.335; // rayon de roue ~0,335 m
      if(window.Decor721 && Decor721.on(4)) wheels.forEach((m) => { m.rotation.x += w * dt; });
      bob += dt * (speed > 60 ? 18 : 11); root.position.y = Math.sin(bob) * 0.006; busy = true;
    } else if (root.position.y) root.position.y = 0;
    root.rotation.y = yaw;
    R.render(S, cam);
    // pendant la conduite (roues seules) : ~30 images/s pour ménager l'autoradio
    if (live) raf = requestAnimationFrame(frame);
    else if (busy) { raf = -1; setTimeout(() => { if (raf === -1) raf = requestAnimationFrame(frame); }, 28); }
    else lastT = 0;
  }
  function kick() { if (raf === -1) { raf = requestAnimationFrame(frame); return; } if (!raf && slot && state === 'ready') raf = requestAnimationFrame(frame); }

  function bindTouch() {
    canvas.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, t: performance.now(), lx: e.clientX, tap: performance.now() }; vel = 0; lastUser = Date.now(); try { canvas.setPointerCapture(e.pointerId); } catch (x) {} kick(); });
    canvas.addEventListener('pointermove', (e) => {
      if (!drag) return; const sc = (slot && slot.getBoundingClientRect().width / slot.clientWidth) || 1;
      const dx = (e.clientX - drag.lx) / sc, now = performance.now(); yaw += dx * 0.011; const dtt = Math.max(1, now - drag.t);
      vel = vel * 0.6 + (dx * 0.011) / (dtt / 1000) * 0.4; drag.lx = e.clientX; drag.t = now; lastUser = Date.now(); kick();
    });
    const up = (e) => {
      if (!drag) return; const d0 = drag; drag = null; lastUser = Date.now();
      if (Math.abs(e.clientX - d0.x) < 6 && performance.now() - d0.tap < 300) { // double appui : retour à la vue de départ
        const now = Date.now(); if (now - (C3._lastTap || 0) < 400) { vel = 0; lastUser = 0; } C3._lastTap = now;
      }
      vel = Math.max(-9, Math.min(9, vel)); kick();
    };
    canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
  }

  // place la voiture 3D dans l'emplacement prévu de l'écran (appelé après chaque rendu)
  C3.attach = function (el) {
    if (state === 'off') C3.init();
    if (state === 'fail') return false;
    slot = el; w0 = h0 = 0; el.appendChild(canvas);
    if (state === 'ready') { canvas.style.opacity = '1'; const im = el.querySelector('img'); if (im) im.style.opacity = '0'; }
    kick(); return true;
  };
  C3.detach = function () { slot = null; if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas); if (raf > 0) cancelAnimationFrame(raf); raf = 0; };
  C3.update = function (o) {
    const nf = o.focus || null, ns = o.speed || 0;
    const ch = nf !== focus || (ns >= 2) !== (speed >= 2) || (ns >= 5) !== (speed >= 5); focus = nf; speed = ns;
    if (ch) { vel = 0; if (!nf) lastUser = 0; } if (ch || ns >= 2) kick();
  };
  C3.state = () => state;
  C3._scene = () => S; C3._cam = () => cam;
  C3.setAccent = (c) => { if (!c || c === accent) return; accent = c; if (ring) { try { ring.material.color.set(c); } catch (e) {} kick(); } };
  C3.setYaw = (y) => { yaw = y; lastUser = Date.now(); kick(); };
  window.Car3D = C3;
})();
