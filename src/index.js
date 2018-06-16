
var browser = window.browser = (function () {
    return window.msBrowser ||
        window.browser ||
        window.chrome;
})();
var clippyHTML = '<div id="clippy-assistant-talk-bubble" class="clippy-assistant-talk-bubble"> <span id="clippy-assistant-comment-text"></span> <div class="clippy-assistant-talk-bubble-border"></div></div><figure class="clippy-assistant-clippy"></figure>';
var clippy = {
    isActive: true,
    width: 150,
    height: 139,
    comments: {
        'facebook': 'It looks like you are spending too much time at this Face page...<br><br> Maybe take a break?',
        'google': 'Maybe try bing? wink wink...',
        'stackoverflow': 'Need help? <br><br> You could have just asked me...',
        'reddit': 'I think these guys need a serious redesign!!',
        'localhost': 'It works! Good job!',
        'twitter': 'Tweets&nbsp;can&nbsp;only&nbsp;be 280&nbsp;characters&nbsp;long!'
    },
    init: function() {
        var link = document.createElement('link');
        link.href = browser.runtime.getURL('src/assets/css/clippy.css');
        link.type = 'text/css';
        link.rel = 'stylesheet';
        link.media = 'screen';
        document.head.appendChild(link);

        this.element = document.createElement('div');
        this.element.className = 'clippy-assistant-container';
        this.element.innerHTML = clippyHTML;
        document.body.appendChild(this.element);
    },
    talk: function () {
        var talkBubble = document.getElementById('clippy-assistant-talk-bubble');
        var talkTextContainer = document.getElementById('clippy-assistant-comment-text');
        talkTextContainer.innerHTML = '';

        var hostname = window.location.hostname;
        var clippyComment = null;

        for (var property in this.comments) {
            if (this.comments.hasOwnProperty(property)) {
                if (hostname.indexOf(property) !== -1) {
                    clippyComment = this.comments[property];
                    break;
                }
            }
        }

        if (clippyComment !== null) {
            talkTextContainer.innerHTML = clippyComment
            talkBubble.style.display = 'block';

            talkBubble.style.bottom = this.bubbleBottomOffset(talkBubble.innerHeight) + "px"
        } else {
            talkBubble.style.display = 'none';
        }
    },
    bubbleBottomOffset: function (bubbleHeight) {
        return this.height + 50 + bubbleHeight
    }
};

window.addEventListener('load', function () {
    clippy.init();
    clippy.talk();
}, false)

browser.runtime.onMessage.addListener(function(request) {
    switch (request.name) {
        case 'isActive':
            clippy.element.style.display = request.value ? 'block' : 'none';
            break
        default:
            return
    }
});