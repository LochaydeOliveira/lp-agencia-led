<?php
require_once __DIR__ . '/../PHPMailer/Exception.php';
require_once __DIR__ . '/../PHPMailer/PHPMailer.php';
require_once __DIR__ . '/../PHPMailer/SMTP.php';
require_once __DIR__ . '/../config/email.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class Mailer {
    private $mailer;

    public function __construct() {
        try {
            $this->mailer = new PHPMailer(true);
            $this->mailer->isSMTP();
            $this->mailer->Host       = SMTP_HOST;
            $this->mailer->SMTPAuth   = true;
            $this->mailer->Username   = SMTP_USER;
            $this->mailer->Password   = SMTP_PASS;
            $this->mailer->SMTPSecure = SMTP_SECURE;
            $this->mailer->Port       = SMTP_PORT;
            $this->mailer->CharSet    = 'UTF-8';
            $this->mailer->setFrom(SMTP_USER, 'Agência LED');
            $this->mailer->isHTML(true);

        } catch (Exception $e) {
            error_log("Erro ao iniciar Mailer: " . $e->getMessage());
        }
    }

    public function sendCustomEmail($to, $subject, $body) {
        try {
            $this->mailer->clearAddresses();
            $this->mailer->addAddress($to);
            $this->mailer->Subject = $subject;
            $this->mailer->Body    = $this->stylizeEmail($body);
            $this->mailer->AltBody = strip_tags($body);

            return $this->mailer->send();
        } catch (Exception $e) {
            error_log("Falha PHPMailer (Lead): " . $this->mailer->ErrorInfo);
            return false;
        }
    }

    public function sendNotification($leadNome, $leadEmail, $leadRota) {
        try {
            $this->mailer->clearAddresses();
            $this->mailer->addAddress(SMTP_USER);
            $this->mailer->addAddress('lochaydeguerreiro@hotmail.com');
            
            $this->mailer->Subject = "🔔 NOVO LEAD: " . $leadNome . " (" . $leadRota . ")";
        

            $conteudoNotificacao = "
                <h2 style='color: #000;'>Novo Lead no Funil!</h2>
                <p><strong>Nome:</strong> {$leadNome}</p>
                <p><strong>E-mail:</strong> {$leadEmail}</p>
                <p><strong>Rota Finalizada:</strong> {$leadRota}</p>
                <p><strong>WhatsApp:</strong> <a href='https://wa.me/{$leadEmail}' style='color: #28a745; font-weight: bold;'>Clique aqui para chamar ({$leadEmail})</a></p>
                <p><strong>Data:</strong> " . date('d/m/Y H:i:s') . "</p>
            ";

            $this->mailer->Body    = $this->stylizeEmail($conteudoNotificacao);
            $this->mailer->AltBody = "Novo Lead: {$leadNome} - E-mail: {$leadEmail} - Rota: {$leadRota}";

            return $this->mailer->send();
        } catch (Exception $e) {
            error_log("Falha PHPMailer (Notificação): " . $this->mailer->ErrorInfo);
            return false;
        }
    }

    private function stylizeEmail($content) {
        $ano = date('Y');
        return "
        <div style='background-color: #f4f4f4; padding: 40px 10px; font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif;'>
            <div style='max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);'>
                <div style='background-color: #000000; padding: 30px; text-align: center;'>
                    <img src='https://agencialed.com/lp/assets/img/logo-led-branca.png' alt='Agência LED' style='width: 100px; height: auto;'>
                </div>
                
                <div style='padding: 40px; line-height: 1.6; color: #333333; font-size: 16px;'>
                    {$content}
                </div>

                <div style='background-color: #fafafa; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;'>
                    <p style='font-size: 12px; color: #999999; margin: 0;'>
                        &copy; {$ano} Agência LED - Consultoria Digital & Estratégia de Vendas.<br>
                        Você recebeu este e-mail porque finalizou nossa análise de perfil.
                    </p>
                </div>
            </div>
        </div>";
    }
}