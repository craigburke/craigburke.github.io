---
layout: post
title:  "CKEditor in Grails"
date: 2013-07-15 21:10:23
---

I was recently working on incorporating the latest version of <a href="http://ckeditor.com/">CKEditor</a> (which is a very nice WYSIWYG text editor) into a grails project and thought I'd share my setup.

CKEditor is a really slick plugin, but it tries a bit too hard to be helpful in loading the required javascript files for you. Normally this works fine, but it causes issues when using the default resources plugin to manage your javascript and css files. Luckily the resources plugin itself is very configurable so this is pretty easy to address.

First though we copy the plugin files to the */web-app/js/ckeditor* folder of our project. Then we'll need to add the following to our <b>main.gsp</b> layout page so we can set a global variable <b>URL_ROOT</b> to help us configure CKEditor:

{% highlight html %}
  <r:script disposition="head">
            var URL_ROOT = '${request.contextPath}';
  </r:script>
{% endhighlight %}


Then we define our resource in the <b>ApplicationResources.groovy</b> file like so:

{% highlight groovy %}
    wysiwyg {
        dependsOn 'jquery'
        defaultBundle false

        resource url: 'js/ckeditor/ckeditor.js', disposition: 'head', exclude: 'hashandcache'
        resource url: 'js/wysiwyg.js'
    }
{% endhighlight %}

We just need to require this resource on any page we use CKEditor and it'll load the required files. This resource is defined so it won't try to automatically bundle our js files together and the cached-resource plugin won't change the name of the file (hence the exclude: 'hashandcache' part). 

The above referenced *js/wysiwg.js* file looks something like this:

{% highlight javascript %}
	var CKEDITOR_BASEPATH = URL_ROOT + '/static/js/ckeditor/';

	$("textarea.wysiwyg").each(function() {
    		var name = $(this).attr("name");
    		CKEDITOR.replace(name);
	});
{% endhighlight %}

<p>With this we can add the class wysiwyg to any textarea elment and get something that looks like this:</p>
<img src="/images/posts/ckeditor-grails.png">

<p>I've also added <a href="https://github.com/craigburke/grails-ckeditor">a grails project on github</a> with CKEditor already incorporated that you can take a look at.</p>

<p><b>Note:</b> The CKEditor grails plugin also works nicely, but if you're looking to incorporate a more recent version of CKEditor these steps should help you out</p>
