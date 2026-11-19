/* Barre flottante et disposition personnalisable. */
(() => {
 'use strict';
 if (!store.get('floatingDock732', false)) {
  store.set('dockPos_' + profIdx(), 'gauche');
  store.set('dockColor730', 'mono');
  store.set('floatingDock732', true);
 }
 const previousDock = window.dockC;
 window.dockC = function(p, vertical = false) {
  const html = previousDock(p, vertical);
  return html ? `<div class="dockSlot732 ${vertical ? 'verticalSlot732' : ''}">${html}</div>` : '';
 };
 const previousFrame = window.chromeFrame;
 window.chromeFrame = function() {
  const width = App730.get('dockLabels730') ? 120 : Math.max(92, Number(App730.get('dockSize730')) + 50);
  return previousFrame.apply(this, arguments).replace(/grid-template-columns:84px /g, 'grid-template-columns:' + width + 'px ').replace(/grid-template-columns:minmax\(0,1fr\) 84px/g, 'grid-template-columns:minmax(0,1fr) ' + width + 'px');
 };
 function sync() {
  const color = App730.get('dockIconColor732');
  document.querySelectorAll('.dock730').forEach(nav => {
   const background = App730.get('dockBackground730');
   const accent = App730.get('dockAccent730');
   if (/^#[0-9a-f]{6}$/i.test(background)) nav.style.background = background;
   if (/^#[0-9a-f]{6}$/i.test(accent)) nav.style.setProperty('--dockAccent730', accent);
   const gap = Math.max(0, Math.min(18, Number(App730.get('dockGap730')) || 0));
   const size = Math.max(24, Math.min(48, Number(App730.get('dockSize730')) || 34));
   nav.style.gap = gap + 'px';
   nav.style.setProperty('--dockIcon730', size + 'px');
   nav.querySelectorAll('.dockButton730').forEach(button => {
    if (/^#[0-9a-f]{6}$/i.test(color) && App730.get('dockColor730') === 'mono') button.style.color = color;
    if (button.classList.contains('active730') && /^#[0-9a-f]{6}$/i.test(accent)) button.style.background = accent + '33';
    button.style.minWidth = Math.max(54, size + 20) + 'px';
    button.style.minHeight = Math.max(54, size + 20) + 'px';
    button.querySelectorAll('svg').forEach(icon => {
     icon.setAttribute('width', size); icon.setAttribute('height', size);
     if (App730.get('dockColor730') === 'mono' && /^#[0-9a-f]{6}$/i.test(color)) {
      icon.style.color = color;
      if (icon.getAttribute('stroke') !== 'none') icon.setAttribute('stroke', color);
     }
    });
   });
  });
 }
 window.FloatDock732 = {sync};
 const css = document.createElement('style');
 css.textContent = `
 .dockSlot732{display:flex;align-items:center;justify-content:center;min-width:0;min-height:0;overflow:hidden;padding:6px}
 .dockSlot732>.dock730{flex:0 1 auto;width:max-content;max-width:100%;max-height:100%;justify-content:flex-start;border-radius:24px;padding:9px;box-shadow:0 5px 16px #0004;border:1px solid #ffffff12}
 .dockSlot732>.vertical730{width:auto;flex-direction:column}
 .dockSlot732 .dockButton730{border-radius:16px}
 .dockSlot732 .dockButton730.active730{box-shadow:inset 3px 0 0 var(--dockAccent730)}
 .dockPreview732{height:280px;max-width:560px;display:flex;gap:12px;border-radius:18px;background:#446074;padding:10px;overflow:hidden}
 .dockPreview732>.dockSlot732{flex-shrink:0}
 .dockPreview732 .dock730{max-height:250px}
 .dockPreviewContent732{flex:1;min-width:0;min-height:0;display:grid;place-items:center;background:linear-gradient(#87bad0 40%,#7f9775 40%);border-radius:12px;color:#162b41}
 .dockPreview732[data-position=droite]{flex-direction:row-reverse}
 .dockPreview732[data-position=haut]{flex-direction:column}
 .dockPreview732[data-position=bas]{flex-direction:column-reverse}
 `;
 document.head.appendChild(css);
})();
