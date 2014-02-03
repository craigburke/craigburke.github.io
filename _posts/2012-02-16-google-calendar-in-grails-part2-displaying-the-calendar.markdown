---
layout: post
title:  "Google Calendar in Grails Part 2: Displaying the Calendar"
date: 2012-02-16
---

Following up on <a href="http://www.craigburke.com/blog/2012/02/09/creating-google-calendar-in-grails-part-1-the-model/">Part 1 </a> where we developed a model in Grails for a calendar app like Google calendar in grails, we're now going to make use of this model and create the controller and view to actually show our events.

In terms of the UI, the jQuery plugin <a href="http://arshaw.com/fullcalendar/" target="_blank">Full calendar</a> provides all the functionality we need and is visually very similar to Google Calendar. It even supports the same month/week/day views that we see on Google calendar. So I've added the following resources to my <strong>Config.groovy</strong>: 

{% highlight groovy %}
grails.resources.modules = {
    core {
        resource url:'/js/jquery-1.7.1.min.js', disposition: 'head'
    }

    fullCalendar {
        dependsOn 'core'
        resource url:'/js/fullcalendar.min.js'
        resource url:'/css/fullcalendar.css'
    }
   
    calendar {
        dependsOn 'fullCalendar'

        resource url: '/js/calendar.js'
        resource url: '/css/calendar.css'

    }
 
}
{% endhighlight %}

For this example project I'm using the default grails layout, so the <strong>calendar.css</strong> file is needed to override some of those CSS rules that clash with fullCalendar:

{% highlight css %}
#calendar {
    padding: 20px;
}

#calendar table {
    margin-bottom: 0;
}

#calendar tr&gt;td:first-child, tr&gt;th:first-child {
    padding-left: 0;
}

#calendar tr&gt;td:last-child, tr&gt;th:last-child {
    padding-right: 0;
}

#calendar th:hover, tr:hover {
    background: inherit;
}

#calendar tbody td:hover {
    background: #E1F2B6;
}

#calendar table.fc-header {
    border: none;
}

#calendar table.fc-header td:hover {
    background: inherit;
}
{% endhighlight %}

Our <strong>calendar.js</strong> is pretty straight forward, just some jquery that calls the fullCalendar plugin to render a calendar in a container div (#calendar) within our view:

{% highlight javascript %}
$(document).ready(function() {
    $("#calendar").fullCalendar({
        events: 'list.json',
        header: {
            left: 'prev,next today',
            center: 'title',
            right: 'month,agendaWeek,agendaDay'
        }
    });

});
{% endhighlight %}
 
So here's what our very simple <strong>event/index.gsp</strong> view looks like:

{% highlight html %}
<html>
<head>
  <meta name="layout" content="main" />

  <title>Calendar</title>
  <r:require module="calendar" />
</head>
<body>

  <div id="calendar"></div>

</body>
</html>
{% endhighlight %}

This is incredibly simple so far. You'll notice in the javascript above that the events property points to the list action as the source of our events. In the case or repeating events we need to return the start and end date (as UNIX time stamps) for each individual instance of the event that happens within the range. So our JSON should look something like this:

{% highlight javascript %}
[
   {
      "id":1,
      "title":"Repeating MWF Event",
      "allDay":false,
      "start":1329454800,
      "end":1329458400
   },
   {
      "id":1,
      "title":"Repeating MWF Event",
      "allDay":false,
      "start":1330128744.162,
      "end":1330132344.162
   },
   {
      "id":1,
      "title":"Repeating MWF Event",
      "allDay":false,
      "start":1330387944.162,
      "end":1330391544.162
   },
   {
      "id":1,
      "title":"Repeating MWF Event",
      "allDay":false,
      "start":1330733544.162,
      "end":1330737144.162
   },
   {
      "id":1,
      "title":"Repeating MWF Event",
      "allDay":false,
      "start":1330992744.162,
      "end":1330996344.162
   },
   {
      "id":1,
      "title":"Repeating MWF Event",
      "allDay":false,
      "start":1331338344.162,
      "end":1331341944.162
   },
   {
      "id":2,
      "title":"Repeating MWF Event (different location)",
      "allDay":false,
      "start":1329783144.162,
      "end":1329786744.162
   },
   {
      "id":3,
      "title":"Just a normal event",
      "allDay":false,
      "start":1329437544.162,
      "end":1329439344.162
   }
]
{% endhighlight %}

Notice we need to return the start and end time for each instance, so the event with the id 1 is repeated several times with different dates corresponding to the different occurrences. 

So I've added an EventService that contains a <strong>findOccurancesInRange</strong> method. This method returns an array of Date objects that corresponds to when the event occurs. Here's our updated <strong>EventService.groovy</strong> class:

{% highlight groovy %}
import org.joda.time.DateTime
import org.joda.time.Days
import org.joda.time.Weeks
import static org.joda.time.DateTimeConstants.MONDAY
import static org.joda.time.DateTimeConstants.SUNDAY
import org.joda.time.Months
import org.joda.time.Years

class EventService {

    def findOccurrencesInRange = {Event event, Date rangeStart, Date rangeEnd -&gt;
        def dates = []

        Date currentDate
        if (event.isRecurring) {
            currentDate = findNextOccurrence(event, rangeStart)

            while (currentDate &amp;&amp; currentDate &lt; rangeEnd) {
                dates.add(currentDate)
                Date nextDay = new DateTime(currentDate).plusDays(1).toDate()
                currentDate = findNextOccurrence(event, nextDay)
            }
        }
        // One time (non-recurring) event
        else {
            if (event.startTime &gt;= rangeStart &amp;&amp; event.endTime &lt;= rangeEnd) {
                dates.add(event.startTime)
            }
        }

        dates
    }

    // For repeating event get next occurrence after the specified date
    private Date findNextOccurrence(Event event, Date afterDate) {
        Date nextOccurrence

        if (!event.isRecurring) {
            // non-repeating event
            nextOccurrence = null
        } else if (event.recurUntil &amp;&amp; afterDate &gt; event.recurUntil) {
            // Event is already over
            nextOccurrence = null
        } else if (afterDate &lt; event.startTime) {
            // First occurrence
            if (event.recurType == EventRecurType.WEEKLY &amp;&amp; !(isOnRecurringDay(event, event.startTime))) {
                Date nextDay = new DateTime(event.startTime).plusDays(1).toDate()
                nextOccurrence = findNextOccurrence(event, nextDay)
            }
            else {
                nextOccurrence = event.startTime
            }
        } else {
            switch (event.recurType) {

                case EventRecurType.DAILY:
                    nextOccurrence = findNextDailyOccurrence(event, afterDate)
                    break
                case EventRecurType.WEEKLY:
                    nextOccurrence = findNextWeeklyOccurrence(event, afterDate)
                    break
                case EventRecurType.MONTHLY:
                    nextOccurrence = findNextMonthlyOccurrence(event, afterDate)
                    break
                case EventRecurType.YEARLY:
                    nextOccurrence = findNextYearlyOccurrence(event, afterDate)
                    break
            }


        }

        if (isOnExcludedDay(event, nextOccurrence)) {
            // Skip this occurrence and go to the next one
            DateTime nextDay = (new DateTime(nextOccurrence)).plusDays(1)

            nextOccurrence = findNextOccurrence(event, nextDay.toDate())
        }
        else if (event.recurUntil &amp;&amp; event.recurUntil &lt;= nextOccurrence) {
            // Next occurrence happens after recurUntil date
            nextOccurrence = null
        }

        nextOccurrence
    }

    private Date findNextDailyOccurrence(Event event, Date afterDate) {
        DateTime nextOccurrence = new DateTime(event.startTime)

        int daysBeforeDate = Days.daysBetween(new DateTime(event.startTime), new DateTime(afterDate)).getDays()
        int occurrencesBeforeDate = Math.floor(daysBeforeDate / event.recurInterval)

        nextOccurrence = nextOccurrence.plusDays((occurrencesBeforeDate + 1) * event.recurInterval)

        nextOccurrence.toDate()
    }


    private Date findNextWeeklyOccurrence(Event event, Date afterDate) {
        int weeksBeforeDate = Weeks.weeksBetween(new DateTime(event.startTime), new DateTime(afterDate)).getWeeks()
        int weekOccurrencesBeforeDate = Math.floor(weeksBeforeDate / event.recurInterval)

        DateTime lastOccurrence = new DateTime(event.startTime)
        lastOccurrence = lastOccurrence.plusWeeks(weekOccurrencesBeforeDate * event.recurInterval)
        lastOccurrence = lastOccurrence.withDayOfWeek(MONDAY)

        DateTime nextOccurrence
        if (isInSameWeek(lastOccurrence.toDate(), afterDate)) {
            nextOccurrence = lastOccurrence.plusDays(1)
        }
        else {
            nextOccurrence = lastOccurrence
        }

        boolean occurrenceFound = false

        while (!occurrenceFound) {
            if (nextOccurrence.toDate() &gt;= afterDate &amp;&amp; isOnRecurringDay(event, nextOccurrence.toDate())) {
                occurrenceFound = true
            }
            else {
                if (nextOccurrence.dayOfWeek() == SUNDAY) {
                    // we're about to pass into the next week
                    nextOccurrence = nextOccurrence.plusDays(1).plusWeeks(event.recurInterval)
                }
                else {
                    nextOccurrence = nextOccurrence.plusDays(1)
                }
            }

        }

        nextOccurrence.toDate()
    }

    private Date findNextMonthlyOccurrence(Event event, Date afterDate) {
        DateTime nextOccurrence = new DateTime(event.startTime)

        int monthsBeforeDate = Months.monthsBetween(new DateTime(event.startTime), new DateTime(afterDate)).getMonths()
        int occurrencesBeforeDate = Math.floor(monthsBeforeDate / event.recurInterval)
        nextOccurrence = nextOccurrence.plusMonths((occurrencesBeforeDate + 1) * event.recurInterval)

        nextOccurrence.toDate()
    }

    private Date findNextYearlyOccurrence(Event event, Date afterDate) {
        DateTime nextOccurrence = new DateTime(event.startTime)

        int yearsBeforeDate = Years.yearsBetween(new DateTime(event.startTime), new DateTime(afterDate)).getYears()
        int occurrencesBeforeDate = Math.floor(yearsBeforeDate / event.recurInterval)
        nextOccurrence = nextOccurrence.plusYears((occurrencesBeforeDate + 1) * event.recurInterval)

        nextOccurrence.toDate()
    }


    private boolean isInSameWeek(Date date1, Date date2) {
        DateTime dateTime1 = new DateTime(date1)
        DateTime dateTime2 = new DateTime(date2)

        ((Weeks.weeksBetween(dateTime1, dateTime2)).weeks == 0)
    }

    private boolean isOnSameDay(Date date1, Date date2) {
        DateTime dateTime1 = new DateTime(date1)
        DateTime dateTime2 = new DateTime(date2)

        ((Days.daysBetween(dateTime1, dateTime2)).days == 0)
    }

    private boolean isOnRecurringDay(Event event, Date date) {
        int day = new DateTime(date).getDayOfWeek()

        event.recurDaysOfWeek.find{it == day} != null
    }

    private def isOnExcludedDay = {Event event, Date date -&gt;
        date = (new DateTime(date)).withTime(0, 0, 0, 0).toDate()
        event.excludeDays.contains(date)
    }
}
{% endhighlight %}

So now we can use this method to create our list action within EventController. The fullCalendar plugin similarly posts a start and end parameter (again as a UNIX timestamp). So here's what our action looks like:

{% highlight groovy %}
import org.joda.time.DateTime
import org.joda.time.Instant

import grails.converters.JSON
class EventController {
  def eventService

    def index = {

    }
   
    def list = {
     def (startRange, endRange) = [params.long('start'), params.long('end')].collect { new Instant(it  * 1000L).toDate() }

        def events = Event.withCriteria {
            or {
                and {
                    eq("isRecurring", false)
                    between("startTime", startRange, endRange)
                }
                and {
                    eq("isRecurring", true)
                    or {
                        isNull("recurUntil")
                        ge("recurUntil", startRange)
                    }
                }
            }
        }
        
        // iterate through to see if we need to add additional Event instances because of recurring
        // events
        def eventList = []
        events.each {event -&gt;

            def dates = eventService.findOccurrencesInRange(event, startRange, endRange)

            dates.each { date -&gt;
                DateTime startTime = new DateTime(date)
                DateTime endTime = startTime.plusMinutes(event.durationMinutes)

                eventList 
{% endhighlight %}

So here's what our calendar looks like so far:
<p><img src="/images/posts/google-calendar2-1.png" /></p>

{% include google-calendar-links.html %}

