/* Kalava: plain browser JavaScript. No server, framework or build step needed. */
(() => {
  'use strict';
  const products = window.PRODUCTS;
  const store = window.STORE;
  const $ = selector => document.querySelector(selector);
  const money = value => '₹' + value.toLocaleString('en-IN');
  // Escape editable catalogue text before inserting it into HTML.
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const productFor = id => products.find(p => p.id === Number(id));
  const storageKey = 'kalava-cart-v1';
  let cart = [];
  let storageAvailable = true;
  let toastTimer;
  function notify(message) {
    $('#toast').textContent = message;
    $('#toast').classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 6000);
  }
  // Treat browser storage as untrusted: discard invalid products and quantities.
  function cleanCart(value) {
    if (!Array.isArray(value)) return [];
    const result = [];
    value.forEach(item => {
      if (!item || !productFor(item.id) || !Number.isInteger(item.quantity) || item.quantity < 1) return;
      const existing = result.find(row => row.id === Number(item.id));
      if (existing) existing.quantity = Math.min(99, existing.quantity + item.quantity);
      else result.push({id:Number(item.id), quantity:Math.min(99,item.quantity)});
    });
    return result;
  }
  try { cart = cleanCart(JSON.parse(localStorage.getItem(storageKey) || '[]')); }
  catch (_) { cart = []; }
  function countCart() { return cart.reduce((sum,item) => sum + item.quantity, 0); }
  function totalCart() { return cart.reduce((sum,item) => sum + productFor(item.id).price * item.quantity, 0); }
  function updateBadge() { document.querySelectorAll('[data-cart-count]').forEach(el => el.textContent = countCart()); }
  function saveCart() {
    try { localStorage.setItem(storageKey, JSON.stringify(cart)); storageAvailable = true; }
    catch (_) { storageAvailable = false; notify('Your browser cannot save this bag. Please allow site storage to keep it between pages.'); }
    updateBadge();
  }
  function addToCart(id, quantity = 1) {
    const product = productFor(id);
    if (!product) return;
    quantity = Math.max(1,Math.min(99,Math.floor(Number(quantity)||1)));
    const existing = cart.find(item => item.id === product.id);
    if (existing) existing.quantity = Math.min(99,existing.quantity + quantity);
    else cart.push({id:product.id, quantity});
    saveCart();
    if (storageAvailable) notify(`${product.name} added to your bag.`);
  }
  function card(p) {
    return `<article class="product-card"><a class="product-image" href="product.html?id=${p.id}"><img src="${esc(p.image)}" alt="${esc(p.alt)}" loading="lazy" width="600" height="700"></a><div class="product-info"><span class="category">${esc(p.category)} · Framed print</span><h3><a href="product.html?id=${p.id}">${esc(p.name)}</a></h3><p class="price">${money(p.price)}</p><button class="quick-add" data-add="${p.id}" aria-label="Add ${esc(p.name)} to bag">Add to bag +</button></div></article>`;
  }
  // Shared navigation, header counts and footer.
  updateBadge();
  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('#navigation a').forEach(a => { if (a.getAttribute('href') === currentPage) a.setAttribute('aria-current','page'); });
  const menu = $('.menu-toggle');
  function closeMenu() { $('#navigation').classList.remove('open'); menu.setAttribute('aria-expanded','false'); menu.setAttribute('aria-label','Open menu'); }
  menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; $('#navigation').classList.toggle('open',open); menu.setAttribute('aria-expanded',String(open)); menu.setAttribute('aria-label',open?'Close menu':'Open menu'); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu.getAttribute('aria-expanded')==='true') { closeMenu(); menu.focus(); } });
  document.addEventListener('click', event => {
    const add = event.target.closest('[data-add]');
    if (add) addToCart(add.dataset.add);
    if (event.target.closest('[data-whatsapp]')) openWhatsApp('Hello Kalava! I would like to know more about your framed art.');
  });
  // Keep personal data out of storage. It is encoded only into the requested message.
  function whatsappNumber() { return /^\d{10,15}$/.test(store.whatsapp) ? store.whatsapp : ''; }
  function openWhatsApp(message, statusElement) {
    if (!whatsappNumber()) {
      const message = 'WhatsApp ordering will open soon. Kalava’s contact number has not been added yet.';
      if (statusElement) statusElement.textContent = message;
      notify(message); return false;
    }
    window.open('https://wa.me/' + whatsappNumber() + '?text=' + encodeURIComponent(message), '_blank', 'noopener,noreferrer');
    return true;
  }
  if ($('#featured-products')) $('#featured-products').innerHTML = products.slice(0,4).map(card).join('');
  // Filter/sort a copy, so the editable product list remains in its original order.
  if ($('#shop-products')) {
    let filter = 'All';
    function renderShop() {
      let visible = products.filter(p => filter === 'All' || p.category === filter);
      if ($('#sort').value === 'low') visible.sort((a,b) => a.price-b.price);
      if ($('#sort').value === 'high') visible.sort((a,b) => b.price-a.price);
      $('#shop-products').innerHTML = visible.map(card).join('');
      $('#product-count').textContent = `${visible.length} pieces to make your own`;
    }
    document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
      filter = button.dataset.filter;
      document.querySelectorAll('[data-filter]').forEach(b => b.setAttribute('aria-pressed',String(b===button)));
      renderShop();
    }));
    $('#sort').addEventListener('change',renderShop); renderShop();
  }
  // The same product page works for every id: product.html?id=1.
  if ($('#product-detail')) {
    const id = new URLSearchParams(location.search).get('id');
    const p = productFor(id);
    if (!p) {
      document.title = 'Artwork Not Found | Kalava';
      $('#product-detail').innerHTML = '<div class="empty-state"><h1>A little off the wall.</h1><p>We couldn’t find that artwork. Explore the collection to find your next favourite.</p><a class="button" href="shop.html">Back to the collection ↗</a></div>';
    } else {
      document.title = `${p.name} — Framed Art | Kalava`;
      $('meta[name="description"]').content = p.description;
      $('meta[property="og:title"]').content = document.title;
      $('meta[property="og:description"]').content = p.description;
      $('meta[property="og:url"]').content = `https://kalava-website.pages.dev/product.html?id=${p.id}`;
      $('link[rel="canonical"]').href = `https://kalava-website.pages.dev/product.html?id=${p.id}`;
      $('#product-detail').innerHTML = `<div class="breadcrumb"><a href="index.html">Home</a><span>/</span><a href="shop.html">The collection</a><span>/</span><span>${esc(p.name)}</span></div><div class="product-layout"><figure class="product-visual"><img src="${esc(p.image)}" alt="${esc(p.alt)}" width="600" height="700"><figcaption class="caption">Sample artwork · Styled visualisation. Not a customer photo.</figcaption></figure><div class="product-copy"><p class="eyebrow">${esc(p.category)} / THE EVERYDAY COLLECTION</p><h1>${esc(p.name)}</h1><p class="product-price">${money(p.price)}</p><p>${esc(p.description)}</p><dl class="product-specs"><div><dt>Format</dt><dd>Framed art print</dd></div><div><dt>Size</dt><dd>${esc(p.size)} · sample size</dd></div><div><dt>Materials</dt><dd>${esc(p.material)}</dd></div></dl><form id="product-add-form"><label for="product-quantity">Quantity</label><div class="add-row"><div class="quantity"><button type="button" id="quantity-less" aria-label="Decrease quantity">−</button><input id="product-quantity" type="number" min="1" max="99" step="1" value="1" required><button type="button" id="quantity-more" aria-label="Increase quantity">+</button></div><button class="button" type="submit">Add to bag +</button></div></form><p class="caption">Final artwork, frame finish and delivery timeline will be confirmed before payment.</p><a class="text-link" href="#size-guide">Find the right size ↘</a></div></div><div class="product-notes"><div id="size-guide"><h2>A little perspective.</h2><p>Measure your wall and mark out the frame size using paper or removable tape. Step back to see how it sits alongside your furniture.</p><p>The sample size shown is 40 × 50 cm. Confirm final outer frame dimensions before ordering. Room visualisations are styling references, not scale measurements.</p></div><div><details><summary>Delivery & returns</summary><p>Contact Kalava to confirm shipping charges, dispatch dates and returns terms before paying. <a class="text-link" href="policies.html#shipping">Read launch information ↗</a></p></details><details><summary>Reviews & real homes</summary><p>This collection has no customer reviews yet. Genuine reviews and customer photographs will be added when available.</p></details><details><summary>Looking after your print</summary><p>Keep framed artwork away from moisture and direct sunlight. Confirm care instructions for the final frame and glazing material with Kalava.</p></details></div></div><section class="related"><p class="eyebrow">A LITTLE MORE TO LOVE</p><h2>Good company for your walls.</h2><div class="product-grid">${products.filter(other=>other.id!==p.id).slice(0,4).map(card).join('')}</div></section>`;
      $('#quantity-less').addEventListener('click',()=>$('#product-quantity').stepDown());
      $('#quantity-more').addEventListener('click',()=>$('#product-quantity').stepUp());
      $('#product-add-form').addEventListener('submit',event=>{event.preventDefault();addToCart(p.id,$('#product-quantity').value);});
    }
  }
  function renderCart() {
    if (!$('#cart-items')) return;
    $('#checkout').hidden = cart.length === 0;
    $('#cart-summary').hidden = cart.length === 0;
    if (!cart.length) {
      $('#cart-items').innerHTML = '<div class="empty-state"><h2>A space for something lovely.</h2><p>Your bag is empty. Let’s find a piece that feels like home.</p><a class="button" href="shop.html">Explore the collection ↗</a></div>';
      $('#cart-summary').innerHTML = ''; return;
    }
    $('#cart-items').innerHTML = cart.map(item => {
      const p = productFor(item.id);
      return `<article class="cart-row"><a href="product.html?id=${p.id}"><img src="${esc(p.image)}" alt="${esc(p.alt)}" width="90" height="105"></a><div><h3><a href="product.html?id=${p.id}">${esc(p.name)}</a></h3><p>${esc(p.size)} · Framed print</p><p>${money(p.price)} each</p><div class="cart-row-controls"><div class="quantity"><button data-adjust="${p.id}" data-step="-1" aria-label="Decrease ${esc(p.name)} quantity" ${item.quantity===1?'disabled':''}>−</button><input data-quantity="${p.id}" aria-label="Quantity for ${esc(p.name)}" type="number" min="1" max="99" step="1" value="${item.quantity}"><button data-adjust="${p.id}" data-step="1" aria-label="Increase ${esc(p.name)} quantity" ${item.quantity===99?'disabled':''}>+</button></div><button class="remove-item" data-remove="${p.id}">Remove</button><span class="row-total">${money(p.price*item.quantity)}</span></div></div></article>`;
    }).join('');
    $('#cart-summary').innerHTML = `<div class="summary-box"><h2>The lovely details.</h2><div class="summary-line"><span>Subtotal (${countCart()} items)</span><span>${money(totalCart())}</span></div><div class="summary-line"><span>Delivery</span><span>To be confirmed</span></div><div class="summary-line summary-total"><span>Product total</span><span>${money(totalCart())}</span></div><p class="caption">Final charges and any applicable taxes will be confirmed before payment.</p><a href="#checkout" class="button">Continue to checkout ↘</a><a href="shop.html" class="text-link">Keep exploring</a></div>`;
  }
  if ($('#cart-items')) {
    renderCart();
    function changeQuantity(id, quantity) {
      const item = cart.find(row => row.id === Number(id));
      if (!item) return;
      item.quantity = Math.max(1,Math.min(99,Math.floor(Number(quantity)||1)));
      saveCart(); renderCart();
    }
    $('#cart-items').addEventListener('click',event=>{
      const adjust = event.target.closest('[data-adjust]');
      const remove = event.target.closest('[data-remove]');
      if(adjust){const item=cart.find(row=>row.id===Number(adjust.dataset.adjust));changeQuantity(item.id,item.quantity+Number(adjust.dataset.step));const next=document.querySelector(`[data-adjust="${item.id}"][data-step="${adjust.dataset.step}"]`); if(next&&!next.disabled)next.focus();}
      if(remove){cart=cart.filter(row=>row.id!==Number(remove.dataset.remove));saveCart();renderCart();notify('Artwork removed from your bag.');}
    });
    $('#cart-items').addEventListener('change',event=>{if(event.target.matches('[data-quantity]'))changeQuantity(event.target.dataset.quantity,event.target.value);});
    if (store.upiId && /^[\w.\-]+@[\w.\-]+$/.test(store.upiId)) {
      $('#upi-id').textContent='UPI ID: '+store.upiId;
      $('#upi-link').hidden=false;
      // No amount is pre-filled: Kalava must confirm the final payable amount first.
      $('#upi-link').href='upi://pay?pa='+encodeURIComponent(store.upiId)+'&pn=Kalava&cu=INR';
      if(store.upiQr){$('#upi-qr').src=store.upiQr;$('#upi-qr').alt='Kalava UPI payment QR code';}
    }
    $('#checkout-form').addEventListener('submit',event=>{
      event.preventDefault();
      if (!cart.length) {notify('Add a piece to your bag first.');return;}
      const data=new FormData(event.target);
      const name=String(data.get('name')).trim(),phone=String(data.get('phone')).trim(),address=String(data.get('address')).trim();
      if(!name || address.length<15 || phone.replace(/\D/g,'').length<10){$('#checkout-status').textContent='Please enter your name, a valid phone number and complete delivery address.';return;}
      const lines=cart.map(item=>{const p=productFor(item.id);return `${p.name} (ID ${p.id}, ${p.size}) × ${item.quantity} — ${money(p.price*item.quantity)}`;});
      const message=`Hello Kalava! I would like to request an order.\n\n${lines.join('\n')}\n\nProduct total: ${money(totalCart())}\nDelivery and final charges: please confirm.\n\nName: ${name}\nPhone: ${phone}\nAddress: ${address}\n\nPlease confirm artwork, frame specifications, dispatch date, returns terms and the final amount before payment.`;
      if(openWhatsApp(message,$('#checkout-status'))) $('#checkout-status').textContent='Your WhatsApp draft is ready. Send it there to request confirmation. Your bag has been kept until your order is confirmed.';
    });
  }
  if ($('#contact-form')) {
    const emailReady=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(store.email);
    if(emailReady){const link=document.createElement('a');link.href='mailto:'+store.email;link.textContent=store.email;$('#contact-email').replaceChildren(link);}
    $('#contact-form').addEventListener('submit',event=>{
      event.preventDefault();
      if(!emailReady){$('#contact-status').textContent='Our email address has not been added yet. Please check back once Kalava launches.';return;}
      const data=new FormData(event.target);
      const name=String(data.get('name')).trim(),message=String(data.get('message')).trim();
      if(!name||!message){$('#contact-status').textContent='Please enter your name and message.';return;}
      location.href='mailto:'+store.email+'?subject='+encodeURIComponent('Kalava enquiry from '+name)+'&body='+encodeURIComponent(`Name: ${name}\nEmail: ${data.get('email')}\n\n${message}`);
      $('#contact-status').textContent='Send the draft from your email app. This website has not sent it automatically.';
    });
  }
  // When another tab changes the bag, keep this tab in sync.
  window.addEventListener('storage',event=>{if(event.key===storageKey||event.key===null){try{cart=cleanCart(JSON.parse(event.newValue||'[]'));}catch(_){cart=[];}updateBadge();renderCart();}});
})();
