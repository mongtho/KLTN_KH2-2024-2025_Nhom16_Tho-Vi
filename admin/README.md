# EduEvent Admin Dashboard

This is the administrative dashboard for the EduEvent Manager application. It provides an interface for administrators to manage events, users, faculties, departments, and view statistics.

## Features

- User Management
- Event Management
- Faculty and Department Management
- Registration Management
- Statistics and Analytics
- Notification Management

## Technology Stack

- React
- Vite
- React Router
- Axios
- Tailwind CSS (via CDN)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend API running on http://localhost:5000

### Installation

1. Clone the repository
2. Navigate to the admin directory
3. Install dependencies:

```bash
npm install
```

4. Start the development server:

```bash
npm run dev
```

5. Open your browser and navigate to http://localhost:5173

## Project Structure

```
admin/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
└── README.md
```

## Services

The application includes the following services for API communication:

- `authService` - Authentication and user management
- `userService` - User management
- `eventService` - Event management
- `facultyService` - Faculty management
- `departmentService` - Department management
- `notificationService` - Notification management
- `registrationService` - Registration management
- `statisticsService` - Statistics and analytics

## Authentication

The admin dashboard is protected and only accessible to users with the admin role. Authentication is handled using JWT tokens stored in localStorage.

## Development

To add new features or modify existing ones:

1. Create or modify components in the `src/components` directory
2. Create or modify pages in the `src/pages` directory
3. Update the routing in `App.jsx` if necessary
4. Add or modify API services in the `src/services` directory

## License

This project is licensed under the MIT License.
