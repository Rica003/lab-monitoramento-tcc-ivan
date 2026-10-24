# 🏛️ Manual de Integração e Documentação da API: Tá Fazendo O Que, Deputado?

Bem-vindo à documentação oficial da API do projeto **Tá Fazendo O Que, Deputado?**. Este guia foi feito especialmente para ajudar desenvolvedores frontend e outros membros do time a consumir e interagir com nossos endpoints de forma simples, rápida e direta.

Nossa API é desenvolvida utilizando **NestJS**, **Prisma ORM**, **MongoDB** e integra-se diretamente com a **API de Dados Abertos da Câmara dos Deputados**.

---

## 🚀 Guia de Início Rápido

* **Base URL (Local):** `http://localhost:3000/api`
* **Swagger (Documentação Interativa):** `http://localhost:3000/docs`
* **Prefixo Global:** `/api` (todas as rotas listadas abaixo devem ser precedidas por `/api`)

---

## 🏗️ Os 3 Paradigmas de Rotas da API

Para consumir a API de forma eficiente, é fundamental entender os três tipos de rotas disponíveis no sistema:

### 1. Rotas do Banco Interno (`/api/[dominio]`)
> **💡 Uso recomendado para a maior parte do aplicativo.**
* **Como funciona:** Busca os dados diretamente do nosso banco **MongoDB** local.
* **Vantagens:** Extremamente rápida (latência mínima) e livre de limites de requisição (*rate limiting*) da API externa.
* **Modelo de Dados:** Estruturado e enriquecido, com relacionamentos locais mapeados no banco.

### 2. Rotas do Proxy da Câmara (`/api/[dominio]/camara`)
> **🔌 Uso recomendado quando dados em tempo real estrito são necessários.**
* **Como funciona:** O NestJS atua como um proxy direto. Ele recebe sua requisição e faz uma chamada HTTP para a API Oficial de Dados Abertos da Câmara.
* **Vantagens:** Garante dados 100% atualizados até o último segundo.
* **Desvantagens:** Mais lenta (depende da resposta do servidor do governo) e sujeita a indisponibilidades externas.

### 3. Rotas de Sincronização (`/api/[dominio]/sync`)
> **🔄 Uso administrativo ou sob demanda.**
* **Como funciona:** Dispara um processo interno para buscar dados da Câmara, limpá-los e enriquecê-los usando nossos DTOs, e salvá-los/atualizá-los (*upsert*) no MongoDB.

---

## 🛣️ Catálogo Completo de Endpoints

Abaixo estão detalhados os endpoints por domínio.

### 👥 1. Deputados (`/api/deputados`)

| Método | Endpoint | Origem | Descrição |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/deputados` | Interno | Retorna todos os deputados salvos no banco local. |
| `GET` | `/api/deputados/:id` | Interno | Retorna os detalhes de um deputado específico no banco local filtrado pelo seu ID oficial da Câmara (`idCamara`). |
| `GET` | `/api/deputados/:id/despesas` | Misto | Retorna despesas locais. **Nota:** Este endpoint dispara uma sincronização em background para o ano informado e retorna os dados atualizados. Aceita `ano` e `mes` via query params. |
| `GET` | `/api/deputados/camara` | Proxy | Lista deputados diretamente da API Oficial da Câmara. Aceita parâmetros de busca da API da Câmara (ex. `nome`, `siglaPartido`, `siglaUf`). |
| `GET` | `/api/deputados/camara/:id` | Proxy | Detalhes de um deputado diretamente da API da Câmara. |
| `GET` | `/api/deputados/camara/:id/:recurso`| Proxy | Sub-recursos dinâmicos suportados: `despesas`, `discursos`, `eventos`, `frentes`, `historico`, `mandatosExternos`, `ocupacoes`, `orgaos`, `profissoes`. |
| `POST` | `/api/deputados/sync` | Sync | Sincroniza todos os deputados ativos e seus detalhes para o MongoDB. |
| `POST` | `/api/deputados/sync-discursos` | Sync | Sincroniza discursos de todos os deputados (dos últimos 850 dias) para o banco local. |

#### Exemplo de Requisição de Despesas
```http
GET http://localhost:3000/api/deputados/204536/despesas?ano=2026&mes=5
```
**Resposta (JSON):**
```json
[
  {
    "id": "65bcf1e2a0b12c4d9e8f5670",
    "idCamaraDeputado": 204536,
    "ano": 2026,
    "mes": 5,
    "tipoDespesa": "PASSAGENS AÉREAS",
    "tipoDocumento": "Nota Fiscal Eletrônica",
    "codTipoDocumento": 4,
    "dataDocumento": "2026-05-12",
    "numDocumento": "12345",
    "valorDocumento": 1500.50,
    "urlDocumento": "http://documentos.camara.leg.br/doc/12345.pdf",
    "nomeFornecedor": "LATAM AIRLINES S/A",
    "cnpjCpfFornecedor": "02012862000160",
    "valorLiquido": 1500.50,
    "valorGlosa": 0.0,
    "numRessarcimento": "999",
    "codLote": 18239,
    "parcela": 0
  }
]
```

---

### 🗳️ 2. Votações (`/api/votacoes`)

Mapeia as votações plenárias e em comissões realizadas na Câmara.

| Método | Endpoint | Origem | Descrição |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/votacoes` | Interno | Lista todas as votações persistidas no banco. |
| `GET` | `/api/votacoes/:id` | Interno | Detalhes de uma votação específica no banco local usando seu ID de Votação (ex: `2200-1`). |
| `GET` | `/api/votacoes/:id/votos` | Misto | Lista e sincroniza em background os votos individuais de cada deputado nesta votação. |
| `GET` | `/api/votacoes/:id/orientacoes` | Misto | Lista e sincroniza em background as orientações de partidos/blocos para esta votação. |
| `GET` | `/api/votacoes/camara` | Proxy | Lista votações diretamente da API Oficial da Câmara. |
| `GET` | `/api/votacoes/camara/:id/:recurso`| Proxy | Busca sub-recursos na API externa. Recursos permitidos: `votos`, `orientacoes`. |
| `POST` | `/api/votacoes/sync` | Sync | Sincroniza as votações mais recentes da Câmara para o banco local. |

---

### 🗃️ 3. Outros Domínios Centrais

Todos os domínios abaixo seguem o padrão padronizado de **Banco Interno**, **Proxy** e **Sincronização Atômica**:

| Domínio | Endpoint Base | Método GET (Interno) | Método GET ID (Interno) | Método GET (Proxy) | Método POST (Sync) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Partidos** | `/api/partidos` | `/api/partidos` | `/api/partidos/:id` | `/api/partidos/camara` | `/api/partidos/sync` |
| **Legislaturas**| `/api/legislaturas` | `/api/legislaturas` | `/api/legislaturas/:id` | `/api/legislaturas/camara` | `/api/legislaturas/sync` |
| **Proposições**| `/api/proposicoes` | `/api/proposicoes` | `/api/proposicoes/:id` | `/api/proposicoes/camara` | `/api/proposicoes/sync` |
| **Órgãos** | `/api/orgaos` | `/api/orgaos` | `/api/orgaos/:id` | `/api/orgaos/camara` | `/api/orgaos/sync` |
| **Blocos** | `/api/blocos` | `/api/blocos` | `/api/blocos/:id` | `/api/blocos/camara` | `/api/blocos/sync` |
| **Frentes** | `/api/frentes` | `/api/frentes` | `/api/frentes/:id` | `/api/frentes/camara` | `/api/frentes/sync` |
| **Grupos** | `/api/grupos` | `/api/grupos` | `/api/grupos/:id` | `/api/grupos/camara` | `/api/grupos/sync` |
| **Eventos** | `/api/eventos` | `/api/eventos` | `/api/eventos/:id` | `/api/eventos/camara` | `/api/eventos/sync` |

> *Nota:* Algumas rotas de proxy também aceitam sub-recursos (ex: `/api/eventos/camara/:id/deputados`).

---

### 🗺️ 4. Tabelas de Referência (`/api/referencias`)

As tabelas de referência trazem domínios estáticos e dinâmicos (siglas de estados, tipos de proposições, codificação de órgãos, etc.) usados para alimentar filtros e formulários no front-end.

* **Listar referências locais:** `GET /api/referencias`
* **Buscar tabela de referência local:** `GET /api/referencias/*path` (ex: `/api/referencias/deputados/siglaUf`)
* **Buscar referência diretamente da Câmara:** `GET /api/referencias/camara/*path`
* **Sincronizar uma tabela específica:** `POST /api/referencias/camara/*path/sync`

#### Exemplo de chamada:
```http
GET http://localhost:3000/api/referencias/deputados/siglaUf
```
**Resposta (JSON):**
```json
{
  "id": "65bcf1e2a0b12c4d9e8f56ef",
  "tipo": "deputados/siglaUf",
  "dados": [
    { "sigla": "AC", "nome": "Acre" },
    { "sigla": "AL", "nome": "Alagoas" },
    { "sigla": "SP", "nome": "São Paulo" }
  ]
}
```

---

### ⚙️ 5. Sincronização Global (`/api/sync`)

* **Forçar sincronização de tudo:** `POST /api/sync/force-all`
  * **Descrição:** Inicia uma rotina em segundo plano que sincroniza sequencialmente todos os domínios (Legislaturas, Partidos, Órgãos, Blocos, Frentes, Grupos, Deputados, Proposições, Votações, Eventos, Despesas, Votos e Orientações).
  * **Retorno:** Retorna imediatamente um JSON de sucesso avisando que o processo roda em background para não travar a requisição HTTP.

---

## 🕰️ Sincronizações Automáticas (Cron Jobs)

O sistema possui duas rotinas de sincronização automatizadas rodando no servidor backend:

1. **Sincronização Geral Diária (`0 3 * * *`):** Executa todas as madrugadas às **03:00 AM**. Sincroniza todas as entidades base, despesas do ano corrente, votos e orientações recentes.
2. **Sincronização de Discursos Semanal (`0 0 22 * * 0`):** Executa todos os **domingos às 22:00**. Varre os discursos de todos os deputados dos últimos 850 dias e os salva no MongoDB.

---

## 🗄️ Modelos de Dados (Esquema do Prisma)

Para te ajudar a tipar os retornos no front-end, aqui estão as estruturas dos principais modelos salvos no nosso banco:

### Modelo `Deputado`
```typescript
interface Deputado {
  id: string;                  // ID Interno do MongoDB
  idCamara: number;            // ID Oficial da Câmara (usado no endpoint GET /:id)
  uri: string;                 // URL do recurso oficial na API da Câmara
  nome: string;                // Nome parlamentar
  siglaPartido: string;
  uriPartido: string;
  siglaUf: string;
  idLegislatura: number;
  urlFoto: string;
  email?: string;
  condicaoEleitoral?: string;
  situacao?: string;
  nomeCivil?: string;
  cpf?: string;
  sexo?: string;
  urlWebsite?: string;
  redeSocial: string[];
  dataNascimento?: string;
  dataFalecimento?: string;
  ufNascimento?: string;
  municipioNascimento?: string;
  escolaridade?: string;
  ultimoStatus?: any;          // Objeto de status dinâmico
}
```

### Modelo `Votacao`
```typescript
interface Votacao {
  id: string;                  // ID Interno do MongoDB
  idCamara: string;            // ID de votação oficial (ex. "2200-1")
  uri: string;
  data?: string;
  dataHoraRegistro?: string;
  siglaOrgao?: string;
  uriOrgao?: string;
  uriEvento?: string;
  proposicaoObjeto?: string;
  uriProposicaoObjeto?: string;
  descricao?: string;
  aprovacao?: number;          // 1 para Sim, 0 para Não, etc.
}
```

Se tiver qualquer dúvida ou precisar de um novo endpoint para o front-end, fale com a equipe de backend ou abra uma issue!
