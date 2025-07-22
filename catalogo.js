//filmes separados e cataloco
import { db } from "https://alexandre7888.github.io/Filmes-E-TV/firebaseConfig.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

window.token = window.token || "";

document.addEventListener("DOMContentLoaded", async () => {
  aplicarEstilos();

  const input = document.createElement("input");
  input.placeholder = "🔍 Buscar por título";
  input.style = "padding: 12px; width: 90%; max-width: 400px; margin: 20px auto; display: block; font-size: 16px; border-radius: 8px; border: 1px solid #ccc;";
  document.body.appendChild(input);

  const container = document.createElement("div");
  container.style = "padding: 10px;";
  document.body.appendChild(container);

  const catalogo = await carregarCatalogo();
  let filtrado = catalogo;

  input.addEventListener("input", () => {
    const termo = input.value.toLowerCase();
    filtrado = catalogo.filter(item =>
      (item.titulo || "").toLowerCase().includes(termo)
    );
    renderizar(filtrado, container);
  });

  renderizar(filtrado, container);
});

function aplicarEstilos() {
  const estilo = document.createElement("style");
  estilo.textContent = `
    body {
      font-family: Arial, sans-serif;
      background: #f2f2f2;
      color: #222;
      margin: 0;
      padding: 0;
    }
    h2 {
      margin-top: 40px;
      text-align: center;
      color: #444;
    }
    h3 {
      font-size: 20px;
      color: #333;
      margin-bottom: 10px;
    }
    .card {
      background: #fff;
      border-radius: 8px;
      padding: 20px;
      margin: 20px auto;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1);
      max-width: 800px;
    }
  `;
  document.head.appendChild(estilo);
}

async function carregarCatalogo() {
  const dados = [];
  const tipos = ["filmes", "series", "tv"];

  for (const tipo of tipos) {
    const snap = await get(ref(db, tipo));
    if (snap.exists()) {
      Object.values(snap.val()).forEach(item => dados.push({ ...item, tipo }));
    }
  }

  if (window.token) {
    const snap = await get(ref(db, "conteudos/" + window.token));
    if (snap.exists()) {
      const dadosPrivados = snap.val();
      for (const tipo of tipos) {
        if (dadosPrivados[tipo]) {
          Object.values(dadosPrivados[tipo]).forEach(item =>
            dados.push({ ...item, tipo })
          );
        }
      }
    }
  }

  return dados;
}

function renderizar(itens, container) {
  container.innerHTML = "";

  const categorias = {
    filmes: [],
    series: [],
    tv: []
  };

  itens.forEach(item => {
    if (categorias[item.tipo]) {
      categorias[item.tipo].push(item);
    }
  });

  for (const tipo in categorias) {
    if (categorias[tipo].length === 0) continue;

    const titulo = document.createElement("h2");
    titulo.textContent = tipo === "filmes" ? "🎬 Filmes"
                     : tipo === "series" ? "📺 Séries"
                     : "📡 TV Ao Vivo";
    container.appendChild(titulo);

    categorias[tipo].forEach(item => {
      const card = document.createElement("div");
      card.className = "card";

      const nome = document.createElement("h3");
      nome.textContent = item.titulo || "Sem título";
      card.appendChild(nome);

      if (item.link) {
        const iframe = document.createElement("iframe");
        iframe.src = item.link;
        iframe.width = "100%";
        iframe.height = "400";
        iframe.allowFullscreen = true;
        iframe.frameBorder = "0";
        card.appendChild(iframe);
      }

      container.appendChild(card);
    });
  }

  if (container.innerHTML.trim() === "") {
    container.innerHTML = "<p style='text-align:center;'>⚠️ Nada encontrado.</p>";
  }
}