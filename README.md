# framework-demo
The <i>framework-demo</i> project is designed to demonstrate the features of the <i>framework</i>; a Spring-based Java web application framework that is contained in a companion repo to this one.

For instructions on how to install and run the <i>framework-demo</i> contained in this repo, consult the README on the aforementioned <a href=https://github.com/dchampion/framework target="_blank"><i>framework</i> repo homepage</a>.

For a fuller description of the features of the <i>framework</i>, consult that repo's <a href=https://github.com/dchampion/framework/wiki/Web-Application-Framework target="_blank">wiki</a>.

<b>Note: This project is a work in progress and should not be considered complete. Following is a list of unaddressed items:</b>
1. Move authentication logic currently residing in <code>@RestController</code> classes into servlet filters using the Spring security framework. These classes were thrown together quickly to demonstrate integration of the <a href=https://haveibeenpwned.com/API><i>Have I Been Pwned API</i></a> into a browser-based identity registration and authentication system, and are polluted with logic that belongs in servlet filters.

2. Add a stateless, token-based authentication and authorization mechanism (likely based on the Spring framework as well).

