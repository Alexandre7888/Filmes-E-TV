//filmes separados e cataloco
import { db } from "https://alexandre7888.github.io/Filmes-E-TV/firebaseConfig.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

window.token = window.token || ""; // Defina no HTML se quiser

let catalogoGlobal = [];

document.addEventListener("DOMContentLoaded", async () => {
  criarCamposDeBusca();
  const catalogo = await carregarCatalogoComDados();
  catalogoGlobal = catalogo;
  exibirCatalogoFiltrado("");
});

function criarCamposDeBusca() {
  const busca = document.createElement("input");
  busca.placeholder = "🔍 Pesquisar por título";
  busca.style.margin = "10px";
  busca.style.padding = "8px";
  busca.style.width = "95%";
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
    container.innerHTML = "<p>Nada encontrado.</p>";
    document.body.appendChild(container);
    return;
  }

  resultados.forEach(item => {
    const card = document.createElement("div");
    card.style.border = "1px solid #ccc";
    card.style.padding = "10px";
    card.style.margin = "10px 0";
    card.style.background = "#f9f9f9";

    let html = `<h3>${item.titulo || "Sem título"}</h3>`;

    if (item.capa) {
      html += `<img src="${item.capa}" style="max-width:200px; display:block; margin-bottom:8px;">`;
    }

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
      html += `<a href="${item.link}" target="_blank"><button>▶ Assistir</button></a>`;
    }

    card.innerHTML = html;
    container.appendChild(card);
  });

  document.body.appendChild(container);
}