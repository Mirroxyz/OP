# Lab 8: Authentication Proxy for API Service

A comprehensive implementation of an authentication proxy that acts as an intermediary between clients and API services. The proxy intercepts HTTP requests, injects credentials, and manages authentication-related concerns.

## Features

### 1. **Multiple Authentication Strategies**

#### API Key Authentication
- Static API key injection into custom headers
- Supports custom header names
- Ideal for simple, stateless authentication

```javascript
const apiKeyAuth = new ApiKeyAuth('sk-1234567890abcdef', 'X-API-Key');
const headers = await apiKeyAuth.getAuthHeaders();
// { 'X-API-Key': 'sk-1234567890abcdef' }
```

#### JWT (JSON Web Token) Authentication
- Bearer token management
- Automatic token renewal based on age threshold
- Timestamp tracking for expiration detection

```javascript
const jwtAuth = new JWTAuth('eyJhbGc...', 300000); // 5 min renewal threshold
jwtAuth.setRenewalCallback(async () => {
  return newToken;
});
```

#### OAuth 2.0 Authentication
- Access token and refresh token management
- Automatic token refresh based on expiration
- Support for custom token types

```javascript
const oauthAuth = new OAuthAuth('access_token', 'refresh_token', 'Bearer');
oauthAuth.setRefreshCallback(async (refreshToken) => {
  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
});
```

### 2. **AuthProxy - Main Interceptor**

The core class that orchestrates all authentication and request handling:

```javascript
const proxy = new AuthProxy(authStrategy);

// Switch strategies dynamically
proxy.switchStrategy(newAuthStrategy);

// Add custom interceptors
proxy.addRequestInterceptor((headers, metadata) => {
  headers['X-Request-ID'] = generateId();
  return headers;
});

proxy.addResponseInterceptor((response) => {
  console.log('Response:', response.statusCode);
  return response;
});

// Make authenticated requests
const response = await proxy.get('https://api.example.com/users');
const created = await proxy.post('https://api.example.com/users', { name: 'John' });
```

### 3. **Rate Limiting**

Prevents excessive API calls with configurable limits:

```javascript
const limiter = new RateLimiter(100, 60000); // 100 requests per minute

if (limiter.isAllowed()) {
  // Make request
} else {
  console.log('Rate limit exceeded');
  console.log('Reset time:', new Date(limiter.getResetTime()));
}
```

### 4. **Request Monitoring & Logging**

Comprehensive logging system for monitoring API usage:

```javascript
const logger = new RequestLogger();

logger.log({
  method: 'GET',
  url: 'https://api.example.com/users',
  statusCode: 200,
  responseTime: 125
});

const stats = logger.getStats();
// {
//   totalRequests: 150,
//   successCount: 148,
//   errorCount: 2,
//   successRate: '98.67%',
//   avgResponseTime: '245ms'
// }

const logs = logger.getLogs(10); // Get last 10 requests
logger.clearLogs();
```

### 5. **Request/Response Interceptors**

Chainable interceptors for modifying requests and responses:

```javascript
// Request interceptor
proxy.addRequestInterceptor((headers, metadata) => {
  headers['X-Custom'] = 'value';
  return headers;
});

// Response interceptor
proxy.addResponseInterceptor((response) => {
  if (response.statusCode === 401) {
    throw new Error('Unauthorized');
  }
  return response;
});
```

## Architecture

### Class Hierarchy

```
AuthStrategy (abstract)
├── ApiKeyAuth
├── JWTAuth
└── OAuthAuth

AuthProxy
├── authStrategy: AuthStrategy
├── interceptors: { request[], response[] }
└── defaultHeaders: Object

RateLimiter
├── requests: Array
└── maxRequests, windowMs

RequestLogger
├── logs: Array
└── maxLogs: 1000
```

### Request Flow

```
Client Request
    ↓
Get Auth Headers
    ↓
Request Interceptors
    ↓
Merge with Default Headers
    ↓
HTTP Request
    ↓
Response Received
    ↓
Response Interceptors
    ↓
Return to Client
```

## Usage Examples

### Example 1: Basic API Key Authentication

```javascript
import { AuthProxy, ApiKeyAuth } from './index.js';

const auth = new ApiKeyAuth('sk-1234567890');
const proxy = new AuthProxy(auth);

const users = await proxy.get('https://api.example.com/users');
console.log(users);
```

### Example 2: JWT with Automatic Renewal

```javascript
const jwtAuth = new JWTAuth(initialToken, 300000);

jwtAuth.setRenewalCallback(async () => {
  const response = await fetch('/auth/refresh');
  const data = await response.json();
  return data.token;
});

const proxy = new AuthProxy(jwtAuth);
const data = await proxy.post('/api/users', { name: 'Alice' });
```

### Example 3: Multi-strategy System

```javascript
const apiKeyProxy = new AuthProxy(new ApiKeyAuth('key1'));
const jwtProxy = new AuthProxy(new JWTAuth(token));
const oauthProxy = new AuthProxy(new OAuthAuth(accessToken, refreshToken));

// Use different proxies for different endpoints
const publicData = await apiKeyProxy.get('https://api.example.com/public');
const userData = await jwtProxy.get('https://api.example.com/user');
const adminData = await oauthProxy.get('https://api.example.com/admin');
```

### Example 4: Rate-Limited Batch Processing

```javascript
const proxy = new AuthProxy(new ApiKeyAuth('key'));
const limiter = new RateLimiter(10, 60000);

for (const item of largeDataSet) {
  if (!limiter.isAllowed()) {
    console.log('Rate limited, waiting...');
    await sleep(1000);
    continue;
  }
  const result = await proxy.post('/process', item);
  console.log('Processed:', result);
}
```

## API Reference

### AuthProxy Class

```javascript
// Constructor
new AuthProxy(authStrategy)

// Methods
proxy.request(method, url, data, options) → Promise
proxy.get(url, options) → Promise
proxy.post(url, data, options) → Promise
proxy.put(url, data, options) → Promise
proxy.delete(url, options) → Promise

proxy.switchStrategy(newStrategy) → void
proxy.setDefaultHeaders(headers) → void

proxy.addRequestInterceptor(callback) → void
proxy.addResponseInterceptor(callback) → void
```

### Authentication Strategies

```javascript
// ApiKeyAuth
new ApiKeyAuth(apiKey, headerName = 'X-API-Key')

// JWTAuth
new JWTAuth(token, renewalThreshold = 300000)
jwt.setRenewalCallback(callback) → void
jwt.setToken(token) → void
jwt.needsRenewal() → Boolean

// OAuthAuth
new OAuthAuth(accessToken, refreshToken, tokenType = 'Bearer')
oauth.setRefreshCallback(callback) → void
oauth.setTokens(accessToken, refreshToken, expiresAt) → void
oauth.needsRefresh() → Boolean
```

### Utilities

```javascript
// RateLimiter
new RateLimiter(maxRequests = 100, windowMs = 60000)
limiter.isAllowed() → Boolean
limiter.getRemainingRequests() → Number
limiter.getResetTime() → Number|null

// RequestLogger
new RequestLogger()
logger.log(entry) → void
logger.getStats() → Object
logger.getLogs(limit = 10) → Array
logger.clearLogs() → void
```

## Performance Characteristics

| Operation | Time Complexity | Space Complexity |
|-----------|-----------------|------------------|
| Get Auth Headers | O(1) | O(1) |
| Rate Limit Check | O(n) where n = requests in window | O(n) |
| Logging Request | O(1) | O(1) |
| Get Statistics | O(n) where n = total logs | O(1) |
| Switch Strategy | O(1) | O(1) |

## Testing

Run the test suite:

```bash
npm test
```

Tests cover:
- All authentication strategies (ApiKey, JWT, OAuth)
- Rate limiting functionality
- Request/response logging
- Interceptor functionality
- Multi-instance scenarios

## Best Practices

1. **Token Management**
   - Always set renewal/refresh callbacks for JWT and OAuth
   - Monitor token expiration times
   - Handle 401 errors gracefully

2. **Rate Limiting**
   - Set appropriate limits based on API quotas
   - Implement exponential backoff for retries
   - Monitor rate limit statistics

3. **Security**
   - Never log sensitive tokens in full
   - Use HTTPS for all requests
   - Validate redirect URIs for OAuth flows
   - Store refresh tokens securely

4. **Monitoring**
   - Track success/error rates
   - Monitor average response times
   - Set alerts for authentication failures
   - Review logs periodically

## License

MIT

## Author

Mirroxyz
