import { createFileRoute } from '@tanstack/react-router'
import fs from 'node:fs'
import path from 'node:path'

export const Route = createFileRoute('/api/bot-status')({
  server: {
    handlers: {
      GET: async () => {
        // Busca o heartbeat gerado pelo bot
        const heartbeatPath = path.join(process.cwd(), '..', 'AegisBot', 'src', 'database', 'data', 'heartbeat.json')
        
        try {
          if (fs.existsSync(heartbeatPath)) {
            const data = JSON.parse(fs.readFileSync(heartbeatPath, 'utf-8'))
            const lastUpdate = new Date(data.timestamp).getTime()
            const now = Date.now()
            
            // Se o heartbeat for mais antigo que 90 segundos, o bot é considerado offline
            if (now - lastUpdate > 90000) {
              return new Response(JSON.stringify({ 
                status: 'offline', 
                reason: 'Heartbeat expirado - Processo possivelmente travado ou parado.',
                lastSeen: data.timestamp,
                service: 'AegisBot'
              }), { 
                status: 503,
                headers: { 'Content-Type': 'application/json' } 
              })
            }
            
            return new Response(JSON.stringify({
              ...data,
              checkTime: new Date().toISOString()
            }), {
              headers: { 'Content-Type': 'application/json' }
            })
          }
        } catch (err) {
          console.error('[HealthCheck] Error reading heartbeat:', err)
        }

        // Caso o arquivo não exista, o bot nunca foi iniciado ou o path está incorreto
        return new Response(JSON.stringify({ 
          status: 'offline', 
          reason: 'Heartbeat não encontrado. O bot pode nunca ter sido iniciado neste ambiente.',
          service: 'AegisBot' 
        }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        })
      },
    }
  },
})
