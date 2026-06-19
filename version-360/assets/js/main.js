(function() {
    function setActive(buttons, current) {
        buttons.forEach(function(button) {
            button.classList.toggle('active', button === current);
        });
    }

    function initNavigation() {
        var toggle = document.querySelector('[data-nav-toggle]');
        var nav = document.querySelector('[data-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function() {
            nav.classList.toggle('open');
        });
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
        if (slides.length <= 1) {
            return;
        }
        var index = 0;
        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }
        dots.forEach(function(dot, dotIndex) {
            dot.addEventListener('click', function() {
                show(dotIndex);
            });
        });
        window.setInterval(function() {
            show(index + 1);
        }, 5200);
    }

    function initFiltering() {
        var boxes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-box]'));
        boxes.forEach(function(box) {
            var input = box.querySelector('[data-search-input]');
            var items = Array.prototype.slice.call(box.querySelectorAll('[data-filter-card]'));
            if (!input || !items.length) {
                return;
            }
            input.addEventListener('input', function() {
                var keyword = input.value.trim().toLowerCase();
                items.forEach(function(item) {
                    var text = (item.getAttribute('data-search') || '').toLowerCase();
                    item.classList.toggle('is-hidden', keyword && text.indexOf(keyword) === -1);
                });
            });
        });
    }

    function initSorting() {
        var boxes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-box]'));
        boxes.forEach(function(box) {
            var sortable = box.querySelector('[data-sortable]');
            var buttons = Array.prototype.slice.call(box.querySelectorAll('[data-sort]'));
            if (!sortable || !buttons.length) {
                return;
            }
            var originalItems = Array.prototype.slice.call(sortable.children);
            buttons.forEach(function(button) {
                button.addEventListener('click', function() {
                    var mode = button.getAttribute('data-sort');
                    var items = originalItems.slice();
                    if (mode === 'year') {
                        items.sort(function(a, b) {
                            return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
                        });
                    }
                    if (mode === 'title') {
                        items.sort(function(a, b) {
                            return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
                        });
                    }
                    items.forEach(function(item) {
                        sortable.appendChild(item);
                    });
                    setActive(buttons, button);
                });
            });
        });
    }

    window.initVideoPlayer = function(video, button, overlay, source) {
        var loaded = false;
        var hls = null;

        function load() {
            if (loaded) {
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else {
                video.src = source;
            }
            loaded = true;
        }

        function play() {
            load();
            overlay.classList.add('is-hidden');
            var result = video.play();
            if (result && typeof result.catch === 'function') {
                result.catch(function() {});
            }
        }

        function toggle() {
            if (video.paused) {
                play();
            } else {
                video.pause();
            }
        }

        button.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
            play();
        });
        overlay.addEventListener('click', play);
        video.addEventListener('click', toggle);
        video.addEventListener('play', function() {
            overlay.classList.add('is-hidden');
        });
        video.addEventListener('pause', function() {
            if (video.currentTime === 0 || video.ended) {
                overlay.classList.remove('is-hidden');
            }
        });
        window.addEventListener('beforeunload', function() {
            if (hls) {
                hls.destroy();
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function() {
        initNavigation();
        initHero();
        initFiltering();
        initSorting();
    });
})();
