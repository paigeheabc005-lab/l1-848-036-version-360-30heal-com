(function () {
    window.initMoviePlayer = function (options) {
        var video = document.querySelector(options.video);
        var overlay = document.querySelector(options.overlay);
        var source = options.source;
        var loaded = false;
        var waitingForPlay = false;
        var hlsInstance = null;

        if (!video || !overlay || !source) {
            return;
        }

        function beginPlayback() {
            var playRequest = video.play();

            if (playRequest && typeof playRequest.catch === "function") {
                playRequest.catch(function () {
                    overlay.classList.remove("is-hidden");
                });
            }
        }

        function loadMedia() {
            if (loaded) {
                beginPlayback();
                return;
            }

            loaded = true;
            waitingForPlay = true;

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });

                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);

                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    if (waitingForPlay) {
                        beginPlayback();
                    }
                });

                hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
                    if (data && data.fatal) {
                        overlay.classList.remove("is-hidden");
                    }
                });
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                beginPlayback();
            } else {
                overlay.classList.remove("is-hidden");
            }
        }

        function start() {
            overlay.classList.add("is-hidden");
            loadMedia();
        }

        overlay.addEventListener("click", start);

        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });

        video.addEventListener("play", function () {
            overlay.classList.add("is-hidden");
        });

        video.addEventListener("pause", function () {
            if (video.currentTime === 0 || video.ended) {
                overlay.classList.remove("is-hidden");
            }
        });

        video.addEventListener("ended", function () {
            overlay.classList.remove("is-hidden");
        });

        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    };
})();
