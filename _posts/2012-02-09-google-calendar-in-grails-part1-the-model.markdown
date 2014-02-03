---
layout: post
title:  "Google Calendar in Grails Part 1: The Model"
date: 2012-02-09
---

Over this series of posts I'm going to look at recreating some of the basic functionality of Google Calendar including the capability of adding recurring events within Grails. We'll start by looking at the model.

For a basic event, our model is very simple. We just need a title, a start and end time, a location and a description. Here's what we're starting with:

{% highlight groovy %}
class Event {

    String title
    String location
    String description
    Date startTime
    Date endTime

}
{% endhighlight %}

Things get a lot more complicated when we start talking about repeating events though. Let's consider an example of an event that happens every Monday of this year (or 53 separate occurances). We could technically keep the model the same and just add the same event 53 times (not a great idea). Although, if you wanted to change the title of the event, you'll have to do this for each of the 53 events we've added.

Now think about the case where we want this event to happen every Monday without a specific end date. In the current model that would translate to an infinite number of event records. Clearly our model won't work as is.

So lets take a look at the Google Calendar options for a repeating event to figure out what additional properties we might need:

<p><img src="/images/posts/google-calendar1-1.png" /></p>

Ok, so we're going to need to allow for different recurrence types (weekly, daily, monthly, or yearly). We'll also need an interval (for the "Repeat Every" option). Now we can either have an open ended event (no end date), a event that recurs a set number of times or an event that recurs until a specified date. Here's our updated model that reflects these new options:

{% highlight groovy %}
class Event {

    String title
    String location
    String description
    Date startTime
    Date endTime

    // Recurring Options
    boolean isRecurring = false
    EventRecurType recurType
    Integer recurInterval = 1

    Date recurUntil
    Integer recurCount

}

public enum EventRecurType {
    DAILY('Daily'),
    WEEKLY('Weekly'),
    MONTHLY('Monthly'),
    YEARLY('Yearly')

    String name

    EventRecurType(String name) {
        this.name = name
    }
}
{% endhighlight %}

So we've added an enum for recurType option, and we have the newly added recurInterval, recurCount, and a recurUntil date. In the case of an open ended event with no end date, both recurCount and recurUntil will be null. With this updated model we could now create an event that recurs every two months or every two years, so we're getting closer.

We still don't yet have the granularity to create an event that only repeats on certain days of the week (for example, we can't create a single event that repeats every Monday Wednesday and Friday). So, let's take a look at Google calendars options for a weekly repeating event to see what we're missing.

<p><img src="/images/posts/google-calendar1-2.png" /></p>

Alright so if we add a collection to keep track of the individual days of the week we want this event to repeat (recurDaysOfWeek), we should be good on that front.

{% highlight groovy %}
class Event {

    String title
    String location
    String description

    Date startTime
    Date endTime

    // Recurring Options
    boolean isRecurring = false
    EventRecurType recurType
    Integer recurInterval = 1

    static hasMany = [recurDaysOfWeek: Integer]

    Date recurUntil
    Integer recurCount

}

public enum EventRecurType {
    DAILY('Daily'),
    WEEKLY('Weekly'),
    MONTHLY('Monthly'),
    YEARLY('Yearly')

    String name

    EventRecurType(String name) {
        this.name = name
    }
}
{% endhighlight %}

There's just one more scenario we need to deal with in our model. In Google Calendar whenever you edit or delete a repeating event, you are given the option of either editing the entire series or just that particular event. Here's the prompt you get if you try to save a repeating event you just edited:

<p><img src="/images/posts/google-calendar1-3.png" /></p>

So let's tackle the case of choosing <strong>Only this event</strong>. An example of where you might want to do this is if you have an event that repeats every Monday but you want to change the location for just one particular Monday. In this case we can keep our repeating event but make a new non-repeating event with all the same info for that particular Monday.

We will need to change the model once again to exclude that particular Monday from the original repeating event (so the event doesn't show up twice). So here's our finalized model with an excludeDays collection added (along with some basic constraints). I've also added a sourceEvent property as well as a transient called durationMinutes. Here's our finished model:

{% highlight groovy %}
import org.joda.time.DateTime
import org.joda.time.Minutes

class Event {

    String title

    Date startTime
    Date endTime

    // Recurring Options
    boolean isRecurring = false
    EventRecurType recurType
    Integer recurInterval = 1

    // Backlink to original recurring event this event was created from
    Event sourceEvent

    static hasMany = [recurDaysOfWeek: Integer, excludeDays: Date]
    static transients = ['durationMinutes']

    static constraints = {
        title(nullable: false, blank: false)
        location(nullable: true, blank:  true)
        description(nullable: true, blank: true)
        recurType(nullable: true)
        recurInterval(nullable: true)
        recurUntil(nullable: true)
        recurCount(nullable: true)
        startTime(nullable: false)
        excludeDays(nullable: true)
        sourceEvent(nullable: true)
        startTime(required: true, nullable: false)
        endTime(required: true, nullable: false, validator: {val, obj -&gt; val &gt; obj.startTime} )
        recurDaysOfWeek(validator: {val, obj -&gt; 
            if (obj.recurType == EventRecurType.WEEKLY &amp;&amp; !val) {return 'null'}
        })
    }

    public int getDurationMinutes() {
        Minutes.minutesBetween(new DateTime(startTime), new DateTime(endTime)).minutes
    }
}

public enum EventRecurType {
    DAILY('Daily'),
    WEEKLY('Weekly'),
    MONTHLY('Monthly'),
    YEARLY('Yearly')

    String name

    EventRecurType(String name) {
        this.name = name
    }
}
{% endhighlight %}

Finally here's some code that shows how we'll end up using this model. I'm using the <a href="http://joda-time.sourceforge.net/">Jode-Time library</a> to deal with dates and to set the ISO8601 values for the days of the week. Hopefully this will clarify how we'll end up using the model (thanks to <a href="http://www.rhcedan.com/">Dan Woods</a> for the Groovier version of this code):

{% highlight groovy %}
import org.joda.time.DateTime
import static org.joda.time.DateTimeConstants.MONDAY
import static org.joda.time.DateTimeConstants.WEDNESDAY
import static org.joda.time.DateTimeConstants.FRIDAY

// Creating dates for our test events
def now = new DateTime()
def tomorrow = now.plusDays(1)

// Creating a weekly event that occurs every MWF
def event = new Event(title: 'Repeating MWF Event').with {
    startTime = now.toDate()
    endTime = now.plusHours(1).toDate()
    location = "Regular location"
    recurType = EventRecurType.WEEKLY
    [MONDAY, WEDNESDAY, FRIDAY]*.toInteger().each { addToRecurDaysOfWeek(it) }
    addToExcludeDays(now.withDayOfWeek(MONDAY).plusWeeks(1).toDate())
    isRecurring = true
    save(flush: true)
}

// Non-repeating single event that replaces the one excluded next Monday
def event2 = new Event(title: event.title).with {
    sourceEvent = event
    startTime = event.startTime
    endTime = event.endTime
    location = "New one-time location"
    isRecurring = false
    save()
}

// Plain old non-repeating event
def event3 = new Event(title: 'Just a normal event').with {
    startTime = tomorrow.toDate()
    endTime = tomorrow.plusMinutes(30).toDate()
    isRecurring = false
    save()
}
{% endhighlight %}

{% include google-calendar-links.html %}
