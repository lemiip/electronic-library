
const searchInput = document.getElementById('searchInput');

function debounce(fn, wait = 250){
	let t;
	return function(...args){
		clearTimeout(t);
		t = setTimeout(()=>fn.apply(this,args), wait);
	};
}

if(searchInput){
	const cards = document.querySelectorAll('.card');
	const searchCount = document.getElementById('searchCount');
	const doSearch = () => {
		const value = searchInput.value.toLowerCase().trim();
		cards.forEach(card => {
			const text = (card.dataset.title || card.innerText).toLowerCase();
			card.style.display = text.includes(value) ? '' : 'none';
		});
		if(searchCount){
			const visible = Array.from(cards).filter(c=>c.style.display !== 'none').length;
			searchCount.innerText = `Показано: ${visible}`;
		}
	};
	searchInput.addEventListener('input', debounce(doSearch, 240));
}

// Favorites persistence (store objects {title,author,img} when possible)
let favorites = [];
const rawFav = localStorage.getItem('favorites');
try{ favorites = rawFav ? JSON.parse(rawFav) : []; }catch(e){ favorites = []; }

function saveFavorites(){ localStorage.setItem('favorites', JSON.stringify(favorites)); }

// If favorites were simple strings, migrate to objects when possible
function migrateFavorites(){
	if(!Array.isArray(favorites)) favorites = [];
	const needMigration = favorites.length && typeof favorites[0] === 'string';
	if(!needMigration) return;
	const map = {};
	document.querySelectorAll('.card').forEach(c=>{
		const t = c.dataset.title || c.querySelector('h3')?.innerText;
		if(t) map[t] = { title: t, author: c.dataset.author || c.querySelector('p')?.innerText || '', img: c.querySelector('img')?.src || '' };
	});
	favorites = favorites.map(t => map[t] || { title: t });
	saveFavorites();
}

// Set visual state for a fav button
function setFavState(btn, isFav){
	if(isFav){ btn.classList.add('active'); btn.innerText = 'В избранном'; }
	else{ btn.classList.remove('active'); btn.innerText = 'В избранное'; }
}

// simple toast
function showToast(msg, ms = 2000){
	let t = document.getElementById('siteToast');
	if(!t){ t = document.createElement('div'); t.id = 'siteToast'; t.className = 'toast'; document.body.appendChild(t); }
	t.innerText = msg; t.classList.add('show');
	clearTimeout(t._h);
	t._h = setTimeout(()=>{ t.classList.remove('show'); }, ms);
}

// Initialize favorite buttons (also used after rendering dynamic lists)
function initFavButtons(){
	document.querySelectorAll('.fav').forEach(btn=>{
		// only set visual state here; actual toggling handled by delegated listener
		const card = btn.closest('.card');
		const title = card ? (card.dataset.title || card.querySelector('h3')?.innerText) : btn.dataset.title;
		setFavState(btn, favorites.some(f=>f.title === title));
		btn._favHandler = null;
	});
}

migrateFavorites();
initFavButtons();

// Delegated handler for fav buttons (works for static and dynamically added buttons)
document.addEventListener('click', function(e){
	const btn = e.target.closest('.fav');
	if(!btn) return;
	// find card info
	const card = btn.closest('.card');
	const title = card ? (card.dataset.title || card.querySelector('h3')?.innerText) : btn.dataset.title;
	const author = card ? (card.dataset.author || card.querySelector('p')?.innerText || '') : '';
	const img = card ? (card.querySelector('img')?.src || '') : '';

	const idx = favorites.findIndex(f=>f.title === title);
	if(idx > -1){
		favorites.splice(idx,1);
		setFavState(btn, false);
		// sync modal
		document.querySelectorAll('.modal-fav').forEach(m=>{ if(m.dataset.title === title) setFavState(m, false); });
		showToast('Убрано из избранного');
	} else {
		favorites.push({ title, author, img });
		setFavState(btn, true);
		document.querySelectorAll('.modal-fav').forEach(m=>{ if(m.dataset.title === title) setFavState(m, true); });
		showToast('Добавлено в избранное');
	}
	saveFavorites();
	renderFavoritesPage();
});

const form = document.getElementById('contactForm');

if(form){
	form.addEventListener('submit',(e)=>{
		e.preventDefault();
		const name = form.querySelector('input[type="text"]').value.trim();
		const email = form.querySelector('input[type="email"]').value.trim();
		const msg = form.querySelector('textarea').value.trim();
		if(!name || !email || !msg){
			alert('Пожалуйста, заполните все поля');
			return;
		}
		alert('Сообщение отправлено');
		form.reset();
	});
}

// Nav toggle for mobile
// Nav toggle for mobile — attach to all toggles and toggle local .nav-bar.open
document.querySelectorAll('.nav-toggle').forEach(toggle => {
	const bar = toggle.closest('.nav-bar');
	if(!bar) return;
	const nav = bar.querySelector('nav');

	toggle.addEventListener('click', (e) => {
		e.stopPropagation();
		bar.classList.toggle('open');
	});

	// close when clicking outside this nav-bar
	document.addEventListener('click', (e) => {
		if(bar.classList.contains('open')){
			if(!bar.contains(e.target)) bar.classList.remove('open');
		}
	});

	// ensure closed after resize to desktop
	window.addEventListener('resize', ()=>{
		if(window.innerWidth > 768) bar.classList.remove('open');
	});
});

// Modal and dynamic rendering
const modal = document.getElementById('bookModal');
const modalTitle = modal?.querySelector('.modal-title');
const modalAuthor = modal?.querySelector('.modal-author');
const modalCover = modal?.querySelector('.modal-cover');
const modalDesc = modal?.querySelector('.modal-desc');
const modalFav = modal?.querySelector('.modal-fav');
const modalClose = modal?.querySelector('.modal-close');

function openModalForCard(card){
	if(!modal || !card) return;
	const title = card.dataset.title || card.querySelector('h3')?.innerText || '';
	const author = card.dataset.author || card.querySelector('p')?.innerText || '';
	const img = card.querySelector('img')?.src || '';
	modalTitle.innerText = title;
	modalAuthor.innerText = author;
	modalCover.src = img;
	modalCover.alt = title + ' — обложка';
	modalFav.dataset.title = title;
	// set fav visual
	setFavState(modalFav, favorites.some(f=>f.title===title));
	modal.setAttribute('aria-hidden','false');
}

function closeModal(){
	if(!modal) return;
	modal.setAttribute('aria-hidden','true');
}

// open modal when clicking a card (excluding fav button)
document.addEventListener('click', (e)=>{
	const card = e.target.closest('.card');
	if(card && !e.target.closest('.fav')){
		openModalForCard(card);
	}
});

modalClose?.addEventListener('click', closeModal);
modal?.querySelector('.modal-backdrop')?.addEventListener('click', closeModal);
// also close when clicking on modal container (outside modal-content)
modal?.addEventListener('click', (e) => {
	if(e.target === modal || e.target.classList.contains('modal-backdrop')) closeModal();
});

// modal fav handler
if(modalFav){
	modalFav.addEventListener('click', ()=>{
		const title = modalFav.dataset.title;
		const idx = favorites.findIndex(f=>f.title===title);
		if(idx>-1){ favorites.splice(idx,1); setFavState(modalFav,false); }
		else{ favorites.push({ title, author: modalAuthor.innerText, img: modalCover.src }); setFavState(modalFav,true); }
		saveFavorites();
		initFavButtons();
		renderFavoritesPage();
		showToast(idx>-1 ? 'Убрано из избранного' : 'Добавлено в избранное');
	});
}

// Render favorites page if present
function renderFavoritesPage(){
	const container = document.getElementById('favoritesContainer');
	const empty = document.getElementById('favoritesEmpty');
	if(!container) return;
	container.innerHTML = '';
	// ensure favorites are objects {title,author,img}
	if(!favorites.length){
		if(empty) empty.style.display = '';
		return;
	}
	if(empty) empty.style.display = 'none';
	favorites.forEach(item =>{
		const f = (typeof item === 'string') ? { title: item, author: '', img: '' } : item || { title: '', author: '', img: '' };
		const div = document.createElement('div');
		div.className = 'card';
		if(f.title) div.dataset.title = f.title;
		if(f.author) div.dataset.author = f.author;
		div.innerHTML = `
			<img src="${f.img || 'download.jpg'}" alt="${f.title} — обложка">
			<h3>${f.title}</h3>
			<p>${f.author || ''}</p>
			<button class="fav">В избранное</button>
		`;
		container.appendChild(div);
	});
	initFavButtons();
}

// If on favorites page, migrate old data if needed and render on load
if(document.getElementById('favoritesContainer')){
	migrateFavorites();
	renderFavoritesPage();
}

// Clear favorites button (on favorites page)
const clearFavBtn = document.getElementById('clearFavorites');
if(clearFavBtn){
	clearFavBtn.addEventListener('click', ()=>{
		if(!confirm('Очистить все избранные?')) return;
		favorites = [];
		saveFavorites();
		renderFavoritesPage();
		showToast('Избранное очищено');
	});
}
