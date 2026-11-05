
// CONFIGURAÇÃO DO BACK4APP
Parse.initialize(
    "Pl8aeawvqCaeEv4CnjTDCOkW2skXuvCNY7sZP1g2",
    "7knS3oU7tsQI3OOZmSIbkDL5Yv6mfRSyaGehKz6T"
);

Parse.serverURL = "https://parseapi.back4app.com";

async function carregarCategorias() {
    const select = document.getElementById("categoria");

    try {
        const consulta = new Parse.Query("Categoria");
        consulta.ascending("nome");

        const categorias = await consulta.find();

        select.innerHTML = '<option value="">Selecione</option>';

        categorias.forEach(categoria => {
            const opcao = document.createElement("option");
            opcao.value = categoria.id;
            opcao.textContent = categoria.get("nome");
            select.appendChild(opcao);
        });

    } catch (erro) {
        console.error("Erro ao carregar categorias:", erro);
        select.innerHTML = '<option value="">Erro ao carregar</option>';
    }
}

async function carregarFormasPagamento() {
    const select = document.getElementById("formaPagamento");

    try {
        const consulta = new Parse.Query("FormaPagamento");
        consulta.ascending("nome");

        const formas = await consulta.find();

        select.innerHTML = '<option value="">Selecione</option>';

        formas.forEach(forma => {
            const opcao = document.createElement("option");
            opcao.value = forma.id;
            opcao.textContent = forma.get("nome");
            select.appendChild(opcao);
        });

    } catch (erro) {
        console.error("Erro ao carregar formas de pagamento:", erro);
        select.innerHTML = '<option value="">Erro ao carregar</option>';
    }
}


// ELEMENTOS
const telaLogin = document.getElementById("telaLogin");
const formLogin = document.getElementById("formLogin");
const mensagemLogin = document.getElementById("mensagemLogin");

// VERIFICAR SE JÁ EXISTE UMA SESSÃO
async function verificarLogin() {
    try {
        const usuario = Parse.User.current();

        if (usuario && usuario.getSessionToken()) {
            await usuario.fetch();

            document.body.classList.add("logado");
            await carregarDadosIniciais();

        } else {
            document.body.classList.remove("logado");
        }

    } catch (erro) {
        console.error("Erro ao verificar login:", erro);

        await Parse.User.logOut();
        document.body.classList.remove("logado");
    }
}

// REALIZAR LOGIN
formLogin.addEventListener("submit", async function (event) {
    event.preventDefault();

    const usuario = document.getElementById("usuarioLogin").value.trim();
    const senha = document.getElementById("senhaLogin").value;

    mensagemLogin.textContent = "Verificando acesso...";

    try {
        await Parse.User.logIn(usuario, senha);

        mensagemLogin.textContent = "";
        document.body.classList.add("logado");

        formLogin.reset();

        await carregarDadosIniciais();

    } catch (erro) {
        mensagemLogin.textContent =
            "Usuário ou senha incorretos. Tente novamente.";
        console.error("Erro no login:", erro);
    }
});

// SAIR DA CONTA
async function sairDaConta() {
    try {
        await Parse.User.logOut();
        document.body.classList.remove("logado");
        voltarInicio();
    } catch (erro) {
        console.error("Erro ao sair:", erro);
    }
}

// NAVEGAÇÃO ENTRE AS TELAS
window.navegarPara = function (paginaSelecionada) {
    document.querySelectorAll(".page").forEach(pagina => {
        pagina.classList.remove("active");
    });

    const pagina = document.getElementById(paginaSelecionada);
    if (pagina) {
        pagina.classList.add("active");
    }

    if (paginaSelecionada === "pendentes") {
        carregarPendentes();
    }

    if (paginaSelecionada === "relatorios") {
        carregarRelatorio();
    }

    if (paginaSelecionada === "inicio") {
        carregarInicio();
    }
};

// VOLTAR AO INÍCIO
function voltarInicio() {
    window.navegarPara("inicio");

    if (window.atualizarNavegacaoVue) {
        window.atualizarNavegacaoVue("inicio");
    }
}


// PREENCHER DATA AUTOMATICAMENTE
document.getElementById("dataEntrada").value =
    new Date().toISOString().split("T")[0];


// FORMULÁRIO DE ENTRADA
document.getElementById("formEntrada").addEventListener("submit", async function (event) {
    event.preventDefault();

    const botaoSalvar = this.querySelector(".btn-salvar");
    const estaEditando = movimentacaoEditando !== null;

    botaoSalvar.disabled = true;
    botaoSalvar.textContent = "Salvando...";

    try {
        const descricao = document.getElementById("descricao").value.trim();
        const cliente = document.getElementById("cliente").value.trim();
        const valor = Number(document.getElementById("valor").value);
        const data = document.getElementById("dataEntrada").value;
        const categoriaId = document.getElementById("categoria").value;
        const formaPagamentoId = document.getElementById("formaPagamento").value;
        const quantidadeParcelas = Number(document.getElementById("parcelas").value);
        const observacao = document.getElementById("observacao").value.trim();

        if (!categoriaId || !formaPagamentoId) {
            throw new Error("Selecione a categoria e a forma de pagamento.");
        }

        if (!Number.isFinite(valor) || valor <= 0) {
            throw new Error("Informe um valor válido.");
        }

        if (!Number.isInteger(quantidadeParcelas) || quantidadeParcelas < 1) {
            throw new Error("Informe uma quantidade válida de parcelas.");
        }

        const dataMovimentacao = dataDoInput(data);

        const categoriaQuery = new Parse.Query("Categoria");
        const categoria = await categoriaQuery.get(categoriaId);

        const formaQuery = new Parse.Query("FormaPagamento");
        const forma = await formaQuery.get(formaPagamentoId);

        let movimentacao;

        if (estaEditando) {
            movimentacao = movimentacaoEditando;

            // Não permite excluir parcelas que já foram pagas
            const parcelasPagas = parcelasEditando.filter(parcela =>
                String(parcela.get("status") || "").toLowerCase() === "pago"
            );

            if (quantidadeParcelas < parcelasPagas.length) {
                throw new Error(
                    "A quantidade de parcelas não pode ser menor que o número de parcelas já pagas."
                );
            }

            movimentacao.set("descricao", descricao);
            movimentacao.set("cliente", cliente);
            movimentacao.set("valor", valor);
            movimentacao.set("dataMovimentacao", dataMovimentacao);
            movimentacao.set("categoria", categoria);
            movimentacao.set("formaPagamento", forma);
            movimentacao.set("observacao", observacao);

            await movimentacao.save();

        } else {
            const Movimentacao = Parse.Object.extend("Movimentacao");
            movimentacao = new Movimentacao();

            movimentacao.set("descricao", descricao);
            movimentacao.set("cliente", cliente);
            movimentacao.set("valor", valor);
            movimentacao.set("dataMovimentacao", dataMovimentacao);
            movimentacao.set("tipoMovimentacao", "Entrada");
            movimentacao.set("categoria", categoria);
            movimentacao.set("formaPagamento", forma);
            movimentacao.set("observacao", observacao);

            await movimentacao.save();
        }

        // DIVIDIR VALOR EM CENTAVOS
        const valorCentavos = Math.round(valor * 100);
        const valorBase = Math.floor(valorCentavos / quantidadeParcelas);
        const resto = valorCentavos % quantidadeParcelas;

        const Parcela = Parse.Object.extend("Parcela");
        const novasParcelas = [];

        for (let i = 0; i < quantidadeParcelas; i++) {
            const valorParcela = (valorBase + (i < resto ? 1 : 0)) / 100;

            const vencimento = new Date(dataMovimentacao);
            vencimento.setMonth(vencimento.getMonth() + i);

            let parcela;

            if (estaEditando && parcelasEditando[i]) {
                parcela = parcelasEditando[i];
            } else {
                parcela = new Parcela();
                parcela.set("movimentacao", movimentacao);
                parcela.set("status", "Pendente");
            }

            parcela.set("numeroParcela", i + 1);
            parcela.set("valor", valorParcela);
            parcela.set("dataVencimento", vencimento);

            novasParcelas.push(parcela);
        }

        // SALVAR PARCELAS
        await Parse.Object.saveAll(novasParcelas);

        // REMOVER PARCELAS EXCEDENTES, DESDE QUE NÃO ESTEJAM PAGAS
        if (estaEditando && parcelasEditando.length > quantidadeParcelas) {
            const excedentes = parcelasEditando.slice(quantidadeParcelas);

            const pagasExcedentes = excedentes.filter(parcela =>
                String(parcela.get("status") || "").toLowerCase() === "pago"
            );

            if (pagasExcedentes.length > 0) {
                throw new Error("Não é possível remover parcelas já pagas.");
            }

            await Parse.Object.destroyAll(excedentes);
        }

        alert(estaEditando
            ? "Entrada atualizada com sucesso!"
            : "Entrada cadastrada com sucesso!"
        );

        this.reset();

        const hoje = new Date();
        document.getElementById("dataEntrada").value = dataParaInput(hoje);
        document.getElementById("parcelas").value = 1;

        movimentacaoEditando = null;
        parcelasEditando = [];

        document.querySelector("#entradas .form-header h1").textContent = "Nova Entrada";
        botaoSalvar.textContent = "Salvar Entrada";

        await carregarMovimentacoes();
        voltarInicio();

    } catch (erro) {
        console.error("Erro ao salvar entrada:", erro);
        alert("Não foi possível salvar a entrada: " + erro.message);

    } finally {
        botaoSalvar.disabled = false;

        if (movimentacaoEditando) {
            botaoSalvar.textContent = "Salvar Alterações";
        } else {
            botaoSalvar.textContent = "Salvar Entrada";
        }
    }
});
// CANCELAR ENTRADA
function cancelarEntrada() {
    document.getElementById("formEntrada").reset();

    movimentacaoEditando = null;
    parcelasEditando = [];

    document.querySelector("#entradas .form-header h1").textContent =
        "Nova Entrada";

    document.querySelector("#formEntrada .btn-salvar").textContent =
        "Salvar Entrada";

    document.getElementById("dataEntrada").value =
        dataParaInput(new Date());

    document.getElementById("parcelas").value = 1;

    voltarInicio();
}


// VERIFICAR SESSÃO AO ABRIR O SITE
verificarLogin();

// MOVIMENTAÇÕES

let movimentacoesCarregadas = [];
let parcelasCarregadas = [];
let formasPagamentoCarregadas = [];
let movimentacaoEditando = null;
let parcelasEditando = [];

// MÊS ATUAL COMO PADRÃO
const campoMes = document.getElementById("filtroMes");

if (campoMes) {
    const hoje = new Date();
    campoMes.value =
        `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;
}

// CARREGAR FORMAS DE PAGAMENTO NO FILTRO
async function carregarFiltroPagamento() {
    const select = document.getElementById("filtroPagamento");

    try {
        const consulta = new Parse.Query("FormaPagamento");
        consulta.ascending("nome");

        formasPagamentoCarregadas = await consulta.find();

        select.innerHTML = '<option value="">Todos</option>';

        formasPagamentoCarregadas.forEach(forma => {
            const opcao = document.createElement("option");
            opcao.value = forma.id;
            opcao.textContent = forma.get("nome");
            select.appendChild(opcao);
        });

    } catch (erro) {
        console.error("Erro ao carregar formas de pagamento:", erro);
    }
}

// BUSCAR MOVIMENTAÇÕES E PARCELAS
async function carregarMovimentacoes() {
    const tbody = document.getElementById("listaMovimentacoes");

    tbody.innerHTML = `
        <tr>
            <td colspan="8" class="tabela-vazia">Carregando movimentações...</td>
        </tr>
    `;

    try {
        const consultaMovimentacoes = new Parse.Query("Movimentacao");
        consultaMovimentacoes.include("formaPagamento");
        consultaMovimentacoes.include("categoria");
        consultaMovimentacoes.descending("dataMovimentacao");
        consultaMovimentacoes.limit(1000);

        const consultaParcelas = new Parse.Query("Parcela");
        consultaParcelas.include("movimentacao");
        consultaParcelas.limit(1000);

        const resultados = await Promise.all([
            consultaMovimentacoes.find(),
            consultaParcelas.find()
        ]);

        movimentacoesCarregadas = resultados[0];
        parcelasCarregadas = resultados[1];

        aplicarFiltrosMovimentacoes();

    } catch (erro) {
        console.error("Erro ao carregar movimentações:", erro);

        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="tabela-vazia">
                    Não foi possível carregar as movimentações.
                </td>
            </tr>
        `;
    }
}

// CALCULAR STATUS DA MOVIMENTAÇÃO
function calcularStatusMovimentacao(movimentacao) {
    const parcelas = parcelasCarregadas.filter(parcela => {
        const relacionada = parcela.get("movimentacao");

        return relacionada &&
            relacionada.id === movimentacao.id;
    });

    if (parcelas.length === 0) {
        return "Pendente";
    }

    const pagas = parcelas.filter(parcela =>
        String(parcela.get("status") || "").toLowerCase() === "pago"
    ).length;

    if (pagas === parcelas.length) {
        return "Pago";
    }

    if (pagas > 0) {
        return "Parcial";
    }

    return "Pendente";
}

// FORMATAR VALOR
function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

// FORMATAR DATA
function formatarDataMovimentacao(data) {
    if (!data) return "-";

    const dataObj = new Date(data);

    return dataObj.toLocaleDateString("pt-BR");
}

// PROTEGER TEXTO EXIBIDO NA TABELA
function escaparHTML(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, caractere => {
        const caracteres = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return caracteres[caractere];
    });
}

// APLICAR FILTROS
function aplicarFiltrosMovimentacoes() {
    const busca = document.getElementById("buscaMovimentacao")
        .value.trim().toLowerCase();

    const mes = document.getElementById("filtroMes").value;
    const tipo = document.getElementById("filtroTipo").value.toLowerCase();
    const pagamento = document.getElementById("filtroPagamento").value;
    const status = document.getElementById("filtroStatus").value.toLowerCase();

    const filtradas = movimentacoesCarregadas.filter(movimentacao => {
        const descricao = String(movimentacao.get("descricao") || "").toLowerCase();
        const cliente = String(movimentacao.get("cliente") || "").toLowerCase();

        const data = movimentacao.get("dataMovimentacao");
        const dataTexto = data
            ? new Date(data).toLocaleDateString("pt-BR")
            : "";

        const dataISO = data
            ? new Date(data).toISOString().substring(0, 10)
            : "";

        const tipoMovimentacao = String(
            movimentacao.get("tipoMovimentacao") || ""
        ).toLowerCase();

        const forma = movimentacao.get("formaPagamento");
        const formaId = forma ? forma.id : "";

        const statusMovimentacao =
            calcularStatusMovimentacao(movimentacao).toLowerCase();

        const correspondeMes = !mes ||
            (data && dataISO.substring(0, 7) === mes);

        const correspondeBusca = !busca ||
            descricao.includes(busca) ||
            cliente.includes(busca) ||
            dataTexto.includes(busca) ||
            dataISO.includes(busca);

        const correspondeTipo = !tipo ||
            tipoMovimentacao === tipo ||
            tipoMovimentacao === (tipo === "entrada" ? "entradas" : "despesas");

        const correspondePagamento = !pagamento ||
            formaId === pagamento;

        const correspondeStatus = !status ||
            statusMovimentacao === status;

        return correspondeMes &&
            correspondeBusca &&
            correspondeTipo &&
            correspondePagamento &&
            correspondeStatus;
    });

    exibirMovimentacoes(filtradas);
}

// EXIBIR REGISTROS NA TABELA
function exibirMovimentacoes(lista) {
    const tbody = document.getElementById("listaMovimentacoes");
    const total = document.getElementById("totalMovimentacoes");

    total.textContent = lista.length;

    if (lista.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="tabela-vazia">
                    Nenhuma movimentação encontrada com os filtros aplicados.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = "";

    lista.forEach(movimentacao => {
        const tipoOriginal = String(
            movimentacao.get("tipoMovimentacao") || ""
        );

        const tipo = tipoOriginal.toLowerCase();
        const ehEntrada = tipo === "entrada" || tipo === "entradas";

        const forma = movimentacao.get("formaPagamento");
        const nomeForma = forma ? forma.get("nome") : "-";

        const status = calcularStatusMovimentacao(movimentacao);
        const valor = Number(movimentacao.get("valor") || 0);

        const linha = document.createElement("tr");

        linha.innerHTML = `
            <td>${escaparHTML(
            formatarDataMovimentacao(movimentacao.get("dataMovimentacao"))
        )}</td>

            <td>${escaparHTML(movimentacao.get("descricao") || "-")}</td>

            <td>${escaparHTML(movimentacao.get("cliente") || "-")}</td>

            <td>
                <span class="badge-tipo ${ehEntrada ? "badge-entrada" : "badge-despesa"}">
                    ${ehEntrada ? "Entrada" : "Despesa"}
                </span>
            </td>

            <td>${escaparHTML(nomeForma)}</td>

            <td class="${ehEntrada ? "valor-entrada" : "valor-despesa"}">
                ${formatarMoeda(valor)}
            </td>

            <td>
                <span class="badge-status badge-${status.toLowerCase()}">
                    ${status}
                </span>
            </td>

            <td>
                <div class="acoes-movimentacao">
                    <button type="button" class="btn-editar-movimentacao"
                        title="Editar" data-id="${movimentacao.id}">
                        ✏️
                    </button>

                    <button type="button" class="btn-excluir-movimentacao"
                        title="Excluir" data-id="${movimentacao.id}">
                        🗑️
                    </button>
                </div>
            </td>
        `;

        tbody.appendChild(linha);
    });
}

// EVENTOS DOS BOTÕES
document.getElementById("listaMovimentacoes").addEventListener("click", function (event) {

    const botaoEditar = event.target.closest(".btn-editar-movimentacao");
    const botaoExcluir = event.target.closest(".btn-excluir-movimentacao");

    if (botaoEditar) {
        editarMovimentacao(botaoEditar.dataset.id);
    }

    if (botaoExcluir) {
        excluirMovimentacao(botaoExcluir.dataset.id);
    }
});


// CONVERTER DATA PARA INPUT
function dataParaInput(data) {
    if (!data) return "";

    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}


// CONVERTER DATA DO INPUT
function dataDoInput(texto) {
    if (!texto) return null;

    const [ano, mes, dia] = texto.split("-").map(Number);

    return new Date(ano, mes - 1, dia, 12);
}


// ABRIR FORMULÁRIO DE EDIÇÃO
function abrirFormularioEdicao(tipo) {

    document.querySelectorAll(".page").forEach(pagina => {
        pagina.classList.remove("active");
    });

    const pagina = document.getElementById(
        tipo === "Entrada" ? "entradas" : "despesas"
    );

    pagina.classList.add("active");

    const titulo = pagina.querySelector(".form-header h1");

    titulo.textContent = tipo === "Entrada"
        ? "Editar Entrada"
        : "Editar Despesa";
}


// EDITAR MOVIMENTAÇÃO
async function editarMovimentacao(id) {

    try {
        const movimentacao = movimentacoesCarregadas.find(item => item.id === id);

        if (!movimentacao) {
            throw new Error("Movimentação não encontrada.");
        }

        movimentacaoEditando = movimentacao;

        parcelasEditando = parcelasCarregadas.filter(parcela => {
            const relacionada = parcela.get("movimentacao");

            return relacionada && relacionada.id === id;
        });

        const tipo = movimentacao.get("tipoMovimentacao");
        const categoria = movimentacao.get("categoria");
        const forma = movimentacao.get("formaPagamento");

        if (tipo === "Entrada") {

            document.getElementById("descricao").value =
                movimentacao.get("descricao") || "";

            document.getElementById("cliente").value =
                movimentacao.get("cliente") || "";

            document.getElementById("valor").value =
                movimentacao.get("valor") || "";

            document.getElementById("dataEntrada").value =
                dataParaInput(movimentacao.get("dataMovimentacao"));

            document.getElementById("observacao").value =
                movimentacao.get("observacao") || "";

            document.getElementById("categoria").value =
                categoria ? categoria.id : "";

            document.getElementById("formaPagamento").value =
                forma ? forma.id : "";

            document.getElementById("parcelas").value =
                parcelasEditando.length || 1;

            document.querySelector("#formEntrada .btn-salvar").textContent =
                "Salvar Alterações";

            abrirFormularioEdicao("Entrada");

        } else {

            const parcela = parcelasEditando[0];

            document.getElementById("descricaoDespesa").value =
                movimentacao.get("descricao") || "";

            document.getElementById("categoriaDespesa").value =
                categoria ? categoria.id : "";

            document.getElementById("valorDespesa").value =
                movimentacao.get("valor") || "";

            document.getElementById("dataVencimento").value =
                dataParaInput(
                    parcela?.get("dataVencimento") ||
                    movimentacao.get("dataMovimentacao")
                );

            document.getElementById("dataPagamento").value =
                dataParaInput(parcela?.get("dataPagamento"));

            document.getElementById("formaPagamentoDespesa").value =
                forma ? forma.id : "";

            document.getElementById("statusDespesa").value =
                parcela?.get("status") || "Pendente";

            document.getElementById("observacaoDespesa").value =
                movimentacao.get("observacao") || "";

            document.querySelector("#formDespesa .btn-salvar").textContent =
                "Salvar Alterações";

            abrirFormularioEdicao("Despesa");
        }

    } catch (erro) {
        console.error("Erro ao abrir edição:", erro);
        alert("Não foi possível abrir a movimentação: " + erro.message);
    }
}


// EXCLUIR MOVIMENTAÇÃO
async function excluirMovimentacao(id) {

    const movimentacao = movimentacoesCarregadas.find(item => item.id === id);

    if (!movimentacao) {
        alert("Movimentação não encontrada.");
        return;
    }

    const confirmar = confirm(
        `Deseja realmente excluir "${movimentacao.get("descricao")}" e todas as suas parcelas?`
    );

    if (!confirmar) return;

    try {

        const parcelas = parcelasCarregadas.filter(parcela => {
            const relacionada = parcela.get("movimentacao");

            return relacionada && relacionada.id === id;
        });

        if (parcelas.length > 0) {
            await Parse.Object.destroyAll(parcelas);
        }

        await movimentacao.destroy();

        alert("Movimentação excluída com sucesso!");

        await carregarMovimentacoes();

    } catch (erro) {
        console.error("Erro ao excluir movimentação:", erro);
        alert("Não foi possível excluir: " + erro.message);
    }
}

// EVENTOS DOS FILTROS
document.getElementById("buscaMovimentacao")
    .addEventListener("input", aplicarFiltrosMovimentacoes);

document.getElementById("filtroMes")
    .addEventListener("change", aplicarFiltrosMovimentacoes);

document.getElementById("filtroTipo")
    .addEventListener("change", aplicarFiltrosMovimentacoes);

document.getElementById("filtroPagamento")
    .addEventListener("change", aplicarFiltrosMovimentacoes);

document.getElementById("filtroStatus")
    .addEventListener("change", aplicarFiltrosMovimentacoes);

// LIMPAR FILTROS
document.getElementById("limparFiltros")
    .addEventListener("click", function () {
        document.getElementById("buscaMovimentacao").value = "";
        document.getElementById("filtroTipo").value = "";
        document.getElementById("filtroPagamento").value = "";
        document.getElementById("filtroStatus").value = "";

        aplicarFiltrosMovimentacoes();
    });

// CARREGAR DADOS INICIAIS
async function iniciarMovimentacoes() {
    await carregarFiltroPagamento();
    await carregarMovimentacoes();
}

// CARREGAR CATEGORIAS DAS DESPESAS
async function carregarCategoriasDespesa() {
    const select = document.getElementById("categoriaDespesa");

    try {
        const consulta = new Parse.Query("Categoria");
        consulta.ascending("nome");

        const categorias = await consulta.find();

        select.innerHTML = '<option value="">Selecione</option>';

        categorias.forEach(categoria => {
            const opcao = document.createElement("option");
            opcao.value = categoria.id;
            opcao.textContent = categoria.get("nome");
            select.appendChild(opcao);
        });

    } catch (erro) {
        console.error("Erro ao carregar categorias:", erro);
    }
}

// CARREGAR FORMAS DE PAGAMENTO
async function carregarFormasPagamentoDespesa() {
    const select = document.getElementById("formaPagamentoDespesa");

    try {
        const consulta = new Parse.Query("FormaPagamento");
        consulta.ascending("nome");

        const formas = await consulta.find();

        select.innerHTML = '<option value="">Selecione</option>';

        formas.forEach(forma => {
            const opcao = document.createElement("option");
            opcao.value = forma.id;
            opcao.textContent = forma.get("nome");
            select.appendChild(opcao);
        });

    } catch (erro) {
        console.error("Erro ao carregar formas de pagamento:", erro);
    }
}

// DATA PADRÃO
document.getElementById("dataVencimento").value =
    new Date().toISOString().split("T")[0];


// FORMULÁRIO DE DESPESA
document.getElementById("formDespesa").addEventListener("submit", async function (event) {
    event.preventDefault();

    const botao = this.querySelector(".btn-salvar");
    const estaEditando = movimentacaoEditando !== null;

    botao.disabled = true;
    botao.textContent = "Salvando...";

    try {
        const descricao = document.getElementById("descricaoDespesa").value.trim();
        const categoriaId = document.getElementById("categoriaDespesa").value;
        const valor = Number(document.getElementById("valorDespesa").value);
        const vencimentoTexto = document.getElementById("dataVencimento").value;
        const pagamentoTexto = document.getElementById("dataPagamento").value;
        const formaId = document.getElementById("formaPagamentoDespesa").value;
        const status = document.getElementById("statusDespesa").value;
        const observacao = document.getElementById("observacaoDespesa").value.trim();

        if (!categoriaId || !formaId) {
            throw new Error("Selecione a categoria e a forma de pagamento.");
        }

        if (!Number.isFinite(valor) || valor <= 0) {
            throw new Error("Informe um valor válido.");
        }

        if (!vencimentoTexto) {
            throw new Error("Informe a data de vencimento.");
        }

        if (status === "Pago" && !pagamentoTexto) {
            throw new Error("Informe a data de pagamento.");
        }

        if (pagamentoTexto && status !== "Pago") {
            throw new Error("Para informar uma data de pagamento, selecione o status Pago.");
        }

        const criarData = texto => {
            const [ano, mes, dia] = texto.split("-").map(Number);
            return new Date(ano, mes - 1, dia, 12);
        };

        const categoriaQuery = new Parse.Query("Categoria");
        const categoria = await categoriaQuery.get(categoriaId);

        const formaQuery = new Parse.Query("FormaPagamento");
        const forma = await formaQuery.get(formaId);

        let movimentacao;
        let parcela;

        if (estaEditando) {
            movimentacao = movimentacaoEditando;

            movimentacao.set("descricao", descricao);
            movimentacao.set("valor", valor);
            movimentacao.set("dataMovimentacao", criarData(vencimentoTexto));
            movimentacao.set("categoria", categoria);
            movimentacao.set("formaPagamento", forma);
            movimentacao.set("observacao", observacao);

            await movimentacao.save();

            parcela = parcelasEditando[0];

            if (!parcela) {
                const Parcela = Parse.Object.extend("Parcela");
                parcela = new Parcela();
                parcela.set("movimentacao", movimentacao);
                parcela.set("numeroParcela", 1);
            }

        } else {
            const Movimentacao = Parse.Object.extend("Movimentacao");
            movimentacao = new Movimentacao();

            movimentacao.set("descricao", descricao);
            movimentacao.set("valor", valor);
            movimentacao.set("dataMovimentacao", criarData(vencimentoTexto));
            movimentacao.set("tipoMovimentacao", "Despesa");
            movimentacao.set("observacao", observacao);
            movimentacao.set("categoria", categoria);
            movimentacao.set("formaPagamento", forma);

            await movimentacao.save();

            const Parcela = Parse.Object.extend("Parcela");
            parcela = new Parcela();

            parcela.set("movimentacao", movimentacao);
            parcela.set("numeroParcela", 1);
        }

        parcela.set("valor", valor);
        parcela.set("dataVencimento", criarData(vencimentoTexto));
        parcela.set("status", status);

        if (pagamentoTexto) {
            parcela.set("dataPagamento", criarData(pagamentoTexto));
        } else {
            parcela.unset("dataPagamento");
        }

        await parcela.save();

        alert(estaEditando
            ? "Despesa atualizada com sucesso!"
            : "Despesa cadastrada com sucesso!"
        );

        this.reset();

        document.getElementById("dataVencimento").value =
            dataParaInput(new Date());

        movimentacaoEditando = null;
        parcelasEditando = [];

        document.querySelector("#despesas .form-header h1").textContent =
            "Nova Despesa";

        botao.textContent = "Salvar Despesa";

        await carregarMovimentacoes();
        voltarInicio();

    } catch (erro) {
        console.error("Erro ao salvar despesa:", erro);
        alert("Não foi possível salvar a despesa: " + erro.message);

    } finally {
        botao.disabled = false;

        botao.textContent = movimentacaoEditando
            ? "Salvar Alterações"
            : "Salvar Despesa";
    }
});



// CANCELAR EDIÇÃO OU CADASTRO DE DESPESA
function cancelarDespesa() {
    document.getElementById("formDespesa").reset();

    movimentacaoEditando = null;
    parcelasEditando = [];

    document.querySelector("#despesas .form-header h1").textContent =
        "Nova Despesa";

    document.querySelector("#formDespesa .btn-salvar").textContent =
        "Salvar Despesa";

    document.getElementById("dataVencimento").value =
        dataParaInput(new Date());

    voltarInicio();
}




// PAGAMENTOS PENDENTES

let parcelasPendentes = [];

// FORMATAR VALOR
function formatarValorPendente(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

// FORMATAR DATA
function formatarDataPendente(data) {
    if (!data) return "-";

    const dataObj = new Date(data);

    return dataObj.toLocaleDateString("pt-BR");
}

// COMPARAR DATA COM HOJE
function estaVencida(data) {
    if (!data) return false;

    const vencimento = new Date(data);
    vencimento.setHours(0, 0, 0, 0);

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    return vencimento < hoje;
}

// ESCAPAR TEXTO EXIBIDO NA TABELA
function escaparTexto(texto) {
    return String(texto || "").replace(/[&<>"']/g, caractere => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[caractere]);
}

// CARREGAR PENDÊNCIAS
async function carregarPendentes() {
    console.log("ENTROU NA FUNÇÃO CARREGAR PENDENTES");

    const tbody = document.getElementById("listaPendentes");

    if (!tbody) return;

    tbody.innerHTML = `
        <tr>
            <td colspan="7">Carregando pendências...</td>
        </tr>
    `;

    try {

        const consulta = new Parse.Query("Parcela");

        consulta.include("movimentacao");
        consulta.include("movimentacao.formaPagamento");
        consulta.ascending("dataVencimento");
        consulta.limit(1000);

        const parcelas = await consulta.find();

        console.log("Parcelas encontradas:", parcelas.length);

        parcelas.forEach(parcela => {
            console.log(
                "Parcela:",
                parcela.id,
                "Status:",
                parcela.get("status")
            );
        });

        parcelasPendentes = parcelas.filter(parcela => {

            const status = String(parcela.get("status") || "")
                .trim()
                .toLowerCase();

            return status === "pendente" &&
                parcela.get("movimentacao");
        });

        console.log("Pendências filtradas:", parcelasPendentes.length);

        atualizarResumoPendentes();
        renderizarPendentes();

    } catch (erro) {

        console.error("Erro ao carregar pendências:", erro);

        tbody.innerHTML = `
            <tr>
                <td colspan="7">Não foi possível carregar as pendências.</td>
            </tr>
        `;
    }
}

// ATUALIZAR CARDS
function atualizarResumoPendentes() {

    const total = parcelasPendentes.reduce((soma, parcela) => {
        return soma + Number(parcela.get("valor") || 0);
    }, 0);

    const vencidas = parcelasPendentes.filter(parcela => {
        return estaVencida(parcela.get("dataVencimento"));
    }).length;

    document.getElementById("totalPendente").textContent =
        formatarValorPendente(total);

    document.getElementById("quantidadePendencias").textContent =
        parcelasPendentes.length;

    document.getElementById("pendenciasVencidas").textContent =
        vencidas;
}

// RENDERIZAR TABELA
function renderizarPendentes() {

    const tbody = document.getElementById("listaPendentes");

    if (parcelasPendentes.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="sem-pendencias">
                    ✓ Não há pagamentos pendentes!
                </td>
            </tr>
        `;

        return;
    }

    tbody.innerHTML = "";

    parcelasPendentes.forEach(parcela => {

        const movimentacao = parcela.get("movimentacao");

        const descricao = escaparTexto(
            movimentacao.get("descricao")
        );

        const cliente = escaparTexto(
            movimentacao.get("cliente") || "-"
        );

        const valor = Number(parcela.get("valor") || 0);

        const data = parcela.get("dataVencimento");

        const forma = movimentacao.get("formaPagamento");

        const nomeForma = forma
            ? escaparTexto(forma.get("nome"))
            : "-";

        const tipo = movimentacao.get("tipoMovimentacao");

        const classeValor = tipo === "Entrada"
            ? "valor-entrada"
            : "valor-despesa";

        const vencida = estaVencida(data);

        const situacao = vencida
            ? '<span class="status-vencido">Vencido</span>'
            : '<span class="status-pendente">A vencer</span>';

        const linha = document.createElement("tr");

        linha.innerHTML = `
            <td>${cliente}</td>
            <td>${descricao}</td>
            <td class="${classeValor}">
                ${formatarValorPendente(valor)}
            </td>
            <td>${formatarDataPendente(data)}</td>
            <td>${nomeForma}</td>
            <td>${situacao}</td>
            <td>
                <button
                    class="btn-marcar-pago"
                    onclick="marcarComoPago('${parcela.id}')">
                    ✓ Marcar como pago
                </button>
            </td>
        `;

        tbody.appendChild(linha);
    });
}

// MARCAR PARCELA COMO PAGA
let parcelaSelecionada = null;

// ABRIR MODAL
function marcarComoPago(id) {
    parcelaSelecionada = id;

    document.getElementById("modalPagamento")
        .classList.add("ativo");
}

// FECHAR MODAL
function fecharModalPagamento() {
    document.getElementById("modalPagamento")
        .classList.remove("ativo");

    parcelaSelecionada = null;
}

// MOSTRAR NOTIFICAÇÃO
function mostrarNotificacao(mensagem) {
    const notificacao = document.getElementById("notificacao");

    notificacao.textContent = mensagem;
    notificacao.classList.add("ativo");

    setTimeout(() => {
        notificacao.classList.remove("ativo");
    }, 3000);
}

// CONFIRMAR PAGAMENTO
document.getElementById("confirmarPagamento")
    .addEventListener("click", async function () {

        if (!parcelaSelecionada) return;

        const botao = this;

        botao.disabled = true;
        botao.textContent = "Salvando...";

        try {
            const consulta = new Parse.Query("Parcela");
            const parcela = await consulta.get(parcelaSelecionada);

            parcela.set("status", "Pago");
            parcela.set("dataPagamento", new Date());

            await parcela.save();

            fecharModalPagamento();

            await carregarPendentes();

            if (typeof carregarMovimentacoes === "function") {
                await carregarMovimentacoes();
            }

            mostrarNotificacao("Pagamento marcado como pago!");

        } catch (erro) {
            console.error("Erro ao atualizar pagamento:", erro);
            mostrarNotificacao("Não foi possível atualizar o pagamento.");
        } finally {
            botao.disabled = false;
            botao.textContent = "Confirmar pagamento";
        }
    });

// RELATÓRIOS

let movimentacoesRelatorio = [];

// FORMATAR MOEDA
function formatarMoedaRelatorio(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

// FILTRO DE PERÍODO DOS RELATÓRIOS

function carregarMesesRelatorio() {

    const selectPeriodo = document.getElementById("tipoPeriodoRelatorio");
    const selectData = document.getElementById("mesRelatorio");

    if (!selectPeriodo || !selectData) return;

    function atualizarOpcoes() {

        const tipo = selectPeriodo.value;
        const hoje = new Date();

        selectData.innerHTML = "";

        if (tipo === "mensal") {

            for (let i = 0; i < 12; i++) {

                const data = new Date(
                    hoje.getFullYear(),
                    hoje.getMonth() - i,
                    1
                );

                const ano = data.getFullYear();
                const mes = String(data.getMonth() + 1).padStart(2, "0");

                const opcao = document.createElement("option");

                opcao.value = `${ano}-${mes}`;

                const nome = data.toLocaleDateString("pt-BR", {
                    month: "long",
                    year: "numeric"
                });

                opcao.textContent =
                    nome.charAt(0).toUpperCase() + nome.slice(1);

                selectData.appendChild(opcao);
            }

        } else if (tipo === "trimestral") {

            const trimestreAtual = Math.floor(hoje.getMonth() / 3) + 1;

            for (let i = 0; i < 8; i++) {

                let trimestre = trimestreAtual - i;
                let ano = hoje.getFullYear();

                while (trimestre <= 0) {
                    trimestre += 4;
                    ano--;
                }

                const opcao = document.createElement("option");

                opcao.value = `${ano}-T${trimestre}`;
                opcao.textContent = `${trimestre}º Trimestre de ${ano}`;

                selectData.appendChild(opcao);
            }

        } else if (tipo === "anual") {

            for (let i = 0; i < 5; i++) {

                const ano = hoje.getFullYear() - i;

                const opcao = document.createElement("option");

                opcao.value = String(ano);
                opcao.textContent = ano;

                selectData.appendChild(opcao);
            }
        }

        carregarRelatorio();
    }

    selectPeriodo.addEventListener("change", atualizarOpcoes);
    selectData.addEventListener("change", carregarRelatorio);

    atualizarOpcoes();
}



// CARREGAR MOVIMENTAÇÕES DO PERÍODO

async function carregarRelatorio() {

    const tipo = document.getElementById("tipoPeriodoRelatorio").value;
    const valor = document.getElementById("mesRelatorio").value;

    if (!valor) return;

    let inicio;
    let fim;
    let titulo;

    if (tipo === "mensal") {

        const [ano, mes] = valor.split("-").map(Number);

        inicio = new Date(ano, mes - 1, 1);
        fim = new Date(ano, mes, 1);

        titulo = "Relatório Mensal";

    } else if (tipo === "trimestral") {

        const [ano, trimestre] = valor.split("-T").map(Number);

        const mesInicial = (trimestre - 1) * 3;

        inicio = new Date(ano, mesInicial, 1);
        fim = new Date(ano, mesInicial + 3, 1);

        titulo = "Relatório Trimestral";

    } else {

        const ano = Number(valor);

        inicio = new Date(ano, 0, 1);
        fim = new Date(ano + 1, 0, 1);

        titulo = "Relatório Anual";
    }

    document.getElementById("tituloRelatorio").textContent = titulo;

    try {

        const consulta = new Parse.Query("Movimentacao");

        consulta.greaterThanOrEqualTo("dataMovimentacao", inicio);
        consulta.lessThan("dataMovimentacao", fim);
        consulta.include("categoria");
        consulta.include("formaPagamento");
        consulta.descending("dataMovimentacao");
        consulta.limit(1000);

        movimentacoesRelatorio = await consulta.find();

        atualizarIndicadoresRelatorio();
        atualizarGraficoRelatorio();
        atualizarCategoriasRelatorio();

    } catch (erro) {

        console.error("Erro ao carregar relatório:", erro);

        document.getElementById("listaDespesasCategoria").innerHTML = `
            <tr>
                <td colspan="4">Não foi possível carregar o relatório.</td>
            </tr>
        `;
    }
}
// ATUALIZAR INDICADORES
function atualizarIndicadoresRelatorio() {

    const entradas = movimentacoesRelatorio.filter(mov => {
        return String(mov.get("tipoMovimentacao")).toLowerCase() === "entrada";
    });

    const despesas = movimentacoesRelatorio.filter(mov => {
        return String(mov.get("tipoMovimentacao")).toLowerCase() === "despesa";
    });

    const totalEntradas = entradas.reduce((soma, mov) => {
        return soma + Number(mov.get("valor") || 0);
    }, 0);

    const totalDespesas = despesas.reduce((soma, mov) => {
        return soma + Number(mov.get("valor") || 0);
    }, 0);

    const saldoLiquido = totalEntradas - totalDespesas;

    document.getElementById("relTotalEntradas").textContent =
        formatarMoedaRelatorio(totalEntradas);

    document.getElementById("relTotalDespesas").textContent =
        formatarMoedaRelatorio(totalDespesas);

    document.getElementById("relSaldoBruto").textContent =
        formatarMoedaRelatorio(totalEntradas);

    const elementoSaldo = document.getElementById("relSaldoLiquido");

    elementoSaldo.textContent =
        formatarMoedaRelatorio(saldoLiquido);

    elementoSaldo.style.color =
        saldoLiquido >= 0 ? "#16a34a" : "#dc2626";

    document.getElementById("relQuantidade").textContent =
        movimentacoesRelatorio.length;
}

// ATUALIZAR GRÁFICO
function atualizarGraficoRelatorio() {

    const entradas = movimentacoesRelatorio
        .filter(mov => String(mov.get("tipoMovimentacao")).toLowerCase() === "entrada")
        .reduce((soma, mov) => soma + Number(mov.get("valor") || 0), 0);

    const despesas = movimentacoesRelatorio
        .filter(mov => String(mov.get("tipoMovimentacao")).toLowerCase() === "despesa")
        .reduce((soma, mov) => soma + Number(mov.get("valor") || 0), 0);

    const maiorValor = Math.max(entradas, despesas, 1);

    const alturaEntrada = (entradas / maiorValor) * 220;
    const alturaDespesa = (despesas / maiorValor) * 220;

    document.getElementById("barraEntrada").style.height =
        alturaEntrada + "px";

    document.getElementById("barraDespesa").style.height =
        alturaDespesa + "px";

    document.getElementById("valorBarraEntrada").textContent =
        formatarMoedaRelatorio(entradas);

    document.getElementById("valorBarraDespesa").textContent =
        formatarMoedaRelatorio(despesas);
}

// ATUALIZAR DESPESAS POR CATEGORIA
function atualizarCategoriasRelatorio() {

    const tbody = document.getElementById("listaDespesasCategoria");

    const despesas = movimentacoesRelatorio.filter(mov => {
        return String(mov.get("tipoMovimentacao")).toLowerCase() === "despesa";
    });

    const categorias = {};

    despesas.forEach(mov => {

        const categoria = mov.get("categoria");

        const nome = categoria
            ? categoria.get("nome")
            : "Sem categoria";

        if (!categorias[nome]) {
            categorias[nome] = {
                total: 0,
                quantidade: 0
            };
        }

        categorias[nome].total += Number(mov.get("valor") || 0);
        categorias[nome].quantidade++;
    });

    const totalDespesas = despesas.reduce((soma, mov) => {
        return soma + Number(mov.get("valor") || 0);
    }, 0);

    tbody.innerHTML = "";

    const nomes = Object.keys(categorias).sort();

    if (nomes.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align:center; padding:30px;">
                    Nenhuma despesa registrada neste período..
                </td>
            </tr>
        `;

        return;
    }

    nomes.forEach(nome => {

        const dados = categorias[nome];

        const percentual = totalDespesas > 0
            ? (dados.total / totalDespesas) * 100
            : 0;

        const linha = document.createElement("tr");

        const celulas = [
            nome,
            dados.quantidade,
            formatarMoedaRelatorio(dados.total),
            percentual.toFixed(1) + "%"
        ];

        celulas.forEach((valor, indice) => {

            const td = document.createElement("td");
            td.textContent = valor;

            if (indice === 2) {
                td.classList.add("valor-categoria");
            }

            linha.appendChild(td);
        });

        tbody.appendChild(linha);
    });

    // TOTAL GERAL
    const quantidadeTotal = despesas.length;

    const linhaTotal = document.createElement("tr");
    linhaTotal.classList.add("total-geral");

    [
        "Total Geral",
        quantidadeTotal,
        formatarMoedaRelatorio(totalDespesas),
        "100%"
    ].forEach(valor => {

        const td = document.createElement("td");
        td.textContent = valor;
        linhaTotal.appendChild(td);
    });

    tbody.appendChild(linhaTotal);
}




function exportarRelatorio() {

    if (movimentacoesRelatorio.length === 0) {
        alert("Não há movimentações para exportar neste período.");
        return;
    }

    if (typeof XLSX === "undefined") {
        alert("Biblioteca Excel não encontrada.");
        return;
    }

    try {

        const tipo = document.getElementById("tipoPeriodoRelatorio").value;
        const select = document.getElementById("mesRelatorio");
        const periodo = select.options[select.selectedIndex]?.text || "";

        // CALCULAR RESUMO

        const entradas = movimentacoesRelatorio.filter(m =>
            String(m.get("tipoMovimentacao")).toLowerCase() === "entrada"
        );

        const despesas = movimentacoesRelatorio.filter(m =>
            String(m.get("tipoMovimentacao")).toLowerCase() === "despesa"
        );

        const totalEntradas = entradas.reduce(
            (soma, m) => soma + Number(m.get("valor") || 0), 0
        );

        const totalDespesas = despesas.reduce(
            (soma, m) => soma + Number(m.get("valor") || 0), 0
        );

        const saldoLiquido = totalEntradas - totalDespesas;

        // MONTAR DADOS

        const dados = [
            ["FLUXO+ - RELATÓRIO FINANCEIRO"],
            [`Período: ${periodo}`],
            [`Gerado em: ${new Date().toLocaleDateString("pt-BR")}`],
            [],
            ["RESUMO FINANCEIRO"],
            ["Indicador", "Valor"],
            ["Total de entradas", totalEntradas],
            ["Total de despesas", totalDespesas],
            ["Saldo líquido", saldoLiquido],
            ["Quantidade de movimentações", movimentacoesRelatorio.length],
            [],
            ["DETALHAMENTO DAS MOVIMENTAÇÕES"],
            ["Data", "Descrição", "Tipo", "Categoria", "Valor"]
        ];

        movimentacoesRelatorio.forEach(mov => {

            const data = mov.get("dataMovimentacao");
            const categoria = mov.get("categoria");

            dados.push([
                data ? data.toLocaleDateString("pt-BR") : "",
                mov.get("descricao") || "",
                mov.get("tipoMovimentacao") || "",
                categoria ? categoria.get("nome") : "Sem categoria",
                Number(mov.get("valor") || 0)
            ]);
        });

        // CRIAR PLANILHA

        const planilha = XLSX.utils.aoa_to_sheet(dados);

        planilha["!cols"] = [
            { wch: 18 },
            { wch: 38 },
            { wch: 18 },
            { wch: 25 },
            { wch: 20 }
        ];

        planilha["!rows"] = [
            { hpt: 30 },
            { hpt: 22 },
            { hpt: 20 }
        ];

        planilha["!merges"] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }
        ];

        // ESTILOS

        const borda = {
            top: { style: "thin", color: { rgb: "CBD5E1" } },
            bottom: { style: "thin", color: { rgb: "CBD5E1" } },
            left: { style: "thin", color: { rgb: "CBD5E1" } },
            right: { style: "thin", color: { rgb: "CBD5E1" } }
        };

        const estiloTitulo = {
            font: { bold: true, sz: 16, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "1E3A5F" } },
            alignment: { horizontal: "center", vertical: "center" }
        };

        const estiloSecao = {
            font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "334155" } },
            border: borda
        };

        const estiloCabecalho = {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "2563EB" } },
            alignment: { horizontal: "center", vertical: "center" },
            border: borda
        };

        if (planilha["A1"]) {
            planilha["A1"].s = estiloTitulo;
        }

        if (planilha["A2"]) {
            planilha["A2"].s = {
                font: { italic: true, color: { rgb: "475569" } }
            };
        }

        if (planilha["A3"]) {
            planilha["A3"].s = {
                font: { color: { rgb: "64748B" }, sz: 10 }
            };
        }

        // Títulos das seções
        ["A5", "A12"].forEach(ref => {
            if (planilha[ref]) {
                planilha[ref].s = estiloSecao;
            }
        });

        // Cabeçalhos das tabelas
        ["A6", "B6", "A13", "B13", "C13", "D13", "E13"].forEach(ref => {
            if (planilha[ref]) {
                planilha[ref].s = estiloCabecalho;
            }
        });

        // Dados do resumo
        for (let r = 6; r <= 9; r++) {

            for (let c = 0; c < 2; c++) {

                const ref = XLSX.utils.encode_cell({ r, c });

                if (!planilha[ref]) continue;

                planilha[ref].s = {
                    border: borda,
                    font: { color: { rgb: "334155" } },
                    alignment: { vertical: "center" }
                };
            }
        }

        // Dados das movimentações
        for (let r = 13; r < dados.length; r++) {

            for (let c = 0; c < 5; c++) {

                const ref = XLSX.utils.encode_cell({ r, c });

                if (!planilha[ref]) continue;

                planilha[ref].s = {
                    border: borda,
                    alignment: { vertical: "center" },
                    font: { color: { rgb: "334155" } }
                };

                if (r % 2 === 0) {
                    planilha[ref].s.fill = {
                        fgColor: { rgb: "F1F5F9" }
                    };
                }
            }

            const refValor = XLSX.utils.encode_cell({ r, c: 4 });

            if (planilha[refValor]) {
                planilha[refValor].z = '"R$" #,##0.00';
            }
        }

        // Formatação dos valores do resumo
        ["B7", "B8", "B9"].forEach(ref => {
            if (planilha[ref]) {
                planilha[ref].z = '"R$" #,##0.00';
            }
        });

        if (planilha["B10"]) {
            planilha["B10"].z = "0";
        }

        // EXPORTAR

        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
            workbook,
            planilha,
            "Relatório"
        );

        XLSX.writeFile(
            workbook,
            `FluxoMais_Relatorio_${tipo}_${select.value}.xlsx`
        );

    } catch (erro) {

        console.error("Erro ao exportar relatório:", erro);
        alert("Não foi possível gerar o relatório.");
    }
}


// ABRIR GERENCIAMENTO DE CATEGORIAS
function abrirGerenciarCategorias() {
    document.getElementById("painelCategorias").hidden = false;
    document.getElementById("painelPagamentos").hidden = true;

    carregarCategoriasConfig();
}

// ABRIR GERENCIAMENTO DE FORMAS DE PAGAMENTO
function abrirGerenciarPagamentos() {
    document.getElementById("painelCategorias").hidden = true;
    document.getElementById("painelPagamentos").hidden = false;

    carregarPagamentosConfig();
}

// CARREGAR CATEGORIAS NAS CONFIGURAÇÕES
async function carregarCategoriasConfig() {
    const lista = document.getElementById("listaCategoriasConfig");

    try {
        const consulta = new Parse.Query("Categoria");
        consulta.ascending("nome");

        const categorias = await consulta.find();

        lista.innerHTML = "";

        categorias.forEach(categoria => {
            lista.innerHTML += `
                <div class="item-configuracao">
                    <div>
                        <strong>${escaparTexto(categoria.get("nome"))}</strong>
                        <p>${escaparTexto(categoria.get("descricao") || "")}</p>
                    </div>

                    <div class="acoes-configuracao">
                        <button onclick="editarCategoria('${categoria.id}')">✏️</button>
                        <button onclick="excluirCategoria('${categoria.id}')">🗑️</button>
                    </div>
                </div>
            `;
        });

        if (categorias.length === 0) {
            lista.innerHTML = "<p>Nenhuma categoria cadastrada.</p>";
        }

    } catch (erro) {
        console.error(erro);
        lista.innerHTML = "<p>Erro ao carregar categorias.</p>";
    }
}

// CARREGAR FORMAS DE PAGAMENTO NAS CONFIGURAÇÕES
async function carregarPagamentosConfig() {
    const lista = document.getElementById("listaPagamentosConfig");

    try {
        const consulta = new Parse.Query("FormaPagamento");
        consulta.ascending("nome");

        const formas = await consulta.find();

        lista.innerHTML = "";

        formas.forEach(forma => {
            lista.innerHTML += `
                <div class="item-configuracao">
                    <strong>${escaparTexto(forma.get("nome"))}</strong>

                    <div class="acoes-configuracao">
                        <button onclick="editarPagamento('${forma.id}')">✏️</button>
                        <button onclick="excluirPagamento('${forma.id}')">🗑️</button>
                    </div>
                </div>
            `;
        });

        if (formas.length === 0) {
            lista.innerHTML = "<p>Nenhuma forma de pagamento cadastrada.</p>";
        }

    } catch (erro) {
        console.error(erro);
        lista.innerHTML = "<p>Erro ao carregar formas de pagamento.</p>";
    }
}



// CONFIGURAÇÕES

let categoriaEditando = null;
let pagamentoEditando = null;


// ABRIR GERENCIAMENTO DE CATEGORIAS
function abrirGerenciarCategorias() {
    document.getElementById("painelCategorias").hidden = false;
    document.getElementById("painelPagamentos").hidden = true;

    carregarCategoriasConfig();

    setTimeout(() => {
        document.getElementById("painelCategorias").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }, 100);
}

// ABRIR GERENCIAMENTO DE FORMAS DE PAGAMENTO
function abrirGerenciarPagamentos() {
    document.getElementById("painelCategorias").hidden = true;
    document.getElementById("painelPagamentos").hidden = false;

    carregarPagamentosConfig();

    setTimeout(() => {
        document.getElementById("painelPagamentos").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }, 100);
}


// CARREGAR CATEGORIAS
async function carregarCategoriasConfig() {
    const lista = document.getElementById("listaCategoriasConfig");

    try {
        const consulta = new Parse.Query("Categoria");
        consulta.ascending("nome");

        const categorias = await consulta.find();

        lista.innerHTML = "";

        categorias.forEach(categoria => {
            lista.innerHTML += `
                <div class="item-configuracao">
                    <div>
                        <strong>${escaparTexto(categoria.get("nome"))}</strong>
                        <p>${escaparTexto(categoria.get("descricao") || "")}</p>
                    </div>

                    <div class="acoes-configuracao">
                        <button type="button"
                            onclick="editarCategoria('${categoria.id}')">✏️</button>

                        <button type="button"
                            onclick="excluirCategoria('${categoria.id}')">🗑️</button>
                    </div>
                </div>
            `;
        });

        if (categorias.length === 0) {
            lista.innerHTML = "<p>Nenhuma categoria cadastrada.</p>";
        }

    } catch (erro) {
        console.error("Erro ao carregar categorias:", erro);
        lista.innerHTML = "<p>Erro ao carregar categorias.</p>";
    }
}


// CARREGAR FORMAS DE PAGAMENTO
async function carregarPagamentosConfig() {
    const lista = document.getElementById("listaPagamentosConfig");

    try {
        const consulta = new Parse.Query("FormaPagamento");
        consulta.ascending("nome");

        const formas = await consulta.find();

        lista.innerHTML = "";

        formas.forEach(forma => {
            lista.innerHTML += `
                <div class="item-configuracao">
                    <strong>${escaparTexto(forma.get("nome"))}</strong>

                    <div class="acoes-configuracao">
                        <button type="button"
                            onclick="editarPagamento('${forma.id}')">✏️</button>

                        <button type="button"
                            onclick="excluirPagamento('${forma.id}')">🗑️</button>
                    </div>
                </div>
            `;
        });

        if (formas.length === 0) {
            lista.innerHTML = "<p>Nenhuma forma de pagamento cadastrada.</p>";
        }

    } catch (erro) {
        console.error("Erro ao carregar pagamentos:", erro);
        lista.innerHTML = "<p>Erro ao carregar formas de pagamento.</p>";
    }
}


// CADASTRAR OU EDITAR CATEGORIA
document.getElementById("formCategoria").addEventListener("submit", async function (event) {
    event.preventDefault();

    const nome = document.getElementById("nomeCategoriaConfig").value.trim();
    const descricao = document.getElementById("descricaoCategoriaConfig").value.trim();

    if (!nome) {
        alert("Informe o nome da categoria.");
        return;
    }

    try {
        const categoria = categoriaEditando || new Parse.Object("Categoria");

        categoria.set("nome", nome);
        categoria.set("descricao", descricao);

        await categoria.save();

        alert("Categoria salva com sucesso!");

        this.reset();
        categoriaEditando = null;

        document.getElementById("btnSalvarCategoria").textContent =
            "Adicionar categoria";

        document.getElementById("btnCancelarCategoria").style.display =
            "none";

        await carregarCategoriasConfig();
        await carregarCategorias();

    } catch (erro) {
        console.error("Erro ao salvar categoria:", erro);
        alert("Erro ao salvar categoria.");
    }
});


// EDITAR CATEGORIA
async function editarCategoria(id) {
    try {
        const consulta = new Parse.Query("Categoria");
        const categoria = await consulta.get(id);

        categoriaEditando = categoria;

        document.getElementById("nomeCategoriaConfig").value =
            categoria.get("nome");

        document.getElementById("descricaoCategoriaConfig").value =
            categoria.get("descricao") || "";

        document.getElementById("btnSalvarCategoria").textContent =
            "Salvar alterações";

        const btnCancelar = document.getElementById("btnCancelarCategoria");

        btnCancelar.hidden = false;
        btnCancelar.style.display = "block";

        document.getElementById("formCategoria").scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    } catch (erro) {
        console.error("Erro ao editar categoria:", erro);
        alert("Erro ao carregar categoria.");
    }
}

// CANCELAR EDIÇÃO DE CATEGORIA
function cancelarEdicaoCategoria() {
    document.getElementById("formCategoria").reset();

    categoriaEditando = null;

    document.getElementById("btnSalvarCategoria").textContent =
        "Adicionar categoria";

    document.getElementById("btnCancelarCategoria").style.display =
        "none";
}


// CADASTRAR OU EDITAR FORMA DE PAGAMENTO
document.getElementById("formPagamentoConfig").addEventListener("submit", async function (event) {
    event.preventDefault();

    const nome = document.getElementById("nomePagamentoConfig").value.trim();

    if (!nome) {
        alert("Informe o nome da forma de pagamento.");
        return;
    }

    try {
        const forma = pagamentoEditando || new Parse.Object("FormaPagamento");

        forma.set("nome", nome);

        await forma.save();

        alert("Forma de pagamento salva com sucesso!");

        this.reset();
        pagamentoEditando = null;

        document.getElementById("btnSalvarPagamento").textContent =
            "Adicionar forma de pagamento";

        document.getElementById("btnCancelarPagamento").style.display =
            "none";

        await carregarPagamentosConfig();
        await carregarFormasPagamento();

    } catch (erro) {
        console.error("Erro ao salvar pagamento:", erro);
        alert("Erro ao salvar forma de pagamento.");
    }
});


// EDITAR FORMA DE PAGAMENTO
async function editarPagamento(id) {
    try {
        const consulta = new Parse.Query("FormaPagamento");
        const forma = await consulta.get(id);

        pagamentoEditando = forma;

        document.getElementById("nomePagamentoConfig").value =
            forma.get("nome");

        document.getElementById("btnSalvarPagamento").textContent =
            "Salvar alterações";

        const btnCancelar = document.getElementById("btnCancelarPagamento");

        btnCancelar.hidden = false;
        btnCancelar.style.display = "block";

        document.getElementById("formPagamentoConfig").scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    } catch (erro) {
        console.error("Erro ao editar pagamento:", erro);
        alert("Erro ao carregar forma de pagamento.");
    }
}


// CANCELAR EDIÇÃO DE PAGAMENTO
function cancelarEdicaoPagamento() {
    document.getElementById("formPagamentoConfig").reset();

    pagamentoEditando = null;

    document.getElementById("btnSalvarPagamento").textContent =
        "Adicionar forma de pagamento";

    document.getElementById("btnCancelarPagamento").style.display =
        "none";
}


const nomesMesesInicio = [
    "Janeiro", "Fevereiro", "Março", "Abril",
    "Maio", "Junho", "Julho", "Agosto",
    "Setembro", "Outubro", "Novembro", "Dezembro"
];


// CONFIGURAR FILTRO DE MÊS
function configurarMesInicio() {
    const select = document.getElementById("mes");
    const hoje = new Date();

    select.innerHTML = "";

    for (let i = 0; i < 12; i++) {
        const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);

        const ano = data.getFullYear();
        const mes = String(data.getMonth() + 1).padStart(2, "0");

        const opcao = document.createElement("option");

        opcao.value = `${ano}-${mes}`;
        opcao.textContent = `${nomesMesesInicio[data.getMonth()]} de ${ano}`;

        select.appendChild(opcao);
    }

    select.addEventListener("change", carregarInicio);
}


// CARREGAR DASHBOARD
async function carregarInicio() {
    const mesSelecionado = document.getElementById("mes").value;

    if (!mesSelecionado) return;

    try {
        const [ano, mes] = mesSelecionado.split("-").map(Number);

        const dataInicial = new Date(ano, mes - 1, 1);
        const dataFinal = new Date(ano, mes, 1);

        const consulta = new Parse.Query("Movimentacao");

        consulta.greaterThanOrEqualTo("dataMovimentacao", dataInicial);
        consulta.lessThan("dataMovimentacao", dataFinal);
        consulta.descending("dataMovimentacao");
        consulta.limit(1000);

        const movimentacoes = await consulta.find();

        let entradas = 0;
        let despesas = 0;

        movimentacoes.forEach(movimentacao => {
            const valor = Number(movimentacao.get("valor")) || 0;
            const tipo = (movimentacao.get("tipoMovimentacao") || "").toLowerCase();

            if (tipo === "entrada") {
                entradas += valor;
            } else if (tipo === "despesa") {
                despesas += valor;
            }
        });

        const saldoLiquido = entradas - despesas;

        document.getElementById("inicioEntradas").textContent =
            formatarMoedaInicio(entradas);

        document.getElementById("inicioDespesas").textContent =
            formatarMoedaInicio(despesas);

        document.getElementById("inicioSaldoBruto").textContent =
            formatarMoedaInicio(entradas);

        document.getElementById("inicioSaldoLiquido").textContent =
            formatarMoedaInicio(saldoLiquido);

        atualizarGraficoInicio(entradas, despesas);
        renderizarUltimasMovimentacoes(movimentacoes);

    } catch (erro) {
        console.error("Erro ao carregar tela inicial:", erro);
    }
}

// FORMATAR MOEDA
function formatarMoedaInicio(valor) {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

// ATUALIZAR GRÁFICO
function atualizarGraficoInicio(entradas, despesas) {
    const maiorValor = Math.max(entradas, despesas, 1);

    const alturaEntrada = (entradas / maiorValor) * 100;
    const alturaDespesa = (despesas / maiorValor) * 100;

    document.getElementById("inicioBarraEntrada").style.height =
        alturaEntrada + "%";

    document.getElementById("inicioBarraDespesa").style.height =
        alturaDespesa + "%";

    document.getElementById("inicioValorEntrada").textContent =
        formatarMoedaInicio(entradas);

    document.getElementById("inicioValorDespesa").textContent =
        formatarMoedaInicio(despesas);
}


// ÚLTIMAS MOVIMENTAÇÕES
function renderizarUltimasMovimentacoes(movimentacoes) {
    const lista = document.getElementById("inicioUltimasMovimentacoes");

    const ultimas = movimentacoes.slice(0, 5);

    lista.innerHTML = "";

    if (ultimas.length === 0) {
        lista.innerHTML =
            '<p class="empty">Nenhuma movimentação cadastrada.</p>';
        return;
    }

    ultimas.forEach(movimentacao => {
        const tipo = movimentacao.get("tipoMovimentacao") || "";
        const entrada = tipo.toLowerCase() === "entrada";

        const data = movimentacao.get("dataMovimentacao");

        const dataFormatada = data
            ? data.toLocaleDateString("pt-BR")
            : "-";

        const item = document.createElement("div");

        item.className = "item-configuracao";

        const descricao = document.createElement("strong");
        descricao.textContent = movimentacao.get("descricao") || "Sem descrição";

        const informacoes = document.createElement("span");
        informacoes.textContent = `${dataFormatada} • ${tipo}`;

        const valor = document.createElement("strong");
        valor.textContent = `${entrada ? "+" : "-"} ${formatarMoedaInicio(
            Number(movimentacao.get("valor")) || 0
        )}`;

        valor.style.color = entrada ? "#24834D" : "#C34B4B";

        const detalhes = document.createElement("div");
        detalhes.appendChild(descricao);
        detalhes.appendChild(document.createElement("br"));
        detalhes.appendChild(informacoes);

        item.appendChild(detalhes);
        item.appendChild(valor);

        lista.appendChild(item);
    });
}

async function carregarDadosIniciais() {
    try {
        await carregarCategorias();
        await carregarFormasPagamento();

        await carregarFiltroPagamento();
        await carregarMovimentacoes();

        await carregarCategoriasDespesa();
        await carregarFormasPagamentoDespesa();

        carregarMesesRelatorio();
        configurarMesInicio();

        await carregarInicio();

    } catch (erro) {
        console.error("Erro ao carregar dados iniciais:", erro);
    }
}



