// catalogo.js
import { db } from './firebaseConfig.js';
import { ref, get } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// ✅ Lê o token direto da variável global no HTML
const token = window.token;

const conteudo = document.createElement("div");
conteudo.id = "conteudo";
document.body.innerHTML = "<h1>🎞️ Catálogo de Filmes, Séries e TV</h1>";
document.body.appendChild(conteudo);

if (!token) {
  conteudo.innerHTML = "<p style='color:red;'>❌ Token não informado no HTML.</p>";
} else {
  carregarPublico("filmes", "🎬 Filmes Públicos");
  carregarPublico("series", "📺 Séries Públicas");
  carregarPublico("tv", "📡 TV Públicas");
  carregarPrivado(token);
}

function carregarPublico(caminho, titulo) {
  const refCat = ref(db, caminho);
  get(refCat).then(snapshot => {
    if (snapshot.exists()) {
      const dados = snapshot.val();
      const secao = document.createElement("div");
      secao.innerHTML = `<h2>${titulo}</h2>`;
      for (let id in dados) {
        const item = dados[id];
        const card = criarCard(item);
        secao.appendChild(card);
      }
      conteudo.appendChild(secao);
    }
  });
}

function carregarPrivado(token) {
  const refToken = ref(db, "conteudos/" + token);
  get(refToken).then(snapshot => {
    if (snapshot.exists()) {
      const dados = snapshot.val();
      carregarPrivadoSecao(dados.filmes, "🔒 Filmes Privados");
      carregarPrivadoSecao(dados.series, "🔒 Séries Privadas");
      carregarPrivadoSecao(dados.tv, "🔒 TV Privadas");
    } else {
      const aviso = document.createElement("p");
      aviso.style.color = "red";
      aviso.innerText = "❌ Token inválido ou sem conteúdo privado.";
      conteudo.appendChild(aviso);
    }
  });
}

function carregarPrivadoSecao(lista, titulo) {
  if (!lista) return;
  const secao = document.createElement("div");
  secao.innerHTML = `<h2>${titulo}</h2>`;
  for (let id in lista) {
    const item = lista[id];
    const card = criarCard(item);
    secao.appendChild(card);
  }
  conteudo.appendChild(secao);
}

function criarCard(item) {
  const card = document.createElement("div");
  card.className = "card";
  card.style.border = "1px solid #ccc";
  card.style.padding = "10px";
  card.style.marginBottom = "10px";
  card.innerHTML = `
    <h3>${item.titulo}</h3>
    <a href="${item.link}" target="_blank" rel="noopener noreferrer">
      <button>▶ Assistir</button>
    </a>
  `;
  return card;
}