import useAuthStore from '../stores/authStore';

const API_BASE_URL = 'https://etf-be-production.up.railway.app';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // 기본 요청 메서드
  async request(endpoint, options = {}) {
    const authStore = useAuthStore.getState();
    const headers = {
      'Content-Type': 'application/json',
      ...authStore.getAuthHeaders(),
      ...options.headers,
    };

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // 인증 관련 API
  async login(userId, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ userId, password }),
    });
  }

  async signup(userId, password, name, email) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify({ userId, password, name, email }),
    });
  }

  async getCurrentUser() {
    return this.request('/users/me');
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  // ETF 관련 API (RESTful)
  async getUserInvestmentSettings() {
    return this.request('/users/me/settings');
  }

  async updateInvestmentSettings(settings) {
    return this.request('/users/me/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  async getETFs() {
    return this.request('/etfs');
  }

  // ETF별 개별 투자 설정 API
  async getETFInvestmentSettings() {
    return this.request('/users/me/etf-settings');
  }

  async updateETFInvestmentSettings(settings) {
    return this.request('/users/me/etf-settings', {
      method: 'PUT',
      body: JSON.stringify({ etf_settings: settings }),
    });
  }

  async getETFInvestmentSetting(etfSymbol) {
    return this.request(`/users/me/etf-settings/${etfSymbol}`);
  }

  async updateETFInvestmentSetting(etfSymbol, setting) {
    return this.request(`/users/me/etf-settings/${etfSymbol}`, {
      method: 'PUT',
      body: JSON.stringify(setting),
    });
  }

  async deleteETFInvestmentSetting(etfSymbol) {
    return this.request(`/users/me/etf-settings/${etfSymbol}`, {
      method: 'DELETE',
    });
  }

  // 알림 설정 관련 API
  async getNotificationSettings() {
    return this.request('/users/me/notification-settings');
  }

  async updateNotificationSettings(settings) {
    return this.request('/users/me/notification-settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // 챗봇 관련 API
  async sendMessage(message) {
    return this.request('/chats', {
      method: 'POST',
      body: JSON.stringify({ content: message }),
    });
  }

  async loadChatHistory(limit = 50) {
    return this.request(`/chat/history?limit=${limit}`);
  }

  async sendMessageStream(message, onChunk) {
    const authStore = useAuthStore.getState();
    const headers = {
      'Content-Type': 'application/json',
      ...authStore.getAuthHeaders(),
    };

    try {
      const response = await fetch(`${this.baseURL}/chat/stream`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ content: message }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        let lines = buffer.split('\n\n');
        buffer = lines.pop(); // 남은 incomplete chunk

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return;
            try {
              const parsed = JSON.parse(data);
              onChunk(parsed.content || '');
            } catch (e) {
              console.error('Error parsing chunk:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Stream request failed:', error);
      throw error;
    }
  }
}

export default new ApiService(); 