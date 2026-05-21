# GOSKI

## Sobre o App
O **GOSKI-Mobile** é uma plataforma mobile para gerenciamento e exposição de arte digital e fotografia. O diferencial do projeto é a automação de processos via Inteligência Artificial, garantindo que todo conteúdo enviado seja moderado e categorizado automaticamente, proporcionando um ambiente seguro e organizado.

### Funcionalidades
- [x] **Setup do Projeto:** Integração Laravel + Google IDX + Supabase.
- [x] **Autenticação:** Sistema de login vinculado ao Auth do Supabase (UUID).
- [x] **Gerenciamento de Mídia:** Upload de imagens para buckets do Supabase Storage.
- [x] **Processamento via IA:** Trigger de Edge Functions para moderação e rotulagem automática.
- [x] **Perfil do Usuário:** Sincronização de dados de perfil.
- [x] **Sistema de likes e follow:** Lógica para interação de usuários.
- [x] **Sistema de Notificação:** Notificação sobre interações entre usuários.
- [ ] **Sistema de recomendação:** Filtragem de conteúdo com base nas tags geradas pela IA.

---

### Funcionalidades adicionais
- [ ] **Tema Escuro** 
- [ ] **Sistema de comentarios** 
- [ ] **Sistema de localização**
- [ ] **Sistema de compartilhamento**
- [ ] **Sistema de denúncia**
- [ ] **Filtros Avançados**

---

## Protótipos de Tela

* **Link para o Figma:** https://www.figma.com/design/BSempdiCWuvVlKI7PH8O0s/GOSKI-Mobile?node-id=0-1&p=f&t=sRHPdzuo6Mb5sUB7-0

---

## Modelagem do Banco
O projeto utiliza uma arquitetura de persistência remota baseada em **PostgreSQL** através da plataforma **Supabase**, com lógica de negócio orquestrada por um backend em **Laravel 12**.

### Estratégia de Implementação
* **Backend:** Laravel para Migrations, Seeders e API REST.
* **Banco de Dados:** Relacional com políticas de RLS (Row Level Security) para proteção de dados por usuário.
* **Storage:** Supabase Storage para armazenamento de mídias.
* **Serverless:** Edge Functions para integração com APIs de visão computacional e IA.

### Diagrama Entidade-Relacionamento (DER)
![Diagrama de Banco de Dados GOSKI](https://drive.google.com/uc?export=download&id=181_k0xqLlx3vjZKLCQk_1eoA7keYuQJ5)

* **Users:** Ponto central do banco, vinculado ao `auth.users` do Supabase via UUID.
* **Posts (1:N):** Relação direta onde um usuário pode publicar múltiplos posts, mas cada post pertence a um único autor.
* **Tags (N:N):** Relacionamento de N:N entre `posts` e `tags`, gerenciado pela tabela pivô `post_tag`.
* **Likes:** Relacionamento de N:N. Conecta usuários aos posts curtidos.
* **Follows:** Relacionamento de N:N.. Relação autorreferencial na tabela `users` para o sistema de seguidores.

---

## Planejamento de Sprints
Cronograma estimado para o desenvolvimento do MVP (Minimum Viable Product) focado em interatividade e IA:

| Sprint | Requisito / Recurso | Prazo (Semanas) | Status |
| :--- | :--- | :--- | :--- |
| **Sprint 1** | **Core & Infra:** Setup Supabase e Modelagem do Banco. | 1 semanas | ✅ |
| **Sprint 2** | **IA & Storage:** Upload de mídia, Edge Functions e Moderação automática. | 1 semanas | ✅ |
| **Sprint 3** | **Mobile & Auth:** Interface Expo (NativeWind) e Login via Supabase Auth. | 1 semanas | ✅ |
| **Sprint 4** | **Perfil do Usuário:** Sincronização de dados de perfil.  | 1 semanas | ✅ |
| **Sprint 5** | **Social Engine:** Lógica de Likes, Follows. | 1 semanas | ✅ |
| **Sprint 6** | **Engajamento:** Sistema de Notificações de interações entre usuários. | 1 semanas | ✅ |
| **Sprint 7** | **Inteligência:** Sistema de Recomendação baseado nas Tags da IA. | 2 semanas | 📅 |
| **Sprint 8** | **Finalização:** Refinamento de UI/UX, Testes e Documentação. | 1 semana | 📅 |

---

## Atualizações desde o último checkpoint

### Recursos dos módulos anteriores aplicados

*   **NativeWind:** Utilizado para estilizar componentes em toda a aplicação, como pode ser visto na tela de login (`components/auth/LoginForm.tsx`) e nos cards de post (`components/post/PostCard.tsx`).
*   **Zustand:** Empregado para o gerenciamento de estado global. Alguns exemplos de stores criados são:
    *   `useAuthStore`: Para gerenciar o estado de autenticação do usuário.
    *   `usePostStore`: Para controlar o estado dos posts, incluindo a criação e listagem.
    *   `useProfileStore`: Para armazenar e gerenciar os dados do perfil do usuário.
    *   `useModalStore`: Para gerenciar a visibilidade de modais, como o de criar post e o de editar perfil.
*   **Expo Router:** Utilizado para criar a navegação entre as telas da aplicação, com rotas definidas no diretório `app`.

### Conceitos de componentes reutilizáveis aplicados

*   **Composição de Componentes:** Telas e componentes mais complexos são construídos a partir da combinação de componentes menores. A tela de feed (`screens/FeedScreen.tsx`), por exemplo, é composta por múltiplos componentes `PostCard`, e o cabeçalho (`components/header/index.tsx`) é formado por `Logo` e `ActionButtons`.
*   **Componentes de UI Genéricos:** Foram criados componentes de UI genéricos e reutilizáveis, como `GradientText.tsx`, `PostSkeleton.tsx`, `PrimaryButton.tsx`, e `StyledTextInput.tsx`, que são utilizados em várias partes do aplicativo para manter a consistência visual e funcional.

---

## Principais alterações realizadas:

### Commits em 7 de Maio de 2026
- fix: EditProfileModal improved

### Commits em 6 de Maio de 2026
- fix: notification modal open
- fix: createPostModal close and refresh the feed

### Commits em 25 de Abril de 2026
- feat: EditProfileModal test and remove comments
- feat: Profile test
- feat: NotificationModal and ActionButton test

### Commits em 24 de Abril de 2026
- feat: post tests
- feat: LoginForm test
- feat: jest setup and RegisterForm-test

### Commits em 20 de Abril de 2026
- feat: persist delete and read status, new time pattern
- feat: notification modal with relative time and mark as read button

### Commits em 18 de Abril de 2026
- feat: implement notification-modal

### Commits em 15 de Abril de 2026
- feat: ensuring the persistence and use of the profile picture across all components
- feat: edit profile modal with username, email, passoword and avatar inputs

### Commits em 14 de Abril de 2026
- feat: implement the avatar upload and profile edit modal

### Commits em 13 de Abril de 2026
- feat: implement user interaction with persistent likes and follows

### Commits em 12 de Abril de 2026
- fix: author profile page with right infos and handle invalid refresh token and clear local auth state on logout

### Commits em 11 de Abril de 2026
- feat: implement of the profile of third users

### Commits em 10 de Abril de 2026
- feat: profile page with style improved

## Video de apresentação
* **Link:** https://www.youtube.com/watch?v=E0yWtXZH5j4

---

## Como Executar o Ambiente

### Clonar o repositorio
```bash
git clone https://github.com/GOSKI-Gallery/GOSKI-Mobile.git
```

### Acessar o repositorio e instale as dependencias 
```bash
cd GOSKI-Mobile
```

Recomendamos o uso do NVM para gerenciar versões.
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.4/install.sh | bash

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
```

Instalar as dependencias
```bash
yarn install
```

### Configurar as variaveis Supabase
```bash
cp .env.example .env
```

Preencher as variaveis com as chaves do Supabase

### Iniciar o projeto
```bash
yarn start
```

---

## Como preparar o banco de dados

GOSKI é um projeto mobile e web, com a parte web desenvolvida em Laravel sendo responsavel por realizar a migração das tabelas para o Supabase e popular o banco de dados. 
Para isso, será necessario:

### Clonar o repositorio
```bash
git clone https://github.com/GOSKI-Gallery/GOSKI-Laravel.git
```

### Instalar as dependencias
```bash
composer install
```
### Realizar o deploy da edge function do supabase
```bash
supabase init
```

```bash
supabase login
```

```bash
supabase functions deploy image-moderator
```

### Migrar as tabelas e popular o banco de dados
Migrar
```bash
php artisan migrate
```
Popular
```bash
php artisan db:seed
```
