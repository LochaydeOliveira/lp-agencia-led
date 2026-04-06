function configurarBotoesWhatsapp() {
    const popup = document.getElementById('popupQualificacao');
    const btnFechar = document.getElementById('fecharPopup');
    const btnProsseguir = document.getElementById('irFormulario');
    const botoesContato = document.querySelectorAll('.btn-whatsapp-led, #btn-whatsapp-intercept');

    botoesContato.forEach(botao => {
        botao.addEventListener('click', (e) => {
            e.preventDefault();
            
            const aprovado = localStorage.getItem('leadQualificadoLED');

            if (aprovado === 'true') {
                const resumo = localStorage.getItem('leadResumoLED') || "Olá! Meu projeto foi aprovado no site da Agência LED e quero marcar minha call.";
                const msgUrl = encodeURIComponent(resumo);
                window.open(`https://wa.me/${CONFIG.numeroAgencia}?text=${msgUrl}`, '_blank');
            } else {

                if (popup) {
                    popup.style.display = 'flex';
                } else {
                    const modalElement = document.getElementById('modalFunil');
                    if (modalElement) {
                        const m = bootstrap.Modal.getOrCreateInstance(modalElement);
                        m.show();
                    }
                }
            }
        });
    });


    if (btnFechar) {
        btnFechar.onclick = () => {
            popup.style.display = 'none';
        };
    }

    if (btnProsseguir) {
        btnProsseguir.onclick = () => {
            if (popup) popup.style.display = 'none';
            
            const modalElement = document.getElementById('modalFunil');
            if (modalElement) {
                const modalFunil = bootstrap.Modal.getOrCreateInstance(modalElement);
                modalFunil.show();
            }
        };
    }
}


document.addEventListener('DOMContentLoaded', configurarBotoesWhatsapp);

function atualizarBotaoWhatsappFlutuante() {

    const btnWhats = document.getElementById('btn-whatsapp-flutuante'); 
    if (!btnWhats) return;

    const eQualificado = localStorage.getItem('leadQualificadoLED');
    const resumoSalvo = localStorage.getItem('leadResumoLED');

    if (eQualificado === 'true' && resumoSalvo) {
        const msgUrl = encodeURIComponent(resumoSalvo);
        btnWhats.href = `https://wa.me/${CONFIG.numeroAgencia}?text=${msgUrl}`;
    } else {
        btnWhats.href = `https://wa.me/${CONFIG.numeroAgencia}?text=Olá, gostaria de saber mais sobre a criação de lojas profissionais.`;
    }
}

document.addEventListener('DOMContentLoaded', atualizarBotaoWhatsappFlutuante);