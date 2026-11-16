// plant-details.js

// 1. Pegando os elementos do HTML pelos IDs exatos da página
const seletorPlanta = document.getElementById('select-active-plant');
const imagemPlanta = document.getElementById('detail-plant-image');
const statusSaude = document.getElementById('detail-health-status');
const nomePlanta = document.getElementById('detail-plant-name');
const especiePlanta = document.getElementById('detail-plant-species');
const ambientePlanta = document.getElementById('detail-plant-location');
const luzPlanta = document.getElementById('detail-plant-sunlight');
const frequenciaPlanta = document.getElementById('detail-watering-frequency');
const ultimaRegaPlanta = document.getElementById('detail-last-watered');
const proximaRegaPlanta = document.getElementById('detail-next-watering');
const notasPlanta = document.getElementById('detail-plant-notes');

// Botões de ação do perfil
const botaoRegarAgora = document.getElementById('btn-detail-water-now');
const botaoAbrirEditar = document.getElementById('btn-detail-open-edit');
const botaoExcluirPlanta = document.getElementById('btn-detail-delete-plant');

// Elementos do Histórico de Regas
const botaoAdicionarHistorico = document.getElementById('btn-add-manual-history');
const tabelaHistoricoCorpo = document.getElementById('watering-history-tbody');

// Elementos da janela (modal) de Editar Planta
const modalEditar = document.getElementById('edit-plant-dialog');
const inputEditarId = document.getElementById('edit-plant-id');
const inputEditarNome = document.getElementById('edit-input-name');
const inputEditarFrequencia = document.getElementById('edit-input-frequency');
const inputEditarNotas = document.getElementById('edit-textarea-notes');
const botaoSalvarEdicao = document.getElementById('btn-save-edit-plant');
const botaoCancelarEdicao = document.getElementById('btn-cancel-edit-plant');

// Variável para guardar o ID da planta que está aparecendo na tela agora
let idPlantaAtual = null;

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

// 3. Função simples para formatar a data de AAAA-MM-DD para DD/MM/AAAA
function formatarDataBR(dataTexto) {
  if (!dataTexto) return '-';
  const partes = dataTexto.split('-');
  if (partes.length === 3) {
    return partes[2] + '/' + partes[1] + '/' + partes[0];
  }
  return dataTexto;
}

// 4. Preenche o <select> do topo com todas as plantas cadastradas
function carregarSeletorDePlantas() {
  const lista = obterPlantas();
  seletorPlanta.innerHTML = '';

  if (lista.length === 0) {
    seletorPlanta.innerHTML = '<option value="">Nenhuma planta cadastrada</option>';
    return;
  }

  for (let i = 0; i < lista.length; i++) {
    const planta = lista[i];
    const opcao = document.createElement('option');
    opcao.value = planta.id;
    opcao.textContent = planta.nome + ' (' + planta.especie + ')';
    seletorPlanta.appendChild(opcao);
  }
}

// 5. Mostra na tela os dados da planta selecionada
function mostrarDadosDaPlanta(idProcurado) {
  const lista = obterPlantas();
  const secaoPerfil = document.getElementById('plant-profile-section');
  const secaoHistorico = document.getElementById('watering-history-section');

  // SE NÃO HOUVER NENHUMA PLANTA CADASTRADA:
  if (lista.length === 0) {
    // Troca o card da Costela-de-Adão de exemplo por um aviso simples
    secaoPerfil.innerHTML =
      '<div class="empty-state-container">' +
        '<h2>Nenhuma planta cadastrada</h2>' +
        '<p>Você precisa cadastrar pelo menos uma planta para visualizar o perfil e o histórico.</p>' +
        '<a href="add-plant.html" class="btn btn-primary">Cadastrar Primeira Planta</a>' +
      '</div>';

    // Esconde a tabela de histórico
    secaoHistorico.hidden = true;
    return;
  }

  // Se houver plantas, garante que o histórico apareça normalmente
  secaoHistorico.hidden = false;

  let plantaEncontrada = null;

  for (let i = 0; i < lista.length; i++) {
    if (String(lista[i].id) === String(idProcurado)) {
      plantaEncontrada = lista[i];
      break;
    }
  }

  // Se não achou pelo ID da URL, pega a primeira planta da lista salva
  if (plantaEncontrada === null) {
    plantaEncontrada = lista[0];
  }

  idPlantaAtual = plantaEncontrada.id;
  seletorPlanta.value = plantaEncontrada.id;

  // Preenchendo os textos do perfil
  nomePlanta.textContent = plantaEncontrada.nome;
  especiePlanta.innerHTML = '<em>' + plantaEncontrada.especie + '</em>';
  ambientePlanta.textContent = plantaEncontrada.ambiente || 'Não informado';
  luzPlanta.textContent = plantaEncontrada.iluminacao || 'Meia-sombra';
  frequenciaPlanta.textContent = 'A cada ' + plantaEncontrada.frequenciaDias + ' dias';
  ultimaRegaPlanta.textContent = formatarDataBR(plantaEncontrada.ultimaRega);
  proximaRegaPlanta.textContent = formatarDataBR(plantaEncontrada.proximaRega);

  if (plantaEncontrada.observacoes && plantaEncontrada.observacoes !== '') {
    notasPlanta.textContent = plantaEncontrada.observacoes;
  } else {
    notasPlanta.textContent = 'Nenhuma observação cadastrada para esta planta.';
  }

  if (plantaEncontrada.foto && plantaEncontrada.foto !== '') {
    imagemPlanta.src = plantaEncontrada.foto;
  } else {
    imagemPlanta.src = 'placeholder-monstera.jpg';
  }

  const hoje = new Date().toISOString().split('T')[0];
  if (plantaEncontrada.proximaRega < hoje) {
    statusSaude.textContent = 'Precisa de Água (Atrasada)';
  } else if (plantaEncontrada.proximaRega === hoje) {
    statusSaude.textContent = 'Regar Hoje';
  } else {
    statusSaude.textContent = 'Saudável (Em dia)';
  }

  mostrarHistoricoNaTabela(plantaEncontrada);
}

// 6. Desenha as linhas da tabela de Histórico de Regas
function mostrarHistoricoNaTabela(planta) {
  tabelaHistoricoCorpo.innerHTML = '';

  // Se a planta ainda não tiver uma lista de histórico, cria uma vazia
  let historico = planta.historico;
  if (!historico || historico.length === 0) {
    tabelaHistoricoCorpo.innerHTML =
      '<tr>' +
        '<td colspan="5">Nenhum registro no histórico ainda. Clique em "Registrar Rega Hoje" para começar!</td>' +
      '</tr>';
    return;
  }

  for (let i = 0; i < historico.length; i++) {
    const item = historico[i];
    const linha = document.createElement('tr');
    linha.className = 'history-row';

    linha.innerHTML =
      '<td>' + formatarDataBR(item.data) + '</td>' +
      '<td>' + item.tipo + '</td>' +
      '<td>' + item.detalhe + '</td>' +
      '<td>' + item.observacao + '</td>' +
      '<td>' +
        '<button class="btn btn-danger btn-sm" type="button" onclick="removerItemHistorico(' + item.idLog + ')">Remover</button>' +
      '</td>';

    tabelaHistoricoCorpo.appendChild(linha);
  }
}

// 7. Quando o usuário escolhe outra planta na caixinha <select> lá no topo
seletorPlanta.addEventListener('change', function () {
  mostrarDadosDaPlanta(seletorPlanta.value);
});

// 8. Botão "Registrar Rega Hoje"
botaoRegarAgora.addEventListener('click', function () {
  if (idPlantaAtual === null) return;

  const lista = obterPlantas();
  const hoje = new Date().toISOString().split('T')[0];

  for (let i = 0; i < lista.length; i++) {
    if (String(lista[i].id) === String(idPlantaAtual)) {
      const novaData = new Date();
      novaData.setDate(novaData.getDate() + Number(lista[i].frequenciaDias));
      const proximaData = novaData.toISOString().split('T')[0];

      lista[i].ultimaRega = hoje;
      lista[i].proximaRega = proximaData;

      // Adiciona uma linha automática no histórico da planta
      if (!lista[i].historico) {
        lista[i].historico = [];
      }
      lista[i].historico.push({
        idLog: Date.now(),
        data: hoje,
        tipo: 'Rega Completa',
        detalhe: 'Padrão',
        observacao: 'Rega registrada pelo perfil da planta.'
      });
    }
  }

  salvarPlantas(lista);
  mostrarDadosDaPlanta(idPlantaAtual);
  alert('Rega registrada com sucesso!');
});

// 9. Botão "Adicionar Registro Manual" (para anotar adubação, poda ou rega extra)
botaoAdicionarHistorico.addEventListener('click', function () {
  if (idPlantaAtual === null) {
    alert('Cadastre uma planta primeiro!');
    return;
  }

  const tipoCuidado = prompt('Qual cuidado foi feito? (Ex: Rega, Adubação, Poda)', 'Adubação');
  if (!tipoCuidado) return;

  const detalheVolume = prompt('Qual o volume ou detalhe? (Ex: 250 ml, NPK 10-10-10)', '250 ml');
  const observacaoTexto = prompt('Alguma observação?', 'Planta respondeu bem.');

  const lista = obterPlantas();
  const hoje = new Date().toISOString().split('T')[0];

  for (let i = 0; i < lista.length; i++) {
    if (String(lista[i].id) === String(idPlantaAtual)) {
      if (!lista[i].historico) {
        lista[i].historico = [];
      }
      lista[i].historico.push({
        idLog: Date.now(),
        data: hoje,
        tipo: tipoCuidado,
        detalhe: detalheVolume || '-',
        observacao: observacaoTexto || '-'
      });
    }
  }

  salvarPlantas(lista);
  mostrarDadosDaPlanta(idPlantaAtual);
});

// 10. Função para apagar uma linha do histórico
function removerItemHistorico(idDoLog) {
  const lista = obterPlantas();

  for (let i = 0; i < lista.length; i++) {
    if (String(lista[i].id) === String(idPlantaAtual) && lista[i].historico) {
      const novoHistorico = [];
      for (let j = 0; j < lista[i].historico.length; j++) {
        if (lista[i].historico[j].idLog !== idDoLog) {
          novoHistorico.push(lista[i].historico[j]);
        }
      }
      lista[i].historico = novoHistorico;
    }
  }

  salvarPlantas(lista);
  mostrarDadosDaPlanta(idPlantaAtual);
}

// 11. Botão "Editar Dados" (Abre a janela modal preenchida com os dados atuais)
botaoAbrirEditar.addEventListener('click', function () {
  if (idPlantaAtual === null) return;

  const lista = obterPlantas();
  for (let i = 0; i < lista.length; i++) {
    if (String(lista[i].id) === String(idPlantaAtual)) {
      inputEditarId.value = lista[i].id;
      inputEditarNome.value = lista[i].nome;
      inputEditarFrequencia.value = lista[i].frequenciaDias;
      inputEditarNotas.value = lista[i].observacoes || '';
      modalEditar.showModal();
      break;
    }
  }
});

// Salvar as alterações feitas na janela de Editar
botaoSalvarEdicao.addEventListener('click', function (evento) {
  evento.preventDefault();

  const lista = obterPlantas();
  for (let i = 0; i < lista.length; i++) {
    if (String(lista[i].id) === String(idPlantaAtual)) {
      lista[i].nome = inputEditarNome.value;
      lista[i].frequenciaDias = Number(inputEditarFrequencia.value);
      lista[i].observacoes = inputEditarNotas.value;

      // Recalcula a próxima rega com a nova frequência
      const dataBase = new Date(lista[i].ultimaRega);
      dataBase.setDate(dataBase.getDate() + Number(lista[i].frequenciaDias));
      lista[i].proximaRega = dataBase.toISOString().split('T')[0];
    }
  }

  salvarPlantas(lista);
  carregarSeletorDePlantas();
  mostrarDadosDaPlanta(idPlantaAtual);
  modalEditar.close();
});

botaoCancelarEdicao.addEventListener('click', function () {
  modalEditar.close();
});

// 12. Botão "Excluir Planta"
botaoExcluirPlanta.addEventListener('click', function () {
  if (idPlantaAtual === null) return;

  const confirmou = confirm('Tem certeza que deseja excluir esta planta?');
  if (confirmou) {
    const lista = obterPlantas();
    const novaLista = [];

    for (let i = 0; i < lista.length; i++) {
      if (String(lista[i].id) !== String(idPlantaAtual)) {
        novaLista.push(lista[i]);
      }
    }

    salvarPlantas(novaLista);
    window.location.href = 'collection.html';
  }
});

// 13. Inicialização da página: lê o "?id=" da URL e carrega tudo
function iniciarPaginaDetalhes() {
  carregarSeletorDePlantas();

  const parametrosUrl = new URLSearchParams(window.location.search);
  const idDaUrl = parametrosUrl.get('id');

  mostrarDadosDaPlanta(idDaUrl);
}

iniciarPaginaDetalhes();