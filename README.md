Documentação do Projeto Blog Unicesumar
Visão Geral
O projeto Blog Unicesumar é uma aplicação web construída com HTML e EJS, utilizando o framework Bootstrap para estilização. Ele é composto de páginas para gerenciar categorias e usuários, incluindo funcionalidades de login, cadastro, edição, e exclusão de dados. A aplicação segue uma estrutura de CRUD (Create, Read, Update, Delete) para manipulação de informações.
Estrutura das Páginas e Funcionalidades
1. Página Adicionar Categoria
•	URL: /categories/form
•	Descrição: Página para adicionar novas categorias ao sistema.
•	Funcionalidade: Contém um formulário que envia uma requisição POST para /categories/save, onde o nome da categoria é capturado e enviado ao servidor.
•	Componentes Principais:
o	Input de texto para o nome da categoria.
o	Botão "Adicionar" para salvar a nova categoria.
o	Link para a página de lista de categorias.
2. Página Lista de Categorias
•	URL: /categories
•	Descrição: Página que exibe a lista de categorias cadastradas.
•	Funcionalidade: Mostra todas as categorias com as informações de ID, nome, e data de criação. Inclui ações de edição e exclusão de categorias.
•	Componentes Principais:
o	Tabela para listar as categorias.
o	Links para editar e excluir cada categoria.
o	Link para adicionar uma nova categoria.
3. Página Últimos Posts do Blog
•	URL: /
•	Descrição: Página principal do blog, que exibe uma lista de posts recentes.
•	Funcionalidade: Mostra cards de posts com título, descrição e link "Leia mais".
•	Componentes Principais:
o	Cards com título, descrição, e botão "Leia mais" (o conteúdo dos cards é gerado dinamicamente com EJS).
4. Página Login
•	URL: /login
•	Descrição: Página de autenticação para usuários.
•	Funcionalidade: Permite que o usuário insira seu e-mail e senha para fazer login. Exibe mensagens de erro caso o login falhe.
•	Componentes Principais:
o	Campos de e-mail e senha.
o	Link para redefinir senha e criar uma nova conta.
o	Mensagem de erro exibida quando o login falha.
5. Página Cadastro de Usuário
•	URL: /users/add
•	Descrição: Página para registrar novos usuários.
•	Funcionalidade: Permite que o usuário insira nome, e-mail, senha, papel e status de ativo.
•	Componentes Principais:
o	Campos de nome, e-mail, senha, confirmação de senha, e seleção do papel (Usuário/Administrador).
o	Checkbox para definir o status de ativo do usuário.
o	Mensagem de erro para validação de dados.
6. Página Editar Usuário
•	URL: /users/edit/:id
•	Descrição: Página para editar informações de um usuário existente.
•	Funcionalidade: Permite editar nome, e-mail, senha (opcional), papel e status de ativo. Inclui uma verificação de senha antiga para segurança.
•	Componentes Principais:
o	Campos para edição de nome, e-mail, papel, e status.
o	Verificação da senha antiga para confirmação das alterações.
o	Mensagem de erro caso a edição falhe.
7. Página Lista de Usuários
•	URL: /users
•	Descrição: Página que exibe todos os usuários cadastrados no sistema.
•	Funcionalidade: Lista de usuários com informações de ID, nome, e-mail, papel, e data de cadastro. Oferece opções para editar ou excluir cada usuário.
•	Componentes Principais:
o	Tabela com informações dos usuários.
o	Ações de edição e exclusão.
o	Mensagens de erro e sucesso para operações de exclusão.
Estilização
A aplicação utiliza o Bootstrap 5.3 para todos os componentes e layout, garantindo responsividade e design moderno.
Considerações Finais
A estrutura modularizada do código permite fácil manutenção e expansão das funcionalidades. Para o próximo passo, recomenda-se a inclusão de testes de funcionalidade e validação de dados no lado do servidor para aumentar a segurança e confiabilidade do sistema.