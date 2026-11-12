# Raio-X Igor · Multiplix

Resumo visual da reunião de diagnóstico de 11/11/2026, com acesso por senha validada no servidor. A senha do cliente é comunicada separadamente e não deve entrar no repositório.

## Prévia local com login

1. Copie `.env.example` para `.env.local`.
2. Defina `RAIOX_PASSWORD` com a senha combinada e substitua `RAIOX_SESSION_SECRET` por uma chave aleatória longa (32 caracteres ou mais).
3. Execute `npm install` e `npm run dev`.
4. Abra `http://127.0.0.1:4184/`.

O servidor local usa a mesma validação e o mesmo cookie assinado usados na Vercel. Abrir `index.html` diretamente ou usar um servidor estático ignora a camada de acesso; compartilhe apenas a versão hospedada com o proxy ativo.

## Publicar na Vercel

Envie esta pasta como raiz de um repositório. Na configuração do projeto da Vercel, adicione as variáveis de ambiente `RAIOX_PASSWORD` = senha combinada e `RAIOX_SESSION_SECRET` = uma chave aleatória com pelo menos 32 caracteres. O arquivo `vercel.json` ativa o proxy que protege o Raio-X e os scripts; os logos e a página de login permanecem acessíveis antes da autenticação. Não envie `.env.local` ao repositório.

O projeto não exige build. Depois do deploy, teste uma janela anônima: abrir `/` deve levar a `/login.html`; uma senha incorreta deve falhar; a senha combinada deve liberar o Raio-X.

## Critério de conteúdo

A página separa fatos relatados por Igor, exemplos de Gabriel e decisões em aberto. Seu nome comercial oficial e o faturamento da assessoria não foram confirmados na transcrição. A faixa de faturamento mencionada na reunião descreve clientes atendidos. A transcrição integral e a análise comportamental interna não integram o site.
