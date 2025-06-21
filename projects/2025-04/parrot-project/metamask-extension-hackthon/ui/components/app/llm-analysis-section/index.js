/* eslint-disable no-undef */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import Box from '../../ui/box';
import Button from '../../ui/button';
import TextField from '../../ui/text-field';
import Typography from '../../ui/typography';
import { TypographyVariant } from '../../../helpers/constants/design-system';
import { LlmTransactionAnalysisService } from '../../../../shared/lib/llm-analysis-service';
import { AppError } from '../../../../shared/lib/errors';

const LlmAnalysisSection = ({ activeTabOrigin }) => {
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    // Load API key from local storage or a secure store
    const storedApiKey = localStorage.getItem('llm_api_key');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const handleSaveApiKey = () => {
    localStorage.setItem('llm_api_key', apiKey);
    //
  };

  const handleAnalysisClick = async () => {
    if (!apiKey) {
      setError('Please set your API key first.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      // Note: The service constructor expects the API key.
      // However, the service itself retrieves it from chrome storage.
      // This seems inconsistent. For now, we follow the service logic.
      const llmService = new LlmTransactionAnalysisService();
      const result = await llmService.analyzeTransaction({
        origin: activeTabOrigin,
      });
      setAnalysis(result.analysis);
    } catch (e) {
      if (e instanceof AppError) {
        setError(e.message);
      } else if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unexpected error occurred during analysis.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <Box marginBottom={4}>
        <TextField
          id="llm-api-key-input"
          label="API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          fullWidth
        />
        <Button onClick={handleSaveApiKey}>Save Key</Button>
      </Box>
      <Button onClick={handleAnalysisClick} disabled={isLoading || !apiKey}>
        {isLoading ? 'Analyzing...' : 'Analyze Connection'}
      </Button>
      {error && (
        <Typography variant={TypographyVariant.BodySM} color="error-default">
          {error}
        </Typography>
      )}
      {analysis && (
        <Box marginTop={2}>
          <Typography variant={TypographyVariant.H6}>
            Analysis Result:
          </Typography>
          <Typography>{analysis}</Typography>
        </Box>
      )}
    </Box>
  );
};

LlmAnalysisSection.propTypes = {
  activeTabOrigin: PropTypes.string,
};

export default LlmAnalysisSection;