import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Landing from '../pages/Landing';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../store/slices/authSlice';

// Mock simple de i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: vi.fn() }
  })
}));

const store = configureStore({
  reducer: { auth: authReducer }
});

describe('Landing Page', () => {
  it('renders the landing page title', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Landing />
        </BrowserRouter>
      </Provider>
    );
    
    // Debería encontrar la clave de traducción o el texto del título
    expect(screen.getByText(/landing.title/i)).toBeInTheDocument();
  });
});
