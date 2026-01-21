## Advancing My Webblog by Regressing

I'm advancing my personal health blog by regressing to static pages. Regression? Yes. I'm advancing by retreating :p

I haven't been a web coder in a LONG time. I came in the wave AFTER websites were handcoded in pearl, but long before javascript. I coded pages in HTML and then with ColdFusion. Yes, I'm ancient. Web sites were built by hand coding and that was a road block for publishing.

Then came CMS - content management systems. These were a godsend. Technical users would install and configure and content creators would log in, type in their ariticles and hit publish. It was quite the innovation. I hosted sites using phpNuke, Durpal and other dinosaurs. BTW, I still think the forum software of that era are a LOT better than what we have here on Locals. I like threaded discussions, but I digress.

However, adding a database, application server and the rest of the CMS made content sites both more expensive and much more fragile. Sql injection attacks and more meant that you had to keep updating your CMS. Updating->migrating the database schemas and data wasn't alwways seamless. This is not a coprehensive list.

Performancewise? CMS's became slow. Every view of a page kicks off a database query and a rebuilding of the html before delivery. And yes - now we also have heinious javascript ads and the like. But that's really a rant for a different day.

Fast forward to today. Now you can write your content in markdown, commit it to your git repot, and have a theme applied and the static web page generated.  Github has replaced the CMS. Your web content is code written in markdown. I'm very late to this, it came out around 2008.

But since I already use Github.com to host my code, this is a very natural work flow. I'm using Argo and Cloudflare's pages feature. And yes, like anyting Cloudflare, it's a pain to figure out how to setup, but works great. You get the benefit of the CDN pushing your web pages to caches around the world. There is no database, web application server. Your pages are static HTML which is perfect for content. There are ways to add interactivity with Argo but I haven't explored that yet.

Here's a link to the site: http://lessoflee.pages.dev

I haven't migrated my Wordpress.com content yet. I requested export of my data but it hasn't arrived in my email yet.  So I have a few sample posts up including this one.

