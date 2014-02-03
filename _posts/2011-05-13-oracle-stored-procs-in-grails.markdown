---
layout: post
title:  "Oracle Stored Procs in Grails"
date: 2011-05-13
---

If you find yourself in a situation where you need to wire up a legacy Oracle stored procedure to a grails controller action, groovy makes this pretty simple. In my example I have a stored procedure with a single parameter that returns results through a reference cursor. Here's our  stored proc:

{% highlight sql %}
create or replace procedure GRAILS_EXAMPLE
(
  v_name IN VARCHAR2,
  ref_cur1 IN OUT SYS_REFCURSOR
)
AS
begin

  OPEN ref_cur1 FOR
  SELECT UPPER(v_name) AS UPPER_NAME
  FROM DUAL;
  
end GRAILS_EXAMPLE;
{% endhighlight %}

Obviously this is a pretty contrived example. You're not likely to call an oracle stored procedure just to transform a string to uppercase (unless you're a complete moron), but it serves as a simplified version of what you might run into when trying to incorporate existing Oracle procs into your application.

Now, let's take a look at a controller that calls this proc and renders the value it grabs from the cursor:

{% highlight groovy %}
import java.sql.*
import groovy.sql.Sql
import oracle.jdbc.driver.OracleTypes

class OracleTestController {
    def dataSource
    
	def upperName = {
		Connection conn = dataSource.getConnection()
		Sql sql = new Sql(conn)
        
		String upperName;
		sql.call("BEGIN GRAILS_EXAMPLE(?,?); END;",
                [params.name, Sql.resultSet(OracleTypes.CURSOR)]) {cursorResults ->
				
				if (cursorResults.next()) {
                     upperName = cursorResults.getAt('UPPER_NAME');
				}

		}
				
		render upperName
       }

}
{% endhighlight %}

So first off we're injecting the dataSource so we can make our call to the Oracle database we're using as part of our application. You'll also see that we can iterate through the reference cursor results by iterating over the cursorResults variable (of type GroovyResultSet) in the sql.call closure. This is how you can grab the individual values you need from your cursor.

If you need to get at a field that isn't properly aliased in your proc you can still access it by its index. For example the follow would also work in the above controller:

{% highlight groovy %}
upperName = cursorResults.getAt(0)
{% endhighlight %}

See Also: <a href="http://groovy.codehaus.org/Database+features">Groovy Database Features</a>
