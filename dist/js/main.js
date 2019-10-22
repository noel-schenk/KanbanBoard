class KanbanData{
    constructor(){} //dont use the constructor
    /*
        currently used data:
        dragObject
    */
    static getInstance(){
        if(!this.kanbanData){
            this.kanbanData = new KanbanData();
        }
        return this.kanbanData;
    }
}
class KanbanBoard extends HTMLElement{
	constructor(){
        super();
        this.template = document.createElement('template');
        this.template.innerHTML = `
            <div></div>
            <div></div>
            <style>@import "../css/kanbanBoard.css";</style>
        `;
        
        this.shadow = this.attachShadow({ 'mode': 'open' });
        this.shadow.appendChild(this.template.content.cloneNode(true));
        this.select = this.shadow.querySelector(':host > div:nth-child(1)');
        this.board = this.shadow.querySelector(':host > div:nth-child(2)');
        this.kanbanCardSelection = [];
        this.kanbanCategories = [];
    }
    renderSelect(){
        this.select.innerHTML = '';
        this.kanbanCardSelection.forEach((kanbanCard)=>{
            this.select.appendChild(kanbanCard);
        });
    }
    renderCategories(){
        this.kanbanCategories.forEach(category=>{
            this.board.appendChild(category);
            category.render();
        });
    }
    pushKanbanCardToSelection(kanbanCard){
        this.kanbanCardSelection.push(kanbanCard);
    }
    pushKanbanCategory(kanbanCategory){
        this.kanbanCategories.push(kanbanCategory);
    }
}
class KanbanCard extends HTMLElement{
    constructor(priorityNumber, commentCount, attachmentCount, description, type){
        super();
        if(type == 'placeholder' || type == 'remover'){
            this.setAttribute('type', type);
            this.template = document.createElement('template');
            this.template.innerHTML = `
                <style>@import "../css/kanbanCard.css";</style>
            `;
            this.shadow = this.attachShadow({ 'mode': 'open' });
            this.shadow.appendChild(this.template.content.cloneNode(true));
            return;
        }
        this.setAttribute('draggable', 'true');
        const priority = this.getPriorityName(priorityNumber);
        this.template = document.createElement('template');
        this.template.innerHTML = `
            <span priority='${priorityNumber}'>${priority}</span>
            <p>${description}</p>
            <div>
                <div>
                    <span icon='comment'>${commentCount}</span>
                    <span icon='attachment'>${attachmentCount}</span>
                </div>
                <div>
                    <span icon='addParticipant'></span>
                    <span icon='participant'></span>
                </div>
            </div>
            <style>@import "../css/kanbanCard.css";</style>
        `;
      
        this.shadow = this.attachShadow({ 'mode': 'open' });
        this.shadow.appendChild(this.template.content.cloneNode(true));
        this.defineEvents();
    }
    getPriorityName(priorityNumber){
        switch(priorityNumber){
            case 0:
                return 'Low Priority';
            case 1:
                return 'Med Priority';
            case 2:
                return 'High Priority';
            default:
                return '? Priority'
        }
    }
    defineEvents(){
        this.ondragstart = (event)=>{
            this.style.opacity = '0.5';
            KanbanData.getInstance().dragObject = this;
        }
        this.ondragend = (event)=>{
            this.style.opacity = '1';
        }
    }
}
class KanbanCategory extends HTMLElement{
	constructor(categoryNumber){
        super();
        this.template = document.createElement('template');
        this.setAttribute('category',categoryNumber);
        this.template.innerHTML = `
            <h2>${this.getCategoryName(categoryNumber)}</h2>
            <div></div>
            <style>@import "../css/kanbanCategory.css";</style>
        `;
        this.shadow = this.attachShadow({ 'mode': 'open' });
        this.shadow.appendChild(this.template.content.cloneNode(true));
        this.cardHolder = this.shadow.querySelector(':host > div');
        this.kanbanCards = [];
        this.defineEvents();
    }
    pushKanbanCard(kanbanCard){
        this.kanbanCards.push(kanbanCard);
    }
    render(){
        this.cardHolder.innerHTML = '';
        this.kanbanCards.forEach(kanbanCard=>{
            this.cardHolder.appendChild(kanbanCard);
        });
    }
    getCategoryName(categoryNumber){
        switch(categoryNumber){
            case 0:
                return 'In Progress';
            case 1:
                return 'Review';
            case 2:
                return 'Complete';
            default:
                return '? Category'
        }
    }
    defineEvents(){
        this.ondragover = (event)=>{
            event.preventDefault();
            let kanbanBoard = event.composedPath().filter(element=>{return element.nodeName == 'KANBAN-BOARD'})[0];
            let kanbanCategory = this;
            let kanbanCard = event.composedPath().filter(element=>{return element.nodeName == 'KANBAN-CARD'})[0];
            if(kanbanCard != undefined && kanbanCard.getAttribute('type') != 'placeholder'){
                let kbcOffsetTop = kanbanCard.getBoundingClientRect().top + document.documentElement.scrollTop + (kanbanCard.offsetHeight / 2); //position of the element relative to the document + half the element size
                let positionPlaceholder = kanbanCategory.kanbanCards.indexOf(kanbanCard);
                positionPlaceholder = (kbcOffsetTop > event.clientY) ? positionPlaceholder : positionPlaceholder+1;
                if(kanbanCategory.kanbanCards[positionPlaceholder] == undefined || kanbanCategory.kanbanCards[positionPlaceholder].getAttribute('type') != 'placeholder'){ //no unnecessary updates ... undefined so the last item can have a placeholder
                    kanbanCategory.kanbanCards = kanbanCategory.kanbanCards.filter(kanbanCard=>{return kanbanCard.getAttribute('type') != 'placeholder';});
                    kanbanCategory.kanbanCards.splice(positionPlaceholder, 0, new KanbanCard(undefined,undefined,undefined,undefined,'placeholder'));
                    kanbanBoard.renderCategories();
                }
            }
        }
        this.ondragleave = (event)=>{
            this.kanbanCards = this.kanbanCards.filter(kanbanCard=>{return kanbanCard.getAttribute('type') != 'placeholder';});
            this.render();
        }
        this.ondrop = (event)=>{
            let kanbanBoard = event.composedPath().filter(element=>{return element.nodeName == 'KANBAN-BOARD'})[0];
            let kanbanCardRemover = new KanbanCard(undefined,undefined,undefined,undefined,'remover');
            let checkKanbanCard = (kanbanCard)=>{
                return (kanbanCard == KanbanData.getInstance().dragObject)
            }
            kanbanBoard.kanbanCategories.forEach((kanbanCategory, cI)=>{
                kanbanCategory.kanbanCards.forEach((kanbanCard, i)=>{
                    checkKanbanCard(kanbanCard) ? kanbanBoard.kanbanCategories[cI].kanbanCards[i] = kanbanCardRemover:undefined;
                });
            });
            kanbanBoard.kanbanCardSelection.forEach((kanbanCard, i)=>{
                checkKanbanCard(kanbanCard) ? kanbanBoard.kanbanCardSelection[i] = kanbanCardRemover:undefined;
            });
            this.kanbanCards.forEach((kanbanCard, i)=>{
                if(this.kanbanCards[i].getAttribute('type') == 'placeholder'){
                    this.kanbanCards[i] = KanbanData.getInstance().dragObject;
                }
            });
            kanbanBoard.renderCategories();
            kanbanBoard.renderSelect();
        }
    }
}
/*define used custom Elements*/
window.customElements.define('kanban-board', KanbanBoard);
window.customElements.define('kanban-card', KanbanCard);
window.customElements.define('kanban-category', KanbanCategory);

function ready(cb){
    if (document.readyState != 'loading'){
        cb();
    }else{
        document.addEventListener('DOMContentLoaded', cb);
    }
}

ready(()=>{
    const kanbanBoard = document.querySelector('kanban-board');
    kanbanBoard.pushKanbanCardToSelection(new KanbanCard(1,1,2,'Account profile flow diagrams.'));
    kanbanBoard.pushKanbanCardToSelection(new KanbanCard(1,1,2,'Account profile flow diagrams.'));
    kanbanBoard.pushKanbanCardToSelection(new KanbanCard(1,1,2,'Account profile flow diagrams.'));
    kanbanBoard.pushKanbanCardToSelection(new KanbanCard(0,1,2,'Account profile flow diagrams.'));

    kbc = new KanbanCategory(0);
    kbc.pushKanbanCard(new KanbanCard(2,1,3,'Research and strategy for upcoming projects.'));
    kbc.pushKanbanCard(new KanbanCard(1,1,2,'Account profile flow diagrams.'));
    kbc.pushKanbanCard(new KanbanCard(0,3,3,'Slide templates for client pitch project.'));
    kbc.pushKanbanCard(new KanbanCard(0,2,3,'Review administator console designs.'));
    kanbanBoard.pushKanbanCategory(kbc);

    kbc = new KanbanCategory(1);
    kbc.pushKanbanCard(new KanbanCard(1,1,2,'Dashboard layout design.'));
    kbc.pushKanbanCard(new KanbanCard(2,3,2,'Social media posts.'));
    kbc.pushKanbanCard(new KanbanCard(0,1,3,'Shopping cart and product catalog wireframes.'));
    kbc.pushKanbanCard(new KanbanCard(1,1,2,'End user flow charts.'));
    kanbanBoard.pushKanbanCategory(kbc);

    kbc = new KanbanCategory(2);
    kbc.pushKanbanCard(new KanbanCard(0,1,3,'Review client spec document and give feedback.'));
    kbc.pushKanbanCard(new KanbanCard(1,2,3,'Navigation designs.'));
    kbc.pushKanbanCard(new KanbanCard(2,3,2,'User profile prototypes.'));
    kbc.pushKanbanCard(new KanbanCard(2,2,3,'Create style guide based on previous feedback.'));
    kanbanBoard.pushKanbanCategory(kbc);

    kanbanBoard.renderSelect();
    kanbanBoard.renderCategories();
});