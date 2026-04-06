<?php

ini_set('display_errors', 1);
error_reporting(E_ALL);

$host = 'localhost';
$db   = 'paymen58_site_led';
$user = 'paymen58';
$pass = 'u4q7+B6ly)obP_gxN9sNe';
$charset = 'utf8mb4';

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    error_log($e->getMessage());
    exit("Erro técnico: Não foi possível conectar ao banco de dados.");
}