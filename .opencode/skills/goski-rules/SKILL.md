---
name: goski-rules
description: Project conventions for GOSKI Mobile: commit/branch naming, no-push policy, require user approval before commits. Load this skill at the start of every session.
---

## Regras do Projeto GOSKI Mobile

### Branch naming
- Padrão: `@usuario/numero/tipo/descricao-curta`
- Exemplo: `@carlosegoulart/28/feat/alerts-crop`
- Tipos: `feat`, `fix`, `chore`, `refactor`, `style`
- `numero` = número da issue (ex: 28)

### Commit naming
- Usar commits semânticos no padrão: `tipo(escopo): descrição`
- Exemplos:
  - `feat(auth): handle RLS error silently on user insert`
  - `refactor(ui): replace Alert.alert with CustomAlert`
  - `feat(ui): add custom image cropper with header`
- Manter commits atômicos: um commit por mudança lógica

### Regras obrigatórias
1. **Commits**: SEMPRE perguntar ao usuário antes de executar qualquer commit. Mostrar o resumo do que será commitado e aguardar aprovação. Os commits devem ser agrupados por features.
2. **Push**: NUNCA fazer push. O push será feito exclusivamente pelo usuário.
3. **Branch creation**: Pode criar branches livremente seguindo o padrão acima, sem necessidade de permissão.
