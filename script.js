
const searchInput=document.getElementById('searchInput');

if(searchInput){

searchInput.addEventListener('keyup',()=>{

const value=searchInput.value.toLowerCase();
const cards=document.querySelectorAll('.card');

cards.forEach(card=>{

const text=card.innerText.toLowerCase();

if(text.includes(value)){
card.style.display='block';
}else{
card.style.display='none';
}

});

});

}

const favButtons=document.querySelectorAll('.fav');

favButtons.forEach(btn=>{

btn.addEventListener('click',()=>{

alert('Книга добавлена в избранное');

});

});

const form=document.getElementById('contactForm');

if(form){

form.addEventListener('submit',(e)=>{

e.preventDefault();

alert('Сообщение отправлено');

form.reset();

});

}
