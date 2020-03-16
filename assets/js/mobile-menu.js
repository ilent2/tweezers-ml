
var menuButton = document.querySelector('#menu-button');
var menuContainer = document.querySelector('#mobile-menu');

menuButton.onclick = function() {
  menuContainer.classList.toggle('open');
}

