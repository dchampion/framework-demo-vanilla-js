document.addEventListener('DOMContentLoaded', () => {
    const topDivButtons = document.getElementsByClassName('div-button');
    Array.from(topDivButtons).forEach(button => {
        button.onclick = function() {
            showDiv(this.dataset.div, 'top');
        }
    });

    const regAuthDivButtons = document.getElementsByClassName('reg-auth-div-button');
    Array.from(regAuthDivButtons).forEach(button => {
        button.onclick = function() {
            showDiv(this.dataset.div, 'reg-auth-top');
        }
    })

    const submitButton = document.getElementById('long-call-submit-button');
    submitButton.onclick = function() {
        submit(document.getElementById('long-call-timeout').value);
    }

    const regForm = document.getElementById('reg-auth-registration-form');
    regForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const url = form.action;
        const formData = new FormData(form);
        const responseData = await postFormFieldsAsJson({ url, formData });
        responseContainer = document.getElementById('reg-auth-response-container');
        responseContainer.innerHTML = await responseData.text();
    });

    const loginForm = document.getElementById('reg-auth-login-form');
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const url = form.action;
        const formData = new FormData(form);
        const response = await postFormFieldsAsJson({ url, formData });
        let str;
        if (!response.ok) {
            str = await response.text();
        } else {
            str = await response.json();
            str = `Hello, ${str['username']}`;
        }
        responseContainer = document.getElementById('login-response-container');
        responseContainer.innerHTML = str;
    })
});

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
        if (202 !== response.status) {
            throw new Error(`HTTP error on submit! Status code: ${response.status}`);
        }
        poll(response.headers.get('task-id'), 1);
    }).catch((error) => {
        document.getElementById('long-call-response-container').innerHTML = error;
    });
}

function poll(task_id, count) {
    fetch(`http://localhost:8080/long-call/poll/${task_id}`, {method: 'GET'})
    .then((response) => {
        if (200 !== response.status) {
            task_status = response.headers.get('task-status');
            throw new Error(`HTTP error on poll! Status: ${response.status}; Task status: ${task_status}`);
        }
        task_status = response.headers.get('task-status');
        if ('pending' === task_status) {
            document.getElementById('long-call-response-container').innerHTML = `Polling ${count++} time(s)`
            sleep(2000).then(() => {poll(task_id, count)});
        } else if ('complete' === task_status) {
            response.json().then((value) => {
                document.getElementById('long-call-response-container').innerHTML = 'Got a response: ' + value;
            });
        } else {
            throw new Error(`HTTP error on poll! Status: ${response.status}; Task status: ${task_status}`)
        }
    }).catch((error) => {
        document.getElementById('long-call-response-container').innerHTML = error;
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

