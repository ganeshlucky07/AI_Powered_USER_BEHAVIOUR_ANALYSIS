# Risk Score SDK - Integration Guide

Integrate the Risk Score Engine into any application to automatically track and analyze user behavior for fraud detection.

## Quick Start

### 1. Vanilla JavaScript

```html
<script src="risk-score-sdk.js"></script>
<script>
  const riskSDK = new RiskScoreSDK({
    apiUrl: 'http://localhost:8080/api',
    token: 'your-jwt-token',
    onHighRisk: (result, data) => {
      alert('Suspicious activity detected!');
    }
  });

  // Analyze user behavior
  const result = await riskSDK.analyze({
    txnAmount: 5000
  });

  console.log('Risk Score:', result.risk, 'Level:', result.level);
</script>
```

### 2. Express.js Backend

```javascript
const RiskScoreMiddleware = require('./express-middleware');

const riskMiddleware = new RiskScoreMiddleware({
  apiUrl: 'http://localhost:8080/api',
  token: 'your-jwt-token',
  blockOnHighRisk: true, // Block requests with HIGH risk
  onHighRisk: (result, req, res) => {
    console.warn('High risk activity:', req.ip);
  }
});

// Apply to all routes
app.use(riskMiddleware.middleware());

// Track failed logins
app.post('/login', (req, res) => {
  const isValid = checkCredentials(req.body);
  
  if (!isValid) {
    riskMiddleware.trackFailedLogin(req.sessionID);
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  res.json({ success: true });
});
```

### 3. React Application

```jsx
import useRiskScore from './useRiskScore';

function PaymentForm() {
  const { analyze, riskScore, riskLevel, loading } = useRiskScore({
    apiUrl: 'http://localhost:8080/api',
    onHighRisk: (result) => {
      alert('Transaction blocked due to high risk!');
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const result = await analyze({
      txnAmount: 10000
    });

    if (result.level === 'HIGH') {
      // Block transaction
      return;
    }

    // Proceed with payment
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>Risk Level: {riskLevel || 'Analyzing...'}</div>
      <button disabled={loading || riskLevel === 'HIGH'}>
        Pay Now
      </button>
    </form>
  );
}
```

## Integration Scenarios

### Scenario 1: E-Commerce Checkout

```javascript
// Track user throughout checkout process
const sdk = new RiskScoreSDK({
  apiUrl: 'http://localhost:8080/api',
  onHighRisk: (result) => {
    // Require additional verification
    show2FADialog();
  }
});

// On add to cart
sdk.trackBehavior('addToCart');

// On checkout start
sdk.trackBehavior('checkoutStarted');

// On payment attempt
const result = await sdk.analyze({
  txnAmount: order.total,
  loginTime: new Date().getHours()
});

if (result.level === 'HIGH') {
  // Block and flag for review
  await flagOrderForReview(order.id);
} else if (result.level === 'MEDIUM') {
  // Require 3D Secure / OTP
  await require3DSecure();
} else {
  // Process normally
  await processPayment();
}
```

### Scenario 2: Banking Application

```javascript
// Track every transaction
app.post('/api/transfer', async (req, res) => {
  const { amount, toAccount } = req.body;
  
  // Analyze risk
  const risk = await riskSDK.analyze({
    txnAmount: amount,
    failAttempts: req.session.failedLogins || 0,
    locationChange: req.session.locationChanged ? 1 : 0
  });

  // Risk-based actions
  if (risk.risk > 80) {
    return res.status(403).json({
      error: 'Transfer blocked due to suspicious activity',
      requireVerification: true
    });
  }

  if (risk.risk > 50) {
    // Send OTP
    await sendOTP(req.user.phone);
    return res.json({
      requireOTP: true,
      transferId: pendingTransfer.id
    });
  }

  // Low risk - process immediately
  const result = await processTransfer(req.user.id, toAccount, amount);
  res.json(result);
});
```

### Scenario 3: API Rate Limiting with Risk

```javascript
const middleware = new RiskScoreMiddleware({
  apiUrl: 'http://localhost:8080/api',
  blockOnHighRisk: true
});

// Block suspicious API patterns
app.use('/api/', middleware.middleware());

// Custom rate limit based on risk
app.get('/api/data', async (req, res) => {
  const session = middleware.getSessionStats(req.sessionID);
  
  // If making too many requests, increase risk
  if (session.apiCalls > 100) {
    const result = await middleware.analyze({
      apiCallsPerMinute: 120
    });
    
    if (result.level === 'HIGH') {
      return res.status(429).json({
        error: 'Too many requests - suspicious activity detected'
      });
    }
  }
  
  res.json(data);
});
```

## Tracked Behaviors

The SDK automatically tracks:

| Behavior | Description | Risk Factor |
|----------|-------------|-------------|
| **Login Time** | Hour of day (0-23) | Late night = higher risk |
| **Failed Attempts** | Failed password count | More = suspicious |
| **Location Change** | Geographic location jump | Sudden changes = red flag |
| **API Call Rate** | Requests per minute | >100 = bot/attack |
| **Repeated Requests** | Same endpoint hit multiple times | >5 = enumeration attack |
| **Unusual Endpoints** | Access to /admin, /config | Any = privilege escalation |

## Configuration Options

### SDK Options

```javascript
{
  apiUrl: 'http://localhost:8080/api',  // Risk API endpoint
  token: 'jwt-token',                   // Authentication token
  apiKey: 'api-key',                    // Alternative auth
  autoTrack: true,                      // Auto-track behavior
  onHighRisk: (result, data) => {},     // High risk callback
  blockOnHighRisk: false                // Block requests (middleware only)
}
```

### Risk Levels

| Score | Level | Action |
|-------|-------|--------|
| 0-30 | LOW | Allow normally |
| 31-70 | MEDIUM | Require additional verification |
| 71-100 | HIGH | Block and alert |

## Production Deployment

### Environment Variables

```bash
RISK_API_URL=https://risk-backend.onrender.com/api
RISK_API_TOKEN=your-jwt-token
RISK_THRESHOLD=70
```

### Redis for Session Storage

```javascript
const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);

// Store sessions in Redis instead of memory
middleware.useRedis(redis);
```

## Demo Application

See `demo/RiskAwareApp.jsx` for a complete working example of:
- Risk-aware login
- Risk-aware transactions  
- Real-time risk monitoring
- Session reporting

Run the demo:
```bash
cd sdk/demo
npm install
npm start
```

## API Reference

### RiskScoreSDK Methods

- `analyze(data)` - Calculate risk score for current behavior
- `trackBehavior(action)` - Record specific behavior (e.g., 'failedLogin')
- `recordLocationChange(location)` - Track location changes
- `getSessionReport()` - Get complete session analytics

### useRiskScore Hook

- `riskScore` - Current risk score (0-100)
- `riskLevel` - Risk level ('LOW', 'MEDIUM', 'HIGH')
- `analyze(data)` - Trigger risk analysis
- `trackBehavior(action)` - Track behavior
- `loading` - Analysis in progress
- `error` - Error message if analysis failed

## Support

For issues and feature requests, see the main project repository.
