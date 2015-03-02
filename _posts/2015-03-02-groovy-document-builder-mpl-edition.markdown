---
layout: post
title:  "Groovy Document Builder - MPL Edition"
date: 2015-03-02
---

**With the latest release of the [Groovy Document Builder](https://github.com/craigburke/document-builder), the entire project (including the PDF builder) are now available under the MPL2 license.** 
I've removed iText as a dependency and am now using PdfBox for the Pdf generation so that everyone can use this with the far more permissive MPL2 license (instead of AGPL).

Here's an updated example using the latest version:

**example.groovy**:
{% highlight groovy %}
@Grab(group='com.craigburke.document', module='pdf', version='0.2.4')
@Grab(group='com.craigburke.document', module='word', version='0.2.4')

import com.craigburke.document.builder.PdfDocumentBuilder
import com.craigburke.document.builder.WordDocumentBuilder
import com.craigburke.document.core.Align

def builders = [
        new PdfDocumentBuilder(new File('example.pdf')),
        new WordDocumentBuilder(new File('example.docx'))
]

def RAINBOW_COLORS = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#8B00FF']

String GROOVY_IMAGE_URL = 'http://www.craigburke.com/images/posts/groovy-logo.png'
byte[] groovyImageData = new URL(GROOVY_IMAGE_URL).bytes

builders.each { builder ->
    builder.create { 
		document(font: [family: 'Helvetica', size: 14.pt], margin: [top: 0.75.inches]) {

        paragraph "Groovy Document Builder v.0.2.4", font: [color: '#990000', size: 22.pt]

        paragraph {
            font.size = 42.pt
            "Hello Woooorld!!!!!".toUpperCase().eachWithIndex { letter, index ->
                font.color = RAINBOW_COLORS[ index % RAINBOW_COLORS.size() ]
                text letter
                font.size--
            }
            lineBreak()
            text "Current font size is ${font.size}pt"
        }

        paragraph "Back to default font and aligned to the right", align: Align.RIGHT

        paragraph(margin: [left: 1.25.inches, right: 1.inch, top: 0.25.inches, bottom: 0.25.inches]) {
            font << [family: 'Times-Roman', bold: true, italic: true, color: '#333333']
            text "A paragraph with a different font and margins"
        }

        paragraph(align: Align.CENTER) {
            image(data: groovyImageData, width: 250.px, height: 125.px)
            lineBreak()
            text "Figure 1: Groovy Logo", font: [italic: true, size: 9.pt]
        }

        paragraph("Suddenly, a table...", font: [size: 22.pt])

        table(width: 6.inches, padding: 4.px, border: [size: 3.px, color: '#990000']) {
            row {
                cell("Left Aligned", width: 1.5.inches, align: Align.LEFT)
                cell("Center Aligned", width: 2.inches, align: Align.CENTER)
                cell(align: Align.RIGHT) {
                    text "Right Aligned"
                }
            }
        }
    }}
}
{% endhighlight %}

This will render a Word and Pdf document that looks like this:
<img src="/images/posts/groovy-document-builder-2.png">

PdfBox works great but it's extremely low level. When rendering the paragraphs and tables I have to do all the work of breaking up lines,
positioning the text on the page, and drawing the lines of the table borders. 

**While the test coverage is looking much better now, given how much more complex the builder is I anticipate there being some edge cases in
rendering both paragraphs and tables that I missed. If you run into any issues, please [raise an issue](https://github.com/craigburke/document-builder/issues).**

I'll start planning the next release (0.3) soon, which should include at very least headers and footers. Feel free to offer up any suggestions or 
feedback on how things look like so far either on the [project page](https://github.com/craigburke/document-builder) or on twitter ([@craigburke1](https://twitter.com/craigburke1)).
