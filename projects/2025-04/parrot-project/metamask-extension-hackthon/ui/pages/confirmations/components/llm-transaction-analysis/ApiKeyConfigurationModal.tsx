import React, { useState, useEffect } from 'react';
import { Modal, TextField, Button, Box } from '@mui/material';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

interface ApiKeyConfigurationModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (key: string) => void;
}

const ApiKeyConfigurationModal: React.FC<ApiKeyConfigurationModalProps> = ({ open, onClose, onSave }) => {
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    if (open) {
      // Attempt to load the key from storage when the modal opens
      chrome.storage.local.get(['openRouterApiKey'], (result) => {
        if (result.openRouterApiKey) {
          setApiKey(result.openRouterApiKey);
        }
      });
    }
  }, [open]);

  const handleSave = () => {
    chrome.storage.local.set({ openRouterApiKey: apiKey }, () => {
      console.log('API key saved.');
      onSave(apiKey);
      onClose();
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="api-key-configuration-modal-title"
      aria-describedby="api-key-configuration-modal-description"
    >
      <Box sx={style}>
        <h2 id="api-key-configuration-modal-title">Configure OpenRouter API Key</h2>
        <TextField
          fullWidth
          label="API Key"
          variant="outlined"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          margin="normal"
          type="text"
          sx={{
            '& .MuiInputBase-input': {
              color: 'black',
            },
          }}
        />
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} sx={{ ml: 1 }}>
            Save
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ApiKeyConfigurationModal;