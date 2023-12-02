document.addEventListener('DOMContentLoaded', () => {
  document.getElementById("button").innerHTML = "Loaded"
})

function submit() {

}

function startPolling() {
  var endpointUrl = 'http://localhost:8080/long-call/submit';
  var endpointUrlPoll = 'http://localhost:8080/long-call/poll/'
  var interval = 1000; // Time interval between requests in milliseconds (1 second in this example)

  // Function to update the response container
  function updateResponse(response) {
      document.getElementById('responseContainer').innerHTML = 'Response Body: ' + JSON.stringify(response);
  }

  // Function to update the UI while polling
  function updateUIPending() {
      document.getElementById('responseContainer').innerHTML = 'Waiting for response...';
  }

  function makeRequest(method) {
      var xhr = new XMLHttpRequest();

      xhr.onreadystatechange = function () {
          if (xhr.readyState === XMLHttpRequest.DONE) {
              if (xhr.status === 200) {
                  var response = JSON.parse(xhr.responseText);

                  // Check if the response contains a body
                  if (response.body) {
                      console.log('Response with body received:', response);
                      // Update the UI with the response
                      updateResponse(response);
                  } else {
                      // Continue polling after the specified interval with GET requests
                      updateUIPending();
                      setTimeout(function () {
                          makeRequest('GET');
                      }, interval);
                  }
              } else {
                  console.error('Error:', xhr.status);
                  // Handle error if needed
              }
          }
      };

      var url = (method === 'POST') ? endpointUrl : endpointUrlPoll;  // Adjust the URL based on the request method
      xhr.open(method, url, true);

      // Set the Content-Type header for the POST request
      if (method === 'POST') {
          xhr.setRequestHeader('Content-Type', 'application/json');
          // Modify the payload as needed for your POST request
          var payload = JSON.stringify({"timeout":10});
          xhr.send(payload);
      } else {
          xhr.send();
      }
  }

  // Start polling with an initial POST request
  updateUIPending();
  makeRequest('POST');
}
