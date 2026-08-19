import { Module } from "@nestjs/common";
import { AlertsService } from "./alerts.service";

/**
 * Alertas e notificações. `Alert` é a condição detectada pelo sistema
 * (estoque baixo, ACOS alto, anúncio pausado, erro de sincronização, custo
 * faltando); cada Alert pode gerar várias `Notification` (uma por membro
 * ativo do workspace). Outros módulos (integrations, orders, listings, ads)
 * disparam Alerts via `AlertsService` em vez de escrever notificações
 * diretamente.
 */
@Module({
  providers: [AlertsService],
  exports: [AlertsService],
})
export class AlertsModule {}
