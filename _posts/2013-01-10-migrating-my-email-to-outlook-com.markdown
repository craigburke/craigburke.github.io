---
layout: post
title:  "Migrating My Email to Outlook.com"
date: 2013-01-10 21:10:23
---

One of the things I've been meaning to do is to migrate my email to a free hosted service so that I don't have to spend the time managing my own server (or paying for it). My main requirements were that I wanted to retain my custom domain email (craig@craigburke.com) and also get access to a decent webmail client all without paying anything for it.

Since Google recently <a href="http://www.wired.com/business/2012/12/free-google-apps/" target="_blank">stopped allowing people to sign up for free Google Apps accounts</a>, that rules them out as a free option for most people. If you had signed up for a Google Apps account prior to this change, then you should be grandfathered in and can still go the free email route. I'm in this category, but I honestly find gmail to be a bit clunky. If you still want to use gmail with a custom domain email and haven't previously signed up, you'll have to pay <a href="http://www.google.com/intl/en/enterprise/apps/business/pricing.html" target="_blank">$50/year</a> to do so.

The other free email option I looked at was <a href="http://www.outlook.com" target="_blank">outlook.com</a>, which is Microsoft's revamped version of Hotmail. I'm definitely no fan of Hotmail or anything that Microsoft touches, but man, did they get their webmail client right. It's simple, clean and incredibly fast. It also has an edge over gmail with seemingly unlimited storage and up to 500 users per domain. Here's what my inbox looks like right now:

<p><img src="/images/posts/outlook1.png" /></p>

The major downside is that there's currently no IMAP support (this almost killed it for me) and no decent mac client. They do however have support for their proprietary Exchange ActiveSync protocol, which means I can use it on my phone without issue.  As for the lack of a client on the mac, I can live with that since I don't have a problem using the awesome webmail version anyway. They also have a dedicated outlook.com mobile app which works but is fairly unimpressive. All in all, I decided that it'll work pretty well for my purposes.

To set things up, first I registered my craigburke.com domain at <a href="http://domains.live.com" target="_blank">domains.live.com</a>:

<p><img src="/images/posts/outlook2.png" /></p>

Then you'll need to follow the instructions to add the required MX (mail exchanger) records for your domain so that all email addressed to this new account are delivered to outlook's servers. This step is going to be specific to whatever domain registrar you chose (godaddy, namecheap, etc), but they all should have some web interface to easily add MX records and the directions provided by Microsoft are actually pretty decent.

Now you'll want to create a Microsoft account for each mailbox. I created a single account for <strong>craig@craigburke.com</strong>. After an account is created you should be able to login at <a href="http://www.outlook.com" target="_blank">www.outlook.com</a> to check your email provided that the MX record changes have propagated. This would be a good time to send a test message from another email account to make sure you're actually receiving email there.

Now to migrate existing emails you can try to go the automated route using <a href="https://secure5.trueswitch.com/hotmail/" target="_blank">TrueSwitch</a>, or if you're like me and this idea makes you a bit uncomfortable, you can use a client that supports Exchange ActiveSync and just copy the emails manually.

To manually move my email I downloaded a <a href="http://office.microsoft.com/en-us/try/" target="_blank">free trial of Microsoft Office 2010 with Outlook</a> (you'll need the Windows version so if you're on a Mac you should do this within a VM). You should also install the <a href="http://office.microsoft.com/en-us/outlook/microsoft-office-outlook-hotmail-connector-overview-HA010222518.aspx" target="_blank">Outlook Hotmail Connector </a> after you've installed Outlook so that you can connect to your new outlook.com account.

So first we'll add the outlook.com account. Select <strong>Microsoft Outlook Hotmail Connector</strong> under <strong>Other</strong> as your account type. If this isn't an option then make sure you've correctly installed the Outlook Hotmail connector.

<p>
<img src="/images/posts/outlook3.png" />
</p>

Then you simply add your email and password for outlook.com and you should be good to go. You might want to change the name of this account to make it clear that this is your outlook.com account. For example, I named this account <strong>'craig@craigburke.com (outlook.com)'</strong>. You can change this name by clicking the Advanced button.

<p><img src="/images/posts/outlook4.png" /></p>

Then, setup your old email account (likely IMAP) so that you can copy emails between these two accounts. I would recommend also changing the default name for this as well. For example I named mine <strong>'craig@craigburke.com (IMAP)'</strong>.

Once you have both accounts setup, you should be able to copy messages directly from the source account to your new outlook.com account. I would NOT recommend just dragging and dropping, because this will delete the messages from your source mailbox and we'd like to keep the original copies just in case something goes wrong.

You can just copy and paste email messages from your Inbox and Sent Mail folders (don't forget those messages in your Sent folder). For individual folders you can right click and select Copy Folder. You'll then be presented with a dialog like this so you can choose where you want the copy to go (in our case it's to the other account):

<p><img src="/images/posts/outlook4.png" /></p>

You'll do this for all folders you want to move (don't worry subfolders are automatically copied along with their parent folders). Now these actions will just copy these emails locally, so you'll need to make sure these new folders and emails are synced up with outlook.com's server by clicking Send/Receive All Folders button under the Send/Receive tab:

<p><img src="/images/posts/outlook5.png" /></p>

Then if you click the Show Progress button you'll see something like this which will give you some indication of how long the process will take:

<p><img src="/images/posts/outlook6.png" /></p>

Depending on how much email you're moving over this might take a long time. Once this is finished you'll want to verify that the email was moved successfully to your outlook.com account by logging in at <a href="http://www.outlook.com" target="_blank">www.outlook.com</a>. I've noticed when moving a lot of email it takes outlook.com a while to reindex everything, so your webmail might be a little wonky until that finishes. If you're unable to access certain folders, just give it a couple minutes and try again.

Hopefully this post is helpful to anyone looking to make the jump, but at very least all the references to my email address here should give outlook.com's spam filter some serious exercise.
