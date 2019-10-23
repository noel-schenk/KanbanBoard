/*
** @author Noel Schenk
** @LICENSE MIT
*/

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
    render(){
        this.renderSelect();
        this.renderCategories();
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
}
class KanbanCard extends HTMLElement{
    constructor(priorityNumber, commentCount, attachmentCount, description, type, args){
        super();
        if(type == 'placeholder' || type == 'remover'){
            this.setAttribute('type', type);
            this.template = document.createElement('template');
            this.template.innerHTML = `
                <style>@import "../css/kanbanCard.css";</style>
            `;
            this.shadow = this.attachShadow({ 'mode': 'open' });
            this.shadow.appendChild(this.template.content.cloneNode(true));

            switch(type){
                case 'remover':
                    this.style.height = args.height;
                    setTimeout(()=>{
                        this.style.height = 0;
                        this.classList.add('animate');
                    }, 0);
                    break;
                case 'placeholder':
                    setTimeout(()=>{
                        this.classList.add('animate');
                    },args.timeout ? args.timeout:0);
            }
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
            if(
                kanbanCard != undefined &&
                kanbanCard.getAttribute('type') != 'placeholder' &&
                kanbanCard != KanbanData.getInstance().dragObject){

                let kbcOffsetTop = kanbanCard.getBoundingClientRect().top + document.documentElement.scrollTop + (kanbanCard.offsetHeight / 2); //position of the element relative to the document + half the element size
                let positionPlaceholder = kanbanCategory.kanbanCards.indexOf(kanbanCard);
                let positionPlaceholderTest = (kbcOffsetTop > event.clientY) ? positionPlaceholder-1 : positionPlaceholder+1;
                let positionPlaceholderInsert = (kbcOffsetTop > event.clientY) ? positionPlaceholder : positionPlaceholder+1;
                if( //no unnecessary updates
                        kanbanCategory.kanbanCards[positionPlaceholderTest] == undefined || //undefined so first and last item can have a placeholder
                        kanbanCategory.kanbanCards[positionPlaceholderTest].getAttribute('type') != 'placeholder'//must not work on a placeholder
                ){ 
                    let kanbanPlaceholder = kanbanCategory.kanbanCards.filter(kanbanCard=>{return kanbanCard.getAttribute('type') == 'placeholder';})[0];
                    kanbanPlaceholder ? kanbanPlaceholder.classList.remove('animate'):undefined;
                    kanbanCategory.kanbanCards = kanbanCategory.kanbanCards.filter(kanbanCard=>{return kanbanCard.getAttribute('type') != 'placeholder';});
                    if(
                        kanbanCategory.kanbanCards[positionPlaceholderTest] != KanbanData.getInstance().dragObject){

                        kanbanCategory.kanbanCards.splice(positionPlaceholderInsert, 0, new KanbanCard(undefined,undefined,undefined,undefined,'placeholder',{timeout:400}));
                        setTimeout(() => {
                            kanbanBoard.renderCategories();
                        }, 300); 
                    }
                }
            }
        }
        this.ondragleave = (event)=>{
            this.kanbanCards = this.kanbanCards.filter(kanbanCard=>{return kanbanCard.getAttribute('type') != 'placeholder';});
            this.render();
        }
        this.ondrop = (event)=>{
            let kanbanBoard = event.composedPath().filter(element=>{return element.nodeName == 'KANBAN-BOARD'})[0];
            let kanbanCardRemover = new KanbanCard(undefined,undefined,undefined,undefined,'remover', {height:KanbanData.getInstance().dragObject.offsetHeight});
            let hasKanbanPlaceholder = ()=>{
                let foundPlaceholder = false;
                kanbanBoard.kanbanCategories.forEach(kanbanCategory=>{
                    kanbanCategory.kanbanCards.forEach(kanbanCard=>{
                        (kanbanCard.getAttribute('type') == 'placeholder') ? foundPlaceholder = true:undefined;
                    });
                });
                return foundPlaceholder;
            };
            if(hasKanbanPlaceholder()){
                let checkKanbanCard = (kanbanCard)=>{ //if kanbancard is the dragged object
                    return (kanbanCard == KanbanData.getInstance().dragObject)
                }
                kanbanBoard.kanbanCategories.forEach((kanbanCategory, cI)=>{
                    kanbanCategory.kanbanCards.forEach((kanbanCard, i)=>{
                        if(checkKanbanCard(kanbanCard)){
                            kanbanBoard.kanbanCategories[cI].kanbanCards[i] = kanbanCardRemover;
                            setTimeout(()=>{
                                kanbanBoard.kanbanCategories[cI].kanbanCards.splice(i,1);
                            },350);
                        }
                    });
                });
                kanbanBoard.kanbanCardSelection.forEach((kanbanCard, i)=>{
                    if(checkKanbanCard(kanbanCard)){
                        kanbanBoard.kanbanCardSelection[i] = kanbanCardRemover;
                        setTimeout(()=>{
                            kanbanBoard.kanbanCardSelection.splice(i,1);
                        },350);
                    }
                });
                this.kanbanCards.forEach((kanbanCard, i)=>{
                    if(this.kanbanCards[i].getAttribute('type') == 'placeholder'){
                        this.kanbanCards[i] = KanbanData.getInstance().dragObject;
                    }
                });
                kanbanBoard.render();
            }
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
    kanbanBoard.kanbanCardSelection.push(new KanbanCard(1,1,2,'Account profile flow diagrams.'));
    kanbanBoard.kanbanCardSelection.push(new KanbanCard(1,1,2,'Account profile flow diagrams.'));
    kanbanBoard.kanbanCardSelection.push(new KanbanCard(1,1,2,'Account profile flow diagrams.'));
    kanbanBoard.kanbanCardSelection.push(new KanbanCard(0,1,2,'Account profile flow diagrams.'));

    kbc = new KanbanCategory(0);
    kbc.kanbanCards.push(new KanbanCard(2,1,3,'Research and strategy for upcoming projects.'));
    kbc.kanbanCards.push(new KanbanCard(1,1,2,'Account profile flow diagrams.'));
    kbc.kanbanCards.push(new KanbanCard(0,3,3,'Slide templates for client pitch project.'));
    kbc.kanbanCards.push(new KanbanCard(0,2,3,'Review administator console designs.'));
    kanbanBoard.kanbanCategories.push(kbc);

    kbc = new KanbanCategory(1);
    kbc.kanbanCards.push(new KanbanCard(1,1,2,'Dashboard layout design.'));
    kbc.kanbanCards.push(new KanbanCard(2,3,2,'Social media posts.'));
    kbc.kanbanCards.push(new KanbanCard(0,1,3,'Shopping cart and product catalog wireframes.'));
    kbc.kanbanCards.push(new KanbanCard(1,1,2,'End user flow charts.'));
    kanbanBoard.kanbanCategories.push(kbc);

    kbc = new KanbanCategory(2);
    kbc.kanbanCards.push(new KanbanCard(0,1,3,'Review client spec document and give feedback.'));
    kbc.kanbanCards.push(new KanbanCard(1,2,3,'Navigation designs.'));
    kbc.kanbanCards.push(new KanbanCard(2,3,2,'User profile prototypes.'));
    kbc.kanbanCards.push(new KanbanCard(2,2,3,'Create style guide based on previous feedback.'));
    kanbanBoard.kanbanCategories.push(kbc);

    kanbanBoard.render();
});