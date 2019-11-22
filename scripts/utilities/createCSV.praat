mbid$ = selected$ ("TextGrid")

banshiFile$ = mbid$ + "/" + mbid$ + "-banshi.csv"
writeFile (banshiFile$, "")
intervals = do ("Get number of intervals...", 1)
for i to intervals
    labelCh$ = do$ ("Get label of interval...", 1, i)
    label$ = do$ ("Get label of interval...", 2, i)
    if labelCh$ != ""
        start = do ("Get start point...", 1, i)
        end = do ("Get end point...", 1, i)
        line$ = labelCh$ + "," + label$ + "," + string$(start) + "," + string$(end)
        appendFileLine (banshiFile$, line$)
    endif
endfor

linesFile$ =  mbid$ + "/" + mbid$ + "-lines.tsv"
writeFile (linesFile$, "")
intervals = do ("Get number of intervals...", 3)
for j to intervals
    labelCh$ = do$ ("Get label of interval...", 3, j)
    label$ = do$ ("Get label of interval...", 4, j)
    if labelCh$ != ""
        start = do ("Get start point...", 3, j)
        end = do ("Get end point...", 3, j)
        line$ = labelCh$ + tab$ + label$ + tab$ + string$(start) + tab$ + string$(end)
        appendFileLine (linesFile$, line$)
    endif
endfor