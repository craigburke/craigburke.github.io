---
layout: post
title:  "Groovy Document Builder"
date: 2015-01-22
---

While there are lots of extremely capable Java libraries for generating different kinds of documents (iText, Apache POI, etc), it's 
not always easy to use these libraries. It's for that reason that I decided to leverage Groovy's excellent support for building DSLs to
create the [Groovy Document Builder](https://github.com/craigburke/document-builder) in order to simplify this. 

The best way to illustrate how it works is probably with an example

**example.groovy**:
{% highlight groovy %}
@Grab(group='com.craigburke.document', module='pdf', version='0.1.6')
@Grab(group='com.craigburke.document', module='word', version='0.1.6')

import com.craigburke.document.builder.PdfDocumentBuilder
import com.craigburke.document.builder.WordDocumentBuilder

def builders = [
        new PdfDocumentBuilder(new File('example.pdf')),
        new WordDocumentBuilder(new File('example.docx')),
]

def RAINBOW_COLORS = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#8B00FF']

String GROOVY_IMAGE_URL = 'http://www.craigburke.com/images/posts/groovy-logo.png'
byte[] groovyImageData = new URL(GROOVY_IMAGE_URL).bytes

builders.each { builder ->
    builder.create { document(font: [family: 'Helvetica', size: 14.pt], margin: [top: 0.75.inches]) {
        paragraph "Groovy Document Builder", font: [size: 22.pt]

        paragraph {
            font.size = 42.pt
            "Hello Woooorld!!!!!".toUpperCase().eachWithIndex { letter, index ->
                font.size--
                font.color = RAINBOW_COLORS[ index % RAINBOW_COLORS.size() ]
                text letter
            }
            lineBreak()
            text "Current font size is ${font.size}pt"
        }

        paragraph "Font size is back to 14pt now with the default black font"

        paragraph(margin: [left: 1.25.inches, right: 1.inch, top: 0.25.inches, bottom: 0.25.inches]) {
            font << [family: 'Times-Roman', bold: true, italic: true, color: '#333333']
            text "A paragraph with a different font and margins"
        }

        paragraph(margin: [left: 1.inch]) {
            image(data: groovyImageData, width: 250.px, height: 125.px)
            lineBreak()
            text "Figure 1: Groovy Logo", font: [italic: true, size: 9.pt]
        }

        paragraph("Suddenly, a table...", font: [size: 22.pt], margin: [bottom: 0.25.inches])

        table(width: 5.inches) {
            row {
                cell("Cell 1", width: 1.inch)
                cell("Cell 2", width: 2.inches)
                cell(width: 2.inches) {
                    text "Cell 3"
                }
            }
        }
    }}
}
{% endhighlight %}

After running
{% highlight groovy %}
groovy example.groovy
{% endhighlight %}

both a Word document and a PDF fille will be created that look something like this:
<img src="/images/posts/groovy-document-builder-1.png">

A couple things to note about the code above:

1. Both builders use completely different libraries (iText for pdf and Apache POI for Word) but I can hide those differences thanks to Groovy's amazing builder support. 
2. Typically you wouldn't grab the bytes of an image from a URL like I did here. Something like **byte[] groovyImageData = new File('groovy.png').bytes** would be more typical. I did it this way so the example could be completely self contained.
3. The properties like margins, font sizes, widths, etc all expect a value in points. Since options like margins are better expressed in inches you can use values like 2.inches or 1.inch and the 
conversion to points will be done for you.
4. Font options are inherited and properties be overriden at any level without impacting the rest of the document.

I think this is a really good start for this project and it meets the needs for several projects I'm working on right now, but there's a lot I'd like to add to this such as lists, links, page headers, page footers, and sections. 
Documentation is clearly lacking at this point and I'd like to beef up the test suite as well. 
I'm also toying around with the idea of generating simpler document types like Markdown or AsciiDoc. 

**The current DSL or the future plans for this project are all very fluid right now. If you'd like to give feedback or make suggestions you can add it as an issue on the 
[Groovy Document Builder project page](https://github.com/craigburke/document-builder) or you can just send me a tweet [@craigburke1](https://twitter.com/craigburke1).**

