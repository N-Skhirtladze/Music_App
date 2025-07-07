import { favStorage } from "./favorites.js";

let SongArray = [];

favStorage.init();

function searchMusicBox(imgUrl, musicUrl, music, artist, id) {
    const box = document.createElement('div');
    box.innerHTML = `
    <img src="${imgUrl}">
    <p class="music-title">${music}</p>
    <p class="artist">${artist}</p>
    `
    box.classList.add('music-box');
    box.setAttribute('data-artist', artist);
    box.setAttribute('data-title', music);
    box.setAttribute('data-url', musicUrl);
    box.setAttribute('data-img', imgUrl);
    box.setAttribute('data-id', id);

    return box;
}

function searchedMusicBox(imgUrl, musicUrl, music, artist, id) {
    const box = document.createElement('div');
    box.innerHTML = `
    <img src="${imgUrl}">
    <audio controls src="${musicUrl}"></audio>
    <p class="searched-music-title">${music}</p>
    <p class="searched-artist">${artist}</p>
    `
    box.classList.add('searched-music-box');
    box.setAttribute('data-artist', artist);
    box.setAttribute('data-title', music);
    box.setAttribute('data-url', musicUrl);
    box.setAttribute('data-img', imgUrl);
    box.setAttribute('data-id', id);

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
            const tracks = songs.filter((song) => song.trackName.toLowerCase().includes(word.toLowerCase()) && !song.trackName.includes('(')).map((song) => searchMusicBox(song.artworkUrl60, song.previewUrl, song.trackName, song.artistName, song.trackId));
            displayBox(results, tracks);
            let inSearchMusics = document.querySelectorAll('.music-box');
            console.log(inSearchMusics);
            await fetchLyric(inSearchMusics);
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
const lyricPage = document.querySelector('.lyric-page');

form.addEventListener('submit', (e) => {
    searchedResults.innerHTML = ``;
    searchedResults.style.display = 'block  ';
    e.preventDefault();
    const word = input.value;
    const tracks = SongArray.filter((song) => song.trackName.toLowerCase().includes(word.toLowerCase()) && !song.trackName.includes('(')).map((song) => searchedMusicBox(song.artworkUrl60, song.previewUrl, song.trackName, song.artistName, song.trackId));
    console.log("tracks", tracks);
    displayBox(searchedResults, tracks);
    input.blur();
    input.value = '';
    results.style.display = 'none';
    lyricPage.style.display = 'none';
    let searchedMusics = document.querySelectorAll('.searched-music-box');
    console.log("searched", searchedMusics);
    fetchLyric(searchedMusics);
    // searchedResults.style.display = 'none';

});


const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 7000);

function lyrics(img, artist, title, lyric, url, id) {
    lyricPage.innerHTML = '';
    const div = document.createElement('div');
    div.innerHTML = `
    <ul class="music-header">
                <li class="image"><img src="${img}" alt=""></li>
                <li class="artist-name">${artist}</li>
                <li class="title">${title}</li>
                <li class="heart" data-title="${title}" data-img="${img}" data-id="${id}" data-audio="${url}" data-lyric="${lyric}" data-artist="${artist}"></li>
            </ul>
            <p class="lyric">${lyric}</p>
            <audio src="${url}" controls></audio>`;
    div.classList.add('container');
    lyricPage.append(div);
}

async function fetchLyric(array) {
    array.forEach(musicBox => {
        musicBox.addEventListener('click', async (e) => {
            lyricPage.innerHTML = ``;
            const artist = musicBox.getAttribute('data-artist');
            const title = musicBox.getAttribute('data-title');
            const url = musicBox.getAttribute('data-url');
            const img = musicBox.getAttribute('data-img');
            const id = musicBox.getAttribute('data-id');
            try {
                const lyricsUrl = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`, {
                    signal: controller.signal,
                });
                clearTimeout(timeoutId);

                if (lyricsUrl.ok) {
                    const lyric = await lyricsUrl.json();
                    console.log(lyric.lyrics);
                    input.blur();
                    input.value = ``;
                    searchedResults.style.display = 'none';
                    results.style.display = 'none';
                    lyrics(img, artist, title, lyric.lyrics, url, id);
                    lyricPage.style.display = 'block';
                    const heart = document.querySelector('.heart');
                    addFavSystem(heart);
                } else if (lyricsUrl.status === 503 || lyricsUrl.status === 504) {
                    input.blur();
                    input.value = ``;
                    results.style.display = 'none';
                    searchedResults.style.display = 'none';
                    const lyric = "It's a Lyrics.ovh server problem. When it's reachable again, you'll be able to get lyrics."
                    lyrics(img, artist, title, lyric, url, id);
                    lyricPage.style.display = 'block';
                    const heart = document.querySelector('.heart');
                    addFavSystem(heart);
                } else if (lyricsUrl.status === 404) {
                    input.blur();
                    input.value = ``;
                    results.style.display = 'none';
                    searchedResults.style.display = 'none';
                    const lyric = "Lyrics.ovh odes not have this music's lyric";
                    lyrics(img, artist, title, lyric, url, id);
                    lyricPage.style.display = 'block';
                    const heart = document.querySelector('.heart');
                    addFavSystem(heart);
                } else {
                    throw new Error('Something went wrong!!!');
                }

            } catch (error) {
                clearTimeout(timeoutId); // Always clear timeout even on error
                let message;
                if (error.name === 'AbortError') {
                    message = "Request timed out. Lyrics.ovh may be offline.";
                } else {
                    message = `${error.message}`;
                }

                console.error(message);
                input.blur();
                input.value = ``;
                results.style.display = 'none';
                searchedResults.style.display = 'none';
                const lyric = message;
                lyrics(img, artist, title, lyric, url, id);
                lyricPage.style.display = 'block';
                const heart = document.querySelector('.heart');
                addFavSystem(heart);
            }
        });
    });
}

function addFavSystem(node) {
    const favTitle = node.getAttribute('data-title');
    const favImg = node.getAttribute('data-img');
    const favId = node.getAttribute('data-id');
    const favAudio = node.getAttribute('data-audio');
    const favLyric = node.getAttribute('data-lyric');
    const favArtist = node.getAttribute('data-artist');
    if (favStorage.existsFav(favId)) {
        node.style.content = "url('images/love.png')";
    } else {
        node.style.content = "url('images/heart.png')";
    }
    node.addEventListener('click', () => {
        if (!favStorage.existsFav(favId)) {
            favStorage.setItem(favId, favImg, favTitle, favArtist, favLyric, favAudio);
            node.style.content = "url('images/love.png')";
        } else {
            favStorage.removeItem(favId);
            node.style.content = "url('images/heart.png')";
        }
        sideBar.innerHTML = `<p>Favorites</p>`;
        const favoritedStorage = favStorage.getStorage();
        const favorited = favoritedStorage.map(item => favoriteMusic(item.imgUrl, item.title));
        displayBox(sideBar, favorited);
        sideBar.classList.remove('open');
        before.classList.remove('top-change');
        after.classList.remove('bottom-change');
    });
}


const burger = document.querySelector('.menu-icon');
const before = document.querySelector('.top');
const after = document.querySelector('.bottom');
const sideBar = document.querySelector('.favorites-section');

burger.addEventListener('click', () => {
    sideBar.classList.toggle('open');
    before.classList.toggle('top-change');
    after.classList.toggle('bottom-change');
    sideBar.innerHTML = `<p>Favorites</p>`;
    const favoritedStorage = favStorage.getStorage();
    const favorited = favoritedStorage.map(item => favoriteMusic(item.imgUrl, item.title, item.id));
    displayBox(sideBar, favorited);
    const eachFavorite = document.querySelectorAll('.each-favorite');
    eachFavorite.forEach(box => {
        box.addEventListener('click', () => {
            // console.log('clicked');
            // console.log(id)
            const id = box.getAttribute('data-id');
            const result = favoritedStorage.find(favorite => favorite.id == id);
            // console.log(result);
            lyrics(result.imgUrl, result.artist, result.title, result.lyric, result.audioUrl, result.id);
            lyricPage.style.display = 'block';
            const heart = document.querySelector('.heart');
            // console.log(heart);
            if (favStorage.existsFav(id)) {
                heart.style.content = "url('images/love.png')";
            }
            heart.addEventListener('click', () => {
                // console.log(favId);
                if (!favStorage.existsFav(id)) {
                    favStorage.setItem(id, result.imgUrl, result.title, result.artist, result.lyric, result.audioUrl);
                    heart.style.content = "url('images/love.png')";
                } else {
                    favStorage.removeItem(id);
                    heart.style.content = "url('images/heart.png')";
                }
                sideBar.innerHTML = `<p>Favorites</p>`;
                const favoritedStorage = favStorage.getStorage();
                const favorited = favoritedStorage.map(item => favoriteMusic(item.imgUrl, item.title));
                displayBox(sideBar, favorited);

                sideBar.classList.remove('open');
                before.classList.remove('top-change');
                after.classList.remove('bottom-change');
            })
        })
    });
});

function favoriteMusic(img, title, id) {
    const box = document.createElement('div');
    box.classList.add('each-favorite');
    box.innerHTML = `
        <img src="${img}" alt="" style="width: 40px; height=40px;">
        <p class="favorite-title">${title}</p>
   `;
    box.setAttribute('data-id', id)
    return box;
}

