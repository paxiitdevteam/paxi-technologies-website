// Live Chat Service Integration
// Supports Intercom, Drift, Zendesk Chat, and others

class LiveChatIntegration {
    constructor(config = {}) {
        this.config = config;
        this.activeService = null;
    }
    
    init() {
        const chatConfig = typeof window !== 'undefined' && window.config ? window.config.liveChat : this.config.liveChat;
        
        // Check which service is enabled
        if (chatConfig?.intercom?.enabled) {
            this.initIntercom();
        } else if (chatConfig?.drift?.enabled) {
            this.initDrift();
        } else if (chatConfig?.zendesk?.enabled) {
            this.initZendesk();
        }
    }
    
    // Intercom Integration
    initIntercom() {
        const intercomConfig = typeof window !== 'undefined' && window.config ? window.config.liveChat?.intercom : this.config.liveChat?.intercom;
        if (!intercomConfig?.appId) return;
        
        const appId = intercomConfig.appId;
        
        (function(){var w=window;var ic=w.Intercom;if(typeof ic==="function"){ic('reattach_activator');ic('update',w.intercomSettings);}else{var d=document;var i=function(){i.c(arguments);};i.q=[];i.c=function(args){i.q.push(args);};w.Intercom=i;var l=function(){var s=d.createElement('script');s.type='text/javascript';s.async=true;s.src='https://widget.intercom.io/widget/' + appId;var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x);};if(document.readyState==='complete'){l();}else if(w.attachEvent){w.attachEvent('onload',l);}else{w.addEventListener('load',l,false);}}})();
        
        window.intercomSettings = {
            app_id: appId,
            // Add custom settings here
        };
        
        this.activeService = 'intercom';
    }
    
    // Drift Integration
    initDrift() {
        const driftConfig = typeof window !== 'undefined' && window.config ? window.config.liveChat?.drift : this.config.liveChat?.drift;
        if (!driftConfig?.accountId) return;
        
        const accountId = driftConfig.accountId;
        
        !function() {
            var t = window.driftt = window.drift = window.driftt || [];
            if (!t.init) {
                if (t.invoked) return void (window.console && console.error && console.error("Drift snippet included twice."));
                t.invoked = !0, t.methods = ["identify","config","track","reset","debug","show","ping","page","hide","off","on"],
                t.factory = function(e) {
                    return function() {
                        var n = Array.prototype.slice.call(arguments);
                        return n.unshift(e), t.push(n), t;
                    };
                }, t.methods.forEach(function(e) {
                    t[e] = t.factory(e);
                }), t.load = function(t,e) {
                    var n = 3e5, r = Math.ceil(new Date() / n) * n, o = document.createElement("script");
                    o.type = "text/javascript", o.async = !0, o.crossOrigin = "anonymous", o.src = "https://js.driftt.com/include/" + r + "/" + t + ".js";
                    var i = document.getElementsByTagName("script")[0];
                    i.parentNode.insertBefore(o, i);
                };
            }
        }();
        
        drift.load(accountId);
        this.activeService = 'drift';
    }
    
    // Zendesk Chat Integration
    initZendesk() {
        const zendeskConfig = typeof window !== 'undefined' && window.config ? window.config.liveChat?.zendesk : this.config.liveChat?.zendesk;
        if (!zendeskConfig?.key) return;
        
        const key = zendeskConfig.key;
        
        window.zEmbed || function(e, t) {
            var n, o, d, i, s, a = [], r = document.createElement("iframe");
            window.zEmbed = function() {
                a.push(arguments);
            }, window.zE = window.zE || window.zEmbed, r.src = "javascript:false", r.title = "", r.role = "presentation", (r.frameElement || r).style.cssText = "display: none", d = document.getElementsByTagName("script"), d = d[d.length - 1], d.parentNode.insertBefore(r, d), i = r.contentWindow, s = i.document;
            try {
                o = s;
            } catch (c) {
                n = document.domain, r.src = 'javascript:var d=document.open();d.domain="' + n + '";void(0);', o = s;
            }
            o.open()._l = function() {
                var o = this.createElement("script");
                n && (this.domain = n), o.id = "js-iframe-async", o.src = e, this.t = +new Date, this.z = this.z || [], this.z.push(e, t), (this.zE = this.zE || []).push(arguments), this.parentNode.insertBefore(o, this);
            }, o.write('<body onload="document._l();">'), o.close();
        }("https://static.zdassets.com/ekr/snippet.html?key=" + key);
        
        this.activeService = 'zendesk';
    }
    
    // Hide custom chat widget when live chat is active
    hideCustomWidget() {
        const customWidget = document.getElementById('chat-widget');
        if (customWidget && this.activeService) {
            customWidget.style.display = 'none';
        }
    }
}

// Initialize Live Chat
let liveChat = null;

function initLiveChat() {
    if (typeof window !== 'undefined' && window.config && window.config.liveChat) {
        liveChat = new LiveChatIntegration(window.config);
        liveChat.init();
        liveChat.hideCustomWidget();
        window.liveChat = liveChat; // Make available globally
    }
    return liveChat;
}

// Make available globally
if (typeof window !== 'undefined') {
    window.LiveChatIntegration = LiveChatIntegration;
    window.initLiveChat = initLiveChat;
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LiveChatIntegration, initLiveChat };
}
