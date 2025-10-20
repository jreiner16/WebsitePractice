class PlaylistGenerator {
    constructor() {
        this.playlist = [];
        this.currentPrompt = '';

        this.promptInput = document.getElementById('promptInput');
        this.generateBtn = document.getElementById('generateBtn');
        this.loading = document.getElementById('loading');
        this.playlistContainer = document.getElementById('playlist');
        this.playlistTitle = document.getElementById('playlistTitle');
        this.exportBtn = document.getElementById('exportBtn');

        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        this.generateBtn.addEventListener('click', () => this.generatePlaylist());
        this.promptInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.generatePlaylist();
        });
        this.exportBtn.addEventListener('click', () => this.exportToSpotify());
    }

    async generatePlaylist() {
        const prompt = this.promptInput.value.trim();
        if (!prompt) return;

        this.showLoading(true);
        this.generateBtn.disabled = true;

        try {
            const songs = await this.findSongs(prompt);
            this.playlist = songs;
            this.currentPrompt = prompt;
            this.renderPlaylist();
            this.updateUI();
        } catch (error) {
            console.error('Error generating playlist:', error);
            alert('Failed to generate playlist. Please try again.');
        } finally {
            this.showLoading(false);
            this.generateBtn.disabled = false;
        }
    }

    async findSongs(prompt) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Enhanced song database with more realistic data
        const songDatabase = {
            'happy': [
                { title: 'Happy', artist: 'Pharrell Williams', image: 'https://via.placeholder.com/300x300/1db954/ffffff?text=Happy', spotifyId: 'spotify:track:60nZcImufyMA1MKQY3dcCH' },
                { title: 'Good Vibrations', artist: 'The Beach Boys', image: 'https://via.placeholder.com/300x300/1db954/ffffff?text=Good+Vibes', spotifyId: 'spotify:track:5t9KYe0Fhd5cW6UYT4qP8f' },
                { title: 'Walking on Sunshine', artist: 'Katrina and the Waves', image: 'https://via.placeholder.com/300x300/1db954/ffffff?text=Sunshine', spotifyId: 'spotify:track:05wIrZSwuaVWhcv5FfqeH0' },
                { title: 'Don\'t Stop Me Now', artist: 'Queen', image: 'https://via.placeholder.com/300x300/1db954/ffffff?text=Don\'t+Stop', spotifyId: 'spotify:track:5T8EDUDqKcs6OSOwEsfqG7' },
                { title: 'I Gotta Feeling', artist: 'The Black Eyed Peas', image: 'https://via.placeholder.com/300x300/1db954/ffffff?text=I+Gotta+Feeling', spotifyId: 'spotify:track:4kLLWz7srcuLKA7Et40PQR' }
            ],
            'sad': [
                { title: 'Someone Like You', artist: 'Adele', image: 'https://via.placeholder.com/300x300/1db954/ffffff?text=Someone', spotifyId: 'spotify:track:1zwMYTA5nlNjZxYrvBB2pV' },
                { title: 'Hurt', artist: 'Johnny Cash', image: 'https://via.placeholder.com/300x300/1db954/ffffff?text=Hurt', spotifyId: 'spotify:track:6gfjgHd7QZqJqJqJqJqJqJ' },
                { title: 'Mad World', artist: 'Gary Jules', image: 'https://via.placeholder.com/300x300/1db954/ffffff?text=Mad+World', spotifyId: 'spotify:track:3JOVTQ5h8HGFnDdp4VT3MP' },
                { title: 'The Sound of Silence', artist: 'Simon & Garfunkel', image: 'https://via.placeholder.com/300x300/1db954/ffffff?text=Sound+Silence', spotifyId: 'spotify:track:1Cj2vqUwlJVG27gJrun92y' },
                { title: 'Everybody Hurts', artist: 'R.E.M.', image: 'https://via.placeholder.com/300x300/1db954/ffffff?text=Everybody+Hurts', spotifyId: 'spotify:track:4tCWWn3u7pf5D4g5N8B1kb' }
            ],
            'workout': [
                { title: 'Eye of the Tiger', artist: 'Survivor', image: 'https://via.placeholder.com/300x300/1db954/ffffff?text=Eye+Tiger', spotifyId: 'spotify:track:2HHtWyy5CgaQbC7XSoOb0e' },
                { title: 'Stronger', artist: 'Kanye West', image: 'https://via.placeholder.com/300x300/1db954/ffffff?text=Stronger', spotifyId: 'spotify:track:0j2T0R9dR9qdJYLB6SliCq' },
                { title: 'Titanium', artist: 'David Guetta ft. Sia', image: 'https://via.placeholder.com/300x300/1db954/ffffff?text=Titanium', spotifyId: 'spotify:track:0lHAMNU8RGiIObScrsRgmP' },
                { title: 'Lose Yourself', artist: 'Eminem', image: 'https://via.placeholder.com/300x300/1db954/ffffff?text=Lose+Yourself', spotifyId: 'spotify:track:5Z01UMMf7V1o0MzF86s6WJ' },
                { title: 'Can\'t Hold Us', artist: 'Macklemore & Ryan Lewis', image: 'https://via.placeholder.com/300x300/1db954/ffffff?text=Can\'t+Hold+Us', spotifyId: 'spotify:track:3bidbhpOYeV4knko8J32nR' }
            ],
            'chill': [
                { title: 'Weightless', artist: 'Marconi Union', image: 'https://via.placeholder.com/300x300/1db954/ffffff?text=Weightless', spotifyId: 'spotify:track:2q8Y2fP8ngj4FYvT0NgNQI' },
                { title: 'Clair de Lune', artist: 'Claude Debussy', image: 'https://via.placeholder.com/300x300/1db954/ffffff?text=Clair+Lune', spotifyId: 'spotify:track:1IrdYjBJV9I3t5cna6sU57' },
                { title: 'River Flows in You', artist: 'Yiruma', image: 'https://via.placeholder.com/300x300/1db954/ffffff?text=River+Flows', spotifyId: 'spotify:track:7yNK4VEIt1c4R2XZW4jz56' },
                { title: 'Teardrop', artist: 'Massive Attack', image: 'https://via.placeholder.com/300x300/1db954/ffffff?text=Teardrop', spotifyId: 'spotify:track:67Hna13dNDkZvBpTXRIaOJ' },
                { title: 'Breathe Me', artist: 'Sia', image: 'https://via.placeholder.com/300x300/1db954/ffffff?text=Breathe+Me', spotifyId: 'spotify:track:6M14XiCN6ScWl8X3y7mGcn' }
            ],
            'party': [
                { title: 'Uptown Funk', artist: 'Mark Ronson ft. Bruno Mars', image: 'https://via.placeholder.com/300x300/1db954/ffffff?text=Uptown+Funk', spotifyId: 'spotify:track:32OlwWuMpZ6b0aN2RXCcqX' },
                { title: 'Get Lucky', artist: 'Daft Punk ft. Pharrell Williams', image: 'https://via.placeholder.com/300x300/1db954/ffffff?text=Get+Lucky', spotifyId: 'spotify:track:69kOkLUCkxIZYexIgSG8rq' },
                { title: 'Can\'t Stop the Feeling!', artist: 'Justin Timberlake', image: 'https://via.placeholder.com/300x300/1db954/ffffff?text=Can\'t+Stop', spotifyId: 'spotify:track:5WctNo4LThC3y9dUq1jB6F' },
                { title: 'Shut Up and Dance', artist: 'Walk the Moon', image: 'https://via.placeholder.com/300x300/1db954/ffffff?text=Shut+Up+Dance', spotifyId: 'spotify:track:4kbj5MwxO1bq9wjT5g9UrA' },
                { title: '24K Magic', artist: 'Bruno Mars', image: 'https://via.placeholder.com/300x300/1db954/ffffff?text=24K+Magic', spotifyId: 'spotify:track:6b8Be6iO4WrspXoGmWjQp7' }
            ]
        };

        // Smart categorization
        const lowerPrompt = prompt.toLowerCase();
        let category = 'chill';

        if (lowerPrompt.includes('happy') || lowerPrompt.includes('upbeat') || lowerPrompt.includes('joyful')) {
            category = 'happy';
        } else if (lowerPrompt.includes('sad') || lowerPrompt.includes('depressed') || lowerPrompt.includes('melancholy') || lowerPrompt.includes('emotional')) {
            category = 'sad';
        } else if (lowerPrompt.includes('workout') || lowerPrompt.includes('gym') || lowerPrompt.includes('exercise') || lowerPrompt.includes('pump') || lowerPrompt.includes('energy')) {
            category = 'workout';
        } else if (lowerPrompt.includes('party') || lowerPrompt.includes('dance') || lowerPrompt.includes('club') || lowerPrompt.includes('celebration')) {
            category = 'party';
        } else if (lowerPrompt.includes('chill') || lowerPrompt.includes('relax') || lowerPrompt.includes('calm') || lowerPrompt.includes('peaceful')) {
            category = 'chill';
        }

        return songDatabase[category] || songDatabase['chill'];
    }

    renderPlaylist() {
        this.playlistContainer.innerHTML = '';

        this.playlist.forEach((song, index) => {
            const songCard = document.createElement('div');
            songCard.className = 'song-card';

            songCard.innerHTML = `
                <img src="${song.image}" alt="${song.title}" class="song-image" />
                <div class="song-title">${song.title}</div>
                <div class="song-artist">${song.artist}</div>
            `;

            this.playlistContainer.appendChild(songCard);
        });
    }

    updateUI() {
        if (this.playlist.length > 0) {
            this.playlistTitle.textContent = `${this.currentPrompt} (${this.playlist.length} songs)`;
            this.exportBtn.classList.remove('hidden');
            this.exportBtn.disabled = false;
        } else {
            this.playlistTitle.textContent = 'No playlist generated';
            this.exportBtn.classList.add('hidden');
            this.exportBtn.disabled = true;
        }
    }

    exportToSpotify() {
        if (this.playlist.length === 0) return;

        // Create Spotify playlist URL with track IDs
        const trackIds = this.playlist.map(song => song.spotifyId.split(':')[2]).join(',');
        const playlistName = encodeURIComponent(this.currentPrompt);

        // Open Spotify Web Player with tracks
        const spotifyUrl = `https://open.spotify.com/search/${playlistName}`;

        // Create a more user-friendly export
        const exportData = {
            playlistName: this.currentPrompt,
            songs: this.playlist.map(song => ({
                title: song.title,
                artist: song.artist,
                spotifyId: song.spotifyId
            })),
            exportDate: new Date().toISOString()
        };

        // Copy to clipboard
        const exportText = `Playlist: ${this.currentPrompt}\n\nSongs:\n${this.playlist.map((song, i) => `${i + 1}. ${song.title} - ${song.artist}`).join('\n')}\n\nSpotify Track IDs:\n${trackIds}`;

        navigator.clipboard.writeText(exportText).then(() => {
            alert(`Playlist copied to clipboard!\n\nYou can now:\n1. Open Spotify\n2. Create a new playlist\n3. Search for these songs\n4. Add them to your playlist\n\nOr visit: ${spotifyUrl}`);
        }).catch(() => {
            // Fallback if clipboard API fails
            const textArea = document.createElement('textarea');
            textArea.value = exportText;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);

            alert(`Playlist copied to clipboard!\n\nYou can now:\n1. Open Spotify\n2. Create a new playlist\n3. Search for these songs\n4. Add them to your playlist\n\nOr visit: ${spotifyUrl}`);
        });
    }

    showLoading(show) {
        this.loading.classList.toggle('hidden', !show);
    }
}

// Initialize the playlist generator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new PlaylistGenerator();
});