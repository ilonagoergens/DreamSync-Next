import '@testing-library/jest-dom';

class IntersectionObserver {
  constructor() {
    this.observe = vi.fn();
    this.unobserve = vi.fn();
    this.disconnect = vi.fn();
  }
}
window.IntersectionObserver = IntersectionObserver;

class ResizeObserver {
  constructor() {
    this.observe = vi.fn();
    this.unobserve = vi.fn();
    this.disconnect = vi.fn();
  }
}
window.ResizeObserver = ResizeObserver;

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

window.performance = {
  getEntriesByType: vi.fn(),
  getEntriesByName: vi.fn(),
  now: vi.fn(),
  mark: vi.fn(),
  measure: vi.fn(),
  clearMarks: vi.fn(),
  clearMeasures: vi.fn(),
};
// Mocks für lucide-react (Icons)
vi.mock('lucide-react', () => ({
  Briefcase: () => <div />,
  Users: () => <div />,
  Heart: () => <div />,
  ListChecks: () => <div />,
  X: () => <div />,
}))

// Mocks für recharts (Chart-Komponenten)
vi.mock('recharts', () => ({
  BarChart: () => <div />,
  Bar: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  Cell: () => <div />,
}))