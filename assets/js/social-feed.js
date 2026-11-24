(function () {
  "use strict";

  var root = document.querySelector("[data-social-feed]");
  if (!root) return;

  var site = window.SITE || {};
  var manuais = Array.isArray(site.publicacoes) ? site.publicacoes : [];
  var catalogo = catalogoDeAssuntos(site.assuntos);

  function semAcento(texto) {
    return String(texto || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function catalogoDeAssuntos(extras) {
    var base = [
      { tema: "Autocrítica", termos: ["autocritica"] },
      { tema: "Sobrecarga", termos: ["sobrecarga"] },
      { tema: "Emoções", termos: ["emocoes"] },
      { tema: "Ansiedade", termos: ["ansiedade", "panico", "fobia"] },
      { tema: "Humor", termos: ["depress", "bipolar", "desanimo"] },
      { tema: "Traumas", termos: ["trauma", "luto", "recome"] },
      { tema: "Autoconhecimento", termos: ["autoconhecimento", "autoestima"] },
      { tema: "Infância e adolescência", termos: ["infantil", "adolescente", "crianca"] },
      { tema: "Limites", termos: ["dizer nao", "limites"] }
    ];
    var lista = base.slice();
    (extras || []).forEach(function (assunto) {
      if (!assunto || !assunto.tema) return;
      var chave = semAcento(assunto.tema);
      var existente = lista.filter(function (item) {
        return semAcento(item.tema) === chave;
      })[0];
      if (existente) {
        existente.termos = (existente.termos || []).concat(assunto.termos || []);
        return;
      }
      lista.push({ tema: assunto.tema, termos: assunto.termos || [] });
    });
    return lista;
  }

  function textoDoPost(post) {
    return [post.plataforma, post.titulo, post.legenda, post.caption].join(" ");
  }

  function primeiraHashtag(texto) {
    var match = String(texto || "").match(/#([A-Za-zÀ-ÿ0-9_]+)/);
    return match ? match[1].replace(/_/g, " ") : "";
  }

  function assuntoConhecido(nome) {
    var chave = semAcento(nome);
    var achado = catalogo.filter(function (assunto) {
      if (semAcento(assunto.tema) === chave) return true;
      return (assunto.termos || []).some(function (termo) {
        return semAcento(termo) === chave;
      });
    })[0];
    return achado ? achado.tema : "";
  }

  function validarAssunto(post) {
    var base = semAcento(textoDoPost(post));
    var conhecido = catalogo.filter(function (assunto) {
      var termos = [assunto.tema].concat(assunto.termos || []);
      return termos.some(function (termo) {
        return termo && base.indexOf(semAcento(termo)) !== -1;
      });
    })[0];
    if (conhecido) return conhecido.tema;

    var tag = primeiraHashtag(textoDoPost(post));
    if (tag) return assuntoConhecido(tag) || rotuloNovo(tag);
    if (post.plataforma) return post.plataforma;
    return "Publicação recente";
  }

  function rotuloNovo(nome) {
    var limpo = String(nome || "").trim();
    if (!limpo) return "Publicação recente";
    return limpo.charAt(0).toUpperCase() + limpo.slice(1);
  }

  function instanteDe(post) {
    if (!post || !post.instante) return 0;
    return post.instante;
  }

  function adaptar(item) {
    if (!item) return null;
    var legenda = item.caption || item.legenda || "";
    var linha = item.titulo;
    if (!linha) {
      linha = String(legenda).split("\n").map(function (parte) {
        return parte.trim();
      }).filter(Boolean)[0] || "";
    }
    var instante = 0;
    var quando = item.data || "";
    if (item.timestamp) {
      var data = new Date(item.timestamp);
      if (!isNaN(data.getTime())) {
        instante = data.getTime();
        quando = data.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
      }
    }
    return {
      plataforma: item.plataforma || "",
      titulo: linha,
      legenda: legenda,
      caption: item.caption || "",
      url: item.permalink || item.url || "",
      data: quando,
      instante: instante
    };
  }

  function ultimasPorAssunto(lista) {
    var ordenada = lista.map(function (post, indice) {
      return { post: post, indice: indice };
    }).sort(function (a, b) {
      var diferenca = instanteDe(b.post) - instanteDe(a.post);
      if (diferenca) return diferenca;
      return a.indice - b.indice;
    });
    var vistos = {};
    var saida = [];

    ordenada.forEach(function (item) {
      var tema = validarAssunto(item.post);
      var chave = semAcento(tema);
      if (vistos[chave]) return;
      vistos[chave] = true;
      if (!assuntoConhecido(tema)) {
        catalogo.push({ tema: tema, termos: [semAcento(tema)] });
      }
      saida.push({
        plataforma: tema,
        titulo: item.post.titulo,
        url: item.post.url,
        data: item.post.data,
        instante: item.post.instante
      });
    });

    saida.sort(function (a, b) {
      return instanteDe(b) - instanteDe(a);
    });
    return saida;
  }

  function pintar(posts) {
    root.textContent = "";
    if (!posts.length) {
      var vazio = document.createElement("div");
      vazio.className = "painel-vazio";
      var titulo = document.createElement("h3");
      titulo.textContent = "Notas em breve";
      var texto = document.createElement("p");
      texto.textContent = "As reflexões da clínica aparecem aqui quando os links das publicações estiverem ligados.";
      vazio.appendChild(titulo);
      vazio.appendChild(texto);
      root.appendChild(vazio);
      return;
    }

    posts.forEach(function (post) {
      var card = document.createElement("article");
      card.className = "feed-card";

      var origem = document.createElement("p");
      origem.className = "eyebrow";
      origem.textContent = post.plataforma || "Nota";

      var titulo = document.createElement("h3");
      titulo.textContent = post.titulo || "Publicação";

      card.appendChild(origem);
      card.appendChild(titulo);

      if (post.data) {
        var data = document.createElement("p");
        data.className = "meta";
        data.textContent = post.data;
        card.appendChild(data);
      }

      if (post.url) {
        var link = document.createElement("a");
        link.href = post.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "Ver no Instagram";
        card.appendChild(link);
      }

      root.appendChild(card);
    });
  }

  function mostrar(lista) {
    pintar(ultimasPorAssunto(lista.map(adaptar).filter(Boolean)));
  }

  if (!site.feedUrl) {
    mostrar(manuais);
    return;
  }

  fetch(site.feedUrl)
    .then(function (resposta) {
      if (!resposta.ok) throw new Error("feed");
      return resposta.json();
    })
    .then(function (json) {
      var remotas = Array.isArray(json) ? json : (json && json.data) || [];
      mostrar(remotas.concat(manuais));
    })
    .catch(function () {
      mostrar(manuais);
    });
})();
