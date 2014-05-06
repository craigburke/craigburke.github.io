---
layout: post
title:  "Grails Ajax List with Paging and Sorting"
date: 2011-01-01
---

You can easily add ajax to your grails application using standard g tags, but making a list (table) that supports ajax-enabled sorting and paging is a bit different. Here are the steps I took to make this happen.

First I started with my controller action. I'm using single action for the list page as well as the ajax request to update the table data. It'll look something like this:

{% highlight groovy %}
def list = {
      params.max = Math.min(params.max ? params.int('max') : 20, 100)
      def model = [userInstanceList: User.list(params), userInstanceTotal: User.count()]

      if (request.xhr) {
          // ajax request
          render(template: "grid", model: model)
      }
      else {
           model
      }
}
{% endhighlight %}

A regular request uses the standard list view, but an ajax request is going to use a view template that contains just the HTML for our table along with its pagination links. Here's an example of what these views might look like:

<strong>list.gsp</strong>

{% highlight html %}
<html>
    <head>
        <meta name="layout" content="main" />
        <g:set var="entityName" value="${message(code: 'user.label', default: 'User')}" />
        <title><g:message code="default.list.label" args="[entityName]" /></title>
    </head>
    <body>

        <h2><g:message code="default.list.label" args="[entityName]" /></h2>

        <g:if test="${flash.message}">
          <div class="message">${flash.message}</div>
        </g:if>

           <p>
          <g:link class="button create" action="create"><g:message code="default.new.label" args="[entityName]" />
          </g:link>
          </p>

        <div id="grid">
           <g:render template="grid" model="model" />
        </div>

    </body>
</html>
{% endhighlight %}

<strong>&#95;grid.gsp</strong>

{% highlight xml %}
<table class="ajax">
    <thead>
        <tr>
            <g:sortableColumn property="id" title="${message(code: 'user.id.label', default: 'Id')}" />
            <g:sortableColumn property="isActive" title="${message(code: 'user.isActive.label', default: 'Is Active')}" />
            <g:sortableColumn property="name" title="${message(code: 'user.name.label', default: 'Name')}" />
       </tr>
    </thead>
    <tbody>
    <g:each in="${userInstanceList}" status="i" var="userInstance">
        <tr class="${(i % 2) == 0 ? 'odd' : 'even'}">
            <td><g:link action="show" id="${userInstance.id}">${fieldValue(bean: userInstance, field: "id")}</g:link></td>
            <td><g:formatBoolean boolean="${userInstance.isActive}" ></td>
            <td>${fieldValue(bean: userInstance, field: "name")}</td>
         </tr>
    </g:each>
    </tbody>
</table>

<div class="pagination">
	<g:paginate total="${userInstanceTotal}" />
</div>
{% endhighlight %}

Finally we'll just need to add a little jQuery to turn these sorting and paging links into ajax requests.

{% highlight javascript %}
$(document).ready(function() {
    setupGridAjax();
});

// Turn all sorting and paging links into ajax requests for the grid
function setupGridAjax() {
    $("#grid").find(".paginateButtons a, th.sortable a").live('click', function(event) {
        event.preventDefault();
        var url = $(this).attr('href');

        var grid = $(this).parents("table.ajax");
        $(grid).html($("#spinner").html());

        $.ajax({
            type: 'GET',
            url: url,
            success: function(data) {
                $(grid).fadeOut('fast', function() {$(this).html(data).fadeIn('slow');});
            }
        });
    });
}
{% endhighlight %}

Overall a pretty simple and elegant solution. If you're interested in taking this example a bit further with the addition of filtering, see my post <a href="http://www.craigburke.com/blog/2011/01/23/grails-ajax-list-with-paging-sorting-and-filtering/">Grails Ajax List with Paging, Sorting and Filtering</a>.
