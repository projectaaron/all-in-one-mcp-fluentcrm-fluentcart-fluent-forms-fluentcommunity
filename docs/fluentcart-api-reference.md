# FluentCart Plugin Development Reference
> Comprehensive scaffolding guide for building FluentCart plugins and extensions.
> Source: https://dev.fluentcart.com — All sections derived from official developer documentation.
---
## Table of Contents
1. [Overview & Architecture](#overview--architecture)
2. [Directory Structure](#directory-structure)
3. [Development Environment](#development-environment)
4. [Database Schema](#database-schema)
5. [Status Definitions](#status-definitions)
6. [Database Models](#database-models)
7. [Model Relationships](#model-relationships)
8. [Query Builder](#query-builder)
9. [Action Hooks](#action-hooks)
10. [Filter Hooks](#filter-hooks)
11. [REST API](#rest-api)
12. [Payment Gateway Integration](#payment-gateway-integration)
13. [Custom Product Selling](#custom-product-selling)
14. [Plugin Boilerplate](#plugin-boilerplate)
---
## Overview & Architecture
FluentCart is a self-hosted e-commerce plugin for WordPress. It uses custom database tables (prefixed `fct_`), an Eloquent-compatible ORM, 315+ action/filter hooks, a full REST API, and a modular architecture (Vue.js admin + React Gutenberg blocks on the frontend).
### Core Concepts
- **Products** are stored as WordPress custom post type `fluent-products` in the `posts` table, with additional data in `fct_product_details` and `fct_product_variations`.
- **Orders** (`fct_orders`) are the central hub — linking to items, transactions, customers, and metadata.
- **Customers** (`fct_customers`) integrate with WordPress users and maintain purchase history/LTV.
- **Transactions** (`fct_order_transactions`) track all payment records and refunds.
- **Subscriptions** (`fct_subscriptions`) handle recurring billing workflows.
- **All monetary values** are stored as `BIGINT` in **cents** to avoid floating-point issues. Use `Helper::toCent()` and `Helper::toDecimalWithoutComma()` for conversion.
### Versions
- **FluentCart Core (Free):** Products, orders, customers, payments, shipping, coupons, hooks, REST API.
- **FluentCart Pro (Premium):** Licensing system, order bumps, roles/permissions, advanced analytics, subscriptions, advanced integrations, custom modules.
---
## Directory Structure
```
fluent-cart/
├── app/                          # Core application logic
│   ├── Hooks/                    # WordPress action/filter handlers
│   │   ├── Handlers/             # Hook handler classes
│   │   ├── actions.php           # Action hook definitions
│   │   └── filters.php           # Filter hook definitions
│   ├── Http/                     # Request handling and routing
│   │   ├── Controllers/          # API and admin controllers
│   │   ├── Middleware/            # Request middleware
│   │   └── Routes/               # API route definitions
│   ├── Models/                   # Database models (45 files)
│   │   ├── Order.php
│   │   ├── Customer.php
│   │   ├── Product.php
│   │   └── ...
│   ├── Services/                 # Business logic
│   │   ├── Payment/              # Payment processing services
│   │   ├── Shipping/             # Shipping calculation services
│   │   └── Helper.php            # Core helper utilities
│   ├── Views/                    # PHP template files
│   ├── Events/                   # Event system
│   ├── Listeners/                # Event listeners
│   └── Modules/                  # Module system
├── api/                          # REST API endpoints
│   ├── Orders.php
│   ├── Customers.php
│   ├── Products.php
│   ├── Resource/                 # API resource classes
│   └── ...
├── resources/                    # Frontend assets
│   ├── admin/                    # Admin UI (Vue.js) + Gutenberg blocks (React)
│   │   ├── Components/
│   │   ├── Modules/
│   │   └── BlockEditor/
│   ├── public/                   # Public-facing (cart, checkout, customer-profile)
│   ├── styles/                   # SCSS
│   └── images/
├── boot/                         # Plugin initialization
├── config/                       # Configuration files
├── database/                     # Migrations and schema
│   ├── Migrations/               # 34 migration files
│   ├── Seeder/
│   └── DBMigrator.php
├── dev/                          # Development tools
│   ├── cli/
│   ├── test/
│   └── factories/
└── fluent-cart.php               # Plugin entry point
```
---
## Development Environment
### Prerequisites
- WordPress 5.0+
- PHP 7.4+
- MySQL 5.6+ (InnoDB)
### Tools
- Code Editor: VS Code, PhpStorm
- Local Environment: Laravel Herd, XAMPP, WAMP, Docker
- API Testing: Postman or Insomnia
---
## Database Schema
FluentCart uses 30+ custom tables. All monetary values are stored as `BIGINT` in cents.
### Core Tables
#### `fct_customers`
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT UNSIGNED AI | Primary key |
| user_id | BIGINT UNSIGNED NULL | WordPress user ID |
| email | VARCHAR(192) | Customer email |
| first_name | VARCHAR(192) | First name |
| last_name | VARCHAR(192) | Last name |
| status | VARCHAR(45) | active, inactive, archived |
| purchase_value | JSON NULL | Purchase value data |
| purchase_count | BIGINT UNSIGNED | Total purchases |
| ltv | BIGINT | Lifetime value in cents |
| uuid | VARCHAR(100) | Unique identifier |
| country, city, state, postcode | VARCHAR(45) | Address fields |
| created_at, updated_at | DATETIME | Timestamps |
**Indexes:** email, user_id
#### `fct_orders`
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT UNSIGNED AI | Primary key |
| status | VARCHAR(20) | draft/pending/on-hold/processing/completed/failed/refunded/partial-refund |
| parent_id | BIGINT UNSIGNED NULL | Parent order |
| fulfillment_type | VARCHAR(20) | physical, digital, service, mixed |
| type | VARCHAR(20) | payment, renewal, refund |
| mode | ENUM('live','test') | live/test |
| shipping_status | VARCHAR(20) | unshipped/shipped/delivered/unshippable |
| customer_id | BIGINT UNSIGNED | FK to customers |
| payment_method | VARCHAR(100) | Payment gateway slug |
| payment_status | VARCHAR(20) | Payment status |
| currency | VARCHAR(10) | Currency code |
| subtotal | BIGINT | In cents |
| discount_tax | BIGINT | In cents |
| coupon_discount_total | BIGINT | In cents |
| shipping_total | BIGINT | In cents |
| tax_total | BIGINT | In cents |
| total_amount | BIGINT | In cents |
| total_paid | BIGINT | In cents |
| total_refund | BIGINT | In cents |
| rate | DECIMAL(12,4) | Exchange rate |
| tax_behavior | TINYINT(1) | 0=no_tax, 1=exclusive, 2=inclusive |
| uuid | VARCHAR(100) | Public identifier |
| config | JSON | Order configuration |
| created_at, updated_at | DATETIME | Timestamps |
**Indexes:** invoice_no, type, customer_id, (created_at, completed_at)
#### `fct_order_items`
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT UNSIGNED AI | Primary key |
| order_id | BIGINT UNSIGNED | FK to orders |
| post_id | BIGINT UNSIGNED | WordPress product post ID |
| fulfillment_type | VARCHAR(20) | physical, digital, service |
| payment_type | VARCHAR(20) | onetime, subscription, signup_fee |
| object_id | BIGINT UNSIGNED | Variation ID |
| quantity | INT | Item quantity |
| unit_price | BIGINT | Price per unit in cents |
| subtotal | BIGINT | Line subtotal |
| tax_amount | BIGINT | Tax for this line |
| line_total | BIGINT | Total line amount |
| refund_total | BIGINT | Refunded amount |
| other_info | JSON | Additional item data |
| line_meta | JSON | Line-specific metadata |
**Indexes:** (order_id, object_id), post_id
#### `fct_order_transactions`
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT UNSIGNED AI | Primary key |
| order_id | BIGINT UNSIGNED | FK to orders |
| transaction_type | VARCHAR(192) | charge, refund |
| subscription_id | INT NULL | FK to subscriptions |
| card_last_4 | INT(4) | Last 4 digits |
| card_brand | VARCHAR(100) | Card brand |
| vendor_charge_id | VARCHAR(192) | Gateway transaction ID |
| payment_method | VARCHAR(100) | Payment method slug |
| payment_mode | VARCHAR(100) | live, test |
| status | VARCHAR(20) | Transaction status |
| currency | VARCHAR(10) | Currency code |
| total | BIGINT | Amount in cents |
| meta | JSON | Transaction metadata |
**Indexes:** vendor_charge_id, payment_method, status, order_id
#### `fct_subscriptions`
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT UNSIGNED AI | Primary key |
| uuid | VARCHAR(100) | Unique identifier |
| customer_id | BIGINT UNSIGNED | FK to customers |
| parent_order_id | BIGINT UNSIGNED | Initial order ID |
| product_id | BIGINT UNSIGNED | WordPress post ID |
| variation_id | BIGINT UNSIGNED | Product variation ID |
| billing_interval | VARCHAR(45) | day, week, month, year |
| signup_fee | BIGINT UNSIGNED | Signup fee in cents |
| recurring_amount | BIGINT UNSIGNED | Recurring amount in cents |
| recurring_total | BIGINT UNSIGNED | Total recurring in cents |
| bill_times | BIGINT UNSIGNED | Total billing cycles |
| bill_count | INT UNSIGNED | Current billing count |
| trial_days | INT UNSIGNED | Trial period in days |
| next_billing_date | DATETIME | Next billing date |
| status | VARCHAR(45) | active, canceled, expired, pending, trialing |
| vendor_subscription_id | VARCHAR(45) | Gateway subscription ID |
| current_payment_method | VARCHAR(45) | Current payment method |
| config | JSON | Subscription config |
#### `fct_product_variations`
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT UNSIGNED AI | Primary key |
| post_id | BIGINT UNSIGNED | WordPress post ID |
| variation_title | VARCHAR(192) | Variation title |
| variation_identifier | VARCHAR(100) | SKU |
| payment_type | VARCHAR(50) | onetime, subscription |
| stock_status | VARCHAR(30) | in-stock, out-of-stock, backorder |
| total_stock | INT | Total stock |
| available | INT | Available stock |
| fulfillment_type | VARCHAR(100) | physical, digital, service, mixed |
| item_price | DOUBLE | Variation price |
| item_cost | DOUBLE | Variation cost |
| compare_price | DOUBLE | Compare at price |
| item_status | VARCHAR(30) | active, inactive |
#### `fct_product_details`
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT UNSIGNED AI | Primary key |
| post_id | BIGINT UNSIGNED | WordPress post ID |
| fulfillment_type | VARCHAR(100) | physical, digital, service, mixed |
| min_price, max_price | DOUBLE | Price range |
| default_variation_id | BIGINT UNSIGNED | Default variation |
| variation_type | VARCHAR(30) | simple, simple_variation, advance_variation |
| stock_availability | VARCHAR(100) | in-stock, out-of-stock, backorder |
| other_info | JSON | Additional product data |
### Other Tables
| Table | Purpose |
|-------|---------|
| `fct_coupons` | Coupon definitions and rules |
| `fct_applied_coupons` | Coupons applied to orders |
| `fct_customer_addresses` | Customer billing/shipping addresses |
| `fct_customer_meta` | Customer metadata |
| `fct_order_addresses` | Order billing/shipping addresses |
| `fct_order_operations` | Order operation logs + UTM tracking |
| `fct_order_download_permissions` | Download permissions per order |
| `fct_order_meta` | Order metadata |
| `fct_order_tax_rate` | Order tax rate info |
| `fct_product_downloads` | Downloadable product files |
| `fct_product_meta` | Product metadata |
| `fct_subscription_meta` | Subscription metadata |
| `fct_carts` | Shopping cart persistence (cart_hash, checkout_data, stage) |
| `fct_activity` | System activity/audit logs |
| `fct_scheduled_actions` | Background job scheduling |
| `fct_shipping_zones` | Shipping zone configuration |
| `fct_shipping_methods` | Shipping methods within zones |
| `fct_shipping_classes` | Shipping classes |
| `fct_tax_classes` | Tax class definitions |
| `fct_tax_rates` | Tax rate configurations |
| `fct_meta` | Generic metadata for any object |
| `fct_label` | Labels for tagging objects |
| `fct_label_relationships` | Polymorphic label-to-object relationships |
| `fct_atts_groups` | Attribute groups (Color, Size) |
| `fct_atts_terms` | Attribute terms within groups |
| `fct_atts_relations` | Attribute-to-object relationships |
| `fct_webhook_logger` | Webhook delivery logs |
### Pro-Only Tables
| Table | Purpose |
|-------|---------|
| `fct_licenses` | Software license management |
| `fct_license_activations` | License activation tracking |
| `fct_license_sites` | Licensed site management |
| `fct_license_meta` | License metadata |
| `fct_order_promotions` | Order promotion data |
| `fct_order_promotion_stats` | Promotion statistics |
---
## Status Definitions
All valid status values for FluentCart entities. Use these exact strings when reading or updating statuses via the API.

### Product Status
These statuses describe the visibility of products (WordPress post status).

| Status | Description |
|--------|-------------|
| `publish` | The product is live and visible. |
| `draft` | The product is a saved draft. |
| `private` | The product is live but only visible to specific users. |
| `future` | The product is scheduled to be published at a future date. |
| `trash` | The product has been moved to the trash and is not visible. |

### Order Status
Order statuses track an order from placement through fulfillment.

| Status | Description |
|--------|-------------|
| `processing` | The order is being processed. |
| `completed` | The order has been fulfilled. |
| `on-hold` | The order is awaiting payment or action. |
| `canceled` | The order has been canceled. |
| `failed` | The order could not be processed, usually due to a failed payment. |

### Payment Status
These statuses show the state of a payment on an order.

| Status | Description |
|--------|-------------|
| `pending` | Payment has been initiated but not completed. |
| `paid` | The payment has been successfully received. |
| `partially_paid` | A partial payment has been received. |
| `failed` | The payment attempt was unsuccessful. |
| `refunded` | The full payment has been returned to the customer. |
| `partially_refunded` | A portion of the payment has been refunded. |
| `authorized` | The payment has been approved by the provider but not yet charged (captured). |

### Shipping Status
These statuses track the shipping/fulfillment state of an order. Stored in the `shipping_status` column on `fct_orders`.

| Status | Description |
|--------|-------------|
| `unshipped` | The order has not been shipped yet. |
| `shipped` | The order has been shipped to the customer. |
| `delivered` | The order has been delivered. |
| `unshippable` | The order does not require shipping (e.g., digital products). |

### Transaction Status
These statuses apply to individual transaction records in `fct_order_transactions`.

| Status | Description |
|--------|-------------|
| `succeeded` | The transaction was successful. |
| `pending` | The transaction is in process. |
| `refunded` | The transaction has been refunded. |
| `failed` | The transaction failed. |
| `dispute_lost` | A payment dispute was opened and lost. |

### Transaction Types
These describe the nature of a transaction record.

| Type | Description |
|------|-------------|
| `charge` | A standard payment from a customer. |
| `refund` | A payment returned to a customer. |
| `dispute` | A transaction related to a payment dispute. |

### Updating Statuses via REST API
The `PUT /orders/{order}/statuses` endpoint expects a `statuses` wrapper containing one or more status fields:

```php
// Request body format
[
    'statuses' => [
        'status'          => 'completed',       // Order status
        'payment_status'  => 'paid',            // Payment status
        'shipping_status' => 'shipped',         // Shipping status
    ]
]
```

You can include any subset of status fields — only the provided fields will be updated. For example, to update only the shipping status:

```php
[
    'statuses' => [
        'shipping_status' => 'shipped',
    ]
]
```

---
## Database Models
All models are at `FluentCart\\App\\Models\\` (core) and `FluentCartPro\\App\\Models\\` (pro). The ORM is Eloquent-compatible.
### Core Models List
**Order Models:** Order, OrderItem, OrderTransaction, OrderAddress, OrderMeta, OrderOperation, OrderTaxRate, OrderDownloadPermission
**Customer Models:** Customer, CustomerAddresses, CustomerMeta
**Product Models:** Product, ProductDetail, ProductVariation, ProductMeta, ProductDownload
**Subscription Models:** Subscription, SubscriptionMeta
**Cart & Coupon Models:** Cart, Coupon, AppliedCoupon
**System Models:** Activity, ScheduledAction, Meta, User, DynamicModel
**Attribute System:** AttributeGroup, AttributeTerm, AttributeRelation
**Shipping & Tax:** ShippingZone, ShippingMethod, ShippingClass, TaxClass, TaxRate
**Label System:** Label, LabelRelationship
**Pro Licensing:** License, LicenseActivation, LicenseSite, LicenseMeta
**Pro Promotional:** OrderPromotion, OrderPromotionStat
### Basic Model Usage
```php
use FluentCart\\App\\Models\\Order;
// Retrieve all
$orders = Order::all();
// Query with constraints
$orders = Order::where('status', 'completed')
    ->orderBy('created_at', 'DESC')
    ->limit(10)
    ->get();
// Find by ID
$order = Order::find(1);
// First matching
$order = Order::where('status', 'pending')->first();
// Aggregates
$count = Order::where('status', 'completed')->count();
$max = Order::where('status', 'completed')->max('total_amount');
// Create
$order = Order::create([
    'customer_id' => 1,
    'status' => 'pending',
    'payment_method' => 'stripe',
    'currency' => 'USD',
    'total_amount' => Helper::toCent(99.99)
]);
// Update
$order = Order::find(1);
$order->update([
    'status' => 'completed',
    'completed_at' => now()
]);
// Delete
$order = Order::find(1);
$order->delete();
// Query Scopes (defined per model)
$orders = Order::ofStatus('completed')->get();
```
### Direct Query Builder
```php
use FluentCart\\App\\Models\\Order;
// Use fluentCartDb() helper for raw query builder
$orders = fluentCartDb()->table('fct_orders')
    ->where('payment_status', 'paid')
    ->whereBetween('created_at', ['2024-01-01', '2024-12-31'])
    ->orderBy('created_at', 'ASC')
    ->get();
// Joins
$orders = fluentCartDb()->table('fct_orders')
    ->join('fct_customers', 'fct_orders.customer_id', '=', 'fct_customers.id')
    ->select('fct_orders.*', 'fct_customers.email')
    ->get();
// Aggregates
$stats = fluentCartDb()->table('fct_customers')
    ->leftJoin('fct_orders', 'fct_customers.id', '=', 'fct_orders.customer_id')
    ->select([
        'fct_customers.id',
        fluentCartDb()->raw('COUNT(fct_orders.id) as order_count'),
        fluentCartDb()->raw('SUM(fct_orders.total_amount) as total_spent'),
    ])
    ->where('fct_orders.payment_status', 'paid')
    ->groupBy('fct_customers.id')
    ->get();
// Conditional clauses
$orders = Order::query()
    ->when($customerId, function ($query) use ($customerId) {
        return $query->where('customer_id', $customerId);
    })
    ->get();
// Chunking for large datasets
fluentCartDb()->table('fct_orders')->orderBy('id')->chunk(100, function ($orders) {
    foreach ($orders as $order) { /* process */ }
});
```
---
## Model Relationships
### Order Relationships
| Relationship | Type | Related Model | Foreign Key |
|-------------|------|---------------|-------------|
| customer | belongsTo | Customer | customer_id |
| items | hasMany | OrderItem | order_id |
| transactions | hasMany | OrderTransaction | order_id |
| meta | hasMany | OrderMeta | order_id |
| subscription | belongsTo | Subscription | subscription_id |
### Customer Relationships
| Relationship | Type | Related Model | Foreign Key |
|-------------|------|---------------|-------------|
| orders | hasMany | Order | customer_id |
| subscriptions | hasMany | Subscription | customer_id |
| activities | hasMany | Activity | customer_id |
| carts | hasMany | Cart | customer_id |
| licenses | hasMany | License | customer_id |
### Product Relationships
| Relationship | Type | Related Model | Foreign Key |
|-------------|------|---------------|-------------|
| variations | hasMany | ProductVariation | product_id |
| orderItems | hasMany | OrderItem | post_id |
| licenses | hasMany | License | product_id |
| categories | belongsToMany | Category | post_id |
### Subscription Relationships
| Relationship | Type | Related Model | Foreign Key |
|-------------|------|---------------|-------------|
| customer | belongsTo | Customer | customer_id |
| orders | hasMany | Order | subscription_id |
| transactions | hasMany | OrderTransaction | subscription_id |
| licenses | hasMany | License | subscription_id |
### Eager Loading (Prevent N+1)
```php
// Good - eager loading
$orders = Order::with(['customer', 'items', 'transactions'])->get();
$customers = Customer::with(['orders', 'subscriptions'])->get();
// Selective columns
$orders = Order::with(['customer:id,name,email'])->get();
// Constrained eager loading
$customers = Customer::with(['subscriptions' => function($query) {
    $query->where('status', 'active');
}])->get();
// Querying through relationships
$orders = Order::whereHas('customer', function($query) {
    $query->where('email', 'customer@example.com');
})->get();
// Counting relationships
$customers = Customer::withCount('orders')->get();
```
---
## Action Hooks
Action hooks fire at specific points in FluentCart's execution flow. Use `add_action()` to attach custom code.
### Order Lifecycle
| Hook | Description | Key Data |
|------|-------------|----------|
| `fluent_cart/order_created` | After order created, before payment | order, customer, transaction |
| `fluent_cart/order_paid_done` | After payment confirmed | order, customer, transaction |
| `fluent_cart/order_updated` | When order data modified | order, old_order |
| `fluent_cart/order_deleted` | Before order deleted | order, customer, connected_order_ids |
| `fluent_cart/order_canceled` | When order canceled | order, customer |
| `fluent_cart/order_status_changed` | Any order status change | order, old_status, new_status |
| `fluent_cart/payment_status_changed` | Any payment status change | order, old_status, new_status |
| `fluent_cart/payment_status_changed_to_{status}` | Specific payment status change | order, old_status, new_status |
| `fluent_cart/order_fully_refunded` | Full refund processed | order, refunded_amount, transaction, type='full' |
| `fluent_cart/order_partially_refunded` | Partial refund processed | order, refunded_amount, transaction, type='partial' |
**Available payment statuses for dynamic hook:** pending, paid, partially_paid, failed, refunded, partially_refunded, authorized
### Subscriptions & Licenses
| Hook | Description | Key Data |
|------|-------------|----------|
| `fluent_cart/subscription_activated` | Subscription activated | subscription, customer, order |
| `fluent_cart/subscription_canceled` | Subscription canceled | subscription, customer, order |
| `fluent_cart/subscription_renewed` | Subscription renewed | subscription, customer, order, transaction |
| `fluent_cart/subscription_eot` | End of term reached | subscription, customer |
| `fluent_cart/license_renewed` | License renewed | license, customer, order |
### Cart & Checkout
| Hook | Description | Key Data |
|------|-------------|----------|
| `fluent_cart/cart/item_added` | Item added to cart | cart_item, cart |
| `fluent_cart/cart/item_removed` | Item removed from cart | cart_item, cart |
| `fluent_cart/cart_completed` | Cart converted to order | cart, order, customer |
| `fluent_cart/checkout/customer_data_saved` | Customer data saved at checkout | customer, cart |
| `fluent_cart/after_receipt` | After receipt rendered | order |
| `fluent_cart/before_checkout_form` | Before checkout form renders | (empty) |
| `fluent_cart/after_checkout_form` | After checkout form renders | (empty) |
### Customers & Users
| Hook | Description | Key Data |
|------|-------------|----------|
| `fluent_cart/user/after_register` | After user registration | user, customer |
| `fluent_cart/customer_email_changed` | Customer email changed | customer, old_email, new_email |
| `fluent_cart/customer_status_updated` | Customer status changed | customer, old_status, new_status |
### Products & Coupons
| Hook | Description | Key Data |
|------|-------------|----------|
| `fluent_cart/product_updated` | Product modified | product |
| `fluent_cart/product_stock_changed` | Stock quantity changed | product, old_stock, new_stock, change |
| `fluent_cart/coupon_created` | Coupon created | coupon |
### Payments & Integrations
| Hook | Description | Key Data |
|------|-------------|----------|
| `fluent_cart/register_payment_methods` | Register custom payment methods | (empty) |
| `fluent_cart/integration/run/{provider}` | Run specific integration | feed, order, customer, provider |
### System & Admin
| Hook | Description | Key Data |
|------|-------------|----------|
| `fluentcart_loaded` | Plugin fully initialized | (empty) |
| `fluent_cart/module/activated/{module_key}` | Module activated | module_key, module |
### Example Usage
```php
// React to paid orders
add_action('fluent_cart/order_paid_done', function($data) {
    $order = $data['order'];
    // Grant membership access, trigger fulfillment, etc.
}, 10, 1);
// React to subscription activation
add_action('fluent_cart/subscription_activated', function($data) {
    $subscription = $data['subscription'];
    update_user_meta($subscription->customer_id, 'premium_member', true);
}, 10, 1);
// Register a custom payment gateway
add_action('fluent_cart/register_payment_methods', function() {
    fluent_cart_api()->registerCustomPaymentMethod('my_gateway', new MyGateway());
});
```
---
## Filter Hooks
Filter hooks modify data and behavior. Use `add_filter()` — always return the modified value.
### Settings & Configuration
| Filter | Description | Params |
|--------|-------------|--------|
| `fluent_cart/admin_app_data` | Modify admin app localization data | $adminLocalizeData, $data |
| `fluent_cart/store_settings/values` | Modify store settings defaults | $defaultSettings, $data |
| `fluent_cart/store_settings/fields` | Add/modify store settings fields | $fields, $data |
| `fluent_cart/admin_menu_title` | Change admin menu title | $menuTitle, $data |
| `fluent_cart/module_setting/fields` | Modify module settings fields | $fields, $data |
### Orders & Payments
| Filter | Description | Params |
|--------|-------------|--------|
| `fluent_cart/order_statuses` | Add/modify order statuses | $statuses, $data |
| `fluent_cart/order/view` | Modify order view data | $order, $data |
| `fluent_cart/single_order_downloads` | Modify order download data | $downloadData, $data |
| `fluent_cart/payment_statuses` | Add/modify payment statuses | $statuses, $data |
| `fluent_cart/checkout_active_payment_methods` | Modify active checkout payment methods | $paymentMethods, $data |
| `fluent_cart/invoice_prefix` | Modify invoice number prefix | $prefix, $data |
| `fluent_cart/shipping_statuses` | Add/modify shipping statuses | $statuses, $data |
| `fluent_cart/payments/stripe_metadata_onetime` | Add Stripe metadata for one-time payments | $metadata, $context |
| `fluent_cart/payments/stripe_metadata_subscription` | Add Stripe metadata for subscriptions | $metadata, $context |
| `fluent_cart/tax/country_tax_titles` | Modify country-specific tax labels | $taxTitles, $data |
### Products & Pricing
| Filter | Description | Params |
|--------|-------------|--------|
| `fluent_cart/global_currency_setting` | Modify currency settings | $settings, $data |
| `fluent_cart/product/add_to_cart_text` | Modify "Add to Cart" button text | $text, $data |
| `fluent_cart/product_stock_availability` | Modify stock availability display | $availability, $data |
| `fluent_cart/product_download/can_be_downloaded` | Control download permission | $canBeDownloaded, $data |
| `fluent_cart/coupon/validating_coupon` | Custom coupon validation | $isValid, $data |
### Cart & Checkout
| Filter | Description | Params |
|--------|-------------|--------|
| `fluent_cart/cart/estimated_total` | Modify cart total | $total, $data |
| `fluent_cart/checkout_address_fields` | Modify checkout address fields | $fields, $data |
| `fluent_cart/checkout_page_css_classes` | Modify checkout page CSS classes | $classes, $data |
### Customers & Subscriptions
| Filter | Description | Params |
|--------|-------------|--------|
| `fluent_cart/customer/view` | Modify customer view data | $customer, $data |
| `fluent_cart/subscription_statuses` | Add/modify subscription statuses | $statuses, $data |
| `fluent_cart/subscription/view` | Modify subscription view data | $subscription, $data |
| `fluent_cart/customer_portal/active_tab` | Set customer portal active tab | $activeTab, $data |
### Integrations & Advanced
| Filter | Description | Params |
|--------|-------------|--------|
| `fluent_cart/integration/get_global_integration_actions` | Add custom integrations | $actions, $data |
| `fluent_cart/smartcode_fallback` | Provide smartcode fallback values | $fallback, $data |
| `fluent_cart/register_storage_drivers` | Add custom storage drivers | $drivers, $data |
### Example Usage
```php
// Add a custom order status
add_filter('fluent_cart/order_statuses', function($statuses, $data) {
    $statuses['awaiting_pickup'] = 'Awaiting Pickup';
    return $statuses;
}, 10, 2);
// Add processing fee to cart
add_filter('fluent_cart/cart/estimated_total', function($total, $data) {
    return $total + 200; // Add $2.00 fee (in cents)
}, 10, 2);
// Add custom checkout field
add_filter('fluent_cart/checkout_address_fields', function($fields, $data) {
    $fields['company'] = ['label' => 'Company Name', 'type' => 'text', 'required' => false];
    return $fields;
}, 10, 2);
// Custom coupon validation
add_filter('fluent_cart/coupon/validating_coupon', function($isValid, $data) {
    if ($data['cart']['total'] < 5000) return false; // Min $50
    return $isValid;
}, 10, 2);
```
---
## REST API

**Base URL / namespace:** `https://your-site.com/wp-json/fluent-cart/v2` (namespace `fluent-cart/v2`)

> Full rescan of <https://dev.fluentcart.com/api/> (`/restapi/*`) on 2026-06-19:
> **380 endpoints across 20 resource groups.** All paths below are relative to
> the namespace above. Endpoints marked **Pro** require FluentCart Pro.
>
> 📖 **Full per-endpoint reference** (request parameters, request/response body
> schemas, and examples) generated from FluentCart's OpenAPI specs lives in
> [`docs/api/`](api/README.md) — one file per resource group. The tables below
> are the quick overview; `docs/api/` has the complete request/response detail.

### Authentication

FluentCart's REST API spans three auth contexts:

| Context | Used by | Auth |
|---------|---------|------|
| **Admin API** | most `/...` admin endpoints | WordPress Application Passwords (HTTP Basic: `username:application_password`); requires `manage_options` / FluentCart capabilities |
| **Customer Portal API** | `/customer-profile/*`, `/checkout/*`, `/user/login` | WordPress cookie auth + nonce (logged-in customer) |
| **Public API** | `/public/*` | None (PublicPolicy); product prices returned in cents |

### Orders (`/orders`) — 22

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/orders` | List orders (page, per_page, search, sort_by, sort_type, active_view, filter_type, advanced_filters, with, select, payment_statuses, order_statuses, shipping_statuses) |
| POST | `/orders` | Create order manually (customer_id, order_items, status, payment_method, totals, …) |
| GET | `/orders/{order_id}` | Get order (items, transactions, addresses) |
| POST | `/orders/{order_id}` | Update order details/items |
| DELETE | `/orders/{order_id}` | Delete order and associated data |
| POST | `/orders/{order}/mark-as-paid` | Mark pending order as paid |
| POST | `/orders/{order_id}/refund` | Full/partial refund (`refund_info`) |
| PUT | `/orders/{order}/statuses` | Update order/shipping status (action, statuses, manage_stock) |
| PUT | `/orders/{order}/sync-statuses` | Sync status from latest transaction data |
| POST | `/orders/{order_id}/change-customer` | Reassign order to a different customer |
| POST | `/orders/{order_id}/create-and-change-customer` | Create a customer and assign to order |
| PUT | `/orders/{order}/address/{id}` | Update an order address |
| POST | `/orders/{order_id}/update-address-id` | Assign an existing customer address to the order |
| GET | `/orders/{order}/transactions` | List order transactions |
| GET | `/orders/{id}/transactions/{transaction_id}` | Get a single transaction |
| PUT | `/orders/{order}/transactions/{transaction}/status` | Update transaction status |
| POST | `/orders/{order}/transactions/{transaction_id}/accept-dispute/` | Accept dispute/chargeback |
| POST | `/orders/{order}/create-custom` | Add a custom product/item to the order |
| POST | `/orders/calculate-shipping` | Calculate shipping for items |
| GET | `/orders/shipping_methods` | Available shipping methods (country_code, state, order_items) |
| POST | `/orders/{order}/generate-missing-licenses` | Generate missing license keys (Pro) |
| POST | `/orders/do-bulk-action` | Bulk actions on multiple orders |

### Products (`/products`, `/variants`) — 59

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | List products (search, per_page, page, sort_by, sort_type, active_view, filter_type, with[], search_groups[]) |
| GET | `/products/{product}` | Get product (with[]) |
| POST | `/products` | Create product |
| DELETE | `/products/{product}` | Delete product |
| GET | `/products/{productId}/pricing` | Get full product detail incl. pricing & variants |
| POST | `/products/{postId}/pricing` | Update pricing, details, variants |
| GET | `/products/searchProductByName` | Search published products by name |
| GET | `/products/searchVariantByName` | Search variants hierarchically |
| GET | `/products/search-product-variant-options` | Search variants for selection |
| GET | `/products/findSubscriptionVariants` | Find subscription payment-type variants |
| GET | `/products/fetchProductsByIds` | Products by ID array |
| GET | `/products/fetchVariationsByIds` | Variations by ID array |
| GET | `/products/suggest-sku` | Generate a unique SKU suggestion |
| GET | `/products/get-max-excerpt-word-count` | Max excerpt word limit |
| GET | `/products/fetch-term` | All taxonomies and terms |
| POST | `/products/fetch-term-by-parent` | Terms filtered by parent IDs |
| POST | `/products/bulk-insert` | Create multiple products (max 10) |
| GET | `/products/bulk-edit-data` | Fetch products for the bulk-edit grid |
| POST | `/products/bulk-update` | Update multiple products (max 10) |
| POST | `/products/do-bulk-action` | Bulk action on selected products |
| POST | `/products/create-dummy` | Create sample/demo products |
| POST | `/products/{productId}/duplicate` | Duplicate product (with options) |
| GET | `/products/{productId}/related-products` | Related products |
| POST | `/products/{postId}/update-long-desc-editor-mode` | Switch description editor mode |
| POST | `/products/{postId}/update-variant-option` | Sync variant options |
| POST | `/products/detail/{detailId}` | Update product detail record |
| POST | `/products/add-product-terms` | Create taxonomy terms |
| POST | `/products/sync-taxonomy-term/{postId}` | Sync taxonomy terms for product |
| POST | `/products/delete-taxonomy-term/{postId}` | Remove a taxonomy term from product |
| GET | `/products/{productId}/pricing-widgets` | Sales overview widgets |
| GET | `/products/get-bundle-info/{productId}` | Bundle child variant mappings |
| POST | `/products/save-bundle-info/{variationId}` | Save bundle child variant IDs |
| GET | `/products/{id}/upgrade-paths` | List upgrade path configs |
| POST | `/products/{id}/upgrade-path` | Create upgrade path |
| POST | `/products/upgrade-path/{id}/update` | Update upgrade path |
| DELETE | `/products/upgrade-path/{id}/delete` | Delete upgrade path |
| GET | `/products/variation/{variantId}/upgrade-paths` | Upgrade paths for a variation |
| POST | `/products/{postId}/tax-class` | Assign tax class |
| POST | `/products/{postId}/tax-class/remove` | Remove tax class |
| POST | `/products/{postId}/shipping-class` | Assign shipping class |
| POST | `/products/{postId}/shipping-class/remove` | Remove shipping class |
| PUT | `/products/{postId}/update-inventory/{variantId}` | Update variant stock (total_stock, available) |
| PUT | `/products/{postId}/update-manage-stock` | Enable/disable stock management |
| POST | `/products/{postId}/sync-downloadable-files` | Attach downloadable files |
| PUT | `/products/{downloadableId}/update` | Update downloadable file record |
| DELETE | `/products/{downloadableId}/delete` | Delete downloadable file |
| GET | `/products/getDownloadableUrl/{downloadableId}` | Generate temporary download URL |
| GET | `/products/variants` | List product variations |
| POST | `/products/variants` | Create variation |
| POST | `/products/variants/{variantId}` | Update variation |
| DELETE | `/products/variants/{variantId}` | Delete variation |
| POST | `/products/variants/{variantId}/setMedia` | Set variation media/images |
| PUT | `/products/variants/{variantId}/pricing-table` | Update variation pricing table |
| GET | `/variants` | All variations across all products |
| GET | `/products/{productId}/integrations` | Integration feeds configured for product |
| GET | `/products/{product_id}/integrations/{integration_name}/settings` | Product integration settings |
| POST | `/products/{product_id}/integrations` | Create/update product integration feed |
| DELETE | `/products/{product_id}/integrations/{integration_id}` | Delete product integration feed |
| POST | `/products/{product_id}/integrations/feed/change-status` | Enable/disable product feed |

### Customers (`/customers`) — 18

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/customers` | List customers (search, per_page, page, sort_by, sort_type, filter_type, advanced_filters, with, select, include_ids, active_view, user_tz) |
| POST | `/customers` | Create customer (email required) |
| GET | `/customers/{customerId}` | Get customer (with, params[customer_only]) |
| PUT | `/customers/{customerId}` | Update customer |
| PUT | `/customers/{customerId}/additional-info` | Update customer labels |
| POST | `/customers/do-bulk-action` | Bulk customer actions |
| GET | `/customers/get-stats/{customer}` | Customer widget stats |
| GET | `/customers/{customerId}/orders` | List customer orders |
| GET | `/customers/{customerId}/order` | Customer orders with line items |
| POST | `/customers/{customerId}/recalculate-ltv` | Recalculate lifetime value |
| GET | `/customers/{customerId}/address` | Get customer addresses (type) |
| POST | `/customers/{customerId}/address` | Create address |
| PUT | `/customers/{customerId}/address` | Update address |
| DELETE | `/customers/{customerId}/address` | Delete address |
| POST | `/customers/{customerId}/address/make-primary` | Set primary address |
| GET | `/customers/attachable-user` | List unlinked WordPress users |
| POST | `/customers/{customerId}/attachable-user` | Link a WordPress user |
| POST | `/customers/{customerId}/detach-user` | Unlink WordPress user |

### Coupons (`/coupons`) — 12

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/coupons` | List coupons (paginated, filterable) |
| GET | `/coupons/listCoupons` | Simple array of active coupon codes |
| GET | `/coupons/getSettings` | Global coupon settings |
| GET | `/coupons/{id}` | Get coupon (incl. activity log) |
| POST | `/coupons` | Create coupon |
| PUT | `/coupons/{id}` | Update coupon |
| DELETE | `/coupons/{id}` | Delete coupon |
| POST | `/coupons/apply` | Apply coupon to order line items |
| POST | `/coupons/cancel` | Remove coupon from an order |
| POST | `/coupons/re-apply` | Recalculate applied coupons |
| POST | `/coupons/checkProductEligibility` | Validate product eligibility |
| POST | `/coupons/storeCouponSettings` | Update global coupon settings |

### Subscriptions — 17

Admin subscription actions live under `/orders/{order}/subscriptions/{subscription}`; customer-portal actions under `/customer-profile/subscriptions`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/subscriptions` | List subscriptions (paginated, filterable) |
| GET | `/subscriptions/{subscriptionOrderId}` | Get subscription (customer + related orders) |
| PUT | `/orders/{order}/subscriptions/{subscription}/cancel` | Cancel (local + gateway; `cancel_reason`) |
| PUT | `/orders/{order}/subscriptions/{subscription}/fetch` | Re-sync from remote gateway |
| POST | `/orders/{order}/subscriptions/{subscription}/early-payment-link` | Generate early-installment URL |
| PUT | `/orders/{order}/subscriptions/{subscription}/reactivate` | Reactivate (not yet available) |
| PUT | `/orders/{order}/subscriptions/{subscription}/pause` | Pause (not yet available) |
| PUT | `/orders/{order}/subscriptions/{subscription}/resume` | Resume (not yet available) |
| GET | `/customer-profile/subscriptions` | List logged-in customer's subscriptions |
| GET | `/customer-profile/subscriptions/{subscription_uuid}` | Subscription details + upgrade eligibility |
| GET | `/customer-profile/subscriptions/{subscription_uuid}/setup-intent-attempts` | Remaining Stripe SetupIntent attempts |
| POST | `/customer-profile/subscriptions/{subscription_uuid}/update-payment-method` | Update payment method (same gateway) |
| POST | `/customer-profile/subscriptions/{subscription_uuid}/get-or-create-plan` | Get/create plan on remote gateway |
| POST | `/customer-profile/subscriptions/{subscription_uuid}/switch-payment-method` | Switch between gateways |
| POST | `/customer-profile/subscriptions/{subscription_uuid}/confirm-subscription-switch` | Finalize gateway switch |
| POST | `/customer-profile/subscriptions/{subscription_uuid}/cancel-auto-renew` | Cancel from customer portal |
| POST | `/customer-profile/subscriptions/{subscription_uuid}/initiate-early-payment` | Early-installment checkout URL |

### Tax — 26

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/taxes` | List order tax records |
| POST | `/taxes` | Mark tax records as filed |
| GET | `/tax/classes` | List tax classes |
| POST | `/tax/classes` | Create tax class |
| PUT | `/tax/classes/{id}` | Update tax class |
| DELETE | `/tax/classes/{id}` | Delete tax class |
| GET | `/tax/rates` | All tax rates grouped by region/country |
| GET | `/tax/rates/country/rates/{country_code}` | Rates for a country |
| POST | `/tax/country/rate` | Create tax rate |
| PUT | `/tax/country/rate/{id}` | Update tax rate |
| DELETE | `/tax/country/rate/{id}` | Delete tax rate |
| DELETE | `/tax/country/{country_code}` | Delete all rates for a country |
| POST | `/tax/rates/country/override` | Set shipping tax override |
| DELETE | `/tax/rates/country/override/{id}` | Remove shipping override |
| GET | `/tax/country-tax-id/{country_code}` | Get store tax ID for a country |
| POST | `/tax/country-tax-id/{country_code}` | Save store tax ID |
| GET | `/tax/configuration/rates` | Preconfigured tax rates by region |
| POST | `/tax/configuration/countries` | Import rates for countries |
| GET | `/tax/configuration/settings` | Global tax settings |
| POST | `/tax/configuration/settings` | Save tax settings |
| POST | `/tax/configuration/settings/eu-vat` | Save EU cross-border settings |
| GET | `/tax/configuration/settings/eu-vat/rates` | EU-grouped tax rates |
| POST | `/tax/configuration/settings/eu-vat/oss/override` | Save OSS tax override |
| POST | `/tax/configuration/settings/eu-vat/oss/shipping-override` | Save OSS shipping override |
| DELETE | `/tax/configuration/settings/eu-vat/oss/override` | Delete OSS tax override |
| DELETE | `/tax/configuration/settings/eu-vat/oss/shipping-override` | Delete OSS shipping override |

### Shipping — 15

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/shipping/zones` | List shipping zones |
| POST | `/shipping/zones` | Create zone |
| GET | `/shipping/zones/{id}` | Get zone |
| PUT | `/shipping/zones/{id}` | Update zone |
| DELETE | `/shipping/zones/{id}` | Delete zone (and its methods) |
| POST | `/shipping/zones/update-order` | Reorder zones |
| GET | `/shipping/zone/states` | State/province + locale options |
| POST | `/shipping/methods` | Create shipping method |
| PUT | `/shipping/methods` | Update shipping method |
| DELETE | `/shipping/methods/{method_id}` | Delete shipping method |
| GET | `/shipping/classes` | List shipping classes |
| POST | `/shipping/classes` | Create shipping class |
| GET | `/shipping/classes/{id}` | Get shipping class |
| PUT | `/shipping/classes/{id}` | Update shipping class |
| DELETE | `/shipping/classes/{id}` | Delete shipping class |

### Settings — 30

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/settings/store` | Get store settings + field schema |
| POST | `/settings/store` | Update store settings |
| GET | `/settings/modules` | Module settings + field definitions |
| POST | `/settings/modules` | Enable/disable modules |
| GET | `/settings/modules/plugin-addons` | List plugin addons |
| POST | `/settings/modules/plugin-addons/install` | Install plugin addon |
| POST | `/settings/modules/plugin-addons/activate` | Activate plugin addon |
| GET | `/settings/permissions` | Get role→capability mappings |
| POST | `/settings/permissions` | Update role→capability mappings |
| POST | `/settings/confirmation` | Update confirmation/receipt page settings |
| GET | `/settings/confirmation/shortcode` | Email-template shortcodes |
| GET | `/settings/payment-methods` | Get a gateway's config |
| POST | `/settings/payment-methods` | Create/update gateway config |
| GET | `/settings/payment-methods/all` | All registered gateways |
| POST | `/settings/payment-methods/reorder` | Reorder payment methods |
| GET | `/settings/payment-methods/connect/info` | Connectable gateway info |
| POST | `/settings/payment-methods/disconnect` | Disconnect a gateway account |
| POST | `/settings/payment-methods/design` | Customize checkout appearance |
| POST | `/settings/payment-methods/install-addon` | Install payment gateway addon |
| POST | `/settings/payment-methods/activate-addon` | Activate payment addon |
| POST | `/settings/payment-methods/paypal/seller-auth-token` | Exchange PayPal seller token |
| POST | `/settings/payment-methods/paypal/webhook/setup` | Register PayPal webhook |
| GET | `/settings/payment-methods/paypal/webhook/check` | Verify PayPal webhook |
| GET | `/settings/storage-drivers` | List storage drivers |
| POST | `/settings/storage-drivers` | Create/update storage driver |
| GET | `/settings/storage-drivers/active-drivers` | Active storage drivers |
| GET | `/settings/storage-drivers/{driver}` | Get driver config |
| POST | `/settings/storage-drivers/verify-info` | Test driver connection |
| GET | `/checkout-fields/get-fields` | Get checkout field schema |
| POST | `/checkout-fields/save-fields` | Update checkout field config |

### Email Notifications (`/email-notification`) — 11

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/email-notification` | List notification templates |
| GET | `/email-notification/{notification}` | Get template + shortcodes |
| PUT | `/email-notification/{notification}` | Update template (subject, body, status) |
| POST | `/email-notification/enable-notification/{name}` | Toggle template on/off |
| GET | `/email-notification/get-short-codes` | Shortcodes, template files, editor buttons |
| GET | `/email-notification/get-settings` | Global email settings |
| POST | `/email-notification/save-settings` | Save global email settings |
| GET | `/email-notification/reminders` | Reminder/scheduling settings |
| POST | `/email-notification/reminders` | Save reminder/scheduling settings |
| POST | `/email-notification/preview` | Preview a custom template |
| POST | `/email-notification/preview-default-template` | Preview a default template |

### Reports (`/reports`) — 43

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/reports/overview` | Year-over-year revenue comparison |
| GET | `/reports/report-overview` | Aggregated overview + payment breakdown |
| GET | `/reports/fetch-report-meta` | Currencies, earliest order date, store mode |
| GET | `/reports/quick-order-stats` | Quick stats with prior-period comparison |
| GET | `/reports/sales-growth` | Sales growth over a period |
| GET | `/reports/search-repeat-customer` | Paginate customers with multiple purchases |
| GET | `/reports/top-products-sold` | Best-selling products |
| GET | `/reports/revenue` | Revenue grouped by interval (with comparison) |
| GET | `/reports/revenue-by-group` | Revenue by dimension (method/country) |
| GET | `/reports/order-chart` | Order count time-series |
| GET | `/reports/fetch-order-by-group` | Orders by grouping dimension |
| GET | `/reports/fetch-report-by-day-and-hour` | Day/hour heatmap report |
| GET | `/reports/order-value-distribution` | Orders by total value |
| GET | `/reports/item-count-distribution` | Orders by item count |
| GET | `/reports/order-completion-time` | Order completion-time stats |
| GET | `/reports/sales-report` | Comprehensive sales report |
| GET | `/reports/sales-growth-chart` | Dashboard sales-growth time-series |
| GET | `/reports/fetch-top-sold-products` | Ranked best-selling products |
| GET | `/reports/fetch-top-sold-variants` | Ranked best-selling variants |
| GET | `/reports/refund-chart` | Refund time-series + totals |
| GET | `/reports/refund-data-by-group` | Refund data by grouping dimension |
| GET | `/reports/weeks-between-refund` | Time between order and refund |
| GET | `/reports/license-chart` | License creation/activation time-series (Pro) |
| GET | `/reports/license-pie-chart` | License distribution (Pro) |
| GET | `/reports/license-summary` | License summary stats (Pro) |
| GET | `/reports/dashboard-stats` | Key dashboard stats with comparison |
| GET | `/reports/get-dashboard-summary` | Store summary (product/coupon counts) |
| GET | `/reports/country-heat-map` | Orders by billing country |
| GET | `/reports/get-recent-orders` | 10 most recent orders |
| GET | `/reports/get-recent-activities` | 10 most recent activity entries |
| GET | `/reports/subscription-chart` | Subscription time-series + MRR (Pro) |
| GET | `/reports/daily-signups` | Daily subscription signups (Pro) |
| GET | `/reports/subscription-retention` | Retention % across billing periods (Pro) |
| GET | `/reports/subscription-cohorts` | Subscription cohort analysis (Pro) |
| GET | `/reports/retention-chart` | Subscription retention chart (Pro) |
| GET | `/reports/future-renewals` | Projected future renewals (Pro) |
| POST | `/reports/retention-snapshots/generate` | Trigger retention snapshot generation (Pro) |
| GET | `/reports/retention-snapshots/status` | Snapshot job status (Pro) |
| GET | `/reports/product-report` | Product-level report time-series |
| GET | `/reports/product-performance` | Top-products performance chart |
| GET | `/reports/customer-report` | Customer acquisition/activity time-series |
| GET | `/reports/fetch-new-vs-returning-customer` | New vs returning order comparison |
| GET | `/reports/sources` | Order source/attribution data |

### Integrations (`/integration`) — 17

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/integration/addons` | List integration add-ons |
| POST | `/integration/feed/install-plugin` | Install/activate an integration plugin |
| GET | `/integration/global-settings` | Get a provider's global settings |
| POST | `/integration/global-settings` | Save a provider's global settings |
| GET | `/integration/global-feeds` | List global feeds + available integrations |
| GET | `/integration/global-feeds/settings` | Feed settings schema + saved values |
| POST | `/integration/global-feeds/settings` | Create/update a global feed |
| POST | `/integration/global-feeds/change-status/{integration_id}` | Toggle global feed |
| DELETE | `/integration/global-feeds/{integration_id}` | Delete a global feed |
| GET | `/integration/feed/lists` | Merge fields for a provider/list |
| GET | `/integration/feed/dynamic_options` | Dynamic select options |
| POST | `/integration/feed/chained` | Chained/dependent data requests |
| GET | `/products/{productId}/integrations` | Product integration feeds |
| GET | `/products/{product_id}/integrations/{integration_name}/settings` | Product feed settings |
| POST | `/products/{product_id}/integrations` | Create/update product feed |
| POST | `/products/{product_id}/integrations/feed/change-status` | Toggle product feed |
| DELETE | `/products/{product_id}/integrations/{integration_id}` | Delete product feed |

### Files — 5

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/files` | List files from a storage driver |
| GET | `/files/bucket-list` | Available buckets for a driver |
| POST | `/files/upload` | Upload a downloadable file |
| POST | `/upload-editor-file` | Upload an image for the content editor |
| DELETE | `/files/delete` | Delete a file from a driver |

### Labels & Attributes — 13

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/labels` | List labels |
| POST | `/labels` | Create label (optionally attach to entity) |
| POST | `/labels/update-label-selections` | Update labels attached to an entity |
| GET | `/options/attr/groups` | List attribute groups |
| POST | `/options/attr/group` | Create attribute group |
| GET | `/options/attr/group/{group_id}` | Get attribute group (optionally with terms) |
| PUT | `/options/attr/group/{group_id}` | Update attribute group |
| DELETE | `/options/attr/group/{group_id}` | Delete attribute group (if unused) |
| GET | `/options/attr/group/{group_id}/terms` | List terms in a group |
| POST | `/options/attr/group/{group_id}/term` | Create a term |
| POST | `/options/attr/group/{group_id}/term/{term_id}` | Update a term |
| DELETE | `/options/attr/group/{group_id}/term/{term_id}` | Delete a term (if unused) |
| POST | `/options/attr/group/{group_id}/term/{term_id}/serial` | Reorder a term |

### Dashboard & Utilities — 20

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard` | Onboarding checklist with completion status |
| GET | `/dashboard/stats` | Dashboard stat widgets (last 30 days) |
| GET | `/widgets` | Dynamic widget data for a context |
| GET | `/onboarding` | Store settings, pages, currency options |
| POST | `/onboarding` | Save onboarding/store settings |
| POST | `/onboarding/create-pages` | Create all required store pages |
| POST | `/onboarding/create-page` | Create a single store page |
| GET | `/app/init` | Initialize admin app (config, assets, i18n) |
| GET | `/app/attachments` | Media-library image attachments |
| POST | `/app/upload-attachments` | Upload an image to the media library |
| GET | `/activity` | Activity log (paginated, filterable) |
| DELETE | `/activity/{id}` | Delete an activity entry |
| PUT | `/activity/{id}/mark-read` | Toggle activity read status |
| POST | `/notes/attach` | Add/update a note on an order |
| GET | `/templates/print-templates` | Get print templates |
| PUT | `/templates/print-templates` | Save print templates |
| GET | `/address-info/countries` | Countries as select options |
| GET | `/address-info/get-country-info` | Country detail (states, locale rules) |
| GET | `/advance_filter/get-filter-options` | Advanced-filter dropdown options |
| GET | `/forms/search_options` | Search/autocomplete options for forms |

### Public Shop (`/public`) — 3 · *no auth*

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/public/products` | List published products (taxonomy/price/type filters) |
| GET | `/public/product-views` | Server-rendered product listing HTML (blocks/shortcodes) |
| GET | `/public/product-search` | Search products → formatted HTML results |

### Checkout (`/checkout`) — 7 · *customer auth*

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/checkout/place-order` | Submit a checkout order |
| GET | `/checkout/get-order-info` | Gateway-specific order info for payment UI |
| GET | `/checkout/get-checkout-summary-view` | Rendered cart summary HTML |
| GET | `/checkout/get-available-shipping-methods` | Shipping methods for country/state |
| GET | `/checkout/get-shipping-methods-list-view` | Shipping methods HTML for checkout |
| GET | `/checkout/get-country-info` | Localization (states, address fields) |
| POST | `/user/login` | Authenticate during checkout (sets WP cookie) |

### Customer Profile (`/customer-profile`) — 21 · *customer auth*

Subscription and license endpoints for the portal are listed under **Subscriptions** and **Licensing**.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/customers/{customerId}` | Authenticated customer's details |
| PUT | `/customers/{customerId}` | Update profile information |
| GET | `/customers/{customerId}/orders` | List customer's orders |
| GET | `/customers/{customerAddressId}/update-address-select` | Apply a saved address to the cart |
| POST | `/customers/add-address` | Create a billing/shipping address |
| PUT | `/customers/{customerId}/address` | Update an address |
| DELETE | `/customers/{customerId}/address` | Remove an address |
| POST | `/customers/{customerId}/address/make-primary` | Set an address as primary |
| GET | `/customer-profile/` | Dashboard overview with recent orders |
| GET | `/customer-profile/profile` | Profile details + addresses |
| POST | `/customer-profile/update` | Update name/email |
| POST | `/customer-profile/create-address` | Create address from profile |
| POST | `/customer-profile/edit-address` | Edit an address |
| POST | `/customer-profile/make-primary-address` | Mark address primary |
| POST | `/customer-profile/delete-address` | Delete an address |
| GET | `/customer-profile/orders` | List customer orders (paginated) |
| GET | `/customer-profile/orders/{order_uuid}` | Full order details |
| GET | `/customer-profile/orders/{order_uuid}/upgrade-paths` | Available plan upgrades |
| GET | `/customer-profile/downloads` | Downloadable product files |
| GET | `/customer-profile/orders/{transaction_uuid}/billing-address` | Get billing address |
| PUT | `/customer-profile/orders/{transaction_uuid}/billing-address` | Create/update billing address |

### Licensing — 24 · **Pro**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/licensing/licenses` | List licenses |
| GET | `/licensing/licenses/{id}` | Get license details |
| GET | `/licensing/licenses/customer/{id}` | Licenses for a customer |
| POST | `/licensing/licenses/{id}/regenerate-key` | Regenerate license key |
| POST | `/licensing/licenses/{id}/extend-validity` | Change expiration date |
| POST | `/licensing/licenses/{id}/update_status` | Update license status |
| POST | `/licensing/licenses/{id}/update_limit` | Change activation limit |
| POST | `/licensing/licenses/{id}/activate_site` | Manually activate a site |
| POST | `/licensing/licenses/{id}/deactivate_site` | Deactivate a site activation |
| DELETE | `/licensing/licenses/{id}/delete` | Delete a license |
| GET | `/licensing/products/{id}/settings` | Get product license settings |
| POST | `/licensing/products/{id}/settings` | Update product license settings |
| GET | `/customer-profile/licenses/` | List logged-in customer's licenses |
| GET | `/customer-profile/licenses/{license_key}` | License details by key |
| GET | `/customer-profile/licenses/{license_key}/activations` | List site activations |
| POST | `/customer-profile/licenses/{license_key}/deactivate_site` | Deactivate a site |
| GET | `/settings/license/` | Check FluentCart Pro plugin license |
| POST | `/settings/license/` | Activate plugin license |
| DELETE | `/settings/license/` | Deactivate plugin license |
| GET/POST | `/?fluent-cart=check_license` | Public: verify license validity |
| POST | `/?fluent-cart=activate_license` | Public: activate license on a site |
| POST | `/?fluent-cart=deactivate_license` | Public: deactivate license |
| GET/POST | `/?fluent-cart=get_license_version` | Public: version/update info |
| GET | `/?fluent-cart=download_license_package` | Public: download update package |

> The last five are query-string endpoints on the site root (not under the REST namespace) — used by the EDD-style update/licensing client.

### Roles & Permissions (`/roles`) — 7 · **Pro**

Requires AdminPolicy (`manage_options`). Built-in roles: `super_admin`, `manager`, `worker`, `accountant`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/roles` | List role definitions |
| POST | `/roles` | Assign a role to a user |
| GET | `/roles/{key}` | Get a role (placeholder) |
| POST | `/roles/{key}` | Update a role (placeholder) |
| DELETE | `/roles/{key}` | Remove a role assignment |
| GET | `/roles/managers` | List users with shop roles + permissions |
| GET | `/roles/user-list` | Search users available for assignment |

> Permission capability mappings are managed via `GET/POST /settings/permissions`.

### Order Bumps (`/order_bump`) — 5 · **Pro**

Requires the `store/sensitive` permission.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/order_bump` | List order bumps |
| POST | `/order_bump` | Create order bump |
| GET | `/order_bump/{id}` | Get order bump (config + conditions) |
| PUT | `/order_bump/{id}` | Update order bump |
| DELETE | `/order_bump/{id}` | Delete order bump |

### API Request Examples

```bash
# List recent completed orders (admin — Application Password)
curl -X GET "https://your-site.com/wp-json/fluent-cart/v2/orders?per_page=10&order_statuses[]=completed" \
  -u "username:app_password"

# Get a product with relations
curl -X GET "https://your-site.com/wp-json/fluent-cart/v2/products/123?with[]=detail&with[]=variants" \
  -u "username:app_password"

# Update an order's shipping status
curl -X PUT "https://your-site.com/wp-json/fluent-cart/v2/orders/456/statuses" \
  -u "username:app_password" \
  -H "Content-Type: application/json" \
  -d '{"action":"shipping_status","statuses":{"shipping_status":"shipped"},"manage_stock":true}'

# Public shop: list published products (no auth)
curl -X GET "https://your-site.com/wp-json/fluent-cart/v2/public/products?per_page=12"
```
---
## Payment Gateway Integration
### Architecture
FluentCart uses `AbstractPaymentGateway` as the base class. Gateways declare supported features and register via `fluent_cart_api()->registerCustomPaymentMethod()`.
### Minimal Gateway Structure
```php
<?php
namespace YourPlugin\PaymentMethods\YourGateway;
use FluentCart\App\Modules\PaymentMethods\Core\AbstractPaymentGateway;
use FluentCart\App\Services\Payments\PaymentInstance;
class YourGateway extends AbstractPaymentGateway
{
    public array $supportedFeatures = ['payment', 'refund', 'webhook'];
    public function __construct()
    {
        parent::__construct(
            new YourGatewaySettings(),
            // new YourSubscriptions() // optional for subscription support
        );
    }
    public function meta(): array
    {
        return [
            'title'       => __('Your Gateway', 'your-plugin'),
            'route'       => 'your_gateway',
            'slug'        => 'your_gateway',
            'description' => __('Pay with Your Gateway', 'your-plugin'),
            'status'      => $this->settings->get('is_active') === 'yes',
        ];
    }
    public function makePaymentFromPaymentInstance(PaymentInstance $paymentInstance)
    {
        $order = $paymentInstance->order;
        if ($paymentInstance->subscription) {
            return $this->handleSubscription($paymentInstance);
        }
        return $this->handleSinglePayment($paymentInstance);
    }
}
// Registration
add_action('fluent_cart/register_payment_methods', function() {
    fluent_cart_api()->registerCustomPaymentMethod('your_gateway', new YourGateway());
});
```
### Settings Class Pattern
```php
class YourGatewaySettings extends BaseGatewaySettings
{
    public $methodHandler = 'fluent_cart_payment_settings_your_gateway';
    public static function getDefaults()
    {
        return [
            'is_active'           => 'no',
            'payment_mode'        => 'test',
            'live_api_key'        => '',
            'test_api_key'        => '',
            'live_webhook_secret' => '',
            'test_webhook_secret' => '',
        ];
    }
    public function getApiKey($mode = '')
    {
        if (!$mode) $mode = $this->getMode();
        return $this->get($mode . '_api_key');
    }
    public function getMode()
    {
        return $this->get('payment_mode');
    }
}
```
### Frontend JavaScript Integration
FluentCart fires a custom event when a payment method is selected at checkout:
```javascript
// Event format: fluent_cart_load_payments_[your_slug]
window.addEventListener("fluent_cart_load_payments_your_gateway", function (e) {
    const submitButton = window.fluentcart_checkout_vars?.submit_button;
    const container = document.querySelector(
        '.fluent-cart-checkout_embed_payment_container_your_gateway'
    );
    // e.detail properties:
    // e.detail.form           - Checkout form element
    // e.detail.paymentLoader  - Helper to manage checkout button state
    // e.detail.paymentInfoUrl - URL to fetch payment information
    // e.detail.nonce          - WordPress nonce for API calls
    // e.detail.orderHandler   - Function to create the order
    // Fetch payment info, then initialize your SDK
    fetch(e.detail.paymentInfoUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-WP-Nonce": e.detail.nonce },
        credentials: 'include'
    }).then(async (response) => {
        const data = await response.json();
        // Initialize your payment SDK with data
    });
});
```
### Webhook/IPN Pattern
```php
class IPN
{
    public function init(): void
    {
        add_action('fluent_cart/payments/your_gateway/webhook_payment_completed',
            [$this, 'handlePaymentCompleted'], 10, 1);
        add_action('fluent_cart/payments/your_gateway/webhook_refund_created',
            [$this, 'handleRefundCreated'], 10, 1);
    }
    public function verifyAndProcess()
    {
        $rawPayload = file_get_contents('php://input');
        $signature = $_SERVER['HTTP_X_GATEWAY_SIGNATURE'] ?? '';
        // Verify webhook signature and process events
    }
}
```
---
## Custom Product Selling
FluentCart supports selling products beyond physical goods. Use filters and hooks to define custom product types.
### Custom Fulfillment Types
```php
// Register a custom fulfillment type
add_filter('fluent_cart/fulfillment_types', function($types) {
    $types['membership'] = [
        'label' => 'Membership',
        'icon'  => 'dashicons-groups',
    ];
    return $types;
});
// Handle fulfillment when order is paid
add_action('fluent_cart/order_paid_done', function($data) {
    $order = $data['order'];
    foreach ($order->items as $item) {
        if ($item->fulfillment_type === 'membership') {
            // Grant membership access
        }
    }
});
```
---
## Plugin Boilerplate
### Minimal Plugin Structure
```
your-fluentcart-addon/
├── your-fluentcart-addon.php     # Plugin entry point
├── includes/
│   ├── YourAddon.php             # Main plugin class
│   ├── Hooks.php                 # Hook registrations
│   └── Api.php                   # Custom API endpoints
└── readme.txt
```
### Entry Point
```php
<?php
/**
 * Plugin Name: Your FluentCart Addon
 * Description: Extends FluentCart with custom functionality.
 * Version: 1.0.0
 * Requires Plugins: fluent-cart
 */
defined('ABSPATH') || exit;
add_action('fluentcart_loaded', function() {
    require_once __DIR__ . '/includes/YourAddon.php';
    (new YourAddon())->init();
});
```
### Main Class
```php
class YourAddon
{
    public function init(): void
    {
        $this->registerHooks();
        $this->registerApiRoutes();
    }
    private function registerHooks(): void
    {
        add_action('fluent_cart/order_paid_done', [$this, 'handleOrderPaid']);
        add_filter('fluent_cart/order_statuses', [$this, 'addCustomStatuses']);
    }
    private function registerApiRoutes(): void
    {
        add_action('rest_api_init', function() {
            register_rest_route('your-addon/v1', '/endpoint', [
                'methods'             => 'GET',
                'callback'            => [$this, 'handleApiRequest'],
                'permission_callback' => function() {
                    return current_user_can('manage_options');
                },
            ]);
        });
    }
}
```
