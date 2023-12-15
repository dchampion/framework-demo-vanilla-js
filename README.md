# framework-demo-vanilla-js
This project is designed to demonstrate the features of a small [web application framework](https://github.com/dchampion/framework) that I wrote. To install and run _this_ project, consult _that_ project's [README](https://github.com/dchampion/framework/blob/master/README.md) (and check the [wiki](https://github.com/dchampion/framework/wiki/Web-Application-Framework) for a description of its features).

## Why?
This project (_framework&dash;demo&dash;vanilla&dash;js_) is the successor to [_framework&dash;demo_](https://github.com/dchampion/framework-demo). Whereas I used [Angular](https://en.wikipedia.org/wiki/JavaScript#Angular) to implement the frontend of the latter, in this project I replaced the Angular frontend with pure HTML and CSS backed by [vanilla JavaScript](https://en.wikipedia.org/wiki/JavaScript#Vanilla_JS) (JS).

Why did I do this? First, Angular and its ilk (_React_, _Vue_, _Svelte_, _Express.js_, etc.) are _icebergs_; that is, delivering just a tiny bit of functionality (the tip of the iceberg) comes at the cost of considerable baggage (the underwater part).

Second, I wanted to subject myself to a thorough introduction to the primitives of the JavaScript programming language, which I had only touched here and there during my career as a software engineer.

As for Angular et al. being icebergs, beneath their surfaces lurk hulking tangles of 3rd&dash;party dependencies and other sundry ornaments, most of which are completely unrelated to the purpose of the software. Frameworks of this sort are an inelegant waste of resources, and quickly become maintenance nightmares if not cared for constantly and meticulously. Adding insult to injury, they expose a massive attack surface to bad actors via the open&dash;source supply chain.

As for the backend, regrettably, it too is implemented using a framework; in this case the Java&dash;based [Spring framework](https://en.wikipedia.org/wiki/Spring_Framework). At best it is only slightly less deserving of the critiques I leveled at Angular. As evidence, when I set out to rewrite the frontend in vanilla JS, so riddled was the backend with security vulnerabilities&mdash;those discovered in the 18 months or so since I last visited the project&mdash;it took me nearly a week to bring it up to date.

Unfortunately, the backend is just too complex to rewrite from scratch using only Java primitives (I suppose it could be done, but I am not sufficiently motivated to do it).