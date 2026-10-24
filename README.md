# Ta fazendo o que, deputado?!

## Descrição do projeto
Este projeto tem como objetivo facilitar o acesso à informação sobre política para pessoas que estão dentro de um indicíe de baixa educação!

## Stacks do projeto
Este projeto utiliza o framework **Nest.js** e **Prisma** como ORM para mapeamento do banco de dados; utilizamos um banco de dados não relacional (**MongoDB**) como principal fonte de persistência de dados. 

**Docker** compõe a infraestrutura base do projeto para facilitar o desenvolvimento entre os colegas e, ajudar na hora de automatizar tarefas, realizar deploys e etc...

## Como inicializar o projeto
Para inicilizar o projeto é preciso ter instalado:
- Node e NPM (LTS)
- Docker 

Após clonar o repositório com git ou outra ferramenta de controle de versão, certifique-se de que o arquivo _docker-compose.yml_ está presente e então rode:

> ### Subir o contêiner
> docker compose up -d
>
> ### Validar o contêiner
> docker ps
>

Até o dia 24/03/2026, _apenas_ o MongoDB está declarado no arquivo de configuração do *Docker*!


## 📖 Documentação da API

Todos os endpoints da nossa API (incluindo rotas locais do banco, proxies de chamadas da Câmara de Deputados e endpoints de sincronização) estão detalhados em [API-DOCUMENTATION.md](file:///c:/Users/Vin%C3%ADcius%20Ritz/Desktop/Vini/6%20-%20Confidencial/TaFazendoOQueDeputadoTCC/Backend/API-DOCUMENTATION.md).

Para acessar a documentação interativa com o Swagger enquanto o backend estiver rodando localmente:
- Aceda a `http://localhost:3000/docs`

## Estrutura de diretórios
```text
src/
├── app.module.ts              # Módulo raiz que integra todos os outros módulos
├── main.ts                    # Ponto de entrada da aplicação (porta, Swagger, prefixo /api)
│
├── dtos/                      # Data Transfer Objects
│   └── deputado.dto.ts        # Define o formato de entrada/saída de dados
│
├── controllers/
│   └── deputado/
│       └── deputado.controller.ts
│
├── services/
│   ├── prisma.service.ts      # Serviço global para gerenciar conexão com Prisma (MongoDB)
│   │
│   └── dados-abertos/         # Abstração de serviços (internos/externos)
│       ├── dadosabertos.service.ts       # Interface
│       └── impl-dadosabertos.service.ts  # Implementação da interface
│
├── models/                    # Representação das entidades no banco
│   └── deputado.model.ts
│
├── repositories/             # Interfaces e implementações de repositórios
│   └── deputado/
│       ├── deputado.repository.ts        # Interface
│       └── impl-deputado.repository.ts   # Implementação
│
├── configs/                  # Configurações da aplicação
│   └── modules/
│       ├── deputado/
│       │   └── deputado.module.ts
│       │
│       └── prisma/
│           └── prisma.config.ts
```
