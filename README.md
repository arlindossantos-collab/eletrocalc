# ⚡ EletroCalc v3.0.2

Aplicação estática para simulação e planejamento de recarga de veículos eletrificados.

## Recursos
- Base de veículos migrada do projeto original
- Cálculo centralizado e reutilizável
- Eficiência/perdas de recarga
- Limites AC/DC por veículo
- Potência compartilhada
- Veículos personalizados
- Perfis de carregadores
- Histórico local
- Temporizador persistente
- Notificações
- Exportação TXT e compartilhamento
- PWA/offline
- Tema claro/escuro
- Versionamento centralizado

## Publicar no GitHub Pages
1. Crie um repositório.
2. Envie todos os arquivos desta pasta.
3. Em Settings → Pages, selecione Deploy from a branch.
4. Escolha `main` e `/ (root)`.
5. Salve.

## Versão
Edite `js/version.js`. Para alteração funcional:
- PATCH: correções (`3.0.1`)
- MINOR: novas funcionalidades (`3.1.0`)
- MAJOR: grandes mudanças (`4.0.0`)

Após alterar a versão, atualize também a constante `CACHE` em `sw.js` para forçar a atualização do PWA.

## Atualização 3.0.1
- Logo oficial do EletroCalc adicionada ao cabeçalho e ao PWA.

## Atualização 3.0.2
- Cor dinâmica da porcentagem da bateria: vermelho próximo de 0%, evoluindo até verde próximo de 100%.
- Validação visual da compatibilidade entre veículo e carregador.
- Aviso de incompatibilidade quando o veículo não aceita AC/DC na modalidade selecionada.
- Aviso de limitação quando a potência do carregador ultrapassa o limite máximo aceito pelo veículo.
- O cálculo continua usando automaticamente a potência máxima compatível do veículo.
