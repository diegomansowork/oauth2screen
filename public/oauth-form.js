var acToken;
var tokenType;
var expiresIn;
var callbackURL;
var authURL;
var accessTokenURL;
var clientID;
var clientSecret;
var scopes;
var state;
var codeSAG;
var responseType;
var grant_type;
var _url;


//Validation functions

function genericFieldValidation(field, mx, my) {
    var genericFieldLength = field.value.length;
    if (genericFieldLength == 0 || genericFieldLength >= my || genericFieldLength < mx) {
        alert(field.name + " should not be empty / length be between " + mx + " to " + my);
        field.focus();
        return false;
    }
    return true;
}

function grantTypeValidation() {
   // var grantTypeObject = document.datosOAuth2.grantType;
    if (grant_type.value == "Default" || grant_type.value == null) {
        alert('Select a Grant Type from the list');
        grant_type.focus();
        return false;
    }
    else if (grant_type.value != "authorization_code"){
        alert('Grant Type ' + grant_type.value + ' not implemented yet');
        grant_type.focus();
        return false;
    }else{
        return true;
    }
}

function getOauthTokenValidation(){
    if (codeSAG == null) {
        alert("You must have a valid Authorization code before ask for a new token");
       // uid.focus();
        return false;
    }
    return true; 
}

function authorizeValidation(){
    callbackURL = document.datosOAuth2.callbackURL;
    authURL = document.datosOAuth2.authURL;
    grant_type = document.datosOAuth2.grantType;
    clientID =  document.datosOAuth2.clientID;
    clientSecret = document.datosOAuth2.clientSecret;
    scopes = document.datosOAuth2.scopes;
    state = document.datosOAuth2.state;
    responseType = 'code';

    if(grantTypeValidation()){
        if(genericFieldValidation(callbackURL, 10, 5000)){
            if(genericFieldValidation(authURL, 10, 5000)){
                if(genericFieldValidation(clientID, 8, 5000)){
                    if(genericFieldValidation(scopes, 3, 5000)){
                        return true;
                    }
                }
            }
        }
    }
    return false;
}

function authorize() {

    if(!authorizeValidation()){
        return false;
    }

    _url = authURL.value + '?client_id=' + clientID.value + '&redirect_uri=' + callbackURL.value + '&response_type=' + responseType + '&scope=' + scopes.value;
    if(state.value != null){
        _url = _url + '&state=' + state.value;
    }
    
    var win         =   window.open(_url, "windowname1", 'width=800, height=800'); 

    var pollTimer   =   window.setInterval(function() { 
        try {
            console.log(win.document.URL);
            if (win.document.URL.indexOf(callbackURL.value) != -1) {
                window.clearInterval(pollTimer);
                var url =   win.document.URL;
                codeSAG = getUrlParameter(url, 'code');
                //Check state error
                if(state.value!=null && codeSAG==null){
                    if(!checkState(getUrlParameter(url, 'state'))){
                        alert('Error: State Check KO');
                        throw "State Check KO";
                    }
                }
                //responseAuthState = getUrlParameter(url, 'state');
                setCodeTag(codeSAG);
                win.close();
            }
        } catch(e) {
            console.log('Error: ' + e);
        }
    }, 500);
}

function encodeBase64(targetString){
    return btoa(targetString);
}

function checkState(responseAuthState){
    if(responseAuthState == state.value){
        return true;
    }
    return false;
}

function setCodeTag(codeSAG){
    let codeAuthLabel = document.getElementById('codeAuth');
    codeAuthLabel.innerText = codeSAG; 
}

function getUrlParameter(url, name) {
    console.log('URL a tunerar', url);
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(url);
    return results === null ? 'No encontado' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

function getBearerToken(){
   // alert('Authorization: Basic '+ encodeBase64( document.datosOAuth2.clientID.value + ":" +  document.datosOAuth2.clientSecret.value));
    if(!getOauthTokenValidation()){
        return false;
    }
    accessTokenURL = document.datosOAuth2.accessTokenURL;
    //clientID
    var url_base = accessTokenURL.value + '?code=' + codeSAG + '&grant_type=' + grant_type.value + '&client_id=' +  clientID.value + '&redirect_uri=' + callbackURL.value + '&scope=' + scopes.value;
    console.log('url_base' + url_base);
    $.ajax({
        'url': url_base,
        'type': 'POST',
        'crossDomain': true,
        'content-Type': 'x-www-form-urlencoded',
        'dataType': 'json',
        'xhrFields': {
            // The 'xhrFields' property sets additional fields on the XMLHttpRequest.
            // This can be used to set the 'withCredentials' property.
            // Set the value to 'true' if you'd like to pass cookies to the server.
            // If this is enabled, your server must respond with the header
            'withCredentials': false
          },
        'headers': {
        // Use access_token previously retrieved from inContact token 
        // service.
            'Authorization': 'Basic '+ encodeBase64(clientID.value + ":" + clientSecret.value),
            'Content-Type': 'application/x-www-form-urlencoded',
            'Access-Control-Allow-Origin': '*'
        },
       // 'data': requestPayload,
        'success': function (result) {
            //Process success actions

             acToken    = result.access_token;
             tokenType  = result.token_type;
             expiresIn  = result.expires_in;
             
            baseURI = result.resource_server_base_uri;
            // alert('Success!\r\nAccess Token:\r' + acToken);
            document.getElementById('bearerToken').innerHTML = result.access_token;
            document.getElementById('tokenType').innerHTML = result.token_type;
            document.getElementById('expiresIn').innerHTML = result.expires_in;

            return result;
        },
        'error': function (XMLHttpRequest, textStatus, errorThrown) {
            //Process error actions
            alert('Error: ' + errorThrown);
            console.log(XMLHttpRequest.status + ' ' + 
                XMLHttpRequest.statusText);
            console.log('url_base_errror' + url_base);    
            return false;
        }
    });
}

function callAPI(){

    apiURL = 'https://' + document.getElementById('basic-urlText').value;
    
    console.log('apiURL' + apiURL);
    $.ajax({
        'url': apiURL,
        'type': 'GET',
        'crossDomain': true,
        'content-Type': 'x-www-form-urlencoded',
        'dataType': 'json',
        'xhrFields': {
            // The 'xhrFields' property sets additional fields on the XMLHttpRequest.
            // This can be used to set the 'withCredentials' property.
            // Set the value to 'true' if you'd like to pass cookies to the server.
            // If this is enabled, your server must respond with the header
            // 'Access-Control-Allow-Credentials: true'.
            'withCredentials': false
          },
        'headers': {
        // Use access_token previously retrieved from inContact token 
        // service.
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
           // 'Access-Control-Allow-Origin': '*',
            'Authorization': 'Bearer ' + acToken
          //'Authorization': 'Bearer c88e83883f6d47e8b65f67803b8d5d70'
        },
       // 'data': requestPayload,
        'success': function (result) {
            //Process success actions
            document.getElementById('responseData').innerHTML =  '200 OK ' + 
            ' Response Data: ' +  JSON.stringify(result);
            return result;
        },
        'error': function (XMLHttpRequest, textStatus, errorThrown) {
            //Process error actions
            //alert('Error: ' + errorThrown);
            console.log(XMLHttpRequest.status + ' ' + 
                XMLHttpRequest.statusText);
            document.getElementById('responseData').innerHTML = XMLHttpRequest.status + ' ' + 
            XMLHttpRequest.statusText + ' Error Details: ' + XMLHttpRequest.responseText;
            //JSON.stringify(XMLHttpRequest);
            console.log('apiURL error: ' + apiURL);    
            return false;
        }
    });
}

