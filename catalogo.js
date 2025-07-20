//filmes separados e cataloco
import { db } from "https://alexandre7888.github.io/Filmes-E-TV/firebaseConfig.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

window.token = window.token || "";
let catalogoGlobal = [];
let generosSelecionados = [];

document.addEventListener("DOMContentLoaded", async () => {
  aplicarCSS();
  criarBarraDeBusca();
  catalogoGlobal = await carregarCatalogoComDados();
  gerarBotoesDeGenero(catalogoGlobal);
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
    h1 {
      text-align: center;
      margin-bottom: 30px;
      color: #2c3e50;
    }
    .topo {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      justify-content: center;
      align-items: center;
      margin-bottom: 20px;
    }
    input[type="text"] {
      padding: 12px;
      width: 300px;
      font-size: 16px;
      border: 1px solid #ccc;
      border-radius: 8px;
    }
    .filtros {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .filtros button {
      padding: 8px 12px;
      border: none;
      border-radius: 6px;
      background-color: #ddd;
      cursor: pointer;
    }
    .filtros button.selecionado {
      background-color: #4CAF50;
      color: white;
    }
    .secao {
      margin-bottom: 40px;
    }
    .secao h2 {
      color: #2c3e50;
      margin-bottom: 20px;
    }
    .card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1);
      padding: 15px;
      margin-bottom: 20px;
    }
    .card:hover {
      transform: scale(1.01);
    }
    .card img {
      max-width: 100%;
      max-height: 300px;
      border-radius: 8px;
      margin-bottom: 10px;
    }
    .card h3 {
      margin-top: 0;
      color: #34495e;
    }
    .card p {
      margin: 5px 0;
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

function criarBarraDeBusca() {
  const h1 = document.createElement("h1");
  h1.textContent = "🎞️ Catálogo de Filmes, Séries e TV";
  document.body.appendChild(h1);

  const topo = document.createElement("div");
  topo.className = "topo";

  const campoTitulo = document.createElement("input");
  campoTitulo.type = "text";
  campoTitulo.placeholder = "🔍 Pesquisar por título";
  campoTitulo.addEventListener("input", () => {
    exibirCatalogoFiltrado(campoTitulo.value.toLowerCase());
  });

  const filtros = document.createElement("div");
  filtros.id = "filtros";
  filtros.className = "filtros";

  topo.appendChild(campoTitulo);
  topo.appendChild(filtros);
  document.body.appendChild(topo);

  const catalogo = document.createElement("div");
  catalogo.id = "catalogo";
  document.body.appendChild(catalogo);
}

async function carregarCatalogoComDados() {
  const token = window.token;
  const catalogo = [];

  for (const tipo of ["filmes", "series", "tv"]) {
    const snap = await get(ref(db, tipo));
    if (snap.exists()) {
      Object.values(snap.val()).forEach(item => catalogo.push({ ...item, tipo }));
    }
  }

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

function gerarBotoesDeGenero(catalogo) {
  const filtrosDiv = document.getElementById("filtros");
  const todosGeneros = new Set();

  catalogo.forEach(item => {
    if (item.genero) {
      item.genero.split(" ").map(g => g.trim()).forEach(g => todosGeneros.add(g));
    }
  });

  [...todosGeneros].sort().forEach(genero => {
    const botao = document.createElement("button");
    botao.textContent = genero;
    botao.addEventListener("click", () => {
      if (generosSelecionados.includes(genero)) {
        generosSelecionados = generosSelecionados.filter(g => g !== genero);
        botao.classList.remove("selecionado");
      } else {
        generosSelecionados.push(genero);
        botao.classList.add("selecionado");
      }
      const campo = document.querySelector("input[type='text']");
      exibirCatalogoFiltrado(campo.value.toLowerCase());
    });
    filtrosDiv.appendChild(botao);
  });
}

function exibirCatalogoFiltrado(filtroTitulo) {
  const container = document.getElementById("catalogo");
  container.innerHTML = "";

  const categorias = {
    filmes: { titulo: "🎬 Filmes", lista: [] },
    series: { titulo: "📺 Séries", lista: [] },
    tv: { titulo: "📡 TV", lista: [] },
  };

  catalogoGlobal.forEach(item => {
    const titulo = item.titulo?.toLowerCase() || "";
    const generosItem = item.genero ? item.genero.split(" ").map(g => g.toLowerCase()) : [];

    const correspondeTitulo = titulo.includes(filtroTitulo);
    const correspondeGenero =
      generosSelecionados.length === 0 ||
      generosSelecionados.every(g => generosItem.includes(g));

    if (correspondeTitulo && correspondeGenero && categorias[item.tipo]) {
      categorias[item.tipo].lista.push(item);
    }
  });

  Object.keys(categorias).forEach(tipo => {
    const { titulo, lista } = categorias[tipo];
    if (lista.length > 0) {
      const secao = document.createElement("div");
      secao.className = "secao";
      secao.innerHTML = `<h2>${titulo}</h2>`;

      lista.forEach(item => {
        const card = document.createElement("div");
        card.className = "card";

        let html = "";

        if (item.capa) {
          html += `<img src="${item.capa}" alt="Capa">`;
        }

        html += `<h3>${item.titulo || "Sem título"}</h3>`;

        if (item.genero) {
          const generos = item.genero.split(" ").filter(Boolean);
          html += `<p><strong>Gêneros:</strong><br>${generos.map(g => `• ${g}`).join("<br>")}</p>`;
        }

        if (item.autor) {
          const autores = item.autor.split(",").map(a => a.trim());
          html += `<p><strong>Autor:</strong><br>${autores.join(", ")}</p>`;
        }

        if (item.link) {
          html += `<a href="${item.link}" target="_blank"><button>▶ Assistir</button></a>`;
        }

        card.innerHTML = html;
        secao.appendChild(card);
      });

      container.appendChild(secao);
    }
  });

  if (container.innerHTML.trim() === "") {
    container.innerHTML = "<p style='text-align:center;'>⚠️ Nada encontrado.</p>";
  }
}