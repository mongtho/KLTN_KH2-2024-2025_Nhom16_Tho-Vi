# EduEventManager

EduEventManager is a comprehensive platform for managing educational events, designed for universities and educational institutions. It allows faculty members, department heads, and students to create, manage, and participate in educational events.

## Features

### For Faculty Dean and Department Heads
- Event approval and management
- Content moderation
- Notification management
- Statistics and reporting

### For Lecturers
- Create and manage events
- Track attendance
- Receive notifications about event status
- Participate in other events

### For Students
- View and register for events
- Receive event notifications
- Rate and provide feedback on events
- Track participation history

## Project Structure

The project is divided into two main parts:

- **Backend**: A RESTful API built with Node.js, Express, and MySQL
- **Frontend**: (To be implemented) A web application built with React

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   PORT=5000
   NODE_ENV=development
   
   # Database Configuration
   DB_HOST=localhost
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=edu_event_manager
   
   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRES_IN=24h
   
   # File Upload
   MAX_FILE_SIZE=5242880 # 5MB
   ```

4. Initialize the database:
   ```
   npm run init-db
   ```

5. Start the development server:
   ```
   npm run dev
   ```

### Frontend Setup

(To be implemented)

## API Documentation

See the [Backend README](./backend/README.md) for detailed API documentation.

## License

This project is licensed under the MIT License. 