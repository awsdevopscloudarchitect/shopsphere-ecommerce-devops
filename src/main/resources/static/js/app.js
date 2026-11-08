const cart = [];
const panel = document.getElementById('cart-panel');
const overlay = document.getElementById('overlay');
function openCart(){panel.classList.add('open');overlay.classList.add('show')}
function closeCart(){panel.classList.remove('open');overlay.classList.remove('show')}
document.getElementById('cart-toggle').addEventListener('click',openCart);
document.getElementById('cart-close').addEventListener('click',closeCart);
overlay.addEventListener('click',closeCart);
document.querySelectorAll('.add-button').forEach(button=>button.addEventListener('click',()=>{
  const card=button.closest('.product-card'),name=card.dataset.name,price=Number(card.dataset.price);
  const existing=cart.find(item=>item.name===name);
  if(existing)existing.quantity++;else cart.push({name,price,quantity:1});
  renderCart();button.textContent='✓ Added';setTimeout(()=>button.textContent='＋ Add',900);
}));
function renderCart(){
  const count=cart.reduce((sum,item)=>sum+item.quantity,0);
  const total=cart.reduce((sum,item)=>sum+item.price*item.quantity,0);
  document.getElementById('cart-count').textContent=count;
  document.getElementById('cart-total').textContent=`₹${total.toLocaleString('en-IN')}`;
  const container=document.getElementById('cart-items');
  if(!cart.length){container.innerHTML='<p class="empty-cart">Your cart is waiting for something good.</p>';return}
  container.innerHTML=cart.map((item,index)=>`<div class="cart-row"><span><strong>${item.name}</strong><br>₹${item.price.toLocaleString('en-IN')} × ${item.quantity}</span><span><strong>₹${(item.price*item.quantity).toLocaleString('en-IN')}</strong><br><button data-remove="${index}">Remove</button></span></div>`).join('');
  container.querySelectorAll('[data-remove]').forEach(button=>button.addEventListener('click',()=>{cart.splice(Number(button.dataset.remove),1);renderCart()}));
}
document.querySelectorAll('.filter').forEach(button=>button.addEventListener('click',()=>{
  document.querySelectorAll('.filter').forEach(item=>item.classList.remove('active'));button.classList.add('active');
  const filter=button.dataset.filter;
  document.querySelectorAll('.product-card').forEach(card=>card.style.display=filter==='all'||card.dataset.category===filter?'':'none');
}));
document.getElementById('checkout').addEventListener('click',()=>alert('Demo store only. No real payment is collected.'));
