document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('task-form');
    const input = document.getElementById('new-task');
    const list = document.getElementById('task-list');
    const STORAGE_KEY = 'revou_tasks';

    let tasks = loadTasks();
    render();

    form.addEventListener('submit', e => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;
        tasks.push({ id: Date.now(), text, done: false });
        input.value = '';
        saveAndRender();
    });

    list.addEventListener('click', e => {
        const id = getTaskIdFromEvent(e);
        if (!id) return;
        if (e.target.matches('.delete')) {
            tasks = tasks.filter(t => t.id !== id);
            saveAndRender();
        } else if (e.target.matches('input[type="checkbox"]')) {
            const t = tasks.find(t => t.id === id);
            t && (t.done = e.target.checked, saveAndRender());
        }
    });

    // Inline edit: double-click to edit, blur or Enter to save
    list.addEventListener('dblclick', e => {
        if (!e.target.matches('.text')) return;
        const span = e.target;
        span.contentEditable = 'true';
        span.focus();
        selectElementText(span);
    });

    list.addEventListener('keydown', e => {
        if (e.target.matches('.text') && e.key === 'Enter') {
            e.preventDefault();
            e.target.blur();
        }
    });

    list.addEventListener('blur', e => {
        if (!e.target.matches('.text')) return;
        e.target.contentEditable = 'false';
        const id = getTaskIdFromEvent(e);
        if (!id) return;
        const t = tasks.find(t => t.id === id);
        if (!t) return;
        const newText = e.target.textContent.trim();
        if (!newText) {
            tasks = tasks.filter(x => x.id !== id);
        } else {
            t.text = newText;
        }
        saveAndRender();
    }, true);

    function render() {
        list.innerHTML = '';
        tasks.forEach(t => {
            const li = document.createElement('li');
            li.className = 'task' + (t.done ? ' done' : '');
            li.dataset.id = t.id;

            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.checked = t.done;

            const span = document.createElement('span');
            span.className = 'text';
            span.textContent = t.text;
            span.title = 'Double-click to edit';

            const del = document.createElement('button');
            del.className = 'delete';
            del.textContent = '✕';
            del.title = 'Delete task';

            li.appendChild(cb);
            li.appendChild(span);
            li.appendChild(del);
            list.appendChild(li);
        });
    }

    function saveAndRender() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
        render();
    }

    function loadTasks() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        } catch {
            return [];
        }
    }

    function getTaskIdFromEvent(e) {
        const li = e.target.closest('li.task');
        return li ? Number(li.dataset.id) : null;
    }

    function selectElementText(el) {
        const range = document.createRange();
        range.selectNodeContents(el);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }
});