document.addEventListener('DOMContentLoaded', function() {

    const state = {
        perguntas: [],
        indiceAtual: 0,
        historicoIndices: [],
        respostasSelecionadas: [],
        dadosLead: { nome: '', email: '', whatsapp: '' }
    };

    const container = document.getElementById('container-dinamico');
    const progressBar = document.getElementById('form-progress');
    const loader = document.getElementById('loading-qualificacao');
    const stepDados = document.getElementById('step-dados');
    const btnFinalizar = document.getElementById('btn-finalizar');
    const btnVoltar = document.getElementById('btn-voltar');


    function validarEmailFormat(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    async function carregarFunil() {
        try {
            const resposta = await fetch(CONFIG.api.getFunil);
            if (!resposta.ok) throw new Error('Erro na rede ao buscar o funil');
            
            state.perguntas = await resposta.json();
            
            if (state.perguntas.length > 0) {
                renderizarEtapa();
            }
        } catch (error) {
            console.error("Falha ao carregar funil:", error);
            container.innerHTML = `<p class='text-danger text-center'>Erro ao carregar perguntas. Verifique sua conexão.</p>`;
        }
    }

    function renderizarEtapa() {
        const pergunta = state.perguntas[state.indiceAtual];

        if (!pergunta) {
            exibirCapturaFinal();
            return;
        }

        if (btnVoltar) {
            state.indiceAtual === 0 ? btnVoltar.classList.add('d-none') : btnVoltar.classList.remove('d-none');
        }

        const progresso = (state.indiceAtual / state.perguntas.length) * 100;
        if (progressBar) progressBar.style.width = `${progresso}%`;

        const htmlOpcoes = pergunta.opcoes.map(opt => `
            <button class="bg-body rounded-5 btn btn-outline-secondary w-100 mb-3 p-3 text-start btn-opcao shadow-sm" 
                    data-id-opcao="${opt.id}">
                <div class="d-flex justify-content-between align-items-center">
                    <span>${opt.texto}</span>
                    <i class="fas fa-chevron-right opacity-50"></i>
                </div>
            </button>
        `).join('');

        container.innerHTML = `
            <div class="animate__animated animate__fadeIn">
                <div class="text-center mb-4">
                    <i class="${pergunta.icone || 'fas fa-question-circle'} fa-3x text-warning mb-3"></i>
                    <h4 class="fw-bold">${pergunta.titulo}</h4>
                    <p class="text-muted small">${pergunta.descricao || ''}</p>
                </div>
                <div class="options-list">
                    ${htmlOpcoes}
                </div>
            </div>
        `;

        document.querySelectorAll('.btn-opcao').forEach(btn => {
            btn.onclick = function() {
                const idOpcao = this.getAttribute('data-id-opcao');
                const perguntaAtual = state.perguntas[state.indiceAtual];
                
                const idsOpcoesDestaPergunta = perguntaAtual.opcoes.map(o => o.id.toString());
                state.respostasSelecionadas = state.respostasSelecionadas.filter(id => !idsOpcoesDestaPergunta.includes(id));
                state.respostasSelecionadas.push(idOpcao);
                state.historicoIndices.push(state.indiceAtual);

                container.classList.add('d-none');
                if (btnVoltar) btnVoltar.classList.add('d-none');
                loader.classList.remove('d-none');

                setTimeout(() => {
                    const opcaoDados = perguntaAtual.opcoes.find(o => o.id == idOpcao);
                    
                    if (opcaoDados.salto) {
                        const proximoIndice = state.perguntas.findIndex(p => p.categoria === opcaoDados.salto);
                        state.indiceAtual = (proximoIndice !== -1) ? proximoIndice : state.perguntas.length;
                    } else {
                        state.indiceAtual++;
                    }

                    loader.classList.add('d-none');
                    container.classList.remove('d-none');
                    renderizarEtapa();
                }, 1000);
            };
        });
    }

    if (btnVoltar) {
        btnVoltar.onclick = function() {
            if (state.historicoIndices.length > 0) {
                state.respostasSelecionadas.pop();
                state.indiceAtual = state.historicoIndices.pop();
                renderizarEtapa();
            }
        };
    }

    function exibirCapturaFinal() {
        if (progressBar) progressBar.style.width = `100%`;
        if (btnVoltar) btnVoltar.classList.add('d-none'); 
        container.classList.add('d-none');
        stepDados.classList.remove('d-none');
    }


    if (btnFinalizar) {
        btnFinalizar.onclick = async function() {
            const nome = document.getElementById('lead_nome').value.trim();
            const email = document.getElementById('lead_email').value.trim();
            const whats = document.getElementById('lead_whats').value.trim();

            // Validação Front-end com Alerta Amigável
            if (!nome || nome.length < 3) {
                Swal.fire({ icon: 'error', title: 'Nome inválido', text: 'Por favor, informe seu nome completo.', confirmButtonColor: '#ffc107' });
                return;
            }

            if (!validarEmailFormat(email)) {
                Swal.fire({ icon: 'error', title: 'E-mail inválido', text: 'Por favor, insira um e-mail real (ex: julia@gmail.com).', confirmButtonColor: '#ffc107' });
                return;
            }

            if (whats.replace(/\D/g, '').length < 10) {
                Swal.fire({ icon: 'error', title: 'WhatsApp incompleto', text: 'Informe DDD e o número corretamente.', confirmButtonColor: '#ffc107' });
                return;
            }

            btnFinalizar.disabled = true;
            stepDados.classList.add('d-none');
            loader.classList.remove('d-none');

            const payload = {
                nome: nome,
                email: email,
                whatsapp: whats,
                respostas: state.respostasSelecionadas
            };

            try {
                const response = await fetch(CONFIG.api.salvarLead, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const resultado = await response.json();

                if (resultado.success) {
                    // Feedback de Processamento OK
                    Swal.fire({
                        icon: 'success',
                        title: 'Análise Concluída!',
                        text: `Parabéns ${resultado.nome}, identificamos sua melhor rota.`,
                        timer: 2000,
                        showConfirmButton: false
                    }).then(() => {
                        processarResultadoFinal(resultado);
                    });
                } else {
                    // BARRA ERROS QUE VÊM DO PHP (ex: julia@)
                    throw new Error(resultado.error);
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Ops!',
                    text: error.message,
                    confirmButtonColor: '#ffc107'
                });
                btnFinalizar.disabled = false;
                stepDados.classList.remove('d-none');
                loader.classList.add('d-none');
            }
        };
    }

    function gerarResumoProjeto(nome, rota) {
        let resumo = `Olá, eu sou o ${nome}. Meu projeto foi aprovado no site. `;
        
        state.perguntas.forEach(pergunta => {
            const opcao = pergunta.opcoes.find(opt => state.respostasSelecionadas.includes(opt.id.toString()));
            if (opcao) {
                if (pergunta.categoria === 'pergunta-modelo') resumo += `Meu modelo de negócio é *${opcao.texto}*. `;
                if (pergunta.categoria === 'pergunta-plataforma') resumo += `Quero minha loja em uma *${opcao.texto}*. `;
                if (pergunta.categoria === 'pergunta-prazo') resumo += `Tenho urgência para iniciar *${opcao.texto}*. `;
                if (pergunta.categoria === 'pergunta-budget') resumo += `E *${opcao.texto.toLowerCase()}*! `;
            }
        });

        if (rota === 'ROTA_A') {
            resumo += "\n\n🚀 Vamos agendar minha call?";
        } else {
            resumo += "\n\n💡 Gostaria de tirar algumas dúvidas sobre o projeto.";
        }
        return resumo;
    }

    function processarResultadoFinal(res) {
        stepDados.classList.add('d-none');
        loader.classList.add('d-none');            

        if (res.rota_final === 'ROTA_A') {
            const resumoCompleto = gerarResumoProjeto(res.nome, res.rota_final);

            localStorage.setItem('leadQualificadoLED', 'true'); 
            localStorage.setItem('leadNomeLED', res.nome);
            localStorage.setItem('leadResumoLED', resumoCompleto);
            
            document.getElementById('display-nome').innerText = res.nome;
            document.getElementById('step-aprovado-whats').classList.remove('d-none');

            confetti({
                particleCount: 150, spread: 70, origin: { y: 0.6 }, zIndex: 9999,
                colors: ['#ffc107', '#ffffff', '#28a745']
            });

            const msg = encodeURIComponent(resumoCompleto);
            setTimeout(() => {
                window.location.href = `https://wa.me/${CONFIG.numeroAgencia}?text=${msg}`;
                const modalInstance = bootstrap.Modal.getInstance(document.getElementById('modalFunil'));
                if (modalInstance) modalInstance.hide();
            }, 3000);

        } else if (res.rota_final === 'ROTA_B') {
            localStorage.removeItem('leadQualificadoLED'); 
            
            document.getElementById('display-nome-video').innerText = res.nome;
            document.getElementById('step-aprovado-video').classList.remove('d-none');

            confetti({
                particleCount: 80, spread: 50, origin: { y: 0.7 }, zIndex: 9999,
                colors: ['#ffc107', '#ffffff', '#007bff']
            });

        } else {
            localStorage.removeItem('leadQualificadoLED');
            document.getElementById('display-nome-curso').innerText = res.nome;
            document.getElementById('step-rejeitado').classList.remove('d-none');           
        }
    }

    function resetarFunilLED() {
        state.respostasSelecionadas = [];
        state.indiceAtual = 0;
        state.historicoIndices = [];

        const blocosParaEsconder = ['step-dados', 'step-aprovado-whats', 'step-aprovado-video', 'step-rejeitado', 'loading-qualificacao'];
        
        blocosParaEsconder.forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) elemento.classList.add('d-none');
        });

        if (container) container.classList.remove('d-none');
        if (progressBar) progressBar.style.width = `0%`;
        if (btnVoltar) btnVoltar.classList.add('d-none');
        if (btnFinalizar) btnFinalizar.disabled = false;

        const inputs = ['lead_nome', 'lead_email', 'lead_whats'];
        inputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) input.value = '';
        });

        renderizarEtapa();
    }

    const modalFunil = document.getElementById('modalFunil');
    if (modalFunil) {
        modalFunil.addEventListener('show.bs.modal', () => {
            resetarFunilLED();
        });
    }

    carregarFunil();
});



document.addEventListener("DOMContentLoaded", function () {
  const carousel = document.querySelector(".mobile-carousel");
  const items = document.querySelectorAll(".mobile-carousel .col-md-4");
  const dotsContainer = document.querySelector(".carousel-dots");

  if (!carousel || !dotsContainer) return;


  items.forEach((_, index) => {
    const dot = document.createElement("span");
    if (index === 0) dot.classList.add("active");
    dotsContainer.appendChild(dot);
  });


  const dots = dotsContainer.querySelectorAll("span");


  function updateActive() {
    const carouselCenter = carousel.scrollLeft + (carousel.offsetWidth / 2);

    items.forEach((item, index) => {
      const itemLeft = item.offsetLeft;
      const itemRight = itemLeft + item.offsetWidth;

      if (carouselCenter >= itemLeft && carouselCenter <= itemRight) {
        item.classList.add("active");
        dots.forEach(d => d.classList.remove("active"));
        if (dots[index]) dots[index].classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });
  }

  let scrollInterval;
  const intervalTime = 4000;

  function startAutoPlay() {
    scrollInterval = setInterval(() => {
      const itemWidth = items[0].offsetWidth + 16;
      const maxScroll = carousel.scrollWidth - carousel.offsetWidth;

      if (carousel.scrollLeft >= maxScroll - 10) {
        carousel.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        carousel.scrollBy({ left: itemWidth, behavior: "smooth" });
      }
    }, intervalTime);
  }

  carousel.addEventListener("scroll", updateActive);
  startAutoPlay();

  carousel.addEventListener("touchstart", () => clearInterval(scrollInterval));
  carousel.addEventListener("mousedown", () => clearInterval(scrollInterval));

  setTimeout(() => {
    carousel.scrollTo({ left: 0, behavior: "instant" });
    updateActive();
  }, 50);
});
