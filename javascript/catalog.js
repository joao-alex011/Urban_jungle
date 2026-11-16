// catalog.js

// 1. Pegando os elementos dos filtros no HTML
const formularioFiltro = document.getElementById('catalog-filter-form');
const campoPesquisa = document.getElementById('input-catalog-search');
const filtroLuz = document.getElementById('select-catalog-light');
const filtroAgua = document.getElementById('select-catalog-water');

// Pegando todos os cards de plantas da página
const listaCards = document.querySelectorAll('.species-card');

// Pegando os elementos do modal (Ficha Completa)
const modalFicha = document.getElementById('species-details-dialog');
const tituloModal = document.getElementById('species-dialog-title');
const descricaoModal = document.getElementById('species-dialog-description');
const botoesFicha = document.querySelectorAll('.btn-view-species');

// 2. "Banco de Dados" simples das 6 plantas para mostrar na Ficha Completa
const bancoDeEspecies = {
  'sp-monstera': {
    nome: 'Costela-de-Adão (Monstera deliciosa)',
    detalhes: 'Substrato rico em matéria orgânica e bem drenado. Limpe as folhas com pano úmido uma vez por mês e coloque um tutor para ela subir.'
  },
  'sp-sansevieria': {
    nome: 'Espada-de-São-Jorge (Dracaena trifasciata)',
    detalhes: 'Use terra comum misturada com areia. Nunca encharque o vaso, pois as raízes apodrecem facilmente com excesso de água.'
  },
  'sp-calathea': {
    nome: 'Maranta Pavão (Goeppertia makoyana)',
    detalhes: 'Gosta de umidade alta! Borrife água nas folhas em dias secos e nunca deixe tomar sol direto para não queimar as bordas.'
  },
  'sp-pothos': {
    nome: 'Jiboia (Epipremnum aureum)',
    detalhes: 'Planta pendente muito fácil de cuidar. Pode ser cultivada na terra ou até na água. Faça podas nas pontas para ela crescer mais cheia.'
  },
  'sp-zamioculca': {
    nome: 'Zamioculca (Zamioculcas zamiifolia)',
    detalhes: 'Excelente para escritórios e locais fechados com pouca janela. Ela guarda água nas batatas da raiz, então regue bem pouco.'
  },
  'sp-echeveria': {
    nome: 'Suculenta Rosa-de-Pedra (Echeveria elegans)',
    detalhes: 'Precisa de sol direto para não ficar esticada (estiolada). Regue direto na terra sem molhar o miolo das folhas.'
  }
};

// Salva esse banco de dados no localStorage para outras páginas poderem consultar se precisarem
localStorage.setItem('catalogo_especies', JSON.stringify(bancoDeEspecies));

// 3. Função que filtra os cards na tela
function filtrarPlantas() {
  const textoDigitado = campoPesquisa.value.toLowerCase();
  const luzEscolhida = filtroLuz.value;
  const aguaEscolhida = filtroAgua.value;

  // Passa por cada card da página usando um laço for simples
  for (let i = 0; i < listaCards.length; i++) {
    const card = listaCards[i];

    // Pega os textos e atributos do card atual
    const nomePlanta = card.querySelector('.species-common-name').textContent.toLowerCase();
    const nomeCientifico = card.querySelector('.species-scientific-name').textContent.toLowerCase();
    const luzDaPlanta = card.getAttribute('data-light');
    const aguaDaPlanta = card.getAttribute('data-water');

    // Verifica se o texto digitado aparece no nome popular ou científico
    const bateuTexto = nomePlanta.includes(textoDigitado) || nomeCientifico.includes(textoDigitado);

    // Verifica se a luz bate com o filtro (ou se está em "all")
    const bateuLuz = (luzEscolhida === 'all') || (luzDaPlanta === luzEscolhida);

    // Verifica se a água bate com o filtro (ou se está em "all")
    const bateuAgua = (aguaEscolhida === 'all') || (aguaDaPlanta === aguaEscolhida);

    // Se passar nos 3 filtros, mostra o card. Se não, esconde!
    if (bateuTexto && bateuLuz && bateuAgua) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  }
}

// 4. Ativando os filtros quando o usuário digita ou muda as opções
campoPesquisa.addEventListener('input', filtrarPlantas);
filtroLuz.addEventListener('change', filtrarPlantas);
filtroAgua.addEventListener('change', filtrarPlantas);

// Impede o formulário de recarregar a página se o usuário apertar Enter na busca
formularioFiltro.addEventListener('submit', function (evento) {
  evento.preventDefault();
});

// 5. Fazendo os botões "Ficha Completa" abrirem o modal com as informações
for (let i = 0; i < botoesFicha.length; i++) {
  botoesFicha[i].addEventListener('click', function () {
    // Pega o código da planta que está no atributo data-species-id do botão
    const idEspecie = this.getAttribute('data-species-id');
    const dadosPlanta = bancoDeEspecies[idEspecie];

    if (dadosPlanta) {
      tituloModal.textContent = dadosPlanta.nome;
      descricaoModal.textContent = dadosPlanta.detalhes;
      modalFicha.showModal();
    }
  });
}