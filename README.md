# Inteli - Instituto de Tecnologia e Liderança

<p align="center">
<a href= "https://www.inteli.edu.br/"><img src="documents/assets/inteli.png" alt="Inteli - Instituto de Tecnologia e Liderança" border="0" width=40% height=40%></a>
</p>

<br>

# Grupo 03: AlémCielo

# Projeto: Jornada Cielo

## 👨‍🎓 Integrantes:

- <a href="https://www.linkedin.com/in/bernardo-bittencourt-27b8643aa">Bernardo de Assis Bittencourt e Silva</a>
- <a href="https://www.linkedin.com/in/felipe-limonge/">Felipe Limonge Macedo</a>
- <a href="http://linkedin.com/in/jos%C3%A9-guilherme-gon%C3%A7alves-maia-6078143aa">José Guilherme Gonçalves Maia</a>
- <a href="https://www.linkedin.com/in/manoel-carneiro-b42898376">Manoel de Souza Carneiro</a>
- <a href="http://www.linkedin.com/in/miguel-bizzo-hirata-de-deus-306b133a8">Miguel Bizzo Hirata de Deus</a>
- <a href="http://www.linkedin.com/in/samuel-nascimento-997187234">Samuel Pereira Nascimento</a>
- <a href="https://www.linkedin.com/in/vito-bertolai-b88260206/">Vito Giuliano Martins Pinheiro Machado Bertolai</a>

## 👩‍🏫 Professores:

### Orientador(a)

- <a href="https://br.linkedin.com/in/vanunes">Vanessa Tavares Nunes</a>

### Instrutores

- <a href="https://www.linkedin.com/in/anacristinadossantos/">Ana Cristina dos Santos</a>
- <a href="https://www.linkedin.com/in/cristiano-benites-ph-d-687647a8/">Cristiano da Silva Benites</a>
- <a href="https://www.linkedin.com/in/fabiana-martins-de-oliveira-8993b0b2/">Fabiana Martins de Oliveira</a>
- <a href="https://www.linkedin.com/in/geraldo-magela-severino-vasconcelos-22b1b220/">Geraldo Magela Severino Vasconcelos</a>
- <a href="https://www.linkedin.com/in/pedroteberga/">Pedro Marins Freire Teberga</a>

## 📜 Descrição

Jornada Cielo é um jogo de aventura, treinamento e educação, focado no auxilio e treinamento dos Gerentes de Negócios da Cielo. Inspirado na estética e na mecânica dos grandes clássicos do RPG, o projeto transforma o aprendizado técnico em uma experiência lúdica, imersiva e altamente estratégica.
No jogo, o colaborador assume o papel de um protagonista em um universo de desafios comerciais. O objetivo é navegar pelas complexidades e adversidades do mercado, para conseguir fornecer e apresentar para os clientes soluções inovadoras que a Cielo possui, utilizando das ferramentas da empresa como "equipamentos" para conquistar objetivos e superar a resistência dos clientes.
A Jornada Cielo demonstra que, com a estratégia certa e as habilidades bem desenvolvidas, todo Gerente de Negócios pode se tornar um mestre em transformar desafios em parcerias de sucesso, e fechar ótimos negócios.

## 🚀 Versão jogável

<a href="https://graduacao.pages.git.inteli.edu.br/2026-1a/t28/g03/"> Versão jogável (Gitlab)</a>
<br>
<a href="https://vitogiu1.github.io/Jornada-Cielo/"> Versão jogável (Github)</a>

## 📁 Estrutura de pastas

Dentre os arquivos e pastas presentes na raiz do projeto, definem-se:

- <b>public</b>: aqui estão os arquivos que serão publicados no pages e as imagens do jogo.

- <b>documents</b>: aqui estão todos os documentos do projeto, como o Game Development Document (GDD) bem como documentos complementares, na pasta "other".

- <b>documents/assets</b>: aqui estão os arquivos relacionados a elementos não-estruturados deste repositório, como imagens.

- <b>public/src</b>: Todo o código fonte criado para o desenvolvimento do projeto do jogo.

- <b>README.md</b>: arquivo que serve como guia e explicação geral sobre o projeto e o jogo (o mesmo que você está lendo agora).

## 🔧 Como executar o código

- Comece clonando o repositório

```javascript
git clone https://git.inteli.edu.br/graduacao/2026-1a/t28/g03.git

```

- entre no diretório

```javascript
cd g03
```

- Instale as dependências

```javascript
npm install
```

- Para executar localmente:

```javascript
npm run dev
```

- Para produção:

```javascript
npm run build
```

- E após, abra o arquivo HTML gerado em `/dist` utilizando o LiveServer no arquivo.

## 🗃 Histórico de lançamentos

## 0.1 - 13/02/2026

- Mecânicas básicas de movimentação
- Sprites gratuitos
- Vista da câmera em bird eye
- Colisões básicas com os objetos
- Mudanças de cena (Menu, Configurações, Mundo, Interior de estabelecimentos)
- Movimentação e Integração Mobile (básica)

## 0.2 - 27/02/2026

#### Jogo

- Melhoria dos botões de movimentação para plataforma mobile;
- Personalização dos "sprites" autorais;
- ínicio da personalização do jogo com background e desenvolvimento básico do Design;
- Sistema de seleção de personagem;
- HUD de tutorial de movimentação Desktop/Mobile.

#### Código

- Correção do loading das imagens, evitando loads duplicados;
- Reestruturação de preloads para melhorar o carregamento do Gitlab Pages;
- Utilização do "JSDoc" para os comentários e documentação do código.

## 0.3 - 13/03/2026

#### Jogo

- Adição de novos sistemas: [Bússola, conversa com NPC, Sistema de convencimento com NPC];
- Adição da HUD de Feedback para o usuário
- Adição do sistema de inventário;
- Adição do sistema de XP (níveis)
- Adição do sistema de Confiança (fator multiplicativo na sua chance de convencimento durante as "negociações")
- Adição de novos mapas;
- Melhoria do sistema de seleção de personagem;
- Melhoria nos HUDs para mobile;

#### Código

- Melhoria na documentação do código;
- Melhoria na organização do código;
- Melhoria na qualidade do código;
- Reestruturação das pastas

## 0.4 - 27/03/2026

#### Jogo

- Adição dos interiores das lojas nos mapas.
- Adição de novos tutoriais e passagem de diálogos por meio de interação com botões.
- Atualização do sistema de inventário com scroll.
- Adição de um novo sistema de progresso e seleção de mundos.
- Reformulação do sistema de XP e progresso.
- Atualização do sistema de negociação (Deixando de lado muitas características que lembravam batalhas e focando em argumentação).
- Adição de novos mapas.
- Adição do sistema da CieloDex, mantendo os principais itens do jogador e os clientes conquistados
- Adição de trilha sonora de fundo para os mapas.

#### Código

- Centralização das principais classes em managers
- Criação das cenas interiores por meio da interiorScene.js, impedindo que seja criado vários arquivos para cada interior.
- Dentro da game.js é instanciado cada interior a partir da classe interiorScene, passando como parâmetro o mapa, tileset, nome do mapa e a cena pai (parentScene).
- Utilização de objetos e json para armazenar dados de negociações e diálogos.

  ```
  ~/
  ├── index.html <- Arquivo principal do HTML do jogo
  ├── public/ <- Arquivos para gitlab pages e imagens do jogo
      ├── assets/ <- Arquivos de assets do jogo
      │   ├── maps/ <- Mapas do jogo
      │   ├── tilesets/ <- Tilesets do jogo
      │   └── players/ <- Personagens do jogo
      └── background.png <- Arquivo de background do jogo
  ├── src/
    ├── core/ <- Arquivos de inicialização de imagens e configurações globais
    │   ├── config.js
    │   └── preloadScene.js
    ├── credits/ <- Arquivos de créditos do que foi usado no jogo
    │   └── index.md
    ├── data/ <- Arquivos de dados do jogo (JSONs contendo os diálogos e negociações)
    │   ├── negotiations.js
    │   └── npcs.js
    ├── entities/ <- Arquivos de entidades do jogo
    │   ├── NPC.js
    │   └── Player.js
    ├── managers/ <- Classes de gerenciadores do jogo
    │   ├── AnimationManager.js
    │   ├── DialogManager.js
    │   ├── WorldManager.js
    │   ├── ProgressManager.js
    │   ├── MarkerManager.js
    │   └── NPCManager.js
    ├── scenes/ <- Arquivos de cenas do jogo
    │   ├── negotiation/ <- Arquivos de cenas de negociação
    │   │   └── NegotiationScene.js
    │   ├── maps/ <- Arquivos de cenas de mundo
    │   │   ├── CityScene.js
    |   |   ├── interiorScene.js
    │   │   ├── FarmScene.js
    │   │   ├── BeachScene.js
    │   │   ├── IndustrialScene.js
    │   │   └── CieloScene.js
    │   └── menus/ <- Arquivos de cenas de menus
    │       ├── CharacterSelectScene.js
    │       ├── MenuScene.js
    │       ├── PauseScene.js
    │       ├── WorldMapScene.js
    │       └── SettingsScene.js
    │   └── ui/ <- Arquivos de cenas de interface
    │       ├── CieloDexScene.js
    │       ├── InventoryScene.js
    │       ├── TutorialOverlayScene.js
    │       ├── MobileHudScene.js
    │       └── PlayerHudScene.js
    └── game.js <- Arquivo principal do jogo

  ```

## 📋 Licença/License

<img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/cc.svg?ref=chooser-v1"><img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/by.svg?ref=chooser-v1"><p xmlns:cc="http://creativecommons.org/ns#" xmlns:dct="http://purl.org/dc/terms/"><a property="dct:title" rel="cc:attributionURL" href="https://github.com/Intelihub/Template_M1">MODELO GIT INTELI</a> by <a rel="cc:attributionURL dct:creator" property="cc:attributionName" href="https://github.com/Intelihub">Inteli,</a> <a href="https://www.linkedin.com/in/bernardo-bittencourt-27b8643aa/">Bernardo de Assis Bittencourt e Silva</a>, <a href="https://www.linkedin.com/in/felipe-limonge/">Felipe Limonge Macedo</a>, <a href="http://linkedin.com/in/jos%C3%A9-guilherme-gon%C3%A7alves-maia-6078143aa">José Guilherme Gonçalves Maia</a>, <a href="https://www.linkedin.com/in/manoel-carneiro-b42898376">Manoel de Souza Carneiro</a>, <a href="http://www.linkedin.com/in/miguel-bizzo-hirata-de-deus-306b133a8">Miguel Bizzo Hirata de Deus</a>, <a href="http://www.linkedin.com/in/samuel-nascimento-997187234">Samuel Pereira Nascimento</a>, <a href="https://www.linkedin.com/in/vito-bertolai-b88260206/">Vito Giuliano Martins Pinheiro Machado Bertolai</a> is licensed under <a href="http://creativecommons.org/licenses/by/4.0/?ref=chooser-v1" target="_blank" rel="license noopener noreferrer" style="display:inline-block;">Attribution 4.0 International</a>.</p>
