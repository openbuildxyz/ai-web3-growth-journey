import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  Slider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Image as ImageIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
}));

const ScoreIndicator = styled(Box)(({ theme, score }) => ({
  width: '100%',
  height: '8px',
  backgroundColor: theme.palette.grey[200],
  borderRadius: '4px',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    width: `${score}%`,
    backgroundColor: score > 70 ? theme.palette.success.main :
                   score > 40 ? theme.palette.warning.main :
                   theme.palette.error.main,
    borderRadius: '4px',
    transition: 'width 0.5s ease-in-out',
  },
}));

const ImagePreview = styled('img')({
  width: '100%',
  height: 'auto',
  maxHeight: '400px',
  objectFit: 'contain',
  borderRadius: '8px',
});

const SubmissionChecker = ({ submission, onGrade }) => {
  const [score, setScore] = useState(submission?.score || 0);
  const [feedback, setFeedback] = useState(submission?.feedback || '');
  const [loading, setLoading] = useState(false);
  const [plagiarismScore, setPlagiarismScore] = useState(submission?.plagiarismScore || 0);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [checkingPlagiarism, setCheckingPlagiarism] = useState(false);

  // Mock function for plagiarism check - Replace with actual API call
  const checkPlagiarism = async (text) => {
    setCheckingPlagiarism(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Mock response - Replace with actual API call
      const mockScore = Math.floor(Math.random() * 100);
      setPlagiarismScore(mockScore);
    } catch (error) {
      console.error('Error checking plagiarism:', error);
    } finally {
      setCheckingPlagiarism(false);
    }
  };

  const handleGrade = async () => {
    setLoading(true);
    try {
      await onGrade({
        score,
        feedback,
        plagiarismScore,
      });
    } catch (error) {
      console.error('Error grading submission:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <StyledPaper>
        <Typography variant="h6" gutterBottom>
          Submission Checker
        </Typography>

        {/* Submission Content */}
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Student's Submission
            </Typography>
            <Typography variant="body1">
              {submission?.submissionText}
            </Typography>
            
            {/* Sample submission image */}
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
              <Button
                startIcon={<ImageIcon />}
                onClick={() => setImagePreviewOpen(true)}
                variant="outlined"
              >
                View Submission Image
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Plagiarism Check */}
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="subtitle1">
                Plagiarism Check
              </Typography>
              <Button
                startIcon={<CopyIcon />}
                onClick={() => checkPlagiarism(submission?.submissionText)}
                disabled={checkingPlagiarism}
              >
                Check Plagiarism
              </Button>
            </Box>
            
            {checkingPlagiarism ? (
              <Box display="flex" alignItems="center" justifyContent="center" p={2}>
                <CircularProgress size={24} />
                <Typography variant="body2" sx={{ ml: 2 }}>
                  Checking for plagiarism...
                </Typography>
              </Box>
            ) : (
              <>
                <ScoreIndicator score={plagiarismScore} />
                <Box display="flex" justifyContent="space-between" mt={1}>
                  <Typography variant="body2" color="textSecondary">
                    Originality Score
                  </Typography>
                  <Typography variant="body2" color={
                    plagiarismScore > 70 ? 'success.main' :
                    plagiarismScore > 40 ? 'warning.main' :
                    'error.main'
                  }>
                    {plagiarismScore}%
                  </Typography>
                </Box>
              </>
            )}
          </CardContent>
        </Card>

        {/* Grading Section */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Score
            </Typography>
            <Box display="flex" alignItems="center">
              <Slider
                value={score}
                onChange={(_, newValue) => setScore(newValue)}
                valueLabelDisplay="auto"
                min={0}
                max={100}
                sx={{ mr: 2 }}
              />
              <Typography variant="body1">
                {score}/100
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12}>
            <Box display="flex" justifyContent="flex-end" gap={2}>
              <Button
                variant="contained"
                color="error"
                startIcon={<CloseIcon />}
                onClick={() => {
                  setScore(0);
                  setFeedback('');
                }}
              >
                Reset
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<CheckIcon />}
                onClick={handleGrade}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Submit Grade'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </StyledPaper>

      {/* Image Preview Dialog */}
      <Dialog
        open={imagePreviewOpen}
        onClose={() => setImagePreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Submission Image
          <IconButton
            onClick={() => setImagePreviewOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <ImagePreview
            src="/sample-submission.jpg"
            alt="Sample Submission"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImagePreviewOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubmissionChecker; 