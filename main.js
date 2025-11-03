const db = new PouchDB('tareas');
let taskList;
let btnAdd;
let inputName;
let inputFecha;


if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Opción 1 (Recomendada para subdirectorios de GitHub Pages): Usar una ruta relativa
        navigator.serviceWorker.register('./sw.js') 
            .then(reg => {
                console.log('Service Worker registrado con éxito:', reg.scope);
            })
            .catch(err => {
                console.error('Fallo en el registro del Service Worker:', err);
            });
    });
}
document.addEventListener('DOMContentLoaded', () => {
    inputName = document.getElementById('nombre');
    inputFecha = document.getElementById('fecha');
    btnAdd = document.getElementById('btnAdd');
    taskList = document.getElementById('taskList');

    if (taskList) {
        loadTasks();
    } else {
        console.error("Error: Elemento con id='taskList' no encontrado.");
    }
    
    if (btnAdd) {
        btnAdd.addEventListener('click', addTask);
    } else {
        console.error("Error: Elemento con id='btnAdd' no encontrado.");
    }   
});


// Función para agregar tarea
function addTask() {
    const tarea = {
        _id: new Date().toISOString(),
        nombre: inputName.value,
        fecha: inputFecha.value,
        status: 'pendiente' 
    };

    if (!tarea.nombre || !tarea.fecha) {
        alert('Por favor, ingresa el nombre y la fecha de la tarea.');
        return;
    }

    db.put(tarea)
    .then(() => {
        console.log('Tarea agregada con éxito:', tarea);
        inputName.value = '';
        inputFecha.value = '';
        loadTasks(); 
    })
    .catch((error) => {
        console.log('Error al guardar', error);
    });
}

function loadTasks() {
    if (!taskList) return;

    taskList.innerHTML = ''; 

    db.allDocs({ include_docs: true, descending: true })
    .then((result) => {
        result.rows.forEach(row => {
            const tarea = row.doc;

            if (tarea.status === 'pendiente') {
                
                const li = document.createElement('li');
                li.className = 'task-item';
                li.setAttribute('data-id', tarea._id); 
                
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'task-checkbox';
                checkbox.setAttribute('data-id', tarea._id); 

                const content = document.createElement('span');
                content.textContent = `${tarea.nombre} (Fecha: ${tarea.fecha})`;
                
                const statusBadge = document.createElement('span');
                statusBadge.className = 'status-badge pendiente';
                
                li.appendChild(checkbox);
                li.appendChild(content);
                
                taskList.appendChild(li);

                checkbox.addEventListener('change', completeTask);
            }
        });

        console.log('Tareas pendientes cargadas exitosamente.');

    })
    .catch((error) => {
        console.log('Error al cargar las tareas', error);
    });
}


function completeTask(event) {
    const id = event.target.getAttribute('data-id');

    if (event.target.checked) {
        db.get(id)
        .then(function(doc) {
            doc.status = 'realizada';
            
            return db.put(doc);
        })
        .then(function() {
            console.log(`Tarea ${id} marcada como realizada.`);
            
            loadTasks(); 
        })
        .catch(function(err) {
            console.error('Error al marcar la tarea como realizada:', err);
        });
    }
}