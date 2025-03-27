import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EnergyCheckPage from '../pages/EnergyCheckPage';

describe('EnergyCheckPage', () => {
  test('renders empty state correctly', () => {
    render(<EnergyCheckPage />);
    expect(screen.getByText(/Energie-Check/i)).toBeInTheDocument();
    expect(screen.getByText(/Du hast noch keine Energie-Einträge/i)).toBeInTheDocument();
  });

  test('opens add entry modal when clicking add button', () => {
    render(<EnergyCheckPage />);
    const addButton = screen.getByText(/Neuer Eintrag/i);
    fireEvent.click(addButton);
    expect(screen.getByText(/Neuer Energie-Eintrag/i)).toBeInTheDocument();
  });

  test('validates energy level input', () => {
    render(<EnergyCheckPage />);
    const addButton = screen.getByText(/Neuer Eintrag/i);
    fireEvent.click(addButton);
    
    const energyLevels = screen.getAllByRole('button').filter(button => 
      /^[1-5]$/.test(button.textContent)
    );
    
    fireEvent.click(energyLevels[0]);
    expect(energyLevels[0]).toHaveClass('bg-blue-100');
  });
});