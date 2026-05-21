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

export { AuthProxy, AuthStrategy, ApiKeyAuth };
