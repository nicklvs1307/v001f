---
name: frontend-components
description: Component architecture and code organization guide for React + MUI projects. Covers folder structure, naming conventions, custom hooks, state management, API layer, routing, testing patterns, and i18n. Use when creating new components, organizing code, or refactoring project structure.
license: MIT
compatibility: opencode
metadata:
  audience: frontend-developers
  stack: react,mui,axios,i18next
  version: "1.0.0"
---

# Frontend Components & Architecture Guide

Code organization, component patterns, and architectural conventions for React + MUI applications with Axios, Socket.io, i18next, and React Router v6.

## When to Apply

### Must Use

- Creating new components, pages, or features
- Setting up new routes or layouts
- Adding custom hooks
- Implementing API calls or data fetching
- Adding internationalization to new features
- Writing tests for components

### Recommended

- Refactoring existing code
- Code review for consistency
- Onboarding new developers

### Skip

- Backend changes
- CI/CD, Docker configuration

---

## 1. Project Structure

### Folder Layout

```
src/
├── components/          # Reusable UI components
│   ├── common/          # Generic (Button, Card, Modal)
│   ├── layout/          # Layout (Sidebar, Header, Footer)
│   └── forms/           # Form-specific components
├── pages/               # Route-level components (one folder per route)
│   ├── Dashboard/
│   │   ├── index.jsx
│   │   ├── Dashboard.jsx
│   │   └── Dashboard.test.jsx
│   └── Settings/
│       ├── index.jsx
│       ├── Settings.jsx
│       └── components/  # Page-specific sub-components
├── hooks/               # Custom hooks
├── services/            # API calls, socket setup
│   ├── api.js           # Axios instance + interceptors
│   └── socket.js        # Socket.io singleton
├── contexts/            # React Context providers
├── utils/               # Pure utility functions
├── i18n/                # Internationalization config + translations
│   ├── index.js
│   ├── locales/
│   │   ├── pt-BR.json
│   │   └── en-US.json
│   └── hooks.js         # useTranslation wrapper
├── theme/               # MUI theme configuration
│   ├── index.js
│   ├── palette.js
│   └── typography.js
├── routes/              # Route definitions
│   └── index.jsx
├── App.jsx
└── index.jsx
```

### Rules

- One component per file, filename matches component name
- Page folders use PascalCase: `Dashboard/`, `Settings/`
- Utility files use camelCase: `formatDate.js`, `validators.js`
- Test files colocated: `Component.test.jsx` next to `Component.jsx`
- CSS-in-JS only (MUI `sx` prop or `styled`) — no separate CSS files

---

## 2. Naming Conventions

### Components
- PascalCase: `UserProfile`, `OrderTable`, `SidebarNavItem`
- Prefix with context if ambiguous: `DashboardCard`, `SettingsForm`

### Files
- Components: `UserProfile.jsx`
- Hooks: `useAuth.js`, `useSocket.js`
- Services: `userService.js`, `orderService.js`
- Utils: `formatCurrency.js`, `dateHelpers.js`

### Variables & Functions
- camelCase: `userName`, `fetchOrders`, `handleClick`
- Boolean: `isLoading`, `hasError`, `canEdit`, `shouldRedirect`
- Event handlers: `handleClick`, `handleSubmit`, `handleChange`
- Custom hooks: `use` prefix: `useAuth`, `useDebounce`, `useLocalStorage`

### CSS/Tokens
- MUI theme tokens: `primary.main`, `text.secondary`, `background.paper`
- Custom tokens: `neutral.500`, `surface.default`

---

## 3. Component Patterns

### Functional Components Only
```jsx
// ✅ Good
function UserCard({ user, onSelect }) {
  return (
    <Card onClick={() => onSelect(user.id)}>
      <CardContent>
        <Typography variant="h6">{user.name}</Typography>
      </CardContent>
    </Card>
  );
}

export default React.memo(UserCard);
```

### Props Destructuring
```jsx
// ✅ Good: destructure in signature
function OrderRow({ id, customerName, status, total, onEdit }) {
  return <TableRow>...</TableRow>;
}

// ❌ Bad: access via props.xxx
function OrderRow(props) {
  return <TableRow>{props.customerName}</TableRow>;
}
```

### Default Props via Destructuring
```jsx
// ✅ Good
function Badge({ count = 0, variant = 'standard', color = 'primary' }) {
  return <MuiBadge badgeContent={count} variant={variant} color={color} />;
}
```

### Composition over Configuration
```jsx
// ❌ Bad: too many props
<Card
  title="..."
  subtitle="..."
  avatar="..."
  actions={[...]}
  footer="..."
  variant="..."
/>

// ✅ Good: composition
<Card>
  <CardHeader
    title="..."
    subtitle="..."
    avatar={<Avatar />}
    action={<IconButton />}
  />
  <CardContent>...</CardContent>
  <CardActions>...</CardActions>
</Card>
```

### Render Props for Complex Logic
```jsx
// ✅ Good: separate logic from presentation
function DataFetcher({ url, children }) {
  const { data, loading, error } = useApi(url);
  return children({ data, loading, error });
}

// Usage
<DataFetcher url="/api/orders">
  {({ data, loading, error }) => {
    if (loading) return <Skeleton />;
    if (error) return <Alert severity="error">...</Alert>;
    return <OrderTable orders={data} />;
  }}
</DataFetcher>
```

---

## 4. Custom Hooks

### Standard Hooks

| Hook | Purpose | File |
|------|---------|------|
| `useAuth` | Auth state, login/logout, token | `hooks/useAuth.js` |
| `useApi` | Generic data fetching with loading/error | `hooks/useApi.js` |
| `useSocket` | Socket connection + event management | `hooks/useSocket.js` |
| `useDebounce` | Debounce value changes | `hooks/useDebounce.js` |
| `useLocalStorage` | Persistent state in localStorage | `hooks/useLocalStorage.js` |
| `useMediaQuery` | Responsive breakpoint detection | Re-export from MUI |

### useApi Pattern
```jsx
// hooks/useApi.js
function useApi(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchData() {
      try {
        setLoading(true);
        const response = await api.get(url, {
          signal: controller.signal,
          ...options,
        });
        setData(response.data);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    return () => controller.abort();
  }, [url]);

  return { data, loading, error, refetch };
}
```

### useSocket Pattern
```jsx
// hooks/useSocket.js
function useSocket(event, handler) {
  useEffect(() => {
    socket.on(event, handler);
    return () => socket.off(event, handler);
  }, [event, handler]);
}
```

### Rules
- Hooks return objects, not arrays (for clarity)
- Always handle cleanup (abort controllers, remove listeners)
- Hooks should be pure — no side effects in the hook body outside useEffect
- Prefix with `use` — React enforces this

---

## 5. API Layer

### Axios Setup
```jsx
// services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 15000,
});

// Request interceptor: attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Service Pattern
```jsx
// services/orderService.js
import api from './api';

export const orderService = {
  list: (params) => api.get('/orders', { params }),
  get: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  update: (id, data) => api.put(`/orders/${id}`, data),
  delete: (id) => api.delete(`/orders/${id}`),
};
```

### Error Handling Pattern
```jsx
// In components
try {
  await orderService.create(formData);
  toast.success(t('orders.created'));
  navigate('/orders');
} catch (error) {
  const message = error.response?.data?.message || t('errors.generic');
  toast.error(message);
}
```

---

## 6. Routing

### Route Structure
```jsx
// routes/index.jsx
import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import PrivateRoute from '../components/common/PrivateRoute';
import MainLayout from '../components/layout/MainLayout';

const Dashboard = React.lazy(() => import('../pages/Dashboard'));
const Orders = React.lazy(() => import('../pages/Orders'));
const Settings = React.lazy(() => import('../pages/Settings'));
const Login = React.lazy(() => import('../pages/Login'));

const Loading = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
    <CircularProgress />
  </Box>
);

function AppRoutes() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<PrivateRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
```

### Navigation Usage
```jsx
// ✅ Good: use MUI components with React Router
import { Link as RouterLink } from 'react-router-dom';
import { ListItemButton, ListItemText } from '@mui/material';

<ListItemButton
  component={RouterLink}
  to="/dashboard"
  selected={location.pathname === '/dashboard'}
>
  <ListItemText primary={t('nav.dashboard')} />
</ListItemButton>
```

---

## 7. State Management

### Rules
- Prefer local state (`useState`) for UI-only state (modals, form inputs)
- Use Context for global state that many components need (auth, theme, locale)
- Don't put server data in Context — fetch with hooks, cache with state

### Context Pattern
```jsx
// contexts/AuthContext.jsx
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

### Rules for Context
- Always provide a custom hook for consuming: `useAuth()`, `useTheme()`
- Memoize context value with `useMemo`
- Split contexts by concern — don't put everything in one Provider
- Don't put rapidly changing values in context (causes re-renders everywhere)

---

## 8. Internationalization (i18n)

### Setup
```jsx
// i18n/index.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ptBR from './locales/pt-BR.json';
import enUS from './locales/en-US.json';

i18n.use(initReactI18next).init({
  resources: {
    'pt-BR': { translation: ptBR },
    'en-US': { translation: enUS },
  },
  lng: localStorage.getItem('lang') || 'pt-BR',
  fallbackLng: 'pt-BR',
  interpolation: { escapeValue: false },
});

export default i18n;
```

### Translation Structure
```json
// i18n/locales/pt-BR.json
{
  "common": {
    "save": "Salvar",
    "cancel": "Cancelar",
    "delete": "Excluir",
    "loading": "Carregando...",
    "error": "Erro",
    "success": "Sucesso"
  },
  "nav": {
    "dashboard": "Painel",
    "orders": "Pedidos",
    "settings": "Configurações"
  },
  "orders": {
    "title": "Pedidos",
    "created": "Pedido criado com sucesso",
    "empty": "Nenhum pedido encontrado"
  }
}
```

### Usage in Components
```jsx
import { useTranslation } from 'react-i18next';

function OrderPage() {
  const { t } = useTranslation();

  return (
    <Box>
      <Typography variant="h4">{t('orders.title')}</Typography>
      <Button onClick={handleSave}>{t('common.save')}</Button>
    </Box>
  );
}
```

### Rules
- Nested keys by feature: `orders.title`, `settings.theme`
- Shared strings under `common.*`
- Never hardcode user-facing strings — always use `t()`
- Interpolation: `t('orders.count', { count: 5 })` → "5 pedidos"

---

## 9. Testing Patterns

### Component Test Structure
```jsx
// pages/Dashboard/Dashboard.test.jsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../theme';
import Dashboard from './Dashboard';

function renderWithProviders(ui) {
  return render(
    <MemoryRouter>
      <ThemeProvider theme={theme}>
        {ui}
      </ThemeProvider>
    </MemoryRouter>
  );
}

describe('Dashboard', () => {
  it('renders loading state initially', () => {
    renderWithProviders(<Dashboard />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays data after loading', async () => {
    renderWithProviders(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });
});
```

### Rules
- Test behavior, not implementation
- Use `screen.getByRole` over `getByTestId` when possible
- Use `userEvent` over `fireEvent` for interactions
- Wrap in providers (Router, Theme, i18n) via helper function
- Mock API calls with `jest.mock` or MSW
- Test loading, error, empty, and success states

---

## 10. Code Style Rules

### Imports Order
```jsx
// 1. React
import React, { useState, useEffect, useCallback } from 'react';

// 2. MUI
import { Box, Typography, Button } from '@mui/material';

// 3. External libraries
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// 4. Internal: services
import { orderService } from '../../services/orderService';

// 5. Internal: hooks
import { useAuth } from '../../hooks/useAuth';

// 6. Internal: components
import OrderTable from '../../components/common/OrderTable';

// 7. Internal: utils
import { formatCurrency } from '../../utils/formatCurrency';
```

### Component File Order
```jsx
// 1. Imports
// 2. Constants / helpers (module-level)
// 3. Component definition
// 4. PropTypes or default props (if used)
// 5. Export
```

### General Rules
- No comments unless asked
- Prefer `const` over `let`
- Early returns over nested ternaries
- Destructure props and state
- One component per file
- Export default at bottom
- Use optional chaining (`?.`) and nullish coalescing (`??`)
- No `any` types — if using PropTypes, define them; if TypeScript, type everything

---

## Anti-Patterns to Avoid

| Don't | Why |
|-------|-----|
| Components >300 lines | Hard to read, test, and maintain |
| Prop drilling >2 levels | Use Context or composition |
| Inline API calls in components | No reuse, hard to test, no caching |
| Hardcoded strings | Breaks i18n |
| CSS files alongside MUI | Mixing systems, inconsistent styling |
| Default export of anonymous functions | Poor debugging, no name in DevTools |
| `index.js` as component name | Confusing imports, poor searchability |
| Circular imports | Build errors, unpredictable behavior |
| `useEffect` for derived state | Compute during render instead |
| Mutating state directly | `state.push(x)` instead of `setState([...state, x])` |

---

## Pre-Delivery Checklist

Before delivering component code:

- [ ] One component per file, PascalCase filename
- [ ] Props destructured in function signature
- [ ] No hardcoded user-facing strings (use `t()`)
- [ ] API calls in services, not inline
- [ ] Loading and error states handled
- [ ] Routes are lazy-loaded
- [ ] Socket listeners have cleanup
- [ ] Imports in correct order
- [ ] Component <300 lines
- [ ] Test covers loading, error, success states
