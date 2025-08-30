import React, { useState, useEffect } from 'react';
import {
  Box, 
  Typography, 
  Paper, 
  TextField,
  Button,
  CircularProgress,
  Alert,
  List,
  ListItem,
  Avatar,
  Divider,
  IconButton
} from '@mui/material';
import {
  Psychology,
  Send,
  Person,
  School
} from '@mui/icons-material';
import { 
  StudentDataForAnalysis,
  queryGoogleAI,
  getRealTimeStudentData
} from '../api/aiAnalyzerService';

interface ProfileChatbotProps {
  studentId: string;
  subjects?: Array<{id: string, name: string}>;
  apiAvailable?: boolean;
  studentName?: string;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const ProfileChatbot: React.FC<ProfileChatbotProps> = ({ studentId, subjects = [], apiAvailable = true, studentName }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentData, setStudentData] = useState<StudentDataForAnalysis | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  // Reference for auto-scrolling
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  
  // Fetch student data when component mounts
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (apiAvailable) {
          // Use real-time data instead of mock data
          const data = await getRealTimeStudentData(studentId);
          
          // If studentName prop is provided, override the API data
          if (studentName) {
            data.name = studentName;
          }
          
          setStudentData(data);
          
          // Add welcome message
          const welcomeMessage: ChatMessage = {
            id: Date.now().toString(),
            text: `Hello ${data.name}! I'm your profile analysis chatbot. I can help you understand your academic performance and provide insights. What would you like to know about your profile?`,
            sender: 'ai',
            timestamp: new Date()
          };
          setMessages([welcomeMessage]);
        } else {
          // No fallback to mock data - we'll just show an error
          throw new Error('API not available');
        }
      } catch (err) {
        console.error('Error fetching student data:', err);
        setError('Failed to load student data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudentData();
  }, [studentId, apiAvailable, studentName]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle sending a new message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return;
    
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: newMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setNewMessage('');
    setIsSending(true);
    
    try {
      // Use Google AI API for real-time responses
      if (studentData) {
        const aiResponseText = await queryGoogleAI(studentData, userMessage.text, subjects);
        
        // Add AI response message
        const aiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: aiResponseText,
          sender: 'ai',
          timestamp: new Date()
        };
        
        setMessages(prevMessages => [...prevMessages, aiResponse]);
      } else {
        // Handle case when student data is not available
        const aiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: "I'm sorry, but I don't have access to your student data at the moment. Please try again later.",
          sender: 'ai',
          timestamp: new Date()
        };
        
        setMessages(prevMessages => [...prevMessages, aiResponse]);
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Error response
      const errorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I encountered an error while processing your request. Please try again later.",
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, errorResponse]);
    } finally {
      setIsSending(false);
    }
  };

  // Handle pressing Enter to send message
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="200px">
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading your academic data...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        {error}
        <Button 
          size="small" 
          sx={{ ml: 2 }} 
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Psychology sx={{ fontSize: 32, mr: 1, color: 'primary.main' }} />
        <Typography variant="h5" component="h2">
          Profile Analysis Chatbot
        </Typography>
      </Box>
      
      <Paper sx={{ height: '60vh', display: 'flex', flexDirection: 'column' }}>
        {/* Chat messages area */}
        <Box sx={{ 
          flexGrow: 1, 
          p: 2, 
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <List>
            {messages.map((message) => (
              <ListItem 
                key={message.id} 
                sx={{ 
                  justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                  mb: 1
                }}
              >
                <Box 
                  sx={{
                    display: 'flex',
                    maxWidth: '70%',
                    flexDirection: message.sender === 'user' ? 'row-reverse' : 'row'
                  }}
                >
                  <Avatar 
                    sx={{ 
                      bgcolor: message.sender === 'user' ? 'primary.main' : 'secondary.main',
                      mr: message.sender === 'user' ? 0 : 1,
                      ml: message.sender === 'user' ? 1 : 0
                    }}
                  >
                    {message.sender === 'user' ? <Person /> : <School />}
                  </Avatar>
                  <Paper 
                    sx={{ 
                      p: 2, 
                      bgcolor: message.sender === 'user' ? 'primary.light' : 'grey.100',
                      color: message.sender === 'user' ? 'white' : 'text.primary',
                      borderRadius: 2
                    }}
                  >
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      {message.text}
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.7 }}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Paper>
                </Box>
              </ListItem>
            ))}
          </List>
          <div ref={messagesEndRef} />
        </Box>
        
        <Divider />
        
        {/* Message input area */}
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Ask about your grades, attendance, or assignments..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isSending}
            multiline
            maxRows={3}
            sx={{ mr: 1 }}
          />
          <IconButton 
            color="primary" 
            onClick={handleSendMessage} 
            disabled={!newMessage.trim() || isSending}
            sx={{ height: 56, width: 56 }}
          >
            {isSending ? <CircularProgress size={24} /> : <Send />}
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
};

export default ProfileChatbot; 