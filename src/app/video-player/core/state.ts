export class PlayState {
    static INITIAL = -1;
    static INVALID = 0;
    static PLAYING = 1;
    static PLAY_END = 2;
    static PAUSED = 3;
}

export class ReadyState {
    static HAVE_NOTHING = 0;
    static HAVE_METADATA = 1;
    static HAVE_CURRENT_DATA = 2;
    static HAVE_FUTURE_DATA = 3;
    static HAVE_ENOUGH_DATA = 4;
}
