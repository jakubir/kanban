const buttonNewList = document.querySelector('.button--new-kanban-list');
const titleKanban = document.querySelector('.title--kanban');
const kanban = document.querySelector('.kanban');
const trashCan = document.querySelector('.trashcan');

let code = 'k0';

// dodawanie elementów do przeciągania
function addDragObject(dragObject) {
  dragObject.addEventListener('dragstart', (e) => {
    if (e.target.classList.contains('list__element--tasks') || e.target.classList.contains('kanban__element'))
      e.dataTransfer.setData('text', e.target.id);
    trashCan.style.opacity = '1';
  });
  dragObject.addEventListener('dragend', (e) => {
    trashCan.style.opacity = '0';
  })
}

// dodawanie stref upuszczania dla zadań
function addDropZone(dropZone) {
  dropZone.addEventListener('dragover', (e) => e.preventDefault());
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();

    const id = e.dataTransfer.getData('text');
    let data = JSON.parse(localStorage.getItem('data'));
    let target;

    if (e.target.classList.contains('button--new-kanban-task'))
      target = e.target.parentNode.parentNode
    else if (e.target.classList.contains('list__element--tasks'))
      target = e.target.parentNode
    else if (e.target.classList.contains('list--tasks'))
      target = e.target
    else if (e.target.classList.contains('title--list'))
      target = e.target.nextSibling
    else if (e.target.classList.contains('editable-field') && e.target.parentNode.classList.contains('title--list'))
      target = e.target.parentNode.nextSibling
    else if (e.target.classList.contains('editable-field') && e.target.parentNode.classList.contains('list__element--tasks'))
      target = e.target.parentNode.parentNode
    else if (e.target.classList.contains('kanban__element'))
      for (const node of e.target.childNodes)
        if (node.nodeName == 'UL') {
          target = node
          break;
        }

    if (id[0] == 'b') {
      target = target.parentNode;
      
      target.parentNode.insertBefore(document.getElementById(id), target);

      let boardToMove = data[code.slice(1)].boards.filter((board) => board.id == id)[0];
      let i = 0;
      // usunięcie tablicy z listy
      data[code.slice(1)].boards = data[code.slice(1)].boards.filter((board) => board.id != id);
      // dodanie tablicy na nowe miejsce
      for (const board of data[code.slice(1)].boards) {
        if (board.id == target.id) {
          data[code.slice(1)].boards.splice(i, 0, boardToMove);
          break;
        }
        i++;
      }
    } else {
      target.appendChild(document.getElementById(id));
      // usunięcie zadania ze starej listy
      data[code.slice(1)].boards.map((board) => {
        board.tasks = board.tasks.filter((task) => task.id != id);
      });
      // dodanie zadania do nowej listy
      data[code.slice(1)].boards[target.parentNode.id.slice(1)].tasks.push({
        id: id,
        data: document.getElementById(id).childNodes[0].value
      });
    }

    localStorage.setItem('data', JSON.stringify(data));
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
    const newCode = newTaskCode();
    const text = 'Zadanie ' + (parseInt(newCode.slice(1)) + 1);
    let elem = newTask(newCode, text);
    e.target.parentNode.parentNode.insertBefore(elem, e.target.parentNode)
    
    let data = JSON.parse(localStorage.getItem('data'));
    data[code.slice(1)].boards[e.target.parentNode.parentNode.parentNode.id.slice(1)].tasks.push({
      id: newCode,
      data: text
    });
    localStorage.setItem('data', JSON.stringify(data));
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
  childElem.value = data;
  childElem.addEventListener('input', function() {
    this.style.height = "";
    this.style.height = this.scrollHeight + "px"
  });

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
  element.setAttribute('draggable', 'true');
  addDragObject(element);
  element.id = id;
  addDropZone(element);

  return element;
}

// odnalezienie nowego kodu zadania
function newTaskCode() {
  let data = JSON.parse(localStorage.getItem('data'));
  let lastCode = 0;

  data[code.slice(1)].boards.map((board) => {
    board.tasks.map((task) => {
      if (parseInt(task.id.slice(1)) > lastCode)
        lastCode = parseInt(task.id.slice(1)) + 1;
      else if (parseInt(task.id.slice(1)) == lastCode)
        lastCode++;
    });
  });
  
  return 't' + lastCode;
}

// localStorage - struktura danych
/*
  currentCode: 'k$', // $ - dowolna liczba
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
        data: 'Zadanie 1'
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
  let id = e.dataTransfer.getData('text');
  let data = JSON.parse(localStorage.getItem('data'));

  if (id[0] == 't') {
    for (const kanban of data)
      for (const board of kanban.boards)
        for (const task of board.tasks)
          if (task.id == id)
            board.tasks.splice(board.tasks.indexOf(task), 1);
  } else {
    for (const kanban of data)
      for (const board of kanban.boards)
        if (board.id == id)
          kanban.boards.splice(kanban.boards.indexOf(board), 1);
  }   
  localStorage.setItem('data', JSON.stringify(data));

  document.getElementById(id).remove();
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
  let newId = parseInt(data[code.slice(1)].boards[data[code.slice(1)].boards.length - 1].id.slice(1)) + 1;
  const newCode = 'b' + newId;

  let element = newBoard(newCode);

  // dodanie tytułu do tablicy
  element.appendChild(newListTitle('Nowa tablica ' + (newId + 1)));

  // stworzenie listy z przyciskiem
  let list = newList().appendChild(newTaskButton());

  // dodanie listy do tablicy
  element.appendChild(list);

  kanban.insertBefore(element, buttonNewList.parentNode);
  addDropZone(element);

  // dodanie tablicy do localStorage
  data[code.slice(1)].boards.push({
    title: 'Nowa tablica ' + (newId + 1),
    id: newCode,
    tasks: []
  });
  localStorage.setItem('data', JSON.stringify(data));
});