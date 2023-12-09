document.addEventListener('DOMContentLoaded', () => {
    const divButtons = document.getElementsByClassName('div-button');
    Array.from(divButtons).forEach(button => {
        button.onclick = function() {
            showDiv(this.dataset.div);
        }
    });

    const submitButton = document.getElementById('long-call-submit-button');
    submitButton.onclick = function() {
        submit(document.getElementById('long-call-timeout').value);
    }

    const regForm = document.getElementById('reg-auth-registration-form');
    regForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const form = e.currentTarget;
        const url = form.action;

        try {
            const formData = new FormData(form);

            const responseData = await postFormFieldsAsJson({ url, formData });
            document.getElementById('reg-auth-response-container').innerHTML = responseData;
        } catch (error) {
            document.getElementById('reg-auth-response-container').innerHTML = error;
        }
    })
});

async function postFormFieldsAsJson({ url, formData }) {
    //Create an object from the form data entries
    let formDataObject = Object.fromEntries(formData.entries());
    // Format the plain form data as JSON
    let formDataJsonString = JSON.stringify(formDataObject);

    //Set the fetch options (headers, body)
    let options = {
        //HTTP method set to POST.
        method: 'POST',
        //Set the headers that specify you're sending a JSON body request and accepting JSON response
        headers: {
            'Content-Type': 'application/json'
        },
        // POST request body as JSON string.
        body: formDataJsonString,
    };

    //Get the response body as JSON.
    //If the response was not OK, throw an error.
    const res = await fetch(url, options);

    //If the response is not ok throw an error (for debugging)
    if (!res.ok) {
        let error = await res.text();
        throw new Error(error);
    }
    //If the response was OK, return the response body.
    return res.text();
}

function showDiv(div) {
    Array.from(document.getElementsByClassName('top')).forEach(div => {
        div.style.display = 'none';
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

