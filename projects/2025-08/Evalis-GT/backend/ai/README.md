# AI Question Enhancer

This service uses AI and natural language processing to enhance academic question papers by analyzing and improving questions based on quality, clarity, difficulty level, and cognitive demands.

## Features

- **Question Enhancement**: Improves individual questions by analyzing and enhancing their clarity, structure, and alignment with cognitive levels
- **Cognitive Level Analysis**: Analyzes questions based on Bloom's Taxonomy (Knowledge, Comprehension, Application, Analysis, Synthesis, Evaluation)
- **Question Paper Analysis**: Analyzes entire question papers to ensure balanced distribution of question types and cognitive levels
- **Question Suggestions**: Generates suggested questions based on topic and desired cognitive level
- **Question Quality Checks**: Identifies potential issues with questions (ambiguity, brevity, lack of directive verbs)

## Setup

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

### Installation

1. Install Python dependencies:

```bash
# Navigate to the server directory
cd server

# Install required Python packages
pip install flask flask-cors numpy nltk

# Optional but recommended for full functionality:
pip install transformers torch
```

2. Download required NLTK data (optional):

```python
# Run Python in interactive mode
python

# In the Python interpreter:
import nltk
nltk.download('stopwords')
nltk.download('punkt')
exit()
```

## Running the Service

From the server directory:

```bash
# Start the AI service
python api/question_enhancer_api.py
```

By default, the service will run on port 5000. You can customize this by setting the `PORT` environment variable.

## API Endpoints

The service exposes the following REST API endpoints:

### Health Check

- **GET** `/health`
  - Checks if the service is running
  - Response: `{"status": "healthy", "service": "question-enhancer-api"}`

### Enhance a Single Question

- **POST** `/api/enhance-question`
  - Request body:
    ```json
    {
      "text": "What is artificial intelligence?",
      "type": "short",
      "marks": 5
    }
    ```
  - Response: Enhanced question with analysis

### Enhance a Question Paper

- **POST** `/api/enhance-paper`
  - Request body:
    ```json
    {
      "questions": [
        {
          "text": "What is artificial intelligence?",
          "type": "short",
          "marks": 5
        },
        {
          "text": "Explain machine learning.",
          "type": "long",
          "marks": 10
        }
      ]
    }
    ```
  - Response: Enhanced questions with paper-level analysis

### Analyze Cognitive Levels

- **POST** `/api/analyze-cognitive-levels`
  - Request body:
    ```json
    {
      "questions": ["What is AI?", "Evaluate the impact of AI on society."]
    }
    ```
  - Response: Analysis of cognitive levels with distribution

### Get Question Suggestions

- **POST** `/api/question-suggestions`
  - Request body:
    ```json
    {
      "topic": "Machine Learning",
      "cognitive_level": "application",
      "count": 3
    }
    ```
  - Response: List of suggested questions

## Integration with the Frontend

The service is integrated with the frontend using the `questionEnhancerService.ts` service that abstracts away the API calls and provides a clean interface for interacting with the AI service.

## Example Usage

Once running, the service will be available in the "Create Question Paper" section of the Teacher Portal. Teachers can:

1. Generate AI-suggested questions on their chosen topic
2. Enhance existing questions with a single click
3. Analyze entire question papers for cognitive balance
4. Receive recommendations to improve their question papers

## Advanced Configuration

You can set the following environment variables to configure the service:

- `PORT`: The port to run the service on (default: 5000)
- `DEBUG`: Set to 'true' to enable debug mode (default: false)

## Troubleshooting

- If you encounter errors related to missing libraries, ensure you've installed all required dependencies
- If the transformers library fails to load models, ensure you have internet connectivity for downloading pre-trained models
- Check logs for specific error messages 