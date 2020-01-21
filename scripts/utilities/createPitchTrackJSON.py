# -*- coding: utf-8 -*-
"""
Created on Sat Mar 16 16:10:46 2019

@author: Rafael.Ctt
"""

import numpy as np
import os
import matplotlib.pyplot as plt

mbid = 'ead85d20-ce7d-4ed0-a00d-0ae199b94d12'
#trackDuration = 15000


# HELPER FUNCTIONS ############################################################
def peakDetection(mX, t):
	thresh = np.where(np.greater(mX[1:-1],t), mX[1:-1], 0); # locations above threshold
	next_minor = np.where(mX[1:-1]>mX[2:], mX[1:-1], 0)     # locations higher than the next one
	prev_minor = np.where(mX[1:-1]>mX[:-2], mX[1:-1], 0)    # locations higher than the previous one
	ploc = thresh * next_minor * prev_minor                 # locations fulfilling the three criteria
	ploc = ploc.nonzero()[0] + 1                            # add 1 to compensate for previous steps
	return ploc

def h2c(t, h):
    return np.rint(1200 * np.log2(h/t))

def c2h(t, c):
    return t * (2 ** (c/1200.))


# LOAD FILES ##################################################################
with open(os.path.join(mbid, mbid+'-bangu.csv'), 'r') as f:
    banguData = f.readlines()

with open(os.path.join(mbid, mbid+'-banshi.csv'), 'r', encoding='utf-8') as f:
    banshiData = f.readlines()
    
pitchData = np.genfromtxt(os.path.join(mbid, mbid+'-pitchTrack.csv'),
                          delimiter=',')

loudData = np.genfromtxt(os.path.join(mbid, mbid+'-loudnessTrack.csv'),
                         delimiter=',')


# CONVERT PITCHES TO CENTS ####################################################
pitch = pitchData[pitchData[:,1]>0][:,1]

minHz = np.min(pitch)
maxHz = np.max(pitch)

hist = {}

for p in pitch:
    freq = round(p, 2)
    hist[freq] = hist.get(freq, 0) + 1
#    hist[p] = hist.get(p, 0) + 1

pitches = sorted(hist.keys())
values = [hist[p] for p in pitches]
pitches = np.array(pitches)
values = np.array(values)

#tonic = 336.36 # c0c14e22-1295-4b44-bad4-8ad95bef6898
#tonic = 339.87 # 0ed40f21-0011-45f3-885d-f9bcad79d99f
#tonic = 328.94 # 14b9c5d7-d2a2-415c-838c-a4e876e8d895
tonic = 340.37 # ead85d20-ce7d-4ed0-a00d-0ae199b94d12

if tonic == 0:
    ploc = peakDetection(values, 10)
    pmag = values[ploc]
    for i in range(len(ploc)):
        print(values[ploc][i], '\t', pitches[ploc][i])
    plt.plot(pitches, values, color="black")
    plt.plot(pitches[ploc], pmag, marker="o", color="red", linestyle="",
             markeredgewidth=1)
    plt.show()


# CREATE DE PITCH TRACK DICTIONARY ############################################
trackDuration = int(round(pitchData[-1, 0], 2) * 100) 

pitchTrack = {}

for i in range(trackDuration):
    pitchTrack[i] = {'bpm': '""', 'bg': '', 'c': 'u', 'l': 'u'}
    
scattered = []

for i in range(len(banshiData)):
    start = int(round(float(banshiData[i].split(',')[2]), 2) * 100)
    end = int(round(float(banshiData[i].rstrip().split(',')[3]), 2) * 100)
    for j in range(start, end+1):
        if j < trackDuration:
            if i in scattered:
                pitchTrack[j]['bpm'] = '"s"'
            else:
                pitchTrack[j]['bpm'] = '_'
                
bg0 = 0
bg1 = 0

for i in range(len(banguData)-1):    
    start = int(round(float(banguData[i].split(',')[0]), 2) * 100)
    end = int(round(float(banguData[i+1].split(',')[0]), 2) * 100)
    bpm = int(round(float(banguData[i].split(',')[1])))
    bangu = str(round(float(banguData[i].rstrip().split(',')[2]), 1))
    if bangu[-1] == '0' or bangu[-1] == '1':
        bg = '1'
        bg0 += 1
    else:
        bg = '2'
        bg1 += 1
    for j in range(start, end):
        if pitchTrack[j]['bpm'] == '_':
            pitchTrack[j]['bpm'] = bpm
    for j in range(start, start + 30):
        pitchTrack[j]['bg'] = bg

start = int(round(float(banguData[-1].split(',')[0]), 2) * 100)
bpm = int(round(float(banguData[-1].split(',')[1])))
bangu = str(round(float(banguData[-1].rstrip().split(',')[2]), 1))
if bangu[-1] == '0' or bangu[-1] == '1':
    bg = '1'
    bg0 += 1
else:
    bg = '2'
    bg1 += 1
for j in range(start, start + 30):
    if pitchTrack[j]['bpm'] == '_':
        pitchTrack[j]['bpm'] = bpm
    pitchTrack[j]['bg'] = bg

for i in pitchTrack:
    if pitchTrack[i]['bpm'] == '_':
        pitchTrack[i]['bpm'] = '""'

for i in range(len(pitchData)):
    time = int(round(pitchData[i, 0], 2) * 100)
    p = pitchData[i, 1]
    if time < trackDuration:
        if p > 0:
            c = h2c(tonic, p)
            pitchTrack[time]['c'] = c
            l = round(loudData[i, 1], 2)
            pitchTrack[time]['l'] = l


# CREATE THE JSON #############################################################           
json = '{'
for n in range(trackDuration):
    json += '"{0:.2f}":'.format(n/100)
    json += '{"bpm":' + str(pitchTrack[n]['bpm'])
    bg = str(pitchTrack[n]['bg'])
    if bg == '':
        json += ',"bg":"",'
    else:
        json += ',"bg":' + bg +','
    c = pitchTrack[n]['c']
    l = pitchTrack[n]['l']
    if c == 'u':
        json += '"c":"u",'
        json += '"l":"u"'
    else:
        json += '"c":{},'.format(c)
        json += '"l":{}'.format(l)
    json += '},'
json = json.rstrip(',') + '}'


# WRITE THE JSON FILE #########################################################
with open(os.path.join(mbid, mbid+'-pitchTrack.json'), 'w') as f:
    f.write(json)