# Patati de hoje

Página pública (https://itwlp.github.io/patati-tv/) com o pacote de vídeos do Patati Patatá do dia para a TV
dos meninos: cerca de 1 hora, vídeos de 10 a 20 minutos do canal oficial, em rodízio semanal. Um toque no botão
"Tocar o pacote de hoje" abre no app YouTube uma fila temporária (`watch_videos?video_ids=...`) que toca em
sequência sem salvar nada na conta. Quem dá o play é o Wilson, na TV ou pelo celular transmitindo para a TV.

## Arquivos em uso

- `index.html`: a página. Lê `plano.json`, mostra o dia de hoje (ou o próximo dia com plano), o botão do
  pacote e os próximos dias. Tema sempre claro, paleta primária para criança de 2 anos, design derivado do
  sistema Noa Vale. Se o plano acabou, avisa que ele é renovado toda semana.
- `plano.json`: gerado pelo script. Não editar à mão.
- `atualizar-plano.ps1`: motor. Roda no Windows pelo Agendador de Tarefas ("Patati TV - atualizar plano",
  toda segunda 07:00, ou assim que o notebook ligar). Chama `~\.claude\skills\patati-curadoria\scripts\curadoria.py`
  com o histórico local em `dados\` e o `plano.json` anterior (continuidade do rodízio), grava `plano.json` e faz
  commit e push. Nunca baixa vídeo: o yt-dlp só lê metadados do canal.
  À mão: `& $HOME\dev\patati-tv\atualizar-plano.ps1 -Simular` mostra sem gravar; `-SemPush` grava sem publicar.
- `dados\`, `saida\`, `logs\`: histórico exportado do painel, saída do script e um CSV por execução. Ignorados
  pelo git; nada disso vai ao GitHub.

## Histórico

Em 27/10/2026 houve uma tentativa de player próprio (`atualizar-patati-tv.ps1`, `config.json`, `playlist.json`),
removida em 07/11/2026: o dono do canal proíbe incorporação (erro 150 do IFrame API). Está no histórico do git.

## Onde o resto mora

- Painel "Placar Patati Patatá" (artifact do Claude): guarda o histórico do Takeout e espelha este plano na
  seção "Hoje na TV" (lê o `plano.json` desta página).
- Skill `patati-curadoria` (repo itwlp/claude-skills): o script e as regras de escolha.
