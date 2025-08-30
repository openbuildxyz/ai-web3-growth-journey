from flask import Flask, request, jsonify
import os
import sys
import logging
from typing import Dict, Any, List, Union, Optional

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ai.question_enhancer import QuestionEnhancer

app = Flask(__name__)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize QuestionEnhancer
enhancer = QuestionEnhancer()

@app.route('/health', methods=['GET'])
def health_check() -> Dict[str, str]:
    """Simple health check endpoint."""
    return jsonify({"status": "healthy", "service": "question-enhancer-api"})

@app.route('/api/enhance-question', methods=['POST'])
def enhance_question() -> Dict[str, Any]:
    """
    Enhance a single question using AI/ML techniques.
    
    Expected JSON payload:
    {
        "text": "What is artificial intelligence?",
        "type": "short",  // mcq, short, long
        "marks": 5
    }
    """
    try:
        data = request.get_json()
        
        # Validate request data
        if not data or not isinstance(data, dict):
            return jsonify({"error": "Invalid request format"}), 400
        
        # Extract and validate required fields
        question_text = data.get('text')
        question_type = data.get('type')
        marks = data.get('marks')
        
        if not question_text:
            return jsonify({"error": "Question text is required"}), 400
        
        if not question_type or question_type not in ['mcq', 'short', 'long']:
            return jsonify({"error": "Valid question type (mcq, short, long) is required"}), 400
        
        if not marks or not isinstance(marks, (int, float)) or marks <= 0:
            return jsonify({"error": "Valid positive number of marks is required"}), 400
        
        # Process the question
        result = enhancer.enhance_question(question_text, question_type, marks)
        
        return jsonify(result)
    
    except Exception as e:
        logger.error(f"Error enhancing question: {e}", exc_info=True)
        return jsonify({"error": f"Failed to enhance question: {str(e)}"}), 500

@app.route('/api/enhance-paper', methods=['POST'])
def enhance_paper() -> Dict[str, Any]:
    """
    Enhance an entire question paper using AI/ML techniques.
    
    Expected JSON payload:
    {
        "questions": [
            {
                "text": "What is artificial intelligence?",
                "type": "short",
                "marks": 5
            },
            // more questions...
        ]
    }
    """
    try:
        data = request.get_json()
        
        # Validate request data
        if not data or not isinstance(data, dict):
            return jsonify({"error": "Invalid request format"}), 400
        
        questions = data.get('questions', [])
        
        if not questions or not isinstance(questions, list):
            return jsonify({"error": "Questions array is required"}), 400
        
        if len(questions) == 0:
            return jsonify({"error": "At least one question is required"}), 400
        
        # Validate each question
        for i, q in enumerate(questions):
            if not isinstance(q, dict):
                return jsonify({"error": f"Question {i+1} has invalid format"}), 400
                
            if 'text' not in q:
                return jsonify({"error": f"Question {i+1} is missing text"}), 400
                
            if 'type' not in q or q['type'] not in ['mcq', 'short', 'long']:
                return jsonify({"error": f"Question {i+1} has invalid type"}), 400
                
            if 'marks' not in q or not isinstance(q['marks'], (int, float)) or q['marks'] <= 0:
                return jsonify({"error": f"Question {i+1} has invalid marks"}), 400
        
        # Process the question paper
        result = enhancer.enhance_question_paper(questions)
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error enhancing question paper: {e}", exc_info=True)
        return jsonify({"error": f"Failed to enhance question paper: {str(e)}"}), 500

@app.route('/api/analyze-cognitive-levels', methods=['POST'])
def analyze_cognitive_levels() -> Dict[str, Any]:
    """
    Analyze the cognitive levels of a list of questions based on Bloom's Taxonomy.
    
    Expected JSON payload:
    {
        "questions": ["What is AI?", "Evaluate the impact of AI on society."]
    }
    """
    try:
        data = request.get_json()
        
        # Validate request data
        if not data or not isinstance(data, dict):
            return jsonify({"error": "Invalid request format"}), 400
        
        questions = data.get('questions', [])
        
        if not questions or not isinstance(questions, list):
            return jsonify({"error": "Questions array is required"}), 400
        
        if len(questions) == 0:
            return jsonify({"error": "At least one question is required"}), 400
        
        # Analyze each question
        results = []
        for question in questions:
            if not isinstance(question, str):
                return jsonify({"error": "All questions must be strings"}), 400
                
            # Determine cognitive level
            cognitive_level = enhancer._determine_cognitive_level(question)
            results.append({
                "question": question,
                "cognitive_level": cognitive_level
            })
        
        # Count cognitive levels
        counts = {}
        for result in results:
            level = result["cognitive_level"]
            counts[level] = counts.get(level, 0) + 1
        
        # Calculate percentages
        percentages = {
            level: (count / len(results)) * 100
            for level, count in counts.items()
        }
        
        return jsonify({
            "results": results,
            "distribution": {
                "counts": counts,
                "percentages": percentages
            }
        })
        
    except Exception as e:
        logger.error(f"Error analyzing cognitive levels: {e}", exc_info=True)
        return jsonify({"error": f"Failed to analyze cognitive levels: {str(e)}"}), 500

@app.route('/api/question-suggestions', methods=['POST'])
def get_question_suggestions() -> Dict[str, Any]:
    """
    Generate question suggestions based on a topic and cognitive level.
    
    Expected JSON payload:
    {
        "topic": "Machine Learning",
        "cognitive_level": "application",
        "count": 3
    }
    """
    try:
        data = request.get_json()
        
        # Validate request data
        if not data or not isinstance(data, dict):
            return jsonify({"error": "Invalid request format"}), 400
        
        topic = data.get('topic')
        cognitive_level = data.get('cognitive_level')
        count = data.get('count', 3)
        
        if not topic:
            return jsonify({"error": "Topic is required"}), 400
        
        if not cognitive_level or cognitive_level not in enhancer.blooms_taxonomy_keywords:
            levels = list(enhancer.blooms_taxonomy_keywords.keys())
            return jsonify({"error": f"Valid cognitive level is required. Choose from: {levels}"}), 400
        
        if not isinstance(count, int) or count <= 0 or count > 10:
            return jsonify({"error": "Count must be a positive integer between 1 and 10"}), 400
        
        # Suggestion templates based on cognitive levels
        templates = {
            "knowledge": [
                f"Define the term {topic}.",
                f"List the key components of {topic}.",
                f"Identify the main principles of {topic}.",
                f"State the purpose of {topic}.",
                f"What is {topic}?",
                f"Describe the characteristics of {topic}.",
                f"Name the important features of {topic}.",
                f"Outline the development of {topic}."
            ],
            "comprehension": [
                f"Explain how {topic} works.",
                f"Interpret the significance of {topic}.",
                f"Summarize the key aspects of {topic}.",
                f"Paraphrase the definition of {topic}.",
                f"Distinguish between {topic} and related concepts.",
                f"Give examples of {topic} in practice.",
                f"Classify different types of {topic}.",
                f"Explain the concept of {topic} in your own words."
            ],
            "application": [
                f"Demonstrate how {topic} can be applied in a real-world scenario.",
                f"Solve the following problem using principles of {topic}.",
                f"Apply the concept of {topic} to improve an existing system.",
                f"Use {topic} to address the following situation.",
                f"Show how {topic} can be implemented in a different context.",
                f"Calculate the outcome when {topic} is applied to the following data.",
                f"Develop a solution using {topic} for the given problem."
            ],
            "analysis": [
                f"Analyze the components of {topic}.",
                f"Compare and contrast different approaches to {topic}.",
                f"Differentiate between various aspects of {topic}.",
                f"Examine the relationship between {topic} and related fields.",
                f"Break down the structure of {topic}.",
                f"Investigate the causes and effects related to {topic}.",
                f"What are the underlying assumptions of {topic}?"
            ],
            "synthesis": [
                f"Design a new approach to {topic}.",
                f"Create an innovative solution using {topic}.",
                f"Develop a proposal that integrates {topic} with other concepts.",
                f"How would you compose a system that incorporates {topic}?",
                f"Formulate a new theory about {topic}.",
                f"Construct a model that demonstrates {topic}.",
                f"Generate a plan to implement {topic} in a novel situation."
            ],
            "evaluation": [
                f"Evaluate the effectiveness of {topic}.",
                f"Critique the current implementation of {topic}.",
                f"Assess the value of {topic} in modern applications.",
                f"Justify the importance of {topic} in the field.",
                f"Determine the best approach to {topic} for a given scenario.",
                f"Judge the impact of {topic} on society.",
                f"Argue for or against the use of {topic} in specific contexts."
            ]
        }
        
        # Get templates for the requested cognitive level
        level_templates = templates.get(cognitive_level, [])
        
        # If there aren't enough templates for the requested count,
        # repeat some templates or add some from adjacent levels
        if len(level_templates) < count:
            # Add templates from adjacent levels
            levels = list(enhancer.blooms_taxonomy_keywords.keys())
            current_index = levels.index(cognitive_level)
            
            # Try to get templates from adjacent levels
            adjacent_levels = []
            if current_index > 0:
                adjacent_levels.append(levels[current_index - 1])
            if current_index < len(levels) - 1:
                adjacent_levels.append(levels[current_index + 1])
                
            for level in adjacent_levels:
                level_templates.extend(templates.get(level, []))
                if len(level_templates) >= count:
                    break
            
            # If still not enough, just repeat existing templates
            while len(level_templates) < count:
                level_templates.extend(level_templates[:count - len(level_templates)])
        
        # Select 'count' number of templates
        selected_templates = level_templates[:count]
        
        return jsonify({
            "suggestions": selected_templates,
            "topic": topic,
            "cognitive_level": cognitive_level
        })
        
    except Exception as e:
        logger.error(f"Error generating question suggestions: {e}", exc_info=True)
        return jsonify({"error": f"Failed to generate question suggestions: {str(e)}"}), 500

if __name__ == '__main__':
    # Default port is 5000
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('DEBUG', 'False').lower() == 'true'
    
    app.run(host='0.0.0.0', port=port, debug=debug) 