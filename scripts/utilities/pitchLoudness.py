import essentia
import essentia.standard as es
import numpy as np
import os
import matplotlib.pyplot as plt

mbid = 'ead85d20-ce7d-4ed0-a00d-0ae199b94d12'

hopSize = 128

loader = es.MonoLoader(filename=os.path.join(mbid, mbid+'-voice.mp3'))
track = loader()

# track[track<0.000001] = 0

print(len(track)/44100.)

# pY = es.PitchYin(minFrequency=55, maxFrequency=900, tolerance=0.06)
pY  = es.PitchYin(minFrequency=55, maxFrequency=600, tolerance=0.03)
rms = es.RMS()

pitch = []
loudness = []

print('Computing pitch and loudness')
for frame in es.FrameGenerator(track, frameSize=2048, hopSize=hopSize, startFromZero=True):
    f = pY(frame)
    if f[1] >= 0.8:
        pitch.append(f[0])
        loudness.append(rms(frame))
    else:
        pitch.append(0)
        loudness.append(0)
print('Pitch and loudness computed')

times = [i * hopSize / 44100. for i in range(len(pitch))]

pitch = np.array(pitch)
loudness = np.array(loudness)

pitchTrack = np.column_stack((times, pitch))
loudnessTrack = np.column_stack((times, loudness))

np.savetxt(os.path.join(mbid, mbid+'-pitchTrack.csv'), pitchTrack, delimiter=',')
np.savetxt(os.path.join(mbid, mbid+'-loudnessTrack.csv'), loudnessTrack, delimiter=',')
