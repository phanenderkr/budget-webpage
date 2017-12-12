//Budget data controller
var budgetController = (function () {

    var Expense = function (id, description, value) {
        this.id = id;
        this.inputDescription =description ;
        this.value = value;
    };

    var Income = function (id, description, value) {
        this.id = id;
        this.inputDescription =description ;
        this.value = value;
    };

    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (current) {
            sum += current.value;
        });
        data.totals[type] = sum;
    };
    
    var data ={
        allItems:{
            exp: [],
            inc: []
        },
        totals:{
            exp: 0,
            inc: 0
        },
        budget:0,
        percentage: -1
    };

    return {
        addItem: function (type, des, val) {
            var newItem, ID;

            //create new ID
            if(data.allItems[type].length>0){
                ID = (( data.allItems[type] )[data.allItems[type].length-1]).id + 1;
            }else{
                ID = 0;
            }

            //create new item based on inc or exp type
            if(type.toLowerCase()==="exp"){
                newItem = new Expense(ID, des, val);
            }else{
                newItem = new Income(ID, des, val);
            }

            //pushing to our data structure
            data.allItems[type].push(newItem);

            //returning the item
            return newItem;
        },

        deleteItem: function (type, id) {
            var ids, index;

            ids = data.allItems[type].map(function (currentItem ) {
                return currentItem.id;
            });
            // console.log("delete invoking " + ids);
            index = ids.indexOf(id);
            if(index>-1){
                data.allItems[type].splice(index,1);
            }
        },

        calculateBudget: function(){

            //1. Calculate total income and expenses
            calculateTotal("exp");
            calculateTotal("inc");

            //2. Calculate budget= income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            //3. calculate the percentage of income spent that we spent
            if(data.totals.inc>0){
                data.percentage = Math.round((data.totals.exp * 100 )/ data.totals.inc);
            }else{
                data.percentage=-1;
            }

        },
        
        getBudget: function () {
            return {
                budget: data.budget,
                totalIncome: data.totals.inc,
                totalExpenses: data.totals.exp,
                percentage: data.percentage
            };
        },

        //just for testing not for deployment
        testing: function () {
            console.log(data);
        }


    }

})();


//-------------------------------------------------------------------
//--------------------------UI Controller
//-------------------------------------------------------------------

var UIController = (function () {
    //classes
    var DOMStrings = {
        inputType: ".add__type",
        inputDescription: ".add__description",
        value: ".add__value",
        tickBtn: ".add__btn",
        incomesContainer: ".income__list",
        expensesContainer: ".expenses__list",
        budgetLabel: ".budget__value",
        incomeLabel: ".budget__income--value",
        expensesLabel: ".budget__expenses--value",
        percentageLabel: ".budget__expenses--percentage",
        container: ".container"
    };

    // returning object
    return{
        getInput: function () {
            return{
                type : document.querySelector(DOMStrings.inputType).value, // will be inc or exp
                inputDescription : document.querySelector(DOMStrings.inputDescription).value,
                value : parseFloat(document.querySelector(DOMStrings.value).value)
            };
        },
        getDOMStrings: function () {
            return DOMStrings;
        },

        addListItem: function (obj, type) {
            var html, newHtml, adjacentClass;

            //1.Create html string with placeholder text
            if(type==="inc"){
                adjacentClass = DOMStrings.incomesContainer;

                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%inputDescription%</div>                 <div class="right clearfix"> <div class="item__value"> %value%</div> <div class="item__delete">                 <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>' ;

            }else if(type === "exp"){

                adjacentClass = DOMStrings.expensesContainer;

                html= '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%inputDescription%</div>                 <div class="right clearfix"> <div class="item__value"> %value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>' ;

            }


            //2. Replace the placeholder text
            newHtml = html.replace("%id%", obj.id);
            newHtml = newHtml.replace("%inputDescription%", obj.inputDescription);
            newHtml = newHtml.replace("%value%", obj.value);

            //3. Insert html into the DOM
            document.querySelector(adjacentClass).insertAdjacentHTML("beforeend", newHtml);
        },

        deleteListItem: function (selectorID) {
            var element =  document.getElementById(selectorID);
            element.parentNode.removeChild(element);
        },

        clearFields: function () {
            var fields, fieldsArray;
            fields = document.querySelectorAll(DOMStrings.value + "," + DOMStrings.inputDescription);
            fieldsArray =Array.prototype.slice.call(fields);

            fieldsArray.forEach(function (current, index, array) {
                current.value = "";
            });

            fieldsArray[0].focus();
        },
        displayBudget: function (obj) {
            document.querySelector(DOMStrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMStrings.incomeLabel).textContent = obj.totalIncome;
            document.querySelector(DOMStrings.expensesLabel).textContent = obj.totalExpenses;
            console.log(obj.percentage);
            if(obj.percentage>0){
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + "%";
            }else{
                document.querySelector(DOMStrings.percentageLabel).textContent = "--";
            }
        }
        
    };
})();


//-------------------------------------------------------------------
//----------------------------Main Controller
//-------------------------------------------------------------------

var controller = (function (budgetCntr, UICntrl) {

    var updateBudget = function () {

        //1. Calculate budget
        budgetCntr.calculateBudget();

        //2. Return the budget
        var budget = budgetCntr.getBudget();

        //3. Display the budget to the UI
        UICntrl.displayBudget(budget);

    };

    var controlAddItem = function () {

        //1. Get input data
        var input = UICntrl.getInput();

        if(!isNaN(input.value)&& input.inputDescription!=="" && input.value >0){
            //2. Add to budget data controller
            var newItem = budgetCntr.addItem(input.type, input.inputDescription, input.value);

            //3. Add item to the UI
            UICntrl.addListItem(newItem,input.type);

            //4. Clear the fields
            UICntrl.clearFields();

            //5. Calculate and update the budget
            updateBudget();
        }


    };

    var controlDeleteItem = function (event) {
        if(event.target.classList[0]==="ion-ios-close-outline"){
            var itemID, splitID, type, id;
            itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
            splitID = itemID.split("-");
            // console.log(splitID);
            type = splitID[0];
            id = parseInt(splitID[1]);

            //1. delete the item from the data structure
            // console.log("delete invoking");
            budgetCntr.deleteItem(type,id);

            //2. Delete the item from UI
            UICntrl.deleteListItem(itemID);

            //3. update and show new budget
            updateBudget();
        }
    };

    var setupEventListeners = function () {

        var DOM = UICntrl.getDOMStrings();

        document.querySelector(DOM.tickBtn).addEventListener('click', controlAddItem);

        document.addEventListener('keypress', function (event) {
            if(event.keyCode ===13 || event.which===13){
                controlAddItem();
            }

        });

        document.querySelector(DOM.container).addEventListener("click", controlDeleteItem);

    };

    return{
        init: function () {
            setupEventListeners();
            UICntrl.displayBudget({
                budget: 0,
                totalIncome: 0,
                totalExpenses: 0,
                percentage: 0});
        }
    }

})(budgetController, UIController);

controller.init();