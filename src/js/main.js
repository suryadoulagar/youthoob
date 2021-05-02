const CLIENT_ID =
  "956342713437-lonf3utr40o2n5v0ajoebo9morfjutct.apps.googleusercontent.com";

const DISCOVERY_DOCS = [
  "https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest",
];

const SCOPES = "https://www.googleapis.com/auth/youtube.readonly";

const authorizeButton = document.getElementById("authorize-button");
const signoutButton = document.getElementById("signout-button");
const content = document.getElementById("content");
const channelForm = document.getElementById("channel-form");
const channelInput = document.getElementById("channelInput");
const videoContainer = document.getElementById("video-container");

const defaultChannel = "techguyweb";

//form submit and change channel
channelForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const channel = channelInput.value;
  getChannel(channel);
});

//load auth2 library
function handleClientLoad() {
  gapi.load("client:auth2", initClient);
}

//Init API client library and set up signin list
function initClient() {
  gapi.client
    .init({
      discoverDocs: DISCOVERY_DOCS,
      clientId: CLIENT_ID,
      scope: SCOPES,
    })
    .then(() => {
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
  if (isSignedIn) {
    authorizeButton.style.display = "none";
    signedoutButton.style.display = "block";
    content.style.display = "block";
    videoContainer.style.display = "none";
    getChannel(defaultChannel);
  } else {
    authorizeButton.style.display = "block";
    signedoutButton.style.display = "none";
    content.style.display = "none";
    videoContainer.style.display = "none";
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

//display channel data
function showChannelData(data) {
  const channelData = document.getElementById("channel-data");
  channelData.innerHTML = data;
}

//get channel from API
function getChannel(channel) {
  gapi.client.youtube.channels
    .list({
      part: "snipped, content details, statistics",
      forusername: channel,
    })
    .then((response) => {
      console.log(response);
      const channel = response.results.item[0];

      const output = `
        <ul class = "collection">
          <li class = "collection-item">Title: ${channel.snippet.title}</li>
          <li class = "collection-item">ID: ${channel.id}</li>
          <li class = "collection-item">Subscribers: ${numberWithCommas(
            channel.statistics.subscriberCount
          )}</li>
          <li class = "collection-item">Views: ${numberWithCommas(
            channel.statistics.viewCount
          )}</li>
          <li class = "collection-item">Videos: ${numberWithCommas(
            channel.statistics.videoCount
          )}</li>
        </ul>
        <p>${channel.snippet.description}</p>
        <hr>
        <a class= "btn grey darken-2" target= "_blank" href="https://youtube.com/${
          channel.snippet.customUrl
        }">Visit Channel</a>
        
        `;
      showChannelData(output);

      const playlistId = channel.contentDetails.relatedPlaylist.uploads;
      requestVideoPlaylist(playlistId);
    })
    .catch((err) => alert("invalid channel name"));
}

//adding commas to numbers
function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function requestVideoPlaylist(playlistId) {
  const reqxuestOptions = {
    playlistId: playlistId,
    part: "snippet",
    maxResults: 10,
  };

  const request = gapi.client.youtube.playlistItems.list(reqxuestOptions);

  request.execute((response) => {
    console.log(response);

    const playlistItems = response.results.items;

    if (playlistItems) {
      let output = '<br><h4 class= "center-align"> Latest Videos</h4>';

      //loop through videos and append output
      playlistItems.forEach((item) => {
        const videoId = item.snippet.resourceId.videoId;

        output += `
                <div class = "col s3">
                <iframe width="100%" height="auto" src="https://www.youtube.com/embed/${videoId}"
                title="YouTube video player" frameborder="0" allow="accelerometer;
                autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                </div>
                `;
      });

      //output videos
      videoContainer.innerHTML = output;

    } else {
      videoContainer.innerHTML = "No Uploaded Videos";
    }
  });
}
