// schedule.js

// 1. Pegando os elementos do HTML pelos IDs exatos da página
const botaoSemanaAnterior = document.getElementById('btn-prev-week');
const botaoProximaSemana = document.getElementById('btn-next-week');
const textoPeriodo = document.getElementById('current-period-label');

const filtroTipoCuidado = document.getElementById('select-schedule-care-type');
const botaoAbrirModal = document.getElementById('btn-open-reschedule-dialog');
const listaLinhaDoTempo = document.getElementById('schedule-timeline-list');

// Elementos da janela (modal) de Agendar Evento Extra
const modalAgendar = document.getElementById('schedule-event-dialog');
const seletorPlantaModal = document.getElementById('schedule-select-plant');
const seletorTipoModal = document.getElementById('schedule-select-type');
const inputDataModal = document.getElementById('schedule-input-date');
const botaoSalvarEvento = document.getElementById('btn-save-schedule-event');
const botaoCancelarEvento = document.getElementById('btn-cancel-schedule-event');

// Variável para controlar quantos dias avançamos ou voltamos nas semanas (0 = semana atual)
let deslocamentoDias = 0;

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

function obterEventosExtras() {
  let eventos = JSON.parse(localStorage.getItem('meus_eventos_cronograma'));
  if (eventos === null) {
    eventos = [];
  }
  return eventos;
}

function salvarEventosExtras(eventos) {
  localStorage.setItem('meus_eventos_cronograma', JSON.stringify(eventos));
}

// 3. Funções simples para trabalhar com datas
function formatarDataBR(dataTexto) {
  const partes = dataTexto.split('-');
  return partes[2] + '/' + partes[1] + '/' + partes[0];
}

function pegarNomeDiaSemana(dataObj) {
  const dias = [
    'Domingo',
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado'
  ];
  return dias[dataObj.getDay()];
}

// 4. Preenche o <select> de plantas dentro da janela modal
function carregarPlantasNoModal() {
  const listaPlantas = obterPlantas();
  seletorPlantaModal.innerHTML = '';

  if (listaPlantas.length === 0) {
    seletorPlantaModal.innerHTML = '<option value="">Cadastre uma planta primeiro</option>';
    return;
  }

  for (let i = 0; i < listaPlantas.length; i++) {
    const opcao = document.createElement('option');
    opcao.value = listaPlantas[i].id;
    opcao.textContent = listaPlantas[i].nome;
    seletorPlantaModal.appendChild(opcao);
  }
}

// 5. Função principal que monta o cronograma de 7 dias na tela
function mostrarCronogramaNaTela() {
  const listaPlantas = obterPlantas();
  const listaEventosExtras = obterEventosExtras();
  const filtroEscolhido = filtroTipoCuidado.value;

  const hojeTexto = new Date().toISOString().split('T')[0];

  // Calcula o primeiro e o último dia dos 7 dias atuais
  const dataInicial = new Date();
  dataInicial.setDate(dataInicial.getDate() + deslocamentoDias);
  const textoInicio = formatarDataBR(dataInicial.toISOString().split('T')[0]);

  const dataFinal = new Date();
  dataFinal.setDate(dataFinal.getDate() + deslocamentoDias + 6);
  const textoFim = formatarDataBR(dataFinal.toISOString().split('T')[0]);

  // Atualiza o texto do período lá no topo
  textoPeriodo.textContent = textoInicio + ' - ' + textoFim;

  // Limpa a lista antes de desenhar de novo
  listaLinhaDoTempo.innerHTML = '';

  let totalDeEventosNaSemana = 0;

  // Laço "for" que passa por cada um dos 7 dias da semana exibida
  for (let d = 0; d < 7; d++) {
    const dataDoDia = new Date();
    dataDoDia.setDate(dataDoDia.getDate() + deslocamentoDias + d);
    const dataDiaTexto = dataDoDia.toISOString().split('T')[0];
    const nomeDia = pegarNomeDiaSemana(dataDoDia);

    // Lista para juntar todas as tarefas deste dia específico
    const tarefasDoDia = [];

    // Parte A: Verifica quais plantas têm "proximaRega" marcada para este dia
    if (filtroEscolhido === 'all' || filtroEscolhido === 'watering') {
      for (let i = 0; i < listaPlantas.length; i++) {
        const planta = listaPlantas[i];
        if (planta.proximaRega === dataDiaTexto) {
          tarefasDoDia.push({
            origem: 'planta',
            idReferencia: planta.id,
            tipo: 'watering',
            nomeEtiqueta: 'Rega',
            nomePlanta: planta.nome,
            ambiente: planta.ambiente || 'Ambiente interno'
          });
        }
      }
    }

    // Parte B: Verifica quais eventos extras estão agendados para este dia
    for (let j = 0; j < listaEventosExtras.length; j++) {
      const evento = listaEventosExtras[j];

      if (evento.data === dataDiaTexto) {
        if (filtroEscolhido === 'all' || filtroEscolhido === evento.tipo) {
          // Define o nome bonito da etiqueta conforme o tipo
          let textoTipo = 'Manutenção';
          if (evento.tipo === 'watering') textoTipo = 'Rega Extra';
          if (evento.tipo === 'fertilizing') textoTipo = 'Adubação';
          if (evento.tipo === 'pruning') textoTipo = 'Poda';
          if (evento.tipo === 'repotting') textoTipo = 'Troca de Vaso';

          tarefasDoDia.push({
            origem: 'extra',
            idReferencia: evento.idEvento,
            tipo: evento.tipo,
            nomeEtiqueta: textoTipo,
            nomePlanta: evento.nomePlanta,
            ambiente: evento.ambiente
          });
        }
      }
    }

    // Se encontrou pelo menos 1 tarefa para este dia, cria o bloco <li> do dia na tela
    if (tarefasDoDia.length > 0) {
      totalDeEventosNaSemana = totalDeEventosNaSemana + tarefasDoDia.length;

      const itemDia = document.createElement('li');
      itemDia.className = 'timeline-day-item species-card';
      itemDia.setAttribute('data-date', dataDiaTexto);

      let textoHoje = '';
      if (dataDiaTexto === hojeTexto) {
        textoHoje = ' (Hoje)';
        itemDia.classList.add('day-today');
      }

      // Monta os itens <li> de cada tarefa dentro do dia
      let htmlDasTarefas = '';
      for (let k = 0; k < tarefasDoDia.length; k++) {
        const t = tarefasDoDia[k];

        htmlDasTarefas = htmlDasTarefas +
          '<li class="timeline-event-card" data-type="' + t.tipo + '">' +
            '<span class="event-badge badge-' + t.tipo + '"><strong>[' + t.nomeEtiqueta + ']</strong></span> ' +
            '<strong class="event-plant-name">' + t.nomePlanta + '</strong> ' +
            '<span class="event-location">(' + t.ambiente + ')</span> ' +
            '<button class="btn btn-success btn-sm" type="button" onclick="concluirTarefaCronograma(\'' + t.origem + '\', \'' + t.idReferencia + '\')">Concluir</button>' +
          '</li>';
      }

      itemDia.innerHTML =
        '<header class="timeline-day-header section-header">' +
          '<h4 class="day-title">' + nomeDia + ', <time datetime="' + dataDiaTexto + '">' + formatarDataBR(dataDiaTexto) + '</time>' + textoHoje + '</h4>' +
          '<span class="day-task-count">' + tarefasDoDia.length + ' manutenção(ões) prevista(s)</span>' +
        '</header>' +
        '<ul class="timeline-events-list">' +
          htmlDasTarefas +
        '</ul>';

      listaLinhaDoTempo.appendChild(itemDia);
    }
  }

  // Se nenhum dia da semana tiver tarefas, mostra uma mensagem amigável
  if (totalDeEventosNaSemana === 0) {
    listaLinhaDoTempo.innerHTML =
      '<li class="timeline-day-item species-card">' +
        '<h4>Nenhuma manutenção agendada para este período</h4>' +
        '<p>Suas plantas estão em dia nesta semana ou você pode clicar em "Agendar Evento Extra" para programar um cuidado.</p>' +
      '</li>';
  }
}

// 6. Função chamada quando o usuário clica no botão "Concluir" de uma tarefa
function concluirTarefaCronograma(origem, idRef) {
  if (origem === 'planta') {
    // Se for a rega oficial da planta, atualiza a última rega para hoje e soma a próxima
    const listaPlantas = obterPlantas();
    const hoje = new Date().toISOString().split('T')[0];

    for (let i = 0; i < listaPlantas.length; i++) {
      if (String(listaPlantas[i].id) === String(idRef)) {
        const novaData = new Date();
        novaData.setDate(novaData.getDate() + Number(listaPlantas[i].frequenciaDias));
        const proximaData = novaData.toISOString().split('T')[0];

        listaPlantas[i].ultimaRega = hoje;
        listaPlantas[i].proximaRega = proximaData;

        alert('Rega da planta "' + listaPlantas[i].nome + '" concluída! Próxima rega agendada para ' + formatarDataBR(proximaData) + '.');
      }
    }
    salvarPlantas(listaPlantas);

  } else {
    // Se for um evento extra agendado manualmente, remove ele da lista de pendentes
    const listaEventos = obterEventosExtras();
    const novaLista = [];

    for (let i = 0; i < listaEventos.length; i++) {
      if (String(listaEventos[i].idEvento) !== String(idRef)) {
        novaLista.push(listaEventos[i]);
      }
    }
    salvarEventosExtras(novaLista);
    alert('Manutenção concluída com sucesso!');
  }

  mostrarCronogramaNaTela();
}

// 7. Botões de "Semana Anterior" e "Próxima Semana"
botaoSemanaAnterior.addEventListener('click', function () {
  deslocamentoDias = deslocamentoDias - 7;
  mostrarCronogramaNaTela();
});

botaoProximaSemana.addEventListener('click', function () {
  deslocamentoDias = deslocamentoDias + 7;
  mostrarCronogramaNaTela();
});

// 8. Filtro por tipo de cuidado
filtroTipoCuidado.addEventListener('change', mostrarCronogramaNaTela);

// 9. Controle da janela (modal) "Agendar Evento Extra"
botaoAbrirModal.addEventListener('click', function () {
  carregarPlantasNoModal();
  inputDataModal.value = new Date().toISOString().split('T')[0];
  modalAgendar.showModal();
});

botaoCancelarEvento.addEventListener('click', function () {
  modalAgendar.close();
});

botaoSalvarEvento.addEventListener('click', function (evento) {
  evento.preventDefault();

  const idEscolhido = seletorPlantaModal.value;
  if (!idEscolhido) {
    alert('Cadastre uma planta primeiro antes de agendar!');
    return;
  }

  // Busca os dados da planta escolhida para pegar o nome e o ambiente dela
  const listaPlantas = obterPlantas();
  let nomeDaPlanta = 'Planta';
  let ambienteDaPlanta = 'Casa';

  for (let i = 0; i < listaPlantas.length; i++) {
    if (String(listaPlantas[i].id) === String(idEscolhido)) {
      nomeDaPlanta = listaPlantas[i].nome;
      ambienteDaPlanta = listaPlantas[i].ambiente || 'Casa';
    }
  }

  const novoEvento = {
    idEvento: Date.now(),
    idPlanta: idEscolhido,
    nomePlanta: nomeDaPlanta,
    ambiente: ambienteDaPlanta,
    tipo: seletorTipoModal.value,
    data: inputDataModal.value
  };

  const listaEventos = obterEventosExtras();
  listaEventos.push(novoEvento);
  salvarEventosExtras(listaEventos);

  modalAgendar.close();
  mostrarCronogramaNaTela();
});

// 10. Carrega o cronograma assim que a página abre
mostrarCronogramaNaTela();