// Mock for the utils module
export const shim = {
  createHmac: jest.fn().mockImplementation(() => ({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn().mockReturnValue("mocked-signature"),
  })),
  randomBytes: {
    seed: jest.fn().mockReturnValue(true),
  },
};
