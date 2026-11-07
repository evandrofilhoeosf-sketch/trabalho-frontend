// --- COMPORTAMENTO DO BOTÃO VOLTAR AO INÍCIO ---

const botaoTopo = document.createElement('button');

botaoTopo.id = 'btnVoltarInicio';
botaoTopo.title = 'Voltar ao início';
botaoTopo.innerHTML = '↑';

document.body.appendChild(botaoTopo);

window.addEventListener('scroll', function() {

    let currentScroll = window.pageYOffset || document.documentElement.scrollTop;

    // Mostra o botão ao rolar mais de 400px para baixo
    if (currentScroll > 400) {
        botaoTopo.style.display = 'block';
    } else {
        botaoTopo.style.display = 'none';
    }

}, { passive: true });

botaoTopo.addEventListener('click', function() {

    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });

});


// --- COMPORTAMENTO DA BARRA DE PESQUISA ---

const searchForm = document.getElementById('searchForm');
const searchToggle = document.getElementById('searchToggle');
const searchInput = document.getElementById('searchInput');

// Verifica se os elementos da pesquisa existem
if (searchForm && searchToggle && searchInput) {

    // Abrir e fechar pesquisa ao clicar na lupa
    searchToggle.addEventListener('click', function() {

        const aberto = searchForm.classList.toggle('search-open');

        searchToggle.setAttribute('aria-expanded', aberto);

        searchToggle.setAttribute(
            'aria-label',
            aberto ? 'Fechar pesquisa' : 'Abrir pesquisa'
        );

        // Coloca o cursor no campo de pesquisa
        if (aberto) {
            searchInput.focus();
        }

    });


    // Fechar pesquisa ao clicar fora dela
    document.addEventListener('click', function(event) {

        if (!searchForm.contains(event.target)) {

            searchForm.classList.remove('search-open');

            searchToggle.setAttribute('aria-expanded', 'false');

            searchToggle.setAttribute('aria-label', 'Abrir pesquisa');

        }

    });


    // Fechar pesquisa ao pressionar ESC
    document.addEventListener('keydown', function(event) {

        if (event.key === 'Escape') {

            searchForm.classList.remove('search-open');

            searchToggle.setAttribute('aria-expanded', 'false');

            searchToggle.setAttribute('aria-label', 'Abrir pesquisa');

        }

    });

}