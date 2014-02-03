---
layout: post
title:  "Google Calendar in Grails – Part 3: Creating and Modifying Events"
date: 2012-02-18
---

Following up on <a href="http://www.craigburke.com/blog/2012/02/09/creating-google-calendar-in-grails-part-1-the-model/">Part 1</a> and <a href="http://www.craigburke.com/blog/2012/02/16/creating-google-calendar-in-grails-part-2-displaying-the-calendar/">Part 2</a> of this series where we created a model and rendered a Google calendar-like calendar. Now, finally we'll finish things out by creating the actions and view that will allow us to view events as well as create and edit new events.

Let's start with by creating the tip balloon that shows the event title as well as the event time. Here's what it looks like in Google Calendar:

<img src="/images/posts/google-calendar3-1.png" />

One thing to keep in mind with this, is that for repeating events we want to show the particular event times for the particular day we clicked on. For example if we have an event that repeats on MWF and starts at the beginning of the month, if we click on the last Friday of the month it should display that particular date. So we need to pass the startTime of that particular occurrence to our show method. So here's how we modify our <strong>calendar.js</strong> to do this:
{% highlight javascript %}
	$("#calendar").fullCalendar({
		events: 'list.json',
		header: {
			left: 'prev,next today',
			center: 'title',
			right: 'month,agendaWeek,agendaDay'
		},
		eventRender: function(event, element) {
			$(element).addClass(event.cssClass);

			var occurrenceStart = event.start.getTime();
			var occurrenceEnd = event.end.getTime();

			var data = {id: event.id, occurrenceStart: occurrenceStart, occurrenceEnd: occurrenceEnd};

 			$(element).qtip({
				content: {
					text: ' ',
 					ajax: {
						url: "show",
						type: "GET",
						data: data
					}
				},
				show: {
					event: 'click',
					solo: true
				},
				hide: {
					event: 'click'
				},
				style: {
					width: '500px',
					widget: true
				},
				position: {
					my: 'bottom middle',
					at: 'top middle',
					viewport: true
				}
			});
		}
	});
{% endhighlight %}

You'll notice that I used the jQuery plugin <a href="http://craigsworks.com/projects/qtip2/">qTip2</a> for our tooltip here. Much like the original qTip it seems this will forever be classified as a release candidate. The plugin, though, is very stable and the constant development and great support from the author are enough for me to use it in a production setting.

So our show action that this javascript uses is pretty simple (just showing different views based on whether or not this is an ajax request or not):

{% highlight groovy %}
class EventController {
   def show = {
        def (occurrenceStart, occurrenceEnd) = [params.long('occurrenceStart'), params.long('occurrenceEnd')]
        def eventInstance = Event.get(params.id)

        if (!eventInstance) {
            flash.message = "${message(code: 'default.not.found.message', args: [message(code: 'event.label', default: 'Event'), params.id])}"
            redirect(action: "index")
        }
        else {
            def model = [eventInstance: eventInstance, occurrenceStart: occurrenceStart, occurrenceEnd: occurrenceEnd]

            if (request.xhr) {
                render(template: "showPopup", model: model)
            }
            else {
                model
            }
        }

    }
}
{% endhighlight %}

To round out our jQuery plugins we'll need a modal popup (I'm using the dialog component found in the <a href="http://jqueryui.com/">JQuery UI library</a>), as well as a good datepicker (I'm again using the <a href="http://jqueryui.com/">JQuery UI</a> for this), along with the <a href="http://trentrichardson.com/examples/timepicker/">timePicker add-on</a> to select the specific time of our event. In terms of UI this is a bit different than the way Google Calendar works, but I find Google's time selection to be a bit clunky. So here's what our datepicker popup will look like on our startTime and endTime fields:

<img src="/images/posts/google-calendar3-2.png" />

In order for the dates in this new format to be automatically bound to our Event domain object, I created a custom date registar. First I created a class <strong>CustomDateEditorRegistrar.groovy</strong> that looks like this:

{% highlight groovy %}
public class CustomDateEditorRegistrar implements PropertyEditorRegistrar {

        public void registerCustomEditors(PropertyEditorRegistry registry) {
            registry.registerCustomEditor(Date.class, new CustomDateEditor(new SimpleDateFormat("MM/dd/yyyy hh:mm a"), true))
        }

}
{% endhighlight %}

Then I referenced this new class in the <strong>conf/spring/resources.groovy</strong> file:

{% highlight groovy %}
beans = {
    customDateEditorRegistrar(com.craigburke.CustomDateEditorRegistrar)
}
{% endhighlight %}

So we have our datepicker setup, now we can use the dialog popup to show and hide the recurring options as needed. Here's what the recurring options looks like in Google Calendar:

<img src="/images/posts/google-calendar3-3.png" />

The one thing that makes reproducing this a bit tricky is if we throw the recurring options into a popup, the dialog plugin will pull them out of the form in the DOM. We can handle this by appending the recurring options to the popup when it opens and then putting them back in the form when it closes. That way all our recurring options get posted when we go to save. Here's what that looks like:

{% highlight javascript %}
 var recurPopup = $("#recurPopup").dialog({
        title: 'Repeat',
        width: 400,
        modal: true,
        open: function(event, ui) {
          $("#recurOptions").show().appendTo("#recurPopup");
        },
        close: function(event, ui) {
          $("#recurOptions").hide().appendTo("form.main");
        },
        buttons: {
            Ok: function() {
                $( this ).dialog( "close" );
            }
        }
    });
{% endhighlight %}

Now, as we look to finish up our controller, we're not going to be able to use the generated actions to edit or delete and event (again the recurring events make this more complicated). Here's the prompt that google calendar gives you if you try to edit a recurring event (we get a similar one if we try to delete a recurring event):

<img src="/images/posts/google-calendar3-4.png" />

So here's what should actually happen in these three cases when updating a recurring event:

<dl>
 <dt>
   Only this event
 </dt>
 <dd>
   Create a new (non-recurring event) with these properties. Add the date of this new event as an exclusion on the original event.
 </dd>
 <dt>
   Following events
 </dt>
 <dd>
  Create a new recurring event that begins on the selected day. The original event should now end on this day.
 </dd>
 <dt>All events</dt>
 <dd>
   Edit the existing event record. No new event record needs to be created.
 </dd>
</dl>

Here's what should happen when deleting a recurring event:
<dl>
 <dt>
   Only this event
 </dt>
 <dd class="first">
   Add this date as an exclusion on the event.
 </dd>
 <dt>
   Following events
 </dt>
 <dd>
   Set the recurUntil date to the selected date.
 </dd>
 <dt>All events</dt>
 <dd>
   Delete the event record.
 </dd>
</dl>

In order to keep our Controller lean and to take advantage of the transactions found in services, we're going to move our update and delete code to our <strong>EventService.groovy</strong> file:

{% highlight groovy %}
class EventService {
  def updateEvent(Event eventInstance, String editType, def params) {
        def result = [:]

        try {
            if (!eventInstance) {
                result = [error: 'not.found']
            }
            else if (!eventInstance.isRecurring) {
                eventInstance.properties = params

                if (eventInstance.hasErrors() || !eventInstance.save(flush: true)) {
                    result = [error: 'has.errors']
                }
            }
            else {
                Date startTime = params.date('startTime', ['MM/dd/yyyy hh:mm a'])
                Date endTime = params.date('endTime', ['MM/dd/yyyy hh:mm a'])

                // Using the date from the original startTime and endTime with the update time from the form
                int updatedDuration = Minutes.minutesBetween(new DateTime(startTime), new DateTime(endTime)).minutes

                Date updatedStartTime = new DateTime(eventInstance.startTime).withTime(startTime.hours, startTime.minutes, 0, 0).toDate()
                Date updatedEndTime = new DateTime(updatedStartTime).plusMinutes(updatedDuration).toDate()

                if (editType == "occurrence") {
                    // Add an exclusion
                    eventInstance.with {
                        addToExcludeDays(new DateTime(startTime).withTime(0, 0, 0, 0).toDate())
                        save(flush: true)
                    }

                    // single event
                    new Event(params).with {
                        startTime = updatedStartTime
                        endTime = updatedEndTime
                        isRecurring = false // ignore recurring options this is a single event
                        save(flush: true)
                    }
                }
                else if (editType == "following") {
                    // following event
                    new Event(params).with {
                        recurUntil = eventInstance.recurUntil
                        save(flush: true)
                    }

                    eventInstance.with {
                        recurUntil = startTime
                        save(flush: true)
                    }
                }
                else if (editType == "all") {
                    eventInstance.properties = params
                    eventInstance.startTime = updatedStartTime
                    eventInstance.endTime = updatedEndTime

                    if (eventInstance.hasErrors() || !eventInstance.save()) {
                        result = [error: 'has.errors']
                    }
                }
            }
        }
        catch (Exception ex) {
            result = [error: 'has.errors']
        }

        result
    }

    def deleteEvent(Event eventInstance, Date occurrenceStart, String deleteType) {

        def result = [:]

        try {
            if (!eventInstance) {
                result = [error: 'not.found']
            }
            if (!eventInstance.isRecurring || deleteType == "all") {
                eventInstance.delete(flush: true)
            }
            else if (eventInstance && deleteType) {
                if (deleteType == "occurrence") {
                    // Add an exclusion
                    eventInstance.addToExcludeDays(new DateTime(occurrenceStart).withTime(0, 0, 0, 0).toDate())
                    eventInstance.save(flush: true);
                }
                else if (deleteType == "following") {
                    eventInstance.recurUntil = occurrenceStart
                    eventInstance.save(flush: true)
                }
            }
        }
        catch (Exception ex) {
            result = [error: 'has.errors']
        }

        result
    }
}
{% endhighlight %}

Now our update and delete controller actions are pretty straightforward:

{% highlight groovy %}
class EventController {
  def eventService
  
  def create = {
        def eventInstance = new Event()
        eventInstance.properties = params

        [eventInstance: eventInstance]
    }

    def save = {
        def eventInstance = new Event(params)

        if (eventInstance.save(flush: true)) {
            flash.message = "${message(code: 'default.created.message', args: [message(code: 'event.label', default: 'Event'), eventInstance.id])}"
            redirect(action: "show", id: eventInstance.id)
        }
        else {
            render(view: "create", model: [eventInstance: eventInstance])
        }

    }

    def edit = {
        def eventInstance = Event.get(params.id)
        def (occurrenceStart, occurrenceEnd) = [params.long('occurrenceStart'), params.long('occurrenceEnd')]

        if (!eventInstance) {
            flash.message = "${message(code: 'default.not.found.message', args: [message(code: 'event.label', default: 'Event'), params.id])}"
            redirect(action: "index")
        }
        else {
            [eventInstance: eventInstance, occurrenceStart: occurrenceStart, occurrenceEnd: occurrenceEnd]
        }

    }

    def update = {
        def eventInstance = Event.get(params.id)
        String editType = params.editType

        def result = eventService.updateEvent(eventInstance, editType, params)

        if (!result.error) {
            flash.message = "${message(code: 'default.updated.message', args: [message(code: 'event.label', default: 'Event'), eventInstance.id])}"
            redirect(action: "index")
        }
        if (result.error == 'not.found') {
            flash.message = "${message(code: 'default.not.found.message', args: [message(code: 'event.label', default: 'Event'), params.id])}"
            redirect(action: "index")
        }
        else if (result.error == 'has.errors') {
            render(view: "edit", model: [eventInstance: eventInstance])
        }

    }


    def delete = {
        def eventInstance = Event.get(params.id)
        String deleteType = params.deleteType
        Date occurrenceStart = new Instant(params.long('occurrenceStart')).toDate()

        def result = eventService.deleteEvent(eventInstance, occurrenceStart, deleteType)

        if (!result.error) {
            redirect(action: "index")
        }
        if (result.error == 'not.found') {
            flash.message = "${message(code: 'default.not.found.message', args: [message(code: 'event.label', default: 'Event'), params.id])}"
            redirect(action: "index")
        }
        else if (result.error == 'has.errors') {
            redirect(action: "index")
        }
    }
}
{% endhighlight %}

We're almost finished now, we just need to add some code to make sure the recurUntil value is set if the user specifies a recurCount value (notice the methods to view the events only look at the recurUntil property):

{% highlight groovy %}
 class Event {

    def beforeUpdate() {
        updateRecurringValues()
    }
    
    def beforeInsert() {
        updateRecurringValues()
    }
    
    private void updateRecurringValues() {
        if (!isRecurring) {
            recurType = null
            recurCount = null
            recurInterval = null
            recurUntil = null
            excludeDays?.clear()
            recurDaysOfWeek?.clear()
        }

        // Set recurUntil date based on the recurCount value
        if (recurCount && !recurUntil) {
           Date recurCountDate = startTime

           for (int i in 1..recurCount) {
               recurCountDate = eventService.findNextOccurrence(this, new DateTime(recurCountDate).plusMinutes(1).toDate())
           }

           recurUntil = new DateTime(recurCountDate).plusMinutes(durationMinutes).toDate()
        }
        
    }
    def beforeDelete() {
        def associatedEvents = Event.withCriteria {
            eq('sourceEvent.id', this.id)
        }

        associatedEvents.each{def event -&gt;
            event.with {
                sourceEvent = null
                save(flush: true)
            }
        }
        
    }
{% endhighlight %}

{% include google-calendar-links.html %}

