import streamlit as st
import streamlit.components.v1 as components

# 1. Page Configuration
st.set_page_config(page_title="Bharat-Drishti Portal", layout="wide")

# 2. Title and Sidebar
st.sidebar.title("Bharat-Drishti Admin")
st.sidebar.info("This is a Streamlit wrapper for the React Intelligence Dashboard.")

# 3. Embedding your React App
# Note: Your React app MUST be running (npm start) for this to work
st.title("🇮🇳 Bharat-Drishti: Command Center")

components.iframe("http://localhost:3000", height=800, scrolling=True)

st.markdown("---")
st.caption("Data Intelligence Portal | UIDAI Hackathon 2026")