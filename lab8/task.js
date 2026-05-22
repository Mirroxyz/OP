class HttpClient {
  async request(url, options = {}) {
    console.log(`[HttpClient] Відправка HTTP запиту: ${url}`);
    
    const authHeader = options.headers?.Authorization || options.headers?.['X-API-Key'];
    const isSecretUrl = url.includes('secret');

    if (isSecretUrl && authHeader === 'Bearer expired_token') {
      console.log(`[HttpClient] Помилка 401: Токен прострочено!`);
      return { status: 401, data: "Unauthorized" };
    }

    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ status: 200, data: `Успішні дані з ${url}` });
      }, 300);
    });
  }
}

class ApiKeyAuth {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  getHeaders() {
    return { 'X-API-Key': this.apiKey };
  }
}

class JWTAuth {
  constructor(token) {
    this.token = token;
  }

  getHeaders() {
    return { 'Authorization': `Bearer ${this.token}` };
  }
}

class OAuthAuth {
  constructor(accessToken, refreshToken) {
    this.accessToken = accessToken;
    this.refreshTokenStr = refreshToken;
  }

  getHeaders() {
    return { 'Authorization': `Bearer ${this.accessToken}` };
  }

  async refreshToken() {
    console.log(`\n[OAuth] Токен прострочено. Використовуємо refreshToken для оновлення...`);
    this.accessToken = "new_fresh_token_123";
  }
}

class AuthProxy {
  constructor(httpClient, authStrategy) {
    this.httpClient = httpClient;
    this.authStrategy = authStrategy;
  }

  setStrategy(newStrategy) {
    console.log(`\n[System] Стратегію аутентифікації змінено на ${newStrategy.constructor.name}`);
    this.authStrategy = newStrategy;
  }

  async request(url, options = {}) {
    let headers = { ...options.headers, ...this.authStrategy.getHeaders() };
    let response = await this.httpClient.request(url, { ...options, headers });

    if (response.status === 401 && typeof this.authStrategy.refreshToken === 'function') {
      await this.authStrategy.refreshToken(); 
      
      headers = { ...options.headers, ...this.authStrategy.getHeaders() };
      
      console.log(`[Proxy] Робимо повторний запит з новим токеном...`);
      response = await this.httpClient.request(url, { ...options, headers });
    }
    return response;
  }
}

class GitHubService {
  constructor(httpClient) {
    this.httpClient = httpClient; 
  }

  async getPublicData() {
    return await this.httpClient.request('https://api.github.com/public-repos');
  }

  async getSecretData() {
    return await this.httpClient.request('https://api.github.com/secret-repos');
  }
}

async function runDemo() {
  const baseClient = new HttpClient();
  const oauthStrategy = new OAuthAuth("expired_token", "my_refresh_token");
  const proxy = new AuthProxy(baseClient, oauthStrategy);
  const github = new GitHubService(proxy);

  console.log("\nТест 1 - OAuth:");
  const result1 = await github.getSecretData();
  console.log("[Кінцевий результат OAuth]:", result1);

  console.log("\nТест 2 - Зміна стратегії на JWT Auth:");
  const jwtStrategy = new JWTAuth("eyJhbGciOiJIUzI1NiI...jwt_token_xyz");
  proxy.setStrategy(jwtStrategy);
  const result2 = await github.getSecretData();
  console.log("[Кінцевий результат JWT]:", result2);

  console.log("\nТест 3 - Зміна стратегії на API Key:");
  const apiKeyStrategy = new ApiKeyAuth("secret-key-12345");
  proxy.setStrategy(apiKeyStrategy);
  const result3 = await github.getSecretData();
  console.log("[Кінцевий результат API Key]:", result3);
}

runDemo();