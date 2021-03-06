/* eslint-disable no-var */
var browser = (function createBrowser() {
    return window.msBrowser
    || browser
    || window.browser
    || window.chrome
}())
/* eslint-enable no-var */

const settings = new webStorageObject.LocalStorageObject(
    {
        isActive: true,
        comments: {}
    },
    'settings',
    false
)

const idleTime = 15000
const getCommentsRepoURL = () => `https://clippy-dictionary.kickass.website/?v=${new Date().getTime()}`
const loadComments = () => {
    const xhttp = new XMLHttpRequest()
    xhttp.open('GET', getCommentsRepoURL(), true)

    xhttp.onreadystatechange = () => {
        if (xhttp.readyState === 4 && xhttp.status === 200) {
            const comments = JSON.parse(xhttp.response)
            settings.comments = comments

            browser.tabs.query({}, (tabs) => {
                tabs.forEach((tab, index) => {
                    browser.tabs.sendMessage(
                        tabs[index].id,
                        {
                            name: 'comments',
                            value: comments
                        }
                    )
                })
            })
        }
    }
    xhttp.send()
}
const toggleIcon = (tab) => {
    const iconName = `assets/img/clippy-icon${settings.isActive ? '' : '-gray'}`
    browser.browserAction.setIcon({
        path: {
            16: `${iconName}-48x48.png`,
            24: `${iconName}-48x48.png`,
            32: `${iconName}-48x48.png`
        },
        tabId: tab.id
    })
}

const sendActive = (tab) => {
    browser.tabs.sendMessage(
        tab.id,
        {
            name: 'isActive',
            value: settings.isActive
        }
    )
}

const toggleClippy = () => {
    settings.isActive = !settings.isActive

    browser.tabs.query({}, (tabs) => {
        tabs.forEach((tab, index) => {
            sendActive(tabs[index])
            toggleIcon(tabs[index])
        })
    })
}

browser.browserAction.onClicked.addListener(toggleClippy)

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.name) {
    case 'isActive':
        browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                toggleIcon(tabs[0])
            }
        })

        sendResponse(
            {
                name: 'isActive',
                value: settings.isActive
            }
        )
        break
    case 'comments':
        loadComments()
        break
    case 'idle':
        if (settings.isActive) {
            setTimeout(() => {
                if (!settings.isActive) {
                    return
                }

                browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    if (tabs.length > 0) {
                        browser.tabs.sendMessage(
                            tabs[0].id,
                            {
                                name: 'animate',
                                value: true
                            }
                        )
                    }
                })
            }, idleTime)
        }
        break
    case 'toggle':
        toggleClippy()
        sendResponse({
            name: 'SILENCE_MY_BROTHER',
            value: settings.isActive
        })
        break
    default:
        break
    }

    return true
})

browser.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
    const manifest = browser.runtime.getManifest()

    switch (request.name) {
    case 'WHAT_IS_THE_MEANING_OF_LIFE':
        sendResponse({
            name: 'SILENCE_MY_BROTHER',
            value: {
                installed: true,
                isActive: settings.isActive,
                version: manifest.version
            }
        })
        break
    case 'RISE':
        toggleClippy()
        sendResponse({
            name: 'SILENCE_MY_BROTHER',
            value: settings.isActive
        })
        break
    default:
        break
    }

    return true
})

window.settings = settings
