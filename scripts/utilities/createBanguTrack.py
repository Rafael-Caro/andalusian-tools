# -*- coding: utf-8 -*-
"""
Created on Wed Mar 13 14:52:36 2019

@author: Rafael.Ctt
"""

import essentia
import essentia.standard as es
import numpy as np
import os
import argparse

if __name__=='__main__':
    
    parser = argparse.ArgumentParser(description='Generate ban and gu track')
    
    parser.add_argument('path', help='Path to the data foler')
    parser.add_argument('mbid', help='mbid of the recording')
    
    args = parser.parse_args()
    
    folder = args.path
    mbid = args.mbid
    
    data = np.genfromtxt(os.path.join(folder, mbid, mbid+'-bangu.csv'), delimiter=',')
    
    loader = es.MonoLoader(filename=os.path.join(folder, 'ban.mp3'))
    ban = loader()
    
    loader = es.MonoLoader(filename=os.path.join(folder, 'gu.mp3'))
    gu = loader()
    
    loader = es.MonoLoader(filename=os.path.join(folder, mbid, mbid+'-acc.mp3'))
    acc = loader()
    
    print(acc.size / 44100)
    
    new = np.zeros(acc.size)
    
    for i in range(len(data)):
        start = int(round(data[i, 0] * 44100))
        if str(data[i,2])[-1] == '0' or str(data[i,2])[-1] == '1':
            end = start + ban.size
            new[start:end] = ban
        else:
            end = start + gu.size
            new[start:end] = gu
    
    newFile = os.path.join(folder, mbid, mbid+'-bangu.wav')
    es.MonoWriter(filename=newFile)(essentia.array(new))
    
#    newFile = os.path.join(mbid, mbid+'-bangu.mp3')
#    es.MonoWriter(filename=newFile, format='mp3')(essentia.array(new))