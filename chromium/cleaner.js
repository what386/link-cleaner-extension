function cleanLink(link, youtubeShortenEnabled = false, fixTwitterEnabled = false, walmartShortenEnabled = false, amazonTrackingId = null) {
    try {
        var oldLink = new URL(link);
    } catch (e) {
        if (e instanceof TypeError) {
            var extractedURL = link.match(/https?:\/\/\S+/);
            if (extractedURL) {
                var oldLink = new URL(extractedURL[0]);
            } else {
                console.log('No valid URL found in the string.');
            }
        }
    }
    console.log('Old link:', oldLink);
    // Fixes for various link shorteners
    if ((oldLink.host === 'l.facebook.com') && oldLink.searchParams.has('u')) {
        // Fix for Facebook shared links
        var facebookLink = decodeURI(oldLink.searchParams.get('u'));
        oldLink = new URL(facebookLink);
    } else if ((oldLink.host === 'href.li')) {
        // Fix for href.li links
        var hrefLink = oldLink.href.split('?')[1];
        oldLink = new URL(hrefLink);
    } else if ((oldLink.host === 'www.google.com') && (oldLink.pathname === '/url') && (oldLink.searchParams.has('url'))) {
        // Fix for redirect links from Google Search (#29)
        oldLink = new URL(oldLink.searchParams.get('url'));
    }
    // Generate new link
    var newLink = new URL(oldLink.origin + oldLink.pathname);
    // Don't remove 'q' parameter
    if (oldLink.searchParams.has('q')) {
        newLink.searchParams.append('q', oldLink.searchParams.get('q'));
    }
    // Don't remove ID parameter for Google Play links (#34)
    if ((oldLink.host === 'play.google.com') && oldLink.searchParams.has('id')) {
        newLink.searchParams.append('id', oldLink.searchParams.get('id'));
    }
    // Don't remove ID parameter for Macy's links (#21)
    if ((oldLink.host === 'www.macys.com') && oldLink.searchParams.has('ID')) {
        newLink.searchParams.append('ID', oldLink.searchParams.get('ID'));
    }
    // YouTube links
    if ((oldLink.host === 'www.youtube.com') && oldLink.searchParams.has('v')) {
        // Shorten link if setting is enabled
        if (oldLink.searchParams.has('v') && youtubeShortenEnabled) {
            // Use to find the video ID: https://regex101.com/r/0Plpyd/1
            var regex = /^.*(youtu\.be\/|embed\/|shorts\/|\?v=|\&v=)(?<videoID>[^#\&\?]*).*/;
            var videoId = regex.exec(oldLink.href)['groups']['videoID'];
            newLink = new URL('https://youtu.be/' + videoId);
        } else if (oldLink.searchParams.has('v')) {
            // If the video link won't be in the main path, the 'v' (video ID) parameter needs to be added
            newLink.searchParams.append('v', oldLink.searchParams.get('v'));
        }
        // Never remove the 't' (time position) for YouTube video links
        if (oldLink.searchParams.has('t')) {
            newLink.searchParams.append('t', oldLink.searchParams.get('t'));
        }
    } else if ((oldLink.host === 'www.youtube.com') && oldLink.pathname.includes('playlist') && oldLink.searchParams.has('list')) {
        // Don't remove list ID for YouTube playlist links (#37)
        newLink.searchParams.append('list', oldLink.searchParams.get('list'));
    } else if ((oldLink.host === 'youtu.be') && oldLink.searchParams.has('t')) {
        // Don't remove video timestamp for shortened YouTube links (#49)
        newLink.searchParams.append('t', oldLink.searchParams.get('t'));
    }
    // Don't remove required variables for Facebook links
    if ((oldLink.host === 'www.facebook.com') && oldLink.pathname.includes('story.php')) {
        newLink.searchParams.append('story_fbid', oldLink.searchParams.get('story_fbid'));
        newLink.searchParams.append('id', oldLink.searchParams.get('id'));
    }
    // Remove extra information for Amazon shopping links
    // Amazon has a lot of country-specific domains that are subject to change, so this just matches "amazon" along with a known product URL path
    if (oldLink.host.includes('amazon') && (oldLink.pathname.includes('/dp/') || oldLink.pathname.includes('/d/') || oldLink.pathname.includes('/product/'))) {
        // Amazon doesn't need the www subdomain
        newLink.hostname = newLink.hostname.replace('www.', '');
        // Find product ID
        var regex = /(?:\/dp\/|\/product\/|\/d\/)(\w*|\d*)/g;
        var match = regex.exec(oldLink.pathname);
        if (match && match[1]) {
            newLink.pathname = '/dp/' + match[1];
        }
    }
    // Fix Lenovo store links (#36)
    if ((oldLink.host === 'www.lenovo.com') && oldLink.searchParams.has('bundleId')) {
        newLink.searchParams.append('bundleId', oldLink.searchParams.get('bundleId'));
    }
    // Shorten Best Buy product links (#42)
    if ((oldLink.host === 'www.bestbuy.com') && oldLink.pathname.includes('.p')) {
        var regex = /\/(\d+)\.p/;
        var productID = oldLink.pathname.match(regex);
        if (productID) {
            newLink.pathname = '/site/' + productID[1] + '.p';
        }
    }
    // Allow Xiaohongshu links to be viewed without an account (#47)
    if ((oldLink.host === 'www.xiaohongshu.com') && oldLink.searchParams.has('xsec_token')) {
        newLink.searchParams.append('xsec_token', oldLink.searchParams.get('xsec_token'));
    }
    // Fix Apple Weather alert links (#46)
    if (oldLink.host === 'weatherkit.apple.com') {
        newLink.searchParams.append('lang', oldLink.searchParams.get('lang'));
        newLink.searchParams.append('party', oldLink.searchParams.get('party'));
        newLink.searchParams.append('ids', oldLink.searchParams.get('ids'));
    }
    // Fix BusinessWire tracking links (#39)
    if ((oldLink.host === 'cts.businesswire.com') && oldLink.searchParams.has('url')) {
        newLink = new URL(oldLink.searchParams.get('url'));
    }
    // Fix Webtoon links (#50)
    if ((oldLink.host === 'www.webtoons.com') && oldLink.searchParams.has('title_no') && oldLink.searchParams.has('episode_no')) {
        newLink.searchParams.append('title_no', oldLink.searchParams.get('title_no'));
        newLink.searchParams.append('episode_no', oldLink.searchParams.get('episode_no'));
    }
    // Shorten Twitter/X links with FixTwitter if enabled
    if (fixTwitterEnabled && ((oldLink.host === 'twitter.com') || (oldLink.host === 'x.com'))) {
        newLink.host = 'fxtwitter.com';
    }
    // Shorten Walmart links if enabled (#41)
    console.log(walmartShortenEnabled)
    if (walmartShortenEnabled && (oldLink.host === 'www.walmart.com') && oldLink.pathname.includes('/ip/')) {
        var regex = /\/ip\/.*\/(\d+)/;
        var productID = oldLink.pathname.match(regex);
        if (productID) {
            newLink.pathname = '/ip/' + productID[1];
        }
    }
    // Add Amazon affiliate code if enabled
    if (oldLink.host.includes('amazon') && amazonTrackingId) {
        newLink.searchParams.append('tag', amazonTrackingId);
    }
    // Switch to output
    console.log('New link:', newLink);
    return newLink.toString();
}
