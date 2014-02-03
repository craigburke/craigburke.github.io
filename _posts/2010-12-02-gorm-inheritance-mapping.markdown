---
layout: post
title:  "GORM Inheritance Mapping"
date: 2010-12-02
---

A really nice feature of GORM (and Hibernate) is support for inheritance in domain objects. For example if your application has different types of user accounts with specific properties then you can create distinct domain objects that inherit from a User base class that has all the common properties of a user (email, password, etc). Here's what it might look like if you had a student user type and an admin user type:

{% highlight groovy %}
class User {
	String email
	String password
	<br />
	static mapping = {
		 tablePerHierarchy false
	 }
}
{% endhighlight %}


{% highlight groovy %}
class AdminUser extends User {
	// Admin user specific properties
	String adminGroup
}
{% endhighlight %}


{% highlight groovy %}
class Student extends User {
	// Student specific properties
	Date graduationDate
	Float gpa
}
{% endhighlight %}


Because of the tablePerHierarchy set in the user mapping this will result in 3 seperate tables (user, admin_user, and student). Omit this if you'd like all the fields to be contained within a single user table.

If you store the user object in session after authentication you can write code like this in your view:

{% highlight xml %}
<g:if test="${session.user instanceof Student}”>
You are a student with a GPA of ${session.user.gpa}
</g:if>
{% endhighlight %}


<strong>See also:</strong> 
<ul>
  <li><a href="http://www.grails.org/GORM+-+Mapping+inheritance"> GORM - Mapping Inheritance</a></li>
  <li><a href="http://docs.jboss.org/hibernate/core/3.3/reference/en/html/inheritance.html">Hibernate inheritance mapping</a></li>
</ul>