# CausalPulse

> Institutional-grade multi-service platform for causal inference, financial decision intelligence, and econometric research tearsheets.

![License](https://img.shields.io/badge/license-MIT-black)
![Next.js](https://img.shields.io/badge/frontend-Next.js-black)
![FastAPI](https://img.shields.io/badge/backend-FastAPI-009688)
![Python](https://img.shields.io/badge/python-3.10%2B-blue)
![Node](https://img.shields.io/badge/node-18%2B-green)

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture & Tech Stack](#️-architecture--tech-stack)
- [Live Deployment](#-live-deployment)
- [Local Development Setup](#️-local-development-setup)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Deployment](#-deployment)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🔭 Overview

CausalPulse separates heavy econometric and machine learning workloads from a reactive client dashboard. The backend handles statistical modeling, causal estimation, and Monte Carlo simulation, while the frontend presents the results as clean, editorial-style research tearsheets designed for analysts and decision-makers.

---

## ✨ Features

- **Causal Inference Engine:** Estimate treatment effects from observational and experimental data using statistical and ML-based methods.
- **Financial Decision Intelligence:** Turn model outputs into actionable, quantified decision support.
- **Monte Carlo Simulation:** Stress-test assumptions and quantify uncertainty across thousands of simulated scenarios.
- **Econometric Research Tearsheets:** Generate concise, publication-style summaries of results, diagnostics, and confidence intervals.
- **Editorial Monochromatic UI:** A minimal, high-contrast dashboard built for readability and focus.
- **Decoupled Services:** Independently deployable frontend and backend for scalability and maintainability.

---

## 🏗️ Architecture & Tech Stack

CausalPulse is structured as a multi-service repository, separating heavy econometric and machine learning workloads from the reactive client dashboard.

| Layer | Directory | Technologies |
|-------|-----------|--------------|
| **Frontend** | `/frontend` | Next.js, Tailwind CSS, Lucide React |
| **Backend** | `/backend` | FastAPI, Pandas, NumPy, SciPy, Scikit-Learn |
| **Deployment** | root | Vercel (monorepo mapping via `vercel.json`) |

```
┌──────────────────────┐        HTTP / JSON        ┌───────────────────────────┐
│  Next.js Dashboard   │ ────────────────────────► │  FastAPI Statistical API  │
│  (Tailwind, Lucide)  │ ◄──────────────────────── │  (Pandas, SciPy, sklearn) │
└──────────────────────┘                           └───────────────────────────┘
```

---

## 🚀 Live Deployment

- **Production Dashboard:** [https://causal-pulse-tfvb.vercel.app/dashboard](https://causal-pulse-tfvb.vercel.app/dashboard)

---

## 🛠️ Local Development Setup

### Prerequisites

- Node.js (v18+)
- Python (v3.10+)
- Conda or `virtualenv`

### 1. Clone the Repository

```bash
git clone https://github.com/anushkaaa26/causal-pulse.git
cd causal-pulse
```

### 2. Run the FastAPI Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r ../requirements.txt
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.

### 3. Run the Next.js Frontend

Open a new terminal tab:

```bash
cd frontend
npm install
npm run dev
```

The client dashboard will be available at `http://localhost:3000`.

---

## 🔐 Environment Variables

If the frontend needs to know where the backend lives, create a `frontend/.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

> Adjust the variable name to match what your frontend code actually reads.

---

## 📡 API Documentation

With the backend running, FastAPI automatically serves interactive docs:

- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

---

## 📂 Project Structure

```
causal-pulse/
├── frontend/          # Next.js client application & dashboard components
├── backend/           # FastAPI engine & statistical processing modules
├── requirements.txt   # Python econometric & ML pipeline dependencies
├── vercel.json        # Vercel monorepo deployment mapping
├── LICENSE
└── README.md
```

---

## ☁️ Deployment

The repository is configured for monorepo deployment on Vercel via `vercel.json`, which maps the frontend and backend services to their respective build targets.

1. Push your changes to the `main` branch.
2. Vercel builds and deploys automatically.
3. Set any required environment variables in the Vercel project settings.

---

## 🗺️ Roadmap

- [ ] Additional causal estimators and robustness checks
- [ ] Exportable tearsheets (PDF / HTML)
- [ ] Dataset upload and management
- [ ] Authentication and saved research workspaces
- [ ] Automated test suite and CI pipeline

---

## 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
