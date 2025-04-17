"""
Pytest configuration file for Selenium fixtures.
"""

import pytest
from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.common.by import By
from tests.config import BASE_URL, VALID_EMAIL, VALID_PASSWORD

@pytest.fixture(scope="session")
def driver():
    """Provides a Selenium WebDriver instance (Chrome) for the test session."""
    options = webdriver.ChromeOptions()
    # Add any desired options (e.g., headless mode)
    # options.add_argument("--headless")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1920,1080")
    
    service = ChromeService(ChromeDriverManager().install())
    _driver = webdriver.Chrome(service=service, options=options)
    _driver.implicitly_wait(5) # Implicit wait for element finding
    yield _driver
    _driver.quit()

@pytest.fixture(scope="function")
def wait(driver):
    """Provides a WebDriverWait instance for explicit waits."""
    return WebDriverWait(driver, 10) # 10-second timeout

def login(driver, wait):
    """Helper function to perform login."""
    driver.get(f"{BASE_URL}/login")
    wait.until(EC.presence_of_element_located((By.ID, "email"))).send_keys(VALID_EMAIL)
    driver.find_element(By.ID, "password").send_keys(VALID_PASSWORD)
    driver.find_element(By.XPATH, "//button[contains(text(), 'Login')]").click()
    # Wait for successful login indicator (e.g., user menu or specific element on home page)
    try:
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "button[aria-label='Open user menu']"))) # Adjust selector as needed
    except TimeoutException:
        # Handle potential login failures or slow loads if needed
        print("Login might have failed or took too long.")
        pass # Allow test to continue and potentially fail later if login was required

def logout(driver, wait):
    """Helper function to perform logout."""
    try:
        user_menu_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "button[aria-label='Open user menu']"))) # Adjust selector
        user_menu_button.click()
        logout_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Logout')]"))) # Adjust selector
        logout_button.click()
        # Wait for logout confirmation (e.g., login button reappears)
        wait.until(EC.presence_of_element_located((By.LINK_TEXT, "Login"))) # Adjust selector
    except TimeoutException:
        print("Logout failed or user was not logged in.")
        # If logout fails, try navigating away to reset state for next test
        driver.get(BASE_URL)

@pytest.fixture(scope="function")
def logged_in_driver(driver, wait):
    """Provides a driver instance that is already logged in."""
    login(driver, wait)
    yield driver
    # Attempt logout after test, but don't fail if it doesn't work cleanly
    try:
        logout(driver, wait)
    except Exception as e:
        print(f"Error during post-test logout: {e}")
        driver.get(BASE_URL) # Navigate away to try and reset state

@pytest.fixture(scope="function")
def logged_out_driver(driver, wait):
    """Ensures the driver instance is logged out before the test."""
    # Attempt logout first in case previous test left user logged in
    try:
        logout(driver, wait)
    except Exception:
        # If logout fails (e.g., already logged out), just navigate to base URL
        driver.get(BASE_URL)
    yield driver
    # No cleanup needed as it should be logged out

# Helper to check for toast messages
def check_toast_message(wait, expected_text, toast_type='success'):
    """Checks for the presence and text of a toast message."""
    # Adjust the selector based on how sonner toasts are implemented
    # This is a common pattern, might need adjustment
    toast_selector = f"[data-sonner-toast][data-type='{toast_type}']"
    try:
        toast = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, toast_selector)))
        assert expected_text in toast.text
        return True
    except TimeoutException:
        print(f"Toast message '{expected_text}' of type '{toast_type}' not found.")
        return False 