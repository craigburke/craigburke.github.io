---
layout: post
title:  "URL Mapping in Grails"
date: 2010-10-25
---

In grails you have a lot of control over how specfic controller actions are mapped to urls through the <strong>UrlMappings.groovy</strong> file. The default behavior is for the urls to look something like this:

{% highlight groovy %}
"/$controller/$action?/$id?"
{% endhighlight %}

With the '?' denoting optional parts of the url. So for example the user controller actions will map to urls that look like this

{% highlight text %}
/user/index
/user/show/22
{% endhighlight %}

These are pretty reasonable defaults but we might want to override these mappings so we have a little more control over the urls. One reason to do this is so we can map all administrative controller actions to urls that begin with /admin. Then we can easily limit access to these admin controllers easily with a filter.

To change the mapping with our previous user control example we would add the following line to the <strong>UrlMappings.groovy</strong> file:

{% highlight groovy %}
"/admin/$controller/$action?/$id?"(controller : "user")
{% endhighlight %}

Or alternatively this:

{% highlight groovy %}
"/admin/$controller/$action?/$id?"{controller = "user"}
{% endhighlight %}

Then we'd get urls that looks like the following:

{% highlight text %}
/admin/user/index
/admin/user/show/22
{% endhighlight %}

Another good approach is to explicitly define all your public urls in your UrlMapping and then creating a catch all for all other actions that map to /admin/ as shown in the example below

{% highlight groovy %}
class UrlMappings {
	static mappings = {
		// public pages
		"/"(view:"/index")
		"/auth/$action"(controller: "auth")
		"/portfolio/$action?/$id?"(controller: "portfolio")
		"/project/$action?/$id?"(controller: "project", action: "show")

		// protected pages
		"/admin/$controller/$action?/$id?"()

		"500"(view:'/error')
	}
}
{% endhighlight %}
