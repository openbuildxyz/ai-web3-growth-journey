import streamlit as st
import requests
import pandas as pd
import plotly.express as px
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

st.set_page_config(
    page_title="ModelForge Demo",
    page_icon="🔥",
    layout="wide",
    initial_sidebar_state="expanded"
)

st.title("🔥 ModelForge Demo")
st.markdown("**AI Model Registry and Deployment Platform**")

# Sidebar
st.sidebar.header("ModelForge")
st.sidebar.markdown("Explore and interact with AI models registered on the blockchain.")

# Main content
tab1, tab2, tab3 = st.tabs(["📊 Models", "🔍 Search", "📈 Analytics"])

with tab1:
    st.header("Available Models")
    
    # Mock data for demonstration
    models_data = {
        "Model Name": ["GPT-3.5 Text Generator", "Image Classifier V2", "Sentiment Analyzer"],
        "Type": ["text-generation", "image-classification", "text-classification"],
        "Version": ["1.0.0", "2.1.0", "1.5.0"],
        "Downloads": [1250, 890, 654],
        "Owner": ["0x1234...5678", "0xabcd...efgh", "0x9876...5432"]
    }
    
    df = pd.DataFrame(models_data)
    st.dataframe(df, use_container_width=True)
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("Model Distribution by Type")
        type_counts = df["Type"].value_counts()
        fig_pie = px.pie(values=type_counts.values, names=type_counts.index)
        st.plotly_chart(fig_pie, use_container_width=True)
    
    with col2:
        st.subheader("Download Statistics")
        fig_bar = px.bar(df, x="Model Name", y="Downloads", color="Type")
        st.plotly_chart(fig_bar, use_container_width=True)

with tab2:
    st.header("Search Models")
    
    col1, col2 = st.columns([2, 1])
    
    with col1:
        search_query = st.text_input("Search for models...", placeholder="Enter model name or type")
    
    with col2:
        model_type = st.selectbox("Filter by type", ["All", "text-generation", "image-classification", "text-classification"])
    
    if st.button("Search"):
        st.info("Search functionality would connect to the ModelForge registry here.")
        
        # Mock search results
        st.subheader("Search Results")
        filtered_df = df
        if model_type != "All":
            filtered_df = df[df["Type"] == model_type]
        
        st.dataframe(filtered_df, use_container_width=True)

with tab3:
    st.header("Platform Analytics")
    
    # Mock analytics data
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("Total Models", "1,234", "+12%")
    
    with col2:
        st.metric("Total Downloads", "45.2K", "+8%")
    
    with col3:
        st.metric("Active Users", "892", "+15%")
    
    with col4:
        st.metric("Revenue", "$12.5K", "+23%")
    
    # Charts
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("Daily Downloads")
        dates = pd.date_range(start="2024-01-01", end="2024-01-30", freq="D")
        downloads = [100 + i * 5 + (i % 7) * 20 for i in range(len(dates))]
        daily_df = pd.DataFrame({"Date": dates, "Downloads": downloads})
        fig_line = px.line(daily_df, x="Date", y="Downloads")
        st.plotly_chart(fig_line, use_container_width=True)
    
    with col2:
        st.subheader("Model Categories")
        categories = ["NLP", "Computer Vision", "Audio", "Multimodal", "Reinforcement Learning"]
        counts = [45, 32, 18, 12, 8]
        cat_df = pd.DataFrame({"Category": categories, "Count": counts})
        fig_cat = px.bar(cat_df, x="Category", y="Count", color="Category")
        st.plotly_chart(fig_cat, use_container_width=True)

# Footer
st.markdown("---")
st.markdown("Built with ❤️ using Streamlit and ModelForge")

# Add custom CSS for better styling
st.markdown("""
<style>
    .metric-container {
        background-color: #f0f2f6;
        padding: 1rem;
        border-radius: 0.5rem;
        border-left: 4px solid #ff6b6b;
    }
</style>
""", unsafe_allow_html=True)
