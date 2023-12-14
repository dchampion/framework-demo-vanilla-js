let leakedMsg = '';

Array.from(document.getElementsByClassName('div-button')).forEach(button => {
    button.onclick = function() {
        Array.from(document.getElementsByClassName('div-button')).forEach(button => {
            button.className = button.className.replace(' active', '');
        });
        button.className += ' active';
        showDiv(this.dataset.div, 'top');
    }
    if (button.id === 'default-open') {
        button.click();
    }
});

Array.from(document.getElementsByClassName('reg-auth-div-button')).forEach(button => {
    button.onclick = function() {
        Array.from(document.getElementsByClassName('reg-auth-div-button')).forEach(button => {
            button.className = button.className.replace(' active', '');
        });
        button.className += ' active';
        showDiv(this.dataset.div, 'top-reg-auth');
    }
    if (button.id === 'default-open') {
        button.click();
    }
});

document.getElementById('long-call-submit-button').onclick = function() {
    submit(document.getElementById('long-call-timeout').value);
};

document.getElementById('reg-auth-registration-form').addEventListener("submit", async (e) => {
    e.preventDefault();
    const responseContainer = document.getElementById('reg-auth-response-container');
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;
    if (password !== confirmPassword) {
        responseContainer.innerHTML = "<b>Passwords don't match</b>";
    } else if (leakedMsg.length > 0) {
        responseContainer.innerHTML = `<b>${leakedMsg}</b>`;
        leakedMsg = '';
    } else {
        const response = await fetchResponse(e);
        responseContainer.innerHTML = `<b>${await response.text()}</b>`
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
    e.preventDefault();
    const responseContainer = document.getElementById('reg-auth-response-container');
    const response = await fetchResponse(e);
    if (!response.ok) {
        responseContainer.innerHTML = `<b>${await response.text()}</b>`;
    } else {
        let asJson = await response.json();
        let msg = `Hello, ${asJson['firstName']} ${asJson['lastName']}; you are logged in as ${asJson['username']}`
        if (response.headers.get('Password-Leaked') === 'true') {
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
});

async function fetchResponse(e) {
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
    document.querySelectorAll('form').forEach(form => form.reset());
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
        document.getElementById('long-call-response-container').innerHTML = `<b>Task submitted</b><br>`;
        poll(response.headers.get('task-id'), 1);
    }).catch((error) => {
        document.getElementById('long-call-response-container').innerHTML += `<b>${error}</b>`;
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
            document.getElementById('long-call-response-container').innerHTML += `<b>Polling ${count++} time(s)</b><br>`;
            sleep(2000).then(() => {poll(task_id, count)});
        } else if ('complete' === task_status) {
            response.json().then((value) => {
                document.getElementById('long-call-response-container').innerHTML += '<b>Got a response: ' + value + '</b>';
            });
        } else {
            throw new Error(`Status code: ${response.status}; Task status: ${task_status}`)
        }
    }).catch((error) => {
        document.getElementById('long-call-response-container').innerHTML += `<b>${error}</b>`;
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
