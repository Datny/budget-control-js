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
                html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }else if (type==='exp'){
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
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
    };
    
    var updateBudget = function(){
        // calculate
        budgetCtrl.calculateBudget();
        // get budget calculation
        var budget = budgetCtrl.getBudget();
        // send to Ui
        console.log(budget);
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
    
    return {
        init: function(){
            setupEventListeners();
        }
    }
    
})(budgetControler, UIController);


controller.init();
