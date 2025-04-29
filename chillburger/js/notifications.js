
function generateNotifications(notes) {
    const container = document.querySelector('#notes-container'); 

    container.innerHTML = '';

    notes.forEach(note => {
        const noteDiv = document.createElement('div');
        noteDiv.classList.add('d-flex', 'flex-column', 'items-center', 'border', 'border-dark', 'p-2', 'm-2');

        const title = document.createElement('h1');
        title.textContent = note.titolo;
        noteDiv.appendChild(title);

        const text = document.createElement('p');
        text.textContent = note.testo;
        noteDiv.appendChild(text);

        const buttonDiv = document.createElement('div');
        buttonDiv.classList.add('d-flex', 'flex-row', 'justify-content-between');

        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.classList.add('btn', 'm-1');
        const deleteIcon = document.createElement('i');
        deleteIcon.classList.add('fa-solid', 'fa-trash-can', 'fa-2x');
        deleteButton.appendChild(deleteIcon);
        buttonDiv.appendChild(deleteButton);

        const confirmButton = document.createElement('button');
        confirmButton.type = 'button';
        confirmButton.classList.add('btn', 'm-1');
        const confirmIcon = document.createElement('i');
        confirmIcon.classList.add('fa-solid', 'fa-check', 'fa-2x');
        confirmButton.appendChild(confirmIcon);
        buttonDiv.appendChild(confirmButton);

        noteDiv.appendChild(buttonDiv);

        container.appendChild(noteDiv);
    });
}

async function getNotificationsData(){
    const url = "api/api-notifications.php";
    try {
        const response = await fetch(url);
        if(!response.ok){
            throw new Error("response status: ",response.status);
        }
        const json = await response.json();
        const notifications = generateNotifications(json);
        const main = document.querySelector("#notes-container");
        main.innerHTML = notifications;
    } catch(error) {
        console.log(error.message);
    }
}

getNotificationsData();