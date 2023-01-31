// When loading document
function onload() {
    setTimeout(() => {
        document.getElementById('circle').style.display = 'none';
    }, 3000)
}

// Starting search on enter
function go(e) {
    if (e.keyCode === 13) {
        e.preventDefault();
        // Setting input to the entered text
        var input = document.getElementById('input').value;
        // If a domain is entered, go to the site, instead of searching
        if (input.slice(-4) == '.com' || input.slice(-3) == '.hu') {
            url = 'http://' + input;
            //window.open(url, '_blank').focus();
        }
        // If not, do the search
        else {
            // TODO: Do the search
            

            // Start animation
            document.getElementById('icon').style.width = '3.5vw';
            document.getElementById('icon').style.marginLeft = '3vw';
            document.getElementById('icon').style.marginTop = '1.5vw';

            document.getElementById('input').style.marginTop = '2vw';
            document.getElementById('input').style.fontSize = '4vh';

            document.getElementById('web_search_container').style.top = '4.5vh';

            document.getElementById('body').style.overflowY = 'auto';
        }
        // Select text in the input so dont have to delete
        document.getElementById('input').select();
    }
}

// Go to mail when clicked
function gomail(e) {
    url = 'https://mail.google.com/mail/u/0/#inbox'
    window.open(url, '_blank').focus();
}