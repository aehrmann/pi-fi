# Pi-fi - Music in the key of Pi

[This project](http://pi-fi.herokuapp.com/) is a bit of a weird exploration of the fact that
the number pi contains an infinitely non-repeating sequence of digits. With no 
pattern. My question now was "what would that sound like?" Weird, I know. But 
here's my attempt at one answer to that question.

Using Angular and the HTML5 Web Audio API to explore what Pi "sounds like," 
I was able to _(computer science jargon alert)_ use the digits of pi (the digits 1 through
10) as indexes (or indices, whichever you prefer) into a list of notes, played by the Web 
Audio API, whose parameters are controlled by Angular.

In future versions, I hope to add a listing of keys and scales to hear what the 
mapping sounds when played in certain modes and maybe even the ability to 
highlight a section and loop it. Maybe some cool patterns could be found. Just 
saying.
