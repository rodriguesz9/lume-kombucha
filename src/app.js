// Progressive enhancement: all three articles remain visible if this script fails.
const tablist = document.querySelector('.flavor-tabs');
const fallback = document.querySelector('.fallback-nav');
const tabs = [...tablist.querySelectorAll('[role="tab"]')];
const panels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
function selectTab(index, moveFocus = false, animate = true) {
  const wasSelected = tabs[index].getAttribute('aria-selected') === 'true';
  tabs.forEach((tab, position) => {
    const selected = position === index;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    panels[position].hidden = !selected;
    panels[position].classList.remove('is-entering');
  });
  if (animate && !wasSelected && !reducedMotion.matches) panels[index].classList.add('is-entering');
  if (moveFocus) tabs[index].focus({ preventScroll: true });
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectTab(index));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index + tabs.length - 1) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next !== undefined) {
      event.preventDefault();
      selectTab(next, true);
    }
  });
});
panels.forEach((panel, index) => {
  panel.setAttribute('role', 'tabpanel');
  panel.setAttribute('aria-labelledby', tabs[index].id);
  panel.tabIndex = 0;
  panel.addEventListener('animationend', () => panel.classList.remove('is-entering'));
});
function revealHashPanel() {
  const index = panels.findIndex(panel => `#${panel.id}` === location.hash);
  if (index !== -1) {
    selectTab(index, false, false);
    // Hash navigation can occur while its article is hidden. Reveal first, then position it.
    panels[index].scrollIntoView({ block: 'start', behavior: 'instant' });
  }
}
// Deep links must reveal their article before the browser scrolls to it.
selectTab(0, false, false);
revealHashPanel();
window.addEventListener('hashchange', revealHashPanel);
function updateOrientation() { tablist.setAttribute('aria-orientation', window.matchMedia('(max-width:640px)').matches ? 'vertical' : 'horizontal'); }
updateOrientation();
window.matchMedia('(max-width:640px)').addEventListener('change', updateOrientation);
reducedMotion.addEventListener('change', () => panels.forEach(panel => panel.classList.remove('is-entering')));
fallback.hidden = true;
tablist.hidden = false;
document.documentElement.classList.add('enhanced');
