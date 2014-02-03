---
layout: post
title:  "Google Calendar in Grails - Adding Tests with Spock"
date: 2012-08-07 21:10:23
---

I went to the <a href="http://gr8conf.us/index" target="_blank">GR8 Conference</a> in Minnesota last week and met some cool people and learned about some grails related stuff that got me pretty excited. 

Inspired by Zan Thrash's excellent <a href="http://www.slideshare.net/zanthrash/gr8-conf-us-spock-soup-to-nuts" target="_blank">Spock Soup to Nuts</a> presentation, I decided to revisit my <a href="https://github.com/craigburke/google-calendar-grails" target="_blank">Google Calendar grails projects</a> and add some Spock tests. It seems as though more and more people are actually trying to use it in their own projects, so I'd like to give people a better base to work from.

Given the fact that the project currently has exactly zero tests I think I could probably do a bit better in the test coverage area. So first I'm going to write some Spock tests to exercise the app (specifically the rather complicated EventService). Now ideally these would have been written first, but better late than never.

The tests in Spock tend to be a little easier to read and allow you to create some nice data driven tests. Since a few people pointed out to me that they were getting exceptions with weekly events that didn't have any excluded days, I'll use this as an opportunity to try out Spock and write a few tests to see if I can reproduce this.

So after installing <a href="http://grails.org/plugin/spock">the spock plugin</a>, here's what my unit test looks like for EventService:

{% highlight groovy %}
	package com.craigburke

	import grails.test.mixin.*
	import grails.plugin.spock.*
	import spock.lang.*

	import org.joda.time.*
	import static org.joda.time.DateTimeConstants.*

	@TestFor(EventService)
	@Mock(Event)
	class EventServiceSpec extends UnitSpec {

		@Shared DateTime now
		@Shared DateTime mondayNextWeek
		@Shared DateTime wednesdayNextWeek
		@Shared DateTime fridayNextWeek
		@Shared DateTime mondayAfterNext
		@Shared Event mwfEvent

		def setupSpec() {
        		now = new DateTime()
        		mondayNextWeek = new DateTime().plusWeeks(1).withDayOfWeek(MONDAY).withTime(0,0,0,0)
        		wednesdayNextWeek = mondayNextWeek.withDayOfWeek(WEDNESDAY)
        		fridayNextWeek = mondayNextWeek.withDayOfWeek(FRIDAY)
        		mondayAfterNext = mondayNextWeek.plusWeeks(1)

        		mwfEvent = new Event(
                		title: 'Repeating MWF Event',
                		startTime: mondayNextWeek.toDate(),
                		endTime: mondayNextWeek.plusHours(1).toDate(),
                		location: "Regular location",
                		recurType: EventRecurType.WEEKLY,
                		isRecurring: true,
                		recurDaysOfWeek: [MONDAY, WEDNESDAY, FRIDAY]
        		)

    		}

    		@Unroll("next occurance of weekly event after #afterDate")
    		def "next occurrence of a weekly event without excluded days"() {
        		expect:
            			service.findNextOccurrence(event, afterDate.toDate()) == expectedResult.toDate()

        		where:
            			event    | afterDate         | expectedResult
            			mwfEvent | now               | mondayNextWeek
            			mwfEvent | mondayNextWeek    | wednesdayNextWeek
            			mwfEvent | wednesdayNextWeek | fridayNextWeek
    		}

    		@Unroll("next occurence of weekly event with exclusion after #afterDate")
    		def "test exclusion of next monday"() {
        		setup:
            			mwfEvent.addToExcludeDays(mondayNextWeek.toDate())

        		expect:
            			service.findNextOccurrence(event, afterDate.toDate()) == expectedResult.toDate()
	
	       		where:
            			event		| afterDate		| expectedResult
            			mwfEvent	| now			| wednesdayNextWeek
            			mwfEvent	| mondayNextWeek	| wednesdayNextWeek
            			mwfEvent	| wednesdayNextWeek	| fridayNextWeek
    		}

	}
{% endhighlight %}


Ok, so that's pretty awesome and a lot more readable than the equivalent JUnit tests would be. I get 6 separate tests here with very little code. 

As expected it failed for weekly events without excluded days but worked fine if I exclude next monday:

<img src="/images/posts/google-calendar-spock1.png" />

Looks like I forgot a null check in my isOnExcludedDay method, so I modify that in my EventService:
{% highlight groovy %}
    private def isOnExcludedDay(Event event, Date date) {
        date = (new DateTime(date)).withTime(0, 0, 0, 0).toDate()
        event.excludeDays?.contains(date)
    }
{% endhighlight %}

Now we're golden:

<img src="/images/posts/google-calendar-spock2.png" />

As I continue learning about Spock I'll add more tests, but so far I have to say writing Spock tests is a lot nicer than writing them in JUnit.

#### Related:

*    [Spock Framework](http://code.google.com/p/spock)
*    [Spock Basics](http://code.google.com/p/spock/wiki/SpockBasics)
*    [Grails Testing](http://grails.org/doc/latest/guide/testing.html)

{% include google-calendar-links.html %}

