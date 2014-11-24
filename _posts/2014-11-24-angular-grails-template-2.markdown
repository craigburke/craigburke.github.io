---
layout: post
title: "AngularJS Grails Template - Part 2: Advanced Customization"
date: 2014-11-24
---

This post is a followup to <a href="/2014/11/17/angular-grails-template-1.html">Part 1 - Getting Started,</a> so if you haven't already created an application using the Angular Grails Lazybones template, you should probably start there. 

Now I'm going talk about the ways you can further customize and tailor the Angular modules that the lazybones template generates.

#### Project Template

Whenever you run the **lazybones generate module** command, it references the files found in **src/templates/angular/crud** in your main project to build out your new module:

<img src="/images/posts/angular-grails-lazybones-2-1.png">

The files here mirror your project structure, so you have fine grain control over what files are created and where they ultimately end up.

Any files with a **.gtpl** extension will be processed by the Groovy's [SimpleTemplateEngine](http://groovy.codehaus.org/api/groovy/text/SimpleTemplateEngine.html) so the rules about escaping characters apply here. 

You can use the variables **DOLLAR_SIGN,** **TAB,** and **NEWLINE** within your template files so to add those characters without having to worry about escaping them.

#### Path Variables

You'll notice in the screenshot above, that certain folder and file names have values like **\_resourceName\_** or **\_groupPath\_.** These refer to values that allow you to have more control over the destination of your template files. Note the use of the underscores surrounding the variable names in the file/folder names.  

Here's a list of the variables that can be used to help build the paths within your project:  

<table class="table">
<thead>
	<tr>
		<th>Variable</th>
		<th>Description</th>
		<th>Example</th>
	</tr>
</thead>
<tbody>	
	<tr>
		<td><strong>groupPath</strong></td>
		<td>Java source path based on your project group</td>
		<td><strong>com/craigburke/angular</strong> (for group com.craigburke.angular)</td>
	</tr>
	<tr>
		<td><strong>resourceName</strong></td>
		<td>The domain class name</td>
		<td><strong>Employee</strong></td>
	</tr>
	<tr>
		<td><strong>moduleName</strong></td>
		<td>the angular module name</td>
		<td><strong>exampleApp.employee</strong></td>
	</tr>

	<tr>
		<td><strong>modulePath</strong></td>
		<td>Path based on angular module name</td>
		<td><strong>example-app/employee</strong> (for module exampleApp.employee)</td>
	</tr>
</tbody>	
</table>


#### Domain properties

In addition to the path variables above, a map of variable for each domain property are add as a variable **properties**

<table class="table">
<thead>
	<tr>
		<th>Variable</th>
		<th>Description</th>
		<th>Example</th>
	</tr>
</thead>
<tbody>	
	<tr>
		<td><strong>name</strong></td>
		<td>The property name</td>
		<td><strong>birthDate</strong></td>
	</tr>
	<tr>
		<td><strong>label</strong></td>
		<td>The natural name based on the property name</td>
		<td><strong>Birth Date</strong></td>
	</tr>
	<tr>
		<td><strong>type</strong></td>
		<td>The class of the property</td>
		<td><strong>java.util.Date</strong></td>
	</tr>

	<tr>
		<td><strong>domainClass</strong></td>
		<td>Boolean indicating whether the property is a domain class</td>
		<td><strong>false</strong></td>
	</tr>

	<tr>
		<td><strong>constraints</strong></td>
		<td>A map of the constaints for the property</td>
		<td><strong>[required: true, nullable: false]</strong></td>
	</tr>
</tbody>	
</table>

So given our example domain class Employee:
{% highlight groovy %}
package com.craigburke

class Employee {
	String firstName
	String lastName
	Date birthDate
	BigDecimal salary

	static constraints = {
		firstName(maxSize: 128)
		lastName(masSize: 256)
		birthDate(required: false, nullable: true)
	}
	
}
{% endhighlight %}

The **properties** variable would have this value within your templates
{% highlight groovy %}
assert properties == [
	[name: 'firstName', label: 'First Name', type: String, domainClass: false, constraints: [required: true, nullable: false, maxSize: 128] ],
	[name: 'lastName', label: 'Last Name', type: String, domainClass: false, constraints: [required: true, nullable: false, maxSize: 256] ],
	[name: 'birthDate', label: 'Birth Date', type: Date, domainClass: false, constraints: [required: false, nullable: true] ],
	[name: 'salary', label: 'Salary', type: BigDecimal, domainClass: false, constraints: [required: true, nullable: false] ]
]
{% endhighlight %}

This takes into account the Grails default of properties being required and non-nullable when determining the constraints.

#### RenderUtil Class

The RenderUtil class is an easy way to expose new methods or properties to your templates. You can also override any of the variables listed above if you'd like.

**Any property or closure assigned to the util map within this file will be available within your templates.**

As an example, here's how I could expose a new method called **renderPanel** within my templates:

**src/templates/angular/RenderUtil.groovy**
{% highlight groovy %}
def util = [:]

util.renderPanel = { text -> 
	"""<div class="panel panel-default">
	  <div class="panel-body">
	    ${text}
	  </div>
	</div>"""
}

return util
{% endhighlight %}

These added properties or methods can be used in any of the files found in your template folder (not just HTML files). The HTML files are just where I found these additional methods most useful (using them almost like Grails TagLibs).

#### Conclusion

I wanted to provide a good starter project for anyone looking to use Grails and AngularJS together but I also wanted to make it easy to configure any aspect of the project.

I'm looking forward to hearing how people are making use of this or if anyone has suggestions. **I'm going to use this template extensively in my own work and will continue to work actively on it, so as always feedback is definitely welcome.**


