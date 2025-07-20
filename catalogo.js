//filmes separados e cataloco
import { db } from "https://alexandre7888.github.io/Filmes-E-TV/firebaseConfig.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

window.token = window.token || "";

let catalogoGlobal = [];

document.addEventListener("DOMContentLoaded", async () => {
  aplicarCSS();
  criarCampoDeBusca();
  catalogoGlobal = await carregarCatalogoComDados();
  exibirCatalogoFiltrado("");
});

function aplicarCSS() {
  const style = document.createElement("style");
  style.textContent = `
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f6f9;
      color: #333;
      margin: 0;
      padding: 20px;
    }
    #catalogo {
      max-width: 900px;
      margin: 0 auto;
    }
    h1 {
      text-align: center;
      color: #2c3e50;
      margin-bottom: 30px;
    }
    input[type="text"] {
      padding: 12px;
      width: 100%;
      max-width: 600px;
      font-size: 16px;
      margin: 0 auto 30px;
      display: block;
      border: 1px solid #ccc;
      border-radius: 8px;
      box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
    }
    .card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1);
      overflow: hidden;
      margin-bottom: 25px;
      display: flex;
      flex-direction: column;
      padding: 15px;
      transition: transform 0.2s;
    }
    .card:hover {
      transform: scale(1.01);
    }
    .card img {
      width: 100%;
      max-width: 300px;
      margin-bottom: 10px;
      border-radius: 10px;
    }
    .card h3 {
      margin: 10px 0 5px;
      font-size: 22px;
      color: #34495e;
    }
    .card p {
      font-size: 15px;
      margin: 4px 0;
      color: #555;
    }
    .card button {
      margin-top: 10px;
      padding: 10px 15px;
      font-size: 15px;
      background-color: #4CAF50;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }
    .card button:hover {
      background-color: #45a049;
    }
  `;
  document.head.appendChild(style);
}

function criarCampoDeBusca() {
  const busca = document.createElement("input");
  busca.type = "text";
  busca.placeholder = "🔍 Pesquisar por título, autor ou gênero";
  busca.addEventListener("input", () => {
    const termo = busca.value.toLowerCase();
    exibirCatalogoFiltrado(termo);
  });
  document.body.prepend(busca);
}

async function carregarCatalogoComDados() {
  const token = window.token;
  const catalogo = [];

  // Públicos
  for (const tipo of ["filmes", "series", "tv"]) {
    const snap = await get(ref(db, tipo));
    if (snap.exists()) {
      Object.values(snap.val()).forEach(item => catalogo.push({ ...item, tipo }));
    }
  }

  // Privados
  if (token) {
    const snap = await get(ref(db, "conteudos/" + token));
    if (snap.exists()) {
      const dados = snap.val();
      for (const tipo of ["filmes", "series", "tv"]) {
        if (dados[tipo]) {
          Object.values(dados[tipo]).forEach(item => catalogo.push({ ...item, tipo }));
        }
      }
    }
  }

  return catalogo;
}

function exibirCatalogoFiltrado(filtro) {
  const container = document.getElementById("catalogo") || document.createElement("div");
  container.id = "catalogo";
  container.innerHTML = "";

  const resultados = catalogoGlobal.filter(item => {
    const titulo = item.titulo?.toLowerCase() || "";
    const genero = item.genero?.toLowerCase() || "";
    const autor = item.autor?.toLowerCase() || "";
    return (
      titulo.includes(filtro) ||
      genero.includes(filtro) ||
      autor.includes(filtro)
    );
  });

  if (resultados.length === 0) {
    container.innerHTML = "<p style='text-align:center;'>⚠️ Nada encontrado.</p>";
    document.body.appendChild(container);
    return;
  }

  resultados.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";

    let html = "";

    if (item.capa) {
      html += `<img src="${item.capa}" alt="Capa do conteúdo">`;
    }

    html += `<h3>${item.titulo || "Sem título"}</h3>`;

    if (item.genero) {
      const generos = item.genero.split(",").map(g => g.trim()).filter(Boolean);
      if (generos.length) {
        html += `<p><strong>Gêneros:</strong><br>${generos.map(g => `• ${g}`).join("<br>")}</p>`;
      }
    }

    if (item.autor) {
      const autores = item.autor.split(",").map(a => a.trim()).filter(Boolean);
      if (autores.length) {
        html += `<p><strong>Autor:</strong><br>${autores.join(", ")}</p>`;
      }
    }

    if (item.link) {
      html += `<a href="${item.link}" target="_blank" rel="noopener noreferrer"><button>▶ Assistir</button></a>`;
    }

    card.innerHTML = html;
    container.appendChild(card);
  });

  document.body.appendChild(container);
}