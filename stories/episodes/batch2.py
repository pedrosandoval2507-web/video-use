#!/usr/bin/env python3
"""Episodes 11-40, written in a compact form and expanded to episodes/epNN.json.
Run: python3 stories/episodes/batch2.py
"""
import json
from pathlib import Path

HERE = Path(__file__).parent
GREEN, RED = "#2FB57A", "#E5322D"
ALT = dict(shirt="#E5322D", shirtDark="#B8241F", pack=False, hair="#1C1C1C")
ALT2 = dict(shirt="#F2C230", shirtDark="#D9A514", pack=False, hair="#8A5A2A")


def ch(pose="stand", x=540, **k):
    return dict(pose=pose, x=x, y=k.pop("y", 1710), s=k.pop("s", 1.3), **k)


def pr(k, x=540, y=880, s=1.3, a="pop", **kw):
    return dict(k=k, x=x, y=y, s=s, a=a, **kw)


def st(value, top=None, sub=None, src=None, color=None, count=False, size=None):
    d = dict(value=value, y=860)
    for key, v in dict(top=top, sub=sub, src=src, color=color, count=count or None, size=size).items():
        if v:
            d[key] = v
    return d


def sc(say, bg, *props, step=None, char=None, stat=None, label=None, cam="push", dim=None, labelY=None):
    d = dict(bg=bg, cam=cam, say=say)
    if step:
        d["step"] = dict(n=step[0], t=step[1])
    if props:
        d["props"] = list(props)
    if char:
        d["char"] = char
    if stat:
        d["stat"] = stat
    if label:
        d["label"] = label
    if labelY:
        d["labelY"] = labelY
    if dim:
        d["dim"] = dim
    return d


def bell(say):
    return sc(say, "purple", pr("bell", 540, 830, 1.4))


EP = {}

EP["ep11"] = dict(slug="30-dias-sem-acucar", title=["30 dias", "sem açúcar"],
  caption="O que acontece com seu corpo se você ficar 30 dias SEM AÇÚCAR? 🍬🚫 A primeira semana é a pior. #saude #acucar #desafio #curiosidades",
  scenes=[
    sc("O que acontece se você ficar *30* *dias* sem açúcar?", "kitchen", pr("sugar", 540, 900, 1.4), pr("cross", 700, 760, 0.5, d=0.8)),
    sc("Uma única lata de refrigerante tem uns *35* *gramas* de açúcar.", "red", pr("soda", 540, 880, 1.6)),
    sc("A OMS recomenda o ideal de *25* *gramas* por dia. A lata sozinha já passou.", "blue", stat=st("25 g", "ideal por dia", "cerca de 6 colheres de chá", "OMS", size=170)),
    sc("Dias um a três: vontade de doce o tempo todo. *Irritação* e dor de cabeça.", "office", char=ch("scared"), step=("1", "Dias\n1 a 3"), cam="shake"),
    sc("Seu cérebro estava acostumado com a *recompensa* rápida.", "dark", pr("brain", 540, 860, 1.4)),
    sc("Dia sete: a vontade *diminui*. A energia fica mais estável durante o dia.", "field_day", pr("battery", 540, 900, 1.3, level=0.8), step=("2", "Dia 7")),
    sc("Dia quinze: uma fruta começa a parecer *muito* *mais* *doce*.", "kitchen", char=ch("cheer"), step=("3", "Dia 15")),
    sc("Isso acontece porque o paladar se *acostuma* de novo.", "green", pr("heart", 540, 860, 1.0)),
    sc("Dia trinta: muita gente relata menos *inchaço* e menos fome fora de hora.", "sunset", char=ch("cheer"), step=("4", "Dia 30")),
    sc("O problema? O açúcar está escondido em pão, molho e até no *suco* *de* *caixinha*.", "store", pr("cart", 540, 900, 1.2), step=("*", "A pegadinha")),
    bell("Você aguentaria? Comenta, e segue pra mais."),
  ])

EP["ep12"] = dict(slug="ganhar-mega-sena", title=["Se você ganhar", "na mega-sena"],
  caption="Se você ganhasse na Mega-Sena hoje, qual seria o primeiro passo? 🍀 Quase todo mundo erra o passo 1. #megasena #dinheiro #curiosidades",
  scenes=[
    sc("Se você ganhar na *Mega-Sena* hoje, o primeiro passo decide se o dinheiro vai durar.", "green", pr("ball", 360, 880, 0.9, label="07"), pr("ball", 540, 820, 0.9, d=0.2, label="23", color=RED), pr("ball", 720, 880, 0.9, d=0.4, label="42", color="#5B7FD6")),
    sc("A chance de acertar as seis é de uma em *50* *milhões*.", "red", stat=st("1 em 50 mi", "chance de acertar a sena", "aposta simples de 6 números", "Caixa", size=130)),
    sc("Primeiro: *não* *conta* *pra* *ninguém*. Nem no grupo da família.", "room_night", pr("whatsapp", 760, 900, 0.8), pr("cross", 860, 800, 0.4, d=0.6), char=ch("think", 330), step=("1", "Fique\nquieto")),
    sc("Parente que você nunca viu vai aparecer pedindo *empréstimo*.", "city_day", pr("people", 540, 1700, 1.6, n=5, pose="walk"), cam="shake"),
    sc("Segundo: antes de gastar, procura um *advogado* e um *planejador* financeiro.", "office", pr("briefcase", 540, 900, 1.2), step=("2", "Ajuda\nprofissional")),
    sc("Terceiro: quita todas as *dívidas*. Juros são o maior ralo de dinheiro.", "red", pr("card", 540, 880, 1.4), pr("cross", 680, 780, 0.5, d=0.6), step=("3", "Zere as\ndívidas")),
    sc("Quarto: investe a maior parte. Só os *rendimentos* já dariam um salário alto por mês.", "green", pr("chart_up", 540, 880, 1.4), step=("4", "Viva de\nrenda")),
    sc("E o erro clássico: sair *comprando* carro, casa e presente pra todo mundo no primeiro mês.", "city_day", pr("car", 540, 1000, 1.2), pr("cross", 700, 880, 0.5, d=0.7), step=("*", "O erro"), cam="shake"),
    bell("Qual seria a primeira coisa que você compraria? Comenta."),
  ])

EP["ep13"] = dict(slug="aviao-sem-paraquedas", title=["Por que o avião", "não tem paraquedas?"],
  caption="Por que avião comercial não tem paraquedas pra passageiro? ✈️🪂 O motivo 2 ninguém imagina. #aviao #curiosidades #viagem #fatos",
  scenes=[
    sc("Por que o avião não tem *paraquedas* pros passageiros?", "sky", pr("plane", 540, 880, 1.4)),
    sc("Parece óbvio colocar. Mas não *salvaria* quase ninguém.", "sky", pr("parachute", 540, 860, 1.3), pr("cross", 700, 760, 0.5, d=0.8)),
    sc("Primeiro: o avião voa a uns *10* *mil* *metros*. Lá em cima faz uns 50 graus *negativos*.", "blue", pr("thermo", 540, 880, 1.3, cold=True), step=("1", "Frio e\naltura")),
    sc("E o ar é tão rarefeito que você *desmaia* em segundos sem oxigênio.", "dark", pr("brain", 540, 860, 1.3), cam="shake"),
    sc("Segundo: a cabine é *pressurizada*. Com o avião voando alto, a porta nem consegue ser aberta.", "sky", pr("door", 540, 880, 1.2), pr("lock", 700, 760, 0.5, d=0.6), step=("2", "A porta")),
    sc("Terceiro: saltar a quase *900* *km/h* exige treino. Passageiro comum se machucaria.", "red", stat=st("900 km/h", "velocidade de cruzeiro", "avião comercial", size=150), step=("3", "Velocidade")),
    sc("E a maioria dos acidentes acontece na *decolagem* ou no *pouso*. Baixo demais pra abrir paraquedas.", "city_day", pr("plane", 540, 1050, 1.0, r=-12), step=("*", "O detalhe")),
    sc("No fim, o avião segue entre os meios de transporte mais *seguros* que existem.", "green", pr("shield", 540, 860, 1.3)),
    bell("Você tem medo de avião? Comenta aí."),
  ])

EP["ep14"] = dict(slug="se-a-lua-sumisse", title=["E se a lua", "sumisse hoje?"],
  caption="E se a Lua sumisse hoje à noite? 🌕 A parte 3 é a mais assustadora. #lua #espaco #ciencia #curiosidades",
  scenes=[
    sc("E se a *Lua* sumisse hoje à noite?", "night_field", pr("moon", 760, 520, 1.0, out=2.5)),
    sc("Primeiro: as noites ficariam *muito* *mais* *escuras*. Sem luar nenhum.", "forest_night", char=ch("scared"), dim=0.4, step=("1", "Escuridão")),
    sc("Animais que caçam e se orientam pela lua ficariam *perdidos*.", "night_field", pr("dog", 540, 1500, 1.0, color="#7A7A7A")),
    sc("Segundo: as *marés* ficariam bem mais fracas. A Lua é quem mais puxa o mar.", "beach", pr("wave", 540, 1150, 1.1), step=("2", "Marés")),
    sc("Isso mexeria com peixes, corais e com quem *vive* *da* *pesca*.", "ocean", pr("drop", 540, 860, 1.0)),
    sc("Terceiro, o mais perigoso: a Lua *estabiliza* a inclinação da Terra.", "space", pr("globe", 540, 820, 1.4, wob=12), step=("3", "O eixo")),
    sc("Sem ela, ao longo de milhares de anos, o eixo poderia *balançar* muito mais. E o clima viraria um caos.", "red", pr("thermo", 400, 880, 1.0), pr("thermo", 680, 880, 1.0, cold=True, d=0.3), cam="shake"),
    sc("A Lua parece só enfeite no céu. Mas ela ajuda a manter a Terra *habitável*.", "night_field", pr("moon", 540, 760, 1.2), step=("*", "A verdade")),
    bell("Sabia disso? Comenta, e segue pra parte dois."),
  ])

EP["ep15"] = dict(slug="preso-no-elevador", title=["Se você ficar", "preso no elevador"],
  caption="Se o elevador parar entre dois andares, o que você faz? 🛗 Quase todo mundo faz o passo 2 errado. #elevador #seguranca #curiosidades",
  scenes=[
    sc("Se o elevador *travar* entre dois andares, o que você faz?", "elevator", char=ch("scared"), cam="shake"),
    sc("Primeiro: *calma*. O cabo não vai arrebentar e te derrubar.", "elevator", char=ch("stand"), step=("1", "Calma")),
    sc("Elevador tem vários cabos de aço, e cada um sozinho já *segura* a cabine.", "blue", pr("lock", 540, 860, 1.2)),
    sc("E desde *1853* existe o freio de segurança, que trava a cabine se ela despencar.", "green", stat=st("1853", "freio de segurança", "inventado por Elisha Otis", size=170, color=GREEN)),
    sc("Segundo: *nunca* tenta forçar a porta e pular pra fora.", "elevator", pr("door", 540, 900, 1.0), pr("cross", 680, 760, 0.5, d=0.6), step=("2", "Não force\na porta")),
    sc("A cabine pode voltar a andar no meio da saída. É assim que acontecem os *piores* acidentes.", "red", pr("warning", 540, 860, 1.3), cam="shake"),
    sc("Terceiro: aperta o botão de *alarme* e liga pro número do painel.", "elevator", pr("bell", 760, 900, 0.7), char=ch("point", 360), step=("3", "Alarme")),
    sc("Sem sinal? Liga pro *193*. Os bombeiros sabem destravar com segurança.", "red", stat=st("193", "bombeiros", "ligação gratuita", size=190)),
    bell("Você já ficou preso? Conta nos comentários."),
  ])

EP["ep16"] = dict(slug="sempre-cansado", title=["Por que você", "vive cansado?"],
  caption="Dorme e acorda cansado? 😴 O motivo 3 é o que mais gente ignora. #sono #saude #produtividade #curiosidades",
  scenes=[
    sc("Você dorme, acorda, e continua *cansado*? Pode ser um destes motivos.", "bedroom", pr("bed", 540, 1300, 1.4)),
    sc("Primeiro: você dorme *menos* do que acha. Adulto precisa de pelo menos *sete* *horas*.", "blue", stat=st("7 horas", "mínimo por noite", "para adultos", "CDC", size=160), step=("1", "Pouco\nsono")),
    sc("E um terço dos adultos não chega nisso.", "red", pr("people", 540, 1100, 2.0, n=3)),
    sc("Segundo: o *celular* na cama. A tela engana o cérebro de que ainda é dia.", "bedroom", pr("phone", 540, 880, 1.2), step=("2", "Tela à\nnoite"), dim=0.3),
    sc("Terceiro: *café* depois do almoço. A cafeína ainda está no seu sangue horas depois.", "office", pr("coffee", 540, 900, 1.3), pr("clock", 780, 760, 0.5, d=0.5), step=("3", "Café\ntarde")),
    sc("Quarto: horário *bagunçado*. Dormir à uma no sábado e às dez na segunda confunde o relógio do corpo.", "night_field", pr("clock", 540, 860, 1.2), step=("4", "Horário\nbagunçado")),
    sc("Quinto: pouca luz do *sol* de manhã. É ela que liga o seu despertador interno.", "field_day", pr("sun", 760, 560, 0.9), char=ch("cheer", 400), step=("5", "Sem sol")),
    sc("Se nada disso resolver, vale procurar um *médico*. Cansaço constante pode ter outras causas.", "hospital", char=ch("stand"), step=("*", "Importante")),
    bell("Qual desses é o seu? Comenta o número."),
  ])

EP["ep17"] = dict(slug="se-o-sol-sumisse", title=["E se o sol", "sumisse agora?"],
  caption="Se o Sol sumisse agora, você só saberia daqui a 8 minutos. ☀️🌑 O resto é assustador. #sol #espaco #ciencia #curiosidades",
  scenes=[
    sc("Se o *Sol* sumisse agora, você nem ia perceber.", "field_day", pr("sun", 540, 760, 1.2)),
    sc("A luz dele leva *8* *minutos* e 20 segundos pra chegar aqui.", "space", stat=st("8min 20s", "tempo da luz do Sol", "até a Terra", "NASA", size=150), step=("1", "8 minutos")),
    sc("Então por oito minutos, tudo continuaria *normal*.", "city_day", char=ch("walk", 260, to=760)),
    sc("Depois: *escuridão* total. Só as estrelas no céu.", "night_field", char=ch("scared"), dim=0.4, cam="shake", step=("2", "Escuridão")),
    sc("A Terra sairia *voando* em linha reta pelo espaço. Nada mais segurando a órbita.", "space", pr("globe", 540, 820, 1.2, a="drive", to=[900, 500])),
    sc("Na primeira semana, a temperatura cairia *abaixo* *de* *zero* no planeta inteiro.", "blue", pr("thermo", 540, 880, 1.4, cold=True), step=("3", "O frio")),
    sc("As plantas parariam a fotossíntese. E sem plantas, a comida *acaba*.", "desert", pr("tree", 540, 1000, 1.0, wob=6), step=("4", "Sem\ncomida")),
    sc("A boa notícia: o Sol ainda tem uns *5* *bilhões* *de* *anos* de combustível.", "green", stat=st("5 bilhões", "de anos de vida", "para o Sol", color=GREEN, size=140), step=("*", "Relaxa")),
    bell("Qual parte te deu mais medo? Comenta."),
  ])

EP["ep18"] = dict(slug="correnteza-praia", title=["Se o mar", "te puxar"],
  caption="Se a correnteza te puxar na praia, NÃO nade pra areia. 🌊 Isso pode salvar sua vida. Manda pra quem vai pra praia. #praia #seguranca #verao",
  scenes=[
    sc("Se o mar começar a te puxar, o seu instinto vai te *matar*.", "beach", char=ch("scared", y=1300), cam="shake"),
    sc("Isso se chama *corrente* *de* *retorno*. Uma faixa de água que volta pro fundo.", "ocean", pr("arrow", 540, 900, 1.2, dir=-90, a="pop")),
    sc("Primeiro: *não* *nade* contra ela, de volta pra areia. Nem atleta consegue.", "ocean", pr("arrow", 540, 900, 1.0, dir=90), pr("cross", 700, 760, 0.5, d=0.6), step=("1", "Não lute")),
    sc("Você cansa em minutos, e aí é que vem o *afogamento*.", "red", pr("warning", 540, 860, 1.3)),
    sc("Segundo: nada *de* *lado*, paralelo à praia. A corrente é estreita.", "ocean", pr("arrow", 540, 900, 1.2, dir=0, color="#2FB57A"), step=("2", "Nade de\nlado")),
    sc("Saiu da faixa, aí sim você volta pra areia.", "beach", char=ch("walk", 300, to=700)),
    sc("Terceiro: se cansar, *boia* de costas e levanta o braço pedindo ajuda.", "ocean", char=ch("cheer", y=1150), step=("3", "Boie e\nacene")),
    sc("Como reconhecer: um trecho mais *escuro*, mais *calmo*, sem onda quebrando. Parece seguro, mas é ali.", "beach", label="Trecho calmo = perigo", step=("*", "Como\nver")),
    bell("Manda pra alguém que vai pra praia nesse verão."),
  ])

EP["ep19"] = dict(slug="picada-de-cobra", title=["Se uma cobra", "te picar"],
  caption="Se uma cobra te picar, NUNCA faça o que aparece nos filmes. 🐍 #cobra #primeirossocorros #seguranca #curiosidades",
  scenes=[
    sc("Se uma *cobra* te picar, o que você viu nos filmes pode te matar.", "forest_night", pr("snake", 540, 1400, 1.4)),
    sc("O Brasil tem quase *30* *mil* acidentes com cobra por ano.", "red", stat=st("~30 mil", "acidentes com cobras por ano", "no Brasil", "Ministério da Saúde", size=150)),
    sc("Primeiro: *não* *chupa* o veneno. Não funciona e ainda infecciona.", "dark", pr("cross", 540, 860, 1.1), step=("1", "Não chupe")),
    sc("Segundo: *não* *amarra* o braço ou a perna. O garrote pode piorar a lesão.", "red", pr("cross", 540, 860, 1.1), step=("2", "Sem\ngarrote")),
    sc("Terceiro: deita, fica *calmo* e mantém a área picada parada.", "field_day", char=ch("stand"), step=("3", "Fique\nparado")),
    sc("Quarto: vai pro *hospital* o mais rápido possível. Só o soro resolve.", "hospital", pr("pill", 540, 900, 1.0), step=("4", "Hospital")),
    sc("Se der, tira uma *foto* da cobra de longe. Ajuda o médico a escolher o soro.", "forest_night", pr("phone", 540, 880, 1.1, label="FOTO"), step=("*", "Dica")),
    sc("O soro do Brasil é feito pelo Instituto *Butantan*. E é de graça no SUS.", "green", pr("shield", 540, 860, 1.3)),
    bell("Salva esse vídeo. Um dia ele pode salvar alguém."),
  ])

EP["ep20"] = dict(slug="regra-dos-3", title=["A regra", "dos 3"],
  caption="A regra dos 3 que todo sobrevivente conhece. ⏱️ Qual você aguentaria mais? #sobrevivencia #curiosidades #fatos",
  scenes=[
    sc("Existe uma regra que todo *sobrevivente* conhece: a regra dos três.", "mountains", char=ch("stand")),
    sc("Três *minutos* sem ar.", "blue", pr("clock", 540, 860, 1.3), step=("1", "3 minutos")),
    sc("É por isso que, numa emergência, a primeira coisa é sempre a *respiração*.", "hospital", pr("heart", 540, 860, 1.0)),
    sc("Três *horas* sem abrigo, num frio ou calor extremo.", "forest_night", pr("thermo", 540, 880, 1.3, cold=True), step=("2", "3 horas")),
    sc("Abrigo vem antes de comida. Sempre.", "mountains", pr("cabin", 540, 1450, 1.1)),
    sc("Três *dias* sem água.", "desert", pr("bottle", 540, 900, 1.2), step=("3", "3 dias")),
    sc("Depois de um dia sem beber, já vem dor de cabeça, tontura e *confusão*.", "desert", char=ch("think", face="sad")),
    sc("Três *semanas* sem comida.", "kitchen", pr("can", 540, 1120, 1.2), step=("4", "3 semanas")),
    sc("Ou seja: numa crise, quem corre pro mercado atrás de comida está priorizando *errado*.", "store", char=ch("run", 260, to=760), step=("*", "A lição")),
    bell("Qual dos três você aguentaria mais? Comenta."),
  ])

EP["ep21"] = dict(slug="amazonia-acabasse", title=["Se a Amazônia", "acabasse"],
  caption="Se a Amazônia acabasse, a sua torneira em São Paulo podia secar. 🌳💧 Pouca gente sabe disso. #amazonia #natureza #brasil #curiosidades",
  scenes=[
    sc("Se a *Amazônia* acabasse, a falta de água chegaria até a sua casa.", "forest_night", pr("tree", 540, 1100, 1.3)),
    sc("Mesmo morando a milhares de quilômetros dela.", "city_day", char=ch("think")),
    sc("A floresta solta *vapor* de água no ar. Muito vapor.", "field_day", pr("tree", 540, 1150, 1.2), pr("drop", 400, 700, 0.5, d=0.5, float=True), pr("drop", 680, 640, 0.5, d=0.8, float=True), step=("1", "O vapor")),
    sc("Esse vapor vira os *rios* *voadores*: correntes de umidade que viajam pelo céu.", "sky", pr("arrow", 540, 880, 1.3, dir=150), step=("2", "Rios\nvoadores")),
    sc("Eles ajudam a levar chuva pro *Centro-Oeste* e pro *Sudeste*.", "blue", pr("drop", 540, 860, 1.4)),
    sc("Sem floresta: menos chuva, represa mais vazia e *conta* *de* *luz* mais cara.", "desert", pr("outlet", 540, 900, 1.0), step=("3", "Sem\nchuva"), cam="shake"),
    sc("E o agro, que depende da chuva, *perderia* safra.", "desert", pr("chart_down", 540, 880, 1.3)),
    sc("A Amazônia não é só bicho e árvore. É a *caixa* *d'água* do Brasil.", "forest_night", step=("*", "A\nverdade")),
    bell("Sabia disso? Manda pra quem precisa saber."),
  ])

EP["ep22"] = dict(slug="se-a-gasolina-acabasse", title=["Se a gasolina", "acabasse"],
  caption="Se a gasolina acabasse no Brasil, o mercado esvaziava em dias. ⛽ Em 2018 isso quase aconteceu. #gasolina #brasil #curiosidades",
  scenes=[
    sc("Se a *gasolina* e o *diesel* acabassem no Brasil, o país parava em poucos dias.", "city_day", pr("gas_pump", 540, 920, 1.3)),
    sc("Quase tudo que você come chega de *caminhão*.", "street_top", pr("truck", 540, 900, 1.0, r=90, a="drive", to=[540, 1500]), step=("1", "Caminhões")),
    sc("Sem diesel: mercado *vazio* em poucos dias.", "store", char=ch("scared"), step=("2", "Mercado\nvazio"), cam="shake"),
    sc("Remédio deixa de chegar na *farmácia* e no hospital.", "hospital", pr("pill", 540, 880, 1.1), step=("3", "Remédios")),
    sc("E o ônibus para. Muita gente não *consegue* *trabalhar*.", "city_day", pr("car", 540, 1000, 1.1), pr("cross", 700, 900, 0.5, d=0.6)),
    sc("Não é teoria. Em *2018*, a greve dos caminhoneiros parou o país por uns *dez* *dias*.", "red", stat=st("10 dias", "greve dos caminhoneiros", "maio de 2018", size=160), step=("*", "Já\naconteceu")),
    sc("Posto sem combustível, prateleira vazia e *aula* cancelada.", "store", pr("gas_pump", 540, 900, 1.0)),
    sc("A lição: tenha sempre comida e *água* pra pelo menos uma semana em casa.", "kitchen", pr("can", 400, 1130, 1.0), pr("bottle", 650, 1110, 0.9, d=0.3)),
    bell("Você lembra da greve de 2018? Comenta."),
  ])

EP["ep23"] = dict(slug="golpes-do-pix", title=["Os golpes de pix", "que mais caem"],
  caption="Os golpes de Pix que mais pegam brasileiro. 💸 O 2 já pegou alguém da sua família. Manda pra eles. #golpe #pix #seguranca",
  scenes=[
    sc("Estes são os golpes de *Pix* que mais pegam brasileiro. O segundo já pegou alguém da sua família.", "red", pr("phone", 540, 880, 1.5, label="PIX")),
    sc("Primeiro: a *falsa* *central* do banco. Te ligam dizendo que sua conta foi invadida.", "room_night", pr("phone", 700, 900, 1.0, label="BANCO"), char=ch("phone", 360), step=("1", "Falsa\ncentral")),
    sc("E pedem pra você fazer um Pix pra uma conta *segura*. Banco *nunca* pede isso.", "red", pr("cross", 540, 860, 1.1)),
    sc("Segundo: o *parente* com número novo no WhatsApp, pedindo dinheiro urgente.", "dark", pr("whatsapp", 540, 860, 1.3), step=("2", "Número\nnovo")),
    sc("Antes de pagar, *liga* pro número antigo da pessoa. Simples assim.", "city_day", char=ch("phone")),
    sc("Terceiro: o *QR* *code* falso, colado por cima do verdadeiro.", "store", pr("qr", 540, 880, 1.1), step=("3", "QR code\nfalso")),
    sc("Sempre confere o *nome* de quem vai receber antes de confirmar.", "green", pr("check", 540, 860, 1.1)),
    sc("Quarto: o *falso* *vendedor* com preço bom demais. Se é muito barato, desconfia.", "store", pr("cart", 540, 900, 1.2), step=("4", "Preço\nbom demais")),
    sc("Caiu? Avisa o banco *na* *hora* e pede o MED, o mecanismo de devolução do Pix.", "blue", pr("shield", 540, 860, 1.3), step=("*", "Se cair")),
    bell("Manda pra sua mãe, seu pai e seu avô. Agora."),
  ])

EP["ep24"] = dict(slug="perdido-na-floresta", title=["Se você se perder", "na floresta"],
  caption="Perdido na mata? O passo 1 é o mais difícil, e o mais importante. 🌲 #sobrevivencia #trilha #natureza #curiosidades",
  scenes=[
    sc("Se você se *perder* numa trilha, a primeira hora decide se te acham rápido.", "forest_night", char=ch("scared"), cam="shake"),
    sc("Primeiro: *para*. Não sai andando tentando achar o caminho.", "mountains", char=ch("stand"), step=("1", "Pare")),
    sc("Quem anda sem rumo se afasta da área onde a equipe de *resgate* vai procurar.", "dark", pr("map", 540, 860, 1.3)),
    sc("Segundo: procura *água*. Seguir um rio costuma levar até alguma casa.", "mountains", pr("drop", 540, 860, 1.0), step=("2", "Ache\nágua")),
    sc("Terceiro: faz um *abrigo* antes de escurecer. A noite na mata esfria muito.", "forest_night", pr("cabin", 540, 1450, 0.9), step=("3", "Abrigo")),
    sc("Quarto: deixa *sinais*. Roupa colorida, pedras em forma de SOS, fumaça.", "field_day", pr("sos", 540, 1300, 1.0), step=("4", "Sinais")),
    sc("Três apitos ou três gritos seguidos é o sinal universal de *socorro*.", "forest_night", pr("bell", 540, 860, 0.9)),
    sc("E a regra de ouro: antes de qualquer trilha, *avisa* alguém de onde você vai e quando volta.", "city_day", char=ch("phone"), step=("*", "Regra\nde ouro")),
    bell("Salva pra sua próxima trilha."),
  ])

EP["ep25"] = dict(slug="nunca-dormir", title=["E se você", "nunca dormisse?"],
  caption="Um garoto ficou 11 dias sem dormir. O que aconteceu com ele? 😵 #sono #ciencia #curiosidades #fatos",
  scenes=[
    sc("Em *1964*, um estudante de 17 anos ficou acordado por *11* *dias* seguidos.", "bedroom", pr("calendar", 760, 760, 0.6, label="11"), char=ch("stand")),
    sc("Foram *264* *horas* sem dormir. Um dos recordes mais famosos da ciência.", "red", stat=st("264 h", "acordado", "Randy Gardner, 1964", size=170)),
    sc("No dia dois, ele já tinha dificuldade pra *focar* *os* *olhos*.", "office", char=ch("think", face="sad"), step=("1", "Dia 2")),
    sc("No dia quatro, começou a *ver* *coisas*. Achou que era um jogador famoso.", "purple", pr("brain", 540, 860, 1.3, wob=10), step=("2", "Dia 4"), cam="shake"),
    sc("No dia onze, mal conseguia completar uma conta simples de *subtração*.", "classroom", char=ch("scared"), step=("3", "Dia 11")),
    sc("Quando finalmente dormiu, apagou por umas *14* *horas*.", "bedroom", pr("bed", 540, 1300, 1.4), step=("*", "O fim")),
    sc("Hoje, os cientistas *não* repetem esse tipo de experimento. É perigoso demais.", "hospital", pr("warning", 540, 860, 1.2)),
    sc("Porque dormir não é perda de tempo. É quando o cérebro faz a *faxina* do dia.", "night_field", pr("brain", 540, 860, 1.2)),
    bell("Qual o máximo que você já ficou sem dormir? Comenta."),
  ])

EP["ep26"] = dict(slug="celular-na-agua", title=["Celular caiu", "na água?"],
  caption="Celular caiu na água? Esquece o arroz. 📱💧 A própria Apple pede pra não fazer. #celular #dicas #iphone #curiosidades",
  scenes=[
    sc("Seu celular caiu na água. E você corre pro pote de *arroz*.", "kitchen", pr("phone", 540, 880, 1.3, a="fall"), pr("drop", 720, 760, 0.5, d=0.5)),
    sc("Errado. A própria Apple pede pra *não* *usar* *arroz*.", "red", pr("cross", 540, 860, 1.1)),
    sc("O pó do arroz pode entrar nas entradas e *estragar* o aparelho.", "dark", pr("warning", 540, 860, 1.1)),
    sc("Primeiro: *desliga* na hora. Não fica testando se ainda funciona.", "room_night", pr("phone_off", 540, 880, 1.3), step=("1", "Desligue")),
    sc("Segundo: *não* *carrega*. Água mais eletricidade é curto-circuito.", "dark", pr("plug", 540, 880, 1.2), pr("cross", 680, 760, 0.5, d=0.6), step=("2", "Não\ncarregue")),
    sc("Terceiro: bate de leve com a entrada virada *pra* *baixo* pra tirar a água.", "kitchen", pr("phone", 540, 880, 1.2, r=180, wob=10), step=("3", "Entrada\npra baixo")),
    sc("Quarto: deixa secar num lugar *ventilado* por pelo menos um dia.", "field_day", pr("phone", 540, 880, 1.2), step=("4", "Ar e\npaciência")),
    sc("E o secador de cabelo? Também *não*. O calor pode danificar a tela e a bateria.", "red", pr("cross", 540, 860, 1.1), step=("*", "E o\nsecador?")),
    bell("Você já usou o arroz? Comenta a verdade."),
  ])

EP["ep27"] = dict(slug="mitos-que-voce-acredita", title=["Mitos que você", "ainda acredita"],
  caption="4 mitos que você aprendeu e são MENTIRA. 🤯 O 3 me pegou. #mitos #curiosidades #fatos #vocesabia",
  scenes=[
    sc("Quatro coisas que você aprendeu e são *mentira*.", "classroom", char=ch("think")),
    sc("Primeiro: a gente só usa *10%* do cérebro.", "purple", pr("brain", 540, 860, 1.4), step=("1", "10% do\ncérebro")),
    sc("Falso. Exames mostram o cérebro *inteiro* trabalhando ao longo do dia.", "red", pr("cross", 540, 860, 1.1)),
    sc("Segundo: um raio não cai *duas* *vezes* no mesmo lugar.", "night_field", pr("lightning", 540, 800, 1.4), step=("2", "O raio")),
    sc("Falso. O Empire State, em Nova York, leva uns *20* *raios* por ano.", "city_night", pr("lightning", 540, 600, 1.0), stat=None),
    sc("Terceiro: chiclete engolido fica *sete* *anos* na barriga.", "blue", pr("heart", 540, 860, 0.9), step=("3", "Chiclete")),
    sc("Falso. Ele sai pelo caminho normal em *poucos* *dias*.", "green", pr("check", 540, 860, 1.1)),
    sc("Quarto: dá pra ver a *Muralha* *da* *China* do espaço.", "space", pr("globe", 540, 820, 1.4), step=("4", "A muralha")),
    sc("Falso. Ela é comprida, mas é *estreita* demais. Nem os astronautas conseguem ver a olho nu.", "space", pr("cross", 540, 820, 1.0), step=("*", "Todos\nfalsos")),
    bell("Qual desses você acreditava? Comenta o número."),
  ])

EP["ep28"] = dict(slug="se-os-mosquitos-sumissem", title=["E se os mosquitos", "sumissem?"],
  caption="E se a gente eliminasse TODOS os mosquitos do mundo? 🦟 Os cientistas não concordam. #mosquito #dengue #ciencia #curiosidades",
  scenes=[
    sc("E se a gente eliminasse *todos* os mosquitos do planeta?", "forest_night", pr("mosquito", 540, 860, 1.3)),
    sc("O mosquito é o animal que mais *mata* gente no mundo. Por causa das doenças que transmite.", "red", pr("mosquito", 540, 860, 1.2), cam="shake"),
    sc("Só a *malária* mata mais de meio milhão de pessoas por ano.", "red", stat=st("+500 mil", "mortes por malária por ano", "no mundo", "OMS", size=150), step=("1", "Malária")),
    sc("No Brasil, *2024* teve mais de seis milhões de casos prováveis de dengue. Um recorde.", "blue", stat=st("+6 milhões", "casos prováveis de dengue", "Brasil, 2024", "Ministério da Saúde", size=130), step=("2", "Dengue")),
    sc("Então é só *acabar* com eles? Não é tão simples.", "purple", char=ch("shrug")),
    sc("Muitos peixes, sapos e pássaros *comem* mosquitos e suas larvas.", "beach", pr("drop", 540, 880, 1.0), step=("3", "Comida")),
    sc("E alguns mosquitos ajudam a *polinizar* plantas.", "field_day", pr("tree", 540, 1100, 1.1), step=("4", "Plantas")),
    sc("Por isso os cientistas focam nas espécies que transmitem *doença*. Não em todas.", "green", pr("shield", 540, 860, 1.2), step=("*", "O plano")),
    bell("Você eliminaria todos? Comenta sim ou não."),
  ])

EP["ep29"] = dict(slug="fim-do-dinheiro-vivo", title=["Se o dinheiro", "vivo acabasse"],
  caption="E se as notas de dinheiro deixassem de existir? 💵 Tem país quase lá. Você apoiaria? #dinheiro #pix #economia #polemica",
  scenes=[
    sc("E se o *dinheiro* *vivo* acabasse de vez? Só Pix e cartão.", "green", pr("money", 540, 860, 1.4), pr("cross", 700, 760, 0.5, d=0.8)),
    sc("Tem país chegando perto. Na *Suécia*, menos de uma em cada dez compras é em dinheiro.", "blue", stat=st("menos de 10%", "das compras em dinheiro", "Suécia", "Banco Central da Suécia", size=120)),
    sc("O lado bom: *menos* *assalto*, menos dinheiro falso, menos sonegação.", "city_day", pr("shield", 540, 860, 1.2), step=("1", "O lado\nbom")),
    sc("O lado ruim: *tudo* que você compra fica registrado.", "dark", pr("ai_eye", 540, 860, 1.2), step=("2", "O lado\nruim")),
    sc("Banco e governo sabem *onde*, *quando* e *com* *o* *quê* você gastou.", "red", pr("card", 540, 860, 1.3), cam="shake"),
    sc("E se o sistema cai, ninguém consegue *pagar* *nada*.", "store", pr("phone", 540, 880, 1.1, screen="#E5322D", label="ERRO"), step=("3", "Se\ncair")),
    sc("Quem não tem conta ou celular, como muitos *idosos*, fica de fora.", "city_day", char=ch("think", face="sad"), step=("4", "Excluídos")),
    sc("Praticidade ou *privacidade*? Essa é a briga.", "purple", pr("scale", 540, 900, 1.4), step=("*", "A\npolêmica")),
    bell("Você apoiaria o fim das notas? Comenta sim ou não."),
  ])

EP["ep30"] = dict(slug="30-dias-fast-food", title=["30 dias só", "de fast food"],
  caption="Um homem comeu só fast food por 30 dias. O resultado chocou. 🍔 #fastfood #saude #curiosidades #fatos",
  scenes=[
    sc("Um homem decidiu comer *só* *fast* *food* por 30 dias.", "store", pr("burger", 540, 880, 1.4)),
    sc("Foi o documentário *Super* *Size* *Me*, de 2004.", "red", pr("tv", 540, 860, 1.3)),
    sc("A regra: três refeições por dia, e aceitar o tamanho *maior* sempre que oferecessem.", "kitchen", pr("burger", 400, 900, 0.8), pr("soda", 680, 900, 0.8, d=0.3), step=("1", "A regra")),
    sc("Na primeira semana, ele já sentia *enjoo* e cansaço depois de comer.", "room_night", char=ch("think", face="sad"), step=("2", "Semana 1")),
    sc("No fim do mês, tinha ganhado uns *11* *quilos*.", "red", stat=st("+11 kg", "em 30 dias", "Super Size Me, 2004", size=170), step=("3", "Dia 30")),
    sc("E os médicos ficaram preocupados com o *fígado* e o colesterol dele.", "hospital", pr("warning", 540, 860, 1.1)),
    sc("Depois do filme, a rede *tirou* o tamanho gigante do cardápio.", "store", pr("soda", 540, 880, 1.2), pr("cross", 680, 760, 0.5, d=0.6), step=("*", "O que\nmudou")),
    sc("Mas o filme também recebeu *críticas*, e o diretor admitiu depois que bebia muito naquela época.", "purple", pr("scale", 540, 900, 1.3)),
    bell("Você aguentaria 30 dias? Comenta."),
  ])

EP["ep31"] = dict(slug="se-a-terra-parasse", title=["Se a terra", "parasse de girar"],
  caption="Se a Terra parasse de girar por um segundo, tudo ia voar. 🌍💨 #terra #ciencia #espaco #curiosidades",
  scenes=[
    sc("Se a Terra *parasse* *de* *girar* agora, você sairia voando.", "space", pr("globe", 540, 820, 1.5)),
    sc("Aqui no equador, a Terra gira a uns *1.670* km por hora.", "red", stat=st("1.670 km/h", "velocidade no equador", "rotação da Terra", "NASA", size=130)),
    sc("Você gira junto com ela, sem perceber. Igual dentro de um avião.", "sky", pr("plane", 540, 880, 1.2)),
    sc("Primeiro: tudo que não estivesse preso seria *arremessado* pro leste.", "city_day", char=ch("scared", a="pop"), step=("1", "Arremesso"), cam="shake"),
    sc("Segundo: o ar continuaria girando. Ventos mais fortes que qualquer *furacão*.", "sky", pr("arrow", 540, 880, 1.3, dir=0), step=("2", "Ventos")),
    sc("Terceiro: os oceanos se mexeriam em ondas *gigantes*.", "ocean", pr("wave", 540, 1000, 1.4), step=("3", "Oceanos")),
    sc("E depois? O dia duraria *seis* *meses*, e a noite outros seis.", "desert", pr("sun", 540, 700, 1.0), step=("4", "Dia de\n6 meses")),
    sc("A boa notícia: isso é *praticamente* *impossível*. A Terra desacelera só milésimos de segundo por século.", "green", pr("check", 540, 860, 1.1), step=("*", "Relaxa")),
    bell("Qual parte te assustou mais? Comenta."),
  ])

EP["ep32"] = dict(slug="se-as-abelhas-sumissem", title=["E se as abelhas", "sumissem?"],
  caption="Se as abelhas sumissem, seu prato ficaria muito mais vazio. 🐝 #abelhas #natureza #ciencia #curiosidades",
  scenes=[
    sc("Se as *abelhas* sumissem amanhã, o seu prato ficaria bem mais vazio.", "field_day", pr("bee", 540, 860, 1.2)),
    sc("Elas *polinizam* as flores, e é da flor que nasce o fruto.", "field_day", pr("bee", 400, 820, 0.7), pr("tree", 680, 1150, 1.0, d=0.3), step=("1", "Polinização")),
    sc("Cerca de *três* *quartos* dos principais cultivos do mundo dependem em parte de polinizadores.", "green", stat=st("~75%", "dos principais cultivos", "dependem de polinizadores", "FAO", size=170, color=GREEN)),
    sc("Sem abelhas: *café*, maçã, melancia e *chocolate* ficariam raros e caros.", "store", pr("coffee", 380, 900, 0.9), pr("cart", 700, 900, 0.9, d=0.3), step=("2", "Comida\ncara"), cam="shake"),
    sc("Arroz, trigo e milho continuam, porque o *vento* poliniza eles.", "field_day", pr("check", 540, 860, 1.0)),
    sc("Mas a comida ficaria mais *sem* *graça* e menos nutritiva.", "kitchen", char=ch("think", face="sad"), step=("3", "Sem\nvariedade")),
    sc("E elas estão *sumindo*: veneno de lavoura, desmatamento e doenças.", "red", pr("warning", 540, 860, 1.2), step=("*", "O\nproblema")),
    sc("Quer ajudar? Planta *flor* na varanda e não mata abelha que entrar em casa.", "sunset", pr("bee", 540, 860, 1.0), char=ch("cheer")),
    bell("Manda pra alguém que tem medo de abelha."),
  ])

EP["ep33"] = dict(slug="semana-de-4-dias", title=["Semana de trabalho", "de 4 dias"],
  caption="E se você trabalhasse só 4 dias por semana, ganhando o mesmo? 🗓️ O Reino Unido testou. Você apoia? #trabalho #carreira #polemica",
  scenes=[
    sc("E se você trabalhasse só *quatro* *dias* por semana, com o mesmo salário?", "office", pr("calendar", 540, 860, 1.3, label="4")),
    sc("O *Reino* *Unido* testou isso em 2022, com 61 empresas.", "blue", pr("briefcase", 540, 880, 1.3), step=("1", "O teste")),
    sc("Depois de seis meses, *56* delas decidiram continuar.", "green", stat=st("56 de 61", "empresas continuaram", "teste no Reino Unido, 2022", size=160, color=GREEN), step=("2", "Resultado")),
    sc("Os funcionários relataram menos *estresse* e menos esgotamento.", "field_day", char=ch("cheer")),
    sc("E muitas empresas disseram que a produtividade se *manteve*.", "office", pr("chart_up", 540, 880, 1.3)),
    sc("O outro lado: comércio, hospital e fábrica não podem simplesmente *fechar* um dia.", "hospital", char=ch("shrug"), step=("3", "O outro\nlado")),
    sc("E pra empresa pequena, contratar mais gente pra cobrir pode *custar* *caro*.", "red", pr("money", 540, 860, 1.2)),
    sc("Futuro do trabalho ou *sonho* impossível? É o debate do momento.", "purple", pr("scale", 540, 900, 1.4), step=("*", "A\npolêmica")),
    bell("Você trocaria um dia de folga por salário menor? Comenta."),
  ])

EP["ep34"] = dict(slug="cartao-clonado", title=["Se seu cartão", "for clonado"],
  caption="Cartão clonado? Faça isso nos primeiros 10 minutos. 💳 Salva pra não esquecer. #cartao #golpe #seguranca #dinheiro",
  scenes=[
    sc("Chegou uma compra que você *não* fez. Seu cartão foi *clonado*.", "room_night", pr("phone", 540, 880, 1.3, screen="#E5322D", label="R$ 2.390"), cam="shake"),
    sc("Primeiro: *bloqueia* o cartão no app do banco, na hora.", "dark", pr("lock", 540, 860, 1.2), step=("1", "Bloqueie")),
    sc("Segundo: liga pro banco e *contesta* cada compra que não foi sua.", "office", char=ch("phone"), step=("2", "Conteste")),
    sc("Você tem direito ao *estorno* de compras que não fez.", "green", pr("check", 540, 860, 1.1)),
    sc("Terceiro: faz um *boletim* *de* *ocorrência*. Dá pra fazer pela internet.", "blue", pr("book", 540, 880, 1.1), step=("3", "B.O.")),
    sc("Quarto: troca as *senhas* do app e do e-mail.", "dark", pr("lock", 540, 860, 1.0), step=("4", "Senhas")),
    sc("Pra evitar: usa o *cartão* *virtual* nas compras online. Ele muda o número.", "green", pr("card", 540, 860, 1.3), step=("*", "Prevenção")),
    sc("E nunca passa senha ou código por *telefone*. Banco não pede.", "red", pr("cross", 540, 860, 1.1)),
    bell("Manda pra quem ainda usa o mesmo cartão pra tudo."),
  ])

EP["ep35"] = dict(slug="cachorro-bravo", title=["Se um cachorro", "bravo vier"],
  caption="Um cachorro bravo vem na sua direção. O que você faz? 🐕 Correr é o pior erro. #cachorro #seguranca #curiosidades",
  scenes=[
    sc("Um cachorro *bravo* vem correndo na sua direção. O que você faz?", "city_day", pr("dog", 760, 1560, 1.0, angry=True, flip=True), char=ch("scared", 330), cam="shake"),
    sc("Primeiro: *não* *corre*. Correr ativa o instinto de caça dele.", "red", pr("cross", 540, 860, 1.1), step=("1", "Não corra")),
    sc("E ele é muito mais *rápido* que você.", "field_day", pr("dog", 540, 1500, 1.2, angry=True, a="drive", to=[700, 1500])),
    sc("Segundo: fica *parado*, de lado, com os braços junto do corpo.", "city_day", char=ch("stand"), step=("2", "Fique\nparado")),
    sc("Terceiro: não encara nos *olhos*. Pra ele, isso é desafio.", "dark", pr("cross", 540, 860, 1.0), step=("3", "Sem\nencarar")),
    sc("Quarto: fala *calmo* e firme, e se afasta devagar, de costas.", "city_day", char=ch("walk", 600, to=360), step=("4", "Saia\ndevagar")),
    sc("Se ele atacar, coloca a *mochila* ou a bolsa na frente, e protege o rosto e o pescoço.", "red", pr("warning", 540, 860, 1.1), step=("*", "Se atacar")),
    sc("Mordeu? Lava com *água* *e* *sabão* e vai pro posto de saúde por causa da raiva.", "hospital", pr("drop", 540, 860, 1.0)),
    bell("Salva e manda pra quem anda muito na rua."),
  ])

EP["ep36"] = dict(slug="morar-em-marte", title=["Você aguentaria", "morar em Marte?"],
  caption="Bilionários querem levar gente pra Marte. Você iria? 🚀🔴 Lê as condições primeiro. #marte #espaco #ciencia #curiosidades",
  scenes=[
    sc("Bilionário quer mandar gente pra *Marte*. Você aguentaria morar lá?", "space", pr("planet_mars", 540, 820, 1.5)),
    sc("Primeiro: a viagem leva uns *sete* *meses*. Só de ida.", "space", pr("rocket", 540, 900, 1.2, a="drive", to=[700, 600], r=30), step=("1", "A viagem")),
    sc("Segundo: a temperatura média é de uns *60* *graus* *negativos*.", "mars", pr("thermo", 540, 880, 1.3, cold=True), step=("2", "O frio")),
    sc("Terceiro: o ar é quase todo *gás* *carbônico*. Sem oxigênio pra respirar.", "mars", pr("warning", 540, 860, 1.1), step=("3", "Sem ar")),
    sc("Quarto: sem campo magnético, a *radiação* do espaço chega direto no chão.", "mars", pr("sunflare", 540, 700, 0.7), step=("4", "Radiação")),
    sc("E a gravidade é só um *terço* da Terra. Seus ossos e músculos enfraquecem.", "mars", char=ch("cheer", y=1650)),
    sc("Uma mensagem pra sua família pode levar até *20* *minutos* pra chegar.", "dark", pr("phone", 540, 880, 1.2), step=("*", "A\nsaudade")),
    sc("Aventura histórica ou *missão* *suicida*? Depende de quem você pergunta.", "purple", pr("scale", 540, 900, 1.4)),
    bell("Você iria pra Marte? Comenta sim ou não."),
  ])

EP["ep37"] = dict(slug="tempestade-solar", title=["Se uma tempestade", "solar chegasse"],
  caption="Em 1859 o Sol fez telégrafos soltarem faísca. Se acontecesse hoje… ☀️⚡ #sol #espaco #tecnologia #curiosidades",
  scenes=[
    sc("Em *1859*, uma explosão no Sol fez telégrafos soltarem *faísca*.", "space", pr("sunflare", 540, 820, 1.0)),
    sc("Foi o *Evento* *Carrington*, a maior tempestade solar já registrada.", "red", stat=st("1859", "Evento Carrington", "a maior tempestade solar registrada", size=180)),
    sc("Teve *aurora* boreal vista até perto do Caribe.", "night_field", pr("sunflare", 540, 500, 0.4), char=ch("cheer"), step=("1", "Auroras")),
    sc("Se acontecesse hoje, o problema seria a *rede* *elétrica*.", "city_night", pr("lightning", 540, 820, 1.2), step=("2", "Hoje"), cam="shake"),
    sc("Em *1989*, uma tempestade bem menor deixou o Quebec, no Canadá, *nove* *horas* sem luz.", "city_night", pr("plug", 540, 860, 1.1), dim=0.5),
    sc("Satélites, *GPS* e internet também poderiam ser afetados.", "space", pr("globe", 540, 820, 1.2), pr("warning", 760, 640, 0.5, d=0.5), step=("3", "GPS e\nsatélites")),
    sc("A boa notícia: hoje existem satélites que *vigiam* o Sol e dão alguns dias de aviso.", "green", pr("shield", 540, 860, 1.2), step=("*", "A boa\nnotícia")),
    sc("O suficiente pras empresas de energia se *protegerem*.", "city_day", pr("check", 540, 860, 1.0)),
    bell("Sabia disso? Comenta, e segue pra mais."),
  ])

EP["ep38"] = dict(slug="buraco-atraves-da-terra", title=["Se você pulasse num buraco", "que atravessa a terra"],
  caption="Se você pulasse num buraco que atravessa a Terra, chegaria do outro lado em 42 minutos. 🌍🕳️ #ciencia #fisica #curiosidades",
  scenes=[
    sc("Se existisse um buraco que *atravessa* a Terra inteira, e você pulasse nele?", "field_day", pr("hole", 540, 1450, 1.4), char=ch("scared", y=1400)),
    sc("A viagem até o outro lado levaria uns *42* *minutos*.", "red", stat=st("42 min", "de um lado ao outro", "cálculo clássico da física", size=170), step=("1", "42\nminutos")),
    sc("Você cairia cada vez *mais* *rápido* até o centro do planeta.", "space", pr("globe", 540, 820, 1.4), step=("2", "A queda")),
    sc("Lá no centro, a temperatura passa dos *5* *mil* *graus*. Quente como a superfície do Sol.", "red", pr("fire", 540, 900, 1.3), step=("3", "O centro"), cam="shake"),
    sc("Passando o centro, você começa a *frear*, até parar bem na borda do outro lado.", "space", pr("arrow", 540, 820, 1.2, dir=-90)),
    sc("Se ninguém te segurar, você cai de *volta*. E fica indo e voltando pra sempre.", "purple", pr("arrow", 400, 860, 0.8, dir=90), pr("arrow", 680, 860, 0.8, dir=-90, d=0.3), step=("*", "O final")),
    sc("O buraco mais fundo já cavado tem uns *12* *quilômetros*. Nem arranhou a crosta.", "desert", pr("hole", 540, 1400, 1.0)),
    bell("Você pularia? Comenta, e segue pra parte dois."),
  ])

EP["ep39"] = dict(slug="ilha-deserta", title=["Se você ficasse preso", "numa ilha deserta"],
  caption="Preso numa ilha deserta: qual a primeira coisa que você faz? 🏝️ Não é procurar comida. #sobrevivencia #ilha #curiosidades",
  scenes=[
    sc("Se você acordasse preso numa *ilha* *deserta*, qual seria o primeiro passo?", "island", char=ch("think", y=1520)),
    sc("Não é procurar comida. Lembra da regra dos três.", "island", pr("can", 540, 1300, 0.9), pr("cross", 660, 1200, 0.5, d=0.6)),
    sc("Primeiro: *água*. Nunca bebe água do mar. O sal desidrata ainda mais.", "beach", pr("drop", 540, 860, 1.2), pr("cross", 680, 760, 0.5, d=0.8), step=("1", "Água")),
    sc("Junta água da chuva, ou a do *coco*.", "island", pr("palm", 540, 1200, 1.0)),
    sc("Segundo: *sombra* e abrigo. O sol forte derruba mais rápido que a fome.", "island", pr("sun", 760, 500, 0.8), step=("2", "Abrigo")),
    sc("Terceiro: *fogo*. Pra ferver água, cozinhar e ser visto de longe.", "night_field", pr("fire", 540, 1300, 1.2), step=("3", "Fogo")),
    sc("Quarto: escreve *SOS* bem grande na areia, com pedras ou galhos.", "island", pr("sos", 540, 1480, 0.9), step=("4", "SOS")),
    sc("E fica perto da *praia*. É de lá que barco e avião vão te ver.", "beach", pr("plane", 760, 500, 0.6, a="drive", to=[300, 450]), char=ch("cheer", y=1650), step=("*", "Fique\nvisível")),
    bell("Que objeto você levaria pra ilha? Comenta."),
  ])

EP["ep40"] = dict(slug="incendio-em-casa", title=["Se sua casa", "pegar fogo"],
  caption="Se sua casa pegar fogo, você tem poucos minutos. O que fazer? 🔥 O passo 1 salva vidas. #incendio #seguranca #bombeiros",
  scenes=[
    sc("Se sua casa pegar fogo, você tem *poucos* *minutos* pra sair.", "room_night", pr("fire", 540, 1300, 1.4), cam="shake"),
    sc("E quem mais mata num incêndio não é o fogo. É a *fumaça*.", "dark", pr("smoke", 540, 1100, 1.6)),
    sc("Primeiro: sai *rastejando*. O ar mais limpo fica perto do chão.", "room_night", pr("smoke", 540, 700, 1.4), char=ch("stand", y=1760, s=1.0), step=("1", "Rasteje")),
    sc("Segundo: antes de abrir uma porta, toca nela com as *costas* *da* *mão*.", "room_night", pr("door", 540, 1000, 1.2), step=("2", "Teste a\nporta")),
    sc("Se estiver *quente*, tem fogo do outro lado. Procura outra saída.", "red", pr("thermo", 540, 880, 1.2)),
    sc("Terceiro: *nunca* usa o elevador num incêndio.", "elevator", pr("cross", 540, 860, 1.1), step=("3", "Escada")),
    sc("Quarto: não volta pra buscar *nada*. Nem celular, nem documento.", "city_night", char=ch("run", 260, to=760), step=("4", "Não\nvolte")),
    sc("Já do lado de fora, liga pro *193*. Os bombeiros.", "red", stat=st("193", "bombeiros", "ligação gratuita", size=190), step=("*", "Ligue")),
    bell("Salva e manda pra sua família."),
  ])


if __name__ == "__main__":
    for ep, d in EP.items():
        (HERE / f"{ep}.json").write_text(json.dumps(d, ensure_ascii=False, indent=1))
    words = {ep: sum(len(s["say"].split()) for s in d["scenes"]) for ep, d in EP.items()}
    print(len(EP), "episodes;", "words:", words)
