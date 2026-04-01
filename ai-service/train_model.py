import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import joblib

# Generate synthetic training data
np.random.seed(42)
n_samples = 5000

# Features: loginTime (hour 0-23), failAttempts (0-10), locationChange (0-1), txnAmount (0-10000)
data = {
    'loginTime': np.random.randint(0, 24, n_samples),
    'failAttempts': np.random.randint(0, 10, n_samples),
    'locationChange': np.random.randint(0, 2, n_samples),
    'txnAmount': np.random.uniform(0, 10000, n_samples)
}

df = pd.DataFrame(data)

# Create risk labels based on rules
def calculate_risk(row):
    score = 0
    # Unusual login times (late night: 0-5)
    if row['loginTime'] < 6:
        score += 20
    # Failed attempts
    score += row['failAttempts'] * 8
    # Location change
    if row['locationChange'] == 1:
        score += 25
    # High transaction amount
    if row['txnAmount'] > 5000:
        score += 30
    elif row['txnAmount'] > 2000:
        score += 15
    
    return min(score, 100)

df['risk_score'] = df.apply(calculate_risk, axis=1)
df['risk_label'] = (df['risk_score'] > 50).astype(int)  # 1 = high risk, 0 = low risk

# Split data
X = df[['loginTime', 'failAttempts', 'locationChange', 'txnAmount']]
y = df['risk_label']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Save model
joblib.dump(model, 'model.pkl')

print("Model trained and saved as model.pkl")
print(f"Training accuracy: {model.score(X_train, y_train):.2f}")
print(f"Test accuracy: {model.score(X_test, y_test):.2f}")
