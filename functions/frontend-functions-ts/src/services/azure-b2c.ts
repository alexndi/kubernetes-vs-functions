// functions/frontend-functions-ts/src/services/azure-b2c.ts
import { PublicClientApplication, Configuration, AccountInfo, SilentRequest } from '@azure/msal-browser';

// Azure AD B2C Configuration
const b2cConfig: Configuration = {
  auth: {
    clientId: process.env.REACT_APP_B2C_CLIENT_ID || 'your-client-id',
    authority: process.env.REACT_APP_B2C_AUTHORITY || 'https://yourtenant.b2clogin.com/yourtenant.onmicrosoft.com/B2C_1_SignUpSignIn',
    knownAuthorities: ['yourtenant.b2clogin.com'],
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false
  }
};

// Create MSAL instance
const msalInstance = new PublicClientApplication(b2cConfig);

// Initialize MSAL
msalInstance.initialize().catch((error) => {
  console.error('MSAL initialization error:', error);
});

// Authentication service
class AzureB2CService {
  private account: AccountInfo | null = null;

  async initialize(): Promise<void> {
    try {
      await msalInstance.handleRedirectPromise();
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        this.account = accounts[0];
      }
    } catch (error) {
      console.error('Error handling redirect:', error);
    }
  }

  async login(): Promise<void> {
    try {
      const loginResponse = await msalInstance.loginPopup({
        scopes: ['openid', 'profile']
      });
      this.account = loginResponse.account;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      if (this.account) {
        await msalInstance.logoutPopup({
          account: this.account
        });
        this.account = null;
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  isAuthenticated(): boolean {
    const accounts = msalInstance.getAllAccounts();
    return accounts.length > 0;
  }

  getAccount(): AccountInfo | null {
    const accounts = msalInstance.getAllAccounts();
    return accounts.length > 0 ? accounts[0] : null;
  }

  async getToken(): Promise<string | null> {
    if (!this.account) return null;

    const silentRequest: SilentRequest = {
      account: this.account,
      scopes: ['openid', 'profile']
    };

    try {
      const response = await msalInstance.acquireTokenSilent(silentRequest);
      return response.accessToken;
    } catch (error) {
      console.error('Token acquisition error:', error);
      return null;
    }
  }
}

export const azureB2C = new AzureB2CService();
export default azureB2C;