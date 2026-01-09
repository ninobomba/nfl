# Product Requirements Document: NFL Pick'em Lottery

## 1. Executive Summary
A professional full-stack web application for NFL game predictions. The platform allows users to participate in a "sport lottery" by selecting winners for weekly matchups across the Regular Season, Playoffs, and Super Bowl. It features real-time standings, a global leaderboard with weekly tie-breakers, and a comprehensive administration suite.

## 2. Technical Stack
- **Backend:** Node.js, Express, TypeScript (ESM/NodeNext).
- **Database:** PostgreSQL with Prisma ORM.
- **Frontend:** React (Vite), Redux Toolkit, PrimeReact (UI Components), Tailwind CSS.
- **Localization:** i18next (Full support for English and Spanish).
- **Authentication:** JWT-based with role-based access control (User/Administrator).
- **Email:** Nodemailer for bilingual welcome emails and password recovery keys.
- **API:** Centralized Axios instance with base URL configured via environment variables.

## 3. Core Features

### 3.1 User Experience
- **Multilingual UI:** Language selector located at the top-right of every page.
- **Integrated Access:** Login form integrated directly into the landing page for quick access.
- **Password Recovery:** Key-based password reset via email with expiration and audit tracking.
- **Interactive Picks:** Matchup board with checkbox-style team selection. Changes are blocked once a game starts or finishes.
- **Visual Feedback:** High-quality 60x60px team logos and real-time status indicators (Correct/Incorrect predictions).
- **Data Tables:** Justified and centered layouts for Standings, Results, and Leaderboards to ensure readability.

### 3.2 Administrator Suite
- **Modular Interface:** Two-tab main structure:
    - **Overview:** Real-time system statistics (Total Matchups, Finished Games, Active Users).
    - **Settings:** Master control center with sub-tabs for Matchups, Teams, Users, Audit Logs, and Themes.
- **Matchup Management (CRUD):** Manual creation, editing, and deletion of games for any season stage.
- **Result Entry:** Official score input dialog that automatically triggers user point calculations.
- **Dynamic Theming:** Global theme switcher with access to the full PrimeReact catalog (40+ themes).
- **Audit System:** Comprehensive bitácora (logs) tracking security and management operations.

## 4. System Rules & Validations
- **Scoring:** Regular Season (1pt), Playoffs (2pts), Super Bowl (3pts).
- **Weekly Tie-Breaker:** In case of equal points, the user who submitted their final pick first wins the week.
- **Matchup Validations:**
    - Maximum of 18 games per NFL week.
    - One game per team per week.
    - A team cannot be scheduled to play against itself.
- **Security:**
    - Admin routes protected by `isAdmin` middleware.
    - Unique email and username enforced during registration.
    - Password reset keys valid for 15 minutes.

## 5. UI/UX Principles
- **Font:** Comfortaa Regular (Global).
- **Responsiveness:** Mobile-first approach. Dialogs use dynamic breakpoints (95vw on mobile).
- **Visual Hierarchy:** Consistent use of "Surface" classes for theme adaptability. Elimination of forced uppercase for better legibilidad.
- **Feedback:** Use of PrimeReact Toasts and Skeletons to manage loading states and user notifications.
