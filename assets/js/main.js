(function () {
  "use strict";

  var site = window.SITE || {};
  var root = document.body.getAttribute("data-root") || "";
  var consentKey = "equilibra-cookies";

  function $(selector, context) {
    return (context || document).querySelector(selector);
  }

  function $all(selector, context) {
    return Array.prototype.slice.call((context || document).querySelectorAll(selector));
  }

  function digits(value) {
    return String(value || "").replace(/\D/g, "");
  }

  function consent() {
    try {
      return localStorage.getItem(consentKey) || "";
    } catch (error) {
      return "";
    }
  }

  function setConsent(value) {
    try {
      localStorage.setItem(consentKey, value);
    } catch (error) {}
    var bar = $(".cookie-bar");
    if (bar) bar.remove();
    mountEmbeds();
  }

  var icones = {
    whatsapp: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12.04 2C6.58 2 2.15 6.4 2.15 11.83c0 1.74.46 3.44 1.34 4.94L2 22l5.39-1.41a10 10 0 0 0 4.65 1.18h.01c5.46 0 9.89-4.4 9.89-9.83C21.94 6.4 17.5 2 12.04 2zm5.76 13.87c-.24.68-1.4 1.3-1.94 1.38-.5.07-1.12.1-1.81-.11-.42-.13-.95-.3-1.64-.59-2.88-1.24-4.76-4.14-4.9-4.33-.14-.19-1.16-1.54-1.16-2.94s.73-2.08 1-2.37c.24-.27.64-.39 1.02-.39.12 0 .23 0 .33.01.3.01.45.03.65.5.24.58.82 2 .89 2.15.07.14.12.32.02.51-.09.19-.14.31-.28.48-.14.17-.29.37-.42.5-.14.13-.28.28-.12.54.16.26.71 1.16 1.52 1.88 1.05.93 1.93 1.22 2.2 1.36.27.14.43.12.59-.07.16-.19.68-.79.86-1.06.18-.27.36-.22.6-.13.24.09 1.54.73 1.8.86.27.13.44.2.51.31.06.11.06.64-.18 1.32z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="4.1" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor"/></svg>'
  };

  function disableLink(el) {
    el.removeAttribute("href");
    el.setAttribute("aria-disabled", "true");
    el.classList.add("is-disabled");
  }

  function ligarComIcone(el, tipo, rotulo, href) {
    var texto = document.createElement("span");
    texto.textContent = rotulo;
    el.classList.add("com-icone");
    el.classList.remove("is-disabled");
    el.removeAttribute("aria-disabled");
    el.href = href;
    el.target = "_blank";
    el.rel = "noopener noreferrer";
    el.innerHTML = icones[tipo];
    el.appendChild(texto);
  }

  function applyFills() {
    $all("[data-fill]").forEach(function (el) {
      var key = el.getAttribute("data-fill");

      if (key === "email") {
        if (site.email) {
          el.textContent = site.email;
          if (el.tagName === "A") el.href = "mailto:" + site.email;
        } else {
          el.textContent = "E-mail a indicar";
          if (el.tagName === "A") disableLink(el);
        }
      }

      if (key === "whatsapp") {
        var numero = digits(site.whatsapp);
        if (numero) {
          var destino = "https://wa.me/" + numero;
          if (site.whatsappTexto) destino += "?text=" + encodeURIComponent(site.whatsappTexto);
          var rotuloWa = el.getAttribute("data-rotulo") || site.whatsappRotulo || "WhatsApp";
          ligarComIcone(el, "whatsapp", rotuloWa, destino);
        } else {
          el.textContent = "WhatsApp a confirmar";
          disableLink(el);
        }
      }

      if (key === "endereco" || key === "morada") {
        el.textContent = site.endereco || site.morada || "Endereço completo a confirmar";
      }

      if (key === "instagram" || key === "tiktok" || key === "linkedin") {
        var href = site.redes && site.redes[key];
        if (href && key === "instagram") {
          ligarComIcone(el, "instagram", el.getAttribute("data-rotulo") || (site.redes && site.redes.instagramRotulo) || "@milenakardecpsi", href);
        } else if (href) {
          el.href = href;
          el.target = "_blank";
          el.rel = "noopener noreferrer";
        } else {
          disableLink(el);
        }
      }
    });
  }

  function emptyPanel(title, text) {
    var wrap = document.createElement("div");
    wrap.className = "painel-vazio";
    var heading = document.createElement("h3");
    heading.textContent = title;
    var paragraph = document.createElement("p");
    paragraph.textContent = text;
    wrap.appendChild(heading);
    wrap.appendChild(paragraph);
    return wrap;
  }

  function frame(src, title) {
    var iframe = document.createElement("iframe");
    iframe.src = src;
    iframe.title = title;
    iframe.loading = "lazy";
    iframe.referrerPolicy = "no-referrer";
    return iframe;
  }

  function mountEmbeds() {
    var agenda = $("[data-fill='calendar']");
    if (agenda) {
      agenda.textContent = "";
      if (site.calendarEmbed && consent() === "all") {
        agenda.appendChild(frame(site.calendarEmbed, "Agenda da clínica"));
      } else if (site.calendarEmbed) {
        agenda.appendChild(emptyPanel(
          "Agenda protegida",
          "O calendário é um conteúdo do Google. Aceite os cookies opcionais para vê-lo aqui, ou solicite o horário pelo formulário."
        ));
      } else {
        agenda.appendChild(emptyPanel(
          "Horários sob aprovação",
          "O pedido consulta a agenda e entra como convite, sem expor nomes de pacientes. A sessão só fica marcada depois que a psicóloga aceitar o horário."
        ));
      }
    }

    var mapa = $("[data-fill='mapa']");
    if (mapa) {
      mapa.textContent = "";
      if (site.mapaEmbed && consent() === "all") {
        mapa.appendChild(frame(site.mapaEmbed, "Mapa do consultório"));
      } else if (site.mapaEmbed) {
        mapa.appendChild(emptyPanel(
          "Mapa protegido",
          "O mapa é um conteúdo do Google. Aceite os cookies opcionais para vê-lo, ou use o endereço em texto."
        ));
      } else {
        mapa.appendChild(emptyPanel(
          "Mapa em preparação",
          "O mapa entra aqui quando o endereço completo da clínica, em Luziânia-GO, estiver confirmado."
        ));
      }
    }
  }

  function mountMenu() {
    var button = $(".nav-toggle");
    var nav = $(".nav-principal");
    if (!button || !nav) return;
    button.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        nav.classList.remove("is-open");
        button.setAttribute("aria-expanded", "false");
      }
    });
  }

  function mountFaq() {
    $all(".faq-item").forEach(function (item) {
      var button = item.querySelector("button");
      var panel = item.querySelector(".faq-painel");
      if (!button || !panel) return;
      button.addEventListener("click", function () {
        var open = item.classList.toggle("is-open");
        button.setAttribute("aria-expanded", open ? "true" : "false");
        panel.hidden = !open;
      });
    });
  }

  function mountCookies() {
    if (consent()) return;
    var bar = document.createElement("div");
    bar.className = "cookie-bar";
    bar.setAttribute("role", "dialog");
    bar.setAttribute("aria-label", "Cookies");
    bar.innerHTML =
      "<p>Sua privacidade é importante. Usamos apenas o necessário para o site funcionar. Mapa e agenda do Google só carregam se você autorizar.</p>" +
      "<div class=\"cookie-acoes\">" +
      "<a href=\"" + root + "legal/cookies.html\">Política de cookies</a>" +
      "<button type=\"button\" data-consent=\"essential\">Somente essenciais</button>" +
      "<button type=\"button\" class=\"botao botao-primario\" data-consent=\"all\">Aceitar todos</button>" +
      "</div>";
    var header = $(".site-header");
    if (header) header.insertAdjacentElement("afterend", bar);
    else document.body.appendChild(bar);
    bar.addEventListener("click", function (event) {
      var target = event.target.closest("[data-consent]");
      if (!target) return;
      setConsent(target.getAttribute("data-consent"));
    });
  }

  function valueOf(form, name) {
    var field = form.elements[name];
    return field ? String(field.value || "").trim() : "";
  }

  function carimbo(valor, minutosExtra) {
    var partes = String(valor || "").split("T");
    if (partes.length < 2) return "";
    var data = partes[0].split("-").map(Number);
    var hora = partes[1].split(":").map(Number);
    var base = Date.UTC(data[0], data[1] - 1, data[2], hora[0], hora[1] + (minutosExtra || 0));
    var dt = new Date(base);
    function dois(n) { return String(n).padStart(2, "0"); }
    return dt.getUTCFullYear() + dois(dt.getUTCMonth() + 1) + dois(dt.getUTCDate()) +
      "T" + dois(dt.getUTCHours()) + dois(dt.getUTCMinutes()) + "00";
  }

  function mensagensAgenda(form) {
    var nome = valueOf(form, "nome");
    var inicio = valueOf(form, "horario");
    var duracao = Number(site.duracaoMinutos) || 60;
    var quando = fimLegivel(inicio, 0);
    var fim = fimLegivel(inicio, duracao);
    var modalidade = valueOf(form, "modalidade");
    var recebido = [
      "Olá, " + nome + ".",
      "",
      "Recebemos seu pedido de agendamento na Equilibradamente Clínica de Psicologia.",
      "Horário solicitado: " + quando + " até " + fim + ".",
      "Modalidade: " + modalidade + ".",
      "",
      "Vamos analisar o pedido e responder com a confirmação do horário. A sessão só fica marcada depois desse aceite.",
      "O horário está no convite da agenda enviado junto com este e-mail."
    ].join("\n");
    var confirmado = [
      "Olá, " + nome + ".",
      "",
      "Seu horário está confirmado.",
      "Sessão: " + quando + " até " + fim + ".",
      "Modalidade: " + modalidade + ".",
      "",
      "O compromisso está confirmado neste convite da agenda.",
      "",
      "Milena Silva Kardec",
      "Equilibradamente Clínica de Psicologia"
    ].join("\n");
    return { recebido: recebido, confirmado: confirmado };
  }

  function urlConvite(form, confirmado) {
    var inicio = valueOf(form, "horario");
    var duracao = Number(site.duracaoMinutos) || 60;
    var nome = valueOf(form, "nome");
    var base = [
      confirmado ? "Horário confirmado." : "Pedido pendente de aprovação. A sessão só fica marcada quando este horário for aceito.",
      "A agenda pública não mostra o nome da paciente.",
      "",
      "Nome: " + nome,
      "E-mail: " + valueOf(form, "email"),
      "Telefone: " + valueOf(form, "telefone"),
      "Para quem: " + (valueOf(form, "paraquem") || "—"),
      "Modalidade: " + valueOf(form, "modalidade"),
      "Duração: " + duracao + " minutos",
      "Término: " + fimLegivel(inicio, duracao)
    ];
    var params = new URLSearchParams({
      action: "TEMPLATE",
      text: (confirmado ? "Confirmado · " : "A aprovar · ") + nome,
      dates: carimbo(inicio, 0) + "/" + carimbo(inicio, duracao),
      ctz: "America/Sao_Paulo",
      details: base.join("\n"),
      location: valueOf(form, "modalidade"),
      add: convidadosDoPedido(form)
    });
    var textos = mensagensAgenda(form);
    params.set("details", confirmado
      ? base.concat(["", textos.confirmado]).join("\n")
      : base.concat([
        "",
        "E-mail ao contato, pedido em análise:",
        textos.recebido,
        "",
        "E-mail após o aceite e a confirmação:",
        textos.confirmado
      ]).join("\n"));
    return "https://calendar.google.com/calendar/render?" + params.toString();
  }

  function convidadosDoPedido(form) {
    var lista = [];
    [site.email, valueOf(form, "email")].forEach(function (email) {
      var limpo = String(email || "").trim();
      if (!limpo) return;
      if (lista.some(function (item) { return item.toLowerCase() === limpo.toLowerCase(); })) return;
      lista.push(limpo);
    });
    return lista.join(",");
  }

  function linkConfirmacao(form) {
    var inicio = valueOf(form, "horario");
    var duracao = Number(site.duracaoMinutos) || 60;
    var q = new URLSearchParams({
      confirmar: "1",
      nome: valueOf(form, "nome"),
      email: valueOf(form, "email"),
      telefone: valueOf(form, "telefone"),
      modalidade: valueOf(form, "modalidade"),
      inicio: inicio,
      quando: fimLegivel(inicio, 0),
      fim: fimLegivel(inicio, duracao)
    });
    return new URL("agendar.html?" + q.toString(), window.location.href).href;
  }

  function enviarEmail(campos) {
    var controle = typeof AbortController === "function" ? new AbortController() : null;
    var limite = setTimeout(function () {
      if (controle) controle.abort();
    }, 20000);
    return fetch("https://formsubmit.co/ajax/" + encodeURIComponent(site.email), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(campos),
      signal: controle ? controle.signal : undefined
    }).then(function (resposta) {
      return resposta.json().then(function (dados) {
        var mensagem = (dados && dados.message) || "";
        var ativacao = /activat/i.test(mensagem);
        if ((!resposta.ok || String(dados.success) === "false") && !ativacao) {
          throw new Error(mensagem || "Não foi possível enviar o e-mail.");
        }
        return dados || {};
      });
    }).then(function (dados) {
      clearTimeout(limite);
      return dados;
    }, function (erro) {
      clearTimeout(limite);
      throw erro;
    });
  }

  function abrirAgenda(url) {
    var janela = window.open(url, "_blank");
    if (janela) janela.opener = null;
    return janela;
  }

  function fimLegivel(valor, minutos) {
    var partes = String(valor || "").split("T");
    if (partes.length < 2) return "";
    var data = partes[0].split("-").map(Number);
    var hora = partes[1].split(":").map(Number);
    var base = new Date(Date.UTC(data[0], data[1] - 1, data[2], hora[0], (hora[1] || 0) + minutos));
    function dois(n) { return String(n).padStart(2, "0"); }
    return dois(base.getUTCDate()) + "/" + dois(base.getUTCMonth() + 1) + "/" + base.getUTCFullYear() +
      " às " + dois(base.getUTCHours()) + ":" + dois(base.getUTCMinutes());
  }

  function mountForm() {
    var form = $("#triagem");
    if (!form) return;
    var note = form.querySelector(".form-nota");
    var avisoFim = document.getElementById("fim-sessao");
    var campoHora = form.elements.horario;
    var duracao = Number(site.duracaoMinutos) || 60;

    function atualizarFim() {
      if (!avisoFim) return;
      if (!campoHora || !campoHora.value) {
        avisoFim.textContent = "Duração padrão de " + duracao + " minutos. Basta indicar o horário inicial.";
        return;
      }
      avisoFim.textContent = "Horário final: " + fimLegivel(campoHora.value, duracao) + " (" + duracao + " minutos).";
    }

    if (campoHora) campoHora.addEventListener("input", atualizarFim);
    atualizarFim();

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      if (!site.email) {
        if (note) {
          note.hidden = false;
          note.textContent = "O pedido está preenchido, mas o e-mail da agenda ainda não foi indicado. Até lá, o convite não é criado.";
        }
        return;
      }
      var botao = form.querySelector("[type='submit']");
      var textos = mensagensAgenda(form);
      var url = urlConvite(form);
      var confirmar = linkConfirmacao(form);
      var popup = mostrarPedido(form, textos);
      if (note) escreverRecado(note, textos, confirmar);
      if (botao) {
        botao.disabled = true;
        botao.textContent = "Enviando…";
      }
      enviarEmail({
        _subject: "Pedido de agendamento em análise — " + valueOf(form, "nome"),
        _replyto: valueOf(form, "email"),
        _cc: valueOf(form, "email"),
        _template: "box",
        _captcha: "false",
        email: valueOf(form, "email"),
        nome: valueOf(form, "nome"),
        telefone: valueOf(form, "telefone"),
        modalidade: valueOf(form, "modalidade"),
        horario: fimLegivel(valueOf(form, "horario"), 0) + " até " + fimLegivel(valueOf(form, "horario"), duracao),
        mensagem_ao_contato: textos.recebido,
        mensagem_apos_aceite: textos.confirmado,
        aceitar_e_avisar: confirmar,
        convite_da_agenda: url
      }).then(function (dados) {
        popup.atualizar(dados && dados.message);
      }).catch(function (erro) {
        popup.atualizar((erro && erro.message) || "", true);
      }).then(function () {
        if (botao) {
          botao.disabled = false;
          botao.textContent = "Solicitar agendamento";
        }
      });
    });
  }

  function mountConfirmacao() {
    var params = new URLSearchParams(window.location.search);
    if (params.get("confirmar") !== "1") return;
    var caixa = document.getElementById("confirmar-horario");
    var resumo = document.getElementById("confirmar-resumo");
    var botao = document.getElementById("confirmar-envio");
    var nota = document.getElementById("confirmar-nota");
    if (!caixa || !botao) return;
    var nome = params.get("nome") || "";
    var email = params.get("email") || "";
    var quando = params.get("quando") || "";
    var fim = params.get("fim") || "";
      var modalidade = params.get("modalidade") || "";
      var inicio = params.get("inicio") || "";
      caixa.hidden = false;
    if (resumo) {
      resumo.textContent = nome + " · " + email + " · " + quando + " até " + fim + " · " + modalidade;
    }
    caixa.scrollIntoView({ block: "start" });
    botao.addEventListener("click", function () {
      botao.disabled = true;
      var texto = [
        "Olá, " + nome + ".",
        "",
        "Seu horário está confirmado.",
        "Sessão: " + quando + " até " + fim + ".",
        "Modalidade: " + modalidade + ".",
        "",
        "O compromisso foi aceito na agenda da Equilibradamente.",
        "",
        "Milena Silva Kardec",
        "Equilibradamente Clínica de Psicologia"
      ].join("\n");
      if (inicio) {
        abrirAgenda(urlConvite({
          elements: {
            nome: { value: nome },
            email: { value: email },
            telefone: { value: params.get("telefone") || "" },
            modalidade: { value: modalidade },
            horario: { value: inicio },
            paraquem: { value: "" }
          }
        }, true));
      }
      enviarEmail({
        _subject: "Horário confirmado — " + nome,
        _replyto: site.email,
        _cc: email,
        _template: "box",
        _captcha: "false",
        email: email,
        nome: nome,
        mensagem: texto
      }).then(function () {
        if (nota) {
          nota.hidden = false;
          nota.textContent = "E-mail de confirmação enviado para " + email + " e para " + site.email + ". Na agenda, salve o evento Confirmado e apague o bloco A aprovar deste mesmo horário.";
        }
      }).catch(function () {
        botao.disabled = false;
        if (nota) {
          nota.hidden = false;
          nota.textContent = "A agenda abriu, mas o e-mail de confirmação não saiu. Tente novamente em instantes.";
        }
      });
    });
  }

  function escreverRecado(note, textos, url) {
    note.hidden = false;
    note.textContent = "";
    var sucesso = document.createElement("p");
    sucesso.textContent = "Iremos analisar seu pedido de agendamento e você receberá uma mensagem de confirmação com o seu horário.";
    var tituloEmail = document.createElement("p");
    tituloEmail.textContent = "Mensagem ao contato";
    var email = document.createElement("p");
    email.className = "pedido-email";
    email.textContent = textos.recebido;
    var tituloAceite = document.createElement("p");
    tituloAceite.textContent = "Mensagem após o aceite";
    var aceite = document.createElement("p");
    aceite.className = "pedido-email";
    aceite.textContent = textos.confirmado;
    var link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Confirmar horário na agenda";
    note.appendChild(sucesso);
    note.appendChild(tituloEmail);
    note.appendChild(email);
    note.appendChild(tituloAceite);
    note.appendChild(aceite);
    note.appendChild(link);
  }

  function mostrarPedido(form, textos) {
    var aberto = document.querySelector(".pedido-popup");
    if (aberto) aberto.remove();
    var fundo = document.createElement("div");
    fundo.className = "pedido-popup";
    fundo.setAttribute("role", "dialog");
    fundo.setAttribute("aria-modal", "true");
    fundo.setAttribute("aria-labelledby", "pedido-titulo");
    var caixa = document.createElement("div");
    caixa.className = "pedido-caixa";
    var titulo = document.createElement("h2");
    titulo.id = "pedido-titulo";
    titulo.textContent = "Pedido enviado";
    var texto = document.createElement("p");
    texto.textContent = "Iremos analisar seu pedido de agendamento e você receberá uma mensagem de confirmação com o seu horário.";
    var estado = document.createElement("p");
    estado.className = "meta";
    estado.textContent = "Enviando a mensagem para o contato e para a clínica…";
    var tituloEmail = document.createElement("p");
    tituloEmail.textContent = "Mensagem ao contato";
    var email = document.createElement("p");
    email.className = "pedido-email";
    email.textContent = textos.recebido;
    var acoes = document.createElement("div");
    acoes.className = "acoes";
    var agenda = document.createElement("button");
    agenda.type = "button";
    agenda.className = "botao botao-primario";
    agenda.textContent = "Confirmar horário";
    var fechar = document.createElement("button");
    fechar.type = "button";
    fechar.className = "botao";
    fechar.textContent = "Fechar";
    agenda.addEventListener("click", function () {
      var contato = valueOf(form, "email");
      var nome = valueOf(form, "nome");
      var quando = fimLegivel(valueOf(form, "horario"), 0);
      var fim = fimLegivel(valueOf(form, "horario"), Number(site.duracaoMinutos) || 60);
      var destino = urlConvite(form, true);
      var janela = abrirAgenda(destino);
      agenda.disabled = true;
      texto.textContent = "Horário confirmado para " + quando + " até " + fim + ". Na agenda, salve o evento Confirmado · " + nome + " e apague o bloco A aprovar deste mesmo horário.";
      estado.textContent = janela
        ? "A agenda abriu numa nova aba. Enviando o e-mail de confirmação para " + contato + "…"
        : "O navegador bloqueou a nova aba. Use o link abaixo e salve o evento Confirmado.";
      if (!janela && !acoes.querySelector("a")) {
        var link = document.createElement("a");
        link.className = "botao botao-primario";
        link.href = destino;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "Abrir horário confirmado";
        acoes.insertBefore(link, agenda);
      }
      caixa.scrollTop = 0;
      enviarEmail({
        _subject: "Horário confirmado — " + nome,
        _replyto: site.email,
        _cc: contato,
        _template: "box",
        _captcha: "false",
        email: contato,
        nome: nome,
        mensagem: textos.confirmado
      }).then(function () {
        estado.textContent = "E-mail de confirmação enviado para " + contato + " e para a clínica.";
      }).catch(function () {
        agenda.disabled = false;
        estado.textContent = "A agenda foi aberta, mas o e-mail de confirmação não saiu. Pode clicar em Confirmar horário outra vez.";
      });
    });
    acoes.appendChild(agenda);
    acoes.appendChild(fechar);
    caixa.appendChild(titulo);
    caixa.appendChild(texto);
    caixa.appendChild(estado);
    caixa.appendChild(tituloEmail);
    caixa.appendChild(email);
    caixa.appendChild(acoes);
    fundo.appendChild(caixa);
    document.body.appendChild(fundo);
    fechar.focus({ preventScroll: true });
    caixa.scrollTop = 0;
    function fecharPopup() {
      if (fundo.parentNode) fundo.remove();
    }
    fechar.addEventListener("click", fecharPopup);
    fundo.addEventListener("click", function (event) {
      if (event.target === fundo) fecharPopup();
    });
    document.addEventListener("keydown", function esc(event) {
      if (event.key !== "Escape") return;
      fecharPopup();
      document.removeEventListener("keydown", esc);
    });
    return {
      atualizar: function (aviso, falhou) {
        if (!estado.isConnected) return;
        if (falhou) {
          estado.textContent = "O pedido ficou registrado nesta página, mas o e-mail não saiu. " + (aviso || "Tente novamente em instantes.");
          return;
        }
        if (aviso && /activat|confirm your form|needs activation/i.test(aviso)) {
          estado.textContent = "O primeiro envio precisa de uma confirmação. Abra a caixa milena.kardec@gmail.com, ative o formulário e envie o pedido outra vez.";
          return;
        }
        estado.textContent = "A mensagem foi enviada para o e-mail do contato e para a clínica. A confirmação do horário sai depois do aceite.";
      }
    };
  }

  var year = $(".ano");
  if (year) year.textContent = String(new Date().getFullYear());

  applyFills();
  mountMenu();
  mountFaq();
  mountCookies();
  mountEmbeds();
  mountForm();
  mountConfirmacao();
})();
