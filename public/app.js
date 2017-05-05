//signup user
$('#js-signup-form').submit(function(event) {
    $('.alert.alert-warning').text("");
    event.preventDefault();
    if((!event.target.username.value || !event.target.password.value)){
        $('.alert.alert-warning').show(200).append('Please enter a username and a password.')
    } else {
        let obj = {
            username: event.target.username.value,
            password: event.target.password.value
        }

        //clear form fields
        $('input, textarea').val('');

        $.ajax({type: 'POST', data: JSON.stringify(obj), url: '/signup', contentType: "application/json", dataType: "json"}).then(function(res) {
            // console.log('RES: ', res)
            window.location = '/stocksaver.html';
        }).fail(function(err) {
            console.log('SIGNUP FAIL')
            $('.alert.alert-warning').text("")
            console.log(err)
        })
    }
});

//login user
$('#js-login-form').on('submit', function(event) {
    $('.alert.alert-warning').text("");
    event.preventDefault();
    if((!event.target.username.value || !event.target.password.value)){
        $('.alert.alert-warning').show(200).append('Please enter a username and a password.')
    } else {
        user = {
            username: event.target.username.value,
            password: event.target.password.value
        }
        //clear form fields
        $('.form-group').val('');

        $.ajax({type: 'POST', data: JSON.stringify(user), url: '/login', contentType: "application/json", dataType: "json"}).then(function() {
            window.location = '/stocksaver.html';
        }).fail(function(err) {
            console.log('LOGIN FAIL')
            $('.alert.alert-warning').text("")
            $('.alert.alert-warning').show(200).append("Please try again.")
            console.log(err);
        })
    }
});

//get username
    if (window.location.href.indexOf("stocksaver") > -1) {
    $.ajax({type: 'GET', url: '/stocksaver/user'}).then(function(req, res) {
        function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
    }
    let username = capitalize(req.user.username);
    $('#js-user').html(`Hi, ${username}.`)
    })
    }

//logout user
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

let obj;

function onlyLetters(input)
  {
   let letters = /^[A-Za-z]+$/;
   if(input.match(letters))
     { return true; }
   else { return false; }
  }

//stock search
$('#stock-search').submit(function(event) {
    event.preventDefault();
    $('.alert.alert-warning').text("");
    if((!event.target.stock.value) || onlyLetters(event.target.stock.value) !== true){
        $('.alert.alert-warning').show(200).append('Please enter a valid stock symbol')
    } else {
        console.log('TYPE: ', typeof event.target.stock.value);
        let stock = event.target.stock.value;
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
            let date = new Date()
            let options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric'
            };
            let dateTime = new Intl.DateTimeFormat('en-US', options).format(date);
            obj = {
                stock: stock,
                price: lastPrice,
                time: dateTime
            }
            console.log(obj.time)
            if (companyName === null) {
                $('.alert').show(300).html('Sorry, that stock was not found.')
            } else {

                $('#results').show(300).html('The last trading price of ' + companyName + ' (' + stock + ') was: $' + lastPrice + '.')
                $('#save-stocks-button').show(1000)
            }
        });
    }
})

//save stock
$('#save-stocks-button').on('click', function(event) {
    $('#saved-stocks-empty').hide()
    $.ajax({type: 'POST', data: JSON.stringify(obj), url: '/stocksaver/stocks', contentType: "application/json", dataType: "json"}).then(function(res) {
        console.log('save res: ', res)
            $('#stocks-table').prepend( `<tr><td>${obj.stock}</td><td>$${obj.price}</td><td>${obj.time}</td><td><a class="btn btn-small" id="delete-stock-button" value="${obj._id}"><i class="fa fa-times" aria-hidden="true"></i> </a></td></tr>`)
            $('#saved-stocks').show(200)
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
            $('#saved-stocks').show(200)
            $('#stocks-table').html(`<tr><td></td><td></td><td></td><td></td></tr>`)
            $('#saved-stocks-empty').show(200)

        } else {
            $('#saved-stocks-empty').hide()
            let stocksList = Object.keys(stocks).map(function(key) {
                return `<tr><td>${stocks[key].stock}</td><td>$${stocks[key].price}</td><td>${stocks[key].time}</td><td><a class="btn btn-small" id="delete-stock-button" value="${stocks[key]._id}"><i class="fa fa-times" aria-hidden="true"></i> </a></td></tr>`
            }).join("");
            $('#saved-stocks').show(200)
            $('#stocks-table').html(`${stocksList}`)
        }
    })
});

//hide saved stocks
$('#hide-stocks-button').on('click', function() {
            $('#saved-stocks').hide(200)
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
