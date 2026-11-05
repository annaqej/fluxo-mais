# Fluxo+

Sistema web desenvolvido para auxiliar no controle financeiro da Oficina Auto Elétrico Denicar, localizada em São José do Rio Preto, SP.

O projeto busca substituir os registros financeiros feitos manualmente em caderno, facilitando a organização e a consulta das movimentações do estabelecimento.

## Funcionalidades

- Autenticação de usuários.
- Cadastro e consulta de entradas e despesas.
- Gerenciamento de categorias e formas de pagamento.
- Controle de pagamentos parcelados.
- Consulta e filtragem de movimentações financeiras.
- Visualização de indicadores e gráficos financeiros.
- Consultas e relatórios.
- Alternância entre os temas claro e escuro.

## Tecnologias utilizadas

- **HTML5:** estrutura das páginas.
- **CSS3:** estilização da interface.
- **JavaScript:** funcionalidades, validações, filtros e comunicação com o backend.
- **Vue.js 3:** gerenciamento reativo da navegação lateral e da opção de tema na interface de configurações.
- **Back4App / Parse SDK:** armazenamento e gerenciamento dos dados.
- **Git e GitHub:** versionamento e organização do código.
- **Netlify:** publicação da aplicação web.

O projeto mantém as funcionalidades existentes em JavaScript e utiliza Vue.js 3 para controlar a navegação lateral e a preferência de tema da interface. As demais funcionalidades continuam utilizando o JavaScript original.

## Acesso à aplicação

A aplicação está publicada na Netlify e pode ser acessada pelo navegador:

https://silly-gumdrop-24949b.netlify.app/

Não é necessário instalar programas para utilizar a versão publicada.

## Como utilizar

1. Acesse o endereço da aplicação pelo navegador.
2. Entre no sistema utilizando suas credenciais.
3. Utilize o menu para registrar entradas e despesas.
4. Consulte as movimentações e utilize os filtros disponíveis.
5. Acompanhe parcelas, indicadores financeiros e relatórios.
6. Acesse as configurações para alternar entre os temas claro e escuro.

## Execução e desenvolvimento

O projeto é composto pelos arquivos `index.html`, `style.css`, `script.js`, `vue-config.js` e `vue-navegacao.js`. As bibliotecas Parse SDK, SheetJS e Vue.js 3 são carregadas por CDN no arquivo HTML.

Para desenvolver ou testar alterações, abra a pasta do projeto em um editor de código e utilize um servidor web local. As funcionalidades que dependem dos dados exigem uma conexão válida com o Back4App e as respectivas configurações de acesso.

## Objetivo do projeto

O Fluxo+ foi desenvolvido como parte da disciplina Projeto Integrador de Tecnologia da Informação II, do curso Superior de Tecnologia da Informação da UFMS Digital, no semestre 2026.2.

## Autoria

**Autora:** Anna Júlia Sentoma Caires Leandro  
**Instituição:** Universidade Federal de Mato Grosso do Sul (UFMS)  
**Projeto de Extensão:** Programa de Extensão UFMS Digital
