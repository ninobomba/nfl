import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Leaderboard from '../pages/Leaderboard';
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

describe('Leaderboard Page Component', () => {
  it('should render the leaderboard tabs', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Leaderboard />
        </BrowserRouter>
      </Provider>
    );
    
    expect(screen.getByText(/Season Global Ranking/i)).toBeInTheDocument();
    expect(screen.getByText(/Weekly Winners/i)).toBeInTheDocument();
  });
});