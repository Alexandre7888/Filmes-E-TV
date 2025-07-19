import { db } from "https://alexandre7888.github.io/Filmes-E-TV/firebaseConfig.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const token = window.token;

export async function carregarCatalogo() {
  const catalogo = { filmes: [], series: [], tv: [] };

  // 🔓 Públicos
  await Promise.all([
    carregarCategoriaPublica("filmes", catalogo.filmes),
    carregarCategoriaPublica("series", catalogo.series),
    carregarCategoriaPublica("tv", catalogo.tv)
  ]);

  // 🔒 Privados
  if (token) {
    const privRef = ref(db, "conteudos/" + token);
    const snap = await get(privRef);
    if (snap.exists()) {
      const dadosPrivados = snap.val();
      if (dadosPrivados.filmes) catalogo.filmes.push(...Object.values(dadosPrivados.filmes));
      if (dadosPrivados.series) catalogo.series.push(...Object.values(dadosPrivados.series));
      if (dadosPrivados.tv) catalogo.tv.push(...Object.values(dadosPrivados.tv));
    }
  }

  exibirCatalogo(catalogo);
  return catalogo;
}

async function carregarCategoriaPublica(caminho, destino) {
  const refCat = ref(db, caminho);
  const snap = await get(refCat);
  if (snap.exists()) {
    destino.push(...Object.values(snap.val()));
  }
}

function exibirCatalogo(catalogo) {
  const conteudo = document.body;
  conteudo.innerHTML = "<h1>🎞️ Catálogo</h1>";

  for (const tipo in catalogo) {
    if (catalogo[tipo].length === 0) continue;

    const secao = document.createElement("div");
    secao.innerHTML = `<h2>${tipo.toUpperCase()}</h2>`;

    for (const item of catalogo[tipo]) {
      const card = document.createElement("div");
      card.style.border = "1px solid #ccc";
      card.style.padding = "10px";
      card.style.margin = "10px 0";
      card.innerHTML = `
        <h3>${item.titulo}</h3>
        <a href="${item.link}" target="_blank">
          <button>▶ Assistir</button>
        </a>
      `;
      secao.appendChild(card);
    }

    conteudo.appendChild(secao);
  }
}