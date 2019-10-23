# KanbanBoard

## Getting Started

This KanbanBoard was build using [web components](https://developer.mozilla.org/de/docs/Web/Web_Components).

**Source** is under src

**Compiled** files are under dist 

### Prerequisites

* nodejs
* npm

### Installing

* clone the project
* run npm install
* run gulp runFirst
* open the browser at: http://localhost:3685/

### Use

You find all the files for the libary in the dist folder.
You can modify the board by editing the ready function or remove the function and build your own version. Nodejs or npm is not required.

### Examples

Start with the main user defined element in your html file

```
<kanban-board></kanban-board>
```

Move to your js file and start adding **Cards** or **Categories**

Select your kanban board
```
const kanbanBoard = document.querySelector('kanban-board');
```
#### Adding card to selection
```
kanbanBoard.kanbanCardSelection.push(new KanbanCard(1,1,2,'Account profile flow diagrams.'));
 ```

#### Creating new category
```
let kbc = new KanbanCategory(0);
```

#### Adding card to category
```
kbc.kanbanCards.push(new KanbanCard(2,1,3,'Research and strategy for upcoming projects.'));
```

#### Adding category to board
```
kanbanBoard.kanbanCategories.push(kbc);
```

#### Render
You can eather render the whole thing or render elements on their own.
```
kanbanBoard.renderSelect();
kanbanBoard.renderCategories();
```
or
```
kanbanBoard.render();
```

If you want to render a specific category you can use the render function on the kanban-category element.

### Tests

This KanbanBoard is only tested in [Chrome](https://www.google.com/intl/de/chrome/) and is not responsive.

## Authors

* **Noel Schenk** 

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details