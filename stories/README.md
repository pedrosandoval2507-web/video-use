# Histórias animadas (Reels/TikTok 9:16)

Formato: animação flat em vetor, personagem simples, passos numerados no canto (badge vermelho),
legenda grande condensada frase a frase com palavras-chave em vermelho, cards de dados com fonte,
woosh nas trocas de cena e trilha animada por baixo da narração.

## Episódios (`episodes/epNN.json`)
| ep | tema |
|----|------|
| 01 | Se a internet cair — saque dinheiro hoje |
| 02 | Se a luz acabar por 30 dias |
| 03 | Seu celular te escuta? |
| 04 | Se a IA roubar seu emprego |
| 05 | Se os bilionários dividissem tudo |
| 06 | O que a escola não te ensina (dinheiro) |
| 07 | 30 dias sem celular |
| 08 | Se um asteroide cair em 7 dias |
| 09 | Apocalipse zumbi no Brasil |
| 10 | Se todos os humanos sumissem hoje |

Cada cena: `bg` (cenário), `char` (personagem: pose walk/run/stand/scared/cheer/point/phone/think/shrug),
`props` (ícones animados), `stat` (card de dado), `label`, `step` (badge), `say` (narração; `*palavra*` = vermelho).

## Pipeline grátis (padrão)
```bash
pip install edge-tts numpy
python3 stories/engine/free_audio.py sfx            # trilha animada + woosh sintetizados (sem direitos autorais)
python3 stories/engine/free_audio.py ep01 ep02 ...  # voz neural Microsoft pt-BR-AntonioNeural + timestamps
node stories/engine/render.mjs ep01                 # -> stories/out/ep01.mp4
```
Requer o host `speech.platform.bing.com` liberado na rede do ambiente. Outra voz: `EDGE_VOICE=pt-BR-FranciscaNeural`.

## Pipeline ElevenLabs (opcional)
```bash
# 1) chave: ELEVENLABS_API_KEY no ambiente ou no .env da raiz
node stories/engine/tts.mjs voices                 # escolher voz pt-BR -> ELEVEN_VOICE_ID
node stories/engine/tts.mjs sfx                    # woosh + trilha -> stories/audio/
node stories/engine/tts.mjs ep01 ep02 ...          # narração + timestamps
# 2) render (~2 min por vídeo)
node stories/engine/render.mjs ep01                # -> stories/out/ep01.mp4
node stories/engine/render.mjs ep01 --stills scenes  # quadros de QA
```
Sem `voice.json` o render usa timing estimado (prévia muda).
