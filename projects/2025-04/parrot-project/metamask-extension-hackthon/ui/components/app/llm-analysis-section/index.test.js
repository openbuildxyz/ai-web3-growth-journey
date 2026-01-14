/* eslint-disable no-undef */
import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { LlmTransactionAnalysisService } from '../../../../shared/lib/llm-analysis-service';
import {
  ApiKeyError,
  ServerError,
  NetworkError,
  TimeoutError,
  BadResponseError,
} from '../../../../shared/lib/errors';
import LlmAnalysisSection from '.';

jest.mock('../../../../shared/lib/llm-analysis-service');

describe('LlmAnalysisSection', () => {
  const mockOrigin = 'https://example.com';

  beforeEach(() => {
    LlmTransactionAnalysisService.mockClear();
    localStorage.clear();
  });

  // Helper to get the input field
  const getApiKeyInput = () => screen.getByLabelText('API Key');

  it('renders the component with an API key input and disabled Analyze button', () => {
    render(<LlmAnalysisSection activeTabOrigin={mockOrigin} />);
    expect(getApiKeyInput()).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Analyze Connection' }),
    ).toBeDisabled();
  });

  it('enables the Analyze button when an API key is entered', () => {
    render(<LlmAnalysisSection activeTabOrigin={mockOrigin} />);
    const apiKeyInput = getApiKeyInput();
    fireEvent.change(apiKeyInput, { target: { value: 'test-key' } });
    expect(
      screen.getByRole('button', { name: 'Analyze Connection' }),
    ).toBeEnabled();
  });

  it('saves the API key to localStorage when Save is clicked', () => {
    render(<LlmAnalysisSection activeTabOrigin={mockOrigin} />);
    const apiKeyInput = getApiKeyInput();
    const saveButton = screen.getByRole('button', { name: 'Save Key' });

    fireEvent.change(apiKeyInput, { target: { value: 'saved-key' } });
    fireEvent.click(saveButton);

    expect(localStorage.getItem('llm_api_key')).toBe('saved-key');
  });

  it('calls the analysis service and displays the result', async () => {
    const mockAnalyze = jest.fn().mockResolvedValue({
      analysis: 'This is a safe site.',
    });
    // Mock the correct method on the prototype
    LlmTransactionAnalysisService.prototype.analyzeTransaction = mockAnalyze;

    render(<LlmAnalysisSection activeTabOrigin={mockOrigin} />);
    const apiKeyInput = getApiKeyInput();
    fireEvent.change(apiKeyInput, { target: { value: 'test-key' } });

    const analyzeButton = screen.getByRole('button', {
      name: 'Analyze Connection',
    });
    fireEvent.click(analyzeButton);

    expect(screen.getByText('Analyzing...')).toBeInTheDocument();

    await waitFor(() => {
      // The service should be called with an object containing the origin
      expect(mockAnalyze).toHaveBeenCalledWith({ origin: mockOrigin });
      expect(screen.getByText('This is a safe site.')).toBeInTheDocument();
    });
  });

  // Parameterized test for different error types
  it.each([
    [new ApiKeyError(), 'API Key 无效或已过期，请检查后重试。'],
    [new ServerError(), '分析服务暂时不可用，请稍后再试。'],
    [new NetworkError(), '网络连接失败，请检查您的网络设置。'],
    [new TimeoutError(), '分析请求超时，请稍后重试。'],
    [new BadResponseError(), '无法从分析服务解析响应。'],
    [new Error('A generic error'), 'A generic error'],
  ])(
    'displays the correct error message for %s',
    async (error, expectedMessage) => {
      const mockAnalyze = jest.fn().mockRejectedValue(error);
      LlmTransactionAnalysisService.prototype.analyzeTransaction = mockAnalyze;

      render(<LlmAnalysisSection activeTabOrigin={mockOrigin} />);
      const apiKeyInput = getApiKeyInput();
      fireEvent.change(apiKeyInput, { target: { value: 'test-key' } });

      const analyzeButton = screen.getByRole('button', {
        name: 'Analyze Connection',
      });
      fireEvent.click(analyzeButton);

      await waitFor(() => {
        expect(screen.getByText(expectedMessage)).toBeInTheDocument();
      });
    },
  );
});
