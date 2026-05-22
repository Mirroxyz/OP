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
    this.refreshToken = refreshToken;
  }

  checkAndRefreshToken() {
    if (Math.random() > 0.7) {
      console.log("  [System] OAuth токен прострочився. Використовуємо refreshToken...");
      this.accessToken = "new_access_token_" + Date.now();
    }
  }

  getHeaders() {
    this.checkAndRefreshToken();
    return { 'Authorization': `Bearer ${this.accessToken}` };
  }
}

class AuthProxy {
  constructor(authStrategy) {
    this.authStrategy = authStrategy;
  }

  setStrategy(newStrategy) {
    console.log(`\n[System] Стратегію аутентифікації змінено на ${newStrategy.constructor.name}`);
    this.authStrategy = newStrategy;
  }

  async fetchWrapper(url, method = 'GET', data = null) {
    console.log(`\n[Log] Відправляємо ${method} запит на: ${url}`);

    const authHeaders = this.authStrategy.getHeaders();
    
    const requestOptions = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      }
    };

    if (data) {
      requestOptions.body = JSON.stringify(data);
    }

    console.log("[Log] Згенеровані заголовки:", requestOptions.headers);

    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ 
          status: 200, 
          data: `Дані з сервера для ${url}` 
        });
      }, 300);
    });
  }
}

async function runDemo() {
  console.log("Тест 1 - API Key:");
  const apiKeyStrategy = new ApiKeyAuth("secret-key-12345");
  const proxy = new AuthProxy(apiKeyStrategy);
  
  await proxy.fetchWrapper("https://api.myserver.com/users");

  console.log("\nТест 2 - JWT:");
  const jwtStrategy = new JWTAuth("eyJh... (jwt token)");
  proxy.setStrategy(jwtStrategy);
  
  await proxy.fetchWrapper("https://api.myserver.com/posts", "POST", { title: "Новий пост" });

  console.log("\nТест 3 - OAuth з оновленням токену:");
  const oauthStrategy = new OAuthAuth("old_access_token", "my_refresh_token");
  proxy.setStrategy(oauthStrategy);

  await proxy.fetchWrapper("https://api.myserver.com/profile");
  await proxy.fetchWrapper("https://api.myserver.com/settings");
}

runDemo();