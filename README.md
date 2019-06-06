# hue-ambience

Ambient lighting based on screen contents for Philips Hue system.

Requires ffmpeg.


## Configuration

You need a config `.hue-ambience.json` file in your home directory as follows
```text/json
{
   "fps": 5,
   "framerate": 5,
   "transition": 200,
   "size": "1920x1080",
   "resolution": "320x200",
   "map": [{ "light": "Living Room", "rect": [0, 0, 1920, 1080] }]
 }
 ```
 
 Where:
 
 **fps** - Frames per second to sample: lower = lower CPU usage, higher = smoother transitions
 
 **framerate** - Max requests per second to pipe to philips hue API
 
 **transition** - light transition fade spee in milliseconds
 
 **size** - Desktop resolution
 
 **resolution** - Sampling size resolution. Lower = less CPU

 **map** - Map of screen regions to emit to lights, with the following structure.
     * light - Hue Light ID
     * rect - Rectangle structute representing the screen region to capture [topLeft, topRight, bottomLeft, bottomRight]
