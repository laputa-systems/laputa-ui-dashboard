export function createTabSwipeGuard() {
  let touch: { readonly pointerId: number; readonly x: number; readonly y: number; moved: boolean } | undefined;
  let suppressClick = false;
  return {
    pointerDown(event: PointerEvent) {
      suppressClick = false;
      if (event.pointerType === "touch" || event.pointerType === "pen") touch = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, moved: false };
    },
    pointerMove(event: PointerEvent) {
      if (touch?.pointerId === event.pointerId && Math.hypot(event.clientX - touch.x, event.clientY - touch.y) > 8) touch.moved = true;
    },
    pointerUp(event: PointerEvent) {
      if (touch?.pointerId === event.pointerId) { suppressClick = touch.moved; touch = undefined; }
    },
    pointerCancel() { touch = undefined; suppressClick = false; },
    suppress(event: MouseEvent): boolean {
      if (event.detail <= 0 || !suppressClick) return false;
      suppressClick = false;
      return true;
    },
  };
}
