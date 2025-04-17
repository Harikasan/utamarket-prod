"""
Tests for the Product Listings Page (PLP).
"""

import pytest
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from tests.config import BASE_URL
from tests.conftest import check_toast_message

# --- Locators based on actual implementation ---
HEADER_SELECTOR = "header"
PAGE_TITLE_SELECTOR = "h1.text-4xl.font-bold.text-\\[\\#0064B1\\]"
PAGE_DESCRIPTION_SELECTOR = "p.text-zinc-600.text-lg"
SEARCH_INPUT_SELECTOR = "input[placeholder='Search products...']"
SEARCH_BUTTON_SELECTOR = "button.bg-\\[\\#0064B1\\]"
FILTER_BUTTON_SELECTOR = "button:has(svg.h-4.w-4)"
FILTER_PANEL_SELECTOR = "div.bg-white.p-4.rounded-lg.shadow-sm"
CATEGORY_FILTER_SELECTOR = "select[value='all']"
SIZE_FILTER_SELECTOR = "div.flex.flex-wrap.gap-2"
COLOR_FILTER_SELECTOR = "div.flex.flex-wrap.gap-2"
PRICE_FILTER_SELECTOR = "div.flex.gap-2"
SORT_SELECTOR = "select[value='newest']"
PRODUCTS_GRID_SELECTOR = "div.grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-3.xl\\:grid-cols-4.gap-6"
PRODUCT_CARD_SELECTOR = "div.bg-white.rounded-lg.shadow.overflow-hidden"
PRODUCT_IMAGE_SELECTOR = "div.relative.aspect-square img"
PRODUCT_TITLE_SELECTOR = "h3.text-lg.font-medium.text-gray-900"
PRODUCT_PRICE_SELECTOR = "p.text-lg.font-semibold.text-\\[\\#0064B1\\]"
PRODUCT_CATEGORY_SELECTOR = "p.text-sm.text-gray-500"
PAGINATION_SELECTOR = "div.flex.justify-center.items-center.gap-2"
PAGINATION_PREV_BUTTON_SELECTOR = "button:has(svg.h-4.w-4):first-child"
PAGINATION_NEXT_BUTTON_SELECTOR = "button:has(svg.h-4.w-4):last-child"
PAGINATION_TEXT_SELECTOR = "span.text-sm"
LOADING_SKELETON_SELECTOR = "div.animate-pulse.bg-gray-200.rounded-lg.aspect-square"
NO_PRODUCTS_MESSAGE_SELECTOR = "div.col-span-full.text-center.py-12"
RESULTS_INFO_SELECTOR = "p.text-sm.text-zinc-600"

# --- Test Data ---
SEARCH_QUERY = "hoodie"
CATEGORY_NAME = "Apparel"
SIZE = "M"
COLOR = "Blue"
MIN_PRICE = "20"
MAX_PRICE = "50"
SORT_OPTION = "price-low"

# --- Helper Functions ---

def apply_filters(driver, wait):
    """Applies filters to the product listings page."""
    try:
        # Click filter button to show filter panel
        filter_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, FILTER_BUTTON_SELECTOR)))
        filter_button.click()
        
        # Wait for filter panel
        wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, FILTER_PANEL_SELECTOR)))
        
        # Select category
        category_select = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, CATEGORY_FILTER_SELECTOR)))
        category_select.click()
        category_select.send_keys(CATEGORY_NAME)
        
        # Select size
        size_badges = driver.find_elements(By.CSS_SELECTOR, f"{SIZE_FILTER_SELECTOR} span")
        for badge in size_badges:
            if badge.text == SIZE:
                badge.click()
                break
        
        # Select color
        color_badges = driver.find_elements(By.CSS_SELECTOR, f"{COLOR_FILTER_SELECTOR} span")
        for badge in color_badges:
            if badge.text == COLOR:
                badge.click()
                break
        
        # Set price range
        price_inputs = driver.find_elements(By.CSS_SELECTOR, f"{PRICE_FILTER_SELECTOR} input")
        price_inputs[0].clear()
        price_inputs[0].send_keys(MIN_PRICE)
        price_inputs[1].clear()
        price_inputs[1].send_keys(MAX_PRICE)
        
        # Select sort option
        sort_select = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, SORT_SELECTOR)))
        sort_select.click()
        sort_select.send_keys(SORT_OPTION)
        
        # Wait for results to update
        time.sleep(1)
        
    except TimeoutException:
        pytest.fail("Failed to apply filters")

def perform_search(driver, wait, query):
    """Performs a search on the product listings page."""
    try:
        # Enter search query
        search_input = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, SEARCH_INPUT_SELECTOR)))
        search_input.clear()
        search_input.send_keys(query)
        
        # Click search button
        search_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, SEARCH_BUTTON_SELECTOR)))
        search_button.click()
        
        # Wait for results to update
        time.sleep(1)
        
    except TimeoutException:
        pytest.fail("Failed to perform search")

# --- Test Cases ---

def test_tc_list_001_verify_page_load(driver, wait):
    """TC-LIST-001: Verify product listings page loads correctly."""
    driver.get(f"{BASE_URL}/listings")
    
    # Verify header and title
    wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, HEADER_SELECTOR)))
    title = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, PAGE_TITLE_SELECTOR)))
    assert "All UTA Merchandise" in title.text
    
    # Verify page description
    description = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, PAGE_DESCRIPTION_SELECTOR)))
    assert "Browse our complete collection" in description.text
    
    # Verify search and filter controls
    wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, SEARCH_INPUT_SELECTOR)))
    wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, SEARCH_BUTTON_SELECTOR)))
    wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, FILTER_BUTTON_SELECTOR)))

def test_tc_list_002_verify_product_grid(driver, wait):
    """TC-LIST-002: Verify product grid displays correctly."""
    driver.get(f"{BASE_URL}/listings")
    
    # Wait for products grid
    products_grid = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, PRODUCTS_GRID_SELECTOR)))
    
    # Check for loading skeletons
    loading_skeletons = driver.find_elements(By.CSS_SELECTOR, LOADING_SKELETON_SELECTOR)
    if loading_skeletons:
        # Wait for skeletons to disappear
        wait.until(EC.invisibility_of_element_located((By.CSS_SELECTOR, LOADING_SKELETON_SELECTOR)))
    
    # Verify product cards
    product_cards = driver.find_elements(By.CSS_SELECTOR, PRODUCT_CARD_SELECTOR)
    assert len(product_cards) > 0, "No product cards found"
    
    # Check first product card details
    first_card = product_cards[0]
    assert first_card.find_element(By.CSS_SELECTOR, PRODUCT_IMAGE_SELECTOR).is_displayed()
    assert first_card.find_element(By.CSS_SELECTOR, PRODUCT_TITLE_SELECTOR).text != ""
    assert first_card.find_element(By.CSS_SELECTOR, PRODUCT_PRICE_SELECTOR).text.startswith("$")
    assert first_card.find_element(By.CSS_SELECTOR, PRODUCT_CATEGORY_SELECTOR).text != ""

def test_tc_list_003_verify_search_functionality(driver, wait):
    """TC-LIST-003: Verify search functionality works correctly."""
    driver.get(f"{BASE_URL}/listings")
    
    # Perform search
    perform_search(driver, wait, SEARCH_QUERY)
    
    # Verify results
    results_info = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, RESULTS_INFO_SELECTOR)))
    assert "results" in results_info.text.lower()
    
    # Check if any products match the search query
    product_titles = driver.find_elements(By.CSS_SELECTOR, PRODUCT_TITLE_SELECTOR)
    assert any(SEARCH_QUERY.lower() in title.text.lower() for title in product_titles)

def test_tc_list_004_verify_filter_functionality(driver, wait):
    """TC-LIST-004: Verify filter functionality works correctly."""
    driver.get(f"{BASE_URL}/listings")
    
    # Apply filters
    apply_filters(driver, wait)
    
    # Verify results
    results_info = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, RESULTS_INFO_SELECTOR)))
    assert "results" in results_info.text.lower()
    
    # Check if products match the filters
    product_categories = driver.find_elements(By.CSS_SELECTOR, PRODUCT_CATEGORY_SELECTOR)
    assert any(CATEGORY_NAME.lower() in category.text.lower() for category in product_categories)

def test_tc_list_005_verify_pagination(driver, wait):
    """TC-LIST-005: Verify pagination works correctly."""
    driver.get(f"{BASE_URL}/listings")
    
    # Wait for pagination controls
    pagination = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, PAGINATION_SELECTOR)))
    
    # Get initial page info
    page_text = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, PAGINATION_TEXT_SELECTOR)))
    initial_page = page_text.text
    
    # Click next page
    next_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, PAGINATION_NEXT_BUTTON_SELECTOR)))
    next_button.click()
    
    # Wait for page to update
    time.sleep(1)
    
    # Verify page changed
    new_page_text = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, PAGINATION_TEXT_SELECTOR)))
    assert new_page_text.text != initial_page
    
    # Click previous page
    prev_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, PAGINATION_PREV_BUTTON_SELECTOR)))
    prev_button.click()
    
    # Wait for page to update
    time.sleep(1)
    
    # Verify returned to initial page
    final_page_text = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, PAGINATION_TEXT_SELECTOR)))
    assert final_page_text.text == initial_page 