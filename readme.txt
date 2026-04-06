/public_html/ (ou home1/paymen58/agencialed.com/)
└── lp/
    ├── includes/
    │   └── conexao.php       # Conexão PDO com o Banco
    ├── api/
    │   ├── get_funil.php     # Busca perguntas e opções (JSON)
    │   └── salvar_lead.php   # Processa score, salva no DB e define a Rota
    ├── assets/
    │   ├── js/
    │   │   ├── motor.js      # O coração do formulário
    │   │   └── whatsapp.js   # Controle do botão flutuante
    │   └── css/
    │       └── estilo.css
    └── index.html            # Sua Landing Page