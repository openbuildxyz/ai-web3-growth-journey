import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ApiKeyConfigurationModal from './ApiKeyConfigurationModal';

// Mock chrome API
const mockChrome = {
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
    },
  },
  runtime: {
    lastError: null,
  },
};
global.chrome = mockChrome as any;

describe('ApiKeyConfigurationModal', () => {
  const handleClose = jest.fn();
  const handleSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockChrome.storage.local.get.mockImplementation((_keys, callback) => callback({}));
    mockChrome.storage.local.set.mockImplementation((_data, callback) => callback());
  });

  it('should not be visible when open is false', () => {
    render(<ApiKeyConfigurationModal open={false} onClose={handleClose} onSave={handleSave} />);
    expect(screen.queryByText('Configure OpenRouter API Key')).not.toBeInTheDocument();
  });

  it('should be visible when open is true', () => {
    render(<ApiKeyConfigurationModal open={true} onClose={handleClose} onSave={handleSave} />);
    expect(screen.getByText('Configure OpenRouter API Key')).toBeVisible();
  });

  it('should call onClose when cancel button is clicked', () => {
    render(<ApiKeyConfigurationModal open={true} onClose={handleClose} onSave={handleSave} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should update input value on change', () => {
    render(<ApiKeyConfigurationModal open={true} onClose={handleClose} onSave={handleSave} />);
    const input = screen.getByLabelText('API Key') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'new-api-key' } });
    expect(input.value).toBe('new-api-key');
  });

  it('should call onSave and chrome.storage.local.set when save button is clicked', () => {
    render(<ApiKeyConfigurationModal open={true} onClose={handleClose} onSave={handleSave} />);
    const input = screen.getByLabelText('API Key');
    fireEvent.change(input, { target: { value: 'saved-api-key' } });
    fireEvent.click(screen.getByText('Save'));

    expect(mockChrome.storage.local.set).toHaveBeenCalledWith(
      { openRouterApiKey: 'saved-api-key' },
      expect.any(Function),
    );
    expect(handleSave).toHaveBeenCalledWith('saved-api-key');
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should load existing API key from storage when opened', () => {
    mockChrome.storage.local.get.mockImplementation((_keys, callback) => {
      callback({ openRouterApiKey: 'existing-key' });
    });

    render(<ApiKeyConfigurationModal open={true} onClose={handleClose} onSave={handleSave} />);
    const input = screen.getByLabelText('API Key') as HTMLInputElement;
    expect(input.value).toBe('existing-key');
  });
});