# Front API Unifor

Frontend React + Vite para login do Agente Universitário Unifor usado pelo fluxo do WhatsApp.

Na Vercel, o navegador chama endpoints HTTPS do próprio front (`/api/...`). Esses endpoints serverless repassam a requisição para a API HTTP temporária configurada em `API_BASE_URL`, evitando mixed content.

## Fluxo

1. A Lambda envia um link como `/login-whatsapp?phone=558582136179`.
2. O usuário informa matrícula e senha.
3. O front chama `POST /api/auth/login`.
4. Com o `access_token`, se existir `phone` na URL, o front chama `POST /api/whatsapp/session`.
5. Depois do sucesso, o usuário volta para o WhatsApp do bot.

O frontend não acessa DynamoDB e não deve receber chaves AWS. Toda persistência fica na API backend.

## Rodar localmente

```bash
npm install
npm run dev
```

Crie um arquivo `.env` local baseado no `.env.example`:

```env
VITE_WHATSAPP_BOT_NUMBER=27840776544
API_BASE_URL=http://3.235.138.42:8000
```

Para usar `npm run dev` chamando a API diretamente em desenvolvimento, você também pode adicionar `VITE_API_BASE_URL=http://localhost:8000`. Em produção, o build usa sempre o proxy `/api`.

Para testar com telefone:

```text
http://localhost:5173/login-whatsapp?phone=558582136179
```

## Build

```bash
npm run build
```

## Publicar na Vercel

Configure o projeto como Vite/React e adicione as variaveis em:

```text
Vercel -> Project -> Settings -> Environment Variables
```

Variáveis obrigatórias:

```env
API_BASE_URL=http://IP_ATUAL_DA_API:8000
VITE_WHATSAPP_BOT_NUMBER=NUMERO_DO_BOT
```

Quando a API estiver em ECS com IP variável, atualize `API_BASE_URL` na Vercel ou use um domínio fixo/Load Balancer.
