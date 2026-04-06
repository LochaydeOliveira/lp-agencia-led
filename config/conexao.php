<?php

ini_set('display_errors', 1);
error_reporting(E_ALL);

// O segredo está no prefixo 'mysql-'
$host = 'mysql-loxaid.alwaysdata.net'; 
$db   = 'loxaid_agencia_led'; // Verifique se o nome no painel tem os underlines exatamente assim
$user = 'loxaid';
$pass = 'Q2fcMq*XZ5S*t35';
$charset = 'utf8mb4';

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
    echo "Conexão realizada com sucesso!"; // Descomente para testar
} catch (\PDOException $e) {
    // Em produção, é melhor não mostrar o erro bruto para o usuário, mas para o log
    error_log($e->getMessage());
    exit("Erro técnico: Não foi possível conectar ao banco de dados.");
}