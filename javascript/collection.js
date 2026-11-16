// collection.js

// 1. Pegando os elementos do HTML pelos IDs exatos da página
const formularioFiltro = document.getElementById('collection-filter-form');
const campoBusca = document.getElementById('input-search-plant');
const filtroStatus = document.getElementById('select-filter-status');
const seletorOrdem = document.getElementById('select-sort-collection');

const gradePlantas = document.getElementById('plants-collection-grid');
const estadoVazio = document.getElementById('collection-empty-state');
const textoVazio = document.getElementById('collection-empty-text');

// Elementos da janela (modal) de confirmar exclusão
const modalExcluir = document.getElementById('confirm-delete-plant-dialog');
const inputIdExcluir = document.getElementById('delete-target-plant-id');
const botaoConfirmarExclusao = document.getElementById('btn-confirm-delete-plant');
const botaoCancelarExclusao = document.getElementById('btn-cancel-delete-plant');

// 2. Funções básicas para ler e salvar no localStorage
function obterPlantas() {
  let lista = JSON.parse(localStorage.getItem('minhas_plantas'));
  if (lista === null) {
    lista = [];
  }
  return lista;
}

function salvarPlantas(lista) {
  localStorage.setItem('minhas_plantas', JSON.stringify(lista));
}

// 3. Função simples para descobrir o status da rega comparando com a data de hoje
function descobrirStatusRega(proximaRega) {
  const hoje = new Date().toISOString().split('T')[0];

  if (proximaRega < hoje) {
    return 'overdue'; // Atrasada
  } else if (proximaRega === hoje) {
    return 'due-today'; // Regar hoje
  } else {
    return 'up-to-date'; // Em dia
  }
}

// 4. Função para transformar a data de AAAA-MM-DD para DD/MM/AAAA
function formatarDataBR(dataTexto) {
  if (!dataTexto) return '';
  const partes = dataTexto.split('-');
  if (partes.length === 3) {
    return partes[2] + '/' + partes[1] + '/' + partes[0];
  }
  return dataTexto;
}

// 5. Função principal que filtra, ordena e desenha os cards na tela
function mostrarPlantasNaTela() {
  const todasAsPlantas = obterPlantas();
  const textoDigitado = campoBusca.value.toLowerCase();
  const statusEscolhido = filtroStatus.value;
  const ordemEscolhida = seletorOrdem.value;

  // Passo A: Filtrar as plantas usando um laço "for" simples
  const plantasFiltradas = [];

  for (let i = 0; i < todasAsPlantas.length; i++) {
    const planta = todasAsPlantas[i];
    const statusAtual = descobrirStatusRega(planta.proximaRega);

    const nomeMinusculo = planta.nome.toLowerCase();
    const especieMinuscula = planta.especie.toLowerCase();

    const bateuBusca = nomeMinusculo.includes(textoDigitado) || especieMinuscula.includes(textoDigitado);
    const bateuStatus = (statusEscolhido === 'all') || (statusAtual === statusEscolhido);

    if (bateuBusca && bateuStatus) {
      plantasFiltradas.push(planta);
    }
  }

  // Passo B: Ordenar a lista filtrada
  plantasFiltradas.sort(function (a, b) {
    if (ordemEscolhida === 'name-asc') {
      return a.nome.localeCompare(b.nome);
    } else if (ordemEscolhida === 'date-added') {
      return Number(b.id) - Number(a.id); // IDs maiores foram criados por último
    } else {
      // Ordenar por próxima rega (mais urgentes primeiro)
      if (a.proximaRega < b.proximaRega) return -1;
      if (a.proximaRega > b.proximaRega) return 1;
      return 0;
    }
  });

  // Limpa a grade (remove aquele card de exemplo que vem no HTML)
  gradePlantas.innerHTML = '';

  // Passo C: Se não tiver plantas para mostrar, exibe a caixa de "estado vazio"
  if (plantasFiltradas.length === 0) {
    estadoVazio.hidden = false;
    if (todasAsPlantas.length === 0) {
      textoVazio.textContent = 'Você ainda não cadastrou nenhuma planta na sua coleção.';
    } else {
      textoVazio.textContent = 'Nenhuma planta encontrada com esses filtros.';
    }
    return;
  } else {
    estadoVazio.hidden = true;
  }

  // Passo D: Criar um <article class="plant-card"> para cada planta
  for (let i = 0; i < plantasFiltradas.length; i++) {
    const planta = plantasFiltradas[i];
    const status = descobrirStatusRega(planta.proximaRega);

    // Define o texto da etiqueta de status
    let textoEtiqueta = 'Em Dia';
    let classeEtiqueta = 'status-ok';
    if (status === 'overdue') {
      textoEtiqueta = 'Rega Atrasada';
      classeEtiqueta = 'status-overdue';
    } else if (status === 'due-today') {
      textoEtiqueta = 'Regar Hoje';
      classeEtiqueta = 'status-due';
    }

    // Se a planta não tiver foto, mostra só a etiqueta na figura
    let htmlImagem = '';
    if (planta.foto && planta.foto !== '') {
      htmlImagem = '<img class="plant-card-image photo-preview-image" src="' + planta.foto + '" alt="Foto da planta ' + planta.nome + '">';
    }

    const card = document.createElement('article');
    card.className = 'plant-card species-card';
    card.setAttribute('data-plant-id', planta.id);
    card.setAttribute('data-status', status);

    // Monta o HTML igualzinho à estrutura que estava no seu collection.html
    card.innerHTML =
      '<figure class="plant-card-figure">' +
        htmlImagem +
        '<figcaption class="plant-status-badge ' + classeEtiqueta + '"><strong>' + textoEtiqueta + '</strong></figcaption>' +
      '</figure>' +
      '<div class="plant-card-content">' +
        '<h3 class="plant-card-title">' + planta.nome + '</h3>' +
        '<p class="plant-card-species"><em>' + planta.especie + '</em></p>' +
        '<dl class="plant-card-meta species-requirements-list">' +
          '<div class="meta-pair req-item">' +
            '<dt class="meta-term req-label">Frequência:</dt>' +
            '<dd class="meta-value req-value" data-field="frequency">A cada ' + planta.frequenciaDias + ' dias</dd>' +
          '</div>' +
          '<div class="meta-pair req-item">' +
            '<dt class="meta-term req-label">Última rega:</dt>' +
            '<dd class="meta-value req-value"><time datetime="' + planta.ultimaRega + '" data-field="lastWatered">' + formatarDataBR(planta.ultimaRega) + '</time></dd>' +
          '</div>' +
          '<div class="meta-pair req-item">' +
            '<dt class="meta-term req-label">Próxima rega:</dt>' +
            '<dd class="meta-value req-value"><time datetime="' + planta.proximaRega + '" data-field="nextWatering">' + formatarDataBR(planta.proximaRega) + '</time></dd>' +
          '</div>' +
        '</dl>' +
      '</div>' +
      '<footer class="plant-card-actions species-card-footer">' +
        '<button class="btn btn-success btn-card-water" type="button" onclick="regarPlantaAgora(' + planta.id + ')">Regar Agora</button>' +
        '<a class="btn btn-secondary" href="plant-details.html?id=' + planta.id + '">Detalhes</a>' +
        '<button class="btn btn-danger btn-card-delete" type="button" onclick="abrirModalExclusao(' + planta.id + ')">Excluir</button>' +
      '</footer>';

    gradePlantas.appendChild(card);
  }
}

// 6. Função chamada ao clicar em "Regar Agora"
function regarPlantaAgora(idPlanta) {
  const lista = obterPlantas();

  for (let i = 0; i < lista.length; i++) {
    if (String(lista[i].id) === String(idPlanta)) {
      const hoje = new Date();
      const dataHoje = hoje.toISOString().split('T')[0];

      const novaData = new Date();
      novaData.setDate(novaData.getDate() + Number(lista[i].frequenciaDias));
      const proximaData = novaData.toISOString().split('T')[0];

      lista[i].ultimaRega = dataHoje;
      lista[i].proximaRega = proximaData;
    }
  }

  salvarPlantas(lista);
  mostrarPlantasNaTela();
}

// 7. Funções para controlar a janela (modal) de exclusão
function abrirModalExclusao(idPlanta) {
  inputIdExcluir.value = idPlanta;
  modalExcluir.showModal();
}

botaoConfirmarExclusao.addEventListener('click', function () {
  const idParaApagar = inputIdExcluir.value;
  const lista = obterPlantas();
  const novaLista = [];

  for (let i = 0; i < lista.length; i++) {
    if (String(lista[i].id) !== String(idParaApagar)) {
      novaLista.push(lista[i]);
    }
  }

  salvarPlantas(novaLista);
  modalExcluir.close();
  mostrarPlantasNaTela();
});

botaoCancelarExclusao.addEventListener('click', function () {
  modalExcluir.close();
});

// 8. Eventos de busca, filtro, ordenação e botão "Limpar Filtros"
campoBusca.addEventListener('input', mostrarPlantasNaTela);
filtroStatus.addEventListener('change', mostrarPlantasNaTela);
seletorOrdem.addEventListener('change', mostrarPlantasNaTela);

formularioFiltro.addEventListener('submit', function (evento) {
  evento.preventDefault();
});

formularioFiltro.addEventListener('reset', function () {
  // Espera o formulário limpar os campos e atualiza a tela
  setTimeout(mostrarPlantasNaTela, 10);
});

// 9. Executa assim que a página abre
mostrarPlantasNaTela();