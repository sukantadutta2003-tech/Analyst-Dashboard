# ☕ AI Data Analyst Dashboard

An AI-powered web dashboard built with **Java (Spring Boot)** and **React**. This enterprise-grade application allows users to upload CSV files, ask questions in natural language, and instantly receive dynamic charts, insights, and summaries driven by AI.

## 🌟 Features

- **Robust CSV Engine**: Instantly ingest and parse large CSV files via Apache Commons CSV.
- **Dynamic SQL-like Execution**: The backend processes dynamic `SUM`, `AVG`, `MIN`, `MAX`, `COUNT`, and `GROUP BY` instructions injected via JSON schemas.
- **AI-Powered Analytics**: Ask plain-English questions ("What is the average salary by department?"). The natural language pipeline maps user intent into exact data processes.
- **Dynamic Visualizations**: Automatically generated Bar, Line, Pie, and Data Tables using **Recharts**.
- **Rule-Based Fallback Engine**: Don't have an OpenAI API key? The system gracefully falls back to a rule-based NLP parser looking for analytical keywords.

## 🛠️ Technology Stack

| Component | Technology |
|---|---|
| **Backend Framework** | Spring Boot 3.5.0, Java 21 |
| **Database** | PostgreSQL |
| **Data Orchestration** | Spring Data JPA, Jackson |
| **CSV Parsing** | Apache Commons CSV |
| **Frontend Framework** | React 18, Vite 5 |
| **Styling & UI** | Tailwind CSS v3, Lucide React Icons |
| **Data Visualization** | Recharts |
| **AI Integration** | OpenAI REST API (`gpt-3.5-turbo`) |

## 🚀 Getting Started Locally

### Prerequisites
- **Java 21**
- **Node.js 18+**
- **PostgreSQL** running on port 5432 (Database named `analyst_dashboard` with user/pass `postgres`/`postgres`)

### 1. Start the Spring Boot Backend

Open a terminal and build the backend:
```bash
cd backend
./mvnw spring-boot:run
```
*The backend will automatically start on `http://localhost:8080`.*

### 2. Configure OpenAI (Optional)
To enable the actual AI completion engine, export your OpenAI key before launching the backend:
```bash
export OPENAI_API_KEY="sk-your-api-key"
./mvnw spring-boot:run
```

### 3. Start the React Frontend

Open a new terminal session and run:
```bash
cd frontend
npm install
npm run dev
```
*The Vite frontend will spin up at `http://localhost:5173`.*

## 📂 Project Architecture

```
analyst-dashboard/
├── backend/                      # Spring Boot Server
│   ├── src/main/java/com/analyst/dashboard/
│   │   ├── config/               # CORS Settings
│   │   ├── controller/           # REST endpoints
│   │   ├── dto/                  # Data Transfer Objects
│   │   ├── model/                # JPA Entities (Dataset handling JSON columns)
│   │   ├── repository/           # Spring Data Interfaces
│   │   └── service/              # Core Logic (CsvParser, OpenAIService)
│   └── src/main/resources/       # application.properties (DB logic)
│
├── frontend/                     # React + Vite Client
│   ├── src/
│   │   ├── components/           # Reusable UI (Sidebar, ChartDisplay)
│   │   ├── pages/                # App views (Dashboard, Upload, Analysis)
│   │   ├── services/             # Axios API integration
│   │   ├── App.jsx               # React Router
│   │   └── index.css             # Tailwind Directives
│   ├── tailwind.config.js
│   └── vite.config.js
```

## 📋 API Endpoints

- `POST /api/datasets/upload` — Upload a CSV (multipart/form-data)
- `GET /api/datasets` — Retrieve short summaries of all uploaded data
- `GET /api/datasets/{id}` — Retrieve the full Dataset schema, columns, and rows
- `POST /api/datasets/{id}/query` — Manually query a dataset
- `POST /api/ai/query` — Pass natural language to the AI to query the dataset 

## ✨ Deployment

This project is optimized for modern cloud deployments:
- **Backend**: Containerize using Docker or deploy directly via Spring Boot buildpack onto Render/Railway.
- **Frontend**: Standard static dist build perfectly suited for Vercel, Netlify, or Cloudflare Pages.
- **Database**: Managed PostgreSQL instance (e.g. Render, Supabase, Neon).
