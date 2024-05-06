document.addEventListener('DOMContentLoaded', function() {
    fetchTranscription();
});

function fetchTranscription() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.scripting.executeScript({
            target: {tabId: tabs[0].id},
            function: fetchTranscriptionItems
        }, (injectionResults) => {
            const transcriptionItems = injectionResults[0].result;
            sendTranscriptionItemsOneByOne(transcriptionItems, tabs[0].id)
        });
    });
}

function fetchTranscriptionItems() {
    const transcriptElements = document.querySelectorAll('.transcript--cue-container--Vuwj6');
    return Array.from(transcriptElements).map(element => element.innerText.trim());
}

function clearSubtitles(tabId, callback) {
    chrome.scripting.executeScript({
        target: {tabId: tabId},
        function: removeAllSubtitles
    }, callback);
}

function removeAllSubtitles() {
    const subtitles = document.querySelectorAll('[id^="custom-subtitle-"]');
    subtitles.forEach(sub => sub.remove());
}

function sendTranscriptionItemsOneByOne(items, tabId) {
    let index = 0;

    function sendNextItem() {
        if (index < items.length) {
            const item = items[index];
            fetch('http://localhost:8080/api/transcribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ transcription: item })
            })
                .then(response => response.json())
                .then(data => {
                    clearSubtitles(tabId, () => injectSubtitle(data.subtitle, tabId));
                    index++;
                    if (index < items.length) {
                        setTimeout(sendNextItem, 1000);
                    }
                })
                .catch(error => {
                    console.error('Erro ao enviar transcrição:', error);
                });
        }
    }

    sendNextItem();
}

function injectSubtitle(subtitle, tabId) {
    chrome.scripting.executeScript({
        target: {tabId: tabId},
        function: displaySubtitle,
        args: [subtitle]
    });
}

function displaySubtitle(subtitle) {
    const container = document.querySelector('.video-popover-area.shaka-control-bar--popover-area--p01Ag');
    let subtitleDiv = document.getElementById('custom-subtitle');
    if (!subtitleDiv) {
        subtitleDiv = document.createElement('div');
        subtitleDiv.id = 'custom-subtitle';
        subtitleDiv.style = "position: absolute; bottom: 10px; width: 100%; text-align: center; color: white; text-shadow: 0 0 8px black; font-size: 25px; z-index: 1000; background-color: rgba(0, 0, 0, 0.5);";
        container.appendChild(subtitleDiv);
    }
    subtitleDiv.textContent = subtitle;
}
