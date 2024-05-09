# Udemy Transcription Translator Chrome Extension

## Overview

This JavaScript project is a Chrome extension designed to seamlessly translate transcriptions from the Udemy website. It captures live transcriptions, sends them to a translation server, and injects the translated subtitles back into the video as captions, timed to match the spoken content.

## Features

- **Automated Transcription Capture:** The extension hooks into Udemy's transcription system, extracting all visible transcriptions.
- **Server-Based Translation:** Transcriptions are sent to an external server for translation, providing accurate subtitles in the desired language.
- **DOM Mutation Monitoring:** Listens for changes in the Udemy HTML to identify active transcriptions and injects the corresponding translated subtitles into the video player.
- **Smooth User Experience:** Automatically synchronizes translated subtitles with the video's timeline.

## Requirements

- Chrome browser

## Installation

1. Clone or download this repository.
2. In the Chrome browser, navigate to `chrome://extensions`.
3. Enable **Developer mode**.
4. Click on **Load unpacked** and select the cloned/downloaded folder.
5. Verify that the extension is loaded and visible in the extensions toolbar.

## Usage

1. **Setup the Translation Server:** Make sure the translation server is running and accessible with the proper API endpoints.
2. **Configure Server Details:** Modify the extension’s server configuration file to include the correct translation server URL.
3. **Open Udemy:** Start a course video on Udemy.
4. **Translate Subtitles:** Activate the extension by clicking on its icon in the Chrome toolbar. The extension will start capturing transcriptions, sending them to the server for translation, and synchronizing the translated subtitles as captions.

## Development

- **Translation API Integration:**
  - Make sure the API endpoints, headers, and any necessary credentials are correctly set up.

- **Mutation Observer:**
  - Utilizes `MutationObserver` to detect changes in the DOM, ensuring subtitles are injected at the right moments.

