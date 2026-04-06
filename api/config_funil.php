<?php

header('Content-Type: application/json');

require_once __DIR__ . '/../config/conexao.php';

try {

    $sql = "SELECT 
                p.id as pergunta_id, 
                p.titulo, 
                p.descricao, 
                p.categoria, 
                p.icone, 
                p.ordem,
                o.id as opcao_id, 
                o.texto_opcao, 
                o.valor_score, 
                o.proximo_passo_id, 
                o.desvio_rota
            FROM perguntas p
            LEFT JOIN opcoes o ON p.id = o.pergunta_id
            ORDER BY p.ordem ASC, o.id ASC";
            
    $query = $pdo->query($sql);
    $resultados = $query->fetchAll(PDO::FETCH_ASSOC);

    $funil = [];

    foreach ($resultados as $row) {
        $id_pergunta = $row['pergunta_id'];
        
        if (!isset($funil[$id_pergunta])) {
            $funil[$id_pergunta] = [
                'pergunta_id' => (int)$row['pergunta_id'],
                'titulo'      => $row['titulo'],
                'descricao'   => $row['descricao'],
                'categoria'   => $row['categoria'],
                'icone'       => $row['icone'],
                'opcoes'      => []
            ];
        }

        if ($row['texto_opcao']) {
            $funil[$id_pergunta]['opcoes'][] = [
                'id'    => (int)$row['opcao_id'],
                'texto' => $row['texto_opcao'],
                'score' => (int)$row['valor_score'],
                'salto' => $row['proximo_passo_id'],
                'rota'  => $row['desvio_rota']
            ];
        }
    }

    echo json_encode(array_values($funil), JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {

    error_log("Erro no Funil Agência LED: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error'   => 'Falha ao carregar estrutura do funil. Verifique a conexão com o banco.'
    ]);
}