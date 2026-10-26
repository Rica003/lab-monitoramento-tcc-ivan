# Projeto de Monitoramento de Infraestrutura

Este repositório contém a configuração prática do ambiente de monitoramento utilizando contêineres Docker, estruturado para coletar, armazenar e visualizar métricas do sistema e das aplicações em tempo real.

## Especificações do Ambiente

* **IP da Máquina:** `localhost` (ou insira o seu IP local de rede, ex: `192.168.x.x`)
* **Sistema Operacional:** Ubuntu (executado via WSL2 no Windows)
* **Versão do Prometheus:** `latest` (A imagem puxa a versão estável mais recente, atualmente na casa da v2.5x)
* **Versão do Grafana:** `latest` (A imagem puxa a versão estável mais recente, atualmente na casa da v11.x)
* **Motor de Contêineres:** Docker Desktop com Docker Compose

## Serviços Configurados

O ambiente sobe os seguintes serviços interligados:
1. **API (api_deputados_dev):** Aplicação principal em Node.js gerando tráfego e requisições.
2. **Prometheus:** Servidor central de monitoramento (time-series database) que coleta as métricas dos exportadores (porta 9090).
3. **Grafana:** Plataforma de visualização de dados e painéis interativos (porta 3001).
4. **cAdvisor:** Monitora o uso de recursos e o desempenho dos contêineres Docker isoladamente (porta 8080).
5. **Node Exporter:** Coleta métricas de hardware e do sistema operacional hospedeiro, como CPU, memória e disco (porta 9100).
6. **Alpine (Temporário):** Contêiner de suporte utilizado exclusivamente para rodar testes de estresse (stress-ng) e gerar picos de consumo de CPU para validação dos gráficos.

## Comandos Utilizados

**1. Subir a infraestrutura de monitoramento (em segundo plano):**
```bash
docker compose up -d
