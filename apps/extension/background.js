// Service worker MV3 — único lugar que fala com a API da Órbita (ver
// lib/api.js). Popup e content script mandam mensagens pra cá via
// `chrome.runtime.sendMessage`; nenhum dos dois faz fetch diretamente.
import { apiRequest, getSession, login, logout } from "./lib/api.js";

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  handle(message).then(sendResponse).catch((err) => sendResponse({ error: err.message }));
  return true; // mantém o canal aberto pra resposta assíncrona
});

async function handle(message) {
  switch (message.type) {
    case "GET_STATE": {
      const session = await getSession();
      return { loggedIn: !!session, user: session?.user ?? null };
    }

    case "LOGIN": {
      const session = await login(message.email, message.password);
      return { loggedIn: true, user: session.user };
    }

    case "LOGOUT": {
      await logout();
      return { loggedIn: false };
    }

    /** Busca um SKU pelo código; devolve `null` se não existir ainda (o
     * popup decide se cria um novo ou só atualiza o custo de um existente). */
    case "FIND_SKU_BY_CODE": {
      const results = await apiRequest(`/catalog/skus?q=${encodeURIComponent(message.code)}`);
      const exact = results.find((s) => s.code.toLowerCase() === message.code.toLowerCase());
      return { sku: exact ?? null };
    }

    /** Cadastra rapidamente o custo do SKU — cria se o código não existir
     * ainda, ou só atualiza `costAmount` se já existir (mesma regra do
     * "Novo SKU" da tela de Estoque, Etapa 5, agora contra a API real). */
    case "SAVE_SKU_COST": {
      const { code, name, costAmount } = message;
      const existing = await apiRequest(`/catalog/skus?q=${encodeURIComponent(code)}`);
      const match = existing.find((s) => s.code.toLowerCase() === code.toLowerCase());

      const sku = match
        ? await apiRequest(`/catalog/skus/${match.id}`, { method: "PATCH", body: JSON.stringify({ costAmount }) })
        : await apiRequest("/catalog/skus", { method: "POST", body: JSON.stringify({ code, name, costAmount }) });

      if (message.provider && message.externalListingId) {
        await apiRequest(`/catalog/skus/${sku.id}/link-listing`, {
          method: "POST",
          body: JSON.stringify({ provider: message.provider, externalListingId: message.externalListingId }),
        });
      }

      return { sku };
    }

    case "ANALYZE_COMPETITOR": {
      const result = await apiRequest("/discovery/concorrentes", { method: "POST", body: JSON.stringify({ url: message.url }) });
      return { result };
    }

    case "ANALYZE_LISTING": {
      const result = await apiRequest("/discovery/anuncio", { method: "POST", body: JSON.stringify({ url: message.url }) });
      return { result };
    }

    default:
      throw new Error(`Mensagem desconhecida: ${message.type}`);
  }
}
