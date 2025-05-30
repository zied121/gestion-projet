# gestion-projet
## Description

This is the backend for the "Gestion Projet" application. It provides APIs to manage projects, tasks, and users efficiently.

## Features

- User authentication and authorization.
- CRUD operations for projects and tasks.
- Role-based access control.
- RESTful API design.
- Database integration.

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/your-repo/gestion-projet.git
    ```
2. Navigate to the server directory:
    ```bash
    cd /C:/Users/Zied-Convergen/Desktop/GestionProjet/server
    ```
3. Install dependencies:
    ```bash
    npm install
    ```

## Usage

1. Start the development server:
    ```bash
    npm run dev
    ```
2. Access the API at `http://localhost:3000`.

## Environment Variables

Create a `.env` file in the root directory and configure the following variables:

```env
PORT=3000
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
```

## API Endpoints

- **GET /api/projects** - Retrieve all projects.
- **POST /api/projects** - Create a new project.
- **PUT /api/projects/:id** - Update a project.
- **DELETE /api/projects/:id** - Delete a project.
- **GET /api/tasks** - Retrieve all tasks.
- **POST /api/tasks** - Create a new task.

## Technologies Used

- Node.js
- Express.js
- MongoDB (or your database of choice)
- JWT for authentication

## License

This project is licensed under the MIT License.