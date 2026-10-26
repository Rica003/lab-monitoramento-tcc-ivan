# Projeto de Monitoramento de Infraestrutura

Este repositório contém a configuração prática do ambiente de monitoramento utilizando contêineres Docker, estruturado para coletar, armazenar e visualizar métricas do sistema e das aplicações em tempo real.

## Especificações do Ambiente

* **IP da Máquina:** `localhost`
* **Sistema Operacional:** Ubuntu (executado via WSL2 no Windows)
* **Versão do Prometheus:** `latest` (A imagem puxa a versão estável mais recente, atualmente é a v3.15.1)
* **Versão do Grafana:** `latest` (A imagem puxa a versão estável mais recente, atualmente é a v13.2.4)
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
docker compose -f docker-compose.dev.yml up

**2. Teste prático de carga (Geração de pico de CPU para o Grafana/cAdvisor):
O comando abaixo baixa uma imagem leve do Alpine, instala o pacote stress-ng e força o uso de 13 núcleos de CPU durante 60 segundos. O contêiner se auto-destrói (--rm) ao finalizar.**
```bash
docker run --rm alpine sh -c "apk add --no-cache stress-ng && stress-ng --cpu 13 --timeout 60s"
