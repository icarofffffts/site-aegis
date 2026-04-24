## Visão geral

Vou reconstruir o site do **Aegis** como um site profissional de bot de moderação e segurança, com visual **"escudo / segurança premium"** (escuro, azul-marinho + dourado/azul-elétrico, vibe confiável e séria) — mantendo a estética que combina com Discord, mas com arquitetura preparada para mostrar outras plataformas no futuro (Telegram, Slack, etc.) sem reescrever o site.

## Identidade visual

- **Tema**: dark premium — fundos `#0A0F1C` / `#0F172A`, superfícies com leve glassmorphism
- **Cores de marca**: azul profundo + dourado suave (acentos), com glow sutil tipo "escudo ativo"
- **Tipografia**: sans-serif moderna (Inter / Space Grotesk para títulos)
- **Elementos**: ícone de escudo recorrente, badges de "proteção ativa", grades sutis de fundo, micro-animações em hover
- **Tom**: confiável, técnico, "segurança de nível empresarial para sua comunidade"

## Estrutura do site (4 rotas separadas)

### 1. `/` — Home
- **Hero**: nome Aegis + tagline ("Proteção avançada para sua comunidade"), CTA principal "Adicionar ao Discord" + secundário "Ver comandos"
- **Faixa de plataformas**: ícone Discord destacado como "Disponível agora" + slots "Em breve" para Telegram/Slack/outros (deixa claro que é multi-plataforma sem mentir)
- **Stats**: servidores protegidos, usuários, ações de moderação (números reais ou placeholders editáveis)
- **Features principais** (cards): Anti-Raid, Anti-Spam, Auto-Mod inteligente, Logs detalhados, Sistema de warns/mutes, Verificação de membros
- **Como funciona**: 3 passos (Adicionar → Configurar → Proteger)
- **Depoimentos / servidores que usam** (placeholders)
- **CTA final** + footer

### 2. `/comandos` — Comandos
- **Busca** + filtros por categoria (Moderação, Anti-Raid, Configuração, Logs, Utilidade)
- **Lista de comandos** em cards: nome, descrição, sintaxe, permissão necessária, plataforma (badge Discord)
- Estrutura preparada para filtrar por plataforma quando adicionar outras
- Dados em arquivo local (fácil de você editar depois)

### 3. `/precos` — Preços
- **3 planos**: Free, Premium, Enterprise (ou os que você quiser)
- Comparação clara de recursos (anti-raid básico vs avançado, limites de logs, suporte prioritário, etc.)
- Toggle mensal/anual
- FAQ curta sobre cobrança
- Botões CTA por plano (sem integração de pagamento ainda — apenas UI; podemos plugar Stripe/Paddle depois)

### 4. `/suporte` — Suporte
- **FAQ** em accordion (instalação, permissões, problemas comuns, privacidade dos dados)
- **Cards de contato**: link do servidor de suporte no Discord, e-mail, status do bot
- **Formulário de contato** simples (sem backend agora — pode virar funcional depois com Lovable Cloud)
- Links rápidos: documentação, termos, privacidade

## Componentes compartilhados

- **Header sticky** com logo do escudo, navegação (Home, Comandos, Preços, Suporte) e botão "Adicionar ao Discord" sempre visível
- **Footer** com links, redes, copyright e seletor visual de plataformas suportadas
- Componentes reutilizáveis: `FeatureCard`, `CommandCard`, `PricingCard`, `PlatformBadge`, `ShieldIcon`

## Arquitetura técnica (rápido)

- Rotas separadas em `src/routes/` (não single-page com âncoras) — cada uma com seu próprio `<head>` (title, description, og) para SEO
- Tema escuro fixo aplicado por padrão via tokens em `src/styles.css`
- Dados de comandos/planos em arquivos TS locais para você editar facilmente
- Tudo responsivo mobile-first

## O que **não** vou fazer agora (podemos adicionar depois)

- Integração real de pagamento (Stripe/Paddle)
- Dashboard de configuração do bot logado com Discord OAuth
- Backend para o formulário de contato
- Página de status com uptime real

Se quiser qualquer um deles depois, é só pedir.