# Kalava static storefront

## Preview on your computer

1. Open this project folder in Finder.
2. Double-click `index.html` (or right-click → Open With → Google Chrome).
3. Browse the collection, add art to your bag and visit checkout.

No install, npm, build command or server is required. An internet connection loads Google Fonts and opens WhatsApp; offline, readable fallback fonts and all local artwork still work. Most browsers support localStorage for local files, but file-URL storage behavior varies. If your browser isolates storage between files, use a static local server for a reliable shared origin: from this folder run `python3 -m http.server 8000`, then open `http://localhost:8000`. Hosted pages share cart storage normally. Private modes or storage restrictions can prevent persistence.

## Add your real business details

Open `js/products.js` in a text editor. At the top, update `window.STORE`:

- `whatsapp`: your full number with country code, digits only (no +, spaces or punctuation).
- `email`: your business email address.
- `upiId`: your real UPI ID.
- `upiQr`: the local image path for your real QR code, for example `images/kalava-upi.png`.

Empty fields are intentional. The website shows an honest unavailable message instead of sending enquiries or orders to a fake number. The QR placeholder is not scannable. Confirm that your number, UPI ID and QR all belong to your business before publishing.

## Edit products

The eight entries in `window.PRODUCTS` are sample products. Replace artwork, names, descriptions, prices, sizes and materials before selling. Keep IDs unique and numeric; keep prices numeric without the ₹ symbol. Put images in `images/` and update each `image` path and descriptive `alt`. A product URL is `product.html?id=1`. The current product page clearly calls sizes/sample artwork illustrative; update that text in `js/main.js` once your real catalogue is verified. Replace the hero illustration in `images/hero.svg` with your approved interior visualisation and update `index.html` if its filename changes.

The header/footer are repeated in each HTML file for straightforward local opening and meaningful page markup. Apply shared navigation edits to every page. Brand colours and typography are at the top of `css/style.css`.

## Checkout and contact behavior

The cart stores only product IDs and quantities in localStorage. Quantities are 1–99. It survives refresh and supports removal, sorting/filtering in the shop, and totals formatted in Indian Rupees.

Checkout lives on `cart.html#checkout`. It validates the name, phone and address, then opens a WhatsApp draft with item names, sizes, quantities, totals and customer details. The customer must send that message. This does not reserve stock, create a server-side order, verify payment, take card payments or send an automatic receipt. The bag is deliberately retained. Shipping and final charges must be confirmed manually.

UPI is a manual payment section. The UPI link has no preset amount because shipping and final charges are not yet known. The contact form opens an email draft; it does not submit to a server. No account credentials or secret keys should ever be placed in these public files.

## Before launch

Replace the sample catalogue, confirm product specifications and lead times, add your contact and payment details, and finalise shipping, returns and business policies in `policies.html`. Add genuine reviews and customer photos when available; none are fabricated here. Your latest request replaces the original integrated card/UPI checkout with WhatsApp order requests and manual UPI.

Each HTML page has a unique title, description and Open Graph text tags. JavaScript updates product metadata for the selected product, but most social crawlers do not run JavaScript. Product links therefore use the generic product-page sharing text. Item-specific social previews require separate pre-rendered HTML pages later. Each page uses a PNG export of the sample hero illustration for its Open Graph image. Replace `images/hero-share.png` with your approved JPG/PNG sharing artwork before launch, updating the metadata if its filename changes. Canonical and social-sharing URLs currently use `https://kalava-website.pages.dev`. When `kalava.in` is connected, update these URLs in the HTML files and `js/main.js`.

## Static hosting

Upload the HTML files plus `css/`, `js/` and `images/` to your GitHub repository and connect Cloudflare Pages or another static host that permits ecommerce. GitHub Pages does not allow ecommerce hosting; use GitHub for source code only. No build command is needed; the root is the publish directory. Paths are relative so they also work under a GitHub project subdirectory. Add your custom domain through your host and configure its required DNS records. Do not publish personal customer data or payment credentials.

## Files

- `index.html`: home
- `shop.html`: collection and filters
- `product.html`: dynamic product details, guide and related art
- `cart.html`: bag and WhatsApp checkout
- `about.html`, `contact.html`: story and contact
- `policies.html`: delivery, returns and privacy launch information
- `css/style.css`: single mobile-first stylesheet
- `js/products.js`: business configuration and editable catalogue
- `js/main.js`: menu, catalogue, cart, checkout and contact behavior
- `images/`: local sample SVG artwork, hero, favicon and UPI placeholder
