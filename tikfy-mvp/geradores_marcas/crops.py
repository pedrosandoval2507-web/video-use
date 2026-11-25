from PIL import Image
U='/root/.claude/uploads/e4d068d3-6b80-5f96-9e19-4e3058f868de/'
F={'g1':'3ff025c8','g2':'23898770','g3':'4743a6c3','a1':'203e74b9','a2':'48d00b40','a3':'d5dda653','s1':'617c302f','s2':'52832a03','j1':'4407f612','j2':'6fd3b645','j3':'ca0d1458','d1':'3b2c47c4','d2':'084de1dd','d3':'4ff66a14'}
# name: (shot, x0,y0,x1,y1, extra_top)  coords in 2000-wide display space
C={
 # GUMMY HAIR
 'gummy/kit_tutti':('g1',45,240,410,548,0),'gummy/quatro_potes':('g1',430,240,797,615,0),'gummy/promopack':('g1',1203,385,1570,755,0),
 'gummy/for_men':('g1',45,640,410,1198,0),'gummy/zero_checks':('g1',430,740,797,1082,0),'gummy/kids_hearts':('g1',817,715,1183,1040,0),
 'gummy/verde_pote':('g1',1203,855,1570,1228,0),'gummy/zero_2potes':('g1',1590,690,1955,1068,45),
 'gummy/abacaxi':('g2',45,243,410,745,0),'gummy/the_original':('g2',430,465,797,840,0),'gummy/verde_gomas':('g2',817,228,1183,603,0),
 'gummy/tabela':('g2',817,693,1183,1060,0),'gummy/trio_night':('g2',45,838,410,1212,0),'gummy/tres_verdes':('g2',430,930,797,1278,0),'gummy/vermelho_caixa':('g2',1203,955,1570,1330,0),
 'gummy/caixa_morango':('g3',45,222,410,597,0),'gummy/rosa_coracoes':('g3',430,222,797,597,0),'gummy/vermelho_pote':('g3',817,222,1183,597,0),
 'gummy/mao_gomas':('g3',1203,222,1570,597,0),'gummy/rosa_pote':('g3',1590,222,1955,597,0),'gummy/pote_grande':('g3',430,688,797,1192,45),'gummy/roxo_uva':('g3',817,688,1183,1047,0),'gummy/magenta':('g3',1203,688,1570,1218,0),
 # AURA
 'aura/logo':('a1',45,228,410,402,0),'aura/glamour':('a1',1203,568,1570,943,0),'aura/oriental':('a1',45,958,410,1333,0),'aura/caixa_rosa':('a1',1590,1000,1955,1378,0),'aura/logo_roxo':('a1',1590,535,1955,910,0),
 'aura/grama':('a2',817,485,1183,862,0),'aura/logo_coral':('a2',1203,357,1570,735,0),'aura/caixa_dourada':('a2',1590,322,1955,700,0),'aura/serum':('a2',1203,825,1570,1200,0),
 'aura/trio_splash':('a2',45,875,410,1250,0),'aura/gourmand':('a2',1590,790,1955,1167,0),'aura/nossa':('a2',430,942,797,1390,0),
 'aura/splash_azul':('a3',817,228,1183,605,0),'aura/manteiga':('a3',1203,215,1570,530,0),'aura/azul_tubo':('a3',1203,620,1570,995,0),'aura/trio_dourado':('a3',817,695,1183,1199,0),'aura/sephora':('a3',1590,915,1955,1390,0),
 # SAINT GERMAIN
 'sg/azul':('s1',45,353,410,1000,0),'sg/pulso_dourado':('s1',430,555,797,1040,0),'sg/pulso_preto':('s1',1203,258,1570,637,0),'sg/carro':('s1',1590,200,1955,700,0),
 'sg/preto':('s2',45,250,410,627,0),'sg/logo_txt':('s2',430,250,797,629,0),'sg/dourado_mesh':('s2',817,250,1183,627,0),'sg/logo_sg':('s2',45,717,410,1094,0),
 'sg/dois_pretos':('s2',430,717,797,880,0),'sg/chrono':('s2',1590,920,1955,1297,0),'sg/logo_preto':('s2',1203,717,1570,1094,0),
 # JACK LINK'S
 'jack/logo':('j1',45,205,410,540,0),'jack/kit16':('j1',430,205,797,537,0),'jack/linguicinha_mb':('j1',430,628,797,1003,0),'jack/zero':('j1',817,620,1183,1040,0),
 'jack/muitos':('j1',1203,205,1570,707,0),'jack/vermelho':('j1',1590,205,1955,537,0),'jack/chili':('j1',1590,628,1955,1003,0),'jack/churrasco':('j1',1203,800,1570,1283,0),
 'jack/kit3':('j1',45,935,410,1312,0),'jack/proteina_verdade':('j1',1590,1095,1955,1390,0),'jack/packs_red':('j1',45,630,410,842,0),
 'jack/teriyaki':('j2',430,563,797,1078,0),'jack/caixa12':('j2',1590,442,1955,818,0),'jack/ling_churrasco':('j2',1590,908,1955,1287,0),'jack/infografico':('j2',1203,205,1570,540,0),
 'jack/chili_pimenta':('j3',45,282,410,658,0),'jack/caixa_red':('j3',1203,248,1570,625,0),'jack/edicao':('j3',430,460,797,836,0),'jack/ling_original':('j3',1203,1020,1570,1390,0),'jack/tigela':('j3',817,418,1183,830,0),
 # DUX
 'dux/conc_cookies':('d1',45,232,410,606,0),'dux/creatina':('d1',430,232,797,606,0),'dux/isolado_choc':('d1',817,232,1183,699,0),'dux/conc_900':('d1',1203,232,1570,606,0),
 'dux/kit':('d1',1590,232,1955,606,0),'dux/smoothie':('d1',45,697,410,1072,0),'dux/isolado_baunilha':('d1',430,697,797,1077,45),'dux/sache':('d1',817,790,1183,1164,0),
 'dux/conc_grande':('d1',1203,697,1570,1318,0),'dux/fresh':('d1',1590,697,1955,1072,0),
 'dux/isolado_bag':('d2',45,262,410,657,0),'dux/gel':('d2',45,745,410,1120,0),'dux/fresh_creatina':('d2',430,755,797,1162,0),'dux/sabores':('d2',817,848,1183,1222,0),
 'dux/energy_kick':('d2',1203,440,1570,1137,0),'dux/cafeina':('d2',1590,712,1955,1180,0),'dux/coco':('d2',1590,262,1955,622,0),
 'dux/pre':('d3',817,280,1183,654,0),'dux/fresh_avela':('d3',430,222,797,597,0),'dux/shake':('d3',1590,238,1955,612,0),'dux/morango':('d3',430,688,797,1122,0),
}
for k,(sh,x0,y0,x1,y1,et) in C.items():
    im=Image.open(U+F[sh]+'-image.png').convert('RGB'); s=im.width/2000
    box=(int((x0+8)*s),int((y0+8+et)*s),int((x1-8)*s),int((y1-52)*s))
    import os; os.makedirs('img/'+k.split('/')[0],exist_ok=True)
    im.crop(box).save(f'img/{k}.png')
print(len(C))
