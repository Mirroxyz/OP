/**
 * Lab 8: Authentication Proxy Tests
 */

import { 
  AuthProxy, 
  ApiKeyAuth, 
  JWTAuth, 
  OAuthAuth,
  RateLimiter,
  RequestLogger
} from './index.js';

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✓ ${message}`);
    testsPassed++;
  } else {
    console.log(`✗ ${message}`);
    testsFailed++;
  }
}

async function runTests() {
  console.log('Running Authentication Proxy Tests...\n');

  // API Key Auth tests
  const apiKeyAuth = new ApiKeyAuth('test-api-key');
  let headers = await apiKeyAuth.getAuthHeaders();
  assert(headers['X-API-Key'] === 'test-api-key', 'ApiKeyAuth injects correct header');

  const customKeyAuth = new ApiKeyAuth('custom-key', 'Authorization');
  headers = await customKeyAuth.getAuthHeaders();
  assert(headers['Authorization'] === 'custom-key', 'ApiKeyAuth supports custom header name');

  // JWT Auth tests
  const jwtAuth = new JWTAuth('jwt-token-123');
  headers = await jwtAuth.getAuthHeaders();
  assert(headers['Authorization'] === 'Bearer jwt-token-123', 'JWTAuth generates Bearer token');

  let renewalCalled = false;
  const renewableJwt = new JWTAuth('initial-token');
  renewableJwt.setRenewalCallback(async () => {
    renewalCalled = true;
    return 'renewed-token';
  });
  assert(renewableJwt.renewalCallback !== null, 'JWTAuth accepts renewal callback');

  renewableJwt.setToken('new-token-123');
  headers = await renewableJwt.getAuthHeaders();
  assert(headers['Authorization'].includes('new-token-123'), 'JWTAuth updates token manually');

  // OAuth Auth tests
  const oauthAuth = new OAuthAuth('oauth-access-token', 'oauth-refresh-token');
  headers = await oauthAuth.getAuthHeaders();
  assert(headers['Authorization'] === 'Bearer oauth-access-token', 'OAuthAuth generates Bearer token');

  const customOAuth = new OAuthAuth('token', null, 'Custom');
  headers = await customOAuth.getAuthHeaders();
  assert(headers['Authorization'] === 'Custom token', 'OAuthAuth supports custom token type');

  oauthAuth.setTokens('new-access-123', 'new-refresh-456', Date.now() + 3600000);
  headers = await oauthAuth.getAuthHeaders();
  assert(headers['Authorization'].includes('new-access-123'), 'OAuthAuth updates tokens manually');

  // Rate Limiter tests
  const limiter = new RateLimiter(3, 60000);
  let allowed = 0;
  for (let i = 0; i < 3; i++) {
    if (limiter.isAllowed()) allowed++;
  }
  assert(allowed === 3, 'RateLimiter allows requests within limit');

  let blocked = !limiter.isAllowed();
  assert(blocked, 'RateLimiter blocks requests exceeding limit');

  const limiter2 = new RateLimiter(5, 60000);
  limiter2.isAllowed();
  limiter2.isAllowed();
  const remaining = limiter2.getRemainingRequests();
  assert(remaining === 3, 'RateLimiter correctly tracks remaining requests');

  const limiter3 = new RateLimiter(1, 1000);
  limiter3.isAllowed();
  limiter3.isAllowed();
  const resetTime = limiter3.getResetTime();
  assert(resetTime !== null, 'RateLimiter provides reset time');

  // Request Logger tests
  const logger = new RequestLogger();
  logger.log({ method: 'GET', url: 'https://api.example.com/users', statusCode: 200, responseTime: 100 });
  const logs = logger.getLogs();
  assert(logs.length === 1, 'RequestLogger logs requests');

  logger.log({ method: 'POST', url: 'https://api.example.com/users', statusCode: 201, responseTime: 150 });
  logger.log({ method: 'GET', url: 'https://api.example.com/users/1', statusCode: 404, responseTime: 50 });
  const stats = logger.getStats();
  assert(stats.successCount === 2, 'RequestLogger counts successful requests');
  assert(stats.errorCount === 1, 'RequestLogger counts error responses');

  // AuthProxy tests
  const proxy = new AuthProxy(apiKeyAuth);
  let proxyHeaders = await proxy.authStrategy.getAuthHeaders();
  assert(proxyHeaders['X-API-Key'] === 'test-api-key', 'AuthProxy uses initial strategy');

  proxy.switchStrategy(jwtAuth);
  proxyHeaders = await proxy.authStrategy.getAuthHeaders();
  assert(proxyHeaders['Authorization'] === 'Bearer jwt-token-123', 'AuthProxy switches strategies');

  const proxy2 = new AuthProxy(apiKeyAuth);
  proxy2.setDefaultHeaders({ 'Custom-Header': 'custom-value' });
  assert(proxy2.defaultHeaders['Custom-Header'] === 'custom-value', 'AuthProxy sets default headers');

  const proxy3 = new AuthProxy(apiKeyAuth);
  proxy3.addRequestInterceptor((headers) => {
    headers['X-Intercepted'] = 'yes';
    return headers;
  });
  assert(proxy3.interceptors.request.length === 1, 'AuthProxy registers request interceptor');

  proxy3.addResponseInterceptor((response) => {
    response.intercepted = true;
    return response;
  });
  assert(proxy3.interceptors.response.length === 1, 'AuthProxy registers response interceptor');

  const proxy4 = new AuthProxy(apiKeyAuth);
  proxy4.logger = new RequestLogger();
  proxy4.logger.log({ method: 'GET', url: 'test', statusCode: 200, responseTime: 100 });
  assert(proxy4.logger.logs.length === 1, 'AuthProxy can use logger');

  console.log(`\n✓ Tests passed: ${testsPassed}`);
  console.log(`✗ Tests failed: ${testsFailed}`);
}

runTests().catch(console.error);
