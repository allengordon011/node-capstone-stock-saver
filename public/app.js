//stock API
// const fetchAPI_URL = 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20(%22'+stock+'%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback='

// 'http://finance.google.com/finance/info?client=ig&q='

//event listeners
$('#js-signup-form').submit(function(event) {
    event.preventDefault();

    let obj = {
        username: event.target.username.value,
        password: event.target.password.value
    }

    //clear form fields
    $('input, textarea').val('');

    $.ajax({
        type: 'POST',
        data: JSON.stringify(obj),
        url: 'http://localhost:8080/signup',
        contentType: "application/json",
        dataType: "json"})
        .then(function(res) {
            console.log('RES: ', res)
            window.location='/stocksaver.html';
        })
        .fail(function(err) {
            console.log('AJAX FAIL')
            $('.alert.alert-warning').toggle(200).append('ERROR')
            window.location='/signup.html';
            console.log(err)
        })
});

$('#js-login-form').on('submit', function(event) {
    event.preventDefault();

    let obj = {
        username: event.target.username.value,
        password: event.target.password.value
    }

    //clear form fields
    $('.form-group').val('');

    $.ajax({
        type: 'POST',
        data: JSON.stringify(obj),
        url: 'http://localhost:8080/login',
        contentType: "application/json",
        dataType: "json"})
        .then(function() {
            // $('#js-user').html(`Hi, ${req.user.username}.`)
            window.location='/stocksaver.html';

        })
        .fail(function(err) {
            console.log('AJAX FAIL')
            $('.alert.alert-warning').toggle(200).append('ERROR')
            window.location='/login.html';
            console.log(err);
        })
});

$('#js-logout').click(function(event) {
    event.preventDefault();
    $.ajax({
        type: 'GET',
        url: 'http://localhost:8080/logout'
    })
    .then(function(res) {

        window.location='/index.html';
        console.log('User Logged Out')
        console.log('RES: ', res)
    })
    .fail(function(err) {
        console.log('AJAX FAIL')
        $('.alert.alert-warning').toggle(200).append('ERROR')
        // window.location='/login.html';
        console.log(err);
    })
})

$('#stock-search').submit(function(event) {
    event.preventDefault();
    let stock = event.target.stock.value;
    // console.log('STOCK: ', stock)
    $('#results').hide(200).val('')
    $('.alert').hide(200).html('')
    $('#save-button').hide(200)
    $('input, textarea').val('');

    $.ajax({
        type: 'GET',
        url: 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20(%22'+stock+'%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback='
    })
    .then(function(res) {
        // console.log('RES: ', res.query.results)
        let companyName = res.query.results.quote.Name;
        let askPrice = res.query.results.quote.Ask;
        let lastPrice = res.query.results.quote.LastTradePriceOnly;        if(companyName === null) {
            $('.alert').show(300).html('Sorry, that stock was not found.')
        } else {

        $('#results').show(300).html('The last trading price of ' + companyName + ' (' + stock + ') is: $' + lastPrice)
        $('#save-stocks-button').show(1000)
        }
        $('#save-stocks-button').on('click', function(event) {
            // console.log(companyName)
            // console.log(lastPrice)
            let obj = {stock: stock, price: lastPrice}
            $.ajax({
                type: 'POST',
                data: JSON.stringify(obj),
                url: 'http://localhost:8080/stocksaver/stocks',
                contentType: "application/json",
                dataType: "json"
            })
        });
    })
    .fail(function(err) {
        console.log('AJAX FAIL')
        $('.alert.alert-warning').toggle(300).html('ERROR')
        // window.location='/login.html';
        console.log(err);
    });
})


$( '#view-stocks-button' ).on('click', function() {
    console.log( "ready!" );
    $.ajax({
        type: 'GET',
        url: 'http://localhost:8080/stocksaver/stocks'
    })
    .then(function(req, res) {
        let stocks = req.user.stocks
        let stocksList = Object.keys(stocks).map(function(key) {
            return `<li>"${stocks[key].stock}", Last Price: $${stocks[key].price}</li>`
        }).join("");

        $('#saved-stocks').show(200).html(`<ul>${stocksList}</ul>`)
    })
});


// $('.alert.alert-warning').toggle();
