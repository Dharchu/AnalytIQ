# AnalytIQ - Excel Analytics Platform

**Live Demo**: [https://analytiq-app.onrender.com](https://analytiq-app.onrender.com)

A powerful MERN stack platform for uploading any Excel file (.xls or .xlsx), analyzing the data, and generating interactive 2D charts. Users can select X and Y axes from the column headers of the Excel file, choose chart types, and generate downloadable graphs.

## Key Features

- **Excel File Upload and Parsing**: Supports `.xls` and `.xlsx` files.
- **Dynamic Chart Generation**: Create Bar, Line, and Pie charts by selecting X and Y axes.
- **Downloadable Charts**: Download charts as PNG or PDF.
- **User Authentication**: Secure JWT-based authentication for users and admins.
- **Analysis History**: Each user's analysis history is saved and visible on their dashboard.
- **Admin Dashboard**: Admins can view all users and manage their analysis history.

## Tech Stack

- **Frontend**: React.js, Chart.js, Tailwind CSS
- **Backend**: Node.js, Express.js, MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **File Handling**: Multer, SheetJS/xlsx

---

## Project Setup

Follow these steps to run the project locally.

### 1. Install Dependencies

Install the necessary packages for the root, backend, and frontend.

```bash
# From the root directory (d:\AnalytIQ)
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables

1.  Navigate to the `backend` directory.
2.  Create a file named `.env`.
3.  Add the following variables, replacing the placeholder values with your own:
    ```
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_super_secret_jwt_key
    PORT=5000
    ```

### 3. Create an Admin User (Required for Admin Dashboard)

**Important**: For security reasons, there are no default admin credentials. You must create an admin user manually by following these steps. This prevents shipping default credentials in a production environment.

1.  **Sign up** for a new account through the application's regular signup page.
2.  **Connect** to your MongoDB database using a tool like MongoDB Compass or the `mongo` shell.
3.  Navigate to the `users` collection and find the user you just created.
4.  **Edit** the user's document and change the `role` field from `"user"` to `"admin"`.

After completing these steps, you can log in with the email and password you signed up with to access the admin dashboard.

#### Sample Admin Credentials (For Local Demo)

For a quick local demonstration, you can use the following credentials. You must first create this user through the signup page and then promote them to an admin in the database as described above.

-   **Username**: `Admin`
-   **Password**: `admin123`

**Security Warning**: These credentials are for local testing and demonstration only. Do not use them in a production environment. Always follow the secure practice of creating your own unique admin user for any real deployment.

### 4. Run the Application

Navigate back to the root directory (`d:\AnalytIQ`) and run the development script:

```bash
npm run dev
```

The application will be available at `http://localhost:5175` (or the next available port).