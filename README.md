# User Behavior Risk Score Engine

AI-powered full-stack application for analyzing user behavior and calculating risk scores.

## Tech Stack

- **Frontend**: React 18 with Chart.js
- **Backend**: Spring Boot 3.2 (Java 17)
- **Database**: MySQL
- **AI Service**: Python FastAPI with RandomForest model
- **Deployment**: Render

## Features

### Core Features
- Real-time risk score calculation (0-100)
- Risk levels: LOW (0-30), MEDIUM (31-70), HIGH (71-100)
- AI-powered prediction using RandomForest model
- Interactive dashboard with multiple chart types (bar, line, doughnut)
- High-risk alert system with visual indicators
- Data persistence to JSON file (survives server restarts)

### Authentication & Security
- JWT-based user authentication
- User registration and login
- Password encryption with BCrypt
- Protected routes for authenticated users
- Profile management (update info, change password)
- Role-based access control (USER, ADMIN)

### Dashboard & Analytics
- Statistics cards showing risk distribution
- Advanced filtering by risk level (LOW, MEDIUM, HIGH)
- Date range filtering for time-based analysis
- Search functionality by ID or risk score
- CSV export functionality for data download
- Real-time data visualization with Chart.js
- Responsive data table with risk level color coding

### UI/UX
- Dark/Light theme toggle with persistence
- Modern, responsive card-based design
- Loading spinners and error handling
- Mobile-friendly responsive layout
- Intuitive navigation with active state indicators
- Risk meter visualization with color gradients

---

## Project Structure

```
risk-score-engine/
├── ai-service/                 # Python FastAPI AI Service
│   ├── main.py                 # FastAPI app
│   ├── train_model.py          # Model training script
│   ├── model.pkl               # Trained model (generated)
│   ├── requirements.txt        # Python dependencies
│   ├── Dockerfile
│   └── render.yaml
│
├── backend/                    # Spring Boot Backend
│   ├── src/main/java/com/riskscore/
│   │   ├── RiskScoreEngineApplication.java
│   │   ├── config/
│   │   ├── controller/
│   │   ├── model/
│   │   ├── repository/
│   │   └── service/
│   ├── src/main/resources/
│   │   └── application.properties
│   ├── pom.xml
│   ├── Dockerfile
│   └── render.yaml
│
├── frontend/                   # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── render.yaml
│
└── README.md
```

---

## Local Setup

### Prerequisites

- Java 17+
- Node.js 18+
- Python 3.11+
- MySQL 8.0+

### 1. Database Setup

```sql
CREATE DATABASE riskdb;
```

Or use MySQL Workbench/XAMPP to create the database.

### 2. AI Service Setup

```bash
cd ai-service

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Train the model (generates model.pkl)
python train_model.py

# Run the service
uvicorn main:app --reload --port 8000
```

AI Service runs at: `http://localhost:8000`

### 3. Backend Setup

```bash
cd backend

# Set environment variables (Windows PowerShell)
$env:DB_URL="jdbc:mysql://localhost:3306/riskdb"
$env:DB_USERNAME="root"
$env:DB_PASSWORD="your_password"
$env:AI_SERVICE_URL="http://localhost:8000"

# Set environment variables (Mac/Linux)
export DB_URL="jdbc:mysql://localhost:3306/riskdb"
export DB_USERNAME="root"
export DB_PASSWORD="your_password"
export AI_SERVICE_URL="http://localhost:8000"

# Build and run
mvn spring-boot:run
```

Backend runs at: `http://localhost:8080`

### 4. Frontend Setup

```bash
cd frontend

# Create .env file
cp .env.example .env

# Install dependencies
npm install

# Run development server
npm start
```

Frontend runs at: `http://localhost:3000`

---

## API Endpoints

### Backend APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/analyze` | Analyze user behavior and get risk score |
| GET | `/api/all` | Get all activity records |
| GET | `/api/high-risk` | Get high-risk activities |
| GET | `/api/health` | Health check |

### AI Service APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Service status |
| POST | `/predict` | Get risk prediction |
| GET | `/health` | Health check |

---

## API Testing (Postman)

### POST /api/analyze

**URL**: `http://localhost:8080/api/analyze`

**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "loginTime": 3,
  "failAttempts": 5,
  "locationChange": 1,
  "txnAmount": 7500
}
```

**Response**:
```json
{
  "risk": 85,
  "level": "HIGH"
}
```

### GET /api/all

**URL**: `http://localhost:8080/api/all`

**Response**:
```json
[
  {
    "id": 1,
    "loginTime": 3,
    "failAttempts": 5,
    "locationChange": 1,
    "txnAmount": 7500,
    "riskScore": 85,
    "riskLevel": "HIGH",
    "createdAt": "2024-01-15T10:30:00"
  }
]
```

### POST /predict (AI Service)

**URL**: `http://localhost:8000/predict`

**Body**:
```json
{
  "loginTime": 3,
  "failAttempts": 5,
  "locationChange": 1,
  "txnAmount": 7500
}
```

**Response**:
```json
{
  "risk": 85,
  "level": "HIGH"
}
```

---

## Render Deployment

### Step 1: Create MySQL Database

Use one of these providers:
- **PlanetScale** (https://planetscale.com)
- **Railway** (https://railway.app)
- **Aiven** (https://aiven.io)

Get connection details: `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`

### Step 2: Deploy AI Service

1. Create Render account: https://render.com
2. Create new **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `risk-ai-service`
   - **Region**: Oregon (US West)
   - **Branch**: main
   - **Root Directory**: `ai-service`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt && python train_model.py`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

5. Deploy and note the URL (e.g., `https://risk-ai-service.onrender.com`)

### Step 3: Deploy Spring Boot Backend

1. Create new **Web Service**
2. Configure:
   - **Name**: `risk-backend`
   - **Region**: Oregon (US West)
   - **Branch**: main
   - **Root Directory**: `backend`
   - **Runtime**: Java 17
   - **Build Command**: `mvn clean package -DskipTests`
   - **Start Command**: `java -jar target/risk-score-engine-1.0.0.jar`

3. Add Environment Variables:
   - `DB_URL`: Your MySQL connection URL
   - `DB_USERNAME`: Database username
   - `DB_PASSWORD`: Database password
   - `AI_SERVICE_URL`: Your AI service URL from Step 2

4. Deploy

### Step 4: Deploy React Frontend

1. Create new **Static Site**
2. Configure:
   - **Name**: `risk-frontend`
   - **Region**: Oregon (US West)
   - **Branch**: main
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`

3. Add Environment Variable:
   - `REACT_APP_API_URL`: Your backend URL (e.g., `https://risk-backend.onrender.com/api`)

4. Deploy

---

## Risk Calculation Logic

### AI Model (Primary)
- RandomForest classifier trained on synthetic data
- Predicts probability of high-risk behavior
- Returns score 0-100

### Fallback Formula (When AI unavailable)
```
score = 0

if loginTime < 6:           # Late night login
    score += 20

score += failAttempts * 8   # Failed attempts

if locationChange == 1:     # Location changed
    score += 25

if txnAmount > 5000:        # High transaction
    score += 30
elif txnAmount > 2000:
    score += 15

score = min(score, 100)
```

---

## Environment Variables

### Backend
| Variable | Description | Example |
|----------|-------------|---------|
| DB_URL | MySQL connection URL | `jdbc:mysql://localhost:3306/riskdb` |
| DB_USERNAME | Database username | `root` |
| DB_PASSWORD | Database password | `password` |
| AI_SERVICE_URL | AI service URL | `http://localhost:8000` |

### Frontend
| Variable | Description | Example |
|----------|-------------|---------|
| REACT_APP_API_URL | Backend API URL | `http://localhost:8080/api` |

---

## Screenshots

### Landing Page
Modern hero section with feature cards showcasing AI capabilities.

### Input Form
- Form inputs for user behavior data
- Real-time risk meter visualization
- Color-coded risk level display

### Dashboard
- Statistics cards (Total, Low, Medium, High)
- Bar chart for risk distribution
- Line chart for risk trends
- Doughnut chart for breakdown
- Searchable/filterable data table
- High-risk row highlighting

---

## Future Features

### Batch Operations
- CSV import for bulk risk analysis
- Batch processing with progress indicators
- Template downloads for bulk uploads

### Advanced Analytics
- User-specific risk score history tracking
- Trend analysis over time periods
- Predictive risk forecasting
- Comparative analysis between users

### Notifications & Alerts
- Email notifications for high-risk activities
- Real-time WebSocket alerts
- Configurable alert thresholds
- SMS notifications (Twilio integration)

### Multi-language Support
- i18n implementation for multiple languages
- Language selector in UI
- RTL support for Arabic/Hebrew

### Admin Features
- Admin dashboard with user management
- Role assignment and permissions
- System settings configuration
- Audit logs for all activities

### Integration & API
- REST API documentation (Swagger/OpenAPI)
- API rate limiting
- Webhook support for external integrations
- Third-party authentication (OAuth2)

---

## Troubleshooting

### AI Service won't start
- Ensure `model.pkl` exists (run `python train_model.py`)
- Check Python version (3.11+)

### Backend database connection fails
- Verify MySQL is running
- Check DB_URL format: `jdbc:mysql://host:port/database`
- Ensure database exists

### Frontend can't reach backend
- Check CORS configuration
- Verify REACT_APP_API_URL is correct
- For production, ensure HTTPS is used

### High latency on Render
- Render free tier has cold start delays
- Consider upgrading to paid plan for production

---

## License

MIT License
