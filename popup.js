window.onload = function() {
    console.log("Page fully loaded");
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        fetchTranscription(tabs[0].id);
        observeActiveCue(tabs[0].id);
        clickButtonOnLoad(tabs[0].id);

    });
};

let translatedSubtitles = [];

function observeActiveCue(tabId) {
    console.log("Tab ID:", tabId);
    chrome.scripting.executeScript({
        target: {tabId: tabId},
        function: observeMutations,
        args: [tabId]
    }, (result) => {
        if (chrome.runtime.lastError) {
            console.error('Error executing script:', chrome.runtime.lastError.message);
        } else {
            console.log('Script executed successfully', result);
        }
    });
}

function observeMutations (tabId) {

    function removeAllSubtitles(callback) {
        const subtitles = document.querySelectorAll('[id^="custom-subtitle-"]');
        subtitles.forEach(sub => sub.remove());
        callback();
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


    console.log("Observe");
    const transcriptContainer = document.querySelector('.transcript--transcript-panel--JLceZ');
    console.log("Transcript Container:", transcriptContainer);

    if (!transcriptContainer) {
        console.error('Container de transcrições não encontrado.');
        return;
    }
    const observer = new MutationObserver((mutationsList) => {
        console.log("Mutation observed:", mutationsList);
        mutationsList.forEach((mutation) => {
            console.log("Mutation type: ", mutation.type)
            if (mutation.type === 'attributes' && mutation.attributeName === 'data-purpose') {
                const element = mutation.target;
                if (element.getAttribute('data-purpose') === 'transcript-cue-active') {
                    const index = Array.from(transcriptContainer.querySelectorAll('.transcript--cue-container--Vuwj6')).indexOf(element.parentNode);
                    console.log("Active cue index:", index);
                    if (index !== -1) {
                        removeAllSubtitles(()=>displaySubtitle(translatedSubtitles[index]));
                    }
                }
            }
        });
    });
    observer.observe(transcriptContainer, {
        attributes: true,
        subtree: true,
        attributeFilter: ['data-purpose']
    });
}

function fetchTranscription(tabId) {
    chrome.scripting.executeScript({
        target: {tabId: tabId},
        function: fetchTranscriptionItems,
    }, (injectionResults) => {
        const transcriptionItems = injectionResults[0].result;
        sendTranscriptionItemsOneByOne(transcriptionItems)
    });
}

function fetchTranscriptionItems() {
    const transcriptElements = document.querySelectorAll('.transcript--cue-container--Vuwj6');
    console.log("Transcript Elements:", transcriptElements);
    return Array.from(transcriptElements).map(element => element.innerText.trim());
}

function sendTranscriptionItemsOneByOne(items) {
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
                    translatedSubtitles[index] = data.subtitle;
                    console.log("Translation completed:", data.subtitle);
                    index++;
                    setTimeout(sendNextItem, 1000);
                })
                .catch(error => {
                    console.error('Erro ao enviar transcrição:', error);
                });
        }
    }

    sendNextItem();
}


// function clearSubtitles(tabId, callback) {
//     chrome.scripting.executeScript({
//         target: {tabId: tabId},
//         function: removeAllSubtitles
//     }, callback);
// }


// function injectSubtitle(subtitle, tabId) {
//     chrome.scripting.executeScript({
//         target: {tabId: tabId},
//         function: displaySubtitle,
//         args: [subtitle]
//     });
// }



function clickButtonOnLoad(tabId) {
    chrome.scripting.executeScript({
        target: {tabId: tabId},
        function: clickPlayButton,
    });
}

function clickPlayButton() {
    const button = document.getElementById('popper-trigger--59');
    if (button) {
        button.click();
    } else {
        console.error('Botão não encontrado!');
    }
}
