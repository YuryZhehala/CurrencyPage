/**
 * Model class. Knows everything about API endpoint and data structure. Can format/map data to any structure.
 *
 * @constructor
 */
function Model() {
    /**
     * URL template for getting the currency rate and relevant date.
     * @type {string}    
     */
    var _requestTemplate =
        "http://www.nbrb.by/API/ExRates/Rates/Dynamics/Cur_Id?startDate=STARTDATE&endDate=ENDDATE";

    /**
     * Returns date depending on value passed.
     *
     * @param {number} addDays amount of days before current date (addDays=0 it is today's date)
     *
     * @returns {string} date in format YYYY-MM-DD.
     */
    this.getDate = function(addDays) {
        var d = new Date(),
            month = "" + (d.getMonth() + 1),
            day = "" + (d.getDate() + addDays),
            year = d.getFullYear();
        if (month.length < 2) month = "0" + month;
        if (day.length < 2) day = "0" + day;

        var resultDate = [year, month, day].join("-");
        return resultDate;
    };

    /**
     * URL address for getting the USD currency rate and relevant date in the last week.
     *
     * @returns {string} the URL address to fetch.
     */
    var _addressRequest = _requestTemplate
        .replace("Cur_Id", "145")
        .replace("STARTDATE", this.getDate(-7))
        .replace("ENDDATE", this.getDate(0));

    /**
     * Common method which "promisifies" calls.
     *
     * @param {string} _addressRequest the URL address to fetch.
     *
     * @return {Promise} the promise object will be resolved once request gets loaded/failed.
     */
    this.getRate = function(_addressRequest) {
        return fetch(_addressRequest).then(function(responce) {
            return responce.json();
        });
    };

    /**
     * Creating of array of currensy values and relevant dates.
     *
     * @returns {Object} the object contains currensy values and relevant dates arrays.
     */
    this.getCurrencyAndDateArr = function() {
        return this.getRate(_addressRequest).then(function(сurrencyInfoArr) {
            var сurrencyValueArr = сurrencyInfoArr.map(function(сurrencyInfo) {
                return сurrencyInfo.Cur_OfficialRate;
            });
            var сurrencyDateArr = сurrencyInfoArr.map(function(сurrencyInfo) {
                return сurrencyInfo.Date.slice(0, 10);
            });
            return (curveData = { сurrencyValueArr, сurrencyDateArr });
        });
    };

    /**
     * Creating of array of currensy values and relevant dates according to chosen currency value.
     *
     * @listens click
     *
     * @param {Event} event the DOM event object.
     *
     * @returns {Object} the object contains currensy values and relevant dates arrays.
     */
    this.chooseCurrency = function(event) {
        var _addressRequest = _requestTemplate
            .replace("STARTDATE", this.getDate(-7))
            .replace("ENDDATE", this.getDate(0))
            .replace("Cur_Id", event.target.id);

        var dropdowns = document.querySelectorAll(".dropdown-content li");

        [].forEach.call(dropdowns, function(elem) {
            if (elem.classList.contains("selected")) {
                elem.classList.remove("selected");
            }
        });
        event.target.setAttribute("class", "selected");

        return this.getRate(_addressRequest).then(function(сurrencyInfoArr) {
            var сurrencyValueArr = сurrencyInfoArr.map(function(сurrencyInfo) {
                return сurrencyInfo.Cur_OfficialRate;
            });
            var сurrencyDateArr = сurrencyInfoArr.map(function(сurrencyInfo) {
                return сurrencyInfo.Date.slice(0, 10);
            });
            return (curveData = { сurrencyValueArr, сurrencyDateArr });
        });
    };
    /**
     * Creating of array of currensy values and relevant dates according to chosen currency value.
     *
     * @listens click
     *
     * @param {Event} event the DOM event object.
     *
     * @returns {Object} the object contains currensy values and relevant dates arrays.
     */

    /**
     * Creating of array of currensy values and relevant dates according to chosen start and end dates.
     *
     * @param {string} currencyId id of active currency.
     * @param {string} startDate selected start date.
     * @param {string} endDate selected end date.
     *
     * @returns {Object} the object contains currensy values and relevant dates arrays.
     */
    this.chooseDate = function(currencyId, startDate, endDate) {
        var _addressRequest = _requestTemplate
            .replace("Cur_Id", currencyId)
            .replace("STARTDATE", startDate)
            .replace("ENDDATE", endDate);

        return this.getRate(_addressRequest).then(function(сurrencyInfoArr) {
            var сurrencyValueArr = сurrencyInfoArr.map(function(сurrencyInfo) {
                return сurrencyInfo.Cur_OfficialRate;
            });
            var сurrencyDateArr = сurrencyInfoArr.map(function(сurrencyInfo) {
                return сurrencyInfo.Date.slice(0, 10);
            });
            return (curveData = { сurrencyValueArr, сurrencyDateArr });
        });
    };
}

/**
 * View class. Knows everything about dom & manipulation and a little bit about data structure, which should be
 * filled into UI element.
 *
 * @constructor
 */
function View() {
    /**
     * View currency graph.
     *
     * @param {Object} date array of rendering dates.
     * @param {Object} currency array of rendering currency values.
     * @param {string} currencyName selected currency name.
     *
     * @returns {View} graph of chosen currency.
     */
    this.renderGraph = function(date, currency, currencyName) {
        var ctx = document.getElementById("currencyChart").getContext("2d");
        var currencyChart = new Chart(ctx, {
            type: "line",
            data: {
                labels: date,
                datasets: [
                    {
                        label: currencyName+"/BYN",
                        data: currency,
                        backgroundColor: ["rgba(255, 99, 132, 0.2)"],
                        borderColor: ["rgba(255,99,132,1)"],
                        borderWidth: 1,
                    },
                ],
            }
        });
    };

    /**
     * Returns the button of currency list.
     *
     * @returns {HTMLButtonElement} the button element.
     */
    this.getDropdownButton = function() {
        return document.querySelector(".dropbtn");
    };

    /**
     * Returns the list of currency values.
     *
     * @returns {HTMLUlElement} the ul element.
     */
    this.getDropdownList = function() {
        return document.querySelector("#dropdownList");
    };

    /**
     * Returns start date input.
     *
     * @returns {HTMLInputElement} the input element.
     */
    this.getStartDate = function() {
        return document.querySelector("#startDate");
    };

    /**
     * Returns end date input.
     *
     * @returns {HTMLInputElement} the input element.
     */
    this.getEndDate = function() {
        return document.querySelector("#endDate");
    };

    /**
     * Returns selected currency li.
     *
     * @returns {HTMLLiElement} the li element.
     */
    this.getSelectedCurrency = function() {
        return document.querySelector(".selected");
    };

    /**
     * Close the dropdown if the user clicks outside of it.
     *
     * @listens click
     *
     * @param {Event} event the DOM event object.
     */
    this.closeDropdown = function(event) {
        if (!event.target.matches(".dropbtn")) {
            var dropdowns = document.querySelectorAll(".dropdown-content");
            [].forEach.call(dropdowns, function(elem, i) {
                if (elem.classList.contains("show")) {
                    elem.classList.remove("show");
                }
            });
        }
    };
}

/**
 * Controller class. Orchestrates the model and view objects. A "glue" between them.
 *
 * @param {View} view view instance.
 * @param {Model} model model instance.
 *
 * @constructor
 */
function Controller(view, model) {
    /**
     * Initialize controller.
     */
    this.init = function() {
        var dropdownButton = view.getDropdownButton();
        var dropdownList = view.getDropdownList();
        var startDate = view.getStartDate();
        var endDate = view.getEndDate();

        window.addEventListener("click", view.closeDropdown);
        dropdownButton.addEventListener("click", this._changeClass);
        dropdownList.addEventListener("click", this._chooseCurrency);
        dropdownList.addEventListener("click", this._setDefaultDate);
        startDate.addEventListener("change", this._chooseStartDate);
        endDate.addEventListener("change", this._chooseEndDate);

        this._onLoadRenderGraph();
        this._setDefaultDate();
    };

    /**
     * Toggle between hiding and showing the dropdown content.
     *
     * @listens click
     */
    this._changeClass = function() {
        document.querySelector("#dropdownList").classList.toggle("show");
    };

    /**
     * Set start and end dates of last week.
     *
     * @listens click
     */
    this._setDefaultDate = function() {
        var startDateElement = view.getStartDate();
        var endDateElement = view.getEndDate();

        var startDate = model.getDate(-7);
        var endDate = model.getDate(0);

        startDateElement.value = startDate;
        endDateElement.value = endDate;

        startDateElement.max = endDateElement.value;
        endDateElement.max = endDateElement.value;
    };

    /**
     * Render graph after application loads.
     */
    this._onLoadRenderGraph = function() {
        model.getCurrencyAndDateArr().then(function(сurrencyAndDateArr) {
            var сurrencyValueArr = сurrencyAndDateArr.сurrencyValueArr;
            var сurrencyDateArr = сurrencyAndDateArr.сurrencyDateArr;
            var currencyName = document.querySelector(".selected").getAttribute("name");
            view.renderGraph(сurrencyDateArr, сurrencyValueArr, currencyName);
        });
    };

    /**
     * Render graph according to chosen currency.
     *
     * @listens click
     *
     * @param {Event} event the DOM event object.
     */
    this._chooseCurrency = function() {
        model.chooseCurrency(event).then(function(сurrencyAndDateArr) {
            var сurrencyValueArr = сurrencyAndDateArr.сurrencyValueArr;
            var сurrencyDateArr = сurrencyAndDateArr.сurrencyDateArr;
            var currencyName = document.querySelector(".selected").getAttribute("name");
            view.renderGraph(сurrencyDateArr, сurrencyValueArr, currencyName);
        });
    };

    /**
     * Render graph according to chosen start date.
     *
     * @listens change
     *
     * @param {Event} event the DOM event object.
     */
    this._chooseStartDate = function() {
        var currencyId = view.getSelectedCurrency().id;
        var startDate = event.target.value;
        var endDate = view.getEndDate().value;

        var endDateElement = view.getEndDate();
        endDateElement.setAttribute("min", startDate);

        model
            .chooseDate(currencyId, startDate, endDate)
            .then(function(сurrencyAndDateArr) {
                var сurrencyValueArr = сurrencyAndDateArr.сurrencyValueArr;
                var сurrencyDateArr = сurrencyAndDateArr.сurrencyDateArr;
                var currencyName = document.querySelector(".selected").getAttribute("name");
                view.renderGraph(сurrencyDateArr, сurrencyValueArr, currencyName);
            });
    };

    /**
     * Render graph according to chosen end date.
     *
     * @listens change
     *
     * @param {Event} event the DOM event object.
     */
    this._chooseEndDate = function() {
        var currencyId = view.getSelectedCurrency().id;
        var startDate = view.getStartDate().value;
        var endDate = event.target.value;

        var startDateElement = view.getStartDate();
        startDateElement.setAttribute("max", endDate);

        model
            .chooseDate(currencyId, startDate, endDate)
            .then(function(сurrencyAndDateArr) {
                var сurrencyValueArr = сurrencyAndDateArr.сurrencyValueArr;
                var сurrencyDateArr = сurrencyAndDateArr.сurrencyDateArr;
                var currencyName = document.querySelector(".selected").getAttribute("name");
                view.renderGraph(сurrencyDateArr, сurrencyValueArr, currencyName);
            });
    };
}

new Controller(new View(), new Model()).init();
