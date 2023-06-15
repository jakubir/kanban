const buttonNewList = document.querySelector('.button--new-kanban-list');
const titleKanban = document.querySelector('.title--kanban');
const kanban = document.querySelector('.kanban');
const trashCan = document.querySelector('.trashcan');

let code = 'k0';

// dodawanie elementów do przeciągania
function addDragObject(dragObject) {
  dragObject.addEventListener('dragstart', (e) => {
    if (e.target.classList.contains('list__element--tasks'))
      e.dataTransfer.setData('text', e.target.id);
    trashCan.style.opacity = '1';
  });
  dragObject.addEventListener('dragend', (e) => {
    trashCan.style.opacity = '0';
  })
}

// dodawanie stref upuszczania
function addDropZone(dropZone) {
  dropZone.addEventListener('dragover', (e) => e.preventDefault());
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    if (e.target.classList.contains('button--new-kanban-task'))
      e.target.parentNode.parentNode.appendChild(
        document.getElementById(e.dataTransfer.getData('text'))
      );
    else if (e.target.classList.contains('list__element--tasks'))
      e.target.parentNode.appendChild(
        document.getElementById(e.dataTransfer.getData('text'))
      );
    else if (e.target.classList.contains('list--tasks'))
      e.target.appendChild(
        document.getElementById(e.dataTransfer.getData('text'))
      );
    else if (e.target.classList.contains('title--list'))
      e.target.nextSibling.nextSibling.appendChild(
        document.getElementById(e.dataTransfer.getData('text'))
      );
    else if (e.target.classList.contains('kanban__element'))
      for (const node of e.target.childNodes)
        if (node.nodeName == 'UL') {
          node.appendChild(
            document.getElementById(e.dataTransfer.getData('text'))
          );
          break;
        }
    });
}

// dodanie nowego przycisku dodawania zadań
function newTaskButton() {
  let element = document.createElement("button");
  element.classList.add('button', 'button--new-kanban-task');
  element.innerHTML = '✚ Dodaj nowe zadanie';
  let elementContainer = document.createElement("li");
  elementContainer.classList.add('list__element', 'list__element--button');
  elementContainer.setAttribute('draggable', 'true');
  elementContainer.appendChild(element);

  // dodawanie zadań
  element.addEventListener('click', (e) => {
    const code = 't' + '5';

    let childElem = document.createElement('input');
    childElem.classList.add('editable-field');
    childElem.setAttribute('type', 'text');
    childElem.value = 'Zadanie ' + code;

    let elem = document.createElement('li');
    elem.classList.add('list__element', 'list__element--tasks');
    elem.setAttribute('draggable', 'true');
    elem.id = code;
    elem.appendChild(childElem);
    addDragObject(elem);

    e.target.parentNode.parentNode.insertBefore(elem, e.target.parentNode);
  })

  return elementContainer;
}

// dodanie nowego tytułu listy zadań
function newListTitle(title) {
    let childElement = document.createElement("input");
    childElement.classList.add('editable-field');
    childElement.setAttribute('type', 'text');
    childElement.value = title;
    let element = document.createElement("h3");
    element.classList.add('title', 'title--list');
    element.appendChild(childElement);

    // edycja tytułu listy
    childElement.addEventListener('change', (e) => {
      let data = JSON.parse(localStorage.getItem('data'));
      data[code.slice(1)].boards[childElement.parentNode.parentNode.id.slice(1)].title = e.target.value;
      localStorage.setItem('data', JSON.stringify(data));
    });

    return element;
}

// dodanie nowej listy zadań
function newList() {
  let element = document.createElement("ul");
  element.classList.add('list', 'list--tasks');

  return element;
}

// dodanie nowego zadania
function newTask(id, data) {
  let childElem = document.createElement('input');
  childElem.classList.add('editable-field');
  childElem.setAttribute('type', 'text');
  childElem.value = data;

  let elem = document.createElement('li');
  elem.classList.add('list__element', 'list__element--tasks');
  elem.setAttribute('draggable', 'true');
  elem.id = id;
  elem.appendChild(childElem);
  addDragObject(elem);

  // edycja zadania
  childElem.addEventListener('change', (e) => {
    let data = JSON.parse(localStorage.getItem('data'));
    data[code.slice(1)].boards[childElem.parentNode.parentNode.parentNode.id.slice(1)].tasks[childElem.parentNode.id.slice(1)].data = e.target.value;
    localStorage.setItem('data', JSON.stringify(data));
  });
  
  return elem;
}

// dodanie nowej tablicy
function newBoard(id) {
  let element = document.createElement("div");
  element.classList.add('kanban__element');
  element.id = id;
  addDropZone(element);

  return element;
}

// localStorage
/*
  currentCode: 'k$',
  data: [{
      title: `',
      id: 'k$',
      boards: [{
        title: '',
        id: 'b$',
        tasks: [{
          id: '',
          data: 't$'
        }]
      }]
  }]
*/

function main(code) {
  let id = code.slice(1);
  let data = JSON.parse(localStorage.getItem('data'))[id];

  // podanie tytułu kanbanu
  titleKanban.firstChild.value = data.title;

  // wygenerowanie tablic
  data.boards.map((board) => {
    let element = newBoard(board.id);

    // dodanie tytułu do tablicy
    element.appendChild(newListTitle(board.title));

    let list = newList();

    // dodanie zadań do listy
    board.tasks.map((task) => list.appendChild(newTask(task.id, task.data)));

    // dodanie przycisku do listy
    list.appendChild(newTaskButton());

    // dodanie listy do tablicy
    element.appendChild(list);

    kanban.insertBefore(element, buttonNewList.parentNode);
  });
}

if (localStorage.getItem('data') == null) {
  localStorage.setItem('data', JSON.stringify([{
    title: 'Kanban',
    id: 'k0',
    boards: [{
      title: 'Do zrobienia',
      id: 'b0',
      tasks: [{
        id: 't0',
        data: 'Zadanie t1'
      }]
    }, {
      title: 'W trakcie',
      id: 'b1',
      tasks: []
    }, {
      title: 'Zrobione',
      id: 'b2',
      tasks: []
    }]
  }]));
}
if (localStorage.getItem('currentCode') == null) {
  localStorage.setItem('currentCode', 'k0');
}
code = localStorage.getItem('currentCode');
main('k0');

// przygotowanie pola do usuwania elementów
trashCan.addEventListener('dragover', (e) => {
  e.preventDefault();
  trashCan.classList.add('trashcan--hover');
});
trashCan.addEventListener('dragleave', (e) => {
  e.preventDefault();
  trashCan.classList.remove('trashcan--hover');
});
trashCan.addEventListener('drop', (e) => {
  e.preventDefault();
  document.getElementById(e.dataTransfer.getData('text')).remove();
});

// edycja tytułu kanbanu
titleKanban.firstChild.addEventListener('change', (e) => {
  let data = JSON.parse(localStorage.getItem('data'));
  data[code.slice(1)].title = e.target.value;
  localStorage.setItem('data', JSON.stringify(data));
});

// dodawanie nowych list
buttonNewList.addEventListener('click', (e) => {
  let data = JSON.parse(localStorage.getItem('data'));
  let newId = data[code.slice(1)].boards[data[code.slice(1)].boards.length - 1].id.slice(1) + 1;
  const code = 'b' + newId;

  let element = newBoard(code);

  // dodanie tytułu do tablicy
  element.appendChild(newListTitle('Nowa lista' + newId));

  // stworzenie listy z przyciskiem
  let list = newList().appendChild(newTaskButton());

  // dodanie listy do tablicy
  element.appendChild(list);

  kanban.insertBefore(element, buttonNewList.parentNode);
});