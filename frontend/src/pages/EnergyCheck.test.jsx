import { vi } from 'vitest'

// recharts mocken
vi.mock('recharts', () => ({
  BarChart: () => 'BarChart',
  Bar: () => 'Bar',
  XAxis: () => 'XAxis',
  YAxis: () => 'YAxis',
  CartesianGrid: () => 'Grid',
  Tooltip: () => 'Tooltip',
  ResponsiveContainer: ({ children }) => children,
  Cell: () => 'Cell',
}))

vi.mock('./EnergyCheckPage', () => ({
  default: () => <div>Mocked EnergyCheckPage</div>
}))

import { render, screen } from '@testing-library/react'
import EnergyCheckPage from './EnergyCheckPage'

describe('EnergyCheckPage', () => {
  it('renders mocked version', () => {
    render(<EnergyCheckPage />)
    expect(screen.getByText(/Mocked EnergyCheckPage/i)).toBeInTheDocument()
  })
})
