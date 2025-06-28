let SongArray = [];

function searchMusicBox(url, music, artist) {
    const box = document.createElement('div');
    box.innerHTML = `
    <img src="${url}">
    <p class="music-title">${music}</p>
    <p class="artist">${artist}</p>
    `
    box.classList.add('music-box');
    return box;
}

function searchedMusicBox(musicUrl, imgUrl, music, artist) {
    const box = document.createElement('div');
    box.innerHTML = `
    <img src="${musicUrl}">
    <audio src="${imgUrl}"></audio>
    <p class="searched-music-title">${music}</p>
    <p class="searched-artist">${artist}</p>
    `
    box.classList.add('searched-music-box');
    return box;
}

const results = document.querySelector('.search-result');
const searchedResults = document.querySelector('.searched-musics');

function displayBox(where, nodes) {
    where.append(...nodes);
}


const input = document.querySelector('#text');

input.addEventListener('focus', () => {
    results.style.display = 'flex'
});

document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !results.contains(e.target)) {
        results.style.display = 'none'
    }
});

input.addEventListener('input', async (e) => {
    const word = e.target.value;
    try {
        if (word == '') {
            results.innerHTML = `<p class="searching">Start Searching...</p>`;
        } else {
            results.innerHTML = `<p class="searching">Searching...</p>`;
        }
        const URL = `https://itunes.apple.com/search?term=${encodeURIComponent(word)}&entity=song`;
        const API = await fetch(URL);
        if (API.ok) {
            results.innerHTML = ``;
            const data = await API.json();
            const songs = data.results;
            console.log(songs);
            // SongArray.push(...songs);
            SongArray = songs;
            console.log(SongArray)
            const tracks = songs.filter((song) => song.trackName.toLowerCase().includes(word.toLowerCase()) && !song.trackName.includes('(')).map((song) => searchMusicBox(song.artworkUrl60, song.trackName, song.artistName));
            displayBox(results, tracks);
            if (Object.keys(songs).length == 0) {
                results.innerHTML = `<p class="searching">Invalid Title</p>`;
            }

        } else {
            throw new Error();
        }
    } catch (error) {
        console.log(error);
        if (word == '') {
            results.innerHTML = `<p class="searching">Start Searching...</p>`;
        } else {
            results.innerHTML = `<p class="searching">Invalid Title</p>`;
        }
    }
});


const form = document.querySelector('form');

form.addEventListener('submit', (e) => {
    searchedResults.innerHTML = ``;
    e.preventDefault();
    const word = input.value;
    const tracks = SongArray.filter((song) => song.trackName.toLowerCase().includes(word.toLowerCase()) && !song.trackName.includes('(')).map((song) => searchedMusicBox(song.artworkUrl60, song.previewUrl, song.trackName, song.artistName));
    console.log(tracks);
    displayBox(searchedResults, tracks);
    input.blur();
    input.value = '';
    results.style.display = 'none';
})
