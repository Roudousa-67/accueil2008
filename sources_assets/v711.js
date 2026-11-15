/* 7.11 : accès à la barre de navigation, sans décalages cumulés. */
'use strict';
const Screen711 = (() => {
  const height = () => {
    const value = Number(store.get('headerDrop711', 64));
    return Number.isFinite(value) ? Math.max(0, Math.min(160, value)) : 64;
  };
  const reserved = () => Math.max(height(), store.get('gbBarOn', false) ? Number(gbBarH()) || 0 : 0);
  function apply() {
    document.documentElement.style.setProperty('--headerDrop711', reserved() + 'px');
  }
  const style = document.createElement('style');
  style.textContent = `
    #screen,#screen.gbbar{top:0!important;padding-top:calc(14px + var(--headerDrop711,64px))!important}
    #stage > .ov{padding-top:calc(22px + var(--headerDrop711,64px))!important}
  `;
  document.head.appendChild(style);
  apply();
  const old = render;
  window.render = function () { apply(); return old.apply(this, arguments); };
  // L'ancien réglage de barre reste utilisable, mais sa hauteur n'est pas ajoutée deux fois.
  const barApply = gbBarApply;
  gbBarApply = function () { const result = barApply.apply(this, arguments); apply(); return result; };
  window.addEventListener('resize', apply);
  return { height, reserved, apply };
})();

{ const cat = SETCATS.find(c => c[0] === "Écran d'accueil") || SETCATS.find(c => c[0] === 'Navigation');
  if (cat) cat[1].unshift(['Hauteur de la barre Accueil', p => `<div style="display:flex;flex-direction:column;gap:12px;max-width:820px">
    ${setRow(p, 'Descendre la barre Accueil', 'Garde les boutons Accueil, Trajets, Entretien et les réglages accessibles sous la barre du poste. Le GPS suit son cadre.',
      chipBtn(p, 'screen711:up', '↑ Remonter') + '<b style="padding:0 12px">' + Screen711.height() + ' px</b>' + chipBtn(p, 'screen711:down', '↓ Descendre'))}
    ${setRow(p, 'Position conseillée', 'Décalage de 64 px pour la disposition de la vidéo.', chipBtn(p, 'screen711:reset', 'Rétablir'))}
  </div>`]);
}
{ const old = window.act; window.act = function (a, long) {
  if (!a.startsWith('screen711:')) return old.apply(this, arguments);
  if (a === 'screen711:reset') store.set('headerDrop711', 64);
  else if (a === 'screen711:down') store.set('headerDrop711', Math.min(160, Screen711.height() + 8));
  else if (a === 'screen711:up') store.set('headerDrop711', Math.max(0, Screen711.height() - 8));
  Screen711.apply(); render();
}; }
