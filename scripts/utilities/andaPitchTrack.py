# -*- coding: utf-8 -*-
"""
Created on Fri Nov 29 09:42:58 2019

@author: p3732
"""

import numpy as np
import os
import matplotlib.pyplot as plt

# File name
fn = 'b11237b9-d45b-4b3a-a97b-ab7d198f927f-mu2-pt.txt'

# Folder path
fp = 'C:/Users/p3732/Documents/Andalusi/andalusian-tools/files/pitchTracks'

# Pitch track
pt = np.genfromtxt(os.path.join(fp, fn), delimiter='\t')

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
###############################################################################

pitch = pt[pt[:,1]>0][:,1]

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

ploc = peakDetection(values, 10)
pmag = values[ploc]
print('value\t pitch')
for i in range(len(ploc)):
    print(values[ploc][i], '\t', pitches[ploc][i])
plt.plot(pitches, values, color="black")
plt.plot(pitches[ploc], pmag, marker="o", color="red", linestyle="",
         markeredgewidth=1)
plt.show()