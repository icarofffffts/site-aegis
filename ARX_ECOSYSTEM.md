# ARX Ecosystem: Infraestrutura Técnica e Referência de APIs

## Contexto Geral

O ecossistema ARX é uma rede integrada de plataformas, bots e serviços especializados em segurança, automação e gestão de comunidades. Este documento centraliza o mapeamento da infraestrutura técnica, fluxos de implantação e especificações de integração para garantir a consistência entre os múltiplos projetos mantidos pelos desenvolvedores ARX.

O objetivo é fornecer um guia de referência para consumo de APIs existentes, manutenção de serviços e padronização de processos operacionais no ambiente de produção (VPS).

## Componentes do Sistema e Infraestrutura

A arquitetura baseia-se em uma separação clara entre camadas de interface e lógica de serviço:

*   **Aplicações Frontend:** Desenvolvidas predominantemente com Next.js (Aegis Ecosystem) e Vite/React (Shield, Status Hub, SiteARX). Utilizam TailwindCSS para estilização e Framer Motion para animações.
*   **Serviços de Backend:** Microserviços em Node.js, incluindo o **AegisBot** (Discord moderation) e o **Shield Bot**.
*   **Integrações Externas:** Utilização intensiva de Supabase para persistência de dados e autenticação.
*   **Proxy Reverso (Nginx):** Atua como o ponto de entrada único (`arxdevs.xyz`, `aegis.arxdevs.xyz`, `api.arxsolutions.cloud`), gerenciando terminação SSL via Let's Encrypt e direcionamento de tráfego para portas internas.
*   **Gerenciamento de Processos:** Utilização do **PM2** para manter a execução contínua dos serviços Node.js e gerenciamento de logs.

## Fluxo de Implantação e Execução

O ciclo de vida dos serviços segue um padrão de estabilidade rigoroso:

1.  **Build Process:** As compilações são realizadas localmente para evitar sobrecarga de recursos no servidor de produção. Os artefatos (`dist/` ou `.next/`) são compactados para transferência.
2.  **Sincronização:** Utilização de scripts PowerShell (`deploy.ps1`) que realizam o backup do estado anterior no VPS, sincronizam os novos arquivos via SFTP/Rsync e extraem os pacotes.
3.  **Runtime:** 
    *   Serviços Next.js rodam em modo SSR (Server-Side Rendering) via `npm run start`.
    *   Aplicações estáticas são servidas diretamente pelo Nginx ou através de um entrypoint Node simples (Preview).
    *   Bots Discord utilizam sharding para escalabilidade de conexões.

## Referência de APIs

### API Overview

As APIs no ecossistema ARX são organizadas por subdomínios específicos e autenticadas via headers `Authorization` ou chaves de serviço do Supabase. A maioria dos serviços expõe endpoints de saúde e integração de mensagens.

### Exemplo de Endpoints

#### Verificação de Saúde (Standard)
*   **Endpoint:** `GET /api/health-check`
*   **Descrição:** Endpoint padronizado para monitoramento em tempo real pelo Status Hub.

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "uptime": 86400,
  "services": {
    "database": "connected",
    "redis": "connected"
  }
}
```

#### Evolution API (WhatsApp)
*   **Endpoint:** `POST /instance/create`
*   **Descrição:** Criação de nova instância de automação de mensagens.
*   **Base URL:** `https://api.arxsolutions.cloud`

**Request:**
```json
{
  "instanceName": "arx_dev_instance",
  "token": "optional_token_secret",
  "qrcode": true
}
```

## Regras Operacionais de Produção

Para manter a integridade do ecossistema, devem ser seguidas as seguintes regras:

1.  **Escopo Estrito:** Modificar apenas os serviços explicitamente designados.
2.  **Isolamento de Impacto:** Evitar alterações em dependências globais ou configurações de rede que afetem sistemas não relacionados (ex: Casa Amarela).
3.  **Gestão de Reinicialização:** Não realizar reinicializações globais de processos PM2; utilizar `pm2 reload <app_name>` para zero-downtime quando aplicável.
4.  **Reversibilidade:** Garantir que backups de arquivos de configuração e ambientes (`.env`) sejam realizados antes de qualquer modificação.

## Procedimentos de Verificação

A validação de alterações deve seguir estes passos:

*   **Verificação de Portas:** Confirmar se o serviço está escutando na porta correta (ex: `netstat -tulnp`).
*   **Resposta HTTP:** Validar status `200 OK` via `curl -I <URL>`.
*   **Logs de Erro:** Monitorar a saída em tempo real com `pm2 logs <app_name>`.
*   **Service Health:** Verificar o painel do Status Hub para confirmar a propagação da integridade.

## Notas e Restrições

*   **Node.js:** Versão mínima recomendada v18.x.
*   **Ambiente:** Variáveis de ambiente devem ser configuradas exclusivamente via arquivos `.env.production.local` protegidos.
*   **SSR vs Static:** Atenção às variáveis de ambiente de build-time em projetos Next.js, que exigem rebuild completo para serem atualizadas.
*   **Riscos de Sincronização:** Nunca sincronizar a pasta `node_modules` local para o VPS; as dependências devem ser tratadas de forma isolada ou via camadas pré-compiladas.
