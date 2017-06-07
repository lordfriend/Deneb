export class PlayState {
    static PLAYING = 0;
    static PLAY_END = 1;
    static PAUSED = 2;
}

export class NetworkState {
    static HAVE_NOTHING = 0;
    static HAVE_METADATA = 1;
    static HAVE_CURRENT_DATA = 2;
    static HAVE_FUTURE_DATA = 3;
    static HAVE_ENOUGH_DATA = 4;
}
