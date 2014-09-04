---
layout: post
title:  "Testing with AngularJS, Grails and Gradle"
date: 2014-09-04
---

One of the open questions I had with my [Angular Grails project](http://angular-grails.interwebs.io/) was how testing was going to work and I came up with
a solution that I'm pretty satisified with.

I decided to stick with Spock and Geb for the server side and end-to-end testing. Geb works great and there's 
no compelling reason I could see to use anything else (like Protractor).

As for my AngularJS unit/integration tests I went with Jasmine. 
The issue though was that I wanted to be able to run all my tests together. 
I also didn’t want to have to worry about everyone on my team installing Node and all the necessary Node dependencies (Karma, Jasmine, etc)
just to run the JavaScript tests.

After seeing John Engelman’s [Building A Full Application Stack With Gradle](https://www.youtube.com/watch?v=YoaZrHE4CSk) (watch it if you haven’t), 
where he talked about both the [Grails Gradle plugin](https://github.com/grails/grails-gradle-plugin) and the 
[Gradle Node plugin](https://github.com/srs/gradle-node-plugin), I figured I could use both of these plugins to help with this.

Here's a portion of my current  [build.gradle](https://github.com/craigburke/angular-grails/blob/master/build.gradle) file:

```groovy
project.ext {
	jasmineDependencies = ['karma', 'karma-jasmine', 'karma-chrome-launcher']
	karmaExec = file('node_modules/karma/bin/karma')
	karmaConfig = 'test/js/karma.conf.js'
}

task setupJasmine(type: NpmTask) {
	outputs.dir file('node_modules')
	args = ['install'] + jasmineDependencies
}

task jasmineRun(type: NodeTask, dependsOn: 'setupJasmine') {
	script = karmaExec
	args = ['start', karmaConfig, '--single-run']
}

task jasmineWatch(type: NodeTask, dependsOn: 'setupJasmine') {
        script = karmaExec
        args = ['start', karmaConfig]
}

test.dependsOn jasmineRun
```

**So now I can run all my tests (Groovy and JavaScript) in my project with this:**

```bash
./gradlew test
```

If Node isn’t installed the Node Gradle plugin will install it for me. The **setupJasmine** task also downloads all the dependencies I need.

**I can run all my tests with one command and all I need is to have the JVM installed. Awesome!**

I can run the Jasmine tests by themselves too:

```bash
./gradlew jasmineRun
```

I can also run these tests in watch mode (where tests are automatically rerun everytime your source changes). Very 
useful during active development:

```bash
./gradlew jasmineWatch
```
You can find the full [build.gradle](https://github.com/craigburke/angular-grails/blob/master/build.gradle) file I’m using up on the [Angular Grails project page](https://github.com/craigburke/angular-grails/).

The Gradle Grails plugin seems to work great, but if you’re a little hesitant to so radically change your build process
you should checkout: [Add Javascript unit tests and run them with “grails test-app”](http://www.objectpartners.com/2014/08/19/add-javascript-unit-tests-and-run-them-with-grails-test-app/).
