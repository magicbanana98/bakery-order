// Menu data: edit this list to change what the shop sells.
const MENU = [
  { id: "pandesal", name: "Pandesal", desc: "10 pieces, soft and lightly sweet", price: 35 },
  { id: "ube-cheese", name: "Ube cheese pandesal", desc: "6 pieces, ube filling with melted cheese", price: 85 },
  { id: "ensaymada", name: "Ensaymada", desc: "Buttery, topped with sugar and cheese", price: 45 },
  { id: "spanish", name: "Spanish bread", desc: "Rolled with sweet buttery filling", price: 25 },
  { id: "pan-de-coco", name: "Pan de coco", desc: "Sweet coconut filling", price: 20 },
];

const peso = (n) => "₱" + n.toLocaleString("en-PH");
const qty = Object.fromEntries(MENU.map((m) => [m.id, 0]));

const menuList = document.getElementById("menuList");
const cart = document.getElementById("cart");
const totalEl = document.getElementById("total");
const form = document.getElementById("orderForm");
const errorEl = document.getElementById("error");
const confirmation = document.getElementById("confirmation");

function renderMenu() {
  menuList.innerHTML = MENU.map((m) => `
    <li>
      <div>
        <div class="item-name">${m.name}</div>
        <p class="item-desc">${m.desc}</p>
        <span class="item-price">${peso(m.price)}</span>
      </div>
      <div class="stepper">
        <button type="button" data-id="${m.id}" data-change="-1" aria-label="Remove one ${m.name}">−</button>
        <span class="qty" id="qty-${m.id}" aria-live="polite">0</span>
        <button type="button" data-id="${m.id}" data-change="1" aria-label="Add one ${m.name}">+</button>
      </div>
    </li>`).join("");
}

function orderLines() {
  return MENU.filter((m) => qty[m.id] > 0).map((m) => ({
    name: m.name,
    qty: qty[m.id],
    subtotal: qty[m.id] * m.price,
  }));
}

function orderTotal() {
  return orderLines().reduce((sum, l) => sum + l.subtotal, 0);
}

function lineHtml(l) {
  return `<li><span>${l.qty} × ${l.name}</span><span>${peso(l.subtotal)}</span></li>`;
}

function renderCart() {
  MENU.forEach((m) => {
    document.getElementById("qty-" + m.id).textContent = qty[m.id];
  });
  const lines = orderLines();
  cart.innerHTML = lines.length
    ? lines.map(lineHtml).join("")
    : '<li class="empty">Add bread from the menu.</li>';
  totalEl.textContent = peso(orderTotal());
}

menuList.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-id]");
  if (!btn) return;
  const id = btn.dataset.id;
  qty[id] = Math.max(0, qty[id] + Number(btn.dataset.change));
  errorEl.textContent = "";
  renderCart();
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const name = data.get("name").trim();
  const phone = data.get("phone").trim();
  const pickup = data.get("pickup");

  if (orderLines().length === 0) {
    errorEl.textContent = "Add at least one item to your order.";
    return;
  }
  if (!name || !phone || !pickup) {
    errorEl.textContent = "Enter your name, mobile number, and pickup time.";
    return;
  }

  const order = {
    name,
    phone,
    pickup,
    notes: data.get("notes").trim(),
    items: orderLines(),
    total: orderTotal(),
  };

  // Step 2 will send this object to a Google Sheet instead of the console.
  console.log("New order:", order);

  document.getElementById("confirmText").textContent =
    `Thanks, ${order.name}. Your order will be ready at ${order.pickup}. We’ll text ${order.phone} if anything changes.`;
  document.getElementById("confirmItems").innerHTML = order.items.map(lineHtml).join("");
  document.getElementById("confirmTotal").textContent = peso(order.total);
  form.hidden = true;
  confirmation.hidden = false;
});

document.getElementById("again").addEventListener("click", () => {
  MENU.forEach((m) => (qty[m.id] = 0));
  form.reset();
  renderCart();
  confirmation.hidden = true;
  form.hidden = false;
});

renderMenu();
renderCart();
