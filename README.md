# Event Management System – Full-Stack Event Management System

## Overview
Event Management System is a role-aware event management platform with strict approvals and visibility rules. Users can discover approved events, register, and manage tickets. Organizers can propose events and manage resources after admin approval. Admins approve or reject organizers, events, and sessions, and monitor the platform. The system includes real-time and persistent notifications, image uploads, and a clean permission model across frontend and backend.

## Tech Stack
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT authentication
- **Frontend**: React (Vite), React Router, Axios, Tailwind CSS
- **Realtime**: Socket.IO (server + client)
- **PDFs/QR**: html2canvas + jsPDF for ticket generation; custom QR code implementation
- **Tooling**: ESLint, Prettier, Nodemon, PostCSS

## Monorepo Structure
- `backend/` – Express API, Socket.IO, MongoDB models, routes, controllers
- `frontend/` – Vite React app (Tailwind), pages and hooks
- `api/` – Vercel serverless functions for deployment
- `lib/` – Shared utilities for database and authentication

## Website Pages
The application consists of the following main pages. Availability is enforced by role and approval status.

### Public Pages
- **Home** (`/`) - Landing page with approved event listings, search, recommendations, and platform stats
- **Sessions** (`/sessions`) - Approved sessions listing with filters (name is "Sessions", not "Schedule")
- **About** (`/about`) - Information about the platform and team
- **Contact** (`/contact`) - Contact form and information
- **Login** (`/login`) - User authentication page
- **Signup** (`/signup`) - User registration page
- **Password Reset** (`/reset-password`) - Password recovery page

### Authenticated Pages
- **Dashboard** (`/dashboard`) - Role-based dashboard:
  - Student: Registered events, tickets, and notifications
  - Organizer: Event/session/exhibitor/gallery management (only after admin approval)
  - Admin: Pending approvals (organizers, events, sessions), platform oversight
- **Profile** (`/profile`) - User profile management and settings
- **Event Details** (`/events/:id`) - Detailed event information with registration option
- **Exhibitor Portal** (`/exhibitors`) - Browse exhibitors and their profiles
- **Exhibitor Profile** (`/exhibitors/:id`) - Detailed exhibitor information
- **Statistics** (`/statistics`) - Analytics dashboard with platform metrics
- **Feedback** (`/feedback`) - Submit and view feedback for events
- **Pass** (`/pass`) - Digital event pass/ticket management
- **Rejected Events (Admin only)** (`/events/rejected`) - History of rejected events
- **Platform Statistics (Admin only)** (`/platform-statistics`) - Real-time platform metrics
- **Communications** (`/communications`) - User messaging system
- **Role Access** (`/role-access`) - Role and permission management
- **Booth Management** (`/booths-management`) - Booth management for exhibitors
- **Exhibitor Management** (`/exhibitors-management`) - Exhibitor management

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account or local MongoDB instance

### 1) Clone and Install Dependencies
```bash
git clone <your-repo-url>
cd Event-management-system

# Backend dependencies
cd backend && npm install

# Frontend dependencies
cd ../frontend && npm install
```

### 2) Configure Environment Variables
Create `backend/.env` with values similar to:
```env
# For MongoDB Atlas (recommended for production)
MONGO_URI=mongodb+srv://owaisworkers_db_user:YOUR_ACTUAL_PASSWORD_HERE@cluster0.iwqfafs.mongodb.net/eventmanager?retryWrites=true&w=majority
JWT_SECRET=your_secure_random_jwt_secret_here
JWT_EXPIRES_IN=7d
PORT=5000
CLIENT_URL=http://localhost:5173

# Email configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=Event Management System <noreply@eventmanagementsystem.com>

# For local MongoDB (uncomment to use for development)
# MONGO_URI=mongodb://127.0.0.1:27017/event_mgmt
# JWT_SECRET=your_secure_random_jwt_secret_here
# JWT_EXPIRES_IN=7d
# PORT=5000
# CLIENT_URL=http://localhost:5173
```

**Security Warning:** Never commit your actual `.env` file to version control. Use `.env.example` as a template and ensure `.env` is in your `.gitignore`.

**Important:** Replace `YOUR_ACTUAL_PASSWORD_HERE` with your actual MongoDB password. Generate a secure JWT secret using a tool like `openssl rand -base64 32`.

### 3) Run Locally
Terminal A (backend):
```bash
cd backend
npm run dev
```

Terminal B (frontend):
```bash
cd frontend
npm run dev
```

### 4) Seed Initial Data (Optional)
```bash
cd backend
node src/seed.js
```

## Default Test Accounts
- **Student**: student@example.com / password
- **Event Organizer**: organizer@example.com / password
- **Administrator**: admin@example.com / password

## Key Features
- **User Roles**: Visitor, Student, Organizer, Admin
- **Strict Approvals**: Admin approval required for organizers, events, and sessions
- **Event Visibility**: Public sees only approved events; organizers see their drafts
- **Registration System**: QR-coded PDF tickets, capacity checks, student-only registration
- **Real-time + Persistent Notifications**: Socket.IO and DB-backed notification center
- **Analytics Dashboard**: Summary and trends; platform stats show approved events only
- **Feedback & Reviews**: Ratings and reviews gated by auth and role
- **Responsive Design**: Mobile-first with Tailwind and dark mode
- **Security**: JWT auth, RBAC across UI and API, hardened error handling
- **Media & Gallery**: Image uploads for avatars, posters, and gallery via multer
- **Exhibitor Portal**: Exhibitor and booth management with organizer approvals
- **Mandatory Event Posters**: All events must include an uploaded poster image
- **Communication System**: Real-time messaging between users
- **Booth Management**: Booth allocation and management for exhibitors
- **Platform Statistics**: Real-time admin dashboard with metrics

## Technical Highlights for Portfolio

This project demonstrates proficiency in modern full-stack development with a focus on security, scalability, and professional architecture:

*   **Robust Authentication Pipeline**: Implemented a dual-token system (JWT Access + Refresh) with auto-rotation and Axios interceptors for seamless, secure user sessions.
*   **Granular RBAC (Role-Based Access Control)**: Engineered a four-tier permission model (Visitor, Student, Organizer, Admin) enforced through both backend middleware and dynamic frontend UI gates.
*   **Real-Time Engagement**: Integrated Socket.IO for instantaneous platform notifications and a live user-to-user messaging system.
*   **Dynamic Data Visualization**: Developed specialized analytics dashboards using Chart.js/Recharts to provide organizers and admins with actionable platform insights.
*   **Digital Asset Management**: Automated the generation of QR-coded PDF tickets/passes for offline verification, alongside custom Multer integration for multi-media handling.
*   **Enterprise-Ready Middleware**: Utilized production-grade security (Helmet, Rate-limiting) and performance (Compression) strategies for a hardened API.

## API Endpoints

### Authentication (`/api/auth/*`)
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user

### Events (`/api/events/*`)
- `GET /api/events` - List events with filtering and pagination
- `GET /api/events/:id` - Get event details
- `POST /api/events` - Create new event (organizer only)
- `PUT /api/events/:id` - Update event (organizer only)
- `DELETE /api/events/:id` - Delete event (organizer only)

### Registrations (`/api/registrations/*`)
- `POST /api/registrations/:id/register` - Register for event
- `GET /api/registrations/me` - Get user's registrations
- `GET /api/registrations/pending` - Get pending registrations (admin only)
- `POST /api/registrations/:id/approve` - Approve registration (admin only)
- `POST /api/registrations/:id/deny` - Deny registration (admin only)
- `GET /api/registrations/:id/participants` - Get event participants (organizer/admin)

### Reviews & Feedback (`/api/reviews/*`, `/api/feedback/*`)
- `POST /api/reviews/:id` - Add review to event
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review
- `GET /api/reviews/:id` - Get event reviews
- `GET /api/reviews/user/me` - Get user's reviews
- `POST /api/feedback` - Submit event feedback
- `GET /api/feedback/event/:eventId` - Get event feedback
- `GET /api/feedback/event/:eventId/ratings` - Get event ratings

### Admin (`/api/admin/*`)
- `GET /api/admin/approvals` - Get pending staff approvals
- `POST /api/admin/approve/:id` - Approve staff member
- `DELETE /api/admin/reject/:id` - Reject staff member
- `GET /api/admin/events/pending` - Get pending events
- `POST /api/admin?action=approve-event&id=:id` - Approve event
- `POST /api/admin?action=reject-event&id=:id` - Reject event
- `POST /api/admin/block/:id` - Block user
- `POST /api/admin/unblock/:id` - Unblock user
- `POST /api/admin/announce` - Send announcement to all users
- `GET /api/admin/export?format=csv|pdf` - Export platform data

### Statistics (`/api/stats/*`)
- `GET /api/stats/leaderboard` - Get event leaderboard
- `GET /api/stats/recommendations` - Get event recommendations
- `GET /api/stats/summary` - Get platform summary
- `GET /api/stats/trending` - Get trending events
- `GET /api/stats/dashboard` - Get dashboard statistics
- `GET /api/stats/analytics` - Get platform analytics

### Notifications (`/api/notifications/*`)
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications/:id/read` - Mark notification as read
- `POST /api/notifications/:id/unread` - Mark notification as unread
- `POST /api/notifications/read-all` - Mark all notifications as read
- `DELETE /api/notifications/:id` - Delete notification
- `DELETE /api/notifications/read/all` - Delete all read notifications

### Exhibitors (`/api/exhibitors/*`)
- `GET /api/exhibitors` - List exhibitors
- `GET /api/exhibitors/:id` - Get exhibitor details
- `POST /api/exhibitors` - Create exhibitor (organizer only)
- `PUT /api/exhibitors/:id` - Update exhibitor (organizer only)
- `DELETE /api/exhibitors/:id` - Delete exhibitor (organizer only)

### Booths (`/api/booths/*`)
- `GET /api/booths/event/:eventId` - List booths for event
- `POST /api/booths/event/:eventId` - Create booth for event (organizer only)
- `PUT /api/booths/:boothId` - Update booth (organizer only)
- `DELETE /api/booths/:boothId` - Delete booth (organizer only)

### Gallery (`/api/gallery/*`)
- `POST /api/gallery/:eventId` - Upload event image
- `GET /api/gallery/:eventId` - Get event gallery
- `DELETE /api/gallery/:imageId` - Delete gallery image

### Sessions (`/api/sessions/*`)
- `GET /api/sessions` - List sessions
- `GET /api/sessions/:id` - Get session details
- `POST /api/sessions` - Create session (organizer only)
- `PUT /api/sessions/:id` - Update session (organizer only)
- `DELETE /api/sessions/:id` - Delete session (organizer only)

### Communications (`/api/communications/*`)
- `GET /api/communications/contacts` - Get user contacts
- `GET /api/communications/messages/:contactId` - Get messages with contact
- `POST /api/communications/messages` - Send message
- `GET /api/communications/messages/unread/count` - Get unread message count

## Role-Based Access Control (RBAC)

Frontend checks live in `frontend/src/utils/permissions.js`. Backend enforcement is via `authenticate`, `optionalAuthenticate`, and `authorizeRoles` middleware plus controller-level checks.

- **Visitor**: Can browse approved events/sessions only. Cannot register or post reviews. Sees signup/login CTAs. Hidden management buttons.
- **Student**: Can register for approved events, view own tickets, and post reviews. Sees a student dashboard. No creation permissions.
- **Organizer**: Must be admin-approved (`isApproved === true`) to create/update/delete events, sessions, exhibitors, certificates, and gallery items. Sees own drafts and pending items regardless of public visibility.
- **Admin**: Full read/write access across resources. Dedicated approval queues and a rejected events history page.

## Approval & Visibility Rules

- **Organizer Approval**: Admin must approve organizers before they can manage content.
- **Event Visibility**:
  - Public and students: only events with `status = approved`.
  - Organizers: their own events (any status) + approved events.
  - Admin: all events (approved, pending, rejected).
- **Session Visibility**: Mirrors events. Public sees only approved sessions; admins see all; organizers see their own.
- **Rejected Items**: Removed from public; admins can view under `Rejected Events`.
- **Notifications**: All important actions (approvals, rejections, creations) generate notifications; shown in the notification bar and refreshed periodically.

## Frontend Workflow

1) Landing on Home
- Shows approved events only. "Create Your First Event" is hidden for unauthenticated users. Certificates are not shown in platform stats.

2) Event Details (`/events/:id`)
- Shows organizer name and profile avatar (if available) alongside event info.
- "Register" button requires login; unauthenticated users are redirected to signup/login with a return URL.

3) Dashboard (`/dashboard`)
- Student: Registered events and tickets only.
- Organizer: Create/manage events, sessions, exhibitors, gallery after admin approval.
- Admin: Approve/reject organizers, events, and sessions. View rejected events history.

4) Sessions (`/sessions`)
- Modeled similar to events. Creation and updates require admin-approved organizer. Sessions require admin approval before appearing publicly.

## Backend Workflow

- **Authentication**: JWT tokens in `Authorization: Bearer` headers. `optionalAuthenticate` allows public reads while recognizing logged-in users.
- **Controllers**: Apply role and ownership checks (e.g., only approved organizers can mutate; public queries filter to approved status).
- **Notifications**: Actions like `approveEvent`, `rejectEvent`, and organizer approvals create a DB notification and broadcast via Socket.IO.

## Environment & Dev Notes

- Frontend dev server: `http://localhost:5173`
- Backend server: `http://localhost:5000`
- Vite proxy forwards `/api/*` to the backend.

### Troubleshooting
- `net::ERR_CONNECTION_REFUSED`: Ensure the backend on port 5000 is running.
- `EADDRINUSE: :5000`: Stop conflicting processes or change `PORT` in `.env` and Vite proxy.
- Notifications 401 on load: Happens before auth is set or if backend is down; resolves after login and backend availability.

## Scripts

### Backend (`backend/package.json`):
- `npm run dev` – Start server with nodemon for development
- `npm start` – Start server in production mode
- `npm run seed` – Seed database with initial data

### Frontend (`frontend/package.json`):
- `npm run dev` – Start Vite development server
- `npm run build` – Create production build
- `npm run preview` – Preview production build locally

## Deployment

### Vercel Deployment (Recommended)
1. Push code to a GitHub repository
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard:
   - `MONGODB_URI` (your MongoDB Atlas connection string)
   - `JWT_SECRET` (secure random string)
   - `CLIENT_URL` (your Vercel app URL)
4. Deploy!

### Traditional Deployment
- Set environment variables (`PORT`, `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`)
- Serve frontend build (Vite `dist/`) via your host or CDN
- Run backend as a service (PM2/Docker) and ensure CORS allows your frontend origin

## Website Functionality Verification
Quick checks to validate the workflow:

✅ Home shows only approved events; unauthenticated users don't see organizer CTAs
✅ Event Details shows organizer name + avatar; unauthenticated users are redirected on register/review
✅ Dashboard routes allow student/organizer/admin with correct content per role
✅ Admin sees pending approvals for organizers, events, and sessions; rejected events history works
✅ Notifications appear for approvals/rejections/creations and refresh periodically
✅ Sessions behave like events (creation gated, public only after approval)
✅ Communication system allows messaging between users
✅ Booth management allows exhibitors to manage their booths
✅ Platform statistics show real-time metrics for admins

## License
MIT