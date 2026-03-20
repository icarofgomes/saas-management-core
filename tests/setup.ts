let originalLog: typeof console.log;
let originalInfo: typeof console.info;
let originalWarn: typeof console.warn;
let originalError: typeof console.error;

beforeAll(() => {
  originalLog = console.log;
  originalInfo = console.info;
  originalWarn = console.warn;
  originalError = console.error;
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'info').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  const state = expect.getState();
  if (state.currentTestResults?.status === 'failed') {
    console.log = originalLog;
    console.info = originalInfo;
    console.warn = originalWarn;
    console.error = originalError;
  }
});
