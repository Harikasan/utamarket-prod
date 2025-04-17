"""
Tests for the Product Detail Page (PDP).
"""

import pytest
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from tests.config import BASE_URL
from tests.conftest import check_toast_message

# --- Locators based on actual implementation ---
HEADER_SELECTOR = "header"
PRODUCT_IMAGES_SELECTOR = "div.space-y-4"
MAIN_IMAGE_SELECTOR = "div.relative.aspect-square.overflow-hidden.rounded-lg img"
THUMBNAIL_IMAGES_SELECTOR = "div.grid.grid-cols-4.gap-4 button"
PRODUCT_TITLE_SELECTOR = "h1.text-2xl.font-semibold.text-zinc-900"
PRODUCT_CATEGORY_SELECTOR = "p.text-zinc-500"
PRODUCT_PRICE_SELECTOR = "span.text-3xl.font-bold.text-\\[\\#0064B1\\]"
PRODUCT_ORIGINAL_PRICE_SELECTOR = "span.text-lg.text-zinc-400.line-through"
PRODUCT_DISCOUNT_SELECTOR = "span.bg-red-500"
PRODUCT_RATING_SELECTOR = "div.flex.items-center.gap-2"
PRODUCT_STARS_SELECTOR = "svg.w-5.h-5"
PRODUCT_REVIEW_COUNT_SELECTOR = "span.text-zinc-600"
SIZE_SELECTOR = "select[value='']"
COLOR_SELECTOR = "select[value='']"
QUANTITY_SELECTOR = "select[value='1']"
ADD_TO_CART_BUTTON_SELECTOR = "button.bg-\\[\\#0064B1\\]"
WISHLIST_BUTTON_SELECTOR = "button[aria-label='Add to wishlist'], button[aria-label='Remove from wishlist']"
SHARE_BUTTON_SELECTOR = "button:has(svg.h-4.w-4)"
PRODUCT_DESCRIPTION_SELECTOR = "p.text-zinc-600"
PRODUCT_DETAILS_SELECTOR = "ul.list-disc.list-inside.space-y-2.text-zinc-600"
LOADING_SKELETON_SELECTOR = "div.animate-pulse.bg-gray-200.rounded-lg"
ERROR_MESSAGE_SELECTOR = "div.text-center h1.text-2xl.font-bold.text-red-600"

# --- Test Data ---
PRODUCT_ID = "1"
QUANTITY = "2"
SIZE = "M"
COLOR = "Navy Blue"

# --- Helper Functions ---

def add_to_cart(driver, wait, quantity, size=None, color=None):
    """Adds a product to cart with specified options."""
    try:
        # Select quantity if provided
        if quantity:
            quantity_select = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, QUANTITY_SELECTOR)))
            quantity_select.click()
            quantity_select.send_keys(quantity)
        
        # Select size if provided
        if size:
            size_select = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, SIZE_SELECTOR)))
            size_select.click()
            size_select.send_keys(size)
        
        # Select color if provided
        if color:
            color_select = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, COLOR_SELECTOR)))
            color_select.click()
            color_select.send_keys(color)
        
        # Click add to cart button
        add_to_cart_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, ADD_TO_CART_BUTTON_SELECTOR)))
        add_to_cart_button.click()
        
        # Wait for success toast
        check_toast_message(wait, "Added to cart!")
        
    except TimeoutException:
        pytest.fail("Failed to add product to cart")

def toggle_wishlist(driver, wait):
    """Toggles the wishlist status of a product."""
    try:
        # Find wishlist button
        wishlist_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, WISHLIST_BUTTON_SELECTOR)))
        initial_state = wishlist_button.get_attribute("aria-label")
        
        # Click button
        wishlist_button.click()
        
        # Wait for state change
        wait.until(lambda d: d.find_element(By.CSS_SELECTOR, WISHLIST_BUTTON_SELECTOR).get_attribute("aria-label") != initial_state)
        
        # Check toast message
        if "Add" in initial_state:
            check_toast_message(wait, "Added to wishlist")
        else:
            check_toast_message(wait, "Removed from wishlist")
            
    except TimeoutException:
        pytest.fail("Failed to toggle wishlist status")

# --- Test Cases ---

def test_tc_pdp_001_verify_page_load(driver, wait):
    """TC-PDP-001: Verify product detail page loads correctly."""
    driver.get(f"{BASE_URL}/product/{PRODUCT_ID}")
    
    # Verify header
    wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, HEADER_SELECTOR)))
    
    # Wait for loading skeleton to disappear
    try:
        wait.until(EC.invisibility_of_element_located((By.CSS_SELECTOR, LOADING_SKELETON_SELECTOR)))
    except TimeoutException:
        pass
    
    # Verify product images
    images_section = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, PRODUCT_IMAGES_SELECTOR)))
    assert images_section.find_element(By.CSS_SELECTOR, MAIN_IMAGE_SELECTOR).is_displayed()
    thumbnails = images_section.find_elements(By.CSS_SELECTOR, THUMBNAIL_IMAGES_SELECTOR)
    assert len(thumbnails) > 0
    
    # Verify product info
    assert wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, PRODUCT_TITLE_SELECTOR))).text != ""
    assert wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, PRODUCT_CATEGORY_SELECTOR))).text != ""
    assert wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, PRODUCT_PRICE_SELECTOR))).text.startswith("$")
    
    # Verify rating
    rating_section = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, PRODUCT_RATING_SELECTOR)))
    stars = rating_section.find_elements(By.CSS_SELECTOR, PRODUCT_STARS_SELECTOR)
    assert len(stars) == 5
    assert rating_section.find_element(By.CSS_SELECTOR, PRODUCT_REVIEW_COUNT_SELECTOR).text != ""

def test_tc_pdp_002_verify_image_gallery(driver, wait):
    """TC-PDP-002: Verify product image gallery functionality."""
    driver.get(f"{BASE_URL}/product/{PRODUCT_ID}")
    
    # Wait for images to load
    images_section = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, PRODUCT_IMAGES_SELECTOR)))
    thumbnails = images_section.find_elements(By.CSS_SELECTOR, THUMBNAIL_IMAGES_SELECTOR)
    
    # Click each thumbnail and verify main image changes
    for i, thumbnail in enumerate(thumbnails):
        # Get current main image src
        main_image = images_section.find_element(By.CSS_SELECTOR, MAIN_IMAGE_SELECTOR)
        initial_src = main_image.get_attribute("src")
        
        # Click thumbnail
        thumbnail.click()
        time.sleep(0.5)  # Wait for image transition
        
        # Verify main image changed
        new_src = main_image.get_attribute("src")
        assert new_src != initial_src, f"Main image did not change after clicking thumbnail {i}"

def test_tc_pdp_003_verify_add_to_cart(driver, wait):
    """TC-PDP-003: Verify add to cart functionality."""
    driver.get(f"{BASE_URL}/product/{PRODUCT_ID}")
    
    # Add to cart with default options
    add_to_cart(driver, wait, None)
    
    # Verify cart action in toast
    toast_action = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "button:has-text('View Cart')")))
    assert toast_action.is_displayed()

def test_tc_pdp_004_verify_add_to_cart_with_options(driver, wait):
    """TC-PDP-004: Verify add to cart with size and color selection."""
    driver.get(f"{BASE_URL}/product/{PRODUCT_ID}")
    
    # Add to cart with options
    add_to_cart(driver, wait, QUANTITY, SIZE, COLOR)
    
    # Verify cart action in toast
    toast_action = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "button:has-text('View Cart')")))
    assert toast_action.is_displayed()

def test_tc_pdp_005_verify_wishlist_functionality(driver, wait):
    """TC-PDP-005: Verify wishlist functionality."""
    driver.get(f"{BASE_URL}/product/{PRODUCT_ID}")
    
    # Toggle wishlist status
    toggle_wishlist(driver, wait)
    
    # Toggle again to return to original state
    toggle_wishlist(driver, wait)

def test_tc_pdp_006_verify_share_functionality(driver, wait):
    """TC-PDP-006: Verify share functionality."""
    driver.get(f"{BASE_URL}/product/{PRODUCT_ID}")
    
    # Click share button
    share_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, SHARE_BUTTON_SELECTOR)))
    share_button.click()
    
    # Verify toast message
    check_toast_message(wait, "Link copied to clipboard!")

def test_tc_pdp_007_verify_error_handling(driver, wait):
    """TC-PDP-007: Verify error handling for invalid product ID."""
    driver.get(f"{BASE_URL}/product/invalid_id")
    
    # Verify error message
    error_message = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, ERROR_MESSAGE_SELECTOR)))
    assert "Error" in error_message.text
    assert "Product not found" in driver.find_element(By.CSS_SELECTOR, "p.text-zinc-600").text 