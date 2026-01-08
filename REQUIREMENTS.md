# Product Requirements Document: NFL Pick'em Lottery

## 1. Executive Summary
A comprehensive full-stack web application where users participate in a sport lottery by predicting NFL matchup winners. The system covers the Regular Season, Playoffs, and the Super Bowl, featuring automated scoring, global standings, and a tie-breaking weekly winner system.

## 2. Technical Stack
- **Language:** TypeScript (Frontend & Backend).
- **Frontend:** React (Vite), Redux Toolkit, PrimeReact (UI Component Library), Tailwind CSS.
- **Backend:** Node.js with Express, JWT (Authentication), Nodemailer (Email services).
- **Database:** PostgreSQL with Prisma ORM.
- **i18n:** Full internationalization support for English (EN) and Spanish (ES).

## 3. Core Features

### 3.1 User Features
- **Registration/Login:** JWT-based auth. Mandatory unique email and language preference.
- **Landing Page:** Integrated login form with official NFL branding.
- **Welcome Email:** Automated bilingual (EN/ES) welcome emails upon registration.
- **Games Board:** 
  - Weekly filtering (Weeks 1-18) and Stage filtering (Regular, Playoffs, Super Bowl).
  - Checkbox-style team selection (one team per matchup).
  - Visual feedback for correct/incorrect picks and final game scores.
- **Standings:** Real-time calculated table grouped by Conference and Division (W/L/T, PCT, PF, PA, Net Pts).
- **Results:** Historical view of all completed games and scores.
- **Leaderboard:** 
  - **Global:** Accumulated points over the season.
  - **Weekly:** Ranking per week with a tie-breaker rule (first to submit wins the tie).

### 3.2 Scoring System
- **Regular Season:** 1 point per correct pick.
- **Playoffs:** 2 points per correct pick.
- **Super Bowl:** 3 points for the correct winner.

### 3.3 Admin Features
- **Matchup Management (CRUD):** 
  - Manual creation/editing of any game.
  - Validation: Max 18 games per week.
  - Validation: One game per team per week.
- **Result Entry:** Interface to input final scores, which triggers automatic point distribution.
- **User Management:** View all users and toggle account status (Active/Disabled).
- **Team Management:** Edit team properties (City, Name, Conference, Division).
- **Dynamic Theming:** Admin-only dropdown to switch the application theme globally using the full PrimeReact catalog.
- **System Reset:** Tool to clear all games and reset all user scores.

## 4. UI/UX Concept
- **Theme:** Professional sports data portal aesthetic using PrimeReact "Lara Dark Blue" by default.
- **Assets:** Official NFL.com CDN logos processed and hosted locally at 60x60px.
- **Layout:** Compact, data-rich tables with row highlighting and responsive design.

## 5. Data Models
- **User:** ID, Username, Email, PasswordHash, TotalScore, Role (USER/ADMIN), isActive.
- **Team:** ID, Name, City, Abbreviation, LogoUrl, Conference, Division.
- **Matchup:** ID, Stage, Week, HomeTeam, AwayTeam, Scores, WinnerID, isFinished.
- **Pick:** ID, User, Matchup, SelectedTeam, isCorrect, Timestamps (for tie-breaking).
- **AppSetting:** Key-Value store for global configs like the active theme.