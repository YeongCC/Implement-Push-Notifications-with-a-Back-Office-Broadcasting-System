# Implement Push Notifications with a Back Office Broadcasting System

Build a simple user inbox application with push notification functionality and an admin panel to broadcast messages. This project demonstrates full-stack development, real-time communication, and integration of third-party services.


## Project Overview
This project consists of a real-time chat application with notifications, divided into two main parts:

### Frontend:
- Built with **Next.js** and styled with **Bootstrap** for a responsive and interactive user interface.

### Backend:
- Developed using **NestJS**, utilizing WebSockets for real-time chat functionality and Web API for push notifications.

## Prerequisites
Before running the project, ensure that you have the following installed:

- **Node.js** (LTS version recommended) – [Download Node.js](https://nodejs.org)
- **MongoDB** (for data storage, use either a local or hosted instance)

---

## Running the Backend (NestJS)

### Steps to Run the Backend:

1. Open a terminal or command prompt.

2. Navigate to the backend project folder:
    ```bash
    cd path/to/your/backend
    ```

3. Configure Web Push Keys and Environment Variables:
    - Generate VAPID keys for push notifications:
      ```bash
      npx web-push generate-vapid-keys
      ```
    - Place the generated keys and your email in the `.env` file:
      ```env
      VAPID_PUBLIC_KEY=your_public_key
      VAPID_PRIVATE_KEY=your_private_key
      EMAIL=your_email@example.com
      ```

4. Import User Data (Optional):
    - This project includes a sample dataset for users. Use `exp.users.json` to populate the database.
    - Import `exp.users.json` into MongoDB. All sample users have the password `password123`.

5. Install Dependencies and Start the Backend Server:
    ```bash
    npm install
    npm run start
    ```
    - The backend will start on `http://localhost:3000` by default.

### Admin Credentials
- The project includes static admin credentials:
  - **Email**: `admin@example.com`
  - **Password**: `admin123`

---

## Running the Frontend (Next.js)

### Steps to Run the Frontend:

1. Open a terminal or command prompt.

2. Navigate to the frontend project folder:
    ```bash
    cd path/to/your/frontend
    ```

3. Configure the Environment File:
    - In `.env.local`, add the public VAPID key generated during the backend setup:
      ```env
      NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key
      ```

4. Install Dependencies and Start the Frontend Application:
    ```bash
    npm install
    npm run dev
    ```
    - The frontend will start on `http://localhost:3001`.

### Accessing the Application
- Open your browser and navigate to `http://localhost:3001`.
- Key functionalities include:
  - User login and chat capabilities with other users.
  - Real-time message notifications for all users.
  - Admin functionality to send notifications to users.

---

## Additional Information

### Database Setup:
- The backend utilizes **MongoDB** for data storage.
- Ensure your MongoDB instance is running and accessible.

### User Authentication and Chat Features:
- Users can log in, chat with others, and receive message notifications.
- Admins have the ability to send notifications to users.

### Web Push Notifications:
- Make sure to configure your VAPID keys in both the frontend and backend `.env` files as described above.
- Notifications are triggered for both chat messages and admin announcements.

### Troubleshooting:
- If you encounter issues with notifications, verify your VAPID key setup and ensure both frontend and backend `.env` files are correctly configured.
- Check that MongoDB is running and accessible to avoid connection issues.
  
---  