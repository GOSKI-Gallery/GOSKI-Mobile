---
name: goski-testing
description: How to write and run tests for GOSKI Mobile. Jest, @testing-library/react-native, Supabase mocking patterns, Zustand store tests.
---

## Test setup
- Framework: Jest 29.7 + jest-expo preset
- Library: @testing-library/react-native 13.3.3
- Config: inline in package.json under "jest" key
- Setup file: `jest.setup.js` (mocks AsyncStorage, Animated.timing, sets fake Supabase env vars)
- Run: `npm test` or `npm run test:coverage`

## Coverage thresholds (global)
- Branches: 45%, Functions: 45%, Lines: 50%, Statements: 50%

## Testing patterns

### A) Pure UI components
Simple render -> assert text -> fireEvent -> verify callbacks.
No mocks needed unless component uses Zustand/Supabase.

### B) Supabase mocking — simple chain
```ts
jest.mock('../../lib/supabase', () => ({
  supabase: {
    auth: { signInWithPassword: jest.fn() },
    from: jest.fn(() => ({
      select: jest.fn(() => ({ eq: jest.fn(() => ({ maybeSingle: jest.fn(), single: jest.fn() })) })),
      insert: jest.fn(() => ({ select: jest.fn(() => ({ single: jest.fn() })) })),
    })),
  },
}));
```

### C) Supabase mocking — complex chain (makeChain)
For stores/services with multiple sequential Supabase calls, define a `makeChain()` helper:
```ts
function makeChain(finalResult?: any) {
  const chain: any = {};
  chain.select = jest.fn(() => chain);
  chain.eq = jest.fn(() => chain);
  chain.in = jest.fn(() => chain);
  chain.or = jest.fn(() => chain);
  chain.order = jest.fn(() => chain);
  chain.maybeSingle = jest.fn(() => chain);
  chain._result = finalResult;
  chain.then = (resolve: any) => Promise.resolve(chain._result).then(resolve);
  chain.catch = (reject: any) => Promise.resolve(chain._result).catch(reject);
  return chain;
}
```

### D) Zustand store tests
- Reset store state in beforeEach: `useXxxStore.setState(initialState)`
- Call methods directly: `useXxxStore.getState().method()`
- Assert on: `useXxxStore.getState()`

### E) Mocking Zustand stores in component tests
```ts
jest.mock('../../states/useAuthStore', () => ({
  useAuthStore: (selector: any) => selector({ user: mockUser, setAuth: mockSetAuth }),
}));
```

## Key rules
- Always call `jest.clearAllMocks()` in beforeEach
- Always await async assertions with `waitFor` from @testing-library/react-native
- Use `fireEvent` for presses and `fireEvent.changeText` for inputs
- For async Supabase calls, use `mockResolvedValue` / `mockRejectedValue`
- Use `Object.assign` on the mock module to provide both `default` and named exports when needed
