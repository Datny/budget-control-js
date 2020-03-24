var budgetControler = (function(){    
    
    var Expense = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    var Income = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(curr){
            sum += curr.value;   
        });
        data.totals[type] = sum;
    };
    
    var data = {
        allItems: {
            exp: [],
            inc: [],
        },
        totals: {
            exp: 0,
            inc: 0,
        },
        budget: 0,
        percentage: -1,
    }
    
    return {
        addItem: function(type, des, val){
            var newItem, ID;
            
            if (data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length-1].id +1;
                }else{
                    ID = 0;
                }
            if(type==='exp'){
                newItem = new Expense(ID,des, val);
            }else if (type==='inc'){
                newItem = new Income(ID,des,val);
            }
        data.allItems[type].push(newItem);
        return newItem;
            
        },
        testing: function(){
            console.log(data);
        },
        calculateBudget: function(){
            // calculate total inc and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            // calculate budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            // calculate the percentage of income that we spent
            if (data.totals.inc >0 ){
                data.percentage =Math.round((data.totals.exp / data.totals.inc) * 100);
            }else{
                data.percentage = -1;
            }
        },
        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage,
            }
        }
        
    }
    
})();

var UIController = (function(){
    
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetIncVal: '.budget__income--value',
        budgetExpVal: '.budget__expenses--value',
        budgetExpPercentage: '.budget__expenses--percentage',
        budgetVal: '.budget__value',
        container: '.container',
    };
    
    return {
        getInput: function(){
            return{
            type : document.querySelector(DOMstrings.inputType).value,// its inc or exp
            description : document.querySelector(DOMstrings.inputDescription).value,
            value : parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },
        getDOMstrings: function(){
            return DOMstrings; 
        },
         addListItem : function(obj, type){
            var html, newHtml;
             //create html string with placeholde text
            if (type==="inc"){
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }else if (type==='exp'){
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
        //replace placeholder with actual data
            newHtml = html.replace("%id%", obj.id);
            newHtml = newHtml.replace("%description%", obj.description);
            newHtml = newHtml.replace("%value%", obj.value);
            //insert the html into the DOM 
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
        },
        clearFields : function(){
            var fields, fieldsArray
            fields = document.querySelectorAll(DOMstrings.inputDescription+','+DOMstrings.inputValue)
            fieldsArray = Array.prototype.slice.call(fields);
            fieldsArray.forEach(function(current){
                current.value ="";
            })
            fieldsArray[0].focus();
        },
        displayBudget: function(data){
            document.querySelector(DOMstrings.budgetVal).textContent = data.budget;
            document.querySelector(DOMstrings.budgetIncVal).textContent = data.totalInc;
            document.querySelector(DOMstrings.budgetExpVal).textContent = data.totalExp;
            document.querySelector(DOMstrings.budgetExpPercentage).textContent = (data.percentage > 0 ? data.percentage + '%' : '---');
        }
    };
    
})();

var controller = (function(budgetCtrl, uiCtrl){
    var setupEventListeners = function(){
        var DOM = uiCtrl.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keydown', function(e){
            if (e.keyCode===13 || e.which===13){
                ctrlAddItem();
            }
        });
        
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    
    };
    
    var updateBudget = function(){
        // calculate
        budgetCtrl.calculateBudget();
        // get budget calculation
        var budget = budgetCtrl.getBudget();
        // send to Ui
        uiCtrl.displayBudget(budget);
    }
    
    // 1.  Get the field input data
    var ctrlAddItem = function(){
        var newItem;
        var inputData = uiCtrl.getInput();
        if (inputData.description !== "" && !isNaN(inputData.value) && inputData.value !==0){
            // 2. Add item to budget controller 
            newItem = budgetCtrl.addItem(inputData.type, inputData.description, inputData.value);
            // 3. Add new item to UI
            uiCtrl.addListItem(newItem, inputData.type);
            // 4. clear fields in Ui form
            uiCtrl.clearFields();
            // 5. calc and update budget
            updateBudget();
        }
    }
    
    var ctrlDeleteItem = function(event){
        var itemID, ID, type, splitID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID){
            splitID = itemID.split('-');
            ID = splitID[1];
            type = splitID[0];
            //1 delete item from data structure
            budgetCtrl.deleteItemBud(ID);
            //2 delete the item from UI
            uiCtrl.deleteItemUi(ID);
            //3 update and show new budget 
            updateBudget();
            
        }
    }
    

    return {
        init: function(){
            setupEventListeners();
            uiCtrl.displayBudget({
                
                    budget: 0,
                    totalInc: 0,
                    totalExp: 0,
                    percentage: -1,
            });
        }
    }
    
})(budgetControler, UIController);


controller.init();

