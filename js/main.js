
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

            // Cria a área de resultados
            const resultadosPesquisa = document.createElement('div');

            resultadosPesquisa.className = 'site-search-results';
            resultadosPesquisa.id = 'searchResults';
            resultadosPesquisa.setAttribute('aria-live', 'polite');

            searchForm.parentElement.appendChild(resultadosPesquisa);


            // Páginas disponíveis
            const paginas = [
                { nome: 'Home', arquivo: 'index.html' },
                { nome: 'Lugares e Cultura', arquivo: 'lugares.html' },
                { nome: 'Onde Comer?', arquivo: 'onde-comer.html' },
                { nome: 'Padaria e Confeitaria', arquivo: 'padaria-confeitaria.html' },
                { nome: 'Mulheres em Vitória', arquivo: 'mulheres.html' },
                { nome: 'Eventos', arquivo: 'eventos.html' },
                { nome: 'Contatos', arquivo: 'contatos.html' }
            ];


            // Normaliza os textos
            function normalizarTexto(texto) {
                return texto
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .toLowerCase()
                    .trim();
            }


            // Fecha a pesquisa
            function fecharPesquisa() {

                searchForm.classList.remove('search-open');
                resultadosPesquisa.classList.remove('resultados-abertos');

                searchToggle.setAttribute('aria-expanded', 'false');
                searchToggle.setAttribute('aria-label', 'Abrir pesquisa');

                resultadosPesquisa.innerHTML = '';
            }


            // Realiza a pesquisa
            async function pesquisar() {

                const termoOriginal = searchInput.value.trim();
                const termo = normalizarTexto(termoOriginal);

                if (!termo) {
                    resultadosPesquisa.innerHTML =
                        '<p>Digite algo para pesquisar.</p>';

                    resultadosPesquisa.classList.add('resultados-abertos');
                    return;
                }

                resultadosPesquisa.innerHTML =
                    '<p>Pesquisando...</p>';

                resultadosPesquisa.classList.add('resultados-abertos');

                const termos = [...new Set(termo.split(/\s+/))];

                try {

                    const paginasPesquisadas = await Promise.all(

                        paginas.map(async function (pagina) {

                            try {

                                // Localiza a página
                                const endereco = new URL(
                                    pagina.arquivo,
                                    document.baseURI
                                );

                                const resposta = await fetch(endereco.href);

                                if (!resposta.ok) {
                                    console.warn(
                                        'Página não encontrada:',
                                        pagina.arquivo
                                    );
                                    return null;
                                }

                                const html = await resposta.text();

                                const documento = new DOMParser()
                                    .parseFromString(html, 'text/html');


                                // Pesquisa no conteúdo principal
                                const conteudo =
                                    documento.querySelector('main') ||
                                    documento.body;


                                const titulo =
                                    conteudo.querySelector('h1')?.textContent?.trim() ||
                                    documento.title ||
                                    pagina.nome;


                                const textoConteudo = normalizarTexto(
                                    conteudo.textContent || ''
                                );

                                const textoTitulo = normalizarTexto(titulo);


                                // Identifica elementos com ID
                                const elementos = [
                                    ...conteudo.querySelectorAll(
                                        'article[id], section[id], [id]'
                                    )
                                ];


                        
                                const candidatos = elementos
                                    .map(function (elemento) {

                                        // VERIFICA SE O ELEMENTO ESTÁ VISÍVEL NA PÁGINA
                                        const estaVisivel = elemento.offsetParent !== null && 
                                                            window.getComputedStyle(elemento).display !== 'none' &&
                                                            window.getComputedStyle(elemento).visibility !== 'hidden';

                                        // Se não estiver visível, ignora o elemento
                                        if (!estaVisivel) {
                                            return null;
                                        }

                                        const textoElemento = normalizarTexto(
                                            elemento.textContent || ''
                                        );

                                        const palavrasEncontradas = termos.filter(
                                            function (palavra) {
                                                return textoElemento.includes(palavra);
                                            }
                                        );

                                        const correspondeTodos = termos.every(
                                            function (palavra) {
                                                return textoElemento.includes(palavra);
                                            }
                                        );

                                        const tituloElemento =
                                            elemento.querySelector('h2, h3, h4');

                                        const nomeElemento =
                                            tituloElemento?.textContent.trim() ||
                                            elemento.id;

                                        const textoTituloElemento =
                                            normalizarTexto(nomeElemento);

                                        let pontuacaoElemento =
                                            palavrasEncontradas.length;

                                        // Prioriza títulos que correspondem à pesquisa
                                        termos.forEach(function (palavra) {
                                            if (textoTituloElemento.includes(palavra)) {
                                                pontuacaoElemento += 5;
                                            }
                                        });

                                        // Prioriza a expressão completa
                                        if (textoElemento.includes(termo)) {
                                            pontuacaoElemento += 5;
                                        }

                                        return {
                                            elemento: elemento,
                                            nome: nomeElemento,
                                            pontuacao: pontuacaoElemento,
                                            correspondeTodos: correspondeTodos
                                        };

                                    })
                                    .filter(function (item) {
                                        // Remove os nulos (elementos ocultos ou que não correspondem)
                                        return item !== null && item.correspondeTodos;
                                    })
                                    .sort(function (a, b) {
                                        // Primeiro, os melhores títulos
                                        if (b.pontuacao !== a.pontuacao) {
                                            return b.pontuacao - a.pontuacao;
                                        }

                                        // Depois, o conteúdo mais específico
                                        return (
                                            a.elemento.textContent.length -
                                            b.elemento.textContent.length
                                        );
                                    });


                                const alvo = candidatos[0];


                                // Verifica se a página possui correspondência
                                const encontrados = termos.filter(
                                    function (palavra) {
                                        return textoConteudo.includes(palavra);
                                    }
                                );


                                if (encontrados.length === 0) {
                                    return null;
                                }


                                // Pontuação geral da página
                                let pontuacao = encontrados.length;

                                termos.forEach(function (palavra) {

                                    if (textoTitulo.includes(palavra)) {
                                        pontuacao += 3;
                                    }

                                });


                                if (textoConteudo.includes(termo)) {
                                    pontuacao += 5;
                                }


                                // Monta o endereço da seção específica
                                const destino = alvo
                                    ? endereco.href + '#' +
                                      encodeURIComponent(alvo.elemento.id)
                                    : endereco.href;


                                return {
                                    nome: alvo
                                        ? alvo.nome
                                        : titulo,

                                    arquivo: destino,

                                    pontuacao: pontuacao +
                                        (alvo ? alvo.pontuacao : 0)
                                };


                            } catch (erro) {

                                console.warn(
                                    'Erro ao consultar:',
                                    pagina.arquivo,
                                    erro
                                );

                                return null;
                            }

                        })

                    );


                    // Organiza os resultados
                    const encontrados = paginasPesquisadas
                        .filter(Boolean)
                        .sort(function (a, b) {
                            return b.pontuacao - a.pontuacao;
                        });


                    resultadosPesquisa.innerHTML = '';


                    // Título dos resultados
                    const tituloResultados = document.createElement('p');

                    tituloResultados.className = 'search-results-heading';

                    tituloResultados.textContent =
                        encontrados.length +
                        (encontrados.length === 1
                            ? ' resultado encontrado'
                            : ' resultados encontrados');

                    resultadosPesquisa.appendChild(tituloResultados);


                    // Nenhum resultado
                    if (encontrados.length === 0) {

                        const mensagem = document.createElement('p');

                        mensagem.textContent =
                            'Nenhum resultado encontrado. Tente outra palavra.';

                        resultadosPesquisa.appendChild(mensagem);

                        return;
                    }


                    // Exibe os resultados
                    encontrados.forEach(function (resultado) {

                        const link = document.createElement('a');

                        link.href = resultado.arquivo;
                        link.className = 'search-result-link';
                        link.textContent = resultado.nome;

                        resultadosPesquisa.appendChild(link);

                    });

                } catch (erro) {

                    console.error('Erro na pesquisa:', erro);

                    resultadosPesquisa.innerHTML =
                        '<p>Não foi possível realizar a pesquisa. Verifique o servidor do site.</p>';
                }
            }


            // Abre ou executa a pesquisa
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


            // Pesquisa pelo Enter
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


            // Fecha pelo Escape
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
                cabecalho.classList.toggle(
                    'header-reduzido',
                    window.scrollY > 60
                );
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

                document.body.style.paddingBottom = altura + 'px';

            }

            ajustarAlturaRodape();

            window.addEventListener('resize', ajustarAlturaRodape);

            window.addEventListener('load', ajustarAlturaRodape);

            if (window.ResizeObserver) {

                const observador = new ResizeObserver(
                    ajustarAlturaRodape
                );

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
