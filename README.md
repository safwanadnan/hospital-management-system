# Hospital Management System

Hospital Management System project for Database Management System Course for third year BSc. Computer Scienceat IBA, Karachi.

## Getting Started

### Prerequisites
- Node.js
- npm or yarn
- Oracle Database 19c or higher

### Installation
1. Clone the repository
```bash
git clone https://github.com/safwanadnan/hospital-management-system.git
```
2. Install dependencies
```bash
#Install server dependencies
cd server
npm install
```
```bash
#Install client dependencies
cd client
npm install
```

### Database Setup
1. Create `database.js` file in `server/config` directory with the following structure:
```javascript
module.exports = {
    user: "your_username",
    password: "your_password",
    connectString: "localhost:1521/your_service_name"
};
```

2. Configure your Oracle database credentials:
   - Replace `your_username` with your Oracle database username
   - Replace `your_password` with your Oracle database password
   - Replace `your_service_name` with your Oracle service name (usually `XEPDB1` for Oracle XE)

3. Initialize the database:
   - Connect to your Oracle database using SQL*Plus or Oracle SQL Developer
   - Open the `dbqueries.sql` file in the root directory
   - Execute all queries in the file sequentially to create necessary tables and initial data

### Running the Application
1. Start the server
```bash
cd server
npm start
```

2. Start the client
```bash
cd client
npm start
```

## License
This project is licensed under the MIT License