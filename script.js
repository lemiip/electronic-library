function scrollToCatalog(){
  document.getElementById('catalog').scrollIntoView({
    behavior:'smooth'
  });
}

const searchInput=document.getElementById('searchInput');
const cards=document.querySelectorAll('.card');

searchInput.addEventListener('keyup',()=>{

  const value=searchInput.value.toLowerCase();

  cards.forEach(card=>{

    const text=card.innerText.toLowerCase();

    if(text.includes(value)){
      card.style.display='block';
    }
    else{
      card.style.display='none';
    }

  });

});

const favoriteButtons=document.querySelectorAll('.favorite');

favoriteButtons.forEach(button=>{

  button.addEventListener('click',()=>{

    alert('Книга добавлена в избранное');

  });

});

const form=document.getElementById('contactForm');

form.addEventListener('submit',(e)=>{

  e.preventDefault();

  alert('Сообщение успешно отправлено');

  form.reset();

});
