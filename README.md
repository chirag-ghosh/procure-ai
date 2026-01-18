# 🤖 AI-Powered RFP Management System

A full-stack intelligent procurement platform that automates the Request for Proposal (RFP) lifecycle. It transforms natural language requests into structured data, manages vendor communications via email, and uses AI to parse and score incoming proposals (including PDF attachments).

## 🚀 Key Features

* **Natural Language to RFP:** Converts raw text (e.g., "I need 20 laptops...") into structured JSON requirements using **Google Gemini AI**.
* **Automated Vendor Communication:** Sends professional, HTML-formatted RFP emails with unique tracking IDs.
* **Intelligent Parsing:** Auto-detects email replies, extracts text from bodies **and PDF attachments**, and maps them to structured proposal data.
* **AI Scoring Engine:** Evaluates vendor proposals against the original budget and technical constraints, providing a 0-100 score and executive summary.
* **Lifecycle Tracking:** Automatically tracks status from `Draft` → `Sent` → `Received`.

---

## 🛠 Tech Stack

* **Frontend:** React (Vite), TypeScript, Sass
* **Backend:** Node.js, Express, TypeScript
* **Database:** PostgreSQL, Drizzle ORM (Type-safe SQL)
* **AI Provider:** Google Gemini API (`gemini-1.5-flash`)
* **Email Engine:**
    * **Sending:** Nodemailer (SMTP)
    * **Receiving:** `imap-simple` + `mailparser`
    * **Parsing:** `pdf-parse` (for attachment extraction)
* **Infrastructure:** Docker & Docker Compose
* **Scheduling:** `node-cron` (for background email sync)

---

## ⚙️ Project Setup

### 1. Prerequisites
* **Docker** installed and running.
* **Google Gemini API Key** (Get one [here](https://aistudio.google.com/)).
* **Email Account:** A Gmail account with **App Password** enabled.

### 2. Environment Variables
Create a `.env` file in the root directory. Use the provided `.env.example` as a template:

```properties
# Database (Docker Internal)
POSTGRES_USER=myuser
POSTGRES_PASSWORD=mypassword
POSTGRES_DB=rfp_db
DB_HOST=db
DB_PORT=5432

# Connection Strings
DATABASE_URL=postgres://myuser:mypassword@db:5432/rfp_db

# AI Configuration
GEMINI_API_KEY=AIzaSy...

# Email Configuration (IMAP/SMTP)
# NOTE: If using Gmail, use an App Password, not your login password.
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
IMAP_HOST=imap.gmail.com
IMAP_PORT=993

# Web Configuration
BACKEND_PORT=3000
FRONTEND_PORT=5173
VITE_API_URL=http://localhost:3000
```

### 3. Installation & Running
The entire stack is containerized. You do not need to install Node/Postgres locally.

1.  **Build and Start:**
    ```bash
    docker-compose up --build
    ```
2.  **Automatic Seeding:**
    * On startup, the backend automatically runs migrations and seeds the database with initial Vendors (TechDepot, Global Hardware).
    * Watch the container logs for: `✅ Seeding completed.`

3.  **Access the App:**
    * **Frontend:** [http://localhost:5173](http://localhost:5173)
    * **Backend:** [http://localhost:3000](http://localhost:3000)
    * **Database:** Connect via DBeaver to `localhost:5432`

---

## 📡 API Documentation

### 1. System Health
* **GET** `/health`
* **Response:** Returns `{ status: "ok", timestamp: "..." }` to verify the backend is running.

### 2. List Vendors
* **GET** `/api/vendors`
* **Response:** Returns a list of all registered vendors (id, name, email, category).

### 3. List All RFPs
* **GET** `/api/rfps`
* **Response:** Returns a list of all RFPs, sorted by newest first. Includes a `proposalCount` field for dashboard displays.

### 4. Generate RFP Structure
* **POST** `/api/rfps/generate`
* **Body:** `{ "prompt": "I need 50 ergonomic chairs, budget $5k" }`
* **Response:** Returns a JSON object with `title`, `budget`, and `structuredRequirements` (Items, Terms).

### 5. Send RFP to Vendors
* **POST** `/api/rfps/:id/send`
* **Body:** `{ "vendorIds": [1, 2] }`
* **Effect:** Sends HTML emails to selected vendors and creates "Sent" proposal records.

### 6. Sync & Process Emails
* **POST** `/api/rfps/sync-emails`
* **Effect:** Triggers the IMAP crawler to find unread replies, parses attachments, and updates proposals. (Also runs automatically every 10 mins).

### 7. Get RFP with Proposals
* **GET** `/api/rfps/:id`
* **Response:** Returns the RFP details + list of proposals with their `aiScore` and `aiSummary`.

---

## 🧠 Design Decisions & Assumptions

### 1. Data Modeling (Hierarchical)
I separated the RFP data into **Line Items** (for quantitative comparison) and **Commercial Terms** (for policy checks). This allows the frontend to render a clean view while allowing the AI to validate terms like "Net 30" independently of the hardware specs.

### 2. Email Tracking Strategy
Instead of relying on fuzzy logic or time-windows to match emails to RFPs, I enforced a strict subject line policy: `[RFP-{ID}]`.
* **Why?** This guarantees 100% accuracy in mapping a vendor reply to the correct database record.
* **Assumption:** Vendors will hit "Reply" and not alter the subject line (a standard business practice).

### 3. AI Scoring Logic
The AI is not given the authority to "Accept" a bid. Instead, it acts as an **Evaluator**:
* It assigns a **Score (0-100)** based on budget fit and spec compliance.
* It generates a **Pros/Cons summary**.
* **Trade-off:** This keeps the human in the loop for the final decision while removing the manual labor of reading 10-page PDFs.

### 4. PDF Parsing
Vendor quotes often come as attachments. I integrated `pdf-parse` to flatten PDF content into text before feeding it to Gemini. This allows the system to "read" official quote documents just like email body text.

---

## 🤖 AI Tools Usage

* **Tools Used:** Google Gemini 1.5 Flash, VS Code.
* **Prompt Engineering:**
    * Used **JSON Schema enforcement** in prompts to ensure Gemini returns strict JSON compatible with the Postgres `jsonb` columns.
    * *Example Prompt:* "Output strictly valid JSON with this schema: { score: number, summary: string }".
* **Assistance:**
    * AI was crucial for generating the complex Regex logic needed to parse email headers.
    * Also helped in writing CSS code after I wrote the initial styles.
