import { onCleanup } from "solid-js";

export function createAnchoredPopover(anchor: () => HTMLElement | undefined, popup: () => HTMLElement | undefined) {
  let listening = false;
  const position = () => {
    const target = anchor();
    const surface = popup();
    if (target === undefined || surface === undefined || !surface.matches(":popover-open")) return;
    const bounds = target.getBoundingClientRect();
    const left = Math.max(8, Math.min(bounds.left, window.innerWidth - surface.offsetWidth - 8));
    const below = bounds.bottom + 4;
    const top = below + surface.offsetHeight <= window.innerHeight - 8 ? below : Math.max(8, bounds.top - surface.offsetHeight - 4);
    surface.style.left = `${left}px`;
    surface.style.top = `${top}px`;
  };
  const stop = () => {
    if (!listening) return;
    window.removeEventListener("resize", position);
    window.removeEventListener("scroll", position, true);
    listening = false;
  };
  const start = () => {
    position();
    if (listening) return;
    window.addEventListener("resize", position);
    window.addEventListener("scroll", position, true);
    listening = true;
  };
  onCleanup(stop);
  return { start, stop, position };
}
