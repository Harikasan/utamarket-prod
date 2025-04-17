import pytest
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from tests.config import BASE_URL
from tests.conftest import check_toast_message

# --- Locators based on actual implementation ---
HEADER_SELECTOR = "header"
WISHLIST_TITLE_SELECTOR = "h1.text-4xl.font-bold.text-\\[\\#0064B1\\]"
WISHLIST_ITEMS_CONTAINER_SELECTOR = "div.bg-white.rounded-lg.shadow.overflow-hidden"
WISHLIST_ITEM_SELECTOR = "div.flex.items-center.p-6"
WISHLIST_ITEM_IMAGE_SELECTOR = "div.relative.h-24.w-24 img"
WISHLIST_ITEM_TITLE_SELECTOR = "h3.text-lg.font-medium.text-gray-900 a"
WISHLIST_ITEM_CATEGORY_SELECTOR = "p.mt-1.text-sm.text-gray-500"
WISHLIST_ITEM_PRICE_SELECTOR = "p.text-lg.font-semibold.text-\\[\\#0064B1\\]"
WISHLIST_ITEM_REMOVE_BUTTON_SELECTOR = "button[aria-label='Remove from wishlist']"
EMPTY_WISHLIST_MESSAGE_SELECTOR = "h2.text-2xl.font-semibold.text-zinc-900"
BROWSE_PRODUCTS_BUTTON_SELECTOR = "a[href='/listings']"
VIEW_DETAILS_BUTTON_SELECTOR = "a:has(svg.h-4.w-4.mr-2)"
LOADING_SPINNER_SELECTOR = "svg.h-8.w-8.animate-spin.text-\\[\\#0064B1\\]"

# --- Test Data ---
PRODUCT_ID_FOR_WISHLIST = "2" # Use a different ID than cart tests

# --- Helper Functions ---

def add_item_to_wishlist(driver, wait, product_id):
    """Adds a specific item to the wishlist. Assumes user is logged in."""
    driver.get(f"{BASE_URL}/product/{product_id}")
    try:
        # Use PDP wishlist button selector
        pdp_wishlist_button_selector = "button[aria-label='Add to wishlist'], button[aria-label='Remove from wishlist']"
        wishlist_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, pdp_wishlist_button_selector)))
        button_label = wishlist_button.get_attribute("aria-label")

        if "Add" in button_label:
            wishlist_button.click()
            # Wait for button state change and toast
            wait.until(lambda d: d.find_element(By.CSS_SELECTOR, pdp_wishlist_button_selector).get_attribute("aria-label") == "Remove from wishlist")
            check_toast_message(wait, "Added to wishlist")
            print(f"Added product {product_id} to wishlist.")
        elif "Remove" in button_label:
            print(f"Product {product_id} already in wishlist.")
        time.sleep(0.5) # Short pause for stability
    except TimeoutException:
        pytest.fail(f"Could not find or interact with wishlist button on PDP for product {product_id}")

def clear_wishlist(driver, wait):
    """Removes all items from the wishlist page. Assumes user is logged in and on wishlist page."""
    try:
        # Wait for either items container or empty message
        try:
            wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, WISHLIST_ITEMS_CONTAINER_SELECTOR)))
            remove_buttons = driver.find_elements(By.CSS_SELECTOR, WISHLIST_ITEM_REMOVE_BUTTON_SELECTOR)
            print(f"Found {len(remove_buttons)} items to remove from wishlist.")
            
            for button in remove_buttons:
                if not button.is_displayed():
                    continue
                button.click()
                # Wait for item removal animation/update
                time.sleep(0.5)
                # Check for toast message
                check_toast_message(wait, "Removed from wishlist")
            
            # Verify empty state
            wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, EMPTY_WISHLIST_MESSAGE_SELECTOR)))
            print("Wishlist cleared successfully.")
            
        except TimeoutException:
            # Check if already empty
            wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, EMPTY_WISHLIST_MESSAGE_SELECTOR)))
            print("Wishlist was already empty.")
            
    except Exception as e:
        print(f"Error during wishlist clearing: {e}")
        # Navigate away to reset state
        driver.get(f"{BASE_URL}")

# --- Test Setup Fixtures ---

@pytest.fixture(scope="function")
def wishlist_setup(logged_in_driver, wait):
    """Fixture ensures user logged in, clears wishlist, adds one item, goes to wishlist page."""
    driver = logged_in_driver
    
    # Clear existing wishlist
    driver.get(f"{BASE_URL}/wishlist")
    # Wait for loading spinner to disappear if present
    try:
        wait.until(EC.invisibility_of_element_located((By.CSS_SELECTOR, LOADING_SPINNER_SELECTOR)))
    except TimeoutException:
        pass  # Loading spinner might not appear if page loads very quickly
    clear_wishlist(driver, wait)
    
    # Add test item
    add_item_to_wishlist(driver, wait, PRODUCT_ID_FOR_WISHLIST)
    
    # Go to wishlist page
    driver.get(f"{BASE_URL}/wishlist")
    # Wait for page load
    wait.until(EC.invisibility_of_element_located((By.CSS_SELECTOR, LOADING_SPINNER_SELECTOR)))
    
    yield driver
    
    # Cleanup
    try:
        driver.get(f"{BASE_URL}/wishlist")
        clear_wishlist(driver, wait)
    except Exception as e:
        print(f"Cleanup error: {e}")

@pytest.fixture(scope="function")
def empty_wishlist_setup(logged_in_driver, wait):
    """Fixture ensures user logged in and wishlist is empty."""
    driver = logged_in_driver
    driver.get(f"{BASE_URL}/wishlist")
    # Wait for loading spinner to disappear
    try:
        wait.until(EC.invisibility_of_element_located((By.CSS_SELECTOR, LOADING_SPINNER_SELECTOR)))
    except TimeoutException:
        pass
    clear_wishlist(driver, wait)
    yield driver

# --- Test Cases ---

def test_tc_wish_001_verify_page_load_with_items(wishlist_setup, wait):
    """TC-WISH-001: Verify Wishlist page loads with items."""
    driver = wishlist_setup
    
    # Verify header and title
    wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, HEADER_SELECTOR)))
    wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, WISHLIST_TITLE_SELECTOR)))
    
    # Verify wishlist items
    items_container = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, WISHLIST_ITEMS_CONTAINER_SELECTOR)))
    wishlist_items = items_container.find_elements(By.CSS_SELECTOR, WISHLIST_ITEM_SELECTOR)
    assert len(wishlist_items) > 0, "No items found in wishlist"
    
    # Check first item details
    first_item = wishlist_items[0]
    assert first_item.find_element(By.CSS_SELECTOR, WISHLIST_ITEM_IMAGE_SELECTOR).is_displayed()
    assert first_item.find_element(By.CSS_SELECTOR, WISHLIST_ITEM_TITLE_SELECTOR).text != ""
    assert first_item.find_element(By.CSS_SELECTOR, WISHLIST_ITEM_CATEGORY_SELECTOR).text != ""
    price_element = first_item.find_element(By.CSS_SELECTOR, WISHLIST_ITEM_PRICE_SELECTOR)
    assert price_element.text.startswith("$"), "Price format incorrect"
    assert first_item.find_element(By.CSS_SELECTOR, WISHLIST_ITEM_REMOVE_BUTTON_SELECTOR).is_displayed()

def test_tc_wish_002_verify_page_load_empty(empty_wishlist_setup, wait):
    """TC-WISH-002: Verify empty wishlist message is shown."""
    driver = empty_wishlist_setup
    
    # Verify header and empty state
    wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, HEADER_SELECTOR)))
    empty_message = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, EMPTY_WISHLIST_MESSAGE_SELECTOR)))
    assert "Your wishlist is empty" in empty_message.text
    
    # Verify browse products button
    browse_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, BROWSE_PRODUCTS_BUTTON_SELECTOR)))
    assert "Browse Products" in browse_button.text

def test_tc_wish_003_verify_redirect_not_logged_in(logged_out_driver, wait):
    """TC-WISH-003: Verify redirect to login when accessing wishlist logged out."""
    driver = logged_out_driver
    driver.get(f"{BASE_URL}/wishlist")
    wait.until(EC.url_contains("/login"))
    assert "/login" in driver.current_url
    assert "redirect=%2Fwishlist" in driver.current_url

def test_tc_wish_004_verify_remove_item(wishlist_setup, wait):
    """TC-WISH-004: Verify removing an item from the wishlist page."""
    driver = wishlist_setup
    
    # Get initial item count
    items = wait.until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, WISHLIST_ITEM_SELECTOR)))
    initial_count = len(items)
    assert initial_count > 0, "No items to remove"
    
    # Click remove button on first item
    remove_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, WISHLIST_ITEM_REMOVE_BUTTON_SELECTOR)))
    remove_button.click()
    
    # Verify removal
    check_toast_message(wait, "Removed from wishlist")
    
    try:
        # Check if we have remaining items
        remaining_items = driver.find_elements(By.CSS_SELECTOR, WISHLIST_ITEM_SELECTOR)
        assert len(remaining_items) == initial_count - 1
    except:
        # If no items left, verify empty state
        empty_message = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, EMPTY_WISHLIST_MESSAGE_SELECTOR)))
        assert "Your wishlist is empty" in empty_message.text

def test_tc_wish_005_verify_product_link(wishlist_setup, wait):
    """TC-WISH-005: Verify clicking item title navigates to PDP."""
    driver = wishlist_setup
    
    # Find and click product title
    product_link = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, WISHLIST_ITEM_TITLE_SELECTOR)))
    product_href = product_link.get_attribute("href")
    assert "/product/" in product_href
    
    product_link.click()
    
    # Verify navigation to PDP
    wait.until(EC.url_contains("/product/"))
    assert driver.current_url == product_href
    
    # Verify PDP loaded
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "h1")))
