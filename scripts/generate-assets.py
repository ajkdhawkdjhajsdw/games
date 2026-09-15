#!/usr/bin/env python3
"""Deterministic original development art/audio; human production approval pending."""
from __future__ import annotations

import argparse
import hashlib
import json
import math
from pathlib import Path
import random
import shutil
import subprocess
import urllib.request

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/assets'
MASTERS = ROOT / '.hoplite/asset-masters'
SEED = 9404
S = 2
FONT_REV = 'c1eda9233c33ad7775b27efd794f931095cf6133'
CREAM = '#eadbb8'
INK = '#173f48'


class Painter:
    def __init__(self, w, h, background, seed=SEED):
        self.w, self.h = w, h
        self.im = Image.new('RGBA', (w * S, h * S), background)
        self.d = ImageDraw.Draw(self.im)
        self.r = random.Random(seed)

    def poly(self, xy, fill, outline=None, width=1):
        self.d.polygon([(round(x*S), round(y*S)) for x,y in xy], fill=fill)
        if outline:
            self.line(xy + [xy[0]], outline, width)

    def line(self, xy, fill, width=1):
        self.d.line([(round(x*S), round(y*S)) for x,y in xy], fill=fill, width=max(1,round(width*S)), joint='curve')

    def ellipse(self, box, fill, outline=None, width=1):
        self.d.ellipse(tuple(round(v*S) for v in box), fill=fill, outline=outline, width=max(1,round(width*S)))

    def box(self, box, fill, outline=None, width=1):
        self.d.rectangle(tuple(round(v*S) for v in box), fill=fill, outline=outline, width=max(1,round(width*S)))

    def finish(self, texture=1.2):
        im = self.im.resize((self.w,self.h), Image.Resampling.LANCZOS)
        if texture:
            a = np.asarray(im).copy()
            noise = np.random.default_rng(SEED).normal(0,texture,(self.h,self.w,1))
            a[:,:,:3] = np.clip(a[:,:,:3].astype(float)+noise,0,255).astype('uint8')
            im = Image.fromarray(a)
        return im


def save(im, path, quality=86):
    dest = OUT / path
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.suffix == '.webp':
        im.save(dest, quality=quality, method=6)
    else:
        im.save(dest, optimize=True)


def tree(p, x, y, k=1):
    p.ellipse((x-19*k,y-3*k,x+27*k,y+15*k),'#37605a')
    p.line([(x,y+7*k),(x-1*k,y-25*k)],'#6b6550',5*k)
    for dx,dy,r,c in [(-10,-22,17,'#345e53'),(8,-24,19,'#446e56'),(-2,-39,18,'#527b59'),(-12,-35,11,'#66855e'),(10,-39,10,'#719164')]:
        p.ellipse((x+(dx-r)*k,y+(dy-r)*k,x+(dx+r)*k,y+(dy+r)*k),c)
    for _ in range(24):
        dx,dy=p.r.uniform(-20,18),p.r.uniform(-48,-14)
        p.line([(x+dx*k,y+dy*k),(x+(dx+3)*k,y+(dy-1)*k)],p.r.choice(['#859968','#315f52','#68895d']),1*k)


def cottage(p,x,y,w=65,h=48,roof='#bb7052',k=1):
    w,h=w*k,h*k
    p.poly([(x-w*.55,y+7*k),(x+w*.65,y+15*k),(x+w*.85,y+h*.5),(x-w*.45,y+h*.42)],'#648071')
    p.poly([(x-w/2,y-h*.18),(x+w/2,y-h*.10),(x+w/2,y+h*.50),(x-w/2,y+h*.38)],'#dfcdae',INK,1*k)
    p.poly([(x+w/2,y-h*.10),(x+w*.68,y-h*.30),(x+w*.68,y+h*.27),(x+w/2,y+h*.50)],'#b3b49a')
    p.poly([(x-w*.62,y-h*.12),(x-w*.10,y-h*.69),(x+w*.67,y-h*.48),(x+w*.56,y-h*.01)],roof,INK,1*k)
    p.poly([(x-w*.10,y-h*.69),(x+w*.07,y-h*.86),(x+w*.78,y-h*.64),(x+w*.67,y-h*.48)],'#d39369',INK,1*k)
    for row in range(1,6):
        t=row/7
        p.line([(x-w*.62+w*.52*t,y-h*.12-h*.57*t),(x+w*.56+w*.11*t,y-h*.01-h*.47*t)],'#9e5f48',.8*k)
    for col in range(9):
        t=col/9
        p.line([(x-w*.55+w*1.05*t,y-h*.17),(x-w*.04+w*.67*t,y-h*.68+h*.17*t)],'#c78862',.8*k)
    for dx in [-.31,.22]:
        xx=x+dx*w
        p.box((xx-5*k,y+2*k,xx+6*k,y+14*k),INK)
        p.box((xx-3*k,y+3*k,xx+4*k,y+11*k),'#f2cc82')
        p.line([(xx+1*k,y+3*k),(xx+1*k,y+12*k)],'#b99560',1*k)
        p.line([(xx-6*k,y+15*k),(xx+7*k,y+15*k)],'#f0e0b9',2*k)
    p.poly([(x-3*k,y+5*k),(x+8*k,y+6*k),(x+8*k,y+h*.45),(x-3*k,y+h*.43)],'#597477')
    p.box((x+w*.22,y-h*.98,x+w*.33,y-h*.7),'#ddc9ad')
    p.poly([(x+w*.20,y-h*.99),(x+w*.32,y-h*1.03),(x+w*.37,y-h*.97),(x+w*.23,y-h*.92)],'#ac6f56')


def dock(p,x,y,w,h):
    p.box((x+5,y+7,x+w+6,y+h+7),'#234e53')
    p.box((x,y,x+w,y+h),'#a88762',INK,1)
    for yy in np.arange(y+4,y+h,7):
        p.line([(x+1,yy),(x+w-1,yy)],'#cfac79',1)
        p.line([(x+3,yy+2),(x+w-3,yy+2)],'#8f795c',.7)
    for xx in [x+3,x+w-3]:
        for yy in [y+3,y+h-4]:
            p.ellipse((xx-3,yy-5,xx+3,yy+2),'#5d6858')
            p.ellipse((xx-3,yy-5,xx+3,yy-1),'#e0c18c')


def boat(p,x,y,k=1,color='#dfb76c', angle=0):
    # Common footprint leaves identity letters to the interface.
    q=Painter(100,170,(0,0,0,0))
    q.poly([(50,6),(75,35),(79,126),(64,157),(35,157),(20,127),(25,37)],'#143a44')
    q.poly([(50,13),(69,40),(73,126),(61,148),(38,148),(27,125),(31,41)],color)
    q.poly([(50,24),(62,46),(62,131),(40,133),(38,47)],'#efe0b9')
    q.poly([(41,38),(50,25),(60,40)],'#ad8655')
    q.box((37,63,66,103),'#f8eccd',INK,2)
    q.box((41,65,61,76),'#416874')
    q.box((42,82,61,98),color)
    q.line([(34,116),(65,116)],'#9b7958',2)
    q.line([(34,123),(65,123)],'#9b7958',2)
    q.box((69,79,77,103),'#ad694d')
    im=q.finish(.7).rotate(angle,resample=Image.Resampling.BICUBIC,expand=True)
    im=im.resize((round(im.width*k*S),round(im.height*k*S)),Image.Resampling.LANCZOS)
    p.im.alpha_composite(im,(round(x*S-im.width/2),round(y*S-im.height/2)))
    p.d=ImageDraw.Draw(p.im)


def lamp(p,x,y,k=1):
    p.ellipse((x-11*k,y-5*k,x+12*k,y+6*k),'#b2ab83')
    p.line([(x,y),(x,y-42*k)],'#425955',3*k)
    p.box((x-5*k,y-51*k,x+5*k,y-39*k),'#ecd091',INK,1*k)
    p.poly([(x-8*k,y-52*k),(x,y-59*k),(x+8*k,y-52*k)],'#4c6860')
    p.line([(x,y-51*k),(x,y-40*k)],'#aa8554',1*k)


def lighthouse(p,x,y,k=1):
    p.ellipse((x-36*k,y-5*k,x+42*k,y+20*k),'#a3a58b')
    p.poly([(x-24*k,y),(x-17*k,y-105*k),(x+17*k,y-105*k),(x+25*k,y)],'#eee1bb',INK,1*k)
    p.poly([(x+7*k,y),(x+7*k,y-104*k),(x+17*k,y-105*k),(x+25*k,y)],'#c3c8ab')
    p.poly([(x-21*k,y-47*k),(x+21*k,y-47*k),(x+23*k,y-30*k),(x-22*k,y-30*k)],'#b77453')
    p.box((x-19*k,y-128*k,x+19*k,y-104*k),'#edc67e',INK,2*k)
    for dx in [-10,0,10]:
        p.line([(x+dx*k,y-125*k),(x+dx*k,y-104*k)],'#55716a',2*k)
    p.poly([(x-26*k,y-129*k),(x,y-148*k),(x+26*k,y-129*k)],'#657e72',INK,1*k)
    p.line([(x-28*k,y-99*k),(x+29*k,y-99*k)],'#566c63',3*k)
    p.box((x-5*k,y-18*k,x+5*k,y),'#45636a')
    p.box((x-4*k,y-83*k,x+4*k,y-70*k),'#587774')


def harbor(seed=SEED):
    p=Painter(1440,960,'#387378',seed)
    # Uneven tidal color fields and fine horizontal strokes avoid synthetic gradients.
    for y in range(960):
        c=(49+int(8*y/960),103+int(15*y/960),109+int(6*y/960))
        p.line([(0,y),(1440,y)],c)
    for _ in range(6700):
        x,y=p.r.uniform(0,1440),p.r.uniform(0,960)
        length=p.r.uniform(2,29)
        p.line([(x,y),(x+length*.45,y-.8),(x+length,y)],p.r.choice(['#3e7b7e','#427e80','#326e75','#4a8181','#397478']),p.r.choice([.5,.8,1.1]))
    left=[(0,0),(1130,0),(1100,72),(965,85),(921,129),(850,146),(769,194),(646,214),(568,245),(443,262),(387,327),(328,348),(324,420),(249,456),(239,544),(178,581),(171,685),(115,729),(128,808),(54,845),(0,850)]
    p.poly([(x+6,y+17) for x,y in left],'#295d61')
    p.poly([(x+2,y+8) for x,y in left],'#aaa98b')
    p.poly(left,'#d8cfaa')
    p.line(left[1:],'#ece0b9',5)
    p.poly([(0,0),(1015,0),(944,49),(810,83),(690,105),(553,173),(430,199),(334,283),(264,341),(200,454),(99,526),(83,656),(0,746)],'#91a183')
    p.line([(11,543),(151,439),(188,327),(312,270),(402,190),(551,157),(697,91),(945,46)],'#e1d2ad',23)
    p.line([(15,544),(151,441),(188,330),(311,272),(405,191),(554,159),(699,93),(945,48)],'#c4bb95',1)
    # Individual stones, garden beds and planted trees establish a miniature scale.
    for _ in range(700):
        x,y=p.r.uniform(0,950),p.r.uniform(0,530)
        if x+y*1.8 < 940:
            p.line([(x,y),(x+p.r.uniform(1,4),y+1)],p.r.choice(['#aaba91','#bcc49b','#7e9776']),1)
    for x,y,k in [(28,180,1.5),(95,128,1.3),(181,56,1.4),(338,52,1.3),(414,72,1.2),(560,26,1.1),(66,318,1.4),(85,376,1.3),(28,449,1.4),(17,631,1.2),(723,34,1),(806,27,1)]:
        tree(p,x,y,k)
    for data in [(78,240,78,59,'#a76c50'),(191,196,86,61,'#b97551'),(276,162,74,53,'#6e8c82'),(329,219,69,51,'#bc7653'),(431,119,91,64,'#b87959'),(521,119,67,47,'#748b79'),(603,69,82,57,'#bd825f'),(683,136,65,48,'#9e6850'),(789,80,78,54,'#bd7650'),(129,319,72,53,'#c17a56'),(215,293,66,51,'#a36d54'),(96,461,76,56,'#b87250'),(44,559,74,55,'#748778'),(484,205,61,45,'#b37653')]:
        cottage(p,*data)
    for x,y,w,h in [(400,272,39,134),(541,248,32,86),(277,404,38,114),(176,543,34,125),(774,195,33,87)]:
        dock(p,x,y,w,h)
    dock(p,361,383,119,23)
    dock(p,730,266,101,20)
    for x,y in [(367,280),(248,378),(195,504),(147,591),(570,219),(840,137),(84,741)]:
        lamp(p,x,y,.8)
    for x,y,a in [(460,365,0),(522,309,-7),(238,487,15),(349,492,-32),(698,297,-55),(904,579,25),(708,756,-45)]:
        # Small wake is ornamental, never a route.
        p.line([(x-14,y+26),(x-20,y+41),(x-14,y+49)],'#609291',1)
        boat(p,x,y,.35,p.r.choice(['#deb66c','#c08058','#adc3ab']),a)
    right=[(1440,260),(1372,280),(1338,329),(1252,354),(1203,406),(1191,480),(1231,541),(1276,565),(1294,635),(1361,667),(1440,650)]
    p.poly([(x-7,y+11) for x,y in right],'#275f62')
    p.poly([(x-3,y+5) for x,y in right],'#bab99a')
    p.poly(right,'#ded6b1')
    p.line(right,'#eee0b8',4)
    p.poly([(1440,291),(1389,311),(1354,365),(1281,386),(1243,423),(1246,476),(1281,513),(1323,544),(1332,597),(1440,619)],'#97a687')
    p.line([(1440,474),(1341,465),(1282,428),(1231,462)],'#dfd1aa',21)
    cottage(p,1359,429,77,55,'#af6f52')
    cottage(p,1326,542,66,47,'#778d7e')
    lighthouse(p,1248,436,.96)
    for x,y,k in [(1421,379,1.2),(1389,563,1.3),(1435,608,1.2),(1302,375,.8)]:
        tree(p,x,y,k)
    dock(p,1141,492,91,25)
    dock(p,1137,490,24,94)
    boat(p,1115,550,.34,'#e0b56c',0)
    lamp(p,1220,513,.8)
    bottom=[(0,933),(97,907),(160,918),(210,895),(284,913),(313,960),(0,960)]
    p.poly(bottom,'#bac09a')
    p.line(bottom[0:6],'#e1d5ac',5)
    for x,y,k in [(25,942,1.3),(87,957,1.5),(166,971,1.15),(237,962,.9)]:
        tree(p,x,y,k)
    for x,y in [(1022,144),(1078,179),(960,93)]:
        p.line([(x-8,y+2),(x-3,y-1),(x,y+1),(x+4,y-3),(x+9,y-1)],'#bac5ad',1.5)
    return p.finish(1.5)


def map_plate(i):
    p=Painter(768,768,'#30616a',SEED+i)
    for _ in range(3200):
        x,y=p.r.uniform(0,768),p.r.uniform(0,768)
        p.line([(x,y),(x+p.r.uniform(3,21),y)],p.r.choice(['#33656c','#35676d','#2e5e68']),.6)
    # Scenery stays outside the central 74% decision rectangle.
    shore=[(0,0),(768,0),(768,43),(687,39),(613,65),(535,50),(456,72),(366,53),(270,77),(187,58),(108,87),(72,159),(65,273),(45,360),(68,477),(43,581),(52,699),(0,723)]
    p.poly([(x+2,y+6) for x,y in shore],'#57786f')
    p.poly(shore,'#aeb59a')
    p.line(shore[2:],'#c6c5a7',2)
    for x,y in [(116,37),(257,28),(409,30),(575,20),(699,12)]:
        cottage(p,x+p.r.randint(-12,12),y,40,29,p.r.choice(['#8d7c65','#927564','#7e8a76']))
    for x,y in [(26,159),(25,340),(19,515),(33,646),(188,47),(485,39)]:
        tree(p,x,y,.55)
    p.poly([(768,614),(728,635),(719,683),(686,731),(670,768),(768,768)],'#a3ad92')
    tree(p,753,721,.8)
    lamp(p,738,664,.6)
    return p.finish(.65)


def isolated():
    for ident,color in zip('ABCD',['#e9b75f','#78beb8','#c49bbb','#8fade0']):
        p=Painter(256,256,(0,0,0,0))
        boat(p,128,128,1.34,color)
        save(p.finish(.5),f'ships/{ident}.webp')
    for i in range(1,4):
        p=Painter(256,256,(0,0,0,0))
        dock(p,42,174,168,28)
        if i==1:
            cottage(p,127,139,127,82,'#7a8c7f'); lamp(p,193,176,1.3)
        elif i==2:
            cottage(p,126,135,136,79,'#bb7b58')
            p.poly([(62,140),(179,144),(199,173),(50,168)],'#e7c48b',INK,2)
            for x in range(57,188,23):
                p.poly([(x,146),(x+11,146),(x+15,170),(x+3,169)],'#718f80')
            for x in [66,91,148,173]:
                p.box((x,173,x+17,188),'#a77d56',INK,1)
        else:
            cottage(p,128,139,130,87,'#ad7356')
            p.box((87,142,165,177),'#637974',INK,2)
            p.line([(123,144),(123,177)],'#d2c6a5',2)
            p.box((164,62,179,97),'#8a8270',INK,1)
            p.box((67,179,88,199),'#b58c5e',INK,1)
        save(p.finish(1),f'berths/B{i}.webp')
    for name in ['tea','bread','books','cloth','tools','flowers']:
        p=Painter(128,128,(0,0,0,0))
        if name=='tea':
            p.ellipse((31,89,100,109),'#678c7c')
            p.ellipse((82,49,112,80),'#dfc99b',INK,3)
            p.ellipse((89,55,107,73),(0,0,0,0))
            p.poly([(35,48),(91,48),(84,95),(48,96)],'#e5d4a9',INK,3)
            p.ellipse((35,39,92,59),'#d7bd8c',INK,2)
            p.ellipse((42,44,86,55),'#78633e')
            p.line([(52,33),(48,23),(53,13)],'#9ea995',3)
        elif name=='bread':
            p.ellipse((19,40,108,96),'#d3a568',INK,3)
            p.ellipse((25,39,105,83),'#e8bd79')
            for x in [43,62,81]:
                p.line([(x,48),(x-9,66)],'#a87d4d',5)
                p.line([(x+2,48),(x-6,65)],'#f2d395',2)
        elif name=='books':
            for x,y,c in [(26,74,'#c59578'),(32,52,'#88a99d'),(23,31,'#c5ae77')]:
                p.poly([(x,y),(98,y+4),(104,y+24),(x+5,y+21)],c,INK,2)
                p.poly([(x+7,y+8),(98,y+12),(101,y+21),(x+8,y+18)],'#ebdbb4')
                p.line([(x+11,y+11),(95,y+15)],'#b8b291',1)
        elif name=='cloth':
            for x,y,c in [(28,69,'#bf9bb1'),(24,45,'#7fafab'),(31,26,'#e4d0a0')]:
                p.poly([(x,y),(95,y+4),(105,y+28),(31,y+25)],c,INK,2)
                for xx in range(x+7,94,9):
                    p.line([(xx,y+3),(xx+7,y+23)],'#b2b7a1',1)
        elif name=='tools':
            p.poly([(24,89),(75,25),(84,31),(36,100)],'#b99a6f',INK,3)
            p.poly([(58,23),(72,11),(105,35),(95,50)],'#8caaa4',INK,3)
            p.poly([(84,91),(42,29),(33,35),(72,101)],'#d0ad77',INK,3)
            p.ellipse((67,84,87,107),'#819c96',INK,3)
        else:
            for x,y,c in [(40,39,'#e4b875'),(63,24,'#c88d82'),(88,43,'#d7c4a2'),(66,53,'#b89ab0')]:
                p.line([(x,y),(65,108)],'#638a70',4)
                for a in range(0,360,72):
                    dx,dy=math.cos(math.radians(a))*9,math.sin(math.radians(a))*9
                    p.ellipse((x+dx-7,y+dy-7,x+dx+7,y+dy+7),c)
                p.ellipse((x-4,y-4,x+4,y+4),'#e8ca85')
            p.poly([(43,69),(85,69),(73,114),(58,114)],'#d4c5a0',INK,2)
        save(p.finish(.8),f'cargo/{name}.webp')
    p=Painter(256,256,(0,0,0,0))
    p.poly([(79,83),(128,39),(177,83)],'#e2bd7c')
    p.box((88,90,168,163),'#e5c27f')
    p.box((102,98,154,150),'#fff0c9')
    p.line([(128,96),(128,155)],'#987953',5)
    p.line([(79,167),(177,167)],'#edcc90',7)
    for y,w in [(186,73),(208,52),(228,28)]:
        p.line([(128-w,y),(128-w*.45,y-4),(128,y),(128+w*.45,y+4),(128+w,y)],'#a1c4b5',6)
    mark=p.finish(.2)
    save(mark,'brand/harbor-mark.png')
    save(mark.resize((32,32),Image.Resampling.LANCZOS),'brand/favicon.png')
    save(mark.resize((32,32),Image.Resampling.LANCZOS),'favicon.png')
    save(mark.resize((512,512),Image.Resampling.LANCZOS),'app/icon.png')
    for name in ['need','yield','ready']:
        for n in [128,256]:
            p=Painter(256,256,(0,0,0,0))
            if name=='need': p.poly([(46,39),(219,121),(46,213)],'#f0bd70',INK,12)
            elif name=='ready': p.poly([(128,27),(229,128),(128,229),(27,128)],'#bccaf5',INK,12)
            else: p.ellipse((40,40,216,216),(0,0,0,0),'#97d6ca',24)
            dest=OUT/f'signals/{name}{"" if n==128 else "-256"}.webp'
            dest.parent.mkdir(exist_ok=True)
            image=p.finish(0).resize((n,n),Image.Resampling.LANCZOS)
            if name=='yield':
                alpha=image.getchannel('A')
                image=Image.new('RGBA',image.size,'#97d6ca')
                image.putalpha(alpha)
            image.save(dest,lossless=True,method=6)


def font():
    from fontTools import subset
    from fontTools.ttLib import TTFont
    base=f'https://raw.githubusercontent.com/google/fonts/{FONT_REV}/ofl/golostext/'
    dest=MASTERS/'GolosText[wght].ttf'
    if not dest.exists():
        urllib.request.urlretrieve(base+'GolosText%5Bwght%5D.ttf',dest)
    license_path=ROOT/'public/licenses/Golos-Text-OFL.txt'
    urllib.request.urlretrieve(base+'OFL.txt',license_path)
    options=subset.Options()
    options.flavor='woff2'
    f=TTFont(dest, recalcTimestamp=False)
    sub=subset.Subsetter(options=options)
    sub.populate(unicodes=list(range(0x20,0x180))+list(range(0x400,0x530))+list(range(0x2000,0x2070))+[0x20ac,0x2116,0x2122,0x2190,0x2192,0x2212])
    sub.subset(f)
    f.flavor='woff2'
    (OUT/'fonts').mkdir(exist_ok=True)
    f.save(OUT/'fonts/golos-text.woff2')
    loaded=TTFont(OUT/'fonts/golos-text.woff2')
    assert all(ord(c) in loaded.getBestCmap() for c in 'Quiet HarborТихая гаваньёЁ0123456789')


RATE=48000
CUES=[('ui-tap',.09,[220]),('select-node',.11,[260]),('select-wait',.11,[180]),('signal-need',.22,[587.33]),('signal-yield',.24,[440]),('signal-ready',.26,[587.33,880]),('signal-clear',.12,[150]),('commit',.28,[190,293.66]),('round-open',.35,[440,587.33]),('time-five',.16,[440]),('boats-move',.7,[]),('delivery',.6,[587.33,739.99,880]),('congestion',.42,[160,140]),('shift-success',1.8,[293.66,369.99,440,587.33]),('shift-incomplete',1.4,[440,329.63,293.66]),('reconnect',.35,[440]),('ui-unavailable',.13,[150]),('mastery',1.1,[587.33,880,739.99,587.33])]


def tone(hz,duration,timbre='bell'):
    t=np.arange(round(duration*RATE))/RATE
    if timbre=='pad':
        env=np.minimum(t/.4,1)*np.minimum((duration-t)/.4,1)
        return (np.sin(2*np.pi*hz*t)+.08*np.sin(6*np.pi*hz*t))*env*(.96+.04*np.sin(2*np.pi*.2*t))
    decay=.12 if timbre=='wood' else .36
    env=np.minimum(t/.005,1)*np.exp(-t/decay)*np.minimum((duration-t)/.025,1)
    ratios=[1,2,3] if timbre=='wood' else [1,2.01,3.98]
    return sum(a*np.sin(2*np.pi*hz*r*t) for a,r in zip([1,.18,.06],ratios))*env


def audio():
    if not shutil.which('ffmpeg'):
        raise SystemExit('ffmpeg is required for PCM masters and runtime MP3 exports')
    def export(name,data,loop=False):
        data=np.asarray(data,dtype=np.float32)
        channels=1 if data.ndim==1 else data.shape[1]
        master=MASTERS/f'{name}.wav'
        subprocess.run(['ffmpeg','-v','error','-y','-f','f32le','-ar',str(RATE),'-ac',str(channels),'-i','pipe:0','-c:a','pcm_s24le',str(master)],input=data.astype('<f4').tobytes(),check=True)
        dest=OUT/f'audio/{name}.mp3'
        dest.parent.mkdir(exist_ok=True)
        subprocess.run(['ffmpeg','-v','error','-y','-i',str(master),'-c:a','libmp3lame','-b:a','96k' if loop else '80k','-map_metadata','-1',str(dest)],check=True)
    for i,(name,duration,notes) in enumerate(CUES):
        rng=np.random.default_rng(SEED+i)
        n=round(duration*RATE)
        data=np.zeros(n)
        if name=='boats-move':
            noise=rng.normal(0,1,n)
            freqs=np.fft.rfftfreq(n,1/RATE)
            spec=np.fft.rfft(noise)
            spec*=np.exp(-(freqs/1100)**4)*(1-np.exp(-(freqs/180)**4))
            data=np.fft.irfft(spec,n)*np.sin(np.linspace(0,np.pi,n))**2
        for j,hz in enumerate(notes):
            offset=round(j*(.3 if duration>1 else .07)*RATE)
            clip=tone(hz,(n-offset)/RATE,'wood' if hz<270 else 'bell')
            data[offset:offset+len(clip)]+=clip/(1+j*.2)
        peak=max(abs(data).max(),.001)
        data=data/peak*(.25 if name in ['commit','delivery','shift-success'] else .18)
        export(name,data)
    n=48*RATE
    rng=np.random.default_rng(SEED+100)
    freq=np.fft.rfftfreq(n,1/RATE)
    spec=np.fft.rfft(rng.normal(0,1,n))
    spec*=np.exp(-(freq/1100)**4)*(1-np.exp(-(freq/180)**4))/np.maximum(freq,1)**.5
    water=np.fft.irfft(spec,n)
    t=np.arange(n)/RATE
    water=water/max(abs(water))*.08*(.7+.15*np.cos(2*np.pi*t/4)+.15*np.cos(2*np.pi*t/6))
    export('harbor-water',np.column_stack([water,np.roll(water,431)]),True)
    music=np.zeros(64*RATE)
    chords=[[146.83,220,246.94,369.99],[98,146.83,185,246.94],[123.47,185,220,293.66],[110,164.81,246.94,329.63]]
    melodies=[[440,369.99],[493.88,440],[369.99,293.66],[329.63,None]]
    def mix_wrap(clip,offset,gain):
        indices=(np.arange(len(clip))+round(offset*RATE))%len(music)
        music[indices]+=clip*gain
    for bar in range(16):
        for hz in chords[bar%4]:
            mix_wrap(tone(hz,4.4,'pad'),bar*4,.006)
        for beat,hz in enumerate(melodies[bar%4]):
            if hz and bar!=15 and not (4<=bar<8 and beat==1):
                mix_wrap(tone(hz,.65),bar*4+beat*2,.023)
        if bar in [8,10]: mix_wrap(tone(587.33,.65),bar*4+(2 if bar==10 else 0),.009)
        if bar%2==0: mix_wrap(tone(146.83,.2,'wood'),bar*4,.008)
    music=music+np.roll(music,round(.17*RATE))*.12+np.roll(music,round(.31*RATE))*.06
    export('lantern-loop',np.column_stack([music,np.roll(music,37)]),True)


def manifest():
    assets=[]
    for f in sorted(OUT.rglob('*')):
        if not f.is_file() or f.name=='manifest.json': continue
        row={'path':str(f.relative_to(OUT)),'bytes':f.stat().st_size,'sha256':hashlib.sha256(f.read_bytes()).hexdigest()}
        if f.suffix in ['.webp','.png']:
            with Image.open(f) as im:
                row.update(width=im.width,height=im.height,alpha=im.mode=='RGBA')
            seed=SEED+int(f.stem[1:]) if f.parent.name=='maps' and f.stem.startswith('M') else SEED
            row.update(provenance='Original deterministic procedural raster development illustration',approval='pending-human-art-gate',seed=seed)
        elif f.suffix=='.mp3':
            row.update(provenance='Original deterministic offline synthesis from specification recipes',approval='pending-listening-and-device-gate',sampleRate=RATE)
            row['durationSeconds']=dict((x[0],x[1]) for x in CUES).get(f.stem,48 if f.stem=='harbor-water' else 64)
            row['seed']=SEED+([c[0] for c in CUES].index(f.stem) if f.stem in [c[0] for c in CUES] else 100 if f.stem=='harbor-water' else 101)
        else:
            row.update(provenance=f'Google Fonts / Golos Text at {FONT_REV}',license='SIL OFL 1.1',approval='license-retained')
        assets.append(row)
    (OUT/'manifest.json').write_text(json.dumps({'version':1,'generator':'scripts/generate-assets.py','productionApproved':False,'assets':assets},indent=2)+'\n')


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--skip-audio',action='store_true')
    parser.add_argument('--skip-font',action='store_true')
    args=parser.parse_args()
    OUT.mkdir(parents=True,exist_ok=True)
    MASTERS.mkdir(parents=True,exist_ok=True)
    key=harbor()
    key.save(MASTERS/'harbor-key-art.png')
    save(key,'harbor-key-art.webp',88)
    save(key,'scenes/harbor-key-art.webp',88)
    portrait=key.crop((135,0,855,960)).resize((1080,1440),Image.Resampling.LANCZOS)
    save(portrait,'scenes/harbor-key-art-portrait.webp',85)
    for i in range(1,11):
        plate=map_plate(i)
        save(plate,f'maps/M{i:02}.webp',79)
    isolated()
    if not args.skip_font: font()
    if not args.skip_audio: audio()
    manifest()
    print(f'Generated {len(list(OUT.rglob("*")))} paths in {OUT}')


if __name__=='__main__':
    main()
