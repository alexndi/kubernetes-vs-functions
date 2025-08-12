# Complete Entra External ID Setup Guide 📋

## 🎯 **Prerequisites**
- Azure subscription
- GitHub repository
- Domain name (optional)

---

## 📝 **Part 1: Create External Tenant**

### **Step 1: Create External Tenant**
1. Go to [Microsoft Entra admin center](https://entra.microsoft.com)
2. **Click**: "Create a tenant"
3. **Select**: "External tenant" 
4. **Choose**: "Customer identity and access management (CIAM)"
5. **Enter**: Tenant name (e.g., `devinsightsblog`)
6. **Wait**: For tenant creation (5-10 minutes)

### **Step 2: Switch to External Tenant**
1. **Click**: Settings icon (top-right)
2. **Switch**: To your new external tenant
3. **Verify**: You're in the external tenant (shows "External" label)

---

## 🔧 **Part 2: Configure App Registration**

### **Step 3: Create App Registration**
1. **Navigate**: App registrations → New registration
2. **Name**: `DevInsights Blog App`
3. **Account types**: "Multitenant + Personal accounts"
4. **Redirect URI**: Leave blank for now
5. **Click**: Register

### **Step 4: Configure Authentication**
1. **Go to**: Authentication
2. **Add platform**: Single-page application
3. **Redirect URI**: `https://your-domain.com` (your actual domain)
4. **Check both boxes**:
   - ✅ ID tokens (used for implicit and hybrid flows)
   - ✅ Access tokens (used for implicit flows)
5. **Save**

### **Step 5: Copy Configuration Values**
1. **Copy**: Application (client) ID
2. **Copy**: Directory (tenant) ID
3. **Note**: Authority URL format: `https://TENANTNAME.ciamlogin.com/TENANT-ID`

---

## 🔄 **Part 3: Create User Flow**

### **Step 6: Create User Flow**
1. **Navigate**: External Identities → User flows
2. **Click**: New user flow
3. **Name**: `SignUpSignIn`
4. **Identity providers**: ✅ Email with password
5. **User attributes**: 
   - ✅ Display Name (required)
   - ✅ Given Name (optional)
   - ✅ Surname (optional)
6. **Create**

### **Step 7: Associate App with User Flow**
1. **Select**: Your user flow
2. **Go to**: Applications (left menu)
3. **Add application**: Select your app
4. **Test**: Click "Run user flow" to verify

---

## 💻 **Part 4: Code Configuration**

### **Step 8: Frontend Service File**
Create `src/services/entra-external-id.ts`:

```typescript
import { PublicClientApplication, Configuration, AccountInfo, SilentRequest } from '@azure/msal-browser';

const entraConfig: Configuration = {
  auth: {
    clientId: 'YOUR-CLIENT-ID',
    authority: 'https://TENANT-NAME.ciamlogin.com/TENANT-ID',
    knownAuthorities: ['TENANT-NAME.ciamlogin.com'],
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false
  }
};

const msalInstance = new PublicClientApplication(entraConfig);
msalInstance.initialize().catch((error) => {
  console.error('MSAL initialization error:', error);
});

class EntraExternalIdService {
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
        scopes: ['openid', 'profile', 'email']
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
      scopes: ['openid', 'profile', 'email']
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

export const entraExternalId = new EntraExternalIdService();
export default entraExternalId;
```

### **Step 9: Update App.tsx**
Replace `azure-b2c` imports with `entra-external-id`:

```typescript
import entraExternalId from './services/entra-external-id';

// Replace all azureB2C references with entraExternalId
```

---

## 🐳 **Part 5: Docker Configuration**

### **Step 10: Update Dockerfile**
```dockerfile
# Accept build arguments with defaults
ARG REACT_APP_ENTRA_CLIENT_ID=your-client-id
ARG REACT_APP_ENTRA_AUTHORITY=https://tenant.ciamlogin.com/tenant-id
ARG REACT_APP_BACKEND_URL=https://api.yoursite.com

# Set environment variables for build
ENV REACT_APP_ENTRA_CLIENT_ID=$REACT_APP_ENTRA_CLIENT_ID
ENV REACT_APP_ENTRA_AUTHORITY=$REACT_APP_ENTRA_AUTHORITY
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL
```

### **Step 11: Update GitHub Actions**
```yaml
env:
  REACT_APP_ENTRA_CLIENT_ID: 'your-client-id'
  REACT_APP_ENTRA_AUTHORITY: 'https://tenant.ciamlogin.com/tenant-id'
  REACT_APP_BACKEND_URL: 'https://api.yoursite.com'

# In build step:
docker build \
  --build-arg REACT_APP_ENTRA_CLIENT_ID=${{ env.REACT_APP_ENTRA_CLIENT_ID }} \
  --build-arg REACT_APP_ENTRA_AUTHORITY=${{ env.REACT_APP_ENTRA_AUTHORITY }} \
  --build-arg REACT_APP_BACKEND_URL=${{ env.REACT_APP_BACKEND_URL }} \
  -t your-image .
```

---

## 🧪 **Part 6: Testing & Verification**

### **Step 12: Verify Configuration**
1. **Test discovery endpoint**:
   ```
   https://TENANT-NAME.ciamlogin.com/TENANT-ID/v2.0/.well-known/openid_configuration
   ```
2. **Should return**: JSON with endpoints and configuration

### **Step 13: Test User Flow**
1. **Go to**: User flows → Your flow → Run user flow
2. **Test**: Sign-up and sign-in process
3. **Verify**: Tokens are issued correctly

### **Step 14: Test Application**
1. **Deploy**: Your application
2. **Test**: Login button
3. **Verify**: Authentication popup works
4. **Check**: User profile data appears

---

## 📋 **Configuration Checklist**

### **External Tenant Setup**
- ✅ External tenant created
- ✅ App registration created
- ✅ Platform set to "Single-page application"
- ✅ Redirect URIs configured
- ✅ Authentication settings enabled

### **User Flow Setup**
- ✅ User flow created
- ✅ Identity providers configured
- ✅ User attributes selected
- ✅ Application associated with user flow

### **Code Configuration**
- ✅ Service file created with correct values
- ✅ App.tsx updated to use new service
- ✅ Environment variables configured

### **Deployment Setup**
- ✅ Dockerfile accepts build arguments
- ✅ GitHub Actions passes environment variables
- ✅ Build process embeds configuration

---

## 🔧 **Common Values to Replace**

```bash
# Replace these in your setup:
TENANT-NAME → devinsightsblog
TENANT-ID → d1125adb-c883-4751-83de-4946aa0825ff
CLIENT-ID → 1d40f916-03d8-41a4-859b-9431cff65d99
YOUR-DOMAIN → functions.devinsights.site
```

---

## 🎯 **Final Result**

After completing all steps:
- ✅ Users can sign up with email/password
- ✅ Authentication popup works smoothly
- ✅ JWT tokens are issued and validated
- ✅ User profile data is accessible
- ✅ Application works in production

**Total setup time**: ~30 minutes for new environment