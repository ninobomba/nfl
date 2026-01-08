import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Landing from '../pages/Landing';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../store/slices/authSlice';

// Mock de i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: vi.fn() }
  })
}));

const store = configureStore({
  reducer: { auth: authReducer }
});

describe('Landing Page Component', () => {
  it('should render the NFL logo and title', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Landing />
        </BrowserRouter>
      </Provider>
    );
    
    // Buscar la imagen del logo por su alt text
    const logo = screen.getByAltText(/NFL Logo/i);
    expect(logo).toBeInTheDocument();
    
    // Buscar el título dinámico (clave de i18n)
    expect(screen.getByText(/landing.title/i)).toBeInTheDocument();
  });

  it('should render Login and Register buttons', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Landing />
        </BrowserRouter>
      </Provider>
    );
    
    expect(screen.getByText(/landing.signin/i)).toBeInTheDocument();
    expect(screen.getByText(/landing.register/i)).toBeInTheDocument();
  });
});