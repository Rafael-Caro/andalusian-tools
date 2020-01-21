# -*- coding: utf-8 -*-
"""
Created on Wed Mar 13 16:19:14 2019

@author: Rafael.Ctt
"""

import numpy as np
import os

mbid = 'b1584010-c1f6-4e54-9c5e-eb6f76c45804'

with open(os.path.join(mbid, mbid+'-banshi.csv'), 'r', encoding='utf-8') as f:
    banshiData = f.readlines()
    
with open(os.path.join(mbid, mbid+'-lines.tsv'), 'r', encoding='utf-8') as f:
    linesData = f.readlines()

with open(os.path.join(mbid, mbid+'-bangu.csv'), 'r') as f:
    banguData = f.readlines()

banshi = {}

for b in banshiData:
    bs = b.split(',')[0]
    start = str(round(float(b.split(',')[2]), 2))
    end = str(round(float(b.rstrip().split(',')[3]), 2))
    banshi[bs] = {'lines':[], 'strokes':[]}
    banshi[bs]['start'] = start
    banshi[bs]['end'] = end
    
i = 0
for j in range(len(linesData)):
    l = linesData[j]
    start = float(l.split('\t')[2])
    end = float(l.rstrip().split('\t')[3])
    b = banshiData[i]
    bName = b.split(',')[0]
    bStart = float(b.split(',')[2])
    bEnd = float(b.rstrip().split(',')[3])
    if start >= bStart and end <= bEnd:
        banshi[bName]['lines'].append(j)
    else:
        i += 1
        b = banshiData[i]
        bName = b.split(',')[0]
        banshi[bName]['lines'].append(j)

i = 0
for j in range(len(banguData)):
    bg = banguData[j]
    time = float(bg.split(',')[0])
    bpm = float(bg.split(',')[1])
    bangu = str(round(float(bg.rstrip().split(',')[2]), 1))
    if bangu[-1] == '1' or bangu[-1] == '0':
        bangu = 0
    else:
        bangu = 1
    b = banshiData[i]
    bName = b.split(',')[0]
    bStart = float(b.split(',')[2])
    bEnd = float(b.rstrip().split(',')[3])
    while time > bEnd:
        i += 1
        b = banshiData[i]
        bName = b.split(',')[0]
        bStart = float(b.split(',')[2])
        bEnd = float(b.rstrip().split(',')[3])
    banshi[bName]['strokes'].append([round(time, 2)])
    banshi[bName]['strokes'][-1].append(bpm)
    banshi[bName]['strokes'][-1].append(bangu)
    
for b in banshi.keys():
    if len(banshi[b]['strokes']) > 0:
        print(banshi[b]['start'], ':', banshi[b]['strokes'][0][0], '\t',
              banshi[b]['strokes'][-1][0], ':', banshi[b]['end'])
        
banshiJSON = '"banshi": [\n'

for b in banshiData:
    toAdd = '  {\n'
    toAdd += '    "name": "{}",\n'.format(b.split(',')[1])
    bName = b.split(',')[0]
    bs = banshi[bName]
    toAdd += '    "nameChinese": "{}",\n'.format(bName)
    toAdd += '    "start": "{}",\n    "end": "{}",\n'.format(bs['start'],
                          bs['end'])
    toAdd += '    "lines": [{}, {}],\n'.format(bs['lines'][0], bs['lines'][-1])
    toAdd += '    "bangu": ['
    for bg in bs['strokes']:
        toAdd += '\n      {\n        '
        toAdd += '"t": {},\n        "bpm": {}\n'.format(bg[0], bg[1])
        toAdd += '      },'
#    print(bName, toAdd[-2:])
    if toAdd[-2:] == '},':
        toAdd = toAdd.rstrip(',') + '\n    ]\n  },\n'
    else:
        toAdd += ']\n  },\n'
    banshiJSON += toAdd

banshiJSON = banshiJSON.rstrip(',\n') + '\n],\n'

#with open(os.path.join(mbid, mbid+'-banshi.json'), 'w', encoding='utf-8') as f:
#    f.write(banshiJSON.rstrip(',\n'))

#linesJSON = ""
#
#for l in data:
#    linesJSON += '{\n'
#    linesJSON += '  "t": ' + l.split(',')[0] + ',\n'
#    linesJSON += '  "bpm": ' + l.split(',')[1] + ',\n'
#    bangu = str(float(l.rstrip().split(',')[2]))
#    print(bangu)
#    if bangu[-1] == 0 or bangu[-1] == 1:
#        linesJSON += '  "bg": 0\n'
#    else:
#        linesJSON += '  "bg": 1\n'
#    linesJSON += '},\n'
#
#with open(os.path.join(mbid, mbid+'-strokes.txt'), 'w') as f:
#    f.write(linesJSON.rstrip(',\n'))
#    
#with open(os.path.join(mbid, mbid+'-lines.tsv'), 'r', encoding='utf-8') as f:
#    lines = f.readlines()

linesJSON = '"lyrics": [\n'

for l in linesData:
    linesJSON += '  {\n'
    linesJSON += '    "lyrics": "' + l.split('\t')[1] + '",\n'
    linesJSON += '    "lyricsChinese": "' + l.split('\t')[0] + '",\n'
    linesJSON += '    "start": ' + str(round(float(l.split('\t')[2]), 2)) + ',\n'
    linesJSON += '    "end": ' + str(round(float(l.rstrip().split('\t')[3]), 2)) + '\n'
    linesJSON += '  },\n'

linesJSON = linesJSON.rstrip(',\n') + '\n]'

finalJSON = banshiJSON + linesJSON

with open(os.path.join(mbid, mbid+'-banshiLines.json'), 'w', encoding='utf-8') as f:
    f.write(finalJSON.rstrip(',\n'))