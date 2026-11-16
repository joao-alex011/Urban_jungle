// settings.js

// 1. Pegando os elementos do formulário de Preferências pelos IDs exatos
const formularioPreferencias = document.getElementById('form-user-preferences');
const checkNotificacoes = document.getElementById('input-enable-notifications');
const campoHorario = document.getElementById('input-reminder-time');
const seletorClima = document.getElementById('select-climate-region');

// 2. Pegando os elementos da Zona de Perigo (Limpar LocalStorage)
const botaoAbrirModalLimpar = document.getElementById('btn-open-clear-storage-dialog');
const modalLimparStorage = document.getElementById('confirm-clear-storage-dialog');
const campoConfirmarPalavra = document.getElementById('input-confirm-wipe');
const botaoCancelarLimpeza = document.getElementById('btn-cancel-wipe-storage');
const botaoConfirmarLimpeza = document.getElementById('btn-confirm-wipe-storage');

// 3. Função que carrega as configurações salvas quando a página abre
function carregarPreferencias() {
  const dadosSalvos = JSON.parse(localStorage.getItem('minhas_configuracoes'));

  // Se já existir alguma configuração salva no navegador, preenche os campos
  if (dadosSalvos !== null) {
    checkNotificacoes.checked = dadosSalvos.notificacoesAtivas;
    campoHorario.value = dadosSalvos.horarioLembrete;
    seletorClima.value = dadosSalvos.climaRegiao;
  }
}

// 4. Salvar as preferências quando o usuário clicar em "Salvar Preferências"
formularioPreferencias.addEventListener('submit', function (evento) {
  evento.preventDefault();

  const novasConfiguracoes = {
    notificacoesAtivas: checkNotificacoes.checked,
    horarioLembrete: campoHorario.value,
    climaRegiao: seletorClima.value
  };

  localStorage.setItem('minhas_configuracoes', JSON.stringify(novasConfiguracoes));
  alert('Suas preferências foram salvas com sucesso!');
});

// 5. Abrir a janela (modal) de apagar todos os dados
botaoAbrirModalLimpar.addEventListener('click', function () {
  campoConfirmarPalavra.value = ''; // Limpa o campo de texto antes de abrir
  modalLimparStorage.showModal();
});

// 6. Botão "Cancelar" dentro da janela modal
botaoCancelarLimpeza.addEventListener('click', function (evento) {
  evento.preventDefault(); // Evita que o atributo "required" bloqueie o botão de cancelar
  modalLimparStorage.close();
});

// 7. Botão "Limpar LocalStorage" (Verifica se digitou LIMPAR e apaga tudo)
botaoConfirmarLimpeza.addEventListener('click', function (evento) {
  evento.preventDefault();

  const textoDigitado = campoConfirmarPalavra.value.trim().toUpperCase();

  if (textoDigitado === 'LIMPAR') {
    // Apaga todas as chaves salvas no localStorage (plantas, tarefas, cronograma e configurações)
    localStorage.clear();

    modalLimparStorage.close();
    formularioPreferencias.reset();
    alert('Todos os dados do aplicativo foram apagados com sucesso!');
  } else {
    alert('Por favor, digite a palavra LIMPAR corretamente para confirmar a exclusão.');
  }
});

// 8. Executa assim que a página abre
carregarPreferencias();