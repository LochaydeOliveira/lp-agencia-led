<?php

header('Content-Type: application/json');

require_once __DIR__ . '/../config/conexao.php';
require_once __DIR__ . '/../src/Mailer.php';

try {
    $json = file_get_contents('php://input');
    $dados = json_decode($json, true);

    if (!$dados || !isset($dados['respostas']) || empty($dados['respostas'])) {
        echo json_encode(['success' => false, 'error' => 'Dados não recebidos.']);
        exit;
    }


    $nomeLimpo  = strip_tags(trim($dados['nome']));
    $emailLimpo = filter_var(trim($dados['email']), FILTER_SANITIZE_EMAIL);
    $whatsLimpo = preg_replace('/[^0-9]/', '', $dados['whatsapp']);

    if (!filter_var($emailLimpo, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['success' => false, 'error' => 'E-mail inválido.']);
        exit;
    }

    if (strlen($whatsLimpo) < 10) {
        echo json_encode(['success' => false, 'error' => 'WhatsApp incompleto.']);
        exit;
    }


    $ids = array_map('intval', $dados['respostas']);
    $placeholders = implode(',', array_fill(0, count($ids), '?'));
    
    $sqlBusca = "SELECT desvio_rota FROM opcoes WHERE id IN ($placeholders) AND desvio_rota IS NOT NULL 
                 ORDER BY FIELD(id, $placeholders)";
    
    $stmtBusca = $pdo->prepare($sqlBusca);
    $params = array_merge($ids, $ids);
    $stmtBusca->execute($params);
    $carimbos = $stmtBusca->fetchAll(PDO::FETCH_COLUMN);

    $rotaFinal = "ROTA_B"; 
    $status = "Aprovado";

    if (!empty($carimbos)) {
        $ultimaDecisao = end($carimbos); 
        if ($ultimaDecisao === 'ROTA_C') {
            $rotaFinal = "ROTA_C";
            $status = "Reprovado";
        } elseif ($ultimaDecisao === 'ROTA_A') {
            $rotaFinal = "ROTA_A";
        }
    }

    $sqlInsert = "INSERT INTO leads_respostas 
                  (nome, email, whatsapp, score_final, status_qualificacao, rota_final, data_envio) 
                  VALUES (:nome, :email, :whats, 0, :status, :rota, NOW())";
    
    $stmtInsert = $pdo->prepare($sqlInsert);
    $stmtInsert->execute([
        ':nome'   => $nomeLimpo,
        ':email'  => $emailLimpo,
        ':whats'  => $whatsLimpo,
        ':status' => $status,
        ':rota'   => $rotaFinal
    ]);

    $urlSheets = "https://script.google.com/macros/s/AKfycbwhlH4WccUjTx8rFIxZ7rSoF5iMIX18kWIgvsLG6GuGyijMyipF9EszLmwJYt-Q_Npj/exec";
    
    $dadosSheets = [
        'nome'     => $nomeLimpo,
        'email'    => $emailLimpo,
        'whatsapp' => $whatsLimpo, 
        'status'   => $status,
        'rota'     => $rotaFinal
    ];

    $ch = curl_init($urlSheets);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($dadosSheets));
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true); 
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_exec($ch);
    curl_close($ch);


    $mailer = new Mailer();
    $assunto = "";
    $mensagemHtml = "";

    if ($rotaFinal === 'ROTA_A') {
        $assunto = "🚀 Perfil VIP Confirmado: " . $nomeLimpo;
        $mensagemHtml = '
            <h2 style="color: #000; margin-top: 0;">Parabéns, ' . $nomeLimpo . '!</h2>
            <p>Sua análise de perfil foi concluída e temos ótimas notícias: <strong>Sua loja virtual foi APROVADA como um Projeto VIP para a Agência LED.</strong></p>
            <p>Isso significa que seu projeto tem o fit perfeito com nossa metodologia de escala.</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://wa.me/55859996710244" style="background-color: #ffc107; color: #000; padding: 15px 30px; text-decoration: none; border-radius: 30px; font-weight: bold; display: inline-block;">AGENDAR MINHA REUNIÃO ESTRATÉGICA</a>
            </div>
            <p style="font-size: 14px; color: #666;">* Clique no botão acima para abrir o WhatsApp e escolher um horário.</p>';
    } 
    elseif ($rotaFinal === 'ROTA_B') {
        $assunto = "💡 Sua Análise de Perfil chegou, " . $nomeLimpo;
        $mensagemHtml = '
            <h2 style="color: #000; margin-top: 0;">Tudo pronto, ' . $nomeLimpo . '!</h2>
            <p>Recebemos suas respostas e preparamos um material exclusivo para o momento atual do seu negócio.</p>
            <p>Assista ao vídeo abaixo para entender como podemos estruturar sua operação digital:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://agencialed.com/lp/" style="background-color: #ffc107; color: #000; padding: 15px 30px; text-decoration: none; border-radius: 30px; font-weight: bold; display: inline-block;">ASSISTIR VÍDEO EXPLICATIVO</a>
            </div>
            <p>Após o vídeo, se sentir que faz sentido, entre em contato conosco.</p>';
    }
    else { 
        $assunto = "🎓 Presente Exclusivo: Curso Loja Fácil";
        $mensagemHtml = '
            <h2 style="color: #000; margin-top: 0;">Oi, ' . $nomeLimpo . '!</h2>
            <p>Obrigado por dedicar seu tempo à nossa análise.</p>
            <p>No momento, não conseguimos absorver novos projetos com o seu perfil específico, mas queremos te ajudar a chegar no próximo nível.</p>
            <p>Liberamos um acesso especial ao nosso <strong>Curso Loja Fácil</strong> para você começar a estruturar sua base hoje mesmo.</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://agencialed.com/lp/" style="background-color: #ffc107; color: #000; padding: 15px 30px; text-decoration: none; border-radius: 30px; font-weight: bold; display: inline-block;">ACESSAR CURSO COM DESCONTO</a>
            </div>';
    }
    
    try {
        $mailer->sendCustomEmail($emailLimpo, $assunto, $mensagemHtml);
        $mailer->sendNotification($nomeLimpo, $emailLimpo, $rotaFinal);
        
    } catch (Exception $e) {
        error_log("Erro Mailer: " . $e->getMessage());
    }

    if (ob_get_length()) ob_clean();
    echo json_encode(['success' => true, 'nome' => $nomeLimpo, 'rota_final' => $rotaFinal]);
    exit;

} catch (Exception $e) {
    if (ob_get_length()) ob_clean();
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    exit;
}