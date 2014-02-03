---
layout: post
title:  "Amazon Web Services vs. Linode"
date: 2011-06-27
---

It seems that a lot of people are talking about taking their applications to "the cloud" (uggh) and are singing the praises of services like Amazon Web Services. On paper its "pay for what you use" approach would make it seem like a much cheaper option than a VPS hosting option such as <a href="http://www.linode.com/?r=e4d3cc01d64d072a789626f7502b58f05062c3a3">Linode</a> where the costs are fixed. This variable model only really makes sense if your usage is truly variable though. If you're using AWS to deploy a few dedicated servers then you might be paying too much. 

Netflix is an oft cited example of a company than uses AWS to build highly scalable services in a way that isn't cost prohibitive. People see this and assume that since the smart people at Netflix are doing things this way that they should as well. Choosing an architecture for your web application isn't a one-size-fit-all proposition and even the bright guys at Netflix understand this. Here's what <a href="http://cloudscaling.com/blog/cloud-computing/cloud-innovators-netflix-strategy-reflects-google-philosophy">Adrian Cockcroft had to say</a> about what they chose <strong>not</strong> to use AWS for:

<blockquote>Encoding movies for streaming, log analysis, production web site and API, most everything that scales with customers and streaming usage. Easier to say what we don’t have there: most internal IT that scales with employee count, legacy stuff, DVD shipping systems, account sign-up and billing systems.</blockquote>

<strong>So for the stuff where the demands are pretty constant and growth is predictable, AWS doesn't make sense for Netflix.
</strong>

One nice feature of AWS is the ability to quickly and easily add or remove instances from load. So say you need 100 web servers one day and based on demand you'd like the option to drop that down to 2 running web servers the next day; it's a scenerio like this were you really see the cost benefits of AWS. Realistically though your growth and usage might look a bit more linear than that. It's really a question of what you're trying to do and how much your actual demand will fluctuate. 

You can use <a href="http://calculator.s3.amazonaws.com/calc5.html">Amazon's simple monthly calculator</a> to try to estimate your costs but you'll find that it's very difficult to do this accurately. There are a lot of variables to take into account many of which you won't know until you get billed for them. For example, if you want to backup your data, how much are your snapshots going to cost? You won't know until you see your bill for the month. That can be a real issue if you're trying to control costs. With AWS you can spend a lot of time reacting to and readjusting your setup based on what your bill ends up looking like. 

If you're deploying a couple dedicated servers than price-wise a VPS like <a href="http://www.linode.com/?r=e4d3cc01d64d072a789626f7502b58f05062c3a3
http://www.linode.com/?r=e4d3cc01d64d072a789626f7502b58f05062c3a3http://www.linode.com/?r=e4d3cc01d64d072a789626f7502b58f05062c3a3">Linode</a> might make more sense. One thing I like is that you can expand your servers as needed in smaller increments. Since I'm typically deploying Grails (Java) applications that use a mySQL database, memory is one of my major concerns. With Linode I can incrementally bump my memory up (512MB -> 768MB -> 1024MB -> 1536MB etc). Whereas with AWS I'm much more limited in terms of how gradually I can bump this up (613MB -> 1.7GB -> 7.5 GB). Those are much larger jumps and I'm likely paying for more than I really need. If I only really need 768MB of memory I'll still have to pay the 1.7GB price. 

So let's try to do an apples to apples price comparison on a single web/database server. I'll pick a small instance (1.79 GB) for AWS. Now Linode doesn't offer a plan with exactly this much memory so I'll have to average out the 1536MB and a 2048MB plans that it does offer. Now assuming we need 15GB of bandwidth and 30GB of storage here's what we're looking at in terms of monthly costs:

<blockquote>
<a href="http://www.linode.com/?r=e4d3cc01d64d072a789626f7502b58f05062c3a3
http://www.linode.com/?r=e4d3cc01d64d072a789626f7502b58f05062c3a3http://www.linode.com/?r=e4d3cc01d64d072a789626f7502b58f05062c3a3">Linode</a>: $69.95/mo
<a href="http://calculator.s3.amazonaws.com/calc5.html?key=calc-525305A1-A1E5-4AD3-AB91-F7ED572C09E2">AWS: </a>$67.07/mo
<strong>Difference: $2.88</strong>
</blockquote>

So Amazon is slightly cheaper for an instance with comparable memory. Although it should be noted if we go over our 15 GB bandwidth we're going to get charged. Whereas with Linode we would have approximately 700GB of bandwidth included in the price. So our price with Linode is truly fixed even if we get slashdotted.

Now if we're willing to commit to having this same size instance for at least a year this price difference is even greater:
<blockquote>
<a href="http://www.linode.com/?r=e4d3cc01d64d072a789626f7502b58f05062c3a3
http://www.linode.com/?r=e4d3cc01d64d072a789626f7502b58f05062c3a3http://www.linode.com/?r=e4d3cc01d64d072a789626f7502b58f05062c3a3">Linode</a>: $62.95/mo
<a href="http://calculator.s3.amazonaws.com/calc5.html?key=calc-FB2A8C48-08F1-4714-B49B-F4E287175E1F">AWS: </a>$45.76/mo*
<strong>Difference: $17.19</strong>
<small>* includes $252.46 upfront fee to deploy a dedicated small instance</small>
</blockquote>

So that's a pretty huge difference in terms of price. Now obviously this is a pretty simple example and you'll want to make this comparison based on what your needs and predicted growth really are. Amazon does offer a lot of nice services that you're just not going to find with a VPS like Linode (such as its cloudfront CDN, and database management (RDS) service) but if cost is your primary concern and you're not afraid to manage these things yourself Amazon might not make sense.

Ultimately I prefer <a href="http://www.linode.com/?r=e4d3cc01d64d072a789626f7502b58f05062c3a3">Linode</a> since it allows me to gradually grow and expand my servers as I need to. As with any architectural decision though what makes sense for me might not make sense for you. Ultimately choose what will work and grow with your application and don't just choose a service because you think it's what everybody else is doing.