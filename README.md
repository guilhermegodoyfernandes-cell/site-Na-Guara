# Na'Guara — PWA de comida venezuelana

Site responsivo, mobile first e instalável para a **Na'Guara**, uma loja de tequeños e arepas venezuelanas. O projeto foi feito com HTML, CSS e JavaScript puros, sem etapa de build, e está pronto para ser publicado como **Static Site no Render** usando um repositório do GitHub.

![Página inicial da Na'Guara](assets/screenshots/desktop.webp)

## O que está pronto

- Layout mobile first para celulares, tablets e desktops.
- Catálogo com categorias: mais pedidos, tequeños, arepas, combos e bebidas.
- Sacola com quantidade, remoção de itens e persistência em `localStorage`.
- Escolha entre **entrega** e **retirada**, cálculo de frete e frete grátis acima de R$ 80.
- Finalização do pedido pelo WhatsApp com resumo completo.
- `manifest.json` com ícones normais e maskable, atalhos e screenshots.
- Service worker com pré-cache do app shell e funcionamento offline.
- Instalação como PWA no Android, iPhone/iPad e desktop, com instruções para iOS.
- Acessibilidade: navegação por teclado, foco visível, áreas de toque confortáveis, textos alternativos e respeito a `prefers-reduced-motion`.
- Página offline, página de créditos e configuração de deploy no Render.

## Estrutura

```text
.
├── index.html
├── offline.html
├── creditos.html
├── css/
│   └── styles.css
├── js/
│   └── app.js
├── assets/
│   ├── fonts/
│   ├── icons/
│   ├── images/
│   └── screenshots/
├── manifest.json
├── sw.js
├── render.yaml
└── README.md
```

## Rodar localmente

O service worker só funciona em `localhost` ou HTTPS. Não abra o `index.html` diretamente como arquivo.

```bash
# na raiz do projeto
python3 -m http.server 4173
```

Depois acesse [http://localhost:4173](http://localhost:4173).

Também é possível usar qualquer servidor estático, como `npx serve .` ou a extensão Live Server do VS Code.

## Personalizar antes de publicar

### 1. WhatsApp da loja

Abra `js/app.js` e altere:

```js
const STORE = {
  name: "Na'Guara",
  whatsapp: "5511999999999", // coloque o número real, com DDI e DDD, apenas dígitos
  deliveryFee: 690,          // R$ 6,90 em centavos
  freeDeliveryFrom: 8000,    // R$ 80,00 em centavos
  currency: "BRL",
};
```

Os links de WhatsApp da página também são atualizados automaticamente a partir dessa configuração.

### 2. Endereço, horários e redes sociais

No `index.html`, procure por:

- `Rua das Palmeiras, 128` — endereço exibido na seção **Visite**.
- `Ter–Qui · 11h30–21h` e `Sex–Dom · 11h30–23h` — horários no site e no rodapé.
- `instagram.com/naguara.comida` — Instagram no rodapé.
- Link do Google Maps — botão **Abrir no mapa**.

### 3. Produtos e preços

Os produtos ficam no array `PRODUCTS`, no início de `js/app.js`. Cada item tem `name`, `category`, `meta`, `description`, `price` (em centavos), `image`, `alt`, `badge` e `popular`.

Para trocar uma foto, coloque o novo arquivo em `assets/images/` e atualize o caminho em `image`. Se quiser versões responsivas, gere também as variantes `-480.webp` e `-600.webp`.

### 4. Atualização do cache

Sempre que alterar HTML, CSS, JavaScript ou imagens já publicadas, incremente a versão no topo de `sw.js`:

```js
const VERSION = "naguara-v1.0.1";
```

Isso força o service worker a renovar o cache e evita que o usuário continue vendo a versão antiga.

## Como testar o PWA

1. Rode o site em `localhost` ou publique em HTTPS.
2. Abra o DevTools do Chrome e confira **Application → Manifest**.
3. Em **Service Workers**, verifique se `sw.js` está ativo.
4. Recarregue a página com a rede desligada para validar o modo offline.
5. No Android/Chrome, use **Instalar aplicativo**. No iPhone/Safari, use **Compartilhar → Adicionar à Tela de Início**.
6. Para gerar um diagnóstico completo:

```bash
npx lighthouse http://localhost:4173 --view
```

Resultado obtido no projeto:

| Categoria | Pontuação |
| --- | --- |
| Performance | 100 |
| Acessibilidade | 100 |
| Boas práticas | 100 |
| SEO | 100 |

> O Lighthouse varia conforme a máquina, a rede e o tamanho da tela. O importante é manter o manifest, o HTTPS e o service worker funcionando.

## Publicar no GitHub

Crie um repositório vazio no GitHub (sem README, sem `.gitignore`) e rode:

```bash
git init
git add .
git commit -m "feat: PWA Na'Guara"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/naguara-pwa.git
git push -u origin main
```

Troque `SEU-USUARIO` pelo seu usuário do GitHub. Se o repositório já existir localmente, basta adicionar o remote e fazer o push.

## Publicar no Render

### Opção recomendada: Blueprint

1. Acesse [dashboard.render.com](https://dashboard.render.com/) e faça login.
2. Clique em **New +** → **Blueprint**.
3. Conecte sua conta do GitHub e selecione o repositório `naguara-pwa`.
4. O Render vai ler o arquivo `render.yaml` e criar o serviço `naguara`.
5. Confirme o deploy. A URL será parecida com `https://naguara.onrender.com`.
6. Abra a URL em um celular e teste a instalação como PWA.

### Opção manual: Static Site

1. No Render, clique em **New +** → **Static Site**.
2. Conecte o repositório do GitHub.
3. Em **Build Command**, deixe vazio.
4. Em **Publish Directory**, use `.`.
5. Clique em **Create Static Site**.

O Render já entrega HTTPS automaticamente, o que é obrigatório para o service worker e para a instalação do PWA. Cada novo push na branch `main` dispara um novo deploy.

## Observações

- O número de WhatsApp, o endereço e os horários são exemplos. Substitua pelos dados reais da loja.
- O pagamento não é processado no site; o pedido é confirmado pelo WhatsApp.
- As fotos são ilustrativas. Os créditos e licenças estão em `creditos.html`.
- O projeto não usa banco de dados nem back-end. A sacola fica salva apenas no dispositivo do cliente.
