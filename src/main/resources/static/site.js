// Global to store password-has-been-breached warning message.
let leakedMsg = '';

// Buttons of class 'div-button' are top-level tabs.
Array.from(document.getElementsByClassName('div-button')).forEach(button => {
    button.onclick = function() {
        // Remove the 'active' class from all tabs (should really only be previously
        // selected tab).
        Array.from(document.getElementsByClassName('div-button')).forEach(button => {
            button.className = button.className.replace(' active', '');
        });
        // Add the 'active' class to the tab that was just selected.
        button.className += ' active';
        // Show the top-level div associated with this tab selection.
        showDiv(this.dataset.div, 'top');
    }
    // Make an initial default tab selection. This happens only once,at page-load time.
    if (button.id === 'default-open') {
        button.click();
    }
});

// Buttons of class 'div-button-reg-auth' are sub-level tabs within the top-level registration/
// authentication div.
Array.from(document.getElementsByClassName('div-button-reg-auth')).forEach(button => {
    button.onclick = function() {
        // Remove the 'active' class from all sub-level tabs (should really only be previously
        // selected tab).
        Array.from(document.getElementsByClassName('div-button-reg-auth')).forEach(button => {
            button.className = button.className.replace(' active', '');
        });
        // Add the 'active' class to the tab that was just selected.
        button.className += ' active';
        // Show the sub-level div associated with this tab selection.
        showDiv(this.dataset.div, 'top-reg-auth');
    }
    // Make an initial default tab selection. This happens only once, at page-load time.
    if (button.id === 'default-open') {
        button.click();
    }
});

// Form button that submits a long-running task to the server.
document.getElementById('long-call-submit-button').onclick = function() {
    longCallSubmit(document.getElementById('long-call-timeout').value);
}

// Hide all divs of class className except the div supplied to this function.
function showDiv(div, className) {
    Array.from(document.getElementsByClassName(className)).forEach(div => {
        div.style.display = 'none';
    })
    // Clear out the response-container divs while we're at it.
    Array.from(document.getElementsByClassName('response-container')).forEach(div => {
        div.innerHTML = '';
    })
    // Reset the form inputs while we're at it.
    document.querySelectorAll('form').forEach(form => form.reset());
    // Display just the div supplied to this function.
    document.querySelector(`#${div}`).style.display = 'block';
}

// Submits a long-running task to the server.
async function longCallSubmit(value) {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };
    if (value) {
        // Timeout is optional.
        options['body'] = `{"timeout":${value}}`;
    }

    try {
        // Submit the long-running task to the server.
        const response = await fetch('http://localhost:8080/long-call/submit', options);
        if (!response.ok) {
            // Something went wrong.
            task_status = response.headers.get('task-status');
            document.getElementById('long-call-response-container').innerHTML +=
                `<b>Status code: ${response.status}; Task status: ${task_status}</b>`;
        } else {
            // Task was submitted successfully; start polling.
            document.getElementById('long-call-response-container').innerHTML = `<b>Task submitted</b><br>`;
            poll(response.headers.get('task-id'), 1);
        }
    } catch (error) {
        document.getElementById('long-call-response-container').innerHTML = `<b>${error}</b>`;
    }
}

// Polls the server for the status of the long-running task.
async function poll(task_id, count) {
    // GET the status.
    const response = await fetch(`http://localhost:8080/long-call/poll/${task_id}`, {method: 'GET'});
    if (!response.ok) {
        // Something went wrong.
        task_status = response.headers.get('task-status');
        document.getElementById('long-call-response-container').innerHTML +=
            `<b>Status code: ${response.status}; Task status: ${task_status}</b>`;
    } else {
        // Check the response header for the task status.
        task_status = response.headers.get('task-status');
        if ('pending' === task_status) {
            // If 'pending', sleep for 2 seconds and poll again.
            document.getElementById('long-call-response-container').innerHTML +=
                `<b>Polling ${count++} time(s)</b><br>`;
            await sleep(2000);
            poll(task_id, count);
        } else if ('complete' === task_status) {
            // If 'complete', display the results of the long-running task.
            const json = await response.json();
            document.getElementById('long-call-response-container').innerHTML +=
                '<b>Got a response: ' + json + '</b>';
        } else {
            // Somethin went wrong.
            document.getElementById('long-call-response-container').innerHTML +=
                `<b>Status code: ${response.status}; Task status: ${task_status}</b>`;
        }
    }
}

// Sleeps for ms milliseconds.
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Form button that submits user information/credentials for registration.
document.getElementById('reg-auth-registration-form').addEventListener("submit", async (e) => {
    // Eat the default form-submit behavior.
    e.preventDefault();

    const responseContainer = document.getElementById('reg-auth-response-container');

    // First check passwords match.
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;
    if (password !== confirmPassword) {
        responseContainer.innerHTML = "<b>Passwords don't match</b>";

    // Check to see if the password has been breached. See "focusout" listener
    // on password field to understand how leakedMsg can be non-zero length.
    } else if (leakedMsg.length > 0) {
        responseContainer.innerHTML = `<b>${leakedMsg}</b>`;
        leakedMsg = '';

    // All is good.
    } else {
        try {
            const response = await fetchResponse(e);
            responseContainer.innerHTML = `<b>${await response.text()}</b>`;
        } catch (error) {
            responseContainer.innerHTML = `<b>${error}</b>`
        }
    }
});

// When focus leaves the password field, send its input to the API that checks for a
// password breach. This will happen silently while the user is typing the password
// for a second time in the confirm-password field. By the time the user submits the form,
// the output of this function (leakedMsg) will either be an empty string (password not
// breached) or a non-zero length string (password breached). If it is non-zero (i.e., the
// password has been breached), the submit handler will reject it and display leakedMsg
// to the user.
document.getElementById('reg-password').addEventListener("focusout", async (event) => {
    const options = {
        method: 'POST',
        body: event.currentTarget.value
    }
    try {
        response = await fetch('http://localhost:8080/users/is-pw-leaked', options);
        leakedMsg = await response.text();
    } catch (error) {
        // Fail silently here.
        console.warn(`${error}: Unable to get leaked status on focusout`);
    }
});

// Login form handler.
document.getElementById('reg-auth-login-form').addEventListener("submit", async (e) => {
    // Eat the default form-submit behavior.
    e.preventDefault();

    const responseContainer = document.getElementById('reg-auth-response-container');

    try {
        const response = await fetchResponse(e);
        if (!response.ok) {
            // Something went wrong.
            responseContainer.innerHTML = `<b>${await response.text()}</b>`;
        } else {
            // Login successful.
            let asJson = await response.json();
            let msg = `Hello, ${asJson['firstName']} ${asJson['lastName']}; you logged in successfully as ${asJson['username']}`
            if (response.headers.get('Password-Leaked') === 'true') {
                // Login still successful. However, the user's password has since been
                // leaked in a data breach. Warn the user to change it.
                msg +=
                '.<p>The password you are using on this site has previously<br>' +
                'appeared in a data breach of another site. THIS IS NOT<br>' +
                'RELATED TO A SECURITY INCIDENT ON THIS SITE.<br>' +
                'However, the fact that this password has previously<br>' +
                'appeared elsewhere puts this account at risk. You<br>' +
                'should consider changing your password on this<br>' +
                'site, as well as any other site on which you currently<br>' +
                'use this password.';
            }
            responseContainer.innerHTML = `<b>${msg}</b>`;
        }
    } catch (error) {
        responseContainer.innerHTML = `<b>${error}</b>`;
    }
});

// Prepare the form for POSTing.
async function fetchResponse(e) {
    const form = e.currentTarget;
    const url = form.action;
    const formData = new FormData(form);
    return await postFormFieldsAsJson(url, formData);
}

// Transform the form fields to JSON and POST.
async function postFormFieldsAsJson(url, formData) {
    //Create an object from the form data entries.
    const formDataObject = Object.fromEntries(formData.entries());
    // Format the plain form data as JSON.
    const formDataJsonString = JSON.stringify(formDataObject);

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: formDataJsonString,
    };

    return await fetch(url, options);
}
