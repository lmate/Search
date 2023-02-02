var currency_list = ["HUF", "AED", "AFN", "ALL", "AMD", "ANG", "AOA", "ARS", "AUD", "AWG", "AZN", "BAM", "BBD", "BDT", "BGN", "BHD", "BIF", "BMD", "BND", "BOB", "BRL", "BSD", "BTN", "BWP", "BYN", "BZD", "CAD", "CDF", "CHF", "CLP", "CNY", "COP", "CRC", "CUP", "CVE", "CZK", "DJF", "DKK", "DOP", "DZD", "EGP", "ERN", "ETB", "EUR", "FJD", "FKP", "FOK", "GBP", "GEL", "GGP", "GHS", "GIP", "GMD", "GNF", "GTQ", "GYD", "HKD", "HNL", "HRK", "HTG", "IDR", "ILS", "IMP", "INR", "IQD", "IRR", "ISK", "JEP", "JMD", "JOD", "JPY", "KES", "KGS", "KHR", "KID", "KMF", "KRW", "KWD", "KYD", "KZT", "LAK", "LBP", "LKR", "LRD", "LSL", "LYD", "MAD", "MDL", "MGA", "MKD", "MMK", "MNT", "MOP", "MRU", "MUR", "MVR", "MWK", "MXN", "MYR", "MZN", "NAD", "NGN", "NIO", "NOK", "NPR", "NZD", "OMR", "PAB", "PEN", "PGK", "PHP", "PKR", "PLN", "PYG", "QAR", "RON", "RSD", "RUB", "RWF", "SAR", "SBD", "SCR", "SDG", "SEK", "SGD", "SHP", "SLE", "SLL", "SOS", "SRD", "SSP", "STN", "SYP", "SZL", "THB", "TJS", "TMT", "TND", "TOP", "TRY", "TTD", "TVD", "TWD", "TZS", "UAH", "UGX", "USD", "UYU", "UZS", "VES", "VND", "VUV", "WST", "XAF", "XCD", "XDR", "XOF", "XPF", "YER", "ZAR", "ZMW", "ZWL"];
var currency_rates;

// Keeps track of all the running timeouts that are there to give the user a little more time to type their currency conversion
var running_timeouts_list = [];

// Getting current currency rates
async function load_currency_rates() {
    // Try to get rates from local storage
    try {
        // Check how old (in seconds) the stored data is (api refreshes every 24 hours, get new if stored is older than a day)
        if (parseInt(localStorage.getItem("currency_rates_lastrecieved")) + 90000 > new Date().getTime() / 1000) {
            // If not older than a day, just use that
            currency_rates = JSON.parse(localStorage.getItem("currency_rates"));
        }
        // If older than a day, contineu to getting from server
        else {
            throw 0;
        }
    }
    // If older than a day (or non existans), get currency rates from the api server
    catch (err) {
        // Get from server
        let currencyrates_response = await fetch('https://open.er-api.com/v6/latest/usd', { signal: AbortSignal.timeout(5000) });
        let currencyrates_result = await currencyrates_response.json();

        // Store data in local storage
        localStorage.setItem("currency_rates", JSON.stringify(currencyrates_result));
        // Store the last time new data was saved (in seconds)
        localStorage.setItem("currency_rates_lastrecieved", new Date().getTime() / 1000);

        currency_rates = currencyrates_result;
    }
}
load_currency_rates();


function instant_currency_convert() {
    var immediate_input = document.getElementById('input').value;
    // Split the input into words, so we can search easily between them
    immediate_input = immediate_input.split(' ');

    // Try to currency convert
    try {
        var number_of_all_numbers = 0;
        var number_of_all_currency_codes = 0;

        var firsthalf_at = 0; // firsthalf = [number] [currecy]
        var firsthalf_count = 0

        var secondhalf_at = 0; // secondhalf = [currency]
        var secondhalf_count = 0;

        // Go through every word of the input and look for the first half (a number and a currency code immediately after it)
        for (var i = 0; i < immediate_input.length; i++) {
            if (!isNaN(parseInt(immediate_input[i])) && currency_list.includes(immediate_input[i + 1].toUpperCase())) {
                firsthalf_at = i;
                firsthalf_count++;
            }
        }

        // If there is only one first half (so first half of the input is correct)
        if (firsthalf_count == 1) {
            // Go through every word after the found first half and look for the second half (a currency code wherever)
            for (var j = firsthalf_at + 2; j < immediate_input.length; j++) {
                if (currency_list.includes(immediate_input[j].toUpperCase())) {
                    secondhalf_at = j;
                    secondhalf_count++;
                }
            }
        }
        // Not a currency conversion
        else {
            throw 0;
        }

        // If there is only one first and only one second half (so both of theme are good), check if there are more numbers than one
        if (firsthalf_count == 1 && secondhalf_count == 1) {
            // Go through all the words and check for numbers
            for (var k = 0; k < immediate_input.length; k++) {
                // Calculate the number of numbers
                if (!isNaN(parseInt(immediate_input[k]))) {
                    number_of_all_numbers++;
                }
                // Calculate the number currency codes
                if (currency_list.includes(immediate_input[k].toUpperCase())) {
                    number_of_all_currency_codes++;
                }
            }
            // If there is one number and two currency codes, all in good order, than we have a curreny conversion request
            if (number_of_all_numbers == 1 && number_of_all_currency_codes == 2) {
                // Calculate the actual result
                var from_currency_in_usd = parseInt(immediate_input[firsthalf_at]) / currency_rates.rates[immediate_input[firsthalf_at + 1].toUpperCase()];
                var currency_convert_result = from_currency_in_usd * currency_rates.rates[immediate_input[secondhalf_at].toUpperCase()]

                // Round to two digits, except when the number is too small to show like that, than round to four digits
                if (math.round(currency_convert_result, 2) != 0) {
                    currency_convert_result = new Intl.NumberFormat('en-en', { style: 'currency', currency: immediate_input[secondhalf_at].toUpperCase(), minimumFractionDigits: 2 }).format(currency_convert_result);
                }
                // Round to four digits
                else {
                    currency_convert_result = new Intl.NumberFormat('en-en', { style: 'currency', currency: immediate_input[secondhalf_at].toUpperCase(), minimumFractionDigits: 4 }).format(currency_convert_result);
                }

                ///////////////////////////////////////
                // From now copied from instantmath
                ///////////////////////////////////////

                //////////////////////////////////////////////////////////
                // Remove all timeouts that hide the math output, because there is now a new problem, with a new solution, no need to hide
                for (var i = 0; i < running_timeouts_list.length; i++) {
                    window.clearTimeout(running_timeouts_list[i]);
                }
                running_timeouts_list = [];

                // If search results are already shown, use the inpage math output
                if (document.getElementById('input').style.marginTop == '2vw') {
                    // Load math solution (rounded) into the inpage output
                    document.getElementById('currency-converter-inpage-label').innerHTML = '= ' + currency_convert_result;

                    // Move the inpage math output into the page, give the search result container a top margin, to make place for the math output, and set inpage math output to abolute, so it scrolls with the page
                    document.getElementById('currency-converter-inpage').style.top = '15vh';
                    document.getElementById('currency-converter-inpage').style.position = 'absolute';
                    document.getElementById('web_search_container').style.marginTop = '11vh';

                    // Move the overlay math output from the screen, and remove its content
                    document.getElementById('currency-converter-overlay-label').innerHTML = '';
                    document.getElementById('currency-converter-overlay').style.top = '100vh';
                }
                // If search results are not yet shown, use the overlay math output
                else {
                    // Load math solution (rounded) into the overlay output
                    document.getElementById('currency-converter-overlay-label').innerHTML = '= ' + currency_convert_result;

                    // Move it to its place
                    document.getElementById('currency-converter-overlay').style.top = '61vh';
                    // No need to worry about the inpage output, it cant yet be show, since there is no going back from when the search results are shown
                }
                //////////////////////////////////////////////////////////
            }
        }
        // Not a currency conversion
        else {
            throw 0;
        }
    }
    catch (err) {
        // Not a currency conversion

        ///////////////////////////////////////////////
        // Wait a little with hiding the outputs in case the user is not done typing yet, just in the middle of a math problem, that cant yet be recognised as one
        // Add the timeout to a list, so hiding can still be stopped when there is multiple started
        running_timeouts_list.push(window.setTimeout(function () {
            if (document.getElementById('math-solver-inpage').style.position == 'fixed') {
                // Remove the search result containers margin, to move it back to its original place
                document.getElementById('web_search_container').style.marginTop = '0vh';
            }

            // Move the overlay math output from the screen and hide its contents
            document.getElementById('currency-converter-overlay-label').innerHTML = '';
            document.getElementById('currency-converter-overlay').style.top = '120vh';

            // Move the inpage math output from the screen and hide its contents
            document.getElementById('currency-converter-inpage-label').innerHTML = '';
            document.getElementById('currency-converter-inpage').style.top = '120vh';

            // Set inpage math output fixed, so it does not scroll with the page when hidden
            document.getElementById('currency-converter-inpage').style.position = 'fixed';
        }, 1500));
        ////////////////////////////////////////////////////
    }
}




