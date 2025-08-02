document.addEventListener('DOMContentLoaded', function () {
    var infoButton = document.getElementById('infoButton');
    var infoModal = document.getElementById('infoModal');
    var closeSpan = document.getElementsByClassName('close')[0];

    // Show the modal
    infoButton.onclick = function() {
        infoModal.style.display = 'block';
    }

    // Hide the modal
    closeSpan.onclick = function() {
        infoModal.style.display = 'none';
    }

    // Hide the modal if the user clicks outside of it
    window.onclick = function(event) {
        if (event.target == infoModal) {
            infoModal.style.display = 'none';
        }
    }
});
