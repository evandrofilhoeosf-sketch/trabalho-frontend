
/* =========================================
   INICIALIZAÇÃO DOS RECURSOS DA PÁGINA
========================================= */

(function () {
    function inicializarPagina() {

        /* =========================================
           MENU HAMBÚRGUER
        ========================================= */

        const menuToggle = document.getElementById('menuToggle');
        const sideNav = document.getElementById('sideNav');

        if (menuToggle && sideNav) {

            function fecharMenu() {
                sideNav.classList.remove('menu-aberto');

                menuToggle.setAttribute('aria-expanded', 'false');
                menuToggle.setAttribute('aria-label', 'Abrir menu');
            }

            menuToggle.addEventListener('click', function (event) {
                event.stopPropagation();

                const aberto = sideNav.classList.toggle('menu-aberto');

                menuToggle.setAttribute('aria-expanded', String(aberto));
                menuToggle.setAttribute(
                    'aria-label',
                    aberto ? 'Fechar menu' : 'Abrir menu'
                );
            });

            sideNav.querySelectorAll('a').forEach(function (link) {
                link.addEventListener('click', fecharMenu);
            });

            document.addEventListener('click', function (event) {
                if (
                    !sideNav.contains(event.target) &&
                    !menuToggle.contains(event.target)
                ) {
                    fecharMenu();
                }
            });

            document.addEventListener('keydown', function (event) {
                if (event.key === 'Escape') {
                    fecharMenu();
                }
            });

            window.addEventListener('resize', function () {
                if (window.innerWidth > 600) {
                    fecharMenu();
                }
            });
        }


        /* =========================================
           PESQUISA EXPANSÍVEL
        ========================================= */

        const searchForm = document.getElementById('searchForm');
        const searchToggle = document.getElementById('searchToggle');
        const searchInput = document.getElementById('searchInput');

        if (searchForm && searchToggle && searchInput) {

            function fecharPesquisa() {
                searchForm.classList.remove('search-open');

                searchToggle.setAttribute('aria-expanded', 'false');
                searchToggle.setAttribute('aria-label', 'Abrir pesquisa');
            }

            searchToggle.addEventListener('click', function (event) {
                event.stopPropagation();

                const aberta = searchForm.classList.toggle('search-open');

                searchToggle.setAttribute('aria-expanded', String(aberta));
                searchToggle.setAttribute(
                    'aria-label',
                    aberta ? 'Fechar pesquisa' : 'Abrir pesquisa'
                );

                if (aberta) {
                    searchInput.focus();
                }
            });

            document.addEventListener('click', function (event) {
                if (
                    !searchForm.contains(event.target) &&
                    !searchToggle.contains(event.target)
                ) {
                    fecharPesquisa();
                }
            });

            document.addEventListener('keydown', function (event) {
                if (event.key === 'Escape') {
                    fecharPesquisa();
                }
            });
        }


        /* =========================================
           BOTÃO VOLTAR AO INÍCIO
        ========================================= */

        const botaoTopo = document.getElementById('btnVoltarInicio');

        if (botaoTopo) {

            function atualizarBotaoTopo() {
                const deveAparecer = window.scrollY > 400;

                botaoTopo.style.display = deveAparecer ? 'flex' : 'none';

                botaoTopo.setAttribute(
                    'aria-hidden',
                    String(!deveAparecer)
                );

                botaoTopo.tabIndex = deveAparecer ? 0 : -1;
            }

            window.addEventListener('scroll', atualizarBotaoTopo, {
                passive: true
            });

            atualizarBotaoTopo();

            botaoTopo.addEventListener('click', function (event) {
                event.preventDefault();

                window.scrollTo({
                    top: 0,
                    left: 0,
                    behavior: 'smooth'
                });
            });
        }


        /* =========================================
           CABEÇALHO REDUZIDO AO ROLAR
        ========================================= */

        const cabecalho = document.querySelector('.site-header');

        if (cabecalho) {

            function atualizarCabecalho() {

                if (window.scrollY > 60) {
                    cabecalho.classList.add('header-reduzido');
                } else {
                    cabecalho.classList.remove('header-reduzido');
                }
            }

            window.addEventListener('scroll', atualizarCabecalho, {
                passive: true
            });

            atualizarCabecalho();
        }


        /* =========================================
           RODAPÉ FIXO COM ESPAÇO AUTOMÁTICO
        ========================================= */

        const rodape = document.querySelector('footer');

        if (rodape) {

            function ajustarAlturaRodape() {
                const altura = rodape.offsetHeight;

                document.body.style.setProperty(
                    '--footer-height',
                    altura + 'px'
                );
            }

            ajustarAlturaRodape();

            window.addEventListener('resize', ajustarAlturaRodape);

            window.addEventListener('load', ajustarAlturaRodape);

            if (window.ResizeObserver) {
                const observador = new ResizeObserver(ajustarAlturaRodape);
                observador.observe(rodape);
            }
        }
    }

    /* =========================================
       AGUARDA O HTML SER CARREGADO
    ========================================= */

    if (document.readyState === 'loading') {
        document.addEventListener(
            'DOMContentLoaded',
            inicializarPagina,
            { once: true }
        );
    } else {
        inicializarPagina();
    }

})();
