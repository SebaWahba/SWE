export interface videos {
    id : string;
    title : string;
    description : string;
    genre : string;
    releaseYear : number;
    duration : number; // in minutes
    status : 'processing' | 'ready' | 'deleted';
    intro_start : number; // in seconds
    intro_end : number; // in seconds
    recap_start : number; // in seconds
    recap_end : number; // in seconds
    video_file : string; // URL to the video file
    uploaded_by : string; // user ID of the uploader
    created_at : string; // ISO date string
    updated_at : string; // ISO date string
}

export interface Playlist {
    id : string;
    Title : string;
    Videos : videos[]; // array of video objects
    Owner : string; // user ID of the playlist owner
}

export interface episodes {
    id : string;
    series_id : string;
    video_id : string;
    season_number : number;
    episode_number : number;
}

export interface playlist_videos {
    playlist_id : string;
    video_id : string;
    added_at : string; // ISO date string
    position : number; // position of the video in the playlist
}

export interface playlists {
    id : string;
    profile_id : string; // user ID of the playlist owner
    titel : string;
    folder_order : number; // order of the playlist in the user's library
    created_at : string; // ISO date string
}

export interface series {
    id : string;
    title : string;
    genre : string;
    description : string;
    created_at : string; // ISO date string
}

export interface series_follows {
    profile_id : string; // user ID of the follower
    series_id : string;
    notifications_enabled : boolean;
    followed_at : string; // ISO date string
}

export interface watch_history {
    id : string;
    profile_id : string; // user ID of the viewer
    video_id : string;
    progress_timestapmp : number; // in seconds
    completed : boolean;
    watched_at : string; // ISO date string
}

export interface ratings {
    profile_id : string; // user ID of the rater
    video_id : string;
    value : number; // e.g., 1-5 stars
    rated_at : string; // ISO date string
}

export interface profiles {
    id : string;
    account_id : string; // user ID of the account owner
    name : string;
    picture? : string; // profile picture URL
    recommender_profile : any[];
    default_language : string;
    created_at : string; // ISO date string
}

export interface subtitle_tracks {
    id : string;
    video_id : string;
    language : string;
    file_url : string; // URL to the subtitle file
}

export interface audio_tracks {
    id : string;
    video_id : string;
    language : string;
    track_index : number; // index of the audio track in the video file
}