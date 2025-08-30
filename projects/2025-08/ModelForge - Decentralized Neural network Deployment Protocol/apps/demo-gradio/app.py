import gradio as gr
import requests
import json
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

def generate_text(prompt, model_id="default", max_length=100):
    """Mock text generation function"""
    # In a real implementation, this would connect to the selected model
    mock_response = f"Generated text based on prompt '{prompt}' using model {model_id}. " \
                   f"This is a demonstration of how ModelForge enables easy AI model interaction. " \
                   f"The actual implementation would fetch the model from IPFS and run inference."
    
    return mock_response[:max_length] + "..." if len(mock_response) > max_length else mock_response

def classify_image(image, model_id="default"):
    """Mock image classification function"""
    if image is None:
        return "No image provided"
    
    # Mock classification results
    mock_classes = ["cat", "dog", "bird", "car", "tree"]
    mock_confidences = [0.85, 0.12, 0.02, 0.005, 0.005]
    
    results = []
    for cls, conf in zip(mock_classes, mock_confidences):
        results.append(f"{cls}: {conf:.2%}")
    
    return f"Classification results using model {model_id}:\n" + "\n".join(results)

def search_models(query, model_type="all"):
    """Mock model search function"""
    mock_models = [
        {"name": "GPT-3.5 Text Generator", "type": "text-generation", "downloads": 1250},
        {"name": "Image Classifier V2", "type": "image-classification", "downloads": 890},
        {"name": "Sentiment Analyzer", "type": "text-classification", "downloads": 654},
        {"name": "Object Detector", "type": "object-detection", "downloads": 432},
        {"name": "Translation Model", "type": "translation", "downloads": 321}
    ]
    
    # Filter by type if specified
    if model_type != "all":
        mock_models = [m for m in mock_models if m["type"] == model_type]
    
    # Filter by query if provided
    if query:
        mock_models = [m for m in mock_models if query.lower() in m["name"].lower()]
    
    # Format results
    if not mock_models:
        return "No models found matching your criteria."
    
    results = ["Found models:"]
    for model in mock_models:
        results.append(f"• {model['name']} ({model['type']}) - {model['downloads']} downloads")
    
    return "\n".join(results)

# Create Gradio interface
with gr.Blocks(title="ModelForge Demo", theme=gr.themes.Soft()) as demo:
    gr.Markdown("""
    # 🔥 ModelForge Demo
    **AI Model Registry and Deployment Platform**
    
    This demo showcases how ModelForge enables easy interaction with AI models registered on the blockchain.
    """)
    
    with gr.Tabs():
        with gr.TabItem("📝 Text Generation"):
            gr.Markdown("Generate text using AI models from the ModelForge registry.")
            
            with gr.Row():
                with gr.Column():
                    text_prompt = gr.Textbox(
                        label="Prompt",
                        placeholder="Enter your text prompt here...",
                        lines=3
                    )
                    text_model = gr.Dropdown(
                        choices=["gpt-3.5-turbo", "llama-2-7b", "mistral-7b"],
                        value="gpt-3.5-turbo",
                        label="Select Model"
                    )
                    text_length = gr.Slider(
                        minimum=50,
                        maximum=500,
                        value=200,
                        label="Max Length"
                    )
                    text_btn = gr.Button("Generate Text", variant="primary")
                
                with gr.Column():
                    text_output = gr.Textbox(
                        label="Generated Text",
                        lines=10,
                        interactive=False
                    )
            
            text_btn.click(
                fn=generate_text,
                inputs=[text_prompt, text_model, text_length],
                outputs=text_output
            )
        
        with gr.TabItem("🖼️ Image Classification"):
            gr.Markdown("Classify images using computer vision models from the registry.")
            
            with gr.Row():
                with gr.Column():
                    image_input = gr.Image(
                        label="Upload Image",
                        type="pil"
                    )
                    image_model = gr.Dropdown(
                        choices=["resnet-50", "vit-base", "efficientnet-b3"],
                        value="resnet-50",
                        label="Select Model"
                    )
                    image_btn = gr.Button("Classify Image", variant="primary")
                
                with gr.Column():
                    image_output = gr.Textbox(
                        label="Classification Results",
                        lines=8,
                        interactive=False
                    )
            
            image_btn.click(
                fn=classify_image,
                inputs=[image_input, image_model],
                outputs=image_output
            )
        
        with gr.TabItem("🔍 Model Search"):
            gr.Markdown("Search for available models in the ModelForge registry.")
            
            with gr.Row():
                with gr.Column():
                    search_query = gr.Textbox(
                        label="Search Query",
                        placeholder="Enter model name or keywords..."
                    )
                    search_type = gr.Dropdown(
                        choices=["all", "text-generation", "image-classification", "text-classification", "object-detection", "translation"],
                        value="all",
                        label="Model Type"
                    )
                    search_btn = gr.Button("Search Models", variant="primary")
                
                with gr.Column():
                    search_output = gr.Textbox(
                        label="Search Results",
                        lines=10,
                        interactive=False
                    )
            
            search_btn.click(
                fn=search_models,
                inputs=[search_query, search_type],
                outputs=search_output
            )
        
        with gr.TabItem("ℹ️ About"):
            gr.Markdown("""
            ## About ModelForge
            
            ModelForge is a comprehensive AI model registry and deployment platform built on blockchain technology.
            
            ### Features:
            - **Decentralized Registry**: Models are registered on-chain for transparency and ownership
            - **IPFS Storage**: Models are stored on IPFS for decentralized and permanent access
            - **Easy Integration**: Simple APIs and SDKs for model upload, discovery, and deployment
            - **Version Control**: Track model versions and updates
            - **Community Driven**: Open platform for AI researchers and developers
            
            ### Architecture:
            - **Smart Contracts**: Ethereum-based registry for model metadata
            - **IPFS Integration**: Decentralized storage for model files
            - **Web Interface**: User-friendly interface for model management
            - **CLI Tools**: Command-line interface for developers
            - **Demo Applications**: Example integrations with Streamlit and Gradio
            
            ### Getting Started:
            1. Install the ModelForge CLI: `npm install -g @modelforge/cli`
            2. Register your model: `modelforge register ./my-model`
            3. Share your model ID with others
            4. Integrate into your applications using our SDKs
            
            **Built with ❤️ by the ModelForge team**
            """)

if __name__ == "__main__":
    demo.launch(
        server_name="0.0.0.0",
        server_port=7860,
        share=False,
        debug=True
    )
