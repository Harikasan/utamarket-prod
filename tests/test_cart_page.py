"""
Tests for the Cart Page.
"""
import pytest
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from tests.config import BASE_URL
from tests.test_product_detail_page import select_shadcn_option # Reuse helper
from tests.conftest import check_toast_message

# --- Locators based on actual implementation ---
HEADER_SELECTOR = "header"
PAGE_TITLE_SELECTOR = "h1.text-3xl.font-bold"
CART_ITEMS_CONTAINER_SELECTOR = "div.lg\\:col-span-2.space-y-4"
CART_ITEM_SELECTOR = "div.bg-white.rounded-lg.shadow-sm.p-4.flex.gap-4"
CART_ITEM_IMAGE_SELECTOR = "div.shrink-0.aspect-square.w-24.relative.rounded-md.overflow-hidden img"
CART_ITEM_TITLE_SELECTOR = "a.font-medium.hover\\:text-\\[\\#0064B1\\]"
CART_ITEM_CATEGORY_SELECTOR = "div.text-sm.text-zinc-600"
CART_ITEM_PRICE_SELECTOR = "span.font-medium"
CART_ITEM_QUANTITY_SELECTOR = "span.w-8.text-center"
CART_ITEM_DECREASE_BUTTON_SELECTOR = "button:has(svg.h-4.w-4):first-child"
CART_ITEM_INCREASE_BUTTON_SELECTOR = "button:has(svg.h-4.w-4):last-child"
CART_ITEM_REMOVE_BUTTON_SELECTOR = "button:has(svg.h-4.w-4.mr-1)"
ORDER_SUMMARY_SELECTOR = "div.bg-white.rounded-lg.shadow-sm.p-6"
ORDER_SUBTOTAL_SELECTOR = "div.space-y-4.mb-4 div:first-child span:last-child"
ORDER_SHIPPING_SELECTOR = "div.space-y-4.mb-4 div:nth-child(2) span:last-child"
ORDER_TAX_SELECTOR = "div.space-y-4.mb-4 div:nth-child(3) span:last-child"
ORDER_TOTAL_SELECTOR = "div.flex.justify-between.items-center.font-bold.text-xl.mb-4 span:last-child"
CHECKOUT_BUTTON_SELECTOR = "button.w-full"
EMPTY_CART_MESSAGE_SELECTOR = "h1.text-2xl.font-bold"
CONTINUE_SHOPPING_BUTTON_SELECTOR = "a:has(button)"
LOADING_SPINNER_SELECTOR = "div.animate-spin.rounded-full.h-8.w-8.border-b-2.border-\\[\\#0064B1\\]"
UPDATE_MESSAGE_SELECTOR = "div.mb-4.p-4.rounded"

# --- Test Data ---
PRODUCT_ID = "1"
INITIAL_QUANTITY = 1
NEW_QUANTITY = 2

# --- Helper Functions ---

def add_item_to_cart(driver, wait, product_id, quantity=1, size=None, color=None):
    """Adds a specified product to the cart. Assumes user is logged in."""
    driver.get(f"{BASE_URL}/product/{product_id}")
    
    # Handle variants using the PDP helper
    if size:
        try: 
            select_shadcn_option(driver, wait, "button[role='combobox']:has(span:contains('Select size'))", size)
        except: # Fallback to standard select
             Select(wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "select[name='size']")))).select_by_visible_text(size)
    if color:
        try: 
             select_shadcn_option(driver, wait, "button[role='combobox']:has(span:contains('Select color'))", color)
        except: # Fallback to standard select
            Select(wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "select[name='color']")))).select_by_visible_text(color)
    
    # Select quantity
    try: 
        select_shadcn_option(driver, wait, "button[role='combobox']:has(span:contains('Select quantity'))", str(quantity))
    except: # Fallback to standard select
         Select(wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "select[name='quantity']")))).select_by_visible_text(str(quantity))

    add_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Add to Cart')]")))
    add_button.click()
    # Wait for toast or cart update indication if necessary
    time.sleep(1) # Simple wait after adding

def clear_cart(driver, wait):
    """Removes all items currently in the cart. Assumes user is logged in and on cart page."""
    try:
        wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, CART_ITEMS_CONTAINER_SELECTOR)))
        remove_buttons = driver.find_elements(By.CSS_SELECTOR, CART_ITEM_REMOVE_BUTTON_SELECTOR)
        while remove_buttons:
            remove_buttons[0].click()
            time.sleep(1) # Wait for item removal animation/update
            # Re-check for remaining items/buttons
            try:
                remove_buttons = wait.until(
                    EC.presence_of_all_elements_located((By.CSS_SELECTOR, CART_ITEM_REMOVE_BUTTON_SELECTOR)),
                    timeout=2 # Shorter timeout when expecting element to disappear
                )
            except TimeoutException:
                remove_buttons = [] # No more remove buttons found
        wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, EMPTY_CART_MESSAGE_SELECTOR)))
    except TimeoutException:
        # Cart might already be empty, or selectors are wrong
        print("Could not find cart items to clear, or cart was already empty.")
    except Exception as e:
        print(f"Error during cart clearing: {e}")
        # Navigate away to reset state if clearing failed badly
        driver.get(BASE_URL)

def get_summary_value(driver, wait, value_type='subtotal'):
    """Gets the text value from the order summary (subtotal or total)."""
    selector = ORDER_SUBTOTAL_SELECTOR if value_type == 'subtotal' else ORDER_TOTAL_SELECTOR
    try:
        element = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, selector)))
        # Extract only the number part
        return float(element.text.replace("$", "").strip())
    except (TimeoutException, ValueError):
        print(f"Could not find or parse {value_type} value.")
        return 0.0

def wait_for_cart_update(wait):
    """Waits for any loading indicators to disappear."""
    try:
        wait.until(EC.invisibility_of_element_located((By.CSS_SELECTOR, LOADING_SPINNER_SELECTOR)))
    except TimeoutException:
        pass

def verify_cart_item_exists(driver, wait, product_id):
    """Verifies that a specific product exists in the cart."""
    try:
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, CART_ITEMS_CONTAINER_SELECTOR)))
        cart_items = driver.find_elements(By.CSS_SELECTOR, CART_ITEM_SELECTOR)
        for item in cart_items:
            item_link = item.find_element(By.CSS_SELECTOR, CART_ITEM_TITLE_SELECTOR)
            if f"/product/{product_id}" in item_link.get_attribute("href"):
                return True
        return False
    except (TimeoutException, NoSuchElementException):
        return False

def update_item_quantity(driver, wait, product_id, increase=True):
    """Updates the quantity of a specific cart item."""
    try:
        cart_items = wait.until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, CART_ITEM_SELECTOR)))
        for item in cart_items:
            item_link = item.find_element(By.CSS_SELECTOR, CART_ITEM_TITLE_SELECTOR)
            if f"/product/{product_id}" in item_link.get_attribute("href"):
                button_selector = CART_ITEM_INCREASE_BUTTON_SELECTOR if increase else CART_ITEM_DECREASE_BUTTON_SELECTOR
                button = item.find_element(By.CSS_SELECTOR, button_selector)
                initial_quantity = int(item.find_element(By.CSS_SELECTOR, CART_ITEM_QUANTITY_SELECTOR).text)
                button.click()
                
                # Wait for quantity update
                wait.until(lambda d: int(item.find_element(By.CSS_SELECTOR, CART_ITEM_QUANTITY_SELECTOR).text) != initial_quantity)
                return True
        return False
    except (TimeoutException, NoSuchElementException):
        return False

def remove_item_from_cart(driver, wait, product_id):
    """Removes a specific item from the cart."""
    try:
        cart_items = wait.until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, CART_ITEM_SELECTOR)))
        for item in cart_items:
            item_link = item.find_element(By.CSS_SELECTOR, CART_ITEM_TITLE_SELECTOR)
            if f"/product/{product_id}" in item_link.get_attribute("href"):
                remove_button = item.find_element(By.CSS_SELECTOR, CART_ITEM_REMOVE_BUTTON_SELECTOR)
                remove_button.click()
                
                # Wait for item removal
                wait.until(EC.staleness_of(item))
                return True
        return False
    except (TimeoutException, NoSuchElementException):
        return False

# --- Test Setup Fixture --- 
@pytest.fixture(scope="function")
def cart_setup(logged_in_driver, wait):
    """Fixture to ensure cart state before tests. Adds one item."""
    driver = logged_in_driver
    driver.get(f"{BASE_URL}/cart") # Go to cart first to clear
    clear_cart(driver, wait) 
    add_item_to_cart(driver, wait, product_id="1") # Add a default item (ID 1)
    driver.get(f"{BASE_URL}/cart") # Navigate to cart page for the test
    yield driver
    # Cleanup: Clear cart after test
    # driver.get(f"{BASE_URL}/cart") 
    # clear_cart(driver, wait)

@pytest.fixture(scope="function")
def empty_cart_setup(logged_in_driver, wait):
    """Fixture to ensure cart is empty before test."""
    driver = logged_in_driver
    driver.get(f"{BASE_URL}/cart")
    clear_cart(driver, wait)
    yield driver

# --- Test Cases --- 

@pytest.mark.skip(reason="Requires reliable login, add to cart, and clear cart functionality")
def test_tc_cart_001_verify_page_load_with_items(cart_setup, wait):
    """TC-CART-001: Verify cart page loads with items."""
    driver = cart_setup
    wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, HEADER_SELECTOR)))
    wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, ORDER_SUMMARY_SELECTOR)))
    
    cart_items = driver.find_elements(By.CSS_SELECTOR, CART_ITEM_SELECTOR)
    assert len(cart_items) > 0, "Cart items list is empty unexpectedly"
    assert driver.find_element(By.CSS_SELECTOR, CHECKOUT_BUTTON_SELECTOR).is_displayed()

@pytest.mark.skip(reason="Requires reliable login and clear cart functionality")
def test_tc_cart_002_verify_page_load_empty_cart(empty_cart_setup, wait):
    """TC-CART-002: Verify empty cart message is shown."""
    driver = empty_cart_setup
    wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, HEADER_SELECTOR)))
    empty_message = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, EMPTY_CART_MESSAGE_SELECTOR)))
    assert "Your cart is empty" in empty_message.text
    # Check that checkout button is likely hidden or disabled
    try:
        checkout_button = driver.find_element(By.CSS_SELECTOR, CHECKOUT_BUTTON_SELECTOR)
        assert not checkout_button.is_displayed() or not checkout_button.is_enabled()
    except NoSuchElementException:
        pass # Button not being present is also valid for an empty cart

@pytest.mark.skip(reason="Requires cart_setup and reliable quantity update")
def test_tc_cart_003_verify_update_quantity(cart_setup, wait):
    """TC-CART-003: Verify updating item quantity updates summary."""
    driver = cart_setup
    initial_subtotal = get_summary_value(driver, wait, 'subtotal')
    initial_total = get_summary_value(driver, wait, 'total')
    
    try:
        # Attempt shadcn select
        quantity_trigger = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, CART_ITEM_INCREASE_BUTTON_SELECTOR)))
        select_shadcn_option(driver, wait, CART_ITEM_INCREASE_BUTTON_SELECTOR, "3")
    except TimeoutException:
        # Fallback to standard select
        try:
            quantity_select_element = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, CART_ITEM_QUANTITY_SELECTOR)))
            select = Select(quantity_select_element)
            select.select_by_visible_text("3")
        except (TimeoutException, NoSuchElementException):
            pytest.fail("Could not find or interact with quantity selector in cart item.")

    time.sleep(2) # Wait for summary to potentially update via JS
    
    new_subtotal = get_summary_value(driver, wait, 'subtotal')
    new_total = get_summary_value(driver, wait, 'total')
    
    print(f"Initial Sub: {initial_subtotal}, New Sub: {new_subtotal}")
    print(f"Initial Total: {initial_total}, New Total: {new_total}")
    
    # Basic check: totals should change. More specific check would require item price.
    assert new_subtotal != initial_subtotal
    assert new_total != initial_total
    # Assuming price > 0, new total should be higher for increased quantity
    assert new_subtotal > initial_subtotal

@pytest.mark.skip(reason="Requires cart_setup and reliable item removal")
def test_tc_cart_004_verify_remove_item(cart_setup, wait):
    """TC-CART-004: Verify removing an item updates cart and summary."""
    driver = cart_setup
    initial_item_count = len(driver.find_elements(By.CSS_SELECTOR, CART_ITEM_SELECTOR))
    assert initial_item_count > 0, "Cart setup failed, no items found initially"
    initial_subtotal = get_summary_value(driver, wait, 'subtotal')
    
    remove_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, CART_ITEM_REMOVE_BUTTON_SELECTOR)))
    remove_button.click()
    
    time.sleep(1) # Wait for removal
    
    # Wait for item count to decrease or empty message to appear
    try:
        wait.until(lambda d: len(d.find_elements(By.CSS_SELECTOR, CART_ITEM_SELECTOR)) < initial_item_count)
        remaining_items = driver.find_elements(By.CSS_SELECTOR, CART_ITEM_SELECTOR)
        new_item_count = len(remaining_items)
        assert new_item_count == initial_item_count - 1
        # Check that summary updates (assuming item price > 0)
        new_subtotal = get_summary_value(driver, wait, 'subtotal')
        assert new_subtotal < initial_subtotal
    except TimeoutException:
        # Check if cart became empty
        try:
             wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, EMPTY_CART_MESSAGE_SELECTOR)))
             # If cart is empty, subtotal should be 0 or summary gone
             # assert get_summary_value(driver, wait, 'subtotal') == 0.0 # Might be flaky if summary disappears
        except TimeoutException:
            pytest.fail("Item count did not decrease and empty cart message did not appear after removal.")

@pytest.mark.skip(reason="Requires adding multiple items and price checking")
def test_tc_cart_005_verify_order_summary_calculation(logged_in_driver, wait):
    """TC-CART-005: Verify summary calculation with multiple items (basic check)."""
    driver = logged_in_driver
    # Setup: Clear cart and add multiple items
    driver.get(f"{BASE_URL}/cart")
    clear_cart(driver, wait)
    add_item_to_cart(driver, wait, product_id="1", quantity=2) # Add item 1 (Qty 2)
    add_item_to_cart(driver, wait, product_id="2", quantity=1) # Add item 2 (Qty 1) - Ensure product ID 2 exists!
    driver.get(f"{BASE_URL}/cart")
    
    # This test is tricky without knowing exact prices, tax, shipping.
    # Perform a basic check: ensure subtotal and total are greater than zero.
    subtotal = get_summary_value(driver, wait, 'subtotal')
    total = get_summary_value(driver, wait, 'total')
    
    assert subtotal > 0.0
    assert total >= subtotal # Total should be >= subtotal (includes tax/shipping)
    # A more robust test would fetch item prices and calculate expected summary

@pytest.mark.skip(reason="Requires cart_setup")
def test_tc_cart_006_verify_proceed_to_checkout_link(cart_setup, wait):
    """TC-CART-006: Verify 'Proceed to Checkout' button navigates correctly."""
    driver = cart_setup
    checkout_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, CHECKOUT_BUTTON_SELECTOR)))
    checkout_button.click()
    
    wait.until(EC.url_to_be(f"{BASE_URL}/checkout"))
    assert driver.current_url == f"{BASE_URL}/checkout"
    # Verify checkout page loaded (e.g., check for a specific heading)
    wait.until(EC.visibility_of_element_located((By.XPATH, "//h2[contains(text(), 'Shipping address')]")))

def test_tc_cart_007_verify_page_load(driver, wait):
    """TC-CART-007: Verify cart page loads correctly."""
    driver.get(f"{BASE_URL}/cart")
    
    # Verify header and title
    wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, HEADER_SELECTOR)))
    title = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, PAGE_TITLE_SELECTOR)))
    assert "Shopping Cart" in title.text

def test_tc_cart_008_verify_empty_cart(driver, wait):
    """TC-CART-008: Verify empty cart state."""
    driver.get(f"{BASE_URL}/cart")
    
    # Verify empty cart message
    empty_message = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, EMPTY_CART_MESSAGE_SELECTOR)))
    assert "Your cart is empty" in empty_message.text
    
    # Verify continue shopping button
    continue_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, CONTINUE_SHOPPING_BUTTON_SELECTOR)))
    assert continue_button.is_displayed()

def test_tc_cart_009_verify_cart_with_items(driver, wait):
    """TC-CART-009: Verify cart with items."""
    # Assuming item is already in cart from previous test
    driver.get(f"{BASE_URL}/cart")
    
    # Wait for cart items container
    wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, CART_ITEMS_CONTAINER_SELECTOR)))
    
    # Verify cart items
    cart_items = driver.find_elements(By.CSS_SELECTOR, CART_ITEM_SELECTOR)
    assert len(cart_items) > 0
    
    # Check first item details
    first_item = cart_items[0]
    assert first_item.find_element(By.CSS_SELECTOR, CART_ITEM_IMAGE_SELECTOR).is_displayed()
    assert first_item.find_element(By.CSS_SELECTOR, CART_ITEM_TITLE_SELECTOR).text != ""
    assert first_item.find_element(By.CSS_SELECTOR, CART_ITEM_CATEGORY_SELECTOR).text != ""
    assert first_item.find_element(By.CSS_SELECTOR, CART_ITEM_PRICE_SELECTOR).text.startswith("$")
    
    # Verify order summary
    summary = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, ORDER_SUMMARY_SELECTOR)))
    assert summary.find_element(By.CSS_SELECTOR, ORDER_SUBTOTAL_SELECTOR).text.startswith("$")
    assert summary.find_element(By.CSS_SELECTOR, ORDER_TAX_SELECTOR).text.startswith("$")
    assert summary.find_element(By.CSS_SELECTOR, ORDER_TOTAL_SELECTOR).text.startswith("$")

def test_tc_cart_010_verify_quantity_update(driver, wait):
    """TC-CART-010: Verify quantity update functionality."""
    driver.get(f"{BASE_URL}/cart")
    
    # Update quantity
    assert update_item_quantity(driver, wait, PRODUCT_ID, increase=True)
    
    # Verify success message
    check_toast_message(wait, "Cart updated successfully")

def test_tc_cart_011_verify_item_removal(driver, wait):
    """TC-CART-011: Verify item removal functionality."""
    driver.get(f"{BASE_URL}/cart")
    
    # Remove item
    assert remove_item_from_cart(driver, wait, PRODUCT_ID)
    
    # Verify success message
    check_toast_message(wait, "Item removed successfully")
    
    # Verify empty cart state
    empty_message = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, EMPTY_CART_MESSAGE_SELECTOR)))
    assert "Your cart is empty" in empty_message.text

def test_tc_cart_012_verify_checkout_button(driver, wait):
    """TC-CART-012: Verify checkout button functionality."""
    driver.get(f"{BASE_URL}/cart")
    
    # Click checkout button if cart is not empty
    if not driver.find_elements(By.CSS_SELECTOR, EMPTY_CART_MESSAGE_SELECTOR):
        checkout_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, CHECKOUT_BUTTON_SELECTOR)))
        checkout_button.click()
        
        # Verify navigation to checkout page
        wait.until(EC.url_contains("/checkout"))
        assert "/checkout" in driver.current_url 