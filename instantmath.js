// Indicates wether there is a math problem
var math_solved = 0; // Yes or No
// Stores the solution
var math_solution = 0;
// Keeps track of all the running timeouts that are there to give the user a little more time to type their math problem
var running_timeouts_list = [];

function instant_math() {
    var immediate_input = document.getElementById('input').value;

    // Determine if the input is a math problem and solve it
    try {
        // Try solve math problem, throws error, if no soulution (no math probrem than)
        math_solution = math.evaluate(immediate_input);
        // Check if solution is good (e.g. giving back the only number in the input is not a solution)
        if (!isNaN(math_solution) && math_solution != immediate_input && immediate_input != '') {
            // If everything is right, math is solved
            math_solved = 1;
        }
        // Set math_solved to 0, even when math is solvable, but not good
        else {
            math_solved = 0;
        }
    }
    catch (err) {
        // The input is not math
        math_solved = 0;
    }
    // Write solution to output if input is a math problem
    if (math_solved == 1) {
        // Remove all timeouts that hide the math output, because there is now a new problem, with a new solution, no need to hide
        for (var i = 0; i < running_timeouts_list.length; i++) {
            window.clearTimeout(running_timeouts_list[i]);
        }
        // If search results are already shown, use the inpage math output
        if (document.getElementById('input').style.marginTop == '2vw') {
            // Load math solution (rounded) into the inpage output
            document.getElementById('math-solver-inpage-label').innerHTML = '= ' + math.round(math_solution, 5);

            // Move the inpage math output into the page, give the search result container a top margin, to make place for the math output, and set inpage math output to abolute, so it scrolls with the page
            document.getElementById('math-solver-inpage').style.top = '15vh';
            document.getElementById('math-solver-inpage').style.position = 'absolute';
            document.getElementById('web_search_container').style.marginTop = '11vh';

            // Move the overlay math output from the screen, and remove its content
            document.getElementById('math-solver-overlay-label').innerHTML = '';
            document.getElementById('math-solver-overlay').style.top = '100vh';
        }
        // If search results are not yet shown, use the overlay math output
        else {
            // Load math solution (rounded) into the overlay output
            document.getElementById('math-solver-overlay-label').innerHTML = '= ' + math.round(math_solution, 5);

            // Move it to its place
            document.getElementById('math-solver-overlay').style.top = '61vh';
            // No need to worry about the inpage output, it cant yet be show, since there is no going back from when the search results are shown
        }
    }
    // If input is not a math problem, move both math outputs from the screen
    else {
        // Wait a little with hiding the outputs in case the user is not done typing yet, just in the middle of a math problem, that cant yet be recognised as one
        // Add the timeout to a list, so hiding can still be stopped when there is multiple started
        running_timeouts_list.push(window.setTimeout(function () {

            // Remove the search result containers margin, to move it back to its original place
            document.getElementById('web_search_container').style.marginTop = '0vh';

            // Move the overlay math output from the screen and hide its contents
            document.getElementById('math-solver-overlay-label').innerHTML = '';
            document.getElementById('math-solver-overlay').style.top = '120vh';

            // Move the inpage math output from the screen and hide its contents
            document.getElementById('math-solver-inpage-label').innerHTML = '';
            document.getElementById('math-solver-inpage').style.top = '120vh';

            // Set inpage math output fixed, so it does not scroll with the page when hidden
            document.getElementById('math-solver-inpage').style.position = 'fixed';
        }, 1500));
    }
}