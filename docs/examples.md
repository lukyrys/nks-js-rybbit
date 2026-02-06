# Integration Examples

Full working examples for common @nks-hub/rybbit SDK integration scenarios. These examples demonstrate real-world implementations across different platforms and use cases.

---

## Table of Contents

1. [E-shop: Complete Purchase Funnel](#e-shop-complete-purchase-funnel)
2. [SPA Integration (React/Vue/Nette)](#spa-integration-reactvuenette)
3. [GTM Bridge: Forward dataLayer Events](#gtm-bridge-forward-datalayer-events)
4. [CMS: Blog and Article Tracking](#cms-blog-and-article-tracking)
5. [Lead Generation: Forms and Newsletter](#lead-generation-forms-and-newsletter)
6. [User Authentication Tracking](#user-authentication-tracking)
7. [Promotions and Wishlist](#promotions-and-wishlist)
8. [Video and Content Engagement](#video-and-content-engagement)
9. [PrestaShop Integration](#prestashop-integration)
10. [Error Tracking](#error-tracking)
11. [Event Listeners and Debug Mode](#event-listeners-and-debug-mode)

---

## E-shop: Complete Purchase Funnel

**Scenario:** Track the full customer journey from product view to purchase completion in a traditional e-commerce site.

**Key Events:** Product view, add/remove from cart, cart view, checkout initiation, purchase, refund

```html
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <title>E-shop Integration</title>

  <!-- Set user ID via meta tag (optional) -->
  <meta data-nks-user-id="user@example.com">

  <!-- Load Rybbit SDK -->
  <script src="https://cdn.example.com/nks-rybbit.iife.min.js"></script>
</head>
<body>
<script>
  var sdk = NksRybbit.default;

  // Initialize SDK
  sdk.boot({
    host: 'https://demo.rybbit.com',
    siteId: 'your-site-id',
    globalProperties: { site: 'my-eshop', env: 'production' }
  });

  // 1. Product detail page - track product view
  sdk.trackViewItem({
    itemId: 'SKU-123',
    itemName: 'Loreal Shampoo 500ml',
    category: 'hair-care',
    price: 299
  });

  // 2. Add to cart button click
  document.querySelector('.btn-add-to-cart').addEventListener('click', function () {
    sdk.trackAddToCart({
      itemId: 'SKU-123',
      itemName: 'Loreal Shampoo 500ml',
      price: 299,
      quantity: 1
    });
  });

  // 3. Remove from cart
  document.querySelector('.btn-remove').addEventListener('click', function () {
    sdk.trackRemoveFromCart({
      itemId: 'SKU-123',
      itemName: 'Loreal Shampoo 500ml'
    });
  });

  // 4. View cart page
  sdk.trackViewCart({
    itemsCount: 3,
    value: 897,
    currency: 'CZK'
  });

  // 5. Begin checkout process
  sdk.trackBeginCheckout({
    value: 897,
    currency: 'CZK',
    itemsCount: 3
  });

  // 6. Purchase complete (on thank-you page)
  sdk.trackPurchase({
    transactionId: 'ORD-2024-001',
    value: 897,
    currency: 'CZK',
    items: [
      { id: 'SKU-123', name: 'Loreal Shampoo', price: 299, quantity: 2 },
      { id: 'SKU-456', name: 'Hair Mask', price: 299, quantity: 1 }
    ]
  });

  // 7. Refund (admin-triggered or confirmation page)
  sdk.trackRefund('ORD-2024-001', 897, 'CZK');
</script>
</body>
</html>
```

---

## SPA Integration (React/Vue/Nette)

**Scenario:** Module-based integration for single-page applications with TypeScript support.

**Key Features:** Async boot, event queueing, type-safe tracking functions

```typescript
import nksRybbit from '@nks-hub/rybbit';

// Boot early - events are queued until ready
await nksRybbit.boot({
  host: 'https://demo.rybbit.com',
  siteId: 'your-site-id',
  debug: true
});

// --- Product listing page ---

function onProductClick(product: { id: string; name: string; price: number }) {
  nksRybbit.trackViewItem({
    itemId: product.id,
    itemName: product.name,
    price: product.price
  });
}

// --- Cart management ---

function addToCart(product: { id: string; name: string; price: number }, qty: number) {
  // Update cart state in your application
  // ...your cart logic...

  // Track the event
  nksRybbit.trackAddToCart({
    itemId: product.id,
    itemName: product.name,
    price: product.price,
    quantity: qty
  });
}

function removeFromCart(product: { id: string; name: string }) {
  // Update cart state
  // ...your cart logic...

  // Track removal
  nksRybbit.trackRemoveFromCart({
    itemId: product.id,
    itemName: product.name
  });
}

function viewCart(items: Array<{ price: number }>, currency: string) {
  // Calculate total value
  const total = items.reduce((sum, i) => sum + i.price, 0);

  nksRybbit.trackViewCart({
    itemsCount: items.length,
    value: total,
    currency
  });
}

// --- Checkout flow ---

function beginCheckout(total: number, itemCount: number) {
  nksRybbit.trackBeginCheckout({
    value: total,
    currency: 'CZK',
    itemsCount: itemCount
  });
}

function completePurchase(
  orderId: string,
  total: number,
  items: Array<{ id: string; name: string; price: number; quantity: number }>
) {
  nksRybbit.trackPurchase({
    transactionId: orderId,
    value: total,
    currency: 'CZK',
    items
  });
}
```

---

## GTM Bridge: Forward dataLayer Events

**Scenario:** Automatically forward Google Tag Manager dataLayer events to Rybbit SDK.

**Key Features:** Zero-code integration, selective event forwarding, backwards compatible with existing GTM setup

```html
<!DOCTYPE html>
<html>
<head>
  <!-- Google Tag Manager -->
  <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-XXXXX');</script>

  <!-- Rybbit SDK -->
  <script src="nks-rybbit.iife.min.js"></script>
</head>
<body>
<script>
  var sdk = NksRybbit.default;

  // Enable GTM bridge
  sdk.boot({
    host: 'https://demo.rybbit.com',
    siteId: 'your-site-id',
    gtmBridge: true,
    gtmEvents: ['purchase', 'add_to_cart', 'login', 'sign_up']
  });

  // Existing dataLayer pushes are automatically forwarded to Rybbit
  dataLayer.push({
    event: 'purchase',
    transaction_id: 'ORD-001',
    value: 1299,
    currency: 'CZK'
  });
  // Automatically becomes: rybbit.event('purchase', { transaction_id: 'ORD-001', value: 1299, currency: 'CZK' })

  dataLayer.push({
    event: 'add_to_cart',
    item_id: 'SKU-123',
    item_name: 'Product',
    price: 499
  });
  // Forwarded to Rybbit

  dataLayer.push({
    event: 'gtm.dom'
  });
  // Ignored (GTM internal event, not in gtmEvents list)
</script>
</body>
</html>
```

---

## CMS: Blog and Article Tracking

**Scenario:** Content engagement tracking for blogs, news sites, and content management systems.

**Key Events:** Search, scroll depth, comments, ratings, file downloads, outbound links

```typescript
import nksRybbit from '@nks-hub/rybbit';

await nksRybbit.boot({
  host: 'https://demo.rybbit.com',
  siteId: 'your-site-id'
});

// --- Search tracking ---

const searchInput = document.querySelector('#search');
searchInput?.addEventListener('submit', (e) => {
  const term = (e.target as HTMLFormElement).querySelector('input')?.value ?? '';
  const resultsCount = document.querySelectorAll('.search-result').length;
  nksRybbit.trackSearch(term, resultsCount);
});

// --- Scroll depth milestones ---

const milestones = new Set<number>();
window.addEventListener('scroll', () => {
  const scrollPercent = Math.round(
    (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
  );

  // Track 25%, 50%, 75%, 100% milestones
  for (const threshold of [25, 50, 75, 100]) {
    if (scrollPercent >= threshold && !milestones.has(threshold)) {
      milestones.add(threshold);
      nksRybbit.trackScrollDepth(threshold, window.location.pathname);
    }
  }
});

// --- Comment submission ---

document.querySelector('#comment-form')?.addEventListener('submit', () => {
  nksRybbit.trackComment(
    document.body.dataset.pageId,
    document.title
  );
});

// --- Product/Article rating ---

document.querySelectorAll('.star-rating').forEach((star) => {
  star.addEventListener('click', (e) => {
    const rating = Number((e.target as HTMLElement).dataset.value);
    nksRybbit.trackRating(rating, document.body.dataset.itemId, 5);
  });
});

// --- File downloads ---

document.querySelectorAll('a[download]').forEach((link) => {
  link.addEventListener('click', () => {
    const href = (link as HTMLAnchorElement).href;
    const filename = href.split('/').pop() ?? 'unknown';
    const ext = filename.split('.').pop();
    nksRybbit.trackFileDownload(filename, ext);
  });
});

// --- Outbound link tracking ---

document.querySelectorAll('a[href^="http"]').forEach((link) => {
  const a = link as HTMLAnchorElement;

  // Only track external links
  if (a.hostname !== window.location.hostname) {
    a.addEventListener('click', () => {
      nksRybbit.trackOutbound(a.href, a.textContent ?? '', a.target);
    });
  }
});
```

---

## Lead Generation: Forms and Newsletter

**Scenario:** Track lead generation activities including contact forms, newsletter signups, and CTA clicks.

**Key Events:** Contact form submission, newsletter signup, CTA clicks, lead generation

```html
<!DOCTYPE html>
<html>
<head>
  <script src="nks-rybbit.iife.min.js"></script>
</head>
<body>

<!-- Contact Form -->
<form id="contact-form">
  <input type="text" name="name" placeholder="Jméno" required>
  <input type="email" name="email" placeholder="E-mail" required>
  <textarea name="message" placeholder="Zpráva"></textarea>
  <button type="submit">Odeslat</button>
</form>

<!-- Newsletter Form -->
<form id="newsletter-form">
  <input type="email" name="email" placeholder="Váš e-mail">
  <button type="submit">Odebírat novinky</button>
</form>

<!-- CTA Buttons -->
<button data-cta="free-trial" data-location="hero">Start Free Trial</button>
<button data-cta="demo-request" data-location="pricing">Request Demo</button>

<script>
  var sdk = NksRybbit.default;

  sdk.boot({
    host: 'https://demo.rybbit.com',
    siteId: 'your-site-id'
  });

  // Contact form submission
  document.getElementById('contact-form').addEventListener('submit', function (e) {
    sdk.trackContactForm('main-contact', 'Kontaktní formulář');
    sdk.trackGenerateLead('contact_page');
  });

  // Newsletter signup
  document.getElementById('newsletter-form').addEventListener('submit', function (e) {
    sdk.trackNewsletter('footer_form');
  });

  // CTA button clicks
  document.querySelectorAll('[data-cta]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      sdk.trackClickCta(btn.dataset.cta, btn.dataset.location || 'unknown');
    });
  });
</script>
</body>
</html>
```

---

## User Authentication Tracking

**Scenario:** Track user authentication lifecycle including login, signup, and logout events.

**Key Features:** User identification, authentication method tracking, session management

```typescript
import nksRybbit from '@nks-hub/rybbit';

await nksRybbit.boot({
  host: 'https://demo.rybbit.com',
  siteId: 'your-site-id'
});

// --- Login tracking ---

function onLoginSuccess(user: { id: string; email: string }, method: string) {
  // Identify the user
  nksRybbit.identify(user.id, { email: user.email });

  // Track login event with method (email, google, facebook, etc.)
  nksRybbit.trackLogin(method);
}

// --- Registration tracking ---

function onSignUpSuccess(user: { id: string }, method: string) {
  // Identify new user
  nksRybbit.identify(user.id);

  // Track signup event
  nksRybbit.trackSignUp(method);
}

// --- Logout tracking ---

function onLogout() {
  // Track logout event
  nksRybbit.trackLogout();

  // Clear user session
  nksRybbit.clearUserId();
}
```

---

## Promotions and Wishlist

**Scenario:** Track promotional campaign performance and wishlist interactions.

**Key Events:** Promotion impressions, promotion clicks, wishlist additions

```typescript
import nksRybbit from '@nks-hub/rybbit';

// --- Promotion tracking ---

function onPromotionVisible(promo: { id: string; name: string; slot: string }) {
  // Track when promotion banner becomes visible
  nksRybbit.trackViewPromotion({
    promotionId: promo.id,
    promotionName: promo.name,
    location: promo.slot
  });
}

function onPromotionClick(promo: { id: string; name: string }) {
  // Track promotion click-through
  nksRybbit.trackSelectPromotion(promo.id, promo.name);
}

// --- Wishlist tracking ---

function onAddToWishlist(product: { id: string; name: string; price: number }) {
  // Track when user adds item to wishlist
  nksRybbit.trackAddToWishlist({
    itemId: product.id,
    itemName: product.name,
    price: product.price
  });
}
```

---

## Video and Content Engagement

**Scenario:** Track video playback and social sharing interactions.

**Key Events:** Video play, social media sharing

```typescript
import nksRybbit from '@nks-hub/rybbit';

// --- Video tracking ---

document.querySelectorAll('video').forEach((video) => {
  video.addEventListener('play', () => {
    nksRybbit.trackVideoPlay({
      videoId: video.dataset.id ?? video.src,
      videoTitle: video.dataset.title ?? 'Unknown',
      duration: Math.round(video.duration)
    });
  });
});

// --- Social sharing tracking ---

document.querySelectorAll('.share-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const el = btn as HTMLElement;

    nksRybbit.trackShare({
      method: el.dataset.method,      // 'facebook', 'twitter', 'email'
      contentType: el.dataset.type,    // 'product', 'article'
      itemId: el.dataset.itemId
    });
  });
});
```

---

## PrestaShop Integration

**Scenario:** Server-rendered e-commerce integration for PrestaShop or similar PHP-based platforms.

**Key Features:** Template variable integration, server-side user identification, order tracking

```html
<!-- In theme header (header.tpl / head section) -->
<meta data-nks-user-id="{if $customer->isLogged()}{$customer->email}{/if}">
<script src="/themes/your-theme/assets/nks-rybbit.iife.min.js"></script>
<script>
  var sdk = NksRybbit.default;
  sdk.boot({
    host: 'https://demo.rybbit.com',
    siteId: 'your-site-id',
    globalProperties: { site: 'my-prestashop' }
  });
</script>

<!-- Product detail page (product.tpl) -->
<script>
  NksRybbit.default.trackViewItem({
    itemId: '{$product->reference}',
    itemName: '{$product->name|escape:"javascript"}',
    category: '{$product->category|escape:"javascript"}',
    price: {$product->price}
  });
</script>

<!-- Order confirmation page (order-confirmation.tpl) -->
<script>
  NksRybbit.default.trackPurchase({
    transactionId: '{$order->reference}',
    value: {$order->total_paid},
    currency: '{$currency->iso_code}',
    items: [
      {foreach $order->getProducts() as $item}
      {
        id: '{$item.reference}',
        name: '{$item.product_name|escape:"javascript"}',
        price: {$item.unit_price_tax_incl},
        quantity: {$item.product_quantity}
      },
      {/foreach}
    ]
  });
</script>
```

---

## Error Tracking

**Scenario:** Capture and track client-side errors for debugging and monitoring.

**Key Features:** Global error handler, unhandled promise rejections, try-catch integration

```typescript
import nksRybbit from '@nks-hub/rybbit';

// --- Global error handler ---

window.addEventListener('error', (event) => {
  nksRybbit.trackError(event, { context: 'global' });
});

// --- Promise rejection handler ---

window.addEventListener('unhandledrejection', (event) => {
  const error = event.reason instanceof Error
    ? event.reason
    : new Error(String(event.reason));
  nksRybbit.trackError(error, { context: 'unhandled_promise' });
});

// --- Try-catch in critical code ---

async function loadCheckout() {
  try {
    const response = await fetch('/api/checkout');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (e) {
    // Track error with context
    nksRybbit.trackError(e as Error, { context: 'checkout_load' });
    throw e;
  }
}
```

---

## Event Listeners and Debug Mode

**Scenario:** Development and debugging setup with event listeners and monitoring.

**Key Features:** Debug mode, dry run, event listeners, state inspection, cleanup handlers

```typescript
import nksRybbit from '@nks-hub/rybbit';

// Boot with debug options
await nksRybbit.boot({
  host: 'https://demo.rybbit.com',
  siteId: 'your-site-id',
  debug: true,   // Logs all SDK activity to console
  dryRun: true   // Events are logged but NOT sent to server (development only)
});

// --- Event listeners ---

// Listen to all events
const unsub = nksRybbit.onEvent((name, properties) => {
  console.log('Event:', name, properties);
});

// Listen to SPA page changes
nksRybbit.onPageChange((path, previousPath) => {
  console.log(`Navigation: ${previousPath} -> ${path}`);
});

// --- Readiness check ---

nksRybbit.onReady(() => {
  console.log('SDK ready, state:', nksRybbit.getState());
  console.log('User ID:', nksRybbit.getUserId());
});

// --- Cleanup ---

// Cleanup on app unmount (important for SPAs)
function cleanup() {
  unsub();
  nksRybbit.destroy();
}
```

---

## Additional Resources

- [Getting Started](./getting-started.md) - Installation and configuration
- [Events Reference](./events.md) - Complete catalog of typed events
- [API Reference](./api.md) - Full SDK API documentation
- [GTM Bridge](./gtm-bridge.md) - Google Tag Manager integration
