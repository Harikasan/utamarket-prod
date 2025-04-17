"""
Configuration settings for Selenium tests.
"""

BASE_URL = "http://localhost:3000"  # Replace with your actual app URL

# Add credentials if needed, consider using environment variables for security
VALID_EMAIL = "testuser@mavs.uta.edu"
VALID_PASSWORD = "password@123"
INVALID_PASSWORD = "wrongpassword"
UNREGISTERED_EMAIL = "nosuchuser@example.com" 