# UTAMarket Application Test Cases

## 1. Home Page ( `/` )

- **TC-HOME-001:** **Verify Page Load:**
  - **Action:** Navigate to the application's root URL.
  - **Expected:** The Home page loads successfully, displaying the Header, Footer, and Featured Products section.
- **TC-HOME-002:** **Verify Featured Products Display:**
  - **Action:** Observe the Featured Products section.
  - **Expected:** Multiple product cards are displayed. Each card shows a product image, name, category, price, and rating. Discount badges appear if applicable.
- **TC-HOME-003:** **Verify Featured Product Links:**
  - **Action:** Click on the image or title of a product in the Featured Products section.
  - **Expected:** The user is navigated to the correct Product Detail Page for the clicked item.
- **TC-HOME-004:** **Verify "View All Products" Link:**
  - **Action:** Click the "View All Products" button near the Featured Products section.
  - **Expected:** The user is navigated to the main Product Listings Page (`/listings`).
- **TC-HOME-005:** **Verify AI Recommendations (Logged In):**
  - **Action:** Log in and navigate to the Home page.
  - **Expected:** The "Recommended For You" section appears, displaying relevant product recommendations.
- **TC-HOME-006:** **Verify AI Recommendations (Logged Out):**
  - **Action:** Ensure the user is logged out and navigate to the Home page.
  - **Expected:** The "Recommended For You" section might not appear or shows generic recommendations, depending on implementation.

## 2. Product Detail Page ( `/product/[id]` )

- **TC-PDP-001:** **Verify Page Load:**
  - **Action:** Navigate directly to a valid product URL (e.g., `/product/123`).
  - **Expected:** The page loads displaying the Header, Footer, and details for the specified product, including name, images, description, price, rating, etc.
- **TC-PDP-002:** **Verify Image Selection:**
  - **Action:** If multiple thumbnail images are present, click on a thumbnail.
  - **Expected:** The main product image updates to display the selected thumbnail image.
- **TC-PDP-003:** **Verify Discount Display:**
  - **Action:** View a product that has a discount.
  - **Expected:** The dynamic price is shown prominently, the original price is shown with a line-through, and a discount badge (e.g., "15% OFF") is displayed.
- **TC-PDP-004:** **Verify Size Selection (If Applicable):**
  - **Action:** On a product with size options, select a size from the dropdown.
  - **Expected:** The selected size is indicated.
- **TC-PDP-005:** **Verify Color Selection (If Applicable):**
  - **Action:** On a product with color options, select a color from the dropdown.
  - **Expected:** The selected color is indicated.
- **TC-PDP-006:** **Verify Quantity Selection:**
  - **Action:** Select a quantity from the quantity dropdown.
  - **Expected:** The selected quantity is reflected.
- **TC-PDP-007:** **Verify Add to Cart (Success):**
  - **Action:** Select size/color (if required), select quantity, and click "Add to Cart".
  - **Expected:** A success message (toast) appears confirming the item was added. The cart icon in the header might update.
- **TC-PDP-008:** **Verify Add to Cart (Validation):**
  - **Action:** On a product requiring size/color, click "Add to Cart" without selecting them.
  - **Expected:** An error message (toast) appears prompting the user to select size/color. The item is not added to the cart.
- **TC-PDP-009:** **Verify Add to Cart (Not Logged In):**
  - **Action:** Ensure the user is logged out. Attempt to add an item to the cart.
  - **Expected:** The user is redirected to the Login page.
- **TC-PDP-010:** **Verify Add to Wishlist:**
  - **Action:** Click the Wishlist (heart) button.
  - **Expected:** The button indicates the item is added (e.g., filled heart). A success message might appear. Requires login.
- **TC-PDP-011:** **Verify Remove from Wishlist:**
  - **Action:** Click the Wishlist (heart) button on an item already in the wishlist.
  - **Expected:** The button indicates the item is removed (e.g., outlined heart). A success message might appear. Requires login.
- **TC-PDP-012:** **Verify Share Functionality:**
  - **Action:** Click the Share button.
  - **Expected:** If the browser supports the Web Share API, the native share dialog appears. Otherwise, a message indicates the link was copied to the clipboard.
- **TC-PDP-013:** **Verify Product Not Found:**
  - **Action:** Navigate to a URL with an invalid product ID (e.g., `/product/invalid`).
  - **Expected:** An error message is displayed indicating the product was not found.
- **TC-PDP-014:** **Verify AI Recommendations:**
  - **Action:** Scroll down the page.
  - **Expected:** A section with related/recommended products is displayed.

## 3. Product Listings Page ( `/listings` )

- **TC-PLP-001:** **Verify Page Load:**
  - **Action:** Navigate to the `/listings` URL.
  - **Expected:** The page loads displaying the Header, Footer, and a grid/list of products.
- **TC-PLP-002:** **Verify Product Card Display:**
  - **Action:** Observe the product cards.
  - **Expected:** Each card shows product image, name, category, price, rating, and discount (if applicable).
- **TC-PLP-003:** **Verify Filtering (Category - If Implemented):**
  - **Action:** Select a category filter.
  - **Expected:** The product grid updates to show only products from the selected category.
- **TC-PLP-004:** **Verify Sorting (Price - If Implemented):**
  - **Action:** Select a sorting option (e.g., "Price: Low to High").
  - **Expected:** The product grid reorders according to the selected sort criteria.
- **TC-PLP-005:** **Verify Pagination (If Implemented):**
  - **Action:** If pagination controls exist, navigate to the next page.
  - **Expected:** A new set of products is displayed.
- **TC-PLP-006:** **Verify Product Links:**
  - **Action:** Click on a product card.
  - **Expected:** The user is navigated to the correct Product Detail Page.

## 4. Cart Page ( `/cart` )

- **TC-CART-001:** **Verify Page Load (With Items):**
  - **Action:** Add one or more items to the cart and navigate to `/cart`.
  - **Expected:** The page loads displaying the Header, Footer, items in the cart (with image, name, price, quantity, size/color), and the order summary (subtotal, etc.).
- **TC-CART-002:** **Verify Page Load (Empty Cart):**
  - **Action:** Ensure the cart is empty and navigate to `/cart`.
  - **Expected:** A message indicating the cart is empty is displayed, possibly with a link to continue shopping.
- **TC-CART-003:** **Verify Update Quantity:**
  - **Action:** Change the quantity of an item in the cart using its dropdown/input.
  - **Expected:** The item's line total updates, and the order summary (subtotal, total) updates accordingly.
- **TC-CART-004:** **Verify Remove Item:**
  - **Action:** Click the "Remove" or trash icon for an item in the cart.
  - **Expected:** The item is removed from the cart list, and the order summary updates.
- **TC-CART-005:** **Verify Order Summary Calculation:**
  - **Action:** Add multiple items with different quantities.
  - **Expected:** The subtotal, tax (if applicable), shipping (if applicable), and total are calculated correctly based on the items in the cart.
- **TC-CART-006:** **Verify Proceed to Checkout Link:**
  - **Action:** Click the "Proceed to Checkout" button.
  - **Expected:** The user is navigated to the Checkout Page (`/checkout`).

## 5. Checkout Page ( `/checkout` )

- **TC-CHK-001:** **Verify Page Load (Logged In):**
  - **Action:** Log in, add items to cart, and navigate to `/checkout`.
  - **Expected:** The Checkout page loads displaying Header, Footer, shipping address form, payment details section, and order summary.
- **TC-CHK-002:** **Verify Redirect (Not Logged In):**
  - **Action:** Ensure the user is logged out, add items to cart, and attempt to navigate to `/checkout`.
  - **Expected:** The user is redirected to the Login page.
- **TC-CHK-003:** **Verify Order Summary Display:**
  - **Action:** Observe the order summary section.
  - **Expected:** Correct items, quantities, subtotal, shipping, tax, and total are displayed, matching the cart.
- **TC-CHK-004:** **Verify Apply Valid Coupon:**
  - **Action:** Enter a valid coupon code (e.g., "STUDENT") and click "Apply".
  - **Expected:** A discount amount is subtracted from the total, the discount description is shown, and the order summary updates.
- **TC-CHK-005:** **Verify Apply Invalid Coupon:**
  - **Action:** Enter an invalid coupon code and click "Apply".
  - **Expected:** An error message is displayed indicating the coupon is invalid. The total remains unchanged.
- **TC-CHK-006:** **Verify Remove Coupon:**
  - **Action:** After applying a valid coupon, click the "Remove" link/button for the coupon.
  - **Expected:** The discount is removed, and the order summary updates back to the pre-coupon total.
- **TC-CHK-007:** **Verify Shipping Address Form Validation:**
  - **Action:** Attempt to proceed without filling required shipping address fields.
  - **Expected:** Validation errors appear next to the required fields.
- **TC-CHK-008:** **Verify Payment Form Validation (Basic):**
  - **Action:** Attempt to place the order without filling required payment fields.
  - **Expected:** Validation errors appear (specific errors depend on payment integration).
- **TC-CHK-009:** **Verify Place Order (Mock/Success):**
  - **Action:** Fill in all required fields (shipping, payment) and click "Place Order".
  - **Expected:** (Assuming mock payment) The order is processed, and the user is redirected to an order confirmation page or shown a success message.

## 6. Login Page ( `/login` )

- **TC-LOG-001:** **Verify Page Load:**
  - **Action:** Navigate to `/login`.
  - **Expected:** The Login page loads displaying Header, Footer, email input, password input, and a login button.
- **TC-LOG-002:** **Verify Login Success:**
  - **Action:** Enter valid credentials and click "Login".
  - **Expected:** The user is logged in and redirected (e.g., to the home page or the page they were trying to access). The header might update to show user status.
- **TC-LOG-003:** **Verify Login Failure (Invalid Password):**
  - **Action:** Enter a valid email but an invalid password and click "Login".
  - **Expected:** An error message indicating invalid credentials is shown. The user remains on the login page.
- **TC-LOG-004:** **Verify Login Failure (Invalid Email):**
  - **Action:** Enter an email not registered in the system and click "Login".
  - **Expected:** An error message indicating invalid credentials or user not found is shown.
- **TC-LOG-005:** **Verify Input Validation (Empty Fields):**
  - **Action:** Click "Login" without entering email or password.
  - **Expected:** Validation errors appear for required fields.

## 7. Wishlist Page ( `/wishlist` )

- **TC-WISH-001:** **Verify Page Load (With Items):**
  - **Action:** Log in, add items to the wishlist, and navigate to `/wishlist`.
  - **Expected:** The page loads displaying the Header, Footer, and the items added to the wishlist (with image, name, price).
- **TC-WISH-002:** **Verify Page Load (Empty):**
  - **Action:** Log in, ensure the wishlist is empty, and navigate to `/wishlist`.
  - **Expected:** A message indicating the wishlist is empty is displayed.
- **TC-WISH-003:** **Verify Redirect (Not Logged In):**
  - **Action:** Ensure the user is logged out and attempt to navigate to `/wishlist`.
  - **Expected:** The user is redirected to the Login page.
- **TC-WISH-004:** **Verify Remove Item:**
  - **Action:** Click the Wishlist (heart/remove) button next to an item on the wishlist page.
  - **Expected:** The item is removed from the list.
- **TC-WISH-005:** **Verify Product Link:**
  - **Action:** Click on an item's image or title in the wishlist.
  - **Expected:** The user is navigated to the corresponding Product Detail Page.
