// Componente Vue 3 responsável pela navegação lateral do Fluxo+.
const navegacaoVue = Vue.createApp({
    data() {
        return {
            paginaAtual: "inicio",
            itens: [
                { pagina: "inicio", nome: "Início", icone: "▦" },
                { pagina: "entradas", nome: "Entradas", icone: "↗" },
                { pagina: "despesas", nome: "Despesas", icone: "↘" },
                { pagina: "movimentacoes", nome: "Movimentações", icone: "☷" },
                { pagina: "pendentes", nome: "Pagamentos Pendentes", icone: "▤" },
                { pagina: "relatorios", nome: "Relatórios", icone: "▧" },
                { pagina: "configuracoes", nome: "Configurações", icone: "⚙" }
            ]
        };
    },

    methods: {
        selecionarPagina(pagina) {
            this.paginaAtual = pagina;
            window.navegarPara(pagina);
        }
    },

    mounted() {
        window.atualizarNavegacaoVue = (pagina) => {
            this.paginaAtual = pagina;
        };
    }
});

navegacaoVue.mount("#navegacaoVue");
