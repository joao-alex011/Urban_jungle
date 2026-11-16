document.addEventListener('DOMContentLoaded', function() {
    const btnAbrir = document.getElementById('btn-open-feedback-dialog');
    const dialogFeedback = document.getElementById('feedback-dialog');
    const formFeedback = document.getElementById('feedback-form');
    const btnCancelar = document.getElementById('btn-cancel-feedback');

    // 2. Evento para ABRIR a janela quando clicar no botão
    if (btnAbrir && dialogFeedback) {
        btnAbrir.addEventListener('click', function() {
            dialogFeedback.showModal(); // Função nativa que abre o <dialog>
        });
    }

    // 3. Evento para FECHAR a janela ao clicar em Cancelar
    if (btnCancelar) {
        btnCancelar.addEventListener('click', function() {
            dialogFeedback.close(); // Função nativa que fecha o <dialog>
        });
    }

    // 4. Evento para SALVAR a sugestão quando o formulário for enviado
    if (formFeedback) {
        formFeedback.addEventListener('submit', function() {
            // Pega o texto que o usuário digitou
            const assunto = document.getElementById('input-feedback-subject').value;
            const mensagem = document.getElementById('textarea-feedback-message').value;

            // Monta o objeto da sugestão
            const novaSugestao = {
                id: Date.now().toString(),
                assunto: assunto,
                mensagem: mensagem,
                data: new Date().toLocaleDateString('pt-BR')
            };

            // Puxa o array de sugestões do LocalStorage (ou cria vazio se não existir)
            const sugestoesSalvas = JSON.parse(localStorage.getItem('urbanJungle_sugestoes')) || [];
            
            // Adiciona a nova sugestão e salva de volta no navegador
            sugestoesSalvas.push(novaSugestao);
            localStorage.setItem('urbanJungle_sugestoes', JSON.stringify(sugestoesSalvas));

            // Avisa o usuário e limpa os campos
            alert('Sugestão salva com sucesso!');
            formFeedback.reset(); 
            
            // Fecha o diálogo
            dialogFeedback.close();
        });
    }
});