import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/bot-status')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const botHost = process.env.BOT_CONTAINER_HOST || 'aegis-bot';
          const botPort = process.env.BOT_CONTAINER_PORT || '3000';
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          const response = await fetch('http://' + botHost + ':' + botPort + '/status', {
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error('HTTP error! status: ' + response.status);
          }

          const data = await response.json();

          if (data.online) {
            return new Response(JSON.stringify({
              status: 'operational',
              uptime: data.uptime,
              service: 'AegisBot',
              checkTime: new Date().toISOString()
            }), {
              headers: { 'Content-Type': 'application/json' }
            });
          } else {
             return new Response(JSON.stringify({ 
              status: 'offline', 
              reason: 'Bot reportou offline.',
              service: 'AegisBot'
            }), { 
              status: 503,
              headers: { 'Content-Type': 'application/json' } 
            });
          }
          
        } catch (err: any) {
          console.error('[HealthCheck] Error checking bot status:', err.message);
          return new Response(JSON.stringify({ 
            status: 'offline', 
            reason: 'Falha ao conectar no micro-servidor do bot: ' + err.message,
            service: 'AegisBot' 
          }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      },
    }
  },
})
