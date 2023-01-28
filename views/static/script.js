function fetchThumbnails() {
  fetch('/videos')
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    clearGallery();
    const parsedData = JSON.parse(data);
    parsedData.forEach((videoData) => {
      renderGalleryImage(videoData);
    });
  })
  .catch((error) => {
    console.log('Error: ' + error);
  });
}

function clearGallery() {
  document.getElementById('gallery').innerHTML = '';
}

function renderGalleryImage(videoData) {
  document.getElementById('gallery').innerHTML +=
  '<div id="video-thumbnail-' + videoData.fileName + '" class="video-thumbnail">' +
    '<img src="/video/' + videoData.fileName + '/thumbnail" alt="' + videoData.fileName + '" onclick="startVideo(\'' + videoData.fileName + '\')">' +
    '<div class="video-metadata">' +
      '<span class="size">' + videoData.fileSize + '</span>' +
    '</div>' +
  '</div>';
}

function startVideo(videoName) {
  var videoPlayer = document.getElementById('video-player');
  var source = document.createElement('source');

  source.setAttribute('src', '/video/' + videoName);

  videoPlayer.replaceChildren(source);
  videoPlayer.play();
}

document.addEventListener("DOMContentLoaded", function(){
  fetchThumbnails();
});
