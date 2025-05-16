
const hamburgerBtn = document.getElementById('hamburgerBtn');
const navWrapper = document.getElementById('navWrapper');
  hamburgerBtn.addEventListener('click', () => {
    navWrapper.classList.toggle('active');
    hamburgerBtn.classList.toggle('active');
  });

  
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navWrapper.classList.remove('active');
      hamburgerBtn.classList.remove('active');
    });
  });