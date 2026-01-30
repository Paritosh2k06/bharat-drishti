import streamlit as st
import streamlit.components.v1 as components

st.set_page_config(layout="wide")

# This reads your React JS build and shows it in Streamlit
try:
    with open("frontend/build/index.html", 'r') as f:
        html_data = f.read()
    components.html(html_data, height=1000, scrolling=True)
except FileNotFoundError:
    st.error("Please run 'npm run build' first!")