/**
 * Lab 8: Authentication Proxy Examples
 */

import { 
  AuthProxy, 
  ApiKeyAuth, 
  JWTAuth, 
  OAuthAuth 
} from './index.js';

console.log('📡 Authentication Proxy Examples\n');
console.log('═'.repeat(50));

// Example 1: API Key Authentication
console.log('\n=== Example 1: API Key Authentication ===\n');
(async () => {
  const apiKeyAuth = new ApiKeyAuth('sk-1234567890abcdef');
  const proxy = new AuthProxy(apiKeyAuth);

  console.log('Configured: ApiKeyAuth Strategy');
  console.log('API Key: sk-1234567890abcdef');
  
  const headers = await apiKeyAuth.getAuthHeaders();
  console.log('Headers injected:', headers);
})();

// Example 2: JWT Authentication
console.log('\n=== Example 2: JWT Authentication ===\n');
(async () => {
  const jwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.token.signature';
  const jwtAuth = new JWTAuth(jwtToken);

  console.log('Configured: JWTAuth Strategy');
  console.log('Initial Token:', jwtToken.substring(0, 30) + '...');
  
  jwtAuth.setRenewalCallback(async () => {
    console.log('  🔄 Token renewed automatically');
    return 'new-token-xyz';
  });

  const headers = await jwtAuth.getAuthHeaders();
  console.log('Headers injected:', headers);
})();

// Example 3: OAuth Authentication
console.log('\n=== Example 3: OAuth Authentication ===\n');
(async () => {
  const oauthAuth = new OAuthAuth(
    'access_token_xyz',
    'refresh_token_abc',
    'Bearer'
  );

  console.log('Configured: OAuthAuth Strategy');
  console.log('Access Token: access_token_xyz');
  
  oauthAuth.setTokens(
    'access_token_xyz',
    'refresh_token_abc',
    Date.now() + 3600000
  );

  const headers = await oauthAuth.getAuthHeaders();
  console.log('Headers injected:', headers);
})();

// Example 4: Strategy Switching
console.log('\n=== Example 4: Dynamic Strategy Switching ===\n');
(async () => {
  const apiKeyAuth = new ApiKeyAuth('initial-key');
  const proxy = new AuthProxy(apiKeyAuth);

  console.log('Initial strategy: ApiKeyAuth');
  let headers = await proxy.authStrategy.getAuthHeaders();
  console.log('Headers:', headers);

  const jwtAuth = new JWTAuth('jwt-token-xyz');
  proxy.switchStrategy(jwtAuth);
  
  console.log('\nSwitched to: JWTAuth');
  headers = await proxy.authStrategy.getAuthHeaders();
  console.log('Headers:', headers);
})();

// Example 5: Interceptors
console.log('\n=== Example 5: Request/Response Interceptors ===\n');
(async () => {
  const apiKeyAuth = new ApiKeyAuth('test-key');
  const proxy = new AuthProxy(apiKeyAuth);

  proxy.addRequestInterceptor((headers, metadata) => {
    console.log('  📤 Request Interceptor:');
    console.log('    Method:', metadata.method);
    headers['X-Request-ID'] = 'req-' + Date.now();
    return headers;
  });

  proxy.addResponseInterceptor((response) => {
    console.log('  📥 Response Interceptor:');
    console.log('    Status:', response.statusCode);
    return response;
  });

  console.log('Interceptors registered successfully');
})();

console.log('\n' + '═'.repeat(50));
console.log('\n✅ All examples completed!\n');
