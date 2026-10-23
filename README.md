# FísicaMente — Front-end

Interface React + TypeScript + Vite para acompanhamento da educação física escolar.

**API:** [moraisgabriel16/FisicamenteBack](https://github.com/moraisgabriel16/FisicamenteBack).

## Executar

Requisitos: Node 22.12+ ou 24 e a API em execução.

```sh
npm ci
npm run dev
```

Abra http://127.0.0.1:5186. Cadastro: http://127.0.0.1:5186/cadastro.

O Vite encaminha `/api` para `http://127.0.0.1:8000`. Para outro destino local, copie `.env.example` para `.env` e ajuste `API_PROXY_TARGET`. Configure `APP_URL` no back-end com a origem exata do front-end.

## Build e PWA

```sh
npm run build
npm run preview -- --port 5186
```

O build é gerado em `dist/`. O service worker é registrado somente no build de produção. O primeiro acesso precisa de conexão; a fila offline cobre avaliações e depende de sessão válida para sincronizar.

## Recursos

Cadastro e login; painel; turmas e alunos; avaliação individual/coletiva; evolução e radar; relatórios; saúde e inclusão; aulas e frequência; metas e intervenções; comunicação; eventos; convites e auditoria. Menus e ações respeitam o perfil devolvido pela API.

## Implantação

O front usa chamadas de mesma origem em `/api/v1` e cookies HttpOnly. A hospedagem deve encaminhar `/api` para o back-end e as demais rotas para `index.html`. Publicar apenas os arquivos estáticos não disponibiliza login ou banco de dados.

O Dockerfile inclui Nginx e encaminha `/api` para um serviço Docker chamado `api`. O repositório de back-end contém um Compose com perfil `full`, que integra os dois repositórios quando clonados em pastas irmãs chamadas `Fisicamente` e `FisicamenteBack`.

## Histórico e estado

O histórico do repositório anterior foi mantido. Seu HTML original está em `reference/prototipo-original.html`.

Esta é uma versão funcional em desenvolvimento. A API documenta limitações e itens avançados ainda pendentes; não é uma declaração de prontidão para produção. Não há dados de alunos reais, banco, chaves ou credenciais neste repositório.
