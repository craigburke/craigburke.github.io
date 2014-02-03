---
layout: post
title:  "Grails Ajax List with Paging, Sorting and Filtering"
date: 2011-01-23
---

Adding to <a href="http://www.craigburke.com/blog/2011/01/01/grails-ajax-list-with-paging-and-sorting/">my previous post about creating an ajax list with paging and sorting</a>, I'm now going to extend our user list example to include filtering by the user's name.

First we need to tweak the controller action so that it doesn't just return all users. Unless you need to make use of some complicated hql expression, the criteria builder is the easiest way to do this. Here's what our modified list action will look like now:

{% highlight groovy %}
def list = {
      def query = {
           if (params.name) {
                    ilike('lastName', '%' + params.name + '%')
            }
            if (params.sort){
                order(params.sort,params.order)
            }
     }

     def criteria = User.createCriteria()
     params.max = Math.min(params.max ? params.int('max') : 20, 100)
     def users = criteria.list(query, max: params.max, offset: params.offset)
     def filters = [name: params.name]

     def model = [userInstanceList: users, userInstanceTotal: users.totalCount, filters: filters]

      if (request.xhr) {
          // ajax request
          render(template: "grid", model: model)
      }
      else {
           model
      }
}
{% endhighlight %}

Notice that we're using the filter param values to build our query and passing these values back to the model inside the filters object. The last part of this action uses one of two views. The first one is the main list page (list.gsp) and second one is for ajax requests which returns just the list part (_grid.gsp) of our page. Here's what these two views might look like:

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
        <br />
        <div class="filters">
          <g:form action="list">

              <p><label for="name">Name</label>
              <g:textField name="name" value="${filters?.name}" /></p>

              <p><g:submitButton name="filter" value="Filter" /></p>

           </g:form>
        </div>    
        <br />
        <div id="grid">
          <g:render template="grid" model="model" />	
        </div>
        <br />
        <p>
          <g:link action="create"><g:message code="default.new.label" args="[entityName]" /></g:link>
        </p>
    </body> 
</html>
{% endhighlight %}

This is very similar to what we saw in the last post, we're just adding the filter HTML elements. Next is the grid view:

<strong>_grid.gsp</strong>

{% highlight html %}
<table class="ajax">
    <thead>
        <tr>
            <g:sortableColumn property="id" title="Id" params="${filters}" />
            <g:sortableColumn property="isActive" title="Is Active" params="${filters}" />
            <g:sortableColumn property="name" title="Name" params="${filters}" />
       </tr>
    </thead>
    <tbody>
    <g:each in="${userInstanceList}" status="i" var="userInstance">
        <tr class="${(i % 2) == 0 ? 'odd' : 'even'}">
            <td><g:link action="show" id="${userInstance.id}">${fieldValue(bean: userInstance, field: "id")}</g:link></td>
            <td><g:formatBoolean boolean="${userInstance.isActive}" /></td>
            <td>${fieldValue(bean: userInstance, field: "name")}</td>
         </tr>
    </g:each>
    </tbody>
</table>

<div class="pagination">
    <g:paginate total="${userInstanceTotal}" params="${filters}" />
</div>
{% endhighlight %}

An important thing to note here is that we're using our filters object and setting the params property of both the pagination tag and each sortable column. This is so these filter parameters are available between requests so we don't lose our filter options when we sort or page.

Now our last step is to add some jQuery to turn all paging, sorting and filter requests into ajax requests. All pagination and sorting links will be turned into ajax requests. Also, any input elements you add inside the filter box (div.filters) will automatically do an ajax request and update your table.

{% highlight javascript %}
$(document).ready(function() {
    setupGridAjax();
    setupFilterAjax();
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
        })
    });
}

// Turn any input changes or form submission within a filter div into an ajax call
function setupFilterAjax() {
    $('div.filters :input').change(function() {
        var filterBox = $(this).parents("div.filters");
 	filterGrid(filterBox);
    });
    $("div.filters form").submit(function() {
	var filterBox = $(this).parents("div.filters");
	filterGrid(filterBox);
        return false;
    });
}

// Reload grid based on selections from the filter
function filterGrid(filterBox) {
     var grid = $(filterBox).next("div.grid");
     $(grid).html($("#spinner").html());

     var form = $(filterBox).find("form");
     var url = $(form).attr("action");
     var data = $(form).serialize();
     $.ajax({
        type: 'POST',
        url: url,
        data: data,
        success: function(data) {
            $(grid).fadeOut('fast', function() {$(this).html(data).fadeIn('slow');});
        }
     });
}
{% endhighlight %}

This code assumes that the grid (div.grid) is directly after the filters box (div.filters). You may need to adjust your jQuery if the structure of your page is different.

Hopefully you'll find this helpful. 