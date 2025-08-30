import os
import re
import json
import random
from typing import List, Dict, Any, Optional, Tuple
import numpy as np

# In a production environment, you would use actual ML libraries
# such as transformers, sklearn, nltk, etc.
try:
    import nltk
    from nltk.corpus import stopwords
    nltk.download('stopwords', quiet=True)
    nltk.download('punkt', quiet=True)
    NLTK_AVAILABLE = True
except ImportError:
    NLTK_AVAILABLE = False

try:
    from transformers import pipeline
    import torch
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    TRANSFORMERS_AVAILABLE = False

class QuestionEnhancer:
    """
    AI-powered question enhancer for academic question papers.
    Analyzes questions for quality, clarity, difficulty level, and provides suggestions.
    """
    
    def __init__(self):
        self.blooms_taxonomy_keywords = {
            'knowledge': ['define', 'describe', 'identify', 'know', 'label', 'list', 'match', 'name', 'outline', 'recall', 'recognize', 'select', 'state'],
            'comprehension': ['comprehend', 'convert', 'defend', 'distinguish', 'estimate', 'explain', 'extend', 'generalize', 'give example', 'infer', 'interpret', 'paraphrase', 'predict', 'rewrite', 'summarize', 'translate'],
            'application': ['apply', 'change', 'compute', 'construct', 'demonstrate', 'discover', 'manipulate', 'modify', 'operate', 'predict', 'prepare', 'produce', 'relate', 'show', 'solve', 'use'],
            'analysis': ['analyze', 'break down', 'compare', 'contrast', 'diagram', 'deconstruct', 'differentiate', 'discriminate', 'distinguish', 'identify', 'illustrate', 'infer', 'outline', 'relate', 'select', 'separate'],
            'synthesis': ['categorize', 'combine', 'compile', 'compose', 'create', 'devise', 'design', 'explain', 'generate', 'modify', 'organize', 'plan', 'rearrange', 'reconstruct', 'relate', 'reorganize', 'revise', 'rewrite', 'summarize', 'tell', 'write'],
            'evaluation': ['appraise', 'compare', 'conclude', 'contrast', 'criticize', 'critique', 'defend', 'describe', 'discriminate', 'evaluate', 'explain', 'interpret', 'justify', 'relate', 'summarize', 'support']
        }
        
        # Initialize NLP components if available
        self.sentiment_analyzer = None
        self.text_classifier = None
        
        if TRANSFORMERS_AVAILABLE:
            try:
                # Initialize sentiment analysis pipeline
                self.sentiment_analyzer = pipeline(
                    "sentiment-analysis", 
                    model="distilbert-base-uncased-finetuned-sst-2-english",
                    truncation=True
                )
                
                # Initialize zero-shot classification for cognitive level
                self.text_classifier = pipeline(
                    "zero-shot-classification",
                    model="facebook/bart-large-mnli",
                    truncation=True
                )
            except Exception as e:
                print(f"Could not initialize transformer models: {e}")
    
    def enhance_question(self, question_text: str, question_type: str, marks: int) -> Dict[str, Any]:
        """
        Analyze and enhance a single question.
        
        Args:
            question_text: The text of the question
            question_type: Type of question (mcq, short, long)
            marks: Number of marks allocated to the question
            
        Returns:
            Dictionary with enhanced question and analysis
        """
        # Basic text cleaning
        cleaned_text = self._clean_text(question_text)
        
        # Analyze question complexity and cognitive level
        complexity = self._analyze_complexity(cleaned_text)
        cognitive_level = self._determine_cognitive_level(cleaned_text)
        
        # Check question quality
        quality_issues = self._check_quality(cleaned_text, question_type)
        
        # Generate improvements
        enhanced_question = self._generate_enhanced_question(
            question_text, 
            complexity, 
            cognitive_level, 
            quality_issues,
            question_type,
            marks
        )
        
        return {
            "original_question": question_text,
            "enhanced_question": enhanced_question["text"],
            "analysis": {
                "complexity": complexity,
                "cognitive_level": cognitive_level,
                "quality_issues": quality_issues,
                "type": question_type,
                "marks": marks,
                "improvement_reasons": enhanced_question["reasons"]
            }
        }
    
    def enhance_question_paper(self, questions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyze and enhance a full question paper.
        
        Args:
            questions: List of question dictionaries with text, type, and marks
            
        Returns:
            Enhanced questions with paper-level analysis
        """
        enhanced_questions = []
        total_marks = 0
        cognitive_levels = []
        
        for q in questions:
            enhanced = self.enhance_question(q["text"], q["type"], q["marks"])
            enhanced_questions.append(enhanced)
            total_marks += q["marks"]
            cognitive_levels.append(enhanced["analysis"]["cognitive_level"])
        
        # Analyze distribution of cognitive levels
        cognitive_distribution = self._analyze_cognitive_distribution(cognitive_levels)
        
        # Analyze question type distribution
        type_distribution = self._analyze_type_distribution(questions)
        
        # Check balance of marks vs complexity
        marks_complexity_balance = self._analyze_marks_complexity_balance(
            [(q["analysis"]["complexity"], q["analysis"]["marks"]) for q in enhanced_questions]
        )
        
        # Generate overall recommendations
        recommendations = self._generate_paper_recommendations(
            cognitive_distribution,
            type_distribution,
            marks_complexity_balance,
            total_marks
        )
        
        return {
            "enhanced_questions": enhanced_questions,
            "paper_analysis": {
                "cognitive_distribution": cognitive_distribution,
                "type_distribution": type_distribution,
                "marks_complexity_balance": marks_complexity_balance,
                "total_marks": total_marks,
                "recommendations": recommendations
            }
        }
    
    def _clean_text(self, text: str) -> str:
        """Clean and normalize text for analysis."""
        # Remove extra whitespaces
        text = re.sub(r'\s+', ' ', text).strip()
        
        # Remove special characters that aren't relevant for analysis
        text = re.sub(r'[^\w\s\.\,\?\!]', '', text)
        
        return text
    
    def _analyze_complexity(self, text: str) -> float:
        """
        Analyze text complexity on a scale of 0-1.
        
        This is a simplified implementation. In a production environment,
        you'd use more sophisticated models for readability scores.
        """
        # Simple complexity based on sentence length and word length
        words = text.split()
        avg_word_length = sum(len(word) for word in words) / max(len(words), 1)
        
        # Count sentences using basic punctuation
        sentences = re.split(r'[.!?]', text)
        sentences = [s for s in sentences if s.strip()]
        avg_sentence_length = len(words) / max(len(sentences), 1)
        
        # Normalize to 0-1 scale
        word_length_score = min(avg_word_length / 10, 1)  # Assuming max avg word length is 10
        sentence_length_score = min(avg_sentence_length / 20, 1)  # Assuming max avg sentence length is 20
        
        # Combined complexity score
        complexity = (word_length_score + sentence_length_score) / 2
        
        return round(complexity, 2)

    def _determine_cognitive_level(self, text: str) -> str:
        """
        Determine the cognitive level of the question based on Bloom's Taxonomy.
        
        If transformers are available, uses a zero-shot classifier.
        Otherwise, falls back to keyword matching.
        """
        if self.text_classifier:
            try:
                # Use zero-shot classification with Bloom's taxonomy levels
                result = self.text_classifier(
                    text, 
                    candidate_labels=list(self.blooms_taxonomy_keywords.keys()),
                    hypothesis_template="This question is asking students to {}."
                )
                return result['labels'][0]  # Return highest confidence label
            except Exception as e:
                print(f"Error in zero-shot classification: {e}")
                # Fall back to keyword method
                pass
        
        # Keyword-based approach
        text_lower = text.lower()
        max_count = 0
        cognitive_level = "knowledge"  # Default level
        
        for level, keywords in self.blooms_taxonomy_keywords.items():
            count = sum(1 for keyword in keywords if keyword in text_lower)
            if count > max_count:
                max_count = count
                cognitive_level = level
        
        return cognitive_level
    
    def _check_quality(self, text: str, question_type: str) -> List[str]:
        """Check for common quality issues in questions."""
        issues = []
        
        # Check for very short questions
        if len(text.split()) < 5:
            issues.append("Question is too brief and may lack context")
        
        # Check for very long questions
        if len(text.split()) > 50 and question_type != "long":
            issues.append("Question may be too verbose for its type")
        
        # Check for ambiguity markers
        ambiguity_markers = ["may", "might", "could be", "possibly", "perhaps", "sometimes"]
        if any(marker in text.lower() for marker in ambiguity_markers):
            issues.append("Question contains potentially ambiguous language")
        
        # Check if it ends with a question mark for direct questions
        if "?" not in text and question_type != "long":
            issues.append("Question doesn't include a question mark")
        
        # Check for clarity based on basic patterns
        if not re.search(r'\b(what|who|when|where|why|how|which|explain|describe|discuss|analyze|calculate|solve)\b', text.lower()):
            issues.append("Question may lack a clear directive verb")
        
        return issues
    
    def _generate_enhanced_question(
        self, 
        original_text: str, 
        complexity: float, 
        cognitive_level: str, 
        quality_issues: List[str],
        question_type: str,
        marks: int
    ) -> Dict[str, Any]:
        """Generate an enhanced version of the question."""
        enhanced_text = original_text
        improvement_reasons = []
        
        # Fix quality issues
        if "Question doesn't include a question mark" in quality_issues and not enhanced_text.endswith("?"):
            if not enhanced_text.endswith("."):
                enhanced_text = enhanced_text + "?"
            else:
                enhanced_text = enhanced_text[:-1] + "?"
            improvement_reasons.append("Added missing question mark")
        
        # Add directive verb if missing
        if "Question may lack a clear directive verb" in quality_issues:
            directive_verbs = {
                "knowledge": ["Define", "Describe", "Identify", "List"],
                "comprehension": ["Explain", "Interpret", "Summarize", "Paraphrase"],
                "application": ["Apply", "Demonstrate", "Solve", "Use"],
                "analysis": ["Analyze", "Compare", "Contrast", "Differentiate"],
                "synthesis": ["Create", "Design", "Develop", "Formulate"],
                "evaluation": ["Evaluate", "Justify", "Assess", "Critique"]
            }
            
            verbs = directive_verbs.get(cognitive_level, directive_verbs["knowledge"])
            verb = random.choice(verbs)
            
            # Only add if it doesn't already start with a directive verb
            if not any(enhanced_text.lower().startswith(v.lower()) for v in sum(directive_verbs.values(), [])):
                enhanced_text = f"{verb} {enhanced_text[0].lower() + enhanced_text[1:]}"
                improvement_reasons.append(f"Added directive verb '{verb}' to clarify the task")
        
        # Adjust complexity if it doesn't match the marks
        if complexity < 0.3 and marks > 5:
            # For high-mark questions that are too simple
            cognitive_prompts = {
                "knowledge": "Explain in detail ",
                "comprehension": "Analyze and interpret ",
                "application": "Apply the concept of ",
                "analysis": "Critically analyze ",
                "synthesis": "Synthesize your knowledge about ",
                "evaluation": "Evaluate the significance of "
            }
            
            prefix = cognitive_prompts.get(cognitive_level, "Discuss in depth ")
            if not any(enhanced_text.lower().startswith(p.lower()) for p in cognitive_prompts.values()):
                enhanced_text = prefix + enhanced_text[0].lower() + enhanced_text[1:]
                improvement_reasons.append(f"Increased complexity to match the {marks} mark allocation")
        
        # Adjust for question type
        if question_type == "mcq" and len(enhanced_text.split()) > 25:
            # Simplify MCQ questions that are too verbose
            enhanced_text = self._simplify_text(enhanced_text)
            improvement_reasons.append("Simplified MCQ question to be more concise")
        elif question_type == "long" and complexity < 0.4:
            # Add more depth to long answer questions
            enhanced_text = self._add_depth_to_question(enhanced_text, cognitive_level)
            improvement_reasons.append("Added more depth to match long-answer format")
        
        # If no improvements were made, note that
        if not improvement_reasons:
            improvement_reasons.append("No major improvements needed - question is well-formed")
        
        return {
            "text": enhanced_text,
            "reasons": improvement_reasons
        }
    
    def _simplify_text(self, text: str) -> str:
        """Simplify a verbose text to be more concise."""
        # In a production environment, you'd use more sophisticated NLP methods
        sentences = re.split(r'[.!?]', text)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        if len(sentences) > 1:
            # Keep only the most relevant sentence (usually the last one with the question)
            return sentences[-1] + "?"
        return text
    
    def _add_depth_to_question(self, text: str, cognitive_level: str) -> str:
        """Add more depth to a question for long-answer format."""
        depth_phrases = {
            "knowledge": "Provide a detailed account of ",
            "comprehension": "Explain in detail, with examples, ",
            "application": "Demonstrate with specific examples how ",
            "analysis": "Analyze critically, considering multiple perspectives, ",
            "synthesis": "Synthesize information from various sources to explain ",
            "evaluation": "Evaluate comprehensively, considering pros and cons, "
        }
        
        phrase = depth_phrases.get(cognitive_level, "Discuss in depth ")
        
        # Check if text already starts with one of our phrases
        if not any(text.lower().startswith(p.lower()) for p in depth_phrases.values()):
            # Add the depth phrase at the beginning
            enhanced = phrase + text[0].lower() + text[1:]
            
            # If it doesn't end with appropriate punctuation, add it
            if not enhanced.endswith((".", "?", "!")):
                enhanced += "."
                
            return enhanced
        
        return text
    
    def _analyze_cognitive_distribution(self, cognitive_levels: List[str]) -> Dict[str, float]:
        """Analyze the distribution of cognitive levels in the question paper."""
        total = len(cognitive_levels)
        distribution = {level: 0 for level in self.blooms_taxonomy_keywords.keys()}
        
        for level in cognitive_levels:
            if level in distribution:
                distribution[level] += 1
        
        # Convert to percentages
        if total > 0:
            for level in distribution:
                distribution[level] = round((distribution[level] / total) * 100, 1)
        
        return distribution
    
    def _analyze_type_distribution(self, questions: List[Dict[str, Any]]) -> Dict[str, float]:
        """Analyze the distribution of question types."""
        total_marks = sum(q["marks"] for q in questions)
        type_marks = {"mcq": 0, "short": 0, "long": 0}
        
        for q in questions:
            q_type = q["type"]
            if q_type in type_marks:
                type_marks[q_type] += q["marks"]
        
        # Convert to percentages of total marks
        type_distribution = {
            q_type: round((marks / total_marks) * 100, 1) if total_marks > 0 else 0
            for q_type, marks in type_marks.items()
        }
        
        return type_distribution
    
    def _analyze_marks_complexity_balance(self, complexity_marks_pairs: List[Tuple[float, int]]) -> str:
        """Analyze if marks allocation aligns with question complexity."""
        if not complexity_marks_pairs:
            return "No questions to analyze"
        
        # Calculate correlation between complexity and marks
        complexities = [pair[0] for pair in complexity_marks_pairs]
        marks = [pair[1] for pair in complexity_marks_pairs]
        
        try:
            correlation = np.corrcoef(complexities, marks)[0, 1]
            
            if correlation > 0.7:
                return "Excellent balance between question complexity and marks allocation"
            elif correlation > 0.4:
                return "Good balance between question complexity and marks allocation"
            elif correlation > 0:
                return "Fair balance, some questions may not have marks proportional to their complexity"
            else:
                return "Poor balance - marks allocation doesn't reflect question complexity"
        except:
            # Fallback if numpy calculation fails
            return "Unable to determine marks-complexity balance"
    
    def _generate_paper_recommendations(self, 
                                     cognitive_dist: Dict[str, float],
                                     type_dist: Dict[str, float],
                                     marks_balance: str,
                                     total_marks: int) -> List[str]:
        """Generate recommendations for improving the overall question paper."""
        recommendations = []
        
        # Check cognitive level distribution
        higher_order = sum([
            cognitive_dist.get("analysis", 0),
            cognitive_dist.get("synthesis", 0),
            cognitive_dist.get("evaluation", 0)
        ])
        
        lower_order = sum([
            cognitive_dist.get("knowledge", 0),
            cognitive_dist.get("comprehension", 0),
            cognitive_dist.get("application", 0)
        ])
        
        if higher_order < 30:
            recommendations.append(
                "Consider increasing the proportion of higher-order thinking questions "
                "(analysis, synthesis, evaluation) to improve cognitive challenge."
            )
        
        if cognitive_dist.get("knowledge", 0) > 40:
            recommendations.append(
                "The paper has a high proportion of knowledge-based questions. "
                "Consider reducing these in favor of more comprehension and application questions."
            )
        
        # Check question type distribution
        if type_dist.get("mcq", 0) > 50:
            recommendations.append(
                "Multiple-choice questions account for over 50% of the marks. "
                "Consider increasing short and long answer questions to better assess depth of understanding."
            )
        
        if type_dist.get("long", 0) < 20 and total_marks >= 50:
            recommendations.append(
                "Consider adding more long-answer questions to assess students' ability "
                "to construct extended arguments and demonstrate deeper understanding."
            )
        
        # Add recommendation based on marks-complexity balance
        if "Poor balance" in marks_balance or "Fair balance" in marks_balance:
            recommendations.append(
                "Review the marks allocation for questions to ensure it better reflects "
                "their complexity and cognitive demands."
            )
        
        # If all looks good and no recommendations
        if not recommendations:
            recommendations.append(
                "The question paper has a good balance of question types, cognitive levels, "
                "and appropriate marks allocation. No major improvements needed."
            )
        
        return recommendations

# Simple test function
def test_enhancer():
    enhancer = QuestionEnhancer()
    
    # Test single question
    test_question = "what is machine learning"
    result = enhancer.enhance_question(test_question, "short", 5)
    print(json.dumps(result, indent=2))
    
    # Test question paper
    test_paper = [
        {"text": "Define artificial intelligence.", "type": "short", "marks": 2},
        {"text": "Explain the difference between supervised and unsupervised learning.", "type": "short", "marks": 5},
        {"text": "How do neural networks work?", "type": "long", "marks": 10},
        {"text": "Which of the following is not a type of machine learning?", "type": "mcq", "marks": 1}
    ]
    
    paper_result = enhancer.enhance_question_paper(test_paper)
    print(json.dumps(paper_result, indent=2))

if __name__ == "__main__":
    test_enhancer() 