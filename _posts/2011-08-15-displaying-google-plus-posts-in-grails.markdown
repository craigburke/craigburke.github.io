---
layout: post
title:  "Displaying Google+ Posts in Grails"
date: 2011-08-15
---

<strong>Note</strong> The RSS feed source referenced in this article is no longer available.

I wanted to start displaying my public Google+ posts on my site, but unfortunately there's no direct way to do this. Facebook and Twitter have fairly robust developer APIs, but Google+ still lags behind in this respect. Although by using the very excellent <a href="http://plusfeed.appspot.com/">Plus Feed page</a> I can easily get an Atom feed of my Google+ profile page. From there it's pretty straight forward to use this within a grails app.

Since we're using a remote source for this data, it makes sense to cache the results and grab them every 15 minutes or so. Our first step is to define the cache object to store our posts in <strong>conf/spring/resources.groovy</strong> like so

{% highlight groovy %}
beans = {
  googlePlusCache(org.springframework.cache.ehcache.EhCacheFactoryBean) {
       eternal = true
  }
}
{% endhighlight %}

You'll notice that I defined the cache length to be eternal so if we're unable to grab new posts for an extended period of time, we'll still have some older posts to display until we're able to retrieve new ones again. 

Next we define the Service that pulls the google posts and puts them into this cache object. 

Here's what your <strong>GooglePlusService.groovy</strong> file might look like:

{% highlight groovy %}
package com.craigburke.craig

import net.sf.ehcache.Element

import java.text.SimpleDateFormat
import java.util.Date

class GooglePlusService {
    static transactional = true

	// Replace this with your Google+ id
	final String googleId = "104612033264119865482"
	final String googlePlusUrl = "http://plusfeed.appspot.com/${googleId}"
	
	final SimpleDateFormat atomDateFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'")
    
	def googlePlusCache
	// This object can be anything, we just need something to uniquely identify the cache item
	Object googlePlusKey = "GOOGLEPLUS"	
	
	def updateCache = {
		def posts = loadPosts()
		googlePlusCache?.put(new Element(googlePlusKey, posts))
	}
	
	def getPosts = {
		googlePlusCache?.get(googlePlusKey)?.value
	}
	
    private def loadPosts = {
		def rssFeed = new XmlParser().parse(googlePlusUrl)
		
		def items = []
		rssFeed.entry.each {item ->	
			
			 items << [
				  title: item.title.text(),
				  dateUpdated: atomDateFormat.parse(item.updated.text()),
				  summary: item.summary.text(),
				  link: item.link[0].'@href'.text()
			  ]
			  
		  }
		
		  items
	}
	        

}
{% endhighlight %}

So you see that we have two publicly accessible methods here, the <strong>updateCache</strong> method and the <strong>getPosts</strong> method. We can use the getPosts method in our controller but we want to setup the updateCache method to get called automatically every 15 minutes. So first we need to install quartz to set this up as a scheduled job.

{% highlight bash %}
grails install-plugin quartz
grails install-quartz-config
{% endhighlight %}

Then we create our job that updates our Google cache in the grails-app/jobs folder. Here's what your <strong>GooglePlusJob.groovy</strong> might look like:

{% highlight groovy %}
package com.craigburke.craig

class GooglePlusJob {
    def startDelay = 30000
    // Run every 15 minutes
    def timeout = (15 * 60 * 1000)
    
    def googlePlusService

    def execute() {
		try {
			   googlePlusService.updateCache()
		}
		catch (Exception ex) {
			log.error ex.message
		}
    }
}

{% endhighlight %}

Now that everything is all setup all that's left is to grab the posts in one of our Controllers. Here's a simple example: 

{% highlight groovy %}
class HomeController {

	def googlePlusService

    def index = {
	}

	def google = {
		def posts = googlePlusService.getPosts()
		[posts: posts]
	}
	
}
{% endhighlight %}

And the corresponding view for this action might look like this:

{% highlight html %}
<g:each in="${posts}" var="post">
        <h3><a href="${post.link}">${post.title}</a></h3>
        <p>${post.summary}</p>
        <p>Updated: <g:formatDate date="${post.dateUpdated}" format="MMM d, yyyy" /></p>
</g:each>
{% endhighlight %}

This is a pretty clear and simple solution until Google releases their developer API to allow us to do this more directly.