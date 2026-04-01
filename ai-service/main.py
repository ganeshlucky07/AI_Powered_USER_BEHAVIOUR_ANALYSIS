from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
import os

app = FastAPI(title="Risk Score AI Service", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model at startup
model_path = os.path.join(os.path.dirname(__file__), 'model.pkl')
model = None

@app.on_event("startup")
async def load_model():
    global model
    try:
        model = joblib.load(model_path)
        print("Model loaded successfully")
    except Exception as e:
        print(f"Error loading model: {e}")
        model = None

class Input(BaseModel):
    loginTime: int
    failAttempts: int
    locationChange: int
    txnAmount: float

class RiskResponse(BaseModel):
    risk: int
    level: str

@app.get("/")
def root():
    return {"status": "AI Service Running", "model_loaded": model is not None}

@app.post("/predict", response_model=RiskResponse)
def predict(data: Input):
    global model
    
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        x = np.array([[data.loginTime, data.failAttempts, data.locationChange, data.txnAmount]])
        proba = model.predict_proba(x)[0][1]
        risk = int(proba * 100)
        
        # Determine risk level
        if risk <= 30:
            level = "LOW"
        elif risk <= 70:
            level = "MEDIUM"
        else:
            level = "HIGH"
        
        return {"risk": risk, "level": level}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health():
    return {"status": "healthy", "model_loaded": model is not None}
