# TasteMate Project

## 1. Introduction

TasteMate is a lightweight web-based system consisting of a **Frontend (React)** and a **Backend (Node.js & Express.js)**, designed to provide food recommendation and data management functionalities. The project follows a web client server architecture and communicates via RESTful APIs.

During the course project, the system was **deployed on AWS** with:

* **S3**: hosting the Frontend
* **EC2**: running the Backend (Node.js)
* **RDS**: storing the Database

However, due to **high maintenance costs**, the entire cloud infrastructure is currently **shut down**, so the application **cannot be accessed via a public website**. To use it, you need to **clone the project and run it locally** following the instructions below.

---

## 2. Project Structure

```
TasteMate/
├── react-taste-mate/        # Frontend (React)
└── node-taste-mate/         # Backend (Node.js)
```

---

## 3. Environment Requirements

* Node.js >= 18
* npm or yarn
* SQL Server (only required if connecting to the real database)
* Postman (optional, for API testing)

---

## 4. How to Run the Project

### 1️⃣ Clone the source code

```bash
git clone <repo-url>
cd TasteMate
```

---

### 2️⃣ Setup & Run Backend (Node.js)

#### Step 1: Navigate to backend directory

```bash
cd node-taste-mate
```

#### Step 2: Install dependencies

```bash
npm install
```

#### Step 3: Create `.env` file

Create a `.env` file inside the **node-taste-mate/** directory with the following content:

```env
PORT=5000
SEQ_USER=sa
SEQ_PASSWORD=ly22520836
SEQ_SERVER=26.35.128.108
SEQ_DATABASE=TasteMate
SEQ_PORT=1433

JWT_SECRET=f6fcafe2-c601-4269-9d7e-5f1938966fab
JWT_EXPIRES_IN=1d
```

⚠️ **Important notes:**

* The `TasteMate` database is only accessible when **connected to Ly’s machine via Radmin VPN**.
* If not connected to the VPN, the backend can still run, but **database-dependent features will not work**.

📩 To request VPN access, please contact:

> **Email:** [22520836@gm.uit.edu.vn](mailto:22520836@gm.uit.edu.vn)

---

#### Step 4: Run Backend

```bash
npm start
```

The backend will be available at:

```
http://localhost:5000
```

---

### 3️⃣ Setup & Run Frontend (React)

#### Step 1: Navigate to frontend directory

```bash
cd ../react-taste-mate
```

#### Step 2: Install dependencies

```bash
npm install
```

#### Step 3: Create `.env` file

Create a `.env` file inside **react-taste-mate/** with the following content:

```env
VITE_BACKEND_URL="http://localhost:5000/"
```

#### Step 4: Run Frontend

```bash
npm run dev
```

Once running, access the application at:

```
http://localhost:5173
```

---

## 5. Important Notes

* The system **was fully deployed on AWS in the past**, but all instances are currently **shut down to reduce costs**.
* To use the system now, you must either:

  * Run everything locally, or
  * Connect to Ly’s machine via VPN to access the database.
* The entire codebase is intended for **educational and course-report purposes**.

---

## 6. Contact

For setup assistance or database access requests:

📧 **Email:** [22520836@gm.uit.edu.vn](mailto:22520836@gm.uit.edu.vn)