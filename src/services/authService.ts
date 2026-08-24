export interface MockUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  businessName: string;
}

const STORAGE_KEY = 'saas_auth_user';

class AuthService {
  private currentUser: MockUser | null = null;

  constructor() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.currentUser = JSON.parse(stored);
      } else {
        // Default demo user for seamless preview
        this.currentUser = {
          id: 'usr-demo-01',
          name: 'Alex Mercer',
          email: 'alex@studionorth.co',
          businessName: 'Studio North Creative LLC',
        };
      }
    } catch {
      // ignore
    }
  }

  getCurrentUser(): MockUser | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  async login(email: string, _password: string): Promise<MockUser> {
    await new Promise((res) => setTimeout(res, 200));
    const user: MockUser = {
      id: `usr-${Date.now().toString(36)}`,
      name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      email,
      businessName: 'Studio North Creative LLC',
    };
    this.currentUser = user;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return user;
  }

  async signup(name: string, email: string, _password: string): Promise<MockUser> {
    await new Promise((res) => setTimeout(res, 250));
    const user: MockUser = {
      id: `usr-${Date.now().toString(36)}`,
      name,
      email,
      businessName: `${name}'s Studio`,
    };
    this.currentUser = user;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return user;
  }

  async loginWithGoogle(): Promise<MockUser> {
    await new Promise((res) => setTimeout(res, 300));
    const user: MockUser = {
      id: 'usr-google-demo',
      name: 'Alex Mercer',
      email: 'alex.mercer.founder@gmail.com',
      businessName: 'Studio North Creative LLC',
    };
    this.currentUser = user;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return user;
  }

  logout(): void {
    this.currentUser = null;
    localStorage.removeItem(STORAGE_KEY);
  }
}

export const authService = new AuthService();
