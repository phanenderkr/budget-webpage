//Budget data controller
var budgetController = (function () {

    var Expense = function (id, description, value) {
        this.id = id;
        this.description =description ;
        this.value = value;
    };

    var Income = function (id, description, value) {
        this.id = id;
        this.description =description ;
        this.value = value;
    };

    var data ={
        allItems:{
            exp: [],
            inc: []
        },
        totals:{
            exp: 0,
            inc: 0
        }
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
        description: ".add__description",
        value: ".add__value",
        tickBtn: ".add__btn",
        incomesContainer: ".income__list",
        expensesContainer: ".expenses__list"
    };

    // returning object
    return{
        getInput: function () {
            return{
                type : document.querySelector(DOMStrings.inputType).value, // will be inc or exp
                description : document.querySelector(DOMStrings.description).value,
                value : document.querySelector(DOMStrings.value).value
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

                html = '<div class="item clearfix" id="income-%id%"> <div class="item__description">%description%</div>                 <div class="right clearfix"> <div class="item__value"> %value%</div> <div class="item__delete">                 <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>' ;

            }else if(type === "exp"){

                adjacentClass = DOMStrings.expensesContainer;

                html= '<div class="item clearfix" id="expense-%id%"> <div class="item__description">%description%</div>                 <div class="right clearfix"> <div class="item__value"> %value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>' ;

            }


            //2. Replace the placeholder text
            newHtml = html.replace("%id%", obj.id);
            newHtml = newHtml.replace("%description%", obj.description);
            newHtml = newHtml.replace("%value%", obj.value);

            //3. Insert html into the DOM
            document.querySelector(adjacentClass).insertAdjacentHTML("beforeend", newHtml);
        }
        
    };
})();


//-------------------------------------------------------------------
//----------------------------Main Controller
//-------------------------------------------------------------------

var controller = (function (budgetCntr, UICntrl) {

    var controlAddItem = function () {

        //1. Get input data
        var input = UICntrl.getInput();
        console.log(input);

        //2. Add to budget data controller
        var newItem = budgetCntr.addItem(input.type, input.description, input.value);

        //3. Add item to the UI
        console.log(newItem.type);
        UICntrl.addListItem(newItem,input.type);
        //4. Calculate budget

        //5. Display the budget to the UI

    };

    var setupEventListeners = function () {

        var DOM = UICntrl.getDOMStrings();

        document.querySelector(DOM.tickBtn).addEventListener('click', controlAddItem);

        document.addEventListener('keypress', function (event) {
            if(event.keyCode ===13 || event.which===13){
                controlAddItem();
            }

        });
    };

    return{
        init: function () {
            setupEventListeners();
        }
    }

})(budgetController, UIController);

controller.init();