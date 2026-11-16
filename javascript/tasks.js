// tasks.js

// 1. Pegando os elementos do HTML pelos IDs exatos da página
const barraProgresso = document.getElementById('daily-tasks-progress');
const contadorProgresso = document.getElementById('daily-tasks-counter');

const formularioNovaTarefa = document.getElementById('form-add-task');
const campoTituloTarefa = document.getElementById('input-task-title');
const seletorCategoria = document.getElementById('select-task-category');
const seletorPlanta = document.getElementById('select-task-plant');

const listaRega = document.getElementById('task-list-watering');
const listaManutencao = document.getElementById('task-list-maintenance');

// Elementos do botão e da janela (modal) de Limpar Concluídas
const botaoAbrirModalLimpar = document.getElementById('btn-clear-completed-tasks');
const modalLimpar = document.getElementById('clear-tasks-dialog');
const botaoConfirmarLimpar = document.getElementById('btn-confirm-clear-tasks');
const botaoCancelarLimpar = document.getElementById('btn-cancel-clear-tasks');

// 2. Funções básicas para ler e salvar no localStorage
function obterPlantas() {
  let lista = JSON.parse(localStorage.getItem('minhas_plantas'));
  if (lista === null) {// Começa com uma lista vazia (sem tarefas prontas de mentirinha
    lista = [];
  }
  return lista;
}

function salvarPlantas(lista) {
  localStorage.setItem('minhas_plantas', JSON.stringify(lista));
}

function obterTarefas() {
  let lista = JSON.parse(localStorage.getItem('minhas_tarefas'));
  if (lista === null) {
    lista = [];
  }
  return lista;
}

function salvarTarefas(lista) {
  localStorage.setItem('minhas_tarefas', JSON.stringify(lista));
}

// 3. Preenche o <select> com as plantas salvas na coleção
function carregarPlantasNoSelect() {
  const plantas = obterPlantas();
  seletorPlanta.innerHTML = '<option value="general">Cuidado Geral do Jardim</option>';

  for (let i = 0; i < plantas.length; i++) {
    const opcao = document.createElement('option');
    opcao.value = plantas[i].id;
    opcao.textContent = plantas[i].nome;
    seletorPlanta.appendChild(opcao);
  }
}

// 4. Cria tarefas automáticas para as plantas que estão com rega para hoje ou atrasadas
function adicionarRegasDoDiaAutomaticamente() {
  const plantas = obterPlantas();
  if (plantas.length === 0) return;

  const tarefas = obterTarefas();
  const hoje = new Date().toISOString().split('T')[0];
  let adicionouAlguma = false;

  for (let i = 0; i < plantas.length; i++) {
    const planta = plantas[i];

    if (planta.proximaRega <= hoje) {
      let jaExiste = false;
      for (let j = 0; j < tarefas.length; j++) {
        if (String(tarefas[j].plantaId) === String(planta.id) && tarefas[j].categoria === 'regar' && !tarefas[j].concluida) {
          jaExiste = true;
          break;
        }
      }

      if (!jaExiste) {
        tarefas.push({
          id: Date.now() + i,
          titulo: 'Regar ' + planta.nome + ' (' + (planta.ambiente || 'Casa') + ')',
          categoria: 'regar',
          plantaId: planta.id,
          nomePlanta: planta.nome,
          concluida: false
        });
        adicionouAlguma = true;
      }
    }
  }

  if (adicionouAlguma) {
    salvarTarefas(tarefas);
  }
}

// 5. Função principal que desenha as listas e atualiza a barra de progresso
function mostrarTarefasNaTela() {
  const plantas = obterPlantas();

  // SE NÃO HOUVER PLANTAS CADASTRADAS: mostra aviso e zera a barra
  if (plantas.length === 0) {
    listaRega.innerHTML = '<li>Cadastre pelo menos uma planta para liberar as tarefas de rega.</li>';
    listaManutencao.innerHTML = '<li>Cadastre pelo menos uma planta para liberar as tarefas de manutenção.</li>';

    barraProgresso.max = 1;
    barraProgresso.value = 0;
    contadorProgresso.textContent = '0 de 0 concluídas';
    return;// Para a função aqui e não mostra nenhuma tarefa!
  }

  const tarefas = obterTarefas();
// Limpa as duas listas antes de desenha
  listaRega.innerHTML = '';
  listaManutencao.innerHTML = '';

  let totalTarefas = tarefas.length;
  let totalConcluidas = 0;

  for (let i = 0; i < tarefas.length; i++) {
    const tarefa = tarefas[i];

    if (tarefa.concluida) {
      totalConcluidas = totalConcluidas + 1;
    }

    const item = document.createElement('li');
    item.className = 'task-item';
    if (tarefa.concluida) {
      item.className = 'task-item task-completed';
    }

    let textoEtiqueta = 'Manutenção';
    if (tarefa.categoria === 'regar') textoEtiqueta = 'Regar';
    if (tarefa.categoria === 'adubar') textoEtiqueta = 'Adubar';
    if (tarefa.categoria === 'podar') textoEtiqueta = 'Podar';
    if (tarefa.categoria === 'inspecionar') textoEtiqueta = 'Pragas';
    if (tarefa.categoria === 'replantar') textoEtiqueta = 'Substrato';

    let atributoChecked = '';
    let estiloTexto = '';
    if (tarefa.concluida) {
      atributoChecked = 'checked';
      estiloTexto = 'style="text-decoration: line-through; color: #647568;"';
    }

    item.innerHTML =
      '<input id="checkbox-task-' + tarefa.id + '" class="task-checkbox" type="checkbox" ' + atributoChecked + ' onchange="alternarTarefa(' + tarefa.id + ')"> ' +
      '<label class="task-label" for="checkbox-task-' + tarefa.id + '" ' + estiloTexto + '>' +
        tarefa.titulo +
      '</label> ' +
      '<span class="task-tag"><strong>[' + textoEtiqueta + ']</strong></span> ' +
      '<button class="btn btn-danger btn-sm" type="button" onclick="removerTarefa(' + tarefa.id + ')">Remover</button>';

    if (tarefa.categoria === 'regar') {
      listaRega.appendChild(item);
    } else {
      listaManutencao.appendChild(item);
    }
  }

  if (listaRega.innerHTML === '') {
    listaRega.innerHTML = '<li>Nenhuma tarefa de rega no momento.</li>';
  }
  if (listaManutencao.innerHTML === '') {
    listaManutencao.innerHTML = '<li>Nenhuma tarefa de manutenção no momento.</li>';
  }

  if (totalTarefas === 0) {
    barraProgresso.max = 1;
    barraProgresso.value = 0;
    contadorProgresso.textContent = '0 de 0 concluídas';
  } else {
    barraProgresso.max = totalTarefas;
    barraProgresso.value = totalConcluidas;
    contadorProgresso.textContent = totalConcluidas + ' de ' + totalTarefas + ' concluídas';
  }
}

// 6. Adicionar uma nova tarefa pelo formulário
formularioNovaTarefa.addEventListener('submit', function (evento) {
  evento.preventDefault();
//impede de criar um formulario sem plantas cadastradas
  if (obterPlantas().length === 0) {
    alert('Cadastre pelo menos uma planta na página "Nova Planta" antes de criar tarefas!');
    return;
  }

  const tituloDigitado = campoTituloTarefa.value.trim();
  const categoriaEscolhida = seletorCategoria.value;
  const plantaEscolhidaId = seletorPlanta.value;
  const nomePlantaTexto = seletorPlanta.options[seletorPlanta.selectedIndex].text;

  const novaTarefa = {
    id: Date.now(),
    titulo: tituloDigitado,
    categoria: categoriaEscolhida,
    plantaId: plantaEscolhidaId,
    nomePlanta: nomePlantaTexto,
    concluida: false
  };

  const tarefas = obterTarefas();
  tarefas.push(novaTarefa);
  salvarTarefas(tarefas);

  formularioNovaTarefa.reset();
  mostrarTarefasNaTela();
});

// 7. Quando o usuário marca ou desmarca o checkbox de uma tarefa
function alternarTarefa(idDaTarefa) {
  const tarefas = obterTarefas();

  for (let i = 0; i < tarefas.length; i++) {
    if (tarefas[i].id === idDaTarefa) {
      tarefas[i].concluida = !tarefas[i].concluida;

      if (tarefas[i].concluida && tarefas[i].categoria === 'regar' && tarefas[i].plantaId !== 'general') {
        atualizarRegaDaPlanta(tarefas[i].plantaId);
      }
      break;
    }
  }

  salvarTarefas(tarefas);
  mostrarTarefasNaTela();
}

function atualizarRegaDaPlanta(idPlanta) {
  const plantas = obterPlantas();
  const hoje = new Date().toISOString().split('T')[0];

  for (let i = 0; i < plantas.length; i++) {
    if (String(plantas[i].id) === String(idPlanta)) {
      const novaData = new Date();
      novaData.setDate(novaData.getDate() + Number(plantas[i].frequenciaDias));

      plantas[i].ultimaRega = hoje;
      plantas[i].proximaRega = novaData.toISOString().split('T')[0];
    }
  }
  salvarPlantas(plantas);
}

// 8. Remover uma tarefa individual
function removerTarefa(idDaTarefa) {
  const tarefas = obterTarefas();
  const novaLista = [];

  for (let i = 0; i < tarefas.length; i++) {
    if (tarefas[i].id !== idDaTarefa) {
      novaLista.push(tarefas[i]);
    }
  }

  salvarTarefas(novaLista);
  mostrarTarefasNaTela();
}

// 9. Controle da janela (modal) "Limpar Concluídas"
botaoAbrirModalLimpar.addEventListener('click', function () {
  modalLimpar.showModal();
});

botaoCancelarLimpar.addEventListener('click', function () {
  modalLimpar.close();
});

botaoConfirmarLimpar.addEventListener('click', function () {
  const tarefas = obterTarefas();
  const apenasPendentes = [];

  for (let i = 0; i < tarefas.length; i++) {
    if (!tarefas[i].concluida) {
      apenasPendentes.push(tarefas[i]);
    }
  }

  salvarTarefas(apenasPendentes);
  modalLimpar.close();
  mostrarTarefasNaTela();
});

// 10. Inicializa a página
carregarPlantasNoSelect();
adicionarRegasDoDiaAutomaticamente();
mostrarTarefasNaTela();