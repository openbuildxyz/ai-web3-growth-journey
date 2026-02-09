import { LlmTransactionAnalysisService } from './llm-analysis-service';
import {
  ApiKeyError,
  ServerError,
  NetworkError,
  TimeoutError,
  BadResponseError,
} from './errors';

const MOCK_API_KEY = 'test-api-key';
const MOCK_MODEL = 'test-model';
const MOCK_API_URL = 'https://mock-openrouter.ai/api/v1/chat/completions';

// Define a type for the mock chrome object and its properties
type MockStorage = {
  get: jest.Mock<void, [string[], (result: { [key: string]: any }) => void]>;
};

type MockChrome = {
  storage: {
    local: MockStorage;
  };
  runtime: {
    lastError: Error | null;
  };
};

// Mock chrome.storage.local
const mockChrome: MockChrome = {
  storage: {
    local: {
      get: jest.fn(),
    },
  },
  runtime: {
    lastError: null,
  },
};

// Assign to global, but with a more specific type if possible for linters.
// Using 'as any' is a pragmatic choice here for stubbing a global.
global.chrome = mockChrome as any;

describe('LlmTransactionAnalysisService', () => {
  let service: LlmTransactionAnalysisService;
  let globalFetch: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new LlmTransactionAnalysisService(MOCK_MODEL, MOCK_API_URL);
    globalFetch = jest.fn();
    global.fetch = globalFetch;

    mockChrome.runtime.lastError = null;
    mockChrome.storage.local.get.mockImplementation(
      (_keys, callback: (result: { [key: string]: any }) => void) => {
        callback({ openRouterApiKey: MOCK_API_KEY });
      },
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should throw ApiKeyError if API key is not found in storage', async () => {
    mockChrome.storage.local.get.mockImplementation(
      (_keys, callback: (result: { [key: string]: any }) => void) => {
        callback({}); // Simulate no key found
      },
    );
    const mockTransaction = { from: '0x1', to: '0x2', value: '1 ETH' };
    await expect(service.analyzeTransaction(mockTransaction)).rejects.toThrow(
      ApiKeyError,
    );
  });

  it('should analyze transaction and return parsed content on success', async () => {
    const mockTransaction = { from: '0x1', to: '0x2', value: '1 ETH' };
    const mockApiResponse = {
      choices: [
        {
          message: {
            content: '{"analysis":"risky","riskLevel":"high"}',
          },
        },
      ],
    };
    globalFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
    });

    const result = await service.analyzeTransaction(mockTransaction);

    expect(globalFetch).toHaveBeenCalledTimes(1);
    expect(globalFetch).toHaveBeenCalledWith(MOCK_API_URL, expect.any(Object));
    const {
      body,
      headers: { Authorization },
      method,
    } = globalFetch.mock.calls[0][1];
    expect(method).toBe('POST');
    expect(Authorization).toBe(`Bearer ${MOCK_API_KEY}`);
    const parsedBody = JSON.parse(body);
    expect(parsedBody.model).toBe(MOCK_MODEL);
    expect(parsedBody.messages[0].content).toContain(
      JSON.stringify(mockTransaction, null, 2),
    );

    expect(result).toStrictEqual({ analysis: 'risky', riskLevel: 'high' });
  });

  it('should throw ServerError if the API returns a 5xx status', async () => {
    const mockTransaction = { from: '0x1', to: '0x2', value: '1 ETH' };
    globalFetch.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    await expect(service.analyzeTransaction(mockTransaction)).rejects.toThrow(
      ServerError,
    );
  });

  it('should throw ApiKeyError if the API returns a 401 status', async () => {
    const mockTransaction = { from: '0x1', to: '0x2', value: '1 ETH' };
    globalFetch.mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
    });

    await expect(service.analyzeTransaction(mockTransaction)).rejects.toThrow(
      ApiKeyError,
    );
  });

  it('should throw NetworkError if fetch itself fails', async () => {
    const mockTransaction = { from: '0x1', to: '0x2', value: '1 ETH' };
    globalFetch.mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(service.analyzeTransaction(mockTransaction)).rejects.toThrow(
      NetworkError,
    );
  });

  it('should throw BadResponseError if the response content is malformed JSON', async () => {
    const mockTransaction = { from: '0x1', to: '0x2', value: '1 ETH' };
    const mockApiResponse = {
      choices: [{ message: { content: 'this is not json' } }],
    };
    globalFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
    });

    await expect(service.analyzeTransaction(mockTransaction)).rejects.toThrow(
      BadResponseError,
    );
  });

  it('should throw BadResponseError if the API response structure is unexpected', async () => {
    const mockTransaction = { from: '0x1', to: '0x2', value: '1 ETH' };
    const mockApiResponse = {
      // Missing 'choices' array
    };
     globalFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
    });

    await expect(service.analyzeTransaction(mockTransaction)).rejects.toThrow(
      BadResponseError,
    );
  });

  describe('buildPrompt', () => {
    it('should generate a correct prompt for a standard transaction', () => {
      const txData = {
        from: '0x1',
        to: '0x2',
        value: '1.0 ETH',
        data: '0x',
        // origin is removed to correctly trigger transaction prompt
        type: 'simpleSend',
      };
      const prompt = service.buildPrompt(txData);
      expect(prompt).toContain(
        '您是一位区块链安全专家。请从用户的角度分析以下以太坊交易或签名请求，',
      );
      expect(prompt).toContain('交易详情:');
      expect(prompt).toContain('"to": "0x2"');
      expect(prompt).toContain('"type": "simpleSend"');
    });

    it('should generate a correct prompt for a signature request', () => {
      const sigData = {
        from: '0xSigner',
        // origin is removed to correctly trigger signature prompt
        type: 'personal_sign',
        message: 'Hello, world!',
      };
      const prompt = service.buildPrompt(sigData);
      expect(prompt).toContain(
        '您是一位区块链安全专家。请从用户的角度分析以下以太坊交易或签名请求，',
      );
      expect(prompt).toContain('交易详情:');
      expect(prompt).toContain('"type": "personal_sign"');
      expect(prompt).toContain('"message": "Hello, world!"');
    });
  });
});