// Book animation script
document.addEventListener('DOMContentLoaded', function() {
    const book = document.getElementById('book');
    const cover = document.getElementById('book-cover');
    const openBookBtn = document.getElementById('open-book');
    
    // Function to open the book
    function openBook() {
      book.classList.add('book-opened');
      
      // Hide the cover content after animation
      setTimeout(() => {
        cover.style.pointerEvents = 'none';
      }, 1000);
    }
    
    // Add click event listener to the button
    if (openBookBtn) {
      openBookBtn.addEventListener('click', openBook);
    }
    
    // If the page is loaded with a specific route (login or register)
    // we can automatically open the book
    const path = window.location.pathname;
    if (path.includes('login') || path.includes('register')) {
      // Slight delay to ensure animation is visible
      setTimeout(openBook, 500);
      
      // If it's the register page, also show the signup page
      if (path.includes('register')) {
        setTimeout(() => {
          book.classList.add('show-signup');
        }, 1500);
      }
    }
  });