---
layout: post
title:  "Setting up Tomcat on Ubuntu"
date: 2011-08-25
---

If you want to run a grails app (or any Java app that requires a servlet container) Tomcat is an excellent choice. You'll need to do this if you're hosting your app on a VPS like <a href="http://www.linode.com/?r=e4d3cc01d64d072a789626f7502b58f05062c3a3http://www.linode.com/?r=e4d3cc01d64d072a789626f7502b58f05062c3a3">Linode</a> (highly recommended) or if you're using AWS and want a little more control than Elastic Beanstalk allows you. I preformed the following steps on an Ubuntu 10.04 server.

Before we install tomcat we should have apache and java installed on the server.

{% highlight bash %}
apt-get install sun-java6-jdk
apt-get -y install apache2
{% endhighlight %}

We should also create a new user for tomcat to run as
{% highlight bash %}
sudo useradd tomcat
{% endhighlight %}

In order to easily accomodate multiple instances of tomcat on this machine I don't use the package manager to install tomcat but instead download it myself. You can find <a href="http://tomcat.apache.org/download-70.cgi">the closest mirror for Tomcat 7</a> on their site. Here's the process I use to get my base tomcat install ready:

{% highlight bash %}
cd /opt
wget http://apache.mirrors.tds.net/tomcat/tomcat-7/v7.0.14/bin/apache-tomcat-7.0.14.tar.gz
tar -xvf apache-tomcat-7.0.14.tar.gz 
rm apache-tomcat-7.0.14.tar.gz 
ln -s apache-tomcat-7.0.14/ tomcat
{% endhighlight %}

This way if I want to upgrade my tomcat I simply download the new version into /opt and change the link.

Now let's setup a separate tomcat base folder. This will contain just the folders and settings for the specific instance of tomcat. I keep my tomcat instances on a separate partition called /web so you might have to change the paths here. Here's the steps I follow to create a new tomcat instance called tomcat-craig.

{% highlight bash %}
cd /web
mkdir tomcat-craig
cd tomcat-craig
mkdir conf
mkdir logs
mkdir temp
mkdir webapps
mkdir work
cd ../
cp /opt/tomcat/conf/server.xml ./conf/
cp /opt/tomcat/conf/web.xml ./conf/
sudo chown -R tomcat:tomcat tomcat-craig
{% endhighlight %}

Now if you have multiple instances of tomcat you need to make sure the shutdown and startup ports are unique in <strong>conf/server.xml</strong>. Here's what my server.xml file looks like:

Alright now we should create a startup script (/etc/init.d/tomcat-craig) that's going to use our tomcat base we installed in /opt/tomcat and deploy the wars found in /web/tomcat-craig. I've tweaked <a href="http://blog.valotas.com/2011/05/tomcat-initd-script.html">this excellent startup script</a> to allow for multiple instances. So here's what my startup script file looks like:

{% highlight bash %}
#!/bin/bash
#
# tomcat        
#
# chkconfig: 
# description:  Start up the Tomcat servlet engine.

# Source function library.
# /etc/init.d/functions


export CATALINA_BASE="/data/www/tomcat-craig"
export CATALINA_HOME="/opt/tomcat"
export CATALINA_OPTS="-Xms192m -Xmx256m"

TOMCAT_USER='tomcat'
SHUTDOWN_WAIT=20

tomcat_pid() {
  echo `ps aux | grep $CATALINA_HOME | grep -v grep | awk '{ print $2 }'`
}

start() {
  pid=$(tomcat_pid)
  if [ -n "$pid" ]
     then
        echo "Tomcat is already running (pid: $pid)"
     else
        echo "Starting Tomcat"
        /bin/su $TOMCAT_USER $CATALINA_HOME/bin/startup.sh
   fi
   
   return 0
} 

stop() {
 pid=$(tomcat_pid)
  if [ -n "$pid" ]
  then

  echo "Stoping Tomcat"  
   /bin/su $TOMCAT_USER $CATALINA_HOME/bin/shutdown.sh  

   echo -n "Waiting for processes to exit ["
   let kwait=$SHUTDOWN_WAIT
    count=0;
    until [ `ps -p $pid | grep -c $pid` = '0' ] || [ $count -gt $kwait ]
    do
      echo -n ".";
      sleep 1
      let count=$count+1;
    done
    echo "Done]"

    if [ $count -gt $kwait ]
    then
      echo "Killing processes ($pid) which didn't stop after $SHUTDOWN_WAIT seconds"
      kill -9 $pid
    fi
  else
    echo "Tomcat is not running"
  fi
 
  return 0
} 

status() {
  pid=$(tomcat_pid)
  if [ -n "$pid" ]
  then
    echo "Tomcat is running with pid: $pid"
  else
    echo "Tomcat is not running"
  fi
}

case "$1" in
 start)
        start 
        ;;
 stop)
        stop
        ;;
 restart)
       stop
       start
       ;;
 status)
       status
       ;; 
*)
        echo "Usage: $0 {start|stop|restart|status}"
        exit 1
        ;;
esac
exit 0
{% endhighlight %}

The really cool part about this is that it attempts to shutdown tomcat gracefully, waits for a specified period of time and then just kills the process if it's still hanging there. Also since we set the JVM heap size in the CATALINA_OPTS we can tweak the values in the script and simply restart if we ever need to bump that up. Now that we've got the script in place we should use it to startup tomcat 

{% highlight bash %}
sudo /etc/init.d/tomcat-craig start
{% endhighlight %}

Now to have tomcat startup automatically after a server restart do the following:
{% highlight bash %}
sudo ln -s /etc/init.d/tomcat-craig S70tomcat-craig
{% endhighlight %}

In this example we setup tomcat to run on AJP port 8009 (see the server.xml file above). The last step is to have apache proxy all request to our tomcat instance, so that a request to www.yourdomain.com gets directed to tomcat.

First we install mod-jk
{% highlight bash %}
apt-get install libapache2-mod-jk
{% endhighlight %}

Next we create the file <strong>/etc/apache2/workers.properties</strong> that looks something like this:

{% highlight apache %}
worker.list=craig-worker
worker.craig-worker.type=ajp13
worker.craig-worker.host=localhost
worker.craig-worker.port=8009
{% endhighlight %}

Then the last thing we need to do is configure a site in apache that uses this worker process. Here's a simplified version of my site found in <strong>/etc/apache2/sites-available/default</strong>

{% highlight apache %}
<VirtualHost *:80>
	ServerName www.craigburke.com
	JKMount /** craig-worker
</VirtualHost>
{% endhighlight %}

Now you're ready to drop your war (grails or otherwise) into your tomcat webapps folder and deploy your app.
