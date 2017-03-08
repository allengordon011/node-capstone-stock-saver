// const {PORT} = require('./config/database');


//signup
$('#js-signup-form').submit(function(event) {
    event.preventDefault();

    let obj = {
        username: event.target.username.value,
        password: event.target.password.value
    }

    //clear form fields
    $('input, textarea').val('');

    $.ajax({type: 'POST', data: JSON.stringify(obj), url: '/signup', contentType: "application/json", dataType: "json"}).then(function(res) {
        console.log('RES: ', res)
        window.location = '/stocksaver.html';
    }).fail(function(err) {
        console.log('AJAX FAIL')
        $('.alert.alert-warning').toggle(200).append('ERROR')
        window.location = '/signup.html';
        console.log(err)
    })
});

//login
$('#js-login-form').on('submit', function(event) {
    event.preventDefault();

    user = {
        username: event.target.username.value,
        password: event.target.password.value
    }

    //clear form fields
    $('.form-group').val('');

    $.ajax({type: 'POST', data: JSON.stringify(user), url: '/login', contentType: "application/json", dataType: "json"}).then(function() {
        window.location = '/stocksaver.html';
    }).fail(function(err) {
        console.log('AJAX FAIL')
        $('.alert.alert-warning').toggle(200).append('ERROR')
        window.location = '/login.html';
        console.log(err);
    })
});

//get username
$(document).ready(function(){
    if (window.location.href.indexOf("stocksaver") > -1) {
    $.ajax({type: 'GET', url: '/stocksaver/user'}).then(function(req, res) {
        function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
        let username = capitalize(req.user.username);
        $('#js-user').html(`Hi, ${username}.`)

    })
    }

})

//logout
$('#js-logout').click(function(event) {
    event.preventDefault();
    $.ajax({type: 'GET', url: '/logout'}).then(function(res) {
        window.location = '/index.html';
        console.log('User Logged Out')
    }).fail(function(err) {
        console.log('AJAX FAIL')
        $('.alert.alert-warning').toggle(200).append('ERROR')
        // window.location='/login.html';
        console.log(err);
    })
})
let obj;
//stock search
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
        url: 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20(%22' + stock + '%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback='
    }).then(function(res) {
        let companyName = res.query.results.quote.Name;
        let askPrice = res.query.results.quote.Ask;
        let lastPrice = res.query.results.quote.LastTradePriceOnly;
        obj = {
            stock: stock,
            price: lastPrice
        }
        if (companyName === null) {
            $('.alert').show(300).html('Sorry, that stock was not found.')
        } else {

            $('#results').show(300).html('The last trading price of ' + companyName + ' (' + stock + ') was: $' + lastPrice)
            $('#save-stocks-button').show(1000)
        }
    });
})

//save stocks
$('#save-stocks-button').on('click', function(event) {

    $.ajax({type: 'POST', data: JSON.stringify(obj), url: '/stocksaver/stocks', contentType: "application/json", dataType: "json"}).then(function(res) {
        console.log('save res: ', res)
            $('#stocks-table').append( `<tr><td>${obj.stock}</td><td>$${obj.price}</td><td><a class="btn btn-small" id="delete-stock-button" value="${obj._id}"><i class="fa fa-times" aria-hidden="true"></i> Delete Stock</a></td></tr>`)
    }).fail(function(err) {
        console.log('AJAX FAIL')
        $('.alert.alert-warning').toggle(300).html('ERROR')
        console.log(err);
    });
})

//view saved stocks
$('#view-stocks-button').on('click', function() {
    $.ajax({type: 'GET', url: '/stocksaver/stocks'}).then(function(req, res) {
        let stocks = req.user.stocks;
        if (stocks.length === 0) {
            $('#saved-stocks').show(200).html(`<ul><li>You do not have any saved stocks yet.</li><ul>`)
        } else {
            let stocksList = Object.keys(stocks).map(function(key) {
                return `<tr><td>${stocks[key].stock}</td><td>$${stocks[key].price}</td><td><a class="btn btn-small" id="delete-stock-button" value="${stocks[key]._id}"><i class="fa fa-times" aria-hidden="true"></i> Delete Stock</a></td></tr>`
            }).join("");
            $('#saved-stocks').show(200)
            $('#stocks-table').html(`${stocksList}`)
        }
    })
});

//delete saved stock
$('#saved-stocks').on('click', 'a', function() {
    let stockId = $(this).attr("value");
    $(this).closest('tr').remove();

    $.ajax({
        type: 'DELETE',
        data: JSON.stringify({id: stockId}),
        contentType: "application/json",
        dataType: "json",
        url: '/stocksaver/stocks'
    }).then(function(req, res) {
        console.log('Deleted Stock')
    }).fail(function(err) {
        console.log('Failed to delete')
        $('.alert.alert-warning').toggle(300).html('DELETION ERROR')
        console.log(err);
    });
});

//delete user
$('#delete-user').on('click', function() {
    $('#confirm-user-delete').show(200)
    $('#do-user-delete').show(200).on('click', function() {
        $.ajax({type: 'DELETE', url: '/destroy'}).then(function(req, res) {
            window.location = '/index.html';
        }).fail(function(err) {
            console.log('Failed to delete')
            $('.alert.alert-warning').toggle(300).html('DELETION ERROR')
            console.log(err);
        });
    });
    $('#cancel-user-delete').show(200).on('click', function() {
        $('#confirm-user-delete').hide(200)
        $('#do-user-delete').hide(200)
        $('#cancel-user-delete').hide(200)
    });
})
