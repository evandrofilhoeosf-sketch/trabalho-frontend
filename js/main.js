
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
   PESQUISA EXPANSÍVEL E FUNCIONAL
========================================= */

const searchForm = document.getElementById('searchForm');
const searchToggle = document.getElementById('searchToggle');
const searchInput = document.getElementById('searchInput');

if (searchForm && searchToggle && searchInput) {

    // Cria a área dos resultados automaticamente
    const resultadosPesquisa = document.createElement('div');
    resultadosPesquisa.className = 'site-search-results';
    resultadosPesquisa.id = 'searchResults';
    resultadosPesquisa.setAttribute('aria-live', 'polite');

    searchForm.parentElement.appendChild(resultadosPesquisa);

    // Páginas disponíveis no site
    const paginas = [
        { nome: 'Home', arquivo: 'index.html' },
        { nome: 'Lugares e Cultura', arquivo: 'lugares.html' },
        { nome: 'Onde Comer?', arquivo: 'onde-comer.html' },
        { nome: 'Padaria e Confeitaria', arquivo: 'padaria-confeitaria.html' },
        { nome: 'Mulheres em Vitória', arquivo: 'mulheres.html' },
        { nome: 'Eventos', arquivo: 'eventos.html' },
        { nome: 'Contatos', arquivo: 'contatos.html' }
    ];

    function normalizarTexto(texto) {
        return texto
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();
    }

    function fecharPesquisa() {
        searchForm.classList.remove('search-open');
        resultadosPesquisa.classList.remove('resultados-abertos');

        searchToggle.setAttribute('aria-expanded', 'false');
        searchToggle.setAttribute('aria-label', 'Abrir pesquisa');
    }

    // Executa a pesquisa
    async function pesquisar() {

        const termo = normalizarTexto(searchInput.value.trim());

        if (!termo) {
            resultadosPesquisa.innerHTML =
                '<p>Digite algo para pesquisar.</p>';
            resultadosPesquisa.classList.add('resultados-abertos');
            return;
        }

        resultadosPesquisa.innerHTML =
            '<p>Pesquisando...</p>';

        resultadosPesquisa.classList.add('resultados-abertos');

        const termos = termo.split(/\s+/);

        try {

            const paginasPesquisadas = await Promise.all(
                paginas.map(async function (pagina) {

                    try {
                        const resposta = await fetch(pagina.arquivo);

                        if (!resposta.ok) return null;

                        const html = await resposta.text();

                        const documento = new DOMParser()
                            .parseFromString(html, 'text/html');

                        const conteudo =
                            documento.querySelector('main') ||
                            documento.body;

                        const titulo =
                            documento.querySelector('h1')?.textContent ||
                            pagina.nome;

                        const texto = normalizarTexto(
                            titulo + ' ' + conteudo.textContent
                        );

                        const quantidade = termos.filter(
                            palavra => texto.includes(palavra)
                        ).length;

                        if (quantidade === 0) return null;

                        return {
                            nome: titulo.trim(),
                            arquivo: pagina.arquivo,
                            pontuacao: quantidade
                        };

                    } catch (erro) {
                        console.warn(
                            'Não foi possível pesquisar:',
                            pagina.arquivo
                        );
                        return null;
                    }
                })
            );

            const encontrados = paginasPesquisadas
                .filter(Boolean)
                .sort((a, b) => b.pontuacao - a.pontuacao);

            resultadosPesquisa.innerHTML = '';

            const titulo = document.createElement('p');
            titulo.className = 'search-results-heading';

            titulo.textContent =
                encontrados.length + ' resultado(s) encontrado(s)';

            resultadosPesquisa.appendChild(titulo);

            if (encontrados.length === 0) {

                const mensagem = document.createElement('p');
                mensagem.textContent =
                    'Nenhum resultado encontrado. Tente outra palavra.';

                resultadosPesquisa.appendChild(mensagem);
                return;
            }

            encontrados.forEach(function (resultado) {

                const link = document.createElement('a');

                link.href = resultado.arquivo;
                link.className = 'search-result-link';
                link.textContent = resultado.nome;

                resultadosPesquisa.appendChild(link);
            });

        } catch (erro) {

            resultadosPesquisa.innerHTML =
                '<p>Erro ao realizar a pesquisa.</p>';

            console.error(erro);
        }
    }


            searchToggle.addEventListener('click', function (event) {

                event.preventDefault();
                event.stopPropagation();

                if (searchForm.classList.contains('search-open')) {

                    if (searchInput.value.trim()) {
                        pesquisar();
                    } else {
                        fecharPesquisa();
                    }

                } else {

                    searchForm.classList.add('search-open');

                    searchToggle.setAttribute('aria-expanded', 'true');
                    searchToggle.setAttribute('aria-label', 'Pesquisar');

                    searchInput.focus();
                }
            });

            // Também permite pesquisar apertando Enter
            searchForm.addEventListener('submit', function (event) {
                event.preventDefault();
                pesquisar();
            });

            // Fecha ao clicar fora
            document.addEventListener('click', function (event) {

                if (
                    !searchForm.contains(event.target) &&
                    !resultadosPesquisa.contains(event.target)
                ) {
                    fecharPesquisa();
                }
            });

            // Fecha com ESC
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