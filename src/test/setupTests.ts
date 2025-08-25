import '@testing-library/jest-dom'

// jsdom doesn't implement window.matchMedia — mock a minimal version
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},            // deprecated
    removeListener: () => {},         // deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})

// jsdom doesn't implement CSS.supports — mock it
global.CSS = {
  ...global.CSS,
  supports: () => true,
}