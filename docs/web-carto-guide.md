# Guia: Mapa de Localização com tiles CARTO (compatível web + mobile)

Este guia documenta o processo completo da implementação do **mapa estático de localização** usado no GOSKI Mobile, incluindo os problemas encontrados, as decisões tomadas e o comportamento esperado. Ele foi escrito para que uma IA execute a mesma implementação em **outra stack (web)** com **paridade de comportamento** entre os dois ambientes.

> Objetivo do mapa: ao visualizar um post que possui localização, o usuário toca no nome da localização e um modal abre mostrando um **mapa estático** (sem interação de pan/zoom) com um pin central indicando o ponto exato. O mapa deve funcionar **de forma idêntica no mobile (React Native) e no web**.

---

## 1. Contexto e pré-requisitos

- A aplicação captura a localização do usuário (latitude/longitude) **opcionalmente** ao criar um post.
- Cada post armazena `latitude`, `longitude` e um `location_name` (nome amigável, ex: cidade/bairro).
- Ao tocar na localização de um post, abre-se um modal com o mapa estático.
- O mapa **não precisa ser interativo** (sem pan, sem zoom, sem gestos). É um preview visual do ponto.
- A renderização precisa ser **identica entre as plataformas**, incluindo a mesma aparência, mesma atribuição e o mesmo comportamento de degradação.

---

## 2. Histórico: problemas encontrados e decisões

O caminho até a solução final passou por três tentativas. Documentar isso é importante para a IA executora não repetir os mesmos erros.

### 2.1 Primeira tentativa: serviço de static map (rejeitado)

- **O que era:** um serviço que gerava uma única imagem de mapa a partir de `center`, `zoom` e `markers` via query string.
- **Problema:** o serviço escolhido (`staticmap.openstreetmap.de`) está **fora do ar / morto** — sem registro DNS, requisições retornam falha de conexão (HTTP 000), zero bytes recebidos. Qualquer tentativa de uso produz um mapa quebrado (imagem vazia/erro).
- **Decisão:** abandonar dependência de um serviço de static map de terceiros. Em vez disso, **compor o mapa manualmente a partir de tiles individuais** (grade de imagens 256×256), o que dá controle total e não depende de um serviço único.

### 2.2 Segunda tentativa: tiles direto do OpenStreetMap (rejeitado — 403)

- **O que era:** usar a URL canônica de tiles do OSM (`tile.openstreetmap.org/{z}/{x}/{y}.png`).
- **Problema:** os servidores de tiles do OpenStreetMap são mantidos por voluntários e seguem uma **política de uso rígida** (vide `osm.wiki/Blocked`). Eles **exigem um header HTTP `User-Agent` válido** identificando a aplicação (e, para web, um header `Referer`). Sem isso, o servidor retorna **HTTP 403** com uma imagem de erro ("app is not following the tile usage policy...").
- **Por que quebra no mobile:** o componente de imagem do React Native **não permite definir header `User-Agent` customizado** nas requisições de imagem. Logo, o requisito da política do OSM é impossível de cumprir no mobile.
- **Decisão:** **não usar `tile.openstreetmap.org`**. Procurar um provedor de tiles que **não exija headers customizados**.

### 2.3 Decisão final: tiles raster do CARTO (Voyager)

- **Provedor escolhido:** **CARTO basemaps** (`basemaps.cartocdn.com`), estilo **Voyager** (`rastertiles/voyager`).
- **Por que funciona:**
  - Servem tiles **sem API key** (gratuito para uso moderado).
  - Respondem **HTTP 200 mesmo sem nenhum header customizado** (verificado em todos os subdomínios `a`, `b`, `c`, `d`).
  - O visual Voyager é muito similar ao mapa padrão do OpenStreetMap (bom para o caso de uso).
  - No **browser web**, o navegador já envia `User-Agent` (e `Referer`) automaticamente → funciona sem configuração adicional.
- **Custo/política:** por ser derivado do OpenStreetMap, o CARTO **exige atribuição visível**: `© OpenStreetMap contributors © CARTO`. A atribuição **deve estar sempre visível sobre o mapa** (não escondida atrás de UI, toggles ou fora da tela).

### Resumo das decisões

| Fonte | Resultado | Motivo |
|---|---|---|
| staticmap.openstreetmap.de | ❌ | Serviço morto (sem DNS) |
| tile.openstreetmap.org | ❌ | Exige `User-Agent`; 403 no mobile |
| Stadia Maps (osm_bright) | ❌ | Exige API key (401 sem chave) |
| **CARTO Voyager** | ✅ | Keyless, HTTP 200 sem headers, atribuição exigida |

---

## 3. Como a solução funciona (comportamento, não código)

A implementação deve seguir esta arquitetura conceitual. A IA executora deve replicar cada comportamento na stack de destino.

### 3.1 Lógica de tiles (módulo puro, agnóstico de plataforma)

A matemática de tiles é **pura** — não depende de nenhuma API nativa nem da plataforma. Deve ficar isolada em um módulo separado, **testável unitariamente**, para que a **mesma lógica** possa ser reutilizada/portada para qualquer stack.

Funciona assim:

1. **Conversão Web Mercator (função por coordenada, independente):**
   - `lon → worldX`: projeção da longitude para um valor de mundo (em pixels) dado um zoom.
   - `lat → worldY`: projeção da latitude para um valor de mundo (em pixels) dado um zoom (usando a fórmula Mercator com logaritmo natural e coseno).
   - Fórmulas conhecidas padrão Web Mercator/Slippy Map; usar `TILE_SIZE = 256`.

2. **Cálculo da grade de tiles (função por viewport):**
   - Dado: `latitude`, `longitude`, `zoom`, `largura` e `altura` da área do mapa.
   - Computar o centro em pixels do mundo (`worldX`, `worldY`).
   - Determinar o retângulo de tiles que cobre a viewport: `left/top` = chão de `(centro ± metade da dimensão) / 256`.
   - Iterar `x` de `left` a `right` e `y` de `top` a `bottom`, gerando cada tile com:
     - índice `x` e `y` do tile;
     - offset **left** e **top** em pixels dentro da viewport (posicionamento absoluto).
   - O conjunto resultante é a grade de imagens que forma o mapa.

3. **Geração da URL do tile:**
   - Padrão: `https://{subdominio}.basemaps.cartocdn.com/rastertiles/voyager/{zoom}/{x}/{y}.png`
   - **Subdomínio** escolhido de `{a, b, c, d}` de forma **determinística** para distribuir o carregamento entre servidores.
   - **Regra crítica de robustez:** ao calcular o índice do subdomínio, **usar valor absoluto** da soma das coordenadas antes do módulo. Sem isso, coordenadas negativas (possíveis em bordas do globo / antimeridiano) gerariam índice inválido e uma URL quebrada (`undefined.basemaps...`).
   - **Observação de zoom:** usar zoom fixo (ex: `15`) é suficiente para um preview; escala baixa o suficiente para mostrar contexto do bairro. A implementação deve permitir configurar o zoom em um único lugar.

### 3.2 Composição visual do mapa

1. O mapa é um **container com fundo neutro** e **proporção quadrada** (`aspect-square`), com `overflow hidden`.
2. O **tamanho real** (largura/altura) é medido em tempo de execução via callback de layout (`onLayout`). **Nenhum tile é renderizado antes da medição** — enquanto largura/altura forem zero, a grade fica vazia.
3. Quando o tamanho é conhecido, cada tile da grade é renderizado como uma **imagem absoluta** (`position: absolute`) de `256×256`, posicionada por `left`/`top`, com `resizeMode: cover` (não deve haver gaps/sobreposição visível entre tiles).
4. Um **pin central** (ícone de pin, cor de destaque da marca) é sobreposto no centro exato do container, **ignorando toques** (`pointerEvents: none`), apontando para a localização.
5. A **atribuição** `© OpenStreetMap contributors © CARTO` é sobreposta no **canto inferior** do mapa, em texto pequeno, com um leve fundo translúcido para legibilidade sobre o mapa, também **ignorando toques**.
6. Abaixo do mapa, um rodapé mostra o **nome da localização** (ou um texto genérico de fallback).

### 3.3 Comportamento de degradação (importante)

- Se a aplicação não tiver um nome de localidade resolvido, o modal **deve continuar funcionando** mostrando o texto de fallback (ex: "Localização exata") **com o mapa normalmente visível** (o mapa usa apenas lat/lng, nunca depende do nome).
- **Nunca** bloquear ou esconder o mapa por falta de nome; e nunca falhar a tela inteira por erro de geocodificação. Toda chamada de geocoding deve ser protegida (try/catch) e tratada como ausência de nome.

---

## 4. Compatibilidade entre os dois ambientes (mobile + web)

Este é o requisito central: **paridade de comportamento**.

1. **Módulo de tiles puro:** a matemática (Mercator + grade + URL) deve estar isolada e ser **idêntica** nas duas stacks. Como é pura, basta portar as fórmulas. A IA executora **deve** replicar exatamente as mesmas fórmulas e o mesmo padrão de URL, para que o mapa desenhado seja **pixel a pixel igual** nos dois ambientes.

2. **Imagens absolutas:** a composição via imagens posicionadas absolutamente com offsets em pixels funciona em qualquer ambiente que renderize imagens (React Native, browser, etc.). Não há dependência de biblioteca de mapas (Leaflet/Mapbox/etc.) — é a mesma técnica de "slicing" manual.

3. **Browser envia headers automaticamente:** no web, o navegador já envia `User-Agent`/`Referer` em toda requisição de imagem → o CARTO funciona **sem configuração extra**. Não é necessário proxy, API key nem headers customizados em nenhum dos ambientes.

4. **Modal:** o modal usa a primitiva de modal do framework com suporte a: fechar por clique no backdrop, fechar por gesto de arrastar para baixo (swipe down) e botão "Fechar". No web, essas interações devem ser preservadas de forma equivalente (backdrop click + close button; swipe opcional se a stack suportar).

5. **Atribuição:** obrigatória e visível **nos dois ambientes**, no mesmo local (canto inferior do mapa), com o mesmo texto.

6. **Zoom:** o mesmo zoom fixo deve ser usado nos dois ambientes (sem variação de estilo/visual entre plataformas).

---

## 5. Limitação conhecida no web (geocoding reverso)

- A biblioteca de localização usada no mobile (`expo-location`) **não suporta geocoding reverso no web**: a chamada de reverse geocode **lança erro** quando executada em browser (retorna apenas posição bruta via `navigator.geolocation`).
- **Consequência atual:** no web, a captura de localização produz lat/lng corretos, mas o **nome da localidade não é resolvido** → o post fica com `location_name` ausente no web.
- O app **já degrada graciosamente** (mostra "Localização exata"), então o mapa **funciona normalmente no web** mesmo sem o nome.
- **Para a IA executora:**
  - **Requisito mínimo:** preservar a degradação — nunca permitir que a ausência de nome quebre o mapa ou o fluxo de publicação.
  - **Opcional (melhoria):** implementar um **geocoder alternativo no web** (ex: um serviço REST de reverse geocoding aberto) para resolver o nome da localidade no browser, mantendo a mesma estrutura de dados de saída do mobile (latitude, longitude, location_name). Se implementado, deve ser feito de forma **compatível com o mobile**: mesma interface/estrutura, e a ausência do nome continua sendo um caso válido.

---

## 6. Passos de implementação para o executor (checklist)

Siga esta ordem para garantir integridade e paridade:

1. **Criar o módulo de tiles puro** (matemática Web Mercator + grade + URL CARTO), com zoom fixo e subdomínio determinístico robusto (absoluto antes do módulo). Sem dependências nativas.
2. **Escrever testes unitários para o módulo de tiles**, cobrindo:
   - conversões de longitude e latitude (pontos conhecidos);
   - geração da grade cobre a viewport (mais de zero tiles);
   - formato correto da URL (host/path do CARTO + subdomínio válido a–d);
   - **caso de coordenadas de tile negativas** (URL continua válida, subdomínio válido).
3. **Construir o componente do modal** conforme a seção 3.2: container quadrado, medição via layout, grade de imagens absolutas 256×256, pin central, atribuição no canto inferior, rodapé com o nome, e interações de fechamento (backdrop + botão, e swipe quando suportado).
4. **Preservar/implementar a degradação** por ausência de nome (fallback "Localização exata"), com geocoding protegido por try/catch.
5. **(Opcional) fallback de geocoding no web** com a mesma estrutura de dados do mobile.
6. **Testes de componente do modal:**
   - não renderiza tiles antes da medição de layout;
   - renderiza a grade de tiles com URLs do CARTO após a medição;
   - exibe o nome da localização;
   - exibe a atribuição `© OpenStreetMap contributors © CARTO`;
   - fecha o modal ao pressionar o botão fechar.
7. **Verificação manual cruzada:** abrir o mesmo post com localização **no mobile e no web** e confirmar que o mapa, o pin, a atribuição e o rodapé são visualmente idênticos.

---

## 7. Verificação e aceite

Critérios de aceite para a implementação:

- [ ] Mapa aparece sem erros (nenhuma imagem 403/quebrada) ao abrir um post com localização.
- [ ] Grade de tiles do CARTO compõe um mapa contínuo, sem gaps, centrado na coordenada do post.
- [ ] Pin central posicionado no centro exato do mapa.
- [ ] Atribuição `© OpenStreetMap contributors © CARTO` sempre visível no canto inferior do mapa.
- [ ] Comportamento idêntico entre mobile e web (mesmo mapa, mesmo zoom, mesma atribuição, mesmo degrade).
- [ ] Sem nome de localidade → mostra fallback "Localização exata" e o mapa continua funcionando.
- [ ] Fechamento do modal por backdrop, botão e swipe (quando suportado).
- [ ] Testes unitários (módulo de tiles) e de componente passando.
- [ ] Sem chamadas a `tile.openstreetmap.org` (bloqueado por política) e sem dependência de API key.

---

## 8. Referências úteis para o executor

- Política de uso de tiles do OSM: `https://operations.osmfoundation.org/policies/tiles/` e `osm.wiki/Blocked` (por que `tile.openstreetmap.org` foi descartado).
- Formato de URL de tiles do CARTO (Voyager): `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png`, subdomínio `{s}` ∈ `{a,b,c,d}`.
- Fórmulas Slippy Map (Web Mercator) — referência pública: conversões `lat/lon ↔ tile` (`x = floor((lon+180)/360 * 2^zoom)`, `y = floor((1 - ln(tan(latRad) + sec(latRad))/π)/2 * 2^zoom)`), com `TILE_SIZE = 256`.
- Atribuição exigida pelo CARTO: `© OpenStreetMap contributors © CARTO`.
