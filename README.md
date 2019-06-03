# hue-ambience

Ambient lighting based on screen contents for Philips Hue system.

Requires ffmpeg.


## Configuration

You need a config `hue-ambience.js` file in your home directory as follows
```text/json
{
   "fps": 5,
   "framerate": 5,
   "transition": 200,
   "size": "1920x1080",
   "resolution": "320x200"
 }
 ```
 
 Where:
 
 *fps* - Frames per second to sample: lower = lower CPU usage, higher = smoother transitions
 *framerate* - Max requests per second to pipe to philips hue API
 *transition* - light transition fade spee in milliseconds
 *size* - Desktop resolution
 *resolution* - Sampling size resolution. Lower = less CPU
