/**
 * CRM Integration Script - Finanza Agevolata
 * Questo script intercetta l'invio del form e lo invia al CRM.
 */
(function() {
  // Identifica l'URL del CRM dinamicamente dalla sorgente di questo script
  const scriptTag = document.currentScript;
  const baseUrl = scriptTag ? new URL(scriptTag.src).origin : window.location.origin;

  function initIntegration() {
    const form = document.querySelector("form");
    
    if (!form) {
      console.warn("CRM Integration: Nessun elemento <form> trovato nella pagina.");
      return;
    }

    form.addEventListener("submit", async function(e) {
      // 2 Blocca invio originale
      e.preventDefault();
      
      // 3 Raccoglie tutti i campi
      const data = new FormData(form);
      const payload = Object.fromEntries(data.entries());
      
      // Aggiunge metadati richiesti
      payload.formId = "finanza-agevolata";
      payload.source = window.location.href;

      // Safe stringify helper
      const safeJsonStringify = (obj) => {
        const cache = new Set();
        return JSON.stringify(obj, (key, value) => {
          if (typeof value === 'object' && value !== null) {
            if (cache.has(value)) return '[Circular]';
            cache.add(value);
          }
          return value;
        });
      };

      try {
        // 4 Invia i dati al CRM
        const response = await fetch(`${baseUrl}/api/public/form`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: safeJsonStringify(payload)
        });

        if (response.ok) {
          // 5 Mostra messaggio successo
          alert("Richiesta inviata correttamente");
          // 6 Resetta form
          form.reset();
        } else {
          console.error("CRM Error:", await response.text());
        }
      } catch (error) {
        console.error("CRM Connection Error:", error);
      }
    });

    console.log("CRM Integration: Pronto. Form intercettato.");
  }

  // Esegue l'inizializzazione quando il DOM è pronto
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initIntegration);
  } else {
    initIntegration();
  }
})();
