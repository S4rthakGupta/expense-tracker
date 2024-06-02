$(document).ready(function () {
    $("#expense-date").datepicker();

    // FUNCTIONS
    const updateTotalExpensesDisplay = () => {
        $("#total-expenses-amount").text("$" + totalExpenses.toFixed(2));
        if (monthlyBudget > 0) {
            var remainingBudget = monthlyBudget - totalExpenses;
            var budgetColor = remainingBudget >= 0 ? "green" : "red";
            $(".total-expenses").append(
                '<p style="color: ' +
                budgetColor +
                '">Remaining Budget: $' +
                remainingBudget.toFixed(2) +
                "</p>"
            );
        }
    }

    const saveExpenses = () => {
        var expensesData = $("#expense-table-body").html();
        localStorage.setItem("expensesData", expensesData);
    }

    const loadExpenses = () => {
        var expensesData = localStorage.getItem("expensesData");
        if (expensesData) {
            $("#expense-table-body").html(expensesData);
            $("#expense-table-body .remove-expense-btn").each(function () {
                var amount = parseFloat(
                    $(this).closest("tr").find("td:eq(3)").text().replace("$", "")
                );
                totalExpenses += amount;
            });
            updateTotalExpensesDisplay();
        }
    }

    const loadBudget = () => {
        if (localStorage.getItem("monthlyBudget")) {
            monthlyBudget = parseFloat(localStorage.getItem("monthlyBudget"));
            $("#monthly-budget-input").val(monthlyBudget.toFixed(2));
            disableAndSetBudgetInput();
        }
    };

    const disableAndSetBudgetInput = () => {
        $("#monthly-budget-input").prop('disabled', true).val(monthlyBudget.toFixed(2));
    };

    const updateBudgetExpensesData = () => {
        // Display total expenses in card
        $("#total-expenses-amount-card").text(`$${totalExpenses.toFixed(2)}`);

        const remainingBudget = monthlyBudget - totalExpenses;
        if (remainingBudget < 0) {
            $("#notify-low-budget").show().html('<p>Your budget has been exceeded. You are now running on a DEFICIT.!!!</p>');
        }
        else {
            $("#notify-low-budget").hide().empty();
        }

        // Display remaining budget in card
        $("#remaining-budget-amount-card").text(`$${remainingBudget.toFixed(2)}`);

        const totalNumberOfExpenses = $("#expense-table-body tr").length;

        // Display total number of expenses done
        $("#total-number-expenses-card").text(totalNumberOfExpenses);
    }

    // To scroll to the form
    const scrollToForm = () => {
        var formOffset = $("#expense-form-container").offset().top;

        // Scroll the page to the form
        $("html, body").animate({ scrollTop: formOffset }, "slow");
    }

    const getCategoryIcon = (category) => {
        switch (category.toLowerCase()) {
            case "food":
                return "Food";
            case "rent":
                return "Rent";
            case "transportation":
                return "Transportation";
            case "utilities":
                return "Utilities";
            case "entertainment":
                return "Entertainment";
            case "healthcare":
                return "HealthCare";
            case "education":
                return "Education";
            case "clothing":
                return "Clothing";
            default:
                return "Other";
        }
    }
    // FUNCTIONS ENDS


    var monthlyBudget = 0;
    var totalExpenses = 0;
    var editedRow = null;

    // LOAD ALL THE DATAS
    loadExpenses();
    loadBudget();
    updateBudgetExpensesData();

    $("#monthly-budget-input").change(function () {
        monthlyBudget = $(this).val();
        updateTotalExpensesDisplay();
        localStorage.setItem("monthlyBudget", monthlyBudget);
        disableAndSetBudgetInput();
    });

    // Add Expense Button Clicked
    $("#add-expense-btn").click(function () {
        var date = $("#expense-date").val();
        var description = $("#expense-description").val();
        var category = $("#expense-category").val();
        var amount = parseFloat($("#expense-amount").val());

        if (!date || !description || !category || isNaN(amount) || amount <= 0 || monthlyBudget == 0) {
            $("#error-message").show().fadeOut(5000);
        } else {
            var newRow = $("<tr>");
            newRow.append("<td>" + date + "</td>");
            newRow.append("<td>" + description + "</td>");
            newRow.append("<td>" + getCategoryIcon(category) + "</td>");
            newRow.append("<td>$" + amount.toFixed(2) + "</td>");
            newRow.append(
                '<td class="actions"><button class="edit-expense-btn">Edit</button><button class="remove-expense-btn">Remove</button></td>'
            );

            // Add new row to the expense table
            $("#expense-table-body").append(newRow);

            // If there's a row being edited
            if (editedRow) {
                // Deduct the old amount from total expenses
                var oldAmount = parseFloat(editedRow.find("td:eq(3)").text().replace("$", ""));
                totalExpenses -= oldAmount;

                editedRow.remove();
                editedRow = null;
            }

            // Clear input fields
            $("#expense-date").val("");
            $("#expense-description").val("");
            $("#expense-amount").val("");

            // Show success message
            $("#success-message").show().fadeOut(5000);

            // Scroll to the added expense
            $("html, body").animate({
                scrollTop: newRow.offset().top
            }, 3000);

            // Update total expenses and display
            totalExpenses += amount;
            updateTotalExpensesDisplay();
            saveExpenses();
            updateBudgetExpensesData();

            // Disable the total budget on the first expense entry
            if ($("#expense-table-body tr").length === 1) {
                disableAndSetBudgetInput();
            }
        }
    });


    // Edit Expense Button Clicked
    $("#expense-table-body").on("click", ".edit-expense-btn", function () {
        scrollToForm();
        // Store the reference to the row being edited
        editedRow = $(this).closest("tr");

        var row = editedRow;
        var date = row.find("td:eq(0)").text();
        var description = row.find("td:eq(1)").text();
        var category = row.find("td:eq(2)").text();
        var amount = parseFloat(row.find("td:eq(3)").text().replace("$", ""));

        // Fill the form fields with the edited expense data
        $("#expense-date").val(date);
        $("#expense-description").val(description);
        $("#expense-category").val(category.toLowerCase());
        $("#expense-amount").val(amount);
    });


    // Remove Expense Button Clicked
    $("#expense-table-body").on("click", ".remove-expense-btn", function () {
        var confirmed = confirm("Are you sure you want to remove this expense?");

        if (confirmed) {
            var amount = parseFloat(
                $(this).closest("tr").find("td:eq(3)").text().replace("$", "")
            );
            totalExpenses -= amount;
            updateTotalExpensesDisplay();
            $(this).closest("tr").remove();
            saveExpenses();
            updateBudgetExpensesData();
        }
    });


    // Reset Budget and Expenses
    $("#reset-expense-btn").click(function () {
        localStorage.clear();
        $("#expense-table-body").empty();
        $("#monthly-budget-input").prop('disabled', false).val('');

        monthlyBudget = 0;
        totalExpenses = 0;

        updateTotalExpensesDisplay();
        updateBudgetExpensesData();
        $("#notify-low-budget").hide().empty();
        $(".total-expenses").find("p").hide();
        $("html, body").animate({ scrollTop: 0 }, "slow");
    });


    // Piechart representation of expenses
    if ($('#myChart').length > 0) {
        if (monthlyBudget > 0) {
            // Store category and total amount
            var categoryMap = new Map();
            var expensesData = localStorage.getItem("expensesData");

            if (expensesData) {
                $($.parseHTML(expensesData)).each(function () {
                    var amount = parseFloat($(this).find("td:eq(3)").text().replace("$", ""));
                    var category = $(this).find("td:eq(2)").text().trim();

                    // Check if the category already exists in the map
                    if (categoryMap.has(category)) {
                        var currentTotal = categoryMap.get(category);
                        categoryMap.set(category, currentTotal + amount);
                    } else {
                        categoryMap.set(category, amount);
                    }
                });
            }

            // Extract xValues (categories) and yValues (total expenses) from the map
            var xValues = Array.from(categoryMap.keys());
            var yValues = Array.from(categoryMap.values());

            var barColors = [
                "#FFBF00",
                "#FF7F50",
                "#DE3163",
                "#9FE2BF",
                "#40E0D0",
                "#6495ED",
                "#CCCCFF",
                "#b91d47",
                "#00aba9",
                "#2b5797",
                "#e8c3b9",
                "#1e7145",
                "#DFFF00"
            ];
            new Chart("myChart", {
                type: "doughnut",
                data: {
                    labels: xValues,
                    datasets: [{
                        backgroundColor: barColors,
                        data: yValues
                    }]
                },
                options: {
                    title: {
                        display: true,
                        text: "Monthly Expense Pie-Chart"
                    }
                }
            });
        } else {
            $('.empty-piechart').show();
        }
    };

    // About Us
    if ($('#aboutUs-wrapper').length > 0) {
        $(".aboutUs-container").on({
            mouseenter: function () {
                //stuff to do on mouse enter
                $('.aboutUs-flexContainer ul').show(1000);
            },
            mouseleave: function () {
                //stuff to do on mouse leave
                $('.aboutUs-flexContainer ul').hide(1000);
            }
        });
    }


    // Profile Information
    $('.profile-link').click(function (event) {
        event.preventDefault();
        $('.dropdown-content').toggle();
    });

    // When user clicks outside hide
    $(window).click(function (event) {
        if (!event.target.matches('.profile-link, .profile-link *')) {
            $('.dropdown-content').hide();
        }
    });


    // Badges
    if (monthlyBudget > 0) {
        // Store category and total amount
        var categoryMap = new Map();
        var expensesData = localStorage.getItem("expensesData");

        if (expensesData) {
            $($.parseHTML(expensesData)).each(function () {
                var amount = parseFloat($(this).find("td:eq(3)").text().replace("$", ""));
                var category = $(this).find("td:eq(2)").text().trim();

                // Check if the category already exists in the map
                if (categoryMap.has(category)) {
                    var currentTotal = categoryMap.get(category);
                    categoryMap.set(category, currentTotal + amount);
                } else {
                    categoryMap.set(category, amount);
                }
            });
        }

        var highestExpenseCategory = "";
        var highestExpenseAmount = 0;
        var lowestExpenseCategory = null;
        var lowestExpenseAmount = Number.MAX_VALUE;

        categoryMap.forEach(function (amount, category) {
            if (amount > highestExpenseAmount) {
                highestExpenseAmount = amount;
                highestExpenseCategory = category;
            }

            if (amount < lowestExpenseAmount) {
                lowestExpenseAmount = amount;
                lowestExpenseCategory = category;
            }
        });

        // Update highest category color box and amount
        var highestCategoryColor = $('#' + highestExpenseCategory).css('background-color');
        $('#badge-info #highest-category-total').text('$' + highestExpenseAmount.toFixed(2));

        // Update lowest category color box and amount
        var lowestCategoryColor = $('#' + lowestExpenseCategory).css('background-color');
        $('#badge-info #lowest-category-total').text('$' + lowestExpenseAmount.toFixed(2));

        $('#' + highestExpenseCategory).addClass('highlight-highest-category');
        $('#' + lowestExpenseCategory).addClass('highlight-lowest-category');

        // Highlight all unused expense categories
        $('.badge').each(function () {
            var categoryId = $(this).attr('id');
            if (!categoryMap.has(categoryId)) {
                $(this).addClass('highlight-unused-category');
            }
        });
    }

});