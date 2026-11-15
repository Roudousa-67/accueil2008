/* 7.12 : panneau entraîné par le décor, hors de l'emprise de la voiture. */
'use strict';
window.RoadMotion712 = {
  signPoint(travel, width, height, carRight) {
    const phase = ((travel / 110) % 1 + 1) % 1;
    const left = Math.max(width * (0.73 + phase * 0.12), carRight + width * 0.015);
    const room = Math.max(0, width - left - width * 0.02);
    return { left, top:height * (0.34 + phase * 0.43), width:room * (0.55 + 0.45 * phase), opacity:Math.min(1,phase / 0.08,(1-phase)/0.10) };
  },
  oncomingDepth(time, index) {
    return 1.4 + 22 - ((index * 7.13 + time * (3 + index)) % 22);
  },
  draw(box, travel) {
    if (!box) return;
    const sign = box.querySelector('.place710'); if (!sign) return;
    const rect = box.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const car = box.querySelector('[data-car360]'), cr = car && car.getBoundingClientRect();
    const width = box.clientWidth || rect.width, height = box.clientHeight || rect.height;
    const right = cr && cr.width ? (cr.right - rect.left) * width / rect.width : width * 0.78;
    const p = this.signPoint(travel, width, height, right);
    sign.style.left = p.left + 'px'; sign.style.right = 'auto'; sign.style.top = p.top + 'px';
    sign.style.width = p.width + 'px'; sign.style.boxSizing = 'border-box';
    sign.style.opacity = String(p.opacity); sign.style.minHeight = '0';
    sign.style.fontSize = Math.max(8, Math.min(17, p.width / Math.max(5,sign.textContent.length * 0.55))) + 'px';
  }
};
