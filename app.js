//Budget data controller
var budgetController = (function () {


})();


//UI Controller
var UIController = (function () {
    //classes
    var DOMStrings = {
        inputType: ".add__type",
        description: ".add__description",
        value: ".add__value",
        tickBtn: ".add__btn"
    };

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
        }
    };
})();


//Main Controller
var controller = (function (budgetCntr, UICntrl) {

    var DOM = UICntrl.getDOMStrings();

    var controlAddItem = function () {

        //1. Get input data
        var input = UICntrl.getInput();
        console.log(input);
        //2. Add to budget data controller

        //3. Add item to the UI

        //4. Calculate budget

        //5. Display the budget to the UI

    };


    document.querySelector(DOM.tickBtn).addEventListener('click', controlAddItem);

    document.addEventListener('keypress', function (event) {
        if(event.keyCode ===13 || event.which===13){
            controlAddItem();
        }

    })
})(budgetController, UIController);