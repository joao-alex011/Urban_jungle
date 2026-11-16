// script.js

// 1. Pegando os elementos do HTML pelo ID
const formulario = document.getElementById('form-add-plant');
const campoNome = document.getElementById('input-plant-name');
const campoEspecie = document.getElementById('input-plant-species');
const campoAmbiente = document.getElementById('select-plant-location');
const campoFrequencia = document.getElementById('input-watering-frequency');
const campoUltimaRega = document.getElementById('input-last-watered');
const campoLuz = document.getElementById('select-sunlight-level');
const campoFoto = document.getElementById('input-plant-photo');
const campoNotas = document.getElementById('textarea-plant-notes');

// Elementos da foto de preview
const caixaPreview = document.getElementById('photo-preview-container');
const imagemPreview = document.getElementById('img-photo-preview');

// Elementos do modal (janela de sucesso)
const modalSucesso = document.getElementById('add-plant-success-dialog');
const textoModal = document.getElementById('success-dialog-text');
const botaoCadastrarOutra = document.getElementById('btn-dialog-add-another');

// Variável para guardar a foto escolhida
let fotoSalva = '';

// 2. Quando o usuário escolhe uma foto, mostramos ela na tela
campoFoto.addEventListener('change', function () {
  const arquivo = campoFoto.files[0];

  if (arquivo) {
    const leitor = new FileReader();

    leitor.onload = function (evento) {
      fotoSalva = evento.target.result;
      imagemPreview.src = fotoSalva;
      caixaPreview.hidden = false; // Mostra a caixa da foto
    };

    leitor.readAsDataURL(arquivo);
  } else {
    fotoSalva = '';
    imagemPreview.src = '';
    caixaPreview.hidden = true; // Esconde a caixa da foto
  }
});

// 3. Quando clicar em "Limpar Formulário", esconde a foto de novo
formulario.addEventListener('reset', function () {
  fotoSalva = '';
  imagemPreview.src = '';
  caixaPreview.hidden = true;
});

// 4. Quando o usuário enviar o formulário (Salvar Planta)
formulario.addEventListener('submit', function (evento) {
  // Impede a página de recarregar sozinha
  evento.preventDefault();

  // Calculando a data da próxima rega de um jeito simples
  const diasFrequencia = Number(campoFrequencia.value);
  const dataUltima = new Date(campoUltimaRega.value);
  dataUltima.setDate(dataUltima.getDate() + diasFrequencia);

  // Transforma a data calculada em texto (AAAA-MM-DD)
  const proximaRega = dataUltima.toISOString().split('T')[0];

  // Criando o objeto com os dados da planta
  const novaPlanta = {
    id: Date.now(), // Usa o tempo atual como ID único
    nome: campoNome.value,
    especie: campoEspecie.value,
    ambiente: campoAmbiente.value,
    frequenciaDias: diasFrequencia,
    ultimaRega: campoUltimaRega.value,
    proximaRega: proximaRega,
    iluminacao: campoLuz.value,
    foto: fotoSalva,
    observacoes: campoNotas.value
  };

  // Buscando as plantas que já estão salvas no localStorage
  let listaDePlantas = JSON.parse(localStorage.getItem('minhas_plantas'));

  // Se ainda não existir nenhuma lista salva, cria uma lista vazia
  if (listaDePlantas === null) {
    listaDePlantas = [];
  }

  // Adiciona a nova planta na lista e salva de volta no navegador
  listaDePlantas.push(novaPlanta);
  localStorage.setItem('minhas_plantas', JSON.stringify(listaDePlantas));

  // Muda o texto da janela de confirmação e abre ela na tela
  textoModal.textContent = 'A planta ' + novaPlanta.nome + ' foi cadastrada com sucesso!';
  modalSucesso.showModal();
});

// 5. Quando clicar em "Cadastrar Outra" dentro da janela de sucesso
botaoCadastrarOutra.addEventListener('click', function () {
  formulario.reset();
  modalSucesso.close();
});