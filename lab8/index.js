/**
 * Lab 8: Authentication Proxy for API Service
 * 
 * Implements a middleware layer that:
 * - Intercepts and modifies HTTP requests
 * - Injects authentication credentials
 * - Manages request/response handling
 */

import http from 'http';
import https from 'https';
import { URL } from 'url';

/**
 * Base Authentication Strategy
 * Defines interface for different auth methods
 */
class AuthStrategy {
  async getAuthHeaders() {
    throw new Error('getAuthHeaders must be implemented');
  }

  async beforeRequest() {
    // Optional: Hook before request is made
  }

  async afterResponse(response) {
    // Optional: Hook after response is received
  }

  reset() {
    // Optional: Reset internal state
  }
}

/**
 * Authentication Proxy
 * Main class that intercepts and modifies HTTP requests
 */
class AuthProxy {
  constructor(authStrategy) {
    this.authStrategy = authStrategy;
    this.interceptors = {
      request: [],
      response: []
    };
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'User-Agent': 'AuthProxy/1.0'
    };
  }

  /**
   * Switch authentication strategy
   */
  switchStrategy(newStrategy) {
    this.authStrategy = newStrategy;
  }

  /**
   * Add request interceptor
   */
  addRequestInterceptor(interceptor) {
    this.interceptors.request.push(interceptor);
  }

  /**
   * Add response interceptor
   */
  addResponseInterceptor(interceptor) {
    this.interceptors.response.push(interceptor);
  }

  /**
   * Set default headers
   */
  setDefaultHeaders(headers) {
    this.defaultHeaders = { ...this.defaultHeaders, ...headers };
  }

  /**
   * Make HTTP request with authentication
   */
  async request(method, url, data = null, options = {}) {
    const startTime = Date.now();
    const parsedUrl = new URL(url);
    const isHttps = parsedUrl.protocol === 'https:';
    const client = isHttps ? https : http;

    // Get authentication headers
    const authHeaders = await this.authStrategy.getAuthHeaders();

    // Prepare request headers
    let headers = {
      ...this.defaultHeaders,
      ...authHeaders,
      ...options.headers
    };

    // Run request interceptors
    for (const interceptor of this.interceptors.request) {
      headers = await interceptor(headers, { method, url, data }) || headers;
    }

    // Prepare request body
    let body = null;
    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      body = typeof data === 'string' ? data : JSON.stringify(data);
      headers['Content-Length'] = Buffer.byteLength(body);
    }

    return new Promise((resolve, reject) => {
      const requestOptions = {
        method,
        headers,
        timeout: options.timeout || 30000
      };

      const req = client.request(parsedUrl, requestOptions, (res) => {
        let responseData = '';

        res.on('data', chunk => {
          responseData += chunk;
        });

        res.on('end', async () => {
          let parsedResponse = responseData;
          try {
            parsedResponse = JSON.parse(responseData);
          } catch (e) {
            // Keep as string if not JSON
          }

          let response = {
            statusCode: res.statusCode,
            headers: res.headers,
            body: parsedResponse
          };

          for (const interceptor of this.interceptors.response) {
            response = await interceptor(response) || response;
          }

          resolve(response);
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      if (body) {
        req.write(body);
      }

      req.end();
    });
  }

  async get(url, options = {}) {
    return this.request('GET', url, null, options);
  }

  async post(url, data, options = {}) {
    return this.request('POST', url, data, options);
  }

  async put(url, data, options = {}) {
    return this.request('PUT', url, data, options);
  }

  async delete(url, options = {}) {
    return this.request('DELETE', url, null, options);
  }
}

/**
 * API Key Authentication Strategy
 * Injects static API key into requests
 */
class ApiKeyAuth extends AuthStrategy {
  constructor(apiKey, headerName = 'X-API-Key') {
    super();
    this.apiKey = apiKey;
    this.headerName = headerName;
  }

  async getAuthHeaders() {
    return {
      [this.headerName]: this.apiKey
    };
  }
}

/**
 * JWT Authentication Strategy
 * Manages JWT tokens with automatic renewal
 */
class JWTAuth extends AuthStrategy {
  constructor(token, renewalThreshold = 300000) {
    super();
    this.token = token;
    this.tokenTimestamp = Date.now();
    this.renewalThreshold = renewalThreshold;
    this.renewalCallback = null;
  }

  setRenewalCallback(callback) {
    this.renewalCallback = callback;
  }

  async getAuthHeaders() {
    if (this.needsRenewal() && this.renewalCallback) {
      this.token = await this.renewalCallback();
      this.tokenTimestamp = Date.now();
    }
    return {
      'Authorization': `Bearer ${this.token}`
    };
  }

  needsRenewal() {
    const age = Date.now() - this.tokenTimestamp;
    return age > this.renewalThreshold;
  }

  setToken(token) {
    this.token = token;
    this.tokenTimestamp = Date.now();
  }
}

/**
 * OAuth Authentication Strategy
 * Manages OAuth tokens with refresh capability
 */
class OAuthAuth extends AuthStrategy {
  constructor(accessToken, refreshToken = null, tokenType = 'Bearer') {
    super();
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.tokenType = tokenType;
    this.expiresAt = null;
    this.refreshCallback = null;
  }

  setRefreshCallback(callback) {
    this.refreshCallback = callback;
  }

  async getAuthHeaders() {
    if (this.needsRefresh() && this.refreshCallback && this.refreshToken) {
      const newTokens = await this.refreshCallback(this.refreshToken);
      this.accessToken = newTokens.accessToken;
      this.refreshToken = newTokens.refreshToken || this.refreshToken;
      this.expiresAt = newTokens.expiresAt;
    }
    return {
      'Authorization': `${this.tokenType} ${this.accessToken}`
    };
  }

  needsRefresh() {
    if (!this.expiresAt) return false;
    const bufferTime = 60000;
    return Date.now() > (this.expiresAt - bufferTime);
  }

  setTokens(accessToken, refreshToken = null, expiresAt = null) {
    this.accessToken = accessToken;
    if (refreshToken) this.refreshToken = refreshToken;
    this.expiresAt = expiresAt;
  }
}

/**
 * Rate Limiter
 * Prevents excessive API calls
 */
class RateLimiter {
  constructor(maxRequests = 100, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
  }

  isAllowed() {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);

    if (this.requests.length < this.maxRequests) {
      this.requests.push(now);
      return true;
    }
    return false;
  }

  getRemainingRequests() {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    return Math.max(0, this.maxRequests - this.requests.length);
  }

  getResetTime() {
    if (this.requests.length === 0) return null;
    const oldestRequest = this.requests[0];
    return oldestRequest + this.windowMs;
  }
}

/**
 * Request Logger
 * Logs all requests and responses for monitoring
 */
class RequestLogger {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000;
  }

  log(entry) {
    this.logs.push({
      timestamp: new Date().toISOString(),
      ...entry
    });

    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  getStats() {
    if (this.logs.length === 0) return null;

    const totalRequests = this.logs.length;
    const successCount = this.logs.filter(l => l.statusCode >= 200 && l.statusCode < 300).length;
    const errorCount = this.logs.filter(l => l.statusCode >= 400).length;
    const avgResponseTime = this.logs.reduce((sum, l) => sum + (l.responseTime || 0), 0) / totalRequests;

    return {
      totalRequests,
      successCount,
      errorCount,
      successRate: ((successCount / totalRequests) * 100).toFixed(2) + '%',
      avgResponseTime: avgResponseTime.toFixed(0) + 'ms'
    };
  }

  getLogs(limit = 10) {
    return this.logs.slice(-limit);
  }

  clearLogs() {
    this.logs = [];
  }
}

export { AuthProxy, AuthStrategy, ApiKeyAuth, JWTAuth, OAuthAuth, RateLimiter, RequestLogger };
