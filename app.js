//Budget data controller
let budgetController = (function () {

    let Expense = function (id, description, value) {
        this.id = id;
        this.inputDescription =description ;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calculatePercentage= function (totalIncome) {
        if(totalIncome>0){
            this.percentage = Math.round(this.value/totalIncome * 100);
        }else{
            this.percentage = -1;
        }

    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    };

    let Income = function (id, description, value) {
        this.id = id;
        this.inputDescription =description ;
        this.value = value;
    };

    let calculateTotal = function (type) {
        let sum = 0;
        data.allItems[type].forEach(function (current) {
            sum += current.value;
        });
        data.totals[type] = sum;
    };
    
    let data ={
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
            let newItem, ID;

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
            let ids, index;

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

        calculatePercentages: function () {
            data.allItems['exp'].forEach(function (currentItem) {
                currentItem.calculatePercentage(data.totals.inc);
            })
        },

        getPercentage: function () {
            let allPercentages = data.allItems['exp'].map(function (current) {
                return current.getPercentage();
            });
            return allPercentages;
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

let UIController = (function () {
    //classes
    let DOMStrings = {
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
        container: ".container",
        expensesPercentageLabel: ".item__percentage",
        dateLabel: ".budget__title--month"
    };

    let formatNumber = function (num, type) {
        let numSplit, int, dec, newNum="";
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split(".");

        int = numSplit[0];
        dec = numSplit[1];

        if(int.length>3){
            let remainder = int.length%3;
            if(remainder>0){
                newNum += int.substr(0,remainder) + ",";
            }
            console.log(int.substr(remainder,3));
            let i = remainder;
            while(i<int.length){
                newNum +=int.substr(i,3);
                i+=3;
                if(i<int.length){
                    newNum+=",";
                }
            }
            // for(let i=remainder; i<int.length; i+3){
            //     newNum +=int.substr(i,3);
            // }
        }else {
            newNum = int;
        }
        newNum +="."+ dec;
        if(type==="inc"){
            newNum= "+" + newNum;
        }else{
            newNum = "-" + newNum;
        }
        return newNum;
    };

    let nodeListForEach = function (list, callback) {
        for(let i=0; i<list.length;i++ ){
            callback(list[i],i);
        }
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
            let html, newHtml, adjacentClass;

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
            newHtml = newHtml.replace("%value%", formatNumber( obj.value, type));

            //3. Insert html into the DOM
            document.querySelector(adjacentClass).insertAdjacentHTML("beforeend", newHtml);
        },

        deleteListItem: function (selectorID) {
            let element =  document.getElementById(selectorID);
            element.parentNode.removeChild(element);
        },

        clearFields: function () {
            let fields, fieldsArray;
            fields = document.querySelectorAll(DOMStrings.value + "," + DOMStrings.inputDescription);
            fieldsArray =Array.prototype.slice.call(fields);

            fieldsArray.forEach(function (current, index, array) {
                current.value = "";
            });

            fieldsArray[0].focus();
        },
        displayBudget: function (obj) {
            let type;
            type = obj.budget>=0? "inc": "exp";
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber( obj.budget,type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalIncome,"inc");
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExpenses, "exp");
            // console.log(obj.percentage);
            if(obj.percentage>0){
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + "%";
            }else{
                document.querySelector(DOMStrings.percentageLabel).textContent = "--";
            }
        },
        
        displayPercentages: function (percentages) {
            let fields = document.querySelectorAll(DOMStrings.expensesPercentageLabel);
            
            nodeListForEach(fields, function (current, index) {

                if(percentages[index]>0){
                    current.textContent = percentages[index] + "%";
                }else{
                    current.textContent =  "--%";
                }


            });
        },
        
        displayMonth: function () {
            let year, now, month, months;
            now = new Date();
            months =["Jan", "Feb", "March", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
            year = now.getFullYear();
            month = now.getMonth();
            document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ", " + year
        },

        changedType: function () {
            let fields = document.querySelectorAll(
                DOMStrings.inputType+ "," +
                DOMStrings.inputDescription + "," +
                DOMStrings.value
            );

            nodeListForEach(fields, function (current) {
               current.classList.toggle("red-focus");
            });

            document.querySelector(DOMStrings.tickBtn).classList.toggle("red");
        }
        
    };
})();


//-------------------------------------------------------------------
//----------------------------Main Controller
//-------------------------------------------------------------------

let controller = (function (budgetCntr, UICntrl) {

    let updateBudget = function () {

        //1. Calculate budget
        budgetCntr.calculateBudget();

        //2. Return the budget
        let budget = budgetCntr.getBudget();

        //3. Display the budget to the UI
        UICntrl.displayBudget(budget);

    };

    let updatePercentages = function () {

        //1. Calculate the percentages
        budgetCntr.calculatePercentages();

        //2. Read percentages from budget controller
        let allPercentagesArray = budgetCntr.getPercentage();


        //3. Update the interface
        UICntrl.displayPercentages(allPercentagesArray);

    };

    let controlAddItem = function () {

        //1. Get input data
        let input = UICntrl.getInput();

        if(!isNaN(input.value)&& input.inputDescription!=="" && input.value >0){
            //2. Add to budget data controller
            let newItem = budgetCntr.addItem(input.type, input.inputDescription, input.value);

            //3. Add item to the UI
            UICntrl.addListItem(newItem,input.type);

            //4. Clear the fields
            UICntrl.clearFields();

            //5. Calculate and update the budget
            updateBudget();

            //6. Calculate and update the percentages
            updatePercentages();
        }


    };

    let controlDeleteItem = function (event) {
        if(event.target.classList[0]==="ion-ios-close-outline"){
            let itemID, splitID, type, id;
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

            //4. Calculate and update the percentages
            updatePercentages();
        }
    };

    let setupEventListeners = function () {

        let DOM = UICntrl.getDOMStrings();

        document.querySelector(DOM.tickBtn).addEventListener('click', controlAddItem);

        document.addEventListener('keypress', function (event) {
            if(event.keyCode ===13 || event.which===13){
                controlAddItem();
            }

        });

        document.querySelector(DOM.container).addEventListener("click", controlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener("change", UICntrl.changedType)
    };

    return{
        init: function () {

            UICntrl.displayBudget({
                budget: 0,
                totalIncome: 0,
                totalExpenses: 0,
                percentage: 0
            });
            setupEventListeners();
            UICntrl.displayMonth();
        }
    }

})(budgetController, UIController);

controller.init();