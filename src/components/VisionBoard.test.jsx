import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import VisionBoardPage from '../pages/VisionBoardPage';

describe('VisionBoardPage', () => {
  test('renders empty state correctly', () => {
    render(<VisionBoardPage />);
    expect(screen.getByText(/Vision Board/i)).toBeInTheDocument();
    expect(screen.getByText(/Bilder hierher ziehen/i)).toBeInTheDocument();
  });

  test('opens add item modal when clicking add button', () => {
    render(<VisionBoardPage />);
    const addButton = screen.getByText(/Neues Bild/i);
    fireEvent.click(addButton);
    expect(screen.getByText(/Neues Bild hinzufügen/i)).toBeInTheDocument();
  });

  test('validates image upload', () => {
    render(<VisionBoardPage />);
    const addButton = screen.getByText(/Neues Bild/i);
    fireEvent.click(addButton);
    
    const fileInput = screen.getByLabelText(/Bilder hochladen/i);
    const file = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(screen.getByText(/Hochgeladenes Bild/i)).toBeInTheDocument();
  });
});