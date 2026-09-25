# EarthRe SLA Monitoring Dashboard

## Overview
**EarthRe SLA Monitoring Dashboard** is a serverless data pipeline and analytics dashboard designed to monitor SLA compliance, availability, and response latency across EarthRe's 5 core microservices:
1. `svc-auth` (Authentication API)
2. `svc-payments` (Payments API)
3. `svc-search` (Search Service)
4. `svc-reports` (Reporting Engine)
5. `svc-notify` (Notification Worker)

---

## Tech Stack
- **Frontend**: React 19 + Vite 6 + Tailwind CSS v4 (Dark Glassmorphism UI)
- **Backend**: AWS Lambda (Node.js 20.x runtime) + API Gateway (AWS SAM)
- **Database**: PostgreSQL (`earthre_sla_monitor`)
- **Deployment**: AWS Lambda + Vercel

---

## Project Structure
- [`backend/`](./backend/README.md) - Serverless AWS Lambda API, PostgreSQL database schema, data cleaning pipeline, and test scripts.
- [`frontend/`](./frontend/README.md) - React 19 + Vite 6 + Tailwind CSS v4 Dashboard UI.
- `sample_data/` - Official EarthRe monitoring dataset CSV files.

---

## Quick Start
- **Backend Setup & Testing**: See [Backend README](./backend/README.md)
- **Frontend Setup & Development**: See [Frontend README](./frontend/README.md)
