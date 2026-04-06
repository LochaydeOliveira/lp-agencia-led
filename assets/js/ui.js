document.addEventListener('DOMContentLoaded', function() {
    const barra = document.getElementById('barra-topo-fixa');
    const modalFunil = document.getElementById('modalFunil');

    if (!barra) return;

    const checkScroll = () => {

        const jaAprovado = localStorage.getItem('leadQualificadoLED');
        
        if (jaAprovado === 'true') {
            barra.classList.remove('show-bar');
            return;
        }

        if (window.scrollY > 400) {
            barra.classList.add('show-bar');
        } else {
            barra.classList.remove('show-bar');
        }
    };

    window.addEventListener('scroll', checkScroll);

    if (modalFunil) {
        modalFunil.addEventListener('show.bs.modal', () => {
            barra.style.opacity = '0';
        });
        modalFunil.addEventListener('hidden.bs.modal', () => {
            barra.style.opacity = '';
        });
    }
});


if (document.querySelector('.mySwiper')) {
    new Swiper(".mySwiper", {
        loop: true,
        autoplay: { delay: 4000 },
        pagination: { el: ".swiper-pagination", clickable: true },
        slidesPerView: 1,
        spaceBetween: 30,
        breakpoints: { 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }
    });
}


document.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', () => {
        const item = button.parentElement;
        document.querySelectorAll('.faq-item').forEach(i => { if (i !== item) i.classList.remove('active'); });
        item.classList.toggle('active');
    });
});


const elementoPix = document.getElementById('pix-price');

if (elementoPix) {
    const precoPix = 699.90 * 0.9;
    elementoPix.textContent = precoPix.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}