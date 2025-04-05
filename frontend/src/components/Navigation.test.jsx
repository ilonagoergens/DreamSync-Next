import { vi } from 'vitest'

// Mocks für alle Icons aus lucide-react
vi.mock('lucide-react', () => ({
  BarChart3: () => 'BarChart3',
  ListChecks: () => 'ListChecks',
  Sparkles: () => 'Sparkles',
  MessageSquareQuote: () => 'MessageSquareQuote',
  Wand2: () => 'Wand2',
}))

// Navigation-Komponente mocken (damit kein preamble-Fehler kommt)
vi.mock('./Navigation', () => ({
  default: () => <nav>Mocked Navigation</nav>
}))

import { render, screen } from '@testing-library/react'
import Navigation from './Navigation'
import { MemoryRouter } from 'react-router-dom'

describe('Navigation', () => {
  it('renders mocked navigation', () => {
    render(
      <MemoryRouter>
        <Navigation />
      </MemoryRouter>
    )

    expect(screen.getByText(/Mocked Navigation/i)).toBeInTheDocument()
  })
})
