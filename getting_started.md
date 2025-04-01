# Getting Started with sTeX-React

This guide walks you through setting up and running the **sTeX-React** project, which includes:
- **alea-frontend** (Next.js frontend)

## Prerequisites  
Ensure you have the following installed on your system before proceeding:
- **Node.js** (Recommended: `v18+`) – [Download](https://nodejs.org/)
- **npm** (Recommended: `v9+`) – Comes with Node.js
- **Git** – [Download](https://git-scm.com/)
- **MySQL** & **MySQL Workbench** – [Download](https://dev.mysql.com/downloads/)

```sh
npm install -g nx
```

## Installation  

1. **Clone the Repository**  
   ```sh
   git clone https://github.com/slatex/sTeX-React.git
   cd stex-react
   ```

2. **Install Dependencies**  
   ```sh
   npm install
   ```

## Database Setup

1. **Check for SQL Setup Files**
   - Navigate to the project folder and locate the `comments_database_setup` directory.
   - Inside, you will find SQL scripts for setting up the database.

2. **Run SQL Scripts**
   - Open MySQL Workbench.
   - Execute the SQL queries from the `comments_database_setup` folder to create the necessary database and tables.

## Running the Applications  

### alea-frontend (Next.js)  

#### Local Development  
```sh
npm run start alea-frontend
```
- Runs on `http://localhost:4200`  

## Access Control List (ACL) Setup  

1. **Create ACL**  
   - Visit `/acl` in the application.  
   - Create a new ACL with:
     - ACL ID: `sys-admin`
     - Description: `sys-admin`
     - Member ID: `fake_joy`
     - Updater ACL: `sys-admin`

2. **Modify `ResourceAccess` Table**  
   Run:  
   ```sql
   INSERT INTO ResourceAccess (resourceId, actionId, aclId)
   VALUES ('/**', 'ACCESS_CONTROL', 'sys-admin');
   ```

## Fake User Login

1. **Login Flow**  
   - User clicks on the **Login** button when getting started.
   - A warning message appears, and the user must click on the **warning** word.
   - The user then enters a 3-letter word (e.g., `abc`, `xyz`).
   - The system automatically creates a fake user with the username `fake_abc` or `fake_xyz`.
  
