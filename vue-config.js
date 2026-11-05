// Componente Vue 3 responsável pela preferência de tema do Fluxo+.
const configuracaoVue = Vue.createApp({
    data() {
        return {
            temaEscuro: localStorage.getItem("temaEscuro") === "true"
        };
    },

    mounted() {
        this.aplicarTema();
    },

    watch: {
        temaEscuro() {
            this.aplicarTema();
        }
    },

    methods: {
        aplicarTema() {
            document.body.classList.toggle("tema-escuro", this.temaEscuro);
            localStorage.setItem("temaEscuro", String(this.temaEscuro));
        }
    }
});

configuracaoVue.mount("#configuracaoVue");
