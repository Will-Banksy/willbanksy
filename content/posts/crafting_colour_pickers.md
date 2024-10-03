---
title: "Crafting Colour Pickers"
description: "For my WIP pixel art editor QPix, one thing I wanted to add was a sophisticated colour picker. This post describes my thoughts going through process."
date: "2024-10-02"
thumbnail: "default.png"
---

(This is my first actual blog post by the way so bear with me)

## Colour Pickers

When I was looking at implementing a colour picker UI for QPix, I wanted to go further than my original colour picker I wrote in Java with swing, which was fairly simplistic, only letting the user pick with HSV, and the channel that each slider controlled was locked to saturation & value in the "box slider" and the hue on the slider to the right of it. In the Java pixel editor, the colour picker was coded... not particularly well, and definitely not in a way that would allow easy extensibility.

![](/assets/posts/java_pixel_editor_picker.png)
Figure 1: Java pixel editor colour picker

One thing my Java pixel editor had going for it was it had a nice looking UI at least, and it had a button that popped up Java swing's builtin colour picker dialog, which was surprisingly powerful - 4 tabs, with the option to pick from a selection of colours ("swatches"), and the option to pick colours from sliders the same as my custom colour picker. But as well as the option to pick with HSV, there was the options to pick with HSL, RGB and CMYK. *And*, it even had the option to pick which channel is changed by the primary slider (the 1D slider next to the box slider), with the box slider taking responsibility for the other two channels.

![](/assets/posts/java_swing_picker.png)
Figure 2: Java swing's colour picker dialog

With QPix, I wanted, as the minimum, to have the power of Java swing's colour picker dialog in my custom picker - but with better UI/UX, similar to the one I implemented in Java. I was wondering if Qt had a similarly powerful colour picker to Java swing... but not so.

## Colour Management

I was also curious about supporting other colour models, such as CIELAB, CIELCh and CIEXYZ, but those are technically whole other colour spaces, which, well, I don't really know what I'm doing with. I *think* I've just been working in sRGB, and so to support CIELAB/CIELCh/CIEXYZ in QPix I'd just have to transform the colour into sRGB, which looks easy enough from the calculations on wikipedia, once I've converted from CIELAB/CIELCh into CIEXYZ anyway (https://en.wikipedia.org/wiki/SRGB#Transformation, https://en.wikipedia.org/wiki/CIELAB_color_space#Converting_between_CIELAB_and_CIEXYZ_coordinates), but it got me thinking about supporting different colour spaces in general.

Far as I am currently aware, to ensure colour accuracy, I'd need to transform a picked CIEXYZ colour into RGB using the image's working colour space, before transforming the image's colours into the display's colour space and displaying the pixels of that image via painting in Qt. For the other colour models (RGB/HSV/HSL/CMY/etc.) I should just be able to turn into RGB and assume the working colour space applies. Qt does provide a [QColorSpace](https://doc.qt.io/qt-6/qcolorspace.html#details) class for doing colour space transforms, but it's not clear how that is used internally and whether painting operations are colour managed. I think my poor understanding of colour spaces and colour management is mostly at fault here to be fair.

I have come across this colour management engine called LittleCMS, and their blog post about using LittleCMS with Qt (https://littlecms.com/blog/2020/12/09/using-lcms2-on-qt/) - which doesn't answer many of my burning questions but does give me something I can use. Now I just need to figure out colour management...

## QPix's Colour Picker

(I realise this blog post has been a little... well I'm not really sure what the purpose of it is. I'm just blabbering honestly)

Anyway, after that tangent I decided to just implement the original idea I had (leaving colour spaces out of the equation for now).

For picking different colour models, I created two functions to translate from slider values into a colour, and vice-versa, and used the former to translate the current slider values into the selected colour and render the background images for each slider, using the pixel position. Then the latter was used to set the slider positions when the selected colour was updated (e.g. when entering a colour hex value - making the hex value editor was actually so simple I almost forgot I'd done it).

That, of course, worked beautifully. After many crashes and bugs and things simply not working were fixed at least.

Then I realised I'd have to add another layer of abstraction, as in order to be able to have each slider value represent a different channel in the selected model, I'd either need to separate the slider values from the channels (as each was at that point hardcoded to represent a specific channel) or simply tackle every possible combination. I'm not completely stupid so I chose the former.

I labelled the channels A, B and C, and introduced functions to turn slider values into channel values, and vice-versa again, translating according to the current "slider arrangement" (which I realise is a bit of a nonsensical name, I'll probably change it at some point). And so now slider values are automatically transformed into channel values according to the current arrangement, and the channel values are turned into a colour, and then to turn that back, the colour is turned into channel values and the channel values are turned into slider values. Surprisingly elegant.

My implementation of it is not quite as elegant however, as I was implementing this I wanted to keep it fairly straightforward so I didn't abstract any of this out into, e.g., a ColourModel pure virtual class (or Java/C# interface) with RGB/HSV/CMY/HSL implementors, which seems like a much better way of organising it than the current scattering of values and code across one big ColourSelector class that defines each colour model along with the UI and basically everything else. Ah well, it can always be rearchitected later.

Now all the mechanics of the colour picker are sorted out (and many bugs fixed), the UI was a simple job of using QActions and QActionGroups to make buttons that act as radio buttons and polishing it all up with some CSS to fit it in to the look & feel of the app.

![](/assets/posts/qpix_picker.png)
Figure 3: QPix's colour picker

Beautiful.

You can see the current state of the colour selector code (including UI) in [QPix/src/ui/widgets/colourselector](https://github.com/Will-Banksy/QPix/tree/master/src/ui/widgets/colourselector)