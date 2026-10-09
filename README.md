# Kalava — Framed Art Store

A mobile-friendly website for Kalava, a home décor brand selling framed art prints. The design uses cream, terracotta and charcoal.

Built with plain HTML, CSS and JavaScript. No frameworks, npm or build tools are needed.

## Preview the website

1. Download or clone this repository.
2. Open the folder on your computer.
3. Double-click `index.html` to open it in a browser.

An internet connection is needed for Google Fonts, WhatsApp and payment apps. The pages and sample images work locally. Cart storage on local files can vary by browser; see [the website guide](WEBSITE_GUIDE.md) if your browser does not keep the bag between pages.

## What is included

- Home page and eight editable sample products.
- Shop filters, price sorting and individual product pages.
- Shopping bag with quantity changes, removal and rupee totals.
- Saved cart using the browser's localStorage.
- WhatsApp order-request form and a manual UPI payment section.
- About, contact, delivery, returns and privacy pages.
- Mobile navigation and a floating WhatsApp button.

Checkout prepares a WhatsApp message for the customer to send. It does not automatically confirm an order or verify a payment. The contact form opens an email draft.

## Where to edit

| File or folder | What it contains |
| --- | --- |
| `index.html` | Home page |
| `shop.html` | Product collection |
| `product.html` | Product details, selected by URL such as `?id=1` |
| `cart.html` | Shopping bag and checkout |
| `about.html`, `contact.html` | Brand story and contact form |
| `policies.html` | Delivery, returns and privacy information |
| `css/style.css` | Colours, fonts and page layouts |
| `js/products.js` | Product catalogue and business contact/payment details |
| `js/main.js` | Shopping and navigation functionality |
| `images/` | Sample artwork and image assets |

## Before accepting orders

Replace the sample artwork and product details. Add your WhatsApp number, business email, UPI ID and QR image in `js/products.js`. Confirm your prices, materials, shipping times and policies. Empty contact and payment settings are intentional placeholders.

Never put passwords, API secrets or customer records in this repository.

## Hosting

This is a static website. Keep the code on GitHub and use Cloudflare Pages or another host that permits ecommerce websites. GitHub Pages does not allow ecommerce hosting. No build command is required; publish the repository root. Uploading code to GitHub does not automatically make the website live—hosting must be enabled separately.

For detailed editing and hosting notes, read [WEBSITE_GUIDE.md](WEBSITE_GUIDE.md). The original discovery decisions are in [PROJECT_BRIEF.md](PROJECT_BRIEF.md).
