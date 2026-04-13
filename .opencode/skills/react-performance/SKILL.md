---
name: react-performance
description: React 18 + MUI performance optimization guide. Covers eliminating waterfalls, bundle optimization, re-render patterns, MUI-specific optimizations, Socket.io cleanup, Recharts performance, and advanced React patterns. Use when writing components, reviewing code, or optimizing performance.
license: MIT
compatibility: opencode
metadata:
  audience: frontend-developers
  stack: react,mui,recharts,socket.io
  version: "1.0.0"
---

# React Performance Optimization Guide

Performance rules for React 18 applications with MUI 5, Recharts, and Socket.io. Organized by impact level — follow priority order when optimizing.

## When to Apply

### Must Use

- Writing new React components
- Implementing data fetching (client or server)
- Reviewing code for performance issues
- Refactoring existing components
- Optimizing bundle size or load times
- Working with lists/tables, charts, or real-time data

### Recommended

- App feels slow or janky
- Bundle size audit
- Pre-launch optimization pass

### Skip

- Backend-only changes
- Configuration files, Docker, CI/CD

## Priority Reference

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Eliminating Waterfalls | CRITICAL | `async-` |
| 2 | Bundle Size | CRITICAL | `bundle-` |
| 3 | Re-render Optimization | HIGH | `rerender-` |
| 4 | MUI Performance | HIGH | `mui-` |
| 5 | Socket.io | MEDIUM | `socket-` |
| 6 | Recharts | MEDIUM | `chart-` |
| 7 | Data & State | MEDIUM | `data-` |
| 8 | Advanced Patterns | LOW | `advanced-` |

---

## 1. Eliminating Waterfalls (CRITICAL)

### `async-parallel` — Parallelize Independent Requests
```jsx
// ❌ Bad: sequential waterfall
const user = await fetchUser(id);
const orders = await fetchOrders(id);
const notifications = await fetchNotifications(id);

// ✅ Good: parallel
const [user, orders, notifications] = await Promise.all([
  fetchUser(id),
  fetchOrders(id),
  fetchNotifications(id),
]);
```

### `async-conditional-await` — Defer Await to Where Needed
```jsx
// ❌ Bad: awaits even when not used
const data = await fetchData();
if (condition) {
  return <Component data={data} />;
}
return <Other />;

// ✅ Good: start promise early, await late
const dataPromise = fetchData();
if (condition) {
  const data = await dataPromise;
  return <Component data={data} />;
}
return <Other />;
```

### `async-suspense` — Use Suspense for Streaming
```jsx
// ✅ Good: let Suspense handle loading states
<Suspense fallback={<Skeleton />}>
  <SlowComponent />
</Suspense>
```

### `async-lazy-routes` — Lazy Load Routes
```jsx
// ✅ Good: code-split by route
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Settings = React.lazy(() => import('./pages/Settings'));

<Routes>
  <Route path="/dashboard" element={
    <Suspense fallback={<PageSkeleton />}>
      <Dashboard />
    </Suspense>
  } />
</Routes>
```

---

## 2. Bundle Size (CRITICAL)

### `bundle-direct-imports` — Import Directly from Source
```jsx
// ❌ Bad: barrel imports pull entire library
import { Button, TextField, Box } from '@mui/material';

// ✅ Good: direct imports
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
```

### `bundle-babel-plugin` — Use Babel Plugin for MUI
```jsx
// babel.config.js
module.exports = {
  plugins: [
    ['babel-plugin-import', {
      libraryName: '@mui/material',
      libraryDirectory: '',
      camel2DashComponentName: false,
    }],
  ],
};
```

### `bundle-lazy-components` — Dynamic Import Heavy Components
```jsx
// ✅ Good: lazy load heavy chart/dashboard components
const AnalyticsChart = React.lazy(() => import('./AnalyticsChart'));
const DataGrid = React.lazy(() => import('./DataGrid'));

// Use only when needed
{showChart && (
  <Suspense fallback={<Skeleton height={300} />}>
    <AnalyticsChart data={chartData} />
  </Suspense>
)}
```

### `bundle-defer-analytics` — Defer Non-Critical Scripts
```jsx
// ✅ Good: load analytics after hydration
useEffect(() => {
  const script = document.createElement('script');
  script.src = '/analytics.js';
  script.async = true;
  document.body.appendChild(script);
}, []);
```

### `bundle-preload` — Preload on Interaction
```jsx
// ✅ Good: preload route on hover
<Link
  to="/dashboard"
  onMouseEnter={() => import('./pages/Dashboard')}
>
  Dashboard
</Link>
```

---

## 3. Re-render Optimization (HIGH)

### `rerender-memo` — Memoize Expensive Components
```jsx
// ✅ Good: memo for components with stable props
const UserCard = React.memo(function UserCard({ user }) {
  return (
    <Card>
      <CardContent>
        <Typography>{user.name}</Typography>
      </CardContent>
    </Card>
  );
});
```

### `rerender-useMemo` — Memoize Expensive Calculations
```jsx
// ❌ Bad: recalculates every render
const sortedData = data.sort((a, b) => a.name.localeCompare(b.name));

// ✅ Good: memoize
const sortedData = useMemo(
  () => [...data].sort((a, b) => a.name.localeCompare(b.name)),
  [data]
);
```

### `rerender-useCallback` — Stable Function References
```jsx
// ❌ Bad: new function every render, breaks memo children
const handleClick = () => { setOpen(true); };

// ✅ Good: stable reference
const handleClick = useCallback(() => {
  setOpen(true);
}, []);
```

### `rerender-primitive-deps` — Use Primitive Dependencies
```jsx
// ❌ Bad: object reference changes every render
useEffect(() => {
  fetchData(filters);
}, [filters]); // filters is object, new ref each render

// ✅ Good: destructure to primitives
useEffect(() => {
  fetchData({ status, dateRange, searchTerm });
}, [status, dateRange, searchTerm]);
```

### `rerender-functional-setstate` — Functional setState for Stable Callbacks
```jsx
// ❌ Bad: count in closure is stale
const increment = useCallback(() => {
  setCount(count + 1);
}, [count]);

// ✅ Good: functional update, no dependency needed
const increment = useCallback(() => {
  setCount(prev => prev + 1);
}, []);
```

### `rerender-split-hooks` — Split Independent State
```jsx
// ❌ Bad: one hook with unrelated dependencies
useEffect(() => {
  fetchUserData();
  trackPageView();
}, [userId, pagePath]); // re-runs too often

// ✅ Good: split into independent effects
useEffect(() => { fetchUserData(); }, [userId]);
useEffect(() => { trackPageView(); }, [pagePath]);
```

### `rerender-lazy-init` — Lazy useState Initialization
```jsx
// ❌ Bad: expensive computation on every render
const [state, setState] = useState(expensiveComputation());

// ✅ Good: function runs only once
const [state, setState] = useState(() => expensiveComputation());
```

### `rerender-no-inline-components` — Don't Define Components Inside Render
```jsx
// ❌ Bad: new component type every render, remounts entirely
function Parent() {
  const Child = () => <div>Hi</div>;
  return <Child />;
}

// ✅ Good: define outside or pass as children
const Child = () => <div>Hi</div>;
function Parent() {
  return <Child />;
}
```

### `rerender-startTransition` — Non-Urgent Updates
```jsx
// ✅ Good: keep input responsive while filtering large list
const handleSearch = (e) => {
  setInputValue(e.target.value);
  startTransition(() => {
    setFilteredResults(filterData(e.target.value));
  });
};
```

---

## 4. MUI Performance (HIGH)

### `mui-theme-stable` — Create Theme Outside Component
```jsx
// ❌ Bad: theme recreated every render
function App() {
  const theme = createTheme({ /* ... */ });
  return <ThemeProvider theme={theme}>...</ThemeProvider>;
}

// ✅ Good: theme created once at module level
const theme = createTheme({ /* ... */ });

function App() {
  return <ThemeProvider theme={theme}>...</ThemeProvider>;
}
```

### `mui-sx-object` — Don't Inline SX Objects
```jsx
// ❌ Bad: new object every render
<Box sx={{ display: 'flex', p: 2, color: 'primary.main' }}>

// ✅ Good: define styles outside component
const boxStyles = {
  display: 'flex',
  p: 2,
  color: 'primary.main',
};
// or use sx with stable reference
<Box sx={boxStyles}>
```

### `mui-data-grid-keys` — Stable Row ID for DataGrid
```jsx
// ❌ Bad: index as id causes re-render issues
<DataGrid getRowId={(row) => row.index} />

// ✅ Good: use stable unique field
<DataGrid getRowId={(row) => row.id} />
```

### `mui-select-render-value` — Memoize Select Render Value
```jsx
// ❌ Bad: new function every render
<Select
  renderValue={(selected) => selected.join(', ')}
>

// ✅ Good: memoize
const renderSelected = useCallback(
  (selected) => selected.join(', '),
  []
);
<Select renderValue={renderSelected} />
```

### `mui-list-virtualize` — Virtualize Long Lists
```jsx
// For lists with 50+ items, use react-window
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={400}
  itemCount={items.length}
  itemSize={64}
  width="100%"
>
  {({ index, style }) => (
    <ListItem style={style}>
      <ListItemText primary={items[index].name} />
    </ListItem>
  )}
</FixedSizeList>
```

---

## 5. Socket.io (MEDIUM)

### `socket-cleanup` — Always Clean Up Listeners
```jsx
// ✅ Good: cleanup in useEffect return
useEffect(() => {
  const handleNotification = (data) => {
    setNotifications(prev => [...prev, data]);
  };

  socket.on('notification', handleNotification);

  return () => {
    socket.off('notification', handleNotification);
  };
}, [socket]);
```

### `socket-singleton` — Single Socket Instance
```jsx
// ✅ Good: singleton socket, not created per component
// socket.js
import { io } from 'socket.io-client';
const socket = io(process.env.REACT_APP_WS_URL, {
  autoConnect: false,
});
export default socket;

// In component
import socket from './socket';
useEffect(() => {
  socket.connect();
  return () => socket.disconnect();
}, []);
```

### `socket-dedup` — Avoid Duplicate Listeners
```jsx
// ❌ Bad: listener added multiple times if effect re-runs
useEffect(() => {
  socket.on('message', handleMessage); // duplicates on re-render
});

// ✅ Good: named handler + cleanup
useEffect(() => {
  socket.on('message', handleMessage);
  return () => socket.off('message', handleMessage);
}, [handleMessage]);
```

---

## 6. Recharts (MEDIUM)

### `chart-memoize-data` — Memoize Chart Data
```jsx
// ❌ Bad: new array reference every render
<LineChart data={[...processedData]}>

// ✅ Good: memoize
const chartData = useMemo(
  () => processChartData(rawData),
  [rawData]
);
<LineChart data={chartData}>
```

### `chart-responsive` — Responsive Container
```jsx
// ✅ Good: always wrap in ResponsiveContainer
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={chartData}>
    {/* ... */}
  </LineChart>
</ResponsiveContainer>
```

### `chart-skeleton` — Loading Skeleton for Charts
```jsx
// ✅ Good: show skeleton while data loads
if (loading) {
  return <Skeleton variant="rectangular" height={300} />;
}
return (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data}>...</BarChart>
  </ResponsiveContainer>
);
```

### `chart-sample-large` — Sample Large Datasets
```jsx
// ✅ Good: sample data for performance with 1000+ points
const sampledData = useMemo(() => {
  if (data.length <= 500) return data;
  const step = Math.ceil(data.length / 500);
  return data.filter((_, i) => i % step === 0);
}, [data]);
```

---

## 7. Data & State (MEDIUM)

### `data-axios-interceptors` — Stable Interceptors
```jsx
// ✅ Good: setup interceptors once at module level
// api.js
const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```

### `data-error-boundary` — Error Boundaries
```jsx
// ✅ Good: wrap feature sections in error boundaries
<ErrorBoundary fallback={<ErrorFallback />}>
  <Dashboard />
</ErrorBoundary>
```

### `data-localstorage-cache` — Cache Storage Reads
```jsx
// ❌ Bad: reads localStorage on every render
const user = JSON.parse(localStorage.getItem('user'));

// ✅ Good: read once on init
const [user] = useState(() => {
  const stored = localStorage.getItem('user');
  return stored ? JSON.parse(stored) : null;
});
```

### `data-debounce-input` — Debounce Search/Filter
```jsx
// ✅ Good: debounce expensive operations
import { debounce } from 'lodash';

const debouncedSearch = useMemo(
  () => debounce((term) => {
    setFilteredResults(filterData(term));
  }, 300),
  []
);

const handleChange = (e) => {
  setSearchTerm(e.target.value);
  debouncedSearch(e.target.value);
};
```

---

## 8. Advanced Patterns (LOW)

### `advanced-ref-handlers` — Store Handlers in Refs
```jsx
// ✅ Good: stable callback ref for event listeners
const handlerRef = useRef();
handlerRef.current = () => {
  // always reads latest state/props
  console.log(latestValue);
};

useEffect(() => {
  const handler = () => handlerRef.current();
  window.addEventListener('resize', handler);
  return () => window.removeEventListener('resize', handler);
}, []);
```

### `advanced-useLatest` — useLatest Hook
```jsx
// ✅ Good: access latest value without re-subscribing
function useLatest(value) {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}

// Usage
const latestCallback = useLatest(callback);
useEffect(() => {
  const id = setInterval(() => latestCallback.current(), 1000);
  return () => clearInterval(id);
}, []);
```

---

## Anti-Patterns to Avoid

| Don't | Why |
|-------|-----|
| `useEffect` with object deps | Object reference changes every render, infinite loop |
| Inline arrow functions in JSX props | New reference breaks memo children |
| Creating theme inside component | Recreated every render |
| Barrel imports from @mui/material | Pulls entire library into bundle |
| Socket listeners without cleanup | Memory leaks, duplicate events |
| `Array(index)` as React key | Breaks reconciliation on reorder |
| `JSON.stringify` in render | Expensive on large objects |
| `useState` with expensive init without function | Runs on every render |
| Index as key for dynamic lists | Causes incorrect DOM reuse |
| Fetching in `useEffect` without abort | Stale data overwrites fresh data |
| `lodash` full import | `import { debounce } from 'lodash'` not `import _ from 'lodash'` |
| Defining components inside components | New type every render, full remount |

---

## Pre-Delivery Checklist

Before delivering React code:

- [ ] Independent requests use `Promise.all`
- [ ] Routes are lazy-loaded with `React.lazy`
- [ ] MUI imports are direct (not barrel)
- [ ] Theme is created outside components
- [ ] Expensive calculations wrapped in `useMemo`
- [ ] Callbacks passed to children wrapped in `useCallback`
- [ ] Effects use primitive dependencies
- [ ] Socket listeners have cleanup
- [ ] Chart data is memoized
- [ ] Large lists are virtualized
- [ ] Search/filter inputs are debounced
- [ ] Loading skeletons shown for async content
- [ ] No inline objects/styles in JSX props
- [ ] Error boundaries wrap feature sections
