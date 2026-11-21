// jsdom gaps the Radix overlays touch, filled for the overlay tests only (imported by *.test.tsx, never
// shipped). Popper measures with ResizeObserver; DismissableLayer and the menu read pointer capture.
class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

const g = globalThis as unknown as Record<string, unknown>
if (g.ResizeObserver === undefined) g.ResizeObserver = ResizeObserverStub

if (typeof Element !== 'undefined') {
  const proto = Element.prototype as unknown as Record<string, unknown>
  proto.hasPointerCapture ??= () => false
  proto.releasePointerCapture ??= () => undefined
  proto.setPointerCapture ??= () => undefined
  proto.scrollIntoView ??= () => undefined
}

export {}
