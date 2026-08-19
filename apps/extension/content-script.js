// Injetado em páginas de anúncio do Mercado Livre/Shopee. Só desenha um
// botão flutuante + painel — toda chamada de API acontece no background
// (ver background.js) via `chrome.runtime.sendMessage`, nunca aqui.

function detectListing() {
  const url = window.location.href;

  // Mercado Livre: item id no formato "MLB1234567890" aparece na URL com ou
  // sem hífen ("MLB-1234567890-..." no item clássico, "MLB12345678" em
  // catálogo) — normalizamos removendo o hífen, que é o formato salvo em
  // `Listing.externalListingId` pelo sync (Etapa 9, mercado-livre.mappers.ts).
  const mlMatch = url.match(/MLB-?(\d+)/i);
  if (mlMatch && /mercadoliv|mercadolibre/i.test(url)) {
    return { provider: "MERCADO_LIVRE", externalListingId: `MLB${mlMatch[1]}`, title: guessTitle() };
  }

  // Shopee: URL no formato ".../produto-i.<shopId>.<itemId>" — o itemId é o
  // segundo número, que é o que a API da Shopee usa como identificador do
  // item (conector ainda não implementado no backend — Etapa 9 ficou só com
  // Mercado Livre — então "Vincular" aqui vai dar 404 até isso existir).
  const shopeeMatch = url.match(/-i\.(\d+)\.(\d+)/);
  if (shopeeMatch) {
    return { provider: "SHOPEE", externalListingId: shopeeMatch[2], title: guessTitle() };
  }

  return null;
}

function guessTitle() {
  // Heurística simples — pega o <h1> da página, que é o título do anúncio
  // na esmagadora maioria dos templates de ambos os marketplaces.
  const h1 = document.querySelector("h1");
  return h1?.textContent?.trim().slice(0, 200) ?? "";
}

function sendMessage(message) {
  return chrome.runtime.sendMessage(message);
}

function buildWidget(listing) {
  const root = document.createElement("div");
  root.id = "orbita-widget";
  root.innerHTML = `
    <button id="orbita-fab" title="Órbita" aria-label="Abrir Órbita">Ó</button>
    <div id="orbita-panel" hidden>
      <header>
        <strong>Órbita</strong>
        <button id="orbita-close" aria-label="Fechar">×</button>
      </header>
      <div id="orbita-body">
        <p class="orbita-title">${listing.title || "Anúncio"}</p>

        <section id="orbita-cost-section">
          <label>SKU
            <input id="orbita-sku-code" placeholder="Código do SKU" />
          </label>
          <label>Custo unitário (R$)
            <input id="orbita-sku-cost" inputMode="decimal" placeholder="0,00" />
          </label>
          <button id="orbita-save-cost">Cadastrar custo</button>
          <p id="orbita-cost-feedback" class="orbita-feedback"></p>
        </section>

        <section id="orbita-analysis-section">
          <button id="orbita-analyze">Analisar concorrência deste anúncio</button>
          <div id="orbita-analysis-result"></div>
        </section>
      </div>
    </div>
  `;
  document.body.appendChild(root);

  root.querySelector("#orbita-fab").addEventListener("click", () => {
    const panel = root.querySelector("#orbita-panel");
    panel.hidden = !panel.hidden;
  });
  root.querySelector("#orbita-close").addEventListener("click", () => {
    root.querySelector("#orbita-panel").hidden = true;
  });

  root.querySelector("#orbita-save-cost").addEventListener("click", async () => {
    const code = root.querySelector("#orbita-sku-code").value.trim();
    const costRaw = root.querySelector("#orbita-sku-cost").value.trim();
    const feedback = root.querySelector("#orbita-cost-feedback");
    const costAmount = Number(costRaw.replace(",", "."));

    if (!code || !Number.isFinite(costAmount) || costAmount <= 0) {
      feedback.textContent = "Informe um código de SKU e um custo válido.";
      feedback.className = "orbita-feedback orbita-feedback-error";
      return;
    }

    feedback.textContent = "Salvando…";
    feedback.className = "orbita-feedback";
    try {
      const response = await sendMessage({
        type: "SAVE_SKU_COST",
        code,
        name: listing.title || code,
        costAmount,
        provider: listing.provider,
        externalListingId: listing.externalListingId,
      });
      if (response.error) throw new Error(response.error);
      feedback.textContent = "Custo salvo e vinculado a este anúncio.";
      feedback.className = "orbita-feedback orbita-feedback-success";
    } catch (err) {
      feedback.textContent = err.message;
      feedback.className = "orbita-feedback orbita-feedback-error";
    }
  });

  root.querySelector("#orbita-analyze").addEventListener("click", async () => {
    const resultEl = root.querySelector("#orbita-analysis-result");
    resultEl.textContent = "Analisando…";
    try {
      const response = await sendMessage({ type: "ANALYZE_LISTING", url: window.location.href });
      if (response.error) throw new Error(response.error);
      const r = response.result;
      resultEl.innerHTML = `
        <p>Vendas (30d): <strong>${r.sales30d}</strong></p>
        <p>Visitas (30d): <strong>${r.visits30d}</strong></p>
        <p>Conversão: <strong>${r.conversionPercent}%</strong></p>
        <p>Faturamento (30d): <strong>R$ ${r.revenue30d.toFixed(2)}</strong></p>
      `;
    } catch (err) {
      resultEl.textContent = err.message;
    }
  });

  return root;
}

async function init() {
  const listing = detectListing();
  if (!listing) return; // não é uma página de anúncio reconhecida — não desenha nada

  const state = await sendMessage({ type: "GET_STATE" });
  if (!state.loggedIn) return; // não incomoda quem não conectou a conta ainda

  buildWidget(listing);
}

init();
