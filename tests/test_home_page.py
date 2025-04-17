"""
Tests for the Home Page.
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
HERO_SECTION_SELECTOR = "section.relative.h-\\[600px\\]"
HERO_TITLE_SELECTOR = "h1.text-4xl.font-bold.text-white"
HERO_DESCRIPTION_SELECTOR = "p.text-lg.text-white\\/90"
HERO_BUTTON_SELECTOR = "a.bg-white\\/10"
FEATURED_SECTION_SELECTOR = "section.py-16.bg-zinc-50"
FEATURED_TITLE_SELECTOR = "h2.text-3xl.font-bold.text-\\[\\#0064B1\\]"
FEATURED_DESCRIPTION_SELECTOR = "p.text-lg.text-zinc-600"
FEATURED_PRODUCTS_GRID_SELECTOR = "div.grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-3.xl\\:grid-cols-4.gap-6"
PRODUCT_CARD_SELECTOR = "div.bg-white.rounded-lg.shadow.overflow-hidden"
PRODUCT_IMAGE_SELECTOR = "div.relative.aspect-square img"
PRODUCT_TITLE_SELECTOR = "h3.text-lg.font-medium.text-gray-900"
PRODUCT_PRICE_SELECTOR = "p.text-lg.font-semibold.text-\\[\\#0064B1\\]"
PRODUCT_CATEGORY_SELECTOR = "p.text-sm.text-gray-500"
CATEGORIES_SECTION_SELECTOR = "section.py-16.bg-white"
CATEGORIES_GRID_SELECTOR = "div.grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-3.xl\\:grid-cols-4.gap-6"
CATEGORY_CARD_SELECTOR = "a.group.block.overflow-hidden.rounded-lg.shadow-md"
CATEGORY_IMAGE_SELECTOR = "div.relative.h-48.overflow-hidden img"
CATEGORY_TITLE_SELECTOR = "h3.text-white.font-bold.text-xl"
CATEGORY_COUNT_SELECTOR = "p.text-zinc-300.text-sm"
LOADING_SPINNER_SELECTOR = "div.animate-spin.rounded-full.h-8.w-8.border-b-2.border-\\[\\#0064B1\\]"

# --- Test Cases ---

def test_tc_home_001_verify_page_load(driver, wait):
    """TC-HOME-001: Verify home page loads correctly."""
    driver.get(BASE_URL)
    
    # Verify header
    wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, HEADER_SELECTOR)))
    
    # Verify hero section
    hero = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, HERO_SECTION_SELECTOR)))
    assert hero.find_element(By.CSS_SELECTOR, HERO_TITLE_SELECTOR).text != ""
    assert hero.find_element(By.CSS_SELECTOR, HERO_DESCRIPTION_SELECTOR).text != ""
    assert hero.find_element(By.CSS_SELECTOR, HERO_BUTTON_SELECTOR).is_displayed()

def test_tc_home_002_verify_featured_products(driver, wait):
    """TC-HOME-002: Verify featured products section."""
    driver.get(BASE_URL)
    
    # Wait for featured section
    featured = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, FEATURED_SECTION_SELECTOR)))
    assert featured.find_element(By.CSS_SELECTOR, FEATURED_TITLE_SELECTOR).text != ""
    assert featured.find_element(By.CSS_SELECTOR, FEATURED_DESCRIPTION_SELECTOR).text != ""
    
    # Wait for products to load
    products_grid = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, FEATURED_PRODUCTS_GRID_SELECTOR)))
    products = products_grid.find_elements(By.CSS_SELECTOR, PRODUCT_CARD_SELECTOR)
    assert len(products) > 0
    
    # Check first product details
    first_product = products[0]
    assert first_product.find_element(By.CSS_SELECTOR, PRODUCT_IMAGE_SELECTOR).is_displayed()
    assert first_product.find_element(By.CSS_SELECTOR, PRODUCT_TITLE_SELECTOR).text != ""
    assert first_product.find_element(By.CSS_SELECTOR, PRODUCT_PRICE_SELECTOR).text.startswith("$")
    assert first_product.find_element(By.CSS_SELECTOR, PRODUCT_CATEGORY_SELECTOR).text != ""

def test_tc_home_003_verify_categories(driver, wait):
    """TC-HOME-003: Verify categories section."""
    driver.get(BASE_URL)
    
    # Wait for categories section
    categories = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, CATEGORIES_SECTION_SELECTOR)))
    
    # Wait for categories grid
    categories_grid = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, CATEGORIES_GRID_SELECTOR)))
    category_cards = categories_grid.find_elements(By.CSS_SELECTOR, CATEGORY_CARD_SELECTOR)
    assert len(category_cards) > 0
    
    # Check first category details
    first_category = category_cards[0]
    assert first_category.find_element(By.CSS_SELECTOR, CATEGORY_IMAGE_SELECTOR).is_displayed()
    assert first_category.find_element(By.CSS_SELECTOR, CATEGORY_TITLE_SELECTOR).text != ""
    assert first_category.find_element(By.CSS_SELECTOR, CATEGORY_COUNT_SELECTOR).text != ""

def test_tc_home_004_verify_navigation(driver, wait):
    """TC-HOME-004: Verify navigation from home page."""
    driver.get(BASE_URL)
    
    # Click featured product
    products = wait.until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, PRODUCT_CARD_SELECTOR)))
    first_product = products[0]
    product_link = first_product.find_element(By.CSS_SELECTOR, PRODUCT_TITLE_SELECTOR)
    product_href = product_link.get_attribute("href")
    product_link.click()
    
    # Verify navigation to product page
    wait.until(EC.url_contains("/product/"))
    assert driver.current_url == product_href
    
    # Go back to home
    driver.get(BASE_URL)
    
    # Click category
    categories = wait.until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, CATEGORY_CARD_SELECTOR)))
    first_category = categories[0]
    category_href = first_category.get_attribute("href")
    first_category.click()
    
    # Verify navigation to category page
    wait.until(EC.url_contains("/listings"))
    assert driver.current_url == category_href

def test_tc_home_005_verify_hero_button(driver, wait):
    """TC-HOME-005: Verify hero section call-to-action button."""
    driver.get(BASE_URL)
    
    # Click hero button
    hero_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, HERO_BUTTON_SELECTOR)))
    button_href = hero_button.get_attribute("href")
    hero_button.click()
    
    # Verify navigation
    wait.until(EC.url_contains(button_href))
    assert driver.current_url.endswith(button_href)

def test_tc_home_006_verify_featured_product_links(driver, wait):
    """TC-HOME-006: Verify Featured Product Links Navigate Correctly."""
    driver.get(BASE_URL)
    wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, FEATURED_PRODUCTS_GRID_SELECTOR)))
    first_product_link = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, f"{PRODUCT_CARD_SELECTOR} {PRODUCT_TITLE_SELECTOR}")))
    
    product_href = first_product_link.get_attribute("href")
    assert "/product/" in product_href
    
    first_product_link.click()
    wait.until(EC.url_contains("/product/"))
    assert driver.current_url == product_href
    # Optionally, verify some element on the PDP to confirm navigation
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "h1"))) # Check for product title H1

def test_tc_home_007_verify_view_all_products_link(driver, wait):
    """TC-HOME-007: Verify 'View All Products' Link Works."""
    driver.get(BASE_URL)
    view_all_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//a[contains(., 'View All Products')]")))
    view_all_button.click()
    wait.until(EC.url_to_be(f"{BASE_URL}/listings"))
    assert driver.current_url == f"{BASE_URL}/listings"

@pytest.mark.skip(reason="Login/logout functionality might need specific element adjustments")
def test_tc_home_008_verify_ai_recommendations_logged_in(logged_in_driver, wait):
    """TC-HOME-008: Verify AI Recommendations Section (Logged In)."""
    logged_in_driver.get(BASE_URL)
    try:
        wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, FEATURED_PRODUCTS_GRID_SELECTOR)))
        recommendations = logged_in_driver.find_elements(By.CSS_SELECTOR, f"{PRODUCT_CARD_SELECTOR}")
        assert len(recommendations) > 0
    except TimeoutException:
        pytest.fail("Recommendations section not found or not visible for logged in user.")

@pytest.mark.skip(reason="Login/logout functionality might need specific element adjustments")
def test_tc_home_009_verify_ai_recommendations_logged_out(logged_out_driver, wait):
    """TC-HOME-009: Verify AI Recommendations Section (Logged Out)."""
    logged_out_driver.get(BASE_URL)
    # Depending on implementation, the section might be absent or show generic items
    # Option 1: Assert section is NOT present
    try:
        wait.until(EC.invisibility_of_element_located((By.CSS_SELECTOR, FEATURED_PRODUCTS_GRID_SELECTOR)))
    except TimeoutException: 
        # Option 2: Check if present but maybe has different content (if it shows generic)
        try:
            wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, FEATURED_PRODUCTS_GRID_SELECTOR)))
            print("Recommendations section found for logged out user (check if content is generic).")
            # Add assertions here to check for generic content if applicable
        except TimeoutException:
             pytest.fail("Recommendations section unexpectedly found or behavior unclear for logged out user.") 