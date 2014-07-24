---
layout: post
title:  "Grails, AngularJS and the Asset Pipeline"
date: 2014-07-24
---

Grails and AngularJs are two incredible frameworks and with the newer REST features of Grails they can be a pretty
nice pairing. That isn't to say that there isn't some work involved in getting them to play well together though.

I've developed a couple of Grails Asset Pipeline plugins to help with that: 
[Angular Template Asset Pipeline](https://github.com/craigburke/angular-template-asset-pipeline) 
and [Angular Annotate Asset Pipeline](https://github.com/craigburke/angular-annotate-asset-pipeline).

I've also created an example app that makes use of these two plugins and includes some directives and services to make 
development a bit easier (similar to Rob Fletcher's Grails Angular Scaffolding project).

You can see a demo of the app here: [Grails Angular App Demo](http://angular-grails.interwebs.io/)

**Here's an overview of my Angular related projects:**

#### [Angular Grails App](https://github.com/craigburke/angular-grails)
This is an example app that shows how to use the plugins and hopefully provides a good jumping off point for anyone
looking to use Grails and AngularJS together. I'm still actively tweaking and improving upon this project. Any
feedback or suggestions are certainly welcome.

#### [Angular Annotate Asset Pipeline Plugin](https://github.com/craigburke/angular-annotate-asset-pipeline)
By default the Asset Pipeline plugin will minify all the Javascript files in your project. This breaks the dependency
injection used by AngularJS (which relies on specific parameter names).

This plugin makes use of [ngannotate](https://github.com/olov/ng-annotate) so that your Javascript can be safely minified.

#### [Angular Template Asset Pipeline Plugin](https://github.com/craigburke/angular-template-asset-pipeline)
This allows you to create static templates from html or gsp files that get inserted into Angular's $templateCache.

Since these templates are incorporated in your JavaScript files, this eliminates the issue with some browsers caching
your templates (the JS and templates are always in sync).

As a side benefit it promotes a nice organization based on the module name. 
For example a template for the module **myApp.directives.buttons** would be placed in **/assets/templates/my-app/directives/buttons**.

This plugin also allows you to define your static Angular templates using the fields plugin or other Groovy expressions. 
This lets you use Angular without having to lose all the niceties you get with GSPs.

**If you decide to use any of these projects or have any feedback please let me know. I'd love to hear how other people are
using Grails and AngularJS together**
