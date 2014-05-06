---
layout: post
title:  "Monthly Book Roundup (January 2014)"
date: 2014-02-03
---

This month's list of finished books aren't exactly new technologies to me, but are areas where I certainly had some knowledge gaps. All books this month are related in someway to the application build and deploy process.

#### Bash

I love Linux and I've been comfortable with the command line for a while, but I was still doing a lot of things manually instead of writing bash scripts for common tasks. I didn't understand or appreciate the power of bash and I was really blown away and excited by the possibilities here.

<dl class="books">
	<dt>
		<a href="http://shop.oreilly.com/product/9780596526788.do"><img src="/images/books/bash-cookbook.jpg" /></a>
	</dt>
	<dd>
		<h4><a href="http://shop.oreilly.com/product/9780596526788.do">Bash Cookbook: Solutions and Examples for Bash Users</a></h4>
		<p>This book is actually a pretty nice introduction to bash for someone who's comfortable with Linux but doesn't have experience writing more complicated bash scripts. A few recipes were a bit incomplete and had me looking through the man pages of various commands, but these instances were rare and the examples tended to be very clear and practical. This is an outstanding book and after reading it I felt like I had a solid grasp of the fundamentals of bash scripting.</p>
	</dd>
	<dt>
		<a href="http://shop.oreilly.com/product/9780596009656.do"><img src="/images/books/learning-bash-shell.jpg" /></a>
	</dt>
	<dd>
		<h4><a href="http://shop.oreilly.com/product/9780596009656.do">Learning the Bash Shell</a></h4>
		<p>This book is a deeper dig into Bash than the <b>Bash Cookbook</b> above. It is extremely thorough and complete and really 
goes into detail about various aspect of using and programming with bash. While it claims to be a book that appropriate for beginners, I think 
people without at least a basic understanding of bash would have a really difficult time. There are some great examples and excercises throughout this book and the chapter that details building a debugger in bash is particularly cool. This definitely makes for a really solid reference book.		</p>
	</dd>
</dl>

#### Gradle

I've always been impressed with how concise and clear the build files are for projects that make use of Gradle, but I hadn't taken the step of really learning how to use Gradle to write my own build scripts. The thing that most impressed me is that I get all the power of Ant and Maven without the painful syntax. It's really an awesome tool (it's no wonder that it's going to be the default build tool of Grails 3.0).

<dl class="books">
	<dt>
		<a href="http://shop.oreilly.com/product/0636920019909.do"><img src="/images/books/building-and-testing-with-gradle.jpg" /></a>
	</dt>
	<dd>
		<h4><a href="http://shop.oreilly.com/product/0636920019909.do">Building and Testing with Gradle</a></h4>
		<p>This book is a nice gentle introduction to Gradle specifically for beginners. The examples are very clear and you can read the book for free if you sign up for an account on <a href="http://gradleware.com/registered/books/building-and-testing/">gradleware's site</a>. If you've been using Gradle already you probably won't get much out of it, but it's not a bad book for a beginner.</p>
	</dd>

	<dt>
		<a href="http://shop.oreilly.com/product/0636920019923.do"><img src="/images/books/gradle-beyond-the-basics.jpg" /></a>
	</dt>
	<dd>
		<h4><a href="http://shop.oreilly.com/product/0636920019923.do">Gradle Beyond the Basics</a></h4>
		<p>This book is great! It moves beyond the basics of the <b>Building and Testing with Gradle</b> book and gives some really clear and practical examples of more involved Gradle builds. The liquibase plugin example is especially good and really shows how you can build more sophisticated tasks into your build scripts. </p>
	</dd>
</dl>

#### Jenkins

Since I've been beefing up test coverage for projects I work on and using tools like CodeNarc, it seemed like an obvious next step to start looking at a continuous integration tool like Jenkins.

<dl class="books">
	<dt>
		<a href="http://shop.oreilly.com/product/0636920010326.do"><img src="/images/books/jenkins-the-definitive-guide.jpg" /></a>
	</dt>
	<dd>
		<h4><a href="http://shop.oreilly.com/product/0636920010326.do">Jenkins: The Definitive Guide</a></h4>
		<p>This is a fairly short book but also a pretty solid introduction to Jenkins. Not surprisingly it has a big focus on Maven, but there were a few sections on Gradle which were more relevant to me. One of the most useful parts of this book is the recommendation of a few nice plugins that I need to investigate further including: Role Strategy, Grails, Gradle, Cobertura, Violations, Deploy. The chapters on Advanced and Distributed builds were particularly good and interesting. While I would have probably liked less detail on some of the more obvious parts of Jenkins (like installation, and user management) and more detail and examples about creating build jobs, overall it was a worthwhile read.</p>
	</dd>

	<dt>
		<a href="http://www.packtpub.com/jenkins-continuous-integration-cookbook/book"><img src="/images/books/jenkins-ci-cookbook.jpg" /></a>
	</dt>
	<dd>
		<h4><a href="http://www.packtpub.com/jenkins-continuous-integration-cookbook/book">Jenkins Continuous Integration Cookbook</a></h4>	
		<p>There were some interesting ideas in this book, but the explanations were unfocused and the recipes themselves sometimes tended to be a bit random (and not always particularly Jenkins specific). Almost all of the useful information found in this book was covered in a much simpler and clearer way in Jenkins: The Definitive Guide. There was some new material here, although none of it was covered in as much detail as I would have liked. It did prompt me to investigate the CLI, plugin development, and a few new plugins though.</p>
	</dd>
</dl>
