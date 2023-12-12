let leakedMsg = '';

Array.from(document.getElementsByClassName('div-button')).forEach(button => {
    button.onclick = function() {
        showDiv(this.dataset.div, 'top');
    }
});

Array.from(document.getElementsByClassName('reg-auth-div-button')).forEach(button => {
    button.onclick = function() {
        showDiv(this.dataset.div, 'reg-auth-top');
    }
});

document.getElementById('long-call-submit-button').onclick = function() {
    submit(document.getElementById('long-call-timeout').value);
};

document.getElementById('reg-auth-registration-form').addEventListener("submit", async (e) => {
    const responseContainer = document.getElementById('reg-auth-response-container');
    let password = document.getElementById('reg-password').value;
    let confirmPassword = document.getElementById('reg-confirm-password').value;
    if (password !== confirmPassword) {
        e.preventDefault();
        responseContainer.innerHTML = "Passwords don't match";
    } else if (leakedMsg.length > 0) {
        e.preventDefault();
        responseContainer.innerHTML = leakedMsg;
        leakedMsg = '';
    } else {
        const response = await fetchResponse(e);
        responseContainer.innerHTML = await response.text();
    }
});

document.getElementById('reg-password').addEventListener("focusout", async (event) => {
    const options = {
        method: 'POST',
        body: event.currentTarget.value
    }
    response = await fetch('http://localhost:8080/users/is-pw-leaked', options);
    leakedMsg = await response.text();
});

document.getElementById('reg-auth-login-form').addEventListener("submit", async (e) => {
    const responseContainer = document.getElementById('login-response-container');
    const response = await fetchResponse(e);
    if (!response.ok) {
        responseContainer.innerHTML = await response.text();
    } else {
        let asJson = await response.json();
        let msg = `Hello, ${asJson['firstName']} ${asJson['lastName']}; you are logged in as ${asJson['username']}`
        if (response.headers.get('Password-Leaked') === 'true') {
            msg +=
            '.<p><b>The password you are using on this site has previously<br>' +
            'appeared in a data breach of another site. THIS IS NOT<br>' +
            'RELATED TO A SECURITY INCIDENT ON THIS SITE.<br>' +
            'However, the fact that this password has previously<br>' +
            'appeared elsewhere puts this account at risk. You<br>' +
            'should consider changing your password on this<br>' +
            'site, as well as any other site on which you currently<br>' +
            'use this password.</b>';
        }
        responseContainer.innerHTML = msg;
    }
});

async function fetchResponse(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const url = form.action;
    const formData = new FormData(form);
    return await postFormFieldsAsJson({ url, formData });
}

async function postFormFieldsAsJson({ url, formData }) {
    //Create an object from the form data entries
    const formDataObject = Object.fromEntries(formData.entries());
    // Format the plain form data as JSON
    const formDataJsonString = JSON.stringify(formDataObject);

    //Set the fetch options (headers, body)
    const options = {
        //HTTP method set to POST.
        method: 'POST',
        //Set the headers that specify you're sending a JSON body request and accepting JSON response
        headers: {
            'Content-Type': 'application/json'
        },
        // POST request body as JSON string.
        body: formDataJsonString,
    };

    return await fetch(url, options);
}

function showDiv(div, className) {
    Array.from(document.getElementsByClassName(className)).forEach(div => {
        div.style.display = 'none';
    })
    Array.from(document.getElementsByClassName('response-container')).forEach(div => {
        div.innerHTML = '';
    })
    document.querySelector(`#${div}`).style.display = 'block';
}

function submit(value) {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };
    if (value) {
        options['body'] = `{"timeout":${value}}`;
    }

    fetch('http://localhost:8080/long-call/submit', options)
    .then((response) => {
        if (!response.ok) {
            task_status = response.headers.get('task-status');
            throw new Error(`Status code: ${response.status}; Task status: ${task_status}`);
        }
        document.getElementById('long-call-response-container').innerHTML = `Task submitted<br>`;
        poll(response.headers.get('task-id'), 1);
    }).catch((error) => {
        document.getElementById('long-call-response-container').innerHTML += error;
    });
}

function poll(task_id, count) {
    fetch(`http://localhost:8080/long-call/poll/${task_id}`, {method: 'GET'})
    .then((response) => {
        if (!response.ok) {
            task_status = response.headers.get('task-status');
            throw new Error(`Status code: ${response.status}; Task status: ${task_status}`);
        }
        task_status = response.headers.get('task-status');
        if ('pending' === task_status) {
            document.getElementById('long-call-response-container').innerHTML += `Polling ${count++} time(s)<br>`;
            sleep(2000).then(() => {poll(task_id, count)});
        } else if ('complete' === task_status) {
            response.json().then((value) => {
                document.getElementById('long-call-response-container').innerHTML += 'Got a response: ' + value;
            });
        } else {
            throw new Error(`Status code: ${response.status}; Task status: ${task_status}`)
        }
    }).catch((error) => {
        document.getElementById('long-call-response-container').innerHTML += error;
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

