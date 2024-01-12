# Business Process Management System

Welcome to the Business Process Management System – an advanced and feature-rich web application designed to streamline and optimize organizational processes for businesses managing clients and projects. This system is built using cutting-edge technologies and libraries, providing a robust platform for administrators, bookkeepers, and regular employees to efficiently manage and monitor various aspects of their business processes.

open the project on this Link: (https://104.248.129.121/)
email: 222
password: 222

## Features 🚀

- **User Management:**
  - Register and manage users with different roles (Administrator, Bookkeeper, Regular User).
  - Super Administrator role with additional control over financial information visibility.
  
- **Client and Project Management:**
  - Register clients and projects seamlessly.
  - Assign and reassign users to projects.
  - Track project status, deadlines, and visualize project records with dynamic colors.
  
- **Service and Subservice Assignment:**
  - Assign multiple services and subservices to each project.
  - Assign services and subservices to multiple users.
  
- **File Management:**
  - Upload, modify, and delete files associated with projects.
  
- **Statistics and Financial Information:**
  - Dynamic charts and statistics for users and projects.
  - Financial information available for administrators and bookkeepers.
  
- **Notifications:**
  - SMS notifications to clients when their project is ready.
  - Internal notifications for users about project-related changes.
  
## Technologies Used 💻

### Client-Side (React JS) 🌐

- @emotion/react
- @emotion/styled
- @mui/icons-material
- @mui/material
- @mui/x-data-grid
- Axios
- Chart.js
- chartjs-plugin-datalabels
- File-saver
- React
- React-chartjs-2
- React-datepicker
- React-dom
- React-pro-sidebar
- React-router-dom
- React-scripts
- Web-vitals
- Xlsx

### Server-Side (Node.js and Express) 🚀

- Archiver
- Axios
- Bcrypt
- Body-parser
- Compression
- Content-disposition
- Cookie-parser
- Cors
- Dotenv
- Express
- Express-session
- File-saver
- Jsonwebtoken
- Multer
- Mv
- Mysql
- Nodemon
- Path

## Database 🛢️

- MySQL with triggers and functions for enhanced functionality.

## Deployment 🌐

This system is deployed on a DigitalOcean Ubuntu server.

## Roles and Permissions 👑

- **Super Administrator and Administrators:**
  - Full CRUD permissions on all tables.
  - Control over financial information visibility.
  
- **Bookkeeper:**
  - Access to financial information and statistics.
  
- **Regular Users:**
  - Limited CRUD permissions on their own projects.
  - Upload, modify, and delete files associated with their projects.

## Getting Started 🚀

1. Clone the repository or download files on local machine.
2. Install dependencies for both the client and server.
3. Set up your MySQL database according to dump file and configure environment variables.
4. Run the application locally.
