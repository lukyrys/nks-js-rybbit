# Events Reference

## Overview

The `@nks-hub/rybbit-ts` SDK provides a comprehensive set of typed event tracking methods that follow **GA4 naming conventions** using `snake_case`. Each event has a dedicated helper method with full TypeScript support for type safety and IDE autocomplete.

### Key Features

- **GA4-compatible**: All events follow Google Analytics 4 recommended event structure
- **Type-safe**: Full TypeScript definitions for parameters and return types
- **Flexible**: Send custom events alongside predefined ones
- **E-commerce ready**: Complete suite of e-commerce tracking methods

---

## Custom Events

Send any custom event with arbitrary properties using the base `event()` method.

**Signature:**
```typescript
event(eventName: string, properties?: Record<string, any>): void
```

**Example:**
```typescript
nksRybbit.event('my_custom_event', {
  category: 'engagement',
  label: 'hero_banner',
  value: 42
});
```

---

## E-commerce Events

Track the complete customer purchase journey from product views to transactions.

### trackViewItem

Track when a user views a product detail page.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `itemId` | `string` | Yes | Product SKU or unique identifier |
| `itemName` | `string` | Yes | Product name |
| `category` | `string` | No | Product category |
| `price` | `number` | No | Product price |

**Example:**
```typescript
nksRybbit.trackViewItem({
  itemId: 'SKU-123',
  itemName: 'Loreal Shampoo 500ml',
  category: 'hair-care',
  price: 299
});
```

---

### trackAddToCart

Track when an item is added to the shopping cart.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `itemId` | `string` | Yes | Product SKU or unique identifier |
| `itemName` | `string` | Yes | Product name |
| `price` | `number` | Yes | Product price |
| `quantity` | `number` | Yes | Quantity added |

**Example:**
```typescript
nksRybbit.trackAddToCart({
  itemId: 'SKU-123',
  itemName: 'Loreal Shampoo 500ml',
  price: 299,
  quantity: 2
});
```

---

### trackRemoveFromCart

Track when an item is removed from the shopping cart.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `itemId` | `string` | Yes | Product SKU or unique identifier |
| `itemName` | `string` | Yes | Product name |

**Example:**
```typescript
nksRybbit.trackRemoveFromCart({
  itemId: 'SKU-123',
  itemName: 'Loreal Shampoo 500ml'
});
```

---

### trackViewCart

Track when a user views their shopping cart.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `itemsCount` | `number` | Yes | Total number of items in cart |
| `value` | `number` | Yes | Total cart value |
| `currency` | `string` | No | Currency code (e.g., 'CZK', 'USD') |

**Example:**
```typescript
nksRybbit.trackViewCart({
  itemsCount: 3,
  value: 897,
  currency: 'CZK'
});
```

---

### trackBeginCheckout

Track when a user initiates the checkout process.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `value` | `number` | Yes | Total order value |
| `currency` | `string` | No | Currency code |
| `itemsCount` | `number` | No | Number of items |

**Example:**
```typescript
nksRybbit.trackBeginCheckout({
  value: 897,
  currency: 'CZK',
  itemsCount: 3
});
```

---

### trackPurchase

Track a completed purchase transaction. This is a key conversion event.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `transactionId` | `string` | Yes | Unique order ID |
| `value` | `number` | Yes | Total purchase value |
| `currency` | `string` | No | Currency code |
| `items` | `Array<Item>` | No | Array of purchased items |

**Example:**
```typescript
nksRybbit.trackPurchase({
  transactionId: 'ORD-2024-001',
  value: 897,
  currency: 'CZK',
  items: [
    { id: 'SKU-123', name: 'Loreal Shampoo', price: 299, quantity: 2 },
    { id: 'SKU-456', name: 'Hair Mask', price: 299, quantity: 1 }
  ]
});
```

---

### trackRefund

Track a refund for a previous purchase.

**Signature:**
```typescript
trackRefund(transactionId: string, value: number, currency?: string): void
```

**Example:**
```typescript
nksRybbit.trackRefund('ORD-2024-001', 897, 'CZK');
```

---

### trackAddToWishlist

Track when a user adds an item to their wishlist.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `itemId` | `string` | Yes | Product SKU or unique identifier |
| `itemName` | `string` | Yes | Product name |
| `price` | `number` | No | Product price |

**Example:**
```typescript
nksRybbit.trackAddToWishlist({
  itemId: 'SKU-123',
  itemName: 'Loreal Shampoo 500ml',
  price: 299
});
```

---

### trackViewPromotion

Track when a promotional banner or offer is viewed.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `promotionId` | `string` | Yes | Promotion unique identifier |
| `promotionName` | `string` | Yes | Promotion name |
| `location` | `string` | No | Where the promotion appears |

**Example:**
```typescript
nksRybbit.trackViewPromotion({
  promotionId: 'PROMO-SUMMER',
  promotionName: 'Summer Sale 2024',
  location: 'homepage_banner'
});
```

---

### trackSelectPromotion

Track when a user clicks on a promotion.

**Signature:**
```typescript
trackSelectPromotion(promotionId: string, promotionName: string): void
```

**Example:**
```typescript
nksRybbit.trackSelectPromotion('PROMO-SUMMER', 'Summer Sale 2024');
```

---

## User Events

Track user authentication and account management actions.

### trackLogin

Track successful user login.

**Signature:**
```typescript
trackLogin(method: string): void
```

**Example:**
```typescript
nksRybbit.trackLogin('email');
// or
nksRybbit.trackLogin('google');
```

---

### trackSignUp

Track new user registration.

**Signature:**
```typescript
trackSignUp(method: string): void
```

**Example:**
```typescript
nksRybbit.trackSignUp('email');
// or
nksRybbit.trackSignUp('facebook');
```

---

### trackLogout

Track user logout action.

**Signature:**
```typescript
trackLogout(): void
```

**Example:**
```typescript
nksRybbit.trackLogout();
```

---

## Engagement Events

Track user interactions and content engagement.

### trackSearch

Track site search queries and their results.

**Signature:**
```typescript
trackSearch(query: string, resultsCount?: number): void
```

**Example:**
```typescript
nksRybbit.trackSearch('loreal shampoo', 42);
```

---

### trackShare

Track when users share content via social media or other channels.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `method` | `string` | Yes | Share method (e.g., 'facebook', 'twitter') |
| `contentType` | `string` | No | Type of content shared |
| `itemId` | `string` | No | ID of shared item |

**Example:**
```typescript
nksRybbit.trackShare({
  method: 'facebook',
  contentType: 'product',
  itemId: 'SKU-123'
});
```

---

### trackClickCta

Track call-to-action button clicks.

**Signature:**
```typescript
trackClickCta(ctaName: string, location?: string): void
```

**Example:**
```typescript
nksRybbit.trackClickCta('buy_now', 'product_detail');
```

---

### trackVideoPlay

Track video playback events.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `videoId` | `string` | Yes | Video identifier |
| `videoTitle` | `string` | No | Video title |
| `duration` | `number` | No | Video duration in seconds |

**Example:**
```typescript
nksRybbit.trackVideoPlay({
  videoId: 'YT-abc123',
  videoTitle: 'Product demo',
  duration: 120
});
```

---

### trackScrollDepth

Track scroll depth milestones to measure content engagement.

**Signature:**
```typescript
trackScrollDepth(percentage: number, page?: string): void
```

**Common usage pattern:**
```typescript
// Track at 25%, 50%, 75%, and 100% scroll depth
nksRybbit.trackScrollDepth(25, '/blog/article-1');
nksRybbit.trackScrollDepth(50, '/blog/article-1');
nksRybbit.trackScrollDepth(75, '/blog/article-1');
nksRybbit.trackScrollDepth(100, '/blog/article-1');
```

---

## CMS Events

Track user-generated content and interactions with CMS features.

### trackComment

Track comment submissions on blog posts, products, or other content.

**Signature:**
```typescript
trackComment(contentId: string, contentTitle?: string): void
```

**Example:**
```typescript
nksRybbit.trackComment('page-42', 'How to choose hair color');
```

---

### trackRating

Track user ratings and reviews.

**Signature:**
```typescript
trackRating(rating: number, itemId: string, maxRating?: number): void
```

**Example:**
```typescript
nksRybbit.trackRating(4, 'SKU-123', 5);
```

---

## Lead Generation Events

Track lead capture and conversion funnel activities.

### trackGenerateLead

Track successful lead generation events.

**Signature:**
```typescript
trackGenerateLead(source: string, value?: number): void
```

**Example:**
```typescript
nksRybbit.trackGenerateLead('contact_page', 5000);
```

---

### trackContactForm

Track contact form submissions.

**Signature:**
```typescript
trackContactForm(formId: string, formName?: string): void
```

**Example:**
```typescript
nksRybbit.trackContactForm('footer-form', 'Quick Contact');
```

---

### trackNewsletter

Track newsletter subscription sign-ups.

**Signature:**
```typescript
trackNewsletter(location: string): void
```

**Example:**
```typescript
nksRybbit.trackNewsletter('footer_popup');
```

---

## Utility Events

General-purpose tracking methods for common web interactions.

### trackFileDownload

Track file download events.

**Signature:**
```typescript
trackFileDownload(fileName: string, fileType?: string): void
```

**Example:**
```typescript
nksRybbit.trackFileDownload('catalog-2024.pdf', 'pdf');
```

---

### pageview

Manually track a page view. This is typically handled automatically by the Rybbit tracking script, but can be useful for Single Page Applications (SPAs).

**Signature:**
```typescript
pageview(path: string): void
```

**Example:**
```typescript
nksRybbit.pageview('/products/category/hair-care');
```

**Note:** Only use this for SPA route changes. Standard page loads are tracked automatically.

---

### trackOutbound

Track clicks on outbound links to external websites.

**Signature:**
```typescript
trackOutbound(url: string, label?: string, target?: string): void
```

**Example:**
```typescript
nksRybbit.trackOutbound('https://external-site.com', 'Visit partner', '_blank');
```

---

### trackError

Track JavaScript errors and exceptions for debugging and monitoring.

**Signature:**
```typescript
trackError(error: Error, context?: Record<string, any>): void
```

**Example:**
```typescript
try {
  // risky operation
  processCheckout();
} catch (e) {
  nksRybbit.trackError(e as Error, {
    context: 'checkout_flow',
    step: 'payment_processing'
  });
}
```

---

## Best Practices

### Event Naming

- All events use `snake_case` following GA4 conventions
- Use descriptive names that clearly indicate the action
- Keep event names consistent across your application

### Parameter Usage

- Include all relevant parameters for comprehensive tracking
- Use consistent parameter names across similar events
- Avoid sending sensitive user data (passwords, credit card numbers, etc.)

### Performance

- Events are queued and sent asynchronously
- Multiple events can be tracked without blocking UI
- No need to wait for event completion before proceeding

### Testing

- Use browser DevTools Network tab to verify events are sent
- Check the Rybbit dashboard to confirm events are received
- Test events in development before deploying to production

---

## Next Steps

- [Getting Started](./getting-started.md)
- [GTM Bridge](./gtm-bridge.md)
- [API Reference](./api.md)
- [Examples](./examples.md)
