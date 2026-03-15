# 🚗 Impacta Motors 
**Sistema de Gestão para Concessionária**

## 📖 Apresentação do Projeto

O **Impacta Motors** é um sistema web desenvolvido com o objetivo de auxiliar na gestão de concessionárias de veículos, permitindo o controle de estoque, cadastro de clientes, gerenciamento de vendedores e registro de vendas.

Este projeto foi desenvolvido como requisito para apresentação à disciplina de **Software Product: Analysis, Specification, Project & Implementation**, aplicando conceitos estudados ao longo do curso. 

O sistema foi construído seguindo uma arquitetura **cliente-servidor**, utilizando tecnologias modernas para desenvolvimento web e banco de dados relacional.

---

# 🎯 Objetivos do Projeto

O projeto tem como principais objetivos:

* Desenvolver um sistema de gestão para concessionárias
* Aplicar conceitos de engenharia de software
* Utilizar arquitetura cliente-servidor
* Implementar operações CRUD (Create, Read, Update, Delete)
* Integrar frontend, backend e banco de dados
* Demonstrar organização e gestão de projeto utilizando GitHub

---

# ⚙️ Tecnologias Utilizadas

O sistema foi desenvolvido utilizando as seguintes tecnologias:

### Backend

* Node.js
* Express.js

### Frontend

* HTML5
* CSS3
* JavaScript

### Banco de Dados

* PostgreSQL

### Controle de Versão

* Git
* GitHub

---

# 🧩 Funcionalidades do Sistema

O sistema possui as seguintes funcionalidades principais:

### 🚗 Gestão de Veículos

* Cadastro de veículos
* Atualização de informações
* Remoção de veículos
* Consulta de estoque

### 👥 Gestão de Clientes

* Cadastro de clientes
* Atualização de dados
* Consulta de clientes cadastrados

### 👨‍💼 Gestão de Vendedores

* Cadastro de vendedores
* Controle de equipe de vendas

### 💰 Registro de Vendas

* Associação entre cliente, vendedor e veículo
* Registro de transações
* Controle de vendas realizadas

### 📊 Relatórios

* Consulta de vendas realizadas
* Informações para apoio à tomada de decisão

---

# 🏗 Arquitetura do Sistema

O sistema segue uma arquitetura **Cliente-Servidor**, onde:

* **Frontend**: responsável pela interface com o usuário
* **Backend**: responsável pelas regras de negócio e comunicação com o banco
* **Banco de Dados**: responsável pelo armazenamento das informações

Fluxo de funcionamento:

Frontend → API (Backend) → Banco de Dados

---

# 🚀 Como Executar o Projeto

## 1️⃣ Clonar o repositório

```bash
git clone https://github.com/Anderson-Meira/Impacta-Motors.git
```

---

## 2️⃣ Instalar as dependências

Certifique-se de possuir instalado em sua máquina:

* Node.js
* PostgreSQL

---

## 3️⃣ Criar o banco de dados

Execute o script SQL presente no arquivo:

```
database.sql
```

Esse script irá criar as tabelas necessárias para funcionamento do sistema.

---

## 4️⃣ Iniciar o servidor

Acesse a pasta do backend e execute:

```bash
node server.js
```

O servidor será iniciado e a aplicação estará pronta para uso.

---

# 📁 Estrutura do Projeto

A organização das pastas do projeto está definida da seguinte forma:

```
impacta-motors
│
├── backend
│   ├── server.js
│   ├── routes
│   ├── controllers
│   └── database
│
├── frontend
│   ├── index.html
│   ├── style.css
│   └── script.js
│
└── database.sql
```

---

# 📊 Planejamento do Projeto

O planejamento e acompanhamento das tarefas do projeto foram realizados utilizando o **GitHub Projects**.

Acesse o board de planejamento no link abaixo:

https://github.com/users/Anderson-Meira/projects/2

---

# 📚 Conceitos Aplicados

Durante o desenvolvimento deste projeto foram aplicados conceitos importantes da Engenharia de Software:

* Levantamento de requisitos
* Modelagem de banco de dados relacional
* Arquitetura cliente-servidor
* Desenvolvimento de API REST
* Controle de versão com Git
* Gestão de tarefas utilizando GitHub Projects

---

# 👨‍💻 Autor

Desenvolvido por:

**Anderson Rocha Meira**

Projeto acadêmico desenvolvido para fins educacionais.
