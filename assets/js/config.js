const CONFIG = {

    numeroAgencia: "558599671024",
    linkCurso: "https://agencialed.com/curso-loja-facil",
    
    pontoDeCorteScore: 6,
    
    api: {
        getFunil: 'api/config_funil.php',
        salvarLead: 'api/salvar_lead.php'
    },

    mensagens: {
        aprovadoVip: (nome) => `Olá! Sou o ${nome}. Meu projeto foi aprovado no site da Agência LED e quero marcar minha call para criar minha loja.`
    }
};


Object.freeze(CONFIG);