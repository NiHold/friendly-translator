// tests/mocks/supabaseMock.js
import { jest } from "@jest/globals";

export const mockClient = {
  from: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  maybeSingle: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
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
