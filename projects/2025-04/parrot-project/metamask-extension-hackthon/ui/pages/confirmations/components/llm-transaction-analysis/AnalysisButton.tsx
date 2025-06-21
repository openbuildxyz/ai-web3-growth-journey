import React from 'react';
import PropTypes from 'prop-types';
import { Box, IconButton } from '@mui/material';
import { Settings } from '@mui/icons-material';
import { Button } from '../../../../components/component-library';

// TODO: Replace with actual icons from the component library if available
const MagicWandIcon = () => <span>✨</span>;
const LoadingIcon = () => <span>🔄</span>;

export const AnalysisButton = ({ onAnalyze, onConfigure, isLoading }) => {
  return (
    <Box display="flex" alignItems="center" gap={1}>
      <Button
        onClick={onAnalyze}
        disabled={isLoading}
        startIcon={isLoading ? <LoadingIcon /> : <MagicWandIcon />}
      >
        {isLoading ? 'Analyzing...' : 'ASK PARROT'}
      </Button>
      <IconButton onClick={onConfigure} aria-label="configure API key" size="small">
        <Settings sx={{ color: 'white' }} />
      </IconButton>
    </Box>
  );
};

AnalysisButton.propTypes = {
  onAnalyze: PropTypes.func.isRequired,
  onConfigure: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

// Note: confirm.tsx imports this as a named export, so we keep it this way.
// export default AnalysisButton;