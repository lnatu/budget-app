var budgetController = (function() {
	
	var Expense = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};

	var Income = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};

	Expense.prototype.calcPercentage = function(totalIncome) {
		if (totalIncome > 0) {
			this.percentage = Math.round((this.value / totalIncome) * 100);
		} else {
			this.percentage = -1;
		}

	};

	Expense.prototype.getPercentage = function() {
		return this.percentage;
	}

	var calculateTotal = function(type) {
		var sum = 0;
		data.allItems[type].forEach(function(curr) {
			sum += curr.value;
		});
		data.total[type] = sum;
	};

	var data = {
		allItems: {
			exp: [],
			inc: []
		},
		total: {
			exp: 0,
			inc: 0
		},
		budget: 0,
		percentage: -1
	};

	return {
		addItem: function(type, description, value) {

			var newItem, id;

			if (data.allItems[type].length > 0) {
				id = data.allItems[type][data.allItems[type].length - 1].id + 1;
			} else {
				id = 0;
			}

			if (type === 'exp') {
				newItem = new Expense(id, description, value);
			} else if (type === 'inc') {
				newItem = new Income(id, description, value);
			}

			data.allItems[type].push(newItem);

			return newItem;

		},
		deleteItem: function(type, id) {
			var ids, indexl
			
			ids = data.allItems[type].map(function(curr) {
				return curr.id;
			});
			
			index = ids.indexOf(id);
						
			if (index !== -1) {
				data.allItems[type].splice(index, 1);
			}
		},
		calculateBudget: function() {

			// calculate total income and expense
			calculateTotal('exp');
			calculateTotal('inc');

			// calculate the budget: income - expense
			data.budget = data.total.inc - data.total.exp;

			// calculate the percentage of income that we spent
			if (data.total.inc > 0) {
				data.percentage = Math.round((data.total.exp / data.total.inc) * 100);
			} else {
				data.percentage = -1;
			}

		},
		calculatgePercentages: function() {
			data.allItems.exp.forEach(function(curr) {
				curr.calcPercentage(data.total.inc);
			});
		},
		getPercentages: function() {
			var allPercentages = data.allItems.exp.map(function(curr) {
				return curr.getPercentage();
			});
			return allPercentages;
		},
		getBudget: function() {
			return {
				budget: data.budget,
				totalIncome: data.total.inc,
				totalExpense: data.total.exp,
				percentage: data.percentage
			}
		},
		testing: function() {
			console.log(data);
		}
	}

})();




var UIController = (function() {

	var domStr = {
		inputType: '.add__type',
		inputDescription: '.add__description',
		inputValue: '.add__value',
		inputButton: '.add__btn',
		incomeContainer: '.income__list',
		expenseContainer: '.expenses__list',
		budgetLabel: '.budget__value',
		incomeLabel: '.budget__income--value',
		expenseLabel: '.budget__expenses--value',
		percentageLabel: '.budget__expenses--percentage',
		container: '.container',
		expensesPercLabel: '.item__percentage',
		dateLabel: '.budget__title--month',
		inputType: '.add__type',
		inputDescription: '.add__description',
		inputValue: '.add__value',
		inputBtn: '.add__btn'
	};
	var formatNumber = function(num, type) {
		var numsplit, int, dec, sign;

		num = Math.abs(num);
		num = num.toFixed(2);

		numsplit = num.split('.');

		int = numsplit[0];	
		if (int.length > 3) {
			int = int.substr(0, int.length - 3) + ', ' + int.substr(int.length - 3, int.length);
		}
		dec = numsplit[1];

		return (type === 'exp' ? sign = '-' : sign = '+') + ' ' + int + '.' + dec;
	};

	var nodeListForEach = function(list, callback) {
		for (var i = 0; i < list.length; i++) {
			callback(list[i], i);
		}
	};

	return {
		getInput: function() {
			return {
				type: document.querySelector(domStr.inputType).value,
				description: document.querySelector(domStr.inputDescription).value,
				value: parseFloat(document.querySelector(domStr.inputValue).value)
			}
			
		},
		addListItem: function(obj, type) {
			var html, newHTML, element;
			// create html
			if (type === 'inc') {
				element = domStr.incomeContainer;
				html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
			} else if (type === 'exp') {
				element = domStr.expenseContainer;
				html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
			}
			
			// replace actual data
			newHTML = html.replace('%id%', obj.id);
			newHTML = newHTML.replace('%description%', obj.description);
			newHTML = newHTML.replace('%value%', formatNumber(obj.value, type));

			// insert html to dom
			document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
		},
		deleteListItem: function(id) {
			var item = document.getElementById(id);
			item.parentNode.removeChild(item);
		},
		clearFields: function() {
			var fields, fieldsArr;
			fields = document.querySelectorAll(domStr.inputDescription + ', ' + domStr.inputValue);
			
			fieldsArr = Array.prototype.slice.call(fields);
		
			fieldsArr.forEach(function(curr, index, arr) {
				curr.value = "";
			});

			fieldsArr[0].focus();
		},
		displayBudget: function(obj) {
			var type;
			obj.budget > 0 ? type = 'inc' : 'exp';

			document.querySelector(domStr.budgetLabel).textContent = formatNumber(obj.budget, type);
			document.querySelector(domStr.incomeLabel).textContent = formatNumber(obj.totalIncome, 'inc');
			document.querySelector(domStr.expenseLabel).textContent = formatNumber(obj.totalExpense, 'exp');

			if (obj.percentage > 0) {
				document.querySelector(domStr.percentageLabel).textContent = obj.percentage + ' %';
			} else {
				document.querySelector(domStr.percentageLabel).textContent = '---';
			}

		},
		displayMonth: function() {
			var now = new Date();
			var year = now.getFullYear();
			var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
			var month = now.getMonth();
			document.querySelector(domStr.dateLabel).textContent = months[month] + ' ' + year;
		},
		displayPercentages: function(percentages) {
			var fields = document.querySelectorAll(domStr.expensesPercLabel);

			nodeListForEach(fields, function(curr, index) {
				if (percentages[index] > 0) {
					curr.textContent = percentages[index] + ' %';
				} else {
					curr.textContent = '---';
				}
			});
		},
		changeType: function() {
			var fields = document.querySelectorAll(
				domStr.inputType + ', ' +
				domStr.inputDescription + ', ' +
				domStr.inputValue
			);

			nodeListForEach(fields, function(curr) {
				curr.classList.toggle('red-focus');
			});

			document.querySelector(domStr.inputButton).classList.toggle('red');
		},
		getDomStr: function() {
			return domStr;
		}
	}

})();




var controller = (function(budgetCtrl, UICtrl) {

	var setUpEventListeners = function() {
		var dom = UICtrl.getDomStr();

		document.querySelector(dom.inputButton).addEventListener('click', ctrlAddItem);

		document.addEventListener('keypress', function(e) {
			if (e.keyCode === 13 || e.which === 13) {
				ctrlAddItem();
			}
		});

		document.querySelector(dom.container).addEventListener('click', ctrlDeleteItem);
		
		document.querySelector(dom.inputType).addEventListener('change', UICtrl.changeType);
	};

	var updateBudget = function() {
		// 1. Calculate the budget
		budgetCtrl.calculateBudget();

		// 2. Return the budget
		var budget = budgetCtrl.getBudget();

		// 3. Display the budget on the UI
		UICtrl.displayBudget(budget);
	};

	var updatePercentages = function() {
		// 1. calculate percentages
		budgetCtrl.calculatgePercentages();
		// 2. reload from the budget controller
		var percentages = budgetCtrl.getPercentages();
		// 3. update ui
		UICtrl.displayPercentages(percentages);
	};

	var ctrlAddItem = function() {

		var input, newItem;

		// 1. Get the field input data	
		input = UICtrl.getInput();

		if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

			// 2. Add item to the budget controller
			newItem = budgetCtrl.addItem(input.type, input.description, input.value);

			// 3. Add item to the UI
			UICtrl.addListItem(newItem, input.type);

			// 4. Clear the fields
			UICtrl.clearFields();

			// 5. Calculate and update budget
			updateBudget();

			// 6. calculate and update percentages
			updatePercentages();

		}

	};

	var ctrlDeleteItem = function(event) {
		var itemId, splitId, type, id;
		itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
		
		if (itemId) {
			splitId = itemId.split('-');
			type = splitId[0];
			id = parseInt(splitId[1]);
		
			// 1. delete item from data structure
			budgetCtrl.deleteItem(type, id);

			// 2. delete item from ui
			UICtrl.deleteListItem(itemId);

			// 3. update budget
			updateBudget();

			updatePercentages();
		}
	};

	return {
		init: function() {
			UICtrl.displayMonth();
			UICtrl.displayBudget({
				budget: 0,
				totalIncome: 0,
				totalExpense: 0,
				percentage: -1
			});
			setUpEventListeners();
		}
	}

})(budgetController, UIController);

controller.init();