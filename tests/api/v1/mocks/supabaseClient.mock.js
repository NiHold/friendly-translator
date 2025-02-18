// tests/mocks/supabaseMock.js
import { jest } from "@jest/globals";

function createChainableQuery() {
  return {
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    // maybeSingle is expected to end the chain and return a promise.
    maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
  };
}

export const mockClient = {
  from: jest.fn().mockImplementation(() => createChainableQuery()),
  auth: {
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    setAuth: jest.fn(),
    signOut: jest.fn(),
  },
};

export function setupSupabaseMock() {
  jest.unstable_mockModule(
    "#common/factories/supabaseClient.factory.js",
    () => {
      return {
        getSupabaseClient: jest.fn(() => mockClient),
      };
    }
  );
}
