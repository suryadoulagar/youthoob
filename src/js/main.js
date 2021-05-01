const CLIENT_ID = '97394008757-9ce6ilukd7h2mhrg0u4h44m694b1n7hi.apps.googleusercontent.com';

const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest"];

const SCOPES = 'https://www.googleapis.com/auth/youtube.readonly';

const authorizeButton = document.getElementById('authorize-button');
const signoutButton = document.getElementById('signout-button');
const content = document.getElementById('content');
const channelForm = document.getElementById('channel-form');
const channelInput = document.getElementById('channelInput');
const videoContainer = document.getElementById('video-container');

const defaultChannel = 'techguyweb';
//load auth2 library
function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

//Init API client library and set up signin list
function initClient() {
    gapi.client.init({
        discoverDocs: DISCOVERY_DOCS,
        clientId: CLIENT_ID,
        scope: SCOPES
    }).then(() =>{
        //listen for signin state changes 
        gapi.auth2.getAuthInstance().isSignedIn.listen(uodateSigninStatus);
        //handle initial sign in state
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        authorizeButton.onclick = handleAuthClick;
        signoutButton.onclick = handleSignoutClick;
    });
}

//update UI sign in status
function updateSigninStatus(isSignedIn) {
    if(isSignedIn) {
        authorizeButton.style.display = 'none';
        signedoutButton.style.display = 'block';
        content.style.display = 'block';
        videoContainer.style.display = 'none'; 
        getChannel(defaultChannel);
    }else {
        authorizeButton.style.display = 'block';
        signedoutButton.style.display = 'none';
        content.style.display = 'none';
        videoContainer.style.display = 'none'; 
    }
}

//handle login

function handleAuthClick() {
    gapi.auth2.getAuthInstance().signIn();
}

//handle logout

function handleSignoutClick() {
    gapi.auth2.getAuthInstance().signOut();
}

//get channel from API
function getChannel(channel){
    gapi.client.youtube.channels.list({
        part: 'snipped, content details, statistics',
        forusername: channel
    })
    .then(Response => {
        console.log(Response);
    })
    .catch(err => alert('invalid channel name'));

}