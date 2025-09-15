import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AnalysisButton from './AnalysisButton';

// Mock the Settings icon
jest.mock('@mui/icons-material/Settings', () => () => <svg data-testid="settings-icon" />);

describe('AnalysisButton', () => {
  const handleAnalyze = jest.fn();
  const handleConfigure = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the analyze button and configure icon', () => {
    render(<AnalysisButton onAnalyze={handleAnalyze} onConfigure={handleConfigure} isLoading={false} />);
    expect(screen.getByText('Analyze Transaction')).toBeInTheDocument();
    expect(screen.getByTestId('settings-icon')).toBeInTheDocument();
  });

  it('calls onAnalyze when the analyze button is clicked', () => {
    render(<AnalysisButton onAnalyze={handleAnalyze} onConfigure={handleConfigure} isLoading={false} />);
    fireEvent.click(screen.getByText('Analyze Transaction'));
    expect(handleAnalyze).toHaveBeenCalledTimes(1);
    expect(handleConfigure).not.toHaveBeenCalled();
  });

  it('calls onConfigure when the configure button is clicked', () => {
    render(<AnalysisButton onAnalyze={handleAnalyze} onConfigure={handleConfigure} isLoading={false} />);
    fireEvent.click(screen.getByTestId('settings-icon'));
    expect(handleConfigure).toHaveBeenCalledTimes(1);
    expect(handleAnalyze).not.toHaveBeenCalled();
  });

  it('disables the analyze button and shows loading text when isLoading is true', () => {
    render(<AnalysisButton onAnalyze={handleAnalyze} onConfigure={handleConfigure} isLoading={true} />);
    const analyzeButton = screen.getByText('Analyzing...');
    expect(analyzeButton).toBeInTheDocument();
    expect(analyzeButton).toBeDisabled();
  });
});